# Pixel Office — Especificación del producto y de implementación

**Versión:** 1.0 · **Fecha:** 30 de septiembre de 2026 · **Proyecto:** Pixel Office / Pro Workspace A/V · **Equipo:** ViseLabs.

## Propósito de este paquete

Establecer una base común, versionada y utilizable por desarrollo y arte. Los requisitos de producto proceden de la conversación con Vittorio; la arquitectura, las políticas de borde y los valores numéricos no acordados son propuestas de ingeniería identificadas explícitamente. Estos archivos especifican trabajo por realizar: no acreditan que las funciones estén implementadas ni que la capacidad o el rendimiento hayan sido medidos.

El producto será una oficina virtual web de pixel art para trabajar en equipo, con escenas conectadas, comunicación contextual, presentación de pantalla en objetos del entorno, Google Workspace, roles y horarios. Debe coexistir durante la jornada con IDE, compilaciones y otras herramientas con un consumo reducido.

## Archivos y orden de lectura

| Archivo | Contenido |
|---|---|
| [01_ALCANCE_Y_VISION.md](01_ALCANCE_Y_VISION.md) | Objetivos, alcance inicial, evolución y límites. |
| [02_DOMINIO_Y_REGLAS_NEGOCIO.md](02_DOMINIO_Y_REGLAS_NEGOCIO.md) | Entidades, estados, permisos, invariantes y persistencia. |
| [03_TECNOLOGIAS_Y_ARQUITECTURA.md](03_TECNOLOGIAS_Y_ARQUITECTURA.md) | Stack de referencia, componentes, infraestructura y migración. |
| [04_REQUERIMIENTOS_Y_ACEPTACION.md](04_REQUERIMIENTOS_Y_ACEPTACION.md) | Requisitos identificados y criterios observables de aceptación. |
| [05_ESPECIFICACION_FUNCIONAL.md](05_ESPECIFICACION_FUNCIONAL.md) | Flujos, protocolos, transiciones y comportamientos de borde. |
| [06_RENDIMIENTO_Y_PLAN_VALIDACION.md](06_RENDIMIENTO_Y_PLAN_VALIDACION.md) | Optimización, presupuestos propuestos y pruebas del sistema. |
| [07_DECISIONES_Y_PLAN_IMPLEMENTACION.md](07_DECISIONES_Y_PLAN_IMPLEMENTACION.md) | Trazabilidad, decisiones pendientes, etapas y fuentes oficiales. |
| [08_CONTRATO_ASSETS_Y_MAPAS.md](08_CONTRATO_ASSETS_Y_MAPAS.md) | Entrega de arte, coordenadas, colisiones y oclusión. |

## Cómo interpretar las decisiones

- **Acordado:** requisito o preferencia expresado por el usuario. Constituye la base del producto.
- **Base técnica:** elección recomendada en esta documentación para poder implementar; no equivale a una aprobación previa del usuario de cada herramienta.
- **Propuesto:** comportamiento de borde, valor inicial o distribución por etapas decidido por ingeniería; configurable o revisable.
- **Pendiente:** requiere una decisión de producto, proveedor, arte o una prueba de viabilidad. No debe presentarse como una función resuelta.

Ante una discrepancia, un requisito acordado prevalece sobre un parámetro propuesto. Las aclaraciones más recientes prevalecen sobre la descripción de la pre-alpha. Las reglas se centralizan en `02` y `05`; la matriz de requisitos de `04` conserva los criterios de aceptación.

## Definiciones que no deben confundirse

1. Oficina guardada ≠ jornada de acceso ≠ sesión activa ≠ sala multimedia.
2. Escena del mapa ≠ tamaño físico de la pantalla ≠ ambiente de comunicación.
3. Quince usuarios en la oficina ≠ quince vídeos decodificados simultáneamente por cada dispositivo.
4. Transparencia visual ≠ ausencia de colisión ≠ permiso para escuchar.
5. Persistencia ≠ consistencia eventual.
6. Autorizar la app en Google ≠ compartir un archivo con todos los compañeros.
7. La etiqueta artística «32 bits» se conserva como intención visual; las medidas de producción se especifican en píxeles y metadatos.

## Estado de la pre-alpha y límites de la revisión

Se proporcionó https://pixeloffice-pearl.vercel.app/ como pre-alpha. La revisión visual anterior observó v1.0.23, Canvas, configuración A/V, skins PNG y referencias a scripts externos. El código completo, las colisiones, las llamadas entre usuarios y el consumo real no fueron auditados. La descripción inicial de un HTML monolítico y cinco zonas puede corresponder a otra revisión. Antes de modificar el repositorio, comprobar su estado actual, instrucciones y recursos.

## Uso por un agente de implementación

Leer todos los archivos antes de editar código. Inspeccionar después el repositorio real y su documentación. Elaborar una comparación entre lo existente y estos requisitos. Implementar por las etapas de `07`, comenzando por la porción vertical de dos escenas. Conservar IDs de requisitos en tareas y validaciones. No crear cuentas de proveedores, contratar servicios, activar cobros ni desplegar como parte de la mera lectura de este paquete. No deducir dimensiones, perspectivas o presupuestos garantizados de una captura.

## Gestión de cambios

Modificar la versión y registrar fecha, motivo y documentos afectados cuando cambie una regla. Los parámetros ajustados por medición deben incluir dispositivo y evidencia. Los pendientes resueltos pasan a decisión explícita; no se sustituyen silenciosamente. Este paquete no contiene plazos, presupuesto comercial ni infraestructura ya contratada.
