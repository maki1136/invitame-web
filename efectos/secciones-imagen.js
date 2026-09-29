/* ===== IMAGEN Y «¿CÓMO FUNCIONA?» EN EL FILTRO Y EN LAS FOTOS DE LA FIESTA =====

   Maki, 28/9/2026:
     «En abrir la cámara, las fotos de la fiesta, la gente no va a saber bien qué
      es. Necesitamos algo más visual para que la gente sepa qué es, pero que no
      rompa con el diseño: algo delicado. No una imagen de una pantalla en el salón.»
     «El texto para las fotos de la fiesta debería explicar que se pasan en la
      pantalla del salón, en una solapa desplegable, un poco más, pero oculto, y
      que diga que el día de la fiesta se hace eso.»

   QUÉ HACE:
   1. #gal-seccion y #filtro-sec: si el evento trae una imagen, el circulito con el
      dibujito de arriba se reemplaza por la FOTO en un arco (medio punto arriba,
      esquinas suaves abajo), con un filete del color de la invitación.
        fx.galeria.imagen   → «Las fotos de la fiesta»
        fx.filtro.imagen    → «El filtro de …»
   2. #gal-seccion: debajo de la bajada, una solapa cerrada «¿Cómo funciona?» que
      al tocarla explica cómo se usa. Texto por defecto (se puede cambiar):
        fx.galeria.detalle
      Para apagarla en una invitación: fx.galeria.detalle = '-'.

   SE ARMA DESDE EL PANEL (regla: si Jazmín no lo puede elegir, no existe):
   pestaña EFECTOS, bloque «Efectos — imagen del filtro y de las fotos de la fiesta».

   ⚠️ No toca nada global: sólo agrega nodos marcados (data-si) dentro de las dos
      secciones, y los saca si el campo se vacía.
   ⚠️ Repaso cada 1,2 s (las secciones las arman otros módulos, a veces tarde).
      Nada de MutationObserver.
   ============================================================================ */
(function () {
  'use strict';

  /* Maki, 28/9: el primer diseño (un link subrayado con texto corrido) era «feo, así de básico».
     Ahora: píldora de vidrio + tarjeta con tres pasos numerados. */
  var PASOS = [
    ['Toca el botón', 'Se abre la cámara de tu celular, sin descargar nada.'],
    ['Sale en la pantalla del salón', 'Tu foto o video aparece en vivo, en segundos, para que todos lo vean.'],
    ['Queda en la galería', 'Todas las fotos de la noche quedan guardadas para verlas después.']
  ];
  var NOTA = 'La galería se abre el día de la fiesta.';

  function ev() { try { return window.INVEV || null; } catch (e) { return null; } }
  function cfg(k) { var e = ev(); return (e && e.fx && e.fx[k]) || {}; }
  function limpio(u) { u = String(u || '').trim(); return /^https:\/\//.test(u) ? u : ''; }

  var CSS_ID = 'inv-secciones-imagen';
  function css() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement('style'); s.id = CSS_ID;
    s.textContent = [
      '.si-foto{ width:min(78%,300px); aspect-ratio:1/1; margin:0 auto 20px; border-radius:150px 150px 18px 18px; overflow:hidden;',
      '  background:center/cover no-repeat; box-shadow:0 14px 30px rgba(0,0,0,.16), 0 0 0 6px rgba(255,255,255,.75), 0 0 0 7px var(--verde,#6D1233); }',
      /* la píldora: letra de la bajada, tinta de la sección (--si-t), vidrio claro */
      '.si-como{ --si-t:#6D1233; max-width:340px; margin:-4px auto 24px; text-align:center; }',
      '.si-como > button{ display:inline-flex; align-items:center; gap:9px; cursor:pointer; font:inherit; font-size:11px; font-weight:600;',
      '  letter-spacing:.2em; text-transform:uppercase; color:var(--si-t); padding:9px 16px 9px 18px; border-radius:999px;',
      '  background:rgba(255,255,255,.58); border:1px solid color-mix(in srgb, var(--si-t) 32%, transparent);',
      '  box-shadow:0 6px 18px color-mix(in srgb, var(--si-t) 14%, transparent); -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px);',
      '  transition:background .25s ease, box-shadow .25s ease; }',
      '.si-como > button:hover{ background:rgba(255,255,255,.8); }',
      '.si-como > button i{ width:18px; height:18px; border-radius:50%; flex:none; position:relative;',
      '  border:1px solid color-mix(in srgb, var(--si-t) 45%, transparent); transition:transform .35s ease; }',
      '.si-como > button i::before{ content:""; position:absolute; left:50%; top:45%; width:5px; height:5px; margin:-3px 0 0 -3px;',
      '  border-right:1.4px solid var(--si-t); border-bottom:1.4px solid var(--si-t); transform:rotate(45deg); }',
      '.si-como.abierto > button i{ transform:rotate(180deg); }',
      '.si-como > div{ max-height:0; overflow:hidden; opacity:0; transition:max-height .5s ease, opacity .35s ease, margin .35s ease; }',
      '.si-como.abierto > div{ max-height:520px; opacity:1; margin-top:14px; }',
      '.si-card{ text-align:left; padding:18px 18px 14px; border-radius:20px; background:rgba(255,255,255,.66);',
      '  border:1px solid color-mix(in srgb, var(--si-t) 18%, transparent); box-shadow:0 10px 26px color-mix(in srgb, var(--si-t) 12%, transparent);',
      '  -webkit-backdrop-filter:blur(8px); backdrop-filter:blur(8px); }',
      '.si-paso{ display:flex; gap:12px; align-items:flex-start; padding:8px 0; }',
      '.si-paso + .si-paso{ border-top:1px solid color-mix(in srgb, var(--si-t) 12%, transparent); }',
      '.si-num{ flex:none; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center;',
      '  font-size:12px; font-weight:600; color:#fff; background:var(--si-t); box-shadow:0 0 0 3px rgba(255,255,255,.8), 0 0 0 4px color-mix(in srgb, var(--si-t) 30%, transparent); }',
      '.si-paso b{ display:block; font-size:13px; letter-spacing:.04em; color:var(--si-t); margin:3px 0 2px; }',
      '.si-paso span{ display:block; font-size:13px; line-height:1.45; color:var(--si-t); opacity:.85; }',
      '.si-nota{ margin:10px 0 0; padding-top:10px; text-align:center; font-size:12px; font-style:italic; color:var(--si-t); opacity:.8;',
      '  border-top:1px solid color-mix(in srgb, var(--si-t) 12%, transparent); }',
      '.si-libre{ font-size:14px; line-height:1.55; color:var(--si-t); text-align:center; }',
      '@media (prefers-reduced-motion: reduce){ .si-como > div, .si-como > button i{ transition:none; } }'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  }

  function ponerFoto(sec, url) {
    var f = sec.querySelector(':scope > .si-foto');
    var icono = null;
    for (var i = 0; i < sec.children.length; i++) {
      var c = sec.children[i];
      if (c.classList.contains('si-foto')) continue;
      if (c.tagName === 'DIV' && c.querySelector('svg') && c.offsetWidth <= 90) { icono = c; break; }
    }
    if (!url) {
      if (f) f.remove();
      if (icono) icono.style.display = '';
      return;
    }
    if (!f) {
      f = document.createElement('div'); f.className = 'si-foto'; f.setAttribute('data-si', '1');
      f.setAttribute('role', 'img');
      sec.insertBefore(f, icono || sec.firstChild);
    }
    var bg = 'url("' + url.replace(/"/g, '') + '")';
    if (f.style.backgroundImage !== bg) f.style.backgroundImage = bg;
    f.setAttribute('aria-label', sec.id === 'filtro-sec' ? 'Filtro para tus fotos' : 'Fotos de la fiesta');
    if (icono) icono.style.display = 'none';
  }

  function ponerComo(sec, texto) {
    var box = sec.querySelector('.si-como');
    if (texto === '-') { if (box) box.remove(); return; }
    var t = texto || '';
    if (!box) {
      var p = sec.querySelector('p'); if (!p) return;
      box = document.createElement('div'); box.className = 'si-como'; box.setAttribute('data-si', '1');
      var b = document.createElement('button'); b.type = 'button';
      b.appendChild(document.createTextNode('Cómo funciona'));
      b.appendChild(document.createElement('i'));
      b.setAttribute('aria-expanded', 'false');
      var d = document.createElement('div');
      b.addEventListener('click', function () {
        var ab = box.classList.toggle('abierto');
        b.setAttribute('aria-expanded', ab ? 'true' : 'false');
      });
      box.appendChild(b); box.appendChild(d);
      p.parentNode.insertBefore(box, p.nextSibling);
    }
    var cuerpo = box.querySelector(':scope > div');
    /* el contenido: los tres pasos de siempre, o el texto propio si lo cargaron */
    var firma = t ? 'libre:' + t : 'pasos';
    if (cuerpo.getAttribute('data-firma') !== firma) {
      cuerpo.setAttribute('data-firma', firma);
      cuerpo.innerHTML = '';
      var card = document.createElement('div'); card.className = 'si-card';
      if (t) {
        var pl = document.createElement('p'); pl.className = 'si-libre'; pl.textContent = t; card.appendChild(pl);
      } else {
        PASOS.forEach(function (ps, i) {
          var row = document.createElement('div'); row.className = 'si-paso';
          var n = document.createElement('div'); n.className = 'si-num'; n.textContent = String(i + 1);
          var tx = document.createElement('div');
          var bb = document.createElement('b'); bb.textContent = ps[0];
          var sp = document.createElement('span'); sp.textContent = ps[1];
          tx.appendChild(bb); tx.appendChild(sp); row.appendChild(n); row.appendChild(tx); card.appendChild(row);
        });
        var nota = document.createElement('p'); nota.className = 'si-nota'; nota.textContent = NOTA; card.appendChild(nota);
      }
      cuerpo.appendChild(card);
    }
    /* la letra y la tinta son las de la bajada de la sección (no las del motor) */
    var pb = box.previousElementSibling;
    if (pb && pb.tagName === 'P') {
      var cs = getComputedStyle(pb);
      if (box.style.fontFamily !== cs.fontFamily) box.style.fontFamily = cs.fontFamily;
      var tinta = cs.webkitTextFillColor && cs.webkitTextFillColor !== 'rgba(0, 0, 0, 0)' ? cs.webkitTextFillColor : cs.color;
      if (box.style.getPropertyValue('--si-t') !== tinta) box.style.setProperty('--si-t', tinta);
    }
  }

  function sincronizar() {
    if (!ev()) return;
    var g = document.getElementById('gal-seccion');
    var f = document.getElementById('filtro-sec');
    if (!g && !f) return;
    css();
    if (g) { ponerFoto(g, limpio(cfg('galeria').imagen)); ponerComo(g, String(cfg('galeria').detalle || '').trim()); }
    if (f) { ponerFoto(f, limpio(cfg('filtro').imagen)); }
  }

  setInterval(sincronizar, 1200);
  sincronizar();

  /* ---------- EN EL PANEL (admin.html) ---------- */
  var ID = 'secciones-imagen-ajustes';
  function borrador() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function obj(d, k) { if (!d.fx) d.fx = {}; if (!d.fx[k]) d.fx[k] = {}; return d.fx[k]; }
  function refrescar() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }

  function campo(caja, rotulo, ayuda, get, set, area) {
    var g = document.createElement('div'); g.className = 'grp';
    var l = document.createElement('label'); l.textContent = rotulo; g.appendChild(l);
    var i = document.createElement(area ? 'textarea' : 'input');
    if (!area) i.type = 'text'; else i.rows = 4;
    i.value = get() || '';
    i.oninput = function () { set(this.value.trim()); refrescar(); };
    g.appendChild(i);
    var a = document.createElement('div'); a.className = 'hint'; a.textContent = ayuda; g.appendChild(a);
    caja.appendChild(g);
  }

  function construir(d) {
    var caja = document.createElement('div'); caja.className = 'mejoras'; caja.id = ID;
    var h = document.createElement('div'); h.className = 'h'; h.textContent = 'Efectos — imagen del filtro y de las fotos de la fiesta'; caja.appendChild(h);
    campo(caja, 'Imagen de «Las fotos de la fiesta» (link)', 'Una foto cuadrada que explique la función (ej.: una cámara instantánea con fotitos). Va en un arco arriba del título.',
      function () { return obj(d, 'galeria').imagen; }, function (v) { obj(d, 'galeria').imagen = v; });
    campo(caja, 'Imagen de «El filtro» (link)', 'Una foto cuadrada que muestre el marco en una selfie (ej.: un celular con el marco de flores).',
      function () { return obj(d, 'filtro').imagen; }, function (v) { obj(d, 'filtro').imagen = v; });
    campo(caja, 'Texto de «¿Cómo funciona?» (fotos de la fiesta)', 'Queda escondido en una solapa. Vacío = los tres pasos de siempre (tocar el botón, sale en la pantalla del salón, queda en la galería; se abre el día de la fiesta). Un guion «-» la apaga.',
      function () { return obj(d, 'galeria').detalle; }, function (v) { obj(d, 'galeria').detalle = v; }, true);
    return caja;
  }

  function enEfectos() { return !!document.querySelector('.mejoras .h.efx'); }
  function anclaje() { var t = document.querySelectorAll('.mejoras'); return t.length ? t[t.length - 1] : null; }
  function revisar() {
    var d = borrador(); var ya = document.getElementById(ID);
    if (!d || !enEfectos()) { if (ya) ya.remove(); return; }
    if (ya) return;
    var an = anclaje(); if (!an || !an.parentNode) return;
    an.parentNode.insertBefore(construir(d), an.nextSibling);
  }
  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) { clearInterval(t); setInterval(revisar, 700); revisar(); }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
