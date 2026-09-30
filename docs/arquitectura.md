# Arquitectura actual — I1

`apps/web/src/app` posee el ciclo de vida. Crea input, mundo local, caché y renderer; desmonta listeners, ResizeObserver, rAF e imágenes al salir. Detiene el dibujo en segundo plano y no programa frames cuando input y oclusión están quietos. El límite visual es 30 FPS, con simulación basada en tiempo y subpasos de hasta dos unidades.

`engine/input` traduce teclado y Pointer Events a un vector normalizado. Conserva intensidad, aplica zona muerta y libera el control en blur, foco editable, pointercancel y pérdida de captura. La acción usa un botón DOM independiente, permitiendo un segundo pointer.

`engine/world` es **una demostración local**, sin autoridad de permisos. Mantiene puertas temporales fuera del manifest. Carga el destino antes de cambiar escena/posición; al fallar conserva origen y requiere salir del portal antes de reintentar. La transición ignora acciones/movimiento mientras está pendiente. I2 sustituirá la confirmación local por el ACK autorizado del servidor.

`rendering` separa fondo cacheado, sprites ordenados por layer/apoyo/ID y rótulos. El collider nunca depende de alpha. La máscara sólo se atenúa cuando su objeto se dibuja delante del avatar; cada objeto mantiene alpha local. Límite DPR=2 y presupuesto de bitmaps=64 MiB, aún propuestos. La caché incluye los assets de las dos escenas de demostración y rechaza exceder el presupuesto; una oficina más grande necesitará expulsión LRU.

`packages/contracts` centraliza coordenadas, geometría, modelos y validación. JSON Schema comprueba forma/versiones; validaciones semánticas comprueban IDs, referencias, spawns y puertas. El build comprueba bytes PNG, hash y regiones de atlas. El mapa está versionado en `data/demo-map.json`; no contiene credenciales ni estado temporal. Las dimensiones de `demo-v1` no fijan las dimensiones de producción.

`apps/api` usa Fastify con límites de payload y validación de parámetros. Expone únicamente salud y el manifest público. Los contratos de comando propuestos son comprobados en pruebas, pero aún no existe un endpoint WS. No hay persistencia, login simulado, roles locales ni tokens multimedia.

## Límites para los siguientes módulos

| Módulo futuro | Responsabilidad y condición de entrada |
| --- | --- |
| API auth/teams/offices | OIDC, cookie segura, membresía por tenant y autorización por capacidad |
| API schedule/jobs/persistence | PostgreSQL, SQL versionado, jornada UTC/revisión, cierre durable, idempotencia y outbox |
| API realtime/presence | Conexión autenticada, una presencia por usuario, epoch, backpressure y autoridad espacial con geometría compartida |
| Web realtime | Predicción/ACK, reconexión y descarte de eventos de otra epoch/mapVersion |
| Web/API media | LiveKit cargado bajo demanda, contextos privados aislados, cámara/mic/pantalla independientes y revocación efectiva |
| Web/API workspace | OAuth separado, archivos seleccionados, control de permiso por usuario y operaciones limitadas Docs/Sheets |
| Web/API games | Snake con montaje/desmontaje y Pong autoritativo, sin economía inferida |

Estos módulos se incorporarán con implementación y pruebas en I2–I4. No se agregan SDKs sin uso a I1. Catálogo/derechos y editor corresponden a I5.

La pre-alpha vive aislada en `legacy/pre-alpha`; el nuevo grafo de imports no incluye PeerJS, BroadcastChannel, Tailwind CDN ni los antiguos handlers.
