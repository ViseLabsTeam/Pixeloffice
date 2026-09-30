# 05 — Especificación de funcionamiento del sistema

**Versión:** 1.0 · **Fecha:** 2026-09-30. Reglas operativas para los RF de `04`; valores no acordados se identifican como propuestos.

## 1. Acceso y entrada

1. Usuario inicia sesión de app, elige equipo y oficina; el backend comprueba membresía.
2. Se consulta jornada, horario efectivo, política de cierre y permisos. Estar autenticado no implica que la oficina esté abierta.
3. Si está disponible, se crea o recupera sesión de oficina y presencia. Una presencia nueva aparece en spawn permitido; reconexión recupera posición válida cuando sea posible.
4. Se descarga manifest de la versión de mapa y escena inicial. El primer snapshot precede al movimiento sincronizado.
5. Usuario elige medios; cámara/micrófono apagados inicialmente como propuesta. Denegación de permisos permite continuar en modo texto/mapa.
6. Si está solo, se muestra espera; al llegar segundo usuario distinto cambia estado a colaborativo. No encender una publicación sin audiencia por la mera espera.

Administración y selección de cierre pueden hacerse en solitario. Llegar a dos personas no activa automáticamente sus dispositivos. Usuarios expulsados o fuera de horario reciben motivo y hora de próxima apertura. Salir de la oficina termina la presencia; cerrar sesión de cuenta además invalida la sesión de autenticación de la app y sus conexiones. Son acciones distintas de cerrar el acceso del equipo.

## 2. Horarios y jornadas

Horario recurrente: días habilitados + zona IANA + hora local inicial/final. Materializar cada jornada como instantes UTC. No sumar 24 horas para calcular la próxima apertura: convertir de nuevo la fecha local, contemplando cambios de zona/horario estacional. Si el cierre es posterior a medianoche, la jornada pertenece a la fecha de apertura; configurar ese caso explícitamente.

Persistir `baseCloseAt`, `effectiveCloseAt`, `emptyPolicy`, `status`, `revision`. Job del servidor y comprobación de cada join/acción aplican el cierre. Un reinicio recupera estos campos antes de admitir usuarios. El contador visual deriva de hora del servidor y offset estimado; el cierre no depende de precisión del temporizador del navegador.

### Opciones de salida/cierre

El usuario común dispone de **Salir de la oficina**. Quien tenga permiso accede además a:

| Opción | Efecto |
|---|---|
| Salir y mantener disponible | Selecciona KEEP_UNTIL_DEADLINE para la jornada, confirma en servidor y sale personalmente. |
| Cerrar cuando quede vacía | Selecciona CLOSE_WHEN_EMPTY; salir no expulsa presentes. Al quedar cero confirmados tras gracia, cierra acceso. |
| Cerrar ahora | Requiere confirmación indicando cuántos serán desconectados; persiste cierre y termina medios/sesión. |
| Modificar cierre | Aplica extensión con permiso; difunde nuevo plazo y motivo. |

La política queda visible en configuración. Primera configuración de horario exige selección explícita de política. Si una pestaña se cierra sin menú, rige la última política confirmada, no se inventa una nueva. Se propone recordar la selección habitual del equipo y permitir override por jornada; este default es D-01 de `07`.

### Vacío y reconexión

Propuesta inicial: heartbeat cada 15 s; conexión sin señales por 45 s se considera perdida. Reconexión reserva identidad durante 30 s desde la pérdida confirmada. Un logout explícito no usa esa reserva. Tras quedar vacía, esperar 60 s antes de liberar sesión o aplicar CLOSE_WHEN_EMPTY, permitiendo cancelación por un join. Estos plazos son distintos y configurables; publicar métricas antes de ajustarlos.

Con KEEP_UNTIL_DEADLINE se liberan salas/partidas de la sesión vacía y la jornada sigue OPEN. Un join posterior crea una sesión/epoch nueva hasta el cierre efectivo. Con CLOSE_WHEN_EMPTY se marca CLOSED y sólo reapertura autorizada dentro de la ventana reestablece acceso. La reapertura fuera de horario se mantiene pendiente.

### Aviso y prórroga

Propuesta: aviso 5 min antes y banner con cuenta regresiva. Miembros pueden solicitar, autorizados aprobar. Extensión por defecto 30 min; máximo acumulado configurable y pendiente de valor. Repetir aviso al aproximarse al nuevo límite.

Actualizar cierre con transacción y expectedRevision. Mismo requestId produce mismo resultado. Dos solicitudes distintas concurrentes: la segunda con revisión antigua recibe conflicto y debe confirmar de nuevo; no sumar 60 min accidentalmente. Si el cierre ya se ejecutó, una solicitud vieja no lo revierte; iniciar reapertura explícita si está permitida.

Al límite: persistir CLOSED, bloquear tokens/joins, emitir evento, detener medios y partidas y cerrar presencias. Reintentar limpieza de proveedores sin volver a abrir. No borrar documentos o recursos persistentes.

## 3. Movimiento y portales

Procesar WASD/flechas o vector de joystick. Si un input editable/modal captura teclado, no mover avatar. `blur`, pérdida de foco de control y `pointercancel` ponen vector en cero. Normalizar vector para que diagonal no sea más rápida. Calcular velocidad con tiempo de simulación; limitar saltos por frame y subpasos para no atravesar un muro con lag.

Avatar tiene collider de pies separado del sprite. Resolver ejes/deslizamiento y revisar límites. Base propuesta: avatares entre sí no son sólidos para evitar bloquear portales; muebles, paredes y puertas sí. El servidor valida input/velocidad y resuelve o verifica colisiones con la misma geometría versionada.

Portal define escena destino, puerta habilitante, área de activación, entrada y orientación. Al cruzar: comprobar horario, permiso y puerta; reservar transición; mantener origen mientras carga destino; confirmar escena y spawn en servidor; intercambiar vista y emitir snapshot. Si falla carga/acceso, no retirar presencia del origen. Un cooldown de portal propuesto de 400 ms o salida completa de su área evita rebote inmediato.

Cambio de escena no crea cuenta o nueva sesión de oficina. Por propuesta se conserva grupo elegido; contexto automático de ambiente/proximidad se recalcula. Si la escena no permite ese grupo o se requiere salir para otra política, mostrar regla antes de transición. Una presentación sobre una TV del origen se detiene/libera al salir su autor, como default D-06.

## 4. Profundidad y oclusión

Ordenar sprites dinámicos/altos por punto de apoyo proyectado, con desempate estable de ID. Usar fondo y objetos bajos cacheables separados de elementos que cambian profundidad. Un objeto grande puede necesitar piezas con apoyos distintos.

Se atenúa un occluder si se dibuja delante del avatar y su máscara proyectada puede taparlo. No confundir esto con una línea de visión de sonido ni con distancia física a cualquier muro. Definir un área de aproximación alrededor de la región que oculta; al entrar gradualmente se reduce opacidad. Detrás y superpuesto: objetivo 0.05. Fuera de influencia: objetivo 1. Interpolar suavemente; duración propuesta de 150–250 ms.

No modificar alpha de objetos ajenos, piso o sombras no configuradas. Si dos obstáculos tapan al avatar, resolver ambos. Restablecer estado local al cambiar escena. Nombres/indicador de habla y miniaturas siguen una política de UI separada para no desaparecer detrás de una pared. En la vista espacial, las miniaturas de cámara pueden anclarse sobre su avatar mediante coordenadas transformadas a pantalla; las presentaciones se muestran en la superficie elegida y en su vista ampliada.

Colisión nunca cambia por alpha. Puertas abiertas sí pueden desactivar su collider de forma compartida. Rechazar cierre de puerta si ocupa una base de avatar; no teletransportar por cerrar.

## 5. Avatares y mobile

Cuatro sprites estáticos. Conservar última orientación al detenerse. Default propuesto: elegir eje predominante; si componentes empatan, conservar orientación previa si coincide con uno, en otro caso usar vertical. No solicitar ocho sprites por el movimiento de ocho direcciones.

Joystick analógico con zona muerta y magnitud normalizada. Un pointer controla joystick; otro puede pulsar acción, micrófono u otro control. Teclado virtual/chat no desplaza avatar. Reservar safe areas, controles con foco/nombre y blancos táctiles de 44 px propuestos.

La escena lógica se presenta completa con proporciones conservadas. El ajuste de portrait requiere validar que avatar/objetos sean legibles (SP-03); no introducir scroll de cámara o zoom de juego permanente sin cerrar esa decisión. Ofrecer ampliación de documentos y presentación. Publicación de pantalla usa detección de capacidad y una acción explícita: mobile puede recibirla aunque su navegador no permita capturarla. No intentar activar captura automáticamente al entrar en una zona.

## 6. Comunicación

### Política y contexto

Administrador define modo predeterminado y capacidades delegadas por ambiente. Usuarios pueden controlar sus propios dispositivos y volúmenes, crear grupos si tienen permiso y aceptar invitaciones. Base propuesta: prioridad GROUP/MEETING sobre AMBIENT/PROXIMITY; un contexto principal evita mezclar voces de varias salas. Cambiar modo global requiere permiso y notifica afectados.

### Proximidad pública

Comprobar escena/ambiente elegible antes de distancia. Utilizar radios configurables en unidades lógicas, no píxeles CSS. Entrar con radio R; abandonar con R+h para histéresis. Volumen suavizado disminuye con distancia; no oscilaciones rápidas. Cámara sólo se recibe de audiencia relevante y con calidad apropiada. Parámetros definitivos dependen de escala de assets y pruebas.

Un tabique visual transparente no habilita una conversación. Default propuesto: ambientes separados no se oyen automáticamente aunque tengan puerta abierta; cruce cambia contexto. Acústica con puertas o rayos a través de paredes queda fuera de la primera implementación salvo cambio explícito.

Proximidad en contexto público es comportamiento de UX; privacidad estricta se obtiene mediante grupos/ambientes protegidos. El aislamiento requerido se valida en medios, no en CSS.

### Grupos y daily

Invitación → aceptación → membresía de conversación → token de contexto. Mostrar audiencia antes de publicar. Salir revoca membresía y restaura contexto automático cuando corresponda. Daily es reunión explícita para hasta 15; vista de interlocutor activo y grilla paginada propuesta para limitar decodificación. Todos pueden participar aunque no se muestren 15 miniaturas a máxima resolución.

Cambios de permisos, cierre o expulsión detienen acceso en API y SFU. Si SFU falla, no activar un modo P2P alternativo con menos privacidad por sorpresa; conservar mapa/chat y mostrar incidencia.

### Dispositivos y chat

Controles camera/mic/screen separados. Interrupción de dispositivo muestra error y respeta mute elegido. Limpiar captura anterior después de reemplazo satisfactorio. Indicador de habla sólo para track válido. Chat especifica destinatario oficina/ambiente/grupo, límite de mensaje y frecuencia; defaults propuestos: 2.000 caracteres y 5 mensajes por 10 s. Render como texto, no HTML del usuario. Chat temporal por sesión; historial persistente pendiente.

## 7. Presentación sobre superficies

1. Usuario pulsa TV/pizarra o control y elige superficie autorizada.
2. Backend reserva la superficie con TTL y requestId. Sólo una presentación activa por superficie como propuesta.
3. Navegador solicita captura en acción del usuario. Cancelar/denegar libera reserva.
4. Publicar pista `screen_share` separada de `camera`; audio de pantalla sólo si permitido/compatible y solicitado.
5. Asociar track a presentación y audiencia. Espectadores ven miniatura sobre superficie y pueden ampliarla.
6. Evento de final de captura, salida, cierre o expulsión termina publicación y libera superficie. Cámara/micrófono conservan estados elegidos.

Mostrar audiencia y fuente elegida. No trasladar la presentación a otra TV al cambiar escena sin confirmación. Al entrar un nuevo espectador autorizado, incorporar el track activo. Rechazar audiencia ajena al ambiente/grupo y evitar recibir la pista sólo para ocultarla.

## 8. Google Workspace

Login de app no concede acceso a Drive. Usuario conecta Google, autoriza scopes y selecciona archivo. Backend comprueba capacidad de vincular recurso; guarda ID/título/tipo, no credenciales en el objeto del mapa.

Otro usuario abre el recurso: comprobar su identidad Google y permiso real; si falta acceso, mostrar solicitar acceso/abrir servicio, sin compartir automáticamente. Primera integración: selección y vínculo, vista interna de contenido autorizado y una operación delimitada de edición para Docs/Sheets. Validar conflictos/revisión al editar; no sobrescribir silenciosamente trabajo ajeno.

Editor nativo incrustado sujeto a SP-02. Alternativa: vista/API interna y apertura nativa en pestaña manteniendo la oficina disponible. No anunciar la alternativa como un editor nativo embebido. Revocación/expiración exige reconectar; cerrar sesión de oficina no borra conexión Google o documentos.

## 9. Juegos

Snake carga al abrirlo, ocupa panel y captura controles; suspender avatar durante juego. Cerrar desmonta timer/listeners y devuelve foco. Audio optativo.

Ping pong propuesto de dos jugadores: invitación y aceptación, partida autoritativa en servidor; cliente manda input, no marcador. Render interpola bola. Reconexión dispone de pausa breve configurable; salida/cierre termina partida sin retener recursos. Sin rankings/puntos persistentes en primera versión.

## 10. Contratos HTTP/WS de referencia

| HTTP propuesto | Función |
|---|---|
| GET /me; GET /teams | Identidad y equipos disponibles. |
| GET /offices/:id/status | Jornada, políticas, permisos y versión. |
| POST /offices/:id/join | Validar y emitir contexto de conexión; no autorizar por URL pública sola. |
| POST /offices/:id/close; /reopen; /extend | Acciones críticas con requestId/revisión. |
| PATCH /offices/:id/schedule; /empty-policy | Configuración autorizada. |
| GET /maps/:version/manifest | Recursos y esquema versionado. |
| POST /media/token | Token específico de contexto autorizado. |
| POST /presentations/reserve; /stop | Reserva y liberación de superficie. |
| POST /workspace/connect; /disconnect | Conexión externa. |
| POST /workspace/links; GET /workspace/files/:id | Vínculos y lectura autorizada. |

Los paths son contrato propuesto; documentar su esquema final en OpenAPI al implementar. No son endpoints ya existentes. Validar duraciones positivas, límites configurados, rangos de horas y pertenencia de todos los IDs al equipo antes de ejecutar comandos.

Envelope de comando WS propuesto:

```json
{
  "protocolVersion": 1,
  "type": "DOOR_SET",
  "sessionId": "opaque-session-id",
  "epoch": 1,
  "requestId": "opaque-request-id",
  "expectedRevision": 7,
  "payload": { "doorId": "door-west", "open": true }
}
```

Eventos mínimos: WORLD_SNAPSHOT, PLAYER_INPUT, PLAYER_STATE, PLAYER_JOINED, PLAYER_LEFT, SCENE_TRANSITION, DOOR_STATE, CHAT_MESSAGE, CONTEXT_CHANGED, PRESENTATION_STATE, OFFICE_STATUS, OFFICE_CLOSING_SOON, OFFICE_EXTENDED, OFFICE_CLOSED, GAME_STATE, COMMAND_ACK, COMMAND_ERROR. Identidad/rol del actor se extraen de conexión validada, no del payload.

Errores funcionales: OFFICE_CLOSED, FORBIDDEN, CONTEXT_FORBIDDEN, CAPACITY_REACHED, REVISION_CONFLICT, SURFACE_BUSY, DESTINATION_UNAVAILABLE, GOOGLE_ACCESS_DENIED, DEVICE_UNAVAILABLE y RECONNECT_REQUIRED. Mostrar causa/acción recuperable; una denegación no genera un bucle de reintentos.

## 11. Fallos, transacciones y limpieza

Si se corta WS: detener input autoritativo, indicar reconexión y pedir snapshot al volver. Si se mantiene A/V pero se pierde control, no sostener indefinidamente permisos sin coordinación; terminar tras gracia y reconciliar. Si falla sólo Workspace, mapa y llamada continúan. No guardar estado crítico sólo en memoria del navegador.

Una única operación coordina extensión y cierre mediante revisión/lock de jornada. Usar outbox o reintento durable para efectos SFU después de confirmar DB. Desmontar loops, observers, audio analyzers, tracks, elementos de vídeo y cachés fuera de presupuesto al salir. Telemetría no incluye texto/documentos/medios privados por defecto.
