# Saber qué pide la gente

La web puede contar **cuánta gente entra y qué platos mira**. Viene apagada:
mientras no se encienda, la página no hace una sola petición a terceros.

Lo que hace falta es un sitio donde se guarden esos números. Está escrito y
listo en [`herramientas/analitica-worker.js`](../herramientas/analitica-worker.js):
son 100 líneas, se despliega en **Cloudflare Workers** (gratis de sobra para un
bar) y los datos son tuyos, no de nadie más.

---

## Qué se guarda y qué no

**Se guarda**, por día y en bruto:

- cuántas visitas ha tenido la web,
- cuántas veces se ha tocado cada plato,
- cuántas veces se ha usado cada propuesta de «por dónde empezar».

**No se guarda** —y esto es a propósito—: ni IP, ni navegador, ni país, ni de
dónde viene la visita, ni ninguna cookie, ni ningún identificador. No se puede
seguir a nadie porque no hay a quién seguir: son contadores.

Por eso la web **no necesita aviso de cookies**. Y se respeta «No rastrear» del
navegador: a quien lo tenga puesto no se le cuenta.

## Montarlo (15 minutos, una vez)

1. Cuenta gratis en [dash.cloudflare.com](https://dash.cloudflare.com).
2. **Workers & Pages → Create → Worker**. Ponle de nombre `lazaro-numeros`.
3. **Edit code**: borra lo que haya y pega entero
   `herramientas/analitica-worker.js`. Dale a **Deploy**.
4. **Storage & Databases → KV → Create**. Nómbralo `lazaro`.
5. Vuelve al Worker → **Settings → Bindings**:
   - **KV namespace**: variable `DATOS` → el KV `lazaro`.
   - **Variable de entorno**: `CLAVE` → inventa una contraseña larga y
     guárdala. Marcarla como *secret* si te deja.
6. Copia la dirección del Worker (algo como
   `https://lazaro-numeros.tu-cuenta.workers.dev`).
7. En **/admin/ → Números**, pega esa dirección y guarda. Y la primera vez que
   abras los números te pedirá la `CLAVE`: se queda en tu navegador.

A partir de ahí, en **/admin/ → Números** tienes visitas, platos más tocados y
propuestas más usadas de los últimos 30 días.

## Para qué sirve de verdad

- **Qué entra por los ojos.** El plato más tocado no siempre es el más pedido
  en barra: es el que más llama la atención en la carta. Si la tortilla trufada
  se toca mucho y se vende poco, el problema no es el plato, es cómo está
  contado o dónde está puesto.
- **Qué sobra.** Lo que nadie toca en tres meses, probablemente sobra de la
  carta.
- **Cuándo mirar.** Si las visitas se disparan un viernes, es que alguien os ha
  compartido. Suele ser Instagram.
- **Si la web sirve.** Visitas subiendo = la ficha de Google y el Instagram
  están trayendo gente.

## Apagarlo

Borrar la dirección en **/admin/ → Números** y guardar. Vuelve a no mandarse
nada a ninguna parte.

## Un detalle técnico, por honestidad

El Worker guarda un documento por día y lo lee-modifica-escribe en cada tanda
de eventos. Con el tráfico de un bar eso no da problemas; si algún día dos
visitas coinciden en la misma milésima, puede perderse un contador. Para contar
tapas es más que suficiente: no es contabilidad.
