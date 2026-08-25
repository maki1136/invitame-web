/* ===== ESPAÑOL DE MÉXICO ======================================================

   EL PROBLEMA
   El motor está escrito en voseo argentino: "Tocá el sello", "Rascá para
   revelar", "Compartí la invitación", "si querés tener un detalle"…
   El mercado de Invítame es MÉXICO. Para una novia de Guadalajara o San Miguel
   de Allende, ese "vos" suena extranjero y delata que la invitación no es
   local. Es de las cosas que más rápido rompen la ilusión de producto propio.

   QUÉ HACE
   Cuando el evento está en español de México, cambia esos textos por su forma
   mexicana. Sólo toca los textos FIJOS del motor: nada de lo que escriben las
   diseñadoras ni los novios.

   CUÁNDO SE ACTIVA
   · Si `INVEV.idioma` dice México (es lo normal), o
   · si `INVEV.fx.idioma.mx` está encendido, o
   · con `?mx=1` para probar.
   Si el evento estuviera en español rioplatense, no hace nada.

   PENDIENTE: cuando haya que subir el `index.html` a mano, corregir los textos
   en el origen y borrar este módulo. Mientras tanto esto lo resuelve sin
   tocar los archivos grandes.
   ============================================================================ */
(function () {
  'use strict';

  var CAMBIOS = [
    ['Tocá el sello para abrir',      'Toca el sello para abrir'],
    ['Rascá para revelar',            'Raspa para revelar'],
    ['Pasá el dedo para descubrir',   'Desliza el dedo para descubrir'],
    ['Compartí la invitación',        'Comparte la invitación'],
    ['Compartí el momento',           'Comparte el momento'],
    ['Pasá la voz',                   'Corre la voz'],
    ['Si querés tener un detalle',    'Si quieres tener un detalle'],
    ['dejamos nuestras mesas',        'aquí están nuestras mesas'],
    /* de los módulos nuevos */
    ['Empezá por el día',             'Empieza por el día'],
    ['Guardá la fecha',               'Guarda la fecha'],
    /* otros que aparecen en botones y avisos */
    ['Confirmá tu asistencia',        'Confirma tu asistencia'],
    ['Elegí',                         'Elige'],
    ['Mirá',                          'Mira'],
    ['Agendá',                        'Agenda'],
    ['Descargá',                      'Descarga'],
    ['Acordate',                      'Recuerda'],
    ['Fijate',                        'Fíjate'],
    ['Escribinos',                    'Escríbenos']
  ];

  function esMexico() {
    try {
      if (/[?&]mx=1/.test(location.search)) return true;
      var ev = window.INVEV || {};
      if (ev.fx && ev.fx.idioma && ev.fx.idioma.mx) return true;
      var i = String(ev.idioma || '');
      if (/m[eé]xico|mx/i.test(i)) return true;
      /* si no hay idioma declarado, no se asume nada */
      return false;
    } catch (e) { return false; }
  }

  function traducir(txt) {
    var salida = txt;
    for (var i = 0; i < CAMBIOS.length; i++) {
      if (salida.indexOf(CAMBIOS[i][0]) > -1) {
        salida = salida.split(CAMBIOS[i][0]).join(CAMBIOS[i][1]);
      }
    }
    return salida;
  }

  /* sólo nodos de texto: así no se rompe ningún HTML ni se tocan atributos */
  function recorrer(raiz) {
    var it = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, null);
    var n, cambios = 0;
    while ((n = it.nextNode())) {
      var p = n.parentNode;
      if (!p) continue;
      var tag = p.nodeName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') continue;
      var v = n.nodeValue;
      if (!v || v.length > 400) continue;
      var nuevo = traducir(v);
      if (nuevo !== v) { n.nodeValue = nuevo; cambios++; }
    }
    return cambios;
  }

  function pasar() {
    if (!esMexico()) return;
    recorrer(document.body);
    /* los placeholders de los formularios también */
    [].forEach.call(document.querySelectorAll('input[placeholder],textarea[placeholder]'), function (e) {
      var v = e.getAttribute('placeholder') || '';
      var nuevo = traducir(v);
      if (nuevo !== v) e.setAttribute('placeholder', nuevo);
    });
  }

  function arrancar() {
    pasar();
    /* el motor y los módulos escriben texto en cualquier momento */
    if (window.MutationObserver) {
      var pendiente = false;
      new MutationObserver(function () {
        if (pendiente) return;
        pendiente = true;
        setTimeout(function () { pendiente = false; pasar(); }, 120);
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    var n = 0, t = setInterval(function () { pasar(); if (++n > 60) clearInterval(t); }, 300);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
