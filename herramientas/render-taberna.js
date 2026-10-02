/* ==========================================================================
   Taberna Lázaro — el renderizador.

   Convierte `taberna-lazaro/datos/contenido.json` en el index.html que se
   publica. Es la única pieza que sabe de maquetación: el panel de /admin solo
   toca el JSON, y esto lo vuelve a montar.

   Por qué así y no pintando la página con JavaScript en el navegador: la carta
   tiene que estar en el HTML tal cual, para que Google la lea y para que la
   página siga funcionando sin JavaScript.
   ========================================================================== */

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const ORDEN = [1, 2, 3, 4, 5, 6, 0];           // la semana empieza en lunes
const EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const eur = (n) => Number(n).toFixed(2).replace('.', ',') + ' €';
const hhmm = (m) => (m >= 1440 ? '00:00' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'));

/* ------------------------------------------------------------------ piezas -- */

function plato(p, tipo) {
  const boton = `<button type="button" class="it" data-t="${tipo}" data-id="${esc(p.id)}" data-n="${esc(p.nombre)}" data-p="${Number(p.precio).toFixed(2)}"><span class="it__n">${esc(p.nombre)}</span><span class="it__d" aria-hidden="true"></span><i class="it__p">${eur(p.precio)}</i></button>`;
  if (!p.foto) { return `            <li>${boton}</li>`; }
  /* Con foto van dos botones hermanos: la miniatura abre el visor y la línea
     apunta el plato. Nada de un botón dentro de otro. */
  return `            <li class="con-foto"><button type="button" class="verfoto" data-foto="${esc(p.foto)}" data-n="${esc(p.nombre)}" data-p="${eur(p.precio)}" aria-label="Ver la foto de ${esc(p.nombre)}"><img src="${esc(p.foto)}" alt="" loading="lazy" width="48" height="48"></button>${boton}</li>`;
}

function grupo(g) {
  const clases = ['grupo'];
  if (g.destacado) clases.push('grupo--destacado');
  if (g.ancho) clases.push('grupo--ancho');

  const extras = (g.extras || []).length
    ? `\n          <p class="grupo__pie">${g.extras.map((e) =>
        `<button type="button" class="it it--chico" data-t="${g.tipo}" data-id="${esc(e.id)}" data-n="${esc(e.nombre)}" data-p="${Number(e.precio).toFixed(2)}"><span class="it__n">${esc(e.nombre)}</span><i class="it__p">${eur(e.precio)}</i></button>`
      ).join('\n            ')}</p>`
    : '';

  const nota = g.nota ? `\n          <p class="grupo__sug">${g.nota}</p>` : '';

  return `        <section id="${esc(g.id)}" class="${clases.join(' ')}">
          <h3 class="grupo__t">${esc(g.titulo)}</h3>
          <ul class="lista${g.dosColumnas ? ' lista--dos' : ''}">
${g.platos.map((p) => plato(p, g.tipo)).join('\n')}
          </ul>${extras}${nota}
        </section>`;
}

function escenario(e) {
  const suma = () => 0; // el total real lo calcula el navegador con los precios de la carta
  return `        <li>
          <button type="button" class="esc" data-ronda='${JSON.stringify(e.lleva)}'>
            <span class="esc__n">${esc(e.nombre)}</span>
            <span class="esc__d">${esc(e.descripcion)}</span>
            <span class="esc__t" data-total>${e._total || ''}</span>
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

/* El horario, en el formato que Google entiende. */
function horasJsonLd(horario) {
  const filas = [];
  for (const d of ORDEN) {
    const t = horario[String(d)];
    if (!t || !t.length) continue;
    for (const [a, b] of t) {
      filas.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: EN[d], opens: hhmm(a), closes: hhmm(b >= 1440 ? 1439 : b) });
    }
  }
  return filas;
}

/* Un dato que puede no estar todavía: o sale, o sale marcado en amarillo. */
const oPendiente = (v, texto) => (v ? esc(v) : `<span class="falta">${texto}</span>`);

/* ---------------------------------------------------------------- la página -- */

export function render(d, version = '1') {
  const n = d.negocio, t = d.textos;
  const base = 'https://gaepmalaga.github.io/webtaller/taberna-lazaro/';
  const dir = `${n.calle} · ${n.barrio} · ${n.cp} ${n.ciudad}`;
  const ig = n.instagram ? `https://www.instagram.com/${n.instagram}` : '';

  const tel = n.telefono
    ? `<a href="tel:${n.telefono.replace(/\s/g, '')}">${esc(n.telefono)}</a>`
    : '<span class="falta">pendiente</span>';

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'BarOrPub',
    name: n.nombre,
    description: `Taberna en ${n.barrio}, ${n.ciudad}: tapas para compartir, cervezas, vinos y copas.`,
    url: base,
    image: base + 'assets/img/og.png',
    servesCuisine: ['Española', 'Andaluza', 'Tapas'],
    priceRange: '€',
    currenciesAccepted: 'EUR',
    hasMenu: base + '#carta',
    address: {
      '@type': 'PostalAddress',
      streetAddress: n.calle.replace(/^C\/\s*/, 'Calle '),
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

  /* Lo que el navegador necesita saber y no se puede deducir del HTML. */
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
<meta name="description" content="${esc(n.nombre)}, en ${esc(n.barrio)} (${esc(n.ciudad)}). Tapas para compartir, cañas bien tiradas y carta corta: gildas, croquetas, gyozas, tortilla trufada, tartar de salchichón. ${esc(n.calle)}.">

<!-- GENERADO. No editar a mano: esta página la monta
     herramientas/render-taberna.js a partir de datos/contenido.json.
     Para cambiar textos, platos, precios o fotos: /admin/ -->

<link rel="canonical" href="${base}">
${d.borrador ? '<!-- Mientras sea un borrador no se indexa. Se quita solo al poner "borrador": false. -->\n<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow">'}

<meta property="og:type" content="restaurant">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="${esc(n.nombre)}">
<meta property="og:title" content="${esc(n.nombre)} — Tapas y copas en ${esc(n.barrio)}, ${esc(n.ciudad)}">
<meta property="og:description" content="${esc(t.lema.replace(/\n/g, ' '))} Tapas, barra y carta corta en ${esc(n.barrio)}, ${esc(n.ciudad)}.">
<meta property="og:url" content="${base}">
<meta property="og:image" content="${base}assets/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#5d6140">

<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin>
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

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <symbol id="ramo" viewBox="0 0 64 28">
    <path d="M2 25C14 24 28 19 40 11 48 5.6 55 3.2 62 2.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <g fill="currentColor">
      <ellipse cx="0" cy="0" rx="5.4" ry="2.2" transform="translate(12.5 18.8) rotate(-34)"/>
      <ellipse cx="0" cy="0" rx="5.4" ry="2.2" transform="translate(20.0 22.6) rotate(26)"/>
      <ellipse cx="0" cy="0" rx="5.4" ry="2.2" transform="translate(27.5 13.0) rotate(-34)"/>
      <ellipse cx="0" cy="0" rx="5.4" ry="2.2" transform="translate(35.0 15.8) rotate(26)"/>
      <ellipse cx="0" cy="0" rx="5.4" ry="2.2" transform="translate(42.0 5.5) rotate(-34)"/>
      <circle cx="50.5" cy="5.6" r="2.5"/>
      <circle cx="56.5" cy="3.2" r="2.1"/>
    </g>
  </symbol>
</svg>

<main>

  <section class="tapa">
    <div class="tapa__marco">
      <svg class="tapa__ramo" viewBox="0 0 64 28" aria-hidden="true"><use href="#ramo"/></svg>

      <h1 class="tapa__h1">
        <span class="tapa__nom">${esc(n.rotulo)}</span>
        <span class="tapa__sub">${esc(n.bajoRotulo)}</span>
      </h1>

      <p class="tapa__lema">${esc(t.lema).replace(/\n/g, '<br>')}</p>

      <p class="tapa__pie">
        <span>${esc(n.calle)} · ${esc(n.barrio)} · ${esc(n.ciudad)}</span>
        <span class="tapa__sep" aria-hidden="true">·</span>
        <span>${esc(t.tapaPie)}</span>
      </p>

      <a class="tapa__abrir" href="#carta">
        ${esc(t.tapaAbrir)}
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 4v15m0 0-6-6m6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    </div>
  </section>

  <section class="intro">
    <div class="intro__in">
      <p class="intro__sobre">${esc(t.introSobre)}</p>

      <p class="intro__txt">${t.introUno}</p>
      <p class="intro__txt2">${t.introDos}</p>

      <ul class="intro__datos">
        <li><b>Dónde</b> ${esc(n.calle)} · ${esc(n.barrio)}, ${esc(n.ciudad)}</li>
        <li><b>Metro</b> ${esc(n.metro)}</li>
        <li><b>Horario</b> ${Object.values(d.horario).some((x) => x && x.length) ? '<a href="#horario">ver abajo</a>' : '<span class="falta">pendiente</span>'}</li>
        <li><b>Reservas</b> ${n.telefono ? tel : '<span class="falta">teléfono pendiente</span>'}</li>
      </ul>
    </div>
  </section>

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

  <section class="dorso" id="dorso">
    <h2 class="dorso__t">${esc(t.dorsoTitulo)}</h2>

    <div class="dorso__rejilla">
      <div class="dorso__bloque">
        <h3>Dónde</h3>
        <p class="dorso__dir">${esc(n.calle)}<br>${esc(n.barrio)} · ${esc(n.cp)} ${esc(n.ciudad)}</p>
        <p>Metro <b>${esc(n.metro)}</b>. Andando, desde el paseo marítimo subiendo por el barrio.</p>
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
    <svg class="fin__ramo" viewBox="0 0 64 28" aria-hidden="true"><use href="#ramo"/></svg>
    <p class="fin__frase">${t.fin.replace(/\n/g, '<br>')}</p>
  </section>` : ''}

</main>

<footer class="pie">
  <p>${esc(n.nombre)} · ${esc(dir)}</p>
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

<!-- El visor de fotos. Vacío hasta que alguien pulsa una miniatura. -->
<div class="visor" id="visor" hidden>
  <button type="button" class="visor__x" id="visor-x" aria-label="Cerrar la foto">
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
  </button>
  <figure class="visor__f">
    <img id="visor-img" alt="">
    <figcaption class="visor__pie">
      <span id="visor-n"></span>
      <i id="visor-p"></i>
    </figcaption>
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
