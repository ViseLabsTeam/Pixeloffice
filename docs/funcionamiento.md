# Funcionamiento de Pixel Office

Al abrir la aplicación se solicita nombre, color y, opcionalmente, un skin PNG. Al entrar, se inicia el bucle Canvas y la conectividad de la sala.

## Juego e interacciones

El módulo `game.js` interpreta teclado o joystick, resuelve colisiones sobre `map.js` y dibuja el mapa, mobiliario y avatares. La tecla **E** o el botón móvil interactúa con el tile que mira el avatar:

| Elemento | Resultado |
| --- | --- |
| Silla | Sentarse o levantarse |
| Escritorio | Abrir Google Docs |
| Servidor | Abrir Google Drive |
| Puerta | Alternar abierta/cerrada |
| Arcade | Abrir Snake |

Las URLs externas se concentran en `src/js/config.js`.

## Red y multimedia

Cada pestaña publica su estado mediante BroadcastChannel. PeerJS usa el parámetro `?room=<id>`: quien crea una sala obtiene el ID en la URL y puede compartirla; quien la abre se conecta al anfitrión. Se intercambian posición, orientación, nombre, color, estado y skin.

La cámara, el micrófono y la pantalla usan APIs del navegador. Requieren permiso explícito y un origen seguro (`localhost` en desarrollo o HTTPS publicado). Al cerrar la página se detienen streams, conexiones y temporizadores.

## Recursos

Los recursos cargados por el mapa viven en `assets/images/furniture` y `assets/images/floors`. Las dos sillas y el suelo de arcade que todavía no se renderizan se conservan como recursos disponibles; no se eliminaron para evitar pérdida de material.
