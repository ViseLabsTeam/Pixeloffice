# Arte provisional demo-v1

Los 17 PNG de `demo/` son formas originales dibujadas por código en `scripts/generate-demo-assets.mjs` para este proyecto. No proceden de packs externos ni representan la entrega de Peredo. Su fuente editable es ese script; regenerar con `node scripts/generate-demo-assets.mjs` y validar con `npm run validate:assets`.

El script escribe también `packages/contracts/data/demo-map.json` con SHA-256, rectángulos, pivots, escala, collider y máscara independientes. Escena 640×400 y avatar 26×32 son elecciones provisionales para comprobar la mecánica; «32 bits» no se interpreta como tamaño de tile.

El collider del avatar se ubica en los pies. Collider y máscara de objeto están en coordenadas locales al pivot; `worldScale` escala ambos. `sortAnchorY` es un offset local, escalado al transformar. Las áreas de portales, superficies e interacción de puerta son coordenadas de escena. Las interacciones del asset son locales.

Los estados de puerta pertenecen al mundo temporal; un reinicio del recorrido restablece `initiallyOpen`. No se incluyen skins arbitrarios ni contenido base64. Los recursos antiguos se preservan en `legacy/pre-alpha/assets`; su autoría/licencia no fue acreditada, por lo que no se incorporan a este catálogo.

Pendiente D-10/SP-03: referencia y exports separados de Peredo, licencia de uso, medidas definitivas, comparación de composición y prueba portrait/landscape real. El catálogo provisional no es arte aprobado para comercializar.
