// Generado desde el Excel del backlog con scripts/importar-excel.py. No editar a mano.
window.BACKLOG = {
 "epicas": {
  "A": {
   "nombre": "Gestión de cuentas y autenticación",
   "descripcion": "Permite a usuarios y arrendadores registrarse, autenticarse, verificar su identidad y gestionar su perfil y sus datos personales de forma segura."
  },
  "B": {
   "nombre": "Publicación y gestión de espacios",
   "descripcion": "Permite al arrendador publicar sus espacios (canchas, estadios, auditorios), definir su disponibilidad y pausar o dar de baja sus publicaciones."
  },
  "C": {
   "nombre": "Búsqueda y descubrimiento de espacios",
   "descripcion": "Permite al usuario encontrar espacios disponibles, evaluar su detalle y apoyarse en reseñas de otros usuarios."
  },
  "D": {
   "nombre": "Reservas y disponibilidad",
   "descripcion": "Permite reservar bloques horarios sin dobles reservas, consultar y cancelar reservas y recibir recordatorios."
  },
  "E": {
   "nombre": "Pagos en línea",
   "descripcion": "Gestiona el cobro con tarjeta vía pasarela certificada PCI DSS, los reembolsos, la liquidación al arrendador y los comprobantes."
  },
  "F": {
   "nombre": "Panel de administración",
   "descripcion": "Da al administrador control operativo: verificación de arrendadores, suspensión de cuentas, reclamos y moderación de contenido."
  }
 },
 "historias": {
  "HU-01": {
   "id": "HU-01",
   "titulo": "Registro de usuario con consentimiento",
   "epica": "A",
   "release": 1,
   "sprint": 1,
   "tamano": "S",
   "dependeTexto": "—",
   "depende": [],
   "descripcion": "Como visitante interesado en alquilar espacios, necesito registrarme con correo y contraseña aceptando el tratamiento de mis datos, para poder reservar espacios.",
   "criterios": [
    "CA1: Dado que soy un visitante nuevo, cuando ingreso un correo válido, una contraseña que cumple la política y marco la aceptación de términos y privacidad, entonces mi cuenta se crea y recibo un correo de verificación.",
    "CA2: Dado que no marco la aceptación de privacidad, cuando envío el formulario, entonces el registro no se completa.",
    "CA3: Dado que el correo ya existe o la contraseña es débil, cuando envío el formulario, entonces veo un mensaje genérico o los requisitos mínimos, sin revelar datos de la cuenta existente."
   ],
   "stride": [
    "(T) Contraseñas con hash seguro con sal (bcrypt/argon2).",
    "(I) Errores que no confirman si el correo existe.",
    "(D) Límite de registros por IP por hora.",
    "(R) Registro de fecha, hora, IP y versión de la política aceptada."
   ]
  },
  "HU-02": {
   "id": "HU-02",
   "titulo": "Registro de arrendador",
   "epica": "A",
   "release": 1,
   "sprint": 1,
   "tamano": "S",
   "dependeTexto": "HU-01",
   "depende": [
    "HU-01"
   ],
   "descripcion": "Como propietario de un espacio, necesito registrarme como arrendador con mis datos de contacto y facturación, para poder publicar mis espacios.",
   "criterios": [
    "CA1: Dado que completo el formulario con datos válidos y acepto la política de privacidad, cuando lo envío, entonces mi cuenta se crea con rol arrendador y estado \"correo pendiente\".",
    "CA2: Dado que el RUC/DNI no tiene un formato válido, cuando envío, entonces veo un error de validación específico.",
    "CA3: Dado que verifico mi correo, cuando ingreso, entonces mi estado pasa a \"correo verificado\" y veo el aviso de que debo verificar mi identidad para publicar."
   ],
   "stride": [
    "(E) Rol arrendador asignado en backend; no se acepta como parámetro del cliente.",
    "(I) Datos de facturación cifrados en tránsito y en reposo.",
    "(R) Registro del evento de creación con fecha, hora e IP."
   ]
  },
  "HU-03": {
   "id": "HU-03",
   "titulo": "Inicio y cierre de sesión",
   "epica": "A",
   "release": 1,
   "sprint": 1,
   "tamano": "S",
   "dependeTexto": "HU-01, HU-02",
   "depende": [
    "HU-01",
    "HU-02"
   ],
   "descripcion": "Como usuario o arrendador registrado, necesito iniciar y cerrar sesión, para acceder a las funciones de mi rol.",
   "criterios": [
    "CA1: Dado que ingreso credenciales correctas de una cuenta con correo verificado, cuando envío el formulario, entonces accedo al panel de mi rol.",
    "CA2: Dado que las credenciales son incorrectas, cuando envío, entonces veo un mensaje genérico.",
    "CA3: Dado que fallo 5 veces en 15 minutos, cuando intento de nuevo, entonces se me pide un captcha o se bloquea temporalmente el acceso.",
    "CA4: Dado que cierro sesión o paso 30 minutos inactivo, cuando vuelvo, entonces la sesión ya no es válida."
   ],
   "stride": [
    "(D) Rate limiting y bloqueo temporal ante fuerza bruta.",
    "(I) Mensaje de error genérico y TLS en toda la comunicación.",
    "(S) Token invalidado en backend al cerrar sesión o expirar.",
    "(R) Registro de intentos de acceso (fecha, IP, resultado).",
    "MFA no es parte de esta historia; llega en HU-17."
   ]
  },
  "HU-04": {
   "id": "HU-04",
   "titulo": "Recuperación de contraseña",
   "epica": "A",
   "release": 1,
   "sprint": 1,
   "tamano": "S",
   "dependeTexto": "HU-03",
   "depende": [
    "HU-03"
   ],
   "descripcion": "Como usuario o arrendador, necesito restablecer mi contraseña si la olvido, para recuperar el acceso sin pasar por soporte.",
   "criterios": [
    "CA1: Dado que solicito la recuperación, cuando envío mi correo, entonces veo siempre el mismo mensaje y, si la cuenta existe, recibo un enlace válido por 30 minutos.",
    "CA2: Dado que uso un enlace expirado o ya usado, cuando lo abro, entonces se rechaza y puedo pedir otro.",
    "CA3: Dado que cambio la contraseña, cuando confirmo, entonces se cierran todas mis sesiones activas."
   ],
   "stride": [
    "(S/T) Token aleatorio, de un solo uso, guardado con hash.",
    "(I) Respuesta idéntica exista o no el correo.",
    "(D) Máximo 3 solicitudes por correo cada hora.",
    "(R) Registro de solicitud y uso."
   ]
  },
  "HU-05": {
   "id": "HU-05",
   "titulo": "Envío de documentos de identidad del arrendador",
   "epica": "A",
   "release": 1,
   "sprint": 2,
   "tamano": "M",
   "dependeTexto": "HU-02",
   "depende": [
    "HU-02"
   ],
   "descripcion": "Como arrendador con correo verificado, necesito subir mi DNI/RUC y un documento que acredite la propiedad o autorización del espacio, para que la plataforma verifique mi identidad.",
   "criterios": [
    "CA1: Dado que tengo correo verificado, cuando subo los documentos requeridos en PDF/JPG/PNG de hasta 5 MB, entonces mi estado pasa a \"identidad en revisión\".",
    "CA2: Dado que subo un archivo de formato o tamaño no permitido, cuando lo envío, entonces se rechaza indicando el motivo.",
    "CA3: Dado que mi identidad fue rechazada, cuando entro a mi panel, entonces veo el motivo y puedo volver a subir documentos."
   ],
   "stride": [
    "(I) Documentos cifrados en almacenamiento privado, servidos con URL firmada de corta duración.",
    "(E) Solo el propio arrendador y el admin acceden a sus documentos.",
    "(T) Validación del tipo real del archivo y su tamaño.",
    "(R) Registro de cada carga."
   ]
  },
  "HU-06": {
   "id": "HU-06",
   "titulo": "Revisión de identidad de arrendadores",
   "epica": "F",
   "release": 1,
   "sprint": 2,
   "tamano": "M",
   "dependeTexto": "HU-05",
   "depende": [
    "HU-05"
   ],
   "descripcion": "Como administrador, necesito revisar los documentos de los arrendadores y aprobar o rechazar su identidad, para que solo publiquen y cobren arrendadores legítimos.",
   "criterios": [
    "CA1: Dado que hay arrendadores en \"identidad en revisión\", cuando abro la cola de revisión, entonces veo sus datos y documentos ordenados del más antiguo al más reciente.",
    "CA2: Dado que apruebo a un arrendador, cuando confirmo, entonces su estado pasa a \"identidad verificada\" y recibe un correo avisándole que ya puede publicar.",
    "CA3: Dado que rechazo a un arrendador, cuando confirmo con un motivo obligatorio, entonces su estado pasa a \"identidad rechazada\" y recibe un correo con el motivo."
   ],
   "stride": [
    "(E) Cuentas admin creadas solo por script interno; rol validado en backend en cada solicitud.",
    "(S) Control compensatorio hasta HU-17: panel admin accesible solo desde IPs permitidas.",
    "(I) Documentos visibles solo mediante URL firmada de corta duración.",
    "(R) Registro de cada decisión (admin, arrendador, decisión, motivo, fecha)."
   ]
  },
  "HU-07": {
   "id": "HU-07",
   "titulo": "Publicar y editar un espacio",
   "epica": "B",
   "release": 1,
   "sprint": 2,
   "tamano": "M",
   "dependeTexto": "HU-02 (visible tras HU-06)",
   "depende": [
    "HU-02"
   ],
   "descripcion": "Como arrendador, necesito crear y editar la ficha de mi espacio (tipo, dirección, zona, capacidad, precio por hora, hasta 5 fotos), para ofrecerlo en el catálogo.",
   "criterios": [
    "CA1: Dado que tengo correo verificado, cuando completo los campos obligatorios, entonces el espacio se guarda como borrador.",
    "CA2: Dado que mi identidad está verificada, cuando publico el borrador, entonces el espacio queda visible en el catálogo.",
    "CA3: Dado que mi identidad no está verificada, cuando intento publicar, entonces el sistema lo impide y me indica completar la verificación.",
    "CA4: Dado que edito un espacio publicado, cuando guardo, entonces los cambios se reflejan en el catálogo y las reservas ya pagadas conservan su precio."
   ],
   "stride": [
    "(E) Validación de propiedad del recurso en backend en cada edición.",
    "(T/I) Imágenes validadas en tipo y tamaño y reprocesadas para eliminar metadatos.",
    "(R) Registro de creación y edición (quién, cuándo, qué cambió)."
   ]
  },
  "HU-08": {
   "id": "HU-08",
   "titulo": "Disponibilidad del espacio",
   "epica": "B",
   "release": 1,
   "sprint": 2,
   "tamano": "M",
   "dependeTexto": "HU-07",
   "depende": [
    "HU-07"
   ],
   "descripcion": "Como arrendador, necesito definir un horario semanal en bloques de 1 hora y bloquear fechas puntuales, para controlar cuándo se puede reservar mi espacio.",
   "criterios": [
    "CA1: Dado que soy dueño del espacio, cuando defino horarios por día de la semana (ej. lunes a viernes 8:00–22:00), entonces esos bloques se pueden reservar en las próximas 8 semanas.",
    "CA2: Dado que bloqueo una fecha, cuando guardo, entonces sus bloques dejan de estar disponibles.",
    "CA3: Dado que intento bloquear una fecha con una reserva pagada, cuando guardo, entonces el sistema me avisa del conflicto y no la bloquea."
   ],
   "stride": [
    "(E) Solo el arrendador dueño modifica el calendario; validado en backend.",
    "(R) Registro de cada cambio de disponibilidad.",
    "Simplificación: los bloques libres se calculan al consultar (horario − bloqueos − reservas); no se generan con un job."
   ]
  },
  "HU-09": {
   "id": "HU-09",
   "titulo": "Suspensión y reactivación de cuentas",
   "epica": "F",
   "release": 1,
   "sprint": 3,
   "tamano": "S",
   "dependeTexto": "HU-06",
   "depende": [
    "HU-06"
   ],
   "descripcion": "Como administrador, necesito buscar una cuenta y suspenderla o reactivarla, para frenar un fraude o abuso de inmediato.",
   "criterios": [
    "CA1: Dado que busco una cuenta por correo o nombre, cuando la encuentro, entonces veo sus datos, rol y estado.",
    "CA2: Dado que suspendo una cuenta con un motivo, cuando confirmo, entonces sus sesiones se invalidan, no puede iniciar sesión, sus espacios se ocultan del catálogo y recibe un correo con el motivo.",
    "CA3: Dado que reactivo una cuenta suspendida, cuando confirmo, entonces recupera el acceso y sus espacios vuelven a ser visibles."
   ],
   "stride": [
    "(E) Rol admin validado en backend en cada solicitud.",
    "(S) Mismo control de IPs permitidas que HU-06 hasta HU-17.",
    "(R) Registro de cada acción (admin, cuenta, acción, motivo, fecha)."
   ]
  },
  "HU-10": {
   "id": "HU-10",
   "titulo": "Búsqueda por tipo, zona y fecha",
   "epica": "C",
   "release": 1,
   "sprint": 3,
   "tamano": "M",
   "dependeTexto": "HU-07, HU-08",
   "depende": [
    "HU-07",
    "HU-08"
   ],
   "descripcion": "Como usuario, necesito buscar espacios por tipo, zona y una fecha concreta, para ver solo los que puedo reservar ese día.",
   "criterios": [
    "CA1: Dado que ingreso tipo, zona y fecha, cuando busco, entonces veo solo espacios publicados de arrendadores no suspendidos con al menos un bloque libre esa fecha.",
    "CA2: Dado que se muestran resultados, cuando carga la lista, entonces veo nombre, foto principal, precio por hora y zona, en páginas de 20.",
    "CA3: Dado que no hay resultados, cuando busco, entonces veo un mensaje y la sugerencia de cambiar fecha o zona."
   ],
   "stride": [
    "(I/D) Riesgo de scraping: rate limiting por IP y máximo 20 resultados por página.",
    "(I) Riesgo aceptado: datos del catálogo públicos; sin datos personales del arrendador."
   ]
  },
  "HU-11": {
   "id": "HU-11",
   "titulo": "Detalle del espacio",
   "epica": "C",
   "release": 1,
   "sprint": 3,
   "tamano": "S",
   "dependeTexto": "HU-07, HU-08",
   "depende": [
    "HU-07",
    "HU-08"
   ],
   "descripcion": "Como usuario, necesito ver la ficha de un espacio con sus fotos, datos y bloques libres de una fecha, para decidir si lo reservo.",
   "criterios": [
    "CA1: Dado que abro un espacio, cuando carga, entonces veo fotos, descripción, dirección en texto, capacidad, precio por hora y la política de cancelación (48 h).",
    "CA2: Dado que elijo una fecha, cuando la cambio, entonces veo los bloques libres de ese día."
   ],
   "stride": [
    "(I) No se muestran teléfono, correo ni documentos del arrendador.",
    "(D) Rate limiting compartido con HU-10."
   ]
  },
  "HU-12": {
   "id": "HU-12",
   "titulo": "Reserva con bloqueo temporal",
   "epica": "D",
   "release": 1,
   "sprint": 3,
   "tamano": "M",
   "dependeTexto": "HU-03, HU-08, HU-11",
   "depende": [
    "HU-03",
    "HU-08",
    "HU-11"
   ],
   "descripcion": "Como usuario autenticado, necesito elegir uno o más bloques consecutivos y reservarlos, para asegurar el espacio mientras pago.",
   "criterios": [
    "CA1: Dado que elijo bloques libres, cuando confirmo, entonces se crea una reserva \"pendiente de pago\" con el monto calculado en servidor y los bloques quedan retenidos 15 minutos.",
    "CA2: Dado que pasan 15 minutos sin pago confirmado, cuando expira, entonces la reserva pasa a \"expirada\" y los bloques se liberan.",
    "CA3: Dado que dos usuarios confirman el mismo bloque a la vez, cuando ambos envían, entonces solo uno obtiene la reserva y el otro ve \"horario no disponible\".",
    "CA4: Dado que no he iniciado sesión, cuando pulso \"reservar\", entonces se me redirige al login y vuelvo a la ficha después."
   ],
   "stride": [
    "(S/E) Reserva a nombre del usuario de la sesión, no de un ID del cliente.",
    "(T) Restricción única por espacio y bloque en BD contra doble reserva.",
    "(D) Máximo 3 reservas pendientes simultáneas por usuario.",
    "(R) Registro de creación y expiración."
   ]
  },
  "HU-13": {
   "id": "HU-13",
   "titulo": "Pago con tarjeta",
   "epica": "E",
   "release": 1,
   "sprint": 4,
   "tamano": "M",
   "dependeTexto": "HU-12",
   "depende": [
    "HU-12"
   ],
   "descripcion": "Como usuario, necesito pagar mi reserva pendiente con tarjeta, para confirmarla.",
   "criterios": [
    "CA1: Dado que tengo una reserva pendiente vigente, cuando pago en el checkout de la pasarela y esta confirma, entonces la reserva pasa a \"confirmada\" y recibo un correo con el comprobante.",
    "CA2: Dado que la reserva se confirma, cuando ocurre, entonces el arrendador recibe un correo con fecha, horario y espacio reservado.",
    "CA3: Dado que el pago es rechazado, cuando la pasarela responde, entonces veo un mensaje genérico y puedo reintentar mientras la reserva siga vigente.",
    "CA4: Dado que la reserva expiró, cuando intento pagar, entonces el checkout ya no está disponible (expira junto con la reserva) y puedo reservar de nuevo."
   ],
   "stride": [
    "(I/T) Checkout de pasarela certificada PCI DSS; la plataforma nunca recibe ni guarda la tarjeta.",
    "(S/T) Estado cambia solo por webhook con firma verificada; webhook idempotente.",
    "(T) Monto calculado en servidor.",
    "(D) Máximo 3 intentos fallidos por reserva cada 30 min (anti-carding).",
    "(R) Registro de cada transacción."
   ]
  },
  "HU-14": {
   "id": "HU-14",
   "titulo": "Mis reservas",
   "epica": "D",
   "release": 1,
   "sprint": 4,
   "tamano": "S",
   "dependeTexto": "HU-12, HU-13",
   "depende": [
    "HU-12",
    "HU-13"
   ],
   "descripcion": "Como usuario o arrendador, necesito ver mis reservas próximas y pasadas con su estado, para saber qué tengo reservado o qué me han reservado.",
   "criterios": [
    "CA1: Dado que soy usuario, cuando abro \"Mis reservas\", entonces veo espacio, fecha, horario, monto y estado de cada una, separadas en próximas y pasadas.",
    "CA2: Dado que soy arrendador, cuando abro \"Reservas de mis espacios\", entonces veo las reservas confirmadas de mis espacios con el nombre del usuario y el horario."
   ],
   "stride": [
    "(E/I) Cada consulta filtra por el usuario de la sesión.",
    "(I) El arrendador no ve correo, teléfono ni datos de pago del usuario."
   ]
  },
  "HU-15": {
   "id": "HU-15",
   "titulo": "Cancelación de reservas",
   "epica": "D",
   "release": 1,
   "sprint": 4,
   "tamano": "S",
   "dependeTexto": "HU-13, HU-14",
   "depende": [
    "HU-13",
    "HU-14"
   ],
   "descripcion": "Como usuario o arrendador, necesito cancelar una reserva confirmada según una política fija, para liberar el horario sabiendo de antemano cuánto se devuelve.",
   "criterios": [
    "CA1: Dado que la política es: usuario cancela con 48 h o más → 100 %; con menos de 48 h → 0 %; arrendador cancela → 100 % al usuario, cuando se calcula el reembolso, entonces se aplican esas reglas.",
    "CA2: Dado que cancelo desde \"Mis reservas\", cuando pulso cancelar, entonces veo el monto a reembolsar antes de confirmar.",
    "CA3: Dado que confirmo, cuando se procesa, entonces la reserva pasa a \"cancelada\", los bloques se liberan, se dispara el reembolso (HU-16) y el usuario y el arrendador reciben un correo."
   ],
   "stride": [
    "(E) Solo el usuario de la reserva o el arrendador del espacio pueden cancelar.",
    "(T) Monto de reembolso calculado en servidor.",
    "(R) Registro de quién canceló, cuándo y el monto.",
    "Simplificación: política fija, no configurable."
   ]
  },
  "HU-16": {
   "id": "HU-16",
   "titulo": "Reembolso automático",
   "epica": "E",
   "release": 1,
   "sprint": 4,
   "tamano": "S",
   "dependeTexto": "HU-13, HU-15",
   "depende": [
    "HU-13",
    "HU-15"
   ],
   "descripcion": "Como usuario, necesito recibir automáticamente el reembolso que corresponde cuando se cancela mi reserva, para recuperar mi dinero sin tener que reclamarlo.",
   "criterios": [
    "CA1: Dado que una cancelación genera reembolso, cuando se procesa, entonces se solicita a la pasarela contra el pago original y la transacción pasa a \"reembolsada\" al confirmarse.",
    "CA2: Dado que la pasarela falla, cuando ocurre, entonces la transacción queda en \"reembolso fallido\", el admin la ve en su panel y puede reintentarla con un botón."
   ],
   "stride": [
    "(T/I) Reembolso solo contra el pago original, vía API de la pasarela.",
    "(T) Idempotencia: una cancelación no genera dos reembolsos.",
    "(R) Registro de cada intento y resultado."
   ]
  },
  "HU-17": {
   "id": "HU-17",
   "titulo": "Autenticación multifactor (MFA)",
   "epica": "A",
   "release": 2,
   "sprint": 5,
   "tamano": "M",
   "dependeTexto": "HU-03",
   "depende": [
    "HU-03"
   ],
   "descripcion": "Como administrador, usuario o arrendador, necesito un segundo factor al iniciar sesión, para que una contraseña robada no baste para entrar a mi cuenta.",
   "criterios": [
    "CA1: Dado que soy administrador, cuando inicio sesión, entonces el sistema me exige configurar y usar MFA (TOTP); sin él no accedo al panel.",
    "CA2: Dado que soy usuario o arrendador, cuando activo MFA en mi configuración, entonces los siguientes inicios de sesión piden el código.",
    "CA3: Dado que activo MFA, cuando termino la configuración, entonces recibo 5 códigos de respaldo de un solo uso."
   ],
   "stride": [
    "(S/I) TOTP estándar (RFC 6238); secretos cifrados; códigos de respaldo con hash.",
    "(D) Límite de intentos de código por sesión.",
    "(R) Registro de activación, desactivación y uso.",
    "Reemplaza (o complementa) el control de IPs de HU-06 y HU-09."
   ]
  },
  "HU-18": {
   "id": "HU-18",
   "titulo": "Registro de cuenta bancaria del arrendador",
   "epica": "E",
   "release": 2,
   "sprint": 5,
   "tamano": "S",
   "dependeTexto": "HU-06",
   "depende": [
    "HU-06"
   ],
   "descripcion": "Como arrendador con identidad verificada, necesito registrar y cambiar la cuenta bancaria donde recibo mis pagos, para cobrar lo que generan mis reservas.",
   "criterios": [
    "CA1: Dado que tengo identidad verificada, cuando registro una cuenta bancaria a mi nombre o al de mi RUC, entonces queda disponible para liquidaciones.",
    "CA2: Dado que cambio mi cuenta bancaria, cuando confirmo con mi contraseña, entonces recibo un correo de aviso y la siguiente liquidación se retiene 72 h.",
    "CA3: Dado que mi identidad no está verificada, cuando intento registrar una cuenta, entonces el sistema no lo permite."
   ],
   "stride": [
    "(S/T) Reautenticación, aviso por correo y retención de 72 h ante cambios.",
    "(I) Datos bancarios cifrados y mostrados enmascarados.",
    "(R) Registro de cada cambio de cuenta."
   ]
  },
  "HU-19": {
   "id": "HU-19",
   "titulo": "Liquidación semanal al arrendador",
   "epica": "E",
   "release": 2,
   "sprint": 5,
   "tamano": "M",
   "dependeTexto": "HU-13, HU-18",
   "depende": [
    "HU-13",
    "HU-18"
   ],
   "descripcion": "Como arrendador, necesito recibir cada semana lo cobrado por mis reservas menos la comisión de la plataforma, para que alquilar mi espacio me genere ingresos.",
   "criterios": [
    "CA1: Dado que soy admin, cuando genero la liquidación semanal, entonces se crea una por arrendador con las reservas usadas hace más de 48 h y no liquidadas antes: monto bruto, comisión (10 %) y neto.",
    "CA2: Dado que transfiero el neto, cuando marco la liquidación como pagada con el número de operación, entonces el arrendador la ve como \"pagada\" en \"Mis liquidaciones\".",
    "CA3: Dado que un arrendador no tiene cuenta bancaria registrada, cuando se genera la liquidación, entonces queda como \"pendiente de cuenta\"."
   ],
   "stride": [
    "(T) Montos calculados solo en servidor.",
    "(E) Solo el admin genera y marca liquidaciones.",
    "(R) Registro de cada liquidación y cambio de estado.",
    "Simplificación: la genera el admin con un botón y transfiere a mano; sin job ni API bancaria."
   ]
  },
  "HU-20": {
   "id": "HU-20",
   "titulo": "Edición de perfil",
   "epica": "A",
   "release": 2,
   "sprint": 6,
   "tamano": "S",
   "dependeTexto": "HU-03",
   "depende": [
    "HU-03"
   ],
   "descripcion": "Como usuario o arrendador, necesito editar mi nombre, teléfono, foto y datos de facturación, para mantener mi información correcta.",
   "criterios": [
    "CA1: Dado que estoy autenticado, cuando guardo datos válidos, entonces los cambios se reflejan de inmediato.",
    "CA2: Dado que cambio mi correo, cuando guardo, entonces el nuevo correo solo se activa tras verificarlo y el anterior recibe un aviso.",
    "CA3: Dado que soy arrendador con identidad verificada y cambio mi RUC/DNI, cuando guardo, entonces mi identidad vuelve a \"en revisión\"."
   ],
   "stride": [
    "(E) Solo se edita el perfil de la sesión.",
    "(S) Cambiar correo o facturación exige reingresar la contraseña.",
    "(R/T) Registro de cambios sensibles."
   ]
  },
  "HU-21": {
   "id": "HU-21",
   "titulo": "Pausar o dar de baja una publicación",
   "epica": "B",
   "release": 2,
   "sprint": 6,
   "tamano": "S",
   "dependeTexto": "HU-07, HU-15",
   "depende": [
    "HU-07",
    "HU-15"
   ],
   "descripcion": "Como arrendador, necesito pausar o dar de baja un espacio, para dejar de recibir reservas cuando no puedo ofrecerlo.",
   "criterios": [
    "CA1: Dado que pauso un espacio, cuando confirmo, entonces deja de aparecer en búsquedas y las reservas existentes se mantienen.",
    "CA2: Dado que doy de baja un espacio con reservas futuras, cuando confirmo, entonces veo las reservas afectadas y debo cancelarlas (reembolso 100 %) antes de completar la baja."
   ],
   "stride": [
    "(E) Solo el arrendador dueño o un admin; validado en backend.",
    "(R) Registro de pausas y bajas."
   ]
  },
  "HU-22": {
   "id": "HU-22",
   "titulo": "Derechos sobre datos personales",
   "epica": "A",
   "release": 2,
   "sprint": 6,
   "tamano": "M",
   "dependeTexto": "HU-01, HU-19, HU-20",
   "depende": [
    "HU-01",
    "HU-19",
    "HU-20"
   ],
   "descripcion": "Como usuario o arrendador, necesito descargar mis datos y solicitar la eliminación de mi cuenta, para ejercer mis derechos de acceso y supresión.",
   "criterios": [
    "CA1: Dado que estoy en mi perfil, cuando pido mis datos y confirmo con mi contraseña, entonces descargo un archivo JSON con mi perfil, reservas y pagos.",
    "CA2: Dado que no tengo reservas futuras ni liquidaciones pendientes, cuando solicito eliminar mi cuenta y confirmo con mi contraseña, entonces la cuenta se desactiva y mis datos personales se anonimizan; los registros contables se conservan el plazo legal.",
    "CA3: Dado que tengo reservas futuras o liquidaciones pendientes, cuando solicito la eliminación, entonces el sistema me indica qué debo resolver antes."
   ],
   "stride": [
    "(S) Reautenticación antes de exportar o eliminar.",
    "(I) La descarga solo incluye datos del usuario de la sesión.",
    "(R) Registro de cada exportación y eliminación."
   ]
  },
  "HU-23": {
   "id": "HU-23",
   "titulo": "Filtros de búsqueda por precio, capacidad y características",
   "epica": "C",
   "release": 2,
   "sprint": 7,
   "tamano": "S",
   "dependeTexto": "HU-07, HU-10",
   "depende": [
    "HU-07",
    "HU-10"
   ],
   "descripcion": "Como usuario, necesito filtrar los resultados por precio máximo, capacidad mínima y características (techado, iluminación, vestuarios, estacionamiento), para encontrar el espacio que se ajusta a lo que necesito.",
   "criterios": [
    "CA1: Dado que soy arrendador, cuando edito mi espacio, entonces puedo marcar sus características de una lista fija.",
    "CA2: Dado que aplico uno o más filtros, cuando busco, entonces los resultados cumplen todos los filtros junto con el tipo, la zona y la fecha.",
    "CA3: Dado que la combinación de filtros no arroja resultados, cuando busco, entonces el sistema sugiere quitar algún filtro."
   ],
   "stride": [
    "(T) Parámetros de filtro validados en servidor contra una lista blanca.",
    "(D) Rate limiting compartido con HU-10."
   ]
  },
  "HU-24": {
   "id": "HU-24",
   "titulo": "Reseñas y calificaciones",
   "epica": "C",
   "release": 2,
   "sprint": 7,
   "tamano": "M",
   "dependeTexto": "HU-14",
   "depende": [
    "HU-14"
   ],
   "descripcion": "Como usuario que usó un espacio, necesito calificarlo de 1 a 5 y dejar un comentario, para ayudar a otros a elegir con confianza.",
   "criterios": [
    "CA1: Dado que tengo una reserva confirmada cuya fecha ya pasó, cuando la reseño dentro de los 14 días siguientes, entonces la reseña aparece en la ficha y se actualiza el promedio.",
    "CA2: Dado que no tengo una reserva pasada en ese espacio, cuando intento reseñar, entonces no se me permite.",
    "CA3: Dado que ya reseñé esa reserva, cuando intento reseñarla de nuevo, entonces el sistema no lo permite."
   ],
   "stride": [
    "(S/T) Una reseña por reserva, validada en backend contra reservas reales.",
    "(T) Texto sanitizado contra inyección de scripts.",
    "(R) Registro de creación."
   ]
  },
  "HU-25": {
   "id": "HU-25",
   "titulo": "Recordatorio de reserva por correo",
   "epica": "D",
   "release": 2,
   "sprint": 7,
   "tamano": "S",
   "dependeTexto": "HU-13",
   "depende": [
    "HU-13"
   ],
   "descripcion": "Como usuario o arrendador, necesito recibir un recordatorio por correo 24 h antes de cada reserva, para no olvidarla.",
   "criterios": [
    "CA1: Dado que faltan 24 h para una reserva confirmada, cuando se cumple el plazo, entonces el usuario y el arrendador reciben un recordatorio.",
    "CA2: Dado que desactivo los recordatorios en mi perfil, cuando llega el plazo, entonces no recibo ese correo.",
    "CA3: Dado que desactivo los recordatorios, cuando pago o se cancela una reserva, entonces sigo recibiendo esos correos porque no se pueden desactivar."
   ],
   "stride": [
    "(I) Los correos no incluyen datos de tarjeta ni documentos.",
    "(E) Destinatarios obtenidos de la reserva en servidor."
   ]
  },
  "HU-26": {
   "id": "HU-26",
   "titulo": "Reclamos sobre una reserva",
   "epica": "F",
   "release": 2,
   "sprint": 8,
   "tamano": "M",
   "dependeTexto": "HU-14, HU-16, HU-19",
   "depende": [
    "HU-14",
    "HU-16",
    "HU-19"
   ],
   "descripcion": "Como usuario, necesito reportar un problema con una reserva (espacio cerrado, distinto a lo publicado), para que la plataforma lo resuelva y, si corresponde, me devuelva el dinero.",
   "criterios": [
    "CA1: Dado que mi reserva fue hace menos de 48 h, cuando abro un reclamo con motivo y descripción, entonces queda en \"reclamo abierto\", el arrendador puede responder y la reserva no entra en ninguna liquidación hasta resolverse.",
    "CA2: Dado que soy admin, cuando resuelvo el reclamo a favor del usuario, entonces se dispara un reembolso total o parcial (HU-16) y ambos reciben un correo con la resolución.",
    "CA3: Dado que soy admin, cuando resuelvo a favor del arrendador con un motivo, entonces la reserva vuelve a ser liquidable y ambos reciben un correo."
   ],
   "stride": [
    "(E) Solo el usuario de la reserva abre el reclamo; solo un admin lo resuelve.",
    "(D) Un reclamo por reserva.",
    "(R) Registro de mensajes y resolución.",
    "Simplificación: sin adjuntar fotos."
   ]
  },
  "HU-27": {
   "id": "HU-27",
   "titulo": "Reportes y moderación de publicaciones y reseñas",
   "epica": "F",
   "release": 2,
   "sprint": 8,
   "tamano": "M",
   "dependeTexto": "HU-09, HU-17, HU-24",
   "depende": [
    "HU-09",
    "HU-17",
    "HU-24"
   ],
   "descripcion": "Como administrador, necesito recibir reportes de usuarios sobre publicaciones o reseñas y ocultarlas o mantenerlas, para sacar del catálogo el contenido fraudulento o inapropiado.",
   "criterios": [
    "CA1: Dado que soy usuario autenticado, cuando reporto un espacio o reseña eligiendo un motivo, entonces el reporte entra a la cola de moderación.",
    "CA2: Dado que soy admin, cuando reviso un reporte, entonces veo el contenido y el motivo, y puedo mantener u ocultar con un motivo.",
    "CA3: Dado que oculto una publicación, cuando confirmo, entonces el arrendador recibe un correo con el motivo y el espacio deja de verse en el catálogo."
   ],
   "stride": [
    "(E/S) Solo admins con MFA (HU-17).",
    "(D) Máximo 10 reportes por usuario al día.",
    "(R) Registro de reportes y acciones."
   ]
  },
  "HU-28": {
   "id": "HU-28",
   "titulo": "Historial de pagos y comprobantes",
   "epica": "E",
   "release": 2,
   "sprint": 8,
   "tamano": "S",
   "dependeTexto": "HU-13, HU-16",
   "depende": [
    "HU-13",
    "HU-16"
   ],
   "descripcion": "Como usuario, necesito ver mis pagos y reembolsos y descargar su comprobante en PDF, para llevar el control de mis gastos.",
   "criterios": [
    "CA1: Dado que tengo transacciones, cuando abro el historial, entonces veo fecha, espacio, monto y estado (pagado, reembolsado).",
    "CA2: Dado que selecciono una transacción, cuando pido el comprobante, entonces descargo un PDF."
   ],
   "stride": [
    "(E/I) Cada consulta y descarga valida que la transacción sea del usuario de la sesión.",
    "(I) El comprobante muestra solo los últimos 4 dígitos de la tarjeta."
   ]
  }
 },
 "plan": [
  {
   "release": "Release 1 — MVP transaccional",
   "sprint": 1,
   "objetivo": "Cuentas: registro, acceso y recuperación"
  },
  {
   "release": "Release 1 — MVP transaccional",
   "sprint": 2,
   "objetivo": "Oferta verificada: identidad, publicación y disponibilidad"
  },
  {
   "release": "Release 1 — MVP transaccional",
   "sprint": 3,
   "objetivo": "Control admin, búsqueda y reserva"
  },
  {
   "release": "Release 1 — MVP transaccional",
   "sprint": 4,
   "objetivo": "Pagar, consultar, cancelar y reembolsar"
  },
  {
   "release": "Release 2 — Confianza y operación",
   "sprint": 5,
   "objetivo": "Seguridad de cuentas y cobro del arrendador"
  },
  {
   "release": "Release 2 — Confianza y operación",
   "sprint": 6,
   "objetivo": "Gestión de cuenta, publicaciones y datos personales"
  },
  {
   "release": "Release 2 — Confianza y operación",
   "sprint": 7,
   "objetivo": "Descubrimiento y confianza"
  },
  {
   "release": "Release 2 — Confianza y operación",
   "sprint": 8,
   "objetivo": "Soporte, moderación y comprobantes"
  }
 ],
 "descartadas": [
  {
   "que": "Galería ampliada (más de 5 fotos) y video",
   "decision": "Descartada",
   "motivo": "Las 5 fotos de HU-07 bastan; el video suma almacenamiento y validación costosos."
  },
  {
   "que": "Precios por franja horaria",
   "decision": "Descartada",
   "motivo": "Complica el cálculo de montos, reembolsos y liquidaciones; se usa un precio único por hora."
  },
  {
   "que": "Mapa interactivo",
   "decision": "Descartada",
   "motivo": "Depende de un proveedor externo; la dirección en texto basta."
  },
  {
   "que": "Espacios favoritos",
   "decision": "Descartada",
   "motivo": "No aporta al ciclo principal de reserva y pago."
  },
  {
   "que": "Reprogramar una reserva",
   "decision": "Descartada",
   "motivo": "Exige un cambio atómico de bloques y cobrar o devolver diferencias; se cubre cancelando y reservando de nuevo."
  },
  {
   "que": "Panel de ingresos y ocupación",
   "decision": "Descartada",
   "motivo": "\"Mis liquidaciones\" (HU-19) ya muestra lo cobrado."
  },
  {
   "que": "Destacar publicación (pago por visibilidad)",
   "decision": "Descartada",
   "motivo": "Monetización secundaria; requiere un catálogo con volumen."
  },
  {
   "que": "Pago con billetera digital, transferencias y cuotas",
   "decision": "Descartada",
   "motivo": "Cada medio es otra integración; la tarjeta cubre el MVP."
  },
  {
   "que": "Notificaciones push",
   "decision": "Descartada",
   "motivo": "Requiere app o service worker; el correo cubre los avisos."
  },
  {
   "que": "Política de cancelación configurable",
   "decision": "Simplificada",
   "motivo": "Política fija de 48 h (HU-15)."
  },
  {
   "que": "Liquidación automática (job y transferencia por API bancaria)",
   "decision": "Simplificada",
   "motivo": "El admin la genera con un botón y transfiere a mano (HU-19)."
  },
  {
   "que": "Reembolso de pagos que llegan tras expirar la reserva",
   "decision": "Simplificada",
   "motivo": "El checkout expira junto con la reserva (HU-13), así que ese caso no ocurre."
  },
  {
   "que": "Respuesta del arrendador a reseñas y fotos en reclamos",
   "decision": "Simplificada",
   "motivo": "Se dejan fuera para acotar HU-24 y HU-26."
  }
 ]
};
