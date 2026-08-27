/* ===== EL BOTÓN FLOTANTE DE WHATSAPP =========================================

   TRES COSAS ESTABAN MAL

   1. EL ENLACE NO LLEVABA A NINGÚN LADO.
      Venía escrito a mano en el HTML: `https://wa.me/` **sin número y sin
      texto**. Abría WhatsApp y no pasaba nada. Estaba así en TODAS las
      invitaciones, incluso en las que tienen el número cargado en el panel.

      Se descubrió mirando los enlaces uno por uno, no la pantalla: el botón se
      veía perfecto, con su ícono y su verde. Un botón roto y un botón sano se
      ven exactamente igual. Sólo se nota si se mira a dónde llevan.

   2. APARECÍA SIEMPRE, aunque no hubiera número. Ahora sale sólo si se cargó
      "Número de WhatsApp" en el panel: para lo que se vende es OPCIONAL, y
      para las muestras alcanza con poner el de Invítame.

   3. EL ÍCONO ERA UN GLOBITO GENÉRICO (el emoji 💬). Sobre el verde de
      WhatsApp parecía el de Mensajes del iPhone. Ahora lleva el logo de
      WhatsApp de verdad, en blanco.

   ⚠️ EL COLOR NO SE TOCA. Va en el verde original #25D366. Se probó ponerlo
   del marrón de la paleta de la boda y está MAL: en un botón cuyo único
   trabajo es "esto abre WhatsApp", que se reconozca de un vistazo vale más
   que la paleta.

   ⚠️ EL DE ADENTRO DEL CUERPO ES OTRO. "💬 Escríbele a…", en el sector de
   contacto, ya funcionaba y no se toca acá.
   ============================================================================ */
(function () {
  'use strict';

  /* el logo de WhatsApp, en blanco, dibujado (no es una imagen que haya que bajar) */
  var LOGO =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="#fff" aria-hidden="true" ' +
    'style="display:block;margin:auto">' +
    '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15' +
    '-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475' +
    '-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52' +
    '.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207' +
    '-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372' +
    '-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487' +
    '.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413' +
    '.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1' +
    '-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26' +
    'c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994' +
    'c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0' +
    'C5.495 0 .16 5.335.157 11.892c0 2.096.548 4.142 1.588 5.945L.057 24l6.305-1.654' +
    'a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893' +
    'a11.821 11.821 0 0 0-3.48-8.413z"/></svg>';

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

    /* el logo, en lugar del globito */
    if (!a.querySelector('svg')) {
      a.innerHTML = LOGO;
      a.style.display = 'flex';
      a.style.alignItems = 'center';
      a.style.justifyContent = 'center';
    }
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
