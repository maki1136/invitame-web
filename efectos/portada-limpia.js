/* ===== PORTADA · LETRA LIMPIA SOBRE LA FOTO O EL VIDEO (10/11/2026) ===========
   Línea Roja · White Swan (copia de «Opaline» de @on_the_list._): la portada es
   un VIDEO de una puerta de terciopelo y la letra va limpia encima, como en la
   referencia. Marfil le pone detrás de los nombres un velo de papel claro
   (radial-gradient crema con blur, pensado para la portada SIN foto): sobre el
   terciopelo se veía como una mancha blanca.

   EL DATO — fx.estiloSec.portada:
     sinVelo       : true → saca el velo claro de detrás de los nombres
     fuenteNombres : letra de los nombres (opcional)
     tamNombres    : tamaño de los nombres en px (opcional)
     colorNombres  : color de nombres, fecha y cuenta regresiva (opcional)
     sinOscurecer  : true → saca el oscurecido que se le pone a la foto de portada
                     (para fotos claras: la tarjeta de encaje de «Encaje y nácar»)
     sombra        : true → sombra suave detrás de la letra (portadas de gris medio:
                     Pasarela tiene el panel plateado justo detrás de los nombres)
   Panel: PRINCIPAL → «Portada · letra limpia sobre la foto o el video».
   ⚠️ Sin ningún campo cargado NO HACE NADA: ninguna invitación entregada cambia.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPortadaLimpia) return; window.__invPortadaLimpia = 1;

  var ID = 'inv-portada-limpia';
  function cfg() {
    try { return (((window.INVEV || {}).fx || {}).estiloSec || {}).portada || {}; } catch (e) { return {}; }
  }
  function si(v) { return v === true || v === 'true' || v === 1; }
  function hex(v) { v = String(v || '').trim(); return /^#[0-9a-f]{3,8}$/i.test(v) ? v : ''; }
  function fuente(v) { v = String(v || '').trim().replace(/["<>;{}]/g, ''); return v; }

  var ultimo = null;
  function aplicar() {
    /* el atributo va repetido: Marfil escribe sus reglas con DOS atributos + id y !important */
    var c = cfg(), r = [], H = 'html[data-portada-limpia][data-portada-limpia][data-portada-limpia] ';
    if (si(c.sinVelo)) {
      r.push(H + '.portada .c::before, ' + H + '.portada > .c::before { display:none !important; background:none !important }');
    }
    if (si(c.sinOscurecer)) {
      r.push(H + '.portada .pveil, ' + H + '.portada #pbg::after, ' + H + '.portada .pbg::after { background:none !important; display:none !important }');
    }
    var f = fuente(c.fuenteNombres);
    if (f) r.push(H + '#pv-names, ' + H + '#pv-names > span { font-family:"' + f + '", "Cormorant Garamond", Georgia, serif !important;' +
      /* con letra elegida, los nombres van como se escriben: una cursiva en mayúsculas espaciadas no se lee */
      ' text-transform:none !important; letter-spacing:.01em !important }');
    var t = Number(c.tamNombres);
    if (t >= 16 && t <= 96) r.push(H + '#pv-names, ' + H + '#pv-names > span { font-size:' + t + 'px !important }');
    var col = hex(c.colorNombres);
    if (col) r.push(H + '#pv-names, ' + H + '#pv-names > span, ' + H + '#pv-fecha, ' + H + '#pv-kick, ' +
      H + '.portada .count .num, ' + H + '.portada .count .lab { color:' + col + ' !important }');
    if (si(c.sombra)) r.push(H + '#pv-names, ' + H + '#pv-names > span, ' + H + '#pv-fecha, ' + H + '#pv-kick, ' +
      H + '.portada .count .num, ' + H + '.portada .count .lab, ' + H + '.portada .count .sep' +
      ' { text-shadow:0 1px 3px rgba(0,0,0,.55), 0 2px 18px rgba(0,0,0,.5) !important }');
    var raiz = document.documentElement, st = document.getElementById(ID);
    var txt = r.join('\n');
    if (!txt) {
      if (ultimo !== '') { if (st) st.textContent = ''; raiz.removeAttribute('data-portada-limpia'); ultimo = ''; }
      return;
    }
    if (!st) { st = document.createElement('style'); st.id = ID; (document.head || raiz).appendChild(st); }
    if (ultimo !== txt) { st.textContent = txt; ultimo = txt; }
    raiz.setAttribute('data-portada-limpia', '1');
  }

  var n = 0, iv = setInterval(function () { aplicar(); if (++n > 40) clearInterval(iv); }, 300);
  addEventListener('message', function () { setTimeout(aplicar, 150); });
  setInterval(aplicar, 1500);
})();
