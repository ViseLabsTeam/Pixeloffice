import { type Asset, type MapBundle, type Scene } from '@pixel-office/contracts';
const MAX_BITMAP_BYTES = 64 * 1024 * 1024;
export class AssetCache {
  private readonly images = new Map<string, HTMLImageElement>();
  private bytes = 0;
  private destroyed = false;
  constructor(private readonly map: MapBundle) {}
  async prepare(scene: Scene): Promise<void> {
    const ids = new Set([scene.background.assetId, ...Object.values(this.map.avatar.views), ...scene.objects.map(item => item.assetId), ...scene.doors.flatMap(door => [door.closedAssetId, door.openAssetId])]);
    const assets = this.map.assets.filter(asset => ids.has(asset.assetId));
    await Promise.all(assets.map(asset => this.load(asset)));
  }
  private async load(asset: Asset) {
    if (this.destroyed) throw new Error('Carga cancelada');
    if (this.images.has(asset.assetId)) return;
    const image = new Image(); image.src = asset.imageUrl;
    await image.decode();
    if (this.destroyed) { image.src = ''; return; }
    const bytes = image.naturalWidth * image.naturalHeight * 4;
    if (this.bytes + bytes > MAX_BITMAP_BYTES) { image.src = ''; throw new Error('Se excedió el presupuesto de imágenes de esta demostración.'); }
    if (asset.sourceRect.x + asset.sourceRect.width > image.naturalWidth || asset.sourceRect.y + asset.sourceRect.height > image.naturalHeight) throw new Error(`Región inválida: ${asset.assetId}`);
    this.images.set(asset.assetId, image); this.bytes += bytes;
  }
  get(id: string): HTMLImageElement {
    const image = this.images.get(id);
    if (!image) throw new Error(`Imagen no cargada: ${id}`);
    return image;
  }
  destroy() {
    this.destroyed = true;
    this.images.forEach(image => { image.src = ''; }); this.images.clear(); this.bytes = 0;
  }
}
