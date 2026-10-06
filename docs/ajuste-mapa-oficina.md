# Ajuste manual de la oficina fija

El archivo editable es [`scripts/office-layout.mjs`](../scripts/office-layout.mjs). `packages/contracts/data/demo-map.json` y las copias de imágenes de `apps/web/public/assets/peredo/` son **generados** mediante `node scripts/generate-demo-assets.mjs`; no ajustes el JSON generado a mano. El mapa usa las coordenadas originales de `SIN MUEBLESL.png`: 1920 × 1080 píxeles, con origen (0, 0) arriba a la izquierda, `x` hacia la derecha e `y` hacia abajo. Canvas, fondo, avatar y geometrías reciben una sola transformación al cambiar el tamaño de la ventana.

## Campos de cada mueble

| Campo | Unidad y efecto |
|---|---|
| `id`, `source` | ID de depuración y ruta del PNG dentro de `legacy/pre-alpha/assets/images/`. |
| `position: {x,y}` | Punto del mueble en píxeles del fondo original. Es donde se coloca el `pivot`. |
| `scale` | Multiplicador de píxeles del PNG a píxeles del mapa; `0.3` convierte 100 px del PNG en 30 px del mapa. |
| `pivot: {x,y}` | Punto dentro del PNG original, en píxeles de ese PNG. Al mover `position`, sprite y collider se mueven juntos. |
| `collider: [rect(x,y,width,height)]` | Superficie física, medida en píxeles del PNG original. Se transforma con `position + (coordenada − pivot) × scale`. Bloquea la caja de pies aunque el sprite sea transparente. Puede contener varios rectángulos. |
| `depth: {axis,offset,behindSide,secondary?}` | Línea de profundidad. `axis` es `x` o `y`; su coordenada en el mapa es `position[axis] + offset × scale`. `behindSide: 'positive'` significa que el valor de los pies es mayor que esa coordenada; `'negative'`, que es menor. `secondary` es una segunda línea opcional: basta cumplir una de las dos para quedar detrás. Esta decisión determina quién se dibuja encima, sin cambiar la colisión. |
| `renderOrder` | Orden entre muebles que se cruzan: el número mayor se dibuja después. La mesa tiene 20 y la silla 10. |

Ejemplo, `west-desk`: `position: {x:305.7,y:706.8}`, `scale:0.3`, `pivot:{x:277,y:662}` y `collider:[rect(94,34,348,520 + monitorDeskClearance / 0.3)]`. En el mapa, el límite izquierdo del tablero es `305.7 + (94−277)×0.3 = 250.8`; el derecho es `355.2`. Arriba queda en `518.4` y abajo en `678.4`, incluidos los 4 px de margen frontal. Para mover **sólo el límite izquierdo** 6 px del mapa hacia la izquierda, cambia `x:94→74` y `width:348→368` (20 px del PNG × 0.3). Para mover sólo el derecho 6 px a la derecha, cambia `width:348→368`. Para mover sólo el superior 6 px hacia arriba, cambia `y:34→14` y la altura base `520→540`; para mover sólo el inferior 6 px hacia abajo, cambia la altura base `520→540`. Invierte las sumas y restas para mover cada límite hacia dentro. Las patas inferiores y el monitor quedan fuera de este rectángulo físico.

Para cambiar cuándo la mesa pasa delante del avatar, edita `depth.axis`, `depth.offset` o `depth.behindSide`. En la mesa lateral `axis:'x'` separa el lado de uso izquierdo del lado posterior derecho; `secondary` usa `axis:'y'` para la aproximación desde abajo. Para mover la línea vertical 6 px a la derecha, suma 20 al primer `offset`; para mover la horizontal 6 px hacia abajo, suma 20 a `secondary.offset`. El mueble se dibuja siempre opaco. Cambiar la profundidad no modifica la colisión.

La silla y la planta tienen sus propios campos. En la planta, el collider corresponde a la maceta; el follaje no amplía la superficie física. `frontClearance` agrega 2 píxeles del mapa al borde inferior de esos colliders y de las bases fijas. `monitorDeskClearance` agrega 4 píxeles en total al escritorio con monitor. En los controles esa dirección es `−Y` (abajo), mientras que en Canvas aumenta `y`. Las paredes y muebles incorporados en el fondo están en `fixedColliders` en el mismo archivo; sus coordenadas ya son píxeles del fondo y no tienen pivot ni `scale` individuales. Allí también están `interactions`, `windows`, `boardSurface` y `boardCorners`. El avatar usa una caja de pies de 30 × 12 píxeles del mapa definida en `scripts/generate-demo-assets.mjs`, separada del tamaño del sprite. Todo el fondo se dibuja detrás del avatar y sus colliders siguen bloqueándolo.

Tras editar, ejecuta `node scripts/generate-demo-assets.mjs` y recarga el navegador. Si el servidor de Vite ya está abierto, la recarga suele ocurrir automáticamente; una recarga manual asegura que se use el manifest nuevo. Abre `?debug=colliders` para ver ID y collider cian, referencia de profundidad naranja, caja de pies verde y punto de pies rojo. El modo es sólo de desarrollo y no aparece en producción.
