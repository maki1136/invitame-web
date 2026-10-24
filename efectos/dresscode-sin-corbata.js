/* ===== VESTIMENTA: EL TRAJE DEL DIBUJO, SIN CORBATA (24/10/2026) ==============
   Jazmín: «a la camisa que aparece en el sector de dresscode quitale la
   corbata». El dibujo es el de fábrica del motor (#dc-mono, el traje & el
   vestido). En el traje, el 2.º trazo es la corbata y el 4.º el nudo: se
   esconden y queda el saco con el cuello. Va en todas las invitaciones y en
   la miniatura del panel.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invDcSinCorbata) return; window.__invDcSinCorbata = 1;
  var st = document.createElement('style');
  st.id = 'inv-dc-sin-corbata';
  st.textContent = '#dc-mono > svg:first-of-type > path:nth-of-type(2),' +
                   '#dc-mono > svg:first-of-type > path:nth-of-type(4){display:none!important}';
  (document.head || document.documentElement).appendChild(st);
})();
