import { assetById, type Direction, type Door, type DoorStates, type MapBundle, type Point, type Rect, type Scene } from './map';

export const MOVEMENT_SPEED = 120;
export const MAX_STEP_SECONDS = 0.1;
// 90% transparency leaves 10% opacity when an object occludes the avatar.
export const OCCLUSION_MIN_OPACITY = 0.1;

export function worldRect(rect: Rect, position: Point, scale = 1): Rect {
  return { shape: 'rect', x: position.x + rect.x * scale, y: position.y + rect.y * scale, width: rect.width * scale, height: rect.height * scale };
}
export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
export function contains(rect: Rect, point: Point): boolean {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}
export function normalizeInput(input: Point): Point {
  if (!Number.isFinite(input.x) || !Number.isFinite(input.y)) return { x: 0, y: 0 };
  const magnitude = Math.max(1, Math.hypot(input.x, input.y));
  return { x: input.x / magnitude, y: input.y / magnitude };
}
export function facing(input: Point, previous: Direction): Direction {
  if (!input.x && !input.y) return previous;
  const horizontal = input.x > 0 ? 'right' : 'left';
  const vertical = input.y > 0 ? 'down' : 'up';
  if (Math.abs(input.x) === Math.abs(input.y) && (previous === horizontal || previous === vertical)) return previous;
  return Math.abs(input.x) > Math.abs(input.y) ? horizontal : vertical;
}
export function sceneColliders(map: MapBundle, scene: Scene, doors: DoorStates): Rect[] {
  const result = scene.objects.flatMap(object => {
    const asset = assetById(map, object.assetId);
    return asset.colliders.map(rect => worldRect(rect, object.position, asset.worldScale));
  });
  for (const door of scene.doors) {
    const asset = assetById(map, doors[door.doorId] ? door.openAssetId : door.closedAssetId);
    result.push(...asset.colliders.map(rect => worldRect(rect, door.position, asset.worldScale)));
  }
  return result;
}
export function canOccupy(map: MapBundle, scene: Scene, position: Point, colliders: Rect[]): boolean {
  if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) return false;
  const foot = worldRect(map.avatar.footCollider, position);
  if (foot.x < 0 || foot.y < 0 || foot.x + foot.width > scene.logicalSize.width || foot.y + foot.height > scene.logicalSize.height) return false;
  return !colliders.some(rect => overlaps(rect, foot));
}
// The same pure geometry is used by I1 locally and is available to the I2 authority.
export function move(map: MapBundle, scene: Scene, position: Point, input: Point, seconds: number, colliders: Rect[]): Point {
  const vector = normalizeInput(input);
  const dt = Number.isFinite(seconds) ? Math.max(0, Math.min(MAX_STEP_SECONDS, seconds)) : 0;
  const dx = vector.x * MOVEMENT_SPEED * dt;
  const dy = vector.y * MOVEMENT_SPEED * dt;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 2));
  const next = { ...position };
  for (let step = 0; step < steps; step++) {
    if (canOccupy(map, scene, { x: next.x + dx / steps, y: next.y }, colliders)) next.x += dx / steps;
    if (canOccupy(map, scene, { x: next.x, y: next.y + dy / steps }, colliders)) next.y += dy / steps;
  }
  return next;
}
export function canCloseDoor(map: MapBundle, door: Door, positions: Point[]): boolean {
  const asset = assetById(map, door.closedAssetId);
  return !positions.some(position => asset.colliders.some(rect => overlaps(worldRect(rect, door.position, asset.worldScale), worldRect(map.avatar.footCollider, position))));
}
export function spriteRect(map: MapBundle, assetId: string, position: Point): Rect {
  const asset = assetById(map, assetId);
  return worldRect({ shape: 'rect', x: -asset.pivot.x, y: -asset.pivot.y, width: asset.sourceRect.width, height: asset.sourceRect.height }, position, asset.worldScale);
}
export function occlusionTarget(mask: Rect, avatar: Rect, inFront: boolean, margin: number): number {
  if (!inFront) return 1;
  const dx = Math.max(mask.x - avatar.x - avatar.width, avatar.x - mask.x - mask.width, 0);
  const dy = Math.max(mask.y - avatar.y - avatar.height, avatar.y - mask.y - mask.height, 0);
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return OCCLUSION_MIN_OPACITY;
  return margin > 0 ? OCCLUSION_MIN_OPACITY + (1 - OCCLUSION_MIN_OPACITY) * Math.min(1, distance / margin) : 1;
}
