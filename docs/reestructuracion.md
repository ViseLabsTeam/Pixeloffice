# Reestructuración según especificaciones 00–08

Fecha: 2026-09-30. Base: documentos 1.0. Este registro no modifica las reglas de producto.

## Comparación con el repositorio recibido

| Área | Pre-alpha auditada | Nueva base |
| --- | --- | --- |
| Cliente | JS sin build; Tailwind/PeerJS/iconos CDN | TypeScript estricto, Vite, DOM y CSS propios |
| Mundo | Una matriz de 30×16 tiles; cinco zonas visibles juntas | Dos escenas de datos con portales y entradas validadas (RF-007/008/017) |
| Movimiento | Velocidad por frame; diagonal más rápida | Tiempo de simulación, vector normalizado y subpasos (RF-009/010) |
| Joystick | Touch Events; intensidad reducida a signo | Pointer Events, magnitud analógica, cancelación y multitouch (RF-048) |
| Arte | Muebles dibujados antes de avatares; sin oclusión | Catálogo, pivots, collider/máscara independientes y orden de profundidad (RF-012/016) |
| Avatares | Skin único; dirección sin cuatro vistas | Cuatro vistas estáticas de prueba con apoyo consistente (RF-015) |
| Red | PeerJS + BroadcastChannel global; URL de host | Pre-alpha aislada; API propia y contratos preparados, sin simular identidad (I2) |
| Ciclo de vida | rAF sin cancelación; listeners permanentes | Propietario del ciclo, reposo sin frames, limpieza y visibilidad (RNF-003/004) |
| Datos | Sin base ni identidad persistente | Límites de módulos definidos para I2; no se presenta memoria local como persistencia |
| Workspace | Enlaces a páginas de Google | Integración OAuth/API pendiente de I4 y SP-02 |
| Juegos/A/V | Snake y llamadas experimentales | Código conservado para migración I3/I4; no cargado por el nuevo motor |
| Calidad | Sin compilación ni pruebas | Contratos validados, pruebas de geometría, API y recorridos de navegador |

## Alcance de esta reestructuración

Se adopta la estructura de `03` y se implementa la porción espacial I1 de `07`. La pre-alpha se conserva ejecutable en `legacy/pre-alpha` para comparación; no se incluye en el build nuevo. La API inicial sirve salud y el manifest público de demostración. Todavía no admite usuarios ni emite tokens multimedia.

El arte de prueba será original y reemplazable; sus medidas son parámetros del prototipo, no dimensiones aprobadas para Peredo. D-03, D-10, D-12 y D-13 continúan pendientes. Se requieren exports/referencia y licencias para cerrar SP-03. Los presupuestos de consumo requieren hardware real y SP-04.

## Siguientes etapas y puertas de salida

1. **I1:** recorrer dos escenas, comprobar colisiones, oclusión, cuatro vistas, cancelación de input y 50 cruces. Completar SP-03/SP-04 y V01/V02 sobre dispositivos reales antes de ampliar el mapa.
2. **I2:** OIDC, membresías y capacidades por tenant; PostgreSQL y migraciones; jornada UTC desde zona IANA, revisión/idempotencia, cierre durable y recuperación; WS autenticado y autoridad espacial compartida. Gates V08/V09/V12/V14. Resolver D-01/02/05.
3. **I3:** SP-01, LiveKit y audiencia autorizada, grupos aislados, chat, daily y pantalla independiente con reservas. Gates V03–V06/V11/V12. Resolver D-04/06/07.
4. **I4:** SP-02, permisos Google, selección/vínculos y operaciones Docs/Sheets; portar Snake con limpieza y construir Pong autoritativo. Gates V07/V10/V13/V15. Resolver D-08/09.
5. **I5:** editor y derechos de uso; reglas comerciales explícitas antes de puntos/cobros. D-14 pendiente.

Fuentes de compatibilidad consultadas: [Vite](https://vite.dev/guide/) y [validación Fastify](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/). Las versiones exactas instaladas quedan en `package-lock.json`.
