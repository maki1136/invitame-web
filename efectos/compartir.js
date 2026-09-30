/* ===== «COMPARTÍ LA INVITACIÓN», EDITABLE Y QUE SE PUEDA SACAR ================

   Jazmín, 29/9/2026: «Sector "comparte la invitación" no aparece en las
   categorías de la plataforma, no sé dónde editarlo ni si se puede sacar».
   Tenía razón: los textos estaban fijos en el motor y la única forma de
   esconderlo era un interruptor con otro nombre («Deshabilitar sección frase
   final»). Se carga desde CONFIRMACIÓN → «Compartí la invitación»
   (/efectos/panel-compartir.js).

     fx.compartir = { on:false }          → no se muestra
     fx.compartir = { kick, titulo, frase, boton }  → los textos (vacío = el de siempre)

   Sólo ESCONDE, nunca fuerza a mostrar: si el motor la escondió por otro
   motivo, sigue escondida.
   ============================================================================ */
(function () {
  'use strict';
  var ORIG = null;

  function cfg() {
    try { var c = ((window.INVEV || {}).fx || {}).compartir; return (c && typeof c === 'object') ? c : {}; }
    catch (e) { return {}; }
  }
  function aplicar() {
    var s = document.getElementById('share-sec'); if (!s) return;
    var k = s.querySelector('.kick'), h = s.querySelector('h2'), p = s.querySelector('p'), b = document.getElementById('wa-share');
    if (!ORIG) ORIG = { kick: k && k.textContent, titulo: h && h.textContent, frase: p && p.textContent, boton: b && b.textContent };
    var c = cfg();
    if (c.on === false) { s.setAttribute('data-compartir-oculta', '1'); s.style.display = 'none'; }
    else if (s.getAttribute('data-compartir-oculta')) { s.removeAttribute('data-compartir-oculta'); s.style.display = ''; }
    function poner(el, v, o) { if (!el) return; var t = (v && String(v).trim()) ? String(v) : o; if (t != null && el.textContent !== t) el.textContent = t; }
    poner(k, c.kick, ORIG.kick); poner(h, c.titulo, ORIG.titulo); poner(p, c.frase, ORIG.frase); poner(b, c.boton, ORIG.boton);
  }
  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    aplicar();
    addEventListener('message', function () { setTimeout(aplicar, 80); });
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 30) clearInterval(t); }, 500);
  }
  arrancar();
})();
