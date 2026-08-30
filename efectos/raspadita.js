/* ===== LA RASPADITA DE LA FECHA ===============================================

   QUÉ ES
   El "desliza el dedo para descubrir" que tapa la fecha. Apagada por defecto.

   LO QUE HACE
   1. SE COMPLETA SOLA al llegar al porcentaje elegido (por defecto 42%).
   2. POR PARTES: el día, el mes y el año se raspan en orden; cada uno se
      habilita al terminar el anterior.
   3. LAS FICHAS QUEDAN: debajo hay una ficha de verdad —fondo, doble filete y
      sombra— que queda como parte del diseño.
   4. POLVILLO al raspar · 5. DESTELLO al terminar · 6. VIBRACIÓN cortita.
      ⚠️ La vibración sólo funciona en Android. iPhone no la permite.
   7. COLOR, FORMA y MES a elección.

   ⚠️ LOS TEXTOS VAN EN ESPAÑOL DE MÉXICO, no en voseo.
   El motor se traduce en el servidor (i/textos-es-mx.php), pero lo que escribe
   un módulo NO pasa por ahí. Por eso el aviso dice "Empieza por el día" y no
   "Empezá por el día".

   ⭐ SE MONTA SOBRE LA DISPOSICIÓN DE FECHA
   Si `efectos/fecha.js` dibujó una de sus nueve disposiciones, la raspadita NO
   arma sus propias fichas: tapa lo que la fecha haya puesto. Las disposiciones
   marcan sus pedazos con `data-rasp`:
     · `data-rasp="1|2|3"` → tres pedazos: se puede raspar en tres tiempos
     · `data-rasp="0"`     → un solo bloque: se tapa entero
   Si no hay ninguna disposición, la raspadita arma sus fichas como siempre.

   ⚠️⚠️ BUG 1 — UNA VEZ RASPADA, QUEDA RASPADA.
   Antes, cualquier `resize` borraba la firma y volvía a armar la capa: el
   invitado raspaba, veía la fecha, y la plata se le ponía de nuevo encima. En
   el celular es peor, porque al hacer scroll entra y sale la barra de
   direcciones y eso dispara `resize` a cada rato.
   Lo arregla la bandera `completado`: cuando se terminó, `armar()` se va en la
   primera línea. Y el `resize` sólo rearma si la tarjeta CAMBIÓ DE TAMAÑO de
   verdad (más de 4 px).

   ⚠️⚠️ BUG 2 — LAS TAPAS QUEDABAN CORRIDAS (Safari y iPhone).
   Se veía un círculo plateado al lado del círculo de la fecha, en vez de encima,
   y raspar no revelaba nada. Y si recargabas, andaba bien.

   La causa: este módulo MIDE dónde están los pedazos de la fecha con
   `getBoundingClientRect()` para poner las tapas justo arriba. Si mide antes de
   que terminen de cargar las tipografías (Great Vibes, Forum, Cormorant…), los
   números todavía se están dibujando con la letra de reemplazo, ocupan otro
   ancho, y las cajas dan mal. Al recargar, la fuente ya está en caché, llega a
   tiempo y por eso "a veces anda". Safari es más propenso porque tarda más en
   resolver las fuentes web.

   La solución tiene dos partes, las dos necesarias:
   1. ESPERAR a `document.fonts.ready` antes de armar por primera vez.
   2. VIGILAR unos segundos: si los pedazos de la fecha se movieron y el
      invitado TODAVÍA NO EMPEZÓ A RASPAR, se rearma en el lugar correcto.
      Si ya empezó a raspar no se toca nada, porque perdería su avance —para
      eso está la bandera `tocado`.

   ⚠️ NO alcanza con sólo esperar las fuentes: también entran a último momento
   las fotos de la disposición "fotos", que cambian el alto. Por eso la vigilancia.

   CÓMO SE CONFIGURA (panel → body → dirección web)
     encendido / rasp · modo / raspModo · forma / raspForma · mes / raspMes
     color · num · fondo · linea · auto · polvillo · destello · vibrar · grosor

   ⚠️ TRES COSAS QUE COSTARON
   · `box-sizing:border-box` en las fichas, o el texto se escapa de la forma.
   · Los `%` de `padding` se calculan sobre el ANCHO DEL CONTENEDOR, no del
     elemento: por eso el ajuste del corazón va en píxeles.
   · Los colores del SVG van con el `#` como `%23`, o las fichas salen NEGRAS.
   ============================================================================ */
(function () {
  'use strict';

  var PALETA = {
    plata:'#c9c9c9', oro:'#c9a227', lino:'#f4efe6', kraft:'#e8e1d6',
    uva:'#b06a7e', salvia:'#a9b8a0', champagne:'#efe6d4', tinta:'#4a4038',
    crema:'#fbf8f3', blanco:'#ffffff', verde:'#5c6b57'
  };

  var CORAZON_D = "M50 92C22 72 6 58 6 40 6 24 18 14 31 14c8 0 15 4 19 10 4-6 11-10 19-10 13 0 25 10 25 26 0 18-16 32-44 52z";
  var CORAZON_MASK = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='" + CORAZON_D + "' fill='black'/></svg>\")";

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
      mes:      String(opt('mes', 'raspMes') || 'corto').toLowerCase() === 'completo' ? 'completo' : 'corto',
      color:    color(opt('color', 'raspColor'), '#c9c9c9'),
      num:      color(opt('num', 'raspNum'), ''),
      fondo:    color(opt('fondo', 'raspFondo'), '#fbf8f3'),
      linea:    color(opt('linea', 'raspLinea'), ''),
      auto:     Math.max(0, Math.min(100, parseInt(opt('auto', 'raspAuto') || '42', 10))),
      polvillo: siNo(opt('polvillo', 'raspPolvillo'), true),
      destello: siNo(opt('destello', 'raspDestello'), true),
      vibrar:   siNo(opt('vibrar', 'raspVibrar'), true),
      grosor:   Math.max(10, Math.min(60, parseInt(opt('grosor', 'raspGrosor') || '26', 10)))
    };
  }

  /* ⚠️ el `#` va como %23 o el SVG no dibuja (fichas negras) */
  function svgFicha(forma, relleno, linea) {
    var f = String(relleno).replace(/#/g, '%23');
    var c = String(linea).replace(/#/g, '%23');
    var cuerpo;
    if (forma === 'redondo') {
      cuerpo = "<rect x='2' y='2' width='96' height='96' rx='48' fill='" + f + "' stroke='" + c + "' stroke-width='1.6'/>" +
               "<rect x='7.5' y='7.5' width='85' height='85' rx='42' fill='none' stroke='" + c + "' stroke-width='.8' opacity='.45'/>";
    } else if (forma === 'corazon') {
      cuerpo = "<path d='" + CORAZON_D + "' fill='" + f + "' stroke='" + c + "' stroke-width='1.6'/>" +
               "<path d='" + CORAZON_D + "' fill='none' stroke='" + c + "' stroke-width='.8' opacity='.45' " +
               "transform='translate(50,52) scale(.86) translate(-50,-52)'/>";
    } else {
      cuerpo = "<rect x='2' y='2' width='96' height='96' rx='14' fill='" + f + "' stroke='" + c + "' stroke-width='1.6'/>" +
               "<rect x='7.5' y='7.5' width='85' height='85' rx='10' fill='none' stroke='" + c + "' stroke-width='.8' opacity='.45'/>";
    }
    return "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>" +
           cuerpo + "</svg>\")";
  }

  var CSS = [
    '.rasp-zona{position:absolute;overflow:hidden}',
    '.rasp-zona canvas{position:absolute;inset:0;width:100%;height:100%;',
    '  touch-action:none;cursor:grab;transition:opacity .55s ease,filter .45s ease}',
    '.rasp-zona.lista canvas{opacity:0;pointer-events:none}',
    '.rasp-zona.dormida canvas{filter:brightness(.84) saturate(.72);cursor:default}',
    '.rasp-zona.f-cuadrado{border-radius:12px}',
    '.rasp-zona.f-redondo{border-radius:999px}',
    '.rasp-zona.f-corazon{-webkit-mask-image:' + CORAZON_MASK + ';mask-image:' + CORAZON_MASK + ';',
    '  -webkit-mask-size:100% 100%;mask-size:100% 100%;',
    '  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}',
    '#rasp-polvo{position:absolute;inset:0;pointer-events:none;z-index:6}',
    '.rasp-destello{position:absolute;inset:0;pointer-events:none;z-index:7;overflow:hidden;border-radius:10px}',
    '.rasp-destello i{position:absolute;top:-60%;bottom:-60%;width:38%;left:-45%;',
    '  background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.75),rgba(255,255,255,0));',
    '  transform:skewX(-16deg);animation:raspBrillo 1.05s cubic-bezier(.3,.5,.3,1) forwards}',
    '@keyframes raspBrillo{to{left:118%}}',
    '.rasp-3{position:absolute;inset:0;display:flex;align-items:center;',
    '  justify-content:center;gap:var(--r3-sep,14px)}',
    '.rasp-3 .r3-f{box-sizing:border-box;display:flex;align-items:center;',
    '  justify-content:center;height:var(--r3-lado);line-height:1;text-align:center;',
    '  background-size:100% 100%;background-repeat:no-repeat;',
    '  filter:drop-shadow(0 3px 9px rgba(60,45,30,.18))}',
    '@media(prefers-reduced-motion:reduce){.rasp-destello{display:none}}'
  ].join('\n');

  function ponerEstilos() {
    var v = document.getElementById('rasp-css');
    if (v) v.remove();
    var s = document.createElement('style');
    s.id = 'rasp-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function vibrar(patron, cfg) {
    if (!cfg.vibrar) return;
    try { if (navigator.vibrate) navigator.vibrate(patron); } catch (e) {}
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
        vx: (Math.random() - .5) * 2.4, vy: (Math.random() - .9) * 1.9,
        r: Math.random() * 1.7 + .5, vida: 1,
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

  function porcentaje(cv) {
    try {
      var g = cv.getContext('2d');
      var d = g.getImageData(0, 0, cv.width, cv.height).data;
      var vacios = 0, total = 0;
      for (var i = 3; i < d.length; i += 4 * 16) { total++; if (d[i] < 40) vacios++; }
      return total ? (vacios / total) * 100 : 0;
    } catch (e) { return 0; }
  }

  /* ⚠️ En cuanto el invitado da la primera pasada, esto queda en true y la
     vigilancia de posición deja de rearmar: si rearmara, le borraría el avance. */
  var tocado = false;

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
      tocado = true;
      ev.preventDefault();
      var p = punto(ev);
      g.globalCompositeOperation = 'destination-out';
      g.lineWidth = cfg.grosor; g.lineCap = 'round'; g.lineJoin = 'round';
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

    function abajo(ev) { raspando = true; ultimo = null; tocado = true; rascar(ev); }
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

  var yaArmado = false, firmaVieja = null;

  /* ⚠️ Cuando se terminó de raspar, `armar()` se va en la primera línea. */
  var completado = false;

  /* el tamaño con el que se armó, para saber si un resize fue de verdad */
  var medidaVieja = null;

  /* ⚠️ Dónde estaban los pedazos de la fecha cuando armamos. Si se mueven
     —porque recién ahí cargó la tipografía o una foto— hay que recolocar. */
  var geoVieja = null;

  function geoDe(card) {
    var rc = card.getBoundingClientRect();
    return [].map.call(card.querySelectorAll('[data-rasp]'), function (e) {
      var b = e.getBoundingClientRect();
      return Math.round(b.left - rc.left) + ',' + Math.round(b.top - rc.top) +
             ',' + Math.round(b.width) + ',' + Math.round(b.height);
    }).join('|');
  }

  function armar() {
    var card = document.getElementById('scratchcard');
    if (!card) return;
    if (!encendido()) return;
    if (completado) return;                 /* ⚠️ ya se raspó: no se rearma */

    var cfg = config();

    /* ¿el módulo de fecha dibujó una disposición? sus pedazos llevan data-rasp */
    var marcados = [].slice.call(card.querySelectorAll('[data-rasp]'));
    var partesFecha = marcados.filter(function (e) { return e.getAttribute('data-rasp') !== '0'; })
                              .sort(function (a, b) {
                                return +a.getAttribute('data-rasp') - +b.getAttribute('data-rasp');
                              });
    var bloqueFecha = marcados.filter(function (e) { return e.getAttribute('data-rasp') === '0'; })[0];

    var firma = JSON.stringify(cfg) + '|' + marcados.length + '|' + (partesFecha.length);
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
    medidaVieja = Math.round(rc.width) + 'x' + Math.round(rc.height);

    function cajaDe(el) {
      var b = el.getBoundingClientRect();
      return {
        left: Math.round(b.left - rc.left), top: Math.round(b.top - rc.top),
        w: Math.round(b.width), h: Math.round(b.height)
      };
    }

    function nuevaZona(caja, forma, radio) {
      var z = document.createElement('div');
      z.className = 'rasp-zona' + (forma ? ' f-' + forma : '');
      if (radio) z.style.borderRadius = radio;
      z.style.left = caja.left + 'px'; z.style.top = caja.top + 'px';
      z.style.width = caja.w + 'px';   z.style.height = caja.h + 'px';
      var cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.round(caja.w));
      cv.height = Math.max(1, Math.round(caja.h));
      z.appendChild(cv);
      card.appendChild(z);
      return z;
    }

    function cerrar() {
      completado = true;                    /* ⚠️ desde acá no se rearma más */
      decir('');
      destellar(card, cfg);
      vibrar([12, 45, 22], cfg);
    }

    function encadenar(zonas) {
      zonas.forEach(function (item, i) {
        armarZona(item.zona, cfg, function () {
          var prox = zonas[i + 1];
          if (prox) {
            prox.zona.classList.remove('dormida');
            if (item.sig) decir(item.sig);
          } else { cerrar(); }
        });
      });
    }

    /* ---------- A · hay una disposición de fecha con tres pedazos ---------- */
    if (partesFecha.length >= 2 && cfg.modo === 'partes') {
      decir('✨ Empieza por el día');
      var textos = ['Ahora el mes…', 'Y el año…', ''];
      var zonasA = partesFecha.map(function (el, i) {
        /* la tapa copia la forma de lo que tapa (círculo, rectángulo…) */
        var z = nuevaZona(cajaDe(el), '', getComputedStyle(el).borderRadius);
        if (i > 0) z.classList.add('dormida');
        return { zona: z, sig: textos[i] || '' };
      });
      encadenar(zonasA);
      geoVieja = geoDe(card);
      return;
    }

    /* ---------- B · hay disposición, pero se tapa todo junto ---------- */
    if (partesFecha.length || bloqueFecha) {
      var refe = bloqueFecha || card.querySelector('.ivf') || card;
      var z = nuevaZona({ left: 0, top: 0, w: rc.width, h: rc.height }, 'cuadrado');
      armarZona(z, cfg, cerrar);
      geoVieja = geoDe(card);
      return;
    }

    /* ---------- C · sin disposición: las fichas propias de siempre ---------- */
    if (cfg.modo === 'partes') {
      var m = mon.match(/^(.*?)\s+(\d{4})$/);
      var mesLargo = m ? m[1] : mon, anio = m ? m[2] : '';
      var completo = (cfg.mes === 'completo');
      var mesTxt = completo ? mesLargo : mesLargo.slice(0, 3).toUpperCase();

      var estiloDia = getComputedStyle(elDia), estiloMon = getComputedStyle(elMon);
      var colNum = cfg.num || estiloDia.color || '#4a4038';
      var colTxt = cfg.num || estiloMon.color || '#6b5f52';
      var linea  = cfg.linea || colNum;

      var sep = 14;
      var equiv = completo ? 4.1 : 3;
      var lado = Math.floor(Math.min((rc.width - sep * 2 - 20) / equiv, rc.height - 34));
      lado = Math.max(48, lado);
      var anchoMes = completo ? Math.round(lado * 2.1) : lado;
      var formaMes = (completo && cfg.forma === 'corazon') ? 'redondo' : cfg.forma;

      var maq = document.createElement('div');
      maq.className = 'rasp-3';
      maq.style.setProperty('--r3-lado', lado + 'px');
      maq.style.setProperty('--r3-sep', sep + 'px');
      maq.innerHTML =
        '<div class="r3-f" id="r3-dia">'  + dia + '</div>' +
        '<div class="r3-f" id="r3-mes">'  + mesTxt + '</div>' +
        (anio ? '<div class="r3-f" id="r3-anio">' + anio + '</div>' : '');
      if (under) under.style.visibility = 'hidden';
      card.appendChild(maq);

      /* ⚠️ el ajuste del corazón va en PÍXELES: los % se miden contra el
         ancho del contenedor y descolocaban el número */
      function acomodar(el, forma, ancho) {
        el.style.width = ancho + 'px';
        el.style.backgroundImage = svgFicha(forma, cfg.fondo, linea);
        el.style.paddingTop = '0px';
        el.style.paddingBottom = (forma === 'corazon' ? Math.round(lado * .135) : 0) + 'px';
      }

      var d3 = maq.querySelector('#r3-dia');
      var m3 = maq.querySelector('#r3-mes');
      var a3 = anio ? maq.querySelector('#r3-anio') : null;

      acomodar(d3, cfg.forma, lado);
      acomodar(m3, formaMes, anchoMes);
      if (a3) acomodar(a3, cfg.forma, lado);

      var kDia = cfg.forma === 'corazon' ? .36 : .44;
      var kTxt = cfg.forma === 'corazon' ? .16 : .18;
      if (completo) kTxt = Math.min(kTxt, .155);

      d3.style.fontFamily = estiloDia.fontFamily;
      d3.style.color = colNum;
      d3.style.fontSize = Math.round(lado * kDia) + 'px';
      [m3, a3].forEach(function (e) {
        if (!e) return;
        e.style.fontFamily = estiloMon.fontFamily;
        e.style.color = colTxt;
        e.style.letterSpacing = completo ? '.02em' : '.06em';
        e.style.fontSize = Math.round(lado * kTxt) + 'px';
      });

      var fichas = [
        { el: d3, forma: cfg.forma, sig: 'Ahora el mes…' },
        { el: m3, forma: formaMes,  sig: anio ? 'Y el año…' : '' },
        { el: a3, forma: cfg.forma, sig: '' }
      ].filter(function (o) { return o.el; });

      decir('✨ Empieza por el día');
      encadenar(fichas.map(function (f, i) {
        var z = nuevaZona(cajaDe(f.el), f.forma);
        if (i > 0) z.classList.add('dormida');
        return { zona: z, sig: f.sig };
      }));

    } else {
      var zs = nuevaZona({ left: 0, top: 0, w: rc.width, h: rc.height }, 'cuadrado');
      armarZona(zs, cfg, cerrar);
    }
    geoVieja = geoDe(card);
  }

  /* ⚠️ El resize sólo rearma si la tarjeta cambió de tamaño DE VERDAD.
     En el celular, al hacer scroll entra y sale la barra de direcciones y eso
     dispara `resize` constantemente. */
  function alRedimensionar() {
    if (completado) return;
    var card = document.getElementById('scratchcard');
    if (!card) return;
    var r = card.getBoundingClientRect();
    var ahora = Math.round(r.width) + 'x' + Math.round(r.height);
    if (medidaVieja === null) { medidaVieja = ahora; return; }
    var v = medidaVieja.split('x'), a = ahora.split('x');
    if (Math.abs(+v[0] - +a[0]) < 5 && Math.abs(+v[1] - +a[1]) < 5) return;
    firmaVieja = null;
    setTimeout(armar, 150);
  }

  /* ⚠️ LA VIGILANCIA QUE ARREGLA LAS TAPAS CORRIDAS.
     Si los pedazos de la fecha se movieron (cargó la tipografía, entró una foto)
     y el invitado todavía no empezó a raspar, se rearma en el lugar correcto. */
  function vigilarPosicion() {
    if (completado || tocado) return;
    var card = document.getElementById('scratchcard');
    if (!card || !card.querySelector('.rasp-zona')) return;
    var ahora = geoDe(card);
    if (!ahora || ahora === geoVieja) return;
    firmaVieja = null;
    armar();
  }

  function arrancar() {
    /* ⚠️ Esperar las tipografías ANTES de medir. Sin esto, en Safari y en el
       iPhone las tapas quedan corridas al lado de los números. */
    var listo = false;
    function primeraVez() {
      if (listo) return;
      listo = true;
      armar();
    }
    try {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(primeraVez);
        setTimeout(primeraVez, 2500);   /* red de seguridad si nunca resuelve */
      } else { primeraVez(); }
    } catch (e) { primeraVez(); }

    addEventListener('message', function () { setTimeout(armar, 80); });

    var espera = null;
    addEventListener('resize', function () {
      clearTimeout(espera);
      espera = setTimeout(alRedimensionar, 220);
    });

    /* vigilancia de posición durante los primeros segundos */
    var v = 0, tv = setInterval(function () {
      vigilarPosicion();
      if (++v > 40 || completado || tocado) clearInterval(tv);
    }, 300);

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
