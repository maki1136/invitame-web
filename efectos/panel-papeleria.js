/* ===== «DISEÑO DE TARJETAS DE PAPELERÍA», EN EL PANEL ========================
   El interruptor de /efectos/papeleria.js (fx.papeleria). Pestaña PRINCIPAL,
   en la casa del diseño. Pedido de Maki, 23/11/2026: «¿tienen que ser todas
   iguales las estructuras de las invitaciones?».
   ⚠️ Escribe SIEMPRE en el borrador vivo (INVSN.borrador()).
   ============================================================================ */
(function () {
  'use strict';
  var ID = 'papeleria-selector';
  function arrancar() {
    var S = window.INVSN; if (!S) { setTimeout(arrancar, 100); return; }
    S.anotarCasa(ID, 'PRINCIPAL', 'diseno');
    S.bloque(ID, function (caja) {
      var p = function () { var d = S.borrador(); return d ? S.datos(d, 'papeleria') : {}; };
      S.titulo(caja, 'Diseño de tarjetas de papelería',
        'Cada sección se apoya sobre una tarjeta de papel con una forma distinta (arco, esquinas cortadas, blonda de encaje, festón, óvalo), un poco girada, como un juego de papelería sobre la mesa. Sirve con cualquier colección. Apagado, la invitación queda como siempre.');
      return [
        S.interruptor(caja, 'Usar el diseño de tarjetas de papelería',
          function () { return S.on(p().on); }, function (v) { p().on = v; }),
        S.interruptor(caja, 'Lacre arriba de algunas tarjetas (usa el medallón del itinerario)',
          function () { return S.on(p().sello); }, function (v) { p().sello = v; }),
        S.texto(caja, 'Color del papel de las tarjetas (vacío = marfil)', '#FAF8F3',
          function () { return p().color; }, function (v) { p().color = String(v || '').trim(); }, false, 9)
      ];
    });
  }
  arrancar();
})();
