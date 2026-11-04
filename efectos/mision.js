/* ===== MISIÓN SECRETA (3/11/2026) ===========================================
   Maki, con dos reels de la competencia («Misión Secreta»): «averiguá por todos
   lados qué podemos hacer copado interactivo para una invi así» → «sí, dale».

   QUÉ ES: la invitación se RESUELVE en vez de leerse. Al irse el sobre aparece
   el expediente clasificado:
     1. IDENTIFICATE — el invitado apoya el dedo y lo «escanea» (mantener
        apretado ~1,3 s; no es una huella de verdad, anda en cualquier celular
        y no pide permisos).
     2. DOS PUERTAS — «Aceptar la misión» o «Ver la invitación sin juegos»
        (la abuela con un toque ve todo).
     3. Si acepta, tres secciones quedan cerradas hasta resolverlas:
          · Dónde y cuándo  → CAJA FUERTE   (clave: día y mes de la fiesta)
          · Mesa de regalos → CRIPTEX       (palabra: el nombre de quien festeja)
          · Galería / Live  → FOTO PARTIDA  (rompecabezas 3×3, tocar dos y se cambian)
        Arriba, la barra de medallas. Al cumplir todo: «Misión final: confirmá».
     4. NUNCA bloquea la información: a los 2 intentos aparece la pista, a los
        3 «Abrir igual». La foto partida tiene «Abrir igual» a los 40 s.

   EL DATO: fx.mision = { on, codigo, pistaCaja, palabra, pistaCriptex, foto,
   sin:['caja'|'criptex'|'foto'] }. Apagado si no está `on` → NO toca ninguna
   invitación entregada (es opt-in, como las colecciones).
   El bloque del panel está en efectos/panel-mision.js (pestaña EFECTOS).

   Lo resuelto se recuerda sólo en la pestaña (sessionStorage): en la muestra,
   cada vez que se abre se vuelve a jugar. `?mision=0` la saltea.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invMision) return; window.__invMision = 1;
  if (!/\/i\//.test(location.pathname)) return;
  if (/[?&](mision=0|chequeo=1)/.test(location.search)) return;   /* el chequeo automático de muestras la saltea */
  try { if (window.top !== window.self && !/[?&]mision=1/.test(location.search)) return; } catch (e) { return; }

  var EV, M, SLUG, ESTADO = { puerta: null, ok: {} };
  var CLAVE_SS;

  function si(v) { return v === true || v === 'true' || v === 1 || v === '1'; }
  function sinAcentos(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  /* 4/11, Maki: «linda la muestra pero no le agregaste las misiones». Las
     tenía: esa pestaña ya la había resuelto y se acordaba. En una MUESTRA se
     juega SIEMPRE desde el expediente; sólo una invitación de verdad recuerda
     (en la pestaña) lo que el invitado ya abrió. */
  function esMuestra() {
    var m = (EV && EV.fx && EV.fx.muestra) || {};
    var si_ = function (v) { return v === true || String(v) === '1' || /^(si|sí|true)$/i.test(String(v || '')); };
    return si_(m.venta) || si_(m.rsvp) || /[?&]muestra=1/.test(location.search);
  }
  function guardar() { if (esMuestra()) return; try { sessionStorage.setItem(CLAVE_SS, JSON.stringify(ESTADO)); } catch (e) {} }
  function leer() { if (esMuestra()) return; try { var x = JSON.parse(sessionStorage.getItem(CLAVE_SS) || 'null'); if (x && typeof x === 'object') ESTADO = { puerta: x.puerta || null, ok: x.ok || {} }; } catch (e) {} }
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  /* ---------- los datos ---------- */
  function codigoCaja() {
    var c = String(M.codigo || '').replace(/\D/g, '');
    if (c.length === 4) return c;
    var f = String(EV.fecha || ''), m = f.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? (m[3] + m[2]) : '1501';
  }
  function palabra() {
    var p = sinAcentos(M.palabra || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (p.length >= 3 && p.length <= 8) return p;
    var n = sinAcentos(EV.n1 || EV.pnom || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (n.length >= 3 && n.length <= 8) return n;
    return 'FIESTA';
  }
  function tipo() {
    var t = String(EV.tipo || '').toLowerCase();
    if (t) return t;
    /* las muestras de XV viejas no traen el tipo: se reconoce por el link o el título */
    var pistas = [EV.slug, EV.tpl, EV['c_titulo-del-correo'], EV.titulo].join(' ');
    if (/mis15|\bxv\b|quince/i.test(pistas)) return 'xv';
    if (/boda|-y-/i.test(pistas)) return 'boda';
    return '';
  }
  function pistaCriptex() {
    if (M.pistaCriptex) return M.pistaCriptex;
    if (!(M.palabra) ) {
      var t = tipo();
      if (t === 'xv') return 'El nombre de la quinceañera.';
      if (t === 'boda') return 'El nombre de la novia.';
      return 'El nombre de quien festeja.';
    }
    return 'Una palabra de ' + palabra().length + ' letras.';
  }
  function pistaCaja() { return M.pistaCaja || 'El día y el mes de la gran noche (DD MM).'; }
  function titular() {
    var t = tipo(), a = EV.n1 || EV.pnom || '', b = EV.n2 || '';
    if (t === 'xv') return 'Los XV de ' + a;
    if (t === 'boda' && b) return a + ' & ' + b;
    return a + (b ? ' & ' + b : '');
  }
  function fotoPuzzle() {
    var u = M.foto || EV.cover || EV['img_c_foto-para-el-fin-de-pagina'] || '';
    if (!u) { var im = document.querySelector('.portada img'); u = im ? im.src : ''; }
    if (/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(u)) {
      u = u.replace(/\/image\/upload\/(?:[^/]*[,_][^/]*\/)*/, '/image/upload/');
      u = u.replace('/image/upload/', '/image/upload/c_fill,g_auto,w_720,h_720,q_auto,f_auto/');
    }
    return u;
  }

  /* ---------- estilos ---------- */
  function estilos() {
    if (document.getElementById('ms-css')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Special+Elite&family=Oswald:wght@500;700&display=swap';
    document.head.appendChild(l);
    var s = document.createElement('style'); s.id = 'ms-css';
    s.textContent = [
      ':root{--ms-papel:#EADFC6;--ms-papel2:#DCCDAA;--ms-tinta:#26211C;--ms-rojo:#A3262A;--ms-bronce:#B08A3E;--ms-noche:#121212}',
      '.ms-ov{position:fixed;inset:0;z-index:99990;background:radial-gradient(ellipse at 50% 30%,#2a2724 0%,#0d0c0b 75%);display:flex;align-items:center;justify-content:center;padding:22px;opacity:0;transition:opacity .6s;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}',
      '.ms-ov.on{opacity:1}.ms-ov.fuera{opacity:0;pointer-events:none}',
      '.ms-ov:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 1px,transparent 1px 3px);pointer-events:none}',
      '.ms-rec{position:absolute;top:18px;left:18px;font:500 11px/1 Oswald,sans-serif;letter-spacing:.2em;color:#e9e3d6;opacity:.8;display:flex;align-items:center;gap:7px}',
      '.ms-rec i{width:8px;height:8px;border-radius:50%;background:#e33;animation:msRec 1.1s steps(1) infinite}',
      '@keyframes msRec{50%{opacity:0}}',
      '.ms-cam{position:absolute;top:18px;right:18px;font:500 11px/1 Oswald,sans-serif;letter-spacing:.2em;color:#e9e3d6;opacity:.6}',
      '.ms-exp{position:relative;width:min(360px,100%);background:linear-gradient(170deg,var(--ms-papel),var(--ms-papel2));color:var(--ms-tinta);border-radius:6px;padding:30px 24px 26px;box-shadow:0 30px 60px -20px rgba(0,0,0,.8),inset 0 0 40px rgba(120,90,40,.18);text-align:center;transform:translateY(16px) rotate(-1deg);transition:transform .7s cubic-bezier(.2,.8,.2,1)}',
      '.ms-ov.on .ms-exp{transform:none}',
      '.ms-exp:before{content:"";position:absolute;top:-14px;left:22px;width:110px;height:18px;background:var(--ms-papel2);border-radius:6px 6px 0 0}',
      '.ms-k{font:500 11px/1.3 Oswald,sans-serif;letter-spacing:.32em;text-transform:uppercase;opacity:.7}',
      '.ms-t{font:700 44px/1 Oswald,sans-serif;letter-spacing:.02em;text-transform:uppercase;margin:12px 0 4px}',
      '.ms-n{font:400 17px/1.35 "Special Elite",monospace;margin:4px 0 18px}',
      '.ms-sello{position:absolute;top:-12px;right:-8px;transform:rotate(10deg);background:rgba(234,223,198,.92);border:3px solid var(--ms-rojo);color:var(--ms-rojo);font:700 15px/1 Oswald,sans-serif;letter-spacing:.18em;padding:6px 10px;border-radius:4px;opacity:.85;mix-blend-mode:multiply}',
      '.ms-p{font:400 14.5px/1.5 "Special Elite",monospace;margin:0 auto 14px;max-width:290px}',
      '.ms-huella{position:relative;width:118px;height:118px;margin:6px auto 12px;border-radius:50%;display:flex;align-items:center;justify-content:center;touch-action:none;cursor:pointer;background:rgba(38,33,28,.06)}',
      '.ms-huella svg.ms-fp{width:74px;height:74px;color:var(--ms-tinta);opacity:.75;transition:color .3s,opacity .3s}',
      '.ms-huella svg.ms-ring{position:absolute;inset:0;width:118px;height:118px;transform:rotate(-90deg)}',
      '.ms-huella .ms-scan{position:absolute;left:18px;right:18px;height:2px;background:var(--ms-rojo);box-shadow:0 0 12px var(--ms-rojo);top:20px;opacity:0}',
      '.ms-huella.pres .ms-scan{opacity:1;animation:msScan 1.3s ease-in-out infinite alternate}',
      '.ms-huella.pres svg.ms-fp{color:var(--ms-rojo);opacity:1}',
      '.ms-huella.ok svg.ms-fp{color:#2f6b3a;opacity:1}',
      '@keyframes msScan{to{top:96px}}',
      '.ms-b{display:block;width:100%;border:0;border-radius:4px;padding:15px 16px;font:700 15px/1 Oswald,sans-serif;letter-spacing:.18em;text-transform:uppercase;cursor:pointer;margin-top:10px}',
      '.ms-b1{background:var(--ms-rojo);color:#fff;box-shadow:0 10px 22px -10px var(--ms-rojo)}',
      '.ms-b2{background:transparent;color:var(--ms-tinta);border:1.5px solid rgba(38,33,28,.45)}',
      '.ms-paso{animation:msIn .55s both}',
      /* la colección pinta p y h4 con su letra: acá manda la del expediente */
      '.ms-ov .ms-p,.ms-tapa .ms-card p.ms-p,.ms-card .ms-p,.ms-toast span{font-family:"Special Elite",monospace!important;color:var(--ms-tinta)!important;text-transform:none!important;letter-spacing:0!important}',
      '.ms-tapa .ms-card h4,.ms-card h4,.ms-toast b{font-family:Oswald,sans-serif!important;color:var(--ms-tinta)!important;letter-spacing:.02em!important}',
      '.ms-b{font-family:Oswald,sans-serif!important}',
      '.ms-b2{letter-spacing:.08em!important;font-size:13.5px!important}',
      '@keyframes msIn{from{opacity:0;transform:translateY(10px)}}',
      /* las secciones cerradas */
      '.ms-cerrada{position:relative!important;min-height:600px!important;overflow:hidden!important}',
      /* las colecciones Óleo fuerzan «.sec.verde > * {position:relative!important}»: este selector les gana */
      'html body section.ms-cerrada.ms-cerrada>div.ms-tapa.ms-tapa,.ms-tapa{position:absolute!important;inset:0!important;top:0!important;left:0!important;width:auto!important;height:auto!important;margin:0!important;z-index:9000!important;display:flex;align-items:flex-start;justify-content:center;padding:70px 18px 30px;background:rgba(18,17,16,.62);-webkit-backdrop-filter:blur(16px) saturate(.6);backdrop-filter:blur(16px) saturate(.6);transition:opacity .9s,transform .9s;-webkit-user-select:none;user-select:none}',
      '.ms-tapa.abierta{opacity:0;pointer-events:none}',
      '.ms-card{width:min(350px,100%);background:linear-gradient(170deg,var(--ms-papel),var(--ms-papel2));color:var(--ms-tinta);border-radius:6px;padding:22px 18px 20px;text-align:center;box-shadow:0 24px 50px -18px rgba(0,0,0,.75);position:sticky;top:80px}',
      '.ms-card .ms-k{margin-bottom:6px}',
      '.ms-card h4{font:700 26px/1.05 Oswald,sans-serif;text-transform:uppercase;margin:4px 0 6px;color:var(--ms-tinta)}',
      '.ms-card .ms-p{font-size:13.5px;margin-bottom:12px}',
      '.ms-err{font:400 13px/1.3 "Special Elite",monospace;color:var(--ms-rojo);min-height:18px;margin-top:8px}',
      '.ms-pista{font:400 13px/1.4 "Special Elite",monospace;background:rgba(176,138,62,.18);border-left:3px solid var(--ms-bronce);padding:8px 10px;margin-top:10px;text-align:left;display:none}',
      '.ms-pista.v{display:block;animation:msIn .4s both}',
      '.ms-igual{display:none;background:none;border:0;margin-top:10px;font:500 12px/1 Oswald,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--ms-tinta);opacity:.7;text-decoration:underline;cursor:pointer}',
      '.ms-igual.v{display:inline-block}',
      '.ms-tiembla{animation:msTiembla .45s}',
      '@keyframes msTiembla{20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}',
      /* caja fuerte */
      '.ms-caja{position:relative;width:230px;height:230px;margin:6px auto 4px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#6d6a66,#2f2d2b 60%,#1b1a19);box-shadow:inset 0 0 0 7px #4a4743,inset 0 0 0 9px #1a1918,0 14px 30px -10px rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;perspective:600px}',
      '.ms-caja:before{content:"";position:absolute;inset:18px;border-radius:50%;border:1px dashed rgba(255,255,255,.18)}',
      '.ms-ruedas{display:flex;gap:6px;position:relative;z-index:2}',
      '.ms-rueda{display:flex;flex-direction:column;align-items:center;width:38px}',
      '.ms-rueda button{width:38px;height:28px;border:0;background:transparent;color:#d9c9a3;font:700 16px/1 Oswald,sans-serif;cursor:pointer;padding:0}',
      '.ms-rueda .ms-d{width:38px;height:50px;border-radius:5px;background:linear-gradient(#0e0d0c,#2a2826 50%,#0e0d0c);color:#f1e3bd;font:700 28px/50px Oswald,sans-serif;text-align:center;box-shadow:inset 0 2px 6px rgba(0,0,0,.8),0 0 0 1px #5b5650}',
      '.ms-manija{position:absolute;bottom:20px;left:50%;width:58px;height:8px;margin-left:-29px;background:linear-gradient(#cfae63,#8a6a2a);border-radius:4px;transition:transform .7s;transform-origin:50% 50%}',
      '.ms-caja.abre .ms-manija{transform:rotate(-90deg)}',
      '.ms-caja.abre{animation:msPuerta 1.1s .5s forwards}',
      '@keyframes msPuerta{to{transform:rotateY(-75deg) translateX(-30px);opacity:.0}}',
      /* criptex */
      '.ms-cripx{display:flex;align-items:center;justify-content:center;margin:8px auto 4px;padding:10px 10px;border-radius:30px;background:linear-gradient(#cfae63,#8a6a2a 50%,#cfae63);box-shadow:0 12px 24px -10px rgba(0,0,0,.6);gap:3px;max-width:100%}',
      '.ms-cripx .ms-rueda{width:30px}',
      '.ms-cripx .ms-rueda button{width:30px;height:24px;color:#3b2a10;font-size:14px}',
      '.ms-cripx .ms-d{width:30px;height:44px;border-radius:4px;background:linear-gradient(#e7dcc2,#fbf6ea 50%,#d6c7a3);color:#2a1d0c;font:700 22px/44px Oswald,sans-serif;box-shadow:inset 0 2px 5px rgba(0,0,0,.35)}',
      '.ms-cripx.abre{animation:msCrip 1s forwards}',
      '@keyframes msCrip{40%{transform:scaleX(1.08)}100%{transform:scaleX(1.25);opacity:0}}',
      /* foto partida */
      '.ms-puz{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;width:252px;height:252px;margin:6px auto 4px;background:#1b1a19;padding:3px;border-radius:4px;box-shadow:0 12px 26px -10px rgba(0,0,0,.6)}',
      '.ms-pz{background-size:300% 300%;background-color:#333;cursor:pointer;transition:transform .2s,box-shadow .2s;border-radius:2px}',
      '.ms-pz.sel{transform:scale(.92);box-shadow:0 0 0 3px var(--ms-rojo)}',
      '.ms-puz.lista{gap:0}.ms-puz.lista .ms-pz{border-radius:0}',
      /* la barra de medallas */
      '.ms-barra{position:fixed;top:10px;left:50%;transform:translate(-50%,-80px);z-index:99980;background:rgba(18,17,16,.88);color:#efe5cf;border-radius:30px;padding:8px 14px;display:flex;align-items:center;gap:10px;font:500 11px/1 Oswald,sans-serif;letter-spacing:.2em;text-transform:uppercase;box-shadow:0 10px 24px -10px rgba(0,0,0,.6);transition:transform .6s;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}',
      '.ms-barra.v{transform:translate(-50%,0)}',
      '.ms-med{width:22px;height:22px;border-radius:50%;border:1.5px solid rgba(239,229,207,.5);display:flex;align-items:center;justify-content:center;font-size:12px;opacity:.55;transition:all .4s}',
      '.ms-med.ok{background:var(--ms-bronce);border-color:var(--ms-bronce);opacity:1;color:#1b1309}',
      '.ms-toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,140%);z-index:99985;width:min(340px,calc(100% - 32px));background:linear-gradient(170deg,var(--ms-papel),var(--ms-papel2));color:var(--ms-tinta);border-radius:6px;padding:16px 16px 14px;text-align:center;box-shadow:0 20px 40px -14px rgba(0,0,0,.7);transition:transform .6s cubic-bezier(.2,.8,.2,1)}',
      '.ms-toast.v{transform:translate(-50%,0)}',
      '.ms-toast b{display:block;font:700 20px/1.1 Oswald,sans-serif;text-transform:uppercase;margin-bottom:4px}',
      '.ms-toast span{font:400 13px/1.4 "Special Elite",monospace}',
      '.ms-final{display:block;width:fit-content;margin:0 auto 14px;font:700 12px/1 Oswald,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#fff;background:var(--ms-rojo);padding:8px 14px;border-radius:3px;transform:rotate(-2deg);box-shadow:0 8px 18px -8px var(--ms-rojo)}'
    ].join('\n');
    document.head.appendChild(s);
  }

  var FP = '<svg class="ms-fp" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">' +
    '<path d="M18 50c-3-5-4-11-3-17 2-10 10-17 19-17 6 0 11 3 14 7"/><path d="M50 30c1 3 1 6 1 9"/>' +
    '<path d="M24 54c-3-6-4-12-3-18 1-7 6-12 12-12s11 5 11 12c0 4 0 8-1 12"/>' +
    '<path d="M31 57c-3-7-4-13-3-20 0-3 2-5 5-5s5 2 5 5c0 6 0 11-2 16"/><path d="M33 37c0 8-1 14 2 21"/>' +
    '<path d="M42 56c1-3 1-6 1-9"/><path d="M12 42c-1-3-1-7 0-11"/><path d="M22 10c3-1 7-2 10-2 9 0 17 5 21 13"/></svg>';

  /* ---------- 1 y 2: el expediente ---------- */
  function expediente(listo) {
    estilos();
    var ov = h('div', 'ms-ov');
    ov.innerHTML = '<div class="ms-rec"><i></i>REC</div><div class="ms-cam">CAM 01</div>';
    var ex = h('div', 'ms-exp');
    var n = String(EV.nEvento || '').replace(/\D/g, '') || '015';
    ex.appendChild(h('div', 'ms-k', 'Expediente clasificado · Nº ' + ('000' + n).slice(-3)));
    ex.appendChild(h('div', 'ms-sello', 'Confidencial'));
    ex.appendChild(h('div', 'ms-t', 'Misión secreta'));
    ex.appendChild(h('div', 'ms-n', titular()));
    var paso = h('div', 'ms-paso');
    ex.appendChild(paso);
    ov.appendChild(ex);
    document.body.appendChild(ov);
    requestAnimationFrame(function () { requestAnimationFrame(function () { ov.classList.add('on'); }); });

    function pasoHuella() {
      paso.innerHTML = '';
      paso.appendChild(h('div', 'ms-k', 'Identificate'));
      var hu = h('div', 'ms-huella');
      hu.innerHTML = FP + '<svg class="ms-ring" viewBox="0 0 118 118"><circle cx="59" cy="59" r="55" stroke="rgba(38,33,28,.15)" stroke-width="3" fill="none"/>' +
        '<circle class="ms-arco" cx="59" cy="59" r="55" stroke="#A3262A" stroke-width="3.5" fill="none" stroke-dasharray="345.6" stroke-dashoffset="345.6"/></svg><div class="ms-scan"></div>';
      paso.appendChild(hu);
      var p = h('p', 'ms-p', 'Mantené el dedo apoyado para confirmar tu identidad.');
      paso.appendChild(p);
      var arco = hu.querySelector('.ms-arco'), t0 = 0, raf = 0, hecho = false, toques = 0;
      var DUR = 1300;
      function frame() {
        var k = Math.min(1, (Date.now() - t0) / DUR);
        arco.setAttribute('stroke-dashoffset', String(345.6 * (1 - k)));
        if (k >= 1) { listoH(); return; }
        raf = requestAnimationFrame(frame);
      }
      function abajo(e) { if (hecho) return; if (e && e.cancelable) e.preventDefault(); t0 = Date.now(); hu.classList.add('pres'); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
      function arriba() {
        if (hecho) return;
        cancelAnimationFrame(raf); hu.classList.remove('pres');
        arco.setAttribute('stroke-dashoffset', '345.6');
        if (++toques >= 3) { listoH(); return; }   /* quien no entiende «mantener»: con tres toques pasa igual */
        p.textContent = 'Mantenelo apoyado un poquito más…';
      }
      function listoH() {
        if (hecho) return; hecho = true;
        cancelAnimationFrame(raf);
        hu.classList.remove('pres'); hu.classList.add('ok');
        arco.setAttribute('stroke-dashoffset', '0'); arco.setAttribute('stroke', '#2f6b3a');
        try { if (navigator.vibrate) navigator.vibrate(60); } catch (e) {}
        p.textContent = 'Agente identificado. Acceso concedido.';
        setTimeout(pasoPuertas, 1100);
      }
      hu.addEventListener('pointerdown', abajo);
      hu.addEventListener('pointerup', arriba);
      hu.addEventListener('pointercancel', arriba);
      hu.addEventListener('pointerleave', function () { if (hu.classList.contains('pres')) arriba(); });
      hu.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    }
    function pasoPuertas() {
      paso.innerHTML = '';
      paso.className = 'ms-paso';
      void paso.offsetWidth; paso.className = 'ms-paso';
      paso.appendChild(h('p', 'ms-p', 'Tenés una misión: descubrir dónde, cuándo y cómo será la gran noche. Hay tres secretos bajo llave.'));
      var b1 = h('button', 'ms-b ms-b1', 'Aceptar la misión');
      var b2 = h('button', 'ms-b ms-b2', 'Ver la invitación sin juegos');
      b1.onclick = function () { ESTADO.puerta = 'juego'; guardar(); cerrar(); cerrarSecciones(); };
      b2.onclick = function () { ESTADO.puerta = 'directo'; guardar(); cerrar(); };
      paso.appendChild(b1); paso.appendChild(b2);
    }
    function cerrar() {
      ov.classList.add('fuera');
      setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 700);
      if (listo) listo();
    }
    pasoHuella();
  }

  /* ---------- 3: las secciones bajo llave ---------- */
  function visible(el) { return el && el.isConnected && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 40; }
  function objetivos() {
    var sin = Array.isArray(M.sin) ? M.sin : [];
    var o = [];
    var ev = document.querySelector('section[data-sec="eventos"]');
    if (sin.indexOf('caja') < 0 && visible(ev)) o.push(['caja', ev, '🔐']);
    var foto = document.getElementById('gal-seccion');
    if (!visible(foto)) foto = document.querySelector('section[data-sec="galeria"]');
    if (sin.indexOf('foto') < 0 && visible(foto) && fotoPuzzle()) o.push(['foto', foto, '🧩']);
    var reg = document.querySelector('section[data-sec="regalos"]');
    if (sin.indexOf('criptex') < 0 && visible(reg)) o.push(['criptex', reg, '🗝']);
    return o;
  }
  var OBJ = [], barra, meds = {};
  function cerrarSecciones() {
    OBJ = objetivos();
    if (!OBJ.length) return;
    barra = h('div', 'ms-barra');
    barra.appendChild(h('span', '', 'Misión'));
    OBJ.forEach(function (o) { var m = h('div', 'ms-med' + (ESTADO.ok[o[0]] ? ' ok' : ''), o[2]); meds[o[0]] = m; barra.appendChild(m); });
    document.body.appendChild(barra);
    setTimeout(function () { barra.classList.add('v'); }, 400);
    OBJ.forEach(function (o) {
      if (ESTADO.ok[o[0]]) return;
      if (o[0] === 'caja') tapaCaja(o[1]);
      else if (o[0] === 'criptex') tapaCriptex(o[1]);
      else if (o[0] === 'foto') tapaFoto(o[1]);
    });
    marcarFinal();
    if (todas()) fin(true);
  }
  function todas() { return OBJ.every(function (o) { return ESTADO.ok[o[0]]; }); }
  function tapa(sec, kicker, titulo, texto) {
    sec.classList.add('ms-cerrada');
    var t = h('div', 'ms-tapa'), c = h('div', 'ms-card');
    c.appendChild(h('div', 'ms-k', kicker));
    c.appendChild(h('h4', '', titulo));
    c.appendChild(h('p', 'ms-p', texto));
    t.appendChild(c); sec.appendChild(t);
    return { tapa: t, card: c, sec: sec };
  }
  function pie(T, pista, abrirIgual) {
    var err = h('div', 'ms-err'), pi = h('div', 'ms-pista', 'Pista: ' + pista), ig = h('button', 'ms-igual', 'Abrir igual');
    ig.onclick = abrirIgual;
    T.card.appendChild(err); T.card.appendChild(pi); T.card.appendChild(ig);
    var n = 0;
    return {
      mal: function (msg, el) {
        n++; err.textContent = msg;
        if (el) { el.classList.remove('ms-tiembla'); void el.offsetWidth; el.classList.add('ms-tiembla'); }
        try { if (navigator.vibrate) navigator.vibrate([40, 40, 40]); } catch (e) {}
        if (n >= 2) pi.classList.add('v');
        if (n >= 3) ig.classList.add('v');
      },
      pista: function () { pi.classList.add('v'); },
      igual: function () { ig.classList.add('v'); }
    };
  }
  function abrir(clave, T) {
    ESTADO.ok[clave] = 1; guardar();
    if (meds[clave]) meds[clave].classList.add('ok');
    try { if (navigator.vibrate) navigator.vibrate(120); } catch (e) {}
    T.tapa.classList.add('abierta');
    setTimeout(function () {
      if (T.tapa.parentNode) T.tapa.parentNode.removeChild(T.tapa);
      T.sec.classList.remove('ms-cerrada');
      /* los mapas y la galería se dibujaron tapados: que se acomoden */
      try { window.dispatchEvent(new Event('resize')); } catch (e) {}
    }, 950);
    if (todas()) setTimeout(function () { fin(false); }, 1200);
  }
  function rueda(valores, ini, onCambio) {
    var r = h('div', 'ms-rueda'), up = h('button', '', '▲'), d = h('div', 'ms-d'), dn = h('button', '', '▼'), i = ini;
    up.type = dn.type = 'button';
    function pinta() { d.textContent = valores[i]; }
    up.onclick = function () { i = (i + 1) % valores.length; pinta(); onCambio && onCambio(); };
    dn.onclick = function () { i = (i - 1 + valores.length) % valores.length; pinta(); onCambio && onCambio(); };
    /* deslizar el dedo sobre el número también lo cambia */
    var y0 = null;
    d.addEventListener('pointerdown', function (e) { y0 = e.clientY; });
    d.addEventListener('pointerup', function (e) { if (y0 == null) return; var dy = e.clientY - y0; y0 = null; if (Math.abs(dy) > 12) (dy < 0 ? up : dn).onclick(); else up.onclick(); });
    d.style.touchAction = 'none';
    pinta();
    r.appendChild(up); r.appendChild(d); r.appendChild(dn);
    return { el: r, val: function () { return valores[i]; } };
  }

  function tapaCaja(sec) {
    var T = tapa(sec, 'Secreto 1 · Caja fuerte', 'Dónde y cuándo', 'La ubicación de la fiesta está bajo llave. Ingresá el código de 4 cifras.');
    var codigo = codigoCaja(), caja = h('div', 'ms-caja'), rs = h('div', 'ms-ruedas'), R = [];
    var dig = '0123456789'.split('');
    for (var k = 0; k < 4; k++) { var x = rueda(dig, 0); R.push(x); rs.appendChild(x.el); }
    caja.appendChild(rs); caja.appendChild(h('div', 'ms-manija'));
    T.card.appendChild(caja);
    var b = h('button', 'ms-b ms-b1', 'Abrir'); T.card.appendChild(b);
    var P = pie(T, pistaCaja(), function () { caja.classList.add('abre'); abrir('caja', T); });
    b.onclick = function () {
      var v = R.map(function (r) { return r.val(); }).join('');
      if (v === codigo) { b.disabled = true; caja.classList.add('abre'); setTimeout(function () { abrir('caja', T); }, 900); }
      else P.mal('Código incorrecto.', caja);
    };
  }

  function tapaCriptex(sec) {
    var T = tapa(sec, 'Secreto 2 · Criptex', 'Mesa de regalos', 'Girá los anillos hasta formar la palabra secreta.');
    var pal = palabra(), AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), cx = h('div', 'ms-cripx'), R = [];
    for (var k = 0; k < pal.length; k++) {
      var ok = AZ.indexOf(pal[k]), ini = (ok + 3 + Math.floor(Math.random() * 18)) % 26;
      var x = rueda(AZ, ini); R.push(x); cx.appendChild(x.el);
    }
    T.card.appendChild(cx);
    var b = h('button', 'ms-b ms-b1', 'Abrir'); T.card.appendChild(b);
    var P = pie(T, pistaCriptex() + ' Empieza con «' + pal[0] + '».', function () { cx.classList.add('abre'); abrir('criptex', T); });
    b.onclick = function () {
      var v = R.map(function (r) { return r.val(); }).join('');
      if (v === pal) { b.disabled = true; cx.classList.add('abre'); setTimeout(function () { abrir('criptex', T); }, 800); }
      else P.mal('Esa no es la palabra.', cx);
    };
  }

  function tapaFoto(sec) {
    var T = tapa(sec, 'Secreto 3 · Archivo fotográfico', 'Armá la foto', 'Tocá dos piezas para cambiarlas de lugar hasta reconstruir la imagen.');
    var url = fotoPuzzle(), pz = h('div', 'ms-puz'), orden = [0, 1, 2, 3, 4, 5, 6, 7, 8], sel = null;
    /* mezcla sin que ninguna quede en su lugar */
    do { orden.sort(function () { return Math.random() - 0.5; }); } while (orden.some(function (v, i) { return v === i; }));
    var piezas = orden.map(function () { var d = h('div', 'ms-pz'); d.style.backgroundImage = 'url("' + url + '")'; return d; });
    function pinta() {
      piezas.forEach(function (d, i) {
        var v = orden[i];
        d.style.backgroundPosition = ((v % 3) * 50) + '% ' + (Math.floor(v / 3) * 50) + '%';
      });
    }
    piezas.forEach(function (d, i) {
      d.onclick = function () {
        if (resuelto) return;
        if (sel === null) { sel = i; d.classList.add('sel'); return; }
        piezas[sel].classList.remove('sel');
        if (sel !== i) { var t = orden[sel]; orden[sel] = orden[i]; orden[i] = t; pinta(); }
        sel = null;
        if (orden.every(function (v, j) { return v === j; })) listo();
      };
      pz.appendChild(d);
    });
    pinta();
    T.card.appendChild(pz);
    var resuelto = false;
    var P = pie(T, 'Empezá por las esquinas.', function () { resuelto = true; abrir('foto', T); });
    setTimeout(function () { P.pista(); }, 20000);
    setTimeout(function () { P.igual(); }, 40000);
    function listo() { resuelto = true; pz.classList.add('lista'); setTimeout(function () { abrir('foto', T); }, 900); }
  }

  function marcarFinal() {
    var c = document.querySelector('section[data-sec="confirmacion"]');
    if (!c || c.querySelector('.ms-final')) return;
    var f = h('div', 'ms-final', 'Misión final');
    c.insertBefore(f, c.firstChild);
  }
  function fin(silencio) {
    if (meds) Object.keys(meds).forEach(function (k) { meds[k].classList.add('ok'); });
    if (silencio) return;
    var t = h('div', 'ms-toast');
    t.innerHTML = '<b>¡Misión cumplida!</b><span>Te queda la misión final: confirmar tu asistencia.</span>';
    var b = h('button', 'ms-b ms-b1', 'Ir a confirmar');
    b.onclick = function () {
      var c = document.querySelector('section[data-sec="confirmacion"]');
      if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' });
      t.classList.remove('v');
    };
    t.appendChild(b);
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('v'); }, 100);
    setTimeout(function () { t.classList.remove('v'); }, 9000);
  }

  /* ---------- arranque: cuando se va el sobre ---------- */
  function sobreAVista() {
    var velo = document.getElementById('col-sobre-velo');   /* la luz blanca del sobre en video */
    if (velo && velo.isConnected && Number(getComputedStyle(velo).opacity) > 0.6) return true;
    var env = document.getElementById('env');
    if (!env || !env.isConnected) return false;
    if (env.classList.contains('gone')) return false;
    var cs = getComputedStyle(env);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.5) return false;
    return true;
  }
  var t0 = Date.now(), iv = setInterval(function () {
    EV = window.INVEV;
    if (!EV) { if (Date.now() - t0 > 30000) clearInterval(iv); return; }
    M = (EV.fx && EV.fx.mision) || {};
    if (!si(M.on)) { if (Date.now() - t0 > 15000) clearInterval(iv); return; }
    if (!document.querySelector('section[data-sec="eventos"]')) return;    /* el motor todavía dibuja */
    if (sobreAVista()) return;
    clearInterval(iv);
    SLUG = EV.slug || (location.search.match(/[?&]e=([^&]+)/) || [])[1] || 'x';
    CLAVE_SS = 'inv-mision-' + SLUG;
    leer();
    estilos();
    if (ESTADO.puerta === 'directo') return;
    if (ESTADO.puerta === 'juego') { setTimeout(cerrarSecciones, 300); return; }
    setTimeout(function () { expediente(); }, 350);
  }, 150);
})();
