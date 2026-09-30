# 01 — Alcance y visión

**Versión:** 1.0 · **Fecha:** 2026-09-30 · **Estado:** base acordada de producto con secuencia de entrega propuesta.

## 1. Problema y objetivo

Los equipos remotos necesitan conversar, presentar trabajo y encontrarse de forma espontánea mientras mantienen sus herramientas habituales. Pixel Office representa una oficina con avatares y ambientes que conectan esas actividades. La aplicación debe ocupar un lugar secundario en el consumo de recursos, aunque permanezca abierta durante la jornada.

La experiencia lleva al espacio virtual reglas reconocibles de una oficina: el administrador puede salir sin expulsar al equipo; existen ambientes, horarios y prórrogas; las conversaciones se organizan por proximidad, ambiente o grupo; las cuentas y la configuración sobreviven a cada sesión.

## 2. Usuarios y actores

- **Administrador del equipo:** gestiona miembros, horarios, políticas y configuración.
- **Coordinador:** rol propuesto para permisos delegados sobre reuniones, ambientes y prórrogas.
- **Miembro:** trabaja, conversa, presenta, accede a recursos y juega según sus permisos.
- **Invitado:** rol propuesto de acceso limitado, sujeto a habilitación del equipo.
- **Servicios externos:** identidad y Workspace de Google; transporte de medios; almacenamiento de recursos.
- **Equipo de producción:** Vittorio en desarrollo y Peredo en arte; no son roles obligatorios del producto.

## 3. Alcance inicial del producto

### 3.1 Oficina y motor espacial

Escenas completas conectadas por puertas en sus bordes. El usuario sólo visualiza la escena actual; los demás pueden estar en otras escenas de la misma oficina. Movimiento libre en ocho direcciones, teclado en escritorio y joystick analógico táctil. Colisiones contra paredes, puertas cerradas, muebles y objetos definidos como sólidos. Profundidad visual y atenuación de paredes/muebles altos que oculten al avatar local, hasta 5 % de opacidad.

Arte de pixel art con el nivel de detalle de la referencia de Peredo; avatares inicialmente estáticos con vistas frontal, posterior, izquierda y derecha. El tamaño lógico de escena es independiente de la resolución del navegador. El mapa inicial será fijo pero descrito mediante datos para permitir edición posterior.

### 3.2 Trabajo colaborativo

Objetivo de hasta 15 usuarios distintos presentes por oficina, sujeto a validar. Uso habitual de 2–6 personas por habitación y conversaciones de 2–4; son patrones de uso, no límites rígidos de seis personas. Una daily puede reunir a los 15. Controles de cámara y micrófono independientes, selección de dispositivos cuando sea compatible, indicador de habla y chat contextual.

Tres modos de comunicación: proximidad, ambiente y grupo elegido. Políticas administradas y permisos delegables; los ajustes personales no amplían la audiencia autorizada. Cámara y pantalla compartida simultáneas. Las presentaciones se vinculan a televisores/pizarras y pueden ampliarse para leer contenido.

### 3.3 Identidad, horarios y continuidad

Cuentas, equipos y permisos persistentes. Oficina independiente del primer participante. Horario de apertura/cierre por equipo y zona horaria. Opciones explícitas de cierre y permanencia disponible al quedar vacía. Aviso de cierre y prórrogas autorizadas; 30 minutos es el ejemplo solicitado y el valor inicial propuesto. La sesión vacía libera recursos temporales. El ingreso posterior depende de la política de cierre de esa jornada.

La experiencia es colaborativa con un mínimo conceptual de dos personas. Permitir al primer usuario entrar a esperar es una solución propuesta, no una prohibición acordada de acceso individual. Un administrador debe poder gestionar configuración sin un segundo usuario.

### 3.4 Google Workspace y descanso

Integración real con autorización de Google, selección de archivos, asociación a objetos del ambiente y operaciones autorizadas de Docs/Sheets. Mostrar contenido o vistas compatibles dentro de Pixel Office. La edición nativa completa incrustada requiere un estudio específico: no se presume disponible para todos los servicios.

Sala de descanso con Snake y ping pong. Se propone Snake individual y ping pong de dos jugadores; el formato competitivo, ranking y recompensas queda pendiente. Estos juegos pertenecen al alcance inicial completo, aunque su implementación llegue después de la base espacial y A/V.

## 4. Evolución posterior acordada

- Editor por equipo: muebles, colores, fondos y distribución de escenas.
- Más habitaciones y recursos según plan.
- Personalización de avatar y oficina.
- Catálogo de assets, desbloqueos y puntos.
- Monetización mediante planes y/o assets.

La forma de ganar puntos, precios, condiciones comerciales, pasarela y catálogo no se definieron. No implementar cobros o economía virtual por inferencia. Preparar IDs, catálogo y derechos de uso sin construir una tienda en la primera entrega.

## 5. Fuera del alcance inicial

Se propone excluir de la primera entrega: motor 3D/isométrico, apps nativas, editor público completo, cobros reales, sistema de puntos, grabación de llamadas, bots/IA, transcripción, ranking de juegos, analítica de productividad de empleados y una réplica completa de los editores de Google. Son límites de planificación; una inclusión posterior requiere revisar requisitos y rendimiento.

## 6. Secuencia de entrega propuesta

| Incremento | Resultado utilizable |
|---|---|
| I1 — Base espacial | Dos escenas, puertas, colisiones, cuatro vistas, oclusión, escritorio y mobile. |
| I2 — Oficina multiusuario | Identidad, permisos, presencia, horarios, cierre, prórrogas y recuperación. |
| I3 — Colaboración | Los tres modos A/V, grupos, daily, chat y presentación sin apagar cámara. |
| I4 — Recursos y descanso | Integración Workspace inicial, Snake y ping pong; validación integral del alcance inicial. |
| I5 — Evolución comercial | Editor, catálogo, derechos de uso, puntos y planes tras definición comercial. |

I1 no equivale al producto inicial completo. I4 completa el alcance inicial descrito. No se asignan fechas sin estimación del código, assets y pruebas de proveedores.

## 7. Condiciones de aceptación global

El alcance inicial se considera terminado cuando los requisitos de su etapa en `04` y las pruebas de `06` tienen evidencia, incluidas: independencia del administrador, cierre autoritativo, dos escenas, permisos efectivos, conversaciones aisladas, cámara/pantalla simultáneas, recursos Google autorizados, juegos y mobile.

La capacidad de 15 y los presupuestos de rendimiento son objetivos por verificar. Cualquier incompatibilidad del navegador o editor Google debe documentarse con alternativa funcional y alcance explícito; no anunciar soporte que no se ha comprobado.
