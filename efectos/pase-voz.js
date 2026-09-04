/* ===== PASE CON VOZ =========================================================
   El boleto con el mensaje de voz de los anfitriones. Son DOS piezas: el
   ticket, y una TIRA ARRANCADA que queda apoyada abajo con el mensaje.

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

   ⚠️ `departe` y `nota` ENGORDAN EL TICKET. Vienen vacíos a propósito.

   ───────────────────────────────────────────────────────────────────────────
   POR QUÉ SON DOS PIEZAS Y NO UNA  (4/9/2026)

   Maki mandó una referencia (admit-two.replit.app) y preguntó: «¿viste que el
   ticket se rompe y se acomoda ahí abajo?». Medida cuadro por cuadro en el
   video: el boleto arriba con su talón vertical, y DEBAJO —girada al revés y
   un poco montada— una tira arrancada que lleva la onda y el play.

   No es sólo estética: ARREGLA EL PEOR DEFECTO QUE TENÍA ESTO.

   La primera versión metía la onda en una columna VERTICAL de 60 px. Ahí no
   entra: 26 rayitas en 90 px de alto quedaban de 1,5 px cada una, todas
   clavadas en su mínimo, y se leía como una huella digital. Ya lo habíamos
   parcheado bajando la separación a 1 px, y seguía siendo lo más flojo.

   En una tira HORIZONTAL la onda tiene todo el ancho, las rayitas van paradas
   y la ALTURA codifica el volumen — que es exactamente como se ve un audio de
   WhatsApp. Se entiende sin que nadie lo explique.

   ⚠️ EL BORDE TIENE QUE SER PAPEL ROTO, NO UN CORTE DE TIJERA. Un borde recto
      —o un serrucho parejo— se lee como recortado. Por eso `DIENTES` tiene
      alturas IRREGULARES, con alguno más profundo que el resto.
   ⚠️ Y NO ALCANZA CON QUE EXISTAN: TIENEN QUE VERSE. La primera versión los
      hacía de 17% sobre una tira muy montada bajo el boleto, y el boleto los
      tapaba enteros (medido: pisaba 26 px, los dientes median 11). En pantalla
      quedaba un rectángulo perfecto — justo lo que no queremos. Ahora la tira
      apenas se monta 3 px y los dientes van al 26%.
   ⚠️ Y LOS DIENTES SON FIJOS, NO AL AZAR. Si se sortearan, la tira cambiaría
      de forma en cada recarga y en cada redibujado. Un papel roto se rompe una
      sola vez.
   ⚠️ `clip-path` + `filter:drop-shadow` en el mismo elemento es a propósito: la
      sombra sigue el borde roto. Con `box-shadow` saldría un rectángulo y se
      arruina todo el efecto.
   ========================================================================== */
(function () {
  'use strict';

  var N = 26;                                   /* rayitas de la onda */
  var ABC = '0123456789abcdefghijklmnopqrstuvwxyz';

  /* ---- el borde arrancado --------------------------------------------------
     Una tijera deja un corte recto y se nota. El papel roto tiene dientes
     IRREGULARES: distinta altura, distinto ancho, y alguno mas profundo.
     Los numeros son fijos (ver la nota de arriba). */
  var DIENTES = [
    0.00, 0.62, 0.18, 0.85, 0.35, 1.00, 0.28, 0.72, 0.10, 0.55,
    0.30, 0.92, 0.42, 0.68, 0.15, 0.80, 0.25, 0.58, 0.05, 0.75,
    0.38, 0.95, 0.20, 0.65, 0.12, 0.88, 0.32, 0.70, 0.08, 0.50
  ];
  function recorteDeRotura(alturaPct) {
    var n = DIENTES.length, p = [], i, x;
    for (i = 0; i < n; i++) {
      x = (i / (n - 1)) * 100;
      p.push(x.toFixed(2) + '% ' + (DIENTES[i] * alturaPct).toFixed(2) + '%');
    }
    p.push('100% 100%', '0% 100%');
    return 'polygon(' + p.join(',') + ')';
  }

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
      '#pv-sec .pv-escena{display:flex;flex-direction:column;align-items:stretch;',
      '  max-width:352px;margin:0 auto;padding:8px 0 4px}',

      /* ---- EL BOLETO: talon + cuerpo. La perforacion va entre los dos. ---- */
      '#pv-sec .pv-tk{--perf:52px;--notch:9px;position:relative;',
      '  display:grid;grid-template-columns:52px 1fr;color:var(--pv-tinta);',
      '  transform:rotate(-1.6deg);border-radius:7px;overflow:hidden;background:transparent;',
      '  filter:drop-shadow(0 14px 22px rgba(40,32,20,.34));',
      '  -webkit-mask:radial-gradient(circle var(--notch) at var(--perf) 0,transparent 98%,#000 100%),',
      '    radial-gradient(circle var(--notch) at var(--perf) 100%,transparent 98%,#000 100%);',
      '  -webkit-mask-composite:source-in;',
      '  mask:radial-gradient(circle var(--notch) at var(--perf) 0,transparent 98%,#000 100%),',
      '    radial-gradient(circle var(--notch) at var(--perf) 100%,transparent 98%,#000 100%);',
      '  mask-composite:intersect}',
      '#pv-sec .pv-talon,#pv-sec .pv-cuerpo{background:var(--pv-papel);position:relative}',
      '#pv-sec .pv-talon::before,#pv-sec .pv-cuerpo::before{content:"";',
      '  position:absolute;inset:7px;pointer-events:none;',
      '  border:1px solid color-mix(in srgb,var(--pv-tinta) 20%,transparent)}',
      '#pv-sec .pv-talon::before{inset:7px 0 7px 12px;border-right:0}',
      '#pv-sec .pv-cuerpo::before{inset:7px 12px 7px 0;border-left:0}',
      '#pv-sec .pv-talon{display:flex;align-items:center;justify-content:center;padding:14px 0;',
      '  border-right:1px dashed color-mix(in srgb,var(--pv-tinta) 34%,transparent)}',
      '#pv-sec .pv-talon span{writing-mode:vertical-rl;transform:rotate(180deg);',
      '  font-family:var(--pv-tit);font-size:15px;letter-spacing:.09em;text-transform:uppercase;',
      '  color:var(--pv-tinta);white-space:nowrap;overflow:hidden;line-height:1}',
      '#pv-sec .pv-cuerpo{padding:14px 16px 13px;display:flex;flex-direction:column;min-width:0}',
      '#pv-sec .pv-over{font-family:var(--pv-dat);font-size:8px;letter-spacing:.16em;',
      '  text-transform:uppercase;font-weight:600;color:var(--pv-acento);margin:0;line-height:1.35}',
      '#pv-sec .pv-titulo{font-family:var(--pv-tit);font-weight:600;line-height:1.08;margin:4px 0 0;',
      '  font-size:clamp(18px,5.2vw,23px);letter-spacing:-.005em}',
      '#pv-sec .pv-departe{font-family:var(--pv-cur);font-size:14px;margin:4px 0 0;',
      '  color:var(--pv-acento);line-height:1.2}',
      '#pv-sec .pv-datos{display:grid;grid-template-columns:1.45fr 1fr;gap:0 10px;margin-top:9px}',
      '#pv-sec .pv-datos dt{font-family:var(--pv-dat);font-size:7.5px;letter-spacing:.16em;',
      '  text-transform:uppercase;font-weight:600;margin:0;',
      '  color:color-mix(in srgb,var(--pv-tinta) 58%,transparent)}',
      '#pv-sec .pv-datos dd{font-family:var(--pv-tit);margin:1px 0 0;font-size:13.5px;',
      '  font-variant-numeric:tabular-nums;line-height:1.2;white-space:nowrap;',
      '  overflow:hidden;text-overflow:ellipsis}',
      '#pv-sec .pv-nota{margin-top:9px;padding-top:7px;',
      '  border-top:1px solid color-mix(in srgb,var(--pv-tinta) 22%,transparent)}',
      '#pv-sec .pv-nota dt{font-family:var(--pv-dat);font-size:7.5px;letter-spacing:.16em;',
      '  text-transform:uppercase;font-weight:600;margin:0;',
      '  color:color-mix(in srgb,var(--pv-tinta) 58%,transparent)}',
      '#pv-sec .pv-nota dd{font-family:var(--pv-cur);margin:2px 0 0;font-size:13px;',
      '  line-height:1.25;color:var(--pv-tinta)}',

      /* ---- LA TIRA ARRANCADA: cuelga abajo, girada al reves y montada ---- */
      '#pv-sec .pv-tira{position:relative;z-index:2;display:flex;align-items:center;gap:11px;',
      '  width:80%;max-width:272px;margin:-3px 18px 0 auto;',
      '  padding:15px 15px 11px;border:0;font:inherit;color:var(--pv-tinta);',
      '  cursor:pointer;text-align:left;background:var(--pv-papel);',
      '  transform:rotate(2.6deg);',
      '  filter:drop-shadow(0 10px 16px rgba(40,32,20,.34))}',
      '#pv-sec .pv-tira::after{content:"";position:absolute;left:9px;right:9px;bottom:6px;',
      '  height:1px;background:color-mix(in srgb,var(--pv-tinta) 16%,transparent)}',

      /* el play */
      '#pv-sec .pv-play{width:27px;height:27px;flex:none;border-radius:50%;display:flex;',
      '  align-items:center;justify-content:center;',
      '  border:1px solid color-mix(in srgb,var(--pv-tinta) 45%,transparent)}',
      '#pv-sec .pv-play svg{width:9px;height:9px;color:var(--pv-tinta)}',
      '#pv-sec .pv-play .pv-pausa{display:none}',
      '#pv-sec .pv-tira.pv-son .pv-play svg{color:var(--pv-acento)}',
      '#pv-sec .pv-tira.pv-son .pv-play .pv-ply{display:none}',
      '#pv-sec .pv-tira.pv-son .pv-play .pv-pausa{display:block}',
      '#pv-sec .pv-tira.pv-son .pv-play{border-color:var(--pv-acento)}',

      /* ⚠️ LA ONDA VA HORIZONTAL Y LA ALTURA ES EL VOLUMEN. Vertical no entraba
         (ver la nota grande de arriba). */
      '#pv-sec .pv-onda{flex:1;height:23px;min-width:0;display:flex;align-items:center;',
      '  gap:2px;overflow:hidden}',
      '#pv-sec .pv-onda i{display:block;flex:1 1 0;min-width:1.5px;border-radius:2px;',
      '  height:calc(max(0.14,var(--h)) * 100%);',
      '  background:color-mix(in srgb,var(--pv-tinta) 66%,transparent);',
      '  transition:background-color .16s linear}',
      '#pv-sec .pv-onda i.pv-ya{background:var(--pv-acento)}',

      /* ---- SE ROMPE Y SE ACOMODA ----
         El boleto pega el tiron hacia arriba; la tira nace PEGADA a el (misma
         rotacion, corrida hacia adentro), se despega, cae y se asienta. */
      '@keyframes pv-tk-rompe{0%{transform:rotate(-1.6deg) translateY(7px)}',
      '  22%{transform:rotate(-1.6deg) translateY(7px)}',
      '  52%{transform:rotate(-3.6deg) translateY(-4px)}',
      '  100%{transform:rotate(-1.6deg) translateY(0)}}',
      '@keyframes pv-tira-cae{0%{transform:rotate(-1.6deg) translate(-22px,-19px);opacity:0}',
      '  22%{transform:rotate(-1.6deg) translate(-22px,-19px);opacity:0}',
      '  38%{opacity:1}',
      '  62%{transform:rotate(5.2deg) translate(6px,5px)}',
      '  100%{transform:rotate(2.6deg) translate(0,0);opacity:1}}',
      '#pv-sec .pv-escena.pv-troq .pv-tk{',
      '  animation:pv-tk-rompe 1.25s cubic-bezier(.22,.9,.25,1) both}',
      '#pv-sec .pv-escena.pv-troq .pv-tira{',
      '  animation:pv-tira-cae 1.25s cubic-bezier(.22,.9,.25,1) both}',

      '@media (prefers-reduced-motion:reduce){',
      '  #pv-sec .pv-escena.pv-troq .pv-tk,#pv-sec .pv-escena.pv-troq .pv-tira{animation:none}',
      '  #pv-sec .pv-tk{transform:none}#pv-sec .pv-tira{transform:none;margin-right:0}}'
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
       secciones vecinas. */
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
        '<button class="pv-tira" type="button" aria-label="Escuchar el mensaje de voz">' +
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

    /* el borde roto: se calcula acá y va inline, porque depende del alto */
    var tira = sec.querySelector('.pv-tira');
    /* 26% y no 17%: con dientes chicos y la tira muy montada, el borde roto
       quedaba TAPADO por el boleto y se leia como un corte de tijera. Medido:
       el boleto pisaba 26 px y los dientes median 11. */
    tira.style.clipPath = recorteDeRotura(26);
    tira.style.webkitClipPath = recorteDeRotura(26);

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
    romperAlVerse(sec);
  }

  /* ---- el sonido ---- */
  function audio(sec, barras, f) {
    var tira = sec.querySelector('.pv-tira');
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
      tira.classList.remove('pv-son');
      for (var k = 0; k < N; k++) barras[k].classList.remove('pv-ya');
      devolverLaMusica();
    }

    tira.addEventListener('click', function () {
      if (au.paused) {
        pausarLaMusica();
        tira.classList.add('pv-son');
        var p = au.play();
        if (p && p.then) p.then(function () { if (!raf) seguir(); }).catch(parar);
        else if (!raf) seguir();
      } else { au.pause(); parar(); }
    });
    au.addEventListener('ended', parar);
    au.addEventListener('error', parar);
  }

  /* ---- la rotura: se dispara cuando la sección entra en pantalla ---- */
  function romperAlVerse(sec) {
    var escena = sec.querySelector('.pv-escena'), hecho = false;
    function correr() {
      if (hecho) return; hecho = true;
      escena.classList.add('pv-troq');
      setTimeout(function () { escena.classList.remove('pv-troq'); }, 1350);
    }
    if (!window.IntersectionObserver) { correr(); return; }
    var io = new IntersectionObserver(function (e) {
      if (e[0] && e[0].isIntersecting) { correr(); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(escena);
  }

  /* ---- CUANDO SE MONTA -----------------------------------------------------
     /!\ ACA ESTUVO EL BUG QUE HIZO QUE EL TICKET NO APARECIERA NUNCA (4/9/2026).

     La primera version se colgaba de `window.addEventListener('inv-listo', ...)`.
     Ese evento NO EXISTE: lo invente yo. Buscado en todo el repo, la unica
     linea que lo nombraba era la que lo escuchaba. Asi que el modulo probaba UNA
     vez, en DOMContentLoaded --cuando `INVEV.fx` todavia esta vacio porque los
     datos llegan de Firestore un rato despues--, se iba por el `return` de
     "sin audio no hay pase", y no volvia a intentar jamas.

     -> Ahora se hace como TODOS los demas modulos del repo (motivo.js,
        galeria.js, rsvp-muestra.js): se vuelve a pasar solo cada 400 ms.

     /!\ PERO NO SE REDIBUJA PORQUE SI. `montar()` borra y rehace la seccion: si
         se llamara en cada vuelta, cortaria el audio que esta sonando y
         redispararia la rotura cada 400 ms. Por eso primero se compara una
         HUELLA de los campos y solo se rehace si algo cambio, si falta la
         seccion debiendo estar, o si sobra debiendo no estar.
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
