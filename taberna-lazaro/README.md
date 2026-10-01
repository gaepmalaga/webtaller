# Web de Taberna Lázaro

Sitio web estático para **Taberna Lázaro** (C/ Alfredo Catalani, 3 · Huelin,
Málaga).

Escrito a mano: un HTML, una hoja de estilo y unos 5 KB de JavaScript. **Sin
WordPress, sin plantilla, sin framework, sin proceso de compilación.** No hay
`node_modules` que actualizar ni plugins que se rompan solos dentro de dos años.

**Dirección provisional:** https://gaepmalaga.github.io/webtaller/taberna-lazaro/

---

## Por qué está hecha así

La taberna acaba de abrir: tiene ficha de Google e Instagram, y nada más. Para
un bar, la web hace un trabajo muy concreto: alguien con hambre la abre en el
móvil y quiere saber, en este orden, **qué se come, cuánto cuesta, si está
abierto y cómo llegar**. La página está construida alrededor de eso.

La identidad —el verde oliva, la crema, el ramo de olivo, la tipografía con
remate y los lemas— sale de **la carta de la casa**, no de ninguna plantilla.

## La idea

**La web es la carta.** No hay portada con titular y tres bloques debajo: se
abre como se abre una carta —tapa, y dentro los platos— y la carta entera es
lo que ocupa la página.

Y la carta se toca. Al pulsar una línea, el plato se apunta en **un ticket que
va sumando solo**, pegado al lado mientras bajas (o en una hoja que sube desde
abajo, en el móvil). Responde a la pregunta que tiene cualquiera que no conoce
un bar y mira la carta por fuera: *¿esto cuánto me va a costar?* Dos gildas y
dos cañas, 8,40 €. Ahí lo tienes, sin calcular.

Es un juego, no una comanda: no se manda nada a ninguna parte, no se guarda
nada y no hay ni una petición a terceros.

## Qué tiene

- **La carta entera con precios**, maquetada como la impresa: nombre, puntitos
  y precio, fluyendo en dos columnas. Cada plato es una línea de HTML, así que
  actualizarla cuesta menos que abrir el archivo.
- **El ticket que suma solo**, con tres «rondas hechas» para empezar de un
  toque (la de siempre, picoteo entre dos, solo una copa) y la guasa de la casa
  cambiando según lo que lleves.
- **Indicador de «abierto / cerrado ahora»** calculado en hora de Málaga,
  independientemente del reloj del visitante, con el día de hoy resaltado en la
  tabla. *Se enciende solo en cuanto se rellene el horario* (ver `PENDIENTE.md`).

- **Datos estructurados `BarOrPub`** (JSON-LD) con dirección, tipo de cocina y
  enlace a la carta: es lo que Google lee para la ficha del negocio.
- **Cero peticiones a terceros.** Las tipografías se sirven desde el propio
  dominio. Sin Google Fonts, sin analítica, sin píxeles: por eso la página no
  necesita aviso de cookies.
- Funciona **sin JavaScript**, se imprime bien (la carta en A4 sale decente) y
  respeta `prefers-reduced-motion`.

## Estructura

```
index.html            La página. Todo el contenido está aquí.
aviso-legal.html      Aviso legal y privacidad (PENDIENTE de rellenar)
PENDIENTE.md          Lo que falta por confirmar con el local
taberna-lazaro-una-sola-pagina.html   La web entera en un archivo (generado)
assets/
  css/style.css       Hoja de estilo única
  js/main.js          Horario en vivo, año, aparición al hacer scroll
  fonts/              Fraunces y Archivo (SIL OFL, licencias incluidas)
  img/favicon.svg     Icono
  img/og.png          Imagen al compartir en WhatsApp/redes
```

## Verla en local

```bash
python3 -m http.server 8000
# abrir http://localhost:8000/taberna-lazaro/
```

O abriendo `index.html` con doble clic.

## Publicarla

- **GitHub Pages**: ya publicada en
  https://gaepmalaga.github.io/webtaller/taberna-lazaro/
  El workflow `.github/workflows/pages.yml` republica el sitio en cada `push`.
- **Archivo único** (lo más rápido para enseñarla por WhatsApp):
  `taberna-lazaro-una-sola-pagina.html` lleva dentro las tipografías, los
  estilos y el JavaScript. Se abre con doble clic, funciona sin internet y se
  puede arrastrar a Netlify Drop. Se regenera con:

  ```bash
  python3 ../herramientas/construir-archivo-unico.py taberna-lazaro
  ```

- **Netlify / Cloudflare Pages**: arrastrar esta carpeta. Sin comando de build.

### Cuando haya dominio propio

Mientras la dirección sea provisional, la página lleva `noindex`: ni compite en
Google con el dominio definitivo ni se publica antes de que el local la
apruebe. Al cambiar de dirección hay que tocar **cinco sitios**:

1. `index.html`, cabecera: `canonical`, `og:url` y `og:image`.
2. `index.html`, `noindex` → `index, follow` (hay un comentario justo encima).
3. `index.html`, bloque JSON-LD del final: `url` e `image`.
4. `aviso-legal.html`, rellenar los campos en amarillo.
5. `robots.txt` y `sitemap.xml` de la raíz del repositorio.

## Cambiar datos

| Qué | Dónde |
|---|---|
| Un plato o un precio | `index.html`, su línea. Lo que cuenta: `data-id` (único), `data-n` (nombre) y `data-p` (precio en número). El precio visible va aparte, en `<i class="it__p">` |
| Una ronda hecha | `index.html`, el `data-ronda` de cada `<button class="ronda">`: pares de `[id, cantidad]` |
| La guasa del ticket | `assets/js/main.js`, función `guasa()` |
| Una sección entera de la carta | `index.html`, el `<article class="menu__bloque">` que toque |
| Horario | `assets/js/main.js` (constante `HORARIO`), la tabla de `index.html` y el JSON-LD. Los tres tienen que coincidir |
| Teléfono, Instagram, correo | `index.html` — hero, «Dónde estamos», pie y JSON-LD |
| Colores | `assets/css/style.css`, bloque `:root` del principio |
| Logotipo | `index.html`, bloque `<symbol id="ramo">` |

## Pendiente

Está todo en [`PENDIENTE.md`](PENDIENTE.md). En resumen: teléfono, horario,
Instagram, correo, el logo de verdad y fotos.

## Licencias

Tipografías **Fraunces** (Undercase Type) y **Archivo** (Omnibus-Type), las dos
bajo SIL Open Font License 1.1 (`assets/fonts/OFL-Fraunces.txt` y
`assets/fonts/OFL-Archivo.txt`). El resto del código es original.
