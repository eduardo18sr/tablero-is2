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
    { id: "p4", nombre: "Ariel Enriquez", pareja: "p1", huR1: "HU-04", huR2: "HU-07",
      capitulos: "6 (arquitectura y vistas)", rol: "Arma el esqueleto del backend." },
    { id: "p5", nombre: "Kevin Chan", pareja: "p2", huR1: "HU-05", huR2: "HU-08",
      capitulos: "7 y 9 (diseño, clases, patrones, endpoints y base de datos)", rol: "Diseña el modelo y el script de la base de datos." },
    { id: "p6", nombre: "Sebastian Garate", pareja: "p3", huR1: "HU-06", huR2: "HU-11",
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

  const tareas = [
    // ── Fin de semana 7: preparación
    { id: "s7-backlog", semana: "s7", personas: ["p3"], tipo: "Scrum", titulo: "Pasar HU-01 a HU-12 al tablero Scrum",
      detalle: "En Jira, Trello o GitHub Projects, cada historia con sus criterios Gherkin y su análisis STRIDE del backlog v3. Ahí se toman las capturas de grooming y planning." },
    { id: "s7-metricas", semana: "s7", personas: ["p2"], tipo: "Informe", titulo: "Crear la hoja de métricas",
      detalle: "Una fila por día con los puntos planificados, completados y restantes, y una pestaña por bloque. De ahí salen el Burn Up y el Burn Down del capítulo 3, que deben ser datos reales." },
    { id: "s7-arquitectura", semana: "s7", personas: ["p4", "p5"], tipo: "Doc", titulo: "Acordar la arquitectura base y el modelo de datos",
      detalle: "Núcleo del backend (entidades, reglas y acceso a datos) separado de la API REST que usa el frontend. Las entidades no salen del backend: la API expone DTO. Modelo de datos en borrador para R1 y R2." },

    // ── Semana 8
    { id: "s8-backend-base", semana: "s8", personas: ["p4"], tipo: "Código", titulo: "Esqueleto del backend en capas",
      detalle: "Núcleo (entidades, servicios y repositorios o DAO) y API REST (controladores y DTO), configuración por variables de entorno y conexión a la base de datos." },
    { id: "s8-bd", semana: "s8", personas: ["p5"], tipo: "Código", titulo: "Modelo y script de la base de datos",
      detalle: "Tablas de R1 y R2 (usuarios, roles, espacios, horarios, reservas, documentos, pagos y auditoría), migraciones o script y datos semilla para probar y grabar las demos." },
    { id: "s8-frontend-base", semana: "s8", personas: ["p6"], tipo: "Código", titulo: "Frontend base y pruebas automáticas",
      detalle: "Rutas, layout y cliente HTTP hacia la API. Dejar configuradas las pruebas unitarias del backend y del frontend para que cada historia agregue las suyas." },
    { id: "s8-cap12", semana: "s8", personas: ["p1"], tipo: "Informe", titulo: "Borrador de los capítulos 1 y 2",
      detalle: "Visión general del proyecto, Scrum, valores, roles y forma de trabajo del equipo." },
    { id: "s8-cap6-base", semana: "s8", personas: ["p4"], tipo: "Informe", titulo: "Borrador de las secciones 6.1 a 6.4",
      detalle: "Stakeholders, metas de la arquitectura, escenarios de atributos de calidad y restricciones." },

    // ── Semana 9
    { id: "s9-contratos", semana: "s9", personas: ["p4", "p5", "p6"], tipo: "Doc", hu: ["HU-04", "HU-05", "HU-06"], titulo: "Lunes: cerrar los DTO, los endpoints y los datos semilla",
      detalle: "HU-04, HU-05 y HU-06 dependen entre sí. Acordar primero los contratos y cargar espacios y horarios de prueba para que la búsqueda y la reserva avancen sin esperar a la publicación." },
    { id: "s9-cap5", semana: "s9", personas: ["p3"], tipo: "Informe", titulo: "Capítulo 5: backlog, historias y criterios",
      detalle: "Backlog priorizado, refinamiento, historias con criterios verificables y primera versión de la matriz de trazabilidad." },
    { id: "s9-video1", semana: "s9", personas: ["equipo"], tipo: "Video", titulo: "Grabar el video 1 (sprint elegido del Release 1)",
      detalle: "En la review del viernes: objetivo y backlog del sprint, demo de cada historia con sus criterios (incluido un caso de error), pruebas automáticas corriendo, Burn Down y una conclusión de la retro. Usar los datos semilla." },
    { id: "s9-cierre-r1", semana: "s9", personas: ["p1"], tipo: "Scrum", titulo: "Cierre del Release 1 y etiqueta v1.0",
      detalle: "Acta de cierre del release, merge a main y etiqueta v1.0 en el repositorio." },

    // ── Semana 10
    { id: "s10-spike-pago", semana: "s10", personas: ["p3"], tipo: "Código", hu: ["HU-12"], titulo: "Spike de la pasarela de pago en modo de prueba",
      detalle: "Crear la cuenta sandbox, guardar las llaves de prueba como variables de entorno (nunca en el repositorio) y lograr un cobro de prueba con una tarjeta de prueba. Así HU-12 no se atasca en la semana 11." },
    { id: "s10-cap6", semana: "s10", personas: ["p4"], tipo: "Informe", titulo: "Capítulo 6: vistas de la arquitectura",
      detalle: "Componentes, estilo arquitectónico y vistas funcional, lógica, de implementación y de despliegue, con sus diagramas en una herramienta CASE." },
    { id: "s10-cap79", semana: "s10", personas: ["p5"], tipo: "Informe", titulo: "Capítulos 7 y 9: diseño, endpoints y base de datos",
      detalle: "Diagrama de clases, descripción de clases, principios y patrones aplicados con su justificación; endpoints implementados, modelo y script de la base de datos." },

    // ── Semana 11
    { id: "s11-flujo-pago", semana: "s11", personas: ["p3", "p6"], tipo: "Código", hu: ["HU-12", "HU-06"], titulo: "Ajustar la reserva al flujo con pago",
      detalle: "Con HU-12, las reservas nuevas de HU-06 quedan \"pendiente de pago\" y se liberan si vence el plazo. Coordinar el cambio para no romper la búsqueda (HU-05) ni Mis reservas (HU-08)." },
    { id: "s11-cap10", semana: "s11", personas: ["p6"], tipo: "Informe", titulo: "Capítulo 10: estrategia de pruebas",
      detalle: "Qué se prueba con pruebas unitarias, de caja blanca y de caja negra, con qué herramientas, y la plantilla del registro de defectos." },
    { id: "s11-video2", semana: "s11", personas: ["equipo"], tipo: "Video", titulo: "Grabar el video 2 (sprint elegido del Release 2)",
      detalle: "Mismo guion que el video 1. Si sale el pago, mostrarlo con una tarjeta de prueba de la pasarela." },
    { id: "s11-cierre-r2", semana: "s11", personas: ["p1"], tipo: "Scrum", titulo: "Cierre del Release 2 y etiqueta v2.0",
      detalle: "Acta de cierre del release, merge a main y etiqueta v2.0." },

    // ── Semana 12
    { id: "s12-pruebas", semana: "s12", personas: ["p6"], tipo: "QA", titulo: "Pruebas finales y registro de defectos",
      detalle: "Ejecutar las pruebas de caja blanca, caja negra y unitarias; medir la cobertura; registrar cada defecto con su acción correctiva." },
    { id: "s12-defectos", semana: "s12", personas: ["equipo"], tipo: "Código", titulo: "Corregir los defectos de tus historias",
      detalle: "Cada dueño corrige lo que salga de sus historias, con pull request revisado por su pareja." },
    { id: "s12-freeze", semana: "s12", personas: ["equipo"], tipo: "Entrega", titulo: "Jueves: código congelado; viernes: informe completo",
      detalle: "Después del jueves solo se corrigen errores bloqueantes. El fin de semana queda para revisar el informe completo." },
    { id: "s12-cap3", semana: "s12", personas: ["p2"], tipo: "Informe", titulo: "Capítulo 3: métricas y Burn Up y Burn Down",
      detalle: "Métricas planificadas frente a reales de cada bloque, variaciones, proyección e interpretación de las gráficas con los datos de la hoja." },
    { id: "s12-uml", semana: "s12", personas: ["p4"], tipo: "Doc", titulo: "Diagramas UML en formato editable",
      detalle: "Casos de uso, clases, secuencia, componentes y despliegue, en los archivos fuente de la herramienta CASE (no basta con imágenes), en las carpetas que pide el enunciado." },
    { id: "s12-bd-final", semana: "s12", personas: ["p5"], tipo: "Entrega", titulo: "Modelo y script final de la base de datos",
      detalle: "El script de creación y los datos necesarios para reproducir la base, en la carpeta BaseDeDatos." },
    { id: "s12-cap11", semana: "s12", personas: ["p3"], tipo: "Informe", titulo: "Capítulo 11 y matriz de trazabilidad final",
      detalle: "Impacto ético, social, económico, ambiental y global, y la trazabilidad de cada historia hasta su evidencia." },
    { id: "s12-readme", semana: "s12", personas: ["p6"], tipo: "Entrega", titulo: "README, capítulo 12 y ZIP de entrega",
      detalle: "README con instalación, configuración, ejecución, pruebas y credenciales de prueba. URL del repositorio y contribución de cada persona. ZIP con la estructura del enunciado." },
    { id: "s12-cap13", semana: "s12", personas: ["p1"], tipo: "Informe", titulo: "Capítulo 13 y revisión general del informe",
      detalle: "Referencias, anexos identificados y una lectura completa para unificar el formato y revisar que no falte ninguna sección." },

    // ── Semana 13
    { id: "s13-revision", semana: "s13", personas: ["p1"], tipo: "Entrega", titulo: "Revisión final contra el enunciado",
      detalle: "Informe en PDF, código en ZIP, diagramas editables, anexos, base de datos, evaluación por pares, declaración de IA y README." },
    { id: "s13-entrega", semana: "s13", personas: ["p1"], tipo: "Entrega", titulo: "Subir la entrega al inicio de la semana",
      detalle: "No dejarla para el último día." },
  ];

  // Tareas que se repiten cada semana de trabajo (8 a 11).
  const bloques = [
    { semana: "s8", historias: ["HU-01", "HU-02", "HU-03"] },
    { semana: "s9", historias: ["HU-04", "HU-05", "HU-06"] },
    { semana: "s10", historias: ["HU-07", "HU-08", "HU-11"] },
    { semana: "s11", historias: ["HU-09", "HU-10", "HU-12"] },
  ];
  const duenoDe = (codigo) => personas.find((p) => p.huR1 === codigo || p.huR2 === codigo);

  for (const b of bloques) {
    for (const codigo of b.historias) {
      const dueno = duenoDe(codigo);
      tareas.push({ id: `${b.semana}-${codigo.toLowerCase()}-cod`, semana: b.semana, personas: [dueno.id], tipo: "Código", hu: [codigo], paso: "programa",
        titulo: `Programar ${codigo} · ${hu[codigo].titulo}`,
        detalle: `${hu[codigo].detalle} Cuando termines, abre el pull request para que ${personas.find((p) => p.id === dueno.pareja).nombre.split(" ")[0]} lo revise y lo pruebe.` });
      tareas.push({ id: `${b.semana}-${codigo.toLowerCase()}-qa`, semana: b.semana, personas: [dueno.pareja], tipo: "QA", hu: [codigo], paso: "prueba",
        titulo: `Probar y documentar ${codigo} · la programa ${dueno.nombre.split(" ")[0]}`,
        detalle: "Escribir las pruebas unitarias, revisar el pull request, recorrer los criterios Gherkin y guardar capturas como evidencia (incluido un caso de error)." });
    }
    tareas.push({ id: `${b.semana}-metricas`, semana: b.semana, personas: ["p2"], tipo: "Informe",
      titulo: "Actualizar la hoja de métricas cada día", detalle: "Puntos completados y restantes de cada día, para el Burn Down." });
    tareas.push({ id: `${b.semana}-review`, semana: b.semana, personas: ["p1"], tipo: "Scrum",
      titulo: "Viernes: review, retro y acta",
      detalle: "Demo de cada historia contra sus criterios, retrospectiva breve, acta de cierre y capturas de las dailies de la semana. Merge a main el domingo." });
  }

  // Tareas individuales de cada persona.
  for (const p of personas) {
    tareas.push({ id: `s12-doc-hu-${p.id}`, semana: "s12", personas: [p.id], tipo: "Doc",
      titulo: "Documentar a fondo tu historia asignada",
      detalle: "La historia que se te asigne al decidir cómo se presentan los sprints: diagrama de secuencia, el código que le corresponde, la explicación y las evidencias (capítulo 8)." });
    tareas.push({ id: `s12-pares-${p.id}`, semana: "s12", personas: [p.id], tipo: "Entrega",
      titulo: "Evaluación por pares", detalle: "En el formato oficial. Si falta la de un integrante, se aplica lo que dice la rúbrica." });
    tareas.push({ id: `s12-ia-${p.id}`, semana: "s12", personas: [p.id], tipo: "Entrega",
      titulo: "Declaración de uso de IA", detalle: "Cada integrante presenta la suya, según los lineamientos del curso." });
  }

  window.PLAN = { entrega: "2026-11-16", personas, hu, semanas, bloques, tareas };
})();
