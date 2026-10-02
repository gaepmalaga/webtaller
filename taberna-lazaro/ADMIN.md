# El panel: cambiar la web sin pedírselo a nadie

**Dirección:** https://gaepmalaga.github.io/webtaller/taberna-lazaro/admin/

Desde ahí se cambian los textos, los platos, los precios, las fotos, el horario
y los datos del local. Se guarda, y **en un minuto está publicado**. No hay que
tocar código ni avisar a nadie.

---

## Cómo funciona por dentro

No hay servidor ni base de datos. Todo lo editable vive en un único archivo,
[`datos/contenido.json`](datos/contenido.json), dentro del repositorio.

```
Tú tocas algo en /admin/
        ↓
el panel sube contenido.json (y las fotos) a GitHub, en un solo commit
        ↓
GitHub vuelve a generar index.html con herramientas/construir-taberna.js
        ↓
publicado
```

Por eso el `index.html` que hay en el repositorio **no se edita a mano**: es
algo generado, y lo que manda es el JSON.

## La llave

Para guardar hace falta una llave de GitHub. Se pide una vez, se queda en el
navegador y solo viaja a `api.github.com`.

Conviene que sea **fine-grained**, con acceso **solo a este repositorio** y
permiso de **Contents: Read and write**. El propio panel lo explica paso a paso
la primera vez. Si alguna vez se pierde el móvil, se borra la llave en GitHub y
deja de valer al instante.

## Las fotos

Una por plato. Se suben desde el móvil y **se encogen en el propio móvil antes
de subirse**: una foto de cámara de 4 MB acaba siendo un JPEG de 800 píxeles y
unos pocos KB. Así la carta sigue cargando en un suspiro y el repositorio no se
infla.

Se guardan en `assets/img/platos/<identificador-del-plato>.jpg`.

## Qué se puede cambiar

| Sección | Qué hay |
|---|---|
| **Resumen** | Qué falta por poner, con un botón que lleva a cada sitio. El interruptor de borrador. Platos, secciones y fotos de un vistazo |
| **La carta** | Platos, precios, fotos. Añadir, quitar y reordenar |
| **Frases** | Todos los textos de la web, uno a uno, con su explicación. También lo que dice la lista según lo que lleves |
| **Horario** | Los siete días, con uno o dos turnos. Al ponerlo se enciende sola la chapa de «abierto ahora» y se le cuenta a Google |
| **Datos** | Teléfono, correo, Instagram, dirección, aparcamiento. Y el interruptor de la franja de «Borrador» |

El menú lateral lleva un globito con **cuántas cosas faltan** en cada sección,
para que no haya que acordarse.

## Si algo sale mal

- **«La llave no vale o ha caducado»**: se hace otra en GitHub y se pega.
- **«No tiene permiso de escritura»**: a la llave le falta *Contents: Read and
  write*, o no tiene marcado este repositorio.
- **Se guardó pero la web no cambia**: GitHub tarda hasta un par de minutos.
  Si pasado eso sigue igual, mira la pestaña *Actions* del repositorio.
- **La he liado**: cada guardado es un commit. Todo lo anterior sigue en el
  historial de GitHub y se puede volver atrás.

## Sin el panel

También se puede editar `datos/contenido.json` a mano y luego:

```bash
node herramientas/construir-taberna.js
```
