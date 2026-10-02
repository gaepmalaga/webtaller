# Lo que falta para que la web de Taberna Lázaro esté terminada

> ## ⚠️ Lo primero de todo: la historia del abuelo
>
> La web abre contando de dónde viene el nombre: que el abuelo despertaba a
> quien durmiera en su casa diciendo **«Levántate, Lázaro»**, por el pasaje de
> la Biblia. Es lo mejor que tiene la página y lo único que ninguna plantilla
> puede copiar.
>
> **Pero es una historia de su familia, contada de oídas y escrita por un
> tercero.** Antes de que esto sea público hay que:
>
> 1. Confirmar que es así, con las palabras exactas que decía.
> 2. Preguntar si quieren contarla en la web, y si quieren que aparezca el
>    nombre del abuelo (ahora no aparece, a propósito).
> 3. Que la lean ellos y la cambien a su gusto. Está en `index.html`, sección
>    `.intro`, en dos párrafos.
>
> Si dicen que no, se quita el primer párrafo y la página sigue funcionando: el
> segundo ya habla de la taberna.

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

## 5. La calculadora

La web deja ir tocando platos y va echando la cuenta. Está montada para que
**nadie pueda creer que está pidiendo**: se llama «Echa la cuenta», lleva
debajo «calculadora · aquí no se pide nada», el total se llama «saldría por»,
no hay membrete del bar y el aviso va enmarcado dentro. Aun así, dos cosas que
decidir con el dueño:

- **Si quiere tenerla.** A algún hostelero no le gusta que se vea el total
  antes de sentarse. Aquí los precios juegan a favor, así que la recomendación
  es dejarla; pero si dice que no, se quita entera borrando la sección
  `<aside class="cuenta">`, la tira, la pestaña y el bloque 1 del JavaScript:
  la carta se queda igual de bien.
- Las frases que salen según lo que lleves —«eso no es ni calentar», «ahí ya se
  cena en condiciones»— **las ha escrito la web**, imitando su tono. Están
  todas juntas en `assets/js/main.js`, función `guasa()`.

## 6. Los textos

Los lemas de la tapa, la carta y el cierre son suyos, copiados de la carta. El
resto —la descripción de la taberna, «por dónde empezar», la instrucción de la
lista y los comentarios— **los ha escrito la web imitando su tono**. Están
pensados con guasa a propósito, pero conviene que los lea el dueño: hay un
guiño al nombre del bar («un tartar de salchichón que levanta a un muerto —de
eso aquí sabemos—») que o le hace gracia o lo quita en diez segundos.

## 6 bis. Los lemas de la casa

Los lemas son suyos, copiados de la carta:

- «Lázaro, levántate y pídete otra.»
- «Y pregúntanos por las sugerencias del día.»
- «¿Solo una copa? No nos engañemos… Pregúntanos por las botellas.»
- «Una mijilla más y nos vamos.»

Los tres bloques de «cómo es la casa» y el texto de debajo del título **sí los
ha escrito la web**, no la casa. Que les dé el visto bueno.

## 7. Y por último

1. Quitar la franja `<div class="borrador">` de `index.html`.
2. Cambiar el `noindex` por `index, follow` (hay un comentario justo encima).
3. Dominio propio, si lo quieren: con uno, esta web deja de depender de nadie.
4. Reclamar la ficha de Google Business Profile y poner ahí la dirección de la
   web. Para un bar recién abierto, es lo que más clientes mueve.
