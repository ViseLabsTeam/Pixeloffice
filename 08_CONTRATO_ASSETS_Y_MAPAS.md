# 08 — Assets y mapa fijo: contrato con Peredo

**Versión:** 2.1 · **Actualizado:** 2026-10-06 · **Destinatarios:** Peredo y desarrollo.

## 1. Objetivo

Integrar una oficina fija de pixel art conservando el diseño de Peredo. `SIN MUEBLESL.png` define el fondo de 1920×1080. Los muebles incorporados contra las paredes permanecen allí; `escritorio x.png`, `SILLA X.png` y `PLANTASL.png` son objetos separados, con colisión, oclusión y profundidad propias. No habrá editor ni muebles movibles para usuarios.

La expresión “32 bits” es una referencia de estilo del equipo; no fija un tile de 32×32 ni dimensiones de avatar. Registrar ancho/alto reales, escala y pivots antes de exportar todo. No confundir profundidad de color del PNG con cantidad de píxeles del dibujo.

## 2. Entrega para la oficina compuesta

`SIN MUEBLESL.png` es el fondo fijo y `total-office.jpeg` queda como referencia histórica de distribución. Para completar las capas dinámicas faltan el GIF del tren, los sprites del pizarrón limpio/sucio y los recursos de ropa. Mesa lateral, silla y planta se dibujan por separado, conservando los PNG originales.

Desarrollo comprueba escala, punto de pies, colliders y atenuación hasta 5 % de opacidad en desktop/mobile. Las paredes y muebles incorporados usan coordenadas del fondo; los muebles sueltos usan coordenadas de sus PNG, pivot y escala explícitos. [Guía de ajuste](docs/ajuste-mapa-oficina.md).

## 3. Formato y recursos finales

Conservar el fondo original de 1920×1080 sin suavizado ni escalado accidental. Las capas dinámicas pueden entregarse como PNG/GIF individuales o atlas PNG con manifest JSON. Nombre estable en minúsculas y guiones; originales editables separados de exports. Acompañar cada entrega con versión y lista de cambios.

| Recurso | Entrega necesaria |
|---|---|
| Oficina | `SIN MUEBLESL.png` define el fondo visible; `total-office.jpeg` es referencia histórica. |
| Paredes y muebles incorporados | Dibujados en el fondo. Colliders, regiones de oclusión e interacciones se entregan como metadatos independientes. |
| Muebles sueltos | `escritorio x.png`, `SILLA X.png` y `PLANTASL.png` se dibujan como objetos con geometría propia. |
| Tren | GIF de paisaje para recortar dentro de las tres ventanas, conservando marcos y paredes. |
| Avatar hombre/mujer | Frente, espalda, izquierda y derecha; mismo punto de pies por vista. |
| Ropa | Máscara o capas para recolorear sólo ropa, conservando piel, pelo y sombras. |
| Pizarrón | Dos sprites: limpio y sucio; ambos con mismas medidas/pivot y zona de interacción. |
| Computadora | Dibujada en el escritorio suelto; zona invisible de interacción e iconos de accesos para panel. |
| Juegos | Arcade Snake y mesa/estación Pong; recursos de minijuegos mínimos. |
| UI | Iconos coherentes para lápiz, goma, presentar, cerrar, cámara, micrófono, chat y acción. |

El avatar masculino recibido incluye cuatro PNG de reposo y cuatro GIF de movimiento, uno por dirección; se usan en el recorrido actual. Por ahora las direcciones son `-X` = izquierda/A, `X` = derecha/D, `Y` = arriba/W y `-Y` = abajo/S. No hacen falta avatares subibles, variantes premium, catálogos ni assets de tienda. El mapa muestra clean/dirty, no captura real del dibujo ni una pantalla de vídeo. La presentación y el lienzo grande son UI del panel.

## 4. Metadatos

Coordenadas de la oficina en los píxeles originales de 1920×1080, origen arriba/izquierda. Posición del avatar = centro de pies. Fondo, avatar y geometrías comparten la misma transformación al tamaño CSS. La escala del avatar se declara por separado.

| Campo | Qué define |
|---|---|
| background | Imagen de oficina y dimensiones originales. |
| pivot/worldScale | Anclaje y escala de sprites dinámicos como el avatar. |
| colliders | Superficie física que bloquea la caja de pies, separada por obstáculo. |
| occluders | Regiones visuales que pueden cubrir al avatar, independientes de la colisión. |
| windows | Recortes que muestran el tren sin cubrir marcos ni paredes. |
| soundBlockers | Segmentos de bloqueo acústico; no derivarlos de todo mueble. |
| interaction | Tipo, alcance y datos de objeto interactivo. |

La biblioteca incorporada tiene una zona sólida que conecta con la pared para impedir pasar por detrás. El escritorio bloquea todo el tablero en ancho y profundidad; monitor, frente decorativo y patas no amplían ese collider. La planta bloquea la maceta, no el follaje. Una pared mantiene su collider aunque se vea translúcida. La máscara de recolor no debe teñir toda la silueta del personaje.

## 5. Plantilla fija

El mapa incluye schemaVersion/mapVersion, la escena fija de 1920×1080, ambiente, spawn, colliders, muebles sueltos, oclusiones, ventanas e interacciones. El servidor y cliente usan la misma geometría y versión; no aceptar mapa enviado por participante. El contrato conserva tipos de puertas y portales para etapas futuras, aunque la composición actual no los usa.

Cada pizarrón, computadora y juego pertenece a un ambiente. Las regiones deben evitar huecos sin regla, solapamientos ambiguos y spawns sobre sólidos. Dividir colliders largos cuando sus aberturas permitan paso; atenuar sólo las regiones visuales que cubren al avatar.

Ejemplo ilustrativo de geometría separada del fondo:

```json
{
  "colliderId": "center-bookshelf-base",
  "area": { "shape": "rect", "x": 724, "y": 283, "width": 127, "height": 107 }
}
```

Los estados clean/dirty y presentación se guardan sólo en sesión al implementar colaboración. En el recorrido actual, clean/dirty es local y se reinicia al recargar. No añadir un formato de editor, importador de mapas de usuario ni catálogo comercial.

## 6. Organización de la entrega

Carpetas sugeridas para los recursos que falten: `ensambled`, `gifs`, `avatar`, `interactive`, `ui` y `manifests`. Incluir medidas, peso, escala, fecha/versión y autoría de assets propios o licencia de recursos externos.

`SIN MUEBLESL.png` es el fondo oficial del mapa actual. Desarrollo define la geometría de las piezas sueltas y de los muebles incorporados sobre este fondo; el artista no necesita programar el manifest.

Estado de recepción al 2026-10-06: `demo-v5` usa `SIN MUEBLESL.png` como fondo de 1920×1080 y tres PNG de muebles sueltos. El avatar masculino recibido conserva sus cuatro PNG de reposo y cuatro GIF de movimiento. Faltan en el repositorio el GIF del tren y los sprites limpio/sucio del pizarrón; el estado marcado actual es una representación temporal. Ver [inventario y faltantes](docs/assets.md).

## 7. Aceptación de arte

1. Exports coinciden con referencia en paleta, escala y perspectiva.
2. Regiones/pivots del atlas son válidos y cuatro vistas no desplazan pies.
3. Colores de ropa son reconocibles y legibles como lápiz sobre blanco.
4. Muebles y puertas permiten pasar/interactuar en la escena real.
5. Los muebles que tapan al avatar desde detrás se atenúan gradualmente hasta 5 % de opacidad sin perder colisión; desde delante se ven opacos.
6. Los sprites clean/dirty no saltan ni requieren copiar el dibujo.
7. El fondo de otro ambiente se puede atenuar sin revelar sus ocupantes.
8. Pesos y dimensiones respetan o justifican los objetivos de 06.
9. Se verifica un celular antes de producir todos los recursos restantes.
