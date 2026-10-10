(function () {
  "use strict";

  const PLAN = window.PLAN;
  const API = "/api/estado";
  const CLAVES = {
    yo: "tablero-is2:yo", ver: "tablero-is2:ver", ocultar: "tablero-is2:ocultar",
    tab: "tablero-is2:tab", local: "tablero-is2:estados-local", codigo: "tablero-is2:codigo",
  };
  const TABS = ["tareas", "historias", "informe", "especificacion", "equipo"];
  const SIGUIENTE = { pendiente: "en-curso", "en-curso": "hecho", hecho: "pendiente" };
  const ETIQUETA = { pendiente: "Pendiente", "en-curso": "En curso", hecho: "Hecho" };
  const MOMENTO = {
    inicio: "Desde ya, sin código",
    durante: "Mientras trabajan",
    codigo: "Cuando hay código",
    final: "Al final",
  };
  const persona = Object.fromEntries(PLAN.personas.map((p) => [p.id, p]));
  const seccion = {};
  for (const c of PLAN.informe) for (const s of c.secciones) seccion[s.id] = { ...s, cap: c };

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
  if (!TABS.includes(st.tab)) st.tab = "tareas";

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
  const idSeccion = (id) => `sec-${id.replace(/\./g, "-")}`;

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
  function iniciales(nombre) { return nombre.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase(); }
  function primerNombre(id) { return persona[id] ? persona[id].nombre.split(" ")[0] : ""; }
  function fechaCorta(ts) {
    try { return new Date(ts).toLocaleDateString("es-PE", { day: "numeric", month: "short" }); } catch { return ""; }
  }
  const estadoDe = (id) => (st.estados[id] && st.estados[id].estado) || "pendiente";
  const hecha = (t) => estadoDe(t.id) === "hecho";
  const esMia = (t) => st.yo && (t.personas.includes(st.yo) || t.personas.includes("equipo"));
  const semanaDe = Object.fromEntries(PLAN.semanas.map((s) => [s.id, s]));

  // ── Red
  async function cargar(silencioso) {
    try {
      const r = await fetch(API, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const datos = await r.json();
      if (st.enVuelo > 0) return;          // no pisar un cambio que aún se está guardando
      const nuevos = datos.estados || {};
      if (silencioso && st.modo === "compartido" && JSON.stringify(nuevos) === JSON.stringify(st.estados)) return;
      st.estados = nuevos;
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

  // ── Piezas reutilizables
  function barra(texto, hechas, total) {
    const pct = total ? Math.round((hechas / total) * 100) : 0;
    const riel = h("div", { class: "riel" }, h("span", {}));
    riel.firstChild.style.width = pct + "%";
    return h("div", { class: "barra" },
      h("span", { text: texto }),
      h("span", { class: "cifra", text: `${hechas} de ${total} hechas` }),
      riel);
  }
  function chipPersona(id) {
    if (id === "equipo") return h("span", { class: "persona" }, h("span", { class: "ini", text: "6", "aria-hidden": "true" }), "Todo el equipo");
    const p = persona[id];
    if (!p) return null;
    return h("span", { class: "persona" + (id === st.yo ? " yo" : "") },
      h("span", { class: "ini", text: iniciales(p.nombre), "aria-hidden": "true" }), p.nombre.split(" ")[0]);
  }
  function pill(est) {
    return h("span", { class: "pill", "data-estado": est }, h("span", { class: "punto", "aria-hidden": "true" }), ETIQUETA[est]);
  }
  function botonHU(codigo) {
    return h("button", { type: "button", class: "tag tag-hu", "data-hu": codigo, title: `Ver ${codigo} en Historias`, text: codigo });
  }
  function botonSeccion(id) {
    return h("button", { type: "button", class: "tag tag-sec", "data-sec": id, title: `Ver la sección ${id} en Informe: ${seccion[id].titulo}`, text: `§ ${id}` });
  }
  function listaTareas(tareas) {
    return h("ul", { class: "mini" }, tareas.map((t) => h("li", {},
      pill(estadoDe(t.id)), " ",
      h("span", { text: `${semanaDe[t.semana].titulo}: ${t.titulo}` }), " ",
      ...(t.hu || []).map(botonHU),
      ...t.personas.map(chipPersona))));
  }

  // ── Render general
  function render() {
    renderCabecera();
    renderControles();
    renderAviso();
    renderPestanas();
    if (st.tab === "tareas") renderTareas();
    else if (st.tab === "historias") renderHistorias();
    else if (st.tab === "informe") renderInforme();
    else if (st.tab === "especificacion") renderEspecificacion();
    else renderEquipo();
  }

  function renderCabecera() {
    const dias = diasParaEntrega();
    $("#entrega").replaceChildren(
      "Entrega en la ",
      h("strong", { text: "semana 13 (16–20 nov)" }),
      dias > 0 ? ` · faltan ${dias} días para el lunes 16` : dias === 0 ? " · la semana de entrega empieza hoy" : "");
    const todas = PLAN.tareas;
    const filas = [];
    if (st.yo) {
      const mias = todas.filter(esMia);
      filas.push(barra(`Tus tareas (${primerNombre(st.yo)})`, mias.filter(hecha).length, mias.length));
    }
    filas.push(barra("Todo el equipo", todas.filter(hecha).length, todas.length));
    $("#progreso").replaceChildren(...filas);
  }

  function renderControles() {
    const sel = $("#yo");
    if (sel.options.length === 1) {
      for (const p of PLAN.personas) sel.append(h("option", { value: p.id, text: p.nombre }));
    }
    sel.value = st.yo;
    for (const b of document.querySelectorAll("[data-ver]")) b.setAttribute("aria-pressed", String(b.dataset.ver === st.ver));
    $("#ocultar-hechas").checked = !!st.ocultar;
    $("#filtros-tareas").hidden = st.tab !== "tareas";
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
    for (const t of TABS) $(`#panel-${t}`).hidden = st.tab !== t;
  }

  // ── Pestaña Tareas
  function filaTarea(t) {
    const est = estadoDe(t.id);
    const info = st.estados[t.id];
    const pareja = t.paso && t.paso !== "prueba" && persona[t.personas[0]] ? persona[t.personas[0]].pareja : null;
    const detalles = h("details", { "data-key": t.id, open: st.abiertos.has(t.id) },
      h("summary", { text: t.titulo }),
      h("p", { text: t.detalle }));
    const meta = h("div", { class: "meta" },
      h("span", { class: "tag", text: t.tipo }),
      t.cuando ? h("span", { class: "tag tag-cuando", text: t.cuando }) : null,
      ...(t.hu || []).map(botonHU),
      ...t.personas.map(chipPersona),
      pareja ? h("span", { class: "marca", text: `Revisa ${primerNombre(pareja)}` }) : null,
      ...(t.secciones || []).map(botonSeccion),
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
    const actual = semanaActual();
    const visibles = PLAN.tareas.filter((t) => st.ver === "todas" || !st.yo || esMia(t));
    const bloques = PLAN.semanas.map((s) => {
      const delaSemana = visibles.filter((t) => t.semana === s.id);
      const mostradas = st.ocultar ? delaSemana.filter((t) => !hecha(t)) : delaSemana;
      const cab = h("div", { class: "semana-cab" },
        h("h2", { text: s.titulo }),
        h("span", { class: "fechas", text: s.fechas }),
        s.id === actual ? h("span", { class: "badge-ahora", text: "Esta semana" }) : null,
        h("span", { class: "etiqueta", text: s.etiqueta }),
        h("span", { class: "cuenta", text: `${delaSemana.filter(hecha).length} de ${delaSemana.length} hechas` }));
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
    $("#panel-tareas").replaceChildren(...[avisoFiltro, ...bloques].filter(Boolean));
  }

  // ── Pestaña Historias
  function pasosDe(codigo) {
    const de = (paso) => PLAN.tareas.find((t) => t.paso === paso && t.hu.includes(codigo));
    const dis = de("diseno"), cod = de("programa"), qa = de("prueba");
    const e = { dis: estadoDe(dis.id), cod: estadoDe(cod.id), qa: estadoDe(qa.id) };
    let resumen = { clave: "sin-empezar", texto: "Sin empezar" };
    if (e.dis === "hecho" && e.cod === "hecho" && e.qa === "hecho") resumen = { clave: "lista", texto: "Lista" };
    else if (e.cod === "hecho") resumen = { clave: "pruebas", texto: "En pruebas" };
    else if (e.cod === "en-curso" || e.dis !== "pendiente") resumen = { clave: "desarrollo", texto: e.cod === "en-curso" ? "Programándose" : "En diseño" };
    return { dis, cod, qa, e, resumen };
  }

  function renderHistorias() {
    const orden = PLAN.bloques.flatMap((b) => b.historias.map((c) => ({ codigo: c, semana: b.semana })));
    const listas = orden.filter((x) => pasosDe(x.codigo).resumen.clave === "lista").length;
    const parejas = PLAN.personas.filter((x) => x.id < x.pareja)
      .map((x) => `${x.nombre.split(" ")[0]} y ${persona[x.pareja].nombre.split(" ")[0]}`).join(" · ");

    const flujo = h("ol", { class: "flujo" }, ["diseno", "programa", "prueba"].map((clave) => {
      const p = PLAN.pasos[clave];
      const quien = clave === "prueba" ? "La pareja" : "El dueño";
      const produce = {
        diseno: "Caso de uso, diagrama de secuencia (flujo principal y de error), endpoints y DTO. La pareja lo revisa antes de programar.",
        programa: "El código siguiendo el diseño, y el pull request.",
        prueba: "Revisión del pull request, pruebas unitarias, casos de caja negra, capturas con código de evidencia y la fila en la matriz de trazabilidad.",
      }[clave];
      return h("li", { class: "paso-flujo" },
        h("div", { class: "paso-cab" }, h("strong", { text: p.nombre }), h("span", { class: "sub-texto", text: quien })),
        h("p", { class: "sub-texto", text: `1.er sprint de la semana: ${p.cuando[0]} · 2.º sprint: ${p.cuando[1]}` }),
        h("p", { text: produce }),
        h("div", { class: "meta" }, h("span", { class: "sub-texto", text: "Alimenta:" }), ...p.secciones.map(botonSeccion)));
    }));

    const filas = orden.map(({ codigo, semana: sid }) => {
      const info = PLAN.hu[codigo];
      const p = pasosDe(codigo);
      const relacionadas = PLAN.tareas.filter((t) => !t.paso && (t.hu || []).includes(codigo));
      const detalles = h("details", { "data-key": "hu:" + codigo, open: st.abiertos.has("hu:" + codigo) },
        h("summary", { text: "Criterios, STRIDE y tareas relacionadas" }),
        h("p", { text: info.descripcion }),
        h("p", { class: "sub-texto", text: "Criterios de aceptación" }),
        h("ul", { class: "criterios" }, info.criterios.map((c) => h("li", { text: c }))),
        h("p", { class: "sub-texto", text: "Seguridad (STRIDE)" }),
        h("ul", { class: "criterios" }, info.stride.map((c) => h("li", { text: c }))),
        relacionadas.length ? h("p", { class: "sub-texto", text: "Tareas relacionadas" }) : null,
        relacionadas.length ? listaTareas(relacionadas) : null,
        h("button", { type: "button", class: "ir-esp", "data-esp": codigo, text: "Ver en la especificación" }));
      return h("tr", { id: `hu-${codigo}` },
        h("td", {}, h("strong", { class: "hu-cod", text: codigo }), h("span", { class: "hu-tit", text: info.titulo }), detalles),
        h("td", {}, h("span", { text: semanaDe[sid].titulo.replace("Semana", "Sem.") }), h("span", { class: "sub", text: `R${info.release} · Sprint ${info.sprint} · ${info.tamano}` })),
        h("td", {}, h("div", { class: "paso" }, chipPersona(p.cod.personas[0])),
          h("div", { class: "paso" }, h("span", { class: "sub-texto", text: "Diseño" }), pill(p.e.dis)),
          h("div", { class: "paso" }, h("span", { class: "sub-texto", text: "Código" }), pill(p.e.cod))),
        h("td", {}, h("div", { class: "paso" }, chipPersona(p.qa.personas[0])),
          h("div", { class: "paso" }, h("span", { class: "sub-texto", text: "Pruebas" }), pill(p.e.qa))),
        h("td", {}, info.depende.length ? h("div", { class: "meta" }, info.depende.map(botonHU)) : h("span", { class: "sub", text: "Ninguna" }),
          info.dependeTexto.includes("(") ? h("span", { class: "sub", text: info.dependeTexto.slice(info.dependeTexto.indexOf("(")) }) : null),
        h("td", {}, h("span", { class: "resumen", "data-resumen": p.resumen.clave, text: p.resumen.texto })));
    });

    $("#panel-historias").replaceChildren(
      h("div", { class: "bloque" },
        h("h2", { text: "Cómo avanza cada historia" }),
        h("p", {}, "Cada semana de trabajo cubre dos sprints del backlog; las historias del primer sprint van primero. Cada historia pasa por tres pasos, y cada paso alimenta secciones del informe. Las parejas son fijas y cada una prueba las historias de la otra: ", h("strong", { text: parejas }), "."),
        flujo),
      h("div", { class: "bloque" },
        h("div", { class: "semana-cab" }, h("h2", { text: "Trazabilidad de las historias" }), h("span", { class: "cuenta", text: `${listas} de ${orden.length} listas` })),
        h("p", { class: "sub-texto", text: "\"Depende de\" indica qué historias tienen que existir antes, según el backlog. Toca un código para ir a esa historia, o una sección (§) para verla en el informe." }),
        h("div", { class: "tabla" }, h("table", { class: "trazabilidad" },
          h("thead", {}, h("tr", {}, ["Historia", "Cuándo", "Diseña y programa", "Prueba y documenta", "Depende de", "Estado"].map((x) => h("th", { text: x })))),
          h("tbody", {}, filas)))));
  }

  // ── Pestaña Informe
  function renderInforme() {
    const alimenta = (id) => PLAN.tareas.filter((t) => (t.secciones || []).includes(id));
    const resumenMomentos = h("div", { class: "momentos" }, Object.entries(MOMENTO).map(([clave, texto]) => {
      const secs = Object.values(seccion).filter((s) => s.cuando === clave);
      return h("div", { class: "momento", "data-momento": clave },
        h("strong", { text: texto }),
        h("span", { class: "sub-texto", text: `${secs.length} secciones` }));
    }));

    const capitulos = PLAN.informe.map((c) => {
      const tareasCap = [...new Set(c.secciones.flatMap((s) => alimenta(s.id)))];
      const filas = c.secciones.map((s) => {
        const fuentes = alimenta(s.id);
        const hechas = fuentes.filter(hecha).length;
        return h("tr", { id: idSeccion(s.id) },
          h("td", {}, h("strong", { class: "hu-cod", text: s.id }), h("span", { class: "hu-tit", text: s.titulo }), h("span", { class: "sub", text: s.que })),
          h("td", {}, h("span", { class: "momento-tag", "data-momento": s.cuando, text: MOMENTO[s.cuando] })),
          h("td", {}, fuentes.length
            ? h("details", { "data-key": "sec:" + s.id, open: st.abiertos.has("sec:" + s.id) }, h("summary", { text: `${fuentes.length} tareas · ${hechas} hechas` }), listaTareas(fuentes))
            : h("span", { class: "sub", text: "Sin tareas" })));
      });
      return h("section", { class: "bloque capitulo" },
        h("div", { class: "semana-cab" },
          h("h2", { text: `${c.cap}. ${c.titulo}` }),
          h("span", { class: "meta" }, ...c.responsables.map(chipPersona)),
          h("span", { class: "cuenta", text: `${tareasCap.filter(hecha).length} de ${tareasCap.length} tareas hechas` })),
        h("div", { class: "tabla" }, h("table", { class: "informe" },
          h("thead", {}, h("tr", {}, ["Sección", "Cuándo se escribe", "Se alimenta de"].map((x) => h("th", { text: x })))),
          h("tbody", {}, filas))));
    });

    $("#panel-informe").replaceChildren(
      h("div", { class: "bloque" },
        h("h2", { text: "El informe, sección por sección" }),
        h("p", { text: "Así está organizada la plantilla oficial. El orden para escribirla no es el de los capítulos, sino el momento en que existe la información. Lo de \"Mientras trabajan\" no se puede reconstruir al final: se registra cada semana." }),
        resumenMomentos),
      ...capitulos);
  }

  // ── Pestaña Cómo trabajamos
  function renderEquipo() {
    const filas = PLAN.personas.map((p) => {
      const suyas = PLAN.tareas.filter((t) => t.personas.includes(p.id) || t.personas.includes("equipo"));
      return h("tr", {},
        h("td", {}, h("strong", { text: p.nombre })),
        h("td", { text: p.rolScrum }),
        h("td", {}, h("div", { class: "meta" }, p.historias.map(botonHU))),
        h("td", { text: persona[p.pareja].nombre }),
        h("td", { text: p.capitulos }),
        h("td", { text: p.rol }),
        h("td", { text: `${suyas.filter(hecha).length} de ${suyas.length}` }));
    });
    const lista = (tipo, items) => h(tipo, {}, items.map((x) => h("li", { text: x })));

    const prompts = PLAN.ia.prompts.map((p, i) => {
      const pre = h("pre", { class: "prompt", id: `prompt-${i}`, text: p.texto });
      return h("div", { class: "box-prompt" },
        h("div", { class: "paso-cab" }, h("strong", { text: p.nombre }), h("span", { class: "tag", text: p.paso }),
          h("button", { type: "button", class: "copiar", "data-prompt": String(i), text: "Copiar" })),
        pre);
    });

    $("#panel-equipo").replaceChildren(
      h("div", { class: "bloque" },
        h("h2", { text: "Quién hace qué" }),
        h("p", { text: "Ariel es Product Owner y Kevin Scrum Master; Jorge, Eduardo, Adriana y Sebastian son Dev1 a Dev4. Todos diseñan y programan historias (4 o 5 cada uno) y prueban y documentan las de su pareja." }),
        h("div", { class: "tabla" }, h("table", {},
          h("thead", {}, h("tr", {}, ["Persona", "Rol Scrum", "Diseña y programa", "Pareja (prueba sus historias)", "Capítulos del informe", "Responsabilidad", "Avance"].map((x) => h("th", { text: x })))),
          h("tbody", {}, filas)))),
      h("div", { class: "bloque" },
        h("h2", { text: "Cómo usamos la IA en el código y en el informe" }),
        lista("ol", PLAN.ia.principios),
        h("h3", { text: "Prompts base" }),
        h("p", { class: "sub-texto", text: "Reemplacen lo que está entre < > y HU-XX. Cada uno corresponde a un paso del flujo de una historia o a la redacción del informe." }),
        h("div", { class: "prompts" }, prompts)),
      h("div", { class: "bloque" },
        h("h2", { text: "Rutina de cada semana de trabajo" }),
        lista("ol", [
          "Lunes: planning con Kevin (cada historia se divide en tareas Doc, Cod y QA y se estima en puntos), acuerdo de contratos entre los dueños y diseño de las historias del primer sprint de la semana.",
          "Historias del primer sprint: se programan de lunes a miércoles y se prueban de miércoles a jueves.",
          "Historias del segundo sprint: se diseñan el miércoles, se programan de miércoles a viernes y se prueban de viernes a domingo.",
          "Todos los días, daily en el grupo (qué hice, qué haré y qué me bloquea) y Adriana actualiza la hoja de métricas.",
          "Viernes: review con Ariel, que acepta o devuelve cada historia; retro y actas con Kevin. El domingo, merge a main.",
        ])),
      h("div", { class: "bloque" },
        h("h2", { text: "Reglas del equipo" }),
        lista("ul", [
          "Evidencias: una carpeta compartida por historia, y cada captura nombrada con su código (HU-05-E01, HU-05-E02…). Al pasar al informe se citan con el formato de la plantilla (R1-S2-E01).",
          "Una rama por historia y pull request revisado por la pareja antes de entrar a develop.",
          "Cada uno hace commits con su propia cuenta: el repositorio es la evidencia de las contribuciones.",
          "El núcleo del backend va separado de la API REST, y la API expone DTO, nunca las entidades.",
          "Sin contraseñas ni llaves en el repositorio: se usan .env.example y credenciales de prueba en el README.",
          "Pagos solo con la pasarela en modo de prueba, sin guardar datos de tarjeta y con el monto validado en el servidor.",
          "Las métricas, dailies y actas se registran en el momento: la plantilla pide datos reales.",
        ])),
      h("div", { class: "bloque" },
        h("h2", { text: "Por definir" }),
        lista("ul", [
          "La base de datos: es una decisión de arquitectura (Spring Boot y Angular ya están decididos).",
          "Qué sprint del Release 1 y cuál del Release 2 se graban en video.",
          "Qué historia documenta a fondo cada persona en el capítulo 8.",
          "Las fechas reales de cada sprint para el informe: cada semana tiene dos sprints del backlog.",
          "Duración y formato de los videos (preguntarle al profesor).",
        ])));
  }

  // ── Pestaña Especificación
  const especificacion = { texto: null, html: null, error: false };
  async function cargarEspecificacion() {
    if (especificacion.texto) return;
    try {
      const r = await fetch("proyecto.md", { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      especificacion.texto = await r.text();
      especificacion.html = markdown(especificacion.texto);
      especificacion.error = false;
    } catch { especificacion.error = true; }
  }

  // Renderizador de Markdown mínimo: el .md es nuestro y usa una sintaxis acotada
  // (títulos, citas, tablas, listas con un nivel de anidación, párrafos, `código`, **negrita** y *cursiva*).
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const enLinea = (t) => esc(t)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  function markdown(texto) {
    const L = texto.replace(/\r/g, "").split("\n");
    const out = [];
    const esLista = (l) => /^(\s*)([-*]|\d+\.) /.test(l);
    let i = 0;
    while (i < L.length) {
      const l = L[i];
      if (!l.trim()) { i++; continue; }
      const m = l.match(/^(#{1,4}) (.*)$/);
      if (m) {
        const n = m[1].length + 1;
        const cod = m[2].match(/^(HU-\d\d)/);
        out.push(`<h${n}${cod ? ` id="esp-${cod[1]}"` : ""}>${enLinea(m[2])}</h${n}>`);
        i++; continue;
      }
      if (l.startsWith(">")) {
        const b = [];
        while (i < L.length && L[i].startsWith(">")) b.push(enLinea(L[i++].replace(/^> ?/, "")));
        out.push(`<blockquote>${b.join("<br>")}</blockquote>`);
        continue;
      }
      if (l.startsWith("|")) {
        const f = [];
        while (i < L.length && L[i].startsWith("|")) f.push(L[i++]);
        const celdas = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        const cab = celdas(f[0]).map((c) => `<th>${enLinea(c)}</th>`).join("");
        const cuerpo = f.slice(2).map((r) => `<tr>${celdas(r).map((c) => `<td>${enLinea(c)}</td>`).join("")}</tr>`).join("");
        out.push(`<div class="tabla"><table><thead><tr>${cab}</tr></thead><tbody>${cuerpo}</tbody></table></div>`);
        continue;
      }
      if (esLista(l)) {
        const items = [];
        while (i < L.length && esLista(L[i])) {
          const mm = L[i++].match(/^(\s*)([-*]|\d+\.) (.*)$/);
          items.push({ hijo: mm[1].length >= 2, ord: /\d/.test(mm[2]), texto: mm[3] });
        }
        const tag = items[0].ord ? "ol" : "ul";
        let html = `<${tag}>`;
        for (let k = 0; k < items.length;) {
          const it = items[k++];
          const hijos = [];
          while (k < items.length && items[k].hijo) hijos.push(items[k++]);
          const t2 = hijos.length && hijos[0].ord ? "ol" : "ul";
          const sub = hijos.length ? `<${t2}>${hijos.map((x) => `<li>${enLinea(x.texto)}</li>`).join("")}</${t2}>` : "";
          html += `<li>${enLinea(it.texto)}${sub}</li>`;
        }
        out.push(html + `</${tag}>`);
        continue;
      }
      const p = [];
      while (i < L.length && L[i].trim() && !/^(#|>|\|)/.test(L[i]) && !esLista(L[i])) p.push(L[i++]);
      out.push(`<p>${enLinea(p.join(" "))}</p>`);
    }
    return out.join("\n");
  }

  function renderEspecificacion() {
    const panel = $("#panel-especificacion");
    const url = new URL("proyecto.md", location.href).href;
    const cabecera = h("div", { class: "bloque" },
      h("h2", { text: "Especificación del proyecto (proyecto.md)" }),
      h("p", { text: "Todo lo que una persona o su IA necesita para trabajar en el proyecto: producto, equipo, stack, reglas de arquitectura y de seguridad, estados, alcance, plan y las 28 historias con sus criterios y STRIDE. Se genera con los mismos datos de este tablero." }),
      h("ol", {},
        h("li", {}, h("strong", { text: "Con tu IA: " }), "descarga el archivo y adjúntalo al chat, o cópialo y pégalo al empezar. Si tu herramienta puede leer enlaces, dale esta dirección: ", h("code", { text: url })),
        h("li", {}, h("strong", { text: "En el repositorio del proyecto: " }), "va en la raíz como AGENTS.md, y así Claude Code, Kiro, Copilot y otros lo leen solos. Cuando el equipo decida algo (por ejemplo, la base de datos), se actualiza ahí y queda versionado.")),
      h("div", { class: "acciones" },
        h("button", { type: "button", class: "boton copiar-esp", text: "Copiar todo" }),
        h("a", { class: "boton boton-sec", href: "proyecto.md", download: "proyecto.md", text: "Descargar proyecto.md" }),
        h("a", { class: "boton boton-sec", href: "proyecto.md", target: "_blank", rel: "noopener", text: "Abrir en texto plano" })));
    if (!especificacion.texto && !especificacion.error) {
      panel.replaceChildren(cabecera, h("p", { class: "vacio", text: "Cargando la especificación…" }));
      cargarEspecificacion().then(() => { if (st.tab === "especificacion") renderEspecificacion(); });
      return;
    }
    const cuerpo = h("article", { class: "md" });
    if (especificacion.error) cuerpo.append(h("p", { class: "vacio", text: "No se pudo cargar proyecto.md. Recarga la página." }));
    else cuerpo.innerHTML = especificacion.html;   // HTML generado desde nuestro propio .md, con el texto escapado
    panel.replaceChildren(cabecera, cuerpo);
  }

  // ── Navegación entre pestañas
  function irA(tab, idFila) {
    st.tab = tab; guardar(CLAVES.tab, st.tab); render();
    const fila = document.getElementById(idFila);
    if (!fila) return;
    fila.scrollIntoView({ block: "center" });
    fila.classList.add("resaltada");
    setTimeout(() => fila.classList.remove("resaltada"), 1600);
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
  $("main").addEventListener("click", async (e) => {
    const boton = e.target.closest("button.estado");
    if (boton) { cambiar(boton.dataset.id); return; }
    const tagHU = e.target.closest("button.tag-hu");
    if (tagHU) { irA("historias", `hu-${tagHU.dataset.hu}`); return; }
    const tagSec = e.target.closest("button.tag-sec");
    if (tagSec) { irA("informe", idSeccion(tagSec.dataset.sec)); return; }
    const irEsp = e.target.closest("button.ir-esp");
    if (irEsp) { await cargarEspecificacion(); irA("especificacion", "esp-" + irEsp.dataset.esp); return; }
    const copiarEsp = e.target.closest("button.copiar-esp");
    if (copiarEsp) {
      try { await navigator.clipboard.writeText(especificacion.texto || ""); copiarEsp.textContent = "Copiado"; }
      catch { copiarEsp.textContent = "No se pudo copiar: usa Descargar"; }
      setTimeout(() => { copiarEsp.textContent = "Copiar todo"; }, 2000);
      return;
    }
    const copiar = e.target.closest("button.copiar");
    if (copiar) {
      const pre = document.getElementById(`prompt-${copiar.dataset.prompt}`);
      try { await navigator.clipboard.writeText(pre.textContent); copiar.textContent = "Copiado"; }
      catch {
        const rango = document.createRange(); rango.selectNodeContents(pre);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(rango);
        copiar.textContent = "Selecciónalo y cópialo";
      }
      setTimeout(() => { copiar.textContent = "Copiar"; }, 1800);
    }
  });
  $("main").addEventListener("toggle", (e) => {
    const d = e.target;
    if (d.tagName !== "DETAILS" || !d.dataset.key) return;
    if (d.open) st.abiertos.add(d.dataset.key); else st.abiertos.delete(d.dataset.key);
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
