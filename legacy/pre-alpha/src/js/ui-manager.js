import { TILE_SIZE } from './config.js';
import { state } from './state.js';

const icons = {
  cameraOn: '<i class="fas fa-video text-2xl mb-2 text-green-400"></i><span class="text-sm text-white">Camera On</span>',
  cameraOff: '<i class="fas fa-video-slash text-2xl mb-2 text-red-400"></i><span class="text-sm text-red-400">Camera Off</span>',
  micOn: '<i class="fas fa-microphone text-2xl mb-2 text-green-400"></i><span class="text-sm text-white">Mic On</span>',
  micOff: '<i class="fas fa-microphone-slash text-2xl mb-2 text-red-400"></i><span class="text-sm text-red-400">Mic Off</span>',
  share: '<i class="fas fa-desktop mr-2"></i> Share Screen',
  stopShare: '<i class="fas fa-times-circle mr-2"></i> Stop Sharing'
};

export class UIManager {
  constructor(networkProvider) {
    this.networkProvider = networkProvider;
    this.videoLayer = document.getElementById('video-layer');
    this.screenShareContainer = document.getElementById('screenshare-container');
    this.screenShareVideo = document.getElementById('screenshare-video');
    this.audioContexts = new Map();
    this.bindDragging();
    document.getElementById('close-screenshare')?.addEventListener('click', () => this.stopScreenShare());
    document.getElementById('screenshare-handle')?.addEventListener('mousedown', (event) => this.startDrag(event, this.screenShareContainer));
    document.getElementById('screenshare-resize-bl')?.addEventListener('mousedown', (event) => this.startResize(event, this.screenShareContainer));
  }

  bindDragging() {
    document.addEventListener('mousemove', (event) => {
      if (this.resizingElement) this.resize(event);
      else if (this.draggedElement) this.drag(event);
    });
    document.addEventListener('mouseup', () => {
      this.draggedElement = null;
      this.resizingElement = null;
    });
  }

  setButton(id, content) {
    const button = document.getElementById(id);
    if (button) button.innerHTML = content;
  }

  async toggleCamera() {
    state.camEnabled = !state.camEnabled;
    if (!state.camEnabled) {
      this.stopLocalTrack('video');
      this.setButton('toggle-cam', icons.cameraOff);
      return;
    }
    try {
      this.handleNewLocalStream(await navigator.mediaDevices.getUserMedia({ video: true, audio: state.micEnabled }));
      this.setButton('toggle-cam', icons.cameraOn);
    } catch (error) {
      state.camEnabled = false;
      this.setButton('toggle-cam', icons.cameraOff);
      console.warn('No fue posible activar la cámara.', error);
    }
  }

  async toggleMic() {
    state.micEnabled = !state.micEnabled;
    if (!state.micEnabled) {
      this.stopLocalTrack('audio');
      this.setButton('toggle-mic', icons.micOff);
      return;
    }
    try {
      this.handleNewLocalStream(await navigator.mediaDevices.getUserMedia({ audio: true, video: state.camEnabled }));
      this.setButton('toggle-mic', icons.micOn);
    } catch (error) {
      state.micEnabled = false;
      this.setButton('toggle-mic', icons.micOff);
      console.warn('No fue posible activar el micrófono.', error);
    }
  }

  async toggleScreen() {
    if (state.screenEnabled) return this.stopScreenShare();
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      state.screenEnabled = true;
      state.localScreenStream = stream;
      this.networkProvider()?.callAll(stream, 'screen');
      this.showScreenShare(stream);
      this.setButton('toggle-screen', icons.stopShare);
      stream.getVideoTracks()[0].onended = () => this.stopScreenShare();
    } catch (error) {
      state.screenEnabled = false;
      console.warn('No fue posible compartir la pantalla.', error);
    }
  }

  stopScreenShare() {
    state.localScreenStream?.getTracks().forEach((track) => track.stop());
    state.localScreenStream = null;
    state.screenEnabled = false;
    this.screenShareVideo.srcObject = null;
    this.screenShareContainer?.classList.remove('active', 'is-popup');
    this.setButton('toggle-screen', icons.share);
  }

  handleNewLocalStream(newStream) {
    this.createPlayerVideoUI('local');
    if (!state.localStream) state.localStream = newStream;
    else newStream.getTracks().forEach((track) => {
      const prior = state.localStream.getTracks().find((item) => item.kind === track.kind);
      if (prior) {
        state.localStream.removeTrack(prior);
        prior.stop();
      }
      state.localStream.addTrack(track);
    });
    this.attachStreamToPeer('local', state.localStream);
    this.setupAudioMeter(state.localStream, 'local');
    this.networkProvider()?.callAll(state.localStream, 'camera');
  }

  stopLocalTrack(kind) {
    const track = state.localStream?.getTracks().find((item) => item.kind === kind);
    if (!track) return;
    track.stop();
    state.localStream.removeTrack(track);
    if (kind === 'audio') {
      this.audioContexts.get('local')?.close();
      this.audioContexts.delete('local');
    }
    if (!state.localStream.getTracks().length) document.getElementById('vid-container-local')?.classList.remove('active-stream');
  }

  setupAudioMeter(stream, peerId) {
    if (!stream?.getAudioTracks().length || this.audioContexts.has(peerId)) return;
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = context.createAnalyser();
      context.createMediaStreamSource(stream).connect(analyser);
      analyser.fftSize = 256;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const poll = () => {
        const indicator = document.getElementById(`audio-indicator-${this.safeId(peerId)}`);
        if (!indicator) return;
        requestAnimationFrame(poll);
        analyser.getByteFrequencyData(data);
        const average = data.reduce((total, value) => total + value, 0) / data.length;
        indicator.classList.toggle('active', average > 15);
      };
      this.audioContexts.set(peerId, context);
      poll();
    } catch (error) {
      console.warn('No fue posible medir el audio.', error);
    }
  }

  safeId(id) {
    return String(id).replace(/[^a-zA-Z0-9]/g, '_');
  }

  createPlayerVideoUI(id) {
    const safeId = this.safeId(id);
    if (document.getElementById(`vid-container-${safeId}`)) return;
    const container = document.createElement('div');
    container.id = `vid-container-${safeId}`;
    container.className = 'video-container';
    const header = document.createElement('div');
    header.className = 'drag-handle';
    const title = document.createElement('span');
    title.textContent = id === 'local' ? 'You' : 'Peer';
    const closeButton = document.createElement('button');
    closeButton.className = 'close-popup text-gray-400 hover:text-red-400 transition cursor-pointer p-1';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Cerrar vídeo');
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    header.append(title, closeButton);
    const wrapper = document.createElement('div');
    wrapper.className = 'video-wrapper';
    const video = document.createElement('video');
    video.id = `video-${safeId}`;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = id === 'local';
    const indicator = document.createElement('div');
    indicator.id = `audio-indicator-${safeId}`;
    indicator.className = 'audio-indicator';
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle-bl';
    wrapper.append(video, indicator);
    container.append(header, wrapper, resizeHandle);
    this.videoLayer?.appendChild(container);
    header.addEventListener('mousedown', (event) => {
      if (!event.target.closest('.close-popup')) this.startDrag(event, container);
    });
    closeButton.addEventListener('click', () => this.resetPopup(container));
    resizeHandle.addEventListener('mousedown', (event) => this.startResize(event, container));
    wrapper.addEventListener('click', () => {
      if (!container.classList.contains('is-popup')) this.openPopup(container);
    });
  }

  resetPopup(container) {
    container.classList.remove('is-popup');
    Object.assign(container.style, { width: '', height: '', left: '', top: '', transform: '' });
  }

  openPopup(container) {
    container.classList.add('is-popup');
    Object.assign(container.style, { left: `${window.innerWidth / 2 - 120}px`, top: `${window.innerHeight / 2 - 100}px` });
  }

  removePlayerVideoUI(id) {
    const safeId = this.safeId(id);
    this.audioContexts.get(id)?.close();
    this.audioContexts.delete(id);
    document.getElementById(`vid-container-${safeId}`)?.remove();
  }

  attachStreamToPeer(id, stream) {
    const safeId = this.safeId(id);
    const video = document.getElementById(`video-${safeId}`);
    if (video) video.srcObject = stream;
    document.getElementById(`vid-container-${safeId}`)?.classList.add('active-stream');
  }

  showScreenShare(stream) {
    this.screenShareContainer?.classList.add('active', 'is-popup');
    if (this.screenShareVideo) this.screenShareVideo.srcObject = stream;
  }

  updateVideoPositions(offset, scale) {
    this.positionVideo('local', state.x, state.y, offset, scale);
    Object.entries(state.players).forEach(([id, player]) => this.positionVideo(id, player.currentX, player.currentY, offset, scale));
  }

  positionVideo(id, worldX, worldY, offset, scale) {
    const element = document.getElementById(`vid-container-${this.safeId(id)}`);
    if (!element || element.classList.contains('is-popup') || !element.classList.contains('active-stream')) return;
    element.style.left = `${offset.x + (worldX + TILE_SIZE / 2) * scale}px`;
    element.style.top = `${offset.y + (worldY - 10) * scale}px`;
  }

  startDrag(event, element) {
    if (!element) return;
    this.draggedElement = element;
    this.dragStart = { x: event.clientX - element.offsetLeft, y: event.clientY - element.offsetTop };
  }

  drag(event) {
    event.preventDefault();
    Object.assign(this.draggedElement.style, { transform: 'none', left: `${event.clientX - this.dragStart.x}px`, top: `${event.clientY - this.dragStart.y}px` });
  }

  startResize(event, element) {
    if (!element) return;
    event.stopPropagation();
    const rect = element.getBoundingClientRect();
    this.resizingElement = element;
    this.resizeData = { x: event.clientX, y: event.clientY, width: rect.width, height: rect.height, left: element.offsetLeft };
  }

  resize(event) {
    event.preventDefault();
    const dx = event.clientX - this.resizeData.x;
    Object.assign(this.resizingElement.style, {
      width: `${Math.max(150, this.resizeData.width - dx)}px`,
      height: `${Math.max(120, this.resizeData.height + event.clientY - this.resizeData.y)}px`,
      left: `${this.resizeData.left + dx}px`
    });
  }

  destroy() {
    this.stopScreenShare();
    state.localStream?.getTracks().forEach((track) => track.stop());
    this.audioContexts.forEach((context) => context.close());
    this.audioContexts.clear();
  }
}
