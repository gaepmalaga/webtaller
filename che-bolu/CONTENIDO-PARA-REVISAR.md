# Datos a confirmar con Che Bolú

Todo lo que aparece en la web sale de **fuentes públicas** (ficha de Google,
Just Eat, Instagram, directorios y reseñas), no del propio restaurante.
**Nada está inventado, pero nada está confirmado por ellos.** Esta lista es
para repasarla con el dueño en diez minutos.

Fecha de la búsqueda: **7 de septiembre de 2026**.

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
| Nombre | Che Bolú Torremolinos | Ficha de Google | Confirmado en la ficha |
| Dirección | Calle de la Cruz, 26 · 29620 Torremolinos | Ficha de Google | La ficha pone «DE LA CRUZ, 26». ⚠️ **Confirmar el nombre exacto de la calle** |
| Teléfono | 951 90 95 11 | Directorios y ficha | Confirmar |
| Correo | chebolu@hotmail.es | Directorio Ruta Culinaria | ⚠️ **Confirmar**: hace falta uno real para el aviso legal |
| Instagram | @chebolutorremolinos | Enlace facilitado | Confirmado |
| A domicilio | Just Eat | Enlace facilitado | Confirmado |
| Dominio | `chebolu.es` **existe y resuelve, pero devuelve 404** | Comprobado el 7-9-2026 | ⚠️ **Preguntar**: ¿es suyo? Si lo es, la web se pone ahí y no hace falta comprar nada |

## 3. Horario

Lo que está puesto en la web (tabla, JavaScript y datos estructurados):

| Día | Horario |
|---|---|
| Lunes | Cerrado |
| Martes a sábado | 12:00 – 00:00 |
| Domingo | 20:00 – 00:00 |

Sale de la ficha de Google y coincide en tres directorios distintos.
**Confirmar**, sobre todo:

- ¿La cocina es continua de verdad de 12:00 a 00:00, o cierra por la tarde?
  La web dice que se puede comer a media tarde.
- ¿El domingo solo por la noche, todo el año?
- ¿Cierran algún periodo de vacaciones?

Si cambia, hay que tocar **tres sitios y deben coincidir**:
`assets/js/main.js` (constante `HORARIO`), la tabla de `index.html` y el bloque
JSON-LD del final de `index.html`.

## 4. La carta

La sección «Qué se come en Che Bolú» **no lleva precios a propósito**: los que
circulan por los agregadores son de fecha desconocida y poner un precio viejo
en la web del propio restaurante es peor que no poner ninguno. Para pedir, la
web manda a Just Eat, donde los precios están al día.

Los platos que aparecen salen de las reseñas de Google y de la descripción de
la ficha. **Repasar la lista con ellos**: parrillada, entraña, vacío, costillas,
chuletón, brocheta mixta, chorizo criollo, provoleta, empanadas (criolla y de
jamón y queso, al horno y fritas), milanesa y milanesa napolitana, ensaladas,
patatas y batatas, lomitos, camperos, paninis, pizzas, calzones, pionono de
dulce de leche, alfajores caseros, flan y tartas.

**Preguntar además:**

- ¿Hay menú del día? (varias reseñas lo echan en falta; si lo hay, es de lo
  primero que habría que poner).
- ¿Terraza? ¿Salón para grupos o celebraciones? No está puesto porque no se ha
  podido confirmar.
- ¿Aparcamiento cerca? Tampoco está puesto.
- Opciones vegetarianas, sin gluten, etc.

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

`aviso-legal.html` está montado pero **incompleto**: faltan la razón social, el
CIF y el correo para el ejercicio de derechos. Están marcados en amarillo. Son
obligatorios por la Ley 34/2002 (LSSI).
