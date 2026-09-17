import { EXTERNAL_LINKS, SYNC_INTERVALS, TILE_SIZE, TILES } from './config.js';
import { loadAssets } from './assets.js';
import { getTile, mapData } from './map.js';
import { state } from './state.js';

export class Game {
  constructor(ui, snakeGame) {
    this.ui = ui;
    this.snakeGame = snakeGame;
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.assets = loadAssets();
    this.keys = { w: false, a: false, s: false, d: false, arrowup: false, arrowdown: false, arrowleft: false, arrowright: false };
    this.joystick = { x: 0, y: 0 };
    this.offset = { x: 0, y: 0 };
    this.scale = 1;
    this.remoteSkins = {};
    this.bindInput();
    window.addEventListener('resize', () => this.resize());
  }

  start() {
    this.resize();
    requestAnimationFrame(() => this.loop());
  }

  bindInput() {
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (Object.hasOwn(this.keys, key)) this.keys[key] = true;
      if (key === 'e') this.handleAction();
    });
    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      if (Object.hasOwn(this.keys, key)) this.keys[key] = false;
    });
    const zone = document.getElementById('joystick-left');
    const knob = document.getElementById('joystick-knob');
    let active = false;
    let center = { x: 0, y: 0 };
    const update = (touch) => {
      const dx = touch.clientX - center.x;
      const dy = touch.clientY - center.y;
      const distance = Math.min(Math.hypot(dx, dy), 40);
      const angle = Math.atan2(dy, dx);
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      this.joystick = { x: Math.abs(x) > 10 ? Math.sign(x) : 0, y: Math.abs(y) > 10 ? Math.sign(y) : 0 };
    };
    zone?.addEventListener('touchstart', (event) => {
      active = true;
      const bounds = zone.getBoundingClientRect();
      center = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
      update(event.touches[0]);
    }, { passive: false });
    zone?.addEventListener('touchmove', (event) => {
      if (active) {
        event.preventDefault();
        update(event.touches[0]);
      }
    }, { passive: false });
    zone?.addEventListener('touchend', () => {
      active = false;
      this.joystick = { x: 0, y: 0 };
      knob.style.transform = 'translate(-50%, -50%)';
    });
    document.getElementById('btn-action-mobile')?.addEventListener('touchstart', (event) => {
      event.preventDefault();
      this.handleAction();
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    const width = mapData[0].length * TILE_SIZE;
    const height = mapData.length * TILE_SIZE;
    this.scale = Math.min(3, Math.max(1, Math.min(this.canvas.width / width, this.canvas.height / height) * 0.9));
    this.offset.x = (this.canvas.width - width * this.scale) / 2;
    this.offset.y = (this.canvas.height - height * this.scale) / 2;
  }

  checkCollision(x, y) {
    const padding = 6;
    const points = [[x + padding, y + padding + 16], [x + TILE_SIZE - padding, y + padding + 16], [x + padding, y + TILE_SIZE], [x + TILE_SIZE - padding, y + TILE_SIZE]];
    const solid = [TILES.WALL, TILES.DESK, TILES.CHAIR, TILES.ARCADE, TILES.SERVER_RACK, TILES.PLANT, TILES.DOOR_CLOSED];
    return points.some(([pointX, pointY]) => solid.includes(getTile(pointX, pointY)));
  }

  facingTile() {
    let x = state.x + TILE_SIZE / 2;
    let y = state.y + TILE_SIZE / 2;
    if (state.dir === 'up') y -= TILE_SIZE;
    if (state.dir === 'down') y += TILE_SIZE;
    if (state.dir === 'left') x -= TILE_SIZE;
    if (state.dir === 'right') x += TILE_SIZE;
    return { x: Math.floor(x / TILE_SIZE), y: Math.floor(y / TILE_SIZE), type: getTile(x, y) };
  }

  openUrl(url) {
    const windowReference = window.open(url, '_blank', 'noopener,noreferrer');
    if (!windowReference) window.location.assign(url);
  }

  handleAction() {
    if (state.isSitting) {
      Object.assign(state, { isSitting: false, x: state.preSitX, y: state.preSitY });
      return;
    }
    const target = this.facingTile();
    if (target.type === TILES.CHAIR) {
      Object.assign(state, { preSitX: state.x, preSitY: state.y, isSitting: true, x: target.x * TILE_SIZE, y: target.y * TILE_SIZE - 8 });
    } else if (target.type === TILES.DESK) this.openUrl(EXTERNAL_LINKS.documents);
    else if (target.type === TILES.SERVER_RACK) this.openUrl(EXTERNAL_LINKS.drive);
    else if (target.type === TILES.ARCADE) {
      document.getElementById('modal-snake')?.classList.add('active');
      this.snakeGame.start();
    } else if ([TILES.DOOR_CLOSED, TILES.DOOR_OPEN].includes(target.type)) {
      mapData[target.y][target.x] = target.type === TILES.DOOR_CLOSED ? TILES.DOOR_OPEN : TILES.DOOR_CLOSED;
    }
  }

  updatePlayer() {
    const speed = 3;
    let dx = (this.keys.d || this.keys.arrowright ? speed : 0) - (this.keys.a || this.keys.arrowleft ? speed : 0);
    let dy = (this.keys.s || this.keys.arrowdown ? speed : 0) - (this.keys.w || this.keys.arrowup ? speed : 0);
    if (this.joystick.x) dx = this.joystick.x * speed;
    if (this.joystick.y) dy = this.joystick.y * speed;
    let moving = dx !== 0 || dy !== 0;
    if (state.isSitting && moving) {
      Object.assign(state, { isSitting: false, x: state.preSitX, y: state.preSitY });
      dx = 0;
      dy = 0;
      moving = false;
    }
    if (moving) {
      state.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      if (!this.checkCollision(state.x + dx, state.y)) state.x += dx;
      if (!this.checkCollision(state.x, state.y + dy)) state.y += dy;
    }
    state.isMoving = moving;
  }

  updateHint() {
    const hint = document.getElementById('interaction-hint');
    if (!hint) return;
    if (state.isSitting) {
      hint.textContent = 'Press [E] to Stand';
      hint.classList.remove('hidden');
      return;
    }
    const actions = {
      [TILES.DESK]: 'Work (Google Docs)', [TILES.CHAIR]: 'Sit', [TILES.ARCADE]: 'Play Arcade',
      [TILES.DOOR_CLOSED]: 'Open Door', [TILES.DOOR_OPEN]: 'Close Door', [TILES.SERVER_RACK]: 'Access Google Drive'
    };
    const action = actions[this.facingTile().type];
    hint.classList.toggle('hidden', !action);
    if (action) hint.textContent = `Press [E] to ${action}`;
  }

  drawMap() {
    for (let y = 0; y < mapData.length; y += 1) for (let x = 0; x < mapData[y].length; x += 1) {
      const tile = mapData[y][x];
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;
      if (tile === TILES.WALL) {
        this.ctx.fillStyle = '#1f2937'; this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        this.ctx.fillStyle = '#374151'; this.ctx.fillRect(px, py, TILE_SIZE, 4);
      } else if (tile === TILES.MEETING_FLOOR || (tile === TILES.CHAIR && y < 7 && x < 8)) {
        this.ctx.fillStyle = (x + y) % 2 ? '#b45309' : '#d97706'; this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      } else if (tile === TILES.OFFICE_FLOOR || (tile === TILES.DESK && x < 8 && y > 8) || (tile === TILES.CHAIR && x < 8 && y > 8)) {
        this.ctx.fillStyle = '#6b7280'; this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      } else if (tile === TILES.COMMON_FLOOR || tile === TILES.PLANT) {
        if (this.assets.loaded.parquet) this.ctx.drawImage(this.assets.parquet, px, py, TILE_SIZE, TILE_SIZE);
        else { this.ctx.fillStyle = (x + y) % 2 ? '#d1d5db' : '#e5e7eb'; this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE); }
      } else if (tile === TILES.SERVER_FLOOR || tile === TILES.SERVER_RACK) {
        this.ctx.fillStyle = '#111827'; this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      } else if (tile === TILES.BREAK_FLOOR || tile === TILES.ARCADE) {
        this.ctx.fillStyle = (x + y) % 2 ? '#fff' : '#ef4444'; this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      } else if (tile === TILES.DOOR_CLOSED) {
        this.ctx.fillStyle = '#78350f'; this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        this.ctx.fillStyle = '#92400e'; this.ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      } else if (tile === TILES.DOOR_OPEN) {
        this.ctx.fillStyle = '#e5e7eb'; this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        this.ctx.fillStyle = '#78350f'; this.ctx.fillRect(px, py, 6, TILE_SIZE);
      }
      this.drawFurniture(tile, px, py);
    }
  }

  drawFurniture(tile, px, py) {
    if (tile === TILES.DESK) {
      this.ctx.fillStyle = '#8b5a2b'; this.ctx.fillRect(px + 2, py + 12, TILE_SIZE - 4, TILE_SIZE - 12);
      this.ctx.fillStyle = '#5c4033'; this.ctx.fillRect(px + 2, py + 12, TILE_SIZE - 4, 4);
      if (this.assets.loaded.pc) this.ctx.drawImage(this.assets.pc, px - 2, py - 12, 36, 36);
    } else if (tile === TILES.CHAIR) {
      this.ctx.fillStyle = '#dc2626'; this.ctx.fillRect(px + 8, py + 8, 16, 16);
      this.ctx.fillStyle = '#991b1b'; this.ctx.fillRect(px + 8, py + 8, 16, 4);
    } else if (tile === TILES.ARCADE && this.assets.loaded.arcade) this.ctx.drawImage(this.assets.arcade, px - 4, py - 16, 40, 48);
    else if (tile === TILES.SERVER_RACK) {
      this.ctx.fillStyle = '#1f2937'; this.ctx.fillRect(px + 4, py, 24, TILE_SIZE);
      this.ctx.fillStyle = '#22c55e'; this.ctx.fillRect(px + 6, py + 4, 4, 4);
    } else if (tile === TILES.PLANT && this.assets.loaded.plant) this.ctx.drawImage(this.assets.plant, px - 2, py - 12, 36, 44);
  }

  skinImage(id, dataUrl) {
    if (!dataUrl) return null;
    if (!this.remoteSkins[id]) this.remoteSkins[id] = new Image();
    if (this.remoteSkins[id].src !== dataUrl) this.remoteSkins[id].src = dataUrl;
    return this.remoteSkins[id];
  }

  drawAvatar(player) {
    const { x, y, dir, isMoving, isSitting, playerColor, name, skinImage } = player;
    const bob = isMoving ? Math.sin(Date.now() / 120) * 3 : 0;
    this.ctx.save();
    this.ctx.translate(x, y);
    if (skinImage?.complete && skinImage.naturalWidth > 0) this.ctx.drawImage(skinImage, 0, (isSitting ? 4 : -4) + bob, 32, 32);
    else {
      this.ctx.fillStyle = playerColor || '#3b82f6'; this.ctx.fillRect(6, (isSitting ? 14 : 10) + bob, 20, isSitting ? 14 : 20);
      this.ctx.fillStyle = '#fde68a'; this.ctx.fillRect(8, (isSitting ? 4 : -2) + bob, 16, 14);
      this.ctx.fillStyle = '#1f2937'; this.ctx.fillRect(8, (isSitting ? 2 : -4) + bob, 16, 5);
    }
    this.ctx.fillStyle = 'rgb(0 0 0 / 70%)'; this.ctx.beginPath(); this.ctx.roundRect(-4, -22, 40, 14, 4); this.ctx.fill();
    this.ctx.fillStyle = '#fff'; this.ctx.font = '8px Inter'; this.ctx.textAlign = 'center'; this.ctx.fillText((name || 'User').slice(0, 10), 16, -12);
    this.ctx.restore();
  }

  loop() {
    this.updatePlayer();
    this.updateHint();
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.offset.x, this.offset.y);
    this.ctx.scale(this.scale, this.scale);
    this.drawMap();
    const now = Date.now();
    const players = [{ ...state, name: state.playerName, skinImage: state.customSkinImage }];
    Object.entries(state.players).forEach(([id, player]) => {
      if (now - player.lastUpdate > SYNC_INTERVALS.stalePlayer) return;
      player.currentX += (player.x - player.currentX) * 0.25;
      player.currentY += (player.y - player.currentY) * 0.25;
      players.push({ ...player, x: player.currentX, y: player.currentY, skinImage: this.skinImage(id, player.skinDataUrl) });
    });
    players.sort((first, second) => first.y - second.y).forEach((player) => this.drawAvatar(player));
    this.ctx.restore();
    this.ui.updateVideoPositions(this.offset, this.scale);
    requestAnimationFrame(() => this.loop());
  }
}
