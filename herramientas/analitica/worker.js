/* ==========================================================================
   Recolector de analítica de Taberna Lázaro — un Worker de Cloudflare.

   Es todo lo que hace falta para saber cuánta gente entra en la web y qué
   platos mira. Cabe en un archivo, es gratis para el tráfico de un bar y lo
   mejor: los datos son tuyos y no se los das a nadie.

   Qué NO guarda, a propósito:
     · ni IP, ni «user agent», ni país, ni nada que identifique a nadie;
     · ni cookies, ni identificadores de visitante;
     · ni de dónde viene la visita.
   Solo cuenta cuántas veces ha pasado cada cosa, por día. Por eso la web no
   necesita aviso de cookies ni consentimiento.

   Cómo se despliega: ver taberna-lazaro/ANALITICA.md
   ========================================================================== */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const hoy = () => new Date().toISOString().slice(0, 10);
const json = (d, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });

export default {
  async fetch(peticion, entorno) {
    const url = new URL(peticion.url);

    if (peticion.method === 'OPTIONS') { return new Response(null, { headers: CORS }); }

    /* ------------------------------------------------------- recoger ---- */
    if (peticion.method === 'POST') {
      let cuerpo;
      try { cuerpo = await peticion.json(); } catch { return json({ ok: false }, 400); }

      const eventos = Array.isArray(cuerpo?.e) ? cuerpo.e.slice(0, 60) : [];
      if (!eventos.length) { return json({ ok: true }); }

      const clave = 'dia:' + hoy();
      const dia = (await entorno.DATOS.get(clave, 'json')) || { visitas: 0, toques: 0, listas: 0, platos: {}, rondas: {} };

      for (const ev of eventos) {
        if (ev?.t === 'visita') { dia.visitas++; }
        else if (ev?.t === 'plato' && typeof ev.id === 'string') {
          dia.toques++;
          const id = ev.id.slice(0, 40);
          dia.platos[id] = (dia.platos[id] || 0) + 1;
        } else if (ev?.t === 'ronda' && typeof ev.id === 'string') {
          dia.listas++;
          const id = ev.id.slice(0, 60);
          dia.rondas[id] = (dia.rondas[id] || 0) + 1;
        }
      }

      /* 400 días y se borra solo: no hace falta guardar esto para siempre. */
      await entorno.DATOS.put(clave, JSON.stringify(dia), { expirationTtl: 60 * 60 * 24 * 400 });
      return json({ ok: true });
    }

    /* ------------------------------------------------------- resumen ---- */
    if (url.pathname.replace(/\/+$/, '').endsWith('/resumen')) {
      const dada = url.searchParams.get('clave') || '';
      if (!entorno.CLAVE || dada !== entorno.CLAVE) { return json({ error: 'clave incorrecta' }, 401); }

      const dias = Math.min(parseInt(url.searchParams.get('dias') || '30', 10) || 30, 400);
      const fechas = [];
      for (let i = 0; i < dias; i++) {
        const d = new Date(Date.now() - i * 86400000);
        fechas.push('dia:' + d.toISOString().slice(0, 10));
      }

      const trozos = await Promise.all(fechas.map((f) => entorno.DATOS.get(f, 'json')));

      let visitas = 0, toques = 0, listas = 0;
      const platos = {}, rondas = {}, porDia = [];
      trozos.forEach((t, i) => {
        porDia.push([fechas[i].slice(4), t ? t.visitas : 0]);
        if (!t) { return; }
        visitas += t.visitas || 0;
        toques += t.toques || 0;
        listas += t.listas || 0;
        for (const k in (t.platos || {})) { platos[k] = (platos[k] || 0) + t.platos[k]; }
        for (const k in (t.rondas || {})) { rondas[k] = (rondas[k] || 0) + t.rondas[k]; }
      });

      const ordenar = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]);
      return json({ dias, visitas, toques, listas, platos: ordenar(platos), rondas: ordenar(rondas), porDia: porDia.reverse() });
    }

    return json({ ok: true, que: 'recolector de Taberna Lázaro' });
  }
};
