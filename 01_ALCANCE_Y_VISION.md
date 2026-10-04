# 01 — Alcance y visión de la demo

**Versión:** 2.0 · **Fecha:** 2026-10-04 · **Marca:** Vice Labs.

## 1. Objetivo y autoridad

Pixel Office es una demo de portafolio: una oficina virtual fija de pixel art, accesible sin cuenta, con sesiones temporales de hasta diez participantes. El alcance vigente parte de [00](00_LEEME.md) y del contrato de arte [08](08_CONTRATO_ASSETS_Y_MAPAS.md). Este documento reemplaza la visión v1 de producto con equipos y configuración persistente.

Los requisitos describen la entrega final. El código actual ofrece un recorrido individual de dos escenas con arte provisional; no demuestra todavía colaboración ni capacidad para diez personas. El estado de implementación y la evidencia se registran en `docs/`.

## 2. Entrega incluida

| Área | Resultado esperado |
|---|---|
| Acceso | Entrar sin registro, elegir nombre y avatar y compartir una sesión temporal; máximo diez participantes por sesión. |
| Oficina fija | Escenas conectadas mediante puertas y portales; ambientes definidos en la plantilla, sin edición por participantes. |
| Movimiento | Ocho direcciones, WASD/flechas y joystick analógico táctil; velocidad independiente de FPS y tamaño CSS. |
| Geometría | Colisiones de pies, profundidad por apoyo y atenuación gradual de paredes/muebles que oculten al avatar local, hasta 90 % de transparencia (10 % de opacidad). |
| Avatar | Opciones hombre/mujer, cuatro vistas estáticas y color de ropa mediante máscara o capas que preserven piel, pelo y sombras. |
| Colaboración | Presencia compartida, chat, audio/vídeo y presentación de pantalla; controles de cámara y micrófono independientes. |
| Pizarrón | Lienzo compartido en un panel, lápiz y goma; en el mapa únicamente sprites limpio/sucio. La presentación también se visualiza en un panel. |
| Computadoras | Accesos externos a Google Workspace desde objetos de la oficina. |
| Descanso | Snake individual y Pong de dos participantes; ambos obligatorios en la entrega final. |
| Dispositivos | Recorrido y paneles adaptables a escritorio y móvil, con limitaciones de captura/medios comprobadas y visibles. |
| Arte | Diseño de Peredo mediante exports separados y metadatos de escala, pivots, colisiones, oclusión e interacción. |

## 3. Criterios adoptados para implementar

Estos criterios concretan aspectos que 00 y 08 no detallan; no se presentan como decisiones expresas del usuario. Están trazados en [07](07_DECISIONES_Y_PLAN_IMPLEMENTACION.md) y pueden modificarse expresamente.

- Se puede crear una sesión y recorrerla estando solo. Quien la crea no es un host técnico ni un administrador permanente; su salida no expulsa a los demás.
- La sesión se comparte por enlace opaco. La identidad de participante y la credencial de reconexión son temporales y pertenecen a esa sesión.
- Al quedar vacía se libera la sesión tras una gracia configurable. Un reinicio del servicio puede terminar las sesiones, con aviso al cliente. Los valores de gracia, expiración y límites operativos deben fijarse antes de I2; no hay horarios laborales ni prórrogas.
- La audiencia se organiza por ambientes de la plantilla; la proximidad y los bloqueos acústicos se aplican donde lo indique el mapa. Se recalcula al cruzar puertas. No se heredan grupos privados, roles ni reuniones especiales de v1.
- El chat y los paneles colaborativos pertenecen al ambiente. El servidor controla la audiencia; ocultar elementos visualmente no otorga aislamiento.
- Un participante presenta por pizarrón a la vez. Cambiar de ambiente o salir libera su presentación. Compartir pantalla conserva la cámara si estaba encendida.
- Dibujo, chat, puertas y partidas son temporales. Una sesión nueva parte de la plantilla limpia. No se prometen historial persistente, recuperación tras reinicio ni preferencias persistentes.

## 4. Exclusiones

Cuentas, login Google, equipos, membresías, roles administrativos, horarios, prórrogas, base de datos de usuarios, OAuth o APIs de Google, edición de documentos dentro de Pixel Office, editor/importador de mapas, muebles movibles, avatares subidos por usuarios, tienda, planes, puntos, rankings, compras, grabación, transcripción y bots quedan fuera.

Tampoco se programa una etapa comercial posterior como parte de esta entrega. Una ampliación requiere cambiar expresamente el alcance. Conservar código histórico no habilita sus funciones en la demo.

## 5. Entrega y aceptación

I1 prepara espacio y arte; I2 incorpora sesiones temporales; I3 incorpora comunicación y pizarrón; I4 completa accesos externos, juegos y validación integral. Las etapas ordenan el trabajo y no vuelven opcionales los componentes finales.

La demo se acepta al cumplir [04](04_REQUERIMIENTOS_Y_ACEPTACION.md), los recorridos de [06](06_RENDIMIENTO_Y_PLAN_VALIDACION.md) y el contrato de [08](08_CONTRATO_ASSETS_Y_MAPAS.md). Diez participantes y los presupuestos de rendimiento son objetivos pendientes de evidencia, no capacidades ya certificadas.
