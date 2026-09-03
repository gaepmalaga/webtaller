# Web de Taller Hidrocar

Sitio web estático para **Taller Hidrocar** (Pol. Ind. El Rompedizo, Churriana, Málaga).

Está escrito a mano: un HTML, una hoja de estilo y un archivo de JavaScript de
unos 5 KB. **No hay WordPress, ni plantilla comprada, ni framework, ni proceso de
compilación.** No hay `node_modules` que actualizar ni plugins que se rompan
solos dentro de dos años.

---

## Por qué se ha hecho así

El dominio `hidrocarmalaga.com` **ya no resuelve en DNS** (comprobado el 3 de
septiembre de 2026: `Could not resolve host`). La web anterior no está caída:
sencillamente no existe ya. Lo que sigue indexado en los buscadores son las
páginas antiguas, que llevan a un error.

Para un taller, la web hace un trabajo muy concreto: alguien con el coche
averiado la abre en el móvil y necesita, en este orden, **el teléfono, si está
abierto ahora y cómo llegar**. Todo lo demás va después. La página está
construida alrededor de eso.

## Qué tiene

- **Indicador de «abierto / cerrado ahora»** calculado en hora de Madrid,
  independientemente del reloj del visitante. El día actual se resalta en la
  tabla de horarios.
- **Barra fija de llamada en móvil**: llamar y WhatsApp siempre a un toque.
- **Sección de averías** con orientación real (qué significa un testigo rojo
  frente a uno naranja, si corre prisa o no). Es la parte que hace que la página
  sirva para algo antes incluso de que el cliente llame.
- **Datos estructurados `AutoRepair`** (JSON-LD) con dirección, teléfono y
  horario: es lo que Google lee para la ficha del negocio y para «taller cerca
  de mí».
- **Cero peticiones a terceros.** Las tipografías están servidas desde el propio
  dominio. Sin Google Fonts, sin analítica, sin píxeles: por eso la página no
  necesita aviso de cookies.
- Funciona **sin JavaScript** (solo se pierde el aviso de abierto/cerrado),
  se imprime bien y respeta `prefers-reduced-motion`.

## Estructura

```
index.html            La página. Todo el contenido está aquí.
aviso-legal.html      Aviso legal y privacidad (PENDIENTE de rellenar, ver abajo)
robots.txt
sitemap.xml
hidrocar-una-sola-pagina.html   La web entera en un archivo (generado)
herramientas/
  construir-archivo-unico.py    Genera el archivo de arriba
assets/
  css/style.css       Hoja de estilo única
  js/main.js          Horario en vivo, año, aparición al hacer scroll
  fonts/              Archivo (SIL Open Font License, incluida en OFL.txt)
  img/favicon.svg     Icono
  img/og.png          Imagen al compartir en WhatsApp/redes
```

## Verla en local

No hace falta instalar nada. Con Python:

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

O simplemente abriendo `index.html` con doble clic (el indicador de horario
funciona igual).

## Publicarla

Es una carpeta de archivos estáticos: vale cualquier alojamiento.

- **Archivo único** (lo más rápido para enseñarla): `hidrocar-una-sola-pagina.html`
  lleva dentro la tipografía, los estilos y el JavaScript. Se abre con doble
  clic, **funciona sin internet**, se manda por WhatsApp o correo y se puede
  arrastrar a Netlify Drop. Se regenera con:

  ```bash
  python3 herramientas/construir-archivo-unico.py
  ```

- **GitHub Pages**: el workflow `.github/workflows/pages.yml` ya está puesto,
  pero **está en pausa mientras el repositorio sea privado**: Pages no funciona
  en repositorios privados con el plan gratuito de GitHub. En cuanto se ponga en
  público, el siguiente `push` lo publica solo en
  `https://gaepmalaga.github.io/webtaller/`. No hay que tocar Settings.
- **Netlify / Cloudflare Pages**: arrastrar la carpeta. Sin comando de build.
  Es la vía si el repositorio tiene que seguir siendo privado.
- **Hosting clásico**: subir todo por FTP a `public_html`.

### Cuando haya dominio propio

La dirección de GitHub Pages es provisional, para poder enseñar la web. Mientras
lo sea, la página lleva `noindex` para no competir en Google con el dominio
definitivo. Al recuperar `hidrocarmalaga.com` (o contratar otro), hay que tocar
**cuatro sitios**:

1. `index.html`, cabecera: `canonical`, `og:url` y `og:image`.
2. `index.html`, `noindex` → `index, follow` (hay un comentario justo encima).
3. `index.html`, bloque JSON-LD del final: `url` e `image`.
4. `robots.txt` y `sitemap.xml`.

Son literalmente buscar y reemplazar `gaepmalaga.github.io/webtaller` por el
dominio nuevo, más la línea del `noindex`.

## Cambiar datos

| Qué | Dónde |
|---|---|
| Teléfono | `index.html` — buscar `689019992` (aparece en enlaces `tel:`, `wa.me` y JSON-LD) |
| Horario | `assets/js/main.js` (constante `HORARIO`), la tabla de `index.html` y el bloque JSON-LD. Los tres tienen que coincidir |
| Dirección | `index.html` — hero, sección «Dónde estamos», pie y JSON-LD |
| Servicios | `index.html`, lista `<ol class="serv">` y `makesOffer` del JSON-LD |
| Colores | `assets/css/style.css`, bloque `:root` del principio |

## Pendiente antes de publicar

1. **Rellenar `aviso-legal.html`**: razón social, CIF y correo de contacto. Son
   obligatorios por la Ley 34/2002 (LSSI). Los campos están marcados en amarillo.
2. **Confirmar los datos** con el taller: ver `CONTENIDO-PARA-REVISAR.md`.
3. **Fotos reales del taller.** Ahora mismo la página no lleva ninguna foto, y es
   a propósito: es preferible eso a poner imágenes de banco de otro taller. Con
   cuatro o cinco fotos buenas (fachada, boxes, un trabajo de chapa terminado)
   la página gana mucho.
4. **Ficha de Google Business Profile**: con el JSON-LD ya puesto, reclamar la
   ficha es lo que más tráfico va a mover para «taller en Churriana».

## Licencias

Tipografía **Archivo** de Omnibus-Type, bajo SIL Open Font License 1.1
(`assets/fonts/OFL.txt`). El resto del código de este repositorio es original.
