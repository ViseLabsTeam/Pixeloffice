# Validación de la reestructuración

> Registro histórico conservado del 2026-09-30. Resultados, IDs y pendientes corresponden a v1; sus gates abiertos no son el plan actual. Consultar el [estado de validación v2](../validacion.md) y el [alcance vigente](../../00_LEEME.md). El resto del registro se preserva como evidencia de aquella fecha.

Fecha: 2026-09-30. Base Git: `ed44923` más los cambios locales de esta reestructuración, sin commit nuevo. Especificaciones 1.0; mapa `demo-v1`. No es aceptación del alcance completo I1–I4.

## Entorno y resultados

Windows, Node 22.14.0, npm 10.9.2, Edge 154.0.4258.37, Playwright 1.63.0. Navegación por loopback sin A/V. Escritorio 1280×720 y emulación de iPhone 13 en Chromium (390×664 CSS, DPR 3; render limitado a DPR 2). No se midió red móvil ni hardware de referencia.

| Comprobación | Resultado / alcance |
| --- | --- |
| TypeScript estricto y builds web/API | Aprobados |
| JSON Schema y referencias del mapa | Dos escenas, entradas/portales válidos y IDs únicos |
| Recursos | 17 PNG; firmas, SHA-256 y regiones comprobadas |
| Vitest | 14 pruebas aprobadas: movimiento, colisión, oclusión, puertas, fallos de destino, API y contratos |
| Playwright, ejecución final | 4 pruebas aprobadas; 2 omitidas por perfil (50 cruces sólo escritorio, multitouch sólo móvil). Sin fallos |
| 50 cruces en navegador | Aprobados en Edge; el avatar cruza mediante input real de teclado |
| Input de escritorio y emulación móvil | Cuatro vistas, foco editable, blur y pointercancel comprobados |
| Multitouch RF-048 | Dos contactos mediante CDP: joystick sostenido y segundo dedo abre la puerta; transición confirmada. El botón procesa pointerup táctil y evita duplicar el click |
| Capturas de escritorio/portrait | Revisadas visualmente; sin desbordamiento horizontal ni controles sobre la escena |
| Docker | Frontend y API construidos en Linux; API arrancada en contenedor temporal y GET manifest = 200, dos escenas |
| Peso inicial | JS ≈44.7 kB gzip y CSS ≈1.80 kB gzip, según Vite; no equivale a benchmark de consumo |

Capturas regenerables: `test-results/desktop-office.png` y `test-results/mobile-office.png`. El directorio no se versiona; CI conserva resultados fallidos. Los tests refieren RF en sus nombres. Se verificaron por hash los 22 archivos originales de código, arte y documentación movidos a la pre-alpha.

## Requisitos cubiertos y límites

- RF-007/008/009/010/012/013/015/016/017: implementación local y pruebas espaciales; falta validar la composición con arte definitivo.
- RF-047/048: interfaz adaptable e input implementados; pendiente Android/iOS real y landscape con arte final.
- RF-011/014: apertura/oclusión locales preparadas; sincronización entre usuarios corresponde a I2.
- RNF-003/004: limpieza y dibujo por demanda implementados; falta jornada de dos horas y medición de memoria nativa.
- RNF-010: contratos versionados, tipado, builds y CI incorporados. CI remoto aún no ejecutado.

## Gates abiertos antes de ampliar el producto

1. **SP-03 / D-03 / D-10:** assets y referencia de Peredo, licencias, medidas definitivas y legibilidad mobile real. Los PNG actuales son provisionales.
2. **V01/V02/SP-04:** CPU p95, memoria atribuible, latencia de input, dos usuarios y comparación con IDE abierto. Los 50 cruces automatizados no acreditan estabilidad de memoria por dos horas.
3. **I2:** identidad/membresías, PostgreSQL, WS autoritativo, horarios, prórrogas idempotentes, reinicio y control por tenant.
4. **I3/I4:** conectividad de medios real, cámara/pantalla simultáneas, privacidad, capacidad de 15, Workspace y juegos; sin credenciales/proveedores contratados ni soporte anunciado.

Las imágenes Docker se construyeron como validación local. No se publicó en Vercel ni se reemplazó un entorno compartido. No se modificaron los documentos normativos 00–08 ni los pendientes de producto.
