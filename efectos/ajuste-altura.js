/* ===== SUBIR O BAJAR LOS NOMBRES Y LA FRASE AL LUGAR EXACTO (18/11/2026) =======
   Jazmín (indira-y-rogelio): «no sé por qué se ve el nombre tan abajo cuando
   seleccionás la posición de abajo… baja demasiado o sube demasiado. ¿Se podrá
   colocar algo así? (una barrita) para que podamos seleccionar el lugar exacto de
   acuerdo al fondo». Pasa en la portada y en la frase larga.
   Arriba / Centrado / Abajo siguen igual; esto es un AJUSTE FINO encima, en píxeles:
     · fx.portadaFoto.alturaNombres → el bloque de los nombres de la portada
     · fx.frase.altura              → el texto de la frase larga
   Se usa la propiedad `translate` (no `transform`), así no pelea con las
   animaciones de entrada. En 0 o vacío no hace nada: ninguna invitación cambia
   si no se toca la barrita.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invAjusteAltura) return; window.__invAjusteAltura = 1;
  function num(v) { var n = parseFloat(v); return isFinite(n) ? Math.max(-400, Math.min(700, n)) : 0; }
  function mover(el, px) {
    if (!el) return;
    var val = px ? '0 ' + px + 'px' : '';
    if (val) { if (el.style.getPropertyValue('translate') !== val) el.style.setProperty('translate', val, 'important'); el.dataset.invAltura = '1'; }
    else if (el.dataset.invAltura) { el.style.removeProperty('translate'); delete el.dataset.invAltura; }
  }
  function aplicar() {
    var e = window.INVEV; if (!e || !e.fx) return;
    var fx = e.fx;
    /* ★ 19/11 (Jazmín, ana-patricia-y-aldo: «intenté bajarle los textos de la portada pero están trabadas»):
       la barrita llega hasta +700. Más allá de +350 (lo que antes no se podía) se frena sola donde
       los nombres todavía entran en la portada, en cualquier celular. Hasta 350 queda igual que antes. */
    var cN = document.querySelector('.portada > .c'), pN = num((fx.portadaFoto || {}).alturaNombres);
    if (cN && pN > 350) { var po = cN.closest('.portada'); if (po) pN = Math.max(350, Math.min(pN, po.clientHeight - cN.offsetTop - cN.offsetHeight - 64)); }
    mover(cN, pN);
    mover(document.querySelector('.fraseSec .frase'), num((fx.frase || {}).altura));
    /* ★ 19/11: la cuenta regresiva sola (fx.portadaFoto.alturaCuenta). En 0 o vacío no hace nada. */
    mover(document.querySelector('.portada .count'), num((fx.portadaFoto || {}).alturaCuenta));
  }
  window.INVAJUSTE_ALTURA = aplicar;
  var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) { clearInterval(t); setInterval(aplicar, 2000); } }, 400);
  addEventListener('message', function () { setTimeout(aplicar, 150); });
})();
