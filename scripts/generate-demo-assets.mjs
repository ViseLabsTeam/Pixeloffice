// Reproducible placeholder art plus the received Peredo floor, desk and avatar exports.
// Dimensions and placement remain provisional until the complete art export arrives.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseGIF, decompressFrames } from 'gifuct-js';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = `${root}apps/web/public/assets/demo`;
const officialOutput = `${root}apps/web/public/assets/peredo`;
const officialSource = `${root}legacy/pre-alpha/assets/images`;
const avatarGifSource = `${root}legacy/pre-alpha/assets/gifs/avatar/man`;
mkdirSync(output, { recursive: true });
mkdirSync(officialOutput, { recursive: true });
mkdirSync(`${root}packages/contracts/data`, { recursive: true });
const assets = [];
const rect = (x, y, width, height) => ({ shape: 'rect', x, y, width, height });
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const bytes = Buffer.concat([Buffer.from(type), data]);
  const size = Buffer.alloc(4); size.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(bytes));
  return Buffer.concat([size, bytes, crc]);
}
function png(width, height, shapes) {
  const rgba = Buffer.alloc(width * height * 4);
  for (const [x, y, w, h, color] of shapes) {
    const channels = [...color.matchAll(/[a-f0-9]{2}/gi)].map(value => parseInt(value[0], 16));
    for (let row = Math.max(0, y); row < Math.min(height, y + h); row++) {
      for (let col = Math.max(0, x); col < Math.min(width, x + w); col++) {
        const offset = (row * width + col) * 4;
        rgba.set([channels[0], channels[1], channels[2], channels[3] ?? 255], offset);
      }
    }
  }
  return pngPixels(width, height, rgba);
}
function pngPixels(width, height, rgba) {
  if (rgba.length !== width * height * 4) throw new Error('Píxeles RGBA incompletos');
  const pixels = Buffer.alloc(height * (1 + width * 4));
  for (let row = 0; row < height; row++) rgba.copy(pixels, row * (1 + width * 4) + 1, row * width * 4, (row + 1) * width * 4);
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
}
function registerOfficialPng(assetId, bytes, options = {}) {
  if (!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error(`PNG inválido: ${assetId}`);
  const width = bytes.readUInt32BE(16); const height = bytes.readUInt32BE(20);
  writeFileSync(`${officialOutput}/${assetId}.png`, bytes);
  assets.push({ schemaVersion:1, assetId, imageUrl:`/assets/peredo/${assetId}.png`, sourceRect:rect(0,0,width,height),
    pivot:{x:width/2,y:height}, worldScale:1, layer:'world', sortAnchorY:0,
    colliders:[], occlusionMask:null, occlusionApproachMargin:16, interaction:null,
    variant:'peredo-import', contentHash:createHash('sha256').update(bytes).digest('hex'), ...options });
}
function asset(assetId, width, height, shapes, options = {}) {
  const bytes = png(width, height, shapes);
  writeFileSync(`${output}/${assetId}.png`, bytes);
  assets.push({ schemaVersion: 1, assetId, imageUrl: `/assets/demo/${assetId}.png`, sourceRect: rect(0, 0, width, height), pivot: { x: width / 2, y: height }, worldScale: 1, layer: 'world', sortAnchorY: 0, colliders: [], occlusionMask: null, occlusionApproachMargin: 16, interaction: null, variant: 'demo-v1', contentHash: createHash('sha256').update(bytes).digest('hex'), ...options });
}
function officialAsset(assetId, relativePath, options) {
  const source = `${officialSource}/${relativePath}`;
  const bytes = readFileSync(source);
  registerOfficialPng(assetId, bytes, options);
}
// The source floor is a 4×4 tile: 344 px across, with 86 px per tile.
// At scale .35 its tiles are about 30 logical pixels; the two-scene layout is still provisional.
officialAsset('floor','floors/PISO-export.png',{pivot:{x:0,y:0},worldScale:0.35,layer:'ground'});
// X is right/D, -X left/A, Y up/W, -Y down/S. All received frames are
// complete 45×66 images, so no GIF disposal/compositing is needed.
const avatarDirections = { left:'-X', right:'X', up:'Y', down:'-Y' };
const avatarViews = {};
const avatarAnimations = {};
for (const [direction, suffix] of Object.entries(avatarDirections)) {
  const idleId = `avatar-man-${direction}-idle`;
  officialAsset(idleId, `avatar/man/avatar-hombre${suffix}.png`, {worldScale:0.5});
  avatarViews[direction] = idleId;
  const bytes = readFileSync(`${avatarGifSource}/avatar-hombre${suffix}.gif`);
  const gif = parseGIF(bytes);
  const frames = decompressFrames(gif, true);
  if (gif.lsd.width !== 45 || gif.lsd.height !== 66 || !frames.length) throw new Error(`GIF de avatar inesperado: ${suffix}`);
  avatarAnimations[direction] = frames.map((frame, index) => {
    const {dims} = frame;
    if (dims.left !== 0 || dims.top !== 0 || dims.width !== gif.lsd.width || dims.height !== gif.lsd.height) throw new Error(`Cuadro GIF parcial: ${suffix}/${index}`);
    const assetId = `avatar-man-${direction}-walk-${index}`;
    registerOfficialPng(assetId, pngPixels(dims.width, dims.height, Buffer.from(frame.patch)), {worldScale:0.5});
    return {assetId, durationMs:Math.max(20, frame.delay)};
  });
}
// Tabletop bounds are measured in each source PNG. Convert them to pivot-local
// coordinates; the monitor, front trim and legs remain visual only.
function tabletopCollider(pivot, x, y, width, height) {
  return rect(x - pivot.x, y - pivot.y, width, height);
}
officialAsset('desk-negative-x','furniture/table/escritorio -x.png',{
  pivot:{x:304,y:656},worldScale:0.18,
  colliders:[tabletopCollider({x:304,y:656},130,29,350,516)],occlusionMask:rect(-304,-656,584,516)
});
officialAsset('desk-positive-x','furniture/table/escritorio x.png',{
  pivot:{x:270,y:660},worldScale:0.18,
  colliders:[tabletopCollider({x:270,y:660},94,35,348,515)],occlusionMask:rect(-270,-660,554,520)
});
officialAsset('desk-negative-y','furniture/table/escritorio -y.png',{
  pivot:{x:496,y:680},worldScale:0.18,
  colliders:[tabletopCollider({x:496,y:680},158,215,675,340)],occlusionMask:rect(-496,-680,992,505)
});
officialAsset('desk-positive-y','furniture/table/escritorio y.png',{
  pivot:{x:409,y:624},worldScale:0.18,
  colliders:[tabletopCollider({x:409,y:624},50,164,685,340)],occlusionMask:rect(-409,-624,818,449)
});
asset('bookshelf', 80, 96, [[0,0,80,96,'554331'],[4,4,72,86,'846348'],[6,28,68,5,'ba9066'],[6,57,68,5,'ba9066'],[6,86,68,5,'ba9066'],[10,7,12,21,'5c91a5'],[25,10,9,18,'d7b874'],[40,6,14,22,'aa695b'],[58,11,11,17,'779b81'],[10,37,18,20,'aa695b'],[35,36,12,21,'779b81'],[53,38,14,19,'5c91a5'],[10,68,58,18,'d7b874']], { colliders: [rect(-38,-12,76,12)], occlusionMask: rect(-40,-96,80,84) });
asset('partition', 120, 64, [[0,0,120,64,'a7b6ba'],[0,0,120,6,'dce4df'],[0,54,120,10,'607985'],[8,12,104,34,'c4d0cc'],[59,7,2,47,'899d9f']], { colliders: [rect(-60,-10,120,10)], occlusionMask: rect(-60,-64,120,54) });
asset('plant', 40, 60, [[12,39,18,21,'b87853'],[10,38,22,5,'d4996e'],[18,9,4,31,'345c44'],[3,8,18,16,'497c58'],[17,0,18,18,'699b65'],[22,19,18,14,'497c58'],[0,24,19,12,'699b65']], { colliders: [rect(-8,-9,16,9)], occlusionMask: rect(-20,-60,40,45) });
asset('tv', 100, 70, [[44,46,12,21,'334350'],[27,66,46,4,'334350'],[0,0,100,52,'26394b'],[5,5,90,40,'57828c'],[15,18,60,3,'9bbdbb'],[15,27,40,3,'9bbdbb']], { colliders: [rect(-22,-5,44,5)], occlusionMask: rect(-50,-70,100,52), interaction: { kind: 'inspect', label: 'Esta pizarra recibirá presentaciones en la etapa de colaboración.', area: rect(-65,-80,130,105) } });
asset('door-closed', 24, 56, [[0,0,24,56,'564637'],[4,4,16,48,'b98459'],[17,29,3,4,'ebd490']], { colliders: [rect(-8,-48,16,48)] });
asset('door-open', 24, 56, [[0,0,4,56,'564637'],[20,0,4,56,'564637'],[0,0,24,4,'564637']]);
for (const [name,w,h] of [['wall-top',640,52],['wall-bottom',640,16],['wall-side-long',16,208],['wall-side-short',16,128],['wall-side-full',16,400]]) {
  asset(name,w,h,[[0,0,w,h,'718b96'],[0,0,w,5,'c1d0cd'],[0,h-7,w,7,'405d6b']], { pivot: {x:0,y:0}, colliders: [rect(0,0,w,h)], sortAnchorY: h, occlusionMask: rect(0,0,w,h) });
}
const object = (objectId, assetId, x, y) => ({ objectId, assetId, position:{x,y} });
const mapVersion = 'demo-v3';
function scene(sceneId, name, side) {
  const right = side === 'right';
  const doorId = `${sceneId}-door`;
  return { schemaVersion:1,mapVersion,sceneId,name,logicalSize:{width:640,height:400},background:{assetId:'floor',color:'#b99770'},
    spawnPoints:{entry:{x:right?88:48,y:240,direction:'right'},portal:{x:right?592:48,y:240,direction:right?'left':'right'}},
    environments:[{environmentId:`${sceneId}-environment`,name,area:rect(16,52,608,332),communicationMode:'PROXIMITY'}],
    objects:[object(`${sceneId}-north`,'wall-top',0,0),object(`${sceneId}-south`,'wall-bottom',0,384),object(`${sceneId}-edge`,'wall-side-full',right?0:624,0),object(`${sceneId}-edge-top`,'wall-side-long',right?624:0,0),object(`${sceneId}-edge-bottom`,'wall-side-short',right?624:0,272),object(`${sceneId}-desk-a`,right?'desk-negative-y':'desk-positive-x',176,220),object(`${sceneId}-desk-b`,right?'desk-positive-y':'desk-negative-x',328,220),object(`${sceneId}-shelf`,'bookshelf',440,218),object(`${sceneId}-partition`,'partition',220,344),object(`${sceneId}-plant`,'plant',552,142),object(`${sceneId}-tv`,'tv',530,345)],
    doors:[{doorId,closedAssetId:'door-closed',openAssetId:'door-open',position:{x:right?624:16,y:268},initiallyOpen:false,interactionArea:rect(right?568:0,200,72,84)}],
    portals:[{portalId:`${sceneId}-exit`,doorId,area:rect(right?616:0,220,24,44),destinationSceneId:right?'studio':'lobby',destinationSpawnId:'portal'}],
    presentationSurfaces:[{surfaceId:`sceneId-tv-surface`.replace('sceneId',sceneId),objectId:`${sceneId}-tv`,area:rect(485,280,90,40)}]
  };
}
const map = {schemaVersion:1,mapVersion,entry:{sceneId:'lobby',spawnId:'entry'},avatar:{avatarId:'man-avatar',views:avatarViews,animations:avatarAnimations,footCollider:rect(-6,-6,12,6)},assets,scenes:[scene('lobby','Recepción','right'),scene('studio','Estudio','left')]};
writeFileSync(`${root}packages/contracts/data/demo-map.json`, `${JSON.stringify(map,null,2)}\n`);
console.log(`Generated map ${mapVersion}: ${assets.length} assets (11 placeholders, 9 received PNGs, 10 frames from 4 received GIFs) and two scenes.`);
