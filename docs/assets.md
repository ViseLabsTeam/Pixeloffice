# Inventario de arte — entrega parcial

Revisado el 2026-10-05. Contrato vigente: [08](../08_CONTRATO_ASSETS_Y_MAPAS.md). Los tamaños se leyeron de los archivos locales; no acreditan por sí solos escala de mundo, transparencia, pivots ni aprobación visual.

## Entrega reciente recibida

Base de las rutas: `legacy/pre-alpha/assets/images/`. Estos catorce archivos son la entrega reciente señalada por el usuario, aunque estén dentro de la carpeta legacy. Se conservan sus nombres originales durante la recepción.

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

También se recibieron `legacy/pre-alpha/assets/gifs/avatar/man/avatar-hombre-X.gif`, `avatar-hombreX.gif`, `avatar-hombreY.gif` y `avatar-hombre-Y.gif`, todos de 45 × 66 píxeles. Sus secuencias tienen respectivamente 3, 3, 2 y 2 cuadros. Los PNG representan reposo y los GIF movimiento. `-X` corresponde a izquierda/A, `X` a derecha/D, `Y` a arriba/W y `-Y` a abajo/S.

Las orientaciones X/Y se mantienen tal como fueron entregadas; no equivalen automáticamente a las direcciones del motor. Los escritorios tienen lienzos de dimensiones diferentes. El mapa actual usa las cuatro orientaciones en posiciones fijas, con escala de mundo 0.18 y pivots de apoyo elegidos a partir del área visible; esos valores deben contrastarse con la escena final de Peredo.

## Paquete todavía incompleto

No se identificaron en esta entrega reciente exports nuevos para:

- Paredes independientes y puertas abierta/cerrada.
- Biblioteca o planta alta para validar oclusión.
- Avatar femenino de cuatro vistas y máscaras/capas de ropa para ambos avatares.
- Pizarrón limpio/sucio.
- Computadora, arcade Snake, estación Pong e iconos de UI.
- Metadatos de escala, pivots, colliders, oclusión, acústica e interacción.
- Referencias de todas las escenas, fuentes editables disponibles y registro de autoría/versión.

Hay imágenes antiguas de computadora, planta, sillas y arcade en legacy; su existencia no las convierte en exports finales de esta entrega ni resuelve automáticamente estos faltantes.

## Estado de integración

El mapa actual `packages/contracts/data/demo-map.json` tiene versión `demo-v3` y referencia el piso, los cuatro escritorios y el avatar masculino recibidos. `scripts/generate-demo-assets.mjs` copia los PNG originales sin modificar sus píxeles desde `legacy/pre-alpha/assets/images/` a `apps/web/public/assets/peredo/`, extrae los cuadros de los cuatro GIF originales como PNG para el canvas, calcula hashes y reconstruye el manifest. El avatar se dibuja a escala 0.5; su collider sigue fijo en los pies e independiente del cuadro. El suelo se repite a escala 0.35, equivalente a unos 30 píxeles lógicos por baldosa de 86 píxeles de origen. Los colliders de las cuatro mesas cubren el tablero completo medido en cada PNG: izquierda, derecha, borde posterior y borde anterior. Monitor, patas y frente decorativo permanecen fuera de la colisión. La máscara visual y el ancla de profundidad son datos independientes. Los valores siguen siendo provisionales hasta comparar con el plano final.

Los otros 11 assets del manifest son figuras de prueba. Las sillas recibidas y la imagen de referencia aún no forman parte del mapa. Tampoco hay un PNG independiente de pared en el repositorio; los muros actuales usan placeholders. Los antiguos archivos `demo/floor.png`, `demo/desk.png` y `demo/avatar-*.png` ya no están referenciados.

La integración final debe confirmar pivots, escala y geometría con el artista, conservar originales y comparar con la referencia. Dimensiones de archivo, unidades lógicas y tamaño CSS son conceptos distintos. No generar una oficina aplanada para suplir capas faltantes.

La autoría y versión de la entrega se registrarán con Peredo antes de cerrar aceptación de arte. El generador de assets provisionales seguirá separado para evitar sobrescribir los exports finales.
