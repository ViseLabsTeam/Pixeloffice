// The fixed background and individually placed furniture share one map.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseGIF, decompressFrames } from 'gifuct-js';
import { avatarFootCollider, furniture, fixedColliders, interactions, windows, boardSurface, boardCorners } from './office-layout.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=`${root}apps/web/public/assets/peredo`;
const images=`${root}legacy/pre-alpha/assets/images`;
const gifs=`${root}legacy/pre-alpha/assets/gifs/avatar/man`;
mkdirSync(output,{recursive:true});
mkdirSync(`${root}packages/contracts/data`,{recursive:true});
const rect=(x,y,width,height)=>({shape:'rect',x,y,width,height});
const assets=[];
function crc32(bytes) {
  let crc=0xffffffff;
  for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
  return (crc^0xffffffff)>>>0;
}
function chunk(type,data) {
  const name=Buffer.from(type),size=Buffer.alloc(4),crc=Buffer.alloc(4);
  size.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([name,data])));
  return Buffer.concat([size,name,data,crc]);
}
function pngPixels(width,height,rgba) {
  if(rgba.length!==width*height*4)throw new Error('Píxeles RGBA incompletos');
  const pixels=Buffer.alloc(height*(1+width*4));
  for(let row=0;row<height;row++)rgba.copy(pixels,row*(1+width*4)+1,row*width*4,(row+1)*width*4);
  const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]);
}
function register(assetId,bytes,width,height,extension,options={}) {
  writeFileSync(`${output}/${assetId}.${extension}`,bytes);
  assets.push({schemaVersion:1,assetId,imageUrl:`/assets/peredo/${assetId}.${extension}`,
    sourceRect:rect(0,0,width,height),pivot:{x:width/2,y:height},worldScale:1,layer:'world',sortAnchorY:0,
    colliders:[],
    depth:null,renderOrder:0,interaction:null,variant:'peredo-import',
    contentHash:createHash('sha256').update(bytes).digest('hex'),...options});
}

const officeBytes=readFileSync(`${images}/ensambled/SIN MUEBLESL.png`);
const officeSize={width:officeBytes.readUInt32BE(16),height:officeBytes.readUInt32BE(20)};
if(officeSize.width!==1920||officeSize.height!==1080)throw new Error('La geometría debe revisarse para la nueva composición');
register('office-background',officeBytes,officeSize.width,officeSize.height,'png',{pivot:{x:0,y:0},layer:'ground'});
for(const item of furniture){
  const bytes=readFileSync(`${images}/${item.source}`);
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  register(item.id,bytes,width,height,'png',{
    pivot:item.pivot,worldScale:item.scale,colliders:item.collider,depth:item.depth,
    renderOrder:item.renderOrder
  });
}

const directions={left:'-X',right:'X',up:'Y',down:'-Y'};
const views={},animations={};
for(const [direction,suffix] of Object.entries(directions)){
  const idleId=`avatar-man-${direction}-idle`;
  const idleBytes=readFileSync(`${images}/avatar/man/avatar-hombre${suffix}.png`);
  if(idleBytes.readUInt32BE(16)!==45||idleBytes.readUInt32BE(20)!==66)throw new Error(`PNG de avatar inesperado: ${suffix}`);
  register(idleId,idleBytes,45,66,'png',{worldScale:2});views[direction]=idleId;
  const gif=parseGIF(readFileSync(`${gifs}/avatar-hombre${suffix}.gif`));
  const frames=decompressFrames(gif,true);
  if(gif.lsd.width!==45||gif.lsd.height!==66||!frames.length)throw new Error(`GIF de avatar inesperado: ${suffix}`);
  animations[direction]=frames.map((frame,index)=>{
    const {dims}=frame;
    if(dims.left!==0||dims.top!==0||dims.width!==45||dims.height!==66)throw new Error(`Cuadro GIF parcial: ${suffix}/${index}`);
    const assetId=`avatar-man-${direction}-walk-${index}`;
    register(assetId,pngPixels(45,66,Buffer.from(frame.patch)),45,66,'png',{worldScale:2});
    return {assetId,durationMs:Math.max(20,frame.delay)};
  });
}

// Official train animation. Each frame is drawn inside one window at a time.
const trainSource=`${root}legacy/pre-alpha/assets/gifs/train/Tren .gif`;
const trainFrames=[];
if(existsSync(trainSource)){
  const gif=parseGIF(readFileSync(trainSource));
  const width=gif.lsd.width,height=gif.lsd.height;
  const windowSize=156;
  const canvas=Buffer.alloc(width*height*4);
  let previous,restore;
  for(const [index,frame] of decompressFrames(gif,true).entries()){
    if(previous?.disposalType===2){
      for(let y=previous.dims.top;y<previous.dims.top+previous.dims.height;y++)
        canvas.fill(0,(y*width+previous.dims.left)*4,(y*width+previous.dims.left+previous.dims.width)*4);
    }else if(previous?.disposalType===3&&restore)restore.copy(canvas);
    restore=frame.disposalType===3?Buffer.from(canvas):undefined;
    const {dims,patch}=frame;
    for(let y=0;y<dims.height;y++)for(let x=0;x<dims.width;x++){
      const source=(y*dims.width+x)*4;
      if(!patch[source+3])continue;
      const target=((y+dims.top)*width+x+dims.left)*4;
      canvas.set(patch.subarray(source,source+4),target);
    }
    const assetId=`train-frame-${index}`;
    // The source is 450 px square, but only 156 px square is displayed.
    // Keep nearest-neighbor pixel art and stay within the 64 MiB bitmap budget.
    const pixels=Buffer.alloc(windowSize*windowSize*4);
    for(let y=0;y<windowSize;y++)for(let x=0;x<windowSize;x++){
      const sourceY=Math.min(height-1,Math.floor((y+0.5)*height/windowSize));
      const sourceX=Math.min(width-1,Math.floor((x+0.5)*width/windowSize));
      canvas.copy(pixels,(y*windowSize+x)*4,(sourceY*width+sourceX)*4,(sourceY*width+sourceX)*4+4);
    }
    register(assetId,pngPixels(windowSize,windowSize,pixels),windowSize,windowSize,'png');
    trainFrames.push({assetId,durationMs:Math.max(20,frame.delay)});
    previous=frame;
  }
}

const mapVersion='demo-v5';
const scene={
  schemaVersion:1,mapVersion,sceneId:'office',name:'Oficina',logicalSize:officeSize,
  background:{assetId:'office-background',color:'#253949'},
  spawnPoints:{entry:{x:948,y:600,direction:'down'}},
  environments:[{environmentId:'main-office',name:'Oficina',area:rect(116,283,1691,732),communicationMode:'PROXIMITY'}],
  objects:furniture.map(item=>({objectId:item.id,assetId:item.id,position:item.position})),
  doors:[],portals:[],presentationSurfaces:[],
  colliders:fixedColliders,
  interactions,
  windows,
  trainFrames,
  boardSurface,
  boardCorners
};
const map={schemaVersion:1,mapVersion,entry:{sceneId:'office',spawnId:'entry'},
  avatar:{avatarId:'man-avatar',views,animations,footCollider:avatarFootCollider},assets,scenes:[scene]};
writeFileSync(`${root}packages/contracts/data/demo-map.json`,`${JSON.stringify(map,null,2)}\n`);
console.log(`Generated ${mapVersion}: mixed office 1920×1080, ${assets.length} image assets, ${scene.colliders.length} fixed colliders, ${scene.objects.length} furniture objects.`);
