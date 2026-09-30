# 04 — Requerimientos y criterios de aceptación

**Versión:** 1.0 · **Fecha:** 2026-09-30. Ningún requisito figura como implementado. **A:** acordado. **P:** precisión propuesta. **E:** evolución futura acordada. Etapas I1–I5 en `01`.

## 1. Identidad, equipos y permisos

| ID | Requisito | Tipo/Etapa | Aceptación observable |
|---|---|---|---|
| RF-001 | Cuenta e identidad persistentes | A/I2 | Salir, cerrar la oficina y volver conserva cuenta y avatar; no crea identidad nueva por sesión. |
| RF-002 | Membresía por equipo | P/I2 | Usuario ajeno recibe denegación aunque conozca IDs; pertenecer a un equipo no permite entrar a otro. |
| RF-003 | Roles y permisos delegables | A/I2 | Dos roles ejecutan una misma acción; sólo el autorizado obtiene éxito en API/WS, aunque se modifique la UI. |
| RF-004 | Oficina independiente del host | A/I2 | Sale el primero/administrador; los restantes conservan mundo y comunicación. |
| RF-005 | Una presencia por usuario | P/I2 | Dos pestañas no elevan el contador a dos; reconexión conserva identidad y evita avatar duplicado. |
| RF-006 | Ingreso individual en espera | P/I2 | Primero entra sin requerir segundo simultáneo; al entrar otro usuario cambia a colaboración. |

## 2. Mapa, movimiento y arte

| ID | Requisito | Tipo/Etapa | Aceptación observable |
|---|---|---|---|
| RF-007 | Escenas completas conectadas | A/I1 | Dos escenas están vinculadas por un portal de puerta y son recorribles en ambos sentidos configurados. |
| RF-008 | Vista limitada a escena actual | A/I1 | Avatar cambia de escena; se muestra destino y no la oficina completa; tamaño de ventana no altera el portal. |
| RF-009 | Movimiento libre en ocho direcciones | A/I1 | Teclado/joystick permiten diagonales; distancia diagonal por segundo coincide con horizontal dentro de tolerancia de prueba. |
| RF-010 | Colisiones con entorno | A/I1 | Avatar no atraviesa muros, puertas cerradas o muebles sólidos; desliza junto a esquinas sin atravesar. |
| RF-011 | Puertas interactivas compartidas | A/I2 | Abrir/cerrar con E o botón cambia el estado de ambos clientes; reglas evitan cerrar sobre un avatar. |
| RF-012 | Profundidad correcta | P/I1 | Pasar delante/detrás de un escritorio cambia el orden por punto de apoyo sin saltos de sprite. |
| RF-013 | Oclusión gradual de paredes y muebles altos | A/I1 | Objeto que tapa al avatar local llega a 0.05 de opacidad; al retirarse vuelve a 1; colisión permanece. |
| RF-014 | Oclusión local independiente | P/I2 | Dos usuarios en posiciones distintas observan opacidades distintas sin modificar estado global. |
| RF-015 | Avatar estático con cuatro vistas | A/I1 | Frente/espalda/izquierda/derecha funcionan; diagonal usa regla de orientación definida. |
| RF-016 | Arte y metadatos separados | P/I1 | Un manifest ubica piso, objeto y pared; se pueden modificar collider/opacity sin editar fondo completo. |
| RF-017 | Entrada de escena válida | P/I1 | Ningún portal ubica al avatar dentro de un sólido; si destino falla, permanece en origen con aviso. |

## 3. Comunicación y colaboración

| ID | Requisito | Tipo/Etapa | Aceptación observable |
|---|---|---|---|
| RF-018 | Cámara/micrófono independientes | A/I3 | Apagar cámara conserva audio si estaba habilitado; denegar permisos no impide entrar al mapa. |
| RF-019 | Selección de dispositivos compatible | A/I3 | Dispositivos disponibles pueden elegirse; desconexión muestra estado y alternativa sin flujo huérfano. |
| RF-020 | Indicador de habla | A/I3 | Hablar activa indicador; mute lo desactiva y no deja analizador innecesario funcionando. |
| RF-021 | Modo de proximidad | A/I3 | Dentro de contexto público, acercar/alejar cambia audiencia/volumen según radio; histéresis evita reconectar en cada borde. |
| RF-022 | Modo por ambiente | A/I3 | Miembros del mismo ambiente autorizado se comunican; salir actualiza audiencia y detiene suscripciones anteriores. |
| RF-023 | Grupos elegidos | A/I3 | Invitar/aceptar/abandonar cambia miembros; un usuario externo no obtiene pistas de un grupo privado. |
| RF-024 | Modos administrados y delegables | A/I3 | Usuario sin permiso no cambia política global; ajustes propios no amplían audiencia. |
| RF-025 | Audiencia visible y sin audio duplicado | P/I3 | UI muestra quién recibe medios; la misma voz no se reproduce por dos contextos. |
| RF-026 | Chat contextual | A/I3 | Mensaje llega a contexto elegido y no a otro equipo/grupo; escribir no mueve el avatar. |
| RF-027 | Daily de equipo | A/I3 | Prueba con 15 usuarios distintos presentes en reunión, según perfil A/V medido; estado no depende del iniciador. |
| RF-028 | Pantalla sin reemplazar cámara | A/I3 | Se ven cámara y presentación independientes; detener pantalla conserva estado previo de cámara/micrófono. |
| RF-029 | Pantalla vinculada a TV/pizarra | A/I3 | Autor selecciona superficie; audiencia autorizada ve y amplía; fuera del contexto no recibe la presentación. |
| RF-030 | Exclusión y liberación de superficie | P/I3 | Dos solicitudes simultáneas no ocupan la misma superficie; salida/captura finalizada libera reserva. |

## 4. Horarios y ciclo de vida

| ID | Requisito | Tipo/Etapa | Aceptación observable |
|---|---|---|---|
| RF-031 | Apertura/cierre con zona horaria | A/I2 | Backend habilita una jornada por zona IANA; cambiar reloj del cliente no permite entrar fuera de horario. |
| RF-032 | Selección manual de comportamiento de cierre | A/I2 | Usuario autorizado ve salir/mantener disponible, cierre al vacío, cierre inmediato y ajuste de horario; se registra elección. |
| RF-033 | Vacía pero disponible | A/I2 | Todos salen 15:00 con KEEP_UNTIL_DEADLINE; vuelve alguien 15:20 antes del cierre y puede esperar. |
| RF-034 | Cierre al quedar vacía | A/I2 | CLOSE_WHEN_EMPTY bloquea un ingreso posterior tras la gracia propuesta; reapertura exige capacidad. |
| RF-035 | Aviso y temporizador | A/I2 | Participantes ven cierre efectivo y cuenta regresiva consistente; un nuevo join recibe tiempo correcto. |
| RF-036 | Prórroga autorizada | A/I2 | Solicitud autorizada suma duración; dos comandos duplicados suman una sola vez y difunden nueva fecha. |
| RF-037 | Cierre sin presentes y sin prórroga | A/I2 | Jornada disponible vacía llega al límite y pasa a cerrada sin depender de una pestaña abierta. |
| RF-038 | Salir ≠ cerrar para todos | P/I2 | Salida común no expulsa compañeros; cierre global requiere permiso y confirmación. |
| RF-039 | Recuperación y conciliación de estado | P/I2 | Caída/reinicio no restablece horario antiguo; reconexión consulta jornada y recibe snapshot nuevo. |

## 5. Workspace, descanso y mobile

| ID | Requisito | Tipo/Etapa | Aceptación observable |
|---|---|---|---|
| RF-040 | Autorizar y desconectar Google | A/I4 | Consentimiento separado del login; desconectar impide nuevas operaciones de la app sin borrar archivos. |
| RF-041 | Selección/asociación de documentos | A/I4 | Usuario elige un archivo y lo vincula a objeto/ambiente con permiso; asociación persiste entre sesiones. |
| RF-042 | Acceso real autorizado a Docs/Sheets | A/I4 | Flujo demostrable de lectura y una operación de edición limitada autorizada en archivos de prueba; error si no tiene permisos. |
| RF-043 | Vista interna compatible | A/I4 | Contenido/vista soportada abre dentro de app; editor nativo incrustado sólo se anuncia si SP-02 lo valida. |
| RF-044 | Sala de descanso | A/I4 | Ambiente contiene accesos a juegos y respeta políticas de comunicación. |
| RF-045 | Snake | A/I4 | Iniciar, jugar, terminar y salir no deja bucle activo; funcionamiento individual propuesto. |
| RF-046 | Ping pong | A/I4 | Dos participantes comparten marcador/bola autoritativos; caída de uno pausa o termina partida con aviso. |
| RF-047 | Adaptación mobile | A/I1 | Controles y escena utilizables en Android/iOS de referencia, sin solapamiento que impida interactuar. |
| RF-048 | Joystick analógico | A/I1 | Ángulo/intensidad controlan movimiento; multitouch permite mover e interactuar; pointercancel detiene movimiento. |
| RF-049 | Presentaciones en mobile | P/I3 | Recibir/ampliar funciona en matriz validada; publicar pantalla se habilita sólo si el navegador lo soporta. |
| RF-050 | Avatar/configuración persistentes | A/I2 | Reabrir jornada conserva selección de avatar y distribución aprobada; cierre no los restaura a defaults. |

## 6. Evolución posterior

| ID | Requisito | Tipo/Etapa | Aceptación futura |
|---|---|---|---|
| RF-051 | Editor de oficina por equipo | E/I5 | Colocar muebles/colores y publicar mapa versionado sin bloquear portales o spawns. |
| RF-052 | Habitaciones según plan | E/I5 | Servidor limita capacidad contratada; no se evade alterando cliente. |
| RF-053 | Assets, fondos y avatar personalizables | E/I5 | Catálogo y derechos guardados; UI habilita sólo recursos permitidos. |
| RF-054 | Desbloqueos/puntos | E/I5 | Reglas aprobadas antes de desarrollo; eventos de ganancia idempotentes y trazables. |
| RF-055 | Monetización | E/I5 | Precios/pasarela/política definidos; compras verificadas en servidor y preservadas al cerrar. |

## 7. Requisitos no funcionales

| ID | Requisito | Etapa | Aceptación |
|---|---|---|---|
| RNF-001 | Consumo reducido durante trabajo real | Todas | Cumple el perfil y presupuesto propuesto de `06`, con IDE/herramientas abiertos y evidencia. |
| RNF-002 | Capacidad objetivo de 15 presentes | I3 | Ejecutar escenarios V03–V05 de `06`; documentar perfil de vídeo y dispositivos. |
| RNF-003 | Memoria estable en jornada | Todas | Prueba de dos horas y 50 transiciones sin crecimiento retenido sostenido o recursos huérfanos. |
| RNF-004 | Reposo y segundo plano eficientes | Todas | Reducir trabajo visual al ocultar; mantener conversación permitida y reanudar desde snapshot. |
| RNF-005 | Sin pérdida de datos persistentes | I2+ | Cierre, reinicio y reconexión mantienen cuentas/mapa; cambios confirmados sobreviven. |
| RNF-006 | Seguridad multi-equipo y de audiencia | I2+ | Pruebas con cliente alterado, tokens viejos y IDs ajenos no permiten acciones/medios privados. |
| RNF-007 | Credenciales protegidas | I2+ | Ningún secreto SFU/Google en build, logs o URL; permisos OAuth limitados y revocables. |
| RNF-008 | Compatibilidad explícita | I1+ | Matriz escritorio/mobile publicada; degradación visible por función, sin promesas universales. |
| RNF-009 | Uso accesible | I1+ | Botones con nombre, teclado, foco y aviso no sólo por color; joystick no bloquea controles DOM. |
| RNF-010 | Mantenibilidad y contratos versionados | Todas | Módulos separados, schema de assets/mapa/eventos y validación de compatibilidad. |
| RNF-011 | Diagnóstico proporcionado | I2+ | Logs de errores/acciones críticas sin contenido privado de medios/documentos ni tokens. |
| RNF-012 | Despliegue recuperable | I2+ | Migraciones y backup comprobados; job recupera jornadas sin liberar acceso vencido. |

## 8. Criterio de trazabilidad

Cada tarea de implementación referencia uno o más RF/RNF; cada prueba registra requisitos, entorno, versión, resultado y evidencia. Marcar una función como terminada exige prueba de su criterio, no únicamente que exista un botón. Lo pendiente en `07` debe resolverse o permanecer claramente excluido del anuncio de soporte.
