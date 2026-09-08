/* ==========================================================================
   Che Bolú Torremolinos — JavaScript sin dependencias.
   1. Cabecera que reacciona al scroll + barra de progreso.
   2. Menú de navegación en móvil.
   3. Navegación activa según la sección visible (web y carta).
   4. Revelado suave de secciones, con red de seguridad.
   5. Cifras que cuentan hacia arriba al aparecer.
   6. Indicador «abierto / cerrado ahora» en hora de Málaga + día de hoy.
   7. Chispas de la brasa en el hero (canvas).
   8. Año del pie.
   Todo es progresivo: sin JS la página funciona, solo pierde los extras.
   ========================================================================== */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------ 1. cabecera + progreso -- */
  var site = document.querySelector('.site');
  var progreso = document.querySelector('.progreso span');
  var tick = false;

  function alScroll() {
    var y = window.pageYOffset;
    if (site) { site.classList.toggle('is-stuck', y > 8); }
    if (progreso) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progreso.style.setProperty('--p', (h > 0 ? (y / h) * 100 : 0) + '%');
    }
    tick = false;
  }
  window.addEventListener('scroll', function () {
    if (!tick) { tick = true; window.requestAnimationFrame(alScroll); }
  }, { passive: true });
  alScroll();

  /* ------------------------------------------------- 2. menú en móvil -- */
  var tog = document.querySelector('.nav__tog');
  var panel = document.getElementById('nav-panel');

  function cierraMenu() {
    if (!tog) { return; }
    tog.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  }
  function esMovil() { return window.matchMedia('(max-width: 60rem)').matches; }

  if (tog && panel) {
    if (esMovil()) { panel.hidden = true; }
    tog.addEventListener('click', function () {
      var abierto = tog.getAttribute('aria-expanded') === 'true';
      tog.setAttribute('aria-expanded', String(!abierto));
      panel.hidden = abierto;
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a') && esMovil()) { cierraMenu(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { cierraMenu(); }
    });
    document.addEventListener('click', function (e) {
      if (esMovil() && !e.target.closest('.nav')) { cierraMenu(); }
    });
    window.addEventListener('resize', function () {
      if (!esMovil()) { panel.hidden = false; }
      else if (tog.getAttribute('aria-expanded') !== 'true') { panel.hidden = true; }
    });
  }

  /* -------------------------------------- 3. navegación activa (spy) -- */
  function spy(enlaces, seccionSel, attr) {
    var mapa = {};
    Array.prototype.forEach.call(enlaces, function (a) {
      var id = a.getAttribute('href').slice(1);
      if (id) { mapa[id] = a; }
    });
    var secciones = document.querySelectorAll(seccionSel);
    if (!secciones.length || !('IntersectionObserver' in window)) { return; }

    var visibles = {};
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (x) {
        visibles[x.target.id] = x.isIntersecting;
      });
      var actual = null;
      Array.prototype.forEach.call(secciones, function (s) {
        if (visibles[s.id]) { actual = s.id; }
      });
      Object.keys(mapa).forEach(function (id) {
        if (id === actual) { mapa[id].setAttribute(attr, 'true'); }
        else { mapa[id].removeAttribute(attr); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Array.prototype.forEach.call(secciones, function (s) { obs.observe(s); });
  }
  spy(document.querySelectorAll('.nav__panel a[href^="#"]'), 'main section[id]', 'aria-current');
  spy(document.querySelectorAll('.carta__tabs a[href^="#"]'), '.grupo[id]', 'aria-current');

  /* -------------------------------------------- 4. revelado al scroll -- */
  if (!reduce && 'IntersectionObserver' in window) {
    var objetivos = document.querySelectorAll('.reveal');

    var obsR = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add('visible'); obsR.unobserve(x.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });

    Array.prototype.forEach.call(objetivos, function (el) { obsR.observe(el); });

    function revelarTodo() {
      Array.prototype.forEach.call(objetivos, function (el) { el.classList.add('visible'); });
    }
    setTimeout(revelarTodo, 2500);
    window.addEventListener('load', function () { setTimeout(revelarTodo, 400); });
  }

  /* --------------------------------------------- 5. cifras que suben -- */
  var cifras = document.querySelectorAll('.num[data-n]');
  if (cifras.length && 'IntersectionObserver' in window) {
    var obsC = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (x) {
        if (!x.isIntersecting) { return; }
        obsC.unobserve(x.target);
        anima(x.target);
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(cifras, function (el) { obsC.observe(el); });
  }

  function fmt(n, dec) {
    return n.toLocaleString('es-ES', {
      minimumFractionDigits: dec, maximumFractionDigits: dec
    });
  }
  function anima(el) {
    var fin = parseFloat(el.getAttribute('data-n'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (reduce) { el.textContent = fmt(fin, dec); return; }
    /* Arranca cerca del objetivo: así nunca se lee de pasada un número
       falso y alarmante (una nota de «0,2», «205 opiniones»…). */
    var ini = dec > 0 ? Math.max(0, fin - 1) : fin * (fin > 100 ? 0.72 : 0.2);
    var t0 = null;
    var dur = 1000;
    function paso(t) {
      if (t0 === null) { t0 = t; }
      var p = Math.min((t - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(ini + (fin - ini) * e, dec);
      if (p < 1) { window.requestAnimationFrame(paso); }
      else { el.textContent = fmt(fin, dec); }
    }
    window.requestAnimationFrame(paso);
  }

  /* ---------------------------------------- 6. abierto / cerrado ahora -- */
  /* Horario en minutos desde medianoche. Clave = día (0 = domingo).
     1440 = medianoche del día siguiente. Si cambia el horario hay que
     tocar TRES sitios: esta constante, la tabla de index.html y el
     bloque JSON-LD del final de index.html. */
  var HORARIO = {
    0: [[720, 1020]],   // domingo    12:00 – 17:00
    1: [],              // lunes      cerrado
    2: [[720, 1440]],   // martes     12:00 – 00:00
    3: [[720, 1440]],   // miércoles
    4: [[720, 1440]],   // jueves
    5: [[720, 1440]],   // viernes
    6: [[720, 1440]]    // sábado
  };
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function hhmm(min) {
    if (min >= 1440) { return 'medianoche'; }
    return 'las ' + Math.floor(min / 60) + ':' + String(min % 60).padStart(2, '0');
  }
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

  if (window.Intl && Intl.DateTimeFormat) {
    var ahora = ahoraEnMalaga();
    var e = estado(ahora);
    Array.prototype.forEach.call(document.querySelectorAll('.estado'), function (caja) {
      var tx = caja.querySelector('.estado__tx');
      if (tx) { tx.textContent = e.texto; }
      caja.classList.add(e.abierto ? 'is-abierto' : 'is-cerrado');
      caja.hidden = false;
    });
    var fila = document.querySelector('.tabla tr[data-dia="' + ahora.dia + '"]');
    if (fila) { fila.classList.add('hoy'); }
  }

  /* --------------------------------------- 7. chispas de la brasa -- */
  var lienzo = document.querySelector('.hero__brasa');
  if (lienzo && !reduce && lienzo.getContext) {
    var ctx = lienzo.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, chispas = [];

    function medir() {
      var r = lienzo.getBoundingClientRect();
      W = r.width; H = r.height;
      lienzo.width = W * dpr; lienzo.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(W, 900) / 16);
      chispas = [];
      for (var i = 0; i < n; i++) { chispas.push(nueva(true)); }
    }
    function nueva(inicial) {
      return {
        x: Math.random() * W,
        y: inicial ? Math.random() * H : H + 10,
        r: 0.6 + Math.random() * 1.8,
        v: 0.15 + Math.random() * 0.7,
        drift: (Math.random() - 0.5) * 0.35,
        a: 0.15 + Math.random() * 0.5,
        t: Math.random() * 6.28
      };
    }
    var corriendo = true;
    function pinta() {
      if (!corriendo) { return; }
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < chispas.length; i++) {
        var c = chispas[i];
        c.y -= c.v;
        c.x += c.drift + Math.sin(c.t) * 0.2;
        c.t += 0.02;
        if (c.y < -10) { chispas[i] = nueva(false); continue; }
        var vida = c.y / H;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(' + (c.r > 1.4 ? '255,180,80' : '240,110,60') + ',' + (c.a * vida) + ')';
        ctx.fill();
      }
      window.requestAnimationFrame(pinta);
    }
    medir();
    pinta();
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(medir, 200);
    }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      corriendo = !document.hidden;
      if (corriendo) { window.requestAnimationFrame(pinta); }
    });
  }

  /* --------------------------------------------------- 8. año del pie -- */
  var anio = document.getElementById('anio');
  if (anio) { anio.textContent = new Date().getFullYear(); }
})();
