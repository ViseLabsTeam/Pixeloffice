# Arquitectura actual — base espacial para la demo v2

Actualizado el 2026-10-08. Describe implementación existente; los módulos futuros se rigen por [03](../03_TECNOLOGIAS_Y_ARQUITECTURA.md). I1 sigue pendiente de validación en dispositivo real.

`apps/web/src/app` posee el ciclo de vida. Crea input, mundo local, caché, renderer y controles de medios; desmonta listeners, ResizeObserver, rAF, temporizador del tren, imágenes y pistas de captura al salir. Detiene el dibujo en segundo plano y programa el próximo cuadro del tren sin redibujar durante las pausas de 15 segundos. El límite visual es 30 FPS, con simulación basada en tiempo y subpasos de hasta dos unidades.

`engine/input` traduce teclado y arrastres sobre el canvas a un vector normalizado. El arrastre toma el punto de contacto como centro de un joystick invisible de radio 64 px CSS. Conserva intensidad, aplica zona muerta y libera el control en blur, foco editable, pointercancel y pérdida de captura. La velocidad base es 240 unidades de mapa por segundo. E o un toque corto interactúan; R vuelve a la entrada y C/M alternan cámara/micrófono.

`media/local-media` pide cámara y micrófono sólo por acción del usuario, con solicitudes y pistas independientes. En la vista a pantalla completa sus controles y vista previa están ocultos; C/M permiten encender, apagar o cancelar una solicitud pendiente. Los mensajes de estado quedan disponibles para lectores de pantalla. Las pistas se detienen al apagar o salir. Esta etapa no publica medios a otros participantes.

`engine/world` es **una demostración local**, sin autoridad de permisos. Usa una escena fija de 1920×1080 y una caja de pies para resolver movimiento contra colliders definidos aparte del fondo PNG. Guarda localmente el estado limpio/marcado del pizarrón. Las estructuras de puertas y portales siguen disponibles en el contrato para etapas futuras, pero no se usan en esta oficina.

`rendering` dibuja `SIN MUEBLESL.png`, el tren y el pizarrón antes del avatar. El tren reproduce sus 88 cuadros en la ventana derecha, luego central y luego izquierda, con 15 segundos entre cada una; los cuadros se generan a 156 × 156 píxeles. El fondo completo permanece detrás del avatar. Mesa, silla y planta se dibujan por separado según su referencia de profundidad y siempre con opacidad completa. La colisión transforma los rectángulos locales con el mismo pivot y escala que el sprite; nunca depende del alpha. Límite DPR=2 y presupuesto de bitmaps=64 MiB. El canvas ocupa todo el viewport; una escala uniforme cubre la pantalla sin franjas y la cámara sigue al avatar, limitada a los bordes del mapa. Fondo, objetos, avatar y depuración reciben esa misma transformación sin suavizado. La vista normal sólo muestra pixel art.

`packages/contracts` centraliza coordenadas, geometría, modelos y validación. JSON Schema comprueba forma/versiones; validaciones semánticas comprueban IDs, referencias, spawns y geometría. El build comprueba firma, hash y dimensiones de PNG. El mapa `demo-v5` en `data/demo-map.json` contiene una escena, 11 colliders fijos, siete objetos y regiones de ventanas e interacción; no contiene credenciales ni estado temporal. Las animaciones guardan referencias y duraciones de cuadros independientes de la colisión de pies. La configuración editable está en `scripts/office-layout.mjs`.

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

Los tipos de dominio expresan ahora participantes y sesiones temporales, pero no implementan el servicio ni hacen efectivo el límite de diez. El esquema del mapa incluye los dos estados oficiales del pizarrón y su transformación compartida; todavía necesita ampliarse para máscaras de ropa, bloqueos acústicos e interacciones definitivas de 08.

La pre-alpha vive aislada en `legacy/pre-alpha`; el nuevo grafo de imports no incluye PeerJS, BroadcastChannel, Tailwind CDN ni los antiguos handlers.
