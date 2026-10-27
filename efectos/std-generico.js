/* ===== SAVE THE DATE GENÉRICO — SIN INVITACIÓN ARMADA (27/10/2026) ============
   Maki, 27/10: «los Save the Date la gente me los pide ANTES de la invitación…
   necesito 10 formatos más genéricos, sobrios, lindos, delicados, que se hagan
   automáticamente con el nombre de la gente… la fecha (sin minutos ni segundos)…
   que tengan las dos opciones: foto de pareja o fondo… solo vertical…
   todo medido: colores, fondos y texto para que no se pisen».

   QUÉ ES: un dibujante en un <canvas> de 1080×1920. No necesita la invitación
   publicada: sale de los datos del evento (nombres, fecha, tipo, ciudad), que
   ya existen apenas entra el formulario.

     INVSTDG.DISENOS                         → los 10 diseños {id, nombre, ...}
     INVSTDG.textosDe(ev)                    → los textos que salen solos
     INVSTDG.armar(lienzo, {diseno, foto, textos}) → Promise (dibuja)
     INVSTDG.elegirSolo(ev)                  → el diseño que va si nadie eligió

   LO QUE SE GUARDA (panel): D.fx.stdg = {diseno, foto, titulo, sub, nombres,
   fecha, detalle, pie}. Vacío = lo que sale solo.

   REGLAS DE LECTURA (las de siempre del check, en chico):
   · Cada texto se achica hasta entrar en su ancho (nunca se corta ni se sale).
   · Los nombres largos pasan a dos renglones («Citlalli» / «& Hedwin Jesús»).
   · Con foto: la foto va en un ARCO arriba y los textos abajo, sobre el papel
     del diseño. El texto nunca va sobre la foto: no hay forma de pisarse.
   · Tintas elegidas a mano por diseño y medidas contra su fondo (contraste ≥ 7).
   ============================================================================ */
(function () {
  'use strict';
  if (window.INVSTDG) return;

  var W = 1080, H = 1920;
  var CL = 'https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto:best,f_jpg,w_1080,h_1920,c_fill/invitame/stdcand/';

  /* fuentes (Google Fonts) */
  var FUENTES = ['Cormorant Garamond:ital,wght@0,400;0,500;0,600;1,400', 'Great Vibes', 'Pinyon Script',
    'Montserrat:wght@300;400;500', 'Playfair Display:ital,wght@0,400;1,400', 'Italiana', 'Allura', 'Jost:wght@300;400'];

  /* ★ LOS 10 DISEÑOS. fondo: archivo en Cloudinary (invitame/std/<id>); papel:
     color de respaldo mientras carga o si no carga. tinta/acento: medidos
     contra el fondo. lay: 'clasico' | 'marco' | 'moderno'. */
  var DISENOS = [
    { id: 'marfil-oro', fondo: 'kufr8mhkoclzkhfjpzvz',     nombre: 'Marfil y oro',        papel: '#f3ece0', tinta: '#3d3329', suave: '#6b5d4f', acento: '#a8843f', lay: 'marco',   tit: 'Pinyon Script',  nom: 'Pinyon Script',      txt: 'Cormorant Garamond' },
    { id: 'salvia', fondo: 'gj1ttc3xl5u2yby0t9uv',         nombre: 'Salvia',              papel: '#e4e7dc', tinta: '#2e3a2f', suave: '#4f5e4f', acento: '#7d8f72', lay: 'clasico', tit: 'Great Vibes',    nom: 'Great Vibes',        txt: 'Cormorant Garamond' },
    { id: 'terracota', fondo: 'utuog1gmfnqpht2khrun',      nombre: 'Terracota',           papel: '#efe2d3', tinta: '#4e2f22', suave: '#7a5040', acento: '#b0654a', lay: 'moderno', tit: 'Italiana',       nom: 'Playfair Display',   txt: 'Jost' },
    { id: 'azul-polvo', fondo: 'yazlxfeuwkl06iuohfpk',     nombre: 'Azul polvo',          papel: '#e3e8ee', tinta: '#26364a', suave: '#4a5b70', acento: '#7f97b0', lay: 'clasico', tit: 'Allura',         nom: 'Allura',             txt: 'Cormorant Garamond' },
    { id: 'noche-oro', fondo: 'cevtmqhwlyb8yturqc5u',      nombre: 'Noche y oro',         papel: '#17161a', tinta: '#f1e8d6', suave: '#d6cbb5', acento: '#c9a45c', lay: 'marco',   tit: 'Pinyon Script',  nom: 'Pinyon Script',      txt: 'Cormorant Garamond', oscuro: true },
    { id: 'borgona', fondo: 'rsjxavkzh7tohnz7t9sm',        nombre: 'Borgoña',             papel: '#4a1620', tinta: '#f6ebe2', suave: '#e8d6cb', acento: '#d9b48a', lay: 'clasico', tit: 'Great Vibes',    nom: 'Great Vibes',        txt: 'Cormorant Garamond', oscuro: true },
    { id: 'lavanda', fondo: 'puas94gd0cjzf7bg6p2z',        nombre: 'Lavanda',             papel: '#e8e4ee', tinta: '#38324a', suave: '#5c5470', acento: '#9a8fb5', lay: 'moderno', tit: 'Italiana',       nom: 'Allura',             txt: 'Jost' },
    { id: 'rosa-empolvado', fondo: 'kv4jyurjtv3wf3qgbg2r', nombre: 'Rosa empolvado',      papel: '#f2e3df', tinta: '#4e2f33', suave: '#7a5157', acento: '#c58f8f', lay: 'marco',   tit: 'Allura',         nom: 'Great Vibes',        txt: 'Cormorant Garamond' },
    { id: 'olivo', fondo: 'pmaxd4ywahafmfyfvn08',          nombre: 'Olivo profundo',      papel: '#2f3626', tinta: '#f1ecdc', suave: '#d7d2bd', acento: '#c2b27d', lay: 'clasico', tit: 'Pinyon Script',  nom: 'Pinyon Script',      txt: 'Cormorant Garamond', oscuro: true },
    { id: 'blanco', fondo: 'crkp5jlbh21ewja1fsah',         nombre: 'Blanco minimal',      papel: '#fbfaf7', tinta: '#1f1f1f', suave: '#555555', acento: '#9a9a9a', lay: 'moderno', tit: 'Italiana',       nom: 'Playfair Display',   txt: 'Montserrat' }
  ];

  /* el texto de arriba según el evento */
  function subDe(ev) {
    var t = String((ev && (ev.tipoEvento || ev.tipo || '')) || '').toLowerCase() + ' ' + String((ev && ev.kick) || '').toLowerCase();
    if (/xv|quince|15/.test(t)) return 'Mis XV años';
    if (/bautiz|bautism/.test(t)) return 'Mi bautizo';
    if (/comuni/.test(t)) return 'Mi primera comunión';
    if (/baby|shower/.test(t)) return 'Baby shower';
    if (/gradu/.test(t)) return 'Mi graduación';
    if (/cumple|kids|años/.test(t)) return 'Mi cumpleaños';
    if (/corpor|empres/.test(t)) return 'Te esperamos';
    return 'Nos casamos';
  }
  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  function fechaDe(f) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(f || ''));
    if (!m) return { corta: '', larga: '' };
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return { corta: m[3] + ' · ' + m[2] + ' · ' + m[1],
             larga: DIAS[d.getDay()].replace(/^./, function (c) { return c.toUpperCase(); }) + ' ' + (+m[3]) + ' de ' + MESES[+m[2] - 1] + ' de ' + m[1] };
  }
  function ciudadDe(ev) {
    var dir = String((ev && (ev.ev1dir || ev.ev2dir)) || '');
    var partes = dir.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    /* «…, 77710 Playa del Carmen, Quintana Roo» → «Playa del Carmen, Quintana Roo» */
    if (partes.length >= 2) {
      var a = partes[partes.length - 2].replace(/^\d{4,6}\s*/, ''), b = partes[partes.length - 1];
      if (/^(méxico|mexico|argentina)$/i.test(b) && partes.length >= 3) { b = a; a = partes[partes.length - 3].replace(/^\d{4,6}\s*/, ''); }
      return (a && !/\d/.test(a) ? a + ', ' : '') + b;
    }
    return '';
  }
  function textosDe(ev) {
    ev = ev || {};
    var n1 = String(ev.n1 || '').trim(), n2 = String(ev.n2 || '').trim();
    var f = fechaDe(ev.fecha);
    var ciudad = ciudadDe(ev);
    return {
      titulo: 'Save the Date',
      sub: subDe(ev),
      nombres: n2 ? n1 + ' & ' + n2 : n1,
      fecha: f.corta,
      detalle: [f.larga, ciudad].filter(Boolean).join(' · '),
      pie: 'Invitación formal próximamente'
    };
  }
  /* sin elección: el diseño cuyo papel se parece más a la paleta de la muestra */
  function elegirSolo(ev) {
    var col = String((ev && ev.fx && (ev.fx.coleccion || '')) || '') + ' ' + String((ev && ev.tpl) || '');
    var mapa = [[/oliva|olivo|campestre|bohemia/i, 'olivo'], [/salvia|jardin|eucalipto/i, 'salvia'], [/borgo|vino|ciruela/i, 'borgona'],
      [/onix|disco|noche|negro|nocturno/i, 'noche-oro'], [/lavanda|lila/i, 'lavanda'], [/rosa|rose|acuarela/i, 'rosa-empolvado'],
      [/terracota|mexicana|talavera/i, 'terracota'], [/azul|mar|playa|celeste/i, 'azul-polvo'], [/blanco|minimal|piedra|marmol/i, 'blanco']];
    for (var i = 0; i < mapa.length; i++) if (mapa[i][0].test(col)) return mapa[i][1];
    return 'marfil-oro';
  }

  /* ---------- carga ---------- */
  var fuentesListas = null;
  function cargarFuentes() {
    if (fuentesListas) return fuentesListas;
    var l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?' + FUENTES.map(function (f) { return 'family=' + f.replace(/ /g, '+'); }).join('&') + '&display=swap';
    document.head.appendChild(l);
    var pedir = [];
    DISENOS.forEach(function (d) { [d.tit, d.nom, d.txt].forEach(function (n) { pedir.push('48px "' + n + '"', 'italic 48px "' + n + '"', '600 48px "' + n + '"'); }); });
    fuentesListas = new Promise(function (ok) { l.onload = ok; l.onerror = ok; setTimeout(ok, 4000); })
      .then(function () { return Promise.all(pedir.map(function (p) { return document.fonts.load(p).catch(function () {}); })); })
      .then(function () { return document.fonts.ready; });
    return fuentesListas;
  }
  var cacheImg = {};
  function imagen(url) {
    if (!url) return Promise.resolve(null);
    if (cacheImg[url]) return cacheImg[url];
    cacheImg[url] = new Promise(function (ok) {
      var im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = function () { ok(im); }; im.onerror = function () { ok(null); };
      im.src = url;
    });
    return cacheImg[url];
  }

  /* ---------- dibujo ---------- */
  function cubrir(ctx, im, x, y, w, h) {
    var r = Math.max(w / im.naturalWidth, h / im.naturalHeight);
    var sw = w / r, sh = h / r;
    ctx.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
  }
  /* escribe centrado y achica hasta que entre en maxW */
  function texto(ctx, t, x, y, o) {
    if (!t) return 0;
    var tam = o.tam, fam = o.fam, est = o.est || '', esp = o.esp || 0;
    if (o.mayus) t = t.toUpperCase();
    function medir() { ctx.font = est + ' ' + tam + 'px "' + fam + '"'; var w = ctx.measureText(t).width + esp * (t.length - 1); return w; }
    while (medir() > o.max && tam > (o.min || 18)) tam -= 2;
    ctx.fillStyle = o.color;
    ctx.textBaseline = 'alphabetic';
    if (!esp) { ctx.textAlign = 'center'; ctx.fillText(t, x, y); }
    else {
      ctx.textAlign = 'left';
      var w = medir(), cx = x - w / 2;
      for (var i = 0; i < t.length; i++) { ctx.fillText(t[i], cx, y); cx += ctx.measureText(t[i]).width + esp; }
    }
    return tam;
  }
  /* los nombres: un renglón si entran grandes; si no, dos («A» / «& B») */
  function nombres(ctx, t, x, y, o) {
    var tam = o.tam;
    ctx.font = tam + 'px "' + o.fam + '"';
    var partes = t.split(/\s*&\s*/);
    if (ctx.measureText(t).width <= o.max || partes.length < 2) {
      var usado = texto(ctx, t, x, y, { tam: tam, fam: o.fam, color: o.color, max: o.max, min: o.min });
      return { alto: usado * 1.0, tam: usado };
    }
    var a = partes[0], b = '& ' + partes.slice(1).join(' & ');
    var t1 = texto(ctx, a, x, y - tam * 0.45, { tam: tam, fam: o.fam, color: o.color, max: o.max, min: o.min });
    var t2 = texto(ctx, b, x, y - tam * 0.45 + Math.min(t1, tam) * 1.05, { tam: Math.min(t1, tam), fam: o.fam, color: o.color, max: o.max, min: o.min });
    return { alto: tam * 1.6, tam: Math.min(t1, t2), dos: true };
  }
  function linea(ctx, x1, y, x2, color, gr) { ctx.strokeStyle = color; ctx.lineWidth = gr || 2; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); }
  function rombo(ctx, x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fill(); }
  function adorno(ctx, y, d) { linea(ctx, W / 2 - 150, y, W / 2 - 22, d.acento, 2); linea(ctx, W / 2 + 22, y, W / 2 + 150, d.acento, 2); rombo(ctx, W / 2, y, 8, d.acento); }
  function arco(ctx, x, y, w, h) {
    var r = w / 2;
    ctx.beginPath(); ctx.moveTo(x, y + r); ctx.arc(x + r, y + r, r, Math.PI, 0); ctx.lineTo(x + w, y + h - 24);
    ctx.quadraticCurveTo(x + w, y + h, x + w - 24, y + h); ctx.lineTo(x + 24, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - 24); ctx.closePath();
  }

  /* ★ 27/10 (Maki): «que los textos los podamos acomodar a nuestro gusto… y
     escribir algo si queremos». Cada texto es una PIEZA con su lugar por
     defecto; op.ajustes[id] = {dx, dy, esc, txt, oculto} la corre, la agranda
     o la reescribe; op.extras = [{txt, x, y, tam, color}] son textos propios.
     armar() devuelve las cajas de cada pieza para poder arrastrarlas. */
  function piezasDe(d, tx, foto, modoFoto) {
    var P = [], M = 860;
    function add(id, t, x, y, o) { P.push({ id: id, txt: t, x: x, y: y, o: o }); }
    function deco(id, y, tipo) { P.push({ id: id, deco: tipo, x: W / 2, y: y }); }
    if (foto && modoFoto !== 'fondo') {
      var y0 = 150 + 900 + 120;
      add('titulo', tx.titulo, W / 2, y0, { tam: 96, fam: d.tit, color: d.tinta, max: M });
      add('sub', tx.sub, W / 2, y0 + 70, { tam: 34, fam: d.txt, color: d.suave, max: M, mayus: true, esp: 8 });
      add('nombres', tx.nombres, W / 2, y0 + 210, { tam: 120, fam: d.nom, color: d.tinta, max: M, min: 54, nombres: true });
      deco('adorno1', y0 + 270, 'adorno');
      add('fecha', tx.fecha, W / 2, y0 + 350, { tam: 64, fam: d.txt, color: d.tinta, max: M, esp: 4 });
      add('detalle', tx.detalle, W / 2, y0 + 412, { tam: 30, fam: d.txt, color: d.suave, max: M });
      add('pie', tx.pie, W / 2, H - 70, { tam: 26, fam: d.txt, color: d.suave, max: M, mayus: true, esp: 5 });
      return P;
    }
    var claro = foto && modoFoto === 'fondo';       /* foto de fondo: tinta clara sobre velo */
    var tin = claro ? '#ffffff' : d.tinta, sua = claro ? 'rgba(255,255,255,.88)' : d.suave;
    if (d.lay === 'moderno') {
      var top = 470;
      add('sub', tx.sub, W / 2, top - 120, { tam: 34, fam: d.txt, color: sua, max: M, mayus: true, esp: 10 });
      add('titulo', tx.titulo, W / 2, top, { tam: 120, fam: d.tit, color: tin, max: M, mayus: true, esp: 6 });
      deco('raya1', top + 70, 'raya');
      add('nombres', tx.nombres, W / 2, top + 330, { tam: 150, fam: d.nom, color: tin, max: M, min: 60, nombres: true });
      add('fecha', tx.fecha, W / 2, top + 640, { tam: 84, fam: d.txt, color: tin, max: M, esp: 8, est: '300' });
      deco('raya2', top + 700, 'raya');
      add('detalle', tx.detalle, W / 2, top + 780, { tam: 32, fam: d.txt, color: sua, max: M });
    } else {
      var top2 = 560;
      add('titulo', tx.titulo, W / 2, top2, { tam: 150, fam: d.tit, color: tin, max: M });
      add('sub', tx.sub, W / 2, top2 + 100, { tam: 36, fam: d.txt, color: sua, max: M, mayus: true, esp: 10 });
      deco('adorno1', top2 + 175, 'adorno');
      add('nombres', tx.nombres, W / 2, top2 + 420, { tam: 150, fam: d.nom, color: tin, max: M, min: 60, nombres: true });
      deco('adorno2', top2 + 690, 'adorno');
      add('fecha', tx.fecha, W / 2, top2 + 780, { tam: 80, fam: d.txt, color: tin, max: M, esp: 6 });
      add('detalle', tx.detalle, W / 2, top2 + 860, { tam: 34, fam: d.txt, color: sua, max: M, est: 'italic' });
    }
    add('pie', tx.pie, W / 2, H - (d.lay === 'marco' ? 150 : 110), { tam: 26, fam: d.txt, color: sua, max: M, mayus: true, esp: 6 });
    return P;
  }

  function armar(lienzo, op) {
    op = op || {};
    var d = DISENOS.filter(function (x) { return x.id === op.diseno; })[0] || DISENOS[0];
    var tx = op.textos || {}, aj = op.ajustes || {}, modoFoto = op.modoFoto || 'arco';
    lienzo.width = W; lienzo.height = H;
    var ctx = lienzo.getContext('2d');
    return Promise.all([cargarFuentes(), imagen(op.fondo || (d.fondo ? CL + d.fondo : '')), imagen(op.foto)]).then(function (r) {
      var fondo = r[1], foto = r[2];
      ctx.fillStyle = d.papel; ctx.fillRect(0, 0, W, H);
      if (foto && modoFoto === 'fondo') {
        cubrir(ctx, foto, 0, 0, W, H);
        /* velo: oscurece parejo y un poco más donde suelen ir los textos */
        var v = op.velo == null ? 0.38 : +op.velo;
        ctx.fillStyle = 'rgba(0,0,0,' + v + ')'; ctx.fillRect(0, 0, W, H);
        var g = ctx.createLinearGradient(0, H * 0.45, 0, H);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + Math.min(0.5, v * 0.9) + ')');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      } else {
        if (fondo) cubrir(ctx, fondo, 0, 0, W, H);
        if (foto) {
          var aw = 700, ah = 900, ax = (W - aw) / 2, ay = 150;
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.22)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
          arco(ctx, ax, ay, aw, ah); ctx.fillStyle = d.papel; ctx.fill(); ctx.restore();
          ctx.save(); arco(ctx, ax, ay, aw, ah); ctx.clip(); cubrir(ctx, foto, ax, ay, aw, ah); ctx.restore();
          ctx.save(); arco(ctx, ax - 16, ay - 16, aw + 32, ah + 32); ctx.strokeStyle = d.acento; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        }
        if (d.lay === 'marco' && !foto) {
          ctx.strokeStyle = d.acento; ctx.lineWidth = 3; ctx.strokeRect(70, 70, W - 140, H - 140);
          ctx.lineWidth = 1.5; ctx.strokeRect(92, 92, W - 184, H - 184);
        }
      }
      var piezas = piezasDe(d, tx, foto, modoFoto);
      /* sin foto en arco: el bloque de textos (menos el pie) va centrado en la altura */
      if (!(foto && modoFoto !== 'fondo')) {
        var ys = piezas.filter(function (p) { return p.id !== 'pie'; }).map(function (p) { return p.y; });
        var mn = Math.min.apply(null, ys) - 120, mx = Math.max.apply(null, ys);
        var corr = Math.round(H * 0.47 - (mn + mx) / 2);
        piezas.forEach(function (p) { if (p.id !== 'pie') p.y += corr; });
      }
      (op.extras || []).forEach(function (e, i) {
        if (!e || !String(e.txt || '').trim()) return;
        piezas.push({ id: 'extra' + i, txt: String(e.txt), x: W / 2, y: e.y != null ? e.y : 1700 - i * 70,
          o: { tam: e.tam || 40, fam: e.fam || d.txt, color: e.color || ((foto && modoFoto === 'fondo') ? '#ffffff' : d.tinta), max: 900, est: e.est || '' } });
      });
      var cajas = [];
      var acento = (foto && modoFoto === 'fondo') ? 'rgba(255,255,255,.8)' : d.acento;
      piezas.forEach(function (p) {
        var a = aj[p.id] || {};
        if (a.oculto) return;
        var x = p.x + (+a.dx || 0), y = p.y + (+a.dy || 0), esc = +a.esc || 1;
        if (p.deco) {
          if (p.deco === 'adorno') adorno(ctx, y, { acento: acento }); else linea(ctx, W / 2 - 60, y, W / 2 + 60, acento, 3);
          cajas.push({ id: p.id, x: W / 2 - 160, y: y - 14, w: 320, h: 28 });
          return;
        }
        var t = a.txt != null && a.txt !== '' ? a.txt : p.txt;
        if (t === '-' || !t) return;
        var o = {}; for (var k in p.o) o[k] = p.o[k];
        o.tam = Math.round(o.tam * esc); if (o.min) o.min = Math.round(o.min * esc);
        var usado, alto;
        if (o.nombres) { var nn = nombres(ctx, t, x, y, o); usado = nn.tam; alto = nn.dos ? nn.tam * 2.1 : nn.tam * 1.1; }
        else { usado = texto(ctx, t, x, y, o); alto = usado * 1.2; }
        var top = o.nombres ? y - usado * (alto > usado * 1.5 ? 1.35 : 0.9) : y - usado * 0.9;
        cajas.push({ id: p.id, x: W / 2 - o.max / 2, y: top, w: o.max, h: alto, cx: x });
      });
      lienzo.__cajas = cajas;
      return lienzo;
    });
  }

  window.INVSTDG = { DISENOS: DISENOS, textosDe: textosDe, elegirSolo: elegirSolo, armar: armar, W: W, H: H };
})();
