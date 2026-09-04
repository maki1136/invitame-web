/* ===== PASE CON VOZ =========================================================
   La sección del ticket con el mensaje de voz de los anfitriones.

   Cómo se enciende:  INVEV.fx.pasevoz.encendido = true
   Cómo se apaga:     INVEV.fx.pasevoz.encendido = false

   ⚠️ EL AUDIO NO SE DESCARGA HASTA QUE ALGUIEN TOCA. El <audio> va con
      preload="none" y la onda se dibuja con los 26 números que vienen en
      `fx.pasevoz.onda`, medidos al grabar. El invitado que no toca el pase
      baja CERO bytes. Es el ahorro más grande de toda la función: más que
      cualquier elección de códec.

   ⚠️ NUNCA autoplay. iOS lo bloquea igual, y la invitación tiene música
      propia: al tocar se pausa lo que esté sonando y se devuelve al terminar.

   ⚠️ Los agujeros del troquel se pintan con var(--sec-col), que es el fondo
      de la sección. Si se usa otro color, el troquel deja de leerse como un
      recorte y pasa a ser un círculo pintado encima.

   ⚠️ `departe` y `nota` vienen VACÍOS a propósito. Es lo que mantiene el
      ticket rectangular (2,56:1). Con los dos llenos se va a 1,64:1 y deja
      de parecer un boleto. Medir la proporción después de cada cambio.

   ───────────────────────────────────────────────────────────────────────────
   LO QUE APARECIÓ AL MIRARLO EN LA INVITACIÓN DE VERDAD  (4/9/2026)

   Los tres se veían de una y ninguno daba error. Medido en camila-y-tomas:

     1. EL PLAY APUNTABA PARA ARRIBA. El `<polygon>` ya está dibujado mirando a
        la derecha, y encima tenía `transform:rotate(-90deg)`: en pantalla salía
        un ▲. La regla `.pv-son svg{transform:none}` era el intento de arreglarlo
        del otro lado, o sea que ANDANDO se enderezaba y EN PAUSA no. Al revés de
        lo que hace falta. Se sacaron las dos: el triángulo va como viene.

     2. LA ONDA ESTABA APLASTADA CONTRA SU MÍNIMO. La columna mide 90 px de alto.
        26 rayitas con 2 px de separación = 50 px de aire, o sea 1,5 px por
        rayita: todas clavadas en `min-height` y ninguna con altura propia. Se
        leía como una huella digital, no como un mensaje de voz. Con la
        separación en 1 px quedan ~2,5 px cada una y vuelve a leerse.
        ⚠️ Lo que codifica el volumen es el ANCHO de cada rayita, no el alto.
           Por eso el piso subió de 0,10 a 0,16: abajo de eso las partes calladas
           desaparecían del todo y quedaban huecos.

     3. EL PAPEL SALÍA LAVANDA FUERTE. `var(--sage-cl)` en la paleta de Perlas
        resuelve a #c5bad2, contra el #f4f2f6 de las secciones vecinas. El
        boleto gritaba. Ahora el papel se aclara hacia el blanco: sigue saliendo
        de la paleta —así acompaña a las 20— pero apoyado, no encima.
        ⚠️ Si Jazmín escribe un color a mano en el panel, ese va tal cual.
   ========================================================================== */
(function () {
  'use strict';

  var N = 26;                                   /* rayitas de la onda */
  var ABC = '0123456789abcdefghijklmnopqrstuvwxyz';

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
      '#pv-sec .pv-escena{display:flex;justify-content:center;padding:6px 0 2px}',
      '#pv-sec .pv-tk{--perf:calc(100% - 60px);--notch:10px;',
      '  position:relative;width:100%;max-width:420px;color:var(--pv-tinta);',
      '  display:grid;grid-template-columns:50px 1fr 60px;transform:rotate(-1.1deg);',
      '  border-radius:8px;overflow:hidden;background:transparent;',
      '  filter:drop-shadow(0 14px 26px rgba(40,32,20,.26));',
      '  -webkit-mask:radial-gradient(circle var(--notch) at var(--perf) 0,transparent 98%,#000 100%),',
      '    radial-gradient(circle var(--notch) at var(--perf) 100%,transparent 98%,#000 100%);',
      '  -webkit-mask-composite:source-in;',
      '  mask:radial-gradient(circle var(--notch) at var(--perf) 0,transparent 98%,#000 100%),',
      '    radial-gradient(circle var(--notch) at var(--perf) 100%,transparent 98%,#000 100%);',
      '  mask-composite:intersect}',
      '#pv-sec .pv-talon,#pv-sec .pv-cuerpo,#pv-sec .pv-voz{background:var(--pv-papel);position:relative}',
      '#pv-sec .pv-talon::before,#pv-sec .pv-cuerpo::before,#pv-sec .pv-voz::before{content:"";',
      '  position:absolute;inset:7px;pointer-events:none;',
      '  border:1px solid color-mix(in srgb,var(--pv-tinta) 20%,transparent)}',
      '#pv-sec .pv-talon::before{inset:7px 0 7px 12px;border-right:0}',
      '#pv-sec .pv-talon{display:flex;align-items:center;justify-content:center;padding:12px 0;',
      '  border-right:1px solid color-mix(in srgb,var(--pv-tinta) 26%,transparent)}',
      '#pv-sec .pv-talon span{writing-mode:vertical-rl;transform:rotate(180deg);',
      '  font-family:var(--pv-tit);font-size:15px;letter-spacing:.07em;text-transform:uppercase;',
      '  color:var(--pv-tinta);white-space:nowrap;overflow:hidden;line-height:1}',
      '#pv-sec .pv-cuerpo{padding:13px 15px 12px;display:flex;flex-direction:column;min-width:0}',
      '#pv-sec .pv-over{font-family:var(--pv-dat);font-size:8px;letter-spacing:.16em;',
      '  text-transform:uppercase;font-weight:600;color:var(--pv-acento);margin:0;line-height:1.35}',
      '#pv-sec .pv-titulo{font-family:var(--pv-tit);font-weight:600;line-height:1.08;margin:4px 0 0;',
      '  font-size:clamp(18px,5.2vw,23px);letter-spacing:-.005em}',
      '#pv-sec .pv-departe{font-family:var(--pv-cur);font-size:14px;margin:4px 0 0;',
      '  color:var(--pv-acento);line-height:1.2}',
      '#pv-sec .pv-datos{display:grid;grid-template-columns:1.45fr 1fr;gap:0 10px;margin-top:8px}',
      '#pv-sec .pv-datos dt{font-family:var(--pv-dat);font-size:7.5px;letter-spacing:.16em;',
      '  text-transform:uppercase;font-weight:600;margin:0;',
      '  color:color-mix(in srgb,var(--pv-tinta) 58%,transparent)}',
      '#pv-sec .pv-datos dd{font-family:var(--pv-tit);margin:1px 0 0;font-size:13.5px;',
      '  font-variant-numeric:tabular-nums;line-height:1.2;white-space:nowrap;',
      '  overflow:hidden;text-overflow:ellipsis}',
      '#pv-sec .pv-nota{margin-top:8px;padding-top:7px;',
      '  border-top:1px solid color-mix(in srgb,var(--pv-tinta) 22%,transparent)}',
      '#pv-sec .pv-nota dt{font-family:var(--pv-dat);font-size:7.5px;letter-spacing:.16em;',
      '  text-transform:uppercase;font-weight:600;margin:0;',
      '  color:color-mix(in srgb,var(--pv-tinta) 58%,transparent)}',
      '#pv-sec .pv-nota dd{font-family:var(--pv-cur);margin:2px 0 0;font-size:13px;',
      '  line-height:1.25;color:var(--pv-tinta)}',
      '#pv-sec .pv-voz{border:0;padding:12px 6px 11px;font:inherit;cursor:pointer;color:inherit;',
      '  display:flex;flex-direction:column;align-items:center;gap:9px;',
      '  border-left:1px solid color-mix(in srgb,var(--pv-tinta) 26%,transparent)}',
      '#pv-sec .pv-agujeros{position:absolute;left:-8px;top:0;bottom:0;width:16px;pointer-events:none;',
      '  background-image:radial-gradient(circle 3.6px at center,var(--sec-col,#fff) 96%,transparent 100%);',
      '  background-size:100% 15px;background-repeat:repeat-y}',
      /* gap 1px y no 2: con 2 las 26 rayitas no entran en los 90 px de alto y
         quedan todas clavadas en min-height. Ver la nota 2 de arriba. */
      '#pv-sec .pv-onda{flex:1;width:100%;display:flex;flex-direction:column;align-items:center;',
      '  justify-content:center;gap:1px;overflow:hidden}',
      '#pv-sec .pv-onda i{display:block;border-radius:1px;flex:1 1 0;min-height:2px;max-height:3.4px;',
      '  width:calc(max(0.16,var(--h)) * 88%);',
      '  background:color-mix(in srgb,var(--pv-tinta) 72%,transparent);',
      '  transition:background-color .16s linear}',
      '#pv-sec .pv-onda i.pv-ya{background:var(--pv-acento)}',
      '#pv-sec .pv-play{width:26px;height:26px;flex:none;border-radius:50%;display:flex;',
      '  align-items:center;justify-content:center;',
      '  border:1px solid color-mix(in srgb,var(--pv-tinta) 45%,transparent)}',
      /* SIN rotate: el triángulo ya viene mirando a la derecha. Ver la nota 1. */
      '#pv-sec .pv-play svg{width:9px;height:9px;color:var(--pv-tinta)}',
      '#pv-sec .pv-play .pv-pausa{display:none}',
      '#pv-sec .pv-tk.pv-son .pv-play svg{color:var(--pv-acento)}',
      '#pv-sec .pv-tk.pv-son .pv-play .pv-ply{display:none}',
      '#pv-sec .pv-tk.pv-son .pv-play .pv-pausa{display:block}',
      '#pv-sec .pv-tk.pv-son .pv-play{border-color:var(--pv-acento)}',
      '@keyframes pv-marco{0%{transform:rotate(0) scale(.985)}20%{transform:rotate(0) scale(.985)}',
      '  44%{transform:rotate(-4deg) scale(1.02)}72%{transform:rotate(-.2deg) scale(1)}',
      '  100%{transform:rotate(-1.1deg) scale(1)}}',
      '@keyframes pv-talon{0%{transform:none}20%{transform:translateX(-2px) rotate(-.6deg)}',
      '  44%{transform:translate(-7px,2px) rotate(-2.2deg)}',
      '  74%{transform:translate(.5px,0) rotate(.2deg)}100%{transform:none}}',
      '@keyframes pv-cuerpo{0%{transform:none}20%{transform:translateX(1px) rotate(.15deg)}',
      '  44%{transform:translate(2px,-1px) rotate(.5deg)}',
      '  74%{transform:translate(-.5px,0) rotate(-.1deg)}100%{transform:none}}',
      '@keyframes pv-voz{0%{transform:none}20%{transform:translateX(2px) rotate(.5deg)}',
      '  44%{transform:translate(4px,-1.5px) rotate(1.5deg)}',
      '  74%{transform:translate(-1px,0) rotate(-.2deg)}100%{transform:none}}',
      '#pv-sec .pv-tk.pv-troq{animation:pv-marco 1.15s cubic-bezier(.22,.9,.25,1) both}',
      '#pv-sec .pv-tk.pv-troq .pv-talon{animation:pv-talon 1.15s cubic-bezier(.22,.9,.25,1) both}',
      '#pv-sec .pv-tk.pv-troq .pv-cuerpo{animation:pv-cuerpo 1.15s cubic-bezier(.22,.9,.25,1) both}',
      '#pv-sec .pv-tk.pv-troq .pv-voz{animation:pv-voz 1.15s cubic-bezier(.22,.9,.25,1) both}',
      '#pv-sec .pv-tk.pv-troq .pv-talon,#pv-sec .pv-tk.pv-troq .pv-voz{',
      '  box-shadow:0 0 16px -7px rgba(0,0,0,.55)}',
      '@media (prefers-reduced-motion:reduce){',
      '  #pv-sec .pv-tk.pv-troq,#pv-sec .pv-tk.pv-troq .pv-talon,',
      '  #pv-sec .pv-tk.pv-troq .pv-cuerpo,#pv-sec .pv-tk.pv-troq .pv-voz{animation:none}',
      '  #pv-sec .pv-tk{transform:none}}'
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

    /* los colores salen de la paleta de la invitación; fx sólo pisa si trae algo.
       El papel va ACLARADO hacia el blanco: crudo salía lavanda fuerte contra las
       secciones vecinas (ver la nota 3 de arriba). */
    var st = sec.style;
    st.setProperty('--pv-papel',  txt(f.papel,  'color-mix(in srgb,var(--sage-cl) 34%,#fff)'));
    st.setProperty('--pv-tinta',  txt(f.tinta,  'var(--verde)'));
    st.setProperty('--pv-acento', txt(f.acento, f.metalico ? 'var(--oro)' : 'var(--sage)'));
    st.setProperty('--pv-tit', txt(f.letraTitulo, '"Cormorant Garamond",Georgia,serif'));
    st.setProperty('--pv-dat', txt(f.letraDatos,  '"Jost",system-ui,sans-serif'));
    st.setProperty('--pv-cur', txt(f.letraMano,   '"Dancing Script",cursive'));

    var departe = txt(f.departe), nota = txt(f.nota);

    sec.innerHTML =
      '<div class="pv-escena"><div class="pv-tk" id="pv-tk">' +
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
        '<button class="pv-voz" type="button" aria-label="Escuchar el mensaje de voz">' +
          '<span class="pv-agujeros" aria-hidden="true"></span>' +
          '<span class="pv-onda" aria-hidden="true"></span>' +
          '<span class="pv-play" aria-hidden="true">' +
            '<svg viewBox="0 0 10 10" fill="currentColor">' +
              '<polygon class="pv-ply" points="1.5,0.8 9,5 1.5,9.2"></polygon>' +
              '<g class="pv-pausa"><rect x="1.6" y="1" width="2.6" height="8"></rect>' +
              '<rect x="5.8" y="1" width="2.6" height="8"></rect></g>' +
            '</svg>' +
          '</span>' +
        '</button>' +
      '</div></div>';

    /* textContent y no innerHTML: lo que carga el cliente es texto, no HTML */
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

    /* dónde va: SIEMPRE dentro de .frame. Colgarla del body ya fue un bug. */
    var marco = document.querySelector('.frame');
    if (!marco) return;
    var antes = document.getElementById('contacto-sec') || document.getElementById('share-sec');
    if (antes && antes.parentNode === marco) marco.insertBefore(sec, antes);
    else marco.appendChild(sec);

    audio(sec, barras, f);
    troquelarAlVerse(sec);
  }

  /* ---- el sonido ---- */
  function audio(sec, barras, f) {
    var tk = sec.querySelector('.pv-tk');
    var au = document.createElement('audio');
    au.preload = 'none';                        /* el que no toca, no descarga */
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
      tk.classList.remove('pv-son');
      for (var k = 0; k < N; k++) barras[k].classList.remove('pv-ya');
      devolverLaMusica();
    }

    sec.querySelector('.pv-voz').addEventListener('click', function () {
      if (au.paused) {
        pausarLaMusica();
        tk.classList.add('pv-son');
        var p = au.play();
        if (p && p.then) p.then(function () { if (!raf) seguir(); }).catch(parar);
        else if (!raf) seguir();
      } else { au.pause(); parar(); }
    });
    au.addEventListener('ended', parar);
    au.addEventListener('error', parar);
  }

  /* ---- el troquelado: se despega cuando la sección entra en pantalla ---- */
  function troquelarAlVerse(sec) {
    var tk = sec.querySelector('.pv-tk'), hecho = false;
    function correr() {
      if (hecho) return; hecho = true;
      tk.classList.add('pv-troq');
      setTimeout(function () { tk.classList.remove('pv-troq'); }, 1250);
    }
    if (!window.IntersectionObserver) { correr(); return; }
    var io = new IntersectionObserver(function (e) {
      if (e[0] && e[0].isIntersecting) { correr(); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(tk);
  }

  /* ---- CUANDO SE MONTA -----------------------------------------------------
     /!\ ACA ESTUVO EL BUG QUE HIZO QUE EL TICKET NO APARECIERA NUNCA (4/9/2026).

     La primera version se colgaba de `window.addEventListener('inv-listo', ...)`.
     Ese evento NO EXISTE: lo invente yo. Buscado en todo el repo, la unica
     linea que lo nombraba era la que lo escuchaba. Asi que el modulo probaba UNA
     vez, en DOMContentLoaded --cuando `INVEV.fx` todavia esta vacio porque los
     datos llegan de Firestore un rato despues--, se iba por el `return` de
     "sin audio no hay pase", y no volvia a intentar jamas.

     Medido en la invitacion publicada: el dato estaba (audio, onda, encendido),
     el modulo estaba cargado, y `#pv-sec` no existia. Llamando `PV_montar()` a
     mano aparecia al instante.

     -> Ahora se hace como TODOS los demas modulos del repo (motivo.js,
        galeria.js, rsvp-muestra.js): se vuelve a pasar solo cada 400 ms.

     /!\ PERO NO SE REDIBUJA PORQUE SI. `montar()` borra y rehace la seccion: si
         se llamara en cada vuelta, cortaria el audio que esta sonando y
         redispararia la animacion del troquel cada 400 ms. Por eso primero se
         compara una HUELLA de los campos y solo se rehace si algo cambio, si
         falta la seccion debiendo estar, o si sobra debiendo no estar.
     -------------------------------------------------------------------------- */
  function arrancar() {
    try { montar(); } catch (e) {}
  }

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
      arrancar();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revisar);
  } else { revisar(); }
  setInterval(revisar, 400);

  window.PV_montar = montar;                    /* el panel lo llama al previsualizar */
})();
