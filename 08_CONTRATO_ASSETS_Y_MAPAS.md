# 08 — Assets y mapa fijo: contrato con Peredo

**Versión:** 2.0 · **Fecha:** 2026-10-04 · **Destinatarios:** Peredo y desarrollo.

## 1. Objetivo

Integrar una oficina fija de pixel art conservando el diseño de Peredo. No habrá editor ni muebles movibles para usuarios, pero paredes y objetos altos deben seguir separados del piso para ordenar profundidad y atenuar lo que tapa al avatar.

La expresión “32 bits” es una referencia de estilo del equipo; no fija un tile de 32×32 ni dimensiones de avatar. Registrar ancho/alto reales, escala y pivots antes de exportar todo. No confundir profundidad de color del PNG con cantidad de píxeles del dibujo.

## 2. Primera entrega pequeña

Peredo entrega una escena de referencia y un paquete de prueba con: piso, tramo de pared, puerta abierta/cerrada, escritorio, silla, biblioteca o planta alta, avatar de cuatro vistas y máscara de ropa, más pizarrón limpio/sucio.

Desarrollo integra este paquete y comprueba escala, punto de pies, collider, orden y transparencia hasta 90 % (opacidad 0.1) en desktop/mobile. Corregir el contrato antes de producir todas las piezas. No necesita exportar de una vez todas las variantes de color.

## 3. Formato y recursos finales

PNG transparente individual o atlas PNG con manifest JSON. Nombre estable en minúsculas y guiones; originales editables separados de exports. Mantener tamaño original sin suavizado ni escalado accidental. Acompañar cada entrega con versión y lista de cambios.

| Recurso | Entrega necesaria |
|---|---|
| Referencia | Imagen de cada escena completa y fuente editable si está disponible. |
| Piso | Fondo/capa sin paredes o muebles altos pegados. |
| Paredes | Tramos independientes; collider y región visual separables. |
| Puertas | Abierta/cerrada coherentes con vano, orientación y pivot. |
| Muebles | Sprites fijos individuales; base física y máscara de oclusión cuando corresponda. |
| Avatar hombre/mujer | Frente, espalda, izquierda y derecha; mismo punto de pies por vista. |
| Ropa | Máscara o capas para recolorear sólo ropa, conservando piel, pelo y sombras. |
| Pizarrón | Dos sprites: limpio y sucio; ambos con mismas medidas/pivot y zona de interacción. |
| Computadora | Sprite y punto de interacción; iconos de accesos para panel, no edición del mueble. |
| Juegos | Arcade Snake y mesa/estación Pong; recursos de minijuegos mínimos. |
| UI | Iconos coherentes para lápiz, goma, presentar, cerrar, cámara, micrófono, chat y acción. |

El avatar masculino recibido incluye cuatro PNG de reposo y cuatro GIF de movimiento, uno por dirección; se usan en el recorrido actual. Por ahora las direcciones son `-X` = izquierda/A, `X` = derecha/D, `Y` = arriba/W y `-Y` = abajo/S. No hacen falta avatares subibles, variantes premium, catálogos ni assets de tienda. El mapa muestra clean/dirty, no captura real del dibujo ni una pantalla de vídeo. La presentación y el lienzo grande son UI del panel.

## 4. Metadatos

Coordenadas por escena, origen arriba/izquierda. Posición del avatar = centro de pies. Pivot de objeto = apoyo acordado. Convertir píxeles de arte a unidades lógicas con escala explícita, independiente del tamaño CSS.

| Campo | Qué define |
|---|---|
| assetId/image/sourceRect | Recurso y región dentro del atlas. |
| pivot/worldScale | Anclaje y conversión a mundo. |
| sortAnchorY | Offset de apoyo utilizado para ordenar profundidad. |
| colliders | Área que bloquea la caja de pies. |
| occluder | Máscara visual, margen de aproximación y opacidad mínima. |
| soundBlockers | Segmentos de bloqueo acústico; no derivarlos de todo mueble. |
| interaction | Tipo, alcance y datos de objeto interactivo. |

Una biblioteca puede tener collider sólo en su base y occluder en todo su cuerpo. El escritorio bloquea todo el tablero en ancho y profundidad; monitor, frente decorativo y patas no amplían ese collider. Una pared mantiene su collider aunque se vea translúcida. La máscara de recolor no debe teñir toda la silueta del personaje.

## 5. Plantilla fija

El mapa incluye schemaVersion/mapVersion, escenas con tamaño lógico, ambientes con regiones, objetos, puertas, portales y spawns. Los objetos tienen posiciones fijas. El servidor y cliente usan la misma geometría y versión; no aceptar mapa enviado por participante.

Cada portal referencia escena/spawn de destino. Cada pizarrón, computadora y juego pertenece a un ambiente. Las regiones deben evitar huecos sin regla, solapamientos ambiguos y spawns sobre sólidos. Dividir paredes largas en piezas cuando la atenuación de todo el tramo dificulte leer el espacio.

Ejemplo ilustrativo; las medidas no fijan el diseño de Peredo:

```json
{
  "objectId": "bookshelf-01",
  "assetId": "bookshelf-front",
  "position": { "x": 240, "y": 220 },
  "pivot": { "x": 24, "y": 64 },
  "worldScale": 1,
  "sortAnchorY": 0,
  "colliders": [{ "x": -20, "y": -10, "width": 40, "height": 10 }],
  "occluder": {
    "mask": { "x": -24, "y": -64, "width": 48, "height": 54 },
    "approachMargin": 24,
    "minOpacity": 0.1
  },
  "soundBlockers": [],
  "interaction": null
}
```

Los estados abiertos/cerrados de puertas, clean/dirty y presentación se guardan sólo en sesión. La ubicación y el sprite inicial se guardan en plantilla. No añadir un formato de editor, importador de mapas de usuario ni catálogo comercial.

## 6. Organización de la entrega

Carpetas sugeridas: `references`, `floors`, `walls`, `doors`, `furniture`, `avatars`, `interactive`, `ui` y `manifests`. Puede usarse atlas por grupo sin cambiar IDs. Incluir medidas, peso, escala, fecha/versión y autoría de assets propios o licencia de recursos externos.

Una imagen de oficina completa ayuda a comparar composición, pero no sustituye exports por capas. No reconstruir manualmente cada detalle desde una captura si Peredo tiene los originales. Desarrollo define geometría con Peredo sobre el sprite real; el artista no necesita programar el manifest.

Estado de recepción al 2026-10-05: piso, cuatro orientaciones de silla, cuatro de escritorio, una referencia y cuatro PNG de avatar masculino en `legacy/pre-alpha/assets/images`; también cuatro GIF de movimiento en `legacy/pre-alpha/assets/gifs/avatar/man`. El piso, los cuatro escritorios y el avatar masculino están integrados con escala/pivots provisionales en `demo-v3`; faltan los exports independientes de pared y demás piezas del paquete. Ver [inventario y faltantes](docs/assets.md); la ubicación en legacy no convierte estos archivos recientes en material histórico.

## 7. Aceptación de arte

1. Exports coinciden con referencia en paleta, escala y perspectiva.
2. Regiones/pivots del atlas son válidos y cuatro vistas no desplazan pies.
3. Colores de ropa son reconocibles y legibles como lápiz sobre blanco.
4. Muebles y puertas permiten pasar/interactuar en la escena real.
5. Pared y mueble alto se atenúan gradualmente hasta 90 % de transparencia (10 % de opacidad) sin perder colisión.
6. Los sprites clean/dirty no saltan ni requieren copiar el dibujo.
7. El fondo de otro ambiente se puede atenuar sin revelar sus ocupantes.
8. Pesos y dimensiones respetan o justifican los objetivos de 06.
9. Se verifica un celular antes de producir todos los recursos restantes.
