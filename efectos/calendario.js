/* ===== EL CALENDARIO DE LA FECHA ==============================================

   QUÉ ES
   Un sector nuevo de la invitación: la grilla del mes del evento, con el día
   marcado. NO es una imagen: se dibuja solo a partir de la fecha, así que si la
   fecha cambia, el calendario se acomoda y el día nunca queda en la columna
   equivocada. Sirve para cualquier mes y cualquier año.

   ⚠️ VIENE APAGADO. No aparece en ninguna invitación salvo que se lo encienda.
   Ninguna invitación ya entregada se entera de que este archivo existe.

   DE DÓNDE SACA LA CONFIGURACIÓN (en este orden)
   1. `INVEV.fx.calendario`  ← lo que guardan las chicas en el panel.
      El motor ya deja el evento entero en window.INVEV, así que NO hace falta
      tocar index.html: alcanza con agregar los campos en admin.html.
   2. `document.body.dataset.calXxx`
   3. la dirección web: `?cal=1&calFuente=prata&calMarca=circulo&calNum=b06a7e`
      (para probar sin tocar nada)

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
     kick     / calKick    la bajada de arriba (por defecto "Guardá la fecha")
     pie      / calPie     el texto de abajo
     fecha    / calFecha   AAAA-MM-DD, sólo si hiciera falta forzarla

   LOS COLORES
   Cualquiera de los tres colores (números, marcador y fondo) acepta:
     · CUALQUIER color en hexadecimal — "#b06a7e", "b06a7e", "#fff"
     · o uno de estos nombres cortos de la paleta de la marca:
       lino #f4efe6 · kraft #e8e1d6 · uva #b06a7e · uvaclaro #e8d5da
       salvia #a9b8a0 · salviaclaro #dfe6db · oro #b9a56a · champagne #efe6d4
       tinta #4a4038 · blanco #ffffff · negro #1f1b17
   O sea: la paleta es un atajo, no un límite. En el panel va un selector de
   color común y corriente, con la paleta como accesos rápidos.

   EL TAMAÑO
   390 px es el máximo, que es lo que entra cómodo en un celular. Se puede
   achicar hasta 220. Todo lo demás (números, encabezados, marcador, márgenes)
   se achica en proporción, así que nunca queda un número gigante en una grilla
   chica ni al revés. Y nunca supera el 92% del ancho de la pantalla.

   DE DÓNDE SACA LA FECHA
   Del propio sector "Guardá la fecha" que la invitación ya muestra (#sc-day y
   #sc-mon). Si no la encuentra, no dibuja nada en vez de mostrar un mes
   equivocado.
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

  var MARCAS = {
    corazon:'<svg viewBox="0 0 24 24"><path d="M12 20.5C7 16.8 3.6 14 3.6 10.4 3.6 7.7 5.7 5.7 8.3 5.7c1.6 0 3 .8 3.7 2 .7-1.2 2.1-2 3.7-2 2.6 0 4.7 2 4.7 4.7 0 3.6-3.4 6.4-8.4 10.1z"/></svg>',
    circulo:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.6"/></svg>',
    cuadrado:'<svg viewBox="0 0 24 24"><rect x="2.6" y="2.6" width="18.8" height="18.8" rx="2.4"/></svg>',
    relleno:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.6" class="relleno"/><circle cx="12" cy="12" r="9.6"/></svg>'
  };

  /* el corazón necesita más caja que el resto: su parte ancha está arriba y el
     pico ocupa abajo, así que a igual medida el número le queda apretado */
  var CAJA = { corazon: 1.05, circulo: .94, cuadrado: .92, relleno: .94 };
  var BAJA = { corazon: .07, circulo: .02, cuadrado: .02, relleno: .02 };

  var FUENTES = {
    forum:"'Forum',serif", marcellus:"'Marcellus',serif",
    prata:"'Prata',serif", montserrat:"'Montserrat',sans-serif"
  };

  /* ---------- de dónde sale cada valor ---------- */
  var URLP = new URLSearchParams(location.search);

  function delPanel(corto) {
    try {
      var c = window.INVEV && window.INVEV.fx && window.INVEV.fx.calendario;
      if (!c) return null;
      var v = c[corto];
      return (v === undefined || v === null || v === '') ? null : v;
    } catch (e) { return null; }
  }

  /* corto = como se llama en el panel; largo = como se llama en la dirección */
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
    return v === true || String(v) === '1' || String(v).toLowerCase() === 'si';
  }

  /* ---------- la fecha ---------- */
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

  /* ---------- los estilos ----------
     Todo se mide contra --ivcal-w (el ancho elegido), así que al achicar el
     calendario se achica TODO junto y las proporciones no se rompen. */
  var CSS = [
    '.ivcal{padding:56px 18px 60px;position:relative;overflow:hidden}',
    '.ivcal .ivcal-bg{position:absolute;inset:0;background-size:cover;background-position:center;z-index:0}',
    /* ⚠️ el !important es a propósito: el motor le pone max-width:680px a todo lo
       que cuelga de un sector en la compu. Es la única propiedad que se pisa. */
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
    /* aparece al llegar, como el resto de la invitación */
    'section.ivcal > .ivcal-in{opacity:0;transform:translateY(26px);',
    '  transition:opacity .9s ease,transform .9s cubic-bezier(.22,.72,.28,1)}',
    'section.ivcal.visto > .ivcal-in{opacity:1;transform:none}',
    '@media(prefers-reduced-motion:reduce){section.ivcal > .ivcal-in{opacity:1;transform:none}}'
  ].join('\n');

  function ponerEstilos() {
    if (document.getElementById('ivcal-css')) return;
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

  function dibujar(f) {
    var nMarca = String(opt('marca', 'calMarca') || 'corazon').toLowerCase();
    if (!MARCAS[nMarca]) nMarca = 'corazon';

    var fuente = FUENTES[String(opt('fuente', 'calFuente') || 'forum').toLowerCase()] || FUENTES.forum;
    var cNum   = color(opt('num', 'calNum'), '#6b5f52');
    var cMk    = color(opt('mk', 'calMk'), '#b06a7e');
    var cBg    = color(opt('bg', 'calBg'), '#f4efe6');
    var img    = opt('img', 'calImg');
    var velo   = Math.max(0, Math.min(100, parseInt(opt('velo', 'calVelo') || '55', 10))) / 100;
    var tam    = Math.max(220, Math.min(390, parseInt(opt('tam', 'calTam') || '390', 10)));
    var kick   = opt('kick', 'calKick'); if (kick === null) kick = 'Guardá la fecha';
    var pie    = opt('pie', 'calPie') || '';

    var sec = document.createElement('section');
    sec.className = 'sec ivcal';
    sec.id = 'ivcal-sec';
    sec.style.background = cBg;
    sec.style.setProperty('--ivcal-font', fuente);
    sec.style.setProperty('--ivcal-num', cNum);
    sec.style.setProperty('--ivcal-mk', cMk);
    sec.style.setProperty('--ivcal-w', tam + 'px');
    sec.style.setProperty('--ivcal-caja', CAJA[nMarca]);
    sec.style.setProperty('--ivcal-baja', BAJA[nMarca]);

    var primero = new Date(f.y, f.m - 1, 1).getDay();     /* 0 = domingo */
    var dias = new Date(f.y, f.m, 0).getDate();

    var h = '';
    if (img) {
      /* velo del propio color de fondo, para que los números se lean siempre,
         sin importar qué foto suban */
      h += '<div class="ivcal-bg" style="background-image:linear-gradient(' +
           velar(cBg, velo) + ',' + velar(cBg, velo) + '),url(\'' +
           String(img).replace(/'/g, '%27') + '\')"></div>';
    }
    h += '<div class="ivcal-in">';
    if (kick) h += '<div class="ivcal-kick">' + esc(kick) + '</div>';
    h += '<div class="ivcal-mes">' + MESES[f.m - 1] + ' ' + f.y + '</div>';
    h += '<div class="ivcal-grid">';
    for (var i = 0; i < 7; i++) h += '<div class="ivcal-dow">' + DOW[i] + '</div>';
    for (var v = 0; v < primero; v++) h += '<div class="ivcal-d vacio"></div>';
    for (var n = 1; n <= dias; n++) {
      var esEl = (n === f.d);
      h += '<div class="ivcal-d' + (esEl ? ' marcado' : '') + '">' +
           (esEl ? '<span class="ivcal-mk">' + MARCAS[nMarca] + '</span>' : '') +
           '<span class="ivcal-num">' + n + '</span></div>';
    }
    h += '</div>';
    if (pie) h += '<div class="ivcal-pie">' + esc(pie) + '</div>';
    h += '</div>';
    sec.innerHTML = h;
    return sec;
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

  function colocar() {
    if (document.getElementById('ivcal-sec')) return true;
    if (!encendido()) return false;

    var f = leerFecha();
    if (!f) return false;                     /* sin fecha, no se inventa nada */

    var sec = dibujar(f);

    /* va justo después del sector donde ya se muestra la fecha */
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

    /* red de seguridad, por si el observador no corre */
    addEventListener('scroll', function () {
      var r = sec.getBoundingClientRect();
      if (r.top < innerHeight * 0.85) sec.classList.add('visto');
    }, { passive: true });

    return true;
  }

  function arrancar() {
    ponerEstilos();
    if (colocar()) return;
    /* el motor carga el evento y pinta la fecha después; se espera un rato.
       Si nunca se enciende, no pasa nada: el intervalo se apaga solo. */
    var n = 0, t = setInterval(function () {
      if (colocar() || ++n > 60) clearInterval(t);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
