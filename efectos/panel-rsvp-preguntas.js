/* ===== LAS PREGUNTAS EXTRA DE LA CONFIRMACIÓN, EN EL PANEL ====================
   Escribe fx.rsvp.preguntas = [{texto, tipo:'texto'|'sino'}] (hasta 3). Las
   dibuja y las guarda /efectos/rsvp-preguntas.js; los anfitriones las ven en
   su panel (mi-panel.js) y en el CSV. Pestaña CONFIRMACIÓN, debajo del bloque
   de la confirmación. Rótulos: window.INV_ROTULOS_FX (/admin/0-claves.js).
   ============================================================================ */
(function () {
  'use strict';
  var ID = 'rsvp-preguntas-selector';
  function arrancar() {
    var S = window.INVSN; if (!S) { setTimeout(arrancar, 100); return; }
    var R = S.rotulo;
    S.anotarCasa(ID, 'CONFIRMACIÓN', 'confirmacion', null, '[data-sec=confirmacion]');
    S.bloque(ID, function (caja) {
      var r = function () { var d = S.borrador(); return d ? S.datos(d, 'rsvp') : {}; };
      S.titulo(caja, R('rsvp.preguntas', 'Preguntas extra al confirmar'),
        'Hasta 3. Ej: «¿Empresa?» y «¿Cargo?» en un corporativo, «¿Cuántos niños vienen?» en un kids. Sí/No sirve para juegos («¿Crees que es niño?»). Las respuestas las ven los anfitriones en su panel y en el Excel.');
      return [
        S.lista(caja, R('rsvp.preguntas.lista', 'Preguntas (texto y tipo de respuesta)'), 3,
          [{ k: 'texto', ph: 'Ej: ¿En qué empresa trabajas?', ancho: '2 1 200px', max: 80 },
           { k: 'tipo', tipo: 'select', ops: [['texto', 'Respuesta escrita'], ['sino', 'Sí / No']], ancho: '0 1 150px' }],
          function () { return r().preguntas; }, function (a) { r().preguntas = a; },
          function () { return { texto: '', tipo: 'texto' }; })
      ];
    });
  }
  arrancar();
})();
