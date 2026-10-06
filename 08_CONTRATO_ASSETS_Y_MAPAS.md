# 08 — Assets y mapa fijo: contrato con Peredo

**Versión:** 2.0 · **Actualizado:** 2026-10-06 · **Destinatarios:** Peredo y desarrollo.

## 1. Objetivo

Integrar una oficina fija de pixel art conservando el diseño de Peredo. La composición `total-office.jpeg` define el escenario visible completo; no se reconstruye colocando muebles individuales. La colisión, la interacción, la oclusión y el avatar permanecen separados del fondo. No habrá editor ni muebles movibles para usuarios.

La expresión “32 bits” es una referencia de estilo del equipo; no fija un tile de 32×32 ni dimensiones de avatar. Registrar ancho/alto reales, escala y pivots antes de exportar todo. No confundir profundidad de color del PNG con cantidad de píxeles del dibujo.

## 2. Entrega para la oficina compuesta

La oficina completa recibida es la referencia visual y el fondo fijo del mapa. Para completar sus capas dinámicas faltan el GIF del tren, los sprites del pizarrón limpio/sucio y los recursos de ropa. Las piezas individuales recibidas de piso, mesa y silla se conservan como originales, sin dibujarlas nuevamente sobre la composición.

Desarrollo comprueba escala, punto de pies, colliders y transparencia hasta 90 % (opacidad 0.1) en desktop/mobile. Las geometrías de muebles y paredes se miden sobre la composición original y no dependen de archivos individuales.

## 3. Formato y recursos finales

Conservar la composición original de 1600×900 sin suavizado ni escalado accidental. Las capas dinámicas pueden entregarse como PNG/GIF individuales o atlas PNG con manifest JSON. Nombre estable en minúsculas y guiones; originales editables separados de exports. Acompañar cada entrega con versión y lista de cambios.

| Recurso | Entrega necesaria |
|---|---|
| Oficina | `total-office.jpeg` define la composición visible; fuente editable si está disponible. |
| Paredes y muebles | Ya dibujados en el fondo. Colliders, regiones de oclusión e interacciones se entregan como metadatos independientes. |
| Tren | GIF de paisaje para recortar dentro de las tres ventanas, conservando marcos y paredes. |
| Avatar hombre/mujer | Frente, espalda, izquierda y derecha; mismo punto de pies por vista. |
| Ropa | Máscara o capas para recolorear sólo ropa, conservando piel, pelo y sombras. |
| Pizarrón | Dos sprites: limpio y sucio; ambos con mismas medidas/pivot y zona de interacción. |
| Computadora | Ya dibujada en el fondo; zona invisible de interacción e iconos de accesos para panel. |
| Juegos | Arcade Snake y mesa/estación Pong; recursos de minijuegos mínimos. |
| UI | Iconos coherentes para lápiz, goma, presentar, cerrar, cámara, micrófono, chat y acción. |

El avatar masculino recibido incluye cuatro PNG de reposo y cuatro GIF de movimiento, uno por dirección; se usan en el recorrido actual. Por ahora las direcciones son `-X` = izquierda/A, `X` = derecha/D, `Y` = arriba/W y `-Y` = abajo/S. No hacen falta avatares subibles, variantes premium, catálogos ni assets de tienda. El mapa muestra clean/dirty, no captura real del dibujo ni una pantalla de vídeo. La presentación y el lienzo grande son UI del panel.

## 4. Metadatos

Coordenadas de la oficina en los píxeles originales de 1600×900, origen arriba/izquierda. Posición del avatar = centro de pies. Fondo, avatar y geometrías comparten la misma transformación al tamaño CSS. La escala del avatar se declara por separado.

| Campo | Qué define |
|---|---|
| background | Imagen de oficina y dimensiones originales. |
| pivot/worldScale | Anclaje y escala de sprites dinámicos como el avatar. |
| colliders | Superficie física que bloquea la caja de pies, separada por obstáculo. |
| occluders | Regiones visuales que pueden cubrir al avatar, independientes de la colisión. |
| windows | Recortes que muestran el tren sin cubrir marcos ni paredes. |
| soundBlockers | Segmentos de bloqueo acústico; no derivarlos de todo mueble. |
| interaction | Tipo, alcance y datos de objeto interactivo. |

Una biblioteca tiene collider sólo en su base y una región visual en todo su cuerpo. El escritorio bloquea todo el tablero en ancho y profundidad; monitor, frente decorativo y patas no amplían ese collider. Una pared mantiene su collider aunque se vea translúcida. La máscara de recolor no debe teñir toda la silueta del personaje.

## 5. Plantilla fija

El mapa incluye schemaVersion/mapVersion, la escena fija de 1600×900, ambiente, spawn, colliders, oclusiones, ventanas e interacciones. El servidor y cliente usan la misma geometría y versión; no aceptar mapa enviado por participante. El contrato conserva tipos de puertas y portales para etapas futuras, aunque la composición actual no los usa.

Cada pizarrón, computadora y juego pertenece a un ambiente. Las regiones deben evitar huecos sin regla, solapamientos ambiguos y spawns sobre sólidos. Dividir colliders largos cuando sus aberturas permitan paso; atenuar sólo las regiones visuales que cubren al avatar.

Ejemplo ilustrativo de geometría separada del fondo:

```json
{
  "colliderId": "center-bookshelf-base",
  "area": { "shape": "rect", "x": 604, "y": 304, "width": 105, "height": 21 }
}
```

Los estados clean/dirty y presentación se guardan sólo en sesión al implementar colaboración. En el recorrido actual, clean/dirty es local y se reinicia al recargar. No añadir un formato de editor, importador de mapas de usuario ni catálogo comercial.

## 6. Organización de la entrega

Carpetas sugeridas para los recursos que falten: `ensambled`, `gifs`, `avatar`, `interactive`, `ui` y `manifests`. Incluir medidas, peso, escala, fecha/versión y autoría de assets propios o licencia de recursos externos.

La imagen de oficina completa es el fondo oficial del mapa actual. No reconstruir manualmente muebles desde piezas sueltas. Desarrollo define geometría con Peredo sobre esta composición; el artista no necesita programar el manifest.

Estado de recepción al 2026-10-06: `total-office.jpeg` en `legacy/pre-alpha/assets/images/ensambled/` define la distribución y apariencia. `demo-v4` lo usa como fondo único de 1600×900 y guarda colliders y zonas de interacción independientes. El avatar masculino recibido conserva sus cuatro PNG de reposo y cuatro GIF de movimiento. Faltan en el repositorio el GIF del tren y los sprites limpio/sucio del pizarrón; el estado marcado actual es una representación temporal. Ver [inventario y faltantes](docs/assets.md).

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
