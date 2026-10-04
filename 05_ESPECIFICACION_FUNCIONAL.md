# 05 — Flujos, estados y protocolo

**Versión:** 2.0 · **Fecha:** 2026-10-04 · **Estado:** especificación para implementar.

Los criterios de sesión y audiencia de esta página concretan 01/07. Los endpoints y eventos futuros se diseñarán en sus etapas; hoy la API sólo ofrece salud y manifest público.

## 1. Entrada y sesión

1. Mostrar la demo de Vice Labs y opciones de crear sesión o entrar por enlace.
2. Solicitar nombre visible, avatar y color de ropa; validar longitud y valores permitidos en cliente y servidor.
3. Crear una identidad temporal o retomar una credencial vigente. Resolver cupo y asignación atómicamente.
4. Cargar la versión de plantilla confirmada y el snapshot de sesión antes de habilitar movimiento compartido.
5. Mostrar participantes conectados y acción de compartir enlace. Cámara y micrófono comienzan apagados.

Un enlace inexistente/cerrado muestra un error y permite crear otra sesión. Una sesión llena permite reintentar cuando haya plaza. El enlace invita; la credencial individual permite actuar y reconectar. No colocar credenciales individuales de medios/reconexión en el enlace compartido.

La reconexión retoma la presencia reservada y reemplaza la conexión previa de la misma credencial. Durante el corte se informa el estado y se suspenden acciones compartidas. Tras vencer la gracia, la plaza se libera y se solicita una nueva entrada. Sin cuenta no se deduplican personas que crean identidades nuevas.

## 2. Movimiento y ambientes

WASD/flechas o joystick generan dirección e intensidad. El input no mueve al avatar mientras escribe en un panel. Blur, pointercancel y pérdida de captura liberan movimiento. La simulación usa tiempo y colisiones de pies, con límites contra saltos por cortes.

Acercarse a un objeto muestra su acción; E o el botón táctil la ejecutan. Las puertas cerradas bloquean y no pueden cerrarse sobre un avatar. Un portal prepara destino y espera confirmación; si falla, conserva origen y evita reintentos en bucle.

La audiencia deriva de las regiones de ambiente y del modo de comunicación de la plantilla. En proximidad se aplican alcance y bloqueos acústicos explícitos; en ambiente se comparte con sus participantes. Antes de activar medios deben fijarse los parámetros acústicos y comprobarse aislamiento. El cambio de ambiente retira acceso anterior antes de conceder el nuevo. Atenuar el fondo de otro ambiente no revela sus ocupantes.

## 3. Chat y medios

El chat muestra autor y orden dentro del ambiente. El servidor asigna identidad y secuencia, valida texto y frecuencia y conserva sólo historial temporal acotado. El cliente renderiza texto sin interpretar HTML. Al cambiar de ambiente sustituye la vista por contenido autorizado del destino.

Los botones de cámara y micrófono actúan por separado. Pedir permisos sólo ante acción del usuario y mostrar dispositivo ausente/denegado con posibilidad de continuar. La audiencia recibida/publicada depende del servidor. Sin audiencia se evita trabajo multimedia innecesario sin cambiar silenciosamente las preferencias del participante.

Los límites de vídeos visibles y calidad se adaptan según 06. Al salir del ambiente se retiran las pistas y permisos anteriores; al abandonar sesión se detienen y liberan dispositivos. Cambiar de pestaña no implica apagar unilateralmente una cámara que otros están viendo.

## 4. Pizarrón y presentación

Al interactuar con el pizarrón se abre un panel con lienzo compartido, lápiz, goma y acción de presentar. La ropa del participante aporta un color de lápiz legible sobre blanco; la paleta concreta se valida con el arte.

El servidor ordena operaciones, valida pertenencia al ambiente, tamaño y frecuencia y entrega un snapshot con revisión al ingresar. Cambios concurrentes y borrado deben converger. El sprite del mapa se determina por presencia de trazos visibles: limpio sin trazos, sucio con trazos. No renderizar el lienzo ni el vídeo de pantalla sobre el sprite.

Presentar solicita una reserva exclusiva por pizarrón y luego captura compatible con el navegador. Denegación/cancelación libera la reserva. Un segundo emisor ve ocupado y no reemplaza al primero. La pantalla se recibe en el panel conservando la cámara del emisor. Dejar de compartir, cerrar la presentación, salir o cambiar de ambiente libera reserva y pista; cerrar la vista de un espectador no detiene al emisor. Presentar no modifica los trazos existentes.

## 5. Computadoras y juegos

La computadora abre un panel de accesos externos configurados en la plantilla. Cada enlace indica destino y abre una pestaña mediante acción del usuario, con aislamiento del contexto de apertura. Validar esquema HTTPS y destinos permitidos; no admitir URLs aportadas libremente por participantes. Los permisos y sesiones de Google pertenecen al sitio externo.

Snake se ejecuta localmente dentro de su panel con inicio, fin y reinicio. Pong reserva dos plazas dentro de la sesión, sincroniza estado desde el servidor y resuelve abandono sin mantener una partida huérfana. Cerrar un juego libera controles y bucles; el participante vuelve a mover su avatar. No hay rankings ni premios persistentes.

## 6. Protocolo propuesto y compatibilidad

El contrato inicial de `DOOR_SET` ya contiene:

| Campo | Uso |
|---|---|
| protocolVersion | Versión del formato; actualmente 1 |
| type | Comando validado por schema |
| sessionId / epoch | Sesión e instancia para descartar mensajes antiguos |
| requestId | Identificador para deduplicar reintentos |
| expectedRevision | Control de concurrencia de acción discreta |
| payload | Datos propios de la acción, sin identidad/rol confiados al cliente |

Mantener este formato mientras sea compatible. Al implementar WS, definir ACK con requestId/revisión y resultado, error con código y snapshot de recuperación. Los movimientos requieren secuencia propia y límite de frecuencia; no bloquear cada input esperando una revisión global.

El servidor rechaza comandos de otra sesión/epoch, revisión vencida, objeto inexistente, alcance inválido o payload extra. Una revisión conflictiva devuelve estado actual para reconciliar; reintentar la misma petición no aplica dos veces la acción.

Códigos propuestos: `SESSION_NOT_FOUND`, `SESSION_CLOSED`, `SESSION_FULL`, `INVALID_CREDENTIAL`, `VERSION_MISMATCH`, `REVISION_CONFLICT`, `OUT_OF_RANGE`, `SURFACE_BUSY`, `RATE_LIMITED` e `INVALID_PAYLOAD`. La UI traduce el código a una acción comprensible.

## 7. Fin de sesión y limpieza

La salida explícita elimina presencia y libera sus reservas. Un corte reserva sólo la presencia durante la gracia, libera la presentación y retira medios. Al quedar sin conectados entra en EMPTY; su eliminación espera la política de vacío y las reservas vigentes. Una reconexión válida vuelve a WAITING/COLLABORATIVE.

Al cerrar se invalidan credenciales y se eliminan puertas, mensajes, trazos, partidas y recursos multimedia. Un reinicio del servicio se comunica como sesión finalizada al restablecer conexión. No restaurar contenido anterior ni reactivar cámara/captura sin consentimiento. Valores de temporización y límites siguen pendientes en 07.
