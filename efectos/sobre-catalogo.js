/* ===== EL SOBRE DEL CATÁLOGO, POR FIN CONECTADO ==============================

   EL BUG, que dejaba muerta una función entera
   El motor (`i/index.html`) decide cómo se abre la invitación con esta línea:

       if (CONFIG.sobreTriangulos) { initEnvTri(); } else { initEnvVideo(); }

   Y `CONFIG.sobreTriangulos` está **fijo en true** dentro del propio motor. No
   sale de los datos, no sale del panel: está escrito ahí. Resultado: TODAS las
   invitaciones abrían con el sobre de triángulos, y el sobre que Jazmín elige
   en «✨ Efectos → Sobre del catálogo» no se usaba nunca.

   POR QUÉ SE ARREGLA DESDE ACÁ
   `i/index.html` pesa 185 KB y se sube a mano. El motor deja `abrir()` como
   función global, así que un módulo puede armar la apertura con el material del
   catálogo y después llamar a la MISMA `abrir()` de siempre.

   ★★★★★★★ EL SOBRE MAESTRO: LA SOLAPA ES UNA IMAGEN APARTE  (4/9/2026)

     Maki, mirando el sobre de la competencia (inviteness) cuadro por cuadro:
     «se abrió un triángulo medio raro… se nota que está cortado, no se nota
     fluido». Y después: «viste la muestra exacta que te mostré?».

     CINCO COSAS ESTABAN MAL, y todas se descubrieron MIDIENDO —la referencia,
     o nuestro propio render— no mirando de reojo:

     1. EL LACRE SE PARTÍA AL MEDIO. Con `clip-path` la solapa es un recorte
        de la MISMA foto, así que el lacre queda cortado por la línea del
        doblez: media luna se va con la solapa y media luna se queda. En un
        sobre de verdad el lacre se levanta ENTERO, pegado a la solapa.

        → El sobre maestro trae DOS archivos: el cuerpo (`poster`) y la solapa
          recortada con transparencia (`solapa`, un WebP con alfa, 15 KB). La
          solapa no se recorta con `clip-path`: su propio alfa le da la forma,
          el lacre viene adentro, y viaja con ella. El cuerpo tiene la MUESCA
          del triángulo, y por esa muesca se ve la tarjeta.

     2. LA TARJETA NO SUBE: EL SOBRE SE CAE. Yo daba por hecho que la tarjeta
        salía del sobre hacia arriba. Seguí el moño de la referencia entre el
        segundo 12,9 y el 15,3: **se queda a la misma altura todo el tiempo**.
        Lo que se mueve es el sobre, que baja y se va por abajo del cuadro.

        → `CAIDA` y `ESPERA` manejan esa salida, y el fundido ahora espera a
          que termine (antes cortaba a los `SOLAPAS` segundos y se comía la
          caída).

     3. Y POR LA MUESCA TENÍA QUE VERSE LA FOTO, no papel crema. `#env` es
        una tapa OPACA: la portada real está abajo, pero tapada. Así que la
        foto se dibuja como una capa nuestra (`.h-fondo`), copiada en vivo
        de `.portada .pbg`: oscurecida y un poco más chica cuando el sobre
        está cerrado, y se ilumina y crece mientras la solapa se levanta.
        Cuando el sobre terminó de caerse, esa capa quedó idéntica a la
        portada de abajo, y por eso el empalme no se ve.

     4. ESA CAPA NO PUEDE COLGAR DEL SOBRE. Primero la puse adentro de
        `#col-sobre-foto` y Maki lo cazó al toque: «la foto de ellos se va
        para abajo con el sobre y desaparece, y la otra no desaparece».
        Obvio: heredaba el `translateY` de la caída. Va en su propia capa
        fija, `#col-sobre-carta`, misma geometría y z-index más bajo.
        **El sobre se va; la tarjeta se queda.**

     5. EL SOBRE PARECÍA DOS FOTOS PEGADAS. Maki: «me parece que la parte de
        abajo y la parte de arriba son dos cosas diferentes… se nota el que
        está arriba». Tenía razón, y era medible:

        a) La solapa venía recortada a 768x810 y se dibujaba con
           `background-size:100% auto`, o sea conservando su proporción. El
           cuerpo, en cambio, se estira a la caja (`100% 100%`). La caja es
           9:16 (0,5625) y el master es 768/1376 (0,5581): **0,8% de
           diferencia**. En la punta de la solapa eso son **3 px de desfase**
           — suficiente para ver el doblez DOBLE.
           → Ahora la solapa va al **lienzo completo** (768x1376, todo lo de
             abajo transparente) y se dibuja con la MISMA regla que el
             cuerpo. Calza al píxel.

        b) Además yo le había pintado al cuerpo una sombra de doblez que la
           foto original YA TENÍA. Dos sombras superpuestas y corridas =
           una banda ancha en vez de una línea. Medido contra el master:
           con la sombra pintada la diferencia máxima era 118; sacándola,
           8. → El cuerpo ahora es el master con el lacre borrado y NADA más.

        → Regla: **si la foto original ya lo tiene, no lo pintes encima.**

     ⚠️ `GIRO` es NEGATIVO a propósito: la solapa tiene que venir HACIA la
        cámara, no irse para atrás. Con la solapa recortada se le ve el dorso,
        así que el sentido del giro ahora SÍ importa.
     ⚠️ `eje` sale del catálogo (`{x, y}` en porcentajes) porque cada sobre
        tiene la punta de la solapa en su lugar. Si no viene, queda 50/50.
     ⚠️ SIN `solapa` EN EL CATÁLOGO NO CAMBIA NADA: todo esto vive detrás de
        `data-solapa="1"`. Los sobres viejos siguen abriéndose igual.

   ★★★★★★★ SE ABRE POR ARRIBA. Y CÓMO ME EQUIVOQUÉ.  (3/9/2026)

     Maki, después de ver la primera versión de la apertura por solapas:

       «Agarrás y partiste el sobre en cualquier lado. Si yo te mandé un video
        de que el sobre se abre POR ARRIBA, de que la foto sale de atrás… ¿por
        qué lo cortaste de costado? ¿Qué criterio estás usando?»

     Ninguno bueno, y el error vale anotarlo porque es de método, no de código:

       **Diseñé mirando la FOTO FIJA en vez de mirar SU VIDEO.**

     La foto del sobre cerrado tiene los dobleces marcados en X —cuatro
     triángulos que se cruzan en el lacre— así que partí por ahí y abrí las dos
     solapas de los costados. Se ve prolijo, pero **ningún sobre se abre así**.
     El video que ella mandó como referencia muestra lo que pasa de verdad:
     se levanta LA SOLAPA DE ARRIBA, y por esa V que queda sale la tarjeta.

     → La regla, que ya está escrita en la skill `fiel-a-la-muestra` y me la
       salteé igual: **cuando hay una muestra, se diseña contra la muestra.**
       La foto sirve para sacar el material; el MOVIMIENTO sale del video.
     → Y antes de mostrar algo que tiene referencia: abrir la referencia al
       lado y compararlas. No alcanza con que lo que salió "se vea lindo".

     CÓMO QUEDÓ
       Se mueve UNA sola solapa: la de arriba, con la bisagra en el borde
       superior (`transform-origin: center top`). Las otras tres son el cuerpo
       del sobre y no se tocan.

     ⚠️ Si alguna vez hace falta el otro movimiento (gatefold, como el sobre de
        Perlas, que SÍ se abre al medio), no se cambia esto: es otro sobre y va
        con su propio `apertura`.

   ★★★★★ DOS MANERAS DE ABRIR: `video` Y `solapas`  (3/9/2026)

     Maki: «cambiemos el sobre, se abre descontrolado este. Creo que lo habías
     armado vos con una imagen».

     Un video generado con IA **hace lo que quiere**: en el de anillos el
     relieve del papel cambia solo en el camino (arranca con volutas y termina
     con rosas) y el lacre no se parte, se desvanece.

     La alternativa es no usar video: **una foto fija y el movimiento hecho por
     nosotros**. El tiempo, el ángulo y el final los manejamos al milisegundo y
     sale igual siempre.

     ⚠️ EL EJE ES REGULABLE. `EJE` dice dónde está la punta de la solapa, en
        fracciones de la foto.

     ⚠️ LAS SOLAPAS SE RECORTAN SOBRE LA CAJA DE LA FOTO, no sobre la pantalla.
        Por eso el contenedor tiene el tamaño exacto de la imagen, calculado con
        `min()` y aritmética.

   ★★★★★★ EL BUG QUE COSTÓ MÁS CARO  (3/9/2026)

     La apertura por solapas se subió… y en pantalla aparecía **una tarjeta
     crema vacía**. Todo lo medido daba bien: las hojas existían, la foto
     cargaba (1080 × 1920), el tamaño correcto, `visibility: visible`,
     `opacity: 1`. Hasta con `background: red` a mano no se veía el rojo.

     No era que no se pintara: **algo la tapaba**. Era el `<video>` del motor.
     En modo solapas se le sacaba el `src` pero se quedaba en `display: block`,
     y la regla de escritorio le da `z-index: 2`, `border-radius: 30px` y una
     sombra de tarjeta. La tarjeta crema que mirábamos ERA el video vacío.

     → Lo destrabó `elementFromPoint`, no seguir leyendo estilos: los estilos de
       un elemento nunca te dicen quién está ARRIBA.
     → El arreglo va por CSS, no por JS: un `vid.style.display='none'` se puede
       perder si otro camino vuelve a tocar el elemento.
     → Regla: **cuando algo "no se ve" y todas las medidas dan bien, la pregunta
       no es qué le pasa a ese elemento: es qué hay encima.**

   ★★★★★ EL SOBRE SE ABRE SOBRE LA PORTADA REAL  (3/9/2026)

     Maki: «habíamos quedado en que el sobre se abría y aparecía abajo la foto
     de la invitación directo, y ahí recién aparecían los datos».

     No hace falta componer nada: **la invitación ya está dibujada abajo**.
     `#env` es una tapa `position:fixed; z-index:100`; debajo está la portada
     real. Entonces el empalme no es «fundir a blanco y después mostrar»: es
     **apagar el sobre** y dejar ver lo que ya estaba.

     Y el detalle que ella pidió: **primero la foto sola, y los datos medio
     segundo después.**

     `empalme`: `'blanco'` (por defecto) o `'foto'`.

     ⚠️ Los textos se retienen con una CLASE en el `<html>`, no tocando los
        nodos: el motor los repinta y cualquier `style` inline se pierde.
     ⚠️ Y SIEMPRE se destraban, aunque algo falle: hay un plazo máximo.

   ★★★★★ EL ATAJO SE QUEDABA PEGADO CON EL SOBRE VIEJO  (3/9/2026)

     `atajo()` mira `localStorage` y arma el sobre de la última visita. Pero
     además ponía `listo = true`, y `revisar()` entonces sólo GUARDABA el modelo
     nuevo sin cambiar lo que había en pantalla.

     ⚠️ Afectaba a TODAS: al cambiarle el sobre a una invitación entregada, los
        invitados que ya la habían abierto seguían viendo el viejo.

     → El ciclo no se corta hasta que llega el dato real; se guarda qué sobre
       está puesto (`armadoModelo`) y si no coincide se corrige con
       `actualizar()`. ⚠️ NO se vuelve a llamar a `armar()`: engancharía una
       segunda tanda de listeners y `abrir()` se llamaría dos veces.
     → Regla: **un atajo de caché tiene que saber corregirse.**

   ★★ LA NITIDEZ SE PIERDE EN EL ENCUADRE, NO EN EL ARCHIVO  (2/9/2026)
     `object-fit: cover` en un iPhone de 1179 × 2556 con un video de 1080 × 1920
     agranda 1,33× y recorta el 20% de los lados. Con `contain`, 1,09×.
     → Un objeto fotografiado va CONTENIDO, no recortado.

   ★★★ EL `<video>` DEL MOTOR VIENE CON `autoplay` (2/9/2026)
     La invitación **se abría sola**. Se le saca el atributo y se lo deja en
     pausa.

   ★★★ Y SAFARI LE PONE SUS PROPIOS CONTROLES (2/9/2026)
     Hay que apagar los `::-webkit-media-controls*`, y para el video ESTÉ DONDE
     ESTÉ, porque aparecen antes de que se ponga la clase.

   ★★★★ EL PRIMER SEGUNDO TAMBIÉN ES LA INVITACIÓN  (2/9/2026)
     La tapa esconde TODOS los hijos de `#env`, y el sobre elegido se guarda en
     `localStorage` para que desde la segunda visita aparezca al instante.

   ⚠️ EL TOQUE VA EN CAPTURA SOBRE EL DOCUMENTO.
   ⚠️ SI ALGO FALLA, EL INVITADO ENTRA IGUAL. Reloj de seguridad.
   ⚠️ NO TOCA NADA SI EL SOBRE NO ES DEL CATÁLOGO.
   ============================================================================ */
(function () {

  var FUNDIDO  = 1.0;   /* cuánto dura el desvanecido final */
  var ANTES    = 1.4;   /* en modo video: cuánto antes del final arranca */
  var SOLAPAS  = 1.15;  /* en modo solapas: cuánto tarda en abrirse */
  var DATOS    = 550;   /* cuánto esperan los textos de la portada, en ms */
  var TOPE     = 3500;  /* plazo máximo para destrabarlos, pase lo que pase */

  /* dónde está la punta de la solapa, en fracciones de la foto. */
  var EJE = { x: 50, y: 50 };

  /* ---- sobre maestro: giro de la solapa y caída del sobre ---- */
  var GIRO   = -96;    /* grados: negativo = la solapa viene HACIA la cámara */
  var CAIDA  = 1.9;    /* cuánto tarda el sobre en irse por abajo */
  var ESPERA = 1.15;   /* y cuánto espera después de abrirse la solapa */

  var listo = false;
  var armadoModelo = null;

  function ev()  { return (window.INVEV || {}); }
  function sobre() { return ((ev().fx || {}).sobre) || {}; }
  function catalogo() {
    var c = window.SOBRES_INVITAME;
    return (c && typeof c === 'object') ? c : null;
  }

  function slug() {
    try {
      var d = window.INVDATA || {};
      if (d.slug) return String(d.slug);
      var m = location.search.match(/[?&]e=([^&]+)/);
      return m ? decodeURIComponent(m[1]) : '';
    } catch (e) { return ''; }
  }
  function recordar(modelo) {
    try { if (slug()) localStorage.setItem('inv_sobre_' + slug(), modelo || ''); } catch (e) {}
  }
  function recordado() {
    try { return slug() ? (localStorage.getItem('inv_sobre_' + slug()) || null) : null; }
    catch (e) { return null; }
  }

  function delCatalogo(modelo) {
    var cat = catalogo();
    if (!cat || !modelo) return null;
    var m = cat[modelo];
    if (!m) return null;
    if (m.apertura === 'solapas' && m.poster) return m;
    if (m.video) return m;
    return null;
  }
  function elegido() {
    var s = sobre();
    if (String(s.tipo || '') !== 'carta') return null;
    return delCatalogo(s.modelo);
  }

  /* ---- 1. TAPA ANTI-DESTELLO + CONTROLES DE SAFARI, antes de saber nada ---- */
  var tapa = document.createElement('style');
  tapa.id = 'col-sobre-tapa';
  tapa.textContent =
    '#env > *{visibility:hidden!important}\n' +
    '#env{background:#efeae2!important}';
  (document.head || document.documentElement).appendChild(tapa);

  var sinControles = document.createElement('style');
  sinControles.id = 'col-sobre-sin-controles';
  sinControles.textContent = [
    '#env-vid::-webkit-media-controls,',
    '#env-vid::-webkit-media-controls-enclosure,',
    '#env-vid::-webkit-media-controls-panel,',
    '#env-vid::-webkit-media-controls-panel-container,',
    '#env-vid::-webkit-media-controls-overlay-play-button,',
    '#env-vid::-webkit-media-controls-start-playback-button,',
    '#env-vid::-webkit-media-controls-play-button,',
    '#env-vid::-webkit-media-controls-timeline,',
    '#env-vid::-webkit-media-controls-current-time-display,',
    '#env-vid::-webkit-media-controls-time-remaining-display,',
    '#env-vid::-webkit-media-controls-mute-button,',
    '#env-vid::-webkit-media-controls-volume-slider,',
    '#env-vid::-webkit-media-controls-fullscreen-button,',
    '#env-vid::-webkit-media-controls-toggle-closed-captions-button{',
    '  display:none!important;-webkit-appearance:none!important;',
    '  opacity:0!important;pointer-events:none!important}',
    '#env-vid::-internal-media-controls-overlay-cast-button{display:none!important}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(sinControles);

  /* ---- LOS TEXTOS DE LA PORTADA, RETENIDOS ---- */
  (function cssDatos() {
    var s = document.createElement('style');
    s.id = 'col-sobre-datos';
    s.textContent = [
      'html.inv-datos-esperan .portada .c,',
      'html.inv-datos-esperan .portada .scrollcue{opacity:0!important}',
      '.portada .c,.portada .scrollcue{transition:opacity .75s ease}',
      'html.inv-datos-esperan .portada .pbg{transform:scale(1.045)}',
      '.portada .pbg{transition:transform 1.1s cubic-bezier(.22,.72,.28,1)}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  })();

  var destrabado = false;
  function retenerDatos() {
    if (destrabado) return;
    document.documentElement.classList.add('inv-datos-esperan');
    setTimeout(soltarDatos, TOPE);
  }
  function soltarDatos() {
    destrabado = true;
    document.documentElement.classList.remove('inv-datos-esperan');
  }

  (function frenarAutoplay() {
    var v = document.getElementById('env-vid');
    if (!v) { setTimeout(frenarAutoplay, 20); return; }
    try {
      v.removeAttribute('autoplay');
      v.removeAttribute('controls');
      v.autoplay = false;
      v.controls = false;
      v.pause();
      v.currentTime = 0;
    } catch (e) {}
  })();

  function sacarTapa() {
    if (tapa && tapa.parentNode) tapa.parentNode.removeChild(tapa);
    tapa = null;
  }

  function estilo(color) {
    var st = document.getElementById('col-sobrecat-css');
    if (!st) {
      st = document.createElement('style');
      st.id = 'col-sobrecat-css';
      document.head.appendChild(st);
    }

    var cajaAlto  = 'min(100vh, calc(100vw * 16 / 9))';
    var cajaAncho = 'min(100vw, calc(100vh * 9 / 16))';
    var dAlto     = 'min(84vh, 843px)';
    var dAncho    = 'calc(' + dAlto + ' * 9 / 16)';

    st.textContent = [
      '#env.carta-video > *{visibility:hidden}',
      '#env.carta-video #env-vid,',
      '#env.carta-video #col-sobre-carta,',
      '#env.carta-video #col-sobre-foto,',
      '#env.carta-video #col-sobre-velo,',
      '#env.carta-video .vhint{visibility:visible!important}',

      '#env.carta-video{background:' + color + '!important;cursor:pointer;',
      '  transition:opacity .6s ease,visibility .6s ease}',

      '#env.carta-video #env-vid{display:block!important;',
      '  position:fixed;inset:0;width:100%;height:100%;',
      '  object-fit:contain;background:' + color + ';',
      '  opacity:0;transition:opacity .45s ease;pointer-events:none}',
      '#env.carta-video.puesto #env-vid{opacity:1}',

      /* ⚠️⚠️ EN MODO SOLAPAS EL VIDEO SE APAGA POR CSS. Sin esto queda un
         <video> VACÍO con z-index 2 y forma de tarjeta tapando todo. */
      '#env.carta-video[data-apertura="solapas"] #env-vid{display:none!important}',

      /* ---------- APERTURA POR SOLAPAS: SE ABRE POR ARRIBA ---------- */
      '#col-sobre-foto{position:fixed;left:50%;top:50%;',
      '  transform:translate(-50%,-50%);',
      '  height:' + cajaAlto + ';width:' + cajaAncho + ';',
      '  perspective:1400px;pointer-events:none;z-index:6;',
      '  opacity:0;transition:opacity .45s ease}',
      '#env.carta-video.puesto #col-sobre-foto{opacity:1}',

      '#col-sobre-foto .hoja{position:absolute;inset:0;',
      '  background-position:center;background-size:100% 100%;',
      '  background-repeat:no-repeat;',
      '  transition:transform ' + SOLAPAS + 's cubic-bezier(.36,.02,.2,1),',
      '             filter ' + SOLAPAS + 's ease}',

      /* el CUERPO del sobre: no se mueve */
      '#col-sobre-foto .h-izq{clip-path:polygon(0 0,' +
        EJE.x + '% ' + EJE.y + '%,0 100%)}',
      '#col-sobre-foto .h-derecha{clip-path:polygon(100% 0,100% 100%,' +
        EJE.x + '% ' + EJE.y + '%)}',
      '#col-sobre-foto .h-abajo{clip-path:polygon(0 100%,' +
        EJE.x + '% ' + EJE.y + '%,100% 100%)}',

      /* ★ LA SOLAPA QUE SE LEVANTA: la de arriba, con bisagra en el borde
           superior. Es la única que se mueve. Ver la nota del encabezado. */
      '#col-sobre-foto .h-arriba{clip-path:polygon(0 0,100% 0,' +
        EJE.x + '% ' + EJE.y + '%);',
      '  transform-origin:center top}',
      '#env.carta-video.abriendo #col-sobre-foto .h-arriba{',
      '  transform:rotateX(148deg);filter:brightness(.88)}',

      '@media (min-width:680px){',
      '  #col-sobre-foto,#col-sobre-carta{height:' + dAlto + ';width:' + dAncho + ';',
      '    border-radius:30px;overflow:hidden;',
      '    box-shadow:0 32px 74px rgba(40,28,12,.34)}',
      '}',

      '#col-sobre-velo{position:fixed;inset:0;z-index:8;pointer-events:none;',
      '  background:' + color + ';opacity:0;',
      '  transition:opacity ' + FUNDIDO + 's ease-in}',
      '#env.carta-video.fundiendo #col-sobre-velo{opacity:1}',

      '#env.carta-video.revelando{opacity:0!important;',
      '  transition:opacity ' + FUNDIDO + 's ease-in!important}',
      '#env.carta-video.revelando #col-sobre-velo{opacity:0!important}',

      '#env.carta-video .vhint{display:block!important;',
      '  position:fixed;left:50%;bottom:34px;transform:translateX(-50%);z-index:10;',
      '  font-family:Montserrat,sans-serif;font-size:10px;font-weight:500;',
      '  letter-spacing:.22em;text-transform:uppercase;',
      '  color:rgba(60,52,44,.62);text-align:center;pointer-events:none;',
      '  opacity:0;transition:opacity .45s ease}',
      '#env.carta-video.puesto .vhint{opacity:1}',
      '#env.carta-video.abriendo .vhint{opacity:0}',

      /* ★★ SOBRE MAESTRO (data-solapa="1") ------------------------------------
         La solapa es una imagen aparte con transparencia, así que NO se recorta
         con clip-path: su propio alfa le da la forma, y el lacre viaja con ella.
         El cuerpo es UNA sola hoja con la MUESCA del triángulo, y por esa
         muesca se ve la tarjeta.
         Y al final el sobre BAJA y se va por abajo del cuadro, que es lo que
         hace la referencia: la tarjeta no sube, el sobre se cae. */
      '#env.carta-video[data-solapa="1"] #col-sobre-foto .h-izq,',
      '#env.carta-video[data-solapa="1"] #col-sobre-foto .h-derecha{display:none}',
      '#env.carta-video[data-solapa="1"] #col-sobre-foto .h-abajo{',
      '  clip-path:polygon(0 0,0 100%,100% 100%,100% 0,' +
        EJE.x + '% ' + EJE.y + '%,0 0)}',

      /* ⚠️ LA SOLAPA SE DIBUJA CON LA MISMA REGLA QUE EL CUERPO
         (`100% 100%`, que hereda de `.hoja`). Estuvo un rato con
         `background-size:100% auto` y el archivo recortado a 768x810: como
         el cuerpo se estira a la caja y la solapa conservaba su proporción,
         la solapa quedaba **3 px más abajo en la punta**. Eso alcanzaba
         para que el doblez se viera DOBLE y el sobre pareciera dos fotos
         pegadas una arriba de la otra. Maki lo vio: «se nota el que está
         arriba». Por eso el archivo de la solapa va al lienzo COMPLETO
         (768x1376, con todo lo de abajo transparente). */
      '#env.carta-video[data-solapa="1"] #col-sobre-foto .h-arriba{',
      '  clip-path:none;transform-origin:center top;',
      '  backface-visibility:hidden}',
      '#env.carta-video[data-solapa="1"].abriendo #col-sobre-foto .h-arriba{',
      '  transform:rotateX(' + GIRO + 'deg);filter:brightness(.80)}',
      '#env.carta-video[data-solapa="1"] #col-sobre-foto{',
      '  transition:opacity .45s ease,',
      '             transform ' + CAIDA + 's cubic-bezier(.55,0,.85,.25) ' + ESPERA + 's}',
      '#env.carta-video[data-solapa="1"].abriendo #col-sobre-foto{',
      '  transform:translate(-50%,-50%) translateY(126%) scale(1.14)}',

      /* ★★ LA TARJETA — Y POR QUÉ VA AFUERA DEL SOBRE  (4/9/2026)
         Es la portada real de la invitación, oscurecida como si estuviera
         adentro del sobre, y se va iluminando a medida que la solapa se
         levanta. Por la muesca del cuerpo se la ve.

         ⚠️ NO ES HIJA DE `#col-sobre-foto`. Al principio sí lo era, y Maki
            lo cazó enseguida: «la foto de ellos se va para abajo con el
            sobre y desaparece, y la otra no desaparece». Claro: si cuelga
            del sobre, hereda su `translateY` y se cae con él. En la
            referencia pasa exactamente al revés — **el sobre se va y la
            tarjeta se queda**. Por eso vive en su propia capa fija, con la
            misma geometría y un z-index más bajo. */
      '#col-sobre-carta{position:fixed;left:50%;top:50%;',
      '  transform:translate(-50%,-50%);',
      '  height:' + cajaAlto + ';width:' + cajaAncho + ';',
      '  pointer-events:none;z-index:5;overflow:hidden;',
      '  opacity:0;transition:opacity .45s ease}',
      '#env.carta-video.puesto #col-sobre-carta{opacity:1}',
      '#col-sobre-carta .h-fondo{position:absolute;inset:0;',
      '  background-size:cover;background-position:center;',
      '  background-repeat:no-repeat;',
      '  transform:scale(.90);filter:brightness(.42);',
      '  transition:filter ' + SOLAPAS + 's ease,',
      '             transform ' + (ESPERA + CAIDA) + 's cubic-bezier(.22,.72,.28,1)}',
      '#env.carta-video.abriendo #col-sobre-carta .h-fondo{',
      '  transform:scale(1);filter:brightness(1)}'
    ].join('\n');
  }

  /* la foto de la portada, tal como la pintó el motor. Puede tardar en
     estar: se reintenta hasta que aparece. */
  function fotoPortada() {
    try {
      var p = document.querySelector('.portada .pbg');
      if (!p) return '';
      var b = getComputedStyle(p).backgroundImage || '';
      return (b && b !== 'none') ? b : '';
    } catch (e) { return ''; }
  }
  /* ⚠️ NO ALCANZA CON AGARRAR LA PRIMERA QUE APAREZCA: el motor pinta una
     foto provisoria y después la cambia por la de verdad. Si nos quedamos
     con la primera, adentro del sobre se ve una foto que no es. Así que se
     sigue mirando hasta que el invitado abre, o unos segundos. */
  function ponerFondo() {
    var f = document.querySelector('#col-sobre-carta .h-fondo');
    if (!f || f.getAttribute('data-mirando') === '1') return;
    f.setAttribute('data-mirando', '1');
    var n = 0;
    (function mirar() {
      var b = fotoPortada();
      if (b && f.style.backgroundImage !== b) f.style.backgroundImage = b;
      var env = document.getElementById('env');
      var abriendo = env && env.classList.contains('abriendo');
      if (++n < 60 && !abriendo) setTimeout(mirar, 150);
      else f.removeAttribute('data-mirando');
    })();
  }

  function montarSolapas(env, url, solapaUrl) {
    var caja = document.getElementById('col-sobre-foto');
    if (!caja) {
      caja = document.createElement('div');
      caja.id = 'col-sobre-foto';
      /* la de arriba va ÚLTIMA: es la que se levanta y tiene que quedar
         dibujada encima de las otras tres */
      ['h-izq', 'h-derecha', 'h-abajo', 'h-arriba'].forEach(function (c) {
        var h = document.createElement('div');
        h.className = 'hoja ' + c;
        caja.appendChild(h);
      });
      env.appendChild(caja);
    }
    var css = 'url("' + String(url).replace(/"/g, '%22') + '")';
    [].forEach.call(caja.querySelectorAll('.hoja'), function (h) {
      if (h.style.backgroundImage !== css) h.style.backgroundImage = css;
    });

    /* ★ SOBRE MAESTRO: la solapa es SU PROPIA imagen, con transparencia.
       Así el lacre viaja pegado a la solapa en vez de partirse al medio.
       Sin `solapaUrl` todo sigue exactamente como estaba. */
    var arriba = caja.querySelector('.h-arriba');
    if (solapaUrl && arriba) {
      var cs = 'url("' + String(solapaUrl).replace(/"/g, '%22') + '")';
      if (arriba.style.backgroundImage !== cs) arriba.style.backgroundImage = cs;
      /* la tarjeta va en SU PROPIA capa, hermana del sobre y por debajo:
         así el sobre se cae y ella se queda. Ver la nota del CSS. */
      if (!document.getElementById('col-sobre-carta')) {
        var carta = document.createElement('div');
        carta.id = 'col-sobre-carta';
        var f = document.createElement('div');
        f.className = 'h-fondo';
        carta.appendChild(f);
        env.insertBefore(carta, caja);
      }
      ponerFondo();
      env.dataset.solapa = '1';
    } else {
      if (env.dataset.solapa) env.removeAttribute('data-solapa');
      var vieja = document.getElementById('col-sobre-carta');
      if (vieja && vieja.parentNode) vieja.parentNode.removeChild(vieja);
    }
  }

  function actualizar(m, id) {
    var env = document.getElementById('env');
    var vid = document.getElementById('env-vid');
    if (!env || !vid) return false;
    if (env.classList.contains('abriendo')) return false;

    if (m.eje && typeof m.eje.x === 'number') { EJE = { x: m.eje.x, y: m.eje.y }; }
    estilo(m.color || '#f4f2ee');
    env.dataset.empalme = (m.empalme === 'foto') ? 'foto' : 'blanco';
    env.dataset.apertura = (m.apertura === 'solapas') ? 'solapas' : 'video';

    if (env.dataset.apertura === 'solapas') {
      montarSolapas(env, m.poster || '', m.solapa || '');
    } else {
      vid.setAttribute('poster', m.poster || '');
      if (vid.getAttribute('src') !== m.video) {
        vid.setAttribute('src', m.video);
        try { vid.load(); vid.pause(); vid.currentTime = 0; } catch (e) {}
      }
    }
    armadoModelo = id;
    return true;
  }

  function armar(m, id) {
    var env = document.getElementById('env');
    var vid = document.getElementById('env-vid');
    if (!env || !vid) return false;

    var color = m.color || '#f4f2ee';
    if (m.eje && typeof m.eje.x === 'number') { EJE = { x: m.eje.x, y: m.eje.y }; }
    estilo(color);

    env.className = 'carta-video';
    env.dataset.empalme = (m.empalme === 'foto') ? 'foto' : 'blanco';
    env.dataset.apertura = (m.apertura === 'solapas') ? 'solapas' : 'video';

    ['tri-seal', 'e-back', 'e-pocket', 'e-flap'].forEach(function (id2) {
      var n = document.getElementById(id2);
      if (n && n.parentNode) n.parentNode.removeChild(n);
    });
    [].forEach.call(env.querySelectorAll('.triflap'), function (n) {
      if (n.parentNode) n.parentNode.removeChild(n);
    });

    var porSolapas = env.dataset.apertura === 'solapas';

    vid.removeAttribute('autoplay');
    vid.removeAttribute('controls');
    vid.autoplay = false;
    vid.controls = false;

    if (porSolapas) {
      try { vid.pause(); vid.removeAttribute('src'); vid.load(); } catch (e) {}
      montarSolapas(env, m.poster || '', m.solapa || '');
    } else {
      vid.style.display = '';
      vid.setAttribute('poster', m.poster || '');
      vid.setAttribute('playsinline', '');
      vid.setAttribute('webkit-playsinline', '');
      vid.setAttribute('disablepictureinpicture', '');
      vid.setAttribute('controlslist', 'nodownload noplaybackrate nofullscreen noremoteplayback');
      vid.muted = true;
      vid.loop = false;
      vid.preload = 'auto';
      if (vid.getAttribute('src') !== m.video) vid.setAttribute('src', m.video);
      try { vid.load(); vid.pause(); vid.currentTime = 0; } catch (e) {}
    }

    var velo = document.getElementById('col-sobre-velo');
    if (!velo) {
      velo = document.createElement('div');
      velo.id = 'col-sobre-velo';
      env.appendChild(velo);
    }

    var hint = env.querySelector('.vhint');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'vhint';
      env.appendChild(hint);
    }
    hint.textContent = 'Toca para abrir';

    sacarTapa();
    setTimeout(function () { env.classList.add('puesto'); }, 30);

    function esFoto()    { return env.dataset.empalme  === 'foto'; }
    function esSolapas() { return env.dataset.apertura === 'solapas'; }

    var abierto = false;
    function entrar() {
      if (abierto) return;
      abierto = true;
      try { if (typeof abrir === 'function') abrir(); } catch (e) {}
      env.classList.add('gone');
      env.style.opacity = '0';
      env.style.visibility = 'hidden';
      setTimeout(soltarDatos, esFoto() ? DATOS : 0);
    }

    var fundiendo = false;
    function fundir() {
      if (fundiendo) return;
      if (!env.classList.contains('abriendo')) return;
      fundiendo = true;
      if (esFoto()) {
        retenerDatos();
        env.classList.add('revelando');
      } else {
        env.classList.add('fundiendo');
      }
      setTimeout(entrar, FUNDIDO * 1000);
    }

    vid.addEventListener('timeupdate', function () {
      if (esSolapas()) return;
      if (!vid.duration || !isFinite(vid.duration)) return;
      if (vid.currentTime >= vid.duration - ANTES) fundir();
    });
    vid.addEventListener('ended', function () { if (!esSolapas()) fundir(); });

    function tocar() {
      if (env.classList.contains('abriendo')) return;
      env.classList.add('abriendo');

      if (esSolapas()) {
        var esperaFin = (env.dataset.solapa === '1')
          ? (ESPERA + CAIDA + 0.15) : SOLAPAS;
        setTimeout(fundir, esperaFin * 1000);
        return;
      }

      var dur = (vid.duration && isFinite(vid.duration)) ? vid.duration : 5;
      setTimeout(fundir, (dur + 1.5) * 1000);
      var p = null;
      try { vid.currentTime = 0; p = vid.play(); } catch (err) {}
      if (p && p.catch) p.catch(function () { fundir(); });
    }

    function alTocar(e) {
      if (abierto) return;
      if (!env.contains(e.target) && e.target !== env) return;
      e.stopPropagation();
      if (e.preventDefault) e.preventDefault();
      tocar();
    }
    document.addEventListener('click', alTocar, true);
    document.addEventListener('touchend', alTocar, true);

    vid.addEventListener('error', function () {
      if (!esSolapas() && env.classList.contains('abriendo')) fundir();
    });

    armadoModelo = id;
    return true;
  }

  /* ---- 2. ATAJO: pone algo al instante, pero NO cierra el tema ---- */
  (function atajo() {
    if (listo) return;
    var id = recordado();
    var m = delCatalogo(id);
    if (!m) { if (!catalogo()) setTimeout(atajo, 40); return; }
    if (armar(m, id)) listo = true;
  })();

  function revisar() {
    var s = sobre();
    var cat = catalogo();
    var hayDato = !!(cat && s && Object.keys(s).length);

    if (listo) {
      if (!hayDato) return false;
      var esCarta = String(s.tipo || '') === 'carta';
      recordar(esCarta ? s.modelo : '');
      var real = esCarta ? delCatalogo(s.modelo) : null;
      if (real && s.modelo !== armadoModelo) actualizar(real, s.modelo);
      return true;
    }

    if (!hayDato) return false;

    var m = elegido();
    recordar(m ? s.modelo : '');
    if (!m) { sacarTapa(); listo = true; return true; }
    if (armar(m, s.modelo)) { listo = true; return true; }
    return false;
  }

  var n = 0;
  var t = setInterval(function () {
    if (revisar() || ++n > 120) { clearInterval(t); sacarTapa(); }
  }, 60);
  revisar();
})();
