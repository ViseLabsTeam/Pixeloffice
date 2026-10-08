# 08 — Assets y mapa fijo: contrato con Peredo

**Versión:** 2.3 · **Actualizado:** 2026-10-08 · **Destinatarios:** Peredo y desarrollo.

## 1. Objetivo

Integrar una oficina fija de pixel art conservando el diseño de Peredo. `SIN MUEBLESL.png` define el fondo de 1920×1080. Los muebles incorporados contra las paredes permanecen allí; el escritorio lateral `escritorio x.png`, los dos escritorios derechos `escritorio -y.png`, sus sillas y `PLANTASL.png` son objetos separados, con colisión y profundidad propias. El avatar se dibuja sobre todo el fondo y los muebles son opacos. No habrá editor ni muebles movibles para usuarios.

La expresión “32 bits” es una referencia de estilo del equipo; no fija un tile de 32×32 ni dimensiones de avatar. Registrar ancho/alto reales, escala y pivots antes de exportar todo. No confundir profundidad de color del PNG con cantidad de píxeles del dibujo.

## 2. Entrega para la oficina compuesta

`SIN MUEBLESL.png` es el fondo fijo y `total-office.jpeg` queda como referencia de distribución. Para completar las capas dinámicas faltan el GIF del tren, los sprites del pizarrón limpio/sucio y los recursos de ropa. Los tres escritorios, sus sillas y la planta se dibujan por separado, conservando los PNG originales.

Desarrollo comprueba escala, punto de pies, colliders y profundidad en desktop/mobile. Las paredes y muebles incorporados usan coordenadas del fondo; los muebles sueltos usan coordenadas de sus PNG, pivot y escala explícitos. Los escritorios detienen los pies delanteros a la altura de las puntas de las patas y permiten por detrás una entrada visual equivalente a la longitud de esas patas. [Guía de ajuste](docs/ajuste-mapa-oficina.md).

## 3. Formato y recursos finales

Conservar el fondo original de 1920×1080 sin suavizado ni escalado accidental. Las capas dinámicas pueden entregarse como PNG/GIF individuales o atlas PNG con manifest JSON. Nombre estable en minúsculas y guiones; originales editables separados de exports. Acompañar cada entrega con versión y lista de cambios.

| Recurso | Entrega necesaria |
|---|---|
| Oficina | `SIN MUEBLESL.png` define el fondo visible; `total-office.jpeg` es referencia histórica. |
| Paredes y muebles incorporados | Dibujados detrás del avatar en el fondo. Colliders e interacciones se entregan como metadatos independientes. |
| Muebles sueltos | `escritorio x.png`, dos instancias de `escritorio -y.png`, `SILLA X.png`, dos instancias de `SILLA -Y.png` y `PLANTASL.png` se dibujan como objetos con geometría propia. |
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
| depth/renderOrder | Referencias de dibujo de los muebles PNG separados; no afectan sus colliders ni su opacidad. |
| windows | Recortes que muestran el tren sin cubrir marcos ni paredes. |
| soundBlockers | Segmentos de bloqueo acústico; no derivarlos de todo mueble. |
| interaction | Tipo, alcance y datos de objeto interactivo. |

La biblioteca incorporada tiene una zona sólida que conecta con la pared para impedir pasar por detrás. Cada escritorio bloquea todo el ancho del tablero. En profundidad, su collider empieza una longitud de pata dentro del borde visual posterior y termina en las puntas de las patas delanteras: así la cintura se alinea aproximadamente con el borde frontal del tablero y los pies sólo avanzan por detrás esa longitud. El monitor no amplía el collider. Las sillas usan una base sólida medida desde asiento y patas; delante, el avatar se dibuja sobre ellas, y detrás queda parcialmente oculto. En el conjunto más a la izquierda, la silla se dibuja primero y el escritorio cubre sus píxeles solapados. Los dos conjuntos derechos conservan el orden anterior. La planta bloquea la maceta, no el follaje. La máscara de recolor no debe teñir toda la silueta del personaje.

La huella sólida del pizarrón se une a la pared norte y cubre el espacio entre sus patas para impedir pasar por detrás. La zona de interacción permanece delante del mueble.

## 5. Plantilla fija

El mapa incluye schemaVersion/mapVersion, la escena fija de 1920×1080, ambiente, spawn, colliders, muebles sueltos, ventanas e interacciones. El servidor y cliente usan la misma geometría y versión; no aceptar mapa enviado por participante. El contrato conserva tipos de puertas y portales para etapas futuras, aunque la composición actual no los usa.

Cada pizarrón, computadora y juego pertenece a un ambiente. Las regiones deben evitar huecos sin regla, solapamientos ambiguos y spawns sobre sólidos. Dividir colliders largos cuando sus aberturas permitan paso.

Ejemplo ilustrativo de geometría separada del fondo:

```json
{
  "colliderId": "center-bookshelf-base",
  "area": { "shape": "rect", "x": 724, "y": 283, "width": 127, "height": 109 }
}
```

Los estados clean/dirty y presentación se guardan sólo en sesión al implementar colaboración. En el recorrido actual, clean/dirty es local y se reinicia al recargar. No añadir un formato de editor, importador de mapas de usuario ni catálogo comercial.

## 6. Organización de la entrega

Carpetas sugeridas para los recursos que falten: `ensambled`, `gifs`, `avatar`, `interactive`, `ui` y `manifests`. Incluir medidas, peso, escala, fecha/versión y autoría de assets propios o licencia de recursos externos.

`SIN MUEBLESL.png` es el fondo oficial del mapa actual. Desarrollo define la geometría de las piezas sueltas y de los muebles incorporados sobre este fondo; el artista no necesita programar el manifest.

Estado de recepción al 2026-10-06: `demo-v5` usa `SIN MUEBLESL.png` como fondo de 1920×1080 y cinco PNG de muebles sueltos en siete posiciones. El avatar masculino recibido conserva sus cuatro PNG de reposo y cuatro GIF de movimiento. Faltan en el repositorio el GIF del tren y los sprites limpio/sucio del pizarrón; el estado marcado actual es una representación temporal. Ver [inventario y faltantes](docs/assets.md).

## 7. Aceptación de arte

1. Exports coinciden con referencia en paleta, escala y perspectiva.
2. Regiones/pivots del atlas son válidos y cuatro vistas no desplazan pies.
3. Colores de ropa son reconocibles y legibles como lápiz sobre blanco.
4. Muebles y puertas permiten pasar/interactuar en la escena real.
5. El avatar se dibuja sobre todo el fondo; los muebles separados se ordenan por profundidad y siempre se ven opacos. Ninguna decisión de dibujo modifica colliders.
6. Los sprites clean/dirty no saltan ni requieren copiar el dibujo.
7. La visibilidad de ocupantes de otro ambiente respeta la audiencia autorizada.
8. Pesos y dimensiones respetan o justifican los objetivos de 06.
9. Se verifica un celular antes de producir todos los recursos restantes.
