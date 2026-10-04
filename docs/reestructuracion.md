# Alineación del repositorio con la demo v2

Actualizado el 2026-10-04. Alcance vigente: [00–08](../00_LEEME.md). Este registro describe trabajo y pendientes; no certifica la entrega final.

## Cambios respecto a la planificación anterior

| Área | Base actual / objetivo |
|---|---|
| Cliente | TypeScript, Vite, DOM/CSS y Canvas 2D; se conserva el recorrido individual. |
| Mundo | Dos escenas provisionales; plantilla fija y geometría compartida para sesiones. |
| Acceso | Identidad temporal sin cuenta; se retiran del dominio propuesto roles, membresías y jornadas. |
| Estado | Sesiones efímeras de hasta diez plazas; aún falta implementar servidor de sesiones/WS. |
| Colaboración | A/V, chat, presentación y dibujo compartido del ambiente pendientes. |
| Google | Accesos externos desde computadoras; OAuth y APIs salen del plan. |
| Juegos | Snake individual y Pong de dos siguen obligatorios; no están integrados en la app actual. |
| Arte | Piso, sillas, escritorios y referencia recibidos parcialmente; inventario en [assets](assets.md). |
| Comercial | Editor, tienda, planes y economía quedan fuera; se elimina la etapa I5. |
| Calidad | IDs V2 nuevos, pruebas existentes con cobertura parcial y resultados previos conservados como históricos. |

## Trabajo realizado en esta alineación

- Actualización de 01–07 siguiendo el alcance de 00 y el contrato de 08.
- README, arquitectura, validación e inventario consistentes con el objetivo v2.
- Tipos de participante/sesión temporales y constante de diez plazas como contrato pendiente de uso en servidor.
- Mensajes del recorrido y marca Vice Labs alineados sin anunciar colaboración ya disponible.
- Referencias de pruebas renombradas a los requisitos v2 que cubren parcialmente.
- Documentación de pre-alpha identificada como histórica; entrega reciente de arte distinguida del material anterior.

El mapa pasó a `demo-v2` al incorporar piso y escritorios; schema 1 y protocolo 1 mantienen su formato. Los PNG originales permanecen en su ubicación de entrega y el generador prepara copias de uso web.

## Siguientes pasos

1. **I1:** completar paquete de arte, acordar escala/pivots y regiones sobre sprites reales, integrar y validar escritorio/móvil.
2. **I2:** implementar sesiones sin cuenta, cupo diez, WS, autoridad espacial, reconexión y expiración.
3. **I3:** completar chat, medios, audiencias, lienzo y presentación; probar aislamiento y capacidad.
4. **I4:** accesos externos, Snake/Pong y validación integral con arte final.

Las condiciones de salida y pendientes se mantienen en [07](../07_DECISIONES_Y_PLAN_IMPLEMENTACION.md); no duplicar aquí un backlog independiente.
