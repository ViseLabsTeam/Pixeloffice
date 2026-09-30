# 07 — Decisiones, pendientes y plan de implementación

**Versión:** 1.0 · **Fecha:** 2026-09-30.

## 1. Trazabilidad a la conversación

| Tema confirmado por Vittorio | Consecuencia | Requisitos |
|---|---|---|
| Una captura equivale a un sector; puertas llevan a otra pantalla | Escenas fijas conectadas, independientes de resolución CSS | RF-007/008/017 |
| Movimiento libre en ocho direcciones | Vector normalizado, teclado y joystick | RF-009/048 |
| Hasta 15; grupos habituales 2–6 | Capacidad objetivo y suscripciones por contexto | RF-021/027, RNF-002 |
| Proximidad, ambiente y grupos configurables | Política y permisos; audiencias visibles | RF-021/025 |
| Administrador puede salir sin cerrar edificio | Backend independiente de host | RF-004 |
| Apertura/cierre y prórrogas | Jornada autoritativa, timer y extensión | RF-031/039 |
| Selección manual al cerrar, posibilidad de volver después | Política de vacío elegida y conservada | RF-032/034 |
| Uso colaborativo mínimo dos | Estado de colaboración; acceso de espera propuesto | RF-006 |
| Persisten cuenta, avatar y oficina | Datos guardados separados de sesión temporal | RF-001/050, RNF-005 |
| Cualquier objeto alto que tape al avatar se atenúa | Oclusión independiente de física | RF-013/014 |
| Cuatro vistas estáticas | Arte de avatar frontal/posterior/laterales | RF-015 |
| Workspace real con cuentas/permisos | OAuth y APIs; estudio de editor nativo | RF-040/043 |
| Cámara y pantalla simultáneas; TV/pizarra | Pistas y superficies independientes | RF-028/030 |
| Snake, ping pong y descanso | Módulos diferidos en alcance inicial completo | RF-044/046 |
| Mobile tipo joystick Brawl Stars | Movimiento analógico, multitouch y layout | RF-047/049 |
| Editor/planes/assets/puntos más adelante | I5 con catálogo y derechos persistentes | RF-051/055 |
| Liviana junto al trabajo habitual | Presupuestos y pruebas con IDE abierto | RNF-001/004 |

## 2. Registro de decisiones técnicas recomendadas

| ADR | Elección de referencia | Justificación y condición |
|---|---|---|
| ADR-01 | Vanilla DOM + Canvas 2D + TypeScript/Vite | Preservar sencillez del cliente y contratos tipados; migración incremental. |
| ADR-02 | Backend Node/Fastify + WS autoritativo | Horarios, permisos y sesión no pueden depender del administrador conectado. |
| ADR-03 | PostgreSQL y SQL versionado | Persistencia relacional y transacciones de reglas críticas. |
| ADR-04 | LiveKit SFU, Cloud inicialmente | Cámara/pantalla independientes y daily; proveedor/coste sujetos a prueba. |
| ADR-05 | Grupos privados en salas multimedia separadas | Aislamiento efectivo, no sólo filtro visual. |
| ADR-06 | Google OIDC + OAuth Workspace separado | Identidad y acceso a archivos tienen propósitos distintos. |
| ADR-07 | Mapas/assets como datos versionados | Permitir arte modular y editor posterior. |
| ADR-08 | Monolito modular de servidor inicialmente | Evitar distribución prematura; una autoridad por sesión. |
| ADR-09 | Frontend Vercel; API WS en hosting compatible | Mantener despliegue estático existente; proveedor API pendiente. |

Estas decisiones hacen concreta la implementación recomendada; no significan que Vittorio haya elegido cada biblioteca o proveedor explícitamente.

## 3. Parámetros y políticas pendientes

| ID | Tema | Base propuesta | Momento de resolución |
|---|---|---|---|
| D-01 | Política habitual de oficina vacía | Selección explícita al configurar; override por jornada | Antes de I2 |
| D-02 | Primer usuario y pérdida del segundo | Espera permitida; gestión individual; llamada sin audiencia se libera | Antes de I2 |
| D-03 | Escena completa y legibilidad portrait | Conservar escena; validar arte/controles antes de autorizar cámara móvil/zoom | I1, SP-03 |
| D-04 | Prioridad y permanencia de grupos al cambiar escena | Un contexto principal; grupo elegido se conserva si permitido | Antes de I3 |
| D-05 | Prórroga máxima y reapertura fuera de horario | 30 min por solicitud; máximo sin definir; excepción fuera de horario no habilitada por defecto | Antes de I2 |
| D-06 | Presentador cruza puerta | Detener y liberar superficie de origen | Antes de I3 |
| D-07 | Default acústico y privacidad por radio | Proximidad pública; ambiente protegido/grupo para privacidad | I3, SP-01 |
| D-08 | Editor completo de Docs/Sheets dentro de app | Vista interna + API; native embed sólo si se valida | I4, SP-02 |
| D-09 | Chat, auditoría y partidas guardadas | Chat/partidas efímeros; auditoría mínima con retención pendiente | Antes de I4 |
| D-10 | Arte: medidas, escala, perspectiva y licencias | Referencia de Peredo; contrato `08` | Antes de I1 |
| D-11 | Hosting, región, costes y conexión Google del equipo | Cloud/S3/API compatibles, sin contratación todavía | Antes de entorno compartido |
| D-12 | Presupuestos de rendimiento y hardware real | Valores propuestos de `06` | Primer benchmark |
| D-13 | Política de skins arbitrarios | Manifest de cuatro vistas; carga libre validada sólo si se habilita | I1/I2 |
| D-14 | Economía y precios | Sin puntos/cobros activos hasta definición | Antes de I5 |

Cerrar un pendiente exige una decisión o evidencia registrada. Ninguno bloquea redactar este paquete; algunos sí bloquean anunciar soporte o implementar su parte final.

## 4. Pruebas de viabilidad con salida concreta

- **SP-01 — A/V:** dos redes y dispositivos, cuatro y seis usuarios; cámara+pantalla; transición de contexto; usuario expulsado intentando usar token anterior; grupo privado inaccesible desde cliente alterado. Decidir límites de vídeo, protocolo de permisos y diferencia Cloud/self-hosted.
- **SP-02 — Google:** cuentas personales y Workspace de prueba, Picker, drive.file, lectura/edición limitada Docs/Sheets, usuario sin acceso y revocación. Verificar native embed sin convertir archivo privado en público. Publicar matriz de capacidades y alternativa.
- **SP-03 — Arte/mobile:** reconstruir una escena de Peredo con objetos separados; probar cuatro orientaciones, foot collider, oclusión simultánea de dos objetos y joystick portrait/landscape. Fijar medidas de tiles/avatares y política de visualización.
- **SP-04 — Consumo:** pre-alpha vs motor nuevo con IDE abierto; scripts/buffers, CPU idle/movimiento y llamada cuatro. Aprobar valores de `06` antes de extender ambientes y efectos.

## 5. Plan de ejecución y puertas de salida

### I1 — Base espacial

Auditar repositorio; adoptar módulos/contratos; acordar assets. Construir dos escenas con una puerta, muebles, colisiones, profundidad y oclusión local. Avatar de cuatro vistas y entrada escritorio/mobile. Gate: V01/V02 y SP-03/SP-04, sin fugas al transicionar. No integrar toda la oficina antes de validar esta porción.

### I2 — Sesión y acceso

Identidad/membresías, API/WS, autoridad espacial, roles, jornadas y políticas de cierre. Jobs y recuperación. Gate: administrador sale, primera presencia espera, reapertura permitida, prórroga concurrente y servidor reinicia cerca de cierre. V08/V09/V12/V14 y criterios RF-001/006, RF-031/039/050.

### I3 — Comunicación

SP-01; LiveKit; contextos, grupos privados, chat y daily. Presentación a superficie, reserva y pista independiente. Gate: V03–V06/V11/V12; aislamiento efectivo y consumo con herramientas abiertas. Capacidad 15 sujeta a evidencia.

### I4 — Integraciones y descanso

SP-02; conectar Google, seleccionar/vincular y abrir contenido con permisos. Snake y ping pong de dos. Revisar accesibilidad, compatibilidad y sesión prolongada. Gate: V07/V10/V13/V15 y alcance completo de `01`/`04` satisfecho. Registrar funciones nativas Google no validadas.

### I5 — Evolución

Definir editor, catálogo y modelo comercial. Implementar publicación versionada de mapas, derechos y compras verificadas. Puntos/economía requieren reglas aprobadas; no inferir que jugar otorga puntos ni inventar precios. Repetir rendimiento porque editor/assets/tienda cambian carga.

## 6. Riesgos y mitigación concreta

| Riesgo | Mitigación |
|---|---|
| 15 cámaras elevan consumo | Calidad y suscripción selectiva; grilla limitada; benchmark real. |
| Escena completa ilegible en celular | SP-03 con arte real; ajustar escala/composición antes de producir todo. |
| Editor nativo Google no embebible en caso requerido | SP-02; vista/API y apertura nativa explícitas; no prometer iframe universal. |
| Cierre depende de browser o clock | Jobs y autorización de servidor con estado persistido. |
| Permisos de medios sólo visuales | Salas/contextos protegidos y prueba con cliente alterado. |
| Race extensión/cierre/reserva de TV | Revisión, idempotencia, exclusión y reintento durable. |
| Assets planos impiden transparencia | Entrega separada y metadatos `08`. |
| Crecimiento de memoria tras horas | Caché acotada y V07 con recursos nativos contabilizados. |
| Personalización bloquea entradas | Validación de mapa antes de publicar; rollback a versión válida. |

## 7. Fuentes oficiales consultadas

Referencias verificadas el 2026-09-30; volver a comprobar versiones/compatibilidad al implementar.

- Canvas: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
- Pixel art: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled
- Visibilidad: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
- Captura: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
- Pistas WebRTC: https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addTrack
- PeerJS: https://peerjs.com/client/faq
- Vite: https://vite.dev/guide/
- WebSocket Fastify: https://github.com/fastify/fastify-websocket
- LiveKit suscripciones: https://docs.livekit.io/transport/media/subscribe/
- LiveKit permisos/tokens: https://docs.livekit.io/frontends/reference/tokens-grants/
- LiveKit pantalla: https://docs.livekit.io/transport/media/screenshare/
- Google scopes: https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- Google Picker: https://developers.google.com/workspace/drive/picker/guides/overview
- Google Docs: https://developers.google.com/workspace/docs/api/how-tos/overview
- Google Sheets scopes: https://developers.google.com/workspace/sheets/api/scopes
- PostgreSQL transacciones: https://www.postgresql.org/docs/current/transaction-iso.html
- Vitest: https://vitest.dev/guide/
- Playwright: https://playwright.dev/docs/intro
- Vercel/WebSocket: https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections

Las fuentes respaldan APIs y limitaciones; fases, dominio y presupuestos se diseñaron para Pixel Office. No se extrajo el código privado de ningún repositorio ni se verificó la implementación actual.
