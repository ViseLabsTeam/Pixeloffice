import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { demoMap } from '@pixel-office/contracts/demo';
for (const asset of demoMap.assets) {
  const bytes = await readFile(new URL(`../apps/web/public${asset.imageUrl}`, import.meta.url));
  if (!bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error(`PNG inválido: ${asset.assetId}`);
  if (createHash('sha256').update(bytes).digest('hex') !== asset.contentHash) throw new Error(`Hash incorrecto: ${asset.assetId}`);
  if (asset.sourceRect.x + asset.sourceRect.width > bytes.readUInt32BE(16) || asset.sourceRect.y + asset.sourceRect.height > bytes.readUInt32BE(20)) throw new Error(`Región fuera del PNG: ${asset.assetId}`);
}
console.log(`Manifest ${demoMap.mapVersion}: ${demoMap.scenes.length} escenas y ${demoMap.assets.length} PNG verificados.`);
