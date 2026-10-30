/* ===== EL PIE DE INVÍTAME (28/10/2026) ========================================
   Maki: «abajo, donde dice "creada por Invítame", tiene que tener el link a la
   web y que diga si quiere una, ingresa aquí, como las que tenemos ahora. El
   logo muy chico, que no arruine el diseño… hacele un rectángulo para que se
   lea… y que tenga un botón para sacarlo por si alguien se queja».

   Reemplaza el renglón «Invitación creada con InvitaME» (#pie-pub) por un
   rectángulo chico: logo de 14 px + «Invitación creada con Invítame» +
   «¿Quieres una invitación como esta? Ingresa aquí» (→ invitameok.com).
   El rectángulo es claro u oscuro según la letra del cierre de cada diseño.

   Se SACA con la casilla de siempre: AVANZADO → «Deshabilitar publicidad de
   invitame» (c_deshabilitar-publicidad-de-invitame).
   En las muestras, el «¿Quieres la tuya? Escríbenos por WhatsApp» de
   muestra-venta.js queda arriba, como estaba.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPieInvitame) return; window.__invPieInvitame = 1;

  var WEB = 'https://invitameok.com';
  var ID = 'inv-pub', ID_CSS = 'inv-pub-css';
  var CSS =
    '.inv-pub{display:flex;flex-direction:column;align-items:center;gap:6px;margin:14px auto 64px;padding:10px 16px 11px;' +
    'border-radius:14px;max-width:min(330px,88%);box-sizing:border-box;font-family:Montserrat,system-ui,sans-serif;font-size:12.5px;' +
    'letter-spacing:.02em;line-height:1.4;text-align:center;text-shadow:none!important;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}' +
    '.inv-pub.claro{background:rgba(255,255,255,.82);color:#2b2622;box-shadow:0 2px 10px rgba(0,0,0,.10)}' +
    '.inv-pub.oscuro{background:rgba(15,12,20,.55);color:#f6f1e8;box-shadow:0 2px 10px rgba(0,0,0,.25)}' +
    '.inv-pub *{color:inherit!important;-webkit-text-fill-color:currentColor!important;text-shadow:none!important}' +
    '.inv-pub .l1{display:flex;align-items:center;justify-content:center;gap:7px;white-space:nowrap;text-transform:uppercase;letter-spacing:.1em;font-size:9.5px;opacity:.85}' +
    '.inv-pub img{height:14px;width:auto;display:block;border-radius:2px}' +
    '.inv-pub a{text-decoration:underline;text-underline-offset:2px;font-weight:700}';

  function ev() { return window.INVEV || null; }
  function nueva(e) { return window.INVNUEVA ? window.INVNUEVA(e) : false; }
  function apagado(e) {
    var v = e && e['c_deshabilitar-publicidad-de-invitame'];
    return v === true || v === 'true' || v === 1 || v === '1' || v === 'si' || v === 'sí';
  }
  /* ★ 30/10/2026 (Maki): «los wedding planners venden con su propia marca».
     Con «WhatsApp del wedding planner» (AVANZADO) el pie no nombra a Invítame:
     dice sólo «¿Quieres una invitación como esta? Ingresa aquí» y abre el
     WhatsApp del planner. Es elegido a mano: vale también en las ya hechas. */
  function planner(e) {
    var n = String((e && e['c_whatsapp-wedding-planner']) || '').replace(/[^0-9]/g, '');
    return n.length >= 8 ? n : '';
  }
  function ingles() { return /^en/i.test(document.documentElement.lang || ''); }
  function luz(c) {
    var m = String(c || '').match(/\d+(\.\d+)?/g); if (!m) return 1;
    return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
  }

  function sacar() {
    var b = document.getElementById(ID); if (b) b.remove();
    /* el renglón viejo lo esconde el motor con la misma casilla: no se toca */
  }

  function poner() {
    var pie = document.getElementById('pie-pub');
    var e = ev();
    if (!pie || !pie.parentNode || !e) return;
    /* ⛔ 29/10: las invitaciones ya hechas quedan con su renglón de siempre */
    var pl = planner(e);
    if (!pl && !nueva(e)) { sacar(); if (pie.__pieInv) { pie.style.display = ''; pie.__pieInv = 0; } return; }
    /* con el WhatsApp del planner cargado, sale el pie del planner aunque esté tildado «Deshabilitar publicidad de invitame» (ése saca lo de Invítame) */
    if (!pl && apagado(e)) { sacar(); pie.style.display = 'none'; pie.__pieInv = 1; return; }
    if (!document.getElementById(ID_CSS)) {
      var s = document.createElement('style'); s.id = ID_CSS; s.textContent = CSS;
      (document.head || document.documentElement).appendChild(s);
    }
    var tono = luz(getComputedStyle(pie).color) > 0.6 ? 'oscuro' : 'claro';
    var b = document.getElementById(ID);
    var en = ingles();
    var firma = tono + '|' + (en ? 'en' : 'es') + '|' + pl;
    if (!b) { b = document.createElement('div'); b.id = ID; }
    if (b.__firma !== firma) {
      b.__firma = firma;
      b.className = 'inv-pub ' + tono;
      if (pl) {
        var txt = en ? 'Hi! I saw an invitation and I would like one like it.' : '¡Hola! Vi una invitación y quiero una como esta.';
        b.innerHTML = '<div>' + (en ? 'Want an invitation like this one? ' : '¿Quieres una invitación como esta? ') +
          '<a href="https://wa.me/' + pl + '?text=' + encodeURIComponent(txt) + '" target="_blank" rel="noopener">' + (en ? 'Click here' : 'Ingresa aquí') + '</a></div>';
      } else
      b.innerHTML = '<div class="l1"><img src="/invitame-marca.png" alt="Invítame">' +
        (en ? 'Invitation made with Invítame' : 'Invitación creada con Invítame') + '</div>' +
        '<div>' + (en ? 'Want an invitation like this one? ' : '¿Quieres una invitación como esta? ') +
        '<a href="' + WEB + '" target="_blank" rel="noopener">' + (en ? 'Click here' : 'Ingresa aquí') + '</a></div>';
    }
    /* va después del renglón viejo, o del llamado de la muestra si está */
    var ancla = document.getElementById('col-mvta');
    if (!ancla || ancla.parentNode !== pie.parentNode) ancla = pie;
    if (b.previousElementSibling !== ancla) ancla.parentNode.insertBefore(b, ancla.nextSibling);
    if (pie.style.display !== 'none') { pie.style.display = 'none'; pie.__pieInv = 1; }
  }

  function arrancar() {
    if (typeof D === 'object' && D && !window.INVEV) return;   /* panel: corre en la miniatura */
    poner();
    var n = 0, t = setInterval(function () { poner(); if (++n > 50) clearInterval(t); }, 600);
    window.addEventListener('message', function () { setTimeout(poner, 120); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
