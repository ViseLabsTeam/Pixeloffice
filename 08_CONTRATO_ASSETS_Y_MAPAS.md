# 08 — Contrato de assets y mapas para arte y desarrollo

**Versión:** 1.0 · **Fecha:** 2026-09-30 · **Destinatarios:** Peredo y desarrollo.

## 1. Objetivo

Reconstruir el diseño de oficina entregado por Peredo conservando composición, perspectiva y detalle, y permitir movimiento, profundidad, colisión y transparencia individual. La captura es referencia de composición; no debe convertirse en el único fondo que contenga todas las paredes y muebles.

«32 bits» es la etiqueta visual usada por el equipo. El contrato técnico describe ancho/alto, pivots, escala y atlas en píxeles; todavía no se acordó que un tile sea 32×32 ni un avatar de una dimensión concreta. No reinterpretar esa etiqueta como una medida confirmada.

## 2. Entrega esperada

| Recurso | Entrega | Motivo |
|---|---|---|
| Referencia de escena | Imagen completa y archivo editable si disponible | Comparar composición final. |
| Piso/fondo | Capa exportada, sin obstáculos altos integrados | Cacheable y reutilizable. |
| Paredes/tabiques | Tramos independientes con transparencia de fondo | Atenuar sólo lo que oculta al avatar. |
| Muebles | Sprites individuales o atlas con regiones | Profundidad, colisión y personalización posterior. |
| Mueble complejo | Piezas por altura/apoyo si hace falta | Evitar un orden de profundidad incorrecto en elementos grandes. |
| Puertas | Abierta/cerrada y dirección | Collider y estado visual sincronizados. |
| Avatar | Frente, espalda, izquierda, derecha | Cuatro vistas estáticas consistentes. |
| Televisor/pizarra | Marco y rectángulo de superficie útil | Ubicar vídeo/presentación sin pintar encima del marco. |
| Sombras | Separadas o decisión explícita por asset | Control de oclusión y composición. |
| Metadatos | Medidas, pivot, ubicación sugerida, categoría | Reconstrucción sin adivinar coordenadas. |
| Derechos | Autoría y licencia/uso comercial permitido | Catálogo futuro y uso en producto. |

PNG transparente o atlas PNG con manifest JSON. Nombres estables en minúsculas y guiones, sin espacios o acentos, por ejemplo `desk-team-front.png`. No interpolar/escalar los exports sin registrar escala. Evitar bordes transparentes grandes; mantener pivot al recortar. Fuente y export separados; elegir herramientas de arte según preferencia de Peredo.

## 3. Coordenadas y puntos de apoyo

- Mundo lógico por escena con origen arriba/izquierda; x aumenta a derecha, y hacia abajo.
- Posición del avatar = centro de apoyo de los pies. Pivot de sprite registra dónde está ese apoyo dentro de la imagen.
- Posición del mueble = pivot acordado. Collider y máscara son locales a ese pivot; la conversión a mundo es explícita.
- Conversión de píxeles de arte a unidades de mundo mediante `worldScale`; no depende del tamaño CSS de pantalla.
- Sprites de cuatro orientaciones conservan escala y apoyo. Si cambian medidas, ajustar rect/pivot por orientación.
- Profundidad usa `sortAnchorY` o punto de apoyo; desempate estable. Elementos por encima del mundo y HUD tienen capas explícitas.

No hacer coincidir automáticamente el collider con todo el PNG. Una planta alta puede tener collider pequeño en la maceta y región de oclusión grande en el follaje. Una mesa necesita base física según movilidad esperada; validar con recorridos, no sólo con su dibujo.

## 4. Tres propiedades independientes por objeto

| Propiedad | Qué controla | Ejemplo |
|---|---|---|
| collider | Área que bloquea pies | Base de estantería. |
| occluder | Región que puede tapar avatar | Cuerpo alto de estantería. |
| interaction | Área/acción interactiva | Abrir documento o usar TV. |

Piso puede carecer de las tres. Un portal puede ser interactivo sin ocultar. Pared transparente conserva collider. Un sillón bajo puede ordenar por profundidad sin requerir transparencia. Paredes largas se dividen en tramos si atenuar toda la pared perjudica legibilidad.

## 5. Campos de manifest y escena

Asset: `schemaVersion`, `assetId`, `imageUrl`, `sourceRect`, `pivot`, `worldScale`, `layer`, `sortAnchorY`, `colliders`, `occlusionMask`, `occlusionApproachMargin`, `interaction`, `variant`, `contentHash`. Recursos originales no contienen credenciales ni URLs de documento privado.

Escena: `schemaVersion`, `mapVersion`, `sceneId`, `logicalSize`, `background`, `spawnPoints`, `environments`, `objects`, `doors`, `portals`, `presentationSurfaces`. Cada portal referencia escena destino y spawn; cada objeto referencia asset de catálogo.

Ejemplo ilustrativo de objeto (medidas elegidas sólo para explicar el contrato):

```json
{
  "objectId": "bookshelf-west-01",
  "assetId": "bookshelf-front-v1",
  "position": { "x": 120, "y": 180 },
  "pivot": { "x": 24, "y": 64 },
  "worldScale": 1,
  "layer": "world",
  "sortAnchorY": 0,
  "colliders": [{ "shape": "rect", "x": -20, "y": -10, "width": 40, "height": 10 }],
  "occluder": {
    "mask": { "shape": "rect", "x": -24, "y": -64, "width": 48, "height": 54 },
    "approachMargin": 16,
    "minOpacity": 0.05
  },
  "interaction": null
}
```

No es un mapa terminado ni fija dimensiones de arte. En esta convención `sortAnchorY` es un offset local a la posición de apoyo; cada implementación debe conservar la misma semántica en schema y render.

Estado temporal abierto/cerrado de puertas y TV en uso va en estado de sesión. El estado inicial/configuración y la posición de la puerta van en mapa persistente. Configuración de colisión tiene una representación común para cliente y servidor; no aceptar geometrías distintas que permitan atravesar sólo desde un cliente.

## 6. Preparación para personalización futura

Instancias del mapa referencian catálogo; no incrustar PNG como base64 en cada objeto. Color/variante/fondo usan IDs y parámetros. Mapas publicados tienen versión; editor futuro valida conectividad, entradas libres, límites y derechos antes de publicar. Conservar última versión válida para rollback. Cambiar plan o asset no debe borrar un mapa sin una política de producto acordada.

## 7. Checklist de entrega y aceptación

1. Referencia y exports coinciden en perspectiva, escala y paleta.
2. Todas las regiones de atlas están dentro de la imagen y tienen pivot válido.
3. PNGs transparentes no contienen franjas o halos visibles al escalar.
4. Colisiones y spawns permiten recorrer escenas y cruzar portales.
5. Una pared y un mueble alto se atenúan independientemente hasta 5 % de opacidad.
6. Cuatro sprites de avatar no saltan al cambiar orientación.
7. Pantalla de TV tiene región útil para presentación ampliable.
8. Bitmaps y transferencias respetan presupuestos de `06`; informar medidas/peso y versión.
9. Autoría y uso comercial están registrados; no utilizar assets de procedencia desconocida para futura venta.
10. Prueba de escena completa en escritorio y celular antes de producir el resto de habitaciones.
