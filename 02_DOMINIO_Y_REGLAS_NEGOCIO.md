# 02 — Dominio y reglas de la demo

**Versión:** 2.0 · **Fecha:** 2026-10-04.

## 1. Modelo de dominio

| Entidad | Responsabilidad | Vida útil |
|---|---|---|
| Plantilla de oficina | Mapa fijo, versiones, escenas, ambientes, objetos y spawns | Archivo versionado del proyecto |
| Escena | Pantalla del mundo con dimensiones lógicas y portales | Plantilla |
| Ambiente | Región de interacción y audiencia dentro de una escena | Plantilla |
| Asset | Imagen, región, pivot, escala y metadatos gráficos/físicos | Archivo versionado |
| Puerta / portal | Estado inicial y enlace a escena/spawn; geometría fija | Plantilla; apertura temporal |
| Sesión | Instancia temporal de la plantilla, hasta diez participantes | Memoria del servicio |
| Participante | ID de sesión, nombre visible, avatar y color de ropa | Sesión |
| Presencia | Posición, dirección, ambiente y conexión de un participante | Sesión |
| Pizarrón | Trazos, revisión, estado limpio/sucio y reserva de presentación | Sesión; ubicación fija |
| Computadora | Accesos externos configurados en el proyecto | Plantilla |
| Chat | Mensajes atribuidos a participantes y a un ambiente | Sesión, historial acotado |
| Presentación | Emisor, pizarrón, ambiente y pista multimedia | Hasta detener, cambiar de ambiente o salir |
| Partida | Snake local o Pong compartido de dos jugadores | Partida dentro de sesión |

No existen entidades de cuenta, equipo, membresía, jornada, compra ni derecho comercial. La credencial temporal verifica pertenencia a una sesión; no representa una cuenta persistente.

## 2. Estados

La sesión usa `WAITING` con un conectado, `COLLABORATIVE` con dos o más, `EMPTY` durante la gracia sin conectados y `CLOSED` tras finalizar. Una sesión cerrada no se reabre; se crea una nueva desde la plantilla. La creación/asignación inicial es atómica para evitar sesiones vacías huérfanas.

La presencia usa `CONNECTED` o `RECONNECTING`; tras vencer la gracia se elimina. Las reservas de reconexión cuentan para el límite de diez plazas mientras sean válidas. Retomar una credencial reemplaza la conexión anterior de esa presencia y no crea otro avatar. Sin cuentas no puede garantizarse que dos credenciales distintas sean personas distintas.

El pizarrón usa `clean` cuando no tiene trazos visibles y `dirty` cuando sí los tiene. La presentación es un estado independiente del dibujo; detenerla no borra trazos. Snake y Pong liberan controles y recursos al cerrar su panel o salir de la sesión.

## 3. Reglas de negocio

| ID | Regla |
|---|---|
| V2-RB-001 | No se exige cuenta ni autorización de Google para ingresar. |
| V2-RB-002 | El servidor admite como máximo diez plazas por sesión, incluidas reservas vigentes. |
| V2-RB-003 | La salida del creador no termina una sesión con otros participantes. |
| V2-RB-004 | Un participante puede explorar solo; cámara/micrófono no se activan automáticamente. |
| V2-RB-005 | Toda acción compartida se valida contra la sesión, presencia, ambiente y alcance de interacción actuales. |
| V2-RB-006 | El participante no puede enviar un mapa propio ni mover muebles; cliente y servidor comparten versión y geometría. |
| V2-RB-007 | Abrir puertas cambia estado temporal; una puerta no puede cerrarse sobre los pies de un participante. |
| V2-RB-008 | El orden visual y la opacidad no alteran colisiones ni amplían audiencias; los muebles se dibujan opacos. |
| V2-RB-009 | Un portal cambia escena/spawn de manera confirmada, conserva participante/sesión y recalcula audiencia. |
| V2-RB-010 | El fondo de otro ambiente no revela ocupantes fuera de la audiencia autorizada. |
| V2-RB-011 | El servidor determina quién recibe chat, dibujo y medios; no basta ocultarlos en la interfaz. |
| V2-RB-012 | El pizarrón conserva dibujo compartido en el panel y muestra únicamente limpio/sucio en el mapa. |
| V2-RB-013 | Una reserva de presentación admite un emisor; cámara y pantalla son pistas independientes. |
| V2-RB-014 | Al cambiar de ambiente, desconectarse o detener la presentación se libera la reserva y su audiencia. |
| V2-RB-015 | Google Workspace abre enlaces externos; los permisos del sitio destino siguen a cargo de Google. |
| V2-RB-016 | Chat, dibujo, puertas y partidas se descartan al finalizar la sesión; una nueva sesión no restaura contenido. |
| V2-RB-017 | Snake es individual y Pong de dos jugadores, sin rankings, puntos ni recompensas. |
| V2-RB-018 | Nombre y ropa no conceden privilegios; no hay roles administrativos heredados de v1. |
| V2-RB-019 | Acceso, reconexión y reservas se procesan atómicamente para evitar plazas o presentaciones duplicadas. |

## 4. Autoridad y consistencia

El servidor posee las presencias, cupo, geometría compartida, puertas, revisiones de pizarrón, reservas y estado de Pong. La identidad del actor proviene de la conexión validada, nunca de campos de rol/actor enviados en el comando. El cliente puede predecir movimiento y debe reconciliarlo con el servidor.

Las acciones discretas llevan identificador de petición y revisión cuando corresponde. Reintentos no duplican efectos. Movimiento tolera interpolación y descarte de actualizaciones viejas. Una nueva instancia de sesión invalida credenciales y mensajes anteriores; no reutilizar una identidad cerrada tras un reinicio.

Los límites de tiempo, mensajes, trazos y solicitudes se documentarán y validarán antes de activar cada módulo. No se introduce PostgreSQL ni almacenamiento de contenido para resolver la temporalidad. Los parámetros pendientes están en [07](07_DECISIONES_Y_PLAN_IMPLEMENTACION.md).
