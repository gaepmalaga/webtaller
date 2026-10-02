# Lo que falta para que la web de La Taberna de Churriana esté terminada

Mientras quede algo de esto, la web lleva la franja de **borrador** arriba y
sale marcado en amarillo lo que no está confirmado. Casi todo se arregla desde
el panel, sin tocar un archivo:

👉 **https://gaepmalaga.github.io/webtaller/churriana/admin/**

## 1. Los datos que faltan

Ya están puestos el **teléfono** (744 78 10 63), el **horario**, la
**dirección** y el **Instagram**, sacados de su perfil. Falta:

| Dato | Para qué | Dónde se pone |
|---|---|---|
| **Correo** | Obligatorio para el aviso legal | **/admin/ → Datos**, y `aviso-legal.html` |
| **Razón social y CIF** | Obligatorios por la LSSI | `aviso-legal.html`, campos en amarillo |
| **Aparcamiento** | Es la pregunta de quien viene de fuera de Churriana | **/admin/ → Datos** |

Y conviene **confirmar el horario** con la casa: el que hay es el de su ficha
(12:00–00:00 de domingo a jueves, hasta la 1:00 viernes y sábado).

## 2. Repasar que la carta esté bien copiada

Transcrita de las dos fotos de la carta: **40 platos**. Que la lea el dueño,
sobre todo los precios y estos:

- «Cheddar Boom», «Baconesa», «Cabrera»: tal cual estaban escritos.
- Las descripciones largas son las del papel, resumidas donde no cabían.
- Las bebidas van sin descripción, como en la carta.

Se cambia desde **/admin/ → La carta**: tocar el plato, escribir, publicar.

## 3. Fotos

Es lo que más le falta. Se suben desde el móvil: **/admin/ → La carta** y tocar
el cuadrito de cada plato. La foto se encoge sola antes de subirse, así que da
igual que venga directa de la cámara.

Con cinco o seis buenas —los huevos rotos con secreto, el Cheddar Boom, una
tosta, la barra llena un viernes— la página cambia por completo.

## 4. Los textos

El lema («Buen tapeo en Churriana») y el tono son los suyos, de su Instagram.
Lo demás —la presentación, «por dónde empezar», la despedida y los comentarios
que salen según lo que lleves apuntado— **lo ha escrito la web** imitando ese
tono. Que les dé el visto bueno; se cambian todos desde **/admin/ → Frases**,
sin pedírselo a nadie.

## 5. Las tres mesas de «Por dónde empezar»

Son propuestas inventadas con platos de su carta («una caña y un pincho»,
«picoteo para dos», «mesa para dos, sin mirar»). Si la casa prefiere otras
combinaciones, se cambian en `datos/contenido.json`, apartado `escenarios`.

## 6. Y por último

1. Quitar el borrador: **/admin/ → Datos**, interruptor de «Borrador» en *no*.
   Con eso se va la franja de arriba y la web pasa a indexarse sola.
2. Dominio propio, si lo quieren. Con uno, esta web deja de depender de nadie.
3. Reclamar la ficha de Google Business Profile y poner ahí la dirección de la
   web: para un bar de barrio es lo que más clientes mueve.
