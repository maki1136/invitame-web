#!/usr/bin/env node
/* ===== CHEQUEO DE CAMPOS DE INVÍTAME ========================================

   PARA QUÉ SIRVE
   Contesta, sin abrir nada a mano, las dos preguntas que siempre se escapan:
     1. ¿Hay algún campo en el panel que Jazmín pueda llenar y que la
        invitación no lea?  (ella carga algo y "no funciona")
     2. ¿La invitación lee algún dato que el panel no tenga cómo cargar?
        (falta un campo)
   Y además avisa de las trampas conocidas: dos rótulos que caen en la misma
   casilla, rótulos tan largos que la clave se corta, y archivos de /efectos/
   que nadie carga.

   CÓMO SE USA        node chequeo/campos.js        (desde la raíz del repo)
   Sale con código 1 si encuentra algo. Sirve para correrlo antes de entregar.

   ⚠️ LAS TRES EXCEPCIONES QUE HAY QUE CONOCER — sin esto da falsos positivos:
     · Hay claves que se arman concatenando: 'c_ceremonia-'+(i+1)+'-fecha'.
       Por eso las claves con un número adentro se comparan con el molde.
     · Tres módulos de /efectos/ NO se cargan desde efectos/index.js:
       crear-muestra.js (lo carga firebase-inv.js), panel-audio-invitado.js
       (lo carga mi-panel.html) y terciopelo.js (lo pide botones.js cuando
       hace falta). No están muertos.
     · Parte de los datos los lee el servidor: i/index.php (las etiquetas para
       compartir), aviso-rsvp.php (el mail) y scan.html (el control de acceso).
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = process.argv[2] || '.';
const leer = p => { try { return fs.readFileSync(path.join(RAIZ, p), 'utf8'); } catch (e) { return ''; } };

const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

/* ---- 1. los campos del panel ------------------------------------------- */
const admin = leer('admin.html'), lineas = admin.split('\n');
const lnBind = lineas.findIndex(l => /const BIND\s*=/.test(l));
const BIND = {};
for (const m of lineas[lnBind].matchAll(/"((?:[^"\\]|\\.)*)"\s*:\s*"([^"]*)"/g)) BIND[m[1].replace(/\\"/g, '"')] = m[2];
const lnF = lineas.findIndex(l => /const FIELDS\s*=/.test(l));
let fin = lnF; while (!/^\s*\};/.test(lineas[fin])) fin++;
const bloqueF = lineas.slice(lnF, fin + 1).join('\n');
const TABS = {};
for (const m of bloqueF.matchAll(/["']?([A-ZÓÍ_]+)["']?\s*:\s*\[([^\]]*)\]/g))
  TABS[m[1]] = [...m[2].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(x => x[1].replace(/\\"/g, '"'));
const campos = [];
for (const t in TABS) for (const l of TABS[t]) campos.push({ tab: t, rotulo: l, clave: BIND[l] || ('c_' + slug(l)) });

/* ---- 2. todo el código que consume datos ------------------------------- */
const dirs = ['efectos', 'colecciones', 'sobres', 'muestras'];
let lector = ['i/index.html', 'i/index.php', 'aviso-rsvp.php', 'scan.html',
              'mi-panel.js', 'firebase-inv.js', 'crear.js'].map(leer).join('\n');
for (const d of dirs) { try { for (const f of fs.readdirSync(path.join(RAIZ, d))) if (f.endsWith('.js')) lector += '\n' + leer(d + '/' + f); } catch (e) {} }

const seLee = k => {
  if (lector.includes(k) || lector.includes('img_' + k)) return true;
  /* claves armadas por concatenación: c_ceremonia-1-fecha -> c_ceremonia-'+ */
  const num = k.match(/^(.*?)-?(\d+)-?(.*)$/);
  if (num) { const molde = num[1] + "-'+"; if (lector.includes(molde)) return true; }
  const ev = k.match(/^ev(\d)(.+)$/);
  if (ev && lector.includes("'ev'+") && lector.includes("+'" + ev[2] + "'")) return true;
  return false;
};

/* ---- 3. los avisos ------------------------------------------------------ */
const avisos = [];
/* campos que a propósito NO se leen: son notas internas para el equipo */
const SOLO_INTERNO = ['c_pedido-especial-del-cliente'];
const sinLector = campos.filter(c => !seLee(c.clave) && !SOLO_INTERNO.includes(c.clave));
if (sinLector.length) avisos.push(['CAMPOS QUE SE PUEDEN LLENAR Y NADIE LEE',
  sinLector.map(c => `${c.tab.padEnd(18)} ${c.rotulo.slice(0, 48).padEnd(50)} -> ${c.clave}`)]);

const sinCampo = Object.keys(BIND).filter(l => !campos.some(c => c.rotulo === l))
  .filter(l => { const k = BIND[l]; return lector.includes('ev.' + k) && !admin.includes(`setB('${k}'`) && !admin.includes(`setB(\\'${k}\\'`); });
if (sinCampo.length) avisos.push(['LA INVITACIÓN LO LEE Y EL PANEL NO TIENE CÓMO CARGARLO',
  sinCampo.map(l => `${l.slice(0, 50).padEnd(52)} -> ${BIND[l]}`)]);

const choque = {};
for (const c of campos) { if (BIND[c.rotulo]) continue; (choque[c.clave] = choque[c.clave] || new Set()).add(c.rotulo); }
const ch = Object.entries(choque).filter(([, v]) => v.size > 1);
if (ch.length) avisos.push(['DOS RÓTULOS DISTINTOS QUE GUARDAN EN LA MISMA CASILLA',
  ch.map(([k, v]) => `${k} <- ${[...v].join(' || ')}`)]);

const cortados = campos.filter(c => !BIND[c.rotulo] && slug(c.rotulo).length >= 40);
if (cortados.length) avisos.push(['RÓTULOS TAN LARGOS QUE LA CLAVE SE CORTA (si otro empieza igual, se pisan)',
  cortados.map(c => `${c.rotulo.slice(0, 52).padEnd(54)} -> ${c.clave}`)]);

/* ---- 4. archivos de /efectos/ que nadie carga --------------------------- */
const APARTE = { 'crear-muestra.js': 'firebase-inv.js', 'panel-audio-invitado.js': 'mi-panel.html', 'terciopelo.js': 'botones.js (a pedido)' };
const idx = leer('efectos/index.js');
let sueltos = [];
try {
  sueltos = fs.readdirSync(path.join(RAIZ, 'efectos')).filter(f => f.endsWith('.js') && f !== 'index.js')
    .filter(f => !idx.includes("'" + f.replace('.js', '') + "'") && !idx.includes('/' + f) && !APARTE[f]);
} catch (e) {}
if (sueltos.length) avisos.push(['ARCHIVOS DE /efectos/ QUE NADIE CARGA', sueltos]);

/* ---- 5. el informe ------------------------------------------------------ */
console.log(`campos del panel: ${campos.length}   ·   con clave fija: ${campos.filter(c => BIND[c.rotulo]).length}   ·   derivada del rótulo: ${campos.filter(c => !BIND[c.rotulo]).length}`);
console.log('');
if (!avisos.length) { console.log('SIN AVISOS — todo campo tiene lector y todo lector tiene campo.'); process.exit(0); }
for (const [t, filas] of avisos) { console.log(`=== ${t} (${filas.length}) ===`); filas.forEach(f => console.log('   ' + f)); console.log(''); }
process.exit(1);
