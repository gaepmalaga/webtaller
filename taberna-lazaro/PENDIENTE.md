# Lo que falta para que la web de Taberna Lázaro esté terminada

## 1. Los datos que faltan

> **Ya no hace falta pedírselo a nadie.** Todo esto se mete desde el panel:
> https://gaepmalaga.github.io/webtaller/taberna-lazaro/admin/ → pestaña
> **Datos** (y **Horario**). Al rellenarlo desaparece lo amarillo, y con el
> interruptor de «Borrador» en *no* se va también la franja de arriba.

El Instagram ya está puesto: **@tabernalazaro**.

| Dato | Para qué | Dónde se pone |
|---|---|---|
| **Teléfono** | Reservas. Es lo que más se pulsa en el móvil. | **/admin/ → Datos** |
| **Horario** | El aviso de «abierto ahora» y el día resaltado | **/admin/ → Horario** |
| **Correo** | Obligatorio para el aviso legal | **/admin/ → Datos**, y `aviso-legal.html` |
| **Razón social y CIF** | Obligatorios por la LSSI | `aviso-legal.html`, campos en amarillo |

Y una pregunta suelta: **¿hay aparcamiento cerca?** Está marcado en la sección
de cómo llegar porque no se ha podido confirmar.

## 2. El logotipo de verdad

El ramo de olivo de la web está **redibujado a mano** a partir de la foto de la
carta: se parece, pero no es el suyo. Si pasan el logo en SVG o PNG con fondo
transparente, se sustituye en cinco minutos. Está en `index.html`, dentro del
bloque `<symbol id="ramo">`, y se usa en la cabecera, el hero y el cierre.

## 3. Fotos

Es lo que más le falta a la página. **Y ya se pueden subir desde el móvil**:
/admin/ → La carta → tocar el cuadrito de cada plato. La foto se encoge sola
antes de subirse, así que da igual que venga de la cámara.

Con cinco o seis buenas (la gilda, las japo bravas, el tartar de salchichón, la
barra, el local lleno un viernes) la web cambia por completo.

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

Los lemas son suyos, copiados de la carta:

- «Lázaro, levántate y pídete otra.»
- «Y pregúntanos por las sugerencias del día.»
- «¿Solo una copa? No nos engañemos… Pregúntanos por las botellas.»
- «Una mijilla más y nos vamos.»

Todo lo demás **lo ha escrito la web** imitando ese tono, no la casa: la
descripción de la taberna, «por dónde empezar», la instrucción de la lista y
los comentarios que salen según lo que lleves apuntado. Que les dé el visto
bueno, sobre todo a los guiños al nombre («aquí los milagros son modestos»,
«casi nadie resucita con una sola», «con eso resucita cualquiera»): están en el
mismo registro que su propia carta, pero son nuestros.

## 7. Y por último

1. Quitar la franja `<div class="borrador">` de `index.html`.
2. Cambiar el `noindex` por `index, follow` (hay un comentario justo encima).
3. Dominio propio, si lo quieren: con uno, esta web deja de depender de nadie.
4. Reclamar la ficha de Google Business Profile y poner ahí la dirección de la
   web. Para un bar recién abierto, es lo que más clientes mueve.
