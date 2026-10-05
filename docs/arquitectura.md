# Arquitectura actual — base espacial para la demo v2

Actualizado el 2026-10-04. Describe implementación existente; los módulos futuros se rigen por [03](../03_TECNOLOGIAS_Y_ARQUITECTURA.md). I1 sigue incompleto respecto al arte definitivo y validación real.

`apps/web/src/app` posee el ciclo de vida. Crea input, mundo local, caché y renderer; desmonta listeners, ResizeObserver, rAF e imágenes al salir. Detiene el dibujo en segundo plano y no programa frames cuando input y oclusión están quietos. El límite visual es 30 FPS, con simulación basada en tiempo y subpasos de hasta dos unidades.

`engine/input` traduce teclado y Pointer Events a un vector normalizado. Conserva intensidad, aplica zona muerta y libera el control en blur, foco editable, pointercancel y pérdida de captura. La acción usa un botón DOM independiente, permitiendo un segundo pointer.

`engine/world` es **una demostración local**, sin autoridad de permisos. Mantiene puertas temporales fuera del manifest. Carga el destino antes de cambiar escena/posición; al fallar conserva origen y requiere salir del portal antes de reintentar. La transición ignora acciones/movimiento mientras está pendiente. I2 sustituirá la confirmación local por el ACK autorizado del servidor.

`rendering` separa fondo cacheado, sprites ordenados por layer/apoyo/ID y rótulos. El collider nunca depende de alpha. La máscara sólo se atenúa cuando su objeto se dibuja delante del avatar; cada objeto mantiene alpha local. Límite DPR=2 y presupuesto de bitmaps=64 MiB, aún propuestos. La caché incluye los assets de las dos escenas de demostración y rechaza exceder el presupuesto; una oficina más grande necesitará expulsión LRU.

`packages/contracts` centraliza coordenadas, geometría, modelos y validación. JSON Schema comprueba forma/versiones; validaciones semánticas comprueban IDs, referencias, spawns y puertas. El build comprueba bytes PNG, hash y regiones de atlas. El mapa está versionado en `data/demo-map.json`; no contiene credenciales ni estado temporal. `demo-v3` identifica la integración del piso, los escritorios y el avatar masculino recibidos; sus dimensiones y pivots todavía se deben contrastar con el plano final de Peredo. Las animaciones guardan referencias y duraciones de cuadros independientes de la colisión de pies.

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
