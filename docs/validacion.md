# Estado de validación — demo v2

Actualizado el 2026-10-04. Alcance: [04](../04_REQUERIMIENTOS_Y_ACEPTACION.md) y escenarios de [06](../06_RENDIMIENTO_Y_PLAN_VALIDACION.md).

## Evidencia anterior

El [registro del 30 de septiembre](historico/validacion-v1.md) conserva resultados originales, entorno, IDs v1 y limitaciones del recorrido individual. No se ha convertido esa evidencia en aprobación automática de v2. La inspección publicada del 4 de octubre está registrada en [00](../00_LEEME.md).

Los nombres de las pruebas existentes se actualizan para referir a v2, pero sus aserciones siguen evaluando la base espacial/API inicial. Ninguna prueba existente demuestra diez participantes, A/V, chat, pizarrón o juegos integrados.

## Cobertura actual y brechas

| Parte implementada | Requisitos v2 relacionados | Lo que falta |
|---|---|---|
| Mapa fijo, geometría y spawns | V2-RF-005, V2-RF-007; V2-RNF-006 | Regiones/interacciones definitivas y autoridad de servidor |
| Movimiento, cuatro vistas provisionales e input | V2-RF-006, V2-RF-010, V2-RF-019 | Avatar hombre/mujer, ropa y pruebas Android/iOS reales |
| Puertas y 50 cruces locales | V2-RF-008 | Compartir estado y validar transiciones en servidor |
| Profundidad y oclusión local | V2-RF-009 | Arte definitivo y ocultación de ocupantes de ambientes ajenos |
| Limpieza local y render bajo demanda | V2-RNF-004 | Recursos multimedia, paneles, sesiones y medición prolongada |
| API salud/manifest y schema de comando | V2-RNF-006 | Endpoints de sesiones/WS y autorización con credenciales temporales |

## Validación de la alineación del 4 de octubre

Base Git: `d20baa3` más cambios locales sin commit. Windows, Node 22.14.0 y npm 10.9.2.

| Comprobación ejecutada | Resultado |
|---|---|
| `npm run build` (alineación anterior) | TypeScript, validación de assets y builds API/web aprobados para `demo-v1`; dos escenas y 17 PNG provisionales verificados. Este resultado no cubre `demo-v2`. |
| `npm run build` (integración inicial de arte) | TypeScript y builds API/web aprobados para `demo-v2`; dos escenas y 20 PNG verificados por firma, SHA-256 y región. No acredita apariencia, escala final ni recorrido móvil. |
| `npm test` | 14 pruebas aprobadas en dos archivos; geometría y API/contratos iniciales |
| Enlaces Markdown locales de documentos vigentes | 40 destinos existentes |
| Trazabilidad 04 → 06 | Los 22 requisitos funcionales y ocho no funcionales tienen escenario de validación |
| Búsqueda de referencias v1 activas | Sin IDs antiguos de requisitos ni entidades de equipo/jornada fuera de registros históricos; las exclusiones siguen documentadas |
| `git diff --check` | Sin errores de whitespace |

No se ejecutó Playwright en esta edición ni se realizaron recorridos multiusuario o pruebas en dispositivos reales. Los tests aprobados no certifican las funciones futuras de la demo.

## Aceptación final pendiente

I1 sigue parcial por arte y dispositivos reales. I2–I4 requieren implementación y todos los recorridos aplicables de 06. La capacidad de diez, los presupuestos de consumo, el aislamiento multimedia, el pizarrón y los juegos siguen pendientes de evidencia.

Los cambios locales de esta alineación no se han publicado. El estado de la publicación no se deduce de un build local.
