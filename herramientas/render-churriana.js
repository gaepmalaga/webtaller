/* ==========================================================================
   La Taberna de Churriana — el renderizador.

   Convierte `churriana/datos/contenido.json` en el index.html que se publica.
   Mismo mecanismo que el de Lázaro —el panel toca el JSON y esto lo monta—
   pero otra casa: negro y amarillo, el tipo gordo y condensado de sus
   publicaciones, su propio logo, y la carta con las descripciones del papel.
   ========================================================================== */

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const ORDEN = [1, 2, 3, 4, 5, 6, 0];
const EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const eur = (n) => Number(n).toFixed(2).replace('.', ',') + ' €';
/* 1440 es medianoche; más de eso, madrugada del día siguiente (1500 = 01:00). */
const hhmm = (m) => String(Math.floor((m % 1440) / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

/* ------------------------------------------------------------------ piezas -- */

function plato(p, g) {
  const boton = `<button type="button" class="it" data-t="${g.tipo}" data-id="${esc(p.id)}" data-n="${esc(p.nombre)}" data-p="${Number(p.precio).toFixed(2)}">`
    + `<span class="it__c"><span class="it__n">${esc(p.nombre)}</span>`
    + (p.descripcion && !g.sinDescripcion ? `<span class="it__q">${esc(p.descripcion)}</span>` : '')
    + `</span><span class="it__d" aria-hidden="true"></span><i class="it__p">${eur(p.precio)}</i></button>`;

  if (!p.foto) { return `            <li>${boton}</li>`; }
  /* Con foto van dos botones hermanos: la miniatura abre el visor y la línea
     apunta el plato. Nada de un botón dentro de otro. */
  return `            <li class="con-foto"><button type="button" class="verfoto" data-foto="${esc(p.foto)}" data-n="${esc(p.nombre)}" data-p="${eur(p.precio)}" aria-label="Ver la foto de ${esc(p.nombre)}"><img src="${esc(p.foto)}" alt="" loading="lazy" width="56" height="56"></button>${boton}</li>`;
}

function grupo(g) {
  const clases = ['grupo'];
  if (g.destacado) clases.push('grupo--destacado');
  if (g.ancho) clases.push('grupo--ancho');
  if (g.sinDescripcion) clases.push('grupo--seco');

  return `        <section id="${esc(g.id)}" class="${clases.join(' ')}">
          <h3 class="grupo__t">${esc(g.titulo)}</h3>
          <ul class="lista${g.dosColumnas ? ' lista--dos' : ''}">
${g.platos.map((p) => plato(p, g)).join('\n')}
          </ul>
        </section>`;
}

function escenario(e) {
  return `        <li>
          <button type="button" class="esc" data-ronda='${JSON.stringify(e.lleva)}'>
            <span class="esc__n">${esc(e.nombre)}</span>
            <span class="esc__d">${esc(e.descripcion)}</span>
            <span class="esc__t" data-total></span>
          </button>
        </li>`;
}

function filaHorario(d, horario) {
  const t = horario[String(d)];
  const celda = !t || !t.length
    ? '<span class="falta">pendiente</span>'
    : t.map(([a, b]) => `${hhmm(a)} – ${hhmm(b)}`).join(' · ');
  return `            <tr data-dia="${d}"><th scope="row">${DIAS[d]}</th><td>${celda}</td></tr>`;
}

function horasJsonLd(horario) {
  const filas = [];
  for (const d of ORDEN) {
    const t = horario[String(d)];
    if (!t || !t.length) continue;
    for (const [a, b] of t) {
      filas.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: EN[d], opens: hhmm(a), closes: b === 1440 ? '23:59' : hhmm(b) });
    }
  }
  return filas;
}

const oPendiente = (v, texto) => (v ? esc(v) : `<span class="falta">${texto}</span>`);

/* ---------------------------------------------------------------- la página -- */

export function render(d, version = '1') {
  const n = d.negocio, t = d.textos;
  const base = 'https://gaepmalaga.github.io/webtaller/churriana/';
  const ig = n.instagram ? `https://www.instagram.com/${n.instagram}` : '';
  const tel = n.telefono
    ? `<a href="tel:${n.telefono.replace(/\s/g, '')}">${esc(n.telefono)}</a>`
    : '<span class="falta">pendiente</span>';

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: n.nombre,
    description: `Taberna en ${n.barrio}, ${n.ciudad}: raciones para compartir, tostas, carnes a la plancha y mini-burgers.`,
    url: base,
    image: base + 'assets/img/og.png',
    servesCuisine: ['Española', 'Andaluza', 'Tapas'],
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    hasMenu: base + '#carta',
    address: {
      '@type': 'PostalAddress',
      streetAddress: n.calle.replace(/^Pl\.\s*/, 'Plaza de '),
      addressLocality: n.ciudad,
      addressRegion: n.ciudad,
      postalCode: n.cp,
      addressCountry: 'ES'
    }
  };
  if (ig) jsonld.sameAs = [ig];
  if (n.telefono) jsonld.telephone = '+34' + n.telefono.replace(/\s/g, '');
  if (n.correo) jsonld.email = n.correo;
  const horas = horasJsonLd(d.horario);
  if (horas.length) jsonld.openingHoursSpecification = horas;

  const paraElNavegador = {
    horario: d.horario,
    comentarios: d.comentarios,
    tira: { vacia: t.tiraVacia, llena: t.tiraLlena }
  };

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(n.nombre)} — La carta, en ${esc(n.barrio)} (${esc(n.ciudad)})</title>
<meta name="description" content="${esc(n.nombre)}, en la plaza de San Antonio Abad. Raciones para compartir, tostas crujientes, mini-burgers de Angus, croquetas y carnes a la plancha. ${esc(n.calle)}, ${esc(n.barrio)}.">

<!-- GENERADO. No editar a mano: esta página la monta
     herramientas/render-churriana.js a partir de datos/contenido.json.
     Para cambiar textos, platos, precios o fotos: /admin/ -->

<link rel="canonical" href="${base}">
${d.borrador ? '<!-- Mientras sea un borrador no se indexa. Se quita solo al poner "borrador": false. -->\n<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow">'}

<meta property="og:type" content="restaurant">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="${esc(n.nombre)}">
<meta property="og:title" content="${esc(n.nombre)} — ${esc(n.barrio)}, ${esc(n.ciudad)}">
<meta property="og:description" content="${esc(t.lema.replace(/\n/g, ' '))}">
<meta property="og:url" content="${base}">
<meta property="og:image" content="${base}assets/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#000000">

<link rel="icon" href="assets/img/icono-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="assets/img/icono-180.png">
<link rel="preload" href="assets/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/style.css?v=${version}">
</head>

<body>
<a class="saltar" href="#carta">Saltar a la carta</a>
${d.borrador ? `
<p class="aviso">
  <b>Borrador</b> · la carta y los precios son los de la casa; lo marcado en
  <span class="falta">amarillo</span> sigue sin confirmar
</p>` : ''}

<main>

  <!-- ============================================================= portada -->
  <section class="tapa">
    <div class="tapa__hoja">
      <img class="tapa__lt" src="assets/img/logo.png" width="512" height="512" alt="" fetchpriority="high">

      <h1 class="tapa__h1">
        <span class="tapa__a">${esc(n.rotulo)}</span>
        <span class="tapa__b">${esc(n.bajoRotulo)}</span>
      </h1>

      <p class="tapa__lema">${esc(t.lema).replace(/\n/g, '<br>')}</p>

      <p class="tapa__pie">
        <span>${esc(n.calle)} · ${esc(n.barrio)} · ${esc(n.ciudad)}</span>
        <span class="tapa__sep" aria-hidden="true">·</span>
        <span>${esc(t.tapaPie)}</span>
      </p>

      <a class="tapa__abrir" href="#carta">
        ${esc(t.tapaAbrir)}
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 4v15m0 0-6-6m6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    </div>
  </section>

  <!-- =============================================================== intro -->
  <section class="intro">
    <div class="intro__in">
      <p class="intro__sobre">${esc(t.introSobre)}</p>
      <p class="intro__txt">${t.introUno}</p>
      <p class="intro__txt2">${t.introDos}</p>

      <ul class="intro__datos">
        <li><b>Dónde</b> ${esc(n.calle)} · ${esc(n.barrio)}, ${esc(n.ciudad)}</li>
        <li><b>Cómo llegar</b> ${esc(n.comoLlegar)}</li>
        <li><b>Horario</b> ${Object.values(d.horario).some((x) => x && x.length) ? '<a href="#horario">ver abajo</a>' : '<span class="falta">pendiente</span>'}</li>
        <li><b>Reservas</b> ${n.telefono ? tel : '<span class="falta">teléfono pendiente</span>'}</li>
      </ul>
    </div>
  </section>

  <!-- ============================================================== cuánto -->
  <section class="cuanto">
    <div class="cuanto__cab">
      <h2 class="cuanto__t">${esc(t.empezarTitulo)}</h2>
      <p class="cuanto__s">${t.empezarSub}</p>
    </div>
    <ul class="escenas">
${d.escenarios.map(escenario).join('\n')}
    </ul>
    <p class="cuanto__pie">${t.empezarPie}</p>
  </section>

  <!-- =============================================================== carta -->
  <section class="carta" id="carta">
    <header class="carta__cab">
      <h2 class="carta__t">${esc(t.cartaTitulo)}</h2>
      <p class="carta__modo">${t.cartaModo}</p>
      <nav class="indice" aria-label="Secciones de la carta">
${d.grupos.map((g) => `        <a href="#${esc(g.id)}">${esc(g.titulo)}</a>`).join('\n')}
      </nav>
    </header>

    <div class="carta__cuerpo">
      <div class="carta__cols">
${d.grupos.map(grupo).join('\n\n')}

        <p class="carta__iva">${esc(t.cartaIva)}</p>
      </div>

      <aside class="cuenta" id="cuenta" hidden aria-labelledby="cuenta-t">
        <div class="cuenta__papel">
          <button type="button" class="cuenta__cerrar" id="cuenta-cerrar" aria-label="Cerrar la lista">
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
          </button>

          <h2 class="cuenta__t" id="cuenta-t">${esc(t.listaTitulo)}</h2>
          <p class="cuenta__sitio">${esc(t.listaSub)}</p>

          <ul class="cuenta__lineas" id="cuenta-lineas"></ul>

          <p class="cuenta__vacia" id="cuenta-vacia">
            ${esc(t.listaVacia)}<br>
            <span>${esc(t.listaVaciaDos)}</span>
          </p>

          <div class="cuenta__total" id="cuenta-total" hidden>
            <span class="cuenta__tl">${esc(t.listaTotal)}</span>
            <output class="cuenta__tn" id="cuenta-cifra" for="cuenta-lineas">0,00 €</output>
          </div>

          <p class="cuenta__guasa" id="cuenta-guasa" aria-live="polite"></p>

          <div class="cuenta__acciones" hidden id="cuenta-acciones">
            <button type="button" class="cuenta__borrar" id="cuenta-borrar">${esc(t.listaBorrar)}</button>
          </div>

          <p class="cuenta__nota">${esc(t.listaNota)}</p>
        </div>
      </aside>
    </div>
  </section>

  <!-- =============================================================== dorso -->
  <section class="dorso" id="dorso">
    <h2 class="dorso__t">${esc(t.dorsoTitulo)}</h2>

    <div class="dorso__rejilla">
      <div class="dorso__bloque">
        <h3>Dónde</h3>
        <p class="dorso__dir">${esc(n.calle)}<br>${esc(n.barrio)} · ${esc(n.cp)} ${esc(n.ciudad)}</p>
        <p>${esc(n.comoLlegar)}</p>
        <p class="dorso__falta">En coche: ${oPendiente(n.aparcamiento, 'confirmar aparcamiento')}</p>
        <a class="dorso__enlace" href="${esc(n.mapa)}" target="_blank" rel="noopener">Abrir en Google Maps →</a>
      </div>

      <div class="dorso__bloque">
        <h3>Cuándo</h3>
        <p class="estado" id="estado" hidden>
          <span class="estado__punto" aria-hidden="true"></span>
          <span class="estado__txt"></span>
        </p>
        <table class="dorso__tabla" id="horario">
          <caption class="vh">Horario de ${esc(n.nombre)}</caption>
          <tbody>
${ORDEN.map((d2) => filaHorario(d2, d.horario)).join('\n')}
          </tbody>
        </table>
      </div>

      <div class="dorso__bloque">
        <h3>Avisar</h3>
        <p>${t.avisarTexto}</p>
        <dl class="dorso__datos">
          <dt>Teléfono</dt><dd>${tel}</dd>
          <dt>Instagram</dt><dd>${ig ? `<a href="${ig}" target="_blank" rel="noopener">@${esc(n.instagram)}</a>` : '<span class="falta">pendiente</span>'}</dd>
          <dt>Correo</dt><dd>${n.correo ? `<a href="mailto:${esc(n.correo)}">${esc(n.correo)}</a>` : '<span class="falta">pendiente</span>'}</dd>
        </dl>
${t.avisarMin.trim() ? `        <p class="dorso__min">${esc(t.avisarMin)}</p>` : ''}
      </div>
    </div>
  </section>

${t.fin.trim() ? `
  <section class="fin">
    <img class="fin__lt" src="assets/img/logo.png" width="512" height="512" alt="" loading="lazy">
    <p class="fin__frase">${t.fin.replace(/\n/g, '<br>')}</p>
  </section>` : ''}

</main>

<footer class="pie">
  <p>${esc(n.nombre)} · ${esc(n.calle)} · ${esc(n.barrio)} · ${esc(n.cp)} ${esc(n.ciudad)}</p>
  <p>
    ${ig ? `<a href="${ig}" target="_blank" rel="noopener">Instagram</a> ·` : ''}
    <a href="${esc(n.mapa)}" target="_blank" rel="noopener">Google Maps</a> ·
    <a href="aviso-legal.html">Aviso legal</a> ·
    <span>© <span id="anio">2026</span>. Sin cookies ni rastreadores.</span>
  </p>
</footer>

<button type="button" class="pestana" id="pestana" hidden aria-controls="cuenta">
  Tu lista
  <span class="pestana__c" id="pestana-c"></span>
</button>

<button type="button" class="tira" id="tira" hidden aria-expanded="false" aria-controls="cuenta">
  <span class="tira__n" id="tira-n">0</span>
  <span class="tira__t">${esc(t.tiraVacia)}</span>
  <span class="tira__c" id="tira-c"></span>
</button>

<div class="visor" id="visor" hidden>
  <button type="button" class="visor__x" id="visor-x" aria-label="Cerrar la foto">
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
  </button>
  <figure class="visor__f">
    <img id="visor-img" alt="">
    <figcaption class="visor__pie"><span id="visor-n"></span><i id="visor-p"></i></figcaption>
  </figure>
</div>

<script type="application/json" id="datos">${JSON.stringify(paraElNavegador)}</script>
<script src="assets/js/main.js?v=${version}" defer></script>

<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
</body>
</html>
`;
}
