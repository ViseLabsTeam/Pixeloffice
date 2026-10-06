# Pixel Office — Especificación v2: demo de portafolio

**Versión:** 2.0 · **Fecha:** 2026-10-04 · **Marca:** Vice Labs.

Este paquete reemplaza íntegramente la especificación v1 del 30 de septiembre. Define una oficina virtual fija, accesible sin cuenta, con sesiones temporales de hasta diez participantes. Es una especificación para implementar; no una certificación de funcionalidades ya disponibles.

## Documentos

| Archivo | Qué resuelve |
|---|---|
| [01_ALCANCE_Y_VISION.md](01_ALCANCE_Y_VISION.md) | Entrega incluida, exclusiones y criterios adoptados. |
| [02_DOMINIO_Y_REGLAS_NEGOCIO.md](02_DOMINIO_Y_REGLAS_NEGOCIO.md) | Entidades, vocabulario, permisos y vida de la sesión. |
| [03_TECNOLOGIAS_Y_ARQUITECTURA.md](03_TECNOLOGIAS_Y_ARQUITECTURA.md) | Stack recomendado, componentes y despliegue. |
| [04_REQUERIMIENTOS_Y_ACEPTACION.md](04_REQUERIMIENTOS_Y_ACEPTACION.md) | Requisitos verificables de esta entrega. |
| [05_ESPECIFICACION_FUNCIONAL.md](05_ESPECIFICACION_FUNCIONAL.md) | Flujos, estados, errores y protocolo. |
| [06_RENDIMIENTO_Y_PLAN_VALIDACION.md](06_RENDIMIENTO_Y_PLAN_VALIDACION.md) | Presupuestos iniciales y pruebas de la demo. |
| [07_DECISIONES_Y_PLAN_IMPLEMENTACION.md](07_DECISIONES_Y_PLAN_IMPLEMENTACION.md) | Cambios frente a v1 y orden de implementación. |
| [08_CONTRATO_ASSETS_Y_MAPAS.md](08_CONTRATO_ASSETS_Y_MAPAS.md) | Entregas de Peredo y datos para integrar el arte. |

Leer 01 y 02 antes de presupuestar o desarrollar. Después, 03 y 05 para implementación; 04 y 06 para aceptación; 08 para arte. Los requisitos usan identificadores nuevos `V2-RF-xxx` y `V2-RNF-xxx`; no heredan los identificadores de v1.

Los documentos 01–07 están alineados con esta v2. El [estado de validación](docs/validacion.md) distingue evidencia histórica y aceptación pendiente; el [inventario de assets](docs/assets.md) registra la entrega parcial. La documentación bajo `legacy/pre-alpha` y `docs/historico` es histórica y no define alcance vigente.

La versión 2.0 identifica esta especificación. El mapa de prueba usa `demo-v5`: `SIN MUEBLESL.png` como fondo de 1920×1080, muebles sueltos como objetos con colisión y profundidad independientes, y el avatar masculino de cuatro direcciones. `schemaVersion: 1` y `protocolVersion: 1` siguen siendo identificadores técnicos independientes. Los campos editables están en [la guía de ajuste](docs/ajuste-mapa-oficina.md).

## Cómo interpretar las decisiones

- **Acordado:** decisión expresada por Vittorio en la conversación.
- **Criterio adoptado:** precisión de funcionamiento elegida para hacer ejecutable la entrega; figura en 01 y 07 y puede modificarse expresamente.
- **Recomendación técnica:** arquitectura propuesta; debe contrastarse con el repositorio y las pruebas antes de migrar código.
- **Objetivo de validación:** presupuesto de rendimiento propuesto; no es una medición de la publicación actual.

No volver a incorporar funciones de v1 por encontrarlas en el código o en documentación antigua. Los minijuegos sí son obligatorios en esta entrega. Google Workspace significa enlaces externos desde computadoras; no OAuth ni edición de documentos dentro de Pixel Office.

## Estado observado de la publicación

En la revisión del 4 de octubre de https://pixeloffice-pearl.vercel.app/ se observaron un recorrido individual, Recepción y Estudio, movimiento por teclado y joystick, apertura de puerta con E y cambio de pantalla. Se comprobó una colisión frontal con la biblioteca y su atenuación visual al pasar detrás.

No se verificaron el porcentaje exacto de opacidad, todos los sólidos, dispositivos móviles reales, diez usuarios, sesiones compartidas, chat, A/V, pizarrón o juegos. La interfaz anuncia llamadas, equipo y documentos para próximas etapas. La inspección de la publicación no incluyó el código fuente del repositorio.

## Entrega y vigencia

La demo estará terminada cuando cumpla todos los requisitos obligatorios de 04 y los recorridos de 06. Las etapas de 07 ordenan el trabajo; ninguna elimina chat, Snake o Pong de la entrega final. La personalización del mapa, las cuentas y la integración Google mediante APIs quedan fuera, incluso si después sobra tiempo, salvo nuevo cambio de alcance.
