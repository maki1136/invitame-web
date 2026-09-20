/* ===== COLECCIÓN «DISCO» ====================================================

   La primera colección OSCURA. Nace de la muestra de XV de Lupita: bolas de
   espejos, plata sobre negro. Maki, 19/9/2026, mirando la primera versión:

     «quedó como el orto»
     «pero mirá bien los colores de los textos, le pifiaste feo ahí»

   Y tenía razón. Medidos los textos que se veían en pantalla, había CATORCE
   colores distintos y tres familias peleando:

     8 veces  rgb(63,88,120)    azul acero      · subtítulos de los lugares
     6 veces  rgb(231,221,200)  crema cálido    · «MIS XV AÑOS», la cuenta regresiva
     3 veces  rgb(126,112,157)  lila            · nombres de los lugares
     3 veces  rgb(102,102,102)  gris suelto     · los nombres de Personas
     1 vez    rgb(47,42,38)     marrón          · «MAY 2027»

   Azul, lila, crema y marrón adentro de una invitación que tiene que ser plata
   y grafito. El error de fondo fue meter una temática NEGRA en el molde claro
   que funciona para playa y perlas: gris sucio en todas las secciones.

   ⚠️ POR QUÉ ESTO ES UNA COLECCIÓN Y NO UNA PALETA
   De las 20 paletas del catálogo no hay ninguna de plata y grafito, y además
   `efectos/paleta.js` reescribe sus variables cada 1,5 s con `!important` en el
   `<html>`: ninguna hoja de estilo le gana. El camino que ya dejó resuelto
   Marfil es publicar `window.INVCOLPALETA` con las variables que son SUYAS, y
   la paleta las pinta con ESE valor. Es la única forma de no pelearse con ella.

   ⚠️ LA COLECCIÓN DISFRAZA EL MOTOR, NO DIBUJA UNA INVITACIÓN NUEVA
   Todo es reversible y NO SACA NINGUNA SECCIÓN. Se apaga y la invitación vuelve
   intacta.

   ★ SE PRENDE con `INVEV.fx.coleccion = 'disco'`.
   ============================================================================ */
(function () {
  'use strict';

  var ID = 'disco';

  /* ---- LA FAMILIA. UNA SOLA. -----------------------------------------------
     Medida contra el papel: la plata sobre grafito da 11,8:1, y el grafito
     sobre plata (el texto adentro de los botones) 11,8:1 también. Las bajadas
     en plata media dan 6,1:1. Los tres pasan WCAG AA holgados. */
  var PAPEL   = '#15141A';   /* grafito casi negro, apenas frío */
  var PAPEL2  = '#1E1C25';   /* el papel, un tono más claro */
  var PLATA   = '#E6E4EE';   /* el principal: títulos, botones, bocina */
  var PLATA2  = '#A8A5B6';   /* bajadas y datos */
  var PLATA3  = '#6E6B7C';   /* filetes y bordes */
  var BRILLO  = '#F7F6FA';   /* el destello de las facetas */

  /* ⚠️ LOS ACENTOS TAMBIÉN SON DE LA COLECCIÓN.
     Marfil ya pagó esta: si se le dejan `--sage`, `--sage-cl` y `--oro` a la
     paleta elegida, el nombre del lugar sale violeta adentro de una invitación
     que es plata. Acá pasó igual con `azul-noche-plata`. Disco se los queda. */
  var PALETA_PROPIA = {
    '--verde':     PLATA,    /* el principal: títulos, botones, bocina */
    '--verde2':    PLATA2,   /* su versión apagada, para los degradés */
    '--muted':     PLATA2,   /* bajadas y datos */
    '--cream':     PAPEL,    /* el texto que va ARRIBA del principal */
    '--lino':      PAPEL,    /* el papel */
    '--lino2':     PAPEL2,   /* el papel, un tono más claro */
    '--sec-col-v': PAPEL2,   /* el color de sector */
    '--sage':      PLATA2,   /* acento 1 */
    '--sage-cl':   PLATA3,   /* acento 2 */
    '--oro':       BRILLO,   /* acento 3 — plata brillante, nunca dorado */

    /* ⚠️⚠️ LAS OCHO QUE FALTABAN. MEDIDAS EN VIVO EL 19/9/2026.
       Con las diez de arriba solamente, la invitación seguía siendo un gris
       sucio, y yo lo estaba peleando con `!important` a los martillazos sin
       entender por qué. La razón, leída del `<html>` de lupita-mis15:

         --sec-col: #e7e9ec !important    ← LAS BANDAS DE TODAS LAS SECCIONES
         --tl-papel: #fbf9f5              ← el papel del itinerario
         --cf-sobre: #E9E7EF              ← EL SOBRE DE LA CARTA (el marfil
                                            con damasco que Maki marcó)
         --sobre-c / --flap-base: #FBFBFA ← el sobre y su solapa

       Ninguna estaba en la tabla, así que se las quedaba la temática de la
       muestra: superficies CLARAS abajo de una invitación NEGRA. No era la
       colección peleándose con la paleta — era la colección sin reclamar
       las variables que de verdad pintan el papel.

       REGLA: una colección oscura tiene que quedarse con TODA superficie,
       no sólo con los colores de letra. */
    '--sec-col':   PAPEL,    /* las bandas de sección */
    '--tl-papel':  PAPEL2,   /* el papel del itinerario */
    '--tl-tinta':  PLATA,    /* la tinta del itinerario */
    '--cf-sobre':  PAPEL2,   /* el sobre de la carta */
    '--cf-col':    PLATA,    /* la letra adentro de la carta */
    '--sobre-c':   PAPEL2,   /* el sobre */
    '--flap-base': PAPEL2,   /* su solapa */
    '--seal-c':    PLATA2    /* el lacre */
  };

  /* ---- la hoja de estilo ---------------------------------------------------
     ⚠️ Sólo las superficies que están CLAVADAS en blanco y que la paleta no
     alcanza. Medidas en vivo el 19/9/2026 sobre lupita-mis15:
       .evento    rgb(250,251,252)   las tarjetas de ceremonia y fiesta
       .hotel     rgba(255,255,255,.55)
       .pasecard  rgb(246,243,237)   el pase con el QR
       .scratchcard rgb(246,243,237) la raspadita
       .rd-tapa   rgb(246,243,237)   la tapa del video y de la playlist
     El resto (.sec, .sec.verde, .e-tint, .cf-*-tint, body.tex-lino) sale de la
     paleta y ya queda bien con la tabla de arriba.

     ⚠️ `#dc-nada` no existe: está para subirle el peso a la regla sin tener que
     perseguir clases. Es el truco que ya usa Marfil. */
  /* el ancla de peso: los DOS atributos que pone la coleccion en el marco */
  var P = 'html[data-col="' + ID + '"][data-coleccion="' + ID + '"] ';

  var CSS = [
    ':is(#dc-nada, .evento), :is(#dc-nada, .hotel), :is(#dc-nada, .pasecard),',
    ':is(#dc-nada, .scratchcard), :is(#dc-nada, .rd-tapa), :is(#dc-nada, .col-vtapa){',
    '  background-color:' + PAPEL2 + '!important;',
    '  border:1px solid rgba(230,228,238,.22)!important;',
    '  box-shadow:0 1px 0 rgba(230,228,238,.10) inset, 0 10px 28px rgba(0,0,0,.45)!important;',
    '}',
    /* el texto adentro de esas tarjetas */
    ':is(#dc-nada, .evento) *, :is(#dc-nada, .hotel) *, :is(#dc-nada, .pasecard) *{',
    '  color:' + PLATA + ';',
    '}',
    ':is(#dc-nada, .evento) .sub, :is(#dc-nada, .evento) .addr,',
    ':is(#dc-nada, .hotel) .sub{ color:' + PLATA2 + '!important; }',
    /* ⚠️ EL BOTÓN QUE NO SE LEÍA. Medido: texto rgb(247,233,230) sobre un botón
       claro. Ahora el botón es grafito con filete de plata y la letra plata. */
    /* ⚠⚠ LA TRAMPA DE LA ESPECIFICIDAD, MEDIDA EL 20/9/2026.
       El estilo de boton del motor es:
         [data-boton="lacre"] :is(.btn, #btn-ingresar, .wsp, .tv-btn, ...)
       Ese :is() TIENE UN #id ADENTRO. Un :is() pesa lo que su argumento MAS
       pesado, asi que la regla entera vale (1,1,0) — para TODA la lista, no
       solo para el boton con id. Mi regla valia (1,0,0) y perdia: los botones
       seguian con la letra crema rgb(247,233,230) del estilo lacre, ilegible
       sobre plata. Era el «VER MAPA no se lee».
       Se gana anclando en los dos atributos del marco: (1,2,1).
       Tambien se pisa -webkit-text-fill-color, que es lo que pinta de verdad
       la letra cuando el motor lo usa. */
    P + ':is(#dc-nada, .btn),',
    P + ':is(#dc-nada, .acc-btn),',
    P + ':is(#dc-nada, .wsp),',
    P + ':is(#dc-nada, .tv-btn),',
    P + ':is(#dc-nada, .inv-prev-btn),',
    P + ':is(#dc-nada, #btn-ingresar){',
    '  background-image:none!important;',
    '  background-color:' + PAPEL2 + '!important;',
    '  color:' + PLATA + '!important;',
    '  -webkit-text-fill-color:' + PLATA + '!important;',
    '  border:1px solid rgba(230,228,238,.35)!important;',
    '  text-shadow:none!important;',
    '}',
    /* la raspadita y el pase, por dentro */
    ':is(#dc-nada, .scratchcard) *, :is(#dc-nada, .pasecard) *{ color:' + PLATA + '; }',
    /* la tarjeta del clima, que nace blanca con letra oscura */
    ':is(#dc-nada, .clima-card){ background:' + PAPEL2 + '!important; color:' + PLATA + '!important; }',
    ':is(#dc-nada, .clima-card) *{ color:' + PLATA + '!important; }',
    /* ⚠⚠ EL CIELO DEL AMBIENTE. MEDIDO EL 20/9/2026.
       `fx.ambiente` tipo `nubes` dibuja SIEMPRE la misma foto, /i/cielo: un
       cielo DIURNO, blanco. Los colores de la tematica (colorTop/colorBot) no
       los usa para nada. Prendido en una invitacion negra pintaba una banda
       blanca gigante en el itinerario, la que se veia en la captura de Maki.
       La skill de armado pide el ambiente PRENDIDO con los colores de ESA
       tematica, asi que la coleccion le da el suyo: noche con destellos de
       plata, dibujado, sin pedir una foto nueva. */
    P + ':is(#dc-nada, .ambiente) .sky{',
    '  background-image:',
    '    radial-gradient(1.6px 1.6px at 18% 12%, rgba(230,228,238,.85), transparent 60%),',
    '    radial-gradient(1.2px 1.2px at 62% 26%, rgba(230,228,238,.70), transparent 60%),',
    '    radial-gradient(2px 2px at 81% 9%, rgba(247,246,250,.90), transparent 60%),',
    '    radial-gradient(1.3px 1.3px at 34% 47%, rgba(230,228,238,.60), transparent 60%),',
    '    radial-gradient(1.7px 1.7px at 73% 61%, rgba(230,228,238,.75), transparent 60%),',
    '    radial-gradient(1.1px 1.1px at 12% 74%, rgba(230,228,238,.55), transparent 60%),',
    '    radial-gradient(2.2px 2.2px at 49% 86%, rgba(247,246,250,.80), transparent 60%),',
    '    radial-gradient(1.4px 1.4px at 90% 92%, rgba(230,228,238,.65), transparent 60%),',
    '    radial-gradient(120% 70% at 50% 0%, rgba(168,165,182,.16), transparent 62%),',
    '    linear-gradient(180deg, ' + PAPEL + ' 0%, ' + PAPEL2 + ' 55%, #2A2733 100%)!important;',
    '  background-size:auto!important; background-repeat:no-repeat!important;',
    '  opacity:1!important; filter:none!important;',
    '}',
    /* ⚠⚠ LAS FOTOS DE LUGAR, EN TONO. MEDIDO EL 20/9/2026 MIRANDO.
       El hotel venia en naranja y azul de atardecer, y la iglesia en dorado:
       peleaban de frente con el negro y plata. Cloudinary no aplica
       transformaciones en esta cuenta (cambia el tamano pero ignora el efecto)
       y Adobe solo acepta dominios de su lista, asi que el tratamiento va
       donde corresponde: en la coleccion, en CSS, y se va solo al apagarla.
       NO toca la galeria: esas fotos ya son de la tematica. */
    P + ':is(#dc-nada, .ph),',
    P + ':is(#dc-nada, .sec) > img,',
    P + ':is(#dc-nada, .sec) .hotel img{',
    '  filter:grayscale(.88) contrast(1.06) brightness(.92);',
    '}',
    /* el papel del marco */
    /* ⚠️ EL BANDEJON DEL PASE. La regla del motor es `.pase{background:var(--verde)}`,
       y en Disco `--verde` ES LA PLATA: la banda entera salia clara. */
    ':is(#dc-nada, section.pase){ background:' + PAPEL + '!important; color:' + PLATA + '!important; }',
    /* ⚠⚠ EL COLOR DE LETRA DE LA TARJETA, NO SOLO EL DE SUS HIJOS.
       Medido el 20/9/2026 con la coleccion prendida: .pasecard heredaba
       rgb(21,20,26) y .scratchcard, .tl y .rd-tapa rgb(58,69,61) — oscuro
       sobre oscuro. La regla `.tarjeta *` NO alcanza al elemento mismo. */
    ':is(#dc-nada, .pasecard), :is(#dc-nada, .scratchcard), :is(#dc-nada, .tl),',
    ':is(#dc-nada, .rd-tapa), :is(#dc-nada, .padres), :is(#dc-nada, .col-vtapa){',
    '  color:' + PLATA + '!important;',
    '}',
    ':is(#dc-nada, .tl), :is(#dc-nada, .padres){ background-color:rgba(30,28,37,.72)!important; }',
    'html[data-col="' + ID + '"] body{ background-color:' + PAPEL + '!important; }'
  ].join('\n');

  /* ---- prender y apagar ---------------------------------------------------- */
  function activa() {
    try {
      var ev = window.INVEV || {};
      return !!(ev.fx && String(ev.fx.coleccion || '').toLowerCase() === ID);
    } catch (e) { return false; }
  }

  function hoja() {
    var s = document.getElementById('col-' + ID);
    if (!s) {
      s = document.createElement('style');
      s.id = 'col-' + ID;
      document.head.appendChild(s);
    }
    if (s.textContent !== CSS) s.textContent = CSS;
  }

  function sacarHoja() {
    var s = document.getElementById('col-' + ID);
    if (s) s.parentNode.removeChild(s);
  }

  /* ⚠️⚠️ QUE LAS REGLAS DURAS VUELVAN A MEDIR. MEDIDO EL 19/9/2026.
     `reglas-duras.js` mira el color que hay DEBAJO de cada texto y le escribe
     el color de letra en el ATRIBUTO `style`, con `!important`:

       color: rgb(20,18,18) !important;
       -webkit-text-fill-color: rgb(20,18,18) !important;
       text-shadow: rgba(255,255,255,.55) 0 1px 2px !important;

     Un estilo en línea con `!important` le gana a CUALQUIER hoja, incluso a
     una hoja con `!important`. Y como las reglas duras miden ANTES de que la
     colección oscurezca las superficies, dejan escrito «esto va casi negro
     con halo blanco» sobre tarjetas que un segundo después son grafito: 115
     textos negros sobre negro. Eso, y no otra cosa, era el «color con color».

     No se toca el motor: las reglas duras firman lo que pintan con
     `data-regla-luz`, así que alcanza con BORRARLES LA FIRMA una sola vez,
     cuando la colección se prende. En el siguiente repaso vuelven a medir —
     ahora contra el grafito — y pintan plata ellas solas.

     ⚠️ UNA SOLA VEZ, cuando PASA de apagada a prendida. Si se hiciera en cada
     repaso, se estaría borrando y repintando doce veces cada diez segundos.
     `data-regla-inline` = 1 marca lo que ya venía escrito a mano: no se toca. */
  function despintarUnaVez() {
    var marco = document.querySelector('.frame');
    if (!marco) return;
    var nodos = marco.querySelectorAll('[data-regla-luz]');
    for (var i = 0; i < nodos.length; i++) {
      var el = nodos[i];
      if (el.getAttribute('data-regla-inline') === '1') continue;
      el.style.removeProperty('color');
      el.style.removeProperty('-webkit-text-fill-color');
      el.style.removeProperty('text-shadow');
      /* ⚠⚠ Y LA OPACIDAD. MEDIDO EL 20/9/2026.
         Cuando el texto tiene una transicion sobre `opacity` (todos los
         titulos la tienen, por el reveal), reglas-duras no puede forzarla a 1:
         entonces DESPEJA el color y deja una opacidad parcial. En «Donde y
         cuando» y «Como va a ser la noche» dejo `opacity: 0.49 !important`
         y `0.5`. Sobre negro eso no es un texto mas suave: es un texto que no
         esta. Borrarsela tambien deja que vuelva a medir contra el grafito, y
         ahi ya no necesita compensar nada. */
      el.style.removeProperty('opacity');
      el.removeAttribute('data-regla-luz');
    }
  }

  var estabaPuesta = false;

  /* ⚠️⚠️ NO ESCRIBIR SI YA ESTÁ ESCRITO. MEDIDO EL 19/9/2026.
     La primera versión hacía `setAttribute('data-col', ID)` en cada repaso, aunque
     el atributo ya valiera lo mismo. Poner un atributo ES una mutación aunque no
     cambie nada, y `reglas-duras.js` corre `pasada()` con CADA cambio de atributo
     del marco: el repaso se disparaba a sí mismo el módulo más caro de la
     invitación, doce veces cada diez segundos. Queda igual, porque está bien —
     pero ojo con la lección de al lado: la caída a 2 fps que le eché la culpa a
     esto NO era esto. Era la ventana de Chrome MINIMIZADA. Ver la skill del
     banco de pruebas: una ventana minimizada no dibuja ni un cuadro, `rAF` no
     corre nunca y la medición da 0 sin que nada esté roto. Medidos 60,3 fps con
     la colección prendida, los dos videos andando y las nubes encima. */
  function poner() {
    var raiz = document.documentElement;
    if (raiz.getAttribute('data-col') !== ID) raiz.setAttribute('data-col', ID);
    /* ⚠⚠ EL GANCHO QUE EL MOTOR YA TENIA Y YO NO ESTABA USANDO.
       17 reglas del motor estan escritas como `html:not([data-coleccion]) ...`
       y son justo los defaults CLAROS: la raspadita, el pase, el QR, el
       itinerario, la tapa del video y Personas. Poniendo el atributo se apagan
       solas, como esta previsto, en vez de taparlas a martillazos. */
    if (raiz.getAttribute('data-coleccion') !== ID) raiz.setAttribute('data-coleccion', ID);
    if (window.INVCOLPALETA !== PALETA_PROPIA) window.INVCOLPALETA = PALETA_PROPIA;
    hoja();
    if (!estabaPuesta) {
      estabaPuesta = true;
      /* un respiro para que la paleta ya haya repintado las variables */
      setTimeout(despintarUnaVez, 1800);
      setTimeout(despintarUnaVez, 4000);
    }
  }

  function sacar() {
    if (document.documentElement.getAttribute('data-col') === ID) {
      document.documentElement.removeAttribute('data-col');
      document.documentElement.removeAttribute('data-coleccion');
    }
    if (window.INVCOLPALETA === PALETA_PROPIA) { window.INVCOLPALETA = null; }
    estabaPuesta = false;
    sacarHoja();
  }

  /* ⚠️ NADA DE MutationObserver ACÁ. Ya se pagó el 19/9/2026 con los videos:
     la invitación muta en bucle (reglas-duras.js corre con cada cambio de clase
     del marco), así que un observador dispara decenas de veces por segundo.
     Un repaso cada tanto alcanza y no machaca nada. */
  function sincronizar() {
    if (activa()) { poner(); } else { sacar(); }
  }

  function arrancar() {
    sincronizar();
    setInterval(sincronizar, 1200);
    document.addEventListener('DOMContentLoaded', sincronizar);
    window.addEventListener('load', sincronizar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }

  /* para poder prenderla y apagarla a mano desde la consola, al revisar */
  window.INVDISCO = { poner: poner, sacar: sacar, paleta: PALETA_PROPIA };
})();
