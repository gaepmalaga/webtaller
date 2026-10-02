/* ==========================================================================
   Taberna Lázaro — JavaScript, sin dependencias ni peticiones a nadie.

   Lo que hace:
     1. La cuenta: tocas una línea de la carta y se te va apuntando.
     2. El aviso de «abierto / cerrado ahora» en hora de Málaga.
     3. El día de hoy, marcado en la tabla del reverso.
     4. El visor: pulsar la foto de un plato para verla en grande.
     5. El año del pie.

   Sin JavaScript la página sigue siendo lo que es: la carta entera con sus
   precios. Solo se pierde el juego de la cuenta, y por eso los botones de la
   carta no parecen botones hasta que esto se ejecuta (la clase `js`).
   ========================================================================== */
(function () {
  'use strict';

  var raiz = document.documentElement;
  raiz.classList.add('js');

  /* Lo que el generador ha dejado escrito en la página: el horario, los
     comentarios de la lista y, si está encendida, la analítica. Todo sale de
     datos/contenido.json y se toca desde /admin/, no aquí. */
  var DATOS = {};
  try { DATOS = JSON.parse(document.getElementById('datos').textContent); } catch (e) {}

  var HORARIO = {};
  for (var dd = 0; dd < 7; dd++) {
    var tr = DATOS.horario && DATOS.horario[String(dd)];
    HORARIO[dd] = Array.isArray(tr) ? tr : [];
  }


  /* ======================================================== 1. LA CUENTA == */

  var euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

  /* Lo pedido: id -> { n: nombre, p: precio, x: cuántos }. Vive en memoria y
     se va con la pestaña: es un juego, no una comanda. */
  var pedido = Object.create(null);

  var elLineas   = document.getElementById('cuenta-lineas');
  var elVacia    = document.getElementById('cuenta-vacia');
  var elTotal    = document.getElementById('cuenta-total');
  var elCifra    = document.getElementById('cuenta-cifra');
  var elGuasa    = document.getElementById('cuenta-guasa');
  var elAcciones = document.getElementById('cuenta-acciones');
  var elCuenta   = document.getElementById('cuenta');
  var elTira     = document.getElementById('tira');
  var elTiraN    = document.getElementById('tira-n');
  var elTiraC    = document.getElementById('tira-c');
  var elTiraT    = document.querySelector('.tira__t');
  var TIRA_VACIA = (DATOS.tira && DATOS.tira.vacia) || '';
  var TIRA_LLENA = (DATOS.tira && DATOS.tira.llena) || '';
  var elEscenas  = document.querySelector('.escenas');
  var elCerrar   = document.getElementById('cuenta-cerrar');
  var elPestana  = document.getElementById('pestana');
  var elPestanaC = document.getElementById('pestana-c');
  var elCuerpo   = document.querySelector('.carta__cuerpo');

  var anchaDeSobra = window.matchMedia('(min-width: 72rem)');

  /* El comentario de la casa. Mira QUÉ has cogido, no cuánto suma: si solo
     hay bebida falta comer, si solo hay comida falta beber. El dinero no
     pinta nada aquí. */
  function comentario() {
    var n = 0, comer = 0, beber = 0;
    for (var id in pedido) {
      n += pedido[id].x;
      if (pedido[id].t === 'comer') { comer += pedido[id].x; } else { beber += pedido[id].x; }
    }
    var c = DATOS.comentarios || {};
    if (n === 0)     { return ''; }
    if (comer === 0) { return n > 2 ? (c.soloBeberMucho || '') : (c.soloBeberPoco || ''); }
    if (beber === 0) { return c.soloComer || ''; }
    if (n <= 2)      { return c.dos || ''; }
    if (n <= 5)      { return c.cinco || ''; }
    if (n <= 9)      { return c.nueve || ''; }
    return c.muchos || '';
  }

  function unidades() {
    var n = 0;
    for (var id in pedido) { n += pedido[id].x; }
    return n;
  }

  function total() {
    var t = 0;
    for (var id in pedido) { t += pedido[id].p * pedido[id].x; }
    return t;
  }

  function pintar() {
    var n = unidades();
    var t = total();

    /* Las líneas del ticket. */
    elLineas.textContent = '';
    Object.keys(pedido).forEach(function (id) {
      var it = pedido[id];
      var li = document.createElement('li');

      var x = document.createElement('span');
      x.className = 'cuenta__x';
      x.textContent = it.x + '×';

      var nm = document.createElement('span');
      nm.className = 'cuenta__nm';
      nm.textContent = it.n;

      var im = document.createElement('span');
      im.className = 'cuenta__im';
      im.textContent = euros.format(it.p * it.x);

      var menos = document.createElement('button');
      menos.type = 'button';
      menos.className = 'cuenta__menos';
      menos.textContent = '\u2212';            /* un menos de verdad, no un guion */
      menos.setAttribute('aria-label', 'Quitar un ' + it.n);
      menos.addEventListener('click', function () { quitar(id); });

      li.appendChild(menos); li.appendChild(x); li.appendChild(nm); li.appendChild(im);
      elLineas.appendChild(li);
    });

    elVacia.hidden    = n > 0;
    elTotal.hidden    = n === 0;
    elAcciones.hidden = n === 0;
    elCifra.textContent = euros.format(t);
    elGuasa.textContent = comentario();

    /* La tira de abajo en móvil y la pestaña de escritorio. Con la lista
       vacía no se enseña un 0,00 €: se invita, que es de lo que va esto. */
    elTiraN.textContent = String(n);
    elTiraN.hidden = n === 0;
    elTiraT.textContent = n ? TIRA_LLENA : TIRA_VACIA;
    elTiraC.textContent = n ? euros.format(t) : '';
    elPestanaC.textContent = n ? euros.format(t) : '';

    /* Y las marcas en la propia carta. */
    document.querySelectorAll('.it').forEach(function (b) {
      var it = pedido[b.dataset.id];
      if (it) {
        b.classList.add('is-puesto');
        b.dataset.x = '×' + it.x;
      } else {
        b.classList.remove('is-puesto');
        b.removeAttribute('data-x');
      }
    });
  }

  function poner(id, nombre, precio, cuantos, tipo) {
    if (!pedido[id]) { pedido[id] = { n: nombre, p: precio, x: 0, t: tipo || 'beber' }; }
    pedido[id].x += (cuantos || 1);
    pintar();
  }

  function quitar(id) {
    if (!pedido[id]) { return; }
    pedido[id].x -= 1;
    if (pedido[id].x <= 0) { delete pedido[id]; }
    pintar();
  }

  /* Tocar una línea de la carta. */
  document.querySelectorAll('.it').forEach(function (b) {
    var nombre = b.dataset.n;
    var precio = parseFloat(b.dataset.p);
    b.setAttribute('aria-label', 'Apuntar ' + nombre + ', ' + euros.format(precio));
    b.addEventListener('click', function () {
      poner(b.dataset.id, nombre, precio, 1, b.dataset.t);
    });
  });

  /* ------------------------------------------------------- los escenarios --
     Los totales de «¿Y esto qué vale?» NO están escritos a mano: se calculan
     con los precios de la carta de abajo. Así no pueden quedarse desfasados
     cuando cambie un precio. Lo que va escrito en el HTML es el valor correcto
     para quien no tenga JavaScript. */
  function lista(b) {
    try { return JSON.parse(b.dataset.ronda); } catch (e) { return []; }
  }

  function precioDe(id) {
    var origen = document.querySelector('.it[data-id="' + id + '"]');
    return origen ? { n: origen.dataset.n, p: parseFloat(origen.dataset.p), t: origen.dataset.t } : null;
  }

  if (elEscenas) {
    elEscenas.querySelectorAll('.esc').forEach(function (b) {
      var partes = lista(b);
      var suma = 0;
      partes.forEach(function (par) {
        var it = precioDe(par[0]);
        if (it) { suma += it.p * par[1]; }
      });

      var cifra = b.querySelector('[data-total]');
      if (cifra && suma > 0) { cifra.textContent = euros.format(suma); }

      b.addEventListener('click', function () {
        pedido = Object.create(null);
        partes.forEach(function (par) {
          var it = precioDe(par[0]);
          if (it) { poner(par[0], it.n, it.p, par[1], it.t); }
        });
        cerrar(false);
        document.getElementById('carta').scrollIntoView({ block: 'start' });
        abrir(true);
      });
    });
  }

  document.getElementById('cuenta-borrar').addEventListener('click', function () {
    pedido = Object.create(null);
    pintar();
  });

  /* ------------------------------------------- cerrarla y volver a abrirla --
     Cerrada: en escritorio desaparece el papel y la carta se queda con todo el
     ancho, con una pestaña abajo a la derecha para recuperarla; en móvil la
     hoja baja y queda la tira, que es su propio tirador. */
  function cerrar(si) {
    elCuenta.classList.toggle('is-cerrada', si);
    if (elCuerpo) { elCuerpo.classList.toggle('sin-cuenta', si); }
    elPestana.hidden = !si;
    if (si) { elCuenta.classList.remove('is-abierta'); }
    elTira.setAttribute('aria-expanded', 'false');
  }

  /* --------------------------------------------- la hoja de abajo en móvil */
  function abrir(si) {
    if (anchaDeSobra.matches) { return; }
    if (si) { cerrar(false); }
    elCuenta.classList.toggle('is-abierta', si);
    elTira.setAttribute('aria-expanded', si ? 'true' : 'false');
  }

  elTira.addEventListener('click', function () {
    abrir(!elCuenta.classList.contains('is-abierta'));
  });

  elCerrar.addEventListener('click', function () {
    if (anchaDeSobra.matches) { cerrar(true); } else { abrir(false); }
  });

  elPestana.addEventListener('click', function () { cerrar(false); });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') { return; }
    if (anchaDeSobra.matches) { cerrar(true); } else { abrir(false); }
  });

  document.addEventListener('click', function (e) {
    if (!elCuenta.classList.contains('is-abierta')) { return; }
    if (elCuenta.contains(e.target) || elTira.contains(e.target)) { return; }
    /* Un toque en la carta o en un escenario acaba de abrirla: ese mismo
       clic no puede cerrarla al subir por el documento. */
    if (e.target.closest && e.target.closest('.it, .esc')) { return; }
    abrir(false);
  });

  anchaDeSobra.addEventListener('change', function () {
    elCuenta.classList.remove('is-abierta');
    elTira.setAttribute('aria-expanded', 'false');
    elPestana.hidden = !elCuenta.classList.contains('is-cerrada');
  });

  elCuenta.hidden = false;
  elTira.hidden = false;
  pintar();

  /* ====================================================== 2 y 3. HORARIO == */

  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function hayHorario() {
    for (var d in HORARIO) { if (HORARIO[d].length) { return true; } }
    return false;
  }

  function hhmm(min) {
    if (min === 1440) { return 'medianoche'; }
    /* Más de 1440 es madrugada del día siguiente: 1500 son la 1:00. */
    var m = min % 1440;
    var h = Math.floor(m / 60);
    return (h === 1 ? 'la ' : 'las ') + h + ':' + String(m % 60).padStart(2, '0');
  }

  /* Hora de Málaga, sea cual sea el reloj de quien mira. */
  function ahoraEnMalaga() {
    var p = {};
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Madrid', weekday: 'short',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });

    var idx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { dia: idx[p.weekday], min: (parseInt(p.hour, 10) % 24) * 60 + parseInt(p.minute, 10) };
  }

  function proximaApertura(dia) {
    for (var i = 1; i <= 7; i++) {
      var d = (dia + i) % 7;
      if (HORARIO[d].length) {
        return (i === 1 ? 'mañana' : 'el ' + DIAS[d]) + ' a ' + hhmm(HORARIO[d][0][0]);
      }
    }
    return null;
  }

  function estado(ahora) {
    var tramos = HORARIO[ahora.dia];
    for (var i = 0; i < tramos.length; i++) {
      if (ahora.min >= tramos[i][0] && ahora.min < tramos[i][1]) {
        return { abierto: true, texto: 'Abierto ahora · cierra a ' + hhmm(tramos[i][1]) };
      }
      if (ahora.min < tramos[i][0]) {
        return { abierto: false, texto: 'Cerrado · hoy abre a ' + hhmm(tramos[i][0]) };
      }
    }
    var luego = proximaApertura(ahora.dia);
    return { abierto: false, texto: luego ? 'Cerrado · abre ' + luego : 'Cerrado ahora' };
  }

  if (window.Intl && Intl.DateTimeFormat) {
    var ahora = ahoraEnMalaga();

    var caja = document.getElementById('estado');
    if (caja && hayHorario()) {
      var e = estado(ahora);
      caja.querySelector('.estado__txt').textContent = e.texto;
      caja.classList.add(e.abierto ? 'is-abierto' : 'is-cerrado');
      caja.hidden = false;
    }

    var fila = document.querySelector('.dorso__tabla tr[data-dia="' + ahora.dia + '"]');
    if (fila) { fila.classList.add('hoy'); }
  }

  /* ======================================================== 4. EL VISOR ===
     Pulsar la miniatura de un plato la enseña a pantalla completa. Se cierra
     con la ×, con Escape, o pulsando fuera de la foto. Al cerrarse, el foco
     vuelve a la miniatura de la que se salió.
     ---------------------------------------------------------------------- */
  var visor = document.getElementById('visor');
  if (visor) {
    var vImg = document.getElementById('visor-img');
    var vN = document.getElementById('visor-n');
    var vP = document.getElementById('visor-p');
    var vX = document.getElementById('visor-x');
    var deDonde = null;

    function abreVisor(boton) {
      deDonde = boton;
      vImg.src = boton.dataset.foto;
      vImg.alt = 'Foto de ' + boton.dataset.n;
      vN.textContent = boton.dataset.n;
      vP.textContent = boton.dataset.p || '';
      visor.hidden = false;
      document.body.style.overflow = 'hidden';
      vX.focus();
    }

    function cierraVisor() {
      if (visor.hidden) { return; }
      visor.hidden = true;
      vImg.removeAttribute('src');
      document.body.style.overflow = '';
      if (deDonde) { deDonde.focus(); deDonde = null; }
    }

    document.querySelectorAll('.verfoto').forEach(function (b) {
      b.addEventListener('click', function () { abreVisor(b); });
    });

    vX.addEventListener('click', cierraVisor);
    /* Pulsar el fondo cierra; pulsar la foto, no. */
    visor.addEventListener('click', function (e) {
      if (!e.target.closest('.visor__f') || e.target.tagName === 'FIGCAPTION') { cierraVisor(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { cierraVisor(); }
    });
  }

  /* ========================================================= 5. EL AÑO ==== */
  var anio = document.getElementById('anio');
  if (anio) { anio.textContent = new Date().getFullYear(); }
})();
