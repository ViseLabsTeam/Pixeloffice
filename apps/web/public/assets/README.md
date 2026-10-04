# Assets del recorrido y entrega de arte v2

Los 17 PNG de `demo/` son formas originales dibujadas por código en `scripts/generate-demo-assets.mjs` para probar el motor. No representan la entrega de Peredo. Su fuente editable es el script; regenerar desde la raíz con `node scripts/generate-demo-assets.mjs` y comprobar con `npm run validate:assets`.

El script escribe también `packages/contracts/data/demo-map.json` con SHA-256, rectángulos, pivots, escala, collider y máscara independientes. Escena 640×400 y avatar 26×32 son dimensiones provisionales. «32 bits» expresa estilo y no fija tamaño de tile.

El collider del avatar se ubica en los pies. Collider y máscara de objeto usan coordenadas locales al pivot; `worldScale` escala ambos. `sortAnchorY` es un offset local escalado al transformar. Portales, superficies e interacción de puerta usan coordenadas de escena; las interacciones del asset son locales.

Las puertas locales recuperan `initiallyOpen` al reiniciar el recorrido. En la demo completa, puertas, chat, dibujo y partidas pertenecerán a la sesión temporal; la plantilla seguirá fija.

## Arte recibido y pendiente

La entrega reciente de piso, cuatro sillas, cuatro escritorios y referencia está en `legacy/pre-alpha/assets/images/`. Aún no se utiliza en el manifest. Consultar el [inventario de archivos y faltantes](../../../../docs/assets.md) y el [contrato 08](../../../../08_CONTRATO_ASSETS_Y_MAPAS.md).

Ese directorio mezcla material antiguo y la entrega reciente: no tratar todo su contenido como arte histórico descartado o como arte final aprobado. Conservar originales y registrar autoría, dimensiones, escala, pivots y geometría antes de producir exports estables.

V2-D02/V2-D03 y V2-V13 cubren plano, metadatos y aceptación de arte. Faltan piezas del paquete de prueba, máscaras y comprobación en un celular real. El esquema de prueba aún necesita ampliaciones para todas las interacciones, estados y bloqueos acústicos de 08.
