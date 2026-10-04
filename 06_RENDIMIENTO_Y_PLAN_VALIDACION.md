# 06 — Rendimiento y plan de validación

**Versión:** 2.0 · **Fecha:** 2026-10-04 · **Estado:** objetivos propuestos, sin medición v2 completa.

## 1. Método

Validar la demo junto con herramientas de trabajo habituales, declarando commit, hardware, sistema, navegador, red, resolución, DPR y cantidad de participantes/medios. Medir cliente y servidor por separado. Emulación móvil y bots no sustituyen pruebas de Android/iOS o medios en dispositivos reales.

Comparar reposo, movimiento, conversación de cuatro y sesión de diez. Registrar latencias p50/p95, memoria atribuible, CPU, frames y tráfico. No confundir heap JavaScript con memoria total ni peso de build con consumo de ejecución.

## 2. Presupuestos iniciales

Se conservan como propuestas de ingeniería los presupuestos útiles del prototipo, adaptados a diez participantes. No son resultados ni garantías de proveedores. Cualquier ajuste requiere medición y motivo registrado.

| Métrica | Objetivo inicial | Condición |
|---|---|---|
| JS inicial mapa/UI | ≤250 KiB comprimidos | Sin SDK de medios ni juegos diferidos |
| JS con A/V cargado | ≤700 KiB comprimidos | Incluir dependencias transitivas |
| Transferencia hasta mapa usable | ≤3 MiB | Caché fría |
| Entrada interactiva | ≤4 s | Desde entrar a sesión hasta mapa/input; declarar red |
| CPU de mapa quieto sin A/V | ≤3 % del total, p95 | Muestras de 1 s durante 5 min; declarar normalización |
| CPU en movimiento sin A/V | ≤8 % del total, p95 | Diez avatares y dos escenas |
| CPU conversación de cuatro | ≤20 % del total, p95 | Calidad y códecs registrados |
| Memoria sin A/V / con cuatro | ≤250 / ≤500 MiB | Método que contemple medios nativos |
| Estabilidad de memoria | Aumento retenido final ≤15 % | Tras calentamiento y 2 h con limpieza |
| Render | 30 FPS base; p95 frame ≤33.3 ms | Movimiento; reposo sin frames innecesarios |
| Respuesta local / movimiento remoto | p95 ≤100 / ≤250 ms | Red de referencia documentada |
| Entrada de movimiento | Máximo 15 mensajes/s por participante | Heartbeat separado; sin emitir movimiento en reposo |
| Cámara inicial propuesta | 360p, 15 FPS | Adaptar calidad y reducir suscripciones |
| Vídeos remotos | Hasta nueve en sesión de diez | Sólo audiencia autorizada; paginar/reducir según dispositivo |
| Bitmaps decodificados | ≤64 MiB | Caché y expulsión acotadas; recursos por escena |

Diez participantes no obliga a decodificar nueve vídeos permanentemente en cada celular. La interfaz debe permitir conversación y presentación legibles con límites de recepción explícitos. La capacidad total de sesiones simultáneas del servicio se define con el hosting; no se deduce del cupo por sesión.

## 3. Recorridos de aceptación

| ID | Escenario y evidencia | Requisitos |
|---|---|---|
| V2-V01 | Entrar sin cuenta, crear sesión, recorrer solo, nombre/avatar y error de enlace | V2-RF-001, V2-RF-002, V2-RF-010, V2-RF-021 |
| V2-V02 | Dos clientes, 50 cruces, puertas compartidas, sólidos y recuperación tras fallo de destino | V2-RF-005, V2-RF-006, V2-RF-007, V2-RF-008 |
| V2-V03 | Diez plazas, ingresos concurrentes y rechazo de undécima; dos sesiones aisladas | V2-RF-003, V2-RF-011, V2-RNF-002, V2-RNF-003 |
| V2-V04 | Creador sale, corte/reconexión, credencial retomada desde otra pestaña y expiración de reserva | V2-RF-002, V2-RF-004, V2-RF-021 |
| V2-V05 | Chat y A/V de cuatro; cambio de ambiente, proximidad, paredes/puertas y cliente alterado | V2-RF-011, V2-RF-012, V2-RF-013, V2-RNF-003 |
| V2-V06 | Diez conectados con medios, cámara + pantalla, audiencia y reservas concurrentes | V2-RF-003, V2-RF-013, V2-RF-014, V2-RNF-001 |
| V2-V07 | Dibujo/borrado concurrentes, incorporación tardía, limpio/sucio y presentación sin borrar trazos | V2-RF-014, V2-RF-015 |
| V2-V08 | Computadora abre destinos HTTPS externos; permisos denegados en destino no rompen sesión | V2-RF-016, V2-RNF-003 |
| V2-V09 | Snake completo y Pong de dos: tercer jugador, abandono, reinicio y cierre del panel | V2-RF-017, V2-RF-018, V2-RNF-004 |
| V2-V10 | Android/iOS real, portrait/landscape, joystick + acción, escritura, paneles y permisos | V2-RF-019, V2-RF-021, V2-RNF-005, V2-RNF-007 |
| V2-V11 | Sesión vacía expira, reinicio API, credenciales anteriores y nueva sesión limpia | V2-RF-020, V2-RNF-008 |
| V2-V12 | Dos horas, segundo plano, red degradada y recuperación; CPU/memoria/recursos con IDE abierto | V2-RNF-001, V2-RNF-004 |
| V2-V13 | Arte real contra referencia: escala, pies, transparencia del 90 % (opacidad 0.1), máscaras, ambientes y sprites | V2-RF-009, V2-RF-010, V2-RF-022 |
| V2-V14 | Build, schemas, assets, versiones y comandos malformados; límites de payload/frecuencia | V2-RNF-002, V2-RNF-003, V2-RNF-006 |

En V2-V05/V06 usar al menos dos redes reales y registrar qué participantes/medios son sintéticos. En V2-V12 incluir corte de 20 s, RTT de 200 ms y pérdida del 3 % como perfil propuesto, además de red normal. Comparar con los tiempos de gracia aprobados antes de interpretar reconexión.

## 4. Compatibilidad y evidencia

Registrar versiones concretas de Chrome/Edge y Firefox de escritorio, Safari macOS cuando disponible, Chrome Android y Safari iOS. Verificar mapa/input, chat, dibujo, juegos, recepción/publicación de medios y captura de pantalla por separado.

Si la captura no está disponible, permitir recibir presentaciones y continuar usando la oficina; mostrar que ese dispositivo no puede presentar. No declarar una API compatible sólo porque existe su nombre en el navegador.

Cada resultado incluye fecha, commit, pasos, métricas/capturas y limitaciones. `docs/validacion.md` contiene antecedentes del recorrido individual; no certifica los escenarios v2. La entrega sólo se cierra con requisitos y recorridos cubiertos, incluidos juegos y arte final.
