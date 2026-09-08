# Datos a confirmar con Che Bolú

Todo lo que aparece en la web sale de **fuentes públicas** (ficha de Google,
Just Eat, Instagram, directorios y reseñas), no del propio restaurante.
**Nada está inventado, pero nada está confirmado por ellos.** Esta lista es
para repasarla con el dueño en diez minutos.

Fecha de la búsqueda: **7 de septiembre de 2026**.

Verificado el **7 de septiembre de 2026** navegando por la ficha de Google, el
Instagram del restaurante y su página de Just Eat. Lo marcado abajo como
«✅ verificado» sale de una de esas tres fuentes; lo que sigue con «⚠️» aún hay
que confirmarlo con el restaurante.

---

## 1. Lo primero: el permiso

La web usa el nombre del restaurante y habla en su nombre. Mientras no la
apruebe el propietario:

- `index.html` lleva **`noindex`** (no aparece en Google).
- La dirección es provisional: `gaepmalaga.github.io/webtaller/che-bolu/`.

Los dos se quitan a la vez, el día que él diga que sí y haya dominio.

---

## 2. Datos de contacto y localización

| Dato | Lo que está puesto | Fuente | Estado |
|---|---|---|---|
| Nombre | Che Bolú Torremolinos | Ficha de Google | ✅ En la ficha. Instagram y Facebook lo llaman «Che Bolú El Original». Hay más Che Bolú en la zona (Málaga Playa, Huelin, Fuengirola); el de Torremolinos se presenta como «el original, desde 2004» |
| Dirección | Calle de la Cruz, 26 · 29620 Torremolinos | Ficha de Google + Instagram | ✅ Google pone «DE LA CRUZ, 26»; la bio de Instagram pone «Calle de la Cruz, n.º 26, Torremolinos 29620». El nombre de la calle es «Calle de la Cruz» |
| Teléfono | 951 90 95 11 | Bio de Instagram | ✅ Verificado. La bio da **dos** números: **951 909 511** y **952 054 484**. En la web se han puesto los dos en la sección «Dónde» |
| Correo | chebolu@hotmail.es | Just Eat («Datos de la empresa») + directorio | ✅ Es el correo que el restaurante publica en Just Eat. ⚠️ Falta confirmar que quieran ese mismo para el aviso legal / ejercicio de derechos |
| Instagram | @chebolutorremolinos | Perfil | ✅ Activo (575 publicaciones, 7.000 seguidores). Bio: «El auténtico sabor argentino desde 2004», enlace a **www.chebolu.es** |
| A domicilio | Just Eat | Página de Just Eat | ⚠️ La ficha existe y la carta se ve, pero el **7-9-2026 los pedidos estaban desactivados** («actualmente no admite pedidos», Entrega y Recogida «No disponible»). Puede ser porque el lunes cierran, o porque han pausado Just Eat. **Confirmar si siguen operando ahí** |
| Dominio | `chebolu.es` sigue devolviendo **404** (comprobado 7-9-2026) | Bio de Instagram | ✅ **Es suyo**: la propia bio de Instagram enlaza a `www.chebolu.es`. Solo falta que monten la web. Cuando aprueben esta, va ahí y no hay que comprar nada |

## 3. Horario

Lo que está puesto **ahora** en la web (tabla, JavaScript y datos estructurados),
actualizado el 7-9-2026:

| Día | Horario |
|---|---|
| Lunes | Cerrado |
| Martes a sábado | 12:00 – 00:00 |
| Domingo | 12:00 – 17:00 |

**De dónde sale (7-9-2026):**

- **Post fijado de Instagram «HORARIO»** (publicado el 5-9-2026): «Martes a
  sábados 12 h a 24 h · Domingos 12 h a 17 h · Lunes cerrado». Es la fuente
  usada en la web.
- **Ficha de Google → «Horario completo»**: Lunes cerrado · Martes a sábado
  12:00–24:00 · **Domingo 12:00–18:00** (Google pone el domingo hasta las 18:00,
  no las 17:00; diferencia de una hora).
- **Cocina** (Google la separa aparte): Martes a sábado 12:30–23:30 ·
  Domingo 12:30–16:30.

**Cambio importante frente a la versión anterior:** el domingo pasa de «solo
noche, 20:00–00:00» a «solo mediodía, 12:00–17:00».

**Cocina continua:** ✅ parece que sí. Los datos de «horas punta» de Google
muestran ocupación toda la tarde (35–80 % entre las 15:00 y las 18:00 de martes
a sábado) y Google marca la cocina de 12:30 a 23:30 sin corte.

**Confirmar:**

- ¿El domingo hasta las 17:00 (Instagram) o hasta las 18:00 (Google)?
- ¿El horario de domingo (solo mediodía) es todo el año o de temporada?
  Instagram lo liga al verano en algún post («durante todo el verano»).
- ¿Cierran algún periodo de vacaciones? No hay ningún aviso de cierre en
  Instagram (posts activos hasta el 5-9-2026), pero conviene preguntarlo.

Si cambia, hay que tocar **tres sitios y deben coincidir**:
`assets/js/main.js` (constante `HORARIO`), la tabla de `index.html` y el bloque
JSON-LD del final de `index.html`.

## 4. La carta

La sección «Qué se come en Che Bolú» **no lleva precios a propósito**: los que
circulan por los agregadores son de fecha desconocida y poner un precio viejo
en la web del propio restaurante es peor que no poner ninguno. Para pedir, la
web manda a Just Eat, donde los precios están al día.

Los platos que aparecen salen de las reseñas de Google, de la ficha, del
Instagram y de las categorías de Just Eat. **Repasar la lista con ellos.**

**Añadido a la web el 7-9-2026 (visto en las fuentes, no inventado):**

- **Pollo a la brasa** — Just Eat tiene una categoría entera «Pollo a la
  Parrilla» y Facebook habla de «la calidad de nuestros pollos». Es una seña de
  la casa y no estaba en la web.
- **Mollejas** — publicación de Instagram del 3-9-2026 («las mollejas son el
  corazón de nuestro fuego»).
- **Matambre** — etiqueta que aparece en 14 reseñas de Google.
- **Pastas caseras** — categoría «Pastas Caseras Che Bolú» en Just Eat, con
  salsa a elegir (bechamel, pomodoro, pesto, al burro, mixta, boloñesa, al
  tonno). También hay posts de pasta en Instagram.
- **Hamburguesas** — «Novedades Che!!!» en Just Eat: «Burger La Entraña-ble»
  (200 g de entraña, cheddar, rúcula, huevo, tomate, chimi) y «Smash Burger»
  (doble vacío, cebolla caramelizada, bacon, cheddar, pan brioche). Instagram
  añade la «Gaucho» (entraña ecológica madurada, chimichurri).
- **Milanesa**: Instagram dice «más de 11 variedades». Se ha reflejado.

**Categorías completas de Just Eat (7-9-2026):** Pollo / Ternera / Cerdo /
Varios a la Parrilla, Empanadas, Ensaladas, Lomitos, Con patatas, Milanesas,
Pizzas (33 cm), Calzoni, Pastas Caseras, Varios, Bebidas, Combos, Novedades
(burgers). ⚠️ **No se pudo ver el detalle plato a plato** porque Just Eat tenía
los pedidos desactivados y solo mostraba los nombres de categoría.

**Preguntas resueltas:**

- **¿Menú del día?** ✅ **Sí.** Instagram (hace ~3 semanas): «Almuerzos:
  sábados y domingos de 12:30 a 15:00 h (entrada de clientes hasta las 14:30),
  reservas para mesas de 3 o más». Otro post lo llama «Mediodías en la
  esquinita… todo el verano, sábados y domingos de 12:30 a 15:30, en el salón o
  en la terraza, o para llevar». En la web se ha puesto esa nota en la carta.
  ⚠️ Confirmar: ¿solo fin de semana?, ¿solo verano?, ¿hay algo entre semana?
- **¿Terraza?** ✅ **Sí** (Google: «Opciones de servicio: Terraza»; Instagram
  habla de «veredita»/«esquinita»). Añadido a la web.
- **¿Salón para grupos?** Google marca «Grupos» e «Ideal para familias»;
  Instagram pide reservar para mesas de 3 o más. Añadido «salón y terraza; para
  grupos, reservar». ⚠️ No consta un reservado/salón privado: confirmar.
- **¿Aparcamiento?** Google: «Aparcamiento en la calle gratuito», pero «es
  algo difícil encontrar plaza». Añadida esa frase a la sección «Dónde».
- **¿Opciones vegetarianas / sin gluten?** ⚠️ Google **no** lista opciones
  vegetarianas ni sin gluten en «Qué ofrece». Un directorio recoge quejas de
  clientes celíacos por «la falta de opciones sin gluten». **No se ha puesto
  nada de sin gluten en la web.** Preguntar: si de verdad no hay opción sin
  gluten, quizá conviene decirlo con claridad. Vegetariano: hay ensaladas,
  provoleta, pizzas y pastas, pero nada etiquetado como tal.

**Otros atributos de Google que pueden servir para textos futuros:** Wi-Fi
gratis, menú infantil y tronas, accesible con silla de ruedas (aseo y
aparcamiento adaptados), se aceptan reservas y se recomienda reservar para
cenar, pago con tarjeta y con móvil (NFC), buena carta de vinos y de cervezas,
buen café, ambiente «acogedor, informal, tranquilo».

**Política del local (post fijado de Instagram):** no se admite comida ni
bebida traída de fuera, «especialmente tartas de cumpleaños». Valorar si
conviene una nota en la web o al reservar.

## 5. Fotos

**Es lo que más le falta a la página.** Ahora mismo no lleva ninguna foto, y es
a propósito: mejor eso que fotos de banco de otro asador. Con cinco o seis
fotos buenas —la parrilla encendida, una parrillada servida, las empanadas, el
salón, la fachada— la web cambia por completo.

Van en `assets/img/` y se enlazan desde `index.html`.

## 6. Textos

Las tres frases de «cómo es la casa» (parrilla a la vista, platos para
compartir, precio de barrio) y la cita del final salen de reseñas reales de
Google. **Que las lea el dueño**: son suyas, pero las ha escrito otro.

## 7. Aviso legal

`aviso-legal.html` está montado pero **incompleto**. El correo ya se ha puesto
(`chebolu@hotmail.es`, el que el restaurante publica en Just Eat), aunque queda
marcado en amarillo hasta que confirmen que quieren ese mismo para el ejercicio
de derechos. **Siguen faltando la razón social y el CIF**, que solo puede dar el
titular. Están marcados en amarillo y son obligatorios por la Ley 34/2002 (LSSI).
