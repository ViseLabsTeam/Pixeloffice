# 07 — Decisiones y plan de implementación v2

**Versión:** 2.0 · **Fecha:** 2026-10-04.

## 1. Cambios de alcance

| Tema | Objetivo vigente | Origen |
|---|---|---|
| Producto | Demo de portafolio de Vice Labs | 00 |
| Acceso/capacidad | Sin cuenta, sesiones temporales de hasta diez participantes | 00 |
| Oficina | Plantilla fija; sin edición ni muebles movibles | 00/08 |
| Google Workspace | Enlaces externos desde computadoras | 00 |
| Juegos | Snake y Pong obligatorios | 00/08 |
| Arte/avatar | Diseño de Peredo, exports separados, cuatro vistas hombre/mujer y máscara de ropa | 08 |
| Pizarrón | Lienzo/presentación en panel; sprites limpio/sucio en mapa | 08 |
| Estado | Puertas, dibujo y presentación temporales; plantilla versionada | 08 |
| Exclusiones | Cuentas, OAuth/API Google y personalización no vuelven al plan por existir en v1 | 00 |
| Comercial | Sin editor, tienda, planes ni economía como etapa de esta entrega | Aplicación del alcance de 00/08 |

## 2. Criterios adoptados y recomendaciones

Los detalles siguientes son precisiones de ingeniería para hacer ejecutable la demo, no acuerdos adicionales atribuidos al usuario.

| ID | Criterio |
|---|---|
| V2-C01 | Crear/unirse por enlace opaco y usar identidad temporal de participante; sin privilegio especial del creador. |
| V2-C02 | Permitir recorrido individual y mantener la sesión cuando sale el creador. |
| V2-C03 | Reservar presencia al cortar conexión; gracia y expiración configurables; contar reservas en el cupo. |
| V2-C04 | Estado de sesión en memoria y cierre visible tras reinicio; no recuperación durable. |
| V2-C05 | Audiencia por ambiente y proximidad indicada en plantilla, con bloqueos acústicos explícitos; sin heredar grupos privados/reuniones de v1. |
| V2-C06 | Chat y dibujo del ambiente; una presentación por pizarrón, liberada al cambiar de ambiente o desconectarse. |
| V2-C07 | Snake individual y Pong autoritativo de dos; sin economía ni historial. |
| V2-C08 | Mantener TypeScript/Vite/Canvas/Fastify y recomendar WS + SFU; LiveKit pendiente de viabilidad/coste. |
| V2-C09 | Conservar versiones técnicas de mapa/schema/protocolo mientras no cambie su contrato; v2 identifica alcance de producto. |

## 3. Pendientes concretos

| ID | Decisión o evidencia faltante | Antes de |
|---|---|---|
| V2-D01 | Duración de gracia de reconexión/vacío, expiración de sesión y límites de creación; política que no elimine reservas aún válidas | I2 |
| V2-D02 | Plano final: escenas, regiones, spawns, alcances y bloqueos acústicos sin ambigüedad | Integrar mapa/activar audiencias |
| V2-D03 | Assets restantes, medidas, escala, pivots, máscaras, autoría y nombres de exports | Aceptar arte I1 |
| V2-D04 | Hosting API/WS, SFU, región, coste y capacidad total de sesiones simultáneas | Publicación compartida |
| V2-D05 | Límites de nombre/chat, historial, trazos, frecuencia, reservas de presentación y snapshots | I2/I3 |
| V2-D06 | Paleta de ropa/lápiz legible y comportamiento del borrado concurrente | I3 |
| V2-D07 | Destinos HTTPS concretos de computadoras e iconos del panel | I4 |
| V2-D08 | Hardware/red de referencia y matriz real de navegadores/captura | Aceptación final |
| V2-D09 | Detalles de controles/reglas de Snake y Pong y tratamiento de abandono | I4 |

Estos pendientes permiten avanzar en trabajo independiente. No habilitan agregar funciones excluidas. Los antiguos D-xx/SP-xx dejan de ser el plan vigente.

## 4. Etapas

### I1 — Espacio y arte

Usar `SIN MUEBLESL.png` como fondo fijo, con mesa, silla y planta como objetos separados. Mantener colliders e interacciones en coordenadas del mapa; dibujar el avatar sobre todo el fondo y ordenar los muebles separados con opacidad completa. El avatar masculino de cuatro vistas ya está integrado con reposo y movimiento. Completar el GIF del tren, los sprites limpio/sucio del pizarrón, el avatar femenino y las máscaras de ropa cuando se entreguen.

Salida: evidencia espacial V2-V02 en su parte local, V2-V10, V2-V13 y V2-V14. El prototipo actual cubre parte de I1; faltan arte definitivo y dispositivos reales.

### I2 — Sesiones temporales

Crear/unirse por enlace, identidad efímera, cupo diez, WS, snapshots, puertas compartidas, autoridad espacial y reconexión. Implementar expiración y limpieza de estado en memoria.

Salida: V2-V01–V2-V04, V2-V11 y validación de comandos en V2-V14. No introducir cuentas, membresías, horarios o PostgreSQL.

### I3 — Comunicación y pizarrón

Validar proveedor de medios con dos redes, luego incorporar audiencias de ambiente/proximidad, chat, cámara/micrófono, pantalla y reservas. Implementar lienzo compartido, lápiz/goma y sprites limpio/sucio.

Salida: V2-V05–V2-V07, aislamiento real y medición de medios para diez. Resolver acústica, límites y concurrencia antes de anunciarlo disponible.

### I4 — Accesos, juegos y entrega

Conectar enlaces externos de computadoras, adaptar Snake y construir Pong de dos. Completar arte/UI y recorridos escritorio/móvil, compatibilidad y consumo prolongado.

Salida: V2-V08–V2-V14 y todos los requisitos de 04. Los juegos y el chat no se excluyen si falta tiempo: la entrega queda incompleta.

## 5. Riesgos y respuesta

| Riesgo | Respuesta |
|---|---|
| Documentación vieja reintroduce funciones | 00–08 v2 gobiernan; material histórico se identifica y no define backlog. |
| Arte incompleto o fondo aplanado | Inventario explícito, exports por capas y paquete pequeño antes de ampliar escenas. |
| Diez vídeos saturan móvil | Suscripción selectiva, calidad adaptable y medición real según 06. |
| Audiencia sólo filtrada en UI | Autorización de servidor/medios y prueba con cliente alterado. |
| Sesión compartida sin límites | Cupo, caducidad y límites de mensajes/recursos validados en backend. |
| Reinicio pierde contenido | Comportamiento temporal explícito y opción de crear otra sesión. |
| Confundir tests antiguos con aceptación v2 | Conservar evidencia histórica y registrar nuevas ejecuciones con commit y alcance. |
