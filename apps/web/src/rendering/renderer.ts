import { assetById, occlusionTarget, spriteRect, worldRect, type MapBundle, type Point, type Scene } from '@pixel-office/contracts';
import { type LocalWorld } from '../engine/world';
import { type AssetCache } from './assets';
interface DrawItem { id: string; assetId: string; position: Point; avatar?: boolean }
export class Renderer {
  private readonly context: CanvasRenderingContext2D;
  private readonly floor = document.createElement('canvas');
  private readonly alpha = new Map<string, number>();
  private readonly debugColliders = import.meta.env.DEV && new URLSearchParams(window.location.search).get('debug') === 'colliders';
  private sceneId = '';
  constructor(private readonly canvas: HTMLCanvasElement, private readonly map: MapBundle, private readonly cache: AssetCache) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('El navegador no permite dibujar la oficina.');
    this.context = context;
  }
  private prepareFloor(scene: Scene) {
    this.sceneId = scene.sceneId; this.alpha.clear();
    this.floor.width = scene.logicalSize.width; this.floor.height = scene.logicalSize.height;
    const context = this.floor.getContext('2d');
    if (!context) throw new Error('No se pudo preparar el piso');
    context.imageSmoothingEnabled = false;
    const asset = assetById(this.map, scene.background.assetId);
    const image = this.cache.get(asset.assetId);
    const rect = asset.sourceRect;
    const width = rect.width * asset.worldScale; const height = rect.height * asset.worldScale;
    context.fillStyle = scene.background.color; context.fillRect(0, 0, this.floor.width, this.floor.height);
    for (let y = 0; y < this.floor.height; y += height) for (let x = 0; x < this.floor.width; x += width) context.drawImage(image, rect.x, rect.y, rect.width, rect.height, x, y, width, height);
  }
  private drawDebugGeometry(world: LocalWorld) {
    if (!this.debugColliders) return;
    const context = this.context;
    context.save();
    context.globalAlpha = 1;
    context.lineWidth = 1;
    for (const object of world.scene.objects) {
      const asset = assetById(this.map, object.assetId);
      const furniture = asset.assetId.startsWith('desk-') || asset.assetId === 'bookshelf';
      if (furniture) {
        const sprite = spriteRect(this.map, asset.assetId, object.position);
        context.strokeStyle = '#f1f4f4'; context.setLineDash([3, 3]);
        context.strokeRect(sprite.x, sprite.y, sprite.width, sprite.height);
        if (asset.occlusionMask) {
          const mask = worldRect(asset.occlusionMask, object.position, asset.worldScale);
          context.strokeStyle = '#ed7bdd'; context.strokeRect(mask.x, mask.y, mask.width, mask.height);
        }
        context.setLineDash([]);
      }
      for (const local of asset.colliders) {
        const collider = worldRect(local, object.position, asset.worldScale);
        if (furniture) { context.fillStyle = '#00d4e655'; context.fillRect(collider.x, collider.y, collider.width, collider.height); }
        context.strokeStyle = furniture ? '#00edff' : '#ffab5f';
        context.strokeRect(collider.x, collider.y, collider.width, collider.height);
      }
      if (furniture) { context.fillStyle = '#ffe376'; context.fillRect(object.position.x - 2, object.position.y - 2, 4, 4); }
    }
    for (const door of world.scene.doors) {
      const asset = assetById(this.map, world.doors[door.doorId] ? door.openAssetId : door.closedAssetId);
      for (const local of asset.colliders) {
        const collider = worldRect(local, door.position, asset.worldScale);
        context.strokeStyle = '#ffab5f'; context.strokeRect(collider.x, collider.y, collider.width, collider.height);
      }
    }
    const foot = worldRect(this.map.avatar.footCollider, world.position);
    context.fillStyle = '#aaff76aa'; context.fillRect(foot.x, foot.y, foot.width, foot.height);
    context.strokeStyle = '#aaff76'; context.strokeRect(foot.x, foot.y, foot.width, foot.height);
    context.fillStyle = '#15212b'; context.fillRect(19, 57, 265, 17);
    context.fillStyle = '#f1f4f4'; context.font = '9px system-ui'; context.textAlign = 'left';
    context.fillText('Blanco sprite · magenta oclusión · cian sólido · verde pies', 23, 69);
    context.restore();
  }
  draw(world: LocalWorld, seconds: number): boolean {
    const { scene, position, direction } = world;
    if (scene.sceneId !== this.sceneId) this.prepareFloor(scene);
    const bounds = this.canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * dpr)); const height = Math.max(1, Math.round(bounds.height * dpr));
    if (width !== this.canvas.width || height !== this.canvas.height) { this.canvas.width = width; this.canvas.height = height; }
    const context = this.context;
    context.setTransform(1,0,0,1,0,0); context.imageSmoothingEnabled = false;
    context.fillStyle = '#182936'; context.fillRect(0,0,width,height);
    const scale = Math.min(width / scene.logicalSize.width, height / scene.logicalSize.height);
    context.translate((width - scene.logicalSize.width * scale) / 2, (height - scene.logicalSize.height * scale) / 2); context.scale(scale,scale);
    context.drawImage(this.floor,0,0);
    const avatarId = this.map.avatar.views[direction];
    const avatarRect = spriteRect(this.map, avatarId, position);
    const items: DrawItem[] = [...scene.objects.map(item => ({ id:item.objectId, assetId:item.assetId, position:item.position })), ...scene.doors.map(door => ({ id:door.doorId, assetId:world.doors[door.doorId] ? door.openAssetId : door.closedAssetId, position:door.position })), { id:'local-avatar', assetId:avatarId, position, avatar:true }];
    const layer = { ground:0, world:1, overlay:2 };
    const depth = (item: DrawItem) => item.position.y + assetById(this.map,item.assetId).sortAnchorY * assetById(this.map,item.assetId).worldScale;
    items.sort((a,b) => layer[assetById(this.map,a.assetId).layer] - layer[assetById(this.map,b.assetId).layer] || depth(a) - depth(b) || a.id.localeCompare(b.id));
    const avatarIndex = items.findIndex(item => item.avatar);
    let animating = false;
    items.forEach((item,index) => {
      const asset = assetById(this.map,item.assetId);
      const target = asset.occlusionMask ? occlusionTarget(worldRect(asset.occlusionMask,item.position,asset.worldScale),avatarRect,index > avatarIndex,asset.occlusionApproachMargin * asset.worldScale) : 1;
      const previous = this.alpha.get(item.id) ?? 1;
      const delta = Math.min(1, seconds / 0.18);
      const value = Math.abs(target - previous) < 0.003 ? target : previous + (target - previous) * delta;
      this.alpha.set(item.id,value); animating ||= Math.abs(value - target) > 0.003;
      const rect = spriteRect(this.map,item.assetId,item.position); const source = asset.sourceRect;
      context.globalAlpha = value;
      context.drawImage(this.cache.get(item.assetId),source.x,source.y,source.width,source.height,Math.round(rect.x),Math.round(rect.y),rect.width,rect.height);
    });
    context.globalAlpha = 1;
    context.fillStyle = '#f4f4dc'; context.font = 'bold 10px system-ui'; context.textAlign = 'center';
    context.fillText('Vos',position.x,position.y - 39);
    this.drawDebugGeometry(world);
    return animating;
  }
  destroy() { this.alpha.clear(); this.floor.width = 0; this.floor.height = 0; this.canvas.width = 0; this.canvas.height = 0; }
}
