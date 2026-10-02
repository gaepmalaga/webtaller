/* ==========================================================================
   Panel de Taberna Lázaro.

   Cómo funciona, en corto: esta página lee datos/contenido.json del
   repositorio, deja tocarlo en formularios, y al guardar lo sube otra vez
   —junto con las fotos nuevas— en un solo commit. GitHub Pages reconstruye la
   web sola y en un minuto está publicada.

   No hay servidor. La llave de GitHub se guarda en este navegador y solo viaja
   a api.github.com.
   ========================================================================== */
(function () {
  'use strict';

  var API = 'https://api.github.com';
  var RUTA = 'taberna-lazaro/datos/contenido.json';
  var RUTA_FOTOS = 'taberna-lazaro/assets/img/platos/';
  var WEB = 'https://gaepmalaga.github.io/webtaller/taberna-lazaro/';

  var $ = function (s) { return document.querySelector(s); };
  var crear = function (t, c, x) {
    var e = document.createElement(t);
    if (c) { e.className = c; }
    if (x != null) { e.textContent = x; }
    return e;
  };

  /* Estado ----------------------------------------------------------------- */
  var llave = localStorage.getItem('tl_llave') || '';
  var repo = localStorage.getItem('tl_repo') || 'gaepmalaga/webtaller';
  var rama = '';
  var datos = null;       // el contenido.json vivo
  var original = '';      // cómo estaba al cargarlo, para saber si hay cambios
  var fotosNuevas = {};   // ruta -> base64, pendientes de subir
  var sucio = false;

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
          if (r.status === 404) { m = 'No se encuentra el repositorio (¿la llave tiene acceso a él?).'; }
          throw new Error(m);
        });
      }
      return r.status === 204 ? null : r.json();
    });
  }

  /* UTF-8 <-> base64, que btoa() solo entiende latin-1 y aquí hay acentos. */
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

  /* ------------------------------------------------------------- entrar -- */
  function entrar() {
    var recado = $('#recado-entrar');
    llave = $('#llave').value.trim();
    repo = $('#repo').value.trim();
    if (!llave) { recado.textContent = 'Falta la llave.'; recado.className = 'recado is-mal'; return; }

    recado.textContent = 'Comprobando…'; recado.className = 'recado';
    api('/repos/' + repo)
      .then(function (r) {
        rama = r.default_branch;
        localStorage.setItem('tl_llave', llave);
        localStorage.setItem('tl_repo', repo);
        return cargar();
      })
      .catch(function (e) { recado.textContent = e.message; recado.className = 'recado is-mal'; });
  }

  function cargar() {
    return api('/repos/' + repo + '/contents/' + RUTA + '?ref=' + rama)
      .then(function (f) {
        datos = JSON.parse(deBase64(f.content));
        original = JSON.stringify(datos);
        $('#pantalla-entrar').hidden = true;
        $('#pantalla-panel').hidden = false;
        $('#barra').hidden = false;
        $('#estado-conexion').textContent = repo + ' · ' + rama;
        $('#estado-conexion').className = 'cab__estado is-ok';
        pintarTodo();
      });
  }

  /* ------------------------------------------------------- marcar cambios -- */
  function toco() {
    sucio = JSON.stringify(datos) !== original || Object.keys(fotosNuevas).length > 0;
    $('#guardar').disabled = !sucio;
    $('#descartar').hidden = !sucio;
    var n = $('#barra-n');
    n.textContent = sucio ? 'Hay cambios sin publicar' : 'Sin cambios';
    n.className = 'barra__n' + (sucio ? ' is-sucio' : '');
  }

  /* =================================================== LA CARTA ========== */
  function pintarCarta() {
    var hoja = $('#hoja-carta');
    hoja.textContent = '';

    datos.grupos.forEach(function (g, gi) {
      var b = crear('div', 'bloque');
      var h = crear('h3');
      h.appendChild(crear('span', null, g.titulo));
      h.appendChild(crear('span', 'cuenta-n', g.platos.length + ' platos'));
      b.appendChild(h);

      g.platos.forEach(function (p, pi) { b.appendChild(filaPlato(g, gi, p, pi)); });

      var mas = crear('button', 'anadir', '+ Añadir plato a ' + g.titulo);
      mas.type = 'button';
      mas.addEventListener('click', function () {
        g.platos.push({ id: 'nuevo-' + Date.now().toString(36), nombre: '', precio: 0, foto: '' });
        toco(); pintarCarta();
      });
      b.appendChild(mas);
      hoja.appendChild(b);
    });
  }

  function filaPlato(g, gi, p, pi) {
    var fila = crear('div', 'plato');

    /* --- la foto --- */
    var foto = crear('label', 'foto' + (p.foto ? ' is-puesta' : ''));
    foto.title = p.foto ? 'Cambiar la foto' : 'Subir una foto';
    if (p.foto) {
      var img = crear('img');
      img.alt = '';
      img.src = fotosNuevas[RUTA_FOTOS + p.id + '.jpg']
        ? 'data:image/jpeg;base64,' + fotosNuevas[RUTA_FOTOS + p.id + '.jpg']
        : '../' + p.foto + '?t=' + Date.now();
      foto.appendChild(img);
    } else {
      foto.appendChild(crear('span', null, '+'));
    }
    var file = crear('input');
    file.type = 'file'; file.accept = 'image/*';
    file.addEventListener('change', function () {
      if (!file.files[0]) { return; }
      encoger(file.files[0]).then(function (b64) {
        fotosNuevas[RUTA_FOTOS + p.id + '.jpg'] = b64;
        p.foto = 'assets/img/platos/' + p.id + '.jpg';
        toco(); pintarCarta();
      }).catch(function (e) { alert('No se ha podido leer la foto: ' + e.message); });
    });
    foto.appendChild(file);
    fila.appendChild(foto);

    /* --- nombre --- */
    var n = crear('input', 'n');
    n.value = p.nombre; n.placeholder = 'Nombre del plato';
    n.addEventListener('input', function () { p.nombre = n.value; toco(); });
    fila.appendChild(n);

    /* --- precio --- */
    var pr = crear('input', 'p');
    pr.type = 'number'; pr.step = '0.10'; pr.min = '0';
    pr.value = Number(p.precio).toFixed(2);
    pr.addEventListener('input', function () { p.precio = parseFloat(pr.value) || 0; toco(); });
    fila.appendChild(pr);

    /* --- subir, bajar, borrar --- */
    var acc = crear('div', 'acciones');
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
    var b = crear('button', 'mini' + (extra ? ' ' + extra : ''), texto);
    b.type = 'button'; b.title = titulo; b.setAttribute('aria-label', titulo);
    b.addEventListener('click', fn);
    return b;
  }

  /* La foto se encoge aquí, en el móvil, antes de subirla: una foto de cámara
     son 4 MB y en la carta se ve a 40 píxeles. */
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

  /* ==================================================== LAS FRASES ======= */
  var ETIQUETAS = {
    lema: ['El lema de la portada', 'Sale en grande en la tapa. Un salto de línea = una línea nueva.'],
    tapaPie: ['Pie de la portada', 'La línea pequeña de abajo del todo.'],
    tapaAbrir: ['Botón de la portada', ''],
    introSobre: ['Título de la presentación', ''],
    introUno: ['Presentación (párrafo grande)', 'Se puede usar <b>negrita</b>.'],
    introDos: ['Presentación (párrafo pequeño)', 'Se puede usar <b>negrita</b>.'],
    empezarTitulo: ['«Por dónde empezar» · título', ''],
    empezarSub: ['«Por dónde empezar» · entradilla', ''],
    empezarPie: ['«Por dónde empezar» · nota del final', ''],
    cartaTitulo: ['La carta · título', ''],
    cartaModo: ['La carta · cómo funciona la lista', ''],
    cartaIva: ['La carta · nota del IVA', ''],
    listaTitulo: ['La lista · título', 'Ojo: que no suene a que se está pidiendo de verdad.'],
    listaSub: ['La lista · subtítulo', ''],
    listaVacia: ['La lista vacía · primera línea', ''],
    listaVaciaDos: ['La lista vacía · segunda línea', ''],
    listaTotal: ['La lista · rótulo de la suma', ''],
    listaBorrar: ['La lista · botón de borrar', ''],
    listaNota: ['La lista · aviso del recuadro', 'Es el que deja claro que no se pide nada.'],
    tiraVacia: ['Barra del móvil · vacía', ''],
    tiraLlena: ['Barra del móvil · con cosas', ''],
    dorsoTitulo: ['El reverso · título', ''],
    dondeTexto: ['El reverso · cómo llegar', ''],
    avisarTexto: ['El reverso · reservas', ''],
    avisarMin: ['El reverso · nota de la barra', ''],
    horarioNota: ['El reverso · nota del horario', ''],
    fin: ['La despedida del final', 'Un salto de línea = una línea nueva. <em>…</em> para cursiva.']
  };
  var ETIQ_COM = {
    soloBeberPoco: 'Si solo hay bebida (1 o 2 cosas)',
    soloBeberMucho: 'Si solo hay bebida (3 o más)',
    soloComer: 'Si solo hay comida',
    dos: 'Con 1 o 2 cosas',
    cinco: 'Con 3 a 5',
    nueve: 'Con 6 a 9',
    muchos: 'Con 10 o más'
  };

  function pintarFrases() {
    var hoja = $('#hoja-frases');
    hoja.textContent = '';

    var b = crear('div', 'bloque');
    b.appendChild(crear('h3', null, 'Los textos de la web'));
    Object.keys(ETIQUETAS).forEach(function (k) {
      if (!(k in datos.textos)) { return; }
      b.appendChild(campo(ETIQUETAS[k][0], datos.textos[k], ETIQUETAS[k][1], function (v) {
        datos.textos[k] = v; toco();
      }, datos.textos[k].length > 60));
    });
    hoja.appendChild(b);

    var c = crear('div', 'bloque');
    c.appendChild(crear('h3', null, 'Lo que dice la lista según lo que lleves'));
    Object.keys(ETIQ_COM).forEach(function (k) {
      c.appendChild(campo(ETIQ_COM[k], datos.comentarios[k] || '', '', function (v) {
        datos.comentarios[k] = v; toco();
      }));
    });
    hoja.appendChild(c);

    var e = crear('div', 'bloque');
    e.appendChild(crear('h3', null, '«Por dónde empezar»: las tres propuestas'));
    datos.escenarios.forEach(function (x, i) {
      var f = crear('div', 'bloque');
      f.style.margin = '0 0 0.8rem';
      f.appendChild(campo('Propuesta ' + (i + 1) + ' · nombre', x.nombre, '', function (v) { x.nombre = v; toco(); }));
      f.appendChild(campo('Qué lleva (texto)', x.descripcion, '', function (v) { x.descripcion = v; toco(); }, true));
      f.appendChild(campo('Platos que apunta', JSON.stringify(x.lleva),
        'Pares de identificador y cantidad. El total lo calcula sola la web con los precios de la carta.',
        function (v) { try { x.lleva = JSON.parse(v); toco(); } catch (err) { /* mientras se escribe */ } }));
      e.appendChild(f);
    });
    hoja.appendChild(e);
  }

  function campo(etiqueta, valor, pista, alCambiar, grande) {
    var l = crear('label', 'campo');
    var s = crear('span', null, etiqueta);
    if (pista) {
      var p = crear('span', 'pista', pista);
      s.appendChild(p);
    }
    l.appendChild(s);
    var i = crear(grande ? 'textarea' : 'input');
    i.value = valor;
    i.addEventListener('input', function () { alCambiar(i.value); });
    l.appendChild(i);
    return l;
  }

  /* ===================================================== EL HORARIO ====== */
  var DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var ORDEN = [1, 2, 3, 4, 5, 6, 0];
  var hhmm = function (m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  var min = function (s) { var p = s.split(':'); return (+p[0]) * 60 + (+p[1]); };

  function pintarHorario() {
    var hoja = $('#hoja-horario');
    hoja.textContent = '';
    var b = crear('div', 'bloque');
    b.appendChild(crear('h3', null, 'Horario'));

    ORDEN.forEach(function (d) {
      var tramos = datos.horario[String(d)];
      var fila = crear('div', 'dia');
      fila.appendChild(crear('b', null, DIAS[d]));

      var cerrado = crear('label');
      var chk = crear('input'); chk.type = 'checkbox';
      chk.checked = !tramos || !tramos.length;
      chk.addEventListener('change', function () {
        datos.horario[String(d)] = chk.checked ? null : [[720, 1440]];
        toco(); pintarHorario();
      });
      cerrado.appendChild(chk);
      cerrado.appendChild(crear('span', null, 'cerrado'));
      fila.appendChild(cerrado);

      var caja = crear('div', 'tramos');
      (tramos || []).forEach(function (t, ti) {
        var de = crear('input'); de.type = 'time'; de.value = hhmm(t[0]);
        var a = crear('input'); a.type = 'time'; a.value = hhmm(t[1] >= 1440 ? 1439 : t[1]);
        de.addEventListener('change', function () { t[0] = min(de.value); toco(); });
        a.addEventListener('change', function () {
          var v = min(a.value);
          /* 00:00 de cierre es medianoche del día siguiente, no las cero horas. */
          t[1] = v === 0 ? 1440 : v;
          toco();
        });
        caja.appendChild(de);
        caja.appendChild(crear('span', null, '→'));
        caja.appendChild(a);
        if (ti === 1) {
          caja.appendChild(mini('✕', 'Quitar el segundo turno', function () {
            tramos.splice(1, 1); toco(); pintarHorario();
          }, 'mini--mal'));
        }
      });
      if (tramos && tramos.length === 1) {
        caja.appendChild(mini('+', 'Añadir un segundo turno', function () {
          tramos.push([1200, 1440]); toco(); pintarHorario();
        }));
      }
      fila.appendChild(caja);
      b.appendChild(fila);
    });

    var nota = crear('p', 'ayuda', 'Cerrar a las 00:00 se entiende como medianoche. Con el horario puesto, la web enciende sola el aviso de «abierto ahora» y se lo cuenta a Google.');
    nota.style.marginTop = '0.9rem';
    b.appendChild(nota);
    hoja.appendChild(b);
  }

  /* ======================================================= LOS DATOS ===== */
  var ETIQ_NEG = {
    telefono: ['Teléfono', 'Con esto se encienden los enlaces de llamar y se lo decimos a Google.'],
    correo: ['Correo', 'Hace falta para el aviso legal.'],
    instagram: ['Instagram', 'Solo el nombre, sin la arroba ni la dirección.'],
    aparcamiento: ['Aparcamiento', 'Si se deja vacío, sale marcado como pendiente.'],
    calle: ['Calle y número', ''],
    barrio: ['Barrio', ''],
    cp: ['Código postal', ''],
    ciudad: ['Ciudad', ''],
    metro: ['Cómo llegar en metro', ''],
    mapa: ['Enlace de Google Maps', '']
  };

  function pintarDatos() {
    var hoja = $('#hoja-datos');
    hoja.textContent = '';

    var b = crear('div', 'bloque');
    b.appendChild(crear('h3', null, 'Datos del local'));
    Object.keys(ETIQ_NEG).forEach(function (k) {
      b.appendChild(campo(ETIQ_NEG[k][0], datos.negocio[k] || '', ETIQ_NEG[k][1], function (v) {
        datos.negocio[k] = v; toco();
      }));
    });
    hoja.appendChild(b);

    var c = crear('div', 'bloque');
    c.appendChild(crear('h3', null, 'Estado de la web'));
    var l = crear('label', 'campo');
    var s = crear('span', null, 'Franja de «Borrador»');
    s.appendChild(crear('span', 'pista', 'Mientras esté puesta, la web no sale en Google y avisa de que faltan datos. Quítala cuando esté todo listo.'));
    l.appendChild(s);
    var sel = crear('select');
    [['true', 'Sí: sigue siendo un borrador'], ['false', 'No: la web está lista y puede salir en Google']]
      .forEach(function (o) {
        var op = crear('option', null, o[1]); op.value = o[0];
        if (String(datos.borrador) === o[0]) { op.selected = true; }
        sel.appendChild(op);
      });
    sel.addEventListener('change', function () { datos.borrador = sel.value === 'true'; toco(); });
    l.appendChild(sel);
    c.appendChild(l);
    hoja.appendChild(c);
  }

  /* ====================================================== LOS NÚMEROS ==== */
  function pintarNumeros() {
    var hoja = $('#hoja-numeros');
    hoja.textContent = '';

    var conf = crear('div', 'bloque');
    conf.appendChild(crear('h3', null, 'Analítica'));
    conf.appendChild(campo('Dirección del recolector', (datos.analitica && datos.analitica.endpoint) || '',
      'Vacío = la web no manda nada a ninguna parte. Para encenderla hay que desplegar el recolector una vez; está explicado en ANALITICA.md del repositorio.',
      function (v) { datos.analitica.endpoint = v.trim(); toco(); }));
    hoja.appendChild(conf);

    var destino = datos.analitica && datos.analitica.endpoint;
    var caja = crear('div', 'bloque');
    caja.appendChild(crear('h3', null, 'Qué pide la gente'));

    if (!destino) {
      caja.appendChild(crear('p', 'ayuda',
        'Todavía no hay analítica encendida, así que no hay números que enseñar. ' +
        'Mientras tanto la web no hace ni una sola petición a terceros, que tampoco está mal.'));
      hoja.appendChild(caja);
      return;
    }

    caja.appendChild(crear('p', 'ayuda', 'Cargando…'));
    hoja.appendChild(caja);

    var clave = localStorage.getItem('tl_clave_analitica') || '';
    if (!clave) {
      caja.textContent = '';
      caja.appendChild(crear('h3', null, 'Qué pide la gente'));
      caja.appendChild(campo('Clave de lectura', '',
        'La que pusiste en el recolector al desplegarlo (la variable CLAVE). Se guarda solo en este navegador y no viaja a GitHub.',
        function (v) { localStorage.setItem('tl_clave_analitica', v.trim()); }));
      var ver = crear('button', 'anadir', 'Ver los números');
      ver.type = 'button';
      ver.addEventListener('click', pintarNumeros);
      caja.appendChild(ver);
      return;
    }

    fetch(destino.replace(/\/+$/, '') + '/resumen?dias=30&clave=' + encodeURIComponent(clave))
      .then(function (r) { return r.json(); })
      .then(function (d) { pintarResumen(caja, d); })
      .catch(function (e) {
        caja.textContent = '';
        caja.appendChild(crear('h3', null, 'Qué pide la gente'));
        caja.appendChild(crear('p', 'ayuda', 'No se ha podido leer el resumen: ' + e.message));
      });
  }

  function pintarResumen(caja, d) {
    caja.textContent = '';
    caja.appendChild(crear('h3', null, 'Últimos 30 días'));

    var cifras = crear('div', 'cifras');
    [['Visitas', d.visitas || 0], ['Listas empezadas', d.listas || 0], ['Platos tocados', d.toques || 0]]
      .forEach(function (c) {
        var x = crear('div', 'cifra');
        x.appendChild(crear('b', null, String(c[1])));
        x.appendChild(crear('span', null, c[0]));
        cifras.appendChild(x);
      });
    caja.appendChild(cifras);

    var nombres = {};
    datos.grupos.forEach(function (g) {
      g.platos.forEach(function (p) { nombres[p.id] = p.nombre; });
      (g.extras || []).forEach(function (p) { nombres[p.id] = p.nombre; });
    });

    var top = (d.platos || []).slice(0, 15);
    if (!top.length) {
      caja.appendChild(crear('p', 'ayuda', 'Todavía no ha tocado nadie ningún plato.'));
      return;
    }
    var max = top[0][1] || 1;
    var ol = crear('ol', 'rank');
    top.forEach(function (p, i) {
      var li = crear('li');
      li.appendChild(crear('i', null, (i + 1) + '.'));
      li.appendChild(crear('span', null, nombres[p[0]] || p[0]));
      li.appendChild(crear('b', null, String(p[1])));
      var barra = crear('div', 'barra-r');
      barra.style.width = Math.round((p[1] / max) * 100) + '%';
      li.appendChild(barra);
      ol.appendChild(li);
    });
    caja.appendChild(ol);
  }

  /* ======================================================== GUARDAR ====== */
  function guardar() {
    var velo = $('#velo');
    velo.hidden = false;
    $('#velo-cerrar').hidden = true;
    $('#velo-t').textContent = 'Publicando…';
    var paso = function (t) { $('#velo-p').textContent = t; };

    var archivos = [{ ruta: RUTA, contenido: aBase64(JSON.stringify(datos, null, 2) + '\n'), binario: false }];
    Object.keys(fotosNuevas).forEach(function (r) {
      archivos.push({ ruta: r, contenido: fotosNuevas[r], binario: true });
    });

    paso('Subiendo ' + archivos.length + (archivos.length === 1 ? ' archivo' : ' archivos') + '…');

    var baseSha, treeSha;
    api('/repos/' + repo + '/git/ref/heads/' + rama)
      .then(function (r) {
        baseSha = r.object.sha;
        return api('/repos/' + repo + '/git/commits/' + baseSha);
      })
      .then(function (c) {
        treeSha = c.tree.sha;
        return Promise.all(archivos.map(function (a) {
          return api('/repos/' + repo + '/git/blobs', {
            method: 'POST',
            body: JSON.stringify({ content: a.contenido, encoding: 'base64' })
          }).then(function (b) { return { path: a.ruta, mode: '100644', type: 'blob', sha: b.sha }; });
        }));
      })
      .then(function (entradas) {
        paso('Montando el cambio…');
        return api('/repos/' + repo + '/git/trees', {
          method: 'POST',
          body: JSON.stringify({ base_tree: treeSha, tree: entradas })
        });
      })
      .then(function (t) {
        var n = Object.keys(fotosNuevas).length;
        var msg = 'Taberna Lázaro: cambios desde el panel'
          + (n ? ' (' + n + (n === 1 ? ' foto' : ' fotos') + ')' : '');
        return api('/repos/' + repo + '/git/commits', {
          method: 'POST',
          body: JSON.stringify({ message: msg, tree: t.sha, parents: [baseSha] })
        });
      })
      .then(function (c) {
        paso('Guardado. Ahora la web se reconstruye sola…');
        return api('/repos/' + repo + '/git/refs/heads/' + rama, {
          method: 'PATCH',
          body: JSON.stringify({ sha: c.sha })
        });
      })
      .then(function () {
        fotosNuevas = {};
        original = JSON.stringify(datos);
        toco();
        $('#velo-t').textContent = '¡Publicado!';
        paso('GitHub está reconstruyendo la web. Suele tardar un minuto.\nPuedes cerrar esto y seguir.');
        $('#velo-cerrar').hidden = false;
      })
      .catch(function (e) {
        $('#velo-t').textContent = 'No se ha podido publicar';
        paso(e.message + '\n\nNo se ha perdido nada: los cambios siguen aquí. Prueba otra vez.');
        $('#velo-cerrar').hidden = false;
      });
  }

  /* ======================================================== ARRANQUE ===== */
  function pintarTodo() { pintarCarta(); pintarFrases(); pintarHorario(); pintarDatos(); pintarNumeros(); toco(); }

  $('#conectar').addEventListener('click', entrar);
  $('#llave').addEventListener('keydown', function (e) { if (e.key === 'Enter') { entrar(); } });
  $('#guardar').addEventListener('click', guardar);
  $('#velo-cerrar').addEventListener('click', function () { $('#velo').hidden = true; });
  $('#descartar').addEventListener('click', function () {
    if (!confirm('¿Descartar todos los cambios sin publicar?')) { return; }
    datos = JSON.parse(original); fotosNuevas = {}; pintarTodo();
  });

  $('#pestanas').addEventListener('click', function (e) {
    var b = e.target.closest('.pes');
    if (!b) { return; }
    document.querySelectorAll('.pes').forEach(function (x) { x.classList.toggle('is-aqui', x === b); });
    document.querySelectorAll('.hoja').forEach(function (h) { h.hidden = h.id !== 'hoja-' + b.dataset.ir; });
    if (b.dataset.ir === 'numeros') { pintarNumeros(); }
  });

  addEventListener('beforeunload', function (e) {
    if (sucio) { e.preventDefault(); e.returnValue = ''; }
  });

  /* Si ya se entró otra vez, se entra solo. */
  $('#repo').value = repo;
  if (llave) {
    $('#llave').value = llave;
    api('/repos/' + repo).then(function (r) { rama = r.default_branch; return cargar(); })
      .catch(function () { /* que entre a mano */ });
  }
})();
