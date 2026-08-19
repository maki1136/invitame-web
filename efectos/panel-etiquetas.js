/* ===== ETIQUETAS DEL PANEL, SIN REPETIDAS =====================================

   POR QUÉ EXISTE
   Al sumar los bloques de calendario, fecha y raspadita quedaron CUATRO
   etiquetas repetidas dentro de la misma pestaña de Efectos:
     · "Color del texto"        · "Color de los números"
     · "Texto de arriba"        · "Texto de abajo"
   Cada una vive en un bloque distinto y funciona bien, pero para la diseñadora
   es confuso ver dos campos con el mismo nombre en la misma pantalla.

   QUÉ HACE
   Les cambia el nombre a las del bloque de la fecha y de la raspadita, para que
   cada campo se llame distinto. Y agrega un aviso donde hace falta.

   ⚠️ POR QUÉ ES SEGURO CAMBIARLES EL NOMBRE
   En el resto del panel la clave del campo se calcula desde el TEXTO de la
   etiqueta, así que renombrar desconecta el dato. Pero estos campos son del
   bloque «✨ Efectos», que guarda por `fx.grupo.clave` — el texto es sólo lo que
   se lee. Por eso acá se puede, y en los demás sectores NO.

   PENDIENTE: la próxima vez que haya que subir `admin.html` a mano, corregir
   los nombres en el archivo y borrar este módulo.
   ============================================================================ */
(function () {
  'use strict';

  if (!/admin\.html$/.test(location.pathname)) return;   /* sólo en el panel */

  var CAMBIOS = [
    { bloque: /cómo se muestra la fecha/i, de: 'Color del texto',       a: 'Color de la fecha' },
    { bloque: /cómo se muestra la fecha/i, de: 'Texto de arriba',       a: 'Bajada de arriba' },
    { bloque: /cómo se muestra la fecha/i, de: 'Texto de abajo',        a: 'Bajada de abajo' },
    { bloque: /raspadita de la fecha/i,    de: 'Color de los números',  a: 'Color de los números al destapar' }
  ];

  /* aviso: las disposiciones de fotos no tienen lugar para las bajadas */
  var AVISO = 'Las opciones de FOTOS y CÍRCULOS no muestran los textos de arriba ' +
              'y abajo: la tarjeta es chica y los números van sobre las fotos.';

  function seccionDe(el) {
    /* el título del bloque es el `.h` anterior más cercano */
    var n = el;
    while (n) {
      var p = n.previousElementSibling;
      while (p) {
        if (p.classList && p.classList.contains('h')) return p.textContent || '';
        p = p.previousElementSibling;
      }
      n = n.parentElement;
    }
    return '';
  }

  function arreglar() {
    var labels = document.querySelectorAll('label');
    if (!labels.length) return;

    [].forEach.call(labels, function (l) {
      var txt = (l.textContent || '').trim();
      var sec = null;
      CAMBIOS.forEach(function (c) {
        if (txt !== c.de) return;
        if (sec === null) sec = seccionDe(l);
        if (c.bloque.test(sec)) l.textContent = c.a;
      });
    });

    /* el aviso, una sola vez, debajo del selector de disposición */
    if (!document.getElementById('ivf-aviso')) {
      var disp = [].filter.call(document.querySelectorAll('label'), function (l) {
        return (l.textContent || '').trim() === 'Disposición';
      })[0];
      if (disp && disp.parentElement) {
        var d = document.createElement('div');
        d.id = 'ivf-aviso';
        d.className = 'hint';
        d.textContent = AVISO;
        disp.parentElement.appendChild(d);
      }
    }
  }

  function arrancar() {
    arreglar();
    /* el panel se redibuja cada vez que cambia algo */
    if (window.MutationObserver) {
      new MutationObserver(arreglar).observe(document.body, { childList: true, subtree: true });
    }
    setInterval(arreglar, 900);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
