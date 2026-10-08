# Assets de la oficina compuesta

El manifest `demo-v5` usa `legacy/pre-alpha/assets/images/ensambled/SIN MUEBLESL.png` como fondo de 1920×1080. `scripts/generate-demo-assets.mjs` copia el fondo y los PNG de tres escritorios, tres sillas y una planta sin modificar sus píxeles y reconstruye el mapa y sus hashes. Las posiciones y geometrías editables están en `scripts/office-layout.mjs`.

También conserva cuatro PNG de reposo del avatar masculino y extrae diez cuadros PNG de sus cuatro GIF de movimiento. El avatar se dibuja a escala 2 y la caja de pies es independiente del sprite. Colliders, ventanas, profundidad e interacciones están en coordenadas de la imagen original dentro de `packages/contracts/data/demo-map.json`.

Regenerar desde la raíz con `node scripts/generate-demo-assets.mjs`; verificar con `npm run validate:assets`. El GIF oficial `legacy/pre-alpha/assets/gifs/train/Tren .gif` se convierte en 88 cuadros PNG de 156×156 para las tres ventanas. El tren pasa por las ventanas de derecha a izquierda, con 15 segundos de espera entre cada una. `PIZARRA-clear.png` y `PIZARRA-dirty.png` se copian como `board-clean.png` y `board-dirty.png`; el renderer los refleja horizontalmente y E alterna entre dibujar y borrar.

La imagen ensamblada no reemplaza el registro de origen, autoría y versión del arte. Consultar el [inventario](../../../../docs/assets.md) y el [contrato de assets](../../../../08_CONTRATO_ASSETS_Y_MAPAS.md).
