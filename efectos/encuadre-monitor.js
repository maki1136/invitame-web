/* ===== EL ENCUADRE EN MONITOR ================================================

   EL PROBLEMA
   La invitación está pensada para el celular, y en el celular está bien: todo
   entra en una sola columna del ancho de la pantalla. Pero en una compu la
   ventana es apaisada y cada sector se estiraba distinto:

     · la portada y el pie   ->  474 px
     · las tarjetas y la galería ->  680-720 px
     · la foto del itinerario y la de hoteles -> 1200 px
     · las bandas de fondo (frase, contacto) -> todo el ancho de la ventana

   O sea: cuatro anchos distintos en la misma pieza.

   LA SOLUCIÓN — la misma que ya usa el sobre
   La invitación entera se muestra centrada, del ancho con el que se ve en un
   celular, y el resto de la pantalla se llena con la propia foto de portada muy
   desenfocada más un viñeteado.

   ★★ Y LOS COSTADOS TIENEN QUE MERECER LA PANTALLA  (2/9/2026)
     Maki: «¿cómo hacemos para que en Mac la invitación se vea prolija a los
     costados?». El efecto YA existía —esto mismo— pero el resultado era un
     beige plano, y por eso parecía que no había nada hecho.

     Tres cosas lo aplanaban, y las tres estaban acá:

       1. `blur(70px)` borra toda la estructura. A 36 px sobrevive algo de la
          foto y se lee como una superficie, no como una pared.
       2. `saturate(.65)` le sacaba el poco color que quedaba. Y encima la
          colección Perlas pone la portada en BLANCO Y NEGRO: desaturar un
          blanco y negro da gris, siempre.
       3. La columna no tenía peso: sin sombra fuerte ni filete parecía un
          agujero recortado en el fondo, no una tarjeta apoyada.

     Lo que hace ahora:
       · desenfoca menos y no desatura;
       · **tiñe el fondo con el color de la paleta de la boda** (`--verde`), muy
         suave. Así los costados toman el color del evento aunque la portada sea
         en blanco y negro, y funciona solo en las 20 paletas sin tocar nada;
       · viñeta más marcada, para que el centro se sienta iluminado;
       · la columna con sombra de tarjeta y un filete finísimo.

     ⚠️ Es GENÉRICO A PROPÓSITO. Sirve para cualquier invitación y cualquier
        paleta, no para una colección. Pedido de Maki: «pensá que este cambio es
        para todas las invitaciones».

   ★★★ UN POCO MÁS ANCHA — Y EL ANCHO SALE DE LA VENTANA  (3/9/2026)

     Maki: «¿se puede llevar un poco más ancho sin romper lo que se ve en el
     iPhone, que está bien? La de Invítame de ahora es sólo un poco más ancha».

     Se puede, y no puede romper el celular: TODO ESTO VIVE DENTRO DE UN
     @media (min-width:680px) y un iPhone no pasa de 430 px. Nunca lo lee.

     Pero el límite no es técnico, es tipográfico:

       ⚠️ LA RAÍZ DEL DOCUMENTO ESTÁ EN 16 px FIJOS. Al ensanchar la caja, la
          foto crece pero **las letras no**. Pasados los ~600 px el texto queda
          nadando en el medio y la pieza empieza a leerse como una página web
          estirada — que es exactamente el defecto del sistema viejo de
          invitameok.com, con su contenedor de 1170 px.

     Entonces el ancho de hoy es EL MENOR DE TRES, y nunca menos que el natural:

       · `POR_ALTO` (72% del alto)  — una invitación es un objeto vertical. Si
         la ventana es baja, una columna ancha se lee como un cartel apaisado y
         la portada pierde la proporción de tarjeta.
       · `POR_ANCHO` (52% del ancho) — para que siempre quede aire a los lados.
         Sin esto, en una ventana ALTA Y ANGOSTA la columna llegaba al techo y
         quedaban 20 px de margen: peor que no hacer nada.
       · `TECHO` (580) — el límite tipográfico de arriba.

     Medido de verdad, no estimado:
       · 1441 × 705  ->  508 px   (antes daba 474: no cambiaba nada)
       · 1440 × 900  ->  580 px   (Mac maximizada)
       ·  700 × 1200 ->  474 px   (ventana angosta: se queda como estaba)

     ⚠️ Y LA PORTADA NO SEGUÍA AL MARCO. Se le agrandaba el `.frame` y todos
        los `.sec` obedecían, pero la portada se quedaba en 474 porque el motor
        se lo declara ella misma. Ahora se la ata a la misma variable — pero
        SÓLO DESPUÉS de haber medido el ancho natural (ver abajo), o volvemos
        al pozo de la realimentación.

   ⚠️⚠️ LA COLUMNA SE COMÍA A SÍ MISMA. ESTO SE VIO EN SAFARI Y ERA GRAVE.

   Qué pasaba: se medía el ancho de `.portada` y con ese número se le ponía un
   `max-width` a `.frame`. Pero **la portada vive ADENTRO del marco**. O sea que
   en la vuelta siguiente se medía una portada que YA ESTABA LIMITADA por la
   medición anterior, y salía un número más chico. Y otra vez. Y otra. La
   medición se realimentaba a sí misma y la columna se iba achicando sola.

   En Chrome se frenaba pronto y casi no se notaba. En Safari seguía bajando:
   la invitación quedaba como una tira angosta y el contador de días se salía
   por los costados — se veía "416" cortado a la izquierda y los segundos
   cortados a la derecha.

   CÓMO SE ARREGLA DE VERDAD
   1. Se busca el ancho NATURAL de la portada: el `max-width` que le puso el
      motor. Ese número no depende de nada que hagamos nosotros, así que no se
      puede realimentar.
   2. Si el motor no lo declara en píxeles, se mide — pero SACANDO primero la
      restricción del marco, para medir la portada libre y no la ya apretada.
   3. Y SE MIDE UNA SOLA VEZ EN TODA LA VIDA DE LA PÁGINA. Ni siquiera al
      cambiar el tamaño de la ventana: el ancho natural es una propiedad del
      diseño, no de la ventana. Al hacer resize se recalcula el OBJETIVO a
      partir del natural guardado, nunca se vuelve a medir la pantalla.

   ⚠️ SI ALGUIEN VUELVE A PONER UN `medirColumna()` QUE LEA
   `getBoundingClientRect()` SIN SOLTAR EL MARCO, VUELVE A PASAR.
   ⚠️ Y SI ALGUIEN MIDE LA PORTADA DESPUÉS DE ATARLA A `--inv-col`, TAMBIÉN:
   estaría leyendo su propio número. Por eso la regla de la portada se inyecta
   recién cuando ya hay un natural guardado.

   Además hay un piso de 320 px: por debajo de eso ya no es una invitación, es
   una tira, y conviene que no se aplique nada antes que aplicar algo roto.

   EN EL CELULAR NO HACE NADA: vive dentro de un @media de 680px para arriba.
   ============================================================================ */
(function () {

  var MIN_VENTANA = 680;   /* de acá para arriba se encuadra */
  var MIN_COLUMNA = 320;   /* menos que esto no es una columna, es una tira */

  /* ★ el ensanche. Ver el bloque de arriba antes de tocar estos tres números. */
  var TECHO      = 580;    /* más ancho que esto y el texto queda nadando */
  var POR_ALTO   = 0.72;   /* del alto de la ventana: la invitación es vertical */
  var POR_ANCHO  = 0.52;   /* del ancho: para que siempre quede aire a los lados */

  function laPortada() {
    return document.querySelector('.portada');
  }
  function elMarco() {
    return document.querySelector('.frame');
  }

  /* La foto de fondo: la misma de la portada, sea <img> o background-image. */
  function fotoDeFondo() {
    var p = laPortada();
    if (!p) return '';
    var img = p.querySelector('img');
    if (img && img.currentSrc) return img.currentSrc;
    if (img && img.src) return img.src;
    var cand = p.querySelector('.pbg') || p;
    var bg = getComputedStyle(cand).backgroundImage || '';
    var m = bg.match(/url\((['"]?)(.*?)\1\)/);
    return m ? m[2] : '';
  }

  function ponerEstilos() {
    if (document.getElementById('encuadre-monitor')) return;
    var s = document.createElement('style');
    s.id = 'encuadre-monitor';
    s.textContent = [
      '#inv-lienzo,#inv-tinte,#inv-vinieta{display:none}',
      '@media (min-width:' + MIN_VENTANA + 'px){',

      /* la foto de portada, desenfocada pero todavía reconocible */
      '  #inv-lienzo{display:block;position:fixed;inset:0;z-index:-3;',
      '    background-size:cover;background-position:center;',
      '    filter:blur(36px) saturate(1.05) brightness(.80);transform:scale(1.14)}',

      /* ⚠️ el color de la boda encima: hace que los costados sean del evento
         aunque la portada esté en blanco y negro */
      '  #inv-tinte{display:block;position:fixed;inset:0;z-index:-2;',
      '    pointer-events:none;background:var(--verde,#4a4436);opacity:.22}',

      '  #inv-vinieta{display:block;position:fixed;inset:0;z-index:-1;pointer-events:none;',
      '    background:radial-gradient(115% 78% at 50% 42%,rgba(0,0,0,0) 26%,',
      '    rgba(0,0,0,.26) 70%, rgba(0,0,0,.50) 100%)}',

      '  html{background:var(--muted,#cfc4b4)}',

      /* la columna como una tarjeta apoyada, no como un agujero */
      '  .frame{max-width:var(--inv-col,474px);margin-left:auto;margin-right:auto;',
      '    overflow:hidden;',
      '    box-shadow:0 2px 6px rgba(20,14,6,.10),',
      '               0 18px 40px rgba(20,14,6,.24),',
      '               0 54px 110px rgba(20,14,6,.34);',
      '    outline:1px solid rgba(255,255,255,.20);outline-offset:-1px}',
      '  .frame img{max-width:100%;height:auto}',
      '}'
    ].join('\n');
    /* al final del head: gana sobre lo que ya trae la página, sin !important */
    (document.head || document.documentElement).appendChild(s);
  }

  /* ⚠️ ESTA REGLA SE INYECTA APARTE, Y RECIÉN CUANDO YA MEDIMOS EL NATURAL.
     Si estuviera desde el arranque, `anchoDeclarado()` leería nuestro propio
     número en vez del del motor, y volvería la realimentación. */
  function atarLaPortada() {
    if (document.getElementById('encuadre-portada')) return;
    var s = document.createElement('style');
    s.id = 'encuadre-portada';
    s.textContent =
      '@media (min-width:' + MIN_VENTANA + 'px){\n' +
      '  .portada{max-width:var(--inv-col,474px)}\n' +
      '}';
    (document.head || document.documentElement).appendChild(s);
  }

  /* El ancho natural se mide UNA vez y no se vuelve a medir nunca más. */
  var anchoNatural = 0;
  var anchoAplicado = 0;

  /* El ancho que el motor le declara a la portada. Es el dato bueno porque no
     depende de nada que hagamos nosotros. */
  function anchoDeclarado(p) {
    var mw = getComputedStyle(p).maxWidth || '';
    var m = mw.match(/^([\d.]+)px$/);
    return m ? Math.round(parseFloat(m[1])) : 0;
  }

  /* Medir SOLTANDO el marco, para no medir lo que ya apretamos antes. */
  function anchoMedidoLibre(p) {
    var f = elMarco();
    var previo = f ? f.style.maxWidth : null;
    if (f) f.style.maxWidth = 'none';
    var w = Math.round(p.getBoundingClientRect().width);
    if (f) { if (previo) f.style.maxWidth = previo; else f.style.removeProperty('max-width'); }
    return w;
  }

  /* Cuánto tiene que medir HOY: el menor de los tres límites, y nunca menos
     que el ancho natural. */
  function objetivo() {
    var tope = Math.min(
      Math.round(window.innerHeight * POR_ALTO),
      Math.round(window.innerWidth * POR_ANCHO),
      TECHO
    );
    return Math.max(anchoNatural, tope);
  }

  function aplicar() {
    if (!anchoNatural) return;
    var w = objetivo();
    if (w === anchoAplicado) return;
    anchoAplicado = w;
    document.documentElement.style.setProperty('--inv-col', w + 'px');
  }

  function medirColumna() {
    if (anchoNatural) { aplicar(); return true; }

    var p = laPortada();
    if (!p) return false;

    var w = anchoDeclarado(p) || anchoMedidoLibre(p);

    if (w >= MIN_COLUMNA && w < window.innerWidth - 40) {
      anchoNatural = w;
      aplicar();
      atarLaPortada();   /* ⚠️ recién ahora, nunca antes de medir */
      return true;
    }
    return false;   /* todavía no se puede confiar: se reintenta */
  }

  function pintarFondo() {
    var frame = elMarco();
    if (!frame) return;
    var url = fotoDeFondo();
    if (!url) return;

    var l = document.getElementById('inv-lienzo');
    if (!l) {
      l = document.createElement('div'); l.id = 'inv-lienzo';
      var ti = document.createElement('div'); ti.id = 'inv-tinte';
      var v = document.createElement('div'); v.id = 'inv-vinieta';
      document.body.appendChild(l);
      document.body.appendChild(ti);
      document.body.appendChild(v);
    }
    var css = 'url("' + url.replace(/"/g, '%22') + '")';
    if (l.style.backgroundImage !== css) l.style.backgroundImage = css;
  }

  function arrancar() {
    if (!elMarco()) return;   /* no es una invitación */
    ponerEstilos();

    /* El motor arma la portada y elige la foto después de que corre esto, así
       que se reintenta un rato hasta que las dos cosas estén listas. */
    var n = 0;
    var t = setInterval(function () {
      medirColumna();
      pintarFondo();
      if (++n > 40) clearInterval(t);
    }, 250);
    setTimeout(function () { clearInterval(t); }, 12000);

    /* Al cambiar el tamaño de la ventana se recalcula el objetivo a partir del
       natural guardado. ⚠️ NO se vuelve a medir la portada: ya está atada a
       `--inv-col` y mediría su propio número. */
    var espera = null;
    window.addEventListener('resize', function () {
      clearTimeout(espera);
      espera = setTimeout(aplicar, 200);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
