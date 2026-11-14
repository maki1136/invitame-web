/* ===== LO QUE SE ESCRIBE CON «ENTER» SE VE CON SUS RENGLONES — EN TODA LA INVITACIÓN
   9/11/2026: personas e itinerario.
   14/11/2026 — Maki: «si te pedimos que se pueda hacer algo no es sólo para eso
   específico, tenés que ver la macro». Jazmín pedía los saltos sección por
   sección (Dónde y cuándo, confirmación, recepción…). Esto lo resuelve para
   TODO texto de la invitación que venga del panel:

     · Junta todos los textos del evento (INVEV, también adentro de fx) que
       tengan al menos un Enter.
     · Busca en la invitación cada elemento de texto suelto (sin hijos) cuyo
       contenido sea uno de esos textos (comparando sin mirar espacios ni
       renglones), le devuelve el texto tal como se escribió —con los renglones
       vacíos del principio, del medio y del final— y le pone pre-line.
     · Un texto sin Enter no se toca: se ve exactamente igual que antes.

   Lo que el motor JUNTA en un solo renglón (Dónde y cuándo: descripción ·
   dirección) lo arma /efectos/estilo-secciones.js con la misma regla.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invTextoRenglones) return; window.__invTextoRenglones = 1;
  if (!/\/i\//.test(location.pathname)) return;
  var css = '[data-sec="padres"] .padres .rl,[data-sec="itinerario"] .tl .it .d,[data-renglones]{white-space:pre-line!important}';
  var st = document.createElement('style'); st.id = 'texto-con-renglones'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  function norm(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function limpio(s) { return String(s || '').replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/[ \t]+$/, ''); }
  function juntar(o, mapa, prof) {
    if (!o || prof > 6) return;
    if (typeof o === 'string') {
      if (o.indexOf('\n') >= 0 && norm(o).length > 1) mapa[norm(o)] = limpio(o);
      return;
    }
    if (typeof o !== 'object') return;
    for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) juntar(o[k], mapa, prof + 1); }
  }
  var SEL = 'p,div,span,h1,h2,h3,h4,h5,li,small,em,strong,b,i,a,label,blockquote,figcaption,td';
  var firma = '';
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var mapa = {}; juntar(ev, mapa, 0);
    var claves = Object.keys(mapa);
    var f = claves.join('|');
    if (!claves.length) { firma = f; return; }
    var raiz = document.body; if (!raiz) return;
    var els = raiz.querySelectorAll(SEL);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.children.length) continue;
      if (el.closest('script,style,textarea,input,select,[contenteditable]')) continue;
      var t = el.textContent; if (!t || t.length < 2) continue;
      var raw = mapa[norm(t)];
      if (raw === undefined) {
        /* el motor a veces le agrega comillas (la frase) */
        var sin = norm(t).replace(/^[“"«]\s*/, '').replace(/\s*[”"»]$/, '');
        if (sin !== norm(t) && mapa[sin] !== undefined) {
          var q1 = norm(t).charAt(0), q2 = norm(t).slice(-1);
          raw = q1 + mapa[sin].replace(/^\s+|\s+$/g, '') + q2;
        }
      }
      if (raw === undefined) continue;
      if (el.textContent !== raw) el.textContent = raw;
      if (!el.hasAttribute('data-renglones')) el.setAttribute('data-renglones', '');
    }
    firma = f;
  }
  var t0 = null;
  function pronto() { clearTimeout(t0); t0 = setTimeout(function () { try { aplicar(); } catch (e) {} }, 180); }
  var n = 0, iv = setInterval(function () { pronto(); if (++n > 40) clearInterval(iv); }, 600);
  addEventListener('message', function () { setTimeout(pronto, 250); setTimeout(pronto, 900); });
  window.INVRENGLONES = { aplicar: aplicar };
})();
