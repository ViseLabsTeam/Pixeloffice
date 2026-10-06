# Assets de la oficina compuesta

El manifest `demo-v4` usa `legacy/pre-alpha/assets/images/ensambled/total-office.jpeg` como fondo único de 1600×900. `scripts/generate-demo-assets.mjs` lo copia sin modificar sus píxeles a `peredo/office-composite.jpeg` y reconstruye el mapa y sus hashes. No coloca muebles individuales encima de la composición.

También conserva cuatro PNG de reposo del avatar masculino y extrae diez cuadros PNG de sus cuatro GIF de movimiento. El avatar se dibuja a escala 2 y la caja de pies es independiente del sprite. Colliders, ventanas, oclusión e interacciones están en coordenadas de la imagen original dentro de `packages/contracts/data/demo-map.json`.

Regenerar desde la raíz con `node scripts/generate-demo-assets.mjs`; verificar con `npm run validate:assets`. Si se recibe el GIF oficial del tren en `legacy/pre-alpha/assets/gifs/train.gif`, el generador extrae sus cuadros y el renderer los recorta a las tres ventanas. Los sprites oficiales limpio/sucio del pizarrón siguen pendientes; la región limpia ya está en la composición y el estado marcado actual usa trazos temporales.

La imagen ensamblada no reemplaza el registro de origen, autoría y versión del arte. Consultar el [inventario](../../../../docs/assets.md) y el [contrato de assets](../../../../08_CONTRATO_ASSETS_Y_MAPAS.md).
