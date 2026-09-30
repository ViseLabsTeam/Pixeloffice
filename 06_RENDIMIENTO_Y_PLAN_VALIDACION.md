# 06 — Rendimiento y plan de validación

**Versión:** 1.0 · **Fecha:** 2026-09-30 · **Prioridad:** requisito transversal de producto.

## 1. Objetivo

La aplicación permanecerá abierta mientras se programa, compila, consulta documentación y utilizan otras herramientas. Debe reducir el consumo en reposo, limitar recursos de medios y no degradarse con el tiempo. Evaluar carga inicial, CPU/GPU, memoria, red, latencia y batería. Una animación fluida no demuestra consumo reducido.

No hay mediciones certificadas de la pre-alpha. Todos los números de este documento son **presupuestos iniciales propuestos**, no compromisos de rendimiento ya alcanzados ni requisitos numéricos dictados por el usuario. Tras el primer benchmark, aprobar o ajustar objetivos con evidencia y versión.

## 2. Perfil de referencia propuesto

- Notebook Windows con cuatro procesadores lógicos, 8 GB de RAM, SSD y gráficos integrados; registrar modelo real antes de medir.
- Navegador estable y perfil de pruebas limpio; comparar Chromium y Firefox/Safari según matriz.
- IDE, proyecto real, servidor local y herramientas habituales abiertos. Registrar compilación de referencia con y sin Pixel Office.
- Red normalizada: 10 Mbps disponibles de descarga, 5 Mbps subida, 80 ms RTT y pérdida inferior al 1 % para pruebas funcionales; sumar degradación específica.
- Mobile: un Android de gama media con 4 GB y un iPhone disponible, con modelos/OS concretos al iniciar QA. No inferir comportamiento de uno a partir del otro.

Registrar resolución, DPR, número de escenas/objetos, versión de assets, vídeo recibido/publicado, navegador, temperatura y energía. Los FPS de mapa y de cámara son métricas distintas.

## 3. Presupuestos propuestos

| Métrica | Objetivo inicial | Método y alcance |
|---|---|---|
| JS inicial de mapa/UI | ≤250 KiB transferidos con compresión | Build productivo; excluye SDK A/V y juegos diferidos. |
| JS total con A/V cargado | ≤700 KiB comprimidos | Incluir dependencias transitivas y duplicados. |
| Transferencia inicial hasta mapa usable | ≤3 MiB | HTML/CSS/scripts/font/assets necesarios; caché fría. |
| Entrada interactiva en red de referencia | ≤4 s | Desde navegación autenticada hasta mapa/input; OAuth externo medido aparte. |
| CPU de mapa quieto sin A/V | ≤3 % de CPU total, p95 | Muestras 1 s durante 5 min; declarar normalización de herramienta. |
| CPU con movimiento sin A/V | ≤8 % de CPU total, p95 | Dos escenas y 15 avatares; dispositivo de referencia. |
| CPU conversación de cuatro | ≤20 % de CPU total, p95 | Cuatro cámaras moderadas + audio; registrar códecs, layers y tamaño. |
| Memoria atribuible sin A/V | ≤250 MiB | Medida de pestaña/renderer con método documentado; separar memoria GPU compartida. |
| Memoria conversación de cuatro | ≤500 MiB | Incluir buffers nativos de medios en método cuando sea posible. |
| Estabilidad de memoria | Sin crecimiento retenido sostenido; aumento final ≤15 % | Tras warm-up, 2 h y limpieza; repetir por fugas, no por ruido puntual. |
| Mapa en uso | 30 FPS estables como perfil base | p95 frame ≤33.3 ms; 60 FPS opcional si cumple consumo. |
| Respuesta local al movimiento | p95 ≤100 ms | De input a respuesta visible. |
| Movimiento remoto | p95 ≤250 ms | Red de referencia; registrar tiempo servidor y recepción. |
| Entrada enviada | Máximo 15 mensajes/s por usuario | Sólo durante cambio/movimiento; heartbeat separado. |
| Vídeos recibidos habituales | Sólo audiencia activa, hasta 5 remotos para grupo de seis | Sin pistas ocultas innecesarias. |
| Daily | Máximo inicial 9 vídeos remotos visibles por dispositivo | Speaker/grilla paginada; 15 participantes siguen en reunión. |
| Caché gráfica | ≤64 MiB de bitmaps decodificados como objetivo | Escena actual y hasta dos vecinas completas; otras sólo metadata/bytes si caben. |

CPU incluye coste multimedia del cliente aunque corresponda a procesos auxiliares. Las herramientas varían: documentar comparación de memoria/CPU, no mezclar heap JS con memoria total. Si un límite falla, localizar coste y reducirlo; modificar presupuesto requiere justificación y registro.

## 4. Estrategia de optimización

### Render y entrada

Preparar fondo y elementos estáticos por escena. Redibujar capas dinámicas cuando cambian; oclusión sólo en candidatos cercanos que pueden superponerse. Índice espacial simple para colisión/oclusores cuando el perfil lo justifique. Reutilizar buffers y objetos de frame; evitar reconstruir DOM de cada avatar cada ciclo. [P1]

Mantener precisión de simulación separada de rasterización del pixel art. Render con escalas/pivots coherentes y límite de DPR configurable, para no multiplicar el framebuffer de forma innecesaria. No ejecutar juego o animación de descanso fuera de su panel. Elegir 30 FPS base; nunca ajustar velocidad física por FPS.

### Segundo plano

Detectar visibilidad de página y reducir o suspender trabajo visual; mantener comunicación necesaria y estado de servidor. Al volver, obtener estado actual. No atar heartbeat/cierre a rAF. Los navegadores aplican sus propias restricciones de segundo plano; testear reconexión y mobile real. [P2]

No apagar automáticamente la cámara del emisor sólo porque escondió su pestaña: otros pueden estar viéndolo. Reducir vídeo recibido que no se muestra cuando sea posible. Dar un modo ahorro explícito que permita audio solo y conserve la elección del usuario.

### Audio/vídeo

Miniaturas moderadas: propuesta inicial cámara 360p/15 FPS, con adaptación a 180p o audio solo. Para pantalla de texto, priorizar legibilidad con frecuencia moderada; vídeo compartido requiere perfil aparte. Publicar sólo a contexto activo, usar autoSubscribe=false, seleccionar pistas y activar opciones de adaptación del SDK después de validación. No recibir todas las cámaras y esconderlas en CSS. [P3]

Indicador de habla aprovecha evento del proveedor cuando suficiente; no agregar analizadores por avatar sin necesidad. Evitar duplicar procesamiento de audio entre SDK y app. Al abandonar contexto, desuscribir/detach/limpiar medios.

### Recursos y datos

Assets recortados y atlases organizados; carga diferida de SDK A/V, juegos y Workspace. Caché con presupuesto y descarga versionada; no un archivo enorme con toda la oficina futura. World state sólo de escena relevante; contador/directorio del resto sin posición de alta frecuencia. Coalescer updates y limitar payload, chat y rate. Evitar escrituras de posición a DB por tick.

## 5. Escenarios de validación

| ID | Escenario | Requisitos principales y evidencia |
|---|---|---|
| V01 | Primer usuario en espera; quieto y moviéndose | RF-006/009, RNF-001/004; CPU, memoria, FPS e input. |
| V02 | Dos usuarios en escenas distintas; 50 cruces | RF-007/008/017/039, RNF-003; logs de transición y memoria estabilizada. |
| V03 | Conversación cuatro, IDE y compilación | RF-018/021/025, RNF-001; consumo, latencia y comparación de tarea real. |
| V04 | Quince en oficina distribuidos en grupos de 2–6 | RF-023/027, RNF-002/006; tráfico por contexto y aislamiento. |
| V05 | Daily quince, cámaras publicadas y grilla limitada | RF-027, RNF-002; bitrate/subscripciones, CPU, voces y paginación. |
| V06 | Cámara + pantalla de código + nuevo espectador | RF-028/030/049; legibilidad, reserva, calidad y limpieza. |
| V07 | Jornada 2 h con juegos, cambios y segundo plano | RNF-003/004; curvas de memoria, handlers/tracks y reanudación. |
| V08 | Administrador sale y vuelve; oficina vacía 15:00–15:20 | RF-004/032/034; transición y datos conservados. |
| V09 | Prórroga duplicada/concurrente y cierre vencido | RF-035/037/039; DB revision, ACK, timer servidor y expulsión efectiva. |
| V10 | Android/iOS: joystick, chat, orientación, documentos | RF-047/049, RNF-008/009; vídeo de recorrido y consumo/temperatura. |
| V11 | Red degradada: 200 ms RTT, 3 % pérdida y corte 20 s | RF-039, RNF-006; reconexión, no duplicación y calidad degradada. |
| V12 | Cliente alterado y tokens de contexto expulsado | RF-002/003/023, RNF-006; denegación real en backend y SFU. |
| V13 | Google: permitido, denegado, revocado y conflicto | RF-040/043; archivos de prueba, scopes y ausencia de publicación accidental. |
| V14 | API reinicia cerca del cierre, SFU continúa | RF-037/039, RNF-012; reconstrucción autoritativa y limpieza reintentada. |
| V15 | Snake/Pong bajo uso habitual | RF-044/046, RNF-003; foco, resultado sincronizado y loops desmontados. |

Primero verificar dos clientes reales en redes distintas; una prueba con bots/headless evalúa escala del servidor pero no prueba consumo de cámara en notebooks o conectividad móvil. Para V05 registrar medios sintéticos y reales por separado y probar recepción en al menos un dispositivo de referencia real.

## 6. Matriz de compatibilidad

Validar las dos últimas versiones estables disponibles al ejecutar QA de Chrome/Edge y Firefox en escritorio, Safari macOS cuando disponible, Chrome Android y Safari iOS. Registrar versiones concretas, no declarar soporte sin ejecutarlas.

Por función registrar: mapa/input; recepción A/V; publicación cámara/mic; recepción presentación; captura de pantalla; audio del sistema; selector de salida; Google; comportamiento oculto. Una API presente no garantiza que todas sus opciones funcionen. Captura de pantalla y audio de sistema tienen soporte variable; mostrar alternativa por función. [P4]

## 7. Definition of Done y evidencias

Cada incremento: build de producción, validación de contratos/assets, pruebas pertinentes de reglas críticas, recorrido escritorio/mobile y comparación de rendimiento. Archivar resultados con commit, dispositivos, red, perfiles de medios, métricas p50/p95 y limitaciones. No registrar documentos/medios del equipo real para usar como evidencia sin autorización.

Cerrar fugas y errores antes de ampliar features. La capacidad de 15 sólo se anuncia al pasar V04/V05; «liviana» requiere V01/V03/V07 sobre dispositivo real. No introducir complejidad de optimización sin perfil, pero no postergar liberación de recursos/aislamiento hasta una fase futura.

## Fuentes

- **P1:** https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
- **P2:** https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
- **P3:** https://docs.livekit.io/transport/media/subscribe/
- **P4:** https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia

Consultadas el 2026-09-30. Los presupuestos y escenarios son propios del proyecto y no cifras garantizadas por esas fuentes.
