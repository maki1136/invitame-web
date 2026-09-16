/* ===== COLECCIÓN "MARFIL" · EL FONDO Y EL ANCHO DEL TEXTO ====================

   ⚠️⚠️ ESTO NO ES UN PARCHE DE `marfil.js` — ES EL ESCENARIO DE LA COLECCIÓN.
      `marfil.js` DISFRAZA el motor (tipografías, tintas, botones).
      `marfil-texturas.js` trae las PIEZAS (papel, fondo oscuro).
      Este archivo trae EL FONDO DE LA COLECCIÓN y la única regla de layout
      que depende de él. Van juntos porque uno sin el otro no tiene sentido:
      el fondo pone las perlas en los márgenes, y la regla mete el texto en
      la franja que queda limpia. Separar eso sería dejar la mitad del
      criterio en un archivo y la otra mitad en otro.

   ★★★ POR QUÉ EXISTE ★★★
      Maki, 16/9/2026: «quiero que se pueda copiar la invi cuando la elija la
      gente». O sea: la clienta elige Marfil y le sale ASÍ, sin que Jazmín ni
      nadie cargue un fondo a mano, invitación por invitación.

   ★★★ LA MEDICIÓN QUE ORIGINÓ TODO ★★★
      Maki: «que las perlas no toquen los textos, como se ve en la muestra».
      Medido sobre la tarjeta de la portada de BOMA (310 × 1057 px):

         · el texto ocupa el 53% CENTRAL         →  23% a 77%
         · queda 23% libre de cada lado, y ahí viven las perlas
         · dos columnas de perlas, a x≈13% y x≈91%
         · el 28% superior casi no tiene tinta (1.642 px contra 6.524)
         · separación perla ↔ letra en los márgenes: 5-6 px

      Y medido en NUESTRA portada, ANTES de este archivo:

         · #pv-names ocupaba del 17% al 85%   ← 8 puntos más ancho que BOMA

      ★ LA CAUSA NO ERA EL FONDO, ERA EL ANCHO DEL TEXTO. Por más que las
        perlas se corran a los bordes, un bloque de nombres que llega al 85%
        se les va encima igual. Medido después del cambio: 25% a 77%. Entra.

   ⚠️ SI ALGÚN DÍA SE CAMBIA EL FONDO POR UNO CON PERLAS AL CENTRO, esta
      regla deja de alcanzar. Las dos cosas se miran juntas.

   ★★★ EL CHEQUEO OBLIGATORIO ANTES DE CAMBIAR EL FONDO ★★★
      Se genera pidiendo las perlas SÓLO en el quinto exterior de cada lado.
      Después SE MIDE el archivo —no la miniatura— contando perlas en x<20%,
      20-80% y x>80%. Sirve la que tenga el centro en cero o con una sola
      perla pegada al borde.
      ⚠️ Medir la miniatura NO sirve: el 16/9 medí sobre la grilla del
         generador, elegí una, y al bajar el archivo resultó ser otra. El
         orden de la grilla no es el que parece.

   ⚠️ VIENE APAGADO con la colección: sin `coleccion === 'marfil'` no hace
      nada, igual que `marfil.js`.
   ============================================================================ */
(function () {
  'use strict';

  var NOMBRE = 'marfil';
  var MARCA  = 'data-coleccion';
  var ID_CSS = 'inv-coleccion-marfil-fondo';

  /* La foto del papel blanco con las perlas apoyadas, generada para esta
     colección: perlas sólo en el quinto exterior de cada lado, centro limpio.
     Papel medido: RGB (229,225,222), blanco frío — NO el marfil beige del
     primer intento, que fue justamente lo que Maki rebotó. */
  var FONDO_PERLAS =
    'https://res.cloudinary.com/oc8cgqt4/image/upload/v1789531956/invitame/oavjkfbl0zt5oskhaqsi.jpg';

  function activa() {
    try {
      var u = new URLSearchParams(location.search).get('coleccion');
      if (u !== null) return u === NOMBRE;
    } catch (e) {}
    try { return (((window.INVEV || {}).fx) || {}).coleccion === NOMBRE; }
    catch (e) { return false; }
  }

  /* ------------------------------------------------------------------ la hoja
     ⚠️ Mismo prefijo repetido que `marfil.js`, y este archivo se carga
        DESPUÉS: con igual especificidad e importancia, desempata el orden, y
        así la regla del ancho le gana a la del tamaño de los nombres que está
        en la fase 1.
     ⚠️ El `max-width` va sobre `.portada .c`, que es la COLUMNA de la
        portada. NO sobre `.frame`: tocar el ancho del marco descentra la
        tarjeta entera; ya pasó dos veces y está documentado en marfil.js. */

  var CSS = [
    'h[c] .portada .c {',
    '  max-width:78% !important;',
    '  margin-left:auto !important; margin-right:auto !important;',
    '}',
    'h[c] #pv-names, h[c] #pv-names > span {',
    '  font-size:44px !important;',
    '  letter-spacing:.13em !important;',
    '}'
  ].join('\n')
    .replace(/h\[c\]/g, 'html[' + MARCA + '="' + NOMBRE + '"][' + MARCA + '="' + NOMBRE + '"]');

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) {
      s = document.createElement('style');
      s.id = ID_CSS;
      (document.head || document.documentElement).appendChild(s);
    }
    if (s.textContent !== CSS) s.textContent = CSS;
  }

  function sacarHoja() {
    var s = document.getElementById(ID_CSS);
    if (s) s.remove();
  }

  /* ---------------------------------------------------------------- el fondo
     ⚠️⚠️ ESTO NO ESCRIBE EN LA BASE. Sólo completa `INVEV.fx.fondo` EN
        MEMORIA cuando la invitación no trae uno propio, para que
        `fondo-invitacion.js` —el módulo que la plataforma ya tenía— lo
        pinte. Si Jazmín o la clienta eligen su fondo, ese gana y acá no se
        toca nada. Y como nunca se guardó, al apagar la colección no queda
        rastro en el documento.
     ⚠️ `donde:'marco'` y no `'pantalla'`: la foto es el PAPEL de la tarjeta
        y los costados quedan oscuros, así la tarjeta flota como en BOMA. Con
        `'pantalla'` el blanco invade todo y la tarjeta no se despega
        (probado el 15/9).
     ⚠️ `paso` lo recorta el propio módulo a 0,85 aunque se le pase más. */

  function fondoPropio() {
    try {
      var f = ((window.INVEV || {}).fx || {}).fondo || {};
      return !!(f.tipo && (f.url || f.poster));
    } catch (e) { return false; }
  }

  function ponerFondo() {
    try {
      if (fondoPropio()) return;              /* la clienta eligió el suyo */
      var E = window.INVEV; if (!E) return;
      E.fx = E.fx || {};
      E.fx.fondo = { tipo: 'imagen', url: FONDO_PERLAS, fuerza: 1.0,
                     velo: 0, paso: 0.95, oscuras: 0, donde: 'marco' };
      E.fx.__mfFondo = true;                  /* marca: lo puso la colección */
    } catch (e) {}
  }

  function sacarFondo() {
    try {
      var E = window.INVEV;
      if (E && E.fx && E.fx.__mfFondo) {
        delete E.fx.fondo;
        delete E.fx.__mfFondo;
      }
    } catch (e) {}
  }

  /* ---------------------------------------------------------------- montaje */
  var puesto = false;

  function sincronizar() {
    if (activa()) {
      hoja();
      ponerFondo();
      puesto = true;
    } else if (puesto) {
      sacarHoja();
      sacarFondo();
      puesto = false;
    }
  }

  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    sincronizar();
    addEventListener('message', function () { setTimeout(sincronizar, 80); });
    var n = 0, t = setInterval(function () {
      sincronizar();
      if (++n > 40) clearInterval(t);
    }, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
