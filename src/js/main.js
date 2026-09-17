import { Game } from './game.js';
import { NetworkManager } from './network-manager.js';
import { SnakeGame } from './snake-game.js';
import { state } from './state.js';
import { UIManager } from './ui-manager.js';

let network;
const ui = new UIManager(() => network);
const snakeGame = new SnakeGame();
const game = new Game(ui, snakeGame);

function setJoysticks(enabled) {
  state.showJoysticks = enabled;
  document.getElementById('joystick-left').style.display = enabled ? 'block' : 'none';
  document.getElementById('btn-action-mobile').style.display = enabled ? 'flex' : 'none';
}

function setupSkinUploader(inputId, previewId, nameId) {
  const input = document.getElementById(inputId);
  input?.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;
    if (file.type !== 'image/png') {
      input.value = '';
      console.warn('El skin debe ser un archivo PNG.');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => console.warn('No se pudo leer el skin seleccionado.');
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => console.warn('El skin PNG no pudo cargarse.');
      image.onload = () => {
        state.customSkinDataUrl = String(reader.result);
        state.customSkinImage = image;
        const preview = document.getElementById(previewId);
        if (preview) {
          preview.src = state.customSkinDataUrl;
          preview.classList.remove('hidden');
        }
        const fileName = document.getElementById(nameId);
        if (fileName) fileName.textContent = file.name;
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

async function copyInvite() {
  const input = document.getElementById('invite-link');
  const button = document.getElementById('btn-copy-invite');
  if (!input || !button) return;
  try {
    await navigator.clipboard.writeText(input.value);
  } catch {
    input.select();
    document.execCommand('copy');
  }
  button.innerHTML = '<i class="fas fa-check text-green-400"></i>';
  window.setTimeout(() => { button.innerHTML = '<i class="fas fa-copy text-white"></i>'; }, 2000);
}

function setupProfile() {
  document.querySelectorAll('.color-option').forEach((option) => option.addEventListener('click', () => {
    document.querySelectorAll('.color-option').forEach((item) => item.classList.remove('selected'));
    option.classList.add('selected');
    state.playerColor = option.dataset.color;
  }));
  setupSkinUploader('welcome-skin-file', 'welcome-skin-preview', 'welcome-skin-name');
  setupSkinUploader('settings-skin-file');
  document.getElementById('settings-name-input').addEventListener('input', (event) => {
    state.playerName = event.target.value.trim() || 'Developer';
  });
}

function setupControls() {
  document.getElementById('btn-settings').addEventListener('click', () => document.getElementById('modal-settings').classList.add('active'));
  document.querySelectorAll('.close-modal').forEach((button) => button.addEventListener('click', () => document.getElementById('modal-settings').classList.remove('active')));
  document.getElementById('toggle-cam').addEventListener('click', () => ui.toggleCamera());
  document.getElementById('toggle-mic').addEventListener('click', () => ui.toggleMic());
  document.getElementById('toggle-screen').addEventListener('click', () => ui.toggleScreen());
  document.getElementById('toggle-joystick').addEventListener('change', (event) => setJoysticks(event.target.checked));
  document.getElementById('btn-copy-invite').addEventListener('click', copyInvite);
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.getElementById('toggle-joystick').checked = true;
    setJoysticks(true);
  }
}

function enterOffice() {
  const name = document.getElementById('welcome-name').value.trim();
  if (name) state.playerName = name;
  document.getElementById('settings-name-input').value = state.playerName;
  document.getElementById('modal-welcome').classList.remove('active');
  network = new NetworkManager(ui);
  game.start();
}

setupProfile();
setupControls();
document.getElementById('btn-enter-office').addEventListener('click', enterOffice);
window.addEventListener('pagehide', () => {
  network?.destroy();
  ui.destroy();
});
