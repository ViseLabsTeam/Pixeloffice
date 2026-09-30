import { SYNC_INTERVALS } from './config.js';
import { isValidPlayerSnapshot, playerSnapshot, state } from './state.js';

export class NetworkManager {
  constructor(ui) {
    this.ui = ui;
    this.connections = {};
    this.activeCalls = {};
    this.timers = new Set();
    this.targetRoom = new URLSearchParams(window.location.search).get('room');
    this.initBroadcastChannel();
    this.initPeerJS();
  }

  updateStatus(dotClass, text) {
    const dot = document.getElementById('net-status-dot');
    if (dot) dot.className = `w-2.5 h-2.5 rounded-full ${dotClass}`;
    const label = document.getElementById('net-status-text');
    if (label) label.textContent = text;
  }

  warn(message, error) {
    console.warn(message, error);
    this.updateStatus('bg-yellow-500', 'Conectividad limitada');
  }

  registerTimer(callback, delay) {
    const timer = window.setInterval(callback, delay);
    this.timers.add(timer);
    return timer;
  }

  initBroadcastChannel() {
    if (!('BroadcastChannel' in window)) return;
    try {
      this.channel = new BroadcastChannel('pixel_office_sync_net');
      this.channel.onmessage = ({ data }) => {
        if (typeof data?.senderId === 'string' && data.senderId !== this.myId && isValidPlayerSnapshot(data?.state)) {
          this.handleRemoteData(data.senderId, data.state);
        }
      };
      this.registerTimer(() => this.channel?.postMessage({ senderId: this.myId || 'local_user', state: playerSnapshot() }), SYNC_INTERVALS.local);
    } catch (error) {
      this.warn('BroadcastChannel no está disponible.', error);
    }
  }

  initPeerJS() {
    if (!window.Peer) {
      this.updateStatus('bg-green-500', 'Online (modo local)');
      return;
    }
    try {
      this.peer = new window.Peer({ host: '0.peerjs.com', port: 443, secure: true, debug: 0 });
      this.peer.on('open', (id) => this.handlePeerOpen(id));
      this.peer.on('connection', (connection) => this.handleDataConnection(connection));
      this.peer.on('call', (call) => this.handleCall(call));
      this.peer.on('error', (error) => this.recoverPeer(error));
    } catch (error) {
      this.warn('No se pudo inicializar la red P2P.', error);
    }
  }

  handlePeerOpen(id) {
    this.myId = id;
    if (!this.targetRoom) window.history.replaceState({}, '', `${window.location.pathname}?room=${id}`);
    const room = this.targetRoom || id;
    const roomLabel = document.getElementById('room-display');
    if (roomLabel) roomLabel.textContent = `Room: ${room.slice(0, 8)}...`;
    const invite = document.getElementById('invite-link');
    if (invite) invite.value = window.location.href;
    this.updateStatus('bg-green-500', 'Online (P2P activo)');
    if (this.targetRoom && this.targetRoom !== id) this.connectToPeer(this.targetRoom);
    this.registerTimer(() => this.broadcastP2PState(), SYNC_INTERVALS.peer);
  }

  recoverPeer(error) {
    this.warn('La conexión P2P se interrumpió; se reintentará.', error);
    window.setTimeout(() => {
      if (!this.peer || this.peer.destroyed) return this.initPeerJS();
      if (!this.peer.open) {
        try { this.peer.reconnect(); } catch (reconnectError) { this.warn('No fue posible reconectar PeerJS.', reconnectError); }
      }
    }, 4000);
  }

  connectToPeer(peerId, attempt = 1) {
    if (!this.peer || !peerId || this.peer.destroyed) return;
    try {
      const connection = this.peer.connect(peerId, { reliable: true });
      this.handleDataConnection(connection);
      window.setTimeout(() => {
        if (!connection.open && attempt < 12) this.connectToPeer(peerId, attempt + 1);
      }, 2500);
    } catch (error) {
      this.warn('No fue posible conectar a la sala.', error);
    }
  }

  handleDataConnection(connection) {
    connection.on('open', () => {
      this.connections[connection.peer] = connection;
      connection.send({ type: 'STATE', state: playerSnapshot() });
    });
    connection.on('data', (data) => {
      if (data?.type === 'STATE' && isValidPlayerSnapshot(data.state)) this.handleRemoteData(connection.peer, data.state);
    });
    const cleanup = () => {
      delete this.connections[connection.peer];
      delete state.players[connection.peer];
      this.ui.removePlayerVideoUI(connection.peer);
    };
    connection.on('close', cleanup);
    connection.on('error', cleanup);
  }

  handleRemoteData(senderId, snapshot) {
    const current = state.players[senderId];
    if (!current) {
      state.players[senderId] = { ...snapshot, currentX: snapshot.x, currentY: snapshot.y, lastUpdate: Date.now() };
      this.ui.createPlayerVideoUI(senderId);
      return;
    }
    Object.assign(current, snapshot, { lastUpdate: Date.now() });
  }

  handleCall(call) {
    this.activeCalls[call.peer] = call;
    call.answer(state.localStream || undefined);
    call.on('stream', (stream) => {
      if (call.metadata?.type === 'screen') this.ui.showScreenShare(stream);
      else {
        this.ui.createPlayerVideoUI(call.peer);
        this.ui.attachStreamToPeer(call.peer, stream);
        this.ui.setupAudioMeter(stream, call.peer);
      }
    });
  }

  broadcastP2PState() {
    const payload = { type: 'STATE', state: playerSnapshot() };
    Object.values(this.connections).forEach((connection) => {
      if (connection.open) connection.send(payload);
    });
  }

  callAll(stream, type) {
    if (!this.peer || this.peer.destroyed) return;
    Object.values(this.connections).forEach((connection) => {
      if (connection.open) this.peer.call(connection.peer, stream, { metadata: { type } });
    });
  }

  destroy() {
    this.timers.forEach((timer) => clearInterval(timer));
    this.channel?.close();
    Object.values(this.activeCalls).forEach((call) => call.close());
    Object.values(this.connections).forEach((connection) => connection.close());
    this.peer?.destroy();
  }
}
