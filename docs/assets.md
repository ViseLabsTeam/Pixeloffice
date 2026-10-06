# Inventario de arte — entrega parcial

Revisado el 2026-10-05. Contrato vigente: [08](../08_CONTRATO_ASSETS_Y_MAPAS.md). Los tamaños se leyeron de los archivos locales; no acreditan por sí solos escala de mundo, transparencia, pivots ni aprobación visual.

## Entrega reciente recibida

Base de las rutas: `legacy/pre-alpha/assets/images/`. Estos quince archivos son la entrega reciente señalada por el usuario, aunque estén dentro de la carpeta legacy. Se conservan sus nombres originales durante la recepción.

| Ruta relativa | Dimensiones (px) | Bytes |
|---|---|---:|
| `floors/PISO-export.png` | 344 × 344 | 2685 |
| `furniture/chair/SILLA -X.png` | 133 × 150 | 1232 |
| `furniture/chair/SILLA -Y.png` | 133 × 150 | 1440 |
| `furniture/chair/SILLA X.png` | 133 × 150 | 1248 |
| `furniture/chair/SILLA Y.png` | 133 × 150 | 1230 |
| `furniture/table/escritorio -x.png` | 584 × 698 | 5490 |
| `furniture/table/escritorio -y.png` | 992 × 740 | 7018 |
| `furniture/table/escritorio x.png` | 554 × 722 | 5575 |
| `furniture/table/escritorio y.png` | 818 × 662 | 6477 |
| `sample/WhatsApp Image 2026-09-30 at 02.20.03.jpeg` | 1600 × 900 | 218891 |
| `avatar/man/avatar-hombre-X.png` | 45 × 66 | 154 |
| `avatar/man/avatar-hombreX.png` | 45 × 66 | 150 |
| `avatar/man/avatar-hombreY.png` | 45 × 66 | 165 |
| `avatar/man/avatar-hombre-Y.png` | 45 × 66 | 590 |
| `ensambled/total-office.jpeg` | 1600 × 900 | 215554 |

También se recibieron `legacy/pre-alpha/assets/gifs/avatar/man/avatar-hombre-X.gif`, `avatar-hombreX.gif`, `avatar-hombreY.gif` y `avatar-hombre-Y.gif`, todos de 45 × 66 píxeles. Sus secuencias tienen respectivamente 3, 3, 2 y 2 cuadros. Los PNG representan reposo y los GIF movimiento. `-X` corresponde a izquierda/A, `X` a derecha/D, `Y` a arriba/W y `-Y` a abajo/S.

La composición `total-office.jpeg` define ahora la distribución visible. Las piezas individuales de piso, sillas y escritorios permanecen como originales recibidos, pero no se colocan por separado en el mapa. El avatar conserva la correspondencia de direcciones indicada arriba.

## Paquete todavía incompleto

No se identificaron en esta entrega reciente exports nuevos para:

- GIF de paisaje con tren para las ventanas.
- Sprites del pizarrón limpio y sucio que coincidan con su perspectiva en la composición.
- Avatar femenino de cuatro vistas y máscaras/capas de ropa para ambos avatares.
- Arcade Snake, estación Pong e iconos de UI.
- Metadatos de escala, pivots, colliders, oclusión, acústica e interacción.
- Referencias de todas las escenas, fuentes editables disponibles y registro de autoría/versión.

Hay imágenes antiguas de computadora, planta, sillas y arcade en legacy; su existencia no las convierte en exports finales de esta entrega ni resuelve automáticamente estos faltantes.

## Estado de integración

El mapa actual `packages/contracts/data/demo-map.json` usa `demo-v4` y una escena de 1600×900. `scripts/generate-demo-assets.mjs` copia la composición JPEG sin alterar sus píxeles, conserva los cuatro PNG del avatar y extrae diez cuadros de sus GIF para el canvas. El avatar se dibuja a escala 2. Sus pies tienen una caja de 30×12 unidades independiente del sprite. Veinte colliders nombrados cubren límites, paredes, tabiques, bases de muebles, tableros y sillas; las zonas de interacción y oclusión están separadas. `?debug=colliders` permite revisar su alineación.

El manifest contiene 15 imágenes: la composición, cuatro PNG de reposo y diez cuadros de movimiento. El fondo ya contiene muebles y paredes; sus archivos individuales no se dibujan de nuevo. La región limpia del pizarrón forma parte del JPEG. El estado marcado usa trazos temporales recortados a su panel hasta recibir los sprites oficiales. Las tres regiones de ventana están definidas, pero el tren no se muestra porque su GIF todavía no figura entre los archivos entregados.

La integración final debe confirmar la geometría, las máscaras y el tamaño del avatar contra la composición original y un dispositivo físico. Dimensiones de archivo, unidades lógicas y tamaño CSS son conceptos distintos.

La autoría y versión de la entrega se registrarán con Peredo antes de cerrar aceptación de arte. El generador de assets provisionales seguirá separado para evitar sobrescribir los exports finales.
