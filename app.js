(function () {
  "use strict";

  const PLAN = window.PLAN;
  const API = "/api/estado";
  const CLAVES = {
    yo: "tablero-is2:yo", ver: "tablero-is2:ver", ocultar: "tablero-is2:ocultar",
    tab: "tablero-is2:tab", local: "tablero-is2:estados-local", codigo: "tablero-is2:codigo",
  };
  const SIGUIENTE = { pendiente: "en-curso", "en-curso": "hecho", hecho: "pendiente" };
  const ETIQUETA = { pendiente: "Pendiente", "en-curso": "En curso", hecho: "Hecho" };
  const persona = Object.fromEntries(PLAN.personas.map((p) => [p.id, p]));

  // ── Almacenamiento del navegador (solo comodidades de cada persona; puede fallar)
  function leer(clave, porDefecto) {
    try { const v = localStorage.getItem(clave); return v === null ? porDefecto : JSON.parse(v); }
    catch { return porDefecto; }
  }
  function guardar(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sin almacenamiento: no pasa nada */ }
  }

  const st = {
    yo: leer(CLAVES.yo, ""),
    ver: leer(CLAVES.ver, "mias"),
    ocultar: leer(CLAVES.ocultar, false),
    tab: leer(CLAVES.tab, "tareas"),
    estados: {},
    modo: "cargando",       // cargando | compartido | local
    aviso: null,            // null | "elige" | "codigo" | "error"
    pendienteDeCodigo: null,
    enVuelo: 0,
    abiertos: new Set(),
  };
  if (!persona[st.yo]) st.yo = "";

  // ── Utilidades
  function h(tag, props, ...hijos) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("data-") || k.startsWith("aria-") || k === "role" || k === "id" || k === "for" || k === "type" || k === "href") el.setAttribute(k, v);
      else el[k] = v;
    }
    for (const hijo of hijos.flat()) {
      if (hijo === null || hijo === undefined || hijo === false) continue;
      el.append(hijo instanceof Node ? hijo : document.createTextNode(String(hijo)));
    }
    return el;
  }
  const $ = (sel) => document.querySelector(sel);

  function hoyISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function semanaActual() {
    const hoy = hoyISO();
    if (hoy < PLAN.semanas[0].desde) return PLAN.semanas[0].id;
    const s = PLAN.semanas.find((x) => hoy >= x.desde && hoy <= x.hasta);
    return s ? s.id : null;
  }
  function diasParaEntrega() {
    const [a, m, d] = PLAN.entrega.split("-").map(Number);
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    return Math.round((new Date(a, m - 1, d) - hoy) / 86400000);
  }
  function iniciales(nombre) {
    return nombre.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();
  }
  function primerNombre(id) { return persona[id] ? persona[id].nombre.split(" ")[0] : ""; }
  function fechaCorta(ts) {
    try { return new Date(ts).toLocaleDateString("es-PE", { day: "numeric", month: "short" }); } catch { return ""; }
  }
  const estadoDe = (id) => (st.estados[id] && st.estados[id].estado) || "pendiente";
  const esMia = (t) => st.yo && (t.personas.includes(st.yo) || t.personas.includes("equipo"));

  function tareasVisibles() {
    return PLAN.tareas.filter((t) => st.ver === "todas" || !st.yo || esMia(t));
  }

  // ── Red
  async function cargar(silencioso) {
    try {
      const r = await fetch(API, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const datos = await r.json();
      if (st.enVuelo > 0) return;          // no pisar un cambio que aún se está guardando
      st.estados = datos.estados || {};
      st.modo = "compartido";
    } catch {
      if (silencioso && st.modo === "compartido") return;   // un fallo puntual: se intenta en la próxima vuelta
      st.modo = "local";
      st.estados = leer(CLAVES.local, {});
    }
    render();
  }

  async function cambiar(id) {
    if (!st.yo) { st.aviso = "elige"; renderAviso(); $("#yo").focus(); return; }
    const anterior = st.estados[id];
    const nuevo = SIGUIENTE[estadoDe(id)];
    if (nuevo === "pendiente") delete st.estados[id];
    else st.estados[id] = { estado: nuevo, por: st.yo, ts: Date.now() };
    if (st.aviso === "elige" || st.aviso === "error") st.aviso = null;
    render();

    if (st.modo !== "compartido") { guardar(CLAVES.local, st.estados); return; }

    st.enVuelo++;
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-codigo-equipo": leer(CLAVES.codigo, "") },
        body: JSON.stringify({ id, estado: nuevo, por: st.yo }),
      });
      if (r.status === 401) {
        revertir(id, anterior);
        st.aviso = "codigo"; st.pendienteDeCodigo = id;
      } else if (!r.ok) {
        throw new Error(String(r.status));
      } else {
        const datos = await r.json();
        if (nuevo !== "pendiente") st.estados[id] = datos.entrada;
      }
    } catch {
      revertir(id, anterior);
      st.aviso = "error";
    } finally {
      st.enVuelo--;
      render();
    }
  }
  function revertir(id, anterior) {
    if (anterior) st.estados[id] = anterior; else delete st.estados[id];
  }

  // ── Render
  function render() {
    renderCabecera();
    renderControles();
    renderAviso();
    renderPestanas();
    if (st.tab === "tareas") renderTareas(); else renderReparto();
  }

  function barra(texto, hechas, total) {
    const pct = total ? Math.round((hechas / total) * 100) : 0;
    const riel = h("div", { class: "riel" }, h("span", {}));
    riel.firstChild.style.width = pct + "%";
    return h("div", { class: "barra" },
      h("span", { text: texto }),
      h("span", { class: "cifra", text: `${hechas} de ${total} hechas` }),
      riel);
  }

  function renderCabecera() {
    const dias = diasParaEntrega();
    const entrega = $("#entrega");
    entrega.replaceChildren(
      "Entrega en la ",
      h("strong", { text: "semana 13 (16–20 nov)" }),
      dias > 0 ? ` · faltan ${dias} días para el lunes 16` : dias === 0 ? " · la semana de entrega empieza hoy" : "");
    const todas = PLAN.tareas;
    const hechasEquipo = todas.filter((t) => estadoDe(t.id) === "hecho").length;
    const filas = [];
    if (st.yo) {
      const mias = todas.filter(esMia);
      filas.push(barra(`Tus tareas (${primerNombre(st.yo)})`, mias.filter((t) => estadoDe(t.id) === "hecho").length, mias.length));
    }
    filas.push(barra("Todo el equipo", hechasEquipo, todas.length));
    $("#progreso").replaceChildren(...filas);
  }

  function renderControles() {
    const sel = $("#yo");
    if (sel.options.length === 1) {
      for (const p of PLAN.personas) sel.append(h("option", { value: p.id, text: p.nombre }));
    }
    sel.value = st.yo;
    for (const b of document.querySelectorAll("[data-ver]")) {
      b.setAttribute("aria-pressed", String(b.dataset.ver === st.ver));
    }
    $("#ocultar-hechas").checked = !!st.ocultar;
    $("#ir-semana").hidden = !semanaActual() || st.tab !== "tareas";
  }

  function renderAviso() {
    const caja = $("#aviso");
    let contenido = null;
    if (st.aviso === "elige") {
      contenido = [h("p", { text: "Elige tu nombre arriba para poder marcar tareas." })];
    } else if (st.aviso === "error") {
      contenido = [h("p", { text: "No se pudo guardar el cambio. Revisa tu conexión y vuelve a tocar la tarea." })];
    } else if (st.aviso === "codigo") {
      const form = h("form", { id: "form-codigo" },
        h("label", { for: "codigo", text: "Código del equipo" }),
        h("input", { id: "codigo", type: "password", autocomplete: "off" }),
        h("button", { class: "boton", type: "submit", text: "Guardar y reintentar" }));
      contenido = [h("p", { text: "Para cambiar tareas hace falta el código del equipo (está en el grupo)." }), form];
    } else if (st.modo === "local") {
      contenido = [h("p", {},
        h("strong", { text: "Modo local. " }),
        "Los cambios se guardan solo en este navegador y nadie más los ve. Para compartirlos, conecta la base Redis en Vercel (paso 3 del README).")];
    }
    caja.hidden = !contenido;
    if (contenido) caja.replaceChildren(...contenido);
  }

  function renderPestanas() {
    for (const b of document.querySelectorAll("[role=tab]")) {
      const activa = b.dataset.tab === st.tab;
      b.setAttribute("aria-selected", String(activa));
      b.tabIndex = activa ? 0 : -1;
    }
    $("#panel-tareas").hidden = st.tab !== "tareas";
    $("#panel-reparto").hidden = st.tab !== "reparto";
  }

  function chipPersona(id) {
    if (id === "equipo") return h("span", { class: "persona" }, h("span", { class: "ini", text: "6" }), "Todo el equipo");
    const p = persona[id];
    if (!p) return null;
    return h("span", { class: "persona" + (id === st.yo ? " yo" : "") },
      h("span", { class: "ini", text: iniciales(p.nombre), "aria-hidden": "true" }), p.nombre.split(" ")[0]);
  }

  function filaTarea(t) {
    const est = estadoDe(t.id);
    const info = st.estados[t.id];
    const detalles = h("details", { "data-id": t.id, open: st.abiertos.has(t.id) },
      h("summary", { text: t.titulo }),
      h("p", { text: t.detalle }));
    const meta = h("div", { class: "meta" },
      h("span", { class: "tag", text: t.tipo }),
      t.hu ? h("span", { class: "tag", text: t.hu }) : null,
      ...t.personas.map(chipPersona),
      info && info.por && est !== "pendiente"
        ? h("span", { class: "marca", text: `${ETIQUETA[est]} · ${primerNombre(info.por)}, ${fechaCorta(info.ts)}` })
        : null);
    return h("li", { class: "tarea" + (est === "hecho" ? " hecha" : "") },
      h("button", {
        type: "button", class: "estado", "data-id": t.id, "data-estado": est,
        "aria-label": `${t.titulo}: ${ETIQUETA[est]}. Toca para pasar a ${ETIQUETA[SIGUIENTE[est]]}.`,
      }, h("span", { class: "punto", "aria-hidden": "true" }), ETIQUETA[est]),
      h("div", { class: "cuerpo" }, detalles, meta));
  }

  function renderTareas() {
    const panel = $("#panel-tareas");
    const actual = semanaActual();
    const visibles = tareasVisibles();
    const bloques = PLAN.semanas.map((s) => {
      const delaSemana = visibles.filter((t) => t.semana === s.id);
      const hechas = delaSemana.filter((t) => estadoDe(t.id) === "hecho").length;
      const mostradas = st.ocultar ? delaSemana.filter((t) => estadoDe(t.id) !== "hecho") : delaSemana;
      const cab = h("div", { class: "semana-cab" },
        h("h2", { text: s.titulo }),
        h("span", { class: "fechas", text: s.fechas }),
        s.id === actual ? h("span", { class: "badge-ahora", text: "Esta semana" }) : null,
        h("span", { class: "etiqueta", text: s.etiqueta }),
        h("span", { class: "cuenta", text: `${hechas} de ${delaSemana.length} hechas` }));
      let cuerpo;
      if (!delaSemana.length) cuerpo = h("p", { class: "vacio", text: "No tienes tareas esta semana." });
      else if (!mostradas.length) cuerpo = h("p", { class: "vacio", text: "Todo hecho en esta semana." });
      else cuerpo = h("ul", { class: "lista" }, mostradas.map(filaTarea));
      return h("section", { class: "semana" + (s.id === actual ? " actual" : ""), id: `semana-${s.id}`, "aria-label": s.titulo },
        cab, h("p", { class: "objetivo", text: s.objetivo }), cuerpo);
    });
    const avisoFiltro = st.ver === "mias" && !st.yo
      ? h("p", { class: "vacio", text: "Elige tu nombre arriba para ver solo tus tareas. Mientras tanto se muestran las de todo el equipo." })
      : null;
    panel.replaceChildren(...[avisoFiltro, ...bloques].filter(Boolean));
  }

  function renderReparto() {
    const panel = $("#panel-reparto");
    const filas = PLAN.personas.map((p) => {
      const suyas = PLAN.tareas.filter((t) => t.personas.includes(p.id) || t.personas.includes("equipo"));
      const hechas = suyas.filter((t) => estadoDe(t.id) === "hecho").length;
      return h("tr", {},
        h("td", {}, h("strong", { text: p.nombre })),
        h("td", {}, h("span", { class: "tag", text: p.huR1 }), h("span", { class: "sub", text: PLAN.hu[p.huR1].titulo })),
        h("td", {}, h("span", { class: "tag", text: p.huR2 }), h("span", { class: "sub", text: PLAN.hu[p.huR2].titulo })),
        h("td", { text: persona[p.pareja].nombre }),
        h("td", { text: p.capitulos }),
        h("td", { text: p.rol }),
        h("td", { text: `${hechas} de ${suyas.length}` }));
    });
    const tabla = h("div", { class: "tabla" }, h("table", {},
      h("thead", {}, h("tr", {}, ["Persona", "Programa en R1", "Programa en R2", "Pareja (Doc y QA)", "Capítulos del informe", "Rol", "Avance"].map((x) => h("th", { text: x })))),
      h("tbody", {}, filas)));

    const lista = (tipo, items) => h(tipo, {}, items.map((x) => h("li", { text: x })));

    panel.replaceChildren(
      h("div", { class: "bloque" },
        h("h2", { text: "Quién hace qué" }),
        h("p", { text: "Cada persona programa una historia del Release 1 y otra del Release 2. Las parejas son fijas: la semana en que no programas, haces las pruebas y la documentación de la historia de tu pareja." }),
        tabla),
      h("div", { class: "bloque" },
        h("h2", { text: "Rutina de cada semana de trabajo" }),
        lista("ol", [
          "Lunes, planning: dividir cada historia en tareas Doc, Cod y QA, estimar en puntos y tomar una captura del tablero Scrum.",
          "Antes de programar: el dueño de cada historia acuerda con su pareja los DTO, los endpoints y los criterios Gherkin que va a demostrar.",
          "De lunes a viernes, daily en el grupo: qué hice, qué haré y qué me bloquea. Las capturas sirven de evidencia.",
          "Cada día: Adriana actualiza la hoja de métricas (puntos completados y restantes).",
          "Viernes, review y retro: demo de cada historia contra sus criterios, retrospectiva breve y acta.",
          "Domingo: merge a main y etiqueta de versión.",
        ])),
      h("div", { class: "bloque" },
        h("h2", { text: "Reglas del equipo" }),
        lista("ul", [
          "Una rama por historia y pull request revisado por la pareja antes de entrar a develop.",
          "Cada uno hace commits con su propia cuenta: el repositorio es la evidencia de las contribuciones.",
          "El núcleo del backend va separado de la API REST, y la API expone DTO, nunca las entidades.",
          "Cada historia lleva sus pruebas unitarias y evidencia de sus criterios, incluido un caso de error.",
          "Sin contraseñas ni llaves en el repositorio: se usan .env.example y credenciales de prueba en el README.",
          "Pagos solo con la pasarela en modo de prueba, sin guardar datos de tarjeta y con el monto validado en el servidor.",
          "Las métricas y las actas se registran en el momento: la plantilla pide datos reales.",
        ])),
      h("div", { class: "bloque" },
        h("h2", { text: "Por definir" }),
        lista("ul", [
          "Cómo se presentan los sprints en el informe, con 2 historias por sprint.",
          "Qué sprint del Release 1 y cuál del Release 2 se documentan y se graban en video.",
          "Qué historia documenta a fondo cada persona.",
          "Duración y formato de los videos, y si deben aparecer los 6 integrantes (preguntarle al profesor).",
        ])));
  }

  // ── Eventos
  $("#yo").addEventListener("change", (e) => {
    st.yo = e.target.value; guardar(CLAVES.yo, st.yo);
    if (st.aviso === "elige") st.aviso = null;
    render();
  });
  for (const b of document.querySelectorAll("[data-ver]")) {
    b.addEventListener("click", () => { st.ver = b.dataset.ver; guardar(CLAVES.ver, st.ver); render(); });
  }
  $("#ocultar-hechas").addEventListener("change", (e) => { st.ocultar = e.target.checked; guardar(CLAVES.ocultar, st.ocultar); render(); });
  for (const b of document.querySelectorAll("[role=tab]")) {
    b.addEventListener("click", () => { st.tab = b.dataset.tab; guardar(CLAVES.tab, st.tab); render(); });
  }
  $("#ir-semana").addEventListener("click", (e) => {
    e.preventDefault();
    const id = semanaActual();
    const el = id && document.getElementById(`semana-${id}`);
    if (el) el.scrollIntoView();
  });
  const panelTareas = $("#panel-tareas");
  panelTareas.addEventListener("click", (e) => {
    const boton = e.target.closest("button.estado");
    if (boton) cambiar(boton.dataset.id);
  });
  panelTareas.addEventListener("toggle", (e) => {
    const d = e.target;
    if (d.tagName !== "DETAILS") return;
    if (d.open) st.abiertos.add(d.dataset.id); else st.abiertos.delete(d.dataset.id);
  }, true);
  $("#aviso").addEventListener("submit", (e) => {
    e.preventDefault();
    const valor = $("#codigo").value.trim();
    if (!valor) return;
    guardar(CLAVES.codigo, valor);
    const id = st.pendienteDeCodigo;
    st.aviso = null; st.pendienteDeCodigo = null;
    if (id) cambiar(id); else render();
  });

  // Refresco periódico para ver los cambios de los demás.
  setInterval(() => { if (st.modo === "compartido" && !document.hidden) cargar(true); }, 20000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && st.modo === "compartido") cargar(true); });

  render();
  cargar(false);
})();
