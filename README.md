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

- **GitHub Pages**: Settings → Pages → Source: `Deploy from a branch`, rama
  `main`, carpeta `/ (root)`. El archivo `.nojekyll` ya está puesto.
- **Netlify / Cloudflare Pages**: arrastrar la carpeta. Sin comando de build.
- **Hosting clásico**: subir todo por FTP a `public_html`.

**El dominio hay que recuperarlo o contratar uno nuevo.** Si cambia el dominio,
hay que actualizar la URL en tres sitios: las etiquetas `canonical` y `og:` de
`index.html`, el bloque JSON-LD del final de `index.html`, y `sitemap.xml` /
`robots.txt`.

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
