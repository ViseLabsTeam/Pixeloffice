import Ajv from 'ajv';
import { assetById, initialDoors, type MapBundle } from './map';
import { canOccupy, contains, sceneColliders } from './spatial';

const id = { type: 'string', pattern: '^[a-z0-9][a-z0-9-]*$', maxLength: 128 };
const number = { type: 'number' };
const positive = { type: 'number', exclusiveMinimum: 0 };
const object = (properties: Record<string, unknown>) => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
const array = (items: unknown) => ({ type: 'array', items, maxItems: 2000 });
const point = object({ x: number, y: number });
const rect = object({ shape: { const: 'rect' }, x: number, y: number, width: positive, height: positive });
const direction = { enum: ['up', 'down', 'left', 'right'] };
const nullable = (schema: unknown) => ({ anyOf: [schema, { type: 'null' }] });
export const mapSchema = {
  $id: 'https://pixel-office.local/schemas/map-v1',
  ...object({
    schemaVersion: { const: 1 }, mapVersion: id,
    entry: object({ sceneId: id, spawnId: id }),
    avatar: object({ avatarId: id, views: object({ up: id, down: id, left: id, right: id }), animations: object({ up: array(object({ assetId: id, durationMs: positive })), down: array(object({ assetId: id, durationMs: positive })), left: array(object({ assetId: id, durationMs: positive })), right: array(object({ assetId: id, durationMs: positive })) }), footCollider: rect }),
    assets: array(object({
      schemaVersion: { const: 1 }, assetId: id,
      imageUrl: { type: 'string', pattern: '^/assets/[a-z0-9/-]+\\.(png|jpeg)$' },
      sourceRect: rect, pivot: point, worldScale: positive,
      layer: { enum: ['ground', 'world', 'overlay'] }, sortAnchorY: number,
      colliders: array(rect),
      depth: nullable({ type:'object',additionalProperties:false,required:['axis','offset','behindSide'],properties:{
        axis:{enum:['x','y']},offset:number,behindSide:{enum:['positive','negative']},
        secondary:object({axis:{enum:['x','y']},offset:number,behindSide:{enum:['positive','negative']}})
      } }),
      renderOrder: number,
      interaction: nullable(object({ kind: { const: 'inspect' }, label: { type: 'string', minLength: 1, maxLength: 300 }, area: rect })),
      variant: id, contentHash: { type: 'string', pattern: '^[a-f0-9]{64}$' }
    })),
    scenes: array(object({
      schemaVersion: { const: 1 }, mapVersion: id, sceneId: id, name: { type: 'string', minLength: 1, maxLength: 100 },
      logicalSize: object({ width: positive, height: positive }),
      background: object({ assetId: id, color: { type: 'string', pattern: '^#[a-fA-F0-9]{6}$' } }),
      spawnPoints: { type: 'object', minProperties: 1, propertyNames: id, additionalProperties: object({ x: number, y: number, direction }) },
      environments: array(object({ environmentId: id, name: { type: 'string' }, area: rect, communicationMode: { enum: ['PROXIMITY', 'AMBIENT'] } })),
      objects: array(object({ objectId: id, assetId: id, position: point })),
      doors: array(object({ doorId: id, closedAssetId: id, openAssetId: id, position: point, initiallyOpen: { type: 'boolean' }, interactionArea: rect })),
      portals: array(object({ portalId: id, doorId: id, area: rect, destinationSceneId: id, destinationSpawnId: id })),
      presentationSurfaces: array(object({ surfaceId: id, objectId: id, area: rect })),
      colliders: array(object({ colliderId: id, area: rect })),
      interactions: array(object({ hotspotId: id, kind: { enum: ['board','computer'] }, label: { type:'string', minLength:1 }, area: rect })),
      windows: array(rect), trainFrames: array(object({ assetId: id, durationMs: positive })), boardSurface: rect, boardCorners: {type:'array',items:point,minItems:4,maxItems:4}
    }))
  })
};
const validateShape = new Ajv({ allErrors: true, strict: true }).compile<MapBundle>(mapSchema);
export function validateMap(candidate: unknown): MapBundle {
  if (!validateShape(candidate)) throw new Error(`Manifest inválido: ${JSON.stringify(validateShape.errors)}`);
  const map = candidate;
  const unique = (ids: string[], label: string) => {
    if (new Set(ids).size !== ids.length) throw new Error(`IDs duplicados: ${label}`);
  };
  unique(map.assets.map(asset => asset.assetId), 'assets');
  unique(map.scenes.map(scene => scene.sceneId), 'escenas');
  unique(map.scenes.flatMap(scene => scene.doors.map(door => door.doorId)), 'puertas');
  const entry = map.scenes.find(scene => scene.sceneId === map.entry.sceneId);
  if (!entry?.spawnPoints[map.entry.spawnId]) throw new Error('Entrada de mapa inexistente');
  for (const view of Object.values(map.avatar.views)) assetById(map, view);
  for (const frames of Object.values(map.avatar.animations)) {
    if (!frames.length) throw new Error('Animación de avatar vacía');
    for (const frame of frames) assetById(map, frame.assetId);
  }
  const doors = initialDoors(map);
  for (const asset of map.assets) {
    if (asset.sourceRect.x < 0 || asset.sourceRect.y < 0 || asset.pivot.x < 0 || asset.pivot.y < 0 || asset.pivot.x > asset.sourceRect.width || asset.pivot.y > asset.sourceRect.height) throw new Error(`Pivot/región inválida: ${asset.assetId}`);
  }
  for (const scene of map.scenes) {
    if (scene.mapVersion !== map.mapVersion) throw new Error('Versiones de mapa incompatibles');
    assetById(map, scene.background.assetId);
    unique(scene.objects.map(item => item.objectId), scene.sceneId);
    unique(scene.portals.map(item => item.portalId), 'portales');
    unique(scene.environments.map(item => item.environmentId), 'ambientes');
    unique(scene.presentationSurfaces.map(item => item.surfaceId), 'superficies');
    unique(scene.colliders.map(item => item.colliderId), 'colliders');
    unique(scene.interactions.map(item => item.hotspotId), 'interacciones');
    for (const item of scene.objects) assetById(map, item.assetId);
    for (const frame of scene.trainFrames) assetById(map, frame.assetId);
    for (const door of scene.doors) {
      assetById(map, door.openAssetId); assetById(map, door.closedAssetId);
    }
    const colliders = sceneColliders(map, scene, doors);
    for (const spawn of Object.values(scene.spawnPoints)) {
      if (!canOccupy(map, scene, spawn, colliders)) throw new Error(`Spawn bloqueado: ${scene.sceneId}`);
      if (scene.portals.some(portal => contains(portal.area, spawn))) throw new Error(`Spawn sobre portal: ${scene.sceneId}`);
    }
    for (const portal of scene.portals) {
      const destination = map.scenes.find(item => item.sceneId === portal.destinationSceneId);
      if (!destination?.spawnPoints[portal.destinationSpawnId]) throw new Error(`Destino inexistente: ${portal.portalId}`);
      if (!scene.doors.some(door => door.doorId === portal.doorId)) throw new Error(`Puerta inexistente: ${portal.portalId}`);
    }
    for (const surface of scene.presentationSurfaces) {
      if (!scene.objects.some(item => item.objectId === surface.objectId)) throw new Error(`Superficie sin objeto: ${surface.surfaceId}`);
    }
  }
  return map;
}
