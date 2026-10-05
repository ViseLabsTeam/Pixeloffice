export interface Point { x: number; y: number }
export interface Rect extends Point { shape: 'rect'; width: number; height: number }
export type Direction = 'up' | 'down' | 'left' | 'right';
export interface AnimationFrame { assetId: string; durationMs: number }
export interface Asset {
  schemaVersion: 1;
  assetId: string;
  imageUrl: string;
  sourceRect: Rect;
  pivot: Point;
  worldScale: number;
  layer: 'ground' | 'world' | 'overlay';
  sortAnchorY: number;
  colliders: Rect[];
  occlusionMask: Rect | null;
  occlusionApproachMargin: number;
  interaction: { kind: 'inspect'; label: string; area: Rect } | null;
  variant: string;
  contentHash: string;
}
export interface SceneObject { objectId: string; assetId: string; position: Point }
export interface Door {
  doorId: string;
  closedAssetId: string;
  openAssetId: string;
  position: Point;
  initiallyOpen: boolean;
  interactionArea: Rect;
}
export interface Spawn extends Point { direction: Direction }
export interface Portal {
  portalId: string;
  doorId: string;
  area: Rect;
  destinationSceneId: string;
  destinationSpawnId: string;
}
export interface Scene {
  schemaVersion: 1;
  mapVersion: string;
  sceneId: string;
  name: string;
  logicalSize: { width: number; height: number };
  background: { assetId: string; color: string };
  spawnPoints: Record<string, Spawn>;
  environments: { environmentId: string; name: string; area: Rect; communicationMode: 'PROXIMITY' | 'AMBIENT' }[];
  objects: SceneObject[];
  doors: Door[];
  portals: Portal[];
  presentationSurfaces: { surfaceId: string; objectId: string; area: Rect }[];
}
export interface MapBundle {
  schemaVersion: 1;
  mapVersion: string;
  entry: { sceneId: string; spawnId: string };
  avatar: { avatarId: string; views: Record<Direction, string>; animations: Record<Direction, AnimationFrame[]>; footCollider: Rect };
  assets: Asset[];
  scenes: Scene[];
}
export type DoorStates = Readonly<Record<string, boolean>>;
export function initialDoors(map: MapBundle): Record<string, boolean> {
  return Object.fromEntries(map.scenes.flatMap(scene => scene.doors.map(door => [door.doorId, door.initiallyOpen])));
}
export function assetById(map: MapBundle, id: string): Asset {
  const asset = map.assets.find(item => item.assetId === id);
  if (!asset) throw new Error(`Asset desconocido: ${id}`);
  return asset;
}
