/* ===== PATROCINADORES, EN EL PANEL ============================================
   El bloque que escribe fx.patrocinadores (lo dibuja /efectos/patrocinadores.js).
   Pestaña PRINCIPAL, junto al cierre. Cada logo se sube con INV.uploadImage
   (Cloudinary de Invítame). Rótulos: window.INV_ROTULOS_FX (/admin/0-claves.js).
   ============================================================================ */
(function () {
  'use strict';
  var ID = 'patrocinadores-selector';
  function arrancar() {
    var S = window.INVSN; if (!S) { setTimeout(arrancar, 100); return; }
    var R = S.rotulo;
    S.anotarCasa(ID, 'PRINCIPAL', 'cierre', null, '[data-sec=patrocinadores]');
    S.registrarOrden('patrocinadores', R('patrocinadores', 'Patrocinadores'), []);
    S.bloque(ID, function (caja) {
      S.registrarOrden('patrocinadores', R('patrocinadores', 'Patrocinadores'), []);
      var p = function () { var d = S.borrador(); return d ? S.datos(d, 'patrocinadores') : {}; };
      S.titulo(caja, R('patrocinadores', 'Patrocinadores'),
        'Eventos corporativos. Hasta 12 logos (PNG con fondo transparente se ve mejor). Con link, el logo abre la página. Va antes del cierre.');
      return [
        S.interruptor(caja, R('patrocinadores.encendido', 'Mostrar los patrocinadores'),
          function () { return S.on(p().encendido); }, function (v) { p().encendido = v; }),
        S.texto(caja, R('patrocinadores.titulo', 'Título de patrocinadores'), 'Patrocinadores',
          function () { return p().titulo; }, function (v) { p().titulo = v; }, false, 70),
        S.lista(caja, R('patrocinadores.logos', 'Logos (imagen, nombre y link)'), 12,
          [{ k: 'img', tipo: 'img', ancho: '0 0 auto' },
           { k: 'nombre', ph: 'Nombre', ancho: '1 1 110px', max: 60 },
           { k: 'link', ph: 'Link (opcional)', ancho: '1 1 140px', max: 300 }],
          function () { return p().logos; }, function (x) { p().logos = x; },
          function () {
            /* agregar el primero la prende: si no, Jazmín carga y no ve nada */
            if (!(p().tiempos || p().logos || []).length) p().encendido = true;
            return { img: '', nombre: '', link: '' };
          })
      ];
    });
  }
  arrancar();
})();
