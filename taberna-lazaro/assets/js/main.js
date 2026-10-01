/* ==========================================================================
   Taberna Lázaro — JavaScript, sin dependencias ni peticiones a nadie.

   Lo que hace:
     1. La cuenta: tocas una línea de la carta y se te va apuntando.
     2. El aviso de «abierto / cerrado ahora» en hora de Málaga.
     3. El día de hoy, marcado en la tabla del reverso.
     4. El año del pie.

   Sin JavaScript la página sigue siendo lo que es: la carta entera con sus
   precios. Solo se pierde el juego de la cuenta, y por eso los botones de la
   carta no parecen botones hasta que esto se ejecuta (la clase `js`).
   ========================================================================== */
(function () {
  'use strict';

  var raiz = document.documentElement;
  raiz.classList.add('js');

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
  var elRondas   = document.querySelector('.rondas');

  /* La guasa de la casa, según lo que lleves. El tono lo marca la carta. */
  function guasa(total, unidades) {
    if (unidades === 0) { return ''; }
    if (total < 6)  { return 'Eso no es ni calentar.'; }
    if (total < 12) { return 'Ya hay con qué entretenerse.'; }
    if (total < 22) { return 'Ahí ya se cena en condiciones.'; }
    if (total < 35) { return '¿Solo una copa? No nos engañemos…'; }
    if (total < 60) { return 'Una mijilla más y nos vamos.'; }
    return 'Lázaro, levántate y pídete otra. Pero mañana.';
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
    elGuasa.textContent = guasa(t, n);

    /* La tira de abajo, en móvil. */
    elTiraN.textContent = String(n);
    elTiraC.textContent = euros.format(t);

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

  function poner(id, nombre, precio, cuantos) {
    if (!pedido[id]) { pedido[id] = { n: nombre, p: precio, x: 0 }; }
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
    b.addEventListener('click', function () { poner(b.dataset.id, nombre, precio); });
  });

  /* Las rondas hechas. */
  if (elRondas) {
    elRondas.hidden = false;
    elRondas.querySelectorAll('.ronda').forEach(function (b) {
      b.addEventListener('click', function () {
        var lista;
        try { lista = JSON.parse(b.dataset.ronda); } catch (e) { return; }
        lista.forEach(function (par) {
          var origen = document.querySelector('.it[data-id="' + par[0] + '"]');
          if (origen) { poner(par[0], origen.dataset.n, parseFloat(origen.dataset.p), par[1]); }
        });
        abrir(true);
      });
    });
  }

  document.getElementById('cuenta-borrar').addEventListener('click', function () {
    pedido = Object.create(null);
    pintar();
  });

  /* --------------------------------------------- la hoja de abajo en móvil */
  function abrir(si) {
    if (window.matchMedia('(min-width: 72rem)').matches) { return; }
    elCuenta.classList.toggle('is-abierta', si);
    elTira.setAttribute('aria-expanded', si ? 'true' : 'false');
  }

  elTira.addEventListener('click', function () {
    abrir(!elCuenta.classList.contains('is-abierta'));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { abrir(false); }
  });

  document.addEventListener('click', function (e) {
    if (!elCuenta.classList.contains('is-abierta')) { return; }
    if (elCuenta.contains(e.target) || elTira.contains(e.target)) { return; }
    if (e.target.closest && e.target.closest('.it, .ronda')) { return; }
    abrir(false);
  });

  elCuenta.hidden = false;
  elTira.hidden = false;
  pintar();

  /* ====================================================== 2 y 3. HORARIO == */

  /* ------------------------------------------------------------------------
     EL HORARIO VA AQUÍ.
     Minutos desde medianoche. Clave = día (0 = domingo). 1440 = medianoche.
     Mientras esté vacío, la página no dice si está abierto: es preferible no
     decir nada a decir algo que no se sabe.

     Ejemplo con dos turnos, comida y cena:
         2: [[780, 960], [1200, 1440]]   // martes 13:00–16:00 y 20:00–00:00

     Al rellenarlo hay que tocar TRES sitios, y deben coincidir: esta
     constante, la tabla del reverso en index.html y el bloque JSON-LD.
     ---------------------------------------------------------------------- */
  var HORARIO = {
    0: [],   // domingo
    1: [],   // lunes
    2: [],   // martes
    3: [],   // miércoles
    4: [],   // jueves
    5: [],   // viernes
    6: []    // sábado
  };

  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function hayHorario() {
    for (var d in HORARIO) { if (HORARIO[d].length) { return true; } }
    return false;
  }

  function hhmm(min) {
    if (min >= 1440) { return 'medianoche'; }
    return 'las ' + Math.floor(min / 60) + ':' + String(min % 60).padStart(2, '0');
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

  /* ========================================================= 4. EL AÑO ==== */
  var anio = document.getElementById('anio');
  if (anio) { anio.textContent = new Date().getFullYear(); }
})();
