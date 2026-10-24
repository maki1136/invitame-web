/* ===== CONTACTO: LOS BOTONES CON AIRE (24/10/2026) ============================
   Maki, en Regina: «los botones quedan muy justos con el texto». Los dos
   botones de WhatsApp («Confirmar a la quinceañera», «Confirmar a la mamá»)
   iban pegados entre sí y con la letra al borde. Se separan, se les da relleno
   y, si no entran en una fila, bajan uno debajo del otro.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invContactoBotones) return; window.__invContactoBotones = 1;
  var st = document.createElement('style');
  st.id = 'inv-contacto-botones';
  var S = 'html body #contacto-sec#contacto-sec';
  st.textContent =
    /* ⚠️ 24/10: SIN tocar `display`. El motor esconde con display:none el botón que
       no tiene número; forzarlo hizo aparecer «Escribir a Diego» (Renata). */
    S + ' a.wsp{align-items:center;justify-content:center;' +
    'padding:12px 22px!important;margin:8px 6px!important;line-height:1.25!important;' +
    'max-width:calc(100% - 24px)!important;box-sizing:border-box!important;white-space:normal!important;text-align:center!important}';
  (document.head || document.documentElement).appendChild(st);
})();
