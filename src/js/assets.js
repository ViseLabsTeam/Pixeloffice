import { ASSET_PATHS } from './config.js';

export function loadAssets() {
  const assets = { loaded: {} };
  Object.entries(ASSET_PATHS).forEach(([name, path]) => {
    const image = new Image();
    assets[name] = image;
    assets.loaded[name] = false;
    image.onload = () => { assets.loaded[name] = true; };
    image.onerror = () => console.warn(`No se pudo cargar el recurso: ${path}`);
    image.src = path;
  });
  return assets;
}
