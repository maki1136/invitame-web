/* ===== SOLO SAVE THE DATE: EL LINK MUESTRA LA IMAGEN, NO UNA INVITACIÓN ======
   3/11/2026 — Jazmín: «lo que sale mal es que el SAVE THE DATE es en formato
   imagen… y me está armando esto» (el link abría un sobre y una invitación
   vacía). Cuando el pedido es SOLO Save the Date, /i/?e=<slug> muestra la
   imagen del Save the Date a pantalla completa, con un botón para bajarla.

   Se reconoce igual que en el admin (admin/5-entrega.js → esSoloStd):
     · fx.soloStd === false → es invitación (Jazmín la pasó a invitación)
     · fx.soloStd === true, tpl 'save-the-date', o el pedido especial que
       empieza con «★ SOLO SAVE THE DATE» → es sólo Save the Date

   La imagen la dibuja /efectos/std-generico.js con lo que Jazmín ajustó en el
   panel (EFECTOS → Save the Date: fx.stdg). Mismas opciones que el panel.
   ============================================================================ */
(function () {
  'use strict';
  if (window.INVSTD_SOLO) return;
  if (!/^\/i\//.test(location.pathname)) return;

  var ID = 'std-solo-vista';
  var RENG = ['titulo', 'sub', 'nombres', 'fecha', 'detalle', 'pie'];

  function esSoloStd(ev) {
    if (!ev) return false;
    var fx = ev.fx || {};
    if (fx.soloStd === false) return false;
    if (fx.soloStd === true) return true;
    if (String(ev.tpl || '') === 'save-the-date') return true;
    return /^\s*★\s*SOLO SAVE THE DATE/i.test(String(ev['c_pedido-especial-del-cliente'] || ''));
  }

  function motor() {
    if (window.INVSTDG) return Promise.resolve(window.INVSTDG);
    return new Promise(function (ok, no) {
      var t = document.createElement('script'); t.src = '/efectos/std-temas.js?v=20261028g';
      t.onload = t.onerror = function () {
        var s = document.createElement('script'); s.src = '/efectos/std-generico.js?v=20261028b';
        s.onload = function () { ok(window.INVSTDG); }; s.onerror = no; document.head.appendChild(s);
      };
      document.head.appendChild(t);
    });
  }

  function opciones(M, ev) {
    var s = (ev.fx && ev.fx.stdg) || {}, st = s.textos || {}, auto = M.textosDe(ev), tx = {};
    RENG.forEach(function (k) { tx[k] = (st[k] != null && String(st[k]).trim() !== '') ? st[k] : auto[k]; });
    return { diseno: s.diseno || M.elegirSolo(ev), lay: s.lay || '', marco: s.marco == null ? null : !!s.marco,
             foto: s.foto || '', modoFoto: s.modoFoto || 'arco', velo: s.velo, luz: s.luz, foco: s.foco || {},
             colores: s.colores || {}, fuentes: s.fuentes || {}, textos: tx, ajustes: s.ajustes || {}, extras: s.extras || [] };
  }

  var firma = '', dibujando = false;

  function pantalla() {
    var c = document.getElementById(ID);
    if (c) return c;
    c = document.createElement('div');
    c.id = ID;
    c.style.cssText = 'position:fixed;inset:0;z-index:2147483600;background:#141214;display:flex;flex-direction:column;' +
      'align-items:center;justify-content:center;gap:14px;padding:14px 14px calc(14px + env(safe-area-inset-bottom))';
    var img = document.createElement('img');
    img.alt = 'Save the Date';
    img.style.cssText = 'display:block;max-width:100%;max-height:calc(100dvh - 96px);max-height:calc(100vh - 96px);' +
      'aspect-ratio:9/16;object-fit:contain;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.45);background:#222';
    var a = document.createElement('a');
    a.textContent = 'Descargar imagen';
    a.download = 'save-the-date.jpg';
    a.style.cssText = 'font:600 14px/1 system-ui,-apple-system,sans-serif;letter-spacing:.04em;color:#141214;background:#f3ece0;' +
      'border-radius:999px;padding:13px 26px;text-decoration:none';
    c.appendChild(img); c.appendChild(a);
    (document.body || document.documentElement).appendChild(c);
    document.documentElement.style.overflow = 'hidden';
    if (document.body) document.body.style.overflow = 'hidden';
    /* que nada de la invitación suene ni se mueva debajo */
    try { document.querySelectorAll('audio,video').forEach(function (m) { m.pause && m.pause(); }); } catch (e) {}
    return c;
  }

  function revisar() {
    var ev = window.INVEV;
    if (!esSoloStd(ev)) {
      var ya = document.getElementById(ID);
      if (ya) { ya.remove(); document.documentElement.style.overflow = ''; if (document.body) document.body.style.overflow = ''; firma = ''; }
      return;
    }
    var f = JSON.stringify([ev.n1, ev.n2, ev.fecha, ev.tpl, (ev.fx || {}).stdg || null]);
    if (f === firma && document.getElementById(ID)) return;
    if (dibujando) return;
    dibujando = true;
    var c = pantalla();
    motor().then(function (M) {
      var lienzo = document.createElement('canvas');
      return M.armar(lienzo, opciones(M, ev)).then(function () {
        var url = lienzo.toDataURL('image/jpeg', 0.92);
        c.querySelector('img').src = url;
        c.querySelector('a').href = url;
        var nom = [ev.n1, ev.n2].filter(Boolean).join('-').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');
        c.querySelector('a').download = 'save-the-date' + (nom ? '-' + nom : '') + '.jpg';
        firma = f;
      });
    }).catch(function () {}).then(function () { dibujando = false; });
  }

  window.INVSTD_SOLO = { esSoloStd: esSoloStd, revisar: revisar };

  function arrancar() {
    revisar();
    addEventListener('message', function () { setTimeout(revisar, 120); });
    var n = 0, t = setInterval(function () { revisar(); if (++n > 30) clearInterval(t); }, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
