# Pixel Office

Oficina virtual web con Canvas 2D y TypeScript. El proyecto está en migración hacia las especificaciones [00–08](00_LEEME.md).

La nueva aplicación implementa un **recorrido individual de dos escenas**: portales, puertas locales, colisiones de pies, cuatro orientaciones, profundidad, oclusión hasta 5 % y joystick analógico. El arte es provisional. Cuentas, sesiones multiusuario, horarios, LiveKit y Google Workspace corresponden a las siguientes etapas y todavía no están activados en este recorrido.

## Ejecutar

Node 22.14 o superior compatible con el lockfile.

```sh
npm ci
npm run dev
```

Abrir `http://127.0.0.1:5173`. WASD/flechas o joystick para moverse; E o **Interactuar** para abrir puertas y examinar objetos. La puerta derecha de recepción conecta con el estudio; la izquierda del estudio permite volver. La escena completa conserva su proporción al cambiar el tamaño de pantalla.

API inicial opcional en otra terminal: `npm run dev:api`. Expone `http://127.0.0.1:3001/healthz` y `/maps/demo-v1/manifest`. Sólo contiene el mapa público de prueba; aún no autentica ni sincroniza usuarios.

## Verificar

```sh
npm run build
npm test
npm run test:e2e
```

Los recorridos usan Edge instalado. Si falta: `npx playwright install msedge`. La emulación móvil en Chromium no equivale a validar Safari iOS ni Android real. Consultar [validación](docs/validacion.md).

## Docker y pruebas de usuario

```sh
docker compose up --build -d
```

Frontend: `http://localhost:8080`. API opcional: `docker compose --profile api up --build -d`. Los puertos se configuran con `.env.example`. Vercel apunta a `apps/web/dist`. No se ha desplegado esta reestructuración.

## Estructura

```text
apps/web/              Vite, DOM, Canvas, input y ciclo de vida
apps/api/              Fastify; salud y manifest público de I1
packages/contracts/    Dominio, protocolos, JSON Schema, geometría y mapa de prueba
tests/                 Pruebas unitarias, API y navegador
scripts/               Validación, arte provisional reproducible y servidor legacy
legacy/pre-alpha/      Versión anterior aislada para comparación
docs/                  Arquitectura, migración, pendientes y evidencia
```

La pre-alpha conserva código, recursos, A/V experimental, Snake y documentación histórica. Se ejecuta por separado con `npm run dev:legacy` en `http://127.0.0.1:3000`; no se incluye en el build productivo. Sus enlaces de sala PeerJS no son credenciales de la nueva arquitectura.

Ver [análisis y etapas](docs/reestructuracion.md), [arquitectura](docs/arquitectura.md), [assets](apps/web/public/assets/README.md) y [validación](docs/validacion.md).
