#!/usr/bin/env node
/* ==========================================================================
   Genera taberna-lazaro/index.html a partir de datos/contenido.json.

       node herramientas/construir-taberna.js

   La versión anti-caché (?v=…) no se escribe a mano: sale del contenido de la
   hoja de estilo y del script. Si cambian, cambia sola; si no, se queda igual.
   Así no vuelve a pasar lo de ver la web con el CSS viejo.
   ========================================================================== */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { render } from './render-taberna.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITIO = join(RAIZ, 'taberna-lazaro');

const leer = (p) => readFileSync(join(SITIO, p), 'utf8');

const datos = JSON.parse(leer('datos/contenido.json'));

const version = createHash('sha256')
  .update(leer('assets/css/style.css'))
  .update(leer('assets/js/main.js'))
  .digest('hex').slice(0, 8);

writeFileSync(join(SITIO, 'index.html'), render(datos, version), 'utf8');

/* El aviso legal no se genera, pero comparte la hoja de estilo. */
const legal = join(SITIO, 'aviso-legal.html');
writeFileSync(legal, readFileSync(legal, 'utf8')
  .replace(/style\.css(\?v=[^"]*)?"/, `style.css?v=${version}"`), 'utf8');

const platos = datos.grupos.reduce((n, g) => n + g.platos.length, 0);
const fotos = datos.grupos.reduce((n, g) => n + g.platos.filter((p) => p.foto).length, 0);
console.log(`index.html — ${platos} platos (${fotos} con foto) · v=${version}`);
