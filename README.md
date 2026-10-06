# Pixel Office

Demo de portafolio de **Vice Labs** con Canvas 2D y TypeScript. Objetivo final: oficina fija, acceso sin cuenta y sesiones temporales de hasta diez participantes, según las especificaciones [00–08 v2](00_LEEME.md).

La aplicación implementa un **recorrido individual por la oficina completa** de la imagen `total-office.jpeg`. La composición de 1600×900 se dibuja como un fondo único; paredes, tabiques, bases de muebles, tableros, sillas, zonas de interacción y oclusión se definen por separado en el mapa. El avatar masculino conserva sus cuatro direcciones, PNG de reposo y cuadros de GIF de movimiento, con escala adaptada al escenario. El pizarrón permite alternar entre limpio y marcado; sus sprites finales y el GIF del tren siguen pendientes de recepción. Sesiones compartidas, chat, audio/vídeo, pantalla, accesos externos a Google Workspace, Snake y Pong siguen pendientes en la aplicación actual.

Cuentas, equipos persistentes, horarios, OAuth/APIs de Google, editor de mapas y tienda están fuera del alcance. Ver [inventario y faltantes de arte](docs/assets.md).

## Ejecutar

Node 22.14 o superior compatible con el lockfile.

```sh
npm ci
npm run dev
```

Abrir `http://127.0.0.1:5173`. WASD/flechas o joystick para moverse; E o **Interactuar** para cambiar el pizarrón o consultar las zonas de computadoras. La oficina completa conserva su proporción al cambiar el tamaño de pantalla.

API inicial opcional en otra terminal: `npm run dev:api`. Expone `http://127.0.0.1:3001/healthz` y `/maps/demo-v4/manifest`. Sólo contiene el mapa público de prueba; aún no autentica ni sincroniza usuarios.

## Verificar

```sh
npm run build
npm test
npm run test:e2e
```

Los recorridos usan Edge instalado. Si falta: `npx playwright install msedge`. La emulación móvil en Chromium no equivale a validar Safari iOS ni Android real. Consultar [validación](docs/validacion.md).

Para inspeccionar geometría durante desarrollo, abrir `http://127.0.0.1:5173/?debug=colliders`. La vista dibuja colliders en cian, regiones de oclusión en magenta, interacciones en amarillo, ventanas en azul y pies del avatar en verde. Sólo se activa en desarrollo; permite iniciar en una posición válida con `&x=1090&y=610` para revisar un escritorio.

## Docker y pruebas de usuario

```sh
docker compose up --build -d
```

Frontend: `http://localhost:8080`. API opcional: `docker compose --profile api up --build -d`. Los puertos se configuran con `.env.example`. Vercel apunta a `apps/web/dist`. El estado observado de la publicación del 4 de octubre está en [00](00_LEEME.md); estos comandos no acreditan que los cambios locales estén desplegados.

## Estructura

```text
apps/web/              Vite, DOM, Canvas, input y ciclo de vida
apps/api/              Fastify; salud y manifest público de I1
packages/contracts/    Dominio, protocolos, JSON Schema, geometría y mapa de prueba
tests/                 Pruebas unitarias, API y navegador
scripts/               Validación, arte provisional reproducible y servidor legacy
legacy/pre-alpha/      Versión anterior aislada; contiene también arte reciente pendiente de integrar
docs/                  Arquitectura, migración, pendientes y evidencia
```

La pre-alpha conserva código, recursos, A/V experimental, Snake y documentación histórica. Se ejecuta por separado con `npm run dev:legacy` en `http://127.0.0.1:3000`; no se incluye en el build productivo. Sus enlaces de sala PeerJS no son credenciales de la nueva arquitectura.

Ver [análisis y etapas](docs/reestructuracion.md), [arquitectura](docs/arquitectura.md), [assets](apps/web/public/assets/README.md) y [validación](docs/validacion.md).
