import '../ui/styles.css';
import { canOccupy } from '@pixel-office/contracts';
import { demoMap } from '@pixel-office/contracts/demo';
import { Input } from '../engine/input';
import { LocalWorld } from '../engine/world';
import { AssetCache } from '../rendering/assets';
import { Renderer } from '../rendering/renderer';
import { LocalMedia } from '../media/local-media';

function element<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Elemento de interfaz ausente: ${id}`);
  return node as T;
}
const canvas = element<HTMLCanvasElement>('world');
const status = element('status');
const actionButton = element<HTMLButtonElement>('action');
const resetButton = element<HTMLButtonElement>('reset');
const sceneName = element('scene-name');
const position = element('position');
const hint = element('hint');
const controller = new AbortController();
const cache = new AssetCache(demoMap);
const renderer = new Renderer(canvas,demoMap,cache);
const localMedia = new LocalMedia(
  { camera: element<HTMLButtonElement>('camera-toggle'), microphone: element<HTMLButtonElement>('microphone-toggle') },
  element<HTMLVideoElement>('camera-preview'),
  element('camera-placeholder'),
  element('media-status')
);
let world = new LocalWorld(demoMap);
// Developer-only setup for visually checking colliders and input at a valid position.
const debugParams = new URLSearchParams(window.location.search);
if (import.meta.env.DEV && debugParams.get('debug') === 'colliders' && debugParams.has('x') && debugParams.has('y')) {
  const point = { x: Number(debugParams.get('x')), y: Number(debugParams.get('y')) };
  if (canOccupy(demoMap, world.scene, point, world.colliders)) world.position = point;
}
let frame = 0;
let trainTimer = 0;
let lastTime = 0;
let ready = false;
let disposed = false;

function notify(message: string, error = false) { status.textContent = message; status.dataset.error = String(error); }
function updateInterface() {
  if (sceneName.textContent !== world.scene.name) {
    sceneName.textContent = world.scene.name;
    element('scene-count').textContent = '1 espacio';
    element('scene-description').textContent = 'Oficina completa · Movete con WASD, flechas o joystick';
    canvas.dataset.scene = world.scene.sceneId;
  }
  const x = Math.round(world.position.x); const y = Math.round(world.position.y);
  const coordinates = `${x}, ${y}`;
  if (position.textContent !== coordinates) position.textContent = coordinates;
  // Debug/test coordinates retain subpixel precision at collision boundaries.
  canvas.dataset.x = String(world.position.x); canvas.dataset.y = String(world.position.y);
  canvas.dataset.direction = world.direction;
  canvas.dataset.board = world.boardDirty ? 'dirty' : 'clean';
  const door = world.nearbyDoor();
  const interaction = world.nearbyInteraction();
  const message = door ? `${world.doors[door.doorId] ? 'Cerrar' : 'Abrir'} puerta · E o Interactuar` : interaction?.kind === 'board' ? `${world.boardDirty ? 'Borrar' : 'Dibujar en'} el pizarrón · E o Interactuar` : interaction ? `${interaction.label} · E o Interactuar` : 'Movete con WASD, flechas o el joystick.';
  if (hint.textContent !== message) hint.textContent = message;
  actionButton.disabled = !ready || world.transitioning || (!door && !interaction);
}
function wake() {
  if (trainTimer) { clearTimeout(trainTimer); trainTimer = 0; }
  if (!frame && ready && !disposed && !document.hidden) frame = requestAnimationFrame(tick);
}
function action() {
  if (!ready || world.transitioning) return;
  const message = world.toggleDoor();
  if (message) notify(message);
  else {
    const result = world.activateInteraction();
    if (result) notify(result);
  }
  wake();
}
const input = new Input(element('joystick'),element('joystick-knob'),wake,action);
async function transition() {
  try {
    const changed = await world.transition(scene => cache.prepare(scene),performance.now());
    if (changed && !disposed) { input.reset(); lastTime = 0; notify(`Entraste a ${world.scene.name}.`); updateInterface(); wake(); }
  } catch (error) { if (!disposed) { input.reset(); notify(error instanceof Error ? error.message : 'No se pudo abrir el destino.',true); wake(); } }
}
function tick(time: number) {
  frame = 0;
  if (!ready || disposed || document.hidden) { lastTime = 0; return; }
  if (lastTime && time - lastTime < 1000 / 30) { frame = requestAnimationFrame(tick); return; }
  const seconds = lastTime ? Math.min(0.1,(time - lastTime) / 1000) : 1 / 30;
  lastTime = time;
  const vector = input.vector();
  world.step(vector,seconds);
  void transition();
  const nextTrainFrameMs = renderer.draw(world,seconds);
  updateInterface();
  if (vector.x || vector.y) wake();
  else {
    lastTime = 0;
    if (nextTrainFrameMs !== null) trainTimer = window.setTimeout(wake,Math.max(1,Math.ceil(nextTrainFrameMs)));
  }
}
// A secondary touch contact does not synthesize the mouse click used by a
// native button in every browser. Preserve keyboard clicks and suppress duplicates.
let lastTouchAction = -Infinity;
actionButton.addEventListener('pointerup',event => {
  if (event.pointerType !== 'touch' || actionButton.disabled) return;
  event.preventDefault(); lastTouchAction = performance.now(); action();
},{signal:controller.signal});
actionButton.addEventListener('click',event => {
  if (event.detail > 0 && performance.now() - lastTouchAction < 750) return;
  action();
},{signal:controller.signal});
resetButton.addEventListener('click',async () => {
  if (world.transitioning || !ready) return;
  const next = new LocalWorld(demoMap);
  ready = false; resetButton.disabled = true; input.reset();
  try {
    await cache.prepare(next.scene);
    if (disposed) { next.destroy(); return; }
    world.destroy(); world = next; lastTime = 0; notify('Volviste a la entrada.');
  } catch (error) { next.destroy(); notify(String(error),true); }
  finally { if (!disposed) { ready = true; resetButton.disabled = false; wake(); } }
},{signal:controller.signal});
const resize = new ResizeObserver(wake); resize.observe(canvas);
document.addEventListener('visibilitychange',() => {
  if (document.hidden) { cancelAnimationFrame(frame); clearTimeout(trainTimer); frame = 0; trainTimer = 0; input.reset(); lastTime = 0; }
  else wake();
},{signal:controller.signal});
function dispose() {
  if (disposed) return;
  disposed = true; ready = false; cancelAnimationFrame(frame); clearTimeout(trainTimer); frame = 0; trainTimer = 0;
  controller.abort(); resize.disconnect(); input.destroy(); localMedia.destroy(); world.destroy(); renderer.destroy(); cache.destroy();
}
window.addEventListener('pagehide',event => {
  if (event.persisted) { cancelAnimationFrame(frame); clearTimeout(trainTimer); frame = 0; trainTimer = 0; input.reset(); localMedia.stopAll(); lastTime = 0; }
  else dispose();
},{signal:controller.signal});
window.addEventListener('pageshow',event => { if (event.persisted) wake(); },{signal:controller.signal});
if (import.meta.hot) import.meta.hot.dispose(dispose);
cache.prepare(world.scene).then(() => {
  if (disposed) return;
  ready = true; canvas.dataset.ready = 'true'; notify('La oficina está lista para explorar.'); wake();
}).catch(error => { notify(`No pudimos cargar la oficina: ${String(error)}`,true); });
