# Pizarrón y presentación de pantalla

Implementación local del 2026-10-09. El editor y la captura funcionan en el navegador; sesiones compartidas, sincronización de trazos y envío de la presentación a otros participantes siguen pendientes.

## Dibujar

1. Acercarse al pizarrón y pulsar **E**, o tocar el escenario desde su zona de interacción.
2. Elegir **Lápiz**, **Goma**, **Línea**, **Rectángulo** o **Elipse**. Dibujar con mouse, lápiz táctil o dedo.
3. Elegir color de la paleta o del selector personalizado, grosor de 1–48 píxeles del documento y relleno para figuras.
4. **Deshacer / Rehacer** recorren hasta ocho operaciones. **Limpiar** vacía el lienzo y también es reversible con Deshacer.
5. **Guardar PNG** descarga una imagen de 960×540 con fondo blanco.
6. **Escape / X** cierran el panel sin perder los trazos. **R** devuelve al avatar a la entrada y conserva el dibujo. Salir al inicio o recargar descarta el documento.

Atajos dentro del editor: **B** lápiz, **E** goma, **L** línea, **R** rectángulo, **O** elipse, **Ctrl/Cmd+Z** deshacer, **Ctrl/Cmd+Shift+Z** o **Ctrl/Cmd+Y** rehacer. No actúan mientras se edita un campo. El avatar permanece detenido mientras el panel está abierto.

El sprite del mapa es limpio si no quedan píxeles con alfa y sucio si hay trazos. Abrir el panel por sí solo no dibuja ni borra. El dibujo nunca se estampa sobre el PNG del mapa. Los colliders y el orden de renderizado conservan sus valores.

## Presentar pantalla

1. Abrir **Presentar pantalla** dentro del pizarrón, o **Configuración → Pantalla → Abrir presentación**.
2. Activar opcionalmente **Incluir audio**, y pulsar **Presentar pantalla**.
3. Elegir fuente y permisos en el selector del navegador. El soporte de audio depende del navegador y de la fuente elegida.
4. La vista previa conserva proporción, no se refleja y no reproduce audio localmente. La cámara y el micrófono mantienen sus estados.
5. Detener con el botón del panel, con el control del navegador o cerrando el pizarrón. Todas las pistas capturadas se liberan, incluso si una solicitud cancelada se resuelve más tarde.

Se puede cambiar a la pestaña Dibujar sin detener una presentación activa; el botón **Detener presentación** permanece visible en el encabezado. Cerrar el panel sí finaliza la captura. No se reanuda automáticamente al volver.

Si no hay soporte de captura, el panel lo indica y permite seguir dibujando. Permiso denegado, selección cancelada o fuente no disponible dejan posibilidad de reintento. La captura requiere un contexto compatible como HTTPS o localhost. No se afirma compatibilidad con dispositivos físicos no probados.

## Implementación

| Archivo | Responsabilidad |
| --- | --- |
| `apps/web/src/ui/drawing-surface.ts` | Bitmap de 960×540, punteros, herramientas, goma real, figuras, historial, detección de trazos y exportación PNG. |
| `apps/web/src/ui/board-panel.ts` | Diálogo, pestañas, herramientas, atajos, foco y vista previa de presentación. |
| `apps/web/src/ui/board.css` | Distribución del editor, lienzo adaptable, herramientas y presentación. |
| `apps/web/src/media/screen-share.ts` | Captura de pantalla, permiso, cancelación, fin externo y liberación de pistas. |
| `apps/web/src/app/main.ts` | Acción E, estado limpio/sucio, bloqueo por paneles y fin de sesión. |
| `apps/web/index.html` | Controles, etiquetas y mensajes de ambas vistas. |

El bitmap mantiene tamaño fijo; las coordenadas CSS de cada puntero se transforman a píxeles del documento con el rectángulo visible del canvas. Cambiar la resolución de pantalla sólo cambia su tamaño visual. `HISTORY_LIMIT` limita a ocho snapshots entre deshacer y rehacer: unos 16 MiB, además del bitmap y una copia del trazo activo. No se guarda el dibujo en almacenamiento persistente.

La presentación expone `ScreenShare.stream` para la futura publicación de medios. Todavía no existe transporte ni reserva exclusiva de servidor: esta implementación no acredita las partes compartidas de V2-RF-014/015. El audio de pantalla no se mezcla con el micrófono ni se envía a los altavoces locales.

## Comprobación de la entrega

`npm run build` completó TypeScript, validación de las 112 imágenes y compilación de API/web. Se actualizaron las comprobaciones existentes del pizarrón para que abrirlo no altere su estado y para usar el lienzo al dibujar/borrar. No se ejecutaron pruebas automatizadas, recorridos de navegador ni selección de una pantalla real en esta entrega.
