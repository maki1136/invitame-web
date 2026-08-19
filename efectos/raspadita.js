/* ===== LA RASPADITA DE LA FECHA ===============================================

   QUÉ ES
   El "pasá el dedo para descubrir" que tapa la fecha. Ya existía: una capa que
   se borra con el dedo. Esto le agrega seis cosas y no cambia nada si está
   apagado.

   ⚠️ VIENE APAGADA. Sin encenderla, la raspadita se comporta como siempre.

   LAS SEIS COSAS
   1. SE COMPLETA SOLA. Al llegar al porcentaje que se elija (por defecto 42%),
      el resto se desvanece. Nadie tiene que limpiar hasta el último rincón.
   2. POR PARTES. Tres fichas separadas, UNA AL LADO DE LA OTRA: el día, el mes
      y el año. Se raspan en orden y cada una se habilita cuando terminaste la
      anterior, así la fecha se revela en tres tiempos.
   3. POLVILLO. Salta polvo finito mientras raspás, para que se sienta material.
   4. DESTELLO. Cuando termina, un brillo suave cruza la fecha.
   5. VIBRACIÓN. Una vibración cortita al completar cada ficha.
      ⚠️ Sólo funciona en Android. iPhone no permite vibrar desde una página web
      — es una limitación de Apple, no un error. En iPhone no pasa nada y todo
      lo demás funciona igual.
   6. COLOR Y FORMA ELEGIBLES. La capa puede ser plata, dorada o cualquier color
      de la paleta; y las fichas pueden ser cuadradas, redondas o corazones.

   CÓMO SE CONFIGURA (panel → body → dirección web)
     encendido / rasp        1 para encender
     modo      / raspModo    simple · partes
     forma     / raspForma   cuadrado · redondo · corazon   (sólo en "partes")
     color     / raspColor   plata · oro · o cualquier color
     auto      / raspAuto    0 a 100 — con cuánto se completa sola (0 = nunca)
     polvillo  / raspPolvillo   1 / 0
     destello  / raspDestello   1 / 0
     vibrar    / raspVibrar      1 / 0
     grosor    / raspGrosor   el ancho del dedo al raspar (por defecto 26 px)

   POR QUÉ EL MES VA ABREVIADO EN LAS FICHAS
   Las tres fichas son iguales y van en fila dentro de una tarjeta de 300 px:
   quedan de unos 82 px cada una. "Noviembre" entero no entra sin achicarse
   tanto que se pierde. Por eso en este modo el mes va en tres letras (NOV),
   que además le da aire de ficha de sorteo, parejito con el día y el año.

   ⚠️ DETALLES DEL CORAZÓN (costaron dos vueltas)
   · Las fichas llevan `box-sizing:border-box`. Sin eso, el relleno de abajo las
     agrandaba y el texto terminaba ASOMANDO por arriba del corazón.
   · El corazón tiene una muesca en el medio de arriba, así que el número va más
     abajo y más chico que en las otras formas. Si no, se ve un pedacito del
     número por la muesca antes de raspar.

   DE DÓNDE SACA LA FECHA
   De lo que la invitación ya muestra: #sc-day y #sc-mon.
   ============================================================================ */
(function () {
  'use strict';

  var PALETA = {
    plata:'#c9c9c9', oro:'#c9a227', lino:'#f4efe6', kraft:'#e8e1d6',
    uva:'#b06a7e', salvia:'#a9b8a0', champagne:'#efe6d4', tinta:'#4a4038'
  };

  var CORAZON = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 21.2C6.2 17 2.4 13.8 2.4 9.7 2.4 6.4 5 4.1 8.1 4.1c1.9 0 3.4 .9 3.9 2.2 .5-1.3 2-2.2 3.9-2.2 3.1 0 5.7 2.3 5.7 5.6 0 4.1-3.8 7.3-9.6 11.5z' fill='black'/></svg>\")";

  var URLP = new URLSearchParams(location.search);

  var ES_PREVIEW = (function () {
    try { return /[?&]preview/.test(location.search) || window.parent !== window; }
    catch (e) { return true; }
  })();

  function delPanel(k) {
    try {
      var c = window.INVEV && window.INVEV.fx && window.INVEV.fx.raspadita;
      if (!c) return null;
      var v = c[k];
      return (v === undefined || v === null || v === '') ? null : v;
    } catch (e) { return null; }
  }
  function opt(corto, largo) {
    var p = delPanel(corto);
    if (p !== null) return p;
    var d = document.body && document.body.dataset ? document.body.dataset[largo] : null;
    if (d !== undefined && d !== null && d !== '') return d;
    var u = URLP.get(largo);
    return (u === null || u === '') ? null : u;
  }
  function siNo(v, porDefecto) {
    if (v === null || v === undefined || v === '') return porDefecto;
    return v === true || String(v) === '1' || /^(si|sí|true)$/i.test(String(v));
  }
  function color(v, porDefecto) {
    if (!v) return porDefecto;
    v = String(v).trim();
    if (PALETA[v.toLowerCase()]) return PALETA[v.toLowerCase()];
    if (/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) return v[0] === '#' ? v : '#' + v;
    return porDefecto;
  }
  function encendido() { return siNo(opt('encendido', 'rasp'), false); }

  function config() {
    var f = String(opt('forma', 'raspForma') || 'cuadrado').toLowerCase();
    if (f === 'corazón') f = 'corazon';
    if (['cuadrado','redondo','corazon'].indexOf(f) < 0) f = 'cuadrado';
    return {
      modo:     String(opt('modo', 'raspModo') || 'simple').toLowerCase() === 'partes' ? 'partes' : 'simple',
      forma:    f,
      color:    color(opt('color', 'raspColor'), '#c9c9c9'),
      auto:     Math.max(0, Math.min(100, parseInt(opt('auto', 'raspAuto') || '42', 10))),
      polvillo: siNo(opt('polvillo', 'raspPolvillo'), true),
      destello: siNo(opt('destello', 'raspDestello'), true),
      vibrar:   siNo(opt('vibrar', 'raspVibrar'), true),
      grosor:   Math.max(10, Math.min(60, parseInt(opt('grosor', 'raspGrosor') || '26', 10)))
    };
  }

  var CSS = [
    '.rasp-zona{position:absolute;overflow:hidden}',
    '.rasp-zona canvas{position:absolute;inset:0;width:100%;height:100%;',
    '  touch-action:none;cursor:grab;transition:opacity .55s ease,filter .45s ease}',
    '.rasp-zona.lista canvas{opacity:0;pointer-events:none}',
    /* ⚠️ las fichas que todavía no tocan NO se transparentan: se apagan.
       Con opacity se leía el mes de antemano y se arruinaba la sorpresa. */
    '.rasp-zona.dormida canvas{filter:brightness(.84) saturate(.72);cursor:default}',

    /* las formas */
    '.rasp-zona.f-cuadrado{border-radius:12px}',
    '.rasp-zona.f-redondo{border-radius:999px}',
    '.rasp-zona.f-corazon{-webkit-mask-image:' + CORAZON + ';mask-image:' + CORAZON + ';',
    '  -webkit-mask-size:100% 100%;mask-size:100% 100%;',
    '  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}',

    '#rasp-polvo{position:absolute;inset:0;pointer-events:none;z-index:6}',
    '.rasp-destello{position:absolute;inset:0;pointer-events:none;z-index:7;overflow:hidden;border-radius:10px}',
    '.rasp-destello i{position:absolute;top:-60%;bottom:-60%;width:38%;left:-45%;',
    '  background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.75),rgba(255,255,255,0));',
    '  transform:skewX(-16deg);animation:raspBrillo 1.05s cubic-bezier(.3,.5,.3,1) forwards}',
    '@keyframes raspBrillo{to{left:118%}}',

    /* ---- la maqueta del modo por partes: TRES FICHAS EN FILA ---- */
    '.rasp-3{position:absolute;inset:0;display:flex;align-items:center;',
    '  justify-content:center;gap:var(--r3-sep,14px)}',
    /* ⚠️ border-box: sin esto el relleno agranda la ficha y el texto se escapa */
    '.rasp-3 .r3-f{box-sizing:border-box;display:flex;align-items:center;',
    '  justify-content:center;width:var(--r3-lado);height:var(--r3-lado);',
    '  line-height:1;text-align:center}',
    /* en el corazón el texto baja: arriba está la muesca */
    '.rasp-3.f-corazon .r3-f{padding-top:10%;padding-bottom:6%}',
    '@media(prefers-reduced-motion:reduce){.rasp-destello{display:none}}'
  ].join('\n');

  function ponerEstilos() {
    var v = document.getElementById('rasp-css');
    if (v) v.remove();                       /* se regenera: el CSS lleva la forma */
    var s = document.createElement('style');
    s.id = 'rasp-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function vibrar(patron, cfg) {
    if (!cfg.vibrar) return;
    try { if (navigator.vibrate) navigator.vibrate(patron); } catch (e) {}
  }

  /* ---------- la capa que se raspa ---------- */
  function comp(hex) {
    var s = hex.replace('#', '');
    if (s.length === 3) s = s[0]+s[0]+s[1]+s[1]+s[2]+s[2];
    return [parseInt(s.slice(0,2),16), parseInt(s.slice(2,4),16), parseInt(s.slice(4,6),16)];
  }
  function aclarar(hex, n) {
    var c = comp(hex);
    return 'rgb(' + Math.min(255,c[0]+n) + ',' + Math.min(255,c[1]+n) + ',' + Math.min(255,c[2]+n) + ')';
  }
  function oscurecer(hex, n) {
    var c = comp(hex);
    return 'rgb(' + Math.max(0,c[0]-n) + ',' + Math.max(0,c[1]-n) + ',' + Math.max(0,c[2]-n) + ')';
  }

  function pintarCapa(cv, cfg) {
    var g = cv.getContext('2d');
    var w = cv.width, h = cv.height;
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, w, h);

    var base = cfg.color;
    var grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0,   aclarar(base, 26));
    grad.addColorStop(.35, base);
    grad.addColorStop(.52, aclarar(base, 40));
    grad.addColorStop(.7,  base);
    grad.addColorStop(1,   oscurecer(base, 16));
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);

    for (var i = 0; i < (w * h) / 26; i++) {
      g.fillStyle = 'rgba(255,255,255,' + (Math.random() * .16) + ')';
      g.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
  }

  /* ---------- el polvillo ---------- */
  var polvo = null, polvoCtx = null, particulas = [], corriendo = false;

  function prepararPolvo(card) {
    if (polvo && polvo.isConnected) return;
    polvo = document.createElement('canvas');
    polvo.id = 'rasp-polvo';
    card.appendChild(polvo);
    var r = card.getBoundingClientRect();
    polvo.width = Math.max(1, Math.round(r.width));
    polvo.height = Math.max(1, Math.round(r.height));
    polvo.style.width = '100%'; polvo.style.height = '100%';
    polvoCtx = polvo.getContext('2d');
  }

  function soltarPolvo(x, y, cfg) {
    if (!cfg.polvillo || !polvoCtx) return;
    for (var i = 0; i < 5; i++) {
      particulas.push({
        x: x, y: y,
        vx: (Math.random() - .5) * 2.4,
        vy: (Math.random() - .9) * 1.9,
        r: Math.random() * 1.7 + .5,
        vida: 1,
        col: Math.random() < .5 ? '255,255,255' : comp(cfg.color).join(',')
      });
    }
    if (!corriendo) { corriendo = true; requestAnimationFrame(animarPolvo); }
  }

  function animarPolvo() {
    if (!polvoCtx) { corriendo = false; return; }
    polvoCtx.clearRect(0, 0, polvo.width, polvo.height);
    for (var i = particulas.length - 1; i >= 0; i--) {
      var p = particulas[i];
      p.x += p.vx; p.y += p.vy; p.vy += .085; p.vida -= .022;
      if (p.vida <= 0) { particulas.splice(i, 1); continue; }
      polvoCtx.fillStyle = 'rgba(' + p.col + ',' + (p.vida * .85) + ')';
      polvoCtx.beginPath();
      polvoCtx.arc(p.x, p.y, p.r, 0, 6.284);
      polvoCtx.fill();
    }
    if (particulas.length) requestAnimationFrame(animarPolvo);
    else { corriendo = false; polvoCtx.clearRect(0, 0, polvo.width, polvo.height); }
  }

  /* ---------- cuánto se raspó ---------- */
  function porcentaje(cv) {
    try {
      var g = cv.getContext('2d');
      var d = g.getImageData(0, 0, cv.width, cv.height).data;
      var vacios = 0, total = 0;
      for (var i = 3; i < d.length; i += 4 * 16) {
        total++;
        if (d[i] < 40) vacios++;
      }
      return total ? (vacios / total) * 100 : 0;
    } catch (e) { return 0; }
  }

  /* ---------- una zona raspable ---------- */
  function armarZona(zona, cfg, alTerminar) {
    var cv = zona.querySelector('canvas');
    var g = cv.getContext('2d');
    var raspando = false, ultimo = null, cuenta = 0, terminada = false;

    pintarCapa(cv, cfg);

    function punto(ev) {
      var r = cv.getBoundingClientRect();
      var t = (ev.touches && ev.touches[0]) || ev;
      return {
        x: (t.clientX - r.left) * (cv.width / r.width),
        y: (t.clientY - r.top) * (cv.height / r.height),
        px: t.clientX - r.left, py: t.clientY - r.top
      };
    }

    function rascar(ev) {
      if (terminada || zona.classList.contains('dormida')) return;
      if (!raspando) return;
      ev.preventDefault();
      var p = punto(ev);
      g.globalCompositeOperation = 'destination-out';
      g.lineWidth = cfg.grosor;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      if (ultimo) { g.moveTo(ultimo.x, ultimo.y); g.lineTo(p.x, p.y); }
      else { g.moveTo(p.x, p.y); g.lineTo(p.x + .1, p.y + .1); }
      g.stroke();
      ultimo = p;

      var r = cv.getBoundingClientRect();
      var cr = zona.parentNode.getBoundingClientRect();
      soltarPolvo(p.px + (r.left - cr.left), p.py + (r.top - cr.top), cfg);

      if (++cuenta % 6 === 0 && cfg.auto > 0 && porcentaje(cv) >= cfg.auto) completar();
    }

    function completar() {
      if (terminada) return;
      terminada = true;
      zona.classList.add('lista');
      vibrar(18, cfg);
      setTimeout(function () { alTerminar(); }, 380);
    }

    function abajo(ev) { raspando = true; ultimo = null; rascar(ev); }
    function arriba() { raspando = false; ultimo = null; }

    cv.addEventListener('mousedown', abajo);
    cv.addEventListener('mousemove', rascar);
    addEventListener('mouseup', arriba);
    cv.addEventListener('touchstart', abajo, { passive: false });
    cv.addEventListener('touchmove', rascar, { passive: false });
    addEventListener('touchend', arriba);

    return { completar: completar };
  }

  function destellar(card, cfg) {
    if (!cfg.destello) return;
    var d = document.createElement('div');
    d.className = 'rasp-destello';
    d.innerHTML = '<i></i>';
    card.appendChild(d);
    setTimeout(function () { d.remove(); }, 1200);
  }

  function decir(txt) {
    var h = document.getElementById('sc-hint');
    if (h) h.textContent = txt;
  }

  /* ---------- armado ---------- */
  var yaArmado = false, firmaVieja = null;

  function armar() {
    var card = document.getElementById('scratchcard');
    if (!card) return;
    if (!encendido()) return;

    var cfg = config();
    var firma = JSON.stringify(cfg);
    if (yaArmado && firma === firmaVieja && card.querySelector('.rasp-zona')) return;
    firmaVieja = firma;

    var under = card.querySelector('.scratch-under');
    var elDia = document.getElementById('sc-day');
    var elMon = document.getElementById('sc-mon');
    var dia = ((elDia || {}).textContent || '').trim();
    var mon = ((elMon || {}).textContent || '').trim();
    if (!dia) return;

    var viejo = document.getElementById('scratch-cv');
    if (viejo) viejo.style.display = 'none';
    [].forEach.call(card.querySelectorAll('.rasp-zona,#rasp-polvo,.rasp-destello,.rasp-3'),
      function (e) { e.remove(); });

    ponerEstilos();
    prepararPolvo(card);
    yaArmado = true;

    var rc = card.getBoundingClientRect();

    function nuevaZona(caja, forma) {
      var z = document.createElement('div');
      z.className = 'rasp-zona f-' + (forma || cfg.forma);
      z.style.left = caja.left + 'px'; z.style.top = caja.top + 'px';
      z.style.width = caja.w + 'px';   z.style.height = caja.h + 'px';
      var cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.round(caja.w));
      cv.height = Math.max(1, Math.round(caja.h));
      z.appendChild(cv);
      card.appendChild(z);
      return z;
    }

    function cajaDe(el) {
      var b = el.getBoundingClientRect();
      return {
        left: Math.round(b.left - rc.left),
        top:  Math.round(b.top  - rc.top),
        w:    Math.round(b.width),
        h:    Math.round(b.height)
      };
    }

    if (cfg.modo === 'partes') {
      var m = mon.match(/^(.*?)\s+(\d{4})$/);
      var mesLargo = m ? m[1] : mon, anio = m ? m[2] : '';
      var mes = mesLargo.slice(0, 3).toUpperCase();

      /* el lado de cada ficha: que entren tres en fila con aire entre ellas */
      var sep = 14;
      var lado = Math.floor(Math.min((rc.width - sep * 2 - 24) / 3, rc.height - 34));
      lado = Math.max(56, lado);

      var estiloDia = getComputedStyle(elDia), estiloMon = getComputedStyle(elMon);

      var maq = document.createElement('div');
      maq.className = 'rasp-3 f-' + cfg.forma;
      maq.style.setProperty('--r3-lado', lado + 'px');
      maq.style.setProperty('--r3-sep', sep + 'px');
      maq.innerHTML =
        '<div class="r3-f" id="r3-dia">'  + dia + '</div>' +
        '<div class="r3-f" id="r3-mes">'  + mes + '</div>' +
        (anio ? '<div class="r3-f" id="r3-anio">' + anio + '</div>' : '');
      under.style.visibility = 'hidden';
      card.appendChild(maq);

      /* en el corazón todo va un poco más chico: hay menos superficie útil */
      var kDia = cfg.forma === 'corazon' ? .38 : .46;
      var kTxt = cfg.forma === 'corazon' ? .17 : .19;

      var d3 = maq.querySelector('#r3-dia');
      d3.style.fontFamily = estiloDia.fontFamily;
      d3.style.color = estiloDia.color;
      d3.style.fontSize = Math.round(lado * kDia) + 'px';
      ['#r3-mes', '#r3-anio'].forEach(function (s) {
        var e = maq.querySelector(s); if (!e) return;
        e.style.fontFamily = estiloMon.fontFamily;
        e.style.color = estiloMon.color;
        e.style.letterSpacing = '.06em';
        e.style.fontSize = Math.round(lado * kTxt) + 'px';
      });

      var fichas = [
        { el: d3,                            sig: 'Ahora el mes…' },
        { el: maq.querySelector('#r3-mes'),  sig: anio ? 'Y el año…' : '' },
        { el: anio ? maq.querySelector('#r3-anio') : null, sig: '' }
      ].filter(function (o) { return o.el; });

      decir('✨ Empezá por el día');

      var zonas = fichas.map(function (f, i) {
        var z = nuevaZona(cajaDe(f.el));
        if (i > 0) z.classList.add('dormida');
        return { zona: z, sig: f.sig };
      });

      zonas.forEach(function (item, i) {
        armarZona(item.zona, cfg, function () {
          var prox = zonas[i + 1];
          if (prox) {
            prox.zona.classList.remove('dormida');
            if (item.sig) decir(item.sig);
          } else {
            decir('');
            destellar(card, cfg);
            vibrar([12, 45, 22], cfg);
          }
        });
      });

    } else {
      /* modo simple: una sola raspada sobre toda la tarjeta */
      var z = nuevaZona({ left: 0, top: 0, w: rc.width, h: rc.height }, 'cuadrado');
      armarZona(z, cfg, function () {
        decir('');
        destellar(card, cfg);
        vibrar([12, 45, 22], cfg);
      });
    }
  }

  function arrancar() {
    armar();
    addEventListener('message', function () { setTimeout(armar, 80); });
    addEventListener('resize', function () { firmaVieja = null; setTimeout(armar, 150); });
    if (ES_PREVIEW) {
      setInterval(armar, 800);
    } else {
      var n = 0, t = setInterval(function () {
        armar();
        if (document.querySelector('.rasp-zona') || ++n > 60) clearInterval(t);
      }, 250);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
