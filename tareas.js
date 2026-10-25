// Plan del Proyecto Final de Ingeniería de Software II.
// Las historias (descripción, criterios, STRIDE, dependencias) vienen de historias.js, generado desde el Excel.
// Para cambiar el plan, edita este archivo y vuelve a generar proyecto.md (ver README).
// NO cambies el `id` de una tarea que ya tenga estado guardado: el estado se guarda por id.

(function () {
  const BACKLOG = window.BACKLOG;
  const hu = BACKLOG.historias;

  const personas = [
    { id: "p1", nombre: "Jorge Quispe", rolScrum: "Developer (Dev1)", pareja: "p4",
      capitulos: "6 (arquitectura)", rol: "Arquitectura y backend base: esqueleto en capas y AGENTS.md." },
    { id: "p2", nombre: "Adriana Callupe", rolScrum: "Developer (Dev3)", pareja: "p5",
      capitulos: "3 y 11 (métricas e impacto)", rol: "Lleva la hoja de métricas cada día (puntos planificados, completados y restantes)." },
    { id: "p3", nombre: "Eduardo Saldaña", rolScrum: "Developer (Dev2)", pareja: "p6",
      capitulos: "7 y 9 (diseño, endpoints y base de datos)", rol: "Modelo y script de la base de datos, e integración con la pasarela de pago." },
    { id: "p4", nombre: "Kevin Chan", rolScrum: "Scrum Master", pareja: "p1",
      capitulos: "2, 4 y 13 (metodología, sprints y anexos)", rol: "Facilita planning, dailies, review y retro; redacta las actas y cierra cada release." },
    { id: "p5", nombre: "Sebastian Garate", rolScrum: "Developer (Dev4)", pareja: "p2",
      capitulos: "10 y 12 (pruebas y repositorio)", rol: "Frontend base en React, pruebas automáticas, README y ZIP de entrega." },
    { id: "p6", nombre: "Ariel Enriquez", rolScrum: "Product Owner", pareja: "p3",
      capitulos: "1 y 5 (visión y requisitos)", rol: "Prioriza el backlog, acepta cada historia en la review y resuelve las dudas de alcance." },
  ];

  // Quién diseña y programa cada historia. Su pareja la prueba y documenta.
  const asignacion = {
    "HU-01": "p1", "HU-02": "p2", "HU-03": "p1", "HU-04": "p3", "HU-05": "p4", "HU-06": "p6", "HU-07": "p5", "HU-08": "p5",
    "HU-09": "p1", "HU-10": "p5", "HU-11": "p2", "HU-12": "p3", "HU-13": "p3", "HU-14": "p2", "HU-15": "p4", "HU-16": "p6",
    "HU-17": "p1", "HU-18": "p6", "HU-19": "p3", "HU-20": "p2", "HU-21": "p5", "HU-22": "p4",
    "HU-23": "p5", "HU-24": "p6", "HU-25": "p1", "HU-26": "p2", "HU-27": "p4", "HU-28": "p3",
  };
  for (const p of personas) p.historias = Object.keys(asignacion).filter((c) => asignacion[c] === p.id);

  // Sprints que se graban en video (uno por release).
  const sprintsVideo = [4, 7];

  // Las 6 historias que se documentan a fondo (una por persona), elegidas por los patrones de diseño
  // del curso que mejor encajan en ellas. Todas están en los sprints del video: tres del Release 1 (sprint 4)
  // y tres del Release 2 (sprint 7).
  const documentadas = {
    "HU-13": { patrones: ["Adapter", "Factory Method", "Facade"],
      porque: "Adapter: una interfaz propia PasarelaPago y un adaptador que traduce la API de la pasarela (checkout y verificación de la firma del webhook), para que el dominio no dependa del proveedor. Factory Method para crear la pasarela según la configuración (sandbox o real) y Facade (CheckoutFacade) para el flujo reserva vigente → monto en servidor → checkout." },
    "HU-14": { patrones: ["Iterator", "DAO"],
      porque: "Iterator: recorrer las reservas del usuario separadas en próximas y pasadas sin exponer la colección ni la consulta. DAO/Repository: consultas filtradas siempre por el usuario de la sesión (control STRIDE E/I)." },
    "HU-15": { patrones: ["Strategy"],
      porque: "Strategy: una interfaz PoliticaReembolso con una estrategia por caso (usuario con 48 h o más → 100 %, usuario con menos de 48 h → 0 %, arrendador → 100 %). El servicio elige la estrategia sin if por tipo, y si la política deja de ser fija solo se agrega una estrategia." },
    "HU-23": { patrones: ["Decorator"],
      porque: "Decorator: cada filtro (precio máximo, capacidad mínima, característica) envuelve a la búsqueda base de HU-10 y se pueden combinar libremente, sin una subclase por cada combinación de filtros." },
    "HU-24": { patrones: ["Decorator", "DAO"],
      porque: "Decorator: un ServicioResenas base publica la reseña (valida que la reserva sea del usuario, esté confirmada, ya haya pasado, esté dentro de los 14 días y no tenga reseña previa; guarda y actualiza el promedio), y los controles STRIDE se agregan como decoradores combinables sin tocarlo: SanitizacionDecorator limpia el texto antes de delegar (T) y AuditoriaDecorator registra la creación después (R). La moderación de HU-27 puede sumar otro decorador. DAO/Repository: ResenaRepository con existePorReserva y promedioPorEspacio; la validación consulta las reservas reales del usuario (de HU-14), nunca lo que mande el cliente (S/T)." },
    "HU-25": { patrones: ["Factory Method", "Adapter"],
      porque: "Factory Method: crear el correo adecuado según el evento (recordatorio, pago confirmado, cancelación); solo el recordatorio respeta la preferencia de desactivarlo. Adapter para el proveedor de correo, que así se puede cambiar sin tocar el dominio." },
  };

  // Rangos de fechas aproximados (la semana empieza el lunes). Ajústenlos al calendario de la universidad.
  const semanas = [
    { id: "s7", titulo: "Fin de semana 7", fechas: "10–11 oct", desde: "2026-10-09", hasta: "2026-10-11",
      etiqueta: "Preparación", objetivo: "Dejar listos el backlog priorizado, la hoja de métricas, la arquitectura base y el archivo de contexto para la IA." },
    { id: "s8", titulo: "Semana 8", fechas: "12–16 oct", desde: "2026-10-12", hasta: "2026-10-18",
      etiqueta: "Release 1 · sprints 1 y 2", objetivo: "Cuentas, identidad del arrendador, publicación y disponibilidad (HU-01 a HU-08), más la base técnica." },
    { id: "s9", titulo: "Semana 9", fechas: "19–23 oct", desde: "2026-10-19", hasta: "2026-10-25",
      etiqueta: "Release 1 · sprints 3 y 4", objetivo: "Búsqueda, reserva, pago, cancelación y reembolso (HU-09 a HU-16). Cierre del Release 1: el ciclo publicar → buscar → reservar → pagar → cancelar funciona. Video 1." },
    { id: "s10", titulo: "Semana 10", fechas: "26–30 oct", desde: "2026-10-26", hasta: "2026-11-01",
      etiqueta: "Release 2 · sprints 5 y 6", objetivo: "MFA, cobro del arrendador, perfil, publicaciones y datos personales (HU-17 a HU-22)." },
    { id: "s11", titulo: "Semana 11", fechas: "2–6 nov", desde: "2026-11-02", hasta: "2026-11-08",
      etiqueta: "Release 2 · sprints 7 y 8", objetivo: "Filtros, reseñas, recordatorios, reclamos, moderación y comprobantes (HU-23 a HU-28). Cierre del Release 2. Video 2." },
    { id: "s12", titulo: "Semana 12", fechas: "9–13 nov", desde: "2026-11-09", hasta: "2026-11-15",
      etiqueta: "Estabilización", objetivo: "Pruebas, corrección de defectos e informe completo. Código congelado el jueves; informe completo el viernes." },
    { id: "s13", titulo: "Semana 13", fechas: "16–20 nov", desde: "2026-11-16", hasta: "2026-11-22",
      etiqueta: "Entrega", objetivo: "Revisión final y entrega al inicio de la semana." },
  ];

  // Cada semana de trabajo cubre dos sprints del backlog. Las historias del primer sprint van primero.
  const bloques = [
    { semana: "s8", sprints: [1, 2] },
    { semana: "s9", sprints: [3, 4] },
    { semana: "s10", sprints: [5, 6] },
    { semana: "s11", sprints: [7, 8] },
  ];
  for (const b of bloques) b.historias = Object.keys(hu).filter((c) => b.sprints.includes(hu[c].sprint));

  // Orden de integración dentro de cada semana, calculado con las dependencias del backlog:
  // una historia sin dependencias en la semana es orden 1; si depende de una de orden N, es orden N + 1.
  // Los órdenes se agrupan en tres tramos de la semana para programar y probar.
  const tramos = [
    { diseno: "Lun", programa: "Lun–Mar", prueba: "Mar–Mié" },
    { diseno: "Lun–Mar", programa: "Mié–Jue", prueba: "Jue–Vie" },
    { diseno: "Mar–Mié", programa: "Vie–Dom", prueba: "Sáb–Dom" },
  ];
  const orden = {};
  for (const b of bloques) {
    const nivel = {};
    const calcular = (c) => nivel[c] ?? (nivel[c] = 1 + Math.max(0, ...hu[c].depende.filter((d) => b.historias.includes(d)).map(calcular)));
    b.historias.forEach(calcular);
    b.niveles = Math.max(...Object.values(nivel));
    b.historias.sort((x, y) => nivel[x] - nivel[y] || x.localeCompare(y));
    // Con 3 niveles o menos, cada nivel es un tramo. Con más, los tramos se reparten según la cantidad de
    // historias: cada nivel cae en el tramo de su primera historia, así nunca va antes que sus dependencias.
    const primeraPosicion = {};
    b.historias.forEach((c, i) => { if (!(nivel[c] in primeraPosicion)) primeraPosicion[nivel[c]] = i + 1; });
    for (const c of b.historias) {
      const tramo = b.niveles <= 3 ? nivel[c] : Math.ceil((primeraPosicion[nivel[c]] * 3) / b.historias.length);
      orden[c] = { semana: b.semana, nivel: nivel[c], niveles: b.niveles, tramo,
        despuesDe: hu[c].depende.filter((d) => b.historias.includes(d)) };
    }
  }

  const pasos = {
    diseno: { nombre: "Diseñar", secciones: ["5.2", "6.6", "8.1.1", "9.1"] },
    programa: { nombre: "Programar", secciones: ["8.1.2", "9.4", "12.2"] },
    prueba: { nombre: "Probar y documentar", secciones: ["5.6", "9.4", "10.3", "10.4"] },
  };

  // ── Estructura del informe (plantilla oficial). `cuando`: inicio | durante | codigo | final.
  const informe = [
    { cap: "1", titulo: "Visión general del proyecto", responsables: ["p6"], secciones: [
      { id: "1.1", titulo: "Propósito del documento", que: "Para qué sirve el informe y a quién va dirigido.", cuando: "inicio" },
      { id: "1.2", titulo: "Alcance, visión del sistema y ODS", que: "Qué es el sistema, qué se construyó en R1 y R2, qué quedó fuera y el ODS al que aporta.", cuando: "final" },
      { id: "1.3", titulo: "Objetivos del proyecto", que: "Tabla de objetivos medibles (funcionales, técnicos y de gestión) con su estado final.", cuando: "inicio" },
      { id: "1.4", titulo: "Referencias, definiciones y siglas", que: "Glosario de términos, siglas y herramientas.", cuando: "durante" },
    ]},
    { cap: "2", titulo: "Marco metodológico y organización del equipo", responsables: ["p4"], secciones: [
      { id: "2.1", titulo: "Fundamentación ágil y uso de Scrum", que: "Por qué Scrum encaja con este proyecto.", cuando: "inicio" },
      { id: "2.2", titulo: "Valores de trabajo del equipo", que: "Cada valor de Scrum con un ejemplo real y su evidencia.", cuando: "final" },
      { id: "2.3", titulo: "Personas y roles", que: "Tabla de roles: Product Owner (Ariel), Scrum Master (Kevin) y Developers, con su responsabilidad.", cuando: "inicio" },
      { id: "2.4", titulo: "Trabajo en equipo (2.4.1 a 2.4.4)", que: "Cómo se planificó, coordinó y comunicó el equipo, y qué problemas resolvió en conjunto.", cuando: "durante" },
      { id: "2.4.5", titulo: "Contribución individual", que: "Una ficha por integrante con sus aportes y evidencias. Cada uno redacta la suya.", cuando: "final" },
      { id: "2.4.6", titulo: "Evidencias del trabajo colaborativo", que: "Tabla consolidada con los códigos de evidencia y dónde encontrarlas.", cuando: "final" },
    ]},
    { cap: "3", titulo: "Métricas y análisis cuantitativo", responsables: ["p2"], secciones: [
      { id: "3.1", titulo: "Métricas por sprint", que: "Planificado frente a real: velocidad, historias completadas y defectos. Datos reales.", cuando: "durante" },
      { id: "3.2", titulo: "Estimaciones y estadística", que: "Cómo se estimó (puntos), promedios, desviaciones y proyección.", cuando: "final" },
      { id: "3.3", titulo: "Interpretación de Burn Up y Burn Down", que: "Lectura de las gráficas por release y conclusión global.", cuando: "final" },
    ]},
    { cap: "4", titulo: "Gestión del release por sprint", responsables: ["p4"], secciones: [
      { id: "4.1", titulo: "Organización general de los releases", que: "Tabla con cada release, sus sprints, fechas y objetivo.", cuando: "inicio" },
      { id: "4.S", titulo: "Documentación de cada sprint", que: "Cronograma y normas, grooming, planning (tabla de tareas Doc, Cod y QA), review, retro, dailies, Burn Up, Burn Down y acta de cierre.", cuando: "durante" },
      { id: "4.R", titulo: "Cierre de cada release", que: "Objetivo frente a resultado, historias entregadas y pendientes, desviaciones.", cuando: "durante" },
    ]},
    { cap: "5", titulo: "Ingeniería de requisitos", responsables: ["p6"], secciones: [
      { id: "5.1", titulo: "Product backlog actualizado", que: "El backlog en su estado final, con prioridades y cambios.", cuando: "final" },
      { id: "5.2", titulo: "Refinamiento y criterios de aceptación", que: "Qué historias se ajustaron, qué cambió y por qué.", cuando: "durante" },
      { id: "5.3", titulo: "Historias y criterios", que: "Las historias con criterios verificables (están en el Excel).", cuando: "inicio" },
      { id: "5.4", titulo: "Riesgos, decisiones y trade-offs", que: "Riesgos y decisiones de R1 y R2, con alternativas y resultado (por ejemplo, las simplificaciones del backlog).", cuando: "durante" },
      { id: "5.5", titulo: "Evolución de los requisitos y del producto", que: "Qué cambió entre R1 y R2 y por qué.", cuando: "final" },
      { id: "5.6", titulo: "Matriz de trazabilidad", que: "Cada historia hasta su diseño, código, prueba y evidencia.", cuando: "durante" },
    ]},
    { cap: "6", titulo: "Arquitectura de software", responsables: ["p1"], secciones: [
      { id: "6.1", titulo: "Stakeholders", que: "Quién influye en la arquitectura y qué le preocupa.", cuando: "inicio" },
      { id: "6.2", titulo: "Metas de la arquitectura", que: "Qué debe lograr la arquitectura y por qué.", cuando: "inicio" },
      { id: "6.3", titulo: "Escenarios de atributos de calidad", que: "Escenarios medibles de seguridad, desempeño, disponibilidad, etc.", cuando: "inicio" },
      { id: "6.4", titulo: "Restricciones", que: "Spring Boot y React decididos, base de datos relacional, PCI DSS, protección de datos personales y tiempo.", cuando: "inicio" },
      { id: "6.5", titulo: "Componentes y estilos arquitectónicos", que: "Componentes, tecnología y estilo (capas) con su justificación.", cuando: "codigo" },
      { id: "6.6", titulo: "Vista funcional", que: "Diagrama de casos de uso y tablas historia ↔ caso de uso ↔ requisito.", cuando: "codigo" },
      { id: "6.7", titulo: "Vista lógica", que: "Diagrama de paquetes o componentes y responsabilidades de cada capa.", cuando: "codigo" },
      { id: "6.8", titulo: "Vista de implementación", que: "Cómo está organizado el código en módulos y paquetes.", cuando: "codigo" },
      { id: "6.9", titulo: "Vista de despliegue", que: "Diagrama de despliegue: nodos, servidores, base de datos y protocolos.", cuando: "codigo" },
      { id: "6.10", titulo: "Razonamiento y evolución", que: "Decisiones de arquitectura (incluida la elección de la base de datos) y cómo cambió de R1 a R2.", cuando: "final" },
    ]},
    { cap: "7", titulo: "Diseño del software", responsables: ["p3"], secciones: [
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
    { cap: "9", titulo: "Interfaces, datos e integración", responsables: ["p3"], secciones: [
      { id: "9.1", titulo: "Interfaces (endpoints)", que: "Endpoints principales con su propósito y evidencia.", cuando: "codigo" },
      { id: "9.2", titulo: "Modelo de base de datos", que: "Diagrama entidad-relación y explicación.", cuando: "codigo" },
      { id: "9.3", titulo: "Script de base de datos", que: "Fragmentos clave del script y referencia al archivo completo.", cuando: "codigo" },
      { id: "9.4", titulo: "Integración y evidencias de funcionamiento", que: "Que todo funciona junto, con evidencias por flujo y estado final de cada funcionalidad.", cuando: "durante" },
    ]},
    { cap: "10", titulo: "Pruebas de software", responsables: ["p5"], secciones: [
      { id: "10.1", titulo: "Estrategia de pruebas", que: "Objetivos, niveles, técnicas y herramientas.", cuando: "codigo" },
      { id: "10.2", titulo: "Caja blanca", que: "Rutas y condiciones probadas y cobertura.", cuando: "final" },
      { id: "10.3", titulo: "Caja negra", que: "Escenarios con datos, resultado esperado y obtenido.", cuando: "durante" },
      { id: "10.4", titulo: "Pruebas unitarias", que: "Código de las pruebas, resultados y cobertura.", cuando: "durante" },
      { id: "10.5", titulo: "Registro de defectos", que: "Defectos con severidad, causa y corrección.", cuando: "durante" },
    ]},
    { cap: "11", titulo: "Impacto y consideraciones transversales", responsables: ["p2"], secciones: [
      { id: "11.1", titulo: "Responsabilidades éticas y profesionales", que: "Privacidad, seguridad y uso responsable de datos.", cuando: "inicio" },
      { id: "11.2", titulo: "Impacto social, económico, ambiental y global (11.2 a 11.5)", que: "Beneficios y riesgos en cada dimensión.", cuando: "inicio" },
      { id: "11.6", titulo: "Mitigación y diseño consciente", que: "Matriz de riesgos y cómo se mitigaron.", cuando: "final" },
    ]},
    { cap: "12", titulo: "Repositorio y contribución", responsables: ["p5"], secciones: [
      { id: "12.1", titulo: "URL y estructura del repositorio", que: "Enlace, ramas y organización.", cuando: "final" },
      { id: "12.2", titulo: "Contribución por participante", que: "Commits y módulos de cada persona.", cuando: "durante" },
    ]},
    { cap: "13", titulo: "Referencias y anexos", responsables: ["p4"], secciones: [
      { id: "13.1", titulo: "Referencias bibliográficas", que: "Bibliografía en formato APA.", cuando: "durante" },
      { id: "13.2", titulo: "Anexos", que: "Actas, capturas, gráficas, videos, informes individuales de impacto y evaluaciones por pares.", cuando: "final" },
    ]},
  ];

  const tareas = [
    // ── Fin de semana 7: preparación
    { id: "s7-backlog", semana: "s7", personas: ["p6"], tipo: "Scrum", titulo: "Pasar HU-01 a HU-28 al tablero Scrum y priorizarlas",
      secciones: ["5.1", "5.3", "4.S"],
      detalle: "En Jira, Trello o GitHub Projects, cada historia con sus criterios Gherkin y su STRIDE del Excel. Como Product Owner, Ariel confirma la prioridad y resuelve las dudas de alcance. Ahí se toman las capturas de grooming y planning." },
    { id: "s7-metricas", semana: "s7", personas: ["p2"], tipo: "Informe", titulo: "Crear la hoja de métricas",
      secciones: ["3.1"],
      detalle: "Una fila por día con los puntos planificados, completados y restantes, y una pestaña por sprint. De ahí salen el Burn Up y el Burn Down, que deben ser datos reales." },
    { id: "s7-arquitectura", semana: "s7", personas: ["p1", "p3"], tipo: "Diseño", titulo: "Acordar la arquitectura base y elegir la base de datos",
      secciones: ["6.4", "6.5", "6.7", "9.2"],
      detalle: "Spring Boot (backend) y React (frontend) están decididos. Para la base de datos, la propuesta es PostgreSQL (arquitectura-propuesta.md y despliegue en AWS del repositorio); falta confirmarla en equipo. Como es una decisión de arquitectura, se anotan las alternativas y el criterio para las secciones 6.4 y 6.10. Núcleo del backend separado de la API REST, y la API expone DTO, nunca entidades." },
    { id: "s7-contexto-ia", semana: "s7", personas: ["p1"], tipo: "Código", titulo: "Llevar proyecto.md al repositorio como AGENTS.md",
      secciones: ["7.1"],
      detalle: "Copiar la especificación (pestaña Especificación) a la raíz del repositorio del proyecto como AGENTS.md, completando la base de datos elegida y la estructura real de paquetes. Todos los asistentes de IA la leen, y así el código sale consistente aunque lo pidan 6 personas distintas." },

    // ── Semana 8
    { id: "s8-backend-base", semana: "s8", personas: ["p1"], tipo: "Código", titulo: "Esqueleto del backend Spring Boot en capas",
      secciones: ["6.8", "7.2"],
      detalle: "Un paquete por módulo (cuentas, espacios, busqueda, reservas, pagos, administracion), cada uno con controller, service, repository, entity y dto. Configuración por variables de entorno, manejo global de errores y registro de auditoría reutilizable (la R de STRIDE aparece en casi todas las historias)." },
    { id: "s8-bd", semana: "s8", personas: ["p3"], tipo: "Código", titulo: "Modelo y script de la base de datos",
      secciones: ["9.2", "9.3"],
      detalle: "Tablas de las 28 historias (usuarios, roles, estados de cuenta, documentos, espacios, horarios, bloqueos, reservas, pagos, reembolsos, cuentas bancarias, liquidaciones, reseñas, reclamos, reportes y auditoría), con la restricción única por espacio y bloque (HU-12). Datos semilla para probar y grabar las demos." },
    { id: "s8-frontend-base", semana: "s8", personas: ["p5"], tipo: "Código", titulo: "Frontend base en React y pruebas automáticas",
      secciones: ["6.8", "10.1"],
      detalle: "Rutas, layout, guardas por rol y cliente HTTP hacia la API. Dejar configuradas las pruebas unitarias del backend (JUnit) y del frontend para que cada historia agregue las suyas." },
    { id: "s8-spike-pago", semana: "s8", personas: ["p3"], tipo: "Código", hu: ["HU-13", "HU-16"], titulo: "Spike de la pasarela de pago en modo de prueba",
      secciones: ["5.4"],
      detalle: "El pago (HU-13) y el reembolso (HU-16) llegan la semana 9. Esta semana: cuenta sandbox, llaves de prueba en variables de entorno (nunca en el repositorio), un checkout de prueba y un webhook con firma verificada." },
    { id: "s8-cap1", semana: "s8", personas: ["p6"], tipo: "Informe", titulo: "Borrador de las secciones 1.1 y 1.3",
      secciones: ["1.1", "1.3"],
      detalle: "Propósito del informe y objetivos medibles. Se puede redactar con IA a partir del enunciado y del backlog (ver los prompts)." },
    { id: "s8-cap2", semana: "s8", personas: ["p4"], tipo: "Informe", titulo: "Borrador de las secciones 2.1, 2.3 y 4.1",
      secciones: ["2.1", "2.3", "4.1"],
      detalle: "Por qué Scrum, la tabla de roles (PO Ariel, SM Kevin y los 4 Developers) y la tabla de releases y sprints." },
    { id: "s8-cap6-base", semana: "s8", personas: ["p1"], tipo: "Informe", titulo: "Borrador de las secciones 6.1 a 6.4",
      secciones: ["6.1", "6.2", "6.3", "6.4"],
      detalle: "Stakeholders, metas de la arquitectura, escenarios de atributos de calidad y restricciones. Los controles STRIDE, PCI DSS y la protección de datos del backlog son la base de los escenarios." },
    { id: "s8-cap11", semana: "s8", personas: ["p2"], tipo: "Informe", titulo: "Borrador del capítulo 11 (impactos)",
      secciones: ["11.1", "11.2"],
      detalle: "Ética y protección de datos (HU-22), impacto social, económico, ambiental y global del marketplace." },

    // ── Semana 9
    { id: "s9-cap5", semana: "s9", personas: ["p6"], tipo: "Informe", titulo: "Capítulo 5: backlog, historias y criterios",
      secciones: ["5.1", "5.2", "5.3", "5.6"],
      detalle: "Backlog priorizado, historias con criterios verificables y la matriz de trazabilidad con las filas de HU-01 a HU-08 (ver la pestaña Historias)." },
    { id: "s9-video1", semana: "s9", personas: ["equipo"], tipo: "Video", titulo: "Grabar el video 1 (Sprint 4 del Release 1)", cuando: "Viernes",
      hu: ["HU-13", "HU-14", "HU-15", "HU-16"], secciones: ["13.2"],
      detalle: "Sprint 4 \"Pagar, consultar, cancelar y reembolsar\": pagar en el checkout de prueba, ver Mis reservas, cancelar y recibir el reembolso. Guion: objetivo y backlog del sprint, demo de cada historia con sus criterios (incluido un caso de error), pruebas automáticas corriendo, Burn Down y una conclusión de la retro. Cada dueño presenta su historia y menciona el patrón que aplicó." },
    { id: "s9-cierre-r1", semana: "s9", personas: ["p4"], tipo: "Scrum", titulo: "Cierre del Release 1 y etiqueta v1.0",
      secciones: ["4.R"],
      detalle: "Acta de cierre del release: el ciclo publicar → buscar → reservar → pagar → cancelar con reembolso funciona. Merge a main y etiqueta v1.0." },

    // ── Semana 10
    { id: "s10-cap6", semana: "s10", personas: ["p1"], tipo: "Informe", titulo: "Capítulo 6: componentes y vistas de la arquitectura",
      secciones: ["6.5", "6.6", "6.7", "6.8", "6.9"],
      detalle: "Componentes y estilo, y las vistas funcional (casos de uso que dejó cada historia), lógica, de implementación y de despliegue, con sus diagramas en una herramienta CASE." },
    { id: "s10-cap79", semana: "s10", personas: ["p3"], tipo: "Informe", titulo: "Capítulos 7 y 9: diseño, endpoints y base de datos",
      secciones: ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "9.1", "9.2", "9.3"],
      detalle: "Diagrama de clases, descripción de clases, principios y patrones aplicados con su justificación; endpoints, modelo y script de la base de datos. Juntar lo que dejó el paso de diseño de cada historia." },

    // ── Semana 11
    { id: "s11-cap10", semana: "s11", personas: ["p5"], tipo: "Informe", titulo: "Capítulo 10: estrategia de pruebas",
      secciones: ["10.1"],
      detalle: "Qué se prueba con pruebas unitarias, de caja blanca y de caja negra, con qué herramientas, y la plantilla del registro de defectos." },
    { id: "s11-video2", semana: "s11", personas: ["equipo"], tipo: "Video", titulo: "Grabar el video 2 (Sprint 7 del Release 2)", cuando: "Viernes",
      hu: ["HU-23", "HU-24", "HU-25"], secciones: ["13.2"],
      detalle: "Sprint 7 \"Descubrimiento y confianza\": filtros combinados, reseñas y el correo de recordatorio. Mismo guion que el video 1." },
    { id: "s11-cierre-r2", semana: "s11", personas: ["p4"], tipo: "Scrum", titulo: "Cierre del Release 2 y etiqueta v2.0",
      secciones: ["4.R"],
      detalle: "Acta de cierre del release, merge a main y etiqueta v2.0." },

    // ── Semana 12
    { id: "s12-pruebas", semana: "s12", personas: ["p5"], tipo: "QA", titulo: "Pruebas finales y registro de defectos",
      secciones: ["10.2", "10.3", "10.4", "10.5"],
      detalle: "Ejecutar las pruebas de caja blanca, caja negra y unitarias; medir la cobertura; registrar cada defecto con su acción correctiva." },
    { id: "s12-defectos", semana: "s12", personas: ["equipo"], tipo: "Código", titulo: "Corregir los defectos de tus historias",
      secciones: ["10.5"],
      detalle: "Cada dueño corrige lo que salga de sus historias, con pull request revisado por su pareja." },
    { id: "s12-freeze", semana: "s12", personas: ["equipo"], tipo: "Entrega", titulo: "Jueves: código congelado; viernes: informe completo",
      detalle: "Después del jueves solo se corrigen errores bloqueantes. El fin de semana queda para revisar el informe completo." },
    { id: "s12-cap3", semana: "s12", personas: ["p2"], tipo: "Informe", titulo: "Capítulo 3: métricas, estimaciones y Burn Up y Burn Down",
      secciones: ["3.1", "3.2", "3.3"],
      detalle: "Métricas planificadas frente a reales de cada sprint, variaciones, proyección e interpretación de las gráficas con los datos de la hoja." },
    { id: "s12-cap11-final", semana: "s12", personas: ["p2"], tipo: "Informe", titulo: "Sección 11.6: matriz de riesgos y mitigación",
      secciones: ["11.6"],
      detalle: "Riesgos técnicos, sociales, económicos, ambientales y éticos, y cómo se mitigaron (los controles STRIDE son buena evidencia)." },
    { id: "s12-uml", semana: "s12", personas: ["p1"], tipo: "Entrega", titulo: "Diagramas UML en formato editable",
      secciones: ["6.6", "6.9", "7.5", "8.1.1"],
      detalle: "Casos de uso, clases, secuencia, componentes y despliegue, en los archivos fuente de la herramienta CASE (no basta con imágenes), en las carpetas que pide el enunciado." },
    { id: "s12-cap6-final", semana: "s12", personas: ["p1"], tipo: "Informe", titulo: "Sección 6.10: razonamiento y evolución de la arquitectura",
      secciones: ["6.10"],
      detalle: "Decisiones de arquitectura (incluida la base de datos elegida) y qué cambió de R1 a R2 (por ejemplo, MFA reemplazando el control por IP del panel de administración)." },
    { id: "s12-bd-final", semana: "s12", personas: ["p3"], tipo: "Entrega", titulo: "Modelo y script final de la base de datos",
      secciones: ["9.2", "9.3"],
      detalle: "El script de creación y los datos necesarios para reproducir la base, en la carpeta BaseDeDatos." },
    { id: "s12-cap9-final", semana: "s12", personas: ["p3"], tipo: "Informe", titulo: "Sección 9.4: integración y estado final",
      secciones: ["9.4"],
      detalle: "Tabla de funcionalidades con su release, estado final y evidencia, usando las evidencias de cada historia." },
    { id: "s12-cap5-final", semana: "s12", personas: ["p6"], tipo: "Informe", titulo: "Cierre del capítulo 5",
      secciones: ["5.1", "5.4", "5.5", "5.6"],
      detalle: "Backlog final, riesgos y decisiones (incluidas las simplificaciones del backlog), evolución de R1 a R2 y la matriz de trazabilidad completa con las 28 historias." },
    { id: "s12-cap1-final", semana: "s12", personas: ["p6"], tipo: "Informe", titulo: "Cierre del capítulo 1",
      secciones: ["1.2", "1.4"],
      detalle: "Alcance final, lo que quedó fuera (hoja DESCARTADAS_Y_SIMPLIFICADAS del Excel), el ODS y el glosario." },
    { id: "s12-cap2-final", semana: "s12", personas: ["p4"], tipo: "Informe", titulo: "Cierre del capítulo 2",
      secciones: ["2.2", "2.4", "2.4.6"],
      detalle: "Valores con ejemplos reales, trabajo en equipo y la tabla consolidada de evidencias." },
    { id: "s12-readme", semana: "s12", personas: ["p5"], tipo: "Entrega", titulo: "README, capítulo 12 y ZIP de entrega",
      secciones: ["12.1", "12.2"],
      detalle: "README con instalación, configuración, ejecución, pruebas y credenciales de prueba. URL del repositorio y contribución de cada persona. ZIP con la estructura del enunciado." },
    { id: "s12-cap13", semana: "s12", personas: ["p4"], tipo: "Informe", titulo: "Capítulo 13 y revisión general del informe",
      secciones: ["13.1", "13.2"],
      detalle: "Referencias, anexos identificados y una lectura completa para unificar el formato y revisar que no falte ninguna sección." },

    // ── Semana 13
    { id: "s13-revision", semana: "s13", personas: ["p4"], tipo: "Entrega", titulo: "Revisión final contra el enunciado",
      detalle: "Informe en PDF, código en ZIP, diagramas editables, anexos, base de datos, evaluaciones por pares, declaraciones de IA y README." },
    { id: "s13-entrega", semana: "s13", personas: ["p4"], tipo: "Entrega", titulo: "Subir la entrega al inicio de la semana",
      detalle: "No dejarla para el último día." },
  ];

  const primer = (id) => personas.find((p) => p.id === id).nombre.split(" ")[0];
  const pareja = (id) => personas.find((p) => p.id === id).pareja;

  // Tareas de cada semana de trabajo: contratos, los tres pasos de cada historia, métricas, aceptación y review.
  for (const b of bloques) {
    const duenos = [...new Set(b.historias.map((c) => asignacion[c]))];
    tareas.push({ id: `${b.semana}-contratos`, semana: b.semana, personas: duenos, tipo: "Diseño", hu: b.historias, cuando: "Lunes",
      secciones: ["9.1", "7.3"],
      titulo: `Acordar contratos de la semana (sprints ${b.sprints.join(" y ")})`,
      detalle: "Varias historias de la semana dependen entre sí. Antes de programar, los dueños acuerdan los DTO, los endpoints y los estados (de cuenta, reserva o pago) que comparten, y cargan datos semilla para no esperarse unos a otros." });
    for (const codigo of b.historias) {
      const dueno = asignacion[codigo];
      const o = orden[codigo];
      const t = tramos[o.tramo - 1];
      const id = codigo.toLowerCase();
      const info = hu[codigo];
      const espera = o.despuesDe.length
        ? ` Orden ${o.nivel} de ${o.niveles} en la semana: se integra después de ${o.despuesDe.join(" y ")} (mientras tanto, programa contra los contratos acordados el lunes).`
        : ` Orden ${o.nivel} de ${o.niveles} en la semana: no depende de otra historia de esta semana.`;
      const comun = { semana: b.semana, hu: [codigo], orden: o.nivel, niveles: o.niveles, despuesDe: o.despuesDe };
      tareas.push({ ...comun, id: `${b.semana}-${id}-dis`, personas: [dueno], tipo: "Diseño", paso: "diseno",
        cuando: t.diseno, secciones: pasos.diseno.secciones,
        titulo: `Diseñar ${codigo} · ${info.titulo}`,
        detalle: `Antes de programar, con ayuda de la IA (prompt "Diseñar una historia"): caso de uso, diagrama de secuencia del flujo principal y de un error, endpoints con sus DTO y clases. ${primer(pareja(dueno))} revisa el diseño antes de programar.` });
      tareas.push({ ...comun, id: `${b.semana}-${id}-cod`, personas: [dueno], tipo: "Código", paso: "programa",
        cuando: t.programa, secciones: pasos.programa.secciones,
        titulo: `Programar ${codigo} · ${info.titulo}`,
        detalle: `${info.descripcion} Programar siguiendo el diseño aprobado, con todos sus criterios y controles STRIDE (ver Historias o la Especificación).${espera} Al terminar, abre el pull request para que ${primer(pareja(dueno))} lo revise y lo pruebe.` });
      tareas.push({ ...comun, id: `${b.semana}-${id}-qa`, personas: [pareja(dueno)], tipo: "QA", paso: "prueba",
        cuando: t.prueba, secciones: pasos.prueba.secciones,
        titulo: `Probar y documentar ${codigo} · la programa ${primer(dueno)}`,
        detalle: `Revisar el pull request, escribir las pruebas unitarias (al menos una por criterio, incluido el de error), ejecutar los casos de caja negra y guardar capturas con el código ${codigo}-E01, ${codigo}-E02… Luego llenar la fila de ${codigo} en la matriz de trazabilidad (5.6).` });
    }
    tareas.push({ id: `${b.semana}-metricas`, semana: b.semana, personas: ["p2"], tipo: "Informe", secciones: ["3.1", "4.S"],
      titulo: "Actualizar la hoja de métricas cada día", detalle: "Puntos completados y restantes de cada día, para el Burn Up y el Burn Down de cada sprint." });
    tareas.push({ id: `${b.semana}-aceptacion`, semana: b.semana, personas: ["p6"], tipo: "Scrum", cuando: "Viernes", hu: b.historias, secciones: ["4.S", "5.2"],
      titulo: "Aceptar las historias de la semana (Product Owner)",
      detalle: "En la review, Ariel comprueba cada historia contra sus criterios y la acepta o la devuelve con observaciones. Los ajustes a criterios se anotan para la sección 5.2." });
    tareas.push({ id: `${b.semana}-review`, semana: b.semana, personas: ["p4"], tipo: "Scrum", cuando: "Viernes", secciones: ["4.S", "2.4"],
      titulo: "Planning, dailies, review, retro y actas (Scrum Master)",
      detalle: "Kevin facilita el planning del lunes (tabla de tareas Doc, Cod y QA de cada historia), recoge las dailies, conduce la review y la retro, y redacta el acta de cada sprint. Merge a main el domingo." });
  }

  // Tareas individuales de cada persona.
  for (const p of personas) {
    tareas.push({ id: `s9-pares-r1-${p.id}`, semana: "s9", personas: [p.id], tipo: "Entrega", secciones: ["2.4.5", "13.2"],
      titulo: "Evaluación por pares del Release 1", detalle: "Informe de Actividad y Calificación por Pares del R1, en el formato oficial. Se adjunta en los anexos." });
    tareas.push({ id: `s11-pares-r2-${p.id}`, semana: "s11", personas: [p.id], tipo: "Entrega", secciones: ["2.4.5", "13.2"],
      titulo: "Evaluación por pares del Release 2", detalle: "Informe de Actividad y Calificación por Pares del R2, en el formato oficial." });
    const suya = Object.keys(documentadas).find((c) => asignacion[c] === p.id);
    const semanaCodigo = bloques.find((b) => b.historias.includes(suya)).semana;
    const semanaDoc = semanaCodigo === "s9" ? "s10" : "s12";   // la semana siguiente a programarla
    tareas.push({ id: `${semanaDoc}-doc-hu-${p.id}`, semana: semanaDoc, personas: [p.id], tipo: "Informe", hu: [suya], secciones: ["7.7", "8.1", "8.1.1", "8.1.2"],
      titulo: `Documentar a fondo ${suya} (capítulo 8) · ${documentadas[suya].patrones.join(", ")}`,
      detalle: `${documentadas[suya].porque} Con el diagrama de secuencia que hiciste al diseñar y tu código: escenario, fragmentos de código por mensaje, tabla mensaje → método, explicación y referencias al repositorio (prompt "Correspondencia diagrama-código"). El patrón también va en la sección 7.7.` });
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
      "Contexto fijo para todos: la especificación del proyecto (proyecto.md, que en el repositorio se llama AGENTS.md). Dásela siempre a tu IA: así el código sale igual aunque lo pidan 6 personas distintas.",
      "Primero diseño, después código: con la historia, sus criterios y su STRIDE se pide el diseño, se revisa, y recién entonces se pide el código siguiendo ese diseño.",
      "El informe se redacta con IA solo a partir de datos reales (actas, hoja de métricas, capturas, código). Nunca pedirle que invente métricas, dailies ni evidencias: la plantilla exige datos reales.",
      "Los diagramas que proponga la IA (por ejemplo en PlantUML) se pasan a la herramienta CASE del curso: el enunciado pide los archivos editables.",
      "Guardar los prompts importantes en una nota: se necesitan para la Declaración de uso de IA.",
    ],
    prompts: [
      { nombre: "Diseñar una historia", paso: "Diseñar", texto:
"Lee la especificación del proyecto (AGENTS.md / proyecto.md). Vamos a diseñar la historia HU-XX antes de programarla.\nHistoria, criterios Gherkin y STRIDE:\n<pegar desde la Especificación o el Excel>\n\nPropón, sin escribir código todavía:\n1. El caso de uso (actor, flujo principal y flujos alternos).\n2. Un diagrama de secuencia en PlantUML del flujo principal y otro del caso de error, respetando las capas Controller → Service → Repository y usando DTO en la API.\n3. Los endpoints REST con método, ruta, DTO de entrada y de salida, y códigos de respuesta.\n4. Las clases nuevas o modificadas en Spring Boot y los componentes de React.\nSi algún criterio es ambiguo, pregúntame antes de asumir." },
      { nombre: "Programar", paso: "Programar", texto:
"Lee la especificación del proyecto (AGENTS.md / proyecto.md). Implementa la historia HU-XX siguiendo exactamente este diseño aprobado:\n<pegar el diseño revisado>\n\nIncluye las validaciones de cada criterio y los controles STRIDE de la historia. Haz cambios pequeños y explica qué cambia en cada archivo. No toques código de otras historias sin avisar." },
      { nombre: "Pruebas", paso: "Probar y documentar", texto:
"Lee la especificación del proyecto (AGENTS.md / proyecto.md). Para la historia HU-XX con estos criterios:\n<pegar criterios Gherkin>\ny este código:\n<pegar o indicar archivos>\n\n1. Escribe pruebas unitarias con JUnit (y de los componentes de React si aplica, por ejemplo con Jest y React Testing Library): al menos una por criterio, incluido el caso de error.\n2. Arma una tabla de casos de caja negra: datos de entrada, resultado esperado y cómo verificarlo." },
      { nombre: "Redactar una sección del informe", paso: "Informe", texto:
"Redacta la sección X.Y del informe de nuestro proyecto (Marketplace de alquiler de espacios) siguiendo esta instrucción de la plantilla:\n<pegar la instrucción de la plantilla>\n\nUsa SOLO estos datos reales:\n<pegar acta, métricas, capturas descritas, código, etc.>\n\nSi falta información, no la inventes: escribe [FALTA: ...] en ese lugar. Tono formal, en español, sin relleno." },
      { nombre: "Correspondencia diagrama-código", paso: "Capítulo 8", texto:
"Con este diagrama de secuencia:\n<pegar PlantUML>\ny este código real:\n<pegar las clases y métodos>\n\n1. Arma la tabla: número de mensaje del diagrama → clase y método que lo implementa.\n2. Explica en un párrafo cómo se ejecuta el flujo y cómo el orden del código coincide con el del diagrama.\nSi algún mensaje no tiene código que lo implemente, márcalo." },
    ],
  };

  window.PLAN = { entrega: "2026-11-16", personas, asignacion, hu, epicas: BACKLOG.epicas, semanas, bloques, pasos, tramos, orden, informe, ia, tareas, sprintsVideo, documentadas };
})();
