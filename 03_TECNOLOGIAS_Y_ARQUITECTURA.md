# 03 — Tecnologías y arquitectura de la demo

**Versión:** 2.0 · **Fecha:** 2026-10-04 · **Estado:** base actual y recomendaciones para completar v2.

## 1. Arquitectura

Frontend TypeScript con Vite, DOM/CSS y Canvas 2D; API Node/Fastify; WebSocket para estado compartido y WebRTC mediante una SFU para medios. La plantilla fija se versiona en el repositorio. Se recomienda una única instancia autoritativa con sesiones en memoria para esta demo.

No se necesita una base de cuentas, equipos ni horarios. PostgreSQL, Google OIDC/OAuth, Picker y SDKs de Docs/Sheets dejan de formar parte del plan. Google Workspace se resuelve con enlaces HTTPS externos configurados por el proyecto.

## 2. Repositorio actual y trabajo pendiente

| Componente | Existe | Falta para v2 |
|---|---|---|
| `apps/web` | Recorrido individual, dos escenas, input, renderer y caché | Entrada a sesiones, participantes remotos, paneles de chat, A/V, pizarrón, enlaces y juegos |
| `apps/api` | Fastify, salud y manifest público | Crear/unirse/reconectar, límites, WS, simulación y limpieza de sesiones |
| `packages/contracts` | Tipos, esquema del mapa, geometría y comando de puerta propuesto | Schemas de sesión, snapshots, audiencias, pizarrón, chat y Pong |
| `packages/contracts/data/demo-map.json` | Plantilla de prueba con 17 PNG provisionales | Arte de Peredo y metadatos completos de 08 |
| `legacy/pre-alpha` | Código y documentación históricos, Snake/A/V experimentales; también entrega reciente de arte | Extraer sólo lo útil con adaptación al alcance actual; el directorio no se publica con el cliente |
| `tests` | Geometría, API inicial y recorridos del prototipo | Pruebas multiusuario, medios, dibujo, juegos, aislamiento y dispositivos reales |

La versión de especificación 2.0 no cambia por sí sola `schemaVersion: 1`, `protocolVersion: 1` ni `mapVersion: demo-v1`. Son versiones técnicas independientes: sólo deben cambiar cuando cambie el formato o contenido que representan.

## 3. Límites de módulos propuestos

| Módulo | Responsabilidad |
|---|---|
| sessions / presence | Credenciales efímeras, enlace de invitación, cupo diez, reconexión y expiración |
| world / realtime | Geometría compartida, movimiento, puertas, portales, snapshots y revisiones |
| audience / media | Determinar ambiente/proximidad, emitir credenciales de medios y retirar suscripciones no autorizadas |
| chat / whiteboard | Mensajes acotados, trazos ordenados, limpio/sucio y reserva de presentación |
| computers | Configuración de accesos externos y panel de enlaces |
| games | Snake local y Pong autoritativo; montaje y limpieza |
| web panels | Foco, controles, estados de carga/error, accesibilidad y adaptación móvil |

Los nombres son una propuesta de organización, no módulos ya implementados. No crear endpoints vacíos o SDKs sin uso para simular avance.

## 4. Sesiones y protocolo

El servidor valida una credencial temporal y asocia la conexión a una presencia y sesión. No acepta del cliente su rol, identidad de actor, mapa o audiencia efectiva. Los comandos discretos usan versión, sesión, epoch, requestId, revisión y payload validado; ver [05](05_ESPECIFICACION_FUNCIONAL.md).

Las sesiones se alojan en memoria y su pérdida tras reinicio es aceptable si el cliente muestra cierre y permite comenzar de nuevo. Deben liberarse pistas, reservas y contenido al cerrar. El despliegue inicial debe asegurar una sola autoridad por sesión; no habilitar varias réplicas sin resolver enrutamiento y coordinación.

## 5. Audio, vídeo y pantalla

LiveKit sigue como proveedor técnico recomendado, pendiente de validar conectividad, coste y aislamiento para diez participantes. Cargar su cliente cuando se necesite. El backend emite credenciales con permisos y audiencia restringidos; los secretos permanecen en el servidor.

Las pistas de cámara, micrófono y pantalla son independientes. La pertenencia a un ambiente y los bloqueos acústicos del mapa determinan el acceso, no una selección arbitraria del cliente. La prueba de viabilidad debe demostrar revocación al salir del ambiente y desconexión al finalizar la sesión. No anunciar privacidad basándose sólo en ocultar o silenciar elementos de UI.

## 6. Mapa y assets

Conservar piso, paredes, puertas, objetos y avatar separados. Reutilizar la geometría validada en cliente y servidor. Los metadatos finales de 08 incluyen bloqueos acústicos, tipos de interacción y variantes limpio/sucio que el esquema de prueba aún no representa por completo; ampliar tipos, validadores, generador y fixtures juntos al integrarlos.

La nueva entrega de piso, escritorio, silla y referencia está en `legacy/pre-alpha/assets/images`. Su ubicación no determina si es arte viejo: el inventario [docs/assets.md](docs/assets.md) distingue esa entrega del material histórico. Antes de integrarla, registrar dimensiones, escala, pivots y geometría sobre los sprites reales.

## 7. Despliegue y dependencias

El cliente se construye para `apps/web/dist`; el repositorio contiene configuración Vercel y Docker. API/WS y SFU necesitan un entorno compatible con conexiones persistentes. La selección de proveedor y región sigue pendiente; esta alineación no contrata ni despliega servicios.

Las versiones instaladas están en `package-lock.json`. Antes de agregar un proveedor o actualizar dependencias, consultar su documentación vigente y ejecutar las verificaciones del cambio. Los resultados históricos del repositorio no certifican compatibilidad futura.
