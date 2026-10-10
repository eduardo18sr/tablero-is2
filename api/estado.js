// Función serverless de Vercel: guarda el estado de cada tarea en Upstash Redis.
//   GET  /api/estado  → { estados: { [idTarea]: { estado, por, ts } } }
//   POST /api/estado  { id, estado, por } → { entrada }
// Variables de entorno: las crea la integración de Upstash (KV_REST_API_URL y KV_REST_API_TOKEN,
// o UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN). CODIGO_EQUIPO es opcional: si existe,
// solo quien envía ese código puede cambiar estados.

const CLAVE = "tablero-is2:estados";
const ID_VALIDO = /^s\d{1,2}-[a-z0-9-]{1,40}$/;
const ESTADOS = new Set(["pendiente", "en-curso", "hecho"]);
const PERSONAS = new Set(["p1", "p2", "p3", "p4", "p5", "p6"]);

function credenciales() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function redis({ url, token }, comando) {
  const respuesta = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(comando),
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok || datos.error) throw new Error(datos.error || `Redis respondió ${respuesta.status}`);
  return datos.result;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const cred = credenciales();
  if (!cred) return res.status(503).json({ error: "sin_base_de_datos" });

  try {
    if (req.method === "GET") {
      const plano = (await redis(cred, ["HGETALL", CLAVE])) || [];
      const estados = {};
      for (let i = 0; i < plano.length; i += 2) {
        try { estados[plano[i]] = JSON.parse(plano[i + 1]); } catch { /* entrada corrupta: se ignora */ }
      }
      return res.status(200).json({ estados });
    }

    if (req.method === "POST") {
      const codigo = process.env.CODIGO_EQUIPO;
      if (codigo && req.headers["x-codigo-equipo"] !== codigo) {
        return res.status(401).json({ error: "codigo_incorrecto" });
      }
      const { id, estado, por } = req.body || {};
      if (typeof id !== "string" || !ID_VALIDO.test(id) || !ESTADOS.has(estado) || !PERSONAS.has(por)) {
        return res.status(400).json({ error: "datos_invalidos" });
      }
      const entrada = { estado, por, ts: Date.now() };
      if (estado === "pendiente") await redis(cred, ["HDEL", CLAVE, id]);
      else await redis(cred, ["HSET", CLAVE, id, JSON.stringify(entrada)]);
      return res.status(200).json({ entrada });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "metodo_no_permitido" });
  } catch (error) {
    console.error(error);
    return res.status(502).json({ error: "error_base_de_datos" });
  }
}
