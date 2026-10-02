# Web de La Taberna de Churriana

Sitio web estático para **La Taberna de Churriana** (Pl. San Antonio Abad, 7 ·
Churriana, Málaga).

Escrito a mano: una hoja de estilo, unos 5 KB de JavaScript y un `index.html`
que **no se edita**, porque se genera. **Sin WordPress, sin plantilla, sin
framework, sin `node_modules`.** Nada que actualizar ni plugins que se rompan
solos dentro de dos años.

**Dirección provisional:** https://gaepmalaga.github.io/webtaller/churriana/

---

## De dónde sale lo que se ve

- **La carta y los precios**, de las dos fotos de la carta de la casa.
- **El negro, el amarillo y el logo**, de su Instagram
  ([@latabernadechurriana](https://www.instagram.com/latabernadechurriana)):
  la tipografía gorda y condensada, el subrayado amarillo de las publicaciones
  y el monograma **LT** son suyos, no de ninguna plantilla.
- **El horario y el teléfono**, de su perfil.

## La idea

**La carta es la web.** Quien la abre tiene hambre y quiere saber, por este
orden, qué se come, cuánto cuesta, si está abierto y cómo se llega. Todo lo
demás sobra, así que antes de la carta solo hay la portada, cuatro líneas de
presentación y tres mesas ya puestas para el que entra diciendo «ponme lo que
quieras».

Y la carta se toca: al pulsar una línea, el plato pasa a **tu lista** —pegada
al lado en el ordenador, subiendo desde abajo en el móvil— para no liarte
cuando llegue el camarero.

### Que no parezca una comanda

- Se llama **«Lo que te vas a pedir»**, y debajo, **«tu lista · no se manda a
  ningún sitio»**.
- La suma es un **«llevas»** pequeño, no un «total».
- El aviso va enmarcado dentro de la propia lista, no en letra pequeña al pie.
- Se cierra con la × o con Escape, y se recupera con la pestaña.

No se envía nada a ninguna parte, no se guarda nada en el móvil y **no hay ni
una sola petición a terceros**: las tipografías, el logo y el código salen de
este mismo dominio. Por eso tampoco hay aviso de cookies: no hay cookies.

## Qué tiene

- La carta entera con precios y las descripciones del papel, cada sección en su
  caja, con índice arriba para saltar de una a otra.
- **Abierto / cerrado ahora**, calculado en el navegador a partir del horario,
  con el día de hoy resaltado en la tabla. Los viernes y sábados que cierran a
  la 1:00 siguen contando como «abierto» a las 00:30.
- **Fotos de los platos**: se suben desde el panel y se ven en grande al
  tocarlas.
- Ficha de Google lista: datos `Restaurant` en JSON-LD con dirección, teléfono
  y horario, para que el buscador enseñe lo que toca.
- Imagen propia al compartir el enlace por WhatsApp.
- Se ve igual de bien en un móvil viejo que en un portátil, y se imprime
  decente si alguien quiere la carta en papel.

## Cómo se cambia

**Nada de esto se toca a mano.** Todo lo editable vive en
`datos/contenido.json`, y hay un panel para ello:

👉 **https://gaepmalaga.github.io/webtaller/churriana/admin/**

Platos, precios, descripciones, fotos, frases, horario, teléfono. Se guarda, se
publica, y GitHub vuelve a generar la web sola. Está explicado en
[ADMIN.md](ADMIN.md).

A mano, desde el repositorio:

```bash
node herramientas/construir.js churriana   # regenera churriana/index.html
```

## Los archivos

```
churriana/
  index.html                 GENERADO. No editar: lo monta el renderizador
  aviso-legal.html           Aviso legal, privacidad y cookies
  datos/contenido.json       La fuente de todo lo editable
  admin/                     El panel
  assets/
    css/style.css            La hoja de estilo
    js/main.js               La lista, el horario y el visor de fotos
    fonts/                   Archivo (SIL OFL), servida desde aquí
    img/                     El logo, los iconos, la imagen de compartir
    img/platos/              Las fotos que se suben desde el panel

herramientas/
  render-churriana.js        Convierte el JSON en el HTML
  construir.js               El comando que lo ejecuta
```

Lo que queda por confirmar está en [PENDIENTE.md](PENDIENTE.md).
