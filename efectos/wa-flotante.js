/* ===== EL BOTÓN FLOTANTE DE WHATSAPP =========================================

   EL BUG

   El flotante de la esquina (`.wafloat`) venía con el enlace escrito a mano en
   el HTML: `https://wa.me/` **sin número y sin texto**. Abría WhatsApp y no
   pasaba nada. Estaba así en TODAS las invitaciones, incluidas las que tienen
   el número cargado en el panel.

   Se descubrió mirando los enlaces uno por uno, no la pantalla: el botón se
   veía perfecto, con su ícono y su verde. Un botón roto y un botón sano se ven
   exactamente igual. Sólo se nota si se mira a dónde llevan.

   QUÉ HACE ESTE MÓDULO

   Le pone el número que la clienta cargó en el panel ("Número de WhatsApp",
   campo `c_numero-de-whatsapp`) y un texto inicial con el nombre del evento,
   para que ella sepa de qué invitación le escriben.

   ⚠️ SI NO HAY NÚMERO, NO LO MUESTRA. Igual el servidor ya lo apaga por CSS
   antes del primer pintado (ver `i/sin-demo.php`), así que no llega a
   parpadear. Esto es el cinturón además del tirante: si algún día se sirve el
   HTML sin pasar por el PHP, el botón muerto tampoco aparece.

   ⚠️ EL COLOR NO SE TOCA. Va en el verde de WhatsApp. Es lo que hace que se
   entienda de un vistazo qué abre ese botón.

   ⚠️ EL DE ADENTRO DEL CUERPO ES OTRO. "💬 Escríbele a…", en el sector de
   contacto, ya funcionaba y no se toca acá.
   ============================================================================ */
(function () {
  'use strict';

  function limpiar(n) {
    return String(n || '').replace(/[^\d]/g, '');   /* wa.me quiere sólo dígitos */
  }

  function poner() {
    var a = document.querySelector('.wafloat');
    if (!a) return;

    var ev  = window.INVEV || {};
    var num = limpiar(ev['c_numero-de-whatsapp']);

    if (!num) { a.style.display = 'none'; return; }

    /* de qué evento le escriben */
    var quien = [ev.n1, ev.n2].filter(Boolean).join(' y ');
    var saludo = quien
      ? '¡Hola! Te escribo por la invitación de ' + quien + '.'
      : '¡Hola! Te escribo por la invitación.';

    a.setAttribute('href', 'https://wa.me/' + num + '?text=' + encodeURIComponent(saludo));
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
    a.setAttribute('aria-label', 'Escribir por WhatsApp');
  }

  /* El motor llena `window.INVEV` cuando llega la respuesta de Firestore, y no
     avisa. Se prueba unas cuantas veces y se corta apenas se pudo. */
  var intentos = 0;
  function vigilar() {
    var a = document.querySelector('.wafloat');
    if (a && window.INVEV) { poner(); return; }
    if (++intentos > 40) return;                    /* ~12 s y listo */
    setTimeout(vigilar, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', vigilar);
  } else {
    vigilar();
  }
})();
