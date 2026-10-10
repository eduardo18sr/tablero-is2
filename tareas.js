// Datos del plan del Proyecto Final de Ingeniería de Software II.
// Para cambiar el plan, edita este archivo. NO cambies el `id` de una tarea que ya
// tenga estado guardado: el estado (pendiente / en curso / hecho) se guarda por id.

(function () {
  const personas = [
    { id: "p1", nombre: "Jorge Quispe", pareja: "p4", huR1: "HU-01", huR2: "HU-09",
      capitulos: "1, 2, 4.1 y 13", rol: "Scrum Master: agenda las ceremonias, registra las dailies y redacta las actas." },
    { id: "p2", nombre: "Adriana Callupe", pareja: "p5", huR1: "HU-02", huR2: "HU-10",
      capitulos: "3 (métricas, Burn Up y Burn Down)", rol: "Lleva la hoja de métricas: puntos planificados y reales de cada día." },
    { id: "p3", nombre: "Eduardo Saldaña", pareja: "p6", huR1: "HU-03", huR2: "HU-12",
      capitulos: "5 (requisitos y trazabilidad) y 11", rol: "Mantiene el backlog y la matriz de trazabilidad." },
    { id: "p4", nombre: "Kevin Chan", pareja: "p1", huR1: "HU-04", huR2: "HU-07",
      capitulos: "6 (arquitectura y vistas)", rol: "Arma el esqueleto del backend." },
    { id: "p5", nombre: "Sebastian Garate", pareja: "p2", huR1: "HU-05", huR2: "HU-08",
      capitulos: "7 y 9 (diseño, clases, patrones, endpoints y base de datos)", rol: "Diseña el modelo y el script de la base de datos." },
    { id: "p6", nombre: "Ariel Enriquez", pareja: "p3", huR1: "HU-06", huR2: "HU-11",
      capitulos: "10 y 12 (pruebas y repositorio)", rol: "Arma el frontend base y las pruebas automáticas, el README y el ZIP de entrega." },
  ];

  const hu = {
    "HU-01": { titulo: "Registro de usuario", release: 1, depende: [],
      detalle: "Registro con correo y contraseña que cumpla la política, aceptando los términos y el tratamiento de datos. Verificación de correo con un enlace de un solo uso que expira. Si el correo ya existe, se avisa sin revelar más detalles. No se puede reservar sin el correo verificado." },
    "HU-02": { titulo: "Registro de arrendador", release: 1, depende: [],
      detalle: "Registro con datos de contacto y facturación, con error específico si el RUC o DNI tiene un formato inválido. Verificación de correo. El rol \"arrendador\" se asigna en el backend, no desde el formulario. Los datos de facturación se guardan cifrados." },
    "HU-03": { titulo: "Inicio de sesión", release: 1, depende: ["HU-01", "HU-02"],
      detalle: "Login con correo y contraseña que lleva al panel según el rol. Mensaje genérico ante credenciales incorrectas. Bloqueo temporal tras varios intentos fallidos. La sesión expira por inactividad. Se registra cada intento (fecha, hora, IP y resultado)." },
    "HU-04": { titulo: "Publicación de espacio con galería y calendario", release: 1, depende: ["HU-02"],
      detalle: "Publicar un espacio con tipo, ubicación, capacidad, precio, al menos 3 fotos y al menos un horario disponible. Sin horario no se puede publicar. Se pueden editar horarios y bloquear fechas, salvo las que tienen reservas. Los archivos se validan en tipo y tamaño. Solo el dueño puede editar." },
    "HU-05": { titulo: "Búsqueda de espacios", release: 1, depende: ["HU-04"],
      detalle: "Buscar por tipo, ubicación y fecha y hora, mostrando solo los espacios con disponibilidad real. Sin fecha, se filtra solo por tipo y ubicación. Si no hay resultados, se sugiere ajustar la fecha o la zona." },
    "HU-06": { titulo: "Reserva de un espacio", release: 1, depende: ["HU-03", "HU-04"],
      detalle: "En el Release 1 la reserva queda confirmada directamente y bloquea el horario. Si dos usuarios reservan a la vez, solo uno lo consigue (manejar la concurrencia). Sin sesión, se redirige al login. Un espacio sin calendario no se puede reservar." },
    "HU-07": { titulo: "Verificación de identidad del arrendador", release: 2, depende: ["HU-02"],
      detalle: "El arrendador con correo verificado sube sus documentos y queda \"en revisión\". Si se aprueban, pasa a \"verificado\"; si se rechazan, recibe el motivo y puede volver a subirlos. Los documentos se guardan cifrados y se registra cada revisión." },
    "HU-08": { titulo: "Mis reservas", release: 2, depende: ["HU-06"],
      detalle: "El usuario ve las reservas que hizo y el arrendador las que recibió, cada una con su estado y su detalle. Cada persona ve solo las suyas; la propiedad se valida en cada solicitud." },
    "HU-09": { titulo: "Recuperación de contraseña", release: 2, depende: ["HU-01"],
      detalle: "Enlace de recuperación de un solo uso con expiración corta. Un enlace vencido o ya usado se rechaza. Mensaje genérico si el correo no existe. Límite de solicitudes por cuenta e IP." },
    "HU-10": { titulo: "Perfil y derechos sobre datos personales", release: 2, depende: ["HU-03"],
      detalle: "Editar el perfil. Cambiar el correo exige verificarlo de nuevo. Exportar los datos personales y solicitar la eliminación de la cuenta, informando qué datos se conservan por ley. Se registra cada cambio." },
    "HU-11": { titulo: "Suspensión básica de cuentas", release: 2, depende: ["HU-03"],
      detalle: "El administrador busca una cuenta por nombre o correo y la suspende: la persona ya no puede iniciar sesión y se le notifica el motivo. El rol se valida en el backend y se registra cada acción. Debe estar lista antes del pago (HU-12)." },
    "HU-12": { titulo: "Pago con tarjeta de una reserva", release: 2, depende: ["HU-06", "HU-07", "HU-11"],
      detalle: "Las reservas nuevas quedan \"pendiente de pago\" (esto cambia HU-06). El pago se hace con la pasarela en modo de prueba y, si se aprueba, la reserva queda confirmada con comprobante. Un pago rechazado deja la reserva pendiente. Si vence el plazo, el horario se libera. No se cobra a arrendadores sin identidad verificada. Nunca se guardan datos de tarjeta y el monto se valida en el servidor." },
  };

  // Rangos de fechas aproximados (la semana empieza el lunes). Ajústenlos al calendario de la universidad.
  const semanas = [
    { id: "s7", titulo: "Fin de semana 7", fechas: "10–11 oct", desde: "2026-10-09", hasta: "2026-10-11",
      etiqueta: "Preparación", objetivo: "Dejar listos el backlog en el tablero Scrum, la hoja de métricas, la arquitectura base y el modelo de datos." },
    { id: "s8", titulo: "Semana 8", fechas: "12–16 oct", desde: "2026-10-12", hasta: "2026-10-18",
      etiqueta: "Release 1 · bloque 1", objetivo: "Cuentas y acceso (HU-01, HU-02 y HU-03) y la base técnica del proyecto." },
    { id: "s9", titulo: "Semana 9", fechas: "19–23 oct", desde: "2026-10-19", hasta: "2026-10-25",
      etiqueta: "Release 1 · bloque 2", objetivo: "Publicar, buscar y reservar (HU-04, HU-05 y HU-06). Cierre del Release 1 y video 1." },
    { id: "s10", titulo: "Semana 10", fechas: "26–30 oct", desde: "2026-10-26", hasta: "2026-11-01",
      etiqueta: "Release 2 · bloque 1", objetivo: "Confianza y control (HU-07, HU-08 y HU-11) y prueba de la pasarela de pago." },
    { id: "s11", titulo: "Semana 11", fechas: "2–6 nov", desde: "2026-11-02", hasta: "2026-11-08",
      etiqueta: "Release 2 · bloque 2", objetivo: "Contraseña, perfil y pago (HU-09, HU-10 y HU-12). Cierre del Release 2 y video 2." },
    { id: "s12", titulo: "Semana 12", fechas: "9–13 nov", desde: "2026-11-09", hasta: "2026-11-15",
      etiqueta: "Estabilización", objetivo: "Pruebas, corrección de defectos e informe completo. Código congelado el jueves; informe completo el viernes." },
    { id: "s13", titulo: "Semana 13", fechas: "16–20 nov", desde: "2026-11-16", hasta: "2026-11-22",
      etiqueta: "Entrega", objetivo: "Revisión final y entrega al inicio de la semana." },
  ];

  // ── Estructura del informe (plantilla oficial). `cuando`: inicio | durante | codigo | final.
  // Cada tarea indica en `secciones` qué partes del informe alimenta; así se ve la trazabilidad en ambos sentidos.
  const informe = [
    { cap: "1", titulo: "Visión general del proyecto", responsables: ["p1"], secciones: [
      { id: "1.1", titulo: "Propósito del documento", que: "Para qué sirve el informe y a quién va dirigido.", cuando: "inicio" },
      { id: "1.2", titulo: "Alcance, visión del sistema y ODS", que: "Qué es el sistema, qué se construyó en R1 y R2, qué quedó fuera y el ODS al que aporta.", cuando: "final" },
      { id: "1.3", titulo: "Objetivos del proyecto", que: "Tabla de objetivos medibles (funcionales, técnicos y de gestión) con su estado final.", cuando: "inicio" },
      { id: "1.4", titulo: "Referencias, definiciones y siglas", que: "Glosario de términos, siglas y herramientas.", cuando: "durante" },
    ]},
    { cap: "2", titulo: "Marco metodológico y organización del equipo", responsables: ["p1"], secciones: [
      { id: "2.1", titulo: "Fundamentación ágil y uso de Scrum", que: "Por qué Scrum encaja con este proyecto.", cuando: "inicio" },
      { id: "2.2", titulo: "Valores de trabajo del equipo", que: "Cada valor de Scrum con un ejemplo real y su evidencia.", cuando: "final" },
      { id: "2.3", titulo: "Personas y roles", que: "Tabla de roles: Product Owner, Scrum Master y desarrolladores, con su responsabilidad.", cuando: "inicio" },
      { id: "2.4", titulo: "Trabajo en equipo (2.4.1 a 2.4.4)", que: "Cómo se planificó, coordinó y comunicó el equipo, y qué problemas resolvió en conjunto.", cuando: "durante" },
      { id: "2.4.5", titulo: "Contribución individual", que: "Una ficha por integrante con sus aportes y evidencias. Cada uno redacta la suya.", cuando: "final" },
      { id: "2.4.6", titulo: "Evidencias del trabajo colaborativo", que: "Tabla consolidada con los códigos de evidencia y dónde encontrarlas.", cuando: "final" },
    ]},
    { cap: "3", titulo: "Métricas y análisis cuantitativo", responsables: ["p2"], secciones: [
      { id: "3.1", titulo: "Métricas por sprint", que: "Planificado frente a real: velocidad, historias completadas y defectos. Datos reales.", cuando: "durante" },
      { id: "3.2", titulo: "Estimaciones y estadística", que: "Cómo se estimó (puntos), promedios, desviaciones y proyección.", cuando: "final" },
      { id: "3.3", titulo: "Interpretación de Burn Up y Burn Down", que: "Lectura de las gráficas por release y conclusión global.", cuando: "final" },
    ]},
    { cap: "4", titulo: "Gestión del release por sprint", responsables: ["p1"], secciones: [
      { id: "4.1", titulo: "Organización general de los releases", que: "Tabla con cada release, sus sprints, fechas y objetivo.", cuando: "inicio" },
      { id: "4.S", titulo: "Documentación de cada sprint", que: "Cronograma y normas, grooming, planning, review, retro, dailies, Burn Up, Burn Down y acta de cierre.", cuando: "durante" },
      { id: "4.R", titulo: "Cierre de cada release", que: "Objetivo frente a resultado, historias entregadas y pendientes, desviaciones.", cuando: "durante" },
    ]},
    { cap: "5", titulo: "Ingeniería de requisitos", responsables: ["p3"], secciones: [
      { id: "5.1", titulo: "Product backlog actualizado", que: "El backlog en su estado final, con prioridades y cambios.", cuando: "final" },
      { id: "5.2", titulo: "Refinamiento y criterios de aceptación", que: "Qué historias se ajustaron, qué cambió y por qué.", cuando: "durante" },
      { id: "5.3", titulo: "Historias y criterios", que: "Las historias con criterios verificables.", cuando: "inicio" },
      { id: "5.4", titulo: "Riesgos, decisiones y trade-offs", que: "Riesgos y decisiones de R1 y R2, con alternativas y resultado.", cuando: "durante" },
      { id: "5.5", titulo: "Evolución de los requisitos y del producto", que: "Qué cambió entre R1 y R2 y por qué.", cuando: "final" },
      { id: "5.6", titulo: "Matriz de trazabilidad", que: "Cada historia hasta su diseño, código, prueba y evidencia.", cuando: "durante" },
    ]},
    { cap: "6", titulo: "Arquitectura de software", responsables: ["p4"], secciones: [
      { id: "6.1", titulo: "Stakeholders", que: "Quién influye en la arquitectura y qué le preocupa.", cuando: "inicio" },
      { id: "6.2", titulo: "Metas de la arquitectura", que: "Qué debe lograr la arquitectura y por qué.", cuando: "inicio" },
      { id: "6.3", titulo: "Escenarios de atributos de calidad", que: "Escenarios medibles de seguridad, desempeño, disponibilidad, etc.", cuando: "inicio" },
      { id: "6.4", titulo: "Restricciones", que: "Tecnologías obligatorias, tiempo, normas (PCI DSS, datos personales).", cuando: "inicio" },
      { id: "6.5", titulo: "Componentes y estilos arquitectónicos", que: "Componentes, tecnología y estilo (capas) con su justificación.", cuando: "codigo" },
      { id: "6.6", titulo: "Vista funcional", que: "Diagrama de casos de uso y tablas historia ↔ caso de uso ↔ requisito.", cuando: "codigo" },
      { id: "6.7", titulo: "Vista lógica", que: "Diagrama de paquetes o componentes y responsabilidades de cada capa.", cuando: "codigo" },
      { id: "6.8", titulo: "Vista de implementación", que: "Cómo está organizado el código en módulos y paquetes.", cuando: "codigo" },
      { id: "6.9", titulo: "Vista de despliegue", que: "Diagrama de despliegue: nodos, servidores, base de datos y protocolos.", cuando: "codigo" },
      { id: "6.10", titulo: "Razonamiento y evolución", que: "Decisiones de arquitectura y cómo cambió de R1 a R2.", cuando: "final" },
    ]},
    { cap: "7", titulo: "Diseño del software", responsables: ["p5"], secciones: [
      { id: "7.1", titulo: "Introducción al diseño", que: "Objetivos y principios del diseño.", cuando: "codigo" },
      { id: "7.2", titulo: "Componentes y organización interna", que: "Paquetes y componentes con sus dependencias.", cuando: "codigo" },
      { id: "7.3", titulo: "Diseño integral", que: "Diagrama de componentes con sus interfaces.", cuando: "codigo" },
      { id: "7.4", titulo: "Decisiones de diseño", que: "Problema, alternativas, elección y consecuencia.", cuando: "codigo" },
      { id: "7.5", titulo: "Diagrama de clases", que: "Clases, atributos, métodos y relaciones.", cuando: "codigo" },
      { id: "7.6", titulo: "Descripción de clases", que: "Propósito y responsabilidades de las clases clave.", cuando: "codigo" },
      { id: "7.7", titulo: "Principios y patrones aplicados", que: "Qué patrones se usaron, dónde están y por qué.", cuando: "codigo" },
    ]},
    { cap: "8", titulo: "Modelo dinámico e implementación", responsables: ["equipo"], secciones: [
      { id: "8.1", titulo: "Escenarios relevantes", que: "Qué escenarios se documentan y por qué, con su historia y sprint.", cuando: "codigo" },
      { id: "8.1.1", titulo: "Diagramas de secuencia", que: "Un diagrama por escenario, con flujo principal y alterno.", cuando: "codigo" },
      { id: "8.1.2", titulo: "Código y correspondencia", que: "El código real de cada mensaje del diagrama y la tabla mensaje → método.", cuando: "codigo" },
    ]},
    { cap: "9", titulo: "Interfaces, datos e integración", responsables: ["p5"], secciones: [
      { id: "9.1", titulo: "Interfaces (endpoints)", que: "Endpoints principales con su propósito y evidencia.", cuando: "codigo" },
      { id: "9.2", titulo: "Modelo de base de datos", que: "Diagrama entidad-relación y explicación.", cuando: "codigo" },
      { id: "9.3", titulo: "Script de base de datos", que: "Fragmentos clave del script y referencia al archivo completo.", cuando: "codigo" },
      { id: "9.4", titulo: "Integración y evidencias de funcionamiento", que: "Que todo funciona junto, con evidencias por flujo y estado final de cada funcionalidad.", cuando: "durante" },
    ]},
    { cap: "10", titulo: "Pruebas de software", responsables: ["p6"], secciones: [
      { id: "10.1", titulo: "Estrategia de pruebas", que: "Objetivos, niveles, técnicas y herramientas.", cuando: "codigo" },
      { id: "10.2", titulo: "Caja blanca", que: "Rutas y condiciones probadas y cobertura.", cuando: "final" },
      { id: "10.3", titulo: "Caja negra", que: "Escenarios con datos, resultado esperado y obtenido.", cuando: "durante" },
      { id: "10.4", titulo: "Pruebas unitarias", que: "Código de las pruebas, resultados y cobertura.", cuando: "durante" },
      { id: "10.5", titulo: "Registro de defectos", que: "Defectos con severidad, causa y corrección.", cuando: "durante" },
    ]},
    { cap: "11", titulo: "Impacto y consideraciones transversales", responsables: ["p3"], secciones: [
      { id: "11.1", titulo: "Responsabilidades éticas y profesionales", que: "Privacidad, seguridad y uso responsable de datos.", cuando: "inicio" },
      { id: "11.2", titulo: "Impacto social, económico, ambiental y global (11.2 a 11.5)", que: "Beneficios y riesgos en cada dimensión.", cuando: "inicio" },
      { id: "11.6", titulo: "Mitigación y diseño consciente", que: "Matriz de riesgos y cómo se mitigaron.", cuando: "final" },
    ]},
    { cap: "12", titulo: "Repositorio y contribución", responsables: ["p6"], secciones: [
      { id: "12.1", titulo: "URL y estructura del repositorio", que: "Enlace, ramas y organización.", cuando: "final" },
      { id: "12.2", titulo: "Contribución por participante", que: "Commits y módulos de cada persona.", cuando: "durante" },
    ]},
    { cap: "13", titulo: "Referencias y anexos", responsables: ["p1"], secciones: [
      { id: "13.1", titulo: "Referencias bibliográficas", que: "Bibliografía en formato APA.", cuando: "durante" },
      { id: "13.2", titulo: "Anexos", que: "Actas, capturas, gráficas, videos, informes individuales de impacto y evaluaciones por pares.", cuando: "final" },
    ]},
  ];

  const tareas = [
    // ── Fin de semana 7: preparación
    { id: "s7-backlog", semana: "s7", personas: ["p3"], tipo: "Scrum", titulo: "Pasar HU-01 a HU-12 al tablero Scrum",
      secciones: ["5.3", "4.S"],
      detalle: "En Jira, Trello o GitHub Projects, cada historia con sus criterios Gherkin y su análisis STRIDE del backlog v3. Ahí se toman las capturas de grooming y planning." },
    { id: "s7-metricas", semana: "s7", personas: ["p2"], tipo: "Informe", titulo: "Crear la hoja de métricas",
      secciones: ["3.1"],
      detalle: "Una fila por día con los puntos planificados, completados y restantes, y una pestaña por bloque. De ahí salen el Burn Up y el Burn Down, que deben ser datos reales." },
    { id: "s7-arquitectura", semana: "s7", personas: ["p4", "p5"], tipo: "Diseño", titulo: "Acordar la arquitectura base y el modelo de datos",
      secciones: ["6.5", "6.7", "9.2"],
      detalle: "Núcleo del backend (entidades, reglas y acceso a datos) separado de la API REST que usa el frontend. Las entidades no salen del backend: la API expone DTO. Modelo de datos en borrador para R1 y R2." },
    { id: "s7-contexto-ia", semana: "s7", personas: ["p4"], tipo: "Código", titulo: "Crear el archivo de contexto para la IA en el repositorio",
      secciones: ["7.1"],
      detalle: "Un AGENTS.md en la raíz del repositorio: stack, capas (Controller → Service → Repository), uso de DTO, convenciones de nombres, cómo correr las pruebas y reglas de seguridad. Todos los asistentes de IA lo leen y así el código sale consistente aunque lo pidan 6 personas distintas. Ver \"Cómo trabajamos\" → IA." },

    // ── Semana 8
    { id: "s8-backend-base", semana: "s8", personas: ["p4"], tipo: "Código", titulo: "Esqueleto del backend en capas",
      secciones: ["6.8", "7.2"],
      detalle: "Núcleo (entidades, servicios y repositorios o DAO) y API REST (controladores y DTO), configuración por variables de entorno y conexión a la base de datos." },
    { id: "s8-bd", semana: "s8", personas: ["p5"], tipo: "Código", titulo: "Modelo y script de la base de datos",
      secciones: ["9.2", "9.3"],
      detalle: "Tablas de R1 y R2 (usuarios, roles, espacios, horarios, reservas, documentos, pagos y auditoría), migraciones o script y datos semilla para probar y grabar las demos." },
    { id: "s8-frontend-base", semana: "s8", personas: ["p6"], tipo: "Código", titulo: "Frontend base y pruebas automáticas",
      secciones: ["6.8", "10.1"],
      detalle: "Rutas, layout y cliente HTTP hacia la API. Dejar configuradas las pruebas unitarias del backend y del frontend para que cada historia agregue las suyas." },
    { id: "s8-cap12", semana: "s8", personas: ["p1"], tipo: "Informe", titulo: "Borrador de los capítulos 1 y 2 y de la sección 4.1",
      secciones: ["1.1", "1.3", "2.1", "2.3", "4.1"],
      detalle: "Propósito, objetivos, Scrum, roles y la tabla de releases. Se puede redactar con IA a partir del enunciado y del backlog (ver la guía de prompts)." },
    { id: "s8-cap6-base", semana: "s8", personas: ["p4"], tipo: "Informe", titulo: "Borrador de las secciones 6.1 a 6.4",
      secciones: ["6.1", "6.2", "6.3", "6.4"],
      detalle: "Stakeholders, metas de la arquitectura, escenarios de atributos de calidad y restricciones. Usar los requisitos de seguridad del backlog (STRIDE, PCI DSS y datos personales) como base de los escenarios." },
    { id: "s8-cap11", semana: "s8", personas: ["p3"], tipo: "Informe", titulo: "Borrador del capítulo 11 (impactos)",
      secciones: ["11.1", "11.2"],
      detalle: "Ética y protección de datos, impacto social, económico, ambiental y global del marketplace." },

    // ── Semana 9
    { id: "s9-contratos", semana: "s9", personas: ["p4", "p5", "p6"], tipo: "Diseño", hu: ["HU-04", "HU-05", "HU-06"], cuando: "Lunes",
      titulo: "Cerrar los DTO, los endpoints y los datos semilla",
      secciones: ["9.1", "7.3"],
      detalle: "HU-04, HU-05 y HU-06 dependen entre sí. Acordar primero los DTO y los endpoints, y cargar espacios y horarios de prueba, para que la búsqueda y la reserva avancen sin esperar a la publicación." },
    { id: "s9-cap5", semana: "s9", personas: ["p3"], tipo: "Informe", titulo: "Capítulo 5: backlog, historias y criterios",
      secciones: ["5.1", "5.2", "5.3", "5.6"],
      detalle: "Backlog priorizado, historias con criterios verificables y la primera versión de la matriz de trazabilidad con las filas de HU-01 a HU-03 (ver la pestaña Historias)." },
    { id: "s9-video1", semana: "s9", personas: ["equipo"], tipo: "Video", titulo: "Grabar el video 1 (sprint elegido del Release 1)", cuando: "Viernes",
      secciones: ["13.2"],
      detalle: "En la review: objetivo y backlog del sprint, demo de cada historia con sus criterios (incluido un caso de error), pruebas automáticas corriendo, Burn Down y una conclusión de la retro. Usar los datos semilla." },
    { id: "s9-cierre-r1", semana: "s9", personas: ["p1"], tipo: "Scrum", titulo: "Cierre del Release 1 y etiqueta v1.0",
      secciones: ["4.R"],
      detalle: "Acta de cierre del release, merge a main y etiqueta v1.0 en el repositorio." },

    // ── Semana 10
    { id: "s10-spike-pago", semana: "s10", personas: ["p3"], tipo: "Código", hu: ["HU-12"], titulo: "Spike de la pasarela de pago en modo de prueba",
      secciones: ["5.4"],
      detalle: "Crear la cuenta sandbox, guardar las llaves de prueba como variables de entorno (nunca en el repositorio) y lograr un cobro de prueba con una tarjeta de prueba. Así HU-12 no se atasca en la semana 11." },
    { id: "s10-cap6", semana: "s10", personas: ["p4"], tipo: "Informe", titulo: "Capítulo 6: componentes y vistas de la arquitectura",
      secciones: ["6.5", "6.6", "6.7", "6.8", "6.9"],
      detalle: "Componentes y estilo, y las vistas funcional (casos de uso, armados con los casos de uso que deja cada historia), lógica, de implementación y de despliegue, con sus diagramas en una herramienta CASE." },
    { id: "s10-cap79", semana: "s10", personas: ["p5"], tipo: "Informe", titulo: "Capítulos 7 y 9: diseño, endpoints y base de datos",
      secciones: ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "9.1", "9.2", "9.3"],
      detalle: "Diagrama de clases, descripción de clases, principios y patrones aplicados con su justificación; endpoints, modelo y script de la base de datos. Juntar lo que dejó el paso de diseño de cada historia." },

    // ── Semana 11
    { id: "s11-flujo-pago", semana: "s11", personas: ["p3", "p6"], tipo: "Código", hu: ["HU-12", "HU-06"], titulo: "Ajustar la reserva al flujo con pago",
      secciones: ["5.4", "5.5"],
      detalle: "Con HU-12, las reservas nuevas de HU-06 quedan \"pendiente de pago\" y se liberan si vence el plazo. Coordinar el cambio para no romper la búsqueda (HU-05) ni Mis reservas (HU-08). Es un buen ejemplo de evolución del producto para la sección 5.5." },
    { id: "s11-cap10", semana: "s11", personas: ["p6"], tipo: "Informe", titulo: "Capítulo 10: estrategia de pruebas",
      secciones: ["10.1"],
      detalle: "Qué se prueba con pruebas unitarias, de caja blanca y de caja negra, con qué herramientas, y la plantilla del registro de defectos." },
    { id: "s11-video2", semana: "s11", personas: ["equipo"], tipo: "Video", titulo: "Grabar el video 2 (sprint elegido del Release 2)", cuando: "Viernes",
      secciones: ["13.2"],
      detalle: "Mismo guion que el video 1. Si sale el pago, mostrarlo con una tarjeta de prueba de la pasarela." },
    { id: "s11-cierre-r2", semana: "s11", personas: ["p1"], tipo: "Scrum", titulo: "Cierre del Release 2 y etiqueta v2.0",
      secciones: ["4.R"],
      detalle: "Acta de cierre del release, merge a main y etiqueta v2.0." },

    // ── Semana 12
    { id: "s12-pruebas", semana: "s12", personas: ["p6"], tipo: "QA", titulo: "Pruebas finales y registro de defectos",
      secciones: ["10.2", "10.3", "10.4", "10.5"],
      detalle: "Ejecutar las pruebas de caja blanca, caja negra y unitarias; medir la cobertura; registrar cada defecto con su acción correctiva." },
    { id: "s12-defectos", semana: "s12", personas: ["equipo"], tipo: "Código", titulo: "Corregir los defectos de tus historias",
      secciones: ["10.5"],
      detalle: "Cada dueño corrige lo que salga de sus historias, con pull request revisado por su pareja." },
    { id: "s12-freeze", semana: "s12", personas: ["equipo"], tipo: "Entrega", titulo: "Jueves: código congelado; viernes: informe completo",
      detalle: "Después del jueves solo se corrigen errores bloqueantes. El fin de semana queda para revisar el informe completo." },
    { id: "s12-cap3", semana: "s12", personas: ["p2"], tipo: "Informe", titulo: "Capítulo 3: métricas, estimaciones y Burn Up y Burn Down",
      secciones: ["3.1", "3.2", "3.3"],
      detalle: "Métricas planificadas frente a reales de cada bloque, variaciones, proyección e interpretación de las gráficas con los datos de la hoja." },
    { id: "s12-uml", semana: "s12", personas: ["p4"], tipo: "Entrega", titulo: "Diagramas UML en formato editable",
      secciones: ["6.6", "6.9", "7.5", "8.1.1"],
      detalle: "Casos de uso, clases, secuencia, componentes y despliegue, en los archivos fuente de la herramienta CASE (no basta con imágenes), en las carpetas que pide el enunciado." },
    { id: "s12-bd-final", semana: "s12", personas: ["p5"], tipo: "Entrega", titulo: "Modelo y script final de la base de datos",
      secciones: ["9.2", "9.3"],
      detalle: "El script de creación y los datos necesarios para reproducir la base, en la carpeta BaseDeDatos." },
    { id: "s12-cap5-final", semana: "s12", personas: ["p3"], tipo: "Informe", titulo: "Cierre de los capítulos 5 y 11",
      secciones: ["5.1", "5.4", "5.5", "5.6", "11.6"],
      detalle: "Backlog final, riesgos y decisiones, evolución de R1 a R2, matriz de trazabilidad completa con las 12 historias y la matriz de riesgos." },
    { id: "s12-cap-final-1-2", semana: "s12", personas: ["p1"], tipo: "Informe", titulo: "Cierre de los capítulos 1 y 2",
      secciones: ["1.2", "1.4", "2.2", "2.4", "2.4.6"],
      detalle: "Alcance final y ODS, glosario, valores con ejemplos reales, trabajo en equipo y la tabla consolidada de evidencias." },
    { id: "s12-cap6-final", semana: "s12", personas: ["p4"], tipo: "Informe", titulo: "Sección 6.10: evolución de la arquitectura",
      secciones: ["6.10"],
      detalle: "Decisiones de arquitectura y qué cambió de R1 a R2 (por ejemplo, el flujo de reserva con pago)." },
    { id: "s12-cap9-final", semana: "s12", personas: ["p5"], tipo: "Informe", titulo: "Sección 9.4: integración y estado final",
      secciones: ["9.4"],
      detalle: "Tabla de funcionalidades con su release, estado final y evidencia, usando las evidencias de cada historia." },
    { id: "s12-readme", semana: "s12", personas: ["p6"], tipo: "Entrega", titulo: "README, capítulo 12 y ZIP de entrega",
      secciones: ["12.1", "12.2"],
      detalle: "README con instalación, configuración, ejecución, pruebas y credenciales de prueba. URL del repositorio y contribución de cada persona. ZIP con la estructura del enunciado." },
    { id: "s12-cap13", semana: "s12", personas: ["p1"], tipo: "Informe", titulo: "Capítulo 13 y revisión general del informe",
      secciones: ["13.1", "13.2"],
      detalle: "Referencias, anexos identificados y una lectura completa para unificar el formato y revisar que no falte ninguna sección." },

    // ── Semana 13
    { id: "s13-revision", semana: "s13", personas: ["p1"], tipo: "Entrega", titulo: "Revisión final contra el enunciado",
      detalle: "Informe en PDF, código en ZIP, diagramas editables, anexos, base de datos, evaluaciones por pares, declaraciones de IA y README." },
    { id: "s13-entrega", semana: "s13", personas: ["p1"], tipo: "Entrega", titulo: "Subir la entrega al inicio de la semana",
      detalle: "No dejarla para el último día." },
  ];

  // Semanas de trabajo con sus historias. Cada historia pasa por tres pasos.
  const bloques = [
    { semana: "s8", historias: ["HU-01", "HU-02", "HU-03"] },
    { semana: "s9", historias: ["HU-04", "HU-05", "HU-06"] },
    { semana: "s10", historias: ["HU-07", "HU-08", "HU-11"] },
    { semana: "s11", historias: ["HU-09", "HU-10", "HU-12"] },
  ];
  const pasos = {
    diseno: { nombre: "Diseñar", cuando: "Lun–Mar", secciones: ["5.2", "6.6", "8.1.1", "9.1"] },
    programa: { nombre: "Programar", cuando: "Mar–Jue", secciones: ["8.1.2", "9.4", "12.2"] },
    prueba: { nombre: "Probar y documentar", cuando: "Jue–Vie", secciones: ["5.6", "9.4", "10.3", "10.4"] },
  };
  const duenoDe = (codigo) => personas.find((p) => p.huR1 === codigo || p.huR2 === codigo);
  const primer = (id) => personas.find((p) => p.id === id).nombre.split(" ")[0];

  for (const b of bloques) {
    for (const codigo of b.historias) {
      const dueno = duenoDe(codigo);
      const id = codigo.toLowerCase();
      tareas.push({ id: `${b.semana}-${id}-dis`, semana: b.semana, personas: [dueno.id], tipo: "Diseño", hu: [codigo], paso: "diseno",
        cuando: pasos.diseno.cuando, secciones: pasos.diseno.secciones,
        titulo: `Diseñar ${codigo} · ${hu[codigo].titulo}`,
        detalle: `Antes de programar, con ayuda de la IA (prompt "Diseñar una historia"): revisar los criterios, definir el caso de uso, el diagrama de secuencia del flujo principal y uno de error, y los endpoints con sus DTO. ${primer(dueno.pareja)} revisa el diseño antes de empezar a programar.` });
      tareas.push({ id: `${b.semana}-${id}-cod`, semana: b.semana, personas: [dueno.id], tipo: "Código", hu: [codigo], paso: "programa",
        cuando: pasos.programa.cuando, secciones: pasos.programa.secciones,
        titulo: `Programar ${codigo} · ${hu[codigo].titulo}`,
        detalle: `${hu[codigo].detalle} Programar siguiendo el diseño aprobado (prompt "Programar"). Cuando termines, abre el pull request para que ${primer(dueno.pareja)} lo revise y lo pruebe.` });
      tareas.push({ id: `${b.semana}-${id}-qa`, semana: b.semana, personas: [dueno.pareja], tipo: "QA", hu: [codigo], paso: "prueba",
        cuando: pasos.prueba.cuando, secciones: pasos.prueba.secciones,
        titulo: `Probar y documentar ${codigo} · la programa ${primer(dueno.id)}`,
        detalle: `Revisar el pull request, escribir las pruebas unitarias (una por criterio, incluido el de error), ejecutar los casos de caja negra y guardar capturas con el código ${codigo}-E01, ${codigo}-E02… Luego llenar la fila de ${codigo} en la matriz de trazabilidad (5.6).` });
    }
    tareas.push({ id: `${b.semana}-metricas`, semana: b.semana, personas: ["p2"], tipo: "Informe", secciones: ["3.1", "4.S"],
      titulo: "Actualizar la hoja de métricas cada día", detalle: "Puntos completados y restantes de cada día, para el Burn Up y el Burn Down." });
    tareas.push({ id: `${b.semana}-review`, semana: b.semana, personas: ["p1"], tipo: "Scrum", cuando: "Viernes", secciones: ["4.S", "2.4"],
      titulo: "Review, retro y acta",
      detalle: "Demo de cada historia contra sus criterios, retrospectiva breve, acta de cierre y capturas de las dailies de la semana. Merge a main el domingo." });
  }

  // Tareas individuales de cada persona.
  for (const p of personas) {
    tareas.push({ id: `s9-pares-r1-${p.id}`, semana: "s9", personas: [p.id], tipo: "Entrega", secciones: ["2.4.5", "13.2"],
      titulo: "Evaluación por pares del Release 1", detalle: "Informe de Actividad y Calificación por Pares del R1, en el formato oficial. Se adjunta en los anexos." });
    tareas.push({ id: `s11-pares-r2-${p.id}`, semana: "s11", personas: [p.id], tipo: "Entrega", secciones: ["2.4.5", "13.2"],
      titulo: "Evaluación por pares del Release 2", detalle: "Informe de Actividad y Calificación por Pares del R2, en el formato oficial." });
    tareas.push({ id: `s12-doc-hu-${p.id}`, semana: "s12", personas: [p.id], tipo: "Informe", secciones: ["8.1", "8.1.2"],
      titulo: "Documentar a fondo tu historia asignada (capítulo 8)",
      detalle: "Con el diagrama de secuencia que ya hiciste al diseñar y tu código: fragmentos de código por mensaje, tabla mensaje → método, explicación y referencias al repositorio (prompt \"Correspondencia diagrama-código\")." });
    tareas.push({ id: `s12-contribucion-${p.id}`, semana: "s12", personas: [p.id], tipo: "Informe", secciones: ["2.4.5"],
      titulo: "Tu ficha de contribución individual", detalle: "Actividades, responsabilidades, aportes al código y colaboración en R1 y R2, cada afirmación con su código de evidencia." });
    tareas.push({ id: `s12-impacto-${p.id}`, semana: "s12", personas: [p.id], tipo: "Informe", secciones: ["13.2"],
      titulo: "Informe individual de impacto (anexo)", detalle: "\"Impacto y consideraciones transversales en el desarrollo del proyecto\": cada integrante entrega el suyo como anexo." });
    tareas.push({ id: `s12-ia-${p.id}`, semana: "s12", personas: [p.id], tipo: "Entrega",
      titulo: "Declaración de uso de IA", detalle: "Cada integrante presenta la suya. Usa los prompts que guardaste mientras trabajabas." });
  }

  // Guía para trabajar con IA en el código y en el informe.
  const ia = {
    principios: [
      "La IA propone y redacta; la persona revisa y responde por el resultado. Nada entra a develop sin el pull request revisado por la pareja.",
      "Contexto fijo para todos: el AGENTS.md del repositorio (stack, capas, DTO, nombres, pruebas, seguridad). Así el código sale igual aunque lo pidan 6 personas distintas.",
      "Primero diseño, después código: con la historia y sus criterios se pide el diseño, se revisa, y recién entonces se pide el código siguiendo ese diseño.",
      "El informe se redacta con IA solo a partir de datos reales (actas, hoja de métricas, capturas, código). Nunca pedirle que invente métricas, dailies ni evidencias: la plantilla exige datos reales.",
      "Los diagramas que proponga la IA (por ejemplo en PlantUML) se pasan a la herramienta CASE del curso: el enunciado pide los archivos editables.",
      "Guardar los prompts importantes en una nota: se necesitan para la Declaración de uso de IA.",
    ],
    prompts: [
      { nombre: "Diseñar una historia", paso: "Diseñar", texto:
"Lee AGENTS.md. Vamos a diseñar la historia HU-XX antes de programarla.\nHistoria, criterios Gherkin y análisis STRIDE:\n<pegar desde el backlog>\n\nPropón, sin escribir código todavía:\n1. El caso de uso (actor, flujo principal y flujos alternos).\n2. Un diagrama de secuencia en PlantUML del flujo principal y otro del caso de error, respetando las capas Controller → Service → Repository y usando DTO en la API.\n3. Los endpoints REST con método, ruta, DTO de entrada y de salida, y códigos de respuesta.\n4. Las clases nuevas o modificadas.\nSi algún criterio es ambiguo, pregúntame antes de asumir." },
      { nombre: "Programar", paso: "Programar", texto:
"Lee AGENTS.md. Implementa la historia HU-XX siguiendo exactamente este diseño aprobado:\n<pegar el diseño revisado>\n\nIncluye las validaciones de cada criterio y los controles STRIDE indicados. Haz cambios pequeños y explica qué cambia en cada archivo. No toques código de otras historias sin avisar." },
      { nombre: "Pruebas", paso: "Probar y documentar", texto:
"Lee AGENTS.md. Para la historia HU-XX con estos criterios:\n<pegar criterios Gherkin>\ny este código:\n<pegar o indicar archivos>\n\n1. Escribe pruebas unitarias: al menos una por criterio, incluido el caso de error.\n2. Arma una tabla de casos de caja negra: datos de entrada, resultado esperado y cómo verificarlo." },
      { nombre: "Redactar una sección del informe", paso: "Informe", texto:
"Redacta la sección X.Y del informe de nuestro proyecto (Marketplace de alquiler de espacios) siguiendo esta instrucción de la plantilla:\n<pegar la instrucción de la plantilla>\n\nUsa SOLO estos datos reales:\n<pegar acta, métricas, capturas descritas, código, etc.>\n\nSi falta información, no la inventes: escribe [FALTA: ...] en ese lugar. Tono formal, en español, sin relleno." },
      { nombre: "Correspondencia diagrama-código", paso: "Capítulo 8", texto:
"Con este diagrama de secuencia:\n<pegar PlantUML>\ny este código real:\n<pegar las clases y métodos>\n\n1. Arma la tabla: número de mensaje del diagrama → clase y método que lo implementa.\n2. Explica en un párrafo cómo se ejecuta el flujo y cómo el orden del código coincide con el del diagrama.\nSi algún mensaje no tiene código que lo implemente, márcalo." },
    ],
  };

  window.PLAN = { entrega: "2026-11-16", personas, hu, semanas, bloques, pasos, informe, ia, tareas };
})();
