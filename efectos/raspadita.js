/* ===== LA RASPADITA DE LA FECHA ===============================================

   QUÉ ES
   El "pasá el dedo para descubrir" que tapa la fecha. Ya existía: una capa que
   se borra con el dedo. Esto le agrega seis cosas y no cambia nada si está
   apagado.

   ⚠️ VIENE APAGADA. Sin encenderla, la raspadita se comporta como siempre.

   LAS SEIS COSAS
   1. SE COMPLETA SOLA. Al llegar al porcentaje que se elija (por defecto 42%),
      el resto se desvanece. Nadie tiene que limpiar hasta el último rincón.
   2. POR PARTES. En vez de una sola raspada, tres: primero el día, después el
      mes, después el año. Cada uno se habilita cuando terminaste el anterior,
      así la fecha se revela en tres tiempos.
   3. POLVILLO. Salta polvo finito mientras raspás, para que se sienta material
      y no una capa que desaparece.
   4. DESTELLO. Cuando termina, un brillo suave cruza la fecha y cierra el momento.
   5. VIBRACIÓN. Una vibración cortita al completar cada parte.
      ⚠️ Sólo funciona en Android. iPhone no permite vibrar desde una página web
      — no es un error, es una limitación de Apple. En iPhone simplemente no pasa
      nada; todo lo demás funciona igual.
   6. COLOR ELEGIBLE. La capa de arriba puede ser plata, dorada, o cualquier
      color de la paleta de la invitación, para que combine con el diseño.

   CÓMO SE CONFIGURA (igual que el resto: panel → body → dirección web)
     encendido / rasp        1 para encender
     modo      / raspModo    simple · partes
     color     / raspColor   plata · oro · o cualquier color
     auto      / raspAuto    0 a 100 — con cuánto se completa sola (0 = nunca)
     polvillo  / raspPolvillo   1 / 0
     destello  / raspDestello   1 / 0
     vibrar    / raspVibrar      1 / 0
     grosor    / raspGrosor   el ancho del dedo al raspar, en px (por defecto 26)

   DE DÓNDE SACA LA FECHA
   De lo que la invitación ya muestra: #sc-day ("28") y #sc-mon ("Noviembre 2026").
   Para el modo por partes separa el año del mes por el último espacio.
   ============================================================================ */
(function () {
  'use strict';

  var PALETA = {
    plata:'#c9c9c9', oro:'#c9a227', lino:'#f4efe6', kraft:'#e8e1d6',
    uva:'#b06a7e', salvia:'#a9b8a0', champagne:'#efe6d4', tinta:'#4a4038'
  };

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
    return {
      modo:     String(opt('modo', 'raspModo') || 'simple').toLowerCase() === 'partes' ? 'partes' : 'simple',
      color:    color(opt('color', 'raspColor'), '#c9c9c9'),
      auto:     Math.max(0, Math.min(100, parseInt(opt('auto', 'raspAuto') || '42', 10))),
      polvillo: siNo(opt('polvillo', 'raspPolvillo'), true),
      destello: siNo(opt('destello', 'raspDestello'), true),
      vibrar:   siNo(opt('vibrar', 'raspVibrar'), true),
      grosor:   Math.max(10, Math.min(60, parseInt(opt('grosor', 'raspGrosor') || '26', 10)))
    };
  }

  var CSS = [
    '.rasp-zona{position:absolute;overflow:hidden;border-radius:8px}',
    '.rasp-zona canvas{position:absolute;inset:0;width:100%;height:100%;',
    '  touch-action:none;cursor:grab;transition:opacity .55s ease}',
    '.rasp-zona.lista canvas{opacity:0;pointer-events:none}',
    '.rasp-zona.dormida{opacity:.45}',
    '.rasp-zona.dormida canvas{cursor:default}',
    '#rasp-polvo{position:absolute;inset:0;pointer-events:none;z-index:6}',
    '.rasp-destello{position:absolute;inset:0;pointer-events:none;z-index:7;overflow:hidden;border-radius:10px}',
    '.rasp-destello i{position:absolute;top:-60%;bottom:-60%;width:38%;left:-45%;',
    '  background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.75),rgba(255,255,255,0));',
    '  transform:skewX(-16deg);animation:raspBrillo 1.05s cubic-bezier(.3,.5,.3,1) forwards}',
    '@keyframes raspBrillo{to{left:118%}}',
    /* la maqueta del modo por partes */
    '.rasp-3{position:absolute;inset:0;display:flex;flex-direction:column;',
    '  align-items:center;justify-content:center;gap:2px}',
    '.rasp-3 .r3-dia{line-height:1}',
    '.rasp-3 .r3-fila{display:flex;align-items:baseline;gap:10px}',
    '@media(prefers-reduced-motion:reduce){.rasp-destello{display:none}}'
  ].join('\n');

  function ponerEstilos() {
    if (document.getElementById('rasp-css')) return;
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

    /* un grano finito, para que no parezca plástico */
    for (var i = 0; i < (w * h) / 26; i++) {
      g.fillStyle = 'rgba(255,255,255,' + (Math.random() * .16) + ')';
      g.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
  }

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
      for (var i = 3; i < d.length; i += 4 * 16) {   /* de a 16 píxeles: alcanza */
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

    return { completar: completar, esta: function () { return terminada; } };
  }

  /* ---------- el destello final ---------- */
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

    if (!encendido()) return;                 /* apagada: se deja como estaba */

    var cfg = config();
    var firma = JSON.stringify(cfg);
    if (yaArmado && firma === firmaVieja && card.querySelector('.rasp-zona')) return;
    firmaVieja = firma;

    var under = card.querySelector('.scratch-under');
    var dia = (document.getElementById('sc-day') || {}).textContent || '';
    var mon = (document.getElementById('sc-mon') || {}).textContent || '';
    dia = dia.trim(); mon = mon.trim();
    if (!dia) return;

    /* el canvas original y cualquier armado previo se van */
    var viejo = document.getElementById('scratch-cv');
    if (viejo) viejo.style.display = 'none';
    [].forEach.call(card.querySelectorAll('.rasp-zona,#rasp-polvo,.rasp-destello'), function (e) { e.remove(); });

    ponerEstilos();
    prepararPolvo(card);
    yaArmado = true;

    var zonas = [];
    function nuevaZona(caja) {
      var z = document.createElement('div');
      z.className = 'rasp-zona';
      z.style.left = caja.left + 'px'; z.style.top = caja.top + 'px';
      z.style.width = caja.w + 'px';   z.style.height = caja.h + 'px';
      var cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.round(caja.w));
      cv.height = Math.max(1, Math.round(caja.h));
      z.appendChild(cv);
      card.appendChild(z);
      return z;
    }

    var rc = card.getBoundingClientRect();
    function cajaDe(el, margen) {
      var b = el.getBoundingClientRect();
      margen = margen || 8;
      return {
        left: Math.round(b.left - rc.left - margen),
        top:  Math.round(b.top  - rc.top  - margen),
        w:    Math.round(b.width  + margen * 2),
        h:    Math.round(b.height + margen * 2)
      };
    }

    if (cfg.modo === 'partes') {
      /* se separa el año del mes por el último espacio: "Noviembre 2026" */
      var m = mon.match(/^(.*?)\s+(\d{4})$/);
      var mes = m ? m[1] : mon, anio = m ? m[2] : '';

      /* maqueta propia: el día arriba, mes y año abajo, lado a lado */
      var elDia = document.getElementById('sc-day');
      var elMon = document.getElementById('sc-mon');
      var estiloDia = getComputedStyle(elDia), estiloMon = getComputedStyle(elMon);

      var maq = document.createElement('div');
      maq.className = 'rasp-3';
      maq.innerHTML =
        '<div class="r3-dia" id="r3-dia">' + dia + '</div>' +
        '<div class="r3-fila"><span id="r3-mes">' + mes + '</span>' +
        (anio ? '<span id="r3-anio">' + anio + '</span>' : '') + '</div>';
      under.style.visibility = 'hidden';
      card.appendChild(maq);

      var d3 = maq.querySelector('#r3-dia');
      d3.style.font = estiloDia.font; d3.style.color = estiloDia.color;
      d3.style.fontFamily = estiloDia.fontFamily; d3.style.fontSize = estiloDia.fontSize;
      ['#r3-mes', '#r3-anio'].forEach(function (s) {
        var e = maq.querySelector(s); if (!e) return;
        e.style.fontFamily = estiloMon.fontFamily; e.style.fontSize = estiloMon.fontSize;
        e.style.color = estiloMon.color; e.style.letterSpacing = estiloMon.letterSpacing;
      });

      var orden = [
        { el: maq.querySelector('#r3-dia'),  txt: 'Ahora el mes…' },
        { el: maq.querySelector('#r3-mes'),  txt: anio ? 'Y el año…' : '' },
        { el: anio ? maq.querySelector('#r3-anio') : null, txt: '' }
      ].filter(function (o) { return o.el; });

      decir('✨ Empezá por el día');

      orden.forEach(function (o, i) {
        var z = nuevaZona(cajaDe(o.el, i === 0 ? 10 : 8));
        if (i > 0) z.classList.add('dormida');
        zonas.push({ zona: z, sig: o.txt });
      });

      zonas.forEach(function (item, i) {
        item.ctrl = armarZona(item.zona, cfg, function () {
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
      var z = nuevaZona({ left: 0, top: 0, w: rc.width, h: rc.height });
      zonas.push({ zona: z });
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
