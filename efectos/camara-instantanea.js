/* ===== LA CAMARITA: la cámara instantánea imprime el pase (4/11/2026) =========
   Maki, con un reel de byyoya_ («cuando la abres esta camarita…»): «tengo
   ésta que también me gustaría hacer» → «la otra muestra quiero ahora».

   QUÉ HACE: al irse el sobre aparece una cámara instantánea. El invitado toca
   «Tomar la foto»: flash, la cámara imprime una foto instantánea que sube por
   arriba, viene al frente y SE REVELA (de lechosa a color, como las de
   verdad). Abajo, escrito a mano, su pase: «Familia Iturbide · 2 lugares ·
   Mesa 7». Con el link general (sin invitado): los nombres y la fecha.
   Después, «Ver la invitación».

   EL DATO: fx.camara = { on, foto, camara, modelo, fondo, titulo, fotos:{token:url}, fotoMuestra }.
     foto   → la foto que se revela (vacío = la 1.ª de la galería, si no la portada)
     camara → la imagen de la cámara, fotografiada sobre BLANCO (se funde con
              multiply). Vacío = la azul de Invítame.
     titulo → el texto de arriba (vacío = «Tienes un recuerdo por revelar»).
   ⚠️ Es un ESPECIAL que se vende aparte, como la Misión secreta: apagado si no
      está `on` (no toca ninguna invitación entregada), vestir.js lo apaga al
      copiar una muestra y paquetes.js lo tiene como extra (`camara`).
   En una MUESTRA se ve siempre; en una invitación de verdad, una vez por
   pestaña. `?camara=0` la saltea, y el chequeo (?chequeo=1) también.
   Si la Misión secreta también está prendida, la cámara va DESPUÉS del
   expediente.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invCamara) return; window.__invCamara = 1;
  var CLc = 'https://res.cloudinary.com/oc8cgqt4/image/upload/';
  /* 4/11, Maki: «hacé 10 versiones de cámaras completamente diferentes».
     fx.camara.modelo elige una; todas son PNG recortados en invitame/camara/.
     La lista la usa también el panel (window.INVCAMARAS). */
  var CAMARAS = [
    ['azul',     'Azul empolvado',          'cam-azul-recorte'],
    ['plegable', 'Plegable vintage crema',  'cam-01-recorte'],
    ['cereza',   'Retro rojo cereza',       'cam-02-recorte'],
    ['rosegold', 'Oro rosa con perlas',     'cam-03-recorte'],
    ['negra',    'Negra y oro',             'cam-04-recorte'],
    ['rosa',     'Rosa con corazón',        'cam-05-recorte'],
    ['menta',    'Menta ochentera',         'cam-06-recorte'],
    ['madera',   'Nogal y bronce',          'cam-07-recorte'],
    ['cristal',  'Cristal transparente',    'cam-08-recorte'],
    ['lila',     'Lila con flores en relieve', 'cam-09-recorte'],
    ['deco',     'Cromo art déco',          'cam-10-recorte']
  ];
  window.INVCAMARAS = CAMARAS.map(function (c) { return { id: c[0], nombre: c[1], url: CLc + 'q_auto,f_auto,w_760/invitame/camara/' + c[2], mini: CLc + 'q_auto,f_auto,w_160/invitame/camara/' + c[2] }; });

  if (!/\/i\//.test(location.pathname)) return;
  if (/[?&](camara=0|chequeo=1)/.test(location.search)) return;
  try { if (window.top !== window.self && !/[?&]camara=1/.test(location.search)) return; } catch (e) { return; }

  var CL = 'https://res.cloudinary.com/oc8cgqt4/image/upload/';
  var CAM_DEF = CL + 'q_auto,f_auto,w_760/invitame/camara/cam-azul-recorte';   /* PNG recortado: fondo transparente */
  function imgCamara() {
    var q = (location.search.match(/[?&]camaramodelo=([a-z]+)/) || [])[1];   /* para mirar un modelo sin tocar el panel */
    if (C.camara && !q) return C.camara;
    var m = window.INVCAMARAS.filter(function (c) { return c.id === (q || C.modelo); })[0];
    return m ? m.url : CAM_DEF;
  }
  var EV, C;

  function si(v) { return v === true || v === 'true' || v === 1 || v === '1'; }
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function esMuestra() {
    var m = (EV && EV.fx && EV.fx.muestra) || {};
    var s = function (v) { return v === true || String(v) === '1' || /^(si|sí|true)$/i.test(String(v || '')); };
    return s(m.venta) || s(m.rsvp) || /[?&]muestra=1/.test(location.search);
  }
  function clave() { return 'inv-camara-' + (EV.slug || 'x'); }
  function yaVista() { if (esMuestra()) return false; try { return sessionStorage.getItem(clave()) === '1'; } catch (e) { return false; } }
  function marcar() { if (esMuestra()) return; try { sessionStorage.setItem(clave(), '1'); } catch (e) {} }

  /* 4/11, Maki: «prefiero que suban al panel una foto personalizada». La foto
     de CADA invitado se carga en el panel (pestaña INVITADOS → «Fotos para la
     camarita») y se guarda en fx.camara.fotos[token]. Si el invitado no tiene,
     se revela la de los novios. En la muestra (sin invitado) va fotoMuestra. */
  function token() { try { return (window.INVDATA && window.INVDATA.token) || (location.search.match(/[?&]g=([^&]+)/) || [])[1] || ''; } catch (e) { return ''; } }
  function fotoInvitado() {
    var f = C.fotos || {}, t = token();
    if (t && f[t]) return f[t];
    if (!t && esMuestra() && C.fotoMuestra) return C.fotoMuestra;
    return '';
  }
  function fotoRevelar() {
    var u = fotoInvitado() || C.foto || '';
    if (!u && EV.galeria && EV.galeria.length) { u = EV.galeria[0]; if (u && typeof u === 'object') u = u.url || u.src || ''; }
    if (!u) u = EV.cover || '';
    if (/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(u)) {
      u = u.replace(/\/image\/upload\/(?:[^/]*[,_][^/]*\/)*/, '/image/upload/');
      u = u.replace('/image/upload/', '/image/upload/c_fill,g_faces,w_640,h_640,q_auto,f_auto/');
    }
    return u;
  }
  function txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : ''; }
  function fechaCorta() {
    var m = String(EV.fecha || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? (m[3] + '.' + m[2] + '.' + m[1]) : '';
  }
  function leyenda() {
    var nombre = txt('pv-gname'), per = txt('pv-per'), mesa = txt('pv-mesa');
    var pareja = [EV.n1 || EV.pnom || '', EV.n2 || ''].filter(Boolean).join(' & ');
    if (nombre) {
      var l2 = [];
      if (per) l2.push(per + (per === '1' ? ' lugar reservado' : ' lugares reservados'));
      if (mesa) l2.push('Mesa ' + mesa);
      return [nombre, l2.join(' · ') || pareja];
    }
    return [pareja || '¡Te esperamos!', fechaCorta()];
  }

  function estilos() {
    if (document.getElementById('cam-css')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Jost:wght@400;500&display=swap';
    document.head.appendChild(l);
    var s = document.createElement('style'); s.id = 'cam-css';
    s.textContent = [
      '.cam-ov{position:fixed;inset:0;z-index:99988;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 18px;opacity:0;transition:opacity .6s;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;',
      '  background:radial-gradient(ellipse at 50% 38%,#FFFFFF 0%,#F4F1EA 55%,#E9E3D6 100%)}',
      '.cam-ov.on{opacity:1}.cam-ov.fuera{opacity:0;pointer-events:none}',
      /* 4/11, Maki: «ponele onda al fondo, lo dejaste blanco pelado». Detrás va
         el FONDO DE LA INVITACIÓN (su video o su foto), suavizado, con una luz
         clara en el centro para que el texto se lea, y luces que flotan. */
      '.cam-bg{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}',
      '.cam-bg video,.cam-bg .cam-bgi{position:absolute;inset:-12px;width:calc(100% + 24px);height:calc(100% + 24px);object-fit:cover;background:center/cover no-repeat;filter:blur(5px) saturate(1.05);transform:scale(1.04);animation:camRespira 14s ease-in-out infinite alternate}',
      '@keyframes camRespira{to{transform:scale(1.12) translate(-1.5%,-1%)}}',
      '.cam-bg:after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 70% 55% at 50% 42%,rgba(255,255,255,.78) 0%,rgba(255,255,255,.45) 55%,rgba(255,255,255,.08) 100%)}',
      '.cam-luz{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,250,235,.95),rgba(255,250,235,0) 70%);opacity:0;animation:camLuz linear infinite}',
      '@keyframes camLuz{0%{opacity:0;transform:translateY(0) scale(.6)}20%{opacity:.9}80%{opacity:.7}100%{opacity:0;transform:translateY(-140px) scale(1.1)}}',
      '.cam-ov>*:not(.cam-bg){position:relative;z-index:2}',
      '.cam-k,.cam-t{text-shadow:0 1px 10px rgba(255,255,255,.9)}',
      '.cam-k{font:500 11.5px/1.4 Jost,sans-serif;letter-spacing:.32em;text-transform:uppercase;color:#4A5568;margin-bottom:6px;text-align:center}',
      '.cam-t{font:700 34px/1.05 Caveat,cursive;color:#2B3A55;margin:0 0 14px;text-align:center}',
      /* 4/11, prueba: con la foto DETRÁS y la cámara en multiply, la foto se veía a
         través de la cámara y tapaba el botón. Ahora la cámara es un PNG
         recortado (opaco) y la foto vive en una RANURA con overflow:hidden cuyo
         borde de abajo está en el canto de arriba de la cámara: es invisible
         hasta que se imprime y sube. */
      '.cam-escena{position:relative;width:min(290px,74vw);margin:min(190px,50vw) auto 0}',
      '.cam-img{position:relative;display:block;width:100%;height:auto;z-index:3;transition:transform .15s;cursor:pointer;filter:drop-shadow(0 18px 22px rgba(43,58,85,.22))}',
      '.cam-escena.dispara .cam-img{animation:camSacude .35s}',
      '@keyframes camSacude{30%{transform:translateY(3px) scale(.985)}60%{transform:translateY(-2px)}}',
      '.cam-ranura{position:absolute;left:21%;width:58%;bottom:90%;height:160%;overflow:hidden;z-index:2;pointer-events:none}',
      '.cam-pol{position:absolute;left:0;bottom:0;width:100%;box-sizing:border-box;background:#FDFCF8;padding:7% 6% 10%;box-shadow:0 10px 26px -10px rgba(0,0,0,.45);transform:translateY(102%);transition:transform 2.4s cubic-bezier(.25,.8,.3,1);border-radius:2px}',
      '.cam-pol .cam-foto{width:100%;aspect-ratio:1/1;background:#d9dcd6 center/cover no-repeat;filter:brightness(1.9) saturate(0) contrast(.35) blur(2px);transition:filter 4.2s ease-out}',
      '.cam-pol.revela .cam-foto{filter:none}',
      '.cam-pol .cam-l1,.cam-pol .cam-l2{font-family:Caveat,cursive;color:#2B3A55;text-align:center;opacity:0;transition:opacity 1.2s 1.6s;line-height:1.05}',
      '.cam-pol .cam-l1{font-size:clamp(20px,6vw,28px);font-weight:700;margin-top:6%}',
      '.cam-pol .cam-l2{font-size:clamp(14px,4.2vw,18px);font-weight:500;margin-top:2%}',
      '.cam-pol.revela .cam-l1,.cam-pol.revela .cam-l2{opacity:1}',
      '.cam-pol.sale{transform:translateY(6%)}',
      /* al frente: la foto deja la cámara y viene a la mano del invitado */
      '.cam-pol.frente{position:fixed;left:50%;top:46%;bottom:auto;width:min(300px,74vw);margin:0;z-index:99990;transform:translate(-50%,-50%) rotate(-3deg);transition:transform .9s cubic-bezier(.2,.8,.2,1),width .9s,top .9s,left .9s}',
      '.cam-flash{position:fixed;inset:0;background:#fff;z-index:99995;opacity:0;pointer-events:none}',
      '.cam-flash.va{animation:camFlash .55s ease-out}',
      '@keyframes camFlash{0%{opacity:0}12%{opacity:1}100%{opacity:0}}',
      '.cam-b{display:inline-block;border:0;border-radius:999px;padding:14px 26px;font:500 13px/1 Jost,sans-serif;letter-spacing:.22em;text-transform:uppercase;cursor:pointer;margin-top:22px;background:#2B3A55;color:#fff;box-shadow:0 12px 24px -12px rgba(43,58,85,.8)}',
      '.cam-b.late{animation:camLate 1.6s ease-in-out infinite}',
      '@keyframes camLate{50%{transform:scale(1.05)}}',
      '.cam-b2{background:transparent;border:0;margin-top:10px;font:500 11.5px/1 Jost,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#4A5568;text-decoration:underline;cursor:pointer}',
      '.cam-ver{position:fixed;left:50%;bottom:7%;transform:translateX(-50%);z-index:99991;opacity:0;transition:opacity .8s;margin:0;pointer-events:none}',
      '.cam-ver.v{opacity:1;pointer-events:auto}',   /* invisible NO se toca: estaba encima de «Tomar la foto» */
      '.cam-ov .cam-b,.cam-ver{font-family:Jost,sans-serif!important;white-space:nowrap}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* el «clic» y el motorcito, con WebAudio (sin archivos; en silencio si no se puede) */
  function sonido() {
    try {
      var A = window.AudioContext || window.webkitAudioContext; if (!A) return;
      var a = new A(), t = a.currentTime;
      var n = a.createBuffer(1, a.sampleRate * 0.06, a.sampleRate), d = n.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      var s = a.createBufferSource(); s.buffer = n; var g = a.createGain(); g.gain.value = 0.5;
      s.connect(g); g.connect(a.destination); s.start(t);
      var o = a.createOscillator(), g2 = a.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(95, t + 0.25); o.frequency.linearRampToValueAtTime(70, t + 1.9);
      g2.gain.setValueAtTime(0.0001, t + 0.25); g2.gain.linearRampToValueAtTime(0.035, t + 0.4); g2.gain.linearRampToValueAtTime(0.0001, t + 1.9);
      o.connect(g2); g2.connect(a.destination); o.start(t + 0.25); o.stop(t + 2);
    } catch (e) {}
  }

  function fondo() {
    var bg = h('div', 'cam-bg'), f = (EV.fx && EV.fx.fondo) || {}, quiere = C.fondo || 'invitacion';
    if (quiere === 'liso') return bg;
    var vid = '', img = '';
    if (/^https?:/.test(quiere)) img = quiere;
    else if (f.tipo === 'video' && f.url) { vid = f.url; img = f.poster || ''; }
    else img = f.url || f.poster || EV.cover || '';
    var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    if (vid && !reduce) {
      var v = document.createElement('video'); v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
      v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); if (img) v.poster = img; v.src = vid;
      bg.appendChild(v); try { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {}
    } else if (img) { var d = h('div', 'cam-bgi'); d.style.backgroundImage = 'url("' + img + '")'; bg.appendChild(d); }
    for (var i = 0; i < 14; i++) {
      var l = h('span', 'cam-luz'), sz = 8 + Math.random() * 26;
      l.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;left:' + (Math.random() * 100) + '%;top:' + (35 + Math.random() * 60) + '%;animation-duration:' + (6 + Math.random() * 7) + 's;animation-delay:' + (-Math.random() * 10) + 's';
      bg.appendChild(l);
    }
    return bg;
  }

  function mostrar(debajo) {
    estilos();
    var ov = h('div', 'cam-ov');
    ov.appendChild(fondo());
    var kk = h('div', 'cam-k', 'Antes de entrar'), tt = h('div', 'cam-t', C.titulo || 'Tienes un recuerdo por revelar');
    ov.appendChild(kk); ov.appendChild(tt);
    var esc = h('div', 'cam-escena');
    var pol = h('div', 'cam-pol'), foto = h('div', 'cam-foto');
    foto.style.backgroundImage = 'url("' + fotoRevelar() + '")';
    var l1 = h('div', 'cam-l1', ''), l2 = h('div', 'cam-l2', '');
    pol.appendChild(foto); pol.appendChild(l1); pol.appendChild(l2);
    var cam = h('img', 'cam-img'); cam.src = imgCamara(); cam.alt = '';
    var ranura = h('div', 'cam-ranura'); ranura.appendChild(pol);
    esc.appendChild(ranura); esc.appendChild(cam);
    ov.appendChild(esc);
    var b = h('button', 'cam-b late', '📸 Tomar la foto'); b.type = 'button';
    var b2 = h('button', 'cam-b2', 'Ver la invitación directo'); b2.type = 'button';
    if (debajo) ov.style.zIndex = '99';   /* debajo del sobre (#env, z 100): al abrirse ya está la cámara */
    ov.appendChild(b); ov.appendChild(b2);
    var flash = h('div', 'cam-flash'); document.body.appendChild(flash);
    document.body.appendChild(ov);
    requestAnimationFrame(function () { requestAnimationFrame(function () { ov.classList.add('on'); }); });

    var hecho = false;
    function disparar() {
      if (hecho) return; hecho = true;
      var L = leyenda(); l1.textContent = L[0]; l2.textContent = L[1];   /* recién ahora: el pase ya está escrito */
      foto.style.backgroundImage = 'url("' + fotoRevelar() + '")';
      b.style.visibility = 'hidden'; b2.style.visibility = 'hidden';
      /* 4/11, Maki: «cuando sale la foto tapa el texto, no me gusta». El texto
         de arriba es la consigna: al disparar se va, y la foto sale sola. */
      [kk, tt].forEach(function (e) { e.style.transition = 'opacity .5s, transform .5s'; e.style.opacity = '0'; e.style.transform = 'translateY(-10px)'; });
      sonido();
      try { if (navigator.vibrate) navigator.vibrate(40); } catch (e) {}
      flash.classList.add('va'); esc.classList.add('dispara');
      setTimeout(function () { pol.classList.add('sale'); }, 450);
      /* sale por arriba (2,4 s) y después viene al frente */
      setTimeout(function () {
        var r = pol.getBoundingClientRect();
        document.body.appendChild(pol);
        pol.style.transition = 'none';
        pol.style.position = 'fixed'; pol.style.left = (r.left + r.width / 2) + 'px'; pol.style.top = (r.top + r.height / 2) + 'px'; pol.style.bottom = 'auto';
        pol.style.width = r.width + 'px'; pol.style.margin = '0'; pol.style.transform = 'translate(-50%,-50%)'; pol.style.zIndex = '99990';
        void pol.offsetWidth;
        pol.style.transition = '';
        pol.style.left = ''; pol.style.top = ''; pol.style.width = ''; pol.style.transform = '';
        pol.className = 'cam-pol frente';
        esc.style.transition = 'opacity .6s'; esc.style.opacity = '0.0';
        setTimeout(function () { pol.classList.add('revela'); }, 500);
      }, 3000);
      setTimeout(function () { ver.classList.add('v'); }, 6800);
    }
    b.onclick = disparar; cam.onclick = disparar;
    var ver = h('button', 'cam-b cam-ver', 'Ver la invitación'); ver.type = 'button';
    document.body.appendChild(ver);
    function cerrar() {
      marcar();
      ov.classList.add('fuera'); ver.classList.remove('v');
      pol.style.transition = 'transform .7s ease-in, opacity .7s'; pol.style.transform = 'translate(-50%,40%) rotate(8deg) scale(.6)'; pol.style.opacity = '0';
      setTimeout(function () { [ov, ver, pol, flash].forEach(function (e) { if (e.parentNode) e.parentNode.removeChild(e); }); }, 800);
    }
    ver.onclick = cerrar;
    b2.onclick = cerrar;
    return ov;
  }

  /* ---------- arranque: cuando se va el sobre (y el expediente, si hay misión) ---------- */
  function tapado() {
    var velo = document.getElementById('col-sobre-velo');
    if (velo && velo.isConnected && Number(getComputedStyle(velo).opacity) > 0.6) return true;
    if (document.querySelector('.ms-ov')) return true;   /* la Misión secreta va primero */
    var env = document.getElementById('env');
    if (!env || !env.isConnected || env.classList.contains('gone')) return false;
    var cs = getComputedStyle(env);
    return !(cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.5);
  }
  /* 4/11, Maki: «cuando abre el sobre y llega la cámara se ve un salto de la
     foto de la portada». La cámara aparecía ~1 s DESPUÉS de irse el sobre y en
     ese hueco se veía la portada. Ahora se arma apenas carga, DEBAJO del sobre
     (z 99 < 100): al abrirse el sobre lo que hay detrás ya es la cámara, y
     cuando el sobre se va del todo sube a su capa. Con la Misión secreta
     prendida sigue esperando a que se cierre el expediente. */
  var t0 = Date.now(), quieto = 0, montado = null, iv = setInterval(function () {
    EV = window.INVEV;
    if (!EV) { if (Date.now() - t0 > 30000) clearInterval(iv); return; }
    C = (EV.fx && EV.fx.camara) || {};
    if (!si(C.on)) { if (Date.now() - t0 > 15000) clearInterval(iv); return; }
    if (!document.querySelector('section[data-sec="eventos"]')) return;
    if (yaVista()) { clearInterval(iv); return; }
    var conMision = si(((EV.fx || {}).mision || {}).on);
    if (!montado && !conMision) { montado = mostrar(true); }
    if (tapado()) { quieto = 0; return; }
    if (conMision && ++quieto < 5) return;   /* el expediente aparece unos ms después del sobre */
    clearInterval(iv);
    if (montado) montado.style.zIndex = '';
    else mostrar();
  }, 120);
})();
