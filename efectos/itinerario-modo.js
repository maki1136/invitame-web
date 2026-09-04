/* ===== ITINERARIO: IMAGEN O TEXTO, ELEGIDO A MANO =============================

   EL PROBLEMA QUE RESUELVE
   El motor decide solo: si el evento tiene CUALQUIER imagen de itinerario
   cargada, la muestra y se va (`return`), y la lista de momentos no se dibuja
   nunca. Consecuencia: los efectos de la coleccion (las perlas del hilo, el
   zigzag, la aparicion con el scroll) NO aparecen, y nadie entiende por que.
   Peor: una imagen que quedo de una prueba vieja gana para siempre, en
   silencio, sin que haya un lugar donde decir "no, quiero el texto".

   QUE HACE
   Lee `fx.itinerario.modo` y OBLIGA:
     - 'texto'  -> esconde la imagen y muestra la lista (aunque haya imagen
                   cargada). Aca corren las perlas y todo lo de la coleccion.
     - 'imagen' -> muestra la imagen y esconde la lista.
     - vacio    -> NO TOCA NADA. Es como funciono siempre.
                   /!\ Esto es a proposito: ninguna invitacion ya entregada
                   cambia de aspecto porque se subio este archivo.

   /!\ POR QUE NO SE ARREGLA EN EL MOTOR
   `i/index.html` pesa 185 KB y lo comparten TODAS las invitaciones, incluidas
   las versiones congeladas de /i/v/. Tocarlo para esto seria cambiarle el
   comportamiento a gente que ya recibio su invitacion. Un modulo que corre
   despues y solo actua si el campo existe no le toca la vida a nadie.

   /!\ EL SEGUNDO BUG, MAS FEO
   Si la disenadora carga los momentos SOLO desde el panel
   (`fx.itinerario.momentos`) y deja vacio el texto viejo
   (`c_itinerario-descripcion`), el motor concluye "no hay itinerario" y
   ESCONDE LA SECCION ENTERA -- aunque `itinerario-momentos.js` ya escribio las
   filas. En modo 'texto' este modulo tambien repara eso: si hay momentos
   cargados, la seccion se muestra.

   /!\ NO REESCRIBIR `img.src` SI YA TIENE UNO
   El motor pone la URL pasada por Cloudinary (`cldOpt(u,'w_1000,c_limit')`).
   Si aca la piso con la URL cruda, la imagen pesa de mas. Solo se escribe
   cuando esta vacio.

   /!\ EL OBSERVER SE MUERDE LA COLA
   Escribir `style.display` dispara el MutationObserver, que vuelve a escribir,
   y asi al infinito. Por eso: solo se escribe cuando el valor es DISTINTO, y
   el observer entra con un respiro de 40 ms.
   ============================================================================ */
(function () {
  'use strict';

  var CLAVES_IMG = ['img_c_itinerario-imagen',
                    'img_f-itinerario-imagen',
                    'img_c_itinerario-imagen-'];

  function evento() {
    try { return window.INVEV || null; } catch (e) { return null; }
  }

  function config() {
    var e = evento();
    return (e && e.fx && e.fx.itinerario) ? e.fx.itinerario : null;
  }

  function urlImagen() {
    var e = evento(); if (!e) return '';
    for (var i = 0; i < CLAVES_IMG.length; i++) {
      if (e[CLAVES_IMG[i]]) return e[CLAVES_IMG[i]];
    }
    for (var k in e) {
      if (/^img_.*itinerario/i.test(k) && e[k]) return e[k];
    }
    return '';
  }

  function hayTexto() {
    var e = evento(); if (!e) return false;
    var c = config();
    if (c && Object.prototype.toString.call(c.momentos) === '[object Array]' &&
        c.momentos.length) {
      for (var i = 0; i < c.momentos.length; i++) {
        var m = c.momentos[i] || {};
        if (String(m.h || '').trim() || String(m.t || '').trim()) return true;
      }
    }
    var t = e['c_itinerario-descripcion'] ||
            e['c_itinerario-descripci-n'] ||
            e.itDescrip || '';
    return String(t).trim().length > 0;
  }

  /* escribe solo si cambia: si no, el observer entra en bucle */
  function verlo(nodo, mostrar) {
    if (!nodo) return;
    var quiero = mostrar ? '' : 'none';
    if (nodo.style.display !== quiero) nodo.style.display = quiero;
  }

  function aplicar() {
    var c = config(); if (!c) return;
    var modo = String(c.modo || '').toLowerCase();
    if (modo !== 'texto' && modo !== 'imagen') return;   /* automatico: no tocar */

    var sec   = document.querySelector('[data-sec="itinerario"]');
    var lista = document.getElementById('it-lista');
    var img   = document.getElementById('it-img');
    var nota  = document.getElementById('it-nota');
    if (!sec) return;

    verlo(nota, false);

    if (modo === 'imagen') {
      var u = urlImagen();
      if (!u) { verlo(sec, false); return; }
      verlo(sec, true);
      if (img && !img.getAttribute('src')) img.src = u;
      verlo(img, true);
      verlo(lista, false);
      return;
    }

    /* modo texto */
    if (!hayTexto()) { verlo(sec, false); return; }
    verlo(sec, true);
    verlo(img, false);
    verlo(lista, true);
  }

  function arrancar() {
    aplicar();
    addEventListener('message', function () { setTimeout(aplicar, 60); });

    if (window.MutationObserver) {
      var pendiente = false;
      new MutationObserver(function () {
        if (pendiente) return;
        pendiente = true;
        setTimeout(function () { pendiente = false; aplicar(); }, 40);
      }).observe(document.body, { childList: true, subtree: true, attributes: true,
                                  attributeFilter: ['style'] });
    }

    /* el evento llega DESPUES: hay que reintentar un rato */
    var n = 0, t = setInterval(function () {
      aplicar();
      if (++n > 80) clearInterval(t);
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else arrancar();
})();
