# Arquitectura

La aplicación no requiere compilación: `index.html` carga los estilos y `src/js/main.js` como módulo ES.

```text
main.js
 ├─ state.js + config.js
 ├─ UIManager ── Web Media API
 ├─ NetworkManager ── BroadcastChannel / PeerJS
 └─ Game ── map.js + assets.js + SnakeGame
```

## Responsabilidades

- `config.js`: constantes, tiles, rutas de recursos, enlaces e intervalos.
- `state.js`: estado mutable de la sesión y serialización del avatar.
- `assets.js` y `map.js`: carga de imágenes y datos del mundo.
- `game.js`: entrada, colisión, interacciones, render y bucle de animación.
- `ui-manager.js`: controles multimedia, vídeo remoto y ventanas flotantes.
- `network-manager.js`: conexiones, validación básica y sincronización.
- `snake-game.js`: ciclo aislado del minijuego.
- `main.js`: cableado del DOM e inicio/cierre de la sesión.

No hay API de servidor propia. La interfaz pública de configuración está en `config.js`; el contrato compartido de red es un mensaje `STATE` que contiene la salida de `playerSnapshot()`. La compatibilidad de salas depende de conservar ese contrato y el parámetro `room`.
