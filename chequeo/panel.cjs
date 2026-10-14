/* ===== EL BANCO DEL PANEL: CADA CONTROL, UNO POR UNO =========================

   POR QUÉ EXISTE (Maki, 30/9/2026)
   «Necesito que la plataforma de armado las chicas puedan hacerlas 100% tocando
   desde ahí sin código… una lista de check con cada detalle y que esté verde».
   La primera pasada de los ajustes de Jazmín se dio por buena probando cada
   arreglo por separado. Esto prueba TODO el panel, siempre, igual.

   QUÉ HACE, con una muestra que NO se guarda nunca (sólo la miniatura):
   1. Recorre cada pestaña del panel y junta TODOS los controles que se ven.
   2. A cada uno le cambia el valor como lo haría Jazmín (tipea, elige, tilda).
   3. Mide tres cosas:
        GUARDA   el borrador del panel (D) cambió        → se va a publicar
        LLEGA    la miniatura recibió el mismo valor     → el panel le habla
        SE VE    la miniatura cambió algo a la vista      → Jazmín lo ve
   4. Detecta DUPLICADOS: dos controles en pestañas distintas que escriben el
      mismo dato.
   Deja chequeo/tablero-panel.json, que lee el tablero (admin/tablero.html).

   NUNCA aprieta «Guardar y publicar»: no hay login y no tiene que haberlo.

   Uso:  node chequeo/panel.cjs [slug]      (por defecto camila-y-tomas)
   ============================================================================ */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SLUG = process.argv[2] || 'camila-y-tomas';
const BASE = process.env.INV_BASE || 'https://invitameok.net';
const SALIDA = path.join(__dirname, SLUG === '__nueva' ? 'tablero-panel-nueva.json' : 'tablero-panel.json');

/* controles que por diseño no cambian nada a la vista (datos internos) */
const INTERNOS = /N[úu]mero de orden|Usuario asignado|Direcci[óo]n del evento|Email para confirmaciones|T[ÍI]TULO DEL CORREO|Habilitar aviso por mail|Contrase[ñn]a para el evento|Clave del panel de los novios|Pedido especial|ES DEMO|NOMBRE DE LA DEMO|Tipo de evento|Deshabilitar invitaci[óo]n|Bloquear control|C[óo]digo del evento|Titulo al compartir|Descripci[óo]n al compartir|Imágen miniatura al compartir|Paquete|Pases personalizados|Detectar el del celular|Deshabilitar publicidad|Save the date ·/i;

function firmaVisual() {
  /* lo que se ve de la invitación, pieza por pieza: textos, colores, tipografías,
     tamaños, alineación, qué se muestra.
     ⚠️ (30/9/2026) Antes era un solo número y miraba pocas cosas: «Posición
     cuenta regresiva» (justify-content de .portada), «Color de la frase
     principal» (#pv-kick con color en línea) y «Tamaño de la sección final»
     (#fin-frase) salían AMARILLOS aunque funcionaban, porque la firma no miraba
     alineación ni la frase final. Ahora se mira también todo elemento que el
     motor tocó en línea (atributo style) y la alineación; y devuelve pieza por
     pieza, para poder descontar lo que se mueve solo (ver `distinto`). */
  const d = document, h = {};
  h.html = [...d.documentElement.attributes].map(a => a.name + '=' + a.value).join(' ');
  const vistos = new Set();
  const sel = '.frame section, .frame .footer, #pv-names, #pv-kick, #ep-kick, .btn, .wsp, h2, .kick, .kicker, img, .rsvpform, .pase, .ambiente, #inv-fondo, #env, .portada, .count, .frase, #fin-frase, #fin-texto, [style]';
  let n = 0;
  d.querySelectorAll(sel).forEach(e => {
    if (vistos.has(e) || e.closest('canvas')) return; vistos.add(e);
    const c = getComputedStyle(e);
    const k = (n++) + ':' + e.tagName + (e.id ? '#' + e.id : '');
    h[k] = [c.display, c.backgroundColor, c.backgroundImage.slice(0, 80), c.color, c.fontFamily, c.fontSize,
      c.justifyContent, c.alignItems, c.textAlign, (e.currentSrc || e.src || '').slice(-60), c.opacity,
      e.getAttribute('style') || ''].join('|');
  });
  h.texto = d.body.innerText;
  return h;
}

/* ¿cambió algo que no se mueve solo? `ruido` son las piezas que cambiaron
   entre dos fotos tomadas SIN tocar nada (una animación, un reloj): esas no
   cuentan, así un control no sale verde por algo que igual se iba a mover. */
function distinto(a, b, ruido) {
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (ruido.has(k)) continue;
    if (a[k] !== b[k]) return true;
  }
  return false;
}

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('dialog', d => d.dismiss().catch(() => {}));
  if (process.env.INV_HOOK) await require(process.env.INV_HOOK)(page);   /* para probar archivos locales antes de subirlos */

  async function abrir(intento) {
    try { await abrirUnaVez(); }
    catch (e) { if (intento) throw e; await page.waitForTimeout(5000); await abrir(1); }   /* una lentitud del servidor no tira la corrida entera */
  }
  async function abrirUnaVez() {
    /* `__nueva` (1/10/2026): una invitación NUEVA, sin `?e=`, como la abre Jazmín para empezar de cero */
    await page.goto(BASE + (SLUG === '__nueva' ? '/admin.html?' : '/admin.html?e=' + SLUG) + '&cb=' + Date.now(), { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(s => { try { const f = document.getElementById('pv-frame'); const e = s === '__nueva' ? 'maria-y-diego' : s; return D.slug === e && f.contentWindow.INVEV && f.contentWindow.INVEV.slug === e; } catch (e) { return false; } }, SLUG, { timeout: 90000, polling: 500 });
    await page.addStyleTag({ content: '#gate{display:none!important}' });
    await page.waitForTimeout(6000);
  }
  const previa = () => page.frame({ url: /preview=1/ });
  /* lo que le llega a la miniatura se copia al recibirlo: el motor después
     reacomoda algunos datos (la trivia, las personas) y compararlos ya
     procesados daba «no llega» cuando sí llegaba */
  async function escuchar() {
    await previa().evaluate(() => {
      if (window.__bancoOye) return; window.__bancoOye = 1;
      addEventListener('message', e => { if (e.data && e.data.type === 'inv-preview') window.__bancoUltimo = JSON.stringify(e.data.ev); });
    });
  }

  await abrir();
  const pestanas = (await page.evaluate(() => ORDER)).filter(t => t !== 'INVITADOS');
  const items = [];

  for (const tab of pestanas) {
    await abrir();
    const entrar = async () => {
      await escuchar();
      await page.evaluate(t => go(t), tab);
      let m0 = -1;
      for (let k = 0; k < 12; k++) {
        await page.waitForTimeout(1500);
        const n = await page.evaluate(() => document.querySelectorAll('#panel input, #panel select, #panel textarea').length);
        if (n === m0) break; m0 = n;
      }
    };
    await escuchar();
    try { await page.evaluate(t => go(t), tab); }
    catch (e) { items.push({ tab, bloque: '', control: '(la pestaña entera)', tipo: '', estado: 'rojo', nota: 'la pestaña no abre: ' + String(e.message).split('\n')[0].slice(0, 100) }); continue; }
    /* los bloques de /efectos/ se montan de a poco (cada 700 ms): se espera a que
       la cantidad de controles deje de cambiar, si no los índices se corren */
    let n0 = -1;
    for (let k = 0; k < 12; k++) {
      await page.waitForTimeout(1500);
      const n = await page.evaluate(() => document.querySelectorAll('#panel input, #panel select, #panel textarea').length);
      if (n === n0) break; n0 = n;
    }
    /* la lista de controles de la pestaña, en orden: los tildes al final */
    /* Cada control se identifica por pestaña + bloque + rótulo + tipo + cuántos
       iguales hay antes. NO por su posición: los bloques de /efectos/ se montan
       tarde y el panel se redibuja al tocar algunos controles, y con el índice
       la prueba tocaba un control y medía otro (primera corrida: 60 falsos rojos). */
    const etiquetar = () => page.evaluate(() => {
      const r = [], vistos = {};
      document.querySelectorAll('#panel input, #panel select, #panel textarea').forEach((e, i) => {
        if (!e.offsetParent || e.type === 'file' || e.type === 'hidden' || e.type === 'button' || e.disabled || e.readOnly) return;
        const g = e.closest('.grp, label, [id$="-selector"] > div, [id$="-ajustes"] > div') || e.parentElement;
        let lab = '';
        const l = g && (g.tagName === 'LABEL' ? g : g.querySelector('label'));
        lab = (l ? l.textContent : (e.placeholder || e.getAttribute('aria-label') || e.name || '')).trim().replace(/\s+/g, ' ').slice(0, 90);
        const casa = e.closest('[id$="-selector"], [id$="-ajustes"], .casa-modulos, .mejoras');
        const bloque = casa ? (casa.id || (casa.querySelector('.h') || {}).textContent || '').trim().slice(0, 50) : '';
        const tipo = e.tagName === 'SELECT' ? 'lista' : (e.type || 'texto');
        const base = bloque + '|' + lab + '|' + tipo; vistos[base] = (vistos[base] || 0) + 1;
        const clave = base + '|' + vistos[base];
        e.setAttribute('data-banco', clave);
        r.push({ i: clave, tipo, lab, bloque });
      });
      return r.sort((a, b) => (a.tipo === 'checkbox') - (b.tipo === 'checkbox'));
    });
    const lista = await etiquetar();

    for (let q = 0; q < lista.length; q++) {
      const c = lista[q];
      const it = { tab, bloque: c.bloque, control: c.lab || '(sin rótulo)', tipo: c.tipo };
      try {
        const antes = await page.evaluate(() => { const { invitados, ...x } = D; return JSON.stringify(x); });
        const vis00 = await previa().evaluate(firmaVisual);
        await page.waitForTimeout(1100);
        const vis0 = await previa().evaluate(firmaVisual);
        const ruido = new Set(Object.keys(vis0).filter(k => vis0[k] !== vis00[k]));
        /* si el panel se redibujó, se vuelve a etiquetar en el mismo orden */
        if (!(await page.evaluate(i => [...document.querySelectorAll('[data-banco]')].some(e => e.getAttribute('data-banco') === i), c.i))) await etiquetar();
        const hecho = await page.evaluate(({ i, tipo }) => {
          const e = [...document.querySelectorAll('[data-banco]')].find(x => x.getAttribute('data-banco') === i);
          if (!e) return 'no está';
          if (tipo === 'lista' && e.tagName !== 'SELECT') return 'el panel se redibujó y el control cambió de lugar';
          e.focus();
          window.__bancoTipo = tipo;
          if (e.hasAttribute('data-f')) {
            /* la fecha son cinco listas y se guarda cuando están día, mes y año:
               como Jazmín, se completan las que falten y se cambia ésta */
            const g = e.parentElement;
            ['d', 'm', 'a'].forEach(k => { const x = g.querySelector('[data-f="' + k + '"]'); if (x && !x.value) { x.value = x.options[2].value; x.dispatchEvent(new Event('change', { bubbles: true })); } });
          }
          if (tipo === 'lista') {
            const ops = [...e.options].filter(o => o.value !== '__otra__' && o.value !== e.value && !o.disabled);
            if (!ops.length) return 'una sola opción';
            e.value = ops[Math.min(1, ops.length - 1)].value;
          } else if (tipo === 'radio' && e.checked) { return 'ya elegida (un botón redondo marcado no se puede «destocar»)';
          } else if (tipo === 'checkbox' || tipo === 'radio') { e.checked = !e.checked; e.dispatchEvent(new Event('click', { bubbles: true })); }
          else if (tipo === 'color') e.value = e.value === '#8a2be2' ? '#2e8b57' : '#8a2be2';
          else if (tipo === 'range' || tipo === 'number') { const mn = +e.min || 0, mx = +e.max || 100; e.value = String(Math.round(mn + (mx - mn) * (+e.value > (mn + mx) / 2 ? 0.2 : 0.8))); }
          else if (tipo === 'datetime-local' || tipo === 'date') e.value = '2027-03-14T19:30';
          else e.value = 'Prueba del banco ' + i;
          e.dispatchEvent(new Event('input', { bubbles: true }));
          e.dispatchEvent(new Event('change', { bubbles: true }));
          return 'ok';
        }, c);
        if (hecho === 'no está' && !c.reintento) {
          /* otro control lo escondió (un bloque que se pliega): se abre la pestaña de cero y se prueba de nuevo */
          c.reintento = 1; await abrir(); await entrar(); await etiquetar();
          lista.splice(lista.indexOf(c) + 1, 0, c); continue;
        }
        if (/^ya elegida/.test(hecho)) { it.estado = 'verde'; it.nota = hecho; items.push(it); continue; }
        if (hecho !== 'ok') { it.estado = 'gris'; it.nota = hecho; items.push(it); continue; }
        await page.waitForTimeout(1800);
        const r = await page.evaluate(a0 => {
          const { invitados, ...x } = D; const a = JSON.parse(a0);
          const cambios = [];
          (function cmp(p, u, v, d) {
            if (u && v && typeof u === 'object' && typeof v === 'object' && !Array.isArray(u) && d < 4) {
              for (const k of new Set([...Object.keys(u), ...Object.keys(v)])) cmp(p ? p + '.' + k : k, u[k], v[k], d + 1);
              return;
            }
            if (JSON.stringify(u) !== JSON.stringify(v)) cambios.push(p);
          })('', a, x, 0);
          const w = document.getElementById('pv-frame').contentWindow;
          const f = w.__bancoUltimo ? JSON.parse(w.__bancoUltimo) : (w.INVEV || {});
          const get = (o, p) => p.split('.').reduce((m, k) => (m == null ? m : m[k]), o);
          const llega = cambios.filter(p => p !== 'invitados').every(p => JSON.stringify(get(f, p)) === JSON.stringify(get(x, p)));
          return { cambios, llega };
        }, antes);
        const vis1 = await previa().evaluate(firmaVisual);
        it.guarda = r.cambios.length > 0;
        it.dato = r.cambios.slice(0, 4).join(', ');
        it.llega = it.guarda ? r.llega : false;
        it.seVe = distinto(vis0, vis1, ruido);
        const interno = INTERNOS.test(it.control);
        if (!it.guarda && !c.reintento) {
          /* antes de marcar rojo, se prueba otra vez desde la pestaña recién abierta:
             un control tocado antes puede haber redibujado el bloque */
          c.reintento = 1; await abrir(); await entrar(); await etiquetar();
          lista.splice(q + 1, 0, c); continue;
        }
        if (!it.guarda) { it.estado = 'rojo'; it.nota = 'lo toco y no se guarda nada'; }
        else if (interno) { it.estado = 'verde'; it.nota = 'dato interno: se guarda; no se ve en la invitación'; }
        else if (!it.llega) { it.estado = 'rojo'; it.nota = 'se guarda pero no le llega a la miniatura'; }
        else if (!it.seVe && !interno) { it.estado = 'amarillo'; it.nota = 'se guarda y llega, pero la miniatura no cambió: revisar a mano'; }
        else { it.estado = 'verde'; if (interno) it.nota = 'dato interno: no se ve en la invitación'; }
      } catch (e) { it.estado = 'gris'; it.nota = 'no se pudo probar: ' + String(e.message).split('\n')[0].slice(0, 80); }
      items.push(it);
    }
    console.log(tab, items.filter(x => x.tab === tab).length, 'controles');
  }

  /* duplicados: dos pestañas escriben el mismo dato */
  const porDato = {};
  items.filter(x => x.dato).forEach(x => x.dato.split(', ').forEach(d => { (porDato[d] = porDato[d] || new Set()).add(x.tab); }));
  items.forEach(x => {
    const dup = (x.dato || '').split(', ').filter(d => d && porDato[d] && porDato[d].size > 1);
    if (dup.length) { x.duplicado = dup.map(d => d + ' (' + [...porDato[d]].join(' + ') + ')').join('; '); if (x.estado === 'verde') { x.estado = 'rojo'; x.nota = 'DUPLICADO: el mismo dato se toca desde dos pestañas'; } }
  });

  const cuenta = e => items.filter(x => x.estado === e).length;
  const res = { cuando: new Date().toISOString(), slug: SLUG, total: items.length,
    verde: cuenta('verde'), amarillo: cuenta('amarillo'), rojo: cuenta('rojo'), gris: cuenta('gris'), items };
  fs.writeFileSync(SALIDA, JSON.stringify(res, null, 1));
  console.log('PANEL:', res.total, 'controles ·', res.verde, 'verdes ·', res.amarillo, 'amarillos ·', res.rojo, 'rojos ·', res.gris, 'grises');
  await b.close();
})();
