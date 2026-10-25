# Marketplace de Alquiler de Espacios — Especificación del proyecto

> **Para personas y asistentes de IA.** Lee este documento completo antes de diseñar, programar o redactar algo del proyecto.
> Si una instrucción de un prompt contradice esta especificación, manda la especificación y hay que avisar al equipo.
> Generado el 2026-10-25 desde el tablero del equipo (tablero-is2). En el repositorio del proyecto vive como `AGENTS.md`.

## 1. Qué es el producto

Marketplace web para alquilar espacios deportivos y para eventos (canchas, estadios, auditorios), con pago en línea.

- **Roles del sistema:** Usuario (arrendatario), Arrendador y Administrador.
- **Normativas:** PCI DSS (pagos con tarjeta, siempre vía pasarela certificada) y protección de datos personales.
- **Alcance:** 2 releases, 8 sprints y 28 historias de usuario, todas dentro del alcance.
  - **Release 1 (MVP transaccional):** al terminar, funciona el ciclo publicar → buscar → reservar → pagar → cancelar con reembolso.
  - **Release 2 (confianza y operación):** MFA, cobro del arrendador, perfil y datos personales, filtros, reseñas, reclamos y moderación.
- **Contexto académico:** Proyecto Final de Ingeniería de Software II (Universidad de Lima, 2026-2), con Scrum. Hay que demostrar POO, principios y patrones de diseño, arquitectura documentada y pruebas como parte del desarrollo.

## 2. Equipo

| Persona | Rol Scrum | Historias que diseña y programa | Su pareja (prueba sus historias) |
| --- | --- | --- | --- |
| Jorge Quispe | Developer (Dev1) | HU-01, HU-03, HU-09, HU-17, HU-25 | Kevin Chan |
| Adriana Callupe | Developer (Dev3) | HU-02, HU-11, HU-14, HU-20, HU-26 | Sebastian Garate |
| Eduardo Saldaña | Developer (Dev2) | HU-04, HU-12, HU-13, HU-19, HU-28 | Ariel Enriquez |
| Kevin Chan | Scrum Master | HU-05, HU-15, HU-22, HU-27 | Jorge Quispe |
| Sebastian Garate | Developer (Dev4) | HU-07, HU-08, HU-10, HU-21, HU-23 | Adriana Callupe |
| Ariel Enriquez | Product Owner | HU-06, HU-16, HU-18, HU-24 | Eduardo Saldaña |

- El **Product Owner** (Ariel) prioriza el backlog y acepta cada historia en la review.
- El **Scrum Master** (Kevin) facilita las ceremonias y redacta las actas.
- Todos programan.

## 3. Stack y arquitectura

| Pieza | Decisión |
| --- | --- |
| Backend | **Spring Boot (Java)**, programación orientada a objetos |
| Frontend | **React** (aplicación de una sola página que consume la API REST) |
| Base de datos | **PostgreSQL** (propuesta; **por confirmar en equipo**). Justificación en `arquitectura-propuesta.md`; va en las secciones 6.4 y 6.10 del informe |
| Despliegue | Propuesta en AWS: SPA React en S3 con CloudFront y WAF, ALB, Spring Boot en ECS Fargate, RDS PostgreSQL, S3 privado, SES y Secrets Manager (`4_Infraestructure/arquitectura-aws.html` en el repositorio) |
| Pagos | Pasarela certificada PCI DSS en **modo de prueba** (checkout de la pasarela + webhook con firma verificada) |
| Diagramas | Herramienta CASE del curso (se entregan los archivos editables). La IA puede proponerlos en PlantUML |

**Reglas de arquitectura (obligatorias):**

1. **Arquitectura en capas (N-capas orientada al dominio), como monolito modular** desplegado en 3 niveles: React → Spring Boot → base de datos. Patrón MVC en el backend (Spring MVC) y enfoque DDD ligero (cada épica es un contexto). Dentro de cada módulo: `Controller → Service → Repository`, con entidades en el núcleo. Detalle y justificación en `arquitectura-propuesta.md`.
2. **El núcleo del backend va separado de la API REST.** La lógica de negocio y el acceso a datos no dependen de la web: la API es un cliente más del núcleo.
3. **Entity frente a DTO.** Las entidades nunca salen del backend: la API recibe y devuelve DTO, solo con los campos necesarios. Nunca se exponen contraseñas, documentos, datos bancarios ni datos de tarjeta.
4. **Un paquete por módulo**, alineado con las épicas: `cuentas`, `espacios`, `busqueda`, `reservas`, `pagos`, `administracion`. Cada uno tiene `controller`, `service`, `repository`, `entity` y `dto`.
5. **POO, principios y patrones.**
   - Aplicar SOLID, alta cohesión y bajo acoplamiento.
   - Patrones vistos en el curso: Factory Method, Abstract Factory, Singleton, Adapter, Facade, Decorator, Bridge, Strategy, Iterator, Command y DAO.
   - Usarlos solo donde resuelvan un problema real; la sección 10 indica cuáles se esperan en las historias documentadas.
   - DAO/Repository se usa en toda la persistencia. Los beans de Spring ya son *singleton*: no se programa un Singleton a mano.
   - Cada patrón se documenta en la sección 7.7 del informe, con dónde está y por qué.
6. **Reglas de negocio y montos solo en el servidor.** El cliente nunca decide montos, roles ni estados.

**Convenciones de código (propuesta inicial; el equipo puede ajustarlas):**

- **Nombres:** las clases de dominio en español (`Reserva`, `Espacio`, `Liquidacion`) y los sufijos técnicos en inglés (`ReservaController`, `ReservaService`, `ReservaRepository`, `ReservaDTO`).
- **Endpoints REST:** en plural y en minúsculas (`/api/reservas`, `/api/espacios/{id}/disponibilidad`).
- **Errores:** un manejador global con mensajes genéricos al cliente; el detalle va solo en los logs.
- **Configuración y secretos:** en variables de entorno. Nunca se suben contraseñas, llaves de la pasarela ni tokens; se usa un `.env.example`.

## 4. Seguridad transversal (STRIDE)

Cada historia trae sus propios controles STRIDE (sección 9). Además, en todo el sistema:

- **(S) Suplantación:** la identidad se toma siempre de la sesión en el backend, nunca de un ID enviado por el cliente. Los tokens se invalidan al cerrar sesión o al expirar (30 minutos de inactividad).
- **(T) Manipulación:** las contraseñas se guardan con hash y sal (bcrypt o argon2). Todo lo que viene del cliente se valida en el servidor, y los montos se calculan solo ahí.
- **(R) Repudio:** las acciones sensibles se registran en una auditoría con quién, qué, cuándo e IP. Hay un componente de auditoría reutilizable.
- **(I) Divulgación:** se usa TLS y mensajes de error genéricos. Los datos sensibles van cifrados en reposo. Los documentos se sirven con URL firmada de corta duración.
- **(D) Denegación de servicio:** hay rate limiting donde la historia lo indica (registro, login, búsqueda, pagos, reportes).
- **(E) Elevación de privilegios:** los roles se asignan y validan en el backend en cada solicitud, y la propiedad del recurso se valida antes de cada edición. Las cuentas de administrador solo se crean por script interno.
- **PCI DSS:** la plataforma nunca recibe ni guarda datos de tarjeta. El estado del pago cambia solo por un webhook con firma verificada e idempotente.

## 5. Estados del sistema

**Cuenta del arrendador:** en el backlog nunca se dice "verificado" a secas: siempre se aclara si es el correo o la identidad.

| Estado | Qué habilita |
| --- | --- |
| Correo verificado | Iniciar sesión, crear borradores de espacios, subir documentos |
| Identidad en revisión | Nada adicional; espera la revisión del admin |
| Identidad verificada | Publicar espacios visibles, recibir reservas pagadas y registrar cuenta bancaria |
| Identidad rechazada | Volver a subir documentos |
| Suspendida | Nada; no puede iniciar sesión y sus espacios se ocultan |

**Reserva:** `pendiente de pago` (retiene los bloques 15 minutos) → `confirmada` (pago aprobado) o `expirada` (sin pago a tiempo). Una reserva confirmada puede pasar a `cancelada`.

**Transacción:** `pagada` → `reembolsada`, o `reembolso fallido` (el admin puede reintentarlo).

**Liquidación:** se genera semanalmente → `pagada` (con número de operación), o `pendiente de cuenta` si el arrendador no registró una cuenta bancaria.

**Simplificaciones del backlog:**
- La política de cancelación es fija: con 48 h o más se devuelve el 100 %; con menos, 0 %; si cancela el arrendador, se devuelve el 100 %.
- El checkout expira junto con la reserva.
- La liquidación la genera el admin con un botón y la transferencia es manual.
- Los bloques libres se calculan al consultar: horario − bloqueos − reservas.

## 6. Fuera del alcance

| Qué | Decisión | Motivo |
| --- | --- | --- |
| Galería ampliada (más de 5 fotos) y video | Descartada | Las 5 fotos de HU-07 bastan; el video suma almacenamiento y validación costosos. |
| Precios por franja horaria | Descartada | Complica el cálculo de montos, reembolsos y liquidaciones; se usa un precio único por hora. |
| Mapa interactivo | Descartada | Depende de un proveedor externo; la dirección en texto basta. |
| Espacios favoritos | Descartada | No aporta al ciclo principal de reserva y pago. |
| Reprogramar una reserva | Descartada | Exige un cambio atómico de bloques y cobrar o devolver diferencias; se cubre cancelando y reservando de nuevo. |
| Panel de ingresos y ocupación | Descartada | "Mis liquidaciones" (HU-19) ya muestra lo cobrado. |
| Destacar publicación (pago por visibilidad) | Descartada | Monetización secundaria; requiere un catálogo con volumen. |
| Pago con billetera digital, transferencias y cuotas | Descartada | Cada medio es otra integración; la tarjeta cubre el MVP. |
| Notificaciones push | Descartada | Requiere app o service worker; el correo cubre los avisos. |
| Política de cancelación configurable | Simplificada | Política fija de 48 h (HU-15). |
| Liquidación automática (job y transferencia por API bancaria) | Simplificada | El admin la genera con un botón y transfiere a mano (HU-19). |
| Reembolso de pagos que llegan tras expirar la reserva | Simplificada | El checkout expira junto con la reserva (HU-13), así que ese caso no ocurre. |
| Respuesta del arrendador a reseñas y fotos en reclamos | Simplificada | Se dejan fuera para acotar HU-24 y HU-26. |

No implementes nada de esta lista aunque parezca útil.

## 7. Plan de releases y sprints

El backlog define 8 sprints. Para terminar a tiempo, el equipo trabaja **dos sprints por semana**:

| Semana real | Release | Sprint | Objetivo | Historias |
| --- | --- | --- | --- | --- |
| 8 | Release 1 | 1 | Cuentas: registro, acceso y recuperación | HU-01, HU-02, HU-03, HU-04 |
| 8 | Release 1 | 2 | Oferta verificada: identidad, publicación y disponibilidad | HU-05, HU-06, HU-07, HU-08 |
| 9 | Release 1 | 3 | Control admin, búsqueda y reserva | HU-09, HU-10, HU-11, HU-12 |
| 9 | Release 1 | 4 | Pagar, consultar, cancelar y reembolsar | HU-13, HU-14, HU-15, HU-16 |
| 10 | Release 2 | 5 | Seguridad de cuentas y cobro del arrendador | HU-17, HU-18, HU-19 |
| 10 | Release 2 | 6 | Gestión de cuenta, publicaciones y datos personales | HU-20, HU-21, HU-22 |
| 11 | Release 2 | 7 | Descubrimiento y confianza | HU-23, HU-24, HU-25 |
| 11 | Release 2 | 8 | Soporte, moderación y comprobantes | HU-26, HU-27, HU-28 |

La semana 12 es de estabilización (pruebas, defectos e informe), y la entrega es en la semana 13.

**Orden de integración dentro de cada semana.** Sale de las dependencias del backlog: una historia sin dependencias en su semana es orden 1, y si depende de una de orden N, es orden N + 1.

- Todas las historias se diseñan al inicio de la semana.
- Se programan y se prueban en su tramo: tramo 1 (Lun–Mar), tramo 2 (Mié–Jue), tramo 3 (Vie–Dom).
- Si una historia depende de otra de la misma semana, se programa contra los contratos acordados el lunes y se integra después de esa.

| Semana | Orden de integración |
| --- | --- |
| 8 | 1: HU-01 → 2: HU-02 → 3: HU-03, HU-05, HU-07 → 4: HU-04, HU-06, HU-08 |
| 9 | 1: HU-09, HU-10, HU-11 → 2: HU-12 → 3: HU-13 → 4: HU-14 → 5: HU-15 → 6: HU-16 |
| 10 | 1: HU-17, HU-18, HU-20, HU-21 → 2: HU-19 → 3: HU-22 |
| 11 | 1: HU-23, HU-24, HU-25, HU-26, HU-28 → 2: HU-27 |

## 8. Cómo se trabaja cada historia

1. **Diseñar (el dueño):** caso de uso, diagrama de secuencia del flujo principal y de un error, endpoints con sus DTO y clases. La pareja revisa el diseño antes de programar.
2. **Programar (el dueño):** siguiendo el diseño aprobado, en la rama `feature/HU-XX-descripcion-corta`, con todos los criterios y controles STRIDE. Termina con un pull request hacia `develop`.
3. **Probar y documentar (la pareja):**
   - revisa el pull request;
   - escribe pruebas unitarias (al menos una por criterio, incluido el de error) y ejecuta casos de caja negra;
   - guarda las capturas como `HU-XX-E01`, `HU-XX-E02`…;
   - llena la fila de la historia en la matriz de trazabilidad.
4. **Aceptar (el Product Owner):** en la review comprueba la historia contra sus criterios.

**Definition of Ready:**
- La historia está en formato *Como…, necesito…, para…*.
- Sus dependencias están indicadas y en un sprint anterior o el mismo.
- Tiene criterios Gherkin y controles STRIDE.
- Su tamaño es S o M.
- Está validada por el PO y el equipo.

**Definition of Done:**
- El código está revisado y tiene pruebas unitarias y de integración aprobadas.
- Está desplegado en UAT y validado por el PO.
- Los controles STRIDE están implementados.
- Cumple PCI DSS y la protección de datos cuando aplica.
- La documentación está actualizada si cambia un contrato de API o un estado.

**Reglas para usar IA:**
- La IA propone y redacta; la persona revisa y responde por el resultado. Nada entra a develop sin el pull request revisado por la pareja.
- Contexto fijo para todos: la especificación del proyecto (proyecto.md, que en el repositorio se llama AGENTS.md). Dásela siempre a tu IA: así el código sale igual aunque lo pidan 6 personas distintas.
- Primero diseño, después código: con la historia, sus criterios y su STRIDE se pide el diseño, se revisa, y recién entonces se pide el código siguiendo ese diseño.
- El informe se redacta con IA solo a partir de datos reales (actas, hoja de métricas, capturas, código). Nunca pedirle que invente métricas, dailies ni evidencias: la plantilla exige datos reales.
- Los diagramas que proponga la IA (por ejemplo en PlantUML) se pasan a la herramienta CASE del curso: el enunciado pide los archivos editables.
- Guardar los prompts importantes en una nota: se necesitan para la Declaración de uso de IA.

## 9. Historias de usuario

Fuente: Excel del backlog. Cada historia indica su dueño, la persona que la prueba y la semana real en que se hace.
Las historias que se documentan a fondo tienen además los patrones que se espera aplicar (ver la sección 10).

### Épica A. Gestión de cuentas y autenticación

Permite a usuarios y arrendadores registrarse, autenticarse, verificar su identidad y gestionar su perfil y sus datos personales de forma segura.

#### HU-01 · Registro de usuario con consentimiento

- **Release 1 · Sprint 1** (semana 8) · tamaño S · depende de: —
- **Programa:** Jorge Quispe · **Prueba y documenta:** Kevin Chan
- **Orden 1 de 4** en su semana · se programa Lun–Mar

Como visitante interesado en alquilar espacios, necesito registrarme con correo y contraseña aceptando el tratamiento de mis datos, para poder reservar espacios.

**Criterios de aceptación:**

- CA1: Dado que soy un visitante nuevo, cuando ingreso un correo válido, una contraseña que cumple la política y marco la aceptación de términos y privacidad, entonces mi cuenta se crea y recibo un correo de verificación.
- CA2: Dado que no marco la aceptación de privacidad, cuando envío el formulario, entonces el registro no se completa.
- CA3: Dado que el correo ya existe o la contraseña es débil, cuando envío el formulario, entonces veo un mensaje genérico o los requisitos mínimos, sin revelar datos de la cuenta existente.

**Seguridad (STRIDE):**

- (T) Contraseñas con hash seguro con sal (bcrypt/argon2).
- (I) Errores que no confirman si el correo existe.
- (D) Límite de registros por IP por hora.
- (R) Registro de fecha, hora, IP y versión de la política aceptada.

#### HU-02 · Registro de arrendador

- **Release 1 · Sprint 1** (semana 8) · tamaño S · depende de: HU-01
- **Programa:** Adriana Callupe · **Prueba y documenta:** Sebastian Garate
- **Orden 2 de 4** en su semana · se programa Lun–Mar · se integra después de HU-01

Como propietario de un espacio, necesito registrarme como arrendador con mis datos de contacto y facturación, para poder publicar mis espacios.

**Criterios de aceptación:**

- CA1: Dado que completo el formulario con datos válidos y acepto la política de privacidad, cuando lo envío, entonces mi cuenta se crea con rol arrendador y estado "correo pendiente".
- CA2: Dado que el RUC/DNI no tiene un formato válido, cuando envío, entonces veo un error de validación específico.
- CA3: Dado que verifico mi correo, cuando ingreso, entonces mi estado pasa a "correo verificado" y veo el aviso de que debo verificar mi identidad para publicar.

**Seguridad (STRIDE):**

- (E) Rol arrendador asignado en backend; no se acepta como parámetro del cliente.
- (I) Datos de facturación cifrados en tránsito y en reposo.
- (R) Registro del evento de creación con fecha, hora e IP.

#### HU-03 · Inicio y cierre de sesión

- **Release 1 · Sprint 1** (semana 8) · tamaño S · depende de: HU-01, HU-02
- **Programa:** Jorge Quispe · **Prueba y documenta:** Kevin Chan
- **Orden 3 de 4** en su semana · se programa Mié–Jue · se integra después de HU-01, HU-02

Como usuario o arrendador registrado, necesito iniciar y cerrar sesión, para acceder a las funciones de mi rol.

**Criterios de aceptación:**

- CA1: Dado que ingreso credenciales correctas de una cuenta con correo verificado, cuando envío el formulario, entonces accedo al panel de mi rol.
- CA2: Dado que las credenciales son incorrectas, cuando envío, entonces veo un mensaje genérico.
- CA3: Dado que fallo 5 veces en 15 minutos, cuando intento de nuevo, entonces se me pide un captcha o se bloquea temporalmente el acceso.
- CA4: Dado que cierro sesión o paso 30 minutos inactivo, cuando vuelvo, entonces la sesión ya no es válida.

**Seguridad (STRIDE):**

- (D) Rate limiting y bloqueo temporal ante fuerza bruta.
- (I) Mensaje de error genérico y TLS en toda la comunicación.
- (S) Token invalidado en backend al cerrar sesión o expirar.
- (R) Registro de intentos de acceso (fecha, IP, resultado).
- MFA no es parte de esta historia; llega en HU-17.

#### HU-04 · Recuperación de contraseña

- **Release 1 · Sprint 1** (semana 8) · tamaño S · depende de: HU-03
- **Programa:** Eduardo Saldaña · **Prueba y documenta:** Ariel Enriquez
- **Orden 4 de 4** en su semana · se programa Vie–Dom · se integra después de HU-03

Como usuario o arrendador, necesito restablecer mi contraseña si la olvido, para recuperar el acceso sin pasar por soporte.

**Criterios de aceptación:**

- CA1: Dado que solicito la recuperación, cuando envío mi correo, entonces veo siempre el mismo mensaje y, si la cuenta existe, recibo un enlace válido por 30 minutos.
- CA2: Dado que uso un enlace expirado o ya usado, cuando lo abro, entonces se rechaza y puedo pedir otro.
- CA3: Dado que cambio la contraseña, cuando confirmo, entonces se cierran todas mis sesiones activas.

**Seguridad (STRIDE):**

- (S/T) Token aleatorio, de un solo uso, guardado con hash.
- (I) Respuesta idéntica exista o no el correo.
- (D) Máximo 3 solicitudes por correo cada hora.
- (R) Registro de solicitud y uso.

#### HU-05 · Envío de documentos de identidad del arrendador

- **Release 1 · Sprint 2** (semana 8) · tamaño M · depende de: HU-02
- **Programa:** Kevin Chan · **Prueba y documenta:** Jorge Quispe
- **Orden 3 de 4** en su semana · se programa Mié–Jue · se integra después de HU-02

Como arrendador con correo verificado, necesito subir mi DNI/RUC y un documento que acredite la propiedad o autorización del espacio, para que la plataforma verifique mi identidad.

**Criterios de aceptación:**

- CA1: Dado que tengo correo verificado, cuando subo los documentos requeridos en PDF/JPG/PNG de hasta 5 MB, entonces mi estado pasa a "identidad en revisión".
- CA2: Dado que subo un archivo de formato o tamaño no permitido, cuando lo envío, entonces se rechaza indicando el motivo.
- CA3: Dado que mi identidad fue rechazada, cuando entro a mi panel, entonces veo el motivo y puedo volver a subir documentos.

**Seguridad (STRIDE):**

- (I) Documentos cifrados en almacenamiento privado, servidos con URL firmada de corta duración.
- (E) Solo el propio arrendador y el admin acceden a sus documentos.
- (T) Validación del tipo real del archivo y su tamaño.
- (R) Registro de cada carga.

#### HU-17 · Autenticación multifactor (MFA)

- **Release 2 · Sprint 5** (semana 10) · tamaño M · depende de: HU-03
- **Programa:** Jorge Quispe · **Prueba y documenta:** Kevin Chan
- **Orden 1 de 3** en su semana · se programa Lun–Mar

Como administrador, usuario o arrendador, necesito un segundo factor al iniciar sesión, para que una contraseña robada no baste para entrar a mi cuenta.

**Criterios de aceptación:**

- CA1: Dado que soy administrador, cuando inicio sesión, entonces el sistema me exige configurar y usar MFA (TOTP); sin él no accedo al panel.
- CA2: Dado que soy usuario o arrendador, cuando activo MFA en mi configuración, entonces los siguientes inicios de sesión piden el código.
- CA3: Dado que activo MFA, cuando termino la configuración, entonces recibo 5 códigos de respaldo de un solo uso.

**Seguridad (STRIDE):**

- (S/I) TOTP estándar (RFC 6238); secretos cifrados; códigos de respaldo con hash.
- (D) Límite de intentos de código por sesión.
- (R) Registro de activación, desactivación y uso.
- Reemplaza (o complementa) el control de IPs de HU-06 y HU-09.

#### HU-20 · Edición de perfil

- **Release 2 · Sprint 6** (semana 10) · tamaño S · depende de: HU-03
- **Programa:** Adriana Callupe · **Prueba y documenta:** Sebastian Garate
- **Orden 1 de 3** en su semana · se programa Lun–Mar

Como usuario o arrendador, necesito editar mi nombre, teléfono, foto y datos de facturación, para mantener mi información correcta.

**Criterios de aceptación:**

- CA1: Dado que estoy autenticado, cuando guardo datos válidos, entonces los cambios se reflejan de inmediato.
- CA2: Dado que cambio mi correo, cuando guardo, entonces el nuevo correo solo se activa tras verificarlo y el anterior recibe un aviso.
- CA3: Dado que soy arrendador con identidad verificada y cambio mi RUC/DNI, cuando guardo, entonces mi identidad vuelve a "en revisión".

**Seguridad (STRIDE):**

- (E) Solo se edita el perfil de la sesión.
- (S) Cambiar correo o facturación exige reingresar la contraseña.
- (R/T) Registro de cambios sensibles.

#### HU-22 · Derechos sobre datos personales

- **Release 2 · Sprint 6** (semana 10) · tamaño M · depende de: HU-01, HU-19, HU-20
- **Programa:** Kevin Chan · **Prueba y documenta:** Jorge Quispe
- **Orden 3 de 3** en su semana · se programa Vie–Dom · se integra después de HU-19, HU-20

Como usuario o arrendador, necesito descargar mis datos y solicitar la eliminación de mi cuenta, para ejercer mis derechos de acceso y supresión.

**Criterios de aceptación:**

- CA1: Dado que estoy en mi perfil, cuando pido mis datos y confirmo con mi contraseña, entonces descargo un archivo JSON con mi perfil, reservas y pagos.
- CA2: Dado que no tengo reservas futuras ni liquidaciones pendientes, cuando solicito eliminar mi cuenta y confirmo con mi contraseña, entonces la cuenta se desactiva y mis datos personales se anonimizan; los registros contables se conservan el plazo legal.
- CA3: Dado que tengo reservas futuras o liquidaciones pendientes, cuando solicito la eliminación, entonces el sistema me indica qué debo resolver antes.

**Seguridad (STRIDE):**

- (S) Reautenticación antes de exportar o eliminar.
- (I) La descarga solo incluye datos del usuario de la sesión.
- (R) Registro de cada exportación y eliminación.

### Épica B. Publicación y gestión de espacios

Permite al arrendador publicar sus espacios (canchas, estadios, auditorios), definir su disponibilidad y pausar o dar de baja sus publicaciones.

#### HU-07 · Publicar y editar un espacio

- **Release 1 · Sprint 2** (semana 8) · tamaño M · depende de: HU-02 (visible tras HU-06)
- **Programa:** Sebastian Garate · **Prueba y documenta:** Adriana Callupe
- **Orden 3 de 4** en su semana · se programa Mié–Jue · se integra después de HU-02

Como arrendador, necesito crear y editar la ficha de mi espacio (tipo, dirección, zona, capacidad, precio por hora, hasta 5 fotos), para ofrecerlo en el catálogo.

**Criterios de aceptación:**

- CA1: Dado que tengo correo verificado, cuando completo los campos obligatorios, entonces el espacio se guarda como borrador.
- CA2: Dado que mi identidad está verificada, cuando publico el borrador, entonces el espacio queda visible en el catálogo.
- CA3: Dado que mi identidad no está verificada, cuando intento publicar, entonces el sistema lo impide y me indica completar la verificación.
- CA4: Dado que edito un espacio publicado, cuando guardo, entonces los cambios se reflejan en el catálogo y las reservas ya pagadas conservan su precio.

**Seguridad (STRIDE):**

- (E) Validación de propiedad del recurso en backend en cada edición.
- (T/I) Imágenes validadas en tipo y tamaño y reprocesadas para eliminar metadatos.
- (R) Registro de creación y edición (quién, cuándo, qué cambió).

#### HU-08 · Disponibilidad del espacio

- **Release 1 · Sprint 2** (semana 8) · tamaño M · depende de: HU-07
- **Programa:** Sebastian Garate · **Prueba y documenta:** Adriana Callupe
- **Orden 4 de 4** en su semana · se programa Vie–Dom · se integra después de HU-07

Como arrendador, necesito definir un horario semanal en bloques de 1 hora y bloquear fechas puntuales, para controlar cuándo se puede reservar mi espacio.

**Criterios de aceptación:**

- CA1: Dado que soy dueño del espacio, cuando defino horarios por día de la semana (ej. lunes a viernes 8:00–22:00), entonces esos bloques se pueden reservar en las próximas 8 semanas.
- CA2: Dado que bloqueo una fecha, cuando guardo, entonces sus bloques dejan de estar disponibles.
- CA3: Dado que intento bloquear una fecha con una reserva pagada, cuando guardo, entonces el sistema me avisa del conflicto y no la bloquea.

**Seguridad (STRIDE):**

- (E) Solo el arrendador dueño modifica el calendario; validado en backend.
- (R) Registro de cada cambio de disponibilidad.
- Simplificación: los bloques libres se calculan al consultar (horario − bloqueos − reservas); no se generan con un job.

#### HU-21 · Pausar o dar de baja una publicación

- **Release 2 · Sprint 6** (semana 10) · tamaño S · depende de: HU-07, HU-15
- **Programa:** Sebastian Garate · **Prueba y documenta:** Adriana Callupe
- **Orden 1 de 3** en su semana · se programa Lun–Mar

Como arrendador, necesito pausar o dar de baja un espacio, para dejar de recibir reservas cuando no puedo ofrecerlo.

**Criterios de aceptación:**

- CA1: Dado que pauso un espacio, cuando confirmo, entonces deja de aparecer en búsquedas y las reservas existentes se mantienen.
- CA2: Dado que doy de baja un espacio con reservas futuras, cuando confirmo, entonces veo las reservas afectadas y debo cancelarlas (reembolso 100 %) antes de completar la baja.

**Seguridad (STRIDE):**

- (E) Solo el arrendador dueño o un admin; validado en backend.
- (R) Registro de pausas y bajas.

### Épica C. Búsqueda y descubrimiento de espacios

Permite al usuario encontrar espacios disponibles, evaluar su detalle y apoyarse en reseñas de otros usuarios.

#### HU-10 · Búsqueda por tipo, zona y fecha

- **Release 1 · Sprint 3** (semana 9) · tamaño M · depende de: HU-07, HU-08
- **Programa:** Sebastian Garate · **Prueba y documenta:** Adriana Callupe
- **Orden 1 de 6** en su semana · se programa Lun–Mar

Como usuario, necesito buscar espacios por tipo, zona y una fecha concreta, para ver solo los que puedo reservar ese día.

**Criterios de aceptación:**

- CA1: Dado que ingreso tipo, zona y fecha, cuando busco, entonces veo solo espacios publicados de arrendadores no suspendidos con al menos un bloque libre esa fecha.
- CA2: Dado que se muestran resultados, cuando carga la lista, entonces veo nombre, foto principal, precio por hora y zona, en páginas de 20.
- CA3: Dado que no hay resultados, cuando busco, entonces veo un mensaje y la sugerencia de cambiar fecha o zona.

**Seguridad (STRIDE):**

- (I/D) Riesgo de scraping: rate limiting por IP y máximo 20 resultados por página.
- (I) Riesgo aceptado: datos del catálogo públicos; sin datos personales del arrendador.

#### HU-11 · Detalle del espacio

- **Release 1 · Sprint 3** (semana 9) · tamaño S · depende de: HU-07, HU-08
- **Programa:** Adriana Callupe · **Prueba y documenta:** Sebastian Garate
- **Orden 1 de 6** en su semana · se programa Lun–Mar

Como usuario, necesito ver la ficha de un espacio con sus fotos, datos y bloques libres de una fecha, para decidir si lo reservo.

**Criterios de aceptación:**

- CA1: Dado que abro un espacio, cuando carga, entonces veo fotos, descripción, dirección en texto, capacidad, precio por hora y la política de cancelación (48 h).
- CA2: Dado que elijo una fecha, cuando la cambio, entonces veo los bloques libres de ese día.

**Seguridad (STRIDE):**

- (I) No se muestran teléfono, correo ni documentos del arrendador.
- (D) Rate limiting compartido con HU-10.

#### HU-23 · Filtros de búsqueda por precio, capacidad y características

- **Release 2 · Sprint 7** (semana 11) · tamaño S · depende de: HU-07, HU-10
- **Programa:** Sebastian Garate · **Prueba y documenta:** Adriana Callupe
- **Orden 1 de 2** en su semana · se programa Lun–Mar
- **Se documenta a fondo (capítulo 8).** Patrones: Decorator.
- **Sale en el video** de su release.

Como usuario, necesito filtrar los resultados por precio máximo, capacidad mínima y características (techado, iluminación, vestuarios, estacionamiento), para encontrar el espacio que se ajusta a lo que necesito.

**Criterios de aceptación:**

- CA1: Dado que soy arrendador, cuando edito mi espacio, entonces puedo marcar sus características de una lista fija.
- CA2: Dado que aplico uno o más filtros, cuando busco, entonces los resultados cumplen todos los filtros junto con el tipo, la zona y la fecha.
- CA3: Dado que la combinación de filtros no arroja resultados, cuando busco, entonces el sistema sugiere quitar algún filtro.

**Seguridad (STRIDE):**

- (T) Parámetros de filtro validados en servidor contra una lista blanca.
- (D) Rate limiting compartido con HU-10.

#### HU-24 · Reseñas y calificaciones

- **Release 2 · Sprint 7** (semana 11) · tamaño M · depende de: HU-14
- **Programa:** Ariel Enriquez · **Prueba y documenta:** Eduardo Saldaña
- **Orden 1 de 2** en su semana · se programa Lun–Mar
- **Se documenta a fondo (capítulo 8).** Patrones: Decorator, DAO.
- **Sale en el video** de su release.

Como usuario que usó un espacio, necesito calificarlo de 1 a 5 y dejar un comentario, para ayudar a otros a elegir con confianza.

**Criterios de aceptación:**

- CA1: Dado que tengo una reserva confirmada cuya fecha ya pasó, cuando la reseño dentro de los 14 días siguientes, entonces la reseña aparece en la ficha y se actualiza el promedio.
- CA2: Dado que no tengo una reserva pasada en ese espacio, cuando intento reseñar, entonces no se me permite.
- CA3: Dado que ya reseñé esa reserva, cuando intento reseñarla de nuevo, entonces el sistema no lo permite.

**Seguridad (STRIDE):**

- (S/T) Una reseña por reserva, validada en backend contra reservas reales.
- (T) Texto sanitizado contra inyección de scripts.
- (R) Registro de creación.

### Épica D. Reservas y disponibilidad

Permite reservar bloques horarios sin dobles reservas, consultar y cancelar reservas y recibir recordatorios.

#### HU-12 · Reserva con bloqueo temporal

- **Release 1 · Sprint 3** (semana 9) · tamaño M · depende de: HU-03, HU-08, HU-11
- **Programa:** Eduardo Saldaña · **Prueba y documenta:** Ariel Enriquez
- **Orden 2 de 6** en su semana · se programa Mié–Jue · se integra después de HU-11

Como usuario autenticado, necesito elegir uno o más bloques consecutivos y reservarlos, para asegurar el espacio mientras pago.

**Criterios de aceptación:**

- CA1: Dado que elijo bloques libres, cuando confirmo, entonces se crea una reserva "pendiente de pago" con el monto calculado en servidor y los bloques quedan retenidos 15 minutos.
- CA2: Dado que pasan 15 minutos sin pago confirmado, cuando expira, entonces la reserva pasa a "expirada" y los bloques se liberan.
- CA3: Dado que dos usuarios confirman el mismo bloque a la vez, cuando ambos envían, entonces solo uno obtiene la reserva y el otro ve "horario no disponible".
- CA4: Dado que no he iniciado sesión, cuando pulso "reservar", entonces se me redirige al login y vuelvo a la ficha después.

**Seguridad (STRIDE):**

- (S/E) Reserva a nombre del usuario de la sesión, no de un ID del cliente.
- (T) Restricción única por espacio y bloque en BD contra doble reserva.
- (D) Máximo 3 reservas pendientes simultáneas por usuario.
- (R) Registro de creación y expiración.

#### HU-14 · Mis reservas

- **Release 1 · Sprint 4** (semana 9) · tamaño S · depende de: HU-12, HU-13
- **Programa:** Adriana Callupe · **Prueba y documenta:** Sebastian Garate
- **Orden 4 de 6** en su semana · se programa Vie–Dom · se integra después de HU-12, HU-13
- **Se documenta a fondo (capítulo 8).** Patrones: Iterator, DAO.
- **Sale en el video** de su release.

Como usuario o arrendador, necesito ver mis reservas próximas y pasadas con su estado, para saber qué tengo reservado o qué me han reservado.

**Criterios de aceptación:**

- CA1: Dado que soy usuario, cuando abro "Mis reservas", entonces veo espacio, fecha, horario, monto y estado de cada una, separadas en próximas y pasadas.
- CA2: Dado que soy arrendador, cuando abro "Reservas de mis espacios", entonces veo las reservas confirmadas de mis espacios con el nombre del usuario y el horario.

**Seguridad (STRIDE):**

- (E/I) Cada consulta filtra por el usuario de la sesión.
- (I) El arrendador no ve correo, teléfono ni datos de pago del usuario.

#### HU-15 · Cancelación de reservas

- **Release 1 · Sprint 4** (semana 9) · tamaño S · depende de: HU-13, HU-14
- **Programa:** Kevin Chan · **Prueba y documenta:** Jorge Quispe
- **Orden 5 de 6** en su semana · se programa Vie–Dom · se integra después de HU-13, HU-14
- **Se documenta a fondo (capítulo 8).** Patrones: Strategy.
- **Sale en el video** de su release.

Como usuario o arrendador, necesito cancelar una reserva confirmada según una política fija, para liberar el horario sabiendo de antemano cuánto se devuelve.

**Criterios de aceptación:**

- CA1: Dado que la política es: usuario cancela con 48 h o más → 100 %; con menos de 48 h → 0 %; arrendador cancela → 100 % al usuario, cuando se calcula el reembolso, entonces se aplican esas reglas.
- CA2: Dado que cancelo desde "Mis reservas", cuando pulso cancelar, entonces veo el monto a reembolsar antes de confirmar.
- CA3: Dado que confirmo, cuando se procesa, entonces la reserva pasa a "cancelada", los bloques se liberan, se dispara el reembolso (HU-16) y el usuario y el arrendador reciben un correo.

**Seguridad (STRIDE):**

- (E) Solo el usuario de la reserva o el arrendador del espacio pueden cancelar.
- (T) Monto de reembolso calculado en servidor.
- (R) Registro de quién canceló, cuándo y el monto.
- Simplificación: política fija, no configurable.

#### HU-25 · Recordatorio de reserva por correo

- **Release 2 · Sprint 7** (semana 11) · tamaño S · depende de: HU-13
- **Programa:** Jorge Quispe · **Prueba y documenta:** Kevin Chan
- **Orden 1 de 2** en su semana · se programa Lun–Mar
- **Se documenta a fondo (capítulo 8).** Patrones: Factory Method, Adapter.
- **Sale en el video** de su release.

Como usuario o arrendador, necesito recibir un recordatorio por correo 24 h antes de cada reserva, para no olvidarla.

**Criterios de aceptación:**

- CA1: Dado que faltan 24 h para una reserva confirmada, cuando se cumple el plazo, entonces el usuario y el arrendador reciben un recordatorio.
- CA2: Dado que desactivo los recordatorios en mi perfil, cuando llega el plazo, entonces no recibo ese correo.
- CA3: Dado que desactivo los recordatorios, cuando pago o se cancela una reserva, entonces sigo recibiendo esos correos porque no se pueden desactivar.

**Seguridad (STRIDE):**

- (I) Los correos no incluyen datos de tarjeta ni documentos.
- (E) Destinatarios obtenidos de la reserva en servidor.

### Épica E. Pagos en línea

Gestiona el cobro con tarjeta vía pasarela certificada PCI DSS, los reembolsos, la liquidación al arrendador y los comprobantes.

#### HU-13 · Pago con tarjeta

- **Release 1 · Sprint 4** (semana 9) · tamaño M · depende de: HU-12
- **Programa:** Eduardo Saldaña · **Prueba y documenta:** Ariel Enriquez
- **Orden 3 de 6** en su semana · se programa Mié–Jue · se integra después de HU-12
- **Se documenta a fondo (capítulo 8).** Patrones: Adapter, Factory Method, Facade.
- **Sale en el video** de su release.

Como usuario, necesito pagar mi reserva pendiente con tarjeta, para confirmarla.

**Criterios de aceptación:**

- CA1: Dado que tengo una reserva pendiente vigente, cuando pago en el checkout de la pasarela y esta confirma, entonces la reserva pasa a "confirmada" y recibo un correo con el comprobante.
- CA2: Dado que la reserva se confirma, cuando ocurre, entonces el arrendador recibe un correo con fecha, horario y espacio reservado.
- CA3: Dado que el pago es rechazado, cuando la pasarela responde, entonces veo un mensaje genérico y puedo reintentar mientras la reserva siga vigente.
- CA4: Dado que la reserva expiró, cuando intento pagar, entonces el checkout ya no está disponible (expira junto con la reserva) y puedo reservar de nuevo.

**Seguridad (STRIDE):**

- (I/T) Checkout de pasarela certificada PCI DSS; la plataforma nunca recibe ni guarda la tarjeta.
- (S/T) Estado cambia solo por webhook con firma verificada; webhook idempotente.
- (T) Monto calculado en servidor.
- (D) Máximo 3 intentos fallidos por reserva cada 30 min (anti-carding).
- (R) Registro de cada transacción.

#### HU-16 · Reembolso automático

- **Release 1 · Sprint 4** (semana 9) · tamaño S · depende de: HU-13, HU-15
- **Programa:** Ariel Enriquez · **Prueba y documenta:** Eduardo Saldaña
- **Orden 6 de 6** en su semana · se programa Vie–Dom · se integra después de HU-13, HU-15
- **Sale en el video** de su release.

Como usuario, necesito recibir automáticamente el reembolso que corresponde cuando se cancela mi reserva, para recuperar mi dinero sin tener que reclamarlo.

**Criterios de aceptación:**

- CA1: Dado que una cancelación genera reembolso, cuando se procesa, entonces se solicita a la pasarela contra el pago original y la transacción pasa a "reembolsada" al confirmarse.
- CA2: Dado que la pasarela falla, cuando ocurre, entonces la transacción queda en "reembolso fallido", el admin la ve en su panel y puede reintentarla con un botón.

**Seguridad (STRIDE):**

- (T/I) Reembolso solo contra el pago original, vía API de la pasarela.
- (T) Idempotencia: una cancelación no genera dos reembolsos.
- (R) Registro de cada intento y resultado.

#### HU-18 · Registro de cuenta bancaria del arrendador

- **Release 2 · Sprint 5** (semana 10) · tamaño S · depende de: HU-06
- **Programa:** Ariel Enriquez · **Prueba y documenta:** Eduardo Saldaña
- **Orden 1 de 3** en su semana · se programa Lun–Mar

Como arrendador con identidad verificada, necesito registrar y cambiar la cuenta bancaria donde recibo mis pagos, para cobrar lo que generan mis reservas.

**Criterios de aceptación:**

- CA1: Dado que tengo identidad verificada, cuando registro una cuenta bancaria a mi nombre o al de mi RUC, entonces queda disponible para liquidaciones.
- CA2: Dado que cambio mi cuenta bancaria, cuando confirmo con mi contraseña, entonces recibo un correo de aviso y la siguiente liquidación se retiene 72 h.
- CA3: Dado que mi identidad no está verificada, cuando intento registrar una cuenta, entonces el sistema no lo permite.

**Seguridad (STRIDE):**

- (S/T) Reautenticación, aviso por correo y retención de 72 h ante cambios.
- (I) Datos bancarios cifrados y mostrados enmascarados.
- (R) Registro de cada cambio de cuenta.

#### HU-19 · Liquidación semanal al arrendador

- **Release 2 · Sprint 5** (semana 10) · tamaño M · depende de: HU-13, HU-18
- **Programa:** Eduardo Saldaña · **Prueba y documenta:** Ariel Enriquez
- **Orden 2 de 3** en su semana · se programa Mié–Jue · se integra después de HU-18

Como arrendador, necesito recibir cada semana lo cobrado por mis reservas menos la comisión de la plataforma, para que alquilar mi espacio me genere ingresos.

**Criterios de aceptación:**

- CA1: Dado que soy admin, cuando genero la liquidación semanal, entonces se crea una por arrendador con las reservas usadas hace más de 48 h y no liquidadas antes: monto bruto, comisión (10 %) y neto.
- CA2: Dado que transfiero el neto, cuando marco la liquidación como pagada con el número de operación, entonces el arrendador la ve como "pagada" en "Mis liquidaciones".
- CA3: Dado que un arrendador no tiene cuenta bancaria registrada, cuando se genera la liquidación, entonces queda como "pendiente de cuenta".

**Seguridad (STRIDE):**

- (T) Montos calculados solo en servidor.
- (E) Solo el admin genera y marca liquidaciones.
- (R) Registro de cada liquidación y cambio de estado.
- Simplificación: la genera el admin con un botón y transfiere a mano; sin job ni API bancaria.

#### HU-28 · Historial de pagos y comprobantes

- **Release 2 · Sprint 8** (semana 11) · tamaño S · depende de: HU-13, HU-16
- **Programa:** Eduardo Saldaña · **Prueba y documenta:** Ariel Enriquez
- **Orden 1 de 2** en su semana · se programa Lun–Mar

Como usuario, necesito ver mis pagos y reembolsos y descargar su comprobante en PDF, para llevar el control de mis gastos.

**Criterios de aceptación:**

- CA1: Dado que tengo transacciones, cuando abro el historial, entonces veo fecha, espacio, monto y estado (pagado, reembolsado).
- CA2: Dado que selecciono una transacción, cuando pido el comprobante, entonces descargo un PDF.

**Seguridad (STRIDE):**

- (E/I) Cada consulta y descarga valida que la transacción sea del usuario de la sesión.
- (I) El comprobante muestra solo los últimos 4 dígitos de la tarjeta.

### Épica F. Panel de administración

Da al administrador control operativo: verificación de arrendadores, suspensión de cuentas, reclamos y moderación de contenido.

#### HU-06 · Revisión de identidad de arrendadores

- **Release 1 · Sprint 2** (semana 8) · tamaño M · depende de: HU-05
- **Programa:** Ariel Enriquez · **Prueba y documenta:** Eduardo Saldaña
- **Orden 4 de 4** en su semana · se programa Vie–Dom · se integra después de HU-05

Como administrador, necesito revisar los documentos de los arrendadores y aprobar o rechazar su identidad, para que solo publiquen y cobren arrendadores legítimos.

**Criterios de aceptación:**

- CA1: Dado que hay arrendadores en "identidad en revisión", cuando abro la cola de revisión, entonces veo sus datos y documentos ordenados del más antiguo al más reciente.
- CA2: Dado que apruebo a un arrendador, cuando confirmo, entonces su estado pasa a "identidad verificada" y recibe un correo avisándole que ya puede publicar.
- CA3: Dado que rechazo a un arrendador, cuando confirmo con un motivo obligatorio, entonces su estado pasa a "identidad rechazada" y recibe un correo con el motivo.

**Seguridad (STRIDE):**

- (E) Cuentas admin creadas solo por script interno; rol validado en backend en cada solicitud.
- (S) Control compensatorio hasta HU-17: panel admin accesible solo desde IPs permitidas.
- (I) Documentos visibles solo mediante URL firmada de corta duración.
- (R) Registro de cada decisión (admin, arrendador, decisión, motivo, fecha).

#### HU-09 · Suspensión y reactivación de cuentas

- **Release 1 · Sprint 3** (semana 9) · tamaño S · depende de: HU-06
- **Programa:** Jorge Quispe · **Prueba y documenta:** Kevin Chan
- **Orden 1 de 6** en su semana · se programa Lun–Mar

Como administrador, necesito buscar una cuenta y suspenderla o reactivarla, para frenar un fraude o abuso de inmediato.

**Criterios de aceptación:**

- CA1: Dado que busco una cuenta por correo o nombre, cuando la encuentro, entonces veo sus datos, rol y estado.
- CA2: Dado que suspendo una cuenta con un motivo, cuando confirmo, entonces sus sesiones se invalidan, no puede iniciar sesión, sus espacios se ocultan del catálogo y recibe un correo con el motivo.
- CA3: Dado que reactivo una cuenta suspendida, cuando confirmo, entonces recupera el acceso y sus espacios vuelven a ser visibles.

**Seguridad (STRIDE):**

- (E) Rol admin validado en backend en cada solicitud.
- (S) Mismo control de IPs permitidas que HU-06 hasta HU-17.
- (R) Registro de cada acción (admin, cuenta, acción, motivo, fecha).

#### HU-26 · Reclamos sobre una reserva

- **Release 2 · Sprint 8** (semana 11) · tamaño M · depende de: HU-14, HU-16, HU-19
- **Programa:** Adriana Callupe · **Prueba y documenta:** Sebastian Garate
- **Orden 1 de 2** en su semana · se programa Lun–Mar

Como usuario, necesito reportar un problema con una reserva (espacio cerrado, distinto a lo publicado), para que la plataforma lo resuelva y, si corresponde, me devuelva el dinero.

**Criterios de aceptación:**

- CA1: Dado que mi reserva fue hace menos de 48 h, cuando abro un reclamo con motivo y descripción, entonces queda en "reclamo abierto", el arrendador puede responder y la reserva no entra en ninguna liquidación hasta resolverse.
- CA2: Dado que soy admin, cuando resuelvo el reclamo a favor del usuario, entonces se dispara un reembolso total o parcial (HU-16) y ambos reciben un correo con la resolución.
- CA3: Dado que soy admin, cuando resuelvo a favor del arrendador con un motivo, entonces la reserva vuelve a ser liquidable y ambos reciben un correo.

**Seguridad (STRIDE):**

- (E) Solo el usuario de la reserva abre el reclamo; solo un admin lo resuelve.
- (D) Un reclamo por reserva.
- (R) Registro de mensajes y resolución.
- Simplificación: sin adjuntar fotos.

#### HU-27 · Reportes y moderación de publicaciones y reseñas

- **Release 2 · Sprint 8** (semana 11) · tamaño M · depende de: HU-09, HU-17, HU-24
- **Programa:** Kevin Chan · **Prueba y documenta:** Jorge Quispe
- **Orden 2 de 2** en su semana · se programa Mié–Jue · se integra después de HU-24

Como administrador, necesito recibir reportes de usuarios sobre publicaciones o reseñas y ocultarlas o mantenerlas, para sacar del catálogo el contenido fraudulento o inapropiado.

**Criterios de aceptación:**

- CA1: Dado que soy usuario autenticado, cuando reporto un espacio o reseña eligiendo un motivo, entonces el reporte entra a la cola de moderación.
- CA2: Dado que soy admin, cuando reviso un reporte, entonces veo el contenido y el motivo, y puedo mantener u ocultar con un motivo.
- CA3: Dado que oculto una publicación, cuando confirmo, entonces el arrendador recibe un correo con el motivo y el espacio deja de verse en el catálogo.

**Seguridad (STRIDE):**

- (E/S) Solo admins con MFA (HU-17).
- (D) Máximo 10 reportes por usuario al día.
- (R) Registro de reportes y acciones.

## 10. Historias documentadas a fondo y patrones de diseño

El profesor pide exponer **una historia por integrante**. Estas 6 se documentan completas en el capítulo 8 (escenario, diagrama de secuencia, código, tabla mensaje → método) y su patrón va en la sección 7.7.
Salen de los sprints que se graban en video: el **Sprint 4 del R1** y el **Sprint 7 del R2**.

| Historia | Dueño | Patrones | Cómo se aplican |
| --- | --- | --- | --- |
| HU-13 · Pago con tarjeta | Eduardo Saldaña | Adapter, Factory Method, Facade | Adapter: una interfaz propia PasarelaPago y un adaptador que traduce la API de la pasarela (checkout y verificación de la firma del webhook), para que el dominio no dependa del proveedor. Factory Method para crear la pasarela según la configuración (sandbox o real) y Facade (CheckoutFacade) para el flujo reserva vigente → monto en servidor → checkout. |
| HU-14 · Mis reservas | Adriana Callupe | Iterator, DAO | Iterator: recorrer las reservas del usuario separadas en próximas y pasadas sin exponer la colección ni la consulta. DAO/Repository: consultas filtradas siempre por el usuario de la sesión (control STRIDE E/I). |
| HU-15 · Cancelación de reservas | Kevin Chan | Strategy | Strategy: una interfaz PoliticaReembolso con una estrategia por caso (usuario con 48 h o más → 100 %, usuario con menos de 48 h → 0 %, arrendador → 100 %). El servicio elige la estrategia sin if por tipo, y si la política deja de ser fija solo se agrega una estrategia. |
| HU-23 · Filtros de búsqueda por precio, capacidad y características | Sebastian Garate | Decorator | Decorator: cada filtro (precio máximo, capacidad mínima, característica) envuelve a la búsqueda base de HU-10 y se pueden combinar libremente, sin una subclase por cada combinación de filtros. |
| HU-24 · Reseñas y calificaciones | Ariel Enriquez | Decorator, DAO | Decorator: un ServicioResenas base publica la reseña (valida que la reserva sea del usuario, esté confirmada, ya haya pasado, esté dentro de los 14 días y no tenga reseña previa; guarda y actualiza el promedio), y los controles STRIDE se agregan como decoradores combinables sin tocarlo: SanitizacionDecorator limpia el texto antes de delegar (T) y AuditoriaDecorator registra la creación después (R). La moderación de HU-27 puede sumar otro decorador. DAO/Repository: ResenaRepository con existePorReserva y promedioPorEspacio; la validación consulta las reservas reales del usuario (de HU-14), nunca lo que mande el cliente (S/T). |
| HU-25 · Recordatorio de reserva por correo | Jorge Quispe | Factory Method, Adapter | Factory Method: crear el correo adecuado según el evento (recordatorio, pago confirmado, cancelación); solo el recordatorio respeta la preferencia de desactivarlo. Adapter para el proveedor de correo, que así se puede cambiar sin tocar el dominio. |

Al diseñar estas historias, pide a tu IA que aplique estos patrones y que lo muestre en el diagrama de clases y en el de secuencia. Los estilos, patrones y enfoques de arquitectura están en la sección 3 y en `arquitectura-propuesta.md`.
