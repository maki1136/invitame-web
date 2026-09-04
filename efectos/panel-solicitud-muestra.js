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
   Se copia el VESTIDO: `fx` entero (coleccion, sobre, paleta, botones, fondo,
   fecha, raspadita, carta, itinerario...), las tipografias, los colores de cada
   seccion, el orden de las secciones y los fondos decorativos.
   NO se copia NADA de la muestra que sea CONTENIDO: nombres, fecha, slug, foto
   de portada, galeria, personas, lugares, invitados, trivia, mesa de regalos ni
   los datos de contacto. Si se copiara, el cliente recibiria la boda de otro.

   /!\ `fx.muestra` NO SE COPIA
   Son los dos interruptores de VENTA (mostrar los telefonos de Invitame y el
   llamado "Quieres la tuya"). En la invitacion de un cliente real eso no va
   nunca. Copiarlo seria publicar el telefono de Invitame en la boda de alguien.

   /!\ `fx.galeria.gid` TAMPOCO
   Es el codigo de la galeria de fotos de ESA fiesta. Dos eventos con el mismo
   gid comparten las fotos de los invitados.

   /!\ EL TEXTO DE LA CARTA SI VIENE DE LA MUESTRA
   `fx.carta` trae titulo y texto: son parte del diseno (la hoja tiene que tener
   algo escrito), pero hablan de otra pareja. Por eso el aviso final se lo
   recuerda a Jazmin en pantalla, con todas las letras.

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

  /* y ademas todas las claves que son puro color o fondo decorativo */
  function esDeDiseno(k) {
    if (DISENO.indexOf(k) >= 0) return true;
    if (/^c_color-/.test(k)) return true;
    if (/^c_fondo-color-/.test(k)) return true;
    if (/^img_c_fondo-/.test(k)) return true;
    if (/^img_c_imagen-fondo-/.test(k)) return true;
    if (/^img_c_imagen-de-fondo-/.test(k)) return true;
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

    /* los dos que NUNCA viajan */
    if (d.fx) {
      if (d.fx.muestra) delete d.fx.muestra;
      if (d.fx.galeria && d.fx.galeria.gid) d.fx.galeria.gid = '';
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
                'NO se copio nada de la muestra que sea contenido: nombres, fecha, ' +
                'fotos, lugares, personas ni invitados. Eso es del cliente.\n\n' +
                'REVISA EL TEXTO DE LA CARTA: viene escrito de la muestra y habla ' +
                'de otra pareja.\n\nCuando este, toca "Guardar y publicar".');
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
