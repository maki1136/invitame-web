/* ===== COLECCIÓN "PERLAS" =====================================================

   QUÉ ES UNA COLECCIÓN
   Una decisión sola que trae TODO junto —tipografía, aire, bandas de color,
   paleta, motivo, adornos— copiada de una referencia que mandó Maki.
   Jazmín elige "Perlas" y no arma nada más.

   ⚠️ LA COLECCIÓN DISFRAZA EL MOTOR QUE YA EXISTE. NO DIBUJA UNA INVITACIÓN NUEVA.
      «la idea es no romper nada, que puedas seguir con las plantillas como
      venimos, pero disfrazarlas». Todo es reversible.

   ⚠️ VIENE APAGADA. Sin `INVEV.fx.coleccion === 'perlas'` no hace nada.
      Para probar sin tocar la base: `?coleccion=perlas`

   ★★★★★ LA LECCIÓN MÁS CARA DE TODAS ★★★★★
      Maki, textual: «tu problema es que no ves la muestra. Tendrías que ver la
      muestra, pensar cómo adaptar todo a la nuestra, y cuando lo adaptás,
      VOLVER a la muestra a ver si tiene algo que ver».

      EL IDIOMA DE LA MUESTRA: **cada objeto es el SOPORTE de un texto.**
      Se fotografía el objeto y el texto va ENCIMA, como elemento del DOM.

      → EL MÉTODO: antes de colocar una pieza, buscarla en la muestra, ver qué
        sostiene, buscar la sección nuestra que dice lo mismo, y MIRARLA en el
        navegador antes de subirla. Si no hay sección que diga lo mismo, no se
        pone. Que falte es mejor que que sobre.

   ★★★★★ Y LA MUESTRA NO MANDA SOBRE LO QUE LA INVITACIÓN TIENE QUE MOSTRAR ★★★★★
      La bandeja estaba en la sección que le corresponde según la muestra
      (VENUE), bien recortada, bien enmarcada… y estaba mal igual, porque para
      ponerla yo había ESCONDIDO LAS FOTOS del lugar.
      Maki: «prefiero que estén las imágenes de dónde es la ceremonia y dónde
      es la fiesta. Lo de la fuente sí lo quiero, pero para otro lado».
      → La referencia manda sobre el ESTILO. El contenido que la clienta vende
        no se sacrifica para que una pieza entre.

   ★★★★★ …PERO UNA FOTO QUE NO DICE NADA TAMPOCO ES CONTENIDO ★★★★★
      En Vestimenta había una foto de los novios abrazados. Maki: «¿y la foto de
      los novios qué tiene que ver con vestimenta?». Nada. Era una foto linda
      que no respondía la pregunta de la sección.
      → No alcanza con que una imagen sea del casamiento: tiene que contestar
        lo que la sección pregunta.

   ★★★ MAPA MUESTRA → NUESTRA INVITACIÓN (Pavel & Lada) ★★★
      | En la muestra              | Objeto              | Nuestra sección     |
      |----------------------------|---------------------|---------------------|
      | portada · DEAR FRIENDS     | collar que cruza    | `.fraseSec` ✅       |
      | DEAR FRIENDS! You're inv.  | sobre abierto+clip  | #carta-sec ⚠ ver ↓  |
      | PROGRAM / of the day       | hilo + broche       | itinerario `.tl` ✅  |
      | DRESS CODE / colors        | círculos + siluetas | Vestimenta ✅        |
      | OUR CHANNEL / Telegram     | sobre con moño      | #contacto-sec ✅     |
      | WISHES                     | dos corazones       | Mesa de regalos ✅    |
      | VENUE / Save the place!    | bandeja de plata    | ⛔ GUARDADA, ver ↓   |

      ⛔ LA BANDEJA NO SE COLOCA EN NINGÚN LADO. Está lista en
         `INVPIEZAS.bandeja` y el CSS del marco quedó escrito más abajo. Falta
         que Maki diga dónde. NO improvisar un lugar.

      ⚠️ #carta-sec ("Confirma tu lugar") YA TIENE el sobre con la carta que
         sale (`.cartafx`). Maki: «ya tenemos esa sección armada, sólo hay que
         cambiar el sobre». Hay que sumar un modelo con perlas al catálogo.

   ★★★ CÓMO GANARLE A UN MÓDULO DEL MOTOR (dos trampas, las dos caras) ★★★
      1. `!important` NO ALCANZA. La colección se inserta ANTES que casi todos
         los módulos. Con especificidad e importancia iguales desempata el
         ORDEN, y gana el módulo. Pasó con `inv-fondo-css`
         (`html[data-fondo] .sec.verde`, misma especificidad 0,3,1).
         → Repetir el atributo o la clase: `[data-x][data-x]`.
      2. `:is()` TOMA LA ESPECIFICIDAD DE SU ARGUMENTO MÁS FUERTE.
         `botones.js` trae `:is(.btn, #btn-ingresar, .wsp, …)`. Ese
         `#btn-ingresar` de adentro le da a TODA la regla peso de ID (1,1,0).
         → Hay que nombrar un id de verdad en el selector (`#wa-p1`, `#wa-p2`).
      → Y la única forma de darse cuenta de las dos es MIRAR LA PÁGINA.

   ★★★ ANTES DE AGREGAR UN NODO A UNA SECCIÓN, MIRAR SU `display` ★★★
      `.fraseSec` es `display:flex; flex-direction:row`. Al agregarle la foto
      del sobre como hijo normal, la imagen se convirtió en UNA COLUMNA MÁS y
      le robó el ancho al texto: el párrafo pasó de 375 px a 177 px.
      → Tres salidas: `position:absolute` para algo chico en una esquina;
        `flex-wrap` + `flex:0 0 100%` para algo a todo el ancho (el collar);
        nada, si la sección no es flex ni grid.

   ★★★ TRES MANERAS DE APOYAR UNA FOTO SOBRE EL PAPEL ★★★
      1. RECORTADA con alfa — lo que flota sobre cualquier fondo (broche).
      2. DIFUMINADA con `mask-image` — lo que vive en una sección clara.
      3. MULTIPLICADA (`mix-blend-mode:multiply`) — el collar. Su papel fue
         llevado a blanco puro. Sirve en las 20 paletas sin regenerar.

      ⚠️ LAS PIEZAS VAN COMO <img>, NUNCA COMO `background-image` DE UNA CAJA
         CON HIJOS: la máscara de un fondo no se separa del contenido.
      ⚠️ SÓLO FUNCIONAN EN SECCIÓN CLARA.
      ⚠️ CUIDADO CON LA REGLA POLAROID: `h[c] .sec > img` le pone marco blanco,
         padding y sombra a TODA imagen hija directa de una sección.

   ★★★ EL CSS NO REEMPLAZA LA FOTO DE UN OBJETO, PERO SÍ DIBUJA BIEN ★★★
      La regla vieja —«las cosas dibujadas con CSS no reemplazan a una foto»—
      es cierta para OBJETOS: una perla, un lacre, un moño tienen nácar y
      microrrelieve que el código no imita.
      NO vale para LETRAS ni para SILUETAS. El traje y el vestido de Vestimenta
      son dibujo de línea: hechos con código escalan sin pixelarse y toman el
      color de cada paleta. Una foto ahí sería peor.

      ★ Y LO QUE SEPARA UN ICONO DE LA PAPELERÍA FINA ES EL TRAZO Y LA PROPORCIÓN
        Los iconos que traía el motor (`#dc-mono`) no estaban mal dibujados:
        estaban GRUESOS (trazo 1.7) y ANCHOS. Al bajar el trazo a 1.15, angostar
        los hombros y alargar la silueta, el mismo objeto pasa de icono de app a
        papelería. Las dos figuras van en el MISMO viewBox (56x120) para que
        midan igual y apoyen en la misma línea.
      ⚠️ El traje tuvo una primera versión con un escalón a la altura del codo
         (de dibujar las mangas cortadas) y se leía como una CAPA. La silueta va
         continua, de hombro a ruedo, sin escalones.

   ★★★ LOS "PÉTALOS" ERAN LO QUE MAKI VEÍA COMO PERLAS DIBUJADAS ★★★
      `.fxlayer .fxp.petalo` son pétalos ROSAS que caen, un efecto de ambiente
      del panel. Sobre la portada en blanco y negro se leen como manchas grises.
      → Acá el pétalo pasa a ser LA PERLA fotográfica, chica.

   ★★★ CÓMO SE CAMBIAN LOS TAMAÑOS: SE SETEAN LAS VARIABLES DEL MOTOR ★★★
      El motor aplica su escala con `!important`:
          .sec h2 { font-size: var(--fs-titulo, 30px) !important }

   ★★★ LOS NOMBRES DE LA PORTADA LOS MANDA JAZMÍN ★★★
      El motor les escribe familia, tamaño y color EN LÍNEA desde `nfont`,
      `nsize`, `ncolor`. Con `nfont` elegida la colección NO los toca.

   ★★★ NUNCA GUARDAR UNA COPIA DEL HTML PARA "DESHACER" ★★★
      Guardar `h1.innerHTML` hacía aparecer "María & Diego", los nombres de la
      BODA DE EJEMPLO. Deshacer SIEMPRE desde el DOM vivo.

   ★★ EL MOTOR ANCLA EL `.adorno` A LA CURSIVA ★★
      Lo reinserta en cada pasada: `acomodar()` corre en el bucle de 400 ms.

   ★ EL MOTIVO: SE SUGIERE `discreto`, NO `todo`
   ★ LA LÍNEA DE TIEMPO ES UN HILO DE PERLAS · `.tl-prog` se ESCONDE
   ★ LA FRASE PIERDE SU ALTURA FIJA, si no el texto queda cortado bajo el collar
   ★ `.padres` ES UNA GRILLA DE 2 COLUMNAS → `data-col-n`

   ★ LAS INICIALES (C & T) — IDEA GUARDADA, NO ESTÁ PUESTA
     Se probó un aro con las iniciales en Vestimenta y quedaba lindo, pero no
     era lo que Maki pedía ahí. Si alguna vez se quiere, va mejor en la portada
     o en el sobre. Se arma con `INVEV.n1` / `n2` y `fx.sobre.ini` de respaldo.
   ============================================================================ */
(function () {
  'use strict';

  var NOMBRE  = 'perlas';
  var MARCA   = 'data-coleccion';
  var MARCA_T = 'data-col-tipo';
  var MARCA_P = 'data-col-perla';
  var ID_CSS  = 'inv-coleccion-perlas';

  function activa() {
    try {
      var u = new URLSearchParams(location.search).get('coleccion');
      if (u !== null) return u === NOMBRE;
    } catch (e) {}
    try { return (((window.INVEV || {}).fx) || {}).coleccion === NOMBRE; }
    catch (e) { return false; }
  }

  function tieneFuentePropia() {
    try {
      var f = (window.INVEV || {}).nfont;
      return !!(f && String(f).trim());
    } catch (e) { return false; }
  }

  function laPerla() { try { return window.INVPERLA || ''; } catch (e) { return ''; } }
  function laPieza(k) { try { return (window.INVPIEZAS || {})[k] || ''; } catch (e) { return ''; } }

  var MASCARA  = 'radial-gradient(ellipse 58% 58% at 50% 50%,#000 40%,transparent 76%)';
  var MASCARA2 = 'radial-gradient(ellipse 76% 84% at 50% 48%,#000 58%,transparent 92%)';

  var PAPEL =
    'linear-gradient(179.4deg,rgba(255,255,255,.55),rgba(244,238,224,.6) 48%,rgba(252,250,244,.5)),' +
    'repeating-linear-gradient(90deg,rgba(150,132,104,.045) 0 1px,transparent 1px 3px),' +
    'repeating-linear-gradient(0deg,rgba(150,132,104,.035) 0 1px,transparent 1px 4px),' +
    '#fbf7ee';

  /* ---- el traje y el vestido, dibujados finos --------------------------
     Los dos en el MISMO viewBox para que midan igual y apoyen en la misma
     línea. Trazo 1.15: a 74 px de ancho da una línea de ~1,5 px. */
  var TRAZO = 'stroke="currentColor" fill="none" stroke-width="1.15" ' +
              'stroke-linejoin="round" stroke-linecap="round"';

  var TRAJE =
    '<svg viewBox="0 0 56 120" ' + TRAZO + ' aria-label="Traje">' +
      /* silueta continua: hombro angosto → se afina → ruedo. SIN escalón. */
      '<path d="M22 13 L14 18 C11 20 9.6 23 9.2 27 L10.4 62 L12 112 L44 112 ' +
              'L45.6 62 L46.8 27 C46.4 23 45 20 42 18 L34 13"/>' +
      /* la solapa en V, larga */
      '<path d="M22 13 C21 26 22.5 41 28 53 C33.5 41 35 26 34 13"/>' +
      '<path d="M28 53 L28 112"/>' +
      /* las costuras de las mangas, apenas insinuadas */
      '<path d="M14.6 21 C16.5 30 17 44 16.6 60" opacity=".4"/>' +
      '<path d="M41.4 21 C39.5 30 39 44 39.4 60" opacity=".4"/>' +
      /* el moño */
      '<path d="M24.2 14.4 L28 17.6 L24.2 20.8 Z"/>' +
      '<path d="M31.8 14.4 L28 17.6 L31.8 20.8 Z"/>' +
      '<circle cx="28" cy="70" r="1.5"/><circle cx="28" cy="84" r="1.5"/>' +
    '</svg>';

  var VESTIDO =
    '<svg viewBox="0 0 56 120" ' + TRAZO + ' aria-label="Vestido">' +
      '<path d="M20 12.5 L21.5 30"/><path d="M36 12.5 L34.5 30"/>' +
      /* escote en V, cintura, y la falda que se abre con curva (no trapecio) */
      '<path d="M21.5 30 C24.5 34.5 28 36.5 28 36.5 C28 36.5 31.5 34.5 34.5 30 ' +
              'L36.5 58 C44 74 49 94 51 110 C40 114.5 16 114.5 5 110 ' +
              'C7 94 12 74 19.5 58 Z"/>' +
      '<path d="M19.5 58 L36.5 58"/>' +
      '<path d="M25.5 62 C23.5 80 22 96 20.5 108" opacity=".45"/>' +
      '<path d="M30.5 62 C32.5 80 34 96 35.5 108" opacity=".45"/>' +
    '</svg>';

  var CSS = [

    'h[c]{' +
      '--fs-titulo:clamp(20px,5.6vw,31px);' +
      '--fs-cursiva:clamp(18px,4.8vw,24px);' +
      '--fs-kicker:clamp(9px,2.6vw,11px);' +
      '--fs-contador:clamp(29px,8.6vw,44px);' +
      '--fs-frase:clamp(17px,4.4vw,22px)}',

    'h[c] .sec h2.reveal{' +
      'font-family:"Cormorant Garamond",Forum,serif;font-weight:300;' +
      'text-transform:uppercase;letter-spacing:.2em;line-height:1.2;' +
      'max-width:13em;margin:0 auto 4px;padding-left:.2em}',

    'h[c] .sec .kick{' +
      'font-family:"Great Vibes",cursive;font-weight:400;' +
      'line-height:1.35;letter-spacing:0;text-transform:none;opacity:.72;' +
      'max-width:16em;margin:0 auto 34px}',

    'h[c] .sec h3{' +
      'font-family:"Cormorant Garamond",serif;font-weight:400;' +
      'text-transform:uppercase;letter-spacing:.14em;padding-left:.14em}',

    'h[c] .sec > .adorno{margin:0 auto 34px;opacity:.55}',

    'h[c] .sec{padding:76px 30px}',
    'h[c] .sec > p,h[c] .sec p.reveal{max-width:23em;margin-left:auto;margin-right:auto;line-height:1.75}',
    '@media (max-width:420px){h[c] .sec{padding:60px 24px}}',

    'h[c] .sec.verde{' +
      'border-top-left-radius:50% 90px;border-top-right-radius:50% 90px;' +
      'padding-top:104px}',
    '@media (max-width:420px){h[c] .sec.verde{' +
      'border-top-left-radius:50% 58px;border-top-right-radius:50% 58px;' +
      'padding-top:82px}}',

    'h[c] .portada .pbg,h[c] .portada .cover-vid{' +
      'filter:grayscale(1) contrast(1.06) brightness(.98)}',

    'h[p] .fxlayer .fxp{' +
      'background:var(--col-perla) no-repeat center/contain!important;' +
      'border-radius:0!important;width:9px!important;height:9px!important;' +
      'opacity:.5!important;' +
      'filter:drop-shadow(0 1px 1px rgba(60,50,40,.25))!important}',

    'h[c] .sec > img{' +
      'background:#fff;padding:9px;border-radius:2px;' +
      'box-shadow:0 1px 2px rgba(60,50,40,.14),0 10px 24px rgba(60,50,40,.13);' +
      'max-width:min(100%,340px);height:auto;display:block;margin:26px auto}',
    'h[c] .sec > img:not(.reveal):nth-of-type(odd){transform:rotate(-1.4deg)}',
    'h[c] .sec > img:not(.reveal):nth-of-type(even){transform:rotate(1.1deg)}',

    /* ── "DÓNDE Y CUÁNDO": LA FOTO DEL LUGAR, CON RECUADRO ─────────────── */
    'h[c] .sec .evento{' +
      'background:#fdfcf8!important;border:0!important;' +
      'box-shadow:0 1px 2px rgba(20,24,18,.16),0 14px 34px rgba(20,24,18,.24)!important;' +
      'max-width:318px!important;margin:0 auto 38px!important;' +
      'padding:10px 10px 0!important;overflow:hidden!important;' +
      'border-top-left-radius:50% 34px;border-top-right-radius:50% 34px}',
    'h[c] .sec .evento .ph{' +
      'display:block!important;height:186px!important;' +
      'border-top-left-radius:50% 40px;border-top-right-radius:50% 40px;' +
      'background-size:cover!important;background-position:center!important;' +
      'box-shadow:inset 0 0 0 1px rgba(120,105,85,.25)}',
    'h[c] .sec .evento .bd{' +
      'background:transparent!important;box-shadow:none!important;' +
      'padding:18px 12px 20px!important}',
    'h[c] .sec .evento .bd::before{' +
      'content:"";display:block;height:1px;width:34px;margin:0 auto 14px;' +
      'background:rgba(120,105,85,.5)}',
    'h[c] .sec .evento h3,h[c] .sec .evento .sub,h[c] .sec .evento .addr{' +
      'color:var(--verde,#44513f)!important}',
    'h[c] .sec .evento .btn{' +
      'font-size:9px!important;letter-spacing:.14em!important;padding:9px 14px!important}',

    /* ── VESTIMENTA: EL TRAJE Y EL VESTIDO ───────────────────────────────
       «que sean como dibujados, que tengan estilo elegante». Los del motor
       (`#dc-mono`) se apagan: son los mismos objetos pero gruesos y anchos. */
    'h[c] #dc-mono{display:none!important}',
    'h[c] #dress-img{display:none!important}',
    'h[c] .col-vest{' +
      'display:flex;align-items:flex-end;justify-content:center;gap:8px;' +
      'margin:10px auto 34px;color:var(--verde,#44513f)}',
    'h[c] .col-vest svg{width:74px;height:auto;display:block}',
    'h[c] .col-vest .col-amp{' +
      'font-family:"Great Vibes",cursive;font-size:30px;line-height:1;' +
      'opacity:.65;margin-bottom:38px}',
    '@media (max-width:360px){h[c] .col-vest svg{width:64px}' +
      'h[c] .col-vest .col-amp{font-size:26px;margin-bottom:32px}}',

    /* ── LA SECCIÓN DE LA FRASE ──────────────────────────────────────── */
    'h[c] .fraseSec{' +
      'position:relative;background:var(--lino,#f4f3ec);' +
      'flex-wrap:wrap!important;align-items:center!important;' +
      'height:auto!important;min-height:0!important;overflow:visible!important;' +
      'padding-top:0!important;padding-bottom:56px!important}',
    'h[c] .fraseSec .frasefx,h[c] .fraseSec .bg,h[c] .fraseSec .capa{display:none!important}',
    'h[c] .fraseSec .frase{' +
      'font-family:"Cormorant Garamond",serif;font-weight:300;line-height:1.9;' +
      'max-width:19em;margin-left:auto;margin-right:auto;color:var(--verde,#44513f)}',

    'h[c] .padres[data-col-n="3"]{grid-template-columns:repeat(3,1fr)!important;gap:12px!important}',
    'h[c] .padres[data-col-n="1"]{grid-template-columns:minmax(0,220px)!important;justify-content:center!important}',
    '@media (max-width:360px){h[c] .padres[data-col-n="3"]{gap:8px!important}}',

    'h[p] .tl::before{' +
      'width:11px!important;left:1.5px!important;opacity:1!important;' +
      'background:var(--col-perla) repeat-y center top/11px 11px!important;' +
      'filter:drop-shadow(0 1px 1px rgba(60,50,40,.16))}',
    'h[p] .tl .tl-prog{display:none!important}',
    'h[p] .tl .it::before{' +
      'width:17px!important;height:17px!important;left:-28.5px!important;' +
      'background:var(--col-perla) no-repeat center/contain!important;' +
      'box-shadow:none!important;border:0!important;' +
      'filter:drop-shadow(0 1px 2px rgba(60,50,40,.2))}',

    'h[c] .col-pza{pointer-events:none;display:block}',

    'h[c] .tl .col-broche{' +
      'position:absolute;width:22px;height:auto;left:-4px;bottom:-11px;' +
      'filter:drop-shadow(0 1px 2px rgba(60,50,40,.24))}',

    /* ── EL COLLAR: CRUZA LA INVITACIÓN, A SANGRE ───────────────────────
       Los márgenes negativos tienen que ser IGUALES al padding lateral. */
    'h[c] .fraseSec .col-collar{' +
      'flex:0 0 100%!important;order:-1!important;position:static!important;' +
      'width:calc(100% + 60px)!important;max-width:none!important;' +
      'height:132px!important;object-fit:cover!important;object-position:center 46%!important;' +
      'margin:0 -30px 26px!important;' +
      'background:none!important;padding:0!important;box-shadow:none!important;' +
      'border-radius:0!important;transform:none!important;' +
      'mix-blend-mode:multiply}',
    '@media (max-width:420px){h[c] .fraseSec .col-collar{' +
      'width:calc(100% + 48px)!important;margin:0 -24px 22px!important;height:118px!important}}',

    'h[c] .fraseSec .col-sobre{' +
      'position:absolute!important;right:6px;bottom:6px;width:96px;height:auto;z-index:1;' +
      'background:none!important;padding:0!important;box-shadow:none!important;' +
      'transform:none!important;margin:0!important;' +
      'opacity:.95;mix-blend-mode:multiply;' +
      '-webkit-mask-image:' + MASCARA + ';mask-image:' + MASCARA + '}',
    '@media (max-width:360px){h[c] .fraseSec .col-sobre{width:80px}}',

    /* ── "¿ALGUNA DUDA?" = OUR CHANNEL, Y LA TARJETA ES UNA CARTA ─────── */
    'h[c] #contacto-sec{' +
      'background-image:none!important;background-color:var(--lino,#f4f3ec)!important;' +
      'padding-bottom:56px!important}',
    'h[c] .col-canal{position:relative;max-width:300px;margin:0 auto}',
    'h[c] .col-canal .col-mono-sobre{' +
      'width:100%;height:auto;display:block;' +
      'background:none!important;padding:0!important;box-shadow:none!important;' +
      'transform:none!important;margin:0!important;max-width:none!important;' +
      '-webkit-mask-image:' + MASCARA2 + ';mask-image:' + MASCARA2 + '}',
    'h[c] .col-canal .col-tarjeta{' +
      'position:relative;overflow:hidden;width:70%;margin:-20% auto 0;' +
      'padding:26px 22px 22px;transform:rotate(-.8deg);' +
      'background:' + PAPEL + ';border:0;border-radius:1px;' +
      'box-shadow:0 1px 1px rgba(90,76,54,.10),0 16px 38px rgba(90,76,54,.22),' +
        'inset 0 0 0 1px rgba(150,132,104,.12)}',
    'h[c] .col-canal .col-tarjeta::before{' +
      'content:"";position:absolute;left:0;right:0;top:41%;height:7px;z-index:2;' +
      'pointer-events:none;' +
      'background:linear-gradient(180deg,rgba(255,255,255,.7),rgba(150,132,104,.13) 55%,rgba(255,255,255,.3))}',
    'h[c] .col-canal .col-tarjeta > p{' +
      'font-family:"Cormorant Garamond",serif!important;font-style:italic;' +
      'font-size:15px!important;line-height:1.9!important;' +
      'color:var(--verde,#44513f)!important;margin:0 0 20px!important;max-width:none!important}',

    /* ⚠️ ACÁ HAY QUE NOMBRAR LOS IDS. Ver la nota de `:is()` arriba. */
    'h[c] .col-tarjeta #wa-p1,h[c] .col-tarjeta #wa-p2{' +
      'background:none!important;background-image:none!important;box-shadow:none!important;' +
      'border:0!important;border-bottom:1px solid rgba(120,105,85,.38)!important;' +
      'border-radius:0!important;color:var(--verde,#44513f)!important;text-shadow:none!important;' +
      'display:block!important;width:auto!important;max-width:none!important;' +
      'margin:0 auto 10px!important;padding:6px 2px!important;' +
      'font-family:Montserrat,sans-serif!important;font-size:9px!important;' +
      'letter-spacing:.2em!important;text-transform:uppercase!important;font-weight:500!important}',

    /* ── EL MARCO DE LA BANDEJA — GUARDADO, NO SE USA TODAVÍA ─────────── */
    'h[c] .col-lugar{' +
      'position:relative;max-width:344px;margin:4px auto 0;box-sizing:border-box;' +
      'padding:52px 40px}',
    'h[c] .col-lugar .col-bandeja{' +
      'position:absolute;inset:0;width:100%;height:100%;object-fit:fill;z-index:0;' +
      'background:none!important;padding:0!important;box-shadow:none!important;' +
      'transform:none!important;margin:0!important;max-width:none!important;' +
      '-webkit-mask-image:radial-gradient(ellipse 66% 62% at 50% 50%,#000 62%,transparent 96%);' +
      'mask-image:radial-gradient(ellipse 66% 62% at 50% 50%,#000 62%,transparent 96%)}',
    'h[c] .col-lugar .col-tarjeta{position:relative;z-index:1;padding:2px 12px}',

    /* ── LA PORTADA ───────────────────────────────────────────────────── */
    'h[c] .portada .kicker{' +
      'font-family:Montserrat,sans-serif;font-weight:400;text-transform:uppercase;' +
      'letter-spacing:.34em;opacity:.85;margin-bottom:20px;padding-left:.34em}',

    'h[t] .portada h1.names{' +
      'font-family:"Cormorant Garamond",serif!important;font-weight:300!important;' +
      'text-transform:uppercase;letter-spacing:.11em;' +
      'font-size:clamp(33px,11.5vw,66px)!important;line-height:1.06;padding-left:.11em}',

    'h[t] .portada h1.names .col-y{' +
      'display:block;font-family:"Great Vibes",cursive!important;font-weight:400!important;' +
      'text-transform:none;letter-spacing:0;font-size:.44em!important;' +
      'opacity:.8;margin:.04em 0;padding:0}',

    'h[c] .portada .fecha{' +
      'font-family:Montserrat,sans-serif;text-transform:uppercase;' +
      'font-size:clamp(10px,2.8vw,12px);letter-spacing:.26em;' +
      'opacity:.9;margin-top:22px;padding-left:.26em}',

    /* ⚠️ `.sep` son los DOS PUNTOS entre los números, no un separador. */
    'h[c] .count .num{' +
      'font-family:"Cormorant Garamond",serif;font-weight:300;' +
      'line-height:1;letter-spacing:.02em}',
    'h[c] .count .lab{' +
      'font-family:Montserrat,sans-serif;text-transform:uppercase;' +
      'font-size:9px;letter-spacing:.2em;opacity:.72;margin-top:7px;padding-left:.2em}',
    'h[c] .count .sep{' +
      'font-family:"Cormorant Garamond",serif;font-weight:300;opacity:.32}'

  ].join('')
   .replace(/h\[c\]/g, 'html[' + MARCA + '="' + NOMBRE + '"]')
   .replace(/h\[t\]/g, 'html[' + MARCA + '="' + NOMBRE + '"][' + MARCA_T + ']')
   .replace(/h\[p\]/g, 'html[' + MARCA + '="' + NOMBRE + '"][' + MARCA_P + ']');

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) {
      s = document.createElement('style');
      s.id = ID_CSS;
      (document.head || document.documentElement).appendChild(s);
    }
    if (s.textContent !== CSS) s.textContent = CSS;
  }

  function sugerirMotivo() {
    try {
      var ev = window.INVEV;
      if (!ev) return;
      if (!ev.fx) ev.fx = {};
      var m = ev.fx.motivo;
      if (m && m.juego) return;
      ev.fx.motivo = { juego: 'perlas', densidad: 1, donde: 'discreto' };
    } catch (e) {}
  }

  /* =====================================================================
     LAS PIEZAS — se vuelven a correr en el bucle de 400 ms porque el motor
     reinserta nodos en cada pasada.
     ===================================================================== */

  function unaImagen(clave, clase) {
    var src = laPieza(clave);
    if (!src) return null;
    var i = document.createElement('img');
    i.className = 'col-pza ' + clase;
    i.alt = '';
    i.src = src;
    return i;
  }

  function soporte(seccion, clavePieza, claseImg, claseCaja) {
    var w = seccion.querySelector('.' + claseCaja);
    if (!w) {
      var img = unaImagen(clavePieza, claseImg);
      if (!img) return null;
      w = document.createElement('div');
      w.className = claseCaja;
      var t = document.createElement('div');
      t.className = 'col-tarjeta';
      w.appendChild(img);
      w.appendChild(t);
      seccion.appendChild(w);
    }
    if (seccion.lastElementChild !== w) seccion.appendChild(w);
    return w.querySelector('.col-tarjeta');
  }

  function armarBroche() {
    var tl = document.querySelector('.tl');
    if (tl && !tl.querySelector('.col-broche')) {
      var b = unaImagen('broche', 'col-broche');
      if (b) tl.appendChild(b);
    }
  }

  function armarFrase() {
    var fs = document.querySelector('.fraseSec');
    if (!fs) return;
    if (!fs.querySelector('.col-collar')) {
      var c = unaImagen('collar', 'col-collar');
      if (c) fs.insertBefore(c, fs.firstChild);
    }
    if (!fs.querySelector('.col-sobre')) {
      var s = unaImagen('sobre', 'col-sobre');
      if (s) fs.appendChild(s);
    }
  }

  function armarCanal() {
    var s = document.getElementById('contacto-sec');
    if (!s) return;
    var t = soporte(s, 'mono', 'col-mono-sobre', 'col-canal');
    if (!t) return;
    var p = s.querySelector('#contacto-frase');
    if (p && p.parentElement !== t) t.appendChild(p);
    [].forEach.call(s.querySelectorAll('.wsp'), function (a) {
      if (a.parentElement !== t) t.appendChild(a);
    });
  }

  /* ---- Vestimenta: el traje y el vestido, con el & en el medio ---------- */
  function armarVestimenta() {
    var h = document.getElementById('dress-h2');
    var sec = h && h.closest ? h.closest('.sec') : null;
    if (!sec || sec.querySelector('.col-vest')) return;
    var d = document.createElement('div');
    d.className = 'col-vest';
    d.innerHTML = TRAJE + '<span class="col-amp">&amp;</span>' + VESTIDO;
    var k = document.getElementById('dress-kick');
    sec.insertBefore(d, (k && k.parentElement === sec) ? k.nextSibling : sec.firstElementChild);
  }

  function colocarPiezas() {
    armarBroche();
    armarFrase();
    armarCanal();
    armarVestimenta();
  }

  function sacarPiezas() {
    [].forEach.call(document.querySelectorAll('.col-canal,.col-lugar'), function (w) {
      var s = w.parentElement;
      var t = w.querySelector('.col-tarjeta');
      if (s && t) {
        while (t.firstChild) s.insertBefore(t.firstChild, w);
      }
      w.remove();
    });
    [].forEach.call(document.querySelectorAll('[data-col-lugar]'), function (s) {
      s.removeAttribute('data-col-lugar');
    });
    [].forEach.call(document.querySelectorAll('.col-vest'), function (e) { e.remove(); });
    [].forEach.call(document.querySelectorAll('.col-pza'), function (e) { e.remove(); });
  }

  function marcarPadres() {
    var p = document.querySelector('.padres');
    if (!p) return;
    var n = String(p.children.length);
    if (p.dataset.colN !== n) p.dataset.colN = n;
  }
  function desmarcarPadres() {
    var p = document.querySelector('.padres');
    if (p) delete p.dataset.colN;
  }

  function claridad(c) {
    var m = (c || '').match(/[\d.]+/g);
    if (!m || m.length < 3) return null;
    return 0.299 * (+m[0]) + 0.587 * (+m[1]) + 0.114 * (+m[2]);
  }
  function arreglarContraste() {
    [].forEach.call(document.querySelectorAll('.sec:not(.verde) h2.reveal'), function (h) {
      if (h.dataset.colContraste) return;
      var l = claridad(getComputedStyle(h).color);
      if (l !== null && l > 215) {
        h.dataset.colContraste = '1';
        h.style.color = 'var(--verde,#44513f)';
      }
    });
  }
  function soltarContraste() {
    [].forEach.call(document.querySelectorAll('[data-col-contraste]'), function (h) {
      h.style.color = '';
      delete h.dataset.colContraste;
    });
  }

  function acomodar() {
    [].forEach.call(document.querySelectorAll('.sec'), function (s) {
      var k = s.querySelector(':scope > .kick');
      var h = s.querySelector(':scope > h2.reveal');
      var a = s.querySelector(':scope > .adorno');
      if (k && h && (k.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        s.insertBefore(k, h.nextSibling);
      }
      if (a && s.firstElementChild !== a) {
        s.insertBefore(a, s.firstElementChild);
      }
    });
  }

  function desacomodar() {
    [].forEach.call(document.querySelectorAll('.sec'), function (s) {
      var k = s.querySelector(':scope > .kick');
      var h = s.querySelector(':scope > h2.reveal');
      var a = s.querySelector(':scope > .adorno');
      if (k && h && (h.compareDocumentPosition(k) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        s.insertBefore(k, h);
      }
      if (a && k) s.insertBefore(a, k);
    });
  }

  function partirNombres() {
    var h1 = document.querySelector('.portada h1.names');
    if (!h1 || h1.querySelector('.col-y')) return;
    var sp = h1.querySelectorAll('span');
    if (sp.length < 2) return;
    var seg = sp[1];
    var m = (seg.textContent || '').match(/^\s*(&|y|and|e)\s+(.+)$/i);
    if (!m) return;
    seg.textContent = m[2];
    var y = document.createElement('span');
    y.className = 'col-y';
    y.textContent = (m[1] === '&') ? '&' : m[1].toLowerCase();
    seg.parentNode.insertBefore(y, seg);
    var pr = y.previousSibling;
    if (pr && pr.nodeName === 'BR') pr.remove();
  }

  function juntarNombres() {
    var h1 = document.querySelector('.portada h1.names');
    if (!h1) return;
    var y = h1.querySelector('.col-y');
    if (!y) return;
    var seg = y.nextElementSibling;
    if (seg) {
      seg.textContent = y.textContent + ' ' + seg.textContent;
      y.parentNode.insertBefore(document.createElement('br'), y);
    }
    y.remove();
  }

  /* ---------------------------------------------------------------- montaje */
  var puesta = false;

  function poner() {
    hoja();
    var raiz = document.documentElement;
    raiz.setAttribute(MARCA, NOMBRE);

    var p = laPerla();
    if (p) {
      raiz.style.setProperty('--col-perla', 'url("' + p + '")');
      raiz.setAttribute(MARCA_P, '');
    }

    sugerirMotivo();

    if (tieneFuentePropia()) {
      raiz.removeAttribute(MARCA_T);
      juntarNombres();
    } else {
      raiz.setAttribute(MARCA_T, '');
      partirNombres();
    }

    acomodar();
    marcarPadres();
    arreglarContraste();
    colocarPiezas();
    puesta = true;
  }

  function sacar() {
    if (!puesta) return;
    var raiz = document.documentElement;
    raiz.removeAttribute(MARCA);
    raiz.removeAttribute(MARCA_T);
    raiz.removeAttribute(MARCA_P);
    raiz.style.removeProperty('--col-perla');
    sacarPiezas();
    desmarcarPadres();
    soltarContraste();
    desacomodar();
    juntarNombres();
    puesta = false;
  }

  function sincronizar() {
    if (activa()) poner();
    else sacar();
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
