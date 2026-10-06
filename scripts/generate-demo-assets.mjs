// The assembled office is one background; geometry stays independent in the map.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseGIF, decompressFrames } from 'gifuct-js';

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
function jpegDimensions(bytes) {
  if(bytes[0]!==0xff||bytes[1]!==0xd8)throw new Error('JPEG de oficina inválido');
  let offset=2;
  while(offset<bytes.length){
    if(bytes[offset++]!==0xff)throw new Error('Marcador JPEG inválido');
    while(bytes[offset]===0xff)offset++;
    const marker=bytes[offset++];
    if(marker===0xd9||marker===0xda)break;
    const length=bytes.readUInt16BE(offset);
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))return {width:bytes.readUInt16BE(offset+5),height:bytes.readUInt16BE(offset+3)};
    offset+=length;
  }
  throw new Error('JPEG sin dimensiones');
}
function register(assetId,bytes,width,height,extension,options={}) {
  writeFileSync(`${output}/${assetId}.${extension}`,bytes);
  assets.push({schemaVersion:1,assetId,imageUrl:`/assets/peredo/${assetId}.${extension}`,
    sourceRect:rect(0,0,width,height),pivot:{x:width/2,y:height},worldScale:1,layer:'world',sortAnchorY:0,
    colliders:[],occlusionMask:null,occlusionApproachMargin:0,interaction:null,variant:'peredo-import',
    contentHash:createHash('sha256').update(bytes).digest('hex'),...options});
}

const officeBytes=readFileSync(`${images}/ensambled/total-office.jpeg`);
const officeSize=jpegDimensions(officeBytes);
if(officeSize.width!==1600||officeSize.height!==900)throw new Error('La geometría debe revisarse para la nueva composición');
register('office-composite',officeBytes,1600,900,'jpeg',{pivot:{x:0,y:0},layer:'ground'});

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

// The landscape GIF can be dropped at this stable path when its export arrives.
const trainSource=`${root}legacy/pre-alpha/assets/gifs/train.gif`;
const trainFrames=[];
if(existsSync(trainSource)){
  const gif=parseGIF(readFileSync(trainSource));
  const width=gif.lsd.width,height=gif.lsd.height;
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
    register(assetId,pngPixels(width,height,canvas),width,height,'png');
    trainFrames.push({assetId,durationMs:Math.max(20,frame.delay)});
    previous=frame;
  }
}

// Coordinates below are pixels in the original 1600×900 composition.
const collider=(colliderId,x,y,width,height)=>({colliderId,area:rect(x,y,width,height)});
const hotspot=(hotspotId,kind,label,x,y,width,height)=>({hotspotId,kind,label,area:rect(x,y,width,height)});
const occluder=(occluderId,x,y,width,height,baseY,polygon=[
  {x,y},{x:x+width,y},{x:x+width,y:y+height},{x,y:y+height}
])=>({occluderId,area:rect(x,y,width,height),baseY,polygon});
const mapVersion='demo-v4';
const scene={
  schemaVersion:1,mapVersion,sceneId:'office',name:'Oficina',logicalSize:officeSize,
  background:{assetId:'office-composite',color:'#253949'},
  spawnPoints:{entry:{x:790,y:500,direction:'down'}},
  environments:[{environmentId:'main-office',name:'Oficina',area:rect(97,236,1409,610),communicationMode:'PROXIMITY'}],
  objects:[],doors:[],portals:[],presentationSurfaces:[],
  colliders:[
    collider('north-wall',96,0,1411,236),collider('west-border',0,0,97,900),
    collider('east-border',1506,0,94,900),collider('south-border',96,846,1411,54),
    collider('upper-divider',557,0,47,413),
    collider('lower-divider-west',557,608,48,238),collider('lower-divider-east',765,608,48,238),
    collider('west-cabinet-base',100,286,213,18),collider('fridge-base',473,236,84,39),
    collider('center-bookshelf-base',604,304,105,21),
    collider('west-desk-tabletop',207,430,90,131),collider('west-desk-chair',178,451,29,111),
    collider('board-left-leg',1368,315,30,32),collider('board-right-leg',1469,330,33,36),
    collider('board-base',1384,340,101,26),collider('south-plant-base',838,819,50,27),
    collider('computer-west-tabletop',952,633,160,78),collider('computer-west-chair',993,711,79,66),
    collider('computer-east-tabletop',1235,633,160,78),collider('computer-east-chair',1276,711,78,66)
  ],
  occluders:[
    occluder('west-cabinet',98,128,216,176,292,[
      {x:98,y:200},{x:106,y:199},{x:104,y:152},{x:120,y:128},{x:150,y:129},{x:169,y:168},
      {x:164,y:199},{x:314,y:200},{x:314,y:302},{x:98,y:302}]),
    occluder('fridge',472,104,85,170,270),
    occluder('center-bookshelf',601,169,109,156,318,[
      {x:602,y:181},{x:652,y:169},{x:708,y:187},{x:710,y:303},{x:658,y:324},{x:602,y:304}]),
    occluder('whiteboard',1367,194,137,173,359,[
      {x:1385,y:195},{x:1489,y:246},{x:1489,y:322},{x:1504,y:347},{x:1483,y:367},
      {x:1466,y:352},{x:1367,y:323},{x:1384,y:289}]),
    occluder('west-desk',178,429,120,158,560),
    occluder('computer-west-monitor',978,589,105,59,646),
    occluder('computer-east-monitor',1264,589,103,59,646),
    occluder('south-plant',818,758,80,90,842,[
      {x:854,y:759},{x:882,y:765},{x:898,y:792},{x:890,y:820},{x:883,y:847},
      {x:842,y:847},{x:819,y:820},{x:818,y:790},{x:830,y:771}])
  ],
  interactions:[
    hotspot('board','board','Cambiar estado del pizarrón',1360,370,145,78),
    hotspot('computer-west','computer','Computadora izquierda: accesos pendientes',944,775,173,60),
    hotspot('computer-east','computer','Computadora derecha: accesos pendientes',1226,775,178,60),
    hotspot('west-workstation','computer','Escritorio lateral: accesos pendientes',135,580,180,72)
  ],
  windows:[rect(270,159,130,36),rect(753,159,130,36),rect(1289,159,131,36)],
  trainFrames,
  boardSurface:rect(1389,201,97,119),
  boardCorners:[{x:1390,y:205},{x:1485,y:249},{x:1485,y:317},{x:1390,y:272}]
};
const map={schemaVersion:1,mapVersion,entry:{sceneId:'office',spawnId:'entry'},
  avatar:{avatarId:'man-avatar',views,animations,footCollider:rect(-15,-12,30,12)},assets,scenes:[scene]};
writeFileSync(`${root}packages/contracts/data/demo-map.json`,`${JSON.stringify(map,null,2)}\n`);
console.log(`Generated ${mapVersion}: composite 1600×900, ${assets.length} image assets, ${scene.colliders.length} colliders.`);
