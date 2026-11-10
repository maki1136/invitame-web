/* ===== EL PASE CON QR · DISEÑO FINO (9/11/2026) ===============================
   Maki, mirando isabela-y-mateo-platinum: «fijate si podés mejorar el "Con
   cariño, te esperamos" y la parte del QR, a ver si podés mejorar el diseño».
   El pase con QR era una caja blanca con borde gris, el QR pegado al canto y
   los datos en Forum: no tenía nada de la temática.

   QUÉ HACE — si está prendido:
     · la tarjeta pasa a papel translúcido con un filete fino adentro (como el
       pase simple nuevo), esquinas redondeadas y sombra suave;
     · el QR va enmarcado (marco blanco y filete);
     · los datos toman la LETRA DE LOS TÍTULOS de la invitación y el color de la
       temática; los rótulos van espaciados;
     · debajo de «Con cariño, te esperamos» va un adorno de dos líneas con un
       rombo (o el medallón, si la invitación tiene uno).
   CÓMO SE PRENDE — panel → MUSIC_PASES → «Pase con QR · diseño» → casilla
   «Diseño fino de la tarjeta». Lo guarda en fx.estiloSec.pase.tarjetaFina.
   Colores opcionales: colorFilete (filete, rombo y bordes) y tarjeta (papel).
   ⚠️ Sin la casilla NO HACE NADA: ninguna invitación entregada cambia.
   ⚠️ Sólo el pase con QR (section.pase sin .pase-simple). El simple ya tiene el suyo.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPaseQrFino) return; window.__invPaseQrFino = 1;

  var ID = 'inv-pase-qr-fino';

  function cfg() {
    try { return (((window.INVEV || {}).fx || {}).estiloSec || {}).pase || {}; } catch (e) { return {}; }
  }
  function prendido(c) { return c.tarjetaFina === true || c.tarjetaFina === 'true' || c.tarjetaFina === 1; }
  function hex(v) { v = String(v || '').trim(); return /^#[0-9a-f]{3,8}$/i.test(v) ? v : ''; }

  /* la letra y el color de los títulos de la propia invitación */
  function letraTitulos() {
    var h = document.querySelector('.sec h2, section h2, .tit');
    if (!h) return { f: '', c: '' };
    var cs = getComputedStyle(h);
    return { f: cs.fontFamily, c: cs.color };
  }

  function css(c) {
    var L = letraTitulos();
    var fil = hex(c.colorFilete) || L.c || '#8a7f6e';
    var pap = hex(c.tarjeta) || 'rgba(255,255,255,.72)';
    var S = 'html[data-pase-fino] section.pase:not(.pase-simple)';
    return [
      S + '{--pf-fil:' + fil + ';--pf-pap:' + pap + ';' + (L.f ? '--pf-letra:' + L.f + ';' : '') + '}',
      /* el adorno debajo del título */
      S + ' > .t{margin-bottom:4px!important}',
      S + ' .pf-orn{display:flex;align-items:center;justify-content:center;gap:10px;margin:0 auto 18px;color:var(--pf-fil)}',
      S + ' .pf-orn i{display:block;width:44px;height:1px;background:currentColor;opacity:.55}',
      S + ' .pf-orn b{display:block;width:7px;height:7px;border:1px solid currentColor;transform:rotate(45deg);opacity:.8}',
      'html[data-medallon] ' + S + ' .pf-orn b{width:30px;height:30px;border:0;transform:none;opacity:1;border-radius:50%;',
      '  background:#fff var(--pf-med) center/cover no-repeat;box-shadow:0 0 0 1px rgba(255,255,255,.9),0 3px 10px rgba(0,0,0,.14)}',
      /* la tarjeta */
      S + ' .pasecard{position:relative!important;background:var(--pf-pap)!important;border:0!important;border-radius:18px!important;',
      '  padding:26px 22px!important;box-shadow:0 12px 34px rgba(40,32,20,.10),0 1px 0 rgba(255,255,255,.8) inset!important;',
      '  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);gap:20px!important;align-items:center!important}',
      S + ' .pasecard::after{content:"";position:absolute;inset:8px;border-radius:12px;border:1px solid var(--pf-fil);opacity:.45;pointer-events:none}',
      /* el QR enmarcado */
      S + ' #qr{background:#fff!important;padding:9px!important;border-radius:10px!important;border:1px solid var(--pf-fil)!important;',
      '  box-shadow:0 0 0 4px rgba(255,255,255,.75),0 4px 14px rgba(40,32,20,.10)!important;flex:0 0 auto}',
      S + ' #qr img,' + S + ' #qr canvas{display:block}',
      /* los datos */
      S + ' .pasecard .k{letter-spacing:.3em!important;text-transform:uppercase;font-size:8.5px!important;opacity:.72;color:var(--pf-fil)!important}',
      S + ' .pasecard .v{font-family:var(--pf-letra,inherit)!important;font-size:20px!important;line-height:1.15!important;letter-spacing:.01em}',
      S + ' .pasecard .row{gap:18px!important}',
      S + ' .pasecard .estado{border:1px solid var(--pf-fil)!important;border-radius:99px!important;padding:4px 12px!important;',
      '  letter-spacing:.22em!important;background:rgba(255,255,255,.6)!important}'
    ].join('\n');
  }

  function adorno(on) {
    var sec = document.querySelector('section.pase:not(.pase-simple)');
    if (!sec) return;
    var t = sec.querySelector(':scope > .t');
    var o = sec.querySelector(':scope > .pf-orn');
    if (on && t && !o) {
      o = document.createElement('div');
      o.className = 'pf-orn'; o.setAttribute('aria-hidden', 'true');
      o.innerHTML = '<i></i><b></b><i></i>';
      t.parentNode.insertBefore(o, t.nextSibling);
    } else if (!on && o) { o.remove(); }
  }

  var ultimo = null;
  function aplicar() {
    var c = cfg(), raiz = document.documentElement, st = document.getElementById(ID);
    if (!prendido(c)) {
      if (ultimo !== '') { if (st) st.textContent = ''; raiz.removeAttribute('data-pase-fino'); adorno(false); ultimo = ''; }
      return;
    }
    if (!st) { st = document.createElement('style'); st.id = ID; (document.head || raiz).appendChild(st); }
    var med = '';
    try { med = String((((window.INVEV || {}).fx || {}).estiloSec || {}).itinerario.medallon || ''); } catch (e) {}
    var txt = css(c) + (med ? '\nhtml[data-pase-fino]{--pf-med:url("' + med.replace(/"/g, '') + '")}' : '');
    if (ultimo !== txt) { st.textContent = txt; ultimo = txt; }
    raiz.setAttribute('data-pase-fino', '1');
    adorno(true);
  }

  var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 300);
  addEventListener('message', function () { setTimeout(aplicar, 150); });
  setInterval(aplicar, 1500);
})();
