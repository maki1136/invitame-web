/* ===== TAMAÑOS Y ESPACIOS QUE LAS CHICAS AJUSTAN SOLAS (26/10/2026) =============
   Maki: «si un texto quedó chico, en la plataforma tiene que tener algo como para
   agrandarlo. No quiero estar pasándote muestra por muestra toda la vida».
   Primeros pedidos (citlalli): «las argollas de arriba de Regalos las quiero más
   grandes» y, en Personas, «que dejen un espacio después del título y entre los
   padres de la novia y los del novio».
   EL DATO (todo en %, 100 = como viene; vacío = no se toca):
     fx.regalo.tam      la imagen/dibujo de ARRIBA de Mesa de regalos
     fx.regalo.pieTam   la imagen de ABAJO del texto (el sobrecito)
     fx.personas.espTit espacio entre el título y las personas, en px
     fx.personas.espEntre espacio entre una persona/pareja y la siguiente, en px
   Los controles: pestaña REGALOS (panel-regalo.js) y PERSONAS (admin/3-evento.js).
   Corre en la miniatura (escucha los mensajes del panel).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invTamanos) return; window.__invTamanos = 1;
  var ID = 'inv-tamanos-ajustables';
  function num(v, min, max) { var n = parseFloat(v); if (!isFinite(n)) return null; return Math.max(min, Math.min(max, n)); }
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var r = (ev.fx && ev.fx.regalo) || {}, p = (ev.fx && ev.fx.personas) || {};
    var css = [];
    var R = 'html body section[data-sec="regalos"]';
    var t = num(r.tam, 40, 300);
    if (t !== null && t !== 100) {
      var k = t / 100;
      css.push(R + ' #reg-adorno#reg-adorno{width:' + Math.min(95, 42 * k).toFixed(1) + '%!important;max-width:' + Math.round(150 * k) + 'px!important}');
      css.push(R + ' #reg-dibujo#reg-dibujo{width:' + Math.round(132 * k) + 'px!important;height:' + Math.round(132 * k) + 'px!important}');
    }
    var pt = num(r.pieTam, 40, 300);
    if (pt !== null && pt !== 100) {
      css.push(R + ' #reg-pie#reg-pie img{width:min(' + Math.round(240 * pt / 100) + 'px,92%)!important;max-width:none!important}');
    }
    var P = 'html body section[data-sec="padres"] .padres.padres.padres';
    var et = num(p.espTit, 0, 160), ee = num(p.espEntre, 0, 160);
    if (et !== null) css.push(P + '{margin-top:' + et + 'px!important}');
    if (ee !== null) css.push(P + '{gap:' + ee + 'px!important;row-gap:' + ee + 'px!important}');
    var st = document.getElementById(ID);
    if (!st) { st = document.createElement('style'); st.id = ID; document.head.appendChild(st); }
    var txt = css.join('\n');
    if (st.textContent !== txt) st.textContent = txt;
  }
  var n = 0, iv = setInterval(function () { aplicar(); if (++n > 40) clearInterval(iv); }, 400);
  window.addEventListener('message', function () { setTimeout(aplicar, 80); setTimeout(aplicar, 600); });
})();
