/* ===== CLONAR LA MUESTRA QUE ELIGIO EL CLIENTE ================================

   LO QUE PEDIA MAKI, TEXTUAL
   «cada vez que nosotros armemos una muestra, le pongamos un nombre y que el
   cliente pueda apretar, por ejemplo, en Perlas, y que ya directamente se le
   arme todo perfecto como esa invitacion. Seria un clonar la invitacion, y que
   la gente ponga sus datos, y que ya despues nos aparezca a nosotros armada
   para entregar.»

   COMO FUNCIONA EL CAMINO ENTERO
   1. /catalogo.html muestra las muestras con nombre (de /muestras/catalogo.js).
   2. El cliente toca "Elegir este" -> va a crear.html?tpl=perlas.
   3. El formulario guarda `tpl` en la solicitud (eso ya lo hacia solo).
   4. Jazmin toca "Cargar en el editor" en la lista de solicitudes.
   5. ESTE MODULO se cuelga de ahi: mira `tpl`, busca la muestra, baja esa
      invitacion y le COPIA EL DISENO al borrador. Los datos del cliente quedan
      intactos.
   6. Jazmin revisa y publica.

   /!\ QUE SE COPIA Y QUE NO -- LA LISTA ES A PROPOSITO
   Se copia el VESTIDO: `fx` (coleccion, sobre, paleta, botones, fondo, fecha,
   raspadita, particulas, diseno...), las tipografias, los colores de cada
   seccion y el orden de las secciones.
   NO se copia NADA que sea CONTENIDO: nombres, fecha, slug, foto de portada,
   galeria, personas, lugares, invitados, trivia, mesa de regalos ni los datos
   de contacto. Si se copiara, el cliente recibiria la boda de otro.

   /!\ LAS CUATRO COSAS QUE SE LIMPIAN AL VUELO -- CADA UNA POR UN MOTIVO MEDIDO
   Probando el clonado de verdad (con una solicitud inventada, en memoria)
   aparecieron cuatro fugas. Estan tapadas, y anotadas para que no vuelvan:

     1. `fx.muestra` — son los dos interruptores de VENTA (mostrar los telefonos
        de Invitame y el llamado "Quieres la tuya"). En la invitacion de un
        cliente real eso no va NUNCA: seria publicar el telefono de Invitame en
        la boda de alguien.
     2. `fx.galeria.gid` — es el codigo de la galeria de fotos de ESA fiesta.
        Dos eventos con el mismo gid comparten las fotos de los invitados.
     3. `fx.carta` (titulo, texto y bajada) — la hoja de la muestra cuenta la
        historia de OTRA pareja ("nos conocimos en la playa..."). Se copian los
        colores y la tipografia de la carta, pero las palabras se vacian: sin
        texto propio, el motor muestra su frase generica, que no es de nadie.
     4. `fx.itinerario.momentos` — son los horarios de otra fiesta. El itinerario
        que escribio el cliente viene en su solicitud; Jazmin tiene el boton
        "Traer los del texto" en el bloque del itinerario.

   /!\ Y NO SE COPIA NINGUNA IMAGEN. NI LAS DE FONDO.
   La primera version copiaba `img_c_fondo-*` pensando que eran texturas. No lo
   son: en `camila-y-tomas`, el fondo de la seccion de la frase es una FOTO DE
   LA PAREJA. Copiarla habria puesto la cara de Camila y Tomas en la invitacion
   de un cliente. Regla nueva y sin excepciones: **una imagen es contenido**.
   El vestido se arma con `fx` y los colores, que no tienen cara de nadie.

   POR QUE ES UN MODULO Y NO ESTA EN admin.html
   admin.html pesa 159 KB y no entra en una subida (techo medido: ~45 KB).
   `cargarSolicitudIdx` es global, asi que se puede envolver desde afuera.
   ============================================================================ */
(function () {
  'use strict';

  /* el vestido: lo unico que se copia de la muestra */
  var DISENO = [
    'fx', 'tema', 'color', 'ver', 'tpl',
    'nfont', 'fTit', 'fTit2', 'fraseFont', 'fraseSize', 'nsize', 'ncolor', 'layout',
    'kickColor', 'fraseColor', 'fraseFx',
    'evColor', 'evTextColor', 'evBtnColor', 'evBtnTextColor',
    'galTextColor', 'padresColor', 'regColor', 'cfColor',
    'secOrden'
  ];

  /* ademas, todo lo que es puro color. NINGUNA imagen: ver la nota de arriba. */
  function esDeDiseno(k) {
    if (k.indexOf('img_') === 0) return false;      /* una imagen es contenido */
    if (DISENO.indexOf(k) >= 0) return true;
    if (/^c_color-/.test(k)) return true;
    if (/^c_fondo-color-/.test(k)) return true;
    return false;
  }

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }

  function copia(v) {
    try { return JSON.parse(JSON.stringify(v)); } catch (e) { return v; }
  }

  function vestir(d, muestra) {
    var puestos = [];
    Object.keys(muestra).forEach(function (k) {
      if (!esDeDiseno(k)) return;
      if (muestra[k] == null || muestra[k] === '') return;
      d[k] = copia(muestra[k]);
      puestos.push(k);
    });

    /* las cuatro limpiezas. Ver la nota grande de arriba: cada una tapa una
       fuga que se vio de verdad al probar el clonado. */
    if (d.fx) {
      if (d.fx.muestra) delete d.fx.muestra;
      if (d.fx.galeria && d.fx.galeria.gid) d.fx.galeria.gid = '';
      if (d.fx.carta) {
        d.fx.carta.titulo = '';
        d.fx.carta.texto  = '';
        d.fx.carta.kicker = '';
      }
      if (d.fx.itinerario) d.fx.itinerario.momentos = [];
    }
    return puestos;
  }

  function envolver() {
    if (typeof window.cargarSolicitudIdx !== 'function' ||
        window.cargarSolicitudIdx.__clonaMuestra) return false;

    var original = window.cargarSolicitudIdx;

    var envuelta = function (i) {
      var s = (window._solicCache || [])[i] || null;
      var r = original.apply(this, arguments);

      var id = String((s && s.tpl) || '').toLowerCase();
      if (!id || typeof window.muestraDe !== 'function') return r;
      var m = window.muestraDe(id);
      if (!m || !m.muestra) return r;
      if (!window.INV || typeof window.INV.getEvento !== 'function') return r;

      /* el original es sincronico y termina con un alert(); el clonado va
         despues, con su propio aviso, para no pisarle el cartel */
      setTimeout(function () {
        window.INV.getEvento(m.muestra).then(function (ev) {
          if (!ev) { alert('Elegiste la muestra "' + m.nombre + '" pero no pude ' +
                           'bajarla (' + m.muestra + '). Los datos del cliente ' +
                           'estan cargados igual.'); return; }
          var d = borrador(); if (!d) return;
          var puestos = vestir(d, ev);
          if (typeof window.renderPanel === 'function') { try { window.renderPanel(); } catch (e) {} }
          if (typeof window.render === 'function')      { try { window.render(); }      catch (e) {} }
          alert('Le puse el vestido de la muestra "' + m.nombre + '".\n\n' +
                'Se copiaron ' + puestos.length + ' cosas de diseno: la coleccion, ' +
                'el sobre, la paleta, las tipografias y los colores de cada seccion.\n\n' +
                'NO se copio NADA de contenido: ni fotos, ni nombres, ni fecha, ni ' +
                'lugares, ni personas, ni invitados. El texto de la carta y los ' +
                'horarios del itinerario quedaron VACIOS a proposito, para que no ' +
                'salga la historia de otra pareja.\n\n' +
                'Falta: escribir la carta y cargar el itinerario (el boton "Traer ' +
                'los del texto" arma los momentos con lo que mando el cliente).\n\n' +
                'Cuando este, toca "Guardar y publicar".');
        })['catch'](function (e) {
          alert('No pude bajar la muestra "' + m.nombre + '": ' + (e && e.message || e) +
                '\n\nLos datos del cliente estan cargados igual.');
        });
      }, 60);

      return r;
    };

    envuelta.__clonaMuestra = true;
    window.cargarSolicitudIdx = envuelta;
    return true;
  }

  var n = 0;
  var t = setInterval(function () {
    if (envolver() || ++n > 80) clearInterval(t);
  }, 250);
})();
