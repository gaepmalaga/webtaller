/* ==========================================================================
   Hidrocar — 3 KB de JavaScript, sin dependencias.
   1. Indicador «abierto / cerrado ahora» en hora de Madrid.
   2. Resaltado del día actual en la tabla de horarios.
   3. Año del pie.
   4. Aparición suave de las secciones al hacer scroll.
   Todo es progresivo: sin JS la página funciona igual, solo pierde el aviso
   de si el taller está abierto en este momento.
   ========================================================================== */
(function () {
  'use strict';

  /* Horario del taller en minutos desde medianoche.
     Clave = día según Date#getDay (0 = domingo).
     Si cambia el horario, este es el ÚNICO sitio que hay que tocar
     (y la tabla de index.html, para quien no tenga JS). */
  var HORARIO = {
    0: [],                 // domingo, cerrado
    1: [[570, 1200]],      // lunes     9:30 – 20:00
    2: [[570, 1200]],      // martes
    3: [[570, 1200]],      // miércoles
    4: [[570, 1200]],      // jueves
    5: [[570, 1200]],      // viernes
    6: [[570, 840]]        // sábado    9:30 – 14:00
  };

  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function hhmm(min) {
    return Math.floor(min / 60) + ':' + String(min % 60).padStart(2, '0');
  }

  /* Hora local de Málaga, sea cual sea el reloj del visitante. */
  function ahoraEnMalaga() {
    var partes = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Madrid',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(new Date());

    var p = {};
    partes.forEach(function (x) { p[x.type] = x.value; });

    var idx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var h = parseInt(p.hour, 10) % 24;

    return { dia: idx[p.weekday], min: h * 60 + parseInt(p.minute, 10) };
  }

  function estado(ahora) {
    var tramos = HORARIO[ahora.dia] || [];

    for (var i = 0; i < tramos.length; i++) {
      if (ahora.min >= tramos[i][0] && ahora.min < tramos[i][1]) {
        return {
          abierto: true,
          texto: 'Abierto ahora · cierra a las ' + hhmm(tramos[i][1]),
          corto: 'Abierto · cierra ' + hhmm(tramos[i][1])
        };
      }
      if (ahora.min < tramos[i][0]) {
        return {
          abierto: false,
          texto: 'Cerrado · abre hoy a las ' + hhmm(tramos[i][0]),
          corto: 'Cerrado · abre ' + hhmm(tramos[i][0])
        };
      }
    }

    for (var salto = 1; salto <= 7; salto++) {
      var d = (ahora.dia + salto) % 7;
      var t = HORARIO[d];
      if (t && t.length) {
        var cuando = salto === 1 ? 'mañana' : 'el ' + DIAS[d];
        return {
          abierto: false,
          texto: 'Cerrado · abre ' + cuando + ' a las ' + hhmm(t[0][0]),
          corto: 'Cerrado · abre ' + cuando
        };
      }
    }
    return null;
  }

  /* --- 1 y 2 ------------------------------------------------------------ */
  function pintarEstado() {
    var caja = document.querySelector('[data-status]');
    if (!caja || typeof Intl === 'undefined' || !Intl.DateTimeFormat) return;

    var ahora;
    try { ahora = ahoraEnMalaga(); } catch (e) { return; }
    if (typeof ahora.dia !== 'number') return;

    var e = estado(ahora);
    if (!e) return;

    var largo = caja.querySelector('.status__txt--largo');
    var corto = caja.querySelector('.status__txt--corto');
    if (largo) largo.textContent = e.texto;
    if (corto) corto.textContent = e.corto;
    caja.setAttribute('data-open', e.abierto ? '1' : '0');

    var fila = document.querySelector('.horario tr[data-day="' + ahora.dia + '"]');
    if (fila) fila.setAttribute('data-today', '');
  }

  /* --- 3 ---------------------------------------------------------------- */
  function pintarAno() {
    var el = document.querySelector('[data-year]');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* --- 4 ---------------------------------------------------------------- */
  function revelar() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var objetivos = document.querySelectorAll(
      '.serv__i, .clave, .sint__i, .donde__col, .cierre__in, .sec__intro'
    );
    if (!objetivos.length) return;

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      });

    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    function mostrar(el) {
      el.classList.add('is-in');
      obs.unobserve(el);
    }

    objetivos.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + 'ms';
      obs.observe(el);
    });

    /* Red de seguridad: pase lo que pase con el observador (pestaña en
       segundo plano, captura de pantalla, navegador raro), a los 1,5 s
       todo el contenido queda visible. Nunca se puede quedar oculto. */
    setTimeout(function () {
      objetivos.forEach(mostrar);
    }, 1500);
  }

  function iniciar() {
    pintarEstado();
    pintarAno();
    revelar();
    /* El estado se refresca cada minuto por si alguien deja la pestaña abierta. */
    setInterval(pintarEstado, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
