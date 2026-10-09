# Menú de entrada y configuración

Implementación local incorporada el 2026-10-09. No implementa todavía sesiones compartidas ni llamadas entre participantes.

## Uso

1. Escribir un nombre de 2 a 24 caracteres y entrar. La entrada espera a que se cargue el escenario; cámara y micrófono son opcionales.
2. Abrir **Configuración** desde el inicio o con **Escape / engranaje** dentro de la oficina.
3. Elegir **Perfil**, **Audio**, **Cámara** o **Música**. Las pestañas admiten flechas, Inicio y Fin; el diálogo mantiene el foco dentro del menú.
4. Cambiar nombre con **Guardar**. Los volúmenes y repetición se aplican al instante. **Listo**, la X o Escape regresan al inicio o al recorrido según desde dónde se abrió.
5. **Salir al inicio** apaga cámara y micrófono, detiene música y reinicia el recorrido. Nombre y niveles siguen disponibles en esta pestaña.

El avatar no recibe teclas ni arrastres mientras el menú está abierto. Los colliders, posiciones, escalas y orden de los muebles conservan su configuración existente.

## Controles de medios

| Control | Efecto real |
| --- | --- |
| Micrófono, 0–200 % | Ganancia de la señal capturada; 100 % = ganancia 1. El medidor muestra el nivel posterior al ajuste. No reproduce la voz propia por los altavoces. |
| Otras voces, 0–100 % | Ganancia común de las señales entregadas a `AudioMixer.connectParticipant`. La interfaz indica que no hay voces conectadas mientras no exista transporte de llamadas. |
| Cámara | Captura independiente y vista previa local reflejada. Permiso denegado, dispositivo ausente o solicitud cancelada permiten seguir usando la oficina. |
| Música, 0–100 % | Volumen independiente de las voces. Incluye un ambiente original sintetizado en Web Audio y archivos de audio locales compatibles con el navegador. |
| Reproducir / Pausar / Detener | Inicia, conserva la posición o vuelve al inicio de la pista. Elegir otra pista detiene la actual; requiere pulsar Reproducir. |
| Repetir | Reproducción cíclica de la pista seleccionada. |

No se suben archivos de música. La pista seleccionada y el estado de reproducción no se guardan al recargar. Nombre, volúmenes y repetición se guardan con la clave `pixel-office.preferences.v1` en `sessionStorage`; la aplicación funciona también cuando el navegador impide guardar preferencias.

## Archivos para ajustar

| Archivo | Responsabilidad |
| --- | --- |
| `apps/web/index.html` | Textos, formularios, pestañas, rangos, controles y accesibilidad. |
| `apps/web/src/ui/menu.css` | Paleta, medidas, estilo pixel art y adaptación a móvil. |
| `apps/web/src/ui/office-menu.ts` | Ingreso, validación del nombre, navegación, foco, ajustes y bloqueo del input. |
| `apps/web/src/ui/preferences.ts` | Valores iniciales, límites y almacenamiento por pestaña. |
| `apps/web/src/media/local-media.ts` | Permisos, captura, cancelación y liberación de pistas. |
| `apps/web/src/media/audio-mixer.ts` | Ganancias, medidor, música y conexiones para futuras voces recibidas. |
| `apps/web/src/app/main.ts` | Conexión del menú con mundo, controles y desmontaje. |

Para futuras llamadas, publicar `AudioMixer.microphoneStream` permite respetar la ganancia del micrófono. Entregar cada voz recibida a `connectParticipant(id, stream)` permite respetar el volumen de otras voces; retirar su nodo con `disconnectParticipant(id)`. Las pistas remotas pertenecen al transporte, que debe cerrarlas al desconectar. Esta interfaz no sustituye la señalización, permisos de sesión ni transporte de audio/vídeo pendientes.

## Comprobación de esta entrega

`npm run build` completó TypeScript, validación de las 112 imágenes y compilación de API/web. Los recorridos existentes de navegador se adaptaron para entrar por el nuevo menú. No se ejecutaron pruebas de navegador ni pruebas con dispositivos de captura físicos en esta entrega.
