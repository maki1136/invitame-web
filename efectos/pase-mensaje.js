/* ===== EL MENSAJE DE LOS NOVIOS PARA CADA INVITADO (30/10/2026) ==============
   Jazmín (gabriel-y-dany): «Los clientes cuando colocan un mensaje especial
   para los invitados, no se visualiza en los links. Hice una prueba y es
   cierto».

   El panel de los novios (mi-panel → «Editar pase» → «Mensaje») lo guardaba
   bien en la ficha del invitado (inv_invitados/{slug}__{token}.notaNovios),
   pero NINGUNA parte de la invitación lo leía: se guardaba y no se veía.

   Ahora, si el invitado abre SU link (&g=…) y su ficha trae mensaje, aparece
   debajo de su pase, con la letra y el color del título de esa sección.
   Sin mensaje no aparece nada → las invitaciones entregadas no cambian salvo
   para el invitado al que los novios le escribieron algo (que es lo pedido).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPaseMensaje) return; window.__invPaseMensaje = 1;

  var ID = 'pv-mensaje';
  function texto() {
    var g = window.INVGUEST;
    return g && typeof g.notaNovios === 'string' ? g.notaNovios.trim() : '';
  }
  function poner() {
    var sec = document.querySelector('section.pase');
    var card = sec && sec.querySelector('.pasecard');
    var t = texto(), m = document.getElementById(ID);
    if (!card || !t) { if (m) m.remove(); return; }
    if (!m) {
      m = document.createElement('div'); m.id = ID;
      m.style.cssText = 'margin:14px auto 4px;max-width:420px;padding:0 18px;text-align:center;font-style:italic;font-size:17px;line-height:1.5;white-space:pre-line';
    }
    if (m.previousElementSibling !== card) card.parentNode.insertBefore(m, card.nextSibling);
    var tit = sec.querySelector('.t');
    if (tit) {
      try {
        var cs = getComputedStyle(tit);
        if (m.style.color !== cs.color) m.style.color = cs.color;
        if (!m.style.fontFamily) m.style.fontFamily = cs.fontFamily;
      } catch (e) {}
    }
    var v = '«' + t + '»';
    if (m.textContent !== v) m.textContent = v;
  }
  function arrancar() {
    if (typeof D === 'object' && D && !window.INVEV) return;   /* panel: no corre */
    if (!/[?&]g=/.test(location.search)) return;              /* sólo en el link de un invitado */
    var n = 0, t = setInterval(function () { poner(); if (++n > 60) clearInterval(t); }, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
