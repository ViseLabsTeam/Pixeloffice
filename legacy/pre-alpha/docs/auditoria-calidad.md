# Auditoría de calidad

> Auditoría histórica de la pre-alpha. Sus pendientes no constituyen el backlog vigente. Consultar [00–08 v2](../../../00_LEEME.md) y el [plan actual](../../../07_DECISIONES_Y_PLAN_IMPLEMENTACION.md).

Esta auditoría parte de la revisión del repositorio antes de la reorganización y distingue los problemas corregidos de los que requieren decisiones de producto o infraestructura.

| Hallazgo | Impacto | Estado |
| --- | --- | --- |
| Una página HTML concentraba marcado, CSS, red, Canvas, UI y Snake. | Alto: cambios difíciles de probar y revisar. | Corregido con módulos ES y CSS externo. |
| Recursos con hashes, carpetas dispersas y archivos sin uso visible. | Medio: baja trazabilidad. | Corregido: rutas y nombres descriptivos; los no usados se documentan. |
| `.idea` estaba versionado y no existían reglas de ignorados. | Medio: ruido específico de un IDE. | Corregido con `.gitignore` y retirada de `.idea`. |
| Estado global, `window.UILayer` y payloads de jugador duplicados. | Alto: acoplamiento y divergencias. | Corregido con inyección de dependencias y `playerSnapshot()`. |
| Bloques `catch` vacíos y temporizadores sin ciclo de vida. | Alto: fallos ocultos y fugas de recursos. | Corregido: avisos, `destroy()` y limpieza en `pagehide`. |
| Identificadores remotos se interpolaban en HTML. | Medio: superficie de inyección. | Corregido: creación de nodos y `textContent`. |
| El selector de skin sólo restringía la UI. | Medio: entradas no verificadas. | Corregido: verificación del MIME PNG y manejo de errores. |
| No hay pruebas automatizadas, lint ni CI. | Alto a futuro: regresiones no detectadas. | Pendiente. |
| Dependencias CDN y servicio público de PeerJS. | Medio: disponibilidad y versiones externas. | Pendiente: fijar estrategia de dependencias y señalización propia. |
| La malla P2P no incluye TURN, autenticación ni control de tamaño de payload. | Alto para producción pública. | Pendiente: requiere requisitos de seguridad y operación. |

## Reglas de mantenimiento

- Una responsabilidad por módulo y dependencias explícitas por importación.
- No ocultar errores: informar contexto y dejar el estado de UI coherente.
- Centralizar constantes, URLs y formatos compartidos.
- No introducir datos remotos en `innerHTML`; usar nodos DOM o `textContent`.
- Todo recurso abierto debe tener una ruta de cierre: streams, canales, llamadas y temporizadores.
- Añadir pruebas de módulos y una comprobación en CI antes de ampliar funcionalidades.
