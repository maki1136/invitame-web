/* ===== LO QUE EL MOTOR ESCRIBE EN LINEA Y SE PIERDE ==========================

   Dos cosas chicas que el motor pinta de entrada y que, por razones distintas,
   terminan mal en la pantalla. Viven juntas porque son el mismo tipo de bicho:
   el motor esta CONGELADO POR VERSION —las invitaciones se sirven desde
   i/v/<version>/index.html y hay varias versiones vivas—, asi que un arreglo en
   el HTML no llega a NINGUNA invitacion ya entregada y un modulo llega a todas.
   Misma razon que `videos-blindados.js`.

   ───────────────────────────────────────────────────────────────────────────
   1 · EL LACRE DE UNA SOLA INICIAL          (Sirena / marisol-mis15, 23/9/2026)
   ───────────────────────────────────────────────────────────────────────────
   El sello del sobre decia **«M&»**. Un ampersand colgado, sin nada del otro
   lado, en lo PRIMERO que ve cualquiera que abre la invitacion.

   No era un dato mal cargado. El motor lo arma asi:

       const _i = (ev.n1.trim()[0]||'') + '&' + ((ev.n2||'').trim()[0]||'');

   El `&` va SIEMPRE. En una boda («Camila» + «Tomas») da «C&T» y esta bien. En
   unos XV `n2` esta vacio y queda «M&».

   Y hay una trampa mas: el motor SI mira `fx.sobre.ini` en su pasada de FX,
   pero la linea de arriba corre DESPUES y se lo pisa. O sea que cargar la
   inicial a mano desde el panel NO alcanza — probado y medido.

   ⚠️⚠️ LO QUE ESTE ARCHIVO YA ROMPIO UNA VEZ, Y POR QUE AHORA ES MAS CHICO
   La primera version tambien hacia ganar `fx.sobre.ini` cuando habia DOS
   nombres. Sonaba bien —«Jazmin manda»— y cambio una muestra APROBADA:
   `camila-y-tomas` tiene `ini:"C T"` guardado en la base y el motor se lo
   pisaba con «C&T»; mi modulo le devolvio «C T». O sea que una invitacion ya
   entregada podia cambiar de aspecto sola, que es justo lo que no se hace.
   → Con dos nombres NO SE METE. Ni para mejorar.

   ───────────────────────────────────────────────────────────────────────────
   2 · LA TINTA EN LINEA DEL MOTOR, BORRADA POR LA LIMPIEZA DE UNA COLECCION
   ───────────────────────────────────────────────────────────────────────────
   Mismo dia, apenas se prendio la galeria de `marisol-mis15`: **«Entrar a la
   galeria» salio con el AZUL DE LINK del navegador (rgb(0,0,238))** sobre la
   pastilla verde abisal. Ilegible, y un color de ninguna paleta — la regla
   `familia-de-color` del chequeo lo canto.

   La cadena, medida:
     · `efectos/galeria.js` construye ese `<a id="gal-entrar">` con un `style`
       que YA trae `color:#fff`.
     · `reglas-duras.js` lo piso (guarda la tinta de fabrica en
       `data-regla-orig` y deja `data-regla-inline` en '1' porque ese color
       venia del `style` PROPIO del elemento).
     · el `limpiarInlines()` de la coleccion barre `.frame [data-regla-orig]` y
       hace `removeProperty('color')` — o sea que le borro la tinta DEL MOTOR, y
       un `<a>` sin color se cae al azul de fabrica.

   ⚠️ EL ARREGLO DE FONDO NO ES ESTE ARCHIVO. Va en el `limpiarInlines()` de
      CADA coleccion, y la pista la deja el propio corrector:

          var fabrica     = e.getAttribute('data-regla-orig');
          var eraDelMotor = e.getAttribute('data-regla-inline') === '1';
          e.style.removeProperty('color');
          if (eraDelMotor && fabrica) e.style.color = fabrica;   // devolver, no borrar

      Se devuelve SIN `!important`, asi la hoja de la coleccion le sigue ganando
      donde opina. Mientras eso no este en todas, este parche tapa el agujero.

   ⭐ LA REGLA GENERAL, que es lo que hay que recordar:
      **antes de borrar un estilo en linea, preguntarse de quien era.** No todo
      inline es del corrector; el motor tambien escribe.

   QUE HACE ESTA PARTE
   · Solo mira `#gal-entrar` y `#filtro-abrir`, que son los dos que el motor
     pinta en linea y que ninguna hoja del motor respalda.
   · Solo actua si el color efectivo es el AZUL DE FABRICA del navegador. Si la
     coleccion le puso su tinta, no toca nada.

   ⚠️ Los dos repasos van con `setInterval` cada 1,2 s y NADA de
      MutationObserver: `INVEV` puede llegar despues de `load` y la invitacion
      muta en bucle.

   ───────────────────────────────────────────────────────────────────────────
   3 · EL SOBRE DE SIRENA, REGISTRADO ACA POR SEGURIDAD      (25/9/2026)
   ───────────────────────────────────────────────────────────────────────────
   ⚠️⚠️ ESTA PARTE NO ES DEL TEMA DEL ARCHIVO Y ESTA ACA A PROPOSITO. Se deja
      dicho para que el que la encuentre no piense que fue por comodidad.

      La ficha del sobre `sirena` va en `window.SOBRES_INVITAME`, o sea adentro
      de `sobres/catalogo.js`. Ese archivo pesa **76 KB** y la unica forma que
      tengo de escribirlo es MANDARLO ENTERO. Si esa subida se corta por el
      camino, el archivo queda truncado — y `catalogo.js` lo carga TODA
      invitacion entregada, asi que un truncamiento no rompe una muestra:
      rompe el sobre de la plataforma entera. Agregarle seis lineas a un
      monolito de 76 KB no vale ese riesgo.

      ⭐ CUANDO `sobres/catalogo.js` SE PARTA EN DOS (la lista por un lado, la
         puesta en pantalla por el otro), esta ficha se muda adentro y esta
         parte 3 se borra. Es lo mismo que le esta pasando a la skill de
         entrega: un archivo que crecio hasta que tocarlo es caro.

   ⚠️ EL ORDEN NO ES PROBLEMA, Y ESTA MEDIDO. `efectos/sobre-catalogo.js` no
      arma el sobre al evaluarse: corre `revisar()` con un `setInterval` de
      60 ms hasta 120 veces (7,2 s) y recien actua cuando llego `INVEV`, que
      viene de Firestore. Lee `window.SOBRES_INVITAME` en cada pasada. O sea
      que alcanza con que la ficha exista en los primeros segundos, y esta
      parte la escribe al evaluarse el paquete.
      Y `sobres/catalogo.js` engancha `/efectos/index.js` al FINAL de si mismo,
      asi que todo el paquete corre DESPUES de que el objeto existe.

   EL SOBRE, EN CORTO
   Papel nacar hecho a mano con borde deckled sobre arena clara, vidrio de mar
   verde y caracolitos; lacre CORAL REDONDO con la VIEIRA adentro. Hecho en
   Flow, donde la imagen no gasta creditos (solo el video de Veo).

   ⚠️⚠️ NACE DE UN RECLAMO DE MAKI, TEXTUAL: «el sobre quedo mal, el lacre tiene
      que ser REDONDO y la imagen ADENTRO, porque quedo mal, ¿no lo ves?». El
      anterior era un borron mas alto que ancho con la caracola desbordando el
      borde. Este se MIDIO antes de subirlo, que es la leccion: al lacre no
      alcanza con mirarle el color, hay que medirle la FORMA.
        relacion ancho/alto   1,000   (1,000 = circulo perfecto)
        llena el              98,1 %  de un circulo de radio 95 px
        centro del lacre      50,4 % · 50,0 % de la foto
      Por eso NO lleva `eje`: el 50/50 por defecto le queda exacto.

   ⚠️ VA POR `solapas`, NO por video, y por eso no gasto un credito: la foto se
      parte en cuatro triangulos desde el centro y el lacre se corta al medio.
      Las cuatro solapas del sobre confluyen justo en el lacre, que es la
      geometria que ese modo espera. El precedente es `anillos`: solapas con
      SOLO poster, sin imagen de solapa aparte. La `solapa` separada hace falta
      cuando el lacre viaja pegado a UNA sola solapa (cantera, cenicienta,
      bella), no cuando se parte.

   ⚠️ En apertura `solapas` el empalme va SIEMPRE 'foto': el sobre queda abierto.

   ⚠️ `color` MEDIDO, no estimado: promedio del papel en la franja central,
      salteando el disco del lacre → #E8E1D9 (34.579 px muestreados).
   ============================================================================ */
(function () {

  /* ---------------------------------------------------------- 1 · el lacre */

  /* Los cuatro sellos que dibuja el motor: el del sobre de solapas, el del
     sobre de triangulos, el que se encima sobre el sello del VIDEO, y el de la
     carta. Los cuatro salen del mismo texto. */
  var SELLOS = ['seal-ini', 'triseal-ini', 'vseal-ini', 'cf-ini'];

  function inicialQueVa() {
    try {
      var ev = window.INVEV || {};

      var a = String(ev.n1 || '').trim();
      var b = String(ev.n2 || '').trim();

      if (!a) return null;   /* todavia no llego el evento */
      if (b)  return null;   /* DOS nombres: no me meto. Ver la nota de arriba. */

      var so = (ev.fx || {}).sobre || {};

      /* el panel puso un emblema: lo escribe el motor, no yo */
      if (so.emblema === 'corazon' || so.emblema === 'anillos') return null;

      /* el panel escribio la sigla: manda eso */
      var puesta = String(so.ini || '').trim();
      if (puesta) return puesta.toUpperCase();

      return a[0].toUpperCase();
    } catch (e) { return null; }
  }

  function pasarLacre() {
    var q = inicialQueVa();
    if (!q) return;
    for (var i = 0; i < SELLOS.length; i++) {
      var e = document.getElementById(SELLOS[i]);
      if (e && String(e.textContent || '').trim() !== q) e.textContent = q;
    }
  }

  /* ------------------------------------------------- 2 · la tinta del motor */

  var BOTONES = [
    { id: 'gal-entrar',   tinta: '#fff' },   /* «Entrar a la galeria» (Invitame Live) */
    { id: 'filtro-abrir', tinta: '#fff' }    /* «Abrir la camara» (el filtro) */
  ];

  /* el azul de fabrica de un <a> sin color: -webkit-link. Si el color efectivo
     es ese, nadie le puso tinta y el motor perdio la suya. */
  function esAzulDeFabrica(c) {
    var m = String(c || '').match(/\d+/g);
    if (!m || m.length < 3) return false;
    return (+m[0] === 0 && +m[1] === 0 && +m[2] === 238) ||   /* rgb(0,0,238)  */
           (+m[0] === 0 && +m[1] === 0 && +m[2] === 255);     /* rgb(0,0,255)  */
  }

  function pasarTinta() {
    try {
      for (var i = 0; i < BOTONES.length; i++) {
        var b = BOTONES[i];
        var e = document.getElementById(b.id);
        if (!e || !e.style) continue;
        var cs = window.getComputedStyle(e);
        if (!cs || !esAzulDeFabrica(cs.color)) continue;
        e.style.color = b.tinta;
        e.style.webkitTextFillColor = b.tinta;
      }
    } catch (e) {}
  }

  /* --------------------------------------------- 3 · el sobre de Sirena */

  var SOBRE_ID = 'sirena';

  var SOBRE_SIRENA = {
    nombre:   'Sirena · papel nacar sobre arena, lacre coral con vieira (foto)',
    poster:   'https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/invitame/sobre-sirena-25-9.jpg',
    color:    '#E8E1D9',
    apertura: 'solapas',
    empalme:  'foto'
  };

  /* ⚠️ Si alguien reasigna el objeto entero (`window.SOBRES_INVITAME = {...}`)
     la ficha se perderia en silencio. El repaso de 1,2 s la repone. */
  function pasarSobre() {
    try {
      var c = window.SOBRES_INVITAME;
      if (!c || typeof c !== 'object') return;
      if (c[SOBRE_ID] !== SOBRE_SIRENA) c[SOBRE_ID] = SOBRE_SIRENA;
    } catch (e) {}
  }

  /* ------------------------------------------------------------- el repaso */

  function pasar() { pasarLacre(); pasarTinta(); pasarSobre(); }

  pasar();
  setInterval(pasar, 1200);
  try {
    document.addEventListener('DOMContentLoaded', pasar);
    window.addEventListener('load', pasar);
  } catch (e) {}

  window.INVLACRE1 = { pasar: pasar, quiere: inicialQueVa, tinta: pasarTinta,
                       sobre: pasarSobre, ficha: SOBRE_SIRENA };
})();
