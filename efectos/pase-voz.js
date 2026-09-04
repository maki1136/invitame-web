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
  var DX      = 45;     /* % del ancho del boleto que sube a la derecha */
  var DY      = 42;     /* % del ancho del boleto que baja */

  function fx() {
    var e = window.INVEV || {};
    return (e.fx && e.fx.pasevoz) || {};
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
      '#pv-sec .pv-cuerpo{padding:20px 60px 18px 18px;display:flex;flex-direction:column;',
      '  justify-content:center;min-height:168px;min-width:0}',
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
      '#pv-sec .pv-msg.pv-pegada{translate:' + DX + '% -' + DY + '%;rotate:-90deg}',

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
      '  #pv-sec .pv-msg.pv-pegada{translate:0 0;rotate:-2.6deg}}'
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

    var st = sec.style;
    st.setProperty('--pv-papel',  txt(f.papel,  'color-mix(in srgb,var(--sage-cl) 34%,#fff)'));
    st.setProperty('--pv-tinta',  txt(f.tinta,  'var(--verde)'));
    st.setProperty('--pv-acento', txt(f.acento, f.metalico ? 'var(--oro)' : 'var(--sage)'));
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
  }

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
    au.src = f.audio;
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

    msg.addEventListener('click', function () {
      /* ⚠️ EL PRIMER TOQUE ROMPE, NO REPRODUCE. En la muestra el dedo baja sobre
         la columna y ES EL TOQUE el que la arranca (medido: el pulgar la alcanza
         en 1,699 s y la rotura arranca en 1,700). La primera version la rompia
         sola al aparecer en pantalla: el invitado se perdia el momento. */
      if (msg.classList.contains('pv-pegada')) { romper(msg); return; }
      if (au.paused) {
        pausarLaMusica();
        msg.classList.add('pv-son');
        var p = au.play();
        if (p && p.then) p.then(function () { if (!raf) seguir(); }).catch(parar);
        else if (!raf) seguir();
      } else { au.pause(); parar(); }
    });
    au.addEventListener('ended', parar);
    au.addEventListener('error', parar);
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
      f.letraTitulo || '', f.letraDatos || '', f.letraMano || ''
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
})();
