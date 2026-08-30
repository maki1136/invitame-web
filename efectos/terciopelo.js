/* ===== LA TELA DEL TERCIOPELO ================================================

   La foto de terciopelo que generó Maki, pasada a gris y centrada en gris
   neutro: aporta el RELIEVE —el pelo, los mechones— y nada de color. El color
   se lo pone la paleta, con background-blend-mode. Una sola tela sirve para las
   veinte paletas.

   Se publica como la variable CSS --inv-terciopelo y la usa /efectos/botones.js.
   Se carga sólo cuando el estilo Terciopelo está elegido.

   ⚠️ POR QUÉ ESTO ES UN .JS Y NO UN .CSS, Y POR QUÉ VA EN LÍNEAS CORTAS.
      La primera versión era un CSS con la foto en UNA SOLA LÍNEA de 10.540
      caracteres. Llegó con dos caracteres de más: el base64 dejó de ser
      múltiplo de 4, el JPEG quedó truncado, y en la invitación se veía la mitad
      de arriba con tela y la mitad de abajo gris plano.
      Ahora va partida en líneas cortas —un error queda acotado a una línea— y
      trae SU PROPIO CONTROL: el largo esperado y una suma de verificación. Si
      no coinciden, no se aplica nada y avisa por consola. Es mejor quedarse sin
      textura que mostrar una rota.

   ⚠️ SI HAY QUE CAMBIAR LA TELA: regenerar el base64 y regenerar TAMBIÉN el
      LARGO y la SUMA de abajo. Si se cambia uno solo, el control salta y la
      tela no se aplica — que es exactamente lo que tiene que pasar.
   ============================================================================ */
(function () {
  'use strict';

  var LARGO = 4300;
  var SUMA  = 3720917429;

  var P = [
    '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'
  ].join('');

  /* ---- el control ------------------------------------------------------- */
  var suma = 0;
  for (var i = 0; i < P.length; i++) suma = (suma * 31 + P.charCodeAt(i)) >>> 0;

  if (P.length !== LARGO || P.length % 4 !== 0 || suma !== SUMA) {
    /* llegó mal: mejor sin textura que con una rota */
    if (window.console && console.warn) {
      console.warn('[Invítame] La tela del terciopelo llegó dañada y no se aplicó. ' +
                   'Esperaba ' + LARGO + ' caracteres y suma ' + SUMA +
                   '; llegaron ' + P.length + ' y suma ' + suma + '.');
    }
    return;
  }

  document.documentElement.style.setProperty(
    '--inv-terciopelo', 'url("data:image/jpeg;base64,' + P + '")');
})();
