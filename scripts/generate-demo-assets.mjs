// Original geometric placeholder art. Pixel dimensions are prototype choices (D-10).
// Reproducible PNG source; replace catalog references with Peredo's licensed exports.
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = `${root}apps/web/public/assets/demo`;
mkdirSync(output, { recursive: true });
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
  const pixels = Buffer.alloc(height * (1 + width * 4));
  for (const [x, y, w, h, color] of shapes) {
    const rgba = [...color.matchAll(/[a-f0-9]{2}/gi)].map(value => parseInt(value[0], 16));
    for (let row = Math.max(0, y); row < Math.min(height, y + h); row++) {
      for (let col = Math.max(0, x); col < Math.min(width, x + w); col++) {
        const offset = row * (1 + width * 4) + 1 + col * 4;
        pixels.set([rgba[0], rgba[1], rgba[2], rgba[3] ?? 255], offset);
      }
    }
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
}
function asset(assetId, width, height, shapes, options = {}) {
  const bytes = png(width, height, shapes);
  writeFileSync(`${output}/${assetId}.png`, bytes);
  assets.push({ schemaVersion: 1, assetId, imageUrl: `/assets/demo/${assetId}.png`, sourceRect: rect(0, 0, width, height), pivot: { x: width / 2, y: height }, worldScale: 1, layer: 'world', sortAnchorY: 0, colliders: [], occlusionMask: null, occlusionApproachMargin: 16, interaction: null, variant: 'demo-v1', contentHash: createHash('sha256').update(bytes).digest('hex'), ...options });
}
asset('floor', 32, 32, [[0,0,32,32,'b99770'],[0,0,32,1,'a2805e'],[0,16,32,1,'a2805e'],[0,1,1,15,'a2805e'],[16,17,1,15,'a2805e'],[3,4,20,1,'c6a580'],[19,24,10,1,'c6a580']], { layer: 'ground', pivot: { x: 0, y: 0 } });
for (const view of ['up','down','left','right']) {
  const shapes = [[5,29,7,3,'24344a'],[14,29,7,3,'24344a'],[5,14,16,15,'4c84d8'],[3,16,3,10,'ebbb95'],[21,16,3,10,'ebbb95'],[6,3,14,12,'edc49f'],[5,0,16,5,'29374a']];
  if (view === 'up') shapes.push([5,3,16,10,'29374a'],[8,17,10,7,'3565ab']);
  if (view === 'down') shapes.push([9,8,2,2,'29374a'],[16,8,2,2,'29374a']);
  if (view === 'left') shapes.push([5,7,2,2,'29374a'],[15,3,6,9,'29374a']);
  if (view === 'right') shapes.push([19,7,2,2,'29374a'],[5,3,6,9,'29374a']);
  asset(`avatar-${view}`, 26, 32, shapes);
}
asset('desk', 96, 56, [[4,22,88,26,'674936'],[8,42,7,14,'493b36'],[81,42,7,14,'493b36'],[0,20,96,8,'dfb886'],[24,0,42,24,'26394b'],[28,4,34,16,'89c8c0'],[40,24,12,4,'26394b'],[67,13,10,7,'f6e1b0']], { colliders: [rect(-44,-25,88,25)], occlusionMask: rect(-48,-56,96,42) });
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
const mapVersion = 'demo-v1';
function scene(sceneId, name, side) {
  const right = side === 'right';
  const doorId = `${sceneId}-door`;
  return { schemaVersion:1,mapVersion,sceneId,name,logicalSize:{width:640,height:400},background:{assetId:'floor',color:'#b99770'},
    spawnPoints:{entry:{x:right?88:48,y:240,direction:'right'},portal:{x:right?592:48,y:240,direction:right?'left':'right'}},
    environments:[{environmentId:`${sceneId}-environment`,name,area:rect(16,52,608,332),communicationMode:'PROXIMITY'}],
    objects:[object(`${sceneId}-north`,'wall-top',0,0),object(`${sceneId}-south`,'wall-bottom',0,384),object(`${sceneId}-edge`,'wall-side-full',right?0:624,0),object(`${sceneId}-edge-top`,'wall-side-long',right?624:0,0),object(`${sceneId}-edge-bottom`,'wall-side-short',right?624:0,272),object(`${sceneId}-desk-a`,'desk',176,154),object(`${sceneId}-desk-b`,'desk',328,154),object(`${sceneId}-shelf`,'bookshelf',440,218),object(`${sceneId}-partition`,'partition',220,344),object(`${sceneId}-plant`,'plant',552,142),object(`${sceneId}-tv`,'tv',530,345)],
    doors:[{doorId,closedAssetId:'door-closed',openAssetId:'door-open',position:{x:right?624:16,y:268},initiallyOpen:false,interactionArea:rect(right?568:0,200,72,84)}],
    portals:[{portalId:`${sceneId}-exit`,doorId,area:rect(right?616:0,220,24,44),destinationSceneId:right?'studio':'lobby',destinationSpawnId:'portal'}],
    presentationSurfaces:[{surfaceId:`sceneId-tv-surface`.replace('sceneId',sceneId),objectId:`${sceneId}-tv`,area:rect(485,280,90,40)}]
  };
}
const map = {schemaVersion:1,mapVersion,entry:{sceneId:'lobby',spawnId:'entry'},avatar:{avatarId:'demo-avatar',views:{up:'avatar-up',down:'avatar-down',left:'avatar-left',right:'avatar-right'},footCollider:rect(-6,-6,12,6)},assets,scenes:[scene('lobby','Recepción','right'),scene('studio','Estudio','left')]};
writeFileSync(`${root}packages/contracts/data/demo-map.json`, `${JSON.stringify(map,null,2)}\n`);
console.log(`Generated ${assets.length} original PNG assets and two scenes.`);
