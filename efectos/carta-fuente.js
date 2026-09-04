/* ===== LA TIPOGRAFIA DE LA CARTA ==============================================

   EL PROBLEMA QUE RESUELVE
   El motor aplica `fx.carta.fuente` como variable CSS (`--cf-font`) pero NO
   la descarga. Solo llama a `cargarFont()` para la tipografia de los nombres
   (`nfont`) y la principal (`fTit`). Resultado: si en el panel se elige para la
   carta una fuente que ninguna otra parte de la invitacion usa, el navegador no
   la tiene, cae en la de reserva y la eleccion no se ve. El campo "funciona"
   pero no hace nada -- que es peor que no tenerlo.

   QUE HACE
   Mira `fx.carta.fuente`, y si esa familia no esta ya pedida en el documento,
   agrega el <link> de Google Fonts. Nada mas.

   /!\ SE FIJA SI YA ESTA
   `nfont` y `fTit` suelen traer la misma familia. Pedirla dos veces no rompe,
   pero suma una descarga al vicio. Por eso se revisa el href de los <link> que
   ya estan puestos.

   /!\ LA FAMILIA VIENE PELADA
   En la base se guarda "Cormorant Garamond", no "'Cormorant Garamond',serif".
   Asi lo escribe el motor en `--cf-font`. Si algun dia llegara con comillas o
   con el fallback pegado, se limpia antes de armar la URL.
   ============================================================================ */
(function () {
  'use strict';

  function familia() {
    try {
      var f = window.INVEV && window.INVEV.fx && window.INVEV.fx.carta &&
              window.INVEV.fx.carta.fuente;
      if (!f) return '';
      return String(f).split(',')[0].replace(/['"]/g, '').trim();
    } catch (e) { return ''; }
  }

  function yaEsta(fam) {
    var url = fam.replace(/ /g, '+');
    var ls = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < ls.length; i++) {
      var h = ls[i].getAttribute('href') || '';
      if (h.indexOf('fonts.googleapis.com') >= 0 && h.indexOf(url) >= 0) return true;
    }
    return false;
  }

  var pedidas = {};

  function pedir() {
    var fam = familia();
    if (!fam || pedidas[fam]) return;
    pedidas[fam] = true;
    if (yaEsta(fam)) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' +
             encodeURIComponent(fam).replace(/%20/g, '+') +
             ':wght@300;400;500;600;700&display=swap';
    document.head.appendChild(l);
  }

  function arrancar() {
    pedir();
    addEventListener('message', function () { setTimeout(pedir, 60); });
    var n = 0, t = setInterval(function () {
      pedir();
      if (++n > 60) clearInterval(t);
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else arrancar();
})();
