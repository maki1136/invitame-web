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
      VOLVER a la muestra a ver si tiene algo que ver. Porque si ves que la
      bandeja de plata tiene una frase arriba, adiviná dónde tendría que estar
      en nuestra invi».

      Yo miré la referencia UNA vez, saqué reglas abstractas (tipografía, aire,
      bandas de color) y después coloqué las piezas por regla, sin volver a
      mirar dónde estaba cada objeto ni qué sostenía. Por eso salió «está
      puesto así por poner».

      EL IDIOMA DE LA MUESTRA, QUE ES LO QUE NO HABÍA VISTO:
      **cada objeto es el SOPORTE de un texto, no un adorno al lado.**
        · la bandeja de plata        → sostiene la tarjeta del LUGAR
        · el sobre con el moño       → sostiene la tarjeta del CANAL
        · el sobre abierto y el clip → sostienen la CARTA
        · el collar                  → cruza el papel arriba de un texto
      Se fotografía el objeto y el texto va ENCIMA, como elemento del DOM.
      La foto no necesita traer el texto: la tarjeta la dibujo yo.

      → EL MÉTODO, DE ACÁ EN ADELANTE. Antes de colocar cualquier pieza:
        1. buscarla en la muestra y ver QUÉ SOSTIENE;
        2. buscar en la nuestra la sección que dice eso mismo;
        3. colocarla ahí, o no colocarla;
        4. mirarla en el navegador ANTES de subirla.
        Si no hay una sección que diga lo mismo, no se pone. Que falte es
        mejor que que sobre.

   ★★★ MAPA MUESTRA → NUESTRA INVITACIÓN (Pavel & Lada) ★★★
      | En la muestra              | Objeto              | Nuestra sección     |
      |----------------------------|---------------------|---------------------|
      | portada · DEAR FRIENDS     | collar que cruza    | `.fraseSec` ✅       |
      | DEAR FRIENDS! You're inv.  | sobre abierto+clip  | #carta-sec ⚠ ver ↓  |
      | VENUE / Save the place!    | bandeja de plata    | "Dónde y cuándo" ✅  |
      | PROGRAM / of the day       | hilo + broche       | itinerario `.tl` ✅  |
      | DRESS CODE / colors        | círculos de color   | Vestimenta ✅        |
      | OUR CHANNEL / Telegram     | sobre con moño      | #contacto-sec ✅     |
      | WISHES                     | dos corazones       | Mesa de regalos ✅    |

      ⚠️ EL COLLAR VA UNA SOLA VEZ. En la muestra aparece dos veces y siempre
         igual: una franja horizontal ARRIBA de un área de papel crema, con el
         texto debajo. `.fraseSec` es exactamente eso (la colección ya le apaga
         el bokeh y la foto de fondo). Ponerlo en cada sección sería volver al
         patrón que Maki rechazó.

      ⚠️ #carta-sec ("Confirma tu lugar") YA TIENE el sobre con la carta que
         sale: `.cartafx` con `.cf-back` / `.cf-letter` / `.cf-front`, y las
         imágenes salen del catálogo de sobres. Maki: «nosotros ya tenemos esa
         sección armada, sólo hay que cambiar el sobre». O sea: NO hay que
         construir nada acá, hay que sumar un modelo de sobre con perlas al
         catálogo. Es la tarea #47.

   ★★★ !important NO ALCANZA: LA COLECCIÓN CARGA ANTES QUE CASI TODO ★★★
      `inv-fondo-css` trae
          html[data-fondo] .sec.verde{background-color:…!important}
      que tiene la MISMA especificidad que
          html[data-coleccion="perlas"] .sec[data-col-lugar]
      (las dos 0,3,1). Con importancia y especificidad iguales, desempata el
      ORDEN — y la hoja de la colección se inserta antes que los módulos.
      Resultado: la sección seguía verde oscura aunque la regla estuviera bien
      escrita, y desde el código se veía perfecta.
      → Cuando haya que ganarle a un módulo del motor: REPETIR EL ATRIBUTO,
        `[data-col-lugar][data-col-lugar]`, que sube a (0,4,1) sin depender de
        ninguna clase del motor. Repetir la clase (`.sec.sec`) hace lo mismo.
      → Y la única forma de darse cuenta es MIRAR LA PÁGINA.

   ★★★ ANTES DE AGREGAR UN NODO A UNA SECCIÓN, MIRAR SU `display` ★★★
      `.fraseSec` es `display:flex; flex-direction:row`. Al agregarle la foto
      del sobre como hijo normal, la imagen se convirtió en UNA COLUMNA MÁS y
      le robó el ancho al texto: el párrafo pasó de 375 px a 177 px y se salió
      a `left:-62`. Eso es el «texto que sobresale» que vio Maki.
      → Hay tres salidas, y la elección depende de la pieza:
        · `position:absolute` — para algo chico en una esquina (el sobre).
        · `flex-wrap` en el padre + `flex:0 0 100%` en la pieza — para algo que
          tiene que ocupar TODO el ancho (el collar). Se lleva una fila entera
          y el texto conserva su ancho.
        · no tocar nada — si la sección no es flex ni grid, comprobado.

   ★★★ TRES MANERAS DE APOYAR UNA FOTO SOBRE EL PAPEL ★★★
      1. RECORTADA con alfa — lo que flota sobre cualquier fondo (broche).
      2. DIFUMINADA con `mask-image` — lo que vive en una sección clara
         (bandeja, sobre, moño). El tono del papel de la foto nunca es
         EXACTAMENTE el de la sección y el ojo ve el cuadrado; la máscara lo
         disuelve. Se aplica al RENDER: se afina sin regenerar el archivo.
      3. MULTIPLICADA (`mix-blend-mode:multiply`) — el collar. El archivo no
         tiene alfa: su papel fue llevado a blanco puro, y el blanco no pinta
         nada. Sirve en las 20 paletas sin regenerar. Ver `pieza-collar.js`.

      ⚠️ POR ESO LAS PIEZAS VAN COMO <img>, NUNCA COMO `background-image` DE
         UNA CAJA CON HIJOS: la máscara de un fondo no se puede separar del
         contenido. La bandeja empezó siendo background y se veía el rectángulo.
      ⚠️ Y SÓLO FUNCIONA EN SECCIÓN CLARA. Sobre `.sec.verde` el papel marfil
         entra como un rectángulo claro, con máscara y todo. Por eso "Dónde y
         cuándo" pasa a crema — que además es lo que hace la muestra.
      ⚠️ CUIDADO CON LA REGLA POLAROID: `h[c] .sec > img` le pone marco blanco,
         padding y sombra a TODA imagen hija directa de una sección. Las piezas
         tienen que apagarlo con `!important` una por una.

   ★★★ LOS "PÉTALOS" ERAN LO QUE MAKI VEÍA COMO PERLAS DIBUJADAS ★★★
      `.fxlayer .fxp.petalo` son pétalos ROSAS que caen, un efecto de ambiente
      del panel. Sobre la foto de portada en blanco y negro se leen como
      manchas grises planas, sin relieve. Eso era «las perlas de la portada se
      nota que están dibujadas», y yo buscaba el bug en el motivo, que ya
      estaba en `discreto`.
      → En esta colección el pétalo pasa a ser LA PERLA fotográfica, chica.
        Sigue siendo el interruptor de Jazmín: si lo apaga, no cae nada.

   ★★★ CÓMO SE CAMBIAN LOS TAMAÑOS: SE SETEAN LAS VARIABLES DEL MOTOR ★★★
      El motor aplica su escala con `!important`, así que una regla propia de
      `font-size` PIERDE siempre:
          .sec h2 { font-size: var(--fs-titulo, 30px) !important }
      Escala completa: --fs-nombres --fs-kicker --fs-titulo --fs-cursiva
      --fs-contador --fs-texto --fs-datos --fs-direccion --fs-lugar --fs-frase
      --fs-boton. Y --pad, --sec-col/-v, --sec-tex/-v, --lino, --lino2,
      --cream, --muted, --oro, --verde, --sage.

   ★★★ LOS NOMBRES DE LA PORTADA LOS MANDA JAZMÍN ★★★
      El motor les escribe familia, tamaño y color EN LÍNEA desde `nfont`,
      `nsize`, `ncolor`. Con `nfont` elegida la colección NO los toca.

   ★★★ NUNCA GUARDAR UNA COPIA DEL HTML PARA "DESHACER" ★★★
      Guardar `h1.innerHTML` para restaurarlo hacía aparecer "María & Diego",
      los nombres de la BODA DE EJEMPLO: el motor dibuja el ejemplo primero.
      → Deshacer SIEMPRE estructuralmente, desde el DOM vivo.

   ★★ EL MOTOR ANCLA EL `.adorno` A LA CURSIVA ★★
      Al bajar el `.kick` los aros ⚭ se fueron con él. El motor los reinserta en
      cada pasada, así que `acomodar()` corre en el bucle de 400 ms. Lo mismo
      vale para las piezas: TODO lo que mueve nodos se vuelve a correr.

   ★ EL MOTIVO: SE SUGIERE `discreto`, NO `todo`
      Repetir una misma foto muchas veces y GRANDE se lee como dibujo, aunque
      cada unidad sea fotográfica: el ojo ve el patrón, no la perla.
      → `discreto` = hilo entre secciones + corazones del final.

   ★ LA LÍNEA DE TIEMPO ES UN HILO DE PERLAS
      `.tl::before` (la guía, al 22 % de opacidad) sube a 1 y lleva la perla
      repetida de 11 px, centrada en x=7 como la línea original.
      `.tl-prog` se ESCONDE: el motor la anima con `scaleY` y escalar un fondo
      repetido deja las perlas ovaladas.

   ★ LA SECCIÓN DE LA FRASE SE LIMPIA Y PIERDE SU ALTURA FIJA
      «los cosos esos rojos que se ven de fondo con la imagen, sacalo». Son
      `.frasefx.fx-bokeh` y la foto de fondo. Y como ahora entra el collar,
      `height:auto`: con la altura fija el texto quedaba cortado abajo.

   ★ `.padres` ES UNA GRILLA DE 2 COLUMNAS
      Con 3 personas la tercera queda sola abajo. «si ponés 3 pueden ir las 3
      juntas, si son 4, 2 y 2». → `data-col-n` y el CSS arma la grilla.
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
  var MASCARA3 = 'radial-gradient(ellipse 66% 62% at 50% 50%,#000 62%,transparent 96%)';

  /* `LUG` = la sección del lugar, con el atributo REPETIDO a propósito para
     ganarle a `inv-fondo-css`. Ver la nota de especificidad del encabezado. */
  var LUG = ' .sec[data-col-lugar][data-col-lugar]';

  var CSS = [

    /* ── LOS TAMAÑOS: por las variables del motor ──────────────────────── */
    'h[c]{' +
      '--fs-titulo:clamp(20px,5.6vw,31px);' +
      '--fs-cursiva:clamp(18px,4.8vw,24px);' +
      '--fs-kicker:clamp(9px,2.6vw,11px);' +
      '--fs-contador:clamp(29px,8.6vw,44px);' +
      '--fs-frase:clamp(17px,4.4vw,22px)}',

    /* ── EL PAR QUE SE REPITE EN TODAS LAS SECCIONES ───────────────────── */
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

    /* ── AIRE ─────────────────────────────────────────────────────────── */
    'h[c] .sec{padding:76px 30px}',
    'h[c] .sec > p,h[c] .sec p.reveal{max-width:23em;margin-left:auto;margin-right:auto;line-height:1.75}',
    '@media (max-width:420px){h[c] .sec{padding:60px 24px}}',

    /* ── ARCOS ────────────────────────────────────────────────────────── */
    'h[c] .sec.verde{' +
      'border-top-left-radius:50% 90px;border-top-right-radius:50% 90px;' +
      'padding-top:104px}',
    '@media (max-width:420px){h[c] .sec.verde{' +
      'border-top-left-radius:50% 58px;border-top-right-radius:50% 58px;' +
      'padding-top:82px}}',

    /* ── LA FOTO DE PORTADA, EN BLANCO Y NEGRO ────────────────────────── */
    'h[c] .portada .pbg,h[c] .portada .cover-vid{' +
      'filter:grayscale(1) contrast(1.06) brightness(.98)}',

    /* ── LO QUE CAE: LA PERLA, NO UN PÉTALO ROSA ─────────────────────── */
    'h[p] .fxlayer .fxp{' +
      'background:var(--col-perla) no-repeat center/contain!important;' +
      'border-radius:0!important;width:9px!important;height:9px!important;' +
      'opacity:.5!important;' +
      'filter:drop-shadow(0 1px 1px rgba(60,50,40,.25))!important}',

    /* ── LAS FOTOS DEL CLIENTE, COMO OBJETOS APOYADOS ─────────────────────
       ⚠️ Esta regla agarra CUALQUIER <img> hija directa de una sección, así
          que cada pieza tiene que apagarla con `!important`. */
    'h[c] .sec > img{' +
      'background:#fff;padding:9px;border-radius:2px;' +
      'box-shadow:0 1px 2px rgba(60,50,40,.14),0 10px 24px rgba(60,50,40,.13);' +
      'max-width:min(100%,340px);height:auto;display:block;margin:26px auto}',
    'h[c] .sec > img:not(.reveal):nth-of-type(odd){transform:rotate(-1.4deg)}',
    'h[c] .sec > img:not(.reveal):nth-of-type(even){transform:rotate(1.1deg)}',

    'h[c] .sec .evento{' +
      'border-radius:3px;box-shadow:0 1px 2px rgba(60,50,40,.10),0 8px 22px rgba(60,50,40,.10)}',

    /* ── LA SECCIÓN DE LA FRASE ───────────────────────────────────────────
       Papel limpio, sin altura fija (si no el texto queda cortado abajo del
       collar), y en dos filas: el collar arriba y la frase abajo. */
    'h[c] .fraseSec{' +
      'position:relative;background:var(--lino,#f4f3ec);' +
      'flex-wrap:wrap!important;align-items:center!important;' +
      'height:auto!important;min-height:0!important;overflow:visible!important;' +
      'padding-top:0!important;padding-bottom:56px!important}',
    'h[c] .fraseSec .frasefx,h[c] .fraseSec .bg,h[c] .fraseSec .capa{display:none!important}',
    'h[c] .fraseSec .frase{' +
      'font-family:"Cormorant Garamond",serif;font-weight:300;line-height:1.9;' +
      'max-width:19em;margin-left:auto;margin-right:auto;color:var(--verde,#44513f)}',

    /* ── `.padres`: la grilla según cuántos sean ──────────────────────── */
    'h[c] .padres[data-col-n="3"]{grid-template-columns:repeat(3,1fr)!important;gap:12px!important}',
    'h[c] .padres[data-col-n="1"]{grid-template-columns:minmax(0,220px)!important;justify-content:center!important}',
    '@media (max-width:360px){h[c] .padres[data-col-n="3"]{gap:8px!important}}',

    /* ── LA LÍNEA DE TIEMPO, HECHA DE PERLAS ──────────────────────────── */
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

    /* ── LAS PIEZAS FOTOGRAFIADAS ─────────────────────────────────────── */
    'h[c] .col-pza{pointer-events:none;display:block}',

    'h[c] .tl .col-broche{' +
      'position:absolute;width:22px;height:auto;left:-4px;bottom:-11px;' +
      'filter:drop-shadow(0 1px 2px rgba(60,50,40,.24))}',

    /* ── EL COLLAR: CRUZA LA INVITACIÓN, A SANGRE ─────────────────────────
       «las perlas son mucho más grandes, pasan por la invitación y son reales
       fotográficas arriba del fondo blanco, se nota en el relieve, las
       sombras». Multiplicado (ver pieza-collar.js).
       `flex:0 0 100%` + el `flex-wrap` de la sección = se lleva una fila
       entera y NO le roba el ancho al texto. Los márgenes negativos tienen
       que ser IGUALES al padding lateral de la sección para llegar al borde. */
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

    /* el sobre: chico, ABSOLUTO y disuelto, en la esquina. «dejá el sobre
       pero que sea delicado». Absoluto porque la sección es flex. */
    'h[c] .fraseSec .col-sobre{' +
      'position:absolute!important;right:6px;bottom:6px;width:96px;height:auto;z-index:1;' +
      'background:none!important;padding:0!important;box-shadow:none!important;' +
      'transform:none!important;margin:0!important;' +
      'opacity:.95;mix-blend-mode:multiply;' +
      '-webkit-mask-image:' + MASCARA + ';mask-image:' + MASCARA + '}',
    '@media (max-width:360px){h[c] .fraseSec .col-sobre{width:80px}}',

    /* ── LA TARJETA APOYADA: el patrón de toda la muestra ─────────────── */
    'h[c] .col-tarjeta{' +
      'position:relative;background:#fdfcf8;border:1px solid rgba(120,105,85,.14);' +
      'border-radius:1px;text-align:center;' +
      'box-shadow:0 1px 2px rgba(60,50,40,.09),0 12px 30px rgba(60,50,40,.14)}',

    /* ── "¿ALGUNA DUDA?" = OUR CHANNEL ────────────────────────────────── */
    'h[c] #contacto-sec{' +
      'background-image:none!important;background-color:var(--lino,#f4f3ec)!important;' +
      'padding-bottom:56px!important}',
    'h[c] .col-canal{position:relative;max-width:322px;margin:0 auto}',
    'h[c] .col-canal .col-mono{' +
      'width:100%;height:auto;display:block;' +
      'background:none!important;padding:0!important;box-shadow:none!important;' +
      'transform:none!important;margin:0!important;max-width:none!important;' +
      '-webkit-mask-image:' + MASCARA2 + ';mask-image:' + MASCARA2 + '}',
    'h[c] .col-canal .col-tarjeta{width:72%;margin:-20% auto 0;padding:18px 14px 16px}',
    'h[c] .col-canal .col-tarjeta > p{margin:0 0 14px!important;max-width:none!important;' +
      'font-size:13px!important;line-height:1.7!important}',
    'h[c] .col-canal .col-tarjeta .wsp{' +
      'display:block!important;margin:7px auto 0!important;' +
      'width:100%!important;max-width:100%!important;box-sizing:border-box!important;' +
      'padding:8px 6px!important;font-size:9px!important;letter-spacing:.14em!important;' +
      'text-transform:uppercase!important;font-family:Montserrat,sans-serif!important;' +
      'box-shadow:0 1px 2px rgba(60,50,40,.18)!important;border-radius:999px!important}',

    /* ── "DÓNDE Y CUÁNDO" = VENUE ─────────────────────────────────────────
       ⚠️ El atributo va REPETIDO: si no, gana `inv-fondo-css`. Ver arriba. */
    'h[c]' + LUG + '{' +
      'background:var(--lino,#f4f3ec)!important;color:var(--verde,#44513f)!important}',
    ['h2', '.kick', 'h3', '.sub', '.addr', 'p'].map(function (q) {
      return 'h[c]' + LUG + ' ' + q;
    }).join(',') + '{color:var(--verde,#44513f)!important}',

    'h[c] .col-lugar{' +
      'position:relative;max-width:344px;margin:4px auto 0;box-sizing:border-box;' +
      'padding:52px 40px}',
    'h[c] .col-lugar .col-bandeja{' +
      'position:absolute;inset:0;width:100%;height:100%;object-fit:fill;z-index:0;' +
      'background:none!important;padding:0!important;box-shadow:none!important;' +
      'transform:none!important;margin:0!important;max-width:none!important;' +
      '-webkit-mask-image:' + MASCARA3 + ';mask-image:' + MASCARA3 + '}',
    'h[c] .col-lugar .col-tarjeta{position:relative;z-index:1;padding:2px 12px}',
    'h[c] .col-lugar .evento{' +
      'background:none!important;border:0!important;box-shadow:none!important;' +
      'margin:0!important;padding:14px 0!important;max-width:none!important}',
    'h[c] .col-lugar .evento + .evento{border-top:1px solid rgba(120,105,85,.18)!important}',
    'h[c] .col-lugar .ph{display:none!important}',
    'h[c] .col-lugar .bd{padding:0!important}',
    'h[c] .col-lugar .btn{' +
      'font-size:8.5px!important;letter-spacing:.12em!important;padding:6px 9px!important}',
    '@media (max-width:360px){h[c] .col-lugar{padding:44px 30px}}',

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

    /* ── LA CUENTA REGRESIVA ──────────────────────────────────────────────
       ⚠️ `.sep` son los DOS PUNTOS entre los números, no un separador. */
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

  /* ---- el motivo: se sugiere DISCRETO ------------------------------------ */
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
     LAS PIEZAS
     Cada una va donde la muestra la tiene. Ver el mapa del encabezado. Todo
     esto se vuelve a correr en el bucle de 400 ms porque el motor reinserta
     nodos en cada pasada.
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

  /* arma el par «foto de soporte + tarjeta encima», que es el patrón de toda
     la referencia. Devuelve la tarjeta, o null si falta la foto. */
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

  /* ---- el broche cierra el hilo del programa ----------------------------- */
  function armarBroche() {
    var tl = document.querySelector('.tl');
    if (tl && !tl.querySelector('.col-broche')) {
      var b = unaImagen('broche', 'col-broche');
      if (b) tl.appendChild(b);
    }
  }

  /* ---- el collar cruza la frase, y el sobre chico en la esquina ---------- */
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

  /* ---- "¿Alguna duda?" = OUR CHANNEL ------------------------------------- */
  function armarCanal() {
    var s = document.getElementById('contacto-sec');
    if (!s) return;
    var t = soporte(s, 'mono', 'col-mono', 'col-canal');
    if (!t) return;
    /* el párrafo primero y después los botones, como en la muestra */
    var p = s.querySelector('#contacto-frase');
    if (p && p.parentElement !== t) t.appendChild(p);
    [].forEach.call(s.querySelectorAll('.wsp'), function (a) {
      if (a.parentElement !== t) t.appendChild(a);
    });
  }

  /* ---- "Dónde y cuándo" = VENUE ------------------------------------------
     Se busca por el id de un evento, NO por el texto del título: el título lo
     escribe el cliente y puede decir cualquier cosa. */
  function laSeccionDelLugar() {
    var e = document.getElementById('ev1-t');
    return e ? e.closest('.sec') : null;
  }

  function armarLugar() {
    var s = laSeccionDelLugar();
    if (!s) return;
    var t = soporte(s, 'bandeja', 'col-bandeja', 'col-lugar');
    if (!t) return;
    if (!s.hasAttribute('data-col-lugar')) s.setAttribute('data-col-lugar', '');
    /* los eventos con datos van a la tarjeta; los vacíos se quedan afuera */
    [].forEach.call(s.querySelectorAll(':scope > .evento'), function (e) {
      var h = e.querySelector('h3');
      if (h && (h.textContent || '').trim()) t.appendChild(e);
    });
  }

  function colocarPiezas() {
    armarBroche();
    armarFrase();
    armarCanal();
    armarLugar();
  }

  /* ---- deshacer: los nodos VUELVEN a su sección, y recién ahí se borra la
     caja. Nunca se borra una caja con contenido del motor adentro. -------- */
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
    [].forEach.call(document.querySelectorAll('.col-pza'), function (e) { e.remove(); });
  }

  /* ---- `.padres`: marcar cuántos son para que el CSS arme la grilla ------- */
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

  /* ---- títulos blancos sobre fondo claro --------------------------------- */
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

  /* ---- la cursiva pegada DEBAJO del título, el adorno arriba de todo ------ */
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

  /* ---- el conector de los nombres, solo y en cursiva ---------------------- */
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
