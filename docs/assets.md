# Inventario de arte — entrega parcial

Revisado el 2026-10-04. Contrato vigente: [08](../08_CONTRATO_ASSETS_Y_MAPAS.md). Los tamaños se leyeron de los archivos locales; no acreditan escala de mundo, transparencia, pivots ni aprobación visual.

## Entrega reciente recibida

Base de las rutas: `legacy/pre-alpha/assets/images/`. Estos diez archivos son la entrega reciente señalada por el usuario, aunque estén dentro de la carpeta legacy. Se conservan sus nombres originales durante la recepción.

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

Las orientaciones X/Y se mantienen tal como fueron entregadas; no equivalen automáticamente a las direcciones del motor. Los escritorios tienen lienzos de dimensiones diferentes. El mapa actual usa las cuatro orientaciones en posiciones fijas, con escala de mundo 0.18 y pivots de apoyo elegidos a partir del área visible; esos valores deben contrastarse con la escena final de Peredo.

## Paquete todavía incompleto

No se identificaron en esta entrega reciente exports nuevos para:

- Paredes independientes y puertas abierta/cerrada.
- Biblioteca o planta alta para validar oclusión.
- Avatares hombre/mujer de cuatro vistas y máscaras/capas de ropa.
- Pizarrón limpio/sucio.
- Computadora, arcade Snake, estación Pong e iconos de UI.
- Metadatos de escala, pivots, colliders, oclusión, acústica e interacción.
- Referencias de todas las escenas, fuentes editables disponibles y registro de autoría/versión.

Hay imágenes antiguas de computadora, planta, sillas y arcade en legacy; su existencia no las convierte en exports finales de esta entrega ni resuelve automáticamente estos faltantes.

## Estado de integración

El mapa actual `packages/contracts/data/demo-map.json` tiene versión `demo-v2` y referencia el piso y los cuatro escritorios recibidos. `scripts/generate-demo-assets.mjs` copia sus PNG sin modificarlos desde `legacy/pre-alpha/assets/images/` a `apps/web/public/assets/peredo/`, calcula sus hashes y reconstruye el manifest. El suelo se repite a escala 0.35, equivalente a unos 30 píxeles lógicos por baldosa de 86 píxeles de origen. Los escritorios tienen colliders en la base y máscara de oclusión sobre la parte alta; sus valores siguen siendo provisionales.

Los otros 15 assets del manifest son figuras de prueba. Las sillas recibidas y la imagen de referencia aún no forman parte del mapa. Tampoco hay un PNG independiente de pared en el repositorio; los muros actuales usan placeholders. Los antiguos archivos `demo/floor.png` y `demo/desk.png` ya no están referenciados.

La integración final debe confirmar pivots, escala y geometría con el artista, conservar originales y comparar con la referencia. Dimensiones de archivo, unidades lógicas y tamaño CSS son conceptos distintos. No generar una oficina aplanada para suplir capas faltantes.

La autoría y versión de la entrega se registrarán con Peredo antes de cerrar aceptación de arte. El generador de assets provisionales seguirá separado para evitar sobrescribir los exports finales.
