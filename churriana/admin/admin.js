/* ==========================================================================
   Panel de La Taberna de Churriana.

   Lee datos/contenido.json del repositorio, deja tocarlo, y al publicar lo
   sube —con las fotos— en un solo commit. GitHub Pages reconstruye la web.
   No hay servidor: la llave se guarda en este navegador y solo viaja a GitHub.
   ========================================================================== */
(function () {
  'use strict';

  var API = 'https://api.github.com';
  var RUTA = 'churriana/datos/contenido.json';
  var RUTA_FOTOS = 'churriana/assets/img/platos/';

  var $ = function (s) { return document.querySelector(s); };
  function el(t, c, x) {
    var e = document.createElement(t);
    if (c) { e.className = c; }
    if (x != null) { e.textContent = x; }
    return e;
  }
  function icono(id, clase) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    if (clase) { s.setAttribute('class', clase); }
    s.setAttribute('viewBox', '0 0 24 24');
    var u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    u.setAttribute('href', '#' + id);
    s.appendChild(u);
    return s;
  }

  /* La llave es del repositorio, no de una taberna: los dos paneles la
     comparten y así solo se entra una vez. 'tl_…' era la de antes. */
  var llave = localStorage.getItem('wt_llave') || localStorage.getItem('tl_llave') || '';
  var repo = localStorage.getItem('wt_repo') || localStorage.getItem('tl_repo') || 'gaepmalaga/webtaller';
  var rama = '';
  var datos = null;
  var original = '';
  var fotosNuevas = {};
  var fotosBorradas = {};   /* las que había y se han quitado: se borran del repositorio */
  var fotosDelRepo = {};    /* las que ya estaban al cargar */
  var sucio = false;
  var filtro = '';

  /* ------------------------------------------------------------- GitHub -- */
  function api(ruta, opciones) {
    opciones = opciones || {};
    opciones.headers = Object.assign({
      Authorization: 'Bearer ' + llave,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }, opciones.headers || {});
    return fetch(API + ruta, opciones).then(function (r) {
      if (!r.ok) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          var m = j.message || ('HTTP ' + r.status);
          if (r.status === 401) { m = 'La llave no vale o ha caducado.'; }
          if (r.status === 403) { m = 'La llave no tiene permiso de escritura sobre el repositorio.'; }
          if (r.status === 404) { m = 'No se encuentra el repositorio (¿la llave tiene acceso?).'; }
          throw new Error(m);
        });
      }
      return r.status === 204 ? null : r.json();
    });
  }

  /* btoa() solo entiende latin-1 y aquí hay acentos a puñados. */
  function aBase64(texto) {
    var bytes = new TextEncoder().encode(texto), bin = '';
    for (var i = 0; i < bytes.length; i++) { bin += String.fromCharCode(bytes[i]); }
    return btoa(bin);
  }
  function deBase64(b64) {
    var bin = atob(b64.replace(/\s/g, '')), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) { bytes[i] = bin.charCodeAt(i); }
    return new TextDecoder().decode(bytes);
  }

  /* -------------------------------------------------------------- avisos -- */
  function aviso(texto, tipo) {
    var a = el('div', 'aviso-t' + (tipo ? ' is-' + tipo : ''));
    a.appendChild(icono(tipo === 'mal' ? 'i-aviso' : 'i-ok'));
    a.appendChild(el('span', null, texto));
    $('#avisos').appendChild(a);
    setTimeout(function () { a.remove(); }, 3600);
  }

  /* ------------------------------------------------------------- entrar -- */
  function entrar() {
    var recado = $('#recado-entrar');
    llave = $('#llave').value.trim();
    repo = $('#repo').value.trim();
    if (!llave) { recado.textContent = 'Falta la llave.'; recado.className = 'recado is-mal'; return; }
    recado.textContent = 'Comprobando…'; recado.className = 'recado';
    arrancar().catch(function (e) { recado.textContent = e.message; recado.className = 'recado is-mal'; });
  }

  function arrancar() {
    return api('/repos/' + repo).then(function (r) {
      rama = r.default_branch;
      localStorage.setItem('wt_llave', llave);
      localStorage.setItem('wt_repo', repo);
      return api('/repos/' + repo + '/contents/' + RUTA + '?ref=' + rama);
    }).then(function (f) {
      datos = JSON.parse(deBase64(f.content));
      original = JSON.stringify(datos);
      fotosDelRepo = {};
      datos.grupos.forEach(function (g) {
        g.platos.forEach(function (x) { if (x.foto) { fotosDelRepo[RUTA_FOTOS + x.id + '.jpg'] = true; } });
      });
      $('#pantalla-entrar').hidden = true;
      $('#pantalla-panel').hidden = false;
      $('#estado-conexion').textContent = repo + ' · ' + rama;
      menuMovil();
      todo();
    });
  }

  /* ------------------------------------------------------------- cambios -- */
  function toco() {
    sucio = JSON.stringify(datos) !== original
      || Object.keys(fotosNuevas).length > 0
      || Object.keys(fotosBorradas).length > 0;
    $('#guardar').disabled = !sucio;
    $('#descartar').hidden = !sucio;
    var p = $('#pastilla');
    p.textContent = sucio ? 'Cambios sin publicar' : 'Todo publicado';
    p.className = 'pastilla' + (sucio ? ' is-sucio' : '');
    pintarAvisosMenu();
  }

  /* Cuántas cosas faltan, para el globito del menú y el resumen. */
  function pendientes() {
    var n = datos.negocio, falta = [];
    if (!n.telefono) { falta.push(['datos', 'El teléfono', 'Sin él no se puede llamar ni reservar desde la web, y Google no lo enseña.']); }
    if (!n.correo) { falta.push(['datos', 'El correo', 'Hace falta para el aviso legal.']); }
    if (!Object.keys(datos.horario).some(function (k) { return datos.horario[k] && datos.horario[k].length; })) {
      falta.push(['horario', 'El horario', 'Al ponerlo se enciende el aviso de «abierto ahora» y se lo contamos a Google.']);
    }
    var conFoto = 0, total = 0;
    datos.grupos.forEach(function (g) { g.platos.forEach(function (p) { total++; if (p.foto) { conFoto++; } }); });
    if (conFoto < 5) { falta.push(['carta', 'Fotos de los platos', 'Hay ' + conFoto + ' de ' + total + '. Con cinco o seis buenas la carta cambia por completo.']); }
    return falta;
  }

  function pintarAvisosMenu() {
    var cuenta = {};
    pendientes().forEach(function (f) { cuenta[f[0]] = (cuenta[f[0]] || 0) + 1; });
    document.querySelectorAll('.menu__i').forEach(function (b) {
      var g = b.querySelector('.globo');
      var n = cuenta[b.dataset.ir];
      if (n) {
        if (!g) { g = el('span', 'globo'); b.appendChild(g); }
        g.textContent = n;
      } else if (g) { g.remove(); }
    });
  }

  /* ===================================================== 1. RESUMEN ====== */
  var TITULOS = {
    resumen: ['Resumen', 'Cómo está la web ahora mismo'],
    carta: ['La carta', ''],
    frases: ['Frases', 'Todo lo que dice la web, en su sitio'],
    horario: ['Horario', 'De aquí salen la tabla, el aviso de «abierto ahora» y lo que lee Google'],
    datos: ['Datos', 'El local, su contacto y el estado de la web']
  };

  function pintarResumen() {
    var hoja = $('#hoja-resumen');
    hoja.textContent = '';

    var falta = pendientes();
    var fichas = el('div', 'fichas');

    if (!falta.length) {
      var ok = el('div', 'ficha is-bien');
      ok.appendChild(icono('i-ok'));
      var c = el('div');
      c.appendChild(el('b', null, 'No falta nada'));
      c.appendChild(el('span', null, 'Todos los datos están puestos. Ya puedes quitar la franja de borrador en Datos.'));
      ok.appendChild(c);
      fichas.appendChild(ok);
    }

    falta.forEach(function (f) {
      var x = el('div', 'ficha is-falta');
      x.appendChild(icono('i-aviso'));
      var c = el('div');
      c.appendChild(el('b', null, 'Falta ' + f[1].toLowerCase()));
      c.appendChild(el('span', null, f[2]));
      var b = el('button', 'btn btn--llano', 'Ponerlo');
      b.type = 'button';
      b.addEventListener('click', function () { ir(f[0]); });
      c.appendChild(b);
      x.appendChild(c);
      fichas.appendChild(x);
    });
    hoja.appendChild(fichas);

    /* --- estado de publicación --- */
    var t = el('div', 'tarjeta');
    t.appendChild(tituloTarjeta('Estado de la web'));
    var l = el('label', 'inter');
    var i = el('input'); i.type = 'checkbox'; i.checked = !datos.borrador;
    var p = el('span', 'inter__p');
    i.addEventListener('change', function () { datos.borrador = !i.checked; toco(); pintarResumen(); pintarDatos(); });
    l.appendChild(i); l.appendChild(p);
    l.appendChild(el('span', 'inter__t', datos.borrador
      ? 'Es un borrador: sale la franja de aviso y Google no la indexa'
      : 'Publicada de verdad: sin franja y visible en Google'));
    t.appendChild(l);
    hoja.appendChild(t);

    /* --- de un vistazo --- */
    var r = el('div', 'tarjeta');
    r.appendChild(tituloTarjeta('De un vistazo'));
    var platos = 0, fotos = 0;
    datos.grupos.forEach(function (g) { g.platos.forEach(function (x) { platos++; if (x.foto) { fotos++; } }); });
    var cif = el('div', 'cifras');
    [[platos, 'platos en la carta'], [datos.grupos.length, 'secciones'], [fotos, 'con foto']].forEach(function (c) {
      var x = el('div', 'cifra');
      x.appendChild(el('div', 'cifra__v', String(c[0])));
      x.appendChild(el('div', 'cifra__e', c[1]));
      cif.appendChild(x);
    });
    cif.style.margin = '0';
    r.appendChild(cif);
    hoja.appendChild(r);
  }

  function tituloTarjeta(texto, extra) {
    var h = el('h3', 'tarjeta__t');
    h.appendChild(el('span', null, texto));
    if (extra) { h.appendChild(el('span', 'n', extra)); }
    return h;
  }

  /* ======================================================= 2. LA CARTA === */
  function pintarCarta() {
    var hoja = $('#hoja-carta');
    hoja.textContent = '';

    var platos = datos.grupos.reduce(function (n, g) { return n + g.platos.length; }, 0);
    TITULOS.carta[1] = platos + ' platos en ' + datos.grupos.length + ' secciones';
    if ($('#hoja-carta').hidden === false) { $('#tope-s').textContent = TITULOS.carta[1]; }

    var buscar = el('div', 'buscar');
    buscar.appendChild(icono('i-lupa'));
    var inp = el('input');
    inp.type = 'search'; inp.placeholder = 'Buscar un plato…'; inp.value = filtro;
    inp.addEventListener('input', function () { filtro = inp.value; pintarCarta(); $('#hoja-carta input[type=search]').focus(); });
    buscar.appendChild(inp);
    hoja.appendChild(buscar);

    var busca = filtro.trim().toLowerCase();
    var algo = false;

    datos.grupos.forEach(function (g) {
      var visibles = g.platos.filter(function (p) {
        return !busca || p.nombre.toLowerCase().indexOf(busca) !== -1;
      });
      if (busca && !visibles.length) { return; }
      algo = true;

      var t = el('div', 'tarjeta');
      t.appendChild(tituloTarjeta(g.titulo, g.platos.length + ' platos'));
      g.platos.forEach(function (p, pi) {
        if (busca && visibles.indexOf(p) === -1) { return; }
        t.appendChild(filaPlato(g, p, pi));
      });

      if (!busca) {
        var mas = el('button', 'anadir', '＋ Añadir plato');
        mas.type = 'button';
        mas.addEventListener('click', function () {
          g.platos.push({ id: 'nuevo-' + Date.now().toString(36), nombre: '', precio: 0, foto: '' });
          toco(); pintarCarta();
        });
        t.appendChild(mas);
      }
      hoja.appendChild(t);
    });

    if (!algo) {
      var v = el('div', 'tarjeta vacio');
      v.appendChild(icono('i-lupa'));
      v.appendChild(el('p', null, 'Ningún plato se llama así.'));
      hoja.appendChild(v);
    }
  }

  function filaPlato(g, p, pi) {
    var fila = el('div', 'plato');

    /* --- la foto --- */
    var ranura = el('label', 'ranura' + (p.foto ? ' is-puesta' : ''));
    ranura.title = p.foto ? 'Cambiar la foto' : 'Subir una foto';
    if (p.foto) {
      var img = el('img'); img.alt = '';
      var pendiente = fotosNuevas[RUTA_FOTOS + p.id + '.jpg'];
      img.src = pendiente ? 'data:image/jpeg;base64,' + pendiente : '../' + p.foto + '?t=' + Date.now();
      ranura.appendChild(img);
      var quita = el('button', 'ranura__quita', '✕');
      quita.type = 'button'; quita.title = 'Quitar la foto';
      quita.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var ruta = RUTA_FOTOS + p.id + '.jpg';
        delete fotosNuevas[ruta];
        /* Si la foto ya estaba subida, se borra también del repositorio: si no,
           quedaría ahí ocupando sitio para siempre. */
        if (fotosDelRepo[ruta]) { fotosBorradas[ruta] = true; }
        p.foto = ''; toco(); pintarCarta();
      });
      ranura.appendChild(quita);
    } else {
      ranura.appendChild(icono('i-camara'));
    }
    var file = el('input');
    file.type = 'file'; file.accept = 'image/*';
    file.addEventListener('change', function () {
      if (!file.files[0]) { return; }
      encoger(file.files[0]).then(function (b64) {
        fotosNuevas[RUTA_FOTOS + p.id + '.jpg'] = b64;
        delete fotosBorradas[RUTA_FOTOS + p.id + '.jpg'];
        p.foto = 'assets/img/platos/' + p.id + '.jpg';
        toco(); pintarCarta();
        aviso('Foto lista. Se sube al publicar.', 'bien');
      }).catch(function (e) { aviso('No se ha podido leer la foto: ' + e.message, 'mal'); });
    });
    ranura.appendChild(file);
    fila.appendChild(ranura);

    var n = el('input', 'nombre');
    n.value = p.nombre; n.placeholder = 'Nombre del plato';
    n.addEventListener('input', function () { p.nombre = n.value; toco(); });
    fila.appendChild(n);

    var caja = el('div', 'precio');
    var pr = el('input');
    pr.type = 'number'; pr.step = '0.10'; pr.min = '0'; pr.value = Number(p.precio).toFixed(2);
    pr.addEventListener('input', function () { p.precio = parseFloat(pr.value) || 0; toco(); });
    caja.appendChild(pr);
    fila.appendChild(caja);

    var acc = el('div', 'acciones');
    acc.appendChild(mini('↑', 'Subir', function () {
      if (pi === 0) { return; }
      g.platos.splice(pi - 1, 0, g.platos.splice(pi, 1)[0]); toco(); pintarCarta();
    }));
    acc.appendChild(mini('↓', 'Bajar', function () {
      if (pi === g.platos.length - 1) { return; }
      g.platos.splice(pi + 1, 0, g.platos.splice(pi, 1)[0]); toco(); pintarCarta();
    }));
    acc.appendChild(mini('✕', 'Quitar de la carta', function () {
      if (!confirm('¿Quitar «' + (p.nombre || 'este plato') + '» de la carta?')) { return; }
      g.platos.splice(pi, 1); toco(); pintarCarta();
    }, 'mini--mal'));
    fila.appendChild(acc);
    return fila;
  }

  function mini(texto, titulo, fn, extra) {
    var b = el('button', 'mini' + (extra ? ' ' + extra : ''), texto);
    b.type = 'button'; b.title = titulo; b.setAttribute('aria-label', titulo);
    b.addEventListener('click', fn);
    return b;
  }

  /* La foto se encoge en el propio móvil: una de cámara son 4 MB y en la
     carta se ve a 40 píxeles. */
  function encoger(archivo) {
    return new Promise(function (ok, mal) {
      var img = new Image();
      img.onload = function () {
        var LADO = 800;
        var e = Math.min(1, LADO / Math.max(img.width, img.height));
        var w = Math.round(img.width * e), h = Math.round(img.height * e);
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        var url = c.toDataURL('image/jpeg', 0.82);
        URL.revokeObjectURL(img.src);
        ok(url.split(',')[1]);
      };
      img.onerror = function () { mal(new Error('formato no reconocido')); };
      img.src = URL.createObjectURL(archivo);
    });
  }

  /* ======================================================== 3. FRASES ==== */
  /* Agrupadas por el sitio de la web donde salen, que es como se buscan. */
  var FRASES = [
    ['La portada', [
      ['lema', 'El lema grande', 'Un salto de línea = una línea nueva.'],
      ['tapaPie', 'La línea pequeña de abajo', ''],
      ['tapaAbrir', 'El botón de bajar a la carta', '']
    ]],
    ['La presentación', [
      ['introSobre', 'Título pequeño', ''],
      ['introUno', 'Párrafo grande', 'Admite <b>negrita</b>.'],
      ['introDos', 'Párrafo pequeño', 'Admite <b>negrita</b>.']
    ]],
    ['«Por dónde empezar»', [
      ['empezarTitulo', 'Título', ''],
      ['empezarSub', 'Entradilla', ''],
      ['empezarPie', 'Nota del final', '']
    ]],
    ['La carta', [
      ['cartaTitulo', 'Título', ''],
      ['cartaModo', 'Cómo funciona la lista', ''],
      ['cartaIva', 'Nota del IVA', '']
    ]],
    ['La lista de lo que te vas a pedir', [
      ['listaTitulo', 'Título', 'Que no suene a que se está pidiendo de verdad.'],
      ['listaSub', 'Subtítulo', ''],
      ['listaVacia', 'Cuando está vacía · línea 1', ''],
      ['listaVaciaDos', 'Cuando está vacía · línea 2', ''],
      ['listaTotal', 'Rótulo de la suma', ''],
      ['listaBorrar', 'Botón de borrar', ''],
      ['listaNota', 'El aviso del recuadro', 'El que deja claro que no se pide nada.'],
      ['tiraVacia', 'Barra del móvil · vacía', ''],
      ['tiraLlena', 'Barra del móvil · con cosas', '']
    ]],
    ['El reverso', [
      ['dorsoTitulo', 'Título', ''],
      ['avisarTexto', 'Reservas', ''],
      ['avisarMin', 'Nota de la barra', '']
    ]],
    ['La despedida', [
      ['fin', 'La frase del final', 'Salto de línea = línea nueva. <em>…</em> para cursiva.']
    ]]
  ];

  var COMENTARIOS = [
    ['soloBeberPoco', 'Si solo hay bebida (1 o 2 cosas)'],
    ['soloBeberMucho', 'Si solo hay bebida (3 o más)'],
    ['soloComer', 'Si solo hay comida'],
    ['dos', 'Con 1 o 2 cosas'],
    ['cinco', 'Con 3 a 5'],
    ['nueve', 'Con 6 a 9'],
    ['muchos', 'Con 10 o más']
  ];

  function pintarFrases() {
    var hoja = $('#hoja-frases');
    hoja.textContent = '';

    FRASES.forEach(function (bloque) {
      var t = el('div', 'tarjeta');
      t.appendChild(tituloTarjeta(bloque[0]));
      bloque[1].forEach(function (f) {
        if (!(f[0] in datos.textos)) { return; }
        t.appendChild(campo(f[1], datos.textos[f[0]], f[2], function (v) {
          datos.textos[f[0]] = v; toco();
        }, datos.textos[f[0]].length > 55));
      });
      hoja.appendChild(t);
    });

    var c = el('div', 'tarjeta');
    c.appendChild(tituloTarjeta('Lo que dice la lista según lo que lleves'));
    c.appendChild(el('p', 'tarjeta__d', 'El comentario mira QUÉ ha cogido la gente, no cuánto suma.'));
    COMENTARIOS.forEach(function (f) {
      c.appendChild(campo(f[1], datos.comentarios[f[0]] || '', '', function (v) {
        datos.comentarios[f[0]] = v; toco();
      }));
    });
    hoja.appendChild(c);

    var e = el('div', 'tarjeta');
    e.appendChild(tituloTarjeta('Las tres propuestas de «por dónde empezar»'));
    e.appendChild(el('p', 'tarjeta__d', 'El precio de cada una lo calcula sola la web con los precios de la carta, así que nunca se queda desfasado.'));
    datos.escenarios.forEach(function (x, i) {
      var r = el('div', 'rejilla2');
      r.appendChild(campo('Propuesta ' + (i + 1), x.nombre, '', function (v) { x.nombre = v; toco(); }));
      r.appendChild(campo('Qué lleva (identificadores)', JSON.stringify(x.lleva),
        'Pares de plato y cantidad.', function (v) {
          try { x.lleva = JSON.parse(v); toco(); } catch (err) { /* mientras se escribe */ }
        }));
      e.appendChild(r);
      e.appendChild(campo('Cómo se cuenta', x.descripcion, '', function (v) { x.descripcion = v; toco(); }, true));
    });
    hoja.appendChild(e);
  }

  function campo(etiqueta, valor, pista, alCambiar, grande) {
    var l = el('label', 'campo');
    var s = el('span', 'campo__et', etiqueta);
    if (pista) { s.appendChild(el('span', 'campo__p', pista)); }
    l.appendChild(s);
    var i = el(grande ? 'textarea' : 'input');
    i.value = valor;
    i.addEventListener('input', function () { alCambiar(i.value); });
    l.appendChild(i);
    return l;
  }

  /* ======================================================= 4. HORARIO ==== */
  var DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var ORDEN = [1, 2, 3, 4, 5, 6, 0];
  var hhmm = function (m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  var min = function (s) { var p = s.split(':'); return (+p[0]) * 60 + (+p[1]); };

  function pintarHorario() {
    var hoja = $('#hoja-horario');
    hoja.textContent = '';
    var t = el('div', 'tarjeta');
    t.appendChild(tituloTarjeta('Los siete días'));

    ORDEN.forEach(function (d) {
      var tramos = datos.horario[String(d)];
      var abierto = !!(tramos && tramos.length);
      var fila = el('div', 'dia');

      var izq = el('div');
      izq.style.display = 'grid'; izq.style.gap = '0.3rem';
      izq.appendChild(el('b', null, DIAS[d]));
      var l = el('label', 'inter');
      var chk = el('input'); chk.type = 'checkbox'; chk.checked = abierto;
      chk.addEventListener('change', function () {
        datos.horario[String(d)] = chk.checked ? [[720, 1440]] : null;
        toco(); pintarHorario();
      });
      l.appendChild(chk); l.appendChild(el('span', 'inter__p'));
      izq.appendChild(l);
      fila.appendChild(izq);

      var caja = el('div', 'tramos');
      if (!abierto) {
        caja.appendChild(el('span', 'cerrado-txt', 'Cerrado'));
      } else {
        tramos.forEach(function (tr, ti) {
          var de = el('input'); de.type = 'time'; de.value = hhmm(tr[0]);
          var a = el('input'); a.type = 'time'; a.value = hhmm(tr[1] >= 1440 ? 1439 : tr[1]);
          de.addEventListener('change', function () { tr[0] = min(de.value); toco(); pintarHorario(); });
          a.addEventListener('change', function () {
            /* Cerrar a las 00:00 es medianoche del día siguiente, no las cero horas. */
            var v = min(a.value); tr[1] = v === 0 ? 1440 : v; toco(); pintarHorario();
          });
          caja.appendChild(de);
          caja.appendChild(el('span', 'flecha', '→'));
          caja.appendChild(a);
          if (ti === 1) {
            caja.appendChild(mini('✕', 'Quitar el segundo turno', function () {
              tramos.splice(1, 1); toco(); pintarHorario();
            }, 'mini--mal'));
          }
        });
        if (tramos.length === 1) {
          caja.appendChild(mini('＋', 'Partir en dos turnos', function () {
            tramos.push([1200, 1440]); toco(); pintarHorario();
          }));
        }
      }
      fila.appendChild(caja);
      t.appendChild(fila);
    });

    var hay = ORDEN.some(function (d) { return datos.horario[String(d)] && datos.horario[String(d)].length; });
    var pre = el('div', 'previo');
    if (hay) {
      pre.appendChild(document.createTextNode('En la web saldrá la tabla, y arriba la chapa de '));
      pre.appendChild(el('b', null, '«abierto ahora»'));
      pre.appendChild(document.createTextNode(' calculada en hora de Málaga. Google se entera solo.'));
    } else {
      pre.textContent = 'Mientras no haya ningún día abierto, la web no dice si está abierto: prefiere callarse a inventar.';
    }
    t.appendChild(pre);
    hoja.appendChild(t);
  }

  /* ========================================================= 5. DATOS ==== */
  var DATOS_LOCAL = [
    ['telefono', 'Teléfono', 'Enciende los enlaces de llamar y se lo decimos a Google.'],
    ['correo', 'Correo', 'Obligatorio para el aviso legal.'],
    ['instagram', 'Instagram', 'Solo el nombre, sin arroba.'],
    ['aparcamiento', 'Aparcamiento', 'Vacío = sale marcado como pendiente.'],
    ['calle', 'Calle y número', ''],
    ['barrio', 'Barrio', ''],
    ['cp', 'Código postal', ''],
    ['ciudad', 'Ciudad', ''],
    ['metro', 'Cómo llegar en metro', ''],
    ['mapa', 'Enlace de Google Maps', '']
  ];

  function pintarDatos() {
    var hoja = $('#hoja-datos');
    hoja.textContent = '';

    var t = el('div', 'tarjeta');
    t.appendChild(tituloTarjeta('Contacto'));
    var r1 = el('div', 'rejilla2');
    DATOS_LOCAL.slice(0, 4).forEach(function (f) {
      r1.appendChild(campo(f[1], datos.negocio[f[0]] || '', f[2], function (v) { datos.negocio[f[0]] = v; toco(); pintarResumen(); }));
    });
    t.appendChild(r1);
    hoja.appendChild(t);

    var d = el('div', 'tarjeta');
    d.appendChild(tituloTarjeta('Dónde está'));
    var r2 = el('div', 'rejilla2');
    DATOS_LOCAL.slice(4).forEach(function (f) {
      r2.appendChild(campo(f[1], datos.negocio[f[0]] || '', f[2], function (v) { datos.negocio[f[0]] = v; toco(); }));
    });
    d.appendChild(r2);
    hoja.appendChild(d);

    var e = el('div', 'tarjeta');
    e.appendChild(tituloTarjeta('Estado'));
    var l = el('label', 'inter');
    var i = el('input'); i.type = 'checkbox'; i.checked = !datos.borrador;
    i.addEventListener('change', function () { datos.borrador = !i.checked; toco(); pintarDatos(); pintarResumen(); });
    l.appendChild(i); l.appendChild(el('span', 'inter__p'));
    l.appendChild(el('span', 'inter__t', datos.borrador
      ? 'Borrador: con franja de aviso y fuera de Google'
      : 'Publicada: sin franja y visible en Google'));
    e.appendChild(l);
    hoja.appendChild(e);
  }

  /* ======================================================== GUARDAR ====== */
  function guardar() {
    $('#velo').hidden = false;
    $('#ruleta').hidden = false;
    $('#velo-cerrar').hidden = true;
    $('#velo-t').textContent = 'Publicando…';
    var paso = function (t) { $('#velo-p').textContent = t; };

    var archivos = [{ ruta: RUTA, contenido: aBase64(JSON.stringify(datos, null, 2) + '\n') }];
    Object.keys(fotosNuevas).forEach(function (r) { archivos.push({ ruta: r, contenido: fotosNuevas[r] }); });
    paso('Subiendo ' + archivos.length + (archivos.length === 1 ? ' archivo' : ' archivos') + '…');

    var baseSha, treeSha;
    api('/repos/' + repo + '/git/ref/heads/' + rama)
      .then(function (r) { baseSha = r.object.sha; return api('/repos/' + repo + '/git/commits/' + baseSha); })
      .then(function (c) {
        treeSha = c.tree.sha;
        return Promise.all(archivos.map(function (a) {
          return api('/repos/' + repo + '/git/blobs', {
            method: 'POST', body: JSON.stringify({ content: a.contenido, encoding: 'base64' })
          }).then(function (b) { return { path: a.ruta, mode: '100644', type: 'blob', sha: b.sha }; });
        })).then(function (entradas) {
          /* `sha: null` en el árbol es como se borra un archivo. */
          Object.keys(fotosBorradas).forEach(function (r) {
            entradas.push({ path: r, mode: '100644', type: 'blob', sha: null });
          });
          return entradas;
        });
      })
      .then(function (entradas) {
        paso('Montando el cambio…');
        return api('/repos/' + repo + '/git/trees', {
          method: 'POST', body: JSON.stringify({ base_tree: treeSha, tree: entradas })
        });
      })
      .then(function (t) {
        var n = Object.keys(fotosNuevas).length;
        var q = Object.keys(fotosBorradas).length;
        var detalle = [];
        if (n) { detalle.push(n + (n === 1 ? ' foto nueva' : ' fotos nuevas')); }
        if (q) { detalle.push(q + (q === 1 ? ' foto quitada' : ' fotos quitadas')); }
        return api('/repos/' + repo + '/git/commits', {
          method: 'POST',
          body: JSON.stringify({
            message: 'La Taberna de Churriana: cambios desde el panel' + (detalle.length ? ' (' + detalle.join(', ') + ')' : ''),
            tree: t.sha, parents: [baseSha]
          })
        });
      })
      .then(function (c) {
        paso('Guardado. La web se reconstruye sola…');
        return api('/repos/' + repo + '/git/refs/heads/' + rama, {
          method: 'PATCH', body: JSON.stringify({ sha: c.sha })
        });
      })
      .then(function () {
        Object.keys(fotosNuevas).forEach(function (r) { fotosDelRepo[r] = true; });
        Object.keys(fotosBorradas).forEach(function (r) { delete fotosDelRepo[r]; });
        fotosNuevas = {}; fotosBorradas = {};
        original = JSON.stringify(datos);
        toco();
        $('#ruleta').hidden = true;
        $('#velo-t').textContent = '¡Publicado!';
        paso('GitHub está reconstruyendo la web. Suele tardar un minuto.');
        $('#velo-cerrar').hidden = false;
        pintarCarta();
      })
      .catch(function (e) {
        $('#ruleta').hidden = true;
        $('#velo-t').textContent = 'No se ha podido publicar';
        paso(e.message + '\n\nNo se ha perdido nada: los cambios siguen aquí.');
        $('#velo-cerrar').hidden = false;
      });
  }

  /* ========================================================= NAVEGAR ===== */
  function ir(seccion) {
    document.querySelectorAll('[data-ir]').forEach(function (b) {
      b.classList.toggle('is-aqui', b.dataset.ir === seccion);
    });
    document.querySelectorAll('.hoja').forEach(function (h) { h.hidden = h.id !== 'hoja-' + seccion; });
    $('#tope-t').textContent = TITULOS[seccion][0];
    $('#tope-s').textContent = TITULOS[seccion][1];
    if (seccion === 'resumen') { pintarResumen(); }
    scrollTo(0, 0);
  }

  function menuMovil() {
    if ($('.menu-movil')) { return; }
    var m = el('nav', 'menu-movil');
    document.querySelectorAll('#menu .menu__i').forEach(function (b) {
      var c = el('button');
      c.type = 'button'; c.dataset.ir = b.dataset.ir;
      c.className = b.className.replace('menu__i', '').trim();
      c.appendChild(icono(b.querySelector('use').getAttribute('href').slice(1)));
      c.appendChild(el('span', null, b.querySelector('span').textContent));
      m.appendChild(c);
    });
    document.body.appendChild(m);
  }

  function todo() { pintarResumen(); pintarCarta(); pintarFrases(); pintarHorario(); pintarDatos(); toco(); ir('resumen'); }

  /* --------------------------------------------------------- arranque --- */
  $('#conectar').addEventListener('click', entrar);
  $('#llave').addEventListener('keydown', function (e) { if (e.key === 'Enter') { entrar(); } });
  $('#guardar').addEventListener('click', guardar);
  $('#velo-cerrar').addEventListener('click', function () {
    $('#velo').hidden = true;
    aviso('Publicado. En un minuto se ve en la web.', 'bien');
  });
  $('#descartar').addEventListener('click', function () {
    if (!confirm('¿Descartar todos los cambios sin publicar?')) { return; }
    datos = JSON.parse(original); fotosNuevas = {}; fotosBorradas = {}; todo();
    aviso('Cambios descartados.', 'bien');
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ir]');
    if (b) { ir(b.dataset.ir); }
  });
  addEventListener('beforeunload', function (e) { if (sucio) { e.preventDefault(); e.returnValue = ''; } });

  $('#repo').value = repo;
  if (llave) { $('#llave').value = llave; arrancar().catch(function () { /* que entre a mano */ }); }
})();
