# Arquitectura actual — base espacial para la demo v2

Actualizado el 2026-10-06. Describe implementación existente; los módulos futuros se rigen por [03](../03_TECNOLOGIAS_Y_ARQUITECTURA.md). I1 sigue incompleto respecto al tren, sprites del pizarrón y validación en dispositivo real.

`apps/web/src/app` posee el ciclo de vida. Crea input, mundo local, caché, renderer y controles de medios; desmonta listeners, ResizeObserver, rAF, imágenes y pistas de captura al salir. Detiene el dibujo en segundo plano y programa frames mientras haya movimiento o paisaje animado. El límite visual es 30 FPS, con simulación basada en tiempo y subpasos de hasta dos unidades.

`engine/input` traduce teclado y Pointer Events a un vector normalizado. Conserva intensidad, aplica zona muerta y libera el control en blur, foco editable, pointercancel y pérdida de captura. La velocidad base es 240 unidades de mapa por segundo. La acción usa un botón DOM independiente, permitiendo un segundo pointer.

`media/local-media` pide cámara y micrófono sólo por acción del usuario, con solicitudes y pistas independientes. La cámara se muestra en una vista previa silenciada; el micrófono queda capturado sin reproducción local. Los controles muestran permiso denegado o dispositivo ausente, permiten cancelar una solicitud pendiente y detienen pistas al apagar o salir. Esta etapa no publica medios a otros participantes.

`engine/world` es **una demostración local**, sin autoridad de permisos. Usa una escena fija de 1920×1080 y una caja de pies para resolver movimiento contra colliders definidos aparte del fondo PNG. Guarda localmente el estado limpio/marcado del pizarrón. Las estructuras de puertas y portales siguen disponibles en el contrato para etapas futuras, pero no se usan en esta oficina.

`rendering` dibuja `SIN MUEBLESL.png` como fondo cacheado y mesa, silla, planta, avatar, vista marcada del pizarrón y ventanas animadas por separado. Cada mueble suelto usa su propia referencia de profundidad y se atenúa gradualmente hasta 5 % de opacidad sólo si tapa al avatar desde detrás. La colisión transforma los rectángulos locales con el mismo pivot y escala que el sprite; nunca depende del alpha. Límite DPR=2 y presupuesto de bitmaps=64 MiB. El canvas conserva proporción 16:9 y usa escalado sin suavizado.

`packages/contracts` centraliza coordenadas, geometría, modelos y validación. JSON Schema comprueba forma/versiones; validaciones semánticas comprueban IDs, referencias, spawns y geometría. El build comprueba firma, hash y dimensiones de PNG. El mapa `demo-v5` en `data/demo-map.json` contiene una escena, 13 colliders fijos, tres objetos y regiones de ventanas, oclusión e interacción; no contiene credenciales ni estado temporal. Las animaciones guardan referencias y duraciones de cuadros independientes de la colisión de pies. La configuración editable está en `scripts/office-layout.mjs`.

`apps/api` usa Fastify con límites de payload y validación de parámetros. Expone únicamente salud y el manifest público. Los contratos de comando propuestos son comprobados en pruebas, pero aún no existe un endpoint WS. No hay persistencia, login simulado, roles locales ni tokens multimedia.

## Límites para los siguientes módulos

| Módulo futuro | Responsabilidad y condición de entrada |
| --- | --- |
| API sessions/presence | Acceso sin cuenta, enlace de sesión, credencial temporal, diez plazas, reconexión y expiración en memoria |
| API realtime/world | Conexión validada por sesión, una presencia por credencial, epoch, límites y autoridad espacial con geometría compartida |
| Web realtime | Predicción/ACK, reconexión y descarte de eventos de otra epoch/mapVersion |
| Web/API media | SFU recomendada: LiveKit bajo demanda, audiencia por ambiente/proximidad, cámara/mic/pantalla independientes y revocación efectiva |
| Web/API chat/whiteboard | Chat y trazos temporales del ambiente, lápiz/goma, limpio/sucio en mapa y presentación en panel |
| Web computers | Panel de enlaces HTTPS externos a Google Workspace configurados en la plantilla |
| Web/API games | Snake con montaje/desmontaje y Pong autoritativo, sin economía inferida |

Estos módulos se incorporarán con implementación y pruebas en I2–I4. No se agregan SDKs sin uso a I1. Cuentas, equipos, horarios, PostgreSQL, OAuth/APIs de Google, catálogo comercial y editor quedan fuera del plan; no hay I5 de esta entrega.

Los tipos de dominio expresan ahora participantes y sesiones temporales, pero no implementan el servicio ni hacen efectivo el límite de diez. El esquema del mapa de prueba todavía necesita ampliarse para máscaras de ropa, bloqueos acústicos, variantes de pizarrón e interacciones definitivas de 08.

La pre-alpha vive aislada en `legacy/pre-alpha`; el nuevo grafo de imports no incluye PeerJS, BroadcastChannel, Tailwind CDN ni los antiguos handlers.
