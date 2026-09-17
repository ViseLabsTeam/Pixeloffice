import { TILE_SIZE } from './config.js';

export const state = {
  x: 14 * TILE_SIZE,
  y: 7 * TILE_SIZE,
  dir: 'down',
  isMoving: false,
  playerColor: '#3b82f6',
  playerName: 'Developer',
  customSkinDataUrl: null,
  customSkinImage: null,
  isSitting: false,
  preSitX: 14 * TILE_SIZE,
  preSitY: 7 * TILE_SIZE,
  camEnabled: false,
  micEnabled: false,
  screenEnabled: false,
  localStream: null,
  localScreenStream: null,
  showJoysticks: false,
  players: {}
};

export function playerSnapshot() {
  const { x, y, dir, isMoving, isSitting, playerColor, playerName, customSkinDataUrl } = state;
  return { x, y, dir, isMoving, isSitting, playerColor, name: playerName, skinDataUrl: customSkinDataUrl };
}

export function isValidPlayerSnapshot(candidate) {
  return candidate && Number.isFinite(candidate.x) && Number.isFinite(candidate.y)
    && ['up', 'down', 'left', 'right'].includes(candidate.dir)
    && typeof candidate.name === 'string' && typeof candidate.playerColor === 'string';
}
