import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { demoMap } from '@pixel-office/contracts/demo';
function jpegDimensions(bytes: Buffer): {width:number;height:number} {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('JPEG inválido');
  let offset=2;
  while (offset < bytes.length) {
    if (bytes[offset++] !== 0xff) throw new Error('Marcador JPEG inválido');
    while (bytes[offset] === 0xff) offset++;
    const marker=bytes[offset++]!;
    if (marker === 0xd9 || marker === 0xda) break;
    const length=bytes.readUInt16BE(offset);
    if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) return {width:bytes.readUInt16BE(offset+5),height:bytes.readUInt16BE(offset+3)};
    offset+=length;
  }
  throw new Error('JPEG sin dimensiones');
}
for (const asset of demoMap.assets) {
  const bytes = await readFile(new URL(`../apps/web/public${asset.imageUrl}`, import.meta.url));
  const dimensions = asset.imageUrl.endsWith('.jpeg') ? jpegDimensions(bytes) : (() => {
    if (!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error(`PNG inválido: ${asset.assetId}`);
    return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
  })();
  if (createHash('sha256').update(bytes).digest('hex') !== asset.contentHash) throw new Error(`Hash incorrecto: ${asset.assetId}`);
  if (asset.sourceRect.x + asset.sourceRect.width > dimensions.width || asset.sourceRect.y + asset.sourceRect.height > dimensions.height) throw new Error(`Región fuera de la imagen: ${asset.assetId}`);
}
console.log(`Manifest ${demoMap.mapVersion}: ${demoMap.scenes.length} escena y ${demoMap.assets.length} imágenes verificadas.`);
