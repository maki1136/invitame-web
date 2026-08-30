/* ===== EL CALENDARIO DE LA FECHA ==============================================

   QUÉ ES
   Un sector nuevo de la invitación: la grilla del mes del evento, con el día
   marcado. NO es una imagen: se dibuja solo a partir de la fecha, así que si la
   fecha cambia, el calendario se acomoda y el día nunca queda en la columna
   equivocada.

   ⚠️ VIENE APAGADO. No aparece en ninguna invitación salvo que se lo encienda.

   DE DÓNDE SACA LA CONFIGURACIÓN (en este orden)
   1. `INVEV.fx.calendario`  ← lo que guardan las chicas en el panel
   2. `document.body.dataset.calXxx`
   3. la dirección web: `?cal=1&calFuente=prata&calMarca=circulo&calNum=b06a7e`

   ⭐ EN LA VISTA PREVIA DEL PANEL SE ACTUALIZA SOLO
   El panel le manda los datos a la previa en vivo. Por eso este archivo vigila
   la configuración y, apenas cambia algo —un color, el tamaño, el marcador—,
   borra el calendario y lo vuelve a dibujar. Si se apaga la casilla, el sector
   desaparece. Todo sin recargar.

   ⚠️ LOS TEXTOS VAN EN ESPAÑOL DE MÉXICO, no en voseo.
   El motor se traduce en el servidor (i/textos-es-mx.php), pero lo que escribe
   un módulo NO pasa por ahí. Por eso la bajada por defecto dice "Guarda la
   fecha" y no "Guardá la fecha".

   LAS OPCIONES
     encendido / cal     1 para encender
     fuente   / calFuente  forum · marcellus · prata · montserrat
     marca    / calMarca   corazon · circulo · cuadrado · relleno
     num      / calNum     COLOR de los números
     mk       / calMk      COLOR del marcador
     bg       / calBg      COLOR de fondo
     img      / calImg     imagen de fondo (manda sobre el color)
     velo     / calVelo    0 a 100, cuánto se aclara la imagen
     tam      / calTam     ANCHO del calendario, de 220 a 390 px
     kick     / calKick    la bajada de arriba (por defecto "Guarda la fecha")
     pie      / calPie     el texto de abajo
     fecha    / calFecha   AAAA-MM-DD, sólo si hiciera falta forzarla

   LOS COLORES
   Los tres aceptan CUALQUIER color en hexadecimal, o uno de estos nombres:
     lino #f4efe6 · kraft #e8e1d6 · uva #b06a7e · uvaclaro #e8d5da
     salvia #a9b8a0 · salviaclaro #dfe6db · oro #b9a56a · champagne #efe6d4
     tinta #4a4038 · blanco #ffffff · negro #1f1b17
   La paleta es un atajo, no un límite.

   EL TAMAÑO
   390 px es el máximo (lo que entra cómodo en un celular) y se puede achicar
   hasta 220. Todo lo demás se achica en proporción.

   DE DÓNDE SACA LA FECHA
   Del sector de la fecha que la invitación ya muestra (#sc-day y #sc-mon).
   Si no la encuentra, no dibuja nada en vez de mostrar un mes equivocado.
   ============================================================================ */
(function () {
  'use strict';

  var MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
               'Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  var DOW = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  var PALETA = {
    lino:'#f4efe6', kraft:'#e8e1d6', uva:'#b06a7e', uvaclaro:'#e8d5da',
    salvia:'#a9b8a0', salviaclaro:'#dfe6db', oro:'#b9a56a', champagne:'#efe6d4',
    tinta:'#4a4038', blanco:'#ffffff', negro:'#1f1b17'
  };

  /* ===== EL MARCADOR DEL DÍA =====================================================

     ⚠️⚠️ EL CORAZÓN TOCABA EL NÚMERO. SE ARREGLÓ DOS VECES MAL ANTES DE ESTA.

     El error no era uno solo, eran dos sumados:

     1. EL DIBUJO ESTABA DESCENTRADO EN SU PROPIA CAJA. El corazón de siempre
        iba de y=5,7 a y=20,5 dentro de un lienzo de 24×24. O sea que su centro
        real estaba en 13,1 y no en 12: el trazo ya nacía 1,1 abajo, un 4,6%
        de la caja.
     2. Y ENCIMA SE LO EMPUJABA MÁS. `BAJA.corazon` valía .07, que lo bajaba
        otro 7%.

     Entre las dos cosas el corazón terminaba casi un 12% más abajo que el
     número. Por eso el número quedaba arriba de todo, justo contra la muesca
     donde se juntan los dos lóbulos, y parecía que el trazo lo tocaba.

     Los dos intentos anteriores fueron empujones a ojo (`margin-top:2px`,
     después `BAJA`). Empujar tapa el síntoma en un tamaño y lo rompe en otro,
     porque el desfasaje es PROPORCIONAL a la caja.

     LA SOLUCIÓN DE VERDAD: se corrigió el dibujo. El corazón de abajo va de
     y=4,6 a y=19,4 — centro exacto en 12, igual que el lienzo. Ahora
     `BAJA.corazon` es 0 y no hace falta empujar nada, en ningún tamaño.

     ⚠️ SI ALGUIEN CAMBIA EL DIBUJO DEL CORAZÓN: que el trazo quede centrado en
     el lienzo (arriba y abajo tienen que sobrar lo mismo). Si no, vuelve a
     pasar. Y NO se arregla con `margin-top`.

     La caja del corazón es más grande que la de las otras marcas porque el
     trazo ocupa apenas el 62% de su alto: necesita más lienzo para que el
     número de dos cifras quede con aire. */
  var MARCAS = {
    corazon:'<svg viewBox="0 0 24 24"><path d="M12 19.4C7 15.7 3.6 12.9 3.6 9.3 3.6 6.6 5.7 4.6 8.3 4.6c1.6 0 3 .8 3.7 2 .7-1.2 2.1-2 3.7-2 2.6 0 4.7 2 4.7 4.7 0 3.6-3.4 6.4-8.4 10.1z"/></svg>',
    circulo:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.6"/></svg>',
    cuadrado:'<svg viewBox="0 0 24 24"><rect x="2.6" y="2.6" width="18.8" height="18.8" rx="2.4"/></svg>',
    relleno:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.6" class="relleno"/><circle cx="12" cy="12" r="9.6"/></svg>'
  };

  /* cuánto lienzo se le da a cada marca, en proporción al ancho de una celda */
  var CAJA = { corazon: 1.20, circulo: .94, cuadrado: .92, relleno: .94 };

  /* ⚠️ TODOS EN CERO. El corazón ya viene centrado de origen: si acá se pone
     un número, se vuelve a descolocar. Se deja la tabla porque una marca
     futura podría necesitarlo, pero el corazón NO. */
  var BAJA = { corazon: 0, circulo: 0, cuadrado: 0, relleno: 0 };

  var FUENTES = {
    forum:"'Forum',serif", marcellus:"'Marcellus',serif",
    prata:"'Prata',serif", montserrat:"'Montserrat',sans-serif"
  };

  var URLP = new URLSearchParams(location.search);

  /* ¿estamos en la vista previa del panel? ahí los datos cambian en vivo */
  var ES_PREVIEW = (function () {
    try { return URLP.has('preview') || window.parent !== window; }
    catch (e) { return true; }
  })();

  function delPanel(corto) {
    try {
      var c = window.INVEV && window.INVEV.fx && window.INVEV.fx.calendario;
      if (!c) return null;
      var v = c[corto];
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

  function color(v, porDefecto) {
    if (!v) return porDefecto;
    v = String(v).trim();
    if (PALETA[v.toLowerCase()]) return PALETA[v.toLowerCase()];
    if (/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) return v[0] === '#' ? v : '#' + v;
    return porDefecto;
  }

  function encendido() {
    var v = opt('encendido', 'cal');
    return v === true || String(v) === '1' || String(v).toLowerCase() === 'si' ||
           String(v).toLowerCase() === 'true';
  }

  /* toda la configuración junta: sirve para dibujar y para detectar cambios */
  function leerConfig() {
    var nMarca = String(opt('marca', 'calMarca') || 'corazon').toLowerCase();
    if (!MARCAS[nMarca]) nMarca = 'corazon';
    var nFuente = String(opt('fuente', 'calFuente') || 'forum').toLowerCase();
    if (!FUENTES[nFuente]) nFuente = 'forum';
    var kick = opt('kick', 'calKick'); if (kick === null) kick = 'Guarda la fecha';
    return {
      marca:  nMarca,
      fuente: nFuente,
      num:  color(opt('num', 'calNum'), '#6b5f52'),
      mk:   color(opt('mk',  'calMk'),  '#b06a7e'),
      bg:   color(opt('bg',  'calBg'),  '#f4efe6'),
      img:  opt('img', 'calImg') || '',
      velo: Math.max(0, Math.min(100, parseInt(opt('velo', 'calVelo') || '55', 10))) / 100,
      tam:  Math.max(220, Math.min(390, parseInt(opt('tam', 'calTam') || '390', 10))),
      kick: kick,
      pie:  opt('pie', 'calPie') || ''
    };
  }

  function leerFecha() {
    var forzada = opt('fecha', 'calFecha');
    if (forzada && /^\d{4}-\d{2}-\d{2}$/.test(forzada)) {
      var p = String(forzada).split('-');
      return { y: +p[0], m: +p[1], d: +p[2] };
    }
    var elD = document.getElementById('sc-day');
    var elM = document.getElementById('sc-mon');
    if (!elD || !elM) return null;
    var dia = parseInt((elD.textContent || '').trim(), 10);
    var txt = (elM.textContent || '').trim().toLowerCase();
    var anio = (txt.match(/(\d{4})/) || [])[1];
    var mes = -1;
    for (var i = 0; i < 12; i++) {
      if (txt.indexOf(MESES[i].toLowerCase()) > -1) { mes = i + 1; break; }
    }
    if (!dia || !anio || mes < 1) return null;
    return { y: +anio, m: mes, d: dia };
  }

  var CSS = [
    '.ivcal{padding:56px 18px 60px;position:relative;overflow:hidden}',
    '.ivcal .ivcal-bg{position:absolute;inset:0;background-size:cover;background-position:center;z-index:0}',
    /* ⚠️ el !important es a propósito: el motor le pone max-width:680px a todo
       lo que cuelga de un sector en la compu. Es lo único que se pisa. */
    'section.ivcal > .ivcal-in{position:relative;z-index:2;',
    '  width:min(var(--ivcal-w),92vw);',
    '  max-width:min(var(--ivcal-w),92vw)!important;',
    '  margin-left:auto!important;margin-right:auto!important}',
    '.ivcal .ivcal-kick{font-family:\'Great Vibes\',cursive;text-align:center;margin:0 0 2px;',
    '  color:var(--ivcal-mk);font-size:calc(var(--ivcal-w)*.069)}',
    '.ivcal .ivcal-mes{letter-spacing:.06em;text-align:center;',
    '  margin:0 0 calc(var(--ivcal-w)*.046);color:var(--ivcal-num);',
    '  font-family:var(--ivcal-font);font-size:calc(var(--ivcal-w)*.049)}',
    '.ivcal .ivcal-grid{display:grid;grid-template-columns:repeat(7,1fr);',
    '  gap:calc(var(--ivcal-w)*.015) 2px;text-align:center}',
    '.ivcal .ivcal-dow{font-family:Montserrat,sans-serif;letter-spacing:.13em;',
    '  text-transform:uppercase;opacity:.55;color:var(--ivcal-num);',
    '  font-size:max(8px,calc(var(--ivcal-w)*.024));padding-bottom:calc(var(--ivcal-w)*.02)}',
    '.ivcal .ivcal-d{position:relative;aspect-ratio:1;display:flex;align-items:center;',
    '  justify-content:center;line-height:1;color:var(--ivcal-num);',
    '  font-family:var(--ivcal-font);font-size:max(11px,calc(var(--ivcal-w)*.042))}',
    '.ivcal .ivcal-d.vacio{visibility:hidden}',
    '.ivcal .ivcal-d.marcado{color:var(--ivcal-mk)}',
    '.ivcal .ivcal-num{position:relative;z-index:2}',
    /* el marcador va centrado en la celda y NO se empuja: ver la nota de arriba */
    '.ivcal .ivcal-mk{position:absolute;left:50%;top:50%;translate:-50% -50%;z-index:0;',
    '  width:calc(var(--ivcal-w)/7*var(--ivcal-caja));',
    '  height:calc(var(--ivcal-w)/7*var(--ivcal-caja));',
    '  margin-top:calc(var(--ivcal-w)/7*var(--ivcal-baja))}',
    '.ivcal .ivcal-mk svg{width:100%;height:100%;display:block;overflow:visible}',
    '.ivcal .ivcal-mk svg *{fill:none;stroke:var(--ivcal-mk);stroke-width:1.4}',
    '.ivcal .ivcal-mk svg .relleno{fill:var(--ivcal-mk);stroke:none;opacity:.15}',
    '.ivcal .ivcal-pie{text-align:center;margin-top:calc(var(--ivcal-w)*.051);',
    '  letter-spacing:.04em;color:var(--ivcal-num);opacity:.85;',
    '  font-family:var(--ivcal-font);font-size:max(11px,calc(var(--ivcal-w)*.036))}',
    'section.ivcal > .ivcal-in{opacity:0;transform:translateY(26px);',
    '  transition:opacity .9s ease,transform .9s cubic-bezier(.22,.72,.28,1)}',
    'section.ivcal.visto > .ivcal-in{opacity:1;transform:none}',
    '@media(prefers-reduced-motion:reduce){section.ivcal > .ivcal-in{opacity:1;transform:none}}'
  ].join('\n');

  function ponerEstilos() {
    var v = document.getElementById('ivcal-css');
    if (v) v.remove();
    var s = document.createElement('style');
    s.id = 'ivcal-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);

    if (!document.getElementById('ivcal-fonts')) {
      var l = document.createElement('link');
      l.id = 'ivcal-fonts';
      l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Forum&family=Marcellus&family=Prata&family=Montserrat:wght@300;400&display=swap';
      document.head.appendChild(l);
    }
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }

  function velar(hex, a) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return 'rgba(' + parseInt(h.slice(0,2),16) + ',' + parseInt(h.slice(2,4),16) +
           ',' + parseInt(h.slice(4,6),16) + ',' + a + ')';
  }

  function dibujar(f, o) {
    var sec = document.createElement('section');
    sec.className = 'sec ivcal';
    sec.id = 'ivcal-sec';
    sec.style.background = o.bg;
    sec.style.setProperty('--ivcal-font', FUENTES[o.fuente]);
    sec.style.setProperty('--ivcal-num', o.num);
    sec.style.setProperty('--ivcal-mk', o.mk);
    sec.style.setProperty('--ivcal-w', o.tam + 'px');
    sec.style.setProperty('--ivcal-caja', CAJA[o.marca]);
    sec.style.setProperty('--ivcal-baja', BAJA[o.marca]);

    var primero = new Date(f.y, f.m - 1, 1).getDay();     /* 0 = domingo */
    var dias = new Date(f.y, f.m, 0).getDate();

    var h = '';
    if (o.img) {
      h += '<div class="ivcal-bg" style="background-image:linear-gradient(' +
           velar(o.bg, o.velo) + ',' + velar(o.bg, o.velo) + '),url(\'' +
           String(o.img).replace(/'/g, '%27') + '\')"></div>';
    }
    h += '<div class="ivcal-in">';
    if (o.kick) h += '<div class="ivcal-kick">' + esc(o.kick) + '</div>';
    h += '<div class="ivcal-mes">' + MESES[f.m - 1] + ' ' + f.y + '</div>';
    h += '<div class="ivcal-grid">';
    for (var i = 0; i < 7; i++) h += '<div class="ivcal-dow">' + DOW[i] + '</div>';
    for (var v = 0; v < primero; v++) h += '<div class="ivcal-d vacio"></div>';
    for (var n = 1; n <= dias; n++) {
      var esEl = (n === f.d);
      h += '<div class="ivcal-d' + (esEl ? ' marcado' : '') + '">' +
           (esEl ? '<span class="ivcal-mk">' + MARCAS[o.marca] + '</span>' : '') +
           '<span class="ivcal-num">' + n + '</span></div>';
    }
    h += '</div>';
    if (o.pie) h += '<div class="ivcal-pie">' + esc(o.pie) + '</div>';
    h += '</div>';
    sec.innerHTML = h;
    return sec;
  }

  function colocar(sec) {
    var refe = document.getElementById('scratchcard');
    var ancla = refe && refe.closest ? refe.closest('section') : null;
    if (!ancla) ancla = document.querySelector('section.sec');
    if (!ancla || !ancla.parentNode) return false;
    ancla.parentNode.insertBefore(sec, ancla.nextSibling);

    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
        });
      }, { threshold: .18 });
      io.observe(sec);
    } else { sec.classList.add('visto'); }

    /* en la previa se muestra enseguida: la diseñadora quiere verlo ya */
    if (ES_PREVIEW) setTimeout(function () { sec.classList.add('visto'); }, 60);
    return true;
  }

  var firmaActual = null;

  /* el corazón del asunto: mira cómo está la configuración y deja la pantalla
     igual a lo que dice. Se puede llamar todas las veces que haga falta. */
  function sincronizar() {
    var viejo = document.getElementById('ivcal-sec');

    if (!encendido()) {
      if (viejo) { viejo.remove(); firmaActual = null; }
      return;
    }

    var f = leerFecha();
    if (!f) return;                      /* sin fecha no se inventa nada */

    var o = leerConfig();
    var firma = JSON.stringify([f, o]);
    if (viejo && firma === firmaActual) return;   /* no cambió nada */

    ponerEstilos();
    var sec = dibujar(f, o);
    if (viejo) {
      viejo.parentNode.replaceChild(sec, viejo);
      sec.classList.add('visto');
      firmaActual = firma;
    } else if (colocar(sec)) {
      firmaActual = firma;
    }
  }

  function arrancar() {
    sincronizar();

    /* el panel le habla a la previa por mensajes: cada uno puede traer un
       cambio de configuración */
    addEventListener('message', function () { setTimeout(sincronizar, 60); });

    if (ES_PREVIEW) {
      /* en la previa se vigila siempre: la diseñadora toca y tiene que verlo */
      setInterval(sincronizar, 600);
    } else {
      /* en la invitación de verdad los datos no cambian: alcanza con esperar
         a que el motor termine de pintar, y después se deja de mirar */
      var n = 0, t = setInterval(function () {
        sincronizar();
        if (document.getElementById('ivcal-sec') || ++n > 60) clearInterval(t);
      }, 250);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
