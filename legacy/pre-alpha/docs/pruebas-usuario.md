# Pruebas de usuario con Docker

> Instrucciones históricas de la pre-alpha; los comandos y rutas siguientes corresponden a esa versión. Para ejecutar la aplicación actual usar el [README vigente](../../../README.md); para abrir la pre-alpha, `npm run dev:legacy` desde la raíz.

## Levantar la aplicación

Desde la raíz del repositorio:

```sh
docker compose up --build -d
```

La aplicación queda disponible en [http://localhost:8080](http://localhost:8080) y el estado del contenedor se puede verificar en [http://localhost:8080/healthz](http://localhost:8080/healthz).

Comandos útiles:

```sh
docker compose ps
docker compose logs -f app
docker compose down
```

Para elegir otro puerto, copiar `.env.example` como `.env`, cambiar `PIXEL_OFFICE_PORT` y volver a ejecutar Compose.

## Sesión de prueba

1. Una persona abre la aplicación, elige un nombre y entra en la oficina.
2. Desde Configuración copia el enlace de invitación.
3. Las demás personas abren ese enlace en otro navegador o dispositivo.
4. Comprobar movimiento, nombre/color o skin, puertas, escritorio, servidor y arcade.
5. Conceder permisos y probar cámara, micrófono y pantalla compartida.

Cada participante necesita conectividad a Internet para PeerJS. El contenedor sólo sirve archivos estáticos: no almacena usuarios, salas ni streams.

## Pruebas fuera de localhost

Para una prueba en la red local puede compartirse `http://<IP-del-host>:8080`, pero los navegadores pueden bloquear cámara, micrófono o pantalla fuera de `localhost` cuando se usa HTTP. Para participantes remotos o una prueba completa de multimedia, publicar el contenedor detrás de un proxy HTTPS con un certificado válido.
