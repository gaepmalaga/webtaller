# Saber qué pide la gente

La web puede contar **cuánta gente entra y qué platos mira**. Todo está escrito
y listo: falta encenderlo, y encenderlo son **tres pasos de cinco minutos**.

Mientras no se encienda, la página no hace una sola petición a terceros.

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
navegador: a quien lo tenga puesto, no se le cuenta.

Los datos están en **tu** cuenta de Cloudflare, no en la de ningún
intermediario, y el recolector son 100 líneas que puedes leer enteras:
[`herramientas/analitica/worker.js`](../herramientas/analitica/worker.js).

---

## Encenderla

No hay que tocar código ni desplegar nada a mano: lo hace solo un flujo de
trabajo de GitHub. Solo hay que darle las llaves.

### 1. Una cuenta de Cloudflare y un token

1. Cuenta gratis en [dash.cloudflare.com](https://dash.cloudflare.com) (el plan
   gratuito sobra de largo para un bar).
2. Arriba a la derecha: **My Profile → API Tokens → Create Token**.
3. Elige la plantilla **«Edit Cloudflare Workers»** y dale a *Continue* y
   *Create*. Copia el token: es la única vez que se ve.

### 2. Dos secretos en GitHub

En el repositorio: **Settings → Secrets and variables → Actions →
New repository secret**. Hay que crear dos:

| Nombre | Qué se pone |
|---|---|
| `CLOUDFLARE_API_TOKEN` | El token del paso anterior |
| `ANALITICA_CLAVE` | Una contraseña larga que te inventes. Es la que te pedirá el panel para enseñarte los números. Apúntala |

*(Si tu cuenta de Cloudflare tiene varias organizaciones, añade también
`CLOUDFLARE_ACCOUNT_ID`, que sale en el panel de Cloudflare.)*

### 3. Darle al botón

**Actions → Desplegar la analítica → Run workflow.**

Eso crea el almacén, mete la clave, sube el recolector, **escribe su dirección
en `datos/contenido.json` y republica la web con la analítica ya encendida**.
Al terminar, el resumen del trabajo te dice la dirección del recolector.

No hay paso 4: a partir de ahí, en **/admin/ → Números** tienes visitas, platos
más mirados y propuestas más usadas. La primera vez te pedirá la clave de
lectura (la de `ANALITICA_CLAVE`); se queda guardada en tu navegador.

---

## Para qué sirve de verdad

- **Qué entra por los ojos.** El plato más tocado no es el más vendido en
  barra: es el que más llama la atención en la carta. Si la tortilla trufada se
  toca mucho y se vende poco, el problema no es el plato: es dónde está puesto
  o cómo está contado.
- **Qué sobra.** Lo que nadie toca en tres meses, probablemente sobra.
- **Cuándo mirar.** Si las visitas se disparan un viernes, alguien os ha
  compartido. Suele ser Instagram.
- **Si la web sirve.** Visitas subiendo = la ficha de Google y el Instagram
  están trayendo gente.

## Apagarla

Borrar la dirección en **/admin/ → Números** y publicar. Vuelve a no mandarse
nada a ninguna parte. (Y si quieres, borra el Worker en Cloudflare.)

## Un detalle técnico, por honestidad

El recolector guarda un documento por día y lo lee-modifica-escribe en cada
tanda de eventos. Con el tráfico de un bar eso no da problemas; si algún día
dos visitas coinciden en la misma milésima, puede perderse un contador. Para
contar tapas sobra: no es contabilidad.
