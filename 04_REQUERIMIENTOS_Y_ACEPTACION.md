# 04 — Requerimientos y aceptación de la demo

**Versión:** 2.0 · **Fecha:** 2026-10-04.

Todos los requisitos de esta página son obligatorios para la entrega final. Los IDs `V2-RF-xxx` y `V2-RNF-xxx` son nuevos y no heredan aceptación de v1. Las precisiones adoptadas en 01/07 pueden revisarse expresamente; no representan funcionalidades ya implementadas.

## 1. Requisitos funcionales

| ID | Requisito y aceptación observable | Etapa |
|---|---|---|
| V2-RF-001 | Acceso sin cuenta: crear o entrar por enlace, elegir nombre y avatar sin login/OAuth. Rechazar entrada inválida con mensaje claro. | I2 |
| V2-RF-002 | Sesión temporal independiente de su creador: un participante puede explorar solo y su salida no expulsa a otros. Al finalizar se descarta su estado. | I2 |
| V2-RF-003 | Máximo diez plazas: el servidor resuelve ingresos concurrentes y rechaza la undécima plaza sin exceder el límite. Las reservas vigentes cuentan. | I2 |
| V2-RF-004 | Reconexión temporal: recuperar la misma presencia dentro de la gracia sin duplicarla; credencial vencida o de otra sesión no otorga acceso. | I2 |
| V2-RF-005 | Oficina fija versionada: escenas, ambientes, objetos y spawns válidos; el participante no modifica la distribución ni aporta mapas. | I1/I2 |
| V2-RF-006 | Movimiento en ocho direcciones: teclado y joystick analógico, diagonal normalizada, intensidad conservada y velocidad independiente de FPS/CSS. | I1 |
| V2-RF-007 | Colisiones de pies: paredes, puertas cerradas y bases sólidas impiden atravesar; transparencias no alteran física. | I1/I2 |
| V2-RF-008 | Puertas y portales: apertura compartida, cierre sin atrapar avatares y transición a escena/spawn válidos; fallo de carga conserva origen. | I1/I2 |
| V2-RF-009 | Profundidad y oclusión: orden por apoyo, atenuación gradual local hasta 90 % de transparencia (opacidad 0.1) y restauración al salir. Atenuar un ambiente ajeno no revela ocupantes. | I1/I3 |
| V2-RF-010 | Avatar: opciones hombre/mujer, cuatro vistas con pies estables y color de ropa que no tiñe piel, pelo ni sombras. | I1/I2 |
| V2-RF-011 | Presencia y audiencias: mostrar participantes autorizados de la escena/ambiente; cruzar un portal recalcula visibilidad y comunicación. | I2/I3 |
| V2-RF-012 | Chat de ambiente: enviar y recibir mensajes atribuidos, en orden y con límites; no filtrar contenido a otra sesión o ambiente. | I3 |
| V2-RF-013 | Audio/vídeo: consentimiento, cámara y micrófono independientes, audiencia según ambiente/proximidad y bloqueos definidos; retirar acceso al salir. | I3 |
| V2-RF-014 | Presentación: una reserva por pizarrón, visualización en panel y cámara simultánea; detener/salir/cambiar de ambiente libera reserva y pista. | I3 |
| V2-RF-015 | Pizarrón: lápiz y goma sobre lienzo compartido, orden consistente y snapshot al entrar. El mapa muestra sólo limpio/sucio con medidas/pivot iguales. | I3 |
| V2-RF-016 | Computadoras: abrir accesos HTTPS de Google Workspace en una pestaña externa mediante acción del usuario. Pixel Office no solicita OAuth ni edita documentos. | I4 |
| V2-RF-017 | Snake individual: iniciar, jugar, finalizar y reiniciar; el cierre detiene su bucle y restituye foco/controles del mundo. | I4 |
| V2-RF-018 | Pong de dos participantes: ocupar plazas, sincronizar partido y resultado, manejar abandono y reiniciar; el servidor valida acciones y no admite tercer jugador. | I4 |
| V2-RF-019 | Escritorio/móvil: joystick y acción simultáneos, paneles legibles, teclado sin mover avatar al escribir y cancelación de input al perder foco. | I1–I4 |
| V2-RF-020 | Limpieza de sesión: borrar chat, dibujo, partidas y puertas temporales al cerrar; sesión nueva carga estado inicial sin rastros de la anterior. | I2–I4 |
| V2-RF-021 | Estados y errores: carga, sesión llena/cerrada, corte de red, denegación de dispositivo/captura y fallo de recurso ofrecen salida o reintento comprensible. | I1–I4 |
| V2-RF-022 | Arte final: integrar el diseño de Peredo según 08, con escala/pivots documentados y comparación con referencias; no declarar el arte provisional como aprobado. | I1/I4 |

## 2. Requisitos no funcionales

| ID | Requisito y aceptación |
|---|---|
| V2-RNF-001 | Rendimiento: medir y cumplir o revisar expresamente los presupuestos de 06 con dispositivo, versión, red y método identificados. |
| V2-RNF-002 | Capacidad: diez participantes reales/simulados según escenario, con límites de payload, frecuencia, historial y recursos; bots solos no certifican medios reales. |
| V2-RNF-003 | Aislamiento: servidor valida credenciales, sesión, alcance y audiencia; deniega actor/rol/mapa inyectados, contenido no autorizado y URLs inseguras. |
| V2-RNF-004 | Ciclo de vida: liberar listeners, frames, bitmaps, paneles, pistas y estado temporal; segundo plano y reconexión no dejan actividad innecesaria. |
| V2-RNF-005 | Usabilidad: nombres/estados accesibles, foco visible, botones operables y mensajes legibles; no depender sólo del color para informar estado. |
| V2-RNF-006 | Contratos: TypeScript estricto, schemas y referencias válidas, versiones coherentes, build y pruebas pertinentes; una versión de producto no renumera formatos sin cambios. |
| V2-RNF-007 | Compatibilidad: registrar escritorio y Android/iOS reales; detectar limitaciones de captura/medios y mostrar alternativa sin prometer soporte no probado. |
| V2-RNF-008 | Temporalidad: sin cuentas ni contenido persistente; credenciales acotadas a sesión, secretos fuera del cliente y registros sin chat, trazos ni tokens. |

## 3. Evidencia y condición de cierre

Cada requisito necesita evidencia referida al commit, escenario de 06 y entorno. Un test de geometría local cubre sólo la parte espacial; no acredita puertas compartidas, audiencia ni capacidad.

El registro [docs/validacion.md](docs/validacion.md) conserva pruebas anteriores como antecedentes y distingue su alcance parcial. La entrega termina con I1–I4 completos, arte aceptado y todos los recorridos aplicables documentados. Chat, pizarrón, Snake y Pong no se pueden posponer fuera de la entrega final.
