import { normalizeInput, type Point } from '@pixel-office/contracts';

function capturesInput(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable="true"], dialog[open]'));
}
export class Input {
  private readonly controller = new AbortController();
  private readonly keys = new Set<string>();
  private stick: Point = { x: 0, y: 0 };
  private pointer: number | undefined;
  private readonly movementKeys = new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']);

  constructor(private readonly zone: HTMLElement, private readonly knob: HTMLElement, private readonly wake: () => void, action: () => void) {
    const options = { signal: this.controller.signal };
    window.addEventListener('keydown', event => {
      if (capturesInput(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (this.movementKeys.has(key)) { event.preventDefault(); this.keys.add(key); wake(); }
      if (key === 'e' && !event.repeat) { event.preventDefault(); action(); }
    }, options);
    window.addEventListener('keyup', event => { this.keys.delete(event.key.toLowerCase()); wake(); }, options);
    window.addEventListener('blur', () => this.reset(), options);
    document.addEventListener('focusin', event => { if (capturesInput(event.target)) this.reset(); }, options);
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.reset(); }, options);
    zone.addEventListener('pointerdown', event => {
      if (this.pointer !== undefined || event.button !== 0) return;
      event.preventDefault(); this.pointer = event.pointerId;
      zone.setPointerCapture(event.pointerId); this.updateStick(event);
    }, options);
    zone.addEventListener('pointermove', event => { if (event.pointerId === this.pointer) this.updateStick(event); }, options);
    const release = (event: PointerEvent) => { if (event.pointerId === this.pointer) this.resetStick(); };
    zone.addEventListener('pointerup', release, options);
    zone.addEventListener('pointercancel', release, options);
    zone.addEventListener('lostpointercapture', release, options);
  }
  private updateStick(event: PointerEvent) {
    const bounds = this.zone.getBoundingClientRect();
    const radius = bounds.width * 0.3;
    const vector = normalizeInput({ x: (event.clientX - bounds.left - bounds.width / 2) / radius, y: (event.clientY - bounds.top - bounds.height / 2) / radius });
    const magnitude = Math.hypot(vector.x, vector.y);
    const strength = Math.max(0, (magnitude - 0.12) / 0.88);
    this.stick = magnitude > 0 ? { x: vector.x / magnitude * strength, y: vector.y / magnitude * strength } : { x: 0, y: 0 };
    this.knob.style.transform = `translate(${vector.x * radius}px, ${vector.y * radius}px)`;
    this.wake();
  }
  vector(): Point {
    if (capturesInput(document.activeElement)) return { x: 0, y: 0 };
    if (this.pointer !== undefined) return this.stick;
    const key = (...names: string[]) => Number(names.some(name => this.keys.has(name)));
    return normalizeInput({ x: key('d','arrowright') - key('a','arrowleft'), y: key('s','arrowdown') - key('w','arrowup') });
  }
  private resetStick() {
    const pointer = this.pointer; this.pointer = undefined; this.stick = { x: 0, y: 0 };
    if (pointer !== undefined && this.zone.hasPointerCapture(pointer)) this.zone.releasePointerCapture(pointer);
    this.knob.style.transform = 'translate(0, 0)'; this.wake();
  }
  reset() { this.keys.clear(); this.resetStick(); }
  destroy() { this.controller.abort(); this.reset(); }
}
