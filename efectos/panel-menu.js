/* ===== EL MENÚ POR TIEMPOS, EN EL PANEL =======================================
   El bloque que escribe fx.menu (lo dibuja /efectos/menu.js). Pestaña
   LUGAR_VEST, debajo del itinerario. Rótulos: window.INV_ROTULOS_FX
   (/admin/0-claves.js). Usa las piezas de /efectos/secciones-nuevas.js.
   ⚠️ Escribe SIEMPRE en el borrador vivo (INVSN.borrador()), nunca en un `D`
      guardado al construir: el panel reemplaza D.fx al cambiar de invitación.
   ============================================================================ */
(function () {
  'use strict';
  var ID = 'menu-selector';
  function arrancar() {
    var S = window.INVSN; if (!S) { setTimeout(arrancar, 100); return; }
    var R = S.rotulo;
    S.anotarCasa(ID, 'LUGAR_VEST', 'itinerario', null, '[data-sec=menu]');
    S.registrarOrden('menu', R('menu', 'Menú'), ['itinerario']);
    S.bloque(ID, function (caja) {
      S.registrarOrden('menu', R('menu', 'Menú'), ['itinerario']);
      var m = function () { var d = S.borrador(); return d ? S.datos(d, 'menu') : {}; };
      S.titulo(caja, R('menu', 'Menú por tiempos'),
        'Cena de graduación, gala, cumpleaños de adultos. Hasta 6 tiempos. Apagado o sin tiempos, la sección no aparece. Va después del itinerario (se puede mover en «Orden de las secciones»).');
      return [
        S.interruptor(caja, R('menu.encendido', 'Mostrar el menú'),
          function () { return S.on(m().encendido); }, function (v) { m().encendido = v; }),
        S.texto(caja, R('menu.titulo', 'Título del menú'), 'Menú',
          function () { return m().titulo; }, function (v) { m().titulo = v; }, false, 70),
        S.texto(caja, R('menu.frase', 'Frase del menú'), 'Preparamos algo especial para esta noche.',
          function () { return m().frase; }, function (v) { m().frase = v; }, true, 240),
        S.lista(caja, R('menu.tiempos', 'Tiempos (nombre y descripción)'), 6,
          [{ k: 'nombre', ph: 'Ej: Entrada', ancho: '1 1 120px', max: 80 },
           { k: 'desc', ph: 'Ej: Crema de elote con chile poblano', ancho: '2 1 200px', max: 240 }],
          function () { return m().tiempos; }, function (a) { m().tiempos = a; },
          function () {
            /* agregar el primero la prende: si no, Jazmín carga y no ve nada */
            if (!(m().tiempos || m().logos || []).length) m().encendido = true;
            return { nombre: '', desc: '' };
          })
      ];
    });
  }
  arrancar();
})();
