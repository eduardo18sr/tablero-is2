# Tablero IS2

Una página sencilla con las tareas del equipo para el Proyecto Final de Ingeniería de Software II. Cada persona elige su nombre, ve sus tareas semana por semana y marca cada una como **Pendiente → En curso → Hecho**. Todo el equipo ve los cambios.

- `index.html`, `estilos.css` y `app.js`: la página. Son archivos estáticos y no necesitan build.
- `tareas.js`: el plan (personas, semanas y tareas). **Para cambiar el plan, edita este archivo.**
- `api/estado.js`: la función de Vercel que guarda el estado de cada tarea en Redis.

## Publicarlo en Vercel

1. **Sube la carpeta a GitHub**, en un repositorio aparte del proyecto, por ejemplo `tablero-is2`.
2. **Importa el repositorio en Vercel.**
   - En vercel.com: *Add New → Project*, eliges el repositorio y despliegas.
   - No hace falta configurar nada: el framework es *Other* y no hay comando de build.
   - Con este primer despliegue la página ya funciona, pero en **modo local**: cada navegador guarda sus propios cambios.
3. **Conecta la base de datos para compartir el estado.**
   - En el proyecto de Vercel, entra a la pestaña **Storage** y crea o conecta una base **Upstash Redis** desde el Marketplace. El plan gratuito alcanza de sobra.
   - Conéctala al proyecto sin cambiar el prefijo de las variables. Vercel agrega solo `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
4. **(Opcional) Pon un código de equipo.**
   - Sirve para que nadie ajeno al grupo pueda cambiar tareas aunque tenga el link.
   - En *Settings → Environment Variables*, crea `CODIGO_EQUIPO` con una palabra que solo sepa el equipo.
   - La página la pide la primera vez que alguien marca una tarea.
5. **Vuelve a desplegar** (*Deployments → Redeploy*) para que se carguen las variables.
6. **Prueba**: abre el link, elige tu nombre y marca una tarea. Ábrelo en otro celular: el cambio aparece en unos 20 segundos, o al volver a la pestaña.

### Alternativa sin GitHub

Con Node instalado, desde esta carpeta:

```bash
npx vercel
```

Sigue las preguntas y después haz los pasos 3 a 5 desde la web de Vercel.

## Probarlo en tu computadora

Abrir `index.html` directamente funciona en modo local, sin compartir nada. Para probar también la función de la API:

```bash
npx vercel dev
```

## Cambiar el plan

- Edita `tareas.js` y vuelve a subirlo a GitHub; Vercel lo despliega solo.
- **No cambies el `id` de una tarea que ya tiene estado**: el estado se guarda por id.
- Para agregar una tarea, copia una existente, ponle un `id` nuevo que empiece con su semana (por ejemplo `s9-mi-tarea`) y elige a quién le toca (`p1` a `p6`, o `equipo`).

| id | Persona |
| --- | --- |
| p1 | Jorge Quispe |
| p2 | Adriana Callupe |
| p3 | Eduardo Saldaña |
| p4 | Ariel Enriquez |
| p5 | Kevin Chan |
| p6 | Sebastian Garate |
