/* ===== LA CARTA QUE LLEVA LA FRASE NO SE ESCONDE (23/10/2026) ================
   citlalli-y-hedwin-jesus (Marfil): «no está por ningún lado en mi invitación
   la frase que va debajo de la fecha». Marfil muda la frase adentro de la
   carta (#carta-sec .mf-frase), pero el motor esconde la carta entera cuando
   no tiene texto propio → la frase se iba con ella.
   Si la carta lleva la frase adentro, se muestra, salvo que esté apagada en el
   panel o marcada en «Secciones que no van».
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invCartaConFrase) return; window.__invCartaConFrase = 1;
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var fx = ev.fx || {};
    var cs = document.getElementById('carta-sec'); if (!cs) return;
    var oc = Array.isArray(fx.ocultas) ? fx.ocultas : [];
    if ((fx.carta && fx.carta.on === false) || oc.indexOf('carta') > -1) return;
    if (!cs.querySelector('.mf-frase')) return;
    if (cs.style.display === 'none') { cs.style.display = ''; cs.setAttribute('data-por-la-frase', '1'); }
    /* sin carta propia: se ve SÓLO la frase, sin el sobre ni el texto de ejemplo
       («Queridos amigos y familia…») ni el título «Una carta para ti». */
    if (cs.getAttribute('data-por-la-frase')) {
      var hayCarta = String((fx.carta && fx.carta.texto) || '').trim() !== '';
      ['cartafx', 'cf-h2c', 'cf-kick'].forEach(function (id) {
        var e = document.getElementById(id); if (!e) return;
        if (!hayCarta) e.style.setProperty('display', 'none', 'important'); else e.style.removeProperty('display');
      });
    }
  }
  /* ★ 25/11 (Jazmín, Diego y Sofía: «quiere la frase arriba de la carta pero no me
     deja subirla»): con Marfil la frase vive ADENTRO de la carta y «Reordenar» no
     la mueve. Casilla del panel: fx.estiloSec.carta.fraseArriba → la frase va
     arriba de todo de la carta (antes de «Con cariño / Una carta para ti»), o, si
     la frase está en su banda aparte, la banda va justo antes de la carta.
     Apagada no hace nada: ninguna invitación entregada cambia. */
  var marcaFrase = null;
  function fraseArriba() {
    var ev = window.INVEV; if (!ev) return;
    var c = (((ev.fx || {}).estiloSec || {}).carta) || {};
    var on = c.fraseArriba === true || c.fraseArriba === 'true';
    var cs = document.getElementById('carta-sec'); if (!cs) return;
    var adentro = cs.querySelector('.mf-frase');
    var banda = document.querySelector('.fraseSec');
    if (on) {
      if (adentro) {
        if (cs.firstElementChild !== adentro) {
          if (!marcaFrase) { marcaFrase = document.createComment('lugar-de-la-frase'); adentro.parentNode.insertBefore(marcaFrase, adentro); }
          cs.insertBefore(adentro, cs.firstChild);
        }
      } else if (banda && banda.parentNode === cs.parentNode && banda.nextElementSibling !== cs && banda.style.display !== 'none') {
        if (!marcaFrase) { marcaFrase = document.createComment('lugar-de-la-frase'); banda.parentNode.insertBefore(marcaFrase, banda); }
        cs.parentNode.insertBefore(banda, cs);
      }
    } else if (marcaFrase && marcaFrase.parentNode) {
      var el = adentro || banda;
      if (el) marcaFrase.parentNode.insertBefore(el, marcaFrase);
      marcaFrase.remove(); marcaFrase = null;
    }
  }
  var _aplicar = aplicar;
  aplicar = function () { try { _aplicar(); } catch (e) {} try { fraseArriba(); } catch (e) {} };
  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    aplicar();
    addEventListener('message', function () { setTimeout(aplicar, 150); });
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 500);
    setInterval(aplicar, 2000);
  }
  arrancar();
})();
