import { normalizeInput, type Point } from '@pixel-office/contracts';

function capturesInput(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable="true"], dialog[open]'));
}
export class Input {
  private readonly controller = new AbortController();
  private readonly keys = new Set<string>();
  private stick: Point = { x: 0, y: 0 };
  private pointer: number | undefined;
  private origin: Point = { x: 0, y: 0 };
  private dragged = false;
  private enabled = true;
  private readonly movementKeys = new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']);

  constructor(private readonly zone: HTMLElement, private readonly wake: () => void, action: () => void, shortcuts: Record<string, () => void> = {}) {
    const options = { signal: this.controller.signal };
    window.addEventListener('keydown', event => {
      if (!this.enabled || capturesInput(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (this.movementKeys.has(key)) { event.preventDefault(); this.keys.add(key); wake(); }
      if (key === 'e' && !event.repeat) { event.preventDefault(); action(); }
      if (shortcuts[key] && !event.repeat) { event.preventDefault(); shortcuts[key](); }
    }, options);
    window.addEventListener('keyup', event => { this.keys.delete(event.key.toLowerCase()); wake(); }, options);
    window.addEventListener('blur', () => this.reset(), options);
    document.addEventListener('focusin', event => { if (capturesInput(event.target)) this.reset(); }, options);
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.reset(); }, options);
    zone.addEventListener('pointerdown', event => {
      if (!this.enabled || this.pointer !== undefined || event.button !== 0) return;
      event.preventDefault(); this.pointer = event.pointerId;
      this.origin = { x: event.clientX, y: event.clientY }; this.dragged = false;
      zone.focus({ preventScroll: true });
      zone.setPointerCapture(event.pointerId); this.updateStick(event);
    }, options);
    zone.addEventListener('pointermove', event => { if (event.pointerId === this.pointer) this.updateStick(event); }, options);
    const release = (event: PointerEvent) => { if (event.pointerId === this.pointer) this.resetStick(); };
    zone.addEventListener('pointerup', event => {
      if (event.pointerId !== this.pointer) return;
      this.updateStick(event);
      const tap = !this.dragged;
      this.resetStick();
      if (tap) action();
    }, options);
    zone.addEventListener('pointercancel', release, options);
    zone.addEventListener('lostpointercapture', release, options);
  }
  private updateStick(event: PointerEvent) {
    const radius = 64;
    const dx = event.clientX - this.origin.x, dy = event.clientY - this.origin.y;
    if (Math.hypot(dx,dy) > 8) this.dragged = true;
    const vector = normalizeInput({ x: dx / radius, y: dy / radius });
    const magnitude = Math.hypot(vector.x, vector.y);
    const strength = Math.max(0, (magnitude - 0.12) / 0.88);
    this.stick = magnitude > 0 ? { x: vector.x / magnitude * strength, y: vector.y / magnitude * strength } : { x: 0, y: 0 };
    this.wake();
  }
  vector(): Point {
    if (!this.enabled || capturesInput(document.activeElement)) return { x: 0, y: 0 };
    if (this.pointer !== undefined) return this.stick;
    const key = (...names: string[]) => Number(names.some(name => this.keys.has(name)));
    return normalizeInput({ x: key('d','arrowright') - key('a','arrowleft'), y: key('s','arrowdown') - key('w','arrowup') });
  }
  private resetStick() {
    const pointer = this.pointer; this.pointer = undefined; this.stick = { x: 0, y: 0 };
    if (pointer !== undefined && this.zone.hasPointerCapture(pointer)) this.zone.releasePointerCapture(pointer);
    this.wake();
  }
  setEnabled(enabled:boolean) { this.enabled=enabled; this.reset(); }
  reset() { this.keys.clear(); this.resetStick(); }
  destroy() { this.controller.abort(); this.reset(); }
}
