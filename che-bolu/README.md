# Web de Che Bolú Torremolinos

Sitio web estático para **Che Bolú Torremolinos**, parrilla argentina en la
calle de la Cruz, 26 (Torremolinos, Málaga).

Escrito a mano: un HTML, una hoja de estilo y unos 4 KB de JavaScript. **Sin
WordPress, sin plantilla, sin framework, sin proceso de compilación.** No hay
`node_modules` que actualizar ni plugins que se rompan solos dentro de dos años.

**Dirección provisional:** https://gaepmalaga.github.io/webtaller/che-bolu/

---

## Por qué está hecha así

El restaurante no tiene web. Lo que hay es la ficha de Google, un Instagram y
una página de pedidos en Just Eat, cada cosa por su lado.

Para un restaurante, la web hace un trabajo muy concreto: alguien que tiene
hambre la abre en el móvil y necesita, en este orden, **si está abierto ahora,
qué se come, cuánto cuesta más o menos y cómo llegar o pedir**. La página está
construida alrededor de eso.

## Qué tiene

- **Indicador de «abierto / cerrado ahora»** calculado en hora de Madrid,
  independientemente del reloj del visitante, con la hora a la que abre o
  cierra. El día actual se resalta en la tabla de horarios.
- **Barra fija en móvil**: llamar, pedir y llegar siempre a un toque.
- **La carta por secciones**, con lo que sale de la parrilla y de la cocina.
  Sin precios: para eso está el enlace a Just Eat, donde están al día
  (ver `CONTENIDO-PARA-REVISAR.md`, punto 4).
- **Datos estructurados `Restaurant`** (JSON-LD) con dirección, teléfono,
  horario, tipo de cocina y enlace a la carta: es lo que Google lee para la
  ficha del negocio y para «restaurante argentino en Torremolinos».
- **Cero peticiones a terceros.** La tipografía se sirve desde el propio
  dominio. Sin Google Fonts, sin analítica, sin píxeles: por eso la página no
  necesita aviso de cookies.
- Funciona **sin JavaScript** (solo se pierde el aviso de abierto/cerrado),
  se imprime bien y respeta `prefers-reduced-motion`.

## Estructura

```
index.html            La página. Todo el contenido está aquí.
aviso-legal.html      Aviso legal y privacidad (PENDIENTE de rellenar)
CONTENIDO-PARA-REVISAR.md   Lo que hay que confirmar con el restaurante
che-bolu-una-sola-pagina.html   La web entera en un archivo (generado)
assets/
  css/style.css       Hoja de estilo única
  js/main.js          Horario en vivo, año, aparición al hacer scroll
  fonts/              Tipografía Archivo (SIL OFL, incluida en OFL.txt)
  img/favicon.svg     Icono
  img/og.png          Imagen al compartir en WhatsApp/redes
```

## Verla en local

```bash
python3 -m http.server 8000
# abrir http://localhost:8000/che-bolu/
```

O abriendo `index.html` con doble clic.

## Publicarla

- **GitHub Pages**: ya publicada en
  https://gaepmalaga.github.io/webtaller/che-bolu/
  El workflow `.github/workflows/pages.yml` republica el sitio en cada `push`.
- **Archivo único** (lo más rápido para enseñarla por WhatsApp):
  `che-bolu-una-sola-pagina.html` lleva dentro la tipografía, los estilos y el
  JavaScript. Se abre con doble clic, funciona sin internet y se puede
  arrastrar a Netlify Drop. Se regenera con:

  ```bash
  python3 ../herramientas/construir-archivo-unico.py che-bolu
  ```

- **Netlify / Cloudflare Pages**: arrastrar esta carpeta. Sin comando de build.

### Cuando haya dominio propio

`chebolu.es` existe y resuelve, pero hoy devuelve un 404: **lo primero es
preguntar si el dominio es suyo.** Si lo es, la web se sube ahí y no hay que
comprar nada.

Mientras la dirección sea provisional, la página lleva `noindex` para no
competir en Google con el dominio definitivo ni publicarse antes de que el
restaurante la apruebe. Al cambiar de dirección hay que tocar **cinco sitios**:

1. `index.html`, cabecera: `canonical`, `og:url` y `og:image`.
2. `index.html`, `noindex` → `index, follow` (hay un comentario justo encima).
3. `index.html`, bloque JSON-LD del final: `url` e `image`.
4. `aviso-legal.html`, rellenar los campos en amarillo.
5. `robots.txt` y `sitemap.xml` de la raíz del repositorio.

Son literalmente buscar y reemplazar `gaepmalaga.github.io/webtaller/che-bolu`
por el dominio nuevo, más la línea del `noindex`.

## Cambiar datos

| Qué | Dónde |
|---|---|
| Teléfono | `index.html` — buscar `951909511` (enlaces `tel:` y JSON-LD) |
| Horario | `assets/js/main.js` (constante `HORARIO`), la tabla de `index.html` y el bloque JSON-LD. Los tres tienen que coincidir |
| Dirección | `index.html` — hero, sección «Dónde estamos», pie y JSON-LD |
| Platos | `index.html`, bloques `<article class="menu__bloque">` |
| Colores | `assets/css/style.css`, bloque `:root` del principio |

## Pendiente antes de publicar de verdad

1. **Que lo apruebe el propietario.** Ver `CONTENIDO-PARA-REVISAR.md`.
2. **Rellenar `aviso-legal.html`**: razón social, CIF y correo de contacto.
3. **Fotos reales.** Es lo que más le falta.
4. **Quitar el `noindex`** y reclamar/actualizar la ficha de Google Business
   Profile apuntando al dominio nuevo.

## Licencias

Tipografía **Archivo** de Omnibus-Type, bajo SIL Open Font License 1.1
(`assets/fonts/OFL.txt`). El resto del código es original.
