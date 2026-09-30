/* ===== LAS TIPOGRAFÍAS QUE NO VIENEN DE FÁBRICA ================================

   POR QUÉ EXISTE (Jazmín, 29/9/2026)
   «Tipografías limitadas, no podemos colocar links de Fonts» y «faltan
   tipografías que suelen utilizarse (Mea Culpa, Baskerville)».

   El motor trae precargadas 17 familias (el <link> de la cabeza). Cualquier
   otra —las nuevas de la lista del panel, o una que Jazmín pega de Google
   Fonts— hay que pedirla. El motor tiene `cargarFont`, pero le pasa el valor
   tal cual se guarda, «'Mea Culpa',cursive», y arma una dirección rota
   (family='Mea+Culpa',cursive). Por eso nunca llegaba ninguna nueva.

   Qué hace: mira todos los campos del evento que guardan una tipografía, saca
   el nombre de la familia y, si no es de las precargadas, la pide a Google
   Fonts una sola vez. Anda igual en la miniatura del panel y en la invitación,
   y en todas las versiones del motor (vive en /efectos/, no en el motor).
   ============================================================================ */
(function () {
  'use strict';

  var PRECARGADAS = /^(great vibes|rouge script|dancing script|parisienne|tangerine|sacramento|cormorant garamond|playfair display|forum|marcellus|eb garamond|lora|cinzel|prata|montserrat|poppins|jost|serif|sans-serif|cursive)$/i;
  var pedidas = {};

  function familia(v) {
    if (typeof v !== 'string') return '';
    v = v.trim();
    if (!v || v.length > 120) return '';
    var m = v.match(/family=([^:&]+)/i) || v.match(/specimen\/([^?#\/]+)/i);   /* un link de Google Fonts */
    if (m) return decodeURIComponent(m[1].replace(/\+/g, ' ')).trim();
    if (!/^['"]/.test(v) && !/,\s*(serif|sans-serif|cursive|monospace)\s*$/i.test(v)) return '';
    return v.split(',')[0].replace(/["']/g, '').trim();
  }

  function pedir(fam) {
    var k = fam.toLowerCase();
    if (!fam || PRECARGADAS.test(fam) || pedidas[k]) return;
    pedidas[k] = 1;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    /* ⚠️ SIN pedir pesos: Google devuelve ERROR (400) si se piden pesos que la
       familia no tiene, y Mea Culpa, por ejemplo, sólo tiene el 400. */
    l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fam).replace(/%20/g, '+') + '&display=swap';
    (document.head || document.documentElement).appendChild(l);
  }

  /* los campos de tipografía: los fijos y cualquier c_tipografia-… del panel */
  function revisar() {
    var ev = window.INVEV;
    if (!ev || typeof ev !== 'object') return;
    ['nfont', 'fTit', 'fTit2', 'fraseFont'].forEach(function (k) { pedir(familia(ev[k])); });
    for (var k in ev) {
      if (/^c_tipograf/i.test(k)) pedir(familia(ev[k]));
    }
    var fx = ev.fx || {};
    /* la de los nombres, si la eligieron en el panel, le gana a la colección */
    var nom = document.getElementById('pv-names');
    if (nom) {
      if (fx.nfontElegida && ev.nfont) { if (nom.style.getPropertyValue('font-family') !== ev.nfont || nom.style.getPropertyPriority('font-family') !== 'important') nom.style.setProperty('font-family', ev.nfont, 'important'); }
      else if (nom.style.getPropertyPriority('font-family') === 'important') nom.style.removeProperty('font-family');
    }
    if (fx.carta && fx.carta.fuente) pedir(familia("'" + String(fx.carta.fuente).replace(/'/g, '') + "',serif"));
  }

  revisar();
  window.addEventListener('message', function () { setTimeout(revisar, 50); }, false);
  var n = 0, t = setInterval(function () { revisar(); if (++n > 20) clearInterval(t); }, 600);
})();
