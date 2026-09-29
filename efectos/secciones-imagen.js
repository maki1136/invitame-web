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

  var DETALLE = 'El día de la fiesta, todas las fotos y videos que suban los invitados aparecen en vivo en la pantalla del salón. ' +
    'Sólo tienes que tocar el botón, sacar la foto desde tu celular y listo: en segundos se ve en la pantalla y queda guardada en la galería. ' +
    'Antes de la fiesta la galería está cerrada; se abre ese día.';

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
      '.si-como{ max-width:34ch; margin:-8px auto 22px; text-align:center; }',
      '.si-como > button{ background:none; border:0; padding:6px 10px; cursor:pointer; font:inherit; font-size:.86rem; letter-spacing:.06em;',
      '  color:var(--verde,#6D1233); text-decoration:underline; text-underline-offset:4px; opacity:.9; }',
      '.si-como > button::after{ content:"  +"; }',
      '.si-como.abierto > button::after{ content:"  –"; }',
      '.si-como > div{ max-height:0; overflow:hidden; transition:max-height .45s ease, opacity .35s ease; opacity:0; font-size:.92rem; line-height:1.55; }',
      '.si-como.abierto > div{ max-height:320px; opacity:1; margin-top:8px; }',
      '@media (prefers-reduced-motion: reduce){ .si-como > div{ transition:none; } }'
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
    var t = texto || DETALLE;
    if (!box) {
      var p = sec.querySelector('p'); if (!p) return;
      box = document.createElement('div'); box.className = 'si-como'; box.setAttribute('data-si', '1');
      var b = document.createElement('button'); b.type = 'button'; b.textContent = '¿Cómo funciona?';
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
    if (cuerpo.textContent !== t) cuerpo.textContent = t;
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
    campo(caja, 'Texto de «¿Cómo funciona?» (fotos de la fiesta)', 'Queda escondido en una solapa. Vacío = el texto de siempre (pantalla del salón, se abre el día de la fiesta). Un guion «-» la apaga.',
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
