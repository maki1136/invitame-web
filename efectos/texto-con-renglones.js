/* ===== LOS TEXTOS CON «ENTER» RESPETAN EL RENGLÓN (9/11/2026) ==============
   Jazmín (Kairos Seguros): «No podemos colocar enter en la descripción del
   sector de personas», y el detalle del itinerario lo pidió el cliente en un
   párrafo aparte. El panel ahora deja escribir Enter (textarea) en:
     · el detalle de cada momento del itinerario (fx.itinerario.momentos[].d)
     · la descripción de cada persona (personas[].rel)
   Acá, la invitación muestra ese salto de renglón. Un texto sin Enter se ve
   exactamente igual que antes (pre-line sólo actúa sobre los saltos).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invTextoRenglones) return; window.__invTextoRenglones = 1;
  var css = '[data-sec="padres"] .padres .rl,[data-sec="itinerario"] .tl .it .d{white-space:pre-line}';
  var st = document.createElement('style'); st.id = 'texto-con-renglones'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
})();
