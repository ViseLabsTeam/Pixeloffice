import '../ui/styles.css';
import { canOccupy } from '@pixel-office/contracts';
import { demoMap } from '@pixel-office/contracts/demo';
import { Input } from '../engine/input';
import { LocalWorld } from '../engine/world';
import { AssetCache } from '../rendering/assets';
import { Renderer } from '../rendering/renderer';
import { LocalMedia } from '../media/local-media';
import { AudioMixer } from '../media/audio-mixer';
import { OfficeMenu } from '../ui/office-menu';
import { ScreenShare } from '../media/screen-share';
import { BoardPanel } from '../ui/board-panel';

function element<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Elemento de interfaz ausente: ${id}`);
  return node as T;
}
const canvas = element<HTMLCanvasElement>('world');
const status = element('status');
const hint = element('hint');
const controller = new AbortController();
const cache = new AssetCache(demoMap);
const renderer = new Renderer(canvas,demoMap,cache);
const audio = new AudioMixer();
const screenShare = new ScreenShare();
const openPanels = new Set<string>();
const localMedia = new LocalMedia(
  { camera: element<HTMLButtonElement>('camera-toggle'), microphone: element<HTMLButtonElement>('microphone-toggle') },
  element<HTMLVideoElement>('camera-preview'),
  element('camera-placeholder'),
  element('media-status'),
  audio
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
  canvas.dataset.scene = world.scene.sceneId;
  // Debug/test coordinates retain subpixel precision at collision boundaries.
  canvas.dataset.x = String(world.position.x); canvas.dataset.y = String(world.position.y);
  canvas.dataset.direction = world.direction;
  canvas.dataset.board = world.boardDirty ? 'dirty' : 'clean';
  canvas.dataset.playerName = world.displayName;
  const door = world.nearbyDoor();
  const interaction = world.nearbyInteraction();
  const message = door ? `${world.doors[door.doorId] ? 'Cerrar' : 'Abrir'} puerta · E o un toque` : interaction?.kind === 'board' ? 'Abrir el pizarrón · E o un toque' : interaction ? `${interaction.label} · E o un toque` : 'Movete con WASD, flechas o arrastrando sobre la oficina.';
  if (hint.textContent !== message) hint.textContent = message;
}
function wake() {
  if (trainTimer) { clearTimeout(trainTimer); trainTimer = 0; }
  if (!frame && ready && !disposed && !document.hidden) frame = requestAnimationFrame(tick);
}
function action() {
  if (!ready || openPanels.size || !menu.entered || world.transitioning) return;
  const message = world.toggleDoor();
  if (message) notify(message);
  else if (world.nearbyInteraction()?.kind === 'board') {
    board.open(); notify('Pizarrón abierto.');
  } else {
    const result = world.activateInteraction();
    if (result) notify(result);
  }
  wake();
}
const input = new Input(canvas,wake,action,{
  r: () => { void resetWorld(); },
  c: () => { void localMedia.toggle('camera'); },
  m: () => { void localMedia.toggle('microphone'); },
  escape: () => menu.openSettings()
});
function blockControls(panel:string,blocked:boolean){
  if(blocked)openPanels.add(panel);else openPanels.delete(panel);
  input.setEnabled(!disposed && openPanels.size===0 && menu.entered);wake();
}
const board = new BoardPanel(screenShare,{
  blocked: blocked => blockControls('board',blocked),
  changed: dirty => { world.boardDirty=dirty;updateInterface();wake(); }
});
const menu = new OfficeMenu(audio,localMedia,{
  nameChanged: name => { world.displayName = name; canvas.dataset.playerName = name; },
  blocked: blocked => blockControls('menu',blocked),
  leave: () => { board.reset();screenShare.stop();void resetWorld(); },
  present: () => board.open('screen')
});
menu.start();
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
  if (!openPanels.size && menu.entered) void transition();
  const nextTrainFrameMs = renderer.draw(world,seconds);
  updateInterface();
  if (vector.x || vector.y) wake();
  else {
    lastTime = 0;
    if (nextTrainFrameMs !== null) trainTimer = window.setTimeout(wake,Math.max(1,Math.ceil(nextTrainFrameMs)));
  }
}
async function resetWorld() {
  if (world.transitioning || !ready) return;
  const next = new LocalWorld(demoMap);
  next.displayName = world.displayName;
  next.boardDirty = board.dirty;
  ready = false; menu.setReady(false); input.reset();
  try {
    await cache.prepare(next.scene);
    if (disposed) { next.destroy(); return; }
    world.destroy(); world = next; lastTime = 0; notify('Volviste a la entrada.');
  } catch (error) { next.destroy(); notify(String(error),true); }
  finally { if (!disposed) { ready = true; menu.setReady(true); wake(); } }
}
const resize = new ResizeObserver(wake); resize.observe(canvas);
document.addEventListener('visibilitychange',() => {
  if (document.hidden) { cancelAnimationFrame(frame); clearTimeout(trainTimer); frame = 0; trainTimer = 0; input.reset(); lastTime = 0; }
  else wake();
},{signal:controller.signal});
function dispose() {
  if (disposed) return;
  disposed = true; ready = false; cancelAnimationFrame(frame); clearTimeout(trainTimer); frame = 0; trainTimer = 0;
  controller.abort(); resize.disconnect(); input.destroy(); menu.destroy(); board.destroy(); screenShare.destroy(); localMedia.destroy(); audio.destroy(); world.destroy(); renderer.destroy(); cache.destroy();
}
window.addEventListener('pagehide',event => {
  if (event.persisted) { cancelAnimationFrame(frame); clearTimeout(trainTimer); frame = 0; trainTimer = 0; input.reset(); screenShare.stop(); localMedia.stopAll(); audio.pauseMusic(); lastTime = 0; }
  else dispose();
},{signal:controller.signal});
window.addEventListener('pageshow',event => { if (event.persisted) wake(); },{signal:controller.signal});
if (import.meta.hot) import.meta.hot.dispose(dispose);
cache.prepare(world.scene).then(() => {
  if (disposed) return;
  ready = true; menu.setReady(true); canvas.dataset.ready = 'true'; notify('La oficina está lista para explorar.'); wake();
}).catch(error => { if (!disposed) { const message = `No pudimos cargar la oficina: ${String(error)}`; notify(message,true); menu.setError(message); } });
