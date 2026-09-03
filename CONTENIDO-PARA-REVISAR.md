# Datos a confirmar con el taller

Todo lo que aparece en la web sale de fuentes públicas, no del propio taller.
**Nada está inventado, pero nada está confirmado por ellos.** Esta lista es para
repasarla con el dueño en cinco minutos.

Fecha de la búsqueda: **3 de septiembre de 2026**.

---

## 1. Estado del dominio

`hidrocarmalaga.com` **no resuelve en DNS**. No es que el servidor esté caído:
el nombre ya no apunta a ninguna parte.

```
$ curl -I http://hidrocarmalaga.com/
curl: (6) Could not resolve host: hidrocarmalaga.com
```

Los buscadores todavía tienen indexadas páginas antiguas del sitio
(`/taller-cambio-neumaticos-baratos-en-malaga/`, `/servicios`, etc.), así que
cualquiera que los encuentre acaba en un error.

**Preguntar:** ¿el dominio está caducado y se puede recuperar, o hay que
contratar uno nuevo?

---

## 2. Datos de contacto y localización

| Dato | Lo que está puesto | Fuente | Estado |
|---|---|---|---|
| Nombre | Taller Hidrocar | Páginas Amarillas, Facebook | Verosímil |
| Dirección | C/ Escritor Herrera Santaolalla, **9**, Pol. Ind. El Rompedizo, 29140 Churriana | Páginas Amarillas | ⚠️ **Confirmar el número** |
| Teléfono | 689 019 992 | Páginas Amarillas y directorios | Confirmar |
| Horario | L–V 9:30–20:00 · S 9:30–14:00 | Directorios | Confirmar |
| Facebook | facebook.com/reparaciondecochesymotos | Búsqueda | Confirmar que sigue activo |
| Correo | *no aparece en la web* | — | ❌ **Falta**: hace falta uno para el aviso legal |

⚠️ **Discrepancia detectada:** un directorio da el número **9** de la calle y
otro el número **1**. Está puesto el 9. Hay que preguntarlo.

---

## 3. Servicios

Los ocho servicios de la página vienen de la descripción del propio negocio y de
los títulos de sus páginas antiguas, todavía indexadas:

- Chapa y pintura, electricidad, lavado de vehículos y reparación de motos
  (descripción del negocio en directorios).
- Cambio de neumáticos, diagnosis de motor y control de gases de escape
  (títulos de páginas del sitio antiguo).
- Carga de aire acondicionado, pastillas y discos de freno, revisión pre-ITV
  (resultados de búsqueda sobre el sitio antiguo).
- Lavado «a mano por dentro y por fuera: cristales, alfombrillas, techos,
  asientos y llantas» — casi literal de su texto anterior.

**Preguntar:** ¿falta algo que hagan y no esté? ¿Sobra algo que ya no hagan?

---

## 4. Frases que hay que validar

Estas afirmaciones son razonables pero **describen cómo trabajan ellos**, así
que las tiene que dar por buenas el dueño:

| Dónde | Frase |
|---|---|
| Hero | «Diagnosis con equipo propio, recambios de primeras marcas y asesoramiento personalizado» — adaptado de su propio texto anterior |
| El taller | «la avería se lee aquí mismo, sin mandar el coche a ningún otro sitio» |
| El taller | «Mecánica, electricidad, chapa y pintura y lavado» en el mismo sitio |
| Averías | «Una foto por WhatsApp antes de venir nos ahorra tiempo a los dos» |
| Dónde estamos | «muy cerca del aeropuerto de Málaga» — geográficamente cierto (El Rompedizo linda con el aeropuerto) |

## 5. WhatsApp

La web enlaza a `wa.me/34689019992` en cuatro sitios (hero, sección de averías,
cierre, barra fija del móvil y pie). **Es una suposición**: el número es un móvil
y los talleres suelen usar WhatsApp para que el cliente mande fotos del golpe,
pero no está comprobado que ese número lo tenga o que lo atiendan.

- Si **no** lo usan: hay que quitar esos enlaces (buscar `wa.me` en `index.html`).
- Si usan **otro** número para WhatsApp: cambiarlo solo en los `wa.me`.

## 6. Consejos sobre averías

La sección «¿Qué le pasa a tu coche?» la he escrito yo. Es orientación general
correcta (testigo rojo frente a naranja, chirrido de pastillas, fuga de gas del
aire acondicionado), y la propia sección avisa de que no sustituye a ver el
coche. Aun así, **conviene que la lea un mecánico del taller** antes de
publicarla: es su nombre el que va debajo.

## 7. Lo que NO lleva la web, a propósito

- **Sin fotos.** No hay ninguna imagen del taller porque no tengo ninguna, y
  poner fotos de banco de otro taller sería engañar al cliente. El diseño está
  hecho para funcionar sin fotos, pero mejora bastante con cuatro reales.
- **Sin opiniones ni testimonios.** No me he inventado ninguna reseña.
- **Sin precios.** No hay ni una tarifa publicada que pueda comprobar.
- **Sin años de experiencia, ni certificaciones, ni marcas oficiales.** Si tienen
  algo de eso (concesión de alguna marca, certificado de gases, adhesión a alguna
  red de talleres), es de lo que más confianza da y merece la pena añadirlo.
