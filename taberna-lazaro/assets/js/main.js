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
  var elTiraT    = document.querySelector('.tira__t');
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
    if (n === 0)     { return ''; }
    if (comer === 0) { return n > 2 ? 'Mucha sed y poca hambre.' : '¿Y de comer, nada?'; }
    if (beber === 0) { return 'Eso pide algo para beber.'; }
    if (n <= 2)      { return 'Por algo se empieza.'; }
    if (n <= 5)      { return 'Eso ya tiene buena pinta.'; }
    if (n <= 9)      { return 'Con eso se sale rodado.'; }
    return 'Con eso resucita cualquiera.';
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
    elTiraT.textContent = n ? 'Lo que te vas a pedir' : 'Ve apuntando lo que te apetezca';
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
    b.addEventListener('click', function () { poner(b.dataset.id, nombre, precio, 1, b.dataset.t); });
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
