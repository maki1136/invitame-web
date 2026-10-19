/* ===== EL MENÚ POR TIEMPOS =====================================================

   19/10/2026 — cenas de graduación, galas y cumpleaños de adultos. Antes el
   menú se subía como IMAGEN (no se lee en un celular, no toma la colección y
   hay que rehacerla si cambia un plato).

   DE DÓNDE SALE
     fx.menu = { encendido, titulo, frase, tiempos: [{ nombre, desc }] }  (hasta 6)
   Se carga desde el panel (efectos/panel-menu.js, pestaña LUGAR_VEST, debajo
   del itinerario) y desde el formulario del cliente («Más cosas → Menú»).

   Apagado, o sin ningún tiempo con texto → la sección NO existe en el DOM.
   Va después del itinerario, salvo que «Orden de las secciones» diga otra
   cosa. Lo común (ubicar, vestir, CSS) vive en /efectos/secciones-nuevas.js.
   ============================================================================ */
(function () {
  'use strict';
  var KEY = 'menu';
  function pintar() {
    var S = window.INVSN; if (!S || !document.querySelector('.frame')) return;
    var e = S.ev(); if (!e) return;
    var c = (e.fx && e.fx.menu) || {};
    var tiempos = (Object.prototype.toString.call(c.tiempos) === '[object Array]' ? c.tiempos : [])
      .map(function (t) { return { n: S.txt(t && t.nombre, 80), d: S.txt(t && t.desc, 240) }; })
      .filter(function (t) { return t.n || t.d; }).slice(0, 6);
    if (!S.on(c.encendido) || !tiempos.length) { S.quitar(KEY); return; }
    S.css();
    var sec = S.seccion(KEY, S.txt(c.kick, 60) || 'Para disfrutar', S.txt(c.titulo, 70) || 'Menú');
    var frase = S.txt(c.frase, 240);
    S.cuerpo(sec,
      (frase ? '<p class="sn-frase">' + S.esc(frase) + '</p>' : '') +
      '<div class="sn-card sn-menu">' + tiempos.map(function (t) {
        return '<div class="sn-t">' + (t.n ? '<div class="sn-tn">' + S.esc(t.n) + '</div>' : '') +
               (t.d ? '<div class="sn-td">' + S.esc(t.d) + '</div>' : '') + '</div>';
      }).join('') + '</div>');
    S.colocar(sec, KEY, function () {
      var it = S.secDe('itinerario');
      return it ? { despues: it } : null;
    });
    S.legible(sec);
  }
  function esperar() { if (window.INVSN) window.INVSN.repetir(pintar); else setTimeout(esperar, 80); }
  esperar();
})();
