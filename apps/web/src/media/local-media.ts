type Device = 'camera' | 'microphone';

const labels: Record<Device, string> = { camera: 'cámara', microphone: 'micrófono' };

export class LocalMedia {
  private readonly controller = new AbortController();
  private readonly tracks: Partial<Record<Device, MediaStreamTrack>> = {};
  private readonly desired: Record<Device, boolean> = { camera: false, microphone: false };
  private readonly requestIds: Record<Device, number> = { camera: 0, microphone: 0 };
  private readonly pending: Record<Device, boolean> = { camera: false, microphone: false };
  private destroyed = false;

  constructor(
    private readonly buttons: Record<Device, HTMLButtonElement>,
    private readonly preview: HTMLVideoElement,
    private readonly placeholder: HTMLElement,
    private readonly status: HTMLElement
  ) {
    for (const device of ['camera', 'microphone'] as const) {
      buttons[device].addEventListener('click', () => { void this.toggle(device); }, { signal: this.controller.signal });
    }
    this.render();
  }

  private message(value: string, error = false) {
    this.status.textContent = value;
    this.status.dataset.error = String(error);
  }

  private render() {
    for (const device of ['camera', 'microphone'] as const) {
      const active = this.tracks[device]?.readyState === 'live';
      const button = this.buttons[device];
      button.disabled = this.destroyed;
      button.dataset.state = active ? 'on' : this.desired[device] && this.pending[device] ? 'requesting' : 'off';
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? `Apagar ${labels[device]}` : this.desired[device] && this.pending[device]
        ? `Cancelar ${labels[device]}` : `Activar ${labels[device]}`;
    }
    const cameraOn = this.tracks.camera?.readyState === 'live';
    this.preview.hidden = !cameraOn;
    this.placeholder.hidden = cameraOn;
  }

  private stop(device: Device) {
    const track = this.tracks[device];
    delete this.tracks[device];
    if (track) track.stop();
    if (device === 'camera') {
      this.preview.pause();
      this.preview.srcObject = null;
    }
  }

  private errorMessage(device: Device, error: unknown): string {
    const name = error instanceof DOMException ? error.name : '';
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') return `Permiso de ${labels[device]} denegado. Podés seguir usando la oficina.`;
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return `No se encontró ${device === 'camera' ? 'una cámara' : 'un micrófono'} disponible.`;
    if (name === 'NotReadableError' || name === 'TrackStartError') return `No se pudo iniciar el ${labels[device]}; podría estar en uso por otra aplicación.`;
    return `No se pudo activar el ${labels[device]}. Revisá los permisos del navegador.`;
  }

  async toggle(device: Device): Promise<void> {
    if (this.destroyed) return;
    const requestId = ++this.requestIds[device];
    if (this.desired[device]) {
      this.desired[device] = false;
      this.pending[device] = false;
      this.stop(device);
      this.message(`${device === 'camera' ? 'Cámara apagada' : 'Micrófono apagado'}.`);
      this.render();
      return;
    }
    this.desired[device] = true;
    this.pending[device] = true;
    this.message(`Solicitando permiso para ${labels[device]}…`);
    this.render();
    if (!navigator.mediaDevices?.getUserMedia) {
      this.desired[device] = false;
      this.pending[device] = false;
      this.message('La cámara y el micrófono requieren HTTPS o localhost y un navegador compatible.', true);
      this.render();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia(device === 'camera'
        ? { video: true, audio: false } : { video: false, audio: true });
      const track = device === 'camera' ? stream.getVideoTracks()[0] : stream.getAudioTracks()[0];
      for (const extra of stream.getTracks()) if (extra !== track) extra.stop();
      if (!track || track.readyState !== 'live') {
        stream.getTracks().forEach(item => item.stop());
        throw new Error('No live media track');
      }
      if (this.destroyed || requestId !== this.requestIds[device] || !this.desired[device]) {
        track.stop();
        return;
      }
      this.tracks[device] = track;
      track.addEventListener('ended', () => {
        if (this.tracks[device] !== track) return;
        this.stop(device);
        this.desired[device] = false;
        this.message(`El ${labels[device]} se desconectó.`);
        this.render();
      }, { once: true });
      if (device === 'camera') {
        this.preview.srcObject = new MediaStream([track]);
        void this.preview.play().catch(() => {
          if (!this.destroyed && this.tracks.camera === track) this.message('Cámara encendida; no se pudo iniciar la vista previa.', true);
        });
      }
      this.message(`${device === 'camera' ? 'Cámara encendida' : 'Micrófono encendido'}. Vista local; todavía no se transmite a otras personas.`);
    } catch (error) {
      if (requestId === this.requestIds[device] && !this.destroyed) {
        this.stop(device);
        this.desired[device] = false;
        this.message(this.errorMessage(device, error), true);
      }
    } finally {
      if (requestId === this.requestIds[device]) this.pending[device] = false;
      if (!this.destroyed) this.render();
    }
  }

  stopAll() {
    for (const device of ['camera', 'microphone'] as const) {
      this.requestIds[device]++;
      this.desired[device] = false;
      this.pending[device] = false;
      this.stop(device);
    }
    this.message('Cámara y micrófono apagados.');
    this.render();
  }

  destroy() {
    if (this.destroyed) return;
    this.stopAll();
    this.destroyed = true;
    this.controller.abort();
    this.render();
  }
}
