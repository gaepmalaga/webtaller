#!/usr/bin/env node
/* ==========================================================================
   Genera el index.html de las tabernas a partir de su datos/contenido.json.

       node herramientas/construir.js              → las dos
       node herramientas/construir.js churriana    → solo esa

   La versión anti-caché (?v=…) no se escribe a mano: sale del contenido de la
   hoja de estilo y del script de cada sitio. Si cambian, cambia sola; si no,
   se queda igual. Así no vuelve a pasar lo de ver la web con el CSS viejo.
   ========================================================================== */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { render as renderLazaro } from './render-taberna.js';
import { render as renderChurriana } from './render-churriana.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

const SITIOS = {
  'taberna-lazaro': { carpeta: 'taberna-lazaro', render: renderLazaro, nombre: 'Taberna Lázaro' },
  'churriana': { carpeta: 'churriana', render: renderChurriana, nombre: 'La Taberna de Churriana' }
};

const pedidos = process.argv.slice(2);
const desconocido = pedidos.find((s) => !SITIOS[s]);
if (desconocido) {
  console.error(`No conozco el sitio "${desconocido}". Hay: ${Object.keys(SITIOS).join(', ')}`);
  process.exit(1);
}

for (const clave of (pedidos.length ? pedidos : Object.keys(SITIOS))) {
  const sitio = SITIOS[clave];
  const dir = join(RAIZ, sitio.carpeta);
  const leer = (p) => readFileSync(join(dir, p), 'utf8');

  const datos = JSON.parse(leer('datos/contenido.json'));

  const version = createHash('sha256')
    .update(leer('assets/css/style.css'))
    .update(leer('assets/js/main.js'))
    .digest('hex').slice(0, 8);

  writeFileSync(join(dir, 'index.html'), sitio.render(datos, version), 'utf8');

  /* El aviso legal no se genera, pero comparte la hoja de estilo. */
  const legal = join(dir, 'aviso-legal.html');
  if (existsSync(legal)) {
    writeFileSync(legal, readFileSync(legal, 'utf8')
      .replace(/style\.css(\?v=[^"]*)?"/, `style.css?v=${version}"`), 'utf8');
  }

  const platos = datos.grupos.reduce((n, g) => n + g.platos.length, 0);
  const fotos = datos.grupos.reduce((n, g) => n + g.platos.filter((p) => p.foto).length, 0);
  console.log(`${sitio.carpeta}/index.html — ${platos} platos (${fotos} con foto) · v=${version}`);
}
