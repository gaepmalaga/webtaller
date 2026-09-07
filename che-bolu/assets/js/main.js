/* ==========================================================================
   Che Bolú Torremolinos — JavaScript, sin dependencias.
   1. Indicador «abierto / cerrado ahora» en hora de Málaga.
   2. Resaltado del día de hoy en la tabla de horarios.
   3. Año del pie.
   4. Aparición suave de las secciones al hacer scroll.
   Todo es progresivo: sin JS la página funciona igual, solo pierde el aviso
   de si el restaurante está abierto en este momento.
   ========================================================================== */
(function () {
  'use strict';

  /* Horario en minutos desde medianoche. Clave = día (0 = domingo).
     1440 = medianoche del día siguiente.
     Si cambia el horario hay que tocar TRES sitios y deben coincidir:
     esta constante, la tabla de index.html y el bloque JSON-LD del final. */
  var HORARIO = {
    0: [[720, 1020]],    // domingo    12:00 – 17:00
    1: [],               // lunes      cerrado
    2: [[720, 1440]],    // martes     12:00 – 00:00
    3: [[720, 1440]],    // miércoles
    4: [[720, 1440]],    // jueves
    5: [[720, 1440]],    // viernes
    6: [[720, 1440]]     // sábado
  };

  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function hhmm(min) {
    if (min >= 1440) { return 'medianoche'; }
    return 'las ' + Math.floor(min / 60) + ':' + String(min % 60).padStart(2, '0');
  }

  /* Hora local de Málaga, sea cual sea el reloj del visitante. */
  function ahoraEnMalaga() {
    var partes = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Madrid',
      weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());

    var p = {};
    partes.forEach(function (x) { p[x.type] = x.value; });

    var idx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var h = parseInt(p.hour, 10) % 24;

    return { dia: idx[p.weekday], min: h * 60 + parseInt(p.minute, 10) };
  }

  function proximaApertura(dia) {
    for (var i = 1; i <= 7; i++) {
      var d = (dia + i) % 7;
      var t = HORARIO[d];
      if (t && t.length) {
        return (i === 1 ? 'mañana' : 'el ' + DIAS[d]) + ' a ' + hhmm(t[0][0]);
      }
    }
    return null;
  }

  function estado(ahora) {
    var tramos = HORARIO[ahora.dia] || [];

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

  /* --------------------------------------------------- 1. aviso de estado -- */
  var caja = document.getElementById('estado');
  if (caja && window.Intl && Intl.DateTimeFormat) {
    var ahora = ahoraEnMalaga();
    var e = estado(ahora);
    caja.querySelector('.estado__txt').textContent = e.texto;
    caja.classList.add(e.abierto ? 'is-abierto' : 'is-cerrado');
    caja.hidden = false;

    /* --------------------------------------------- 2. día de hoy en tabla -- */
    var fila = document.querySelector('.tabla tr[data-dia="' + ahora.dia + '"]');
    if (fila) { fila.classList.add('hoy'); }
  }

  /* ------------------------------------------------------- 3. año del pie -- */
  var anio = document.getElementById('anio');
  if (anio) { anio.textContent = new Date().getFullYear(); }

  /* ------------------------------------------------ 4. aparición al hacer scroll -- */
  var animar = window.matchMedia('(prefers-reduced-motion: reduce)').matches === false;
  if (animar && 'IntersectionObserver' in window) {
    var objetivos = document.querySelectorAll('.casa__lista > li, .menu__bloque, .tarj, .donde__txt, .donde__lista, .tabla');
    Array.prototype.forEach.call(objetivos, function (el) { el.classList.add('aparece'); });

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add('visible'); obs.unobserve(x.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(objetivos, function (el) { obs.observe(el); });
  }
})();
