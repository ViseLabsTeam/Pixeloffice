import { canCloseDoor, canOccupy, contains, facing, initialDoors, move, sceneColliders, type Direction, type MapBundle, type Point, type Rect, type Scene } from '@pixel-office/contracts';

// I1 is a local spatial preview. I2 will reconcile this state with authenticated snapshots.
export class LocalWorld {
  scene: Scene;
  position: Point;
  direction: Direction;
  moving = false;
  boardDirty = false;
  readonly doors: Record<string, boolean>;
  colliders: Rect[];
  transitioning = false;
  private cooldownUntil = 0;
  private blockedPortal: string | undefined;
  private destroyed = false;

  constructor(readonly map: MapBundle) {
    const scene = map.scenes.find(item => item.sceneId === map.entry.sceneId);
    const spawn = scene?.spawnPoints[map.entry.spawnId];
    if (!scene || !spawn) throw new Error('Entrada de mapa inválida');
    this.scene = scene; this.position = { x: spawn.x, y: spawn.y }; this.direction = spawn.direction;
    this.doors = initialDoors(map);
    this.colliders = sceneColliders(map, scene, this.doors);
  }
  step(input: Point, seconds: number): boolean {
    if (this.transitioning || this.destroyed) { this.moving = false; return false; }
    const next = move(this.map, this.scene, this.position, input, seconds, this.colliders);
    const direction = facing(input, this.direction);
    this.moving = next.x !== this.position.x || next.y !== this.position.y;
    const changed = this.moving || direction !== this.direction;
    this.position = next; this.direction = direction;
    return changed;
  }
  nearbyDoor() {
    return this.scene.doors.find(door => contains(door.interactionArea, this.position));
  }
  nearbyInteraction() {
    return this.scene.interactions.find(item => contains(item.area, this.position));
  }
  activateInteraction(): string | undefined {
    const item = this.nearbyInteraction();
    if (!item) return;
    if (item.kind === 'board') {
      this.boardDirty = !this.boardDirty;
      return this.boardDirty ? 'Pizarrón marcado.' : 'Pizarrón limpio.';
    }
    return item.label;
  }
  toggleDoor(): string | undefined {
    if (this.transitioning || this.destroyed) return;
    const door = this.nearbyDoor();
    if (!door) return;
    const open = this.doors[door.doorId];
    if (open && !canCloseDoor(this.map, door, [this.position])) return 'No se puede cerrar la puerta mientras la ocupás.';
    this.doors[door.doorId] = !open;
    this.colliders = sceneColliders(this.map, this.scene, this.doors);
    return open ? 'Puerta cerrada.' : 'Puerta abierta. Avanzá para cruzar.';
  }
  async transition(prepare: (scene: Scene) => Promise<void>, now: number): Promise<boolean> {
    if (this.transitioning || this.destroyed) return false;
    const portal = this.scene.portals.find(item => contains(item.area, this.position));
    if (!portal) { this.blockedPortal = undefined; return false; }
    if (this.blockedPortal === portal.portalId || now < this.cooldownUntil || !this.doors[portal.doorId]) return false;
    this.blockedPortal = portal.portalId;
    const destination = this.map.scenes.find(item => item.sceneId === portal.destinationSceneId);
    const spawn = destination?.spawnPoints[portal.destinationSpawnId];
    if (!destination || !spawn) throw new Error('Destino no disponible; permanecés en la escena actual.');
    const colliders = sceneColliders(this.map, destination, this.doors);
    if (!canOccupy(this.map, destination, spawn, colliders)) throw new Error('Entrada bloqueada; permanecés en la escena actual.');
    this.transitioning = true;
    try {
      await prepare(destination);
      if (this.destroyed) return false;
      this.scene = destination; this.position = { x: spawn.x, y: spawn.y }; this.direction = spawn.direction; this.moving = false;
      this.colliders = colliders; this.cooldownUntil = now + 400; this.blockedPortal = undefined;
      return true;
    } finally { this.transitioning = false; }
  }
  destroy() { this.destroyed = true; }
}
