/* ===== AVISOS IMPORTANTES, EN EL PANEL ========================================
   El bloque que escribe fx.avisos (lo dibuja /efectos/avisos.js). Pestaña
   LUGAR_VEST, debajo del menú. Rótulos: window.INV_ROTULOS_FX (/admin/0-claves.js).
   ============================================================================ */
(function () {
  'use strict';
  var ID = 'avisos-selector';
  var ICONOS = [['sin-ninos', 'Sin niños'], ['sin-valet', 'Sin valet parking'], ['hora-cierre', 'Hora de cierre'],
                ['trae-tu-bebida', 'Trae tu bebida'], ['uber', 'Pide tu Uber / taxi'], ['otro', 'Otro (ícono de aviso)']];
  var SUGERIDO = { 'sin-ninos': 'Evento solo para adultos.', 'sin-valet': 'El lugar no cuenta con valet parking.',
                   'hora-cierre': 'La fiesta termina a las 2:00 a. m.', 'trae-tu-bebida': 'Trae tu bebida favorita.',
                   'uber': 'Si vas a brindar, mejor pide tu Uber.', 'otro': '' };
  function arrancar() {
    var S = window.INVSN; if (!S) { setTimeout(arrancar, 100); return; }
    var R = S.rotulo;
    S.anotarCasa(ID, 'LUGAR_VEST', 'itinerario', null, '[data-sec=avisos]');
    S.registrarOrden('avisos', R('avisos', 'Avisos importantes'), ['menu', 'itinerario']);
    S.bloque(ID, function (caja) {
      S.registrarOrden('avisos', R('avisos', 'Avisos importantes'), ['menu', 'itinerario']);
      var a = function () { var d = S.borrador(); return d ? S.datos(d, 'avisos') : {}; };
      S.titulo(caja, R('avisos', 'Avisos importantes'),
        'Hasta 6 avisos con su ícono (sin niños, sin valet, hora de cierre, trae tu bebida, Uber). Apagado o vacío, no aparece.');
      var syncs = [
        S.interruptor(caja, R('avisos.encendido', 'Mostrar los avisos'),
          function () { return S.on(a().encendido); }, function (v) { a().encendido = v; }),
        S.texto(caja, R('avisos.titulo', 'Título de los avisos'), 'Avisos importantes',
          function () { return a().titulo; }, function (v) { a().titulo = v; }, false, 70)
      ];
      syncs.push(S.lista(caja, R('avisos.items', 'Avisos (ícono y texto)'), 6,
        [{ k: 'icono', tipo: 'select', ops: ICONOS, ancho: '0 1 160px' },
         { k: 'texto', ph: 'Ej: Evento solo para adultos.', ancho: '2 1 200px', max: 160 }],
        function () { return a().items; }, function (x) { a().items = x; },
        function () {
          if (!(a().items || []).length) a().encendido = true;   /* el primero la prende */
          var usados = (a().items || []).map(function (i) { return i.icono; });
          var lib = ICONOS.filter(function (o) { return usados.indexOf(o[0]) < 0; })[0] || ICONOS[5];
          return { icono: lib[0], texto: SUGERIDO[lib[0]] || '' };
        }));
      return syncs;
    });
  }
  arrancar();
})();
