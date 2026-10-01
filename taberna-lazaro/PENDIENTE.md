# Lo que falta para que la web de Taberna Lázaro esté terminada

Fecha: **1 de octubre de 2026**.

La carta, los precios, los colores y los lemas salen de las fotos de la carta
de la casa, así que eso **sí es suyo**. Lo que queda es poco y rápido.

---

## 1. Los cinco datos que faltan

Con esto se quita la franja de «Borrador» y todo lo amarillo de la página:

| Dato | Para qué | Dónde se pone |
|---|---|---|
| **Teléfono** | Reservas. Es lo que más se pulsa en el móvil. | `index.html` (hero, «Dónde estamos», pie y JSON-LD) |
| **Horario** | El aviso de «abierto ahora» y el día resaltado | `assets/js/main.js` (`HORARIO`), la tabla de `index.html` y el JSON-LD. Los tres tienen que coincidir |
| **Cuenta de Instagram** | La sección de sugerencias y el botón | `index.html`, sección `#instagram` (hay un comentario con el cambio exacto) |
| **Correo** | Obligatorio para el aviso legal | `aviso-legal.html` y «Dónde estamos» |
| **Razón social y CIF** | Obligatorios por la LSSI | `aviso-legal.html`, campos en amarillo |

Y una pregunta suelta: **¿hay aparcamiento cerca?** Está marcado en la sección
de cómo llegar porque no se ha podido confirmar.

## 2. El logotipo de verdad

El ramo de olivo de la web está **redibujado a mano** a partir de la foto de la
carta: se parece, pero no es el suyo. Si pasan el logo en SVG o PNG con fondo
transparente, se sustituye en cinco minutos. Está en `index.html`, dentro del
bloque `<symbol id="ramo">`, y se usa en la cabecera, el hero y el cierre.

## 3. Fotos

Es lo que más le falta a la página: ahora mismo no lleva ninguna, y es a
propósito —mejor eso que fotos de banco de otra taberna—. Con cinco o seis
buenas (la barra, la gilda, las japo bravas, el tartar de salchichón, el local
lleno un viernes) la web cambia por completo.

Van en `assets/img/` y se enlazan desde `index.html`.

## 4. Repasar que la carta esté bien copiada

Transcrita de las dos fotos de la carta. **Que la lea el dueño**, sobre todo:

- «Gyozas de langostinos» (en la carta pone «Gyozas langostinos»).
- «Japo bravas», «Rusa», «Tartar de salchichón», «Cafélys»: tal cual estaban.
- Pan 1,00 € y salsa extra 0,50 €.
- Todos los precios incluyen IVA.

Si la carta cambia, cada plato es **una línea** de `index.html`: nombre, los
puntitos y el precio. Se tarda más en abrir el archivo que en cambiarlo.

## 5. Los textos

Los lemas son suyos, copiados de la carta:

- «Lázaro, levántate y pídete otra.»
- «Y pregúntanos por las sugerencias del día.»
- «¿Solo una copa? No nos engañemos… Pregúntanos por las botellas.»
- «Una mijilla más y nos vamos.»

Los tres bloques de «cómo es la casa» y el texto de debajo del título **sí los
ha escrito la web**, no la casa. Que les dé el visto bueno.

## 6. Y por último

1. Quitar la franja `<div class="borrador">` de `index.html`.
2. Cambiar el `noindex` por `index, follow` (hay un comentario justo encima).
3. Dominio propio, si lo quieren: con uno, esta web deja de depender de nadie.
4. Reclamar la ficha de Google Business Profile y poner ahí la dirección de la
   web. Para un bar recién abierto, es lo que más clientes mueve.
