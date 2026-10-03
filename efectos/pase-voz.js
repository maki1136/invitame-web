/* ===== PASE CON VOZ =========================================================
   El boleto arranca ENTERO. La columna del mensaje —la que tiene la onda y el
   play— SE ARRANCA CUANDO EL INVITADO LA TOCA: gira 90° y cae abajo del boleto.

   Cómo se enciende:  INVEV.fx.pasevoz.encendido = true

   ⚠️ EL AUDIO NO SE DESCARGA HASTA QUE ALGUIEN TOCA. `preload="none"`, y la onda
      se dibuja con los 26 números de `fx.pasevoz.onda`, medidos al grabar. El
      invitado que no toca el pase baja CERO bytes. Con mil invitaciones vivas
      esto no es un detalle: es la diferencia entre pagar el ancho de banda de
      todos los invitados o el de los que de verdad escuchan.

   ⚠️ NUNCA autoplay. iOS lo bloquea igual, y la invitación tiene música propia:
      al tocar se pausa lo que esté sonando y se devuelve al terminar.

   ───────────────────────────────────────────────────────────────────────────
   CÓMO SE ENTREGA EL AUDIO  (14/9/2026) — y por qué no es una cuestión de peso

   El archivo se sube tal como lo produjo el navegador de quien grabó. Eso
   significa que **cada anfitriona sube un formato distinto**: Android y Chrome
   dan WebM/Opus, el iPhone da MP4. Y WebM/Opus no es terreno seguro en el
   Safari de un iPhone. Con la mitad de los invitados en iPhone, una anfitriona
   que grabó desde Android dejaba a media fiesta sin escuchar nada — y sin que
   se note: el boleto se arranca igual, la onda está dibujada, y no suena.

   Medido hoy, grabando 4 s de verdad y subiéndolos por el preset unsigned que
   ya usa el formulario (el mismo `INV.uploadVideo`):

       lo que grabó el navegador  WebM/Opus   369 KB por minuto
       ac_aac,br_32k,ar_22050     audio/mp4   274 KB por minuto   200, decodifica
       ac_aac,br_24k,ar_22050     audio/mp4   213 KB por minuto   200, decodifica
       ac_mp3,br_48k              audio/mpeg  361 KB por minuto   200, decodifica

   Las cuatro responden 200 y las cuatro las puede leer el navegador. Así que
   sí: el preset unsigned acepta audio y Cloudinary transcodifica al entregar.
   (Estaba escrito como deducción en la spec; ahora está medido.)

   ⚠️ LA CONVERSIÓN VA ACÁ, EN LA ENTREGA, Y NO AL GUARDAR. Si se hiciera al
      subir, arreglaría sólo los audios nuevos y dejaría rotos los que ya están
      guardados. Acá alcanza a todos, incluidos los que grabó cada invitado por
      su cuenta (`INVGUEST.pasevozAudio`), que son los más variados de todos.

   ⚠️ Y SI LA VERSIÓN LIVIANA NO SE PUEDE BAJAR, SE VUELVE AL ORIGINAL. Una vez,
      sin loop. 369 KB es mejor que silencio.

   ⚠️ 32k y no 24k: es una persona hablándole a sus invitados, no una nota de
      voz apurada. Los 60 KB por minuto de diferencia están bien gastados.

   ───────────────────────────────────────────────────────────────────────────
   LA ROTURA, MEDIDA DEL VIDEO DE MAKI  (4/9/2026)

   Referencia: admit-two.replit.app, grabación de pantalla a 59,95 fps. La mano
   mueve el teléfono, así que TODO se midió relativo al boleto: se siguió el
   boleto con optical flow (LK ida y vuelta, error < 1 px) y se le restó ese
   movimiento a la posición del play.

     · el boleto arranca ENTERO, con la columna pegada a la derecha por una
       perforación de agujeros redondos;
     · EL DEDO BAJA Y LA TOCA: el pulgar la alcanza en 1,699 s y la rotura
       arranca en 1,700. NO se rompe sola;
     · GIRA 90° EN SENTIDO HORARIO — el ▲ del play queda ▶, y la onda pasa de
       vertical a horizontal;
     · se traslada dx −233 px, dy +221 px = −45% / +42% del ancho del boleto;
     · la traslación dura 0,200 s; el giro sigue hasta 1,95 s (0,25 s);
     · la curva FRENA al final: cubic-bezier(.155,.144,.429,.933), rms 0,005.
       Medido p = x^0,874. NO acelera.
     · el play arranca al 93% del ancho del boleto —pegado al borde derecho— y
       termina al 45%.

   Verificado contra la muestra con nuestro propio render: rms 0,007, desvío
   máximo 6 px sobre un recorrido de 322.

   ⚠️⚠️ EL BOLETO NO SE MUEVE. Se queda en −11,3° de principio a fin. La primera
      versión le puso un "tirón" hacia arriba que no existe en la muestra. Es el
      mismo error que ya se había cometido con el sobre: mover lo que se queda.

   ⚠️ LA PIEZA ES UN SOLO ELEMENTO QUE GIRA, no dos dibujos distintos. Por eso
      la onda y el play se dibujan UNA vez, horizontales, y el estado "pegada"
      es ese mismo elemento con `rotate(-90deg)`. El giro hace todo el trabajo:
      la onda se para sola y el ▶ apunta para arriba.

   ⚠️ SE ANIMAN `translate` Y `rotate` POR SEPARADO, no un `transform` solo.
      Están medidos con duraciones distintas (0,20 y 0,25 s) y en un único
      `transform` compartirían la curva. Son propiedades independientes desde
      Safari 14.1; si el navegador es más viejo no anima y aparece ya caída,
      que es un final correcto igual.

   ⚠️ EL PIVOTE ES EL PLAY, no el centro de la tira. Todo el recorrido se midió
      siguiendo el botón de play, así que `transform-origin` va sobre él.
   ========================================================================== */
(function () {
  'use strict';

  var N = 26;                                   /* rayitas de la onda */
  var ABC = '0123456789abcdefghijklmnopqrstuvwxyz';

  /* medidos del video */
  var CURVA   = 'cubic-bezier(.155,.144,.429,.933)';
  var T_CAE   = 200;    /* ms que dura la traslación */
  var T_GIRA  = 250;    /* ms que dura el giro: sigue un poco más */
  /* ⚠️⚠️ 79 y 124, NO 45 y 42 (8/9/2026). Maki: «el ticket tiene que ser un
     ticket completo; te entregan el ticket entero, vos lo cortas y ahi sale el
     pedazo. ¿Por que aparece directamente en el medio?».
     Tenia razon: MEDIDO en pantalla, la columna arrancaba 70 px ADENTRO del
     borde derecho del boleto y se salia 29 px por ABAJO. O sea que nunca
     estuvo pegada: flotaba en el medio y colgaba. Con 79% / 124% queda al ras
     del borde derecho (-1 px) y con 9 y 15 px de aire arriba y abajo, adentro
     del boleto. Verificado MIRANDO la captura, no solo midiendo.
     Los valores 45/42 salieron del video pero describen EL RECORRIDO de la
     caida, no el punto de partida. El final no cambia: sigue siendo 0 0. */
  var DX      = 79;     /* % del ancho: deja la columna al ras del borde derecho */
  var DY      = 124;    /* % del alto: la centra adentro del boleto */

  /* ---- CÓMO SE PIDE EL AUDIO ---------------------------------------------
     Ver la nota grande del encabezado. Devuelve '' cuando no hay nada que
     cambiar, y el que llama se queda con la dirección original.               */
  var RECETA = 'ac_aac,br_32k,ar_22050';

  function liviana(u) {
    u = String(u || '');
    if (u.indexOf('/video/upload/') < 0) return '';   /* no es de Cloudinary */
    /* si ya trae una receta puesta a mano, no se toca: alguien decidió eso */
    if (/\/video\/upload\/[^/]*(?:ac_|br_|f_|q_)/.test(u)) return '';
    return u.replace('/video/upload/', '/video/upload/' + RECETA + '/')
            .replace(/\.[a-z0-9]+$/i, '.m4a');
  }

  /* ---- DE QUIEN ES EL AUDIO ---------------------------------------------
     Por defecto suena el del evento: uno solo para todos, cargado en el panel.
     Pero si los novios le grabaron un audio a ESTA persona, ese gana. Ese audio
     no vive en el evento sino en la ficha del invitado (inv_invitados), y llega
     en window.INVGUEST cuando la invitacion pide la ficha por el token del link.
     La onda: si el audio personal no trae la suya medida, se presta la del
     evento antes que dibujar 26 rayitas planas (es decoracion, no es dato).
     Como huella() se arma con lo que devuelve esta funcion, cambiar de audio
     ya dispara el re-montado solo: no hay que avisarle a nadie.               */
  /* ---- LAS TEXTURAS DEL BOLETO (29/9/2026) ------------------------------
     Maki: «el ticket que está armado es muy pero muy malo… la forma puede ser
     siempre la misma pero que cambien las texturas y los diseños de adentro».

     ⭐ LA IA HACE SÓLO LA TEXTURA, NUNCA EL TICKET. Si se le pide «un ticket»,
        cada imagen sale con otra forma y con letras inventadas. Acá se genera
        un rectángulo de papel/tela SIN texto (Higgsfield Soul, 16:9), con los
        objetos en los bordes y el centro limpio. El troquel, la perforación y
        los textos los sigue poniendo este módulo, siempre iguales.

     `fx.pasevoz.textura` acepta el ID de este catálogo o una URL propia.
     Cada ID trae su papel, tinta y acento MEDIDOS contra la imagen: si la
     diseñadora no eligió colores, se usan éstos y el texto se lee solo.
     Los colores que ella elija en el panel siguen ganando.

     ⚠️ Se entrega por Cloudinary con f_auto,q_auto,w_1100 (el boleto mide
        352 px de ancho: 1100 alcanza para una pantalla 3x). Nunca el PNG crudo:
        pesa 2-3 MB.
     ⚠️ `velo` es el claro que va DETRÁS del texto (0 a 1). Deja la textura a
        la vista en los bordes, que es donde están los objetos.            */
  var CLD = 'https://res.cloudinary.com/oc8cgqt4/image/upload/';
  var TEXTURAS = {
    'arena-caracoles':  { nombre: 'Arena con caracoles y perlas', tema: 'playa',
      img: 'v1790664882/invitame/pases/pase-arena-caracoles.png',
      papel: '#eee6d8', tinta: '#4a3826', acento: '#8c4826', velo: 0.66 },
    'acuarela-lavanda': { nombre: 'Acuarela lavanda y oro', tema: 'romántico',
      img: 'v1790664652/invitame/pases/pase-acuarela-lavanda.png',
      papel: '#f3e6e8', tinta: '#463b52', acento: '#735724', velo: 0.60 },
    'seda-champagne':   { nombre: 'Seda champagne con perlas', tema: 'elegante',
      img: 'v1790664655/invitame/pases/pase-seda-champagne.png',
      papel: '#ece5d8', tinta: '#3e3428', acento: '#705523', velo: 0.66 },
    'lino-flores':      { nombre: 'Lino con flores secas', tema: 'boho',
      img: 'v1790664657/invitame/pases/pase-lino-flores.png',
      papel: '#ebe6da', tinta: '#3f3a2e', acento: '#655633', velo: 0.60 },
    'nacar':            { nombre: 'Nácar', tema: 'perlas',
      img: 'v1790664659/invitame/pases/pase-nacar.png',
      papel: '#eee6ea', tinta: '#3c3342', acento: '#6c5267', velo: 0.74 },
    'disco': { nombre: 'Terciopelo negro con espejitos', tema: 'disco',
      img: 'v1790665678/invitame/pases/pase-disco.png',
      papel: '#1c1a1c', tinta: '#f1ece6', acento: '#c9ccd4', velo: 0.62 },
    'disco-neon': { nombre: 'Cromo holográfico', tema: 'disco neón',
      img: 'v1790665680/invitame/pases/pase-disco-neon.png',
      papel: '#2a1b33', tinta: '#fbeefa', acento: '#ff7ad9', velo: 0.78 },
    'campestre': { nombre: 'Kraft con trigo y lavanda', tema: 'campestre',
      img: 'v1790665682/invitame/pases/pase-campestre.png',
      papel: '#e6d8c4', tinta: '#3d2f22', acento: '#5c4f2b', velo: 0.64 },
    'cenicienta': { nombre: 'Hielo con escarcha', tema: 'cenicienta',
      img: 'v1790665685/invitame/pases/pase-cenicienta.png',
      papel: '#eaf1f8', tinta: '#1f3448', acento: '#45617e', velo: 0.62 },
    'cantera': { nombre: 'Cantera rosa con olivo y buganvilla', tema: 'cantera',
      img: 'v1790665687/invitame/pases/pase-cantera.png',
      papel: '#f1e4dc', tinta: '#4a3527', acento: '#973958', velo: 0.64 },
    'oleo': { nombre: 'Óleo con espátula y oro', tema: 'óleo',
      img: 'v1790665689/invitame/pases/pase-oleo.png',
      papel: '#f4efe8', tinta: '#4a3a36', acento: '#73592a', velo: 0.55 },
    'sapo': { nombre: 'Estanque verde con nenúfares', tema: 'sapo',
      img: 'v1790665691/invitame/pases/pase-sapo.png',
      papel: '#1f2a12', tinta: '#f3ecd2', acento: '#d4b04a', velo: 0.66 },
    'bella': { nombre: 'Terciopelo borgoña con pétalos', tema: 'bella',
      img: 'v1790665693/invitame/pases/pase-bella.png',
      papel: '#3a070b', tinta: '#f7e8d6', acento: '#d6ac5c', velo: 0.74 },
    'rapunzel': { nombre: 'Pergamino con trenza dorada', tema: 'rapunzel',
      img: 'v1790665696/invitame/pases/pase-rapunzel.png',
      papel: '#f2ead6', tinta: '#3e3120', acento: '#475a95', velo: 0.6 },
    'alicia': { nombre: 'Papel antiguo con naipes y rosas', tema: 'alicia',
      img: 'v1790665698/invitame/pases/pase-alicia.png',
      papel: '#f0e7da', tinta: '#3b2a24', acento: '#a3262f', velo: 0.62 },
    'degrade': { nombre: 'Verde degradé con oro', tema: 'degradé',
      img: 'v1790665700/invitame/pases/pase-degrade.png',
      papel: '#0f2d1d', tinta: '#f0ead8', acento: '#d4b04a', velo: 0.6 },
    'colorama': { nombre: 'Humo de colores', tema: 'colorama',
      img: 'v1790665703/invitame/pases/pase-colorama.png',
      papel: '#fbf8f6', tinta: '#3a3346', acento: '#a73c72', velo: 0.55 }
  };
  function textura(f) {
    var v = String((f && f.textura) || '').trim();
    if (!v) return null;
    var t = TEXTURAS[v];
    if (t) return { url: CLD + 'f_auto,q_auto,w_1100/' + t.img, papel: t.papel,
                    tinta: t.tinta, acento: t.acento, velo: t.velo };
    if (/^https?:\/\//.test(v)) {
      var u = v.indexOf('/image/upload/') > 0 && !/\/image\/upload\/[^/]*[fqw]_/.test(v)
        ? v.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_1100/') : v;
      return { url: u, velo: 0.62 };
    }
    return null;
  }

  function fx() {
    var e = window.INVEV || {};
    var f = (e.fx && e.fx.pasevoz) || {};
    var g = window.INVGUEST;
    if (!g || !g.pasevozAudio) return f;
    var c = {}, k;
    for (k in f) if (Object.prototype.hasOwnProperty.call(f, k)) c[k] = f[k];
    c.audio = g.pasevozAudio;
    c.onda  = g.pasevozOnda || f.onda || '';
    return c;
  }
  function txt(v, x) { return (v == null || v === '') ? (x || '') : String(v); }

  /* la onda viaja como 26 caracteres base36: 0 = mudo, z = pico */
  function leerOnda(s) {
    var out = [], i, k;
    for (i = 0; i < N; i++) {
      k = (typeof s === 'string') ? ABC.indexOf(s.charAt(i)) : -1;
      out.push(k < 0 ? 0.30 : Math.max(0.10, k / 35));
    }
    return out;
  }

  function estilo() {
    if (document.getElementById('pv-css')) return;
    var s = document.createElement('style');
    s.id = 'pv-css';
    s.textContent = [
      '#pv-sec .pv-escena{position:relative;max-width:352px;margin:0 auto;padding:10px 0 6px}',

      /* ---- EL BOLETO. No se mueve nunca: ver la nota de arriba. ---- */
      '#pv-sec .pv-tk{position:relative;display:grid;grid-template-columns:52px 1fr;',
      '  color:var(--pv-tinta);transform:rotate(-1.4deg);',
      '  filter:drop-shadow(0 14px 22px rgba(40,32,20,.34))}',
      /* el borde derecho queda MORDIDO: es por donde se arrancó la columna */
      '#pv-sec .pv-tk{-webkit-mask:radial-gradient(circle 5px at 100% 50%,transparent 95%,#000 100%);',
      '  -webkit-mask-size:100% 15px;-webkit-mask-repeat:repeat-y;',
      '  mask:radial-gradient(circle 5px at 100% 50%,transparent 95%,#000 100%);',
      '  mask-size:100% 15px;mask-repeat:repeat-y}',
      '#pv-sec .pv-talon,#pv-sec .pv-cuerpo{background:var(--pv-papel);position:relative}',
      '#pv-sec .pv-talon::before,#pv-sec .pv-cuerpo::before{content:"";',
      '  position:absolute;inset:8px;pointer-events:none;',
      '  border:1px solid color-mix(in srgb,var(--pv-tinta) 20%,transparent)}',
      '#pv-sec .pv-talon::before{inset:8px 0 8px 12px;border-right:0}',
      '#pv-sec .pv-cuerpo::before{inset:8px 14px 8px 0;border-left:0}',
      '#pv-sec .pv-talon{display:flex;align-items:center;justify-content:center;padding:18px 0;',
      '  border-right:1px dashed color-mix(in srgb,var(--pv-tinta) 34%,transparent)}',
      '#pv-sec .pv-talon span{writing-mode:vertical-rl;transform:rotate(180deg);',
      '  font-family:var(--pv-tit);font-size:15px;letter-spacing:.09em;text-transform:uppercase;',
      '  color:var(--pv-tinta);white-space:nowrap;overflow:hidden;line-height:1}',
      /* min-height: el boleto de la muestra es 1,44:1 porque lleva seis renglones.
         Con "De parte de" y "Nota" vacíos el nuestro queda chato, así que se le
         pone un piso para que la columna arrancada no le sobresalga. */
      /* ⚠️ padding-right 60: le RESERVA el lugar a la columna del mensaje. Sin eso
         el titulo corre por debajo y, mientras la columna esta pegada, se lee
         "PASE DE INVITA...O". El boleto tiene que verse ENTERO y limpio. */
      /* ⚠️⚠️ 44%, NO 60px — Y ES UN NUMERO MEDIDO (8/9/2026).
         Maki, con una captura del iPhone: «el ticket mira como se ve». En la
         foto, «PASE DE INVITADO» y «Un mensaje para ti» quedaban TAPADOS por la
         columna del mensaje, que se dibuja ENCIMA del cuerpo.
         El reservado de 60px no alcanzaba: medido, la columna arranca a 120px
         del borde derecho del boleto, no a 60. Y tiene que ser PORCENTAJE, no
         pixeles, porque la columna se posiciona en % del ancho: con un valor
         fijo se vuelve a pisar apenas cambia la pantalla.
         Verificado a 360 y a 390 px de ancho: cero superposicion con el titulo,
         con «PASE DE INVITADO» y con «De parte de», y el titulo entra en un solo
         renglon. Con 38% todavia se pisaba; 44% deja 9-13 px de aire.
         ⚠️ Y OJO CON COMO SE COMPRUEBA: que el texto no se corte por su propia
            caja (scrollWidth) NO alcanza — el texto entra entero y queda TAPADO.
            Hay que medir la superposicion de los rectangulos. */
      /* padding-right 70: le reserva el lugar a la columna, que ahora vive
         PEGADA al borde derecho. (El 44% de la version anterior corria el texto
         para no quedar tapado por una columna que estaba mal ubicada: era un
         sintoma, no la causa.) */
      '#pv-sec .pv-cuerpo{padding:20px 70px 18px 18px;display:flex;flex-direction:column;',
      /* min-height 220: la columna rotada mide 204 de alto. Con 168 el boleto
         quedaba mas bajo que su propio talon y el play colgaba por fuera. */
      '  justify-content:center;min-height:220px;min-width:0}',
      '#pv-sec .pv-over{font-family:var(--pv-dat);font-size:8px;letter-spacing:.16em;',
      '  text-transform:uppercase;font-weight:600;color:var(--pv-acento);margin:0;line-height:1.35}',
      '#pv-sec .pv-titulo{font-family:var(--pv-tit);font-weight:600;line-height:1.08;margin:5px 0 0;',
      '  font-size:clamp(18px,5.2vw,23px);letter-spacing:-.005em}',
      '#pv-sec .pv-departe{font-family:var(--pv-cur);font-size:14px;margin:5px 0 0;',
      '  color:var(--pv-acento);line-height:1.2}',
      '#pv-sec .pv-datos{display:grid;grid-template-columns:1.45fr 1fr;gap:0 10px;margin-top:11px}',
      '#pv-sec .pv-datos dt{font-family:var(--pv-dat);font-size:7.5px;letter-spacing:.16em;',
      '  text-transform:uppercase;font-weight:600;margin:0;',
      '  color:color-mix(in srgb,var(--pv-tinta) 58%,transparent)}',
      '#pv-sec .pv-datos dd{font-family:var(--pv-tit);margin:1px 0 0;font-size:13.5px;',
      '  font-variant-numeric:tabular-nums;line-height:1.2;white-space:nowrap;',
      '  overflow:hidden;text-overflow:ellipsis}',
      '#pv-sec .pv-nota{margin-top:11px;padding-top:8px;',
      '  border-top:1px solid color-mix(in srgb,var(--pv-tinta) 22%,transparent)}',
      '#pv-sec .pv-nota dt{font-family:var(--pv-dat);font-size:7.5px;letter-spacing:.16em;',
      '  text-transform:uppercase;font-weight:600;margin:0;',
      '  color:color-mix(in srgb,var(--pv-tinta) 58%,transparent)}',
      '#pv-sec .pv-nota dd{font-family:var(--pv-cur);margin:2px 0 0;font-size:13px;',
      '  line-height:1.25;color:var(--pv-tinta)}',

      /* ---- LA PIEZA QUE SE ARRANCA ---- */
      '#pv-sec .pv-msg{position:relative;z-index:2;display:flex;align-items:center;gap:10px;',
      /* ⚠️ va a la DERECHA, no centrada: el recorrido medido (+45% en X) tiene que
         dejar la columna pegada al borde derecho del boleto, que es donde esta
         en la muestra (medido: el play arranca al 93% del ancho). Centrada, la
         columna caia ENCIMA del titulo. */
      '  width:58%;margin:2px 8px 0 auto;padding:13px 14px 11px;',
      '  border:0;font:inherit;color:var(--pv-tinta);cursor:pointer;text-align:left;',
      '  background:var(--pv-papel);',
      '  transform-origin:27px 50%;',              /* ⚠️ el pivote es el PLAY */
      '  translate:0 0;rotate:-2.6deg;',
      '  filter:drop-shadow(0 9px 15px rgba(40,32,20,.32));',
      '  transition:translate ' + T_CAE + 'ms ' + CURVA + ',',
      '             rotate ' + T_GIRA + 'ms ' + CURVA + '}',
      /* el borde de arriba, mordido igual que el del boleto: es el mismo corte */
      '#pv-sec .pv-msg{-webkit-mask:radial-gradient(circle 5px at 50% 0,transparent 95%,#000 100%);',
      '  -webkit-mask-size:15px 100%;-webkit-mask-repeat:repeat-x;',
      '  mask:radial-gradient(circle 5px at 50% 0,transparent 95%,#000 100%);',
      '  mask-size:15px 100%;mask-repeat:repeat-x}',
      /* ⚠️ ESTE es el estado inicial: pegada al boleto y vertical */
      /* --pv-dx / --pv-dy los mide encajar() (3/10/2026): ver ahí */
      '#pv-sec .pv-msg.pv-pegada{translate:calc(' + DX + '% + var(--pv-dx,0px)) calc(-' + DY + '% + var(--pv-dy,0px));rotate:calc(-90deg + var(--pv-rot,0deg))}',

      '#pv-sec .pv-play{width:26px;height:26px;flex:none;border-radius:50%;display:flex;',
      '  align-items:center;justify-content:center;',
      '  border:1px solid color-mix(in srgb,var(--pv-tinta) 45%,transparent)}',
      '#pv-sec .pv-play svg{width:9px;height:9px;color:var(--pv-tinta)}',
      '#pv-sec .pv-play .pv-pausa{display:none}',
      '#pv-sec .pv-msg.pv-son .pv-play svg{color:var(--pv-acento)}',
      '#pv-sec .pv-msg.pv-son .pv-play .pv-ply{display:none}',
      '#pv-sec .pv-msg.pv-son .pv-play .pv-pausa{display:block}',
      '#pv-sec .pv-msg.pv-son .pv-play{border-color:var(--pv-acento)}',

      '#pv-sec .pv-onda{flex:1;height:22px;min-width:0;display:flex;align-items:center;',
      '  gap:2px;overflow:hidden}',
      '#pv-sec .pv-onda i{display:block;flex:1 1 0;min-width:1.5px;border-radius:2px;',
      '  height:calc(max(0.14,var(--h)) * 100%);',
      '  background:color-mix(in srgb,var(--pv-tinta) 66%,transparent);',
      '  transition:background-color .16s linear}',
      '#pv-sec .pv-onda i.pv-ya{background:var(--pv-acento)}',

      /* ⚠️ HACE FALTA UNA SEÑA. En el video hay un dedo que muestra donde tocar;
         en una invitacion no hay nadie mostrando nada. Una respiracion muy
         suave alcanza para que se lea como "tocame", sin cartelito. */
      '@keyframes pv-late{0%,100%{filter:drop-shadow(0 9px 15px rgba(40,32,20,.32))}',
      '  50%{filter:drop-shadow(0 9px 19px rgba(40,32,20,.46))}}',
      '#pv-sec .pv-msg.pv-late{animation:pv-late 2.4s ease-in-out infinite}',
      '@media (prefers-reduced-motion:reduce){',
      '  #pv-sec .pv-msg.pv-late{animation:none}',
      '  #pv-sec .pv-msg{transition:none}',
      '  #pv-sec .pv-msg.pv-pegada{translate:0 0;rotate:-2.6deg}}',

      /* ⚠️ EL MOTOR PISA LOS TAMAÑOS. `estilos-servidor.css` sirve
         `.sec p:not(.frase){font-size:var(--fs-texto,16px)!important}`, y el
         `!important` le gana a `#pv-sec .pv-over` por más ID que tenga. Medido
         el 21/9/2026: el sobretítulo y el título salían en 16px y el boleto
         quedaba en 1,56:1 en vez de 2,56:1 — o sea, un rectángulo gordo, no un
         boleto. Estas siete líneas repiten los MISMOS tamaños de arriba, con
         `!important`, para que nadie los pise. Si cambiás un tamaño arriba,
         cambialo también acá.

         ⚠️ Y LA FAMILIA TAMBIÉN. Las colecciones declaran
         `html[data-col="x"] p{font-family:<sans>!important}`, y el
         sobretítulo y el título del boleto son `<p>`: medido en `bohemia`,
         el título salía en la sans de los datos en vez de la romana que pide
         `--pv-tit`. Por eso cada línea de acá abajo fija también su familia.
         Las tres variables (`--pv-tit`, `--pv-dat`, `--pv-cur`) las elige
         Jazmín desde el panel, así que esto no le clava una fuente a nadie. */
      /* ⚠️ Y EL COLOR, CUANDO JAZMÍN LO ELIGE (3/10/2026). Las colecciones oscuras
         (degrade, cantera, óleo, sapo) pintan `.sec p:not(.frase)` en crema con
         `!important`, y el sobretítulo, el título y el «de parte de» del boleto
         son `<p>`: con una textura clara, la tinta oscura que ella elegía en el
         panel no llegaba y el boleto quedaba crema sobre crema (medido en
         andrea-y-felipe: 1:1). Sólo se fuerza si ELLA eligió el color
         (clases pv-tinta-propia / pv-acento-propio); sin elegir, nada cambia. */
      '#pv-sec.pv-tinta-propia .pv-titulo{color:var(--pv-tinta)!important}',
      '#pv-sec.pv-acento-propio .pv-over,#pv-sec.pv-acento-propio .pv-departe{color:var(--pv-acento)!important}',
      '#pv-sec .pv-over{font-size:8px!important;line-height:1.35!important;' +
        'font-family:var(--pv-dat)!important;letter-spacing:.16em!important}',
      '#pv-sec .pv-titulo{font-size:clamp(18px,5.2vw,23px)!important;line-height:1.08!important;' +
        'font-family:var(--pv-tit)!important;letter-spacing:-.005em!important}',
      '#pv-sec .pv-departe{font-size:14px!important;line-height:1.2!important;' +
        'font-family:var(--pv-cur)!important}',
      '#pv-sec .pv-datos dt,#pv-sec .pv-nota dt{font-size:7.5px!important;' +
        'font-family:var(--pv-dat)!important}',
      '#pv-sec .pv-datos dd{font-size:13.5px!important;line-height:1.2!important;' +
        'font-family:var(--pv-tit)!important}',
      '#pv-sec .pv-nota dd{font-size:13px!important;line-height:1.25!important;' +
        'font-family:var(--pv-cur)!important}',
      /* ⚠️ `line-height:1` acá RECORTA. El talón va en `writing-mode:vertical-rl`,
         así que el interlineado es el ANCHO de la tira: con 1 la caja queda de
         15 px y una romana pide 18 (medido con Bodoni Moda, scrollWidth 18 contra
         clientWidth 15, y el padre tiene overflow:hidden). 1.25 da 18,75 px y la
         columna mide 51, así que sobra lugar. */
      '#pv-sec .pv-talon span{font-size:15px!important;line-height:1.25!important;' +
        'font-family:var(--pv-tit)!important}',

      /* ---- CON TEXTURA (ver TEXTURAS arriba) ----
         Una sola imagen para TODO el boleto, puesta en .pv-tk: talón y cuerpo
         son el mismo papel, con la línea punteada encima. La pieza que se
         arranca lleva el MISMO papel, tomado del borde derecho, que es de donde
         sale. El claro va detrás del texto, no encima de la textura entera. */
      '#pv-sec.pv-con-tex .pv-tk{background:var(--pv-papel) var(--pv-tex) center/cover no-repeat}',
      '#pv-sec.pv-con-tex .pv-talon,#pv-sec.pv-con-tex .pv-cuerpo{background:transparent}',
      '#pv-sec.pv-con-tex .pv-cuerpo{background:radial-gradient(ellipse 78% 72% at 44% 52%,',
      '  color-mix(in srgb,var(--pv-papel) var(--pv-velo),transparent) 0%,',
      '  color-mix(in srgb,var(--pv-papel) calc(var(--pv-velo) * .55),transparent) 62%,transparent 100%)}',
      /* ⚠️ el talón es donde caen los objetos del borde izquierdo (la trenza de
         Rapunzel, el trigo de Campestre): su claro va MÁS fuerte que el del cuerpo. */
      '#pv-sec.pv-con-tex .pv-talon{background:linear-gradient(90deg,',
      '  color-mix(in srgb,var(--pv-papel) calc(var(--pv-velo) * .5),transparent),',
      '  color-mix(in srgb,var(--pv-papel) min(92%,calc(var(--pv-velo) * 1.3)),transparent) 22%,',
      '  color-mix(in srgb,var(--pv-papel) min(92%,calc(var(--pv-velo) * 1.3)),transparent) 78%,',
      '  color-mix(in srgb,var(--pv-papel) calc(var(--pv-velo) * .5),transparent))}',
      '#pv-sec.pv-con-tex .pv-talon::before,#pv-sec.pv-con-tex .pv-cuerpo::before{',
      '  border-color:color-mix(in srgb,var(--pv-acento) 55%,transparent)}',
      '#pv-sec.pv-con-tex .pv-talon{border-right-color:color-mix(in srgb,var(--pv-acento) 70%,transparent)}',
      '#pv-sec.pv-con-tex .pv-msg{background:',
      '  linear-gradient(color-mix(in srgb,var(--pv-papel) calc(var(--pv-velo) * .7),transparent),',
      '  color-mix(in srgb,var(--pv-papel) calc(var(--pv-velo) * .7),transparent)),',
      '  var(--pv-papel) var(--pv-tex) 100% 50%/auto 240px no-repeat}',
      '#pv-sec.pv-con-tex .pv-play{background:color-mix(in srgb,var(--pv-papel) 80%,transparent);',
      '  border-color:var(--pv-acento)}',
      '#pv-sec.pv-con-tex .pv-onda i{background:color-mix(in srgb,var(--pv-tinta) 78%,transparent)}',
      '#pv-sec.pv-con-tex .pv-titulo,#pv-sec.pv-con-tex .pv-talon span,#pv-sec.pv-con-tex .pv-datos dd{',
      '  text-shadow:0 0 10px color-mix(in srgb,var(--pv-papel) 90%,transparent)}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function montar() {
    var f = fx();
    var viejo = document.getElementById('pv-sec');
    if (viejo) viejo.parentNode.removeChild(viejo);
    if (!f.encendido || !f.audio) return;      /* sin audio no hay pase */

    estilo();

    var sec = document.createElement('section');
    sec.id = 'pv-sec';
    sec.className = 'sec';

    var st = sec.style, tx = textura(f) || {};
    st.setProperty('--pv-papel',  txt(f.papel,  tx.papel  || 'color-mix(in srgb,var(--sage-cl) 34%,#fff)'));
    st.setProperty('--pv-tinta',  txt(f.tinta,  tx.tinta  || 'var(--verde)'));
    st.setProperty('--pv-acento', txt(f.acento, tx.acento || (f.metalico ? 'var(--oro)' : 'var(--sage)')));
    if (txt(f.tinta))  sec.classList.add('pv-tinta-propia');   /* ver «Y EL COLOR» en estilo() */
    if (txt(f.acento)) sec.classList.add('pv-acento-propio');
    if (tx.url) {
      sec.classList.add('pv-con-tex');
      /* ⚠️ --pv-tex se escribe más abajo, en .pv-escena, y NO en la sección: las
         colecciones tratan `.sec[style*="url("]` como «sección sobre foto» y le
         ponen el texto en crema con !important (medido en Rapunzel 3/10: el título
         del boleto salía crema sobre el pergamino). */
      sec.__pvTex = 'url("' + tx.url.replace(/"/g, '%22') + '")';
      var velo = (f.velo === '' || f.velo == null || isNaN(+f.velo)) ? tx.velo : +f.velo;
      st.setProperty('--pv-velo', Math.round(Math.max(0, Math.min(1, velo)) * 100) + '%');
    }
    st.setProperty('--pv-tit', txt(f.letraTitulo, '"Cormorant Garamond",Georgia,serif'));
    st.setProperty('--pv-dat', txt(f.letraDatos,  '"Jost",system-ui,sans-serif'));
    st.setProperty('--pv-cur', txt(f.letraMano,   '"Dancing Script",cursive'));

    var departe = txt(f.departe), nota = txt(f.nota);

    sec.innerHTML =
      '<div class="pv-escena">' +
        '<div class="pv-tk">' +
          '<div class="pv-talon"><span></span></div>' +
          '<div class="pv-cuerpo">' +
            '<p class="pv-over"></p>' +
            '<p class="pv-titulo"></p>' +
            (departe ? '<p class="pv-departe"></p>' : '') +
            '<dl class="pv-datos">' +
              '<div><dt></dt><dd class="pv-fecha"></dd></div>' +
              '<div><dt></dt><dd class="pv-hora"></dd></div>' +
            '</dl>' +
            (nota ? '<dl class="pv-nota"><dt></dt><dd></dd></dl>' : '') +
          '</div>' +
        '</div>' +
        '<button class="pv-msg pv-pegada pv-late" type="button" aria-label="Arrancar el pase y escuchar el mensaje de voz">' +
          '<span class="pv-play" aria-hidden="true">' +
            '<svg viewBox="0 0 10 10" fill="currentColor">' +
              '<polygon class="pv-ply" points="1.5,0.8 9,5 1.5,9.2"></polygon>' +
              '<g class="pv-pausa"><rect x="1.6" y="1" width="2.6" height="8"></rect>' +
              '<rect x="5.8" y="1" width="2.6" height="8"></rect></g>' +
            '</svg>' +
          '</span>' +
          '<span class="pv-onda" aria-hidden="true"></span>' +
        '</button>' +
      '</div>';

    if (sec.__pvTex) sec.querySelector('.pv-escena').style.setProperty('--pv-tex', sec.__pvTex);
    sec.querySelector('.pv-talon span').textContent = txt(f.talon, 'Admite dos');
    sec.querySelector('.pv-over').textContent       = txt(f.over);
    sec.querySelector('.pv-titulo').textContent     = txt(f.titulo);
    if (departe) sec.querySelector('.pv-departe').textContent = departe;
    var dts = sec.querySelectorAll('.pv-datos dt');
    dts[0].textContent = txt(f.rotuloFecha, 'Fecha');
    dts[1].textContent = txt(f.rotuloHora,  'Hora');
    sec.querySelector('.pv-fecha').textContent = txt(f.fecha);
    sec.querySelector('.pv-hora').textContent  = txt(f.hora);
    if (nota) {
      sec.querySelector('.pv-nota dt').textContent = txt(f.rotuloNota, 'Nota');
      sec.querySelector('.pv-nota dd').textContent = nota;
    }

    /* la onda, dibujada SIN bajar el audio */
    var onda = sec.querySelector('.pv-onda'), h = leerOnda(f.onda), barras = [], i, b;
    for (i = 0; i < N; i++) {
      b = document.createElement('i');
      b.style.setProperty('--h', h[i].toFixed(3));
      onda.appendChild(b); barras.push(b);
    }

    /* dónde va: SIEMPRE dentro de .frame */
    var marco = document.querySelector('.frame');
    if (!marco) return;
    var antes = document.getElementById('contacto-sec') || document.getElementById('share-sec');
    if (antes && antes.parentNode === marco) marco.insertBefore(sec, antes);
    else marco.appendChild(sec);

    audio(sec, barras, f);
    [60, 400, 1500].forEach(function (ms) { setTimeout(function () { encajar(sec); }, ms); });
    try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { encajar(sec); }); } catch (e) {}
  }

  /* ---- EL TROQUEL DEL MISMO ALTO QUE EL BOLETO (3/10/2026) ------------------
     Maki: «el troquelado queda más chico que el ticket». Medido en las tres
     muestras (camila-y-tomas, aitana-mis15, abril-mis15): el boleto 228 px de
     alto y la pieza que se arranca 194–198, con 18–22 px de hueco arriba y
     10–12 abajo. La pieza es una tira ACOSTADA y girada -90°: su alto en
     pantalla es su ANCHO, que era un 58% del ancho de la escena, y el alto del
     boleto depende del texto que lleve. Un número fijo nunca iba a coincidir.
     → Se mide: el ancho de la tira = el alto del boleto, y el corrimiento que
       falta para que quede al ras arriba y a la derecha va en --pv-dx/--pv-dy,
       que sólo usa el estado «pegada». Al arrancarla no cambia nada más. */
  function encajar(sec) {
    var tk = sec && sec.querySelector('.pv-tk'), msg = sec && sec.querySelector('.pv-msg');
    if (!tk || !msg || !msg.classList.contains('pv-pegada')) return;
    try { if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
    /* el boleto va inclinado (-1,4°): la tira, pegada a él, con la misma
       inclinación; y su largo es el alto del boleto SIN girar (offsetHeight) */
    var H = tk.offsetHeight;
    if (!H) return;
    var rot = 0;
    try {
      var m = getComputedStyle(tk).transform.match(/matrix\(([^,]+),\s*([^,]+)/);
      if (m) rot = Math.atan2(parseFloat(m[2]), parseFloat(m[1])) * 180 / Math.PI;
    } catch (e) {}
    msg.style.transition = 'none';
    msg.style.setProperty('--pv-rot', rot.toFixed(2) + 'deg');
    if (Math.abs(msg.offsetWidth - H) > 1) msg.style.width = Math.round(H) + 'px';
    msg.style.setProperty('--pv-dx', '0px');
    msg.style.setProperty('--pv-dy', '0px');
    var a = tk.getBoundingClientRect(), b = msg.getBoundingClientRect();
    msg.style.setProperty('--pv-dx', (a.right - b.right).toFixed(1) + 'px');
    msg.style.setProperty('--pv-dy', (a.top - b.top).toFixed(1) + 'px');
    void msg.offsetWidth;
    msg.style.transition = '';
  }
  addEventListener('resize', function () { encajar(document.getElementById('pv-sec')); }, { passive: true });

  /* ---- LA ROTURA -----------------------------------------------------------
     LA DISPARA EL DEDO, NO EL SCROLL. Ver la nota del click, más abajo.
     ⚠️ DOS requestAnimationFrame: con uno solo el navegador junta el estado
        inicial y el final en el mismo frame, no hay transición y salta al final.
        Esto ya pasó con el sobre. */
  function romper(msg) {
    if (msg.__roto) return; msg.__roto = true;
    msg.classList.remove('pv-late');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { msg.classList.remove('pv-pegada'); });
    });
  }

  /* ---- el sonido ---- */
  function audio(sec, barras, f) {
    var msg = sec.querySelector('.pv-msg');
    var au = document.createElement('audio');
    au.preload = 'none';

    /* la versión que se entrega: ver la nota grande del encabezado */
    var crudo   = String(f.audio || '');
    var liviano = liviana(crudo);
    var usandoLiviano = !!liviano;
    au.src = liviano || crudo;
    sec.appendChild(au);

    var raf = 0, pausados = [];

    function pausarLaMusica() {
      pausados = [];
      var todos = document.querySelectorAll('audio,video'), k, m;
      for (k = 0; k < todos.length; k++) {
        m = todos[k];
        if (m !== au && !m.paused) { m.pause(); pausados.push(m); }
      }
    }
    function devolverLaMusica() {
      for (var k = 0; k < pausados.length; k++) {
        var p = pausados[k].play();
        if (p && p.catch) p.catch(function () {});
      }
      pausados = [];
    }
    function seguir() {
      var d = au.duration || 0, corte = Math.floor((d ? au.currentTime / d : 0) * N), k, ya;
      for (k = 0; k < N; k++) {
        ya = k <= corte;
        if (ya !== barras[k].classList.contains('pv-ya')) barras[k].classList.toggle('pv-ya', ya);
      }
      raf = requestAnimationFrame(seguir);
    }
    function parar() {
      cancelAnimationFrame(raf); raf = 0;
      msg.classList.remove('pv-son');
      for (var k = 0; k < N; k++) barras[k].classList.remove('pv-ya');
      devolverLaMusica();
    }
    function arrancar() {
      var p = au.play();
      if (p && p.then) p.then(function () { if (!raf) seguir(); })['catch'](parar);
      else if (!raf) seguir();
    }

    /* ⚠️ LA VUELTA ATRÁS, UNA SOLA VEZ. Si la versión liviana no se pudo bajar
       —Cloudinary caído, o una receta que esa cuenta no permita— se pide el
       archivo original. `usandoLiviano` se apaga antes de reintentar, así que
       si el original también falla esto termina en parar() y no en un loop. */
    function alFallar() {
      if (usandoLiviano) {
        usandoLiviano = false;
        var queriaSonar = msg.classList.contains('pv-son');
        au.src = crudo;
        try { au.load(); } catch (e) {}
        if (queriaSonar) { arrancar(); return; }
      }
      parar();
    }

    msg.addEventListener('click', function () {
      /* ⚠️ EL PRIMER TOQUE ROMPE, NO REPRODUCE. En la muestra el dedo baja sobre
         la columna y ES EL TOQUE el que la arranca (medido: el pulgar la alcanza
         en 1,699 s y la rotura arranca en 1,700). La primera version la rompia
         sola al aparecer en pantalla: el invitado se perdia el momento. */
      if (msg.classList.contains('pv-pegada')) { romper(msg); return; }
      if (au.paused) {
        pausarLaMusica();
        msg.classList.add('pv-son');
        arrancar();
      } else { au.pause(); parar(); }
    });
    au.addEventListener('ended', parar);
    au.addEventListener('error', alFallar);
  }

  /* ---- CUANDO SE MONTA -----------------------------------------------------
     /!\ El modulo esperaba un evento 'inv-listo' que NO DISPARA NADIE: lo habia
     inventado yo, y por eso el ticket no aparecia nunca. Ahora se vuelve a pasar
     solo cada 400 ms, como motivo.js, galeria.js y rsvp-muestra.js.

     /!\ Y NO SE REDIBUJA PORQUE SI: `montar()` borra y rehace la seccion. Si se
         llamara en cada vuelta cortaria el audio y volveria a pegar la columna
         que el invitado ya arranco. Por eso se compara una HUELLA y solo se
         rehace si algo cambio.
     -------------------------------------------------------------------------- */
  function huella() {
    var f = fx();
    return [
      f.encendido ? 1 : 0, f.audio || '', f.onda || '',
      f.talon || '', f.over || '', f.titulo || '',
      f.departe || '', f.nota || '', f.fecha || '', f.hora || '',
      f.rotuloFecha || '', f.rotuloHora || '',
      f.papel || '', f.tinta || '', f.acento || '', f.metalico ? 1 : 0,
      f.letraTitulo || '', f.letraDatos || '', f.letraMano || '',
      f.textura || '', (f.velo == null ? '' : f.velo)
    ].join('|');
  }

  var ultima = null;
  function revisar() {
    var h = huella();
    var f = fx();
    var deberiaEstar = !!(f.encendido && f.audio);
    var esta = !!document.getElementById('pv-sec');
    if (h !== ultima || (deberiaEstar && !esta) || (!deberiaEstar && esta)) {
      ultima = h;
      try { montar(); } catch (e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revisar);
  } else { revisar(); }
  setInterval(revisar, 400);

  window.PV_montar = montar;                    /* el panel lo llama al previsualizar */
  window.PV_liviana = liviana;
  window.PV_TEXTURAS = TEXTURAS;                /* el panel arma el selector con esto */
  window.PV_textura = textura;                  /* para que el banco la pueda medir */
})();
