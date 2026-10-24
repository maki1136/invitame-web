/* ===== CONTACTO: EL BOTÓN DE WHATSAPP ABRE CON EL MENSAJE ESCRITO (24/10/2026)
   Jazmín, Renata: «que aparezca ese mensaje cuando seleccionen confirmar
   asistencia en el link de WhatsApp»:
     Hola, confirmo mi asistencia a los XV años de Renata.
     Nombre del invitado:
     Número de personas que asistirán:
     ¡Muchas gracias!
   CUÁNDO: si en el panel escribieron «Frase del mensaje de WhatsApp» (CONFIRMACIÓN),
   va ese texto ({nombre} se cambia por el nombre de la fiesta). Si no, el de
   arriba va sólo cuando el botón ES para confirmar: la sección Confirmación está
   en «Secciones que no van» (se confirma por WhatsApp) o el botón dice «confirmar».
   Un botón de «dudas» sigue abriendo el chat vacío.
   No toca las muestras de venta (muestra-venta.js pone su propio mensaje).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invContactoMsj) return; window.__invContactoMsj = 1;

  function mensaje(ev, boton) {
    var nombre = [ev.n1, ev.n2].filter(Boolean).join(' y ');
    var propio = String(ev['c_mensaje-wsp-contacto'] || '').trim();
    if (propio) return propio.replace(/\{nombre\}/gi, nombre);
    var oc = (ev.fx && Array.isArray(ev.fx.ocultas)) ? ev.fx.ocultas : [];
    var esConfirmar = oc.indexOf('confirmacion') > -1 || /confirm/i.test(boton.textContent || '');
    if (!esConfirmar) return '';
    var tipo = (window.INVTIPO && window.INVTIPO.tipo) || ev.tipoEvento || '';
    var de = /^xv/i.test(tipo) ? 'los XV años' : ((window.INVTIPO && window.INVTIPO.de) || 'la fiesta');
    return 'Hola, confirmo mi asistencia a ' + de + (nombre ? ' de ' + nombre : '') + '.\n' +
           'Nombre del invitado: \n' +
           'Número de personas que asistirán: \n' +
           '¡Muchas gracias!';
  }

  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    ['wa-p1', 'wa-p2'].forEach(function (id) {
      var a = document.getElementById(id);
      if (!a || a.getAttribute('data-mvta')) return;
      var href = a.getAttribute('href') || '';
      var m = href.match(/^https:\/\/wa\.me\/(\d+)/);
      if (!m) return;
      var t = mensaje(ev, a);
      var nuevo = 'https://wa.me/' + m[1] + (t ? '?text=' + encodeURIComponent(t) : '');
      if (href !== nuevo) a.setAttribute('href', nuevo);
    });
  }

  var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 500);
  window.addEventListener('message', function () { setTimeout(aplicar, 150); });
})();
