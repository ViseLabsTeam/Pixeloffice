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

### Collider de escritorio — 2026-10-05

Se midieron los tableros en los cuatro PNG oficiales de escritorio y se reemplazó la colisión de patas por el área completa de cada tablero. Las cuatro mesas se ubicaron a `y=220` para permitir paso posterior sin meter los pies en el tablero. La máscara de oclusión, la opacidad mínima de 0.1 y el ancla de profundidad permanecen independientes. La biblioteca conserva su collider bajo y su máscara alta.

La vista temporal `?debug=colliders` muestra sprite, máscara, colliders y caja de pies; la captura local `test-results/desk-colliders.png` permitió revisar la alineación, pero no se versiona. `npm run build` aprobó TypeScript, el manifest `demo-v2` y sus 20 PNG. `npm test` aprobó 19 pruebas. Playwright aprobó seis recorridos de navegador: entrada desde atrás, delante, ambos laterales y diagonales con teclado en escritorio y joystick en escritorio/emulación móvil; además verificó la biblioteca con ambos controles. Se omitieron dos recorridos de teclado del perfil móvil. La emulación no acredita comportamiento en dispositivos físicos.

### Avatar masculino — 2026-10-05

Se integraron los cuatro PNG de reposo y los cuatro GIF de movimiento. El generador extrae diez cuadros PNG sin reinterpretar el pixel art y conserva las duraciones originales. El render muestra el PNG al detenerse y avanza los cuadros sólo al desplazarse; el collider de pies no depende del cuadro. `npm run build` aprobó TypeScript, los builds API/web y los 30 PNG del manifest `demo-v3` por firma, SHA-256 y región. No se ejecutaron recorridos de navegador ni pruebas automatizadas adicionales en esta integración.

### Oficina compuesta — 2026-10-06

`demo-v4` usa `total-office.jpeg` a 1600×900 como fondo único, 20 colliders de escena y zonas separadas de oclusión, ventanas e interacción. La vista `?debug=colliders` se inspeccionó en una captura de escritorio; el fondo, avatar y geometría comparten la misma escala. `npm run build` aprobó TypeScript, los builds API/web y las 15 imágenes referenciadas. `npm test` aprobó siete pruebas, incluida una búsqueda de rutas transitables hacia las zonas de interacción.

Playwright aprobó 12 recorridos en Edge de escritorio y emulación móvil: tablero desde atrás, delante, ambos laterales y diagonal con teclado/joystick, base de biblioteca, cuatro direcciones del avatar, cambio local del pizarrón, joystick y proporción al cambiar viewport. Se omitieron dos recorridos de teclado en perfil móvil y dos pruebas del tren: el GIF solicitado no está en los assets recibidos. La vista marcada del pizarrón usa trazos temporales; tampoco se recibieron sus sprites limpio/sucio. No se han verificado tren animado, sprites definitivos ni dispositivos físicos.

I1 sigue parcial por arte y dispositivos reales. I2–I4 requieren implementación y todos los recorridos aplicables de 06. La capacidad de diez, los presupuestos de consumo, el aislamiento multimedia, el pizarrón y los juegos siguen pendientes de evidencia.

Los cambios locales de esta alineación no se han publicado. El estado de la publicación no se deduce de un build local.
