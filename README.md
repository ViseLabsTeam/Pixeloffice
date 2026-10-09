# Pixel Office

Demo de portafolio de **Vice Labs** con Canvas 2D y TypeScript. Objetivo final: oficina fija, acceso sin cuenta y sesiones temporales de hasta diez participantes, según las especificaciones [00–08 v2](00_LEEME.md).

La aplicación implementa un **recorrido individual por la oficina fija a pantalla completa**, con menú de entrada y configuración de estilo pixel art. `SIN MUEBLESL.png` (1920×1080) forma el fondo; los tres escritorios, sus sillas y una planta se dibujan por separado, con collider y profundidad propios, siempre opacos. El avatar se dibuja sobre todo el fondo. Conserva sus cuatro direcciones, PNG de reposo y cuadros de GIF de movimiento, con escala adaptada al escenario. Su velocidad es de 240 unidades por segundo. El tren animado pasa por las tres ventanas de derecha a izquierda, con 15 segundos de espera entre ventanas. El pizarrón usa los PNG oficiales reflejados horizontalmente: E permite dibujar y volver a borrar. Sesiones compartidas, chat, transmisión de audio/vídeo, pantalla, accesos externos a Google Workspace, Snake y Pong siguen pendientes en la aplicación actual. [Ajuste manual del mapa](docs/ajuste-mapa-oficina.md).

Cuentas, equipos persistentes, horarios, OAuth/APIs de Google, editor de mapas y tienda están fuera del alcance. Ver [inventario y faltantes de arte](docs/assets.md).

## Ejecutar

Node 22.14 o superior compatible con el lockfile.

```sh
npm ci
npm run dev
```

Abrir `http://127.0.0.1:5173`, elegir un nombre y pulsar **Entrar a la oficina**. WASD/flechas o arrastrar sobre el escenario para moverse; E o un toque corto para cambiar el pizarrón o consultar la zona del escritorio. R vuelve al punto de entrada. **Escape o el engranaje** abren la configuración; el movimiento se detiene mientras el menú está abierto. El escenario llena el área visible y conserva la proporción del arte; la cámara sigue al avatar cuando la relación de pantalla recorta una parte del mapa.

## Menú y configuración

- **Perfil:** nombre de 2 a 24 caracteres, editable antes y después de entrar, y salida al inicio.
- **Audio:** encender/apagar micrófono, ganancia de 0 a 200 % y medidor de nivel. El control de otras voces ajusta un mezclador independiente de 0 a 100 %; no hay voces remotas hasta implementar las llamadas compartidas.
- **Cámara:** permiso independiente del micrófono y vista previa. C/M también alternan estos dispositivos durante el recorrido. Requieren localhost o HTTPS y no transmiten a otras personas en esta etapa.
- **Música:** ambiente instrumental generado localmente, archivo de audio del equipo, reproducción, pausa, detención, repetición y volumen independiente. La música se escucha sólo en ese navegador.

Nombre y niveles se guardan en `sessionStorage` durante la sesión de la pestaña. Cámara, micrófono y reproducción comienzan apagados al cargar la aplicación. Salir al inicio detiene los medios y vuelve al punto de entrada. [Archivos y funcionamiento del menú](docs/menu-configuracion.md).

API inicial opcional en otra terminal: `npm run dev:api`. Expone `http://127.0.0.1:3001/healthz` y `/maps/demo-v5/manifest`. Sólo contiene el mapa público de prueba; aún no autentica ni sincroniza usuarios.

## Verificar

```sh
npm run build
npm test
npm run test:e2e
```

Los recorridos usan Edge instalado. Si falta: `npx playwright install msedge`. La emulación móvil en Chromium no equivale a validar Safari iOS ni Android real. Consultar [validación](docs/validacion.md).

Para inspeccionar geometría durante desarrollo, abrir `http://127.0.0.1:5173/?debug=colliders`. La vista dibuja colliders en cian, referencias de profundidad en naranja, interacciones en amarillo, ventanas en azul y pies del avatar en verde. Sólo se activa en desarrollo; permite iniciar en una posición válida con `&x=320&y=750` para revisar el escritorio lateral o `&x=1160&y=899` para el derecho.

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
