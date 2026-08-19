/* ===== CÓMO SE MUESTRA LA FECHA ===============================================

   QUÉ ES
   Nueve maneras distintas de mostrar la fecha del evento, sacadas de las
   referencias que juntó Maki. Reemplaza lo que hay dentro del recuadro de la
   fecha (#scratchcard) y deja todo listo para que LA RASPADITA se monte encima.

   ⚠️ VIENE APAGADO. Sin elegir una disposición, la fecha se ve como siempre.

   LAS NUEVE
     fotos      1 · tres fotos, un número sobre cada una  ⭐ la de la referencia
     barras     2 · 28 | 11 | 26
     apilada    3 · el día, el mes y el año uno debajo del otro
     filetes    4 · NOV ——— 28 ——— 2026
     semana     5 · Sábado / 28 / Noviembre, con separadores
     monograma  6 · las iniciales arriba y la fecha abajo
     grande     7 · el día enorme y el mes y el año al costado
     manuscrita 8 · "Save the date" en cursiva y la fecha debajo
     circulos   9 · tres círculos con foto y un número en cada uno
     fichas     0 · las fichas con filete (lo que ya hacía la raspadita)

   CÓMO SE CONFIGURA (panel → body → dirección web)
     disposicion / fecha       una de las de arriba
     color       / fechaColor  el color del texto (por defecto, el del diseño)
     acento      / fechaAcento el color de la bajada y los detalles
     kick        / fechaKick   la bajada de arriba ("Save the date")
     pie         / fechaPie    el texto de abajo
     hora        / fechaHora   sólo para "semana" (ej: 20:30)
     ini         / fechaIni    las iniciales, para "monograma"
     foto1/2/3   / fechaFoto1… las tres fotos, para "fotos" y "circulos"

   CÓMO SE LLEVA CON LA RASPADITA
   Cada disposición marca sus partes tapables con `data-rasp`. La raspadita las
   busca y, si encuentra tres, hace el revelado en tres tiempos (día, mes y año);
   si encuentra una sola, tapa todo junto. Así las dos cosas se combinan sin
   saber nada una de la otra.

   ⚠️ Las opciones "fotos" y "circulos" necesitan TRES FOTOS. Sin ellas se
   dibujan con un fondo neutro, que sirve para probar pero no es lo lindo.
   ============================================================================ */
(function () {
  'use strict';

  var MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
               'Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  var DIAS  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

  var PALETA = {
    lino:'#f4efe6', kraft:'#e8e1d6', uva:'#b06a7e', salvia:'#a9b8a0',
    oro:'#b9a56a', tinta:'#5d5348', blanco:'#ffffff', negro:'#1f1b17'
  };

  var VALIDAS = ['fotos','barras','apilada','filetes','semana','monograma',
                 'grande','manuscrita','circulos','fichas'];

  var URLP = new URLSearchParams(location.search);

  var ES_PREVIEW = (function () {
    try { return /[?&]preview/.test(location.search) || window.parent !== window; }
    catch (e) { return true; }
  })();

  function delPanel(k) {
    try {
      var c = window.INVEV && window.INVEV.fx && window.INVEV.fx.fecha;
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
  function color(v, porDefecto) {
    if (!v) return porDefecto;
    v = String(v).trim();
    if (PALETA[v.toLowerCase()]) return PALETA[v.toLowerCase()];
    if (/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) return v[0] === '#' ? v : '#' + v;
    return porDefecto;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }
  function url(u) { return String(u).replace(/'/g, '%27'); }

  function disposicion() {
    var d = String(opt('disposicion', 'fecha') || '').toLowerCase();
    return VALIDAS.indexOf(d) > -1 ? d : '';
  }

  function leerFecha() {
    var elD = document.getElementById('sc-day');
    var elM = document.getElementById('sc-mon');
    if (!elD || !elM) return null;
    var dia = parseInt((elD.textContent || '').trim(), 10);
    var txt = (elM.textContent || '').trim();
    var bajo = txt.toLowerCase();
    var anio = (bajo.match(/(\d{4})/) || [])[1];
    var mes = -1;
    for (var i = 0; i < 12; i++) {
      if (bajo.indexOf(MESES[i].toLowerCase()) > -1) { mes = i + 1; break; }
    }
    if (!dia || !anio || mes < 1) return null;
    var d = new Date(+anio, mes - 1, dia);
    return {
      d: dia, m: mes, y: +anio,
      dd: dia < 10 ? '0' + dia : '' + dia,
      mm: mes < 10 ? '0' + mes : '' + mes,
      yy: String(anio).slice(2),
      mesLargo: MESES[mes - 1],
      mesCorto: MESES[mes - 1].slice(0, 3),
      semana: DIAS[d.getDay()]
    };
  }

  function iniciales() {
    try {
      var ev = window.INVEV || {};
      var a = (ev.n1 || '').trim(), b = (ev.n2 || '').trim();
      if (a && b) return a[0].toUpperCase() + ' / ' + b[0].toUpperCase();
      if (a) return a[0].toUpperCase();
    } catch (e) {}
    return '';
  }

  var CSS = [
    /* ⚠️ REGLA DE CONVIVENCIA: la tapa de la raspadita tiene que quedar POR
       ENCIMA de los números, que van en z-index 2 dentro de cada foto. Sin
       esto, los números se leían A TRAVÉS de la capa y se arruinaba la
       sorpresa. El polvillo va en 6 y el destello en 7, así que la tapa va 5. */
    '.rasp-zona{z-index:5}',

    '.ivf{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    '  padding:10px;color:var(--ivf-col);text-align:center}',
    '.ivf .ivf-kick{font-family:Montserrat,sans-serif;font-size:10px;letter-spacing:.4em;',
    '  text-transform:uppercase;opacity:.65;color:var(--ivf-ac)}',
    '.ivf .ivf-pie{font-family:Montserrat,sans-serif;font-size:9.5px;letter-spacing:.3em;',
    '  text-transform:uppercase;opacity:.6;margin-top:10px}',
    '.ivf .ivf-sep{width:1px;background:currentColor;opacity:.38}',
    '.ivf .ivf-raya{height:1px;background:currentColor;opacity:.42;flex:0 0 34px}',

    /* 1 · tres fotos */
    '.ivf-fotos{gap:7px}',
    '.ivf-fotos .cel{position:relative;flex:1;max-width:31%;aspect-ratio:3/4;overflow:hidden;',
    '  border-radius:4px;background:#cfc6ba center/cover no-repeat}',
    '.ivf-fotos .cel::after{content:"";position:absolute;inset:0;background:rgba(40,30,22,.34)}',
    '.ivf-fotos .n{position:absolute;inset:0;z-index:2;display:flex;align-items:flex-end;',
    '  justify-content:center;padding-bottom:7px;color:#fff;line-height:1;',
    "  font-family:'Cormorant Garamond',serif;font-weight:300;font-size:30px}",

    /* 2 · barras */
    '.ivf-barras .linea{display:flex;align-items:center;justify-content:center;gap:12px;',
    "  font-family:'Cormorant Garamond',serif;font-weight:300;font-size:38px;line-height:1}",
    '.ivf-barras .ivf-sep{height:30px}',

    /* 3 · apilada */
    ".ivf-apilada .b{font-family:'Cormorant Garamond',serif;font-weight:300;line-height:.94}",
    '.ivf-apilada .d,.ivf-apilada .a{font-size:44px}',
    '.ivf-apilada .m{font-size:30px;letter-spacing:.06em;text-transform:uppercase}',

    /* 4 · filetes */
    '.ivf-filetes .fila{display:flex;align-items:center;justify-content:center;gap:10px}',
    '.ivf-filetes .lado{font-family:Marcellus,serif;font-size:13px;letter-spacing:.22em;',
    '  text-transform:uppercase;opacity:.85}',
    '.ivf-filetes .dia{font-family:Marcellus,serif;font-size:44px;line-height:1}',

    /* 5 · con día de la semana */
    '.ivf-semana .fila{display:flex;align-items:center;justify-content:center;gap:14px}',
    '.ivf-semana .lado{font-family:Montserrat,sans-serif;font-weight:200;font-size:11.5px;',
    '  letter-spacing:.18em;line-height:1.6}',
    ".ivf-semana .dia{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:52px;line-height:1}",
    '.ivf-semana .ivf-sep{height:40px}',

    /* 6 · monograma */
    '.ivf-mono .ini{font-family:Marcellus,serif;font-size:36px;letter-spacing:.06em;',
    '  padding-bottom:9px;border-bottom:1px solid currentColor;display:inline-block;',
    '  margin-bottom:12px}',
    '.ivf-mono .f{font-family:Montserrat,sans-serif;font-weight:300;font-size:12px;letter-spacing:.28em}',

    /* 7 · día grande */
    '.ivf-grande .fila{display:flex;align-items:center;justify-content:center;gap:13px}',
    '.ivf-grande .dia{font-family:Prata,serif;font-size:58px;line-height:.86}',
    '.ivf-grande .col{display:flex;flex-direction:column;gap:5px;text-align:left;',
    '  font-family:Montserrat,sans-serif;font-weight:300;font-size:11px;letter-spacing:.24em;',
    '  text-transform:uppercase}',
    '.ivf-grande .col span:first-child{padding-bottom:5px;border-bottom:1px solid currentColor}',

    /* 8 · manuscrita */
    '.ivf-manu .save{font-family:Parisienne,cursive;font-size:32px;line-height:1;',
    '  color:var(--ivf-ac);margin-bottom:10px}',
    '.ivf-manu .f{font-family:Marcellus,serif;font-size:22px;letter-spacing:.11em}',

    /* 9 · tres círculos */
    '.ivf-circ{gap:12px}',
    '.ivf-circ .c{position:relative;width:70px;height:70px;border-radius:50%;overflow:hidden;',
    '  background:#cfc6ba center/cover no-repeat}',
    '.ivf-circ .c::after{content:"";position:absolute;inset:0;background:rgba(40,30,22,.38)}',
    '.ivf-circ .n{position:absolute;inset:0;z-index:2;display:flex;align-items:center;',
    '  justify-content:center;font-family:Marcellus,serif;font-size:23px;color:#fff}'
  ].join('\n');

  function ponerEstilos() {
    if (!document.getElementById('ivf-css')) {
      var s = document.createElement('style');
      s.id = 'ivf-css';
      s.textContent = CSS;
      (document.head || document.documentElement).appendChild(s);
    }
    if (!document.getElementById('ivf-fonts')) {
      var l = document.createElement('link');
      l.id = 'ivf-fonts';
      l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Forum&family=Marcellus&family=Prata' +
               '&family=Cormorant+Garamond:wght@300;400&family=Montserrat:wght@200;300;400' +
               '&family=Parisienne&display=swap';
      document.head.appendChild(l);
    }
  }

  /* Cada disposición devuelve el HTML. Los pedazos tapables llevan `data-rasp`
     con su orden (1, 2, 3) para que la raspadita los encuentre. */
  function dibujar(tipo, f, o) {
    var fotos = [o.foto1, o.foto2, o.foto3];
    function fondo(i) {
      return fotos[i] ? "background-image:url('" + url(fotos[i]) + "')" : '';
    }
    var kick = o.kick ? '<div class="ivf-kick">' + esc(o.kick) + '</div>' : '';
    var pie  = o.pie  ? '<div class="ivf-pie">'  + esc(o.pie)  + '</div>' : '';

    switch (tipo) {
      case 'fotos':
        return '<div class="ivf ivf-fotos">' +
          '<div class="cel" data-rasp="1" style="' + fondo(0) + '"><div class="n">' + f.dd + '</div></div>' +
          '<div class="cel" data-rasp="2" style="' + fondo(1) + '"><div class="n">' + f.mm + '</div></div>' +
          '<div class="cel" data-rasp="3" style="' + fondo(2) + '"><div class="n">' + f.yy + '</div></div>' +
          '</div>';

      case 'circulos':
        return '<div class="ivf ivf-circ">' +
          '<div class="c" data-rasp="1" style="' + fondo(0) + '"><div class="n">' + f.dd + '</div></div>' +
          '<div class="c" data-rasp="2" style="' + fondo(1) + '"><div class="n">' + f.mm + '</div></div>' +
          '<div class="c" data-rasp="3" style="' + fondo(2) + '"><div class="n">' + f.yy + '</div></div>' +
          '</div>';

      case 'barras':
        return '<div class="ivf ivf-barras"><div data-rasp="0">' + kick +
          '<div class="linea"><span>' + f.dd + '</span><i class="ivf-sep"></i>' +
          '<span>' + f.mm + '</span><i class="ivf-sep"></i><span>' + f.yy + '</span></div>' +
          pie + '</div></div>';

      case 'apilada':
        return '<div class="ivf ivf-apilada"><div data-rasp="0">' + kick +
          '<div class="b d">' + f.dd + '</div>' +
          '<div class="b m">' + f.mesCorto + '</div>' +
          '<div class="b a">' + f.yy + '</div>' + pie + '</div></div>';

      case 'filetes':
        return '<div class="ivf ivf-filetes"><div data-rasp="0">' + kick +
          '<div class="fila" style="margin-top:12px">' +
          '<span class="lado">' + f.mesCorto + '</span><i class="ivf-raya"></i>' +
          '<span class="dia">' + f.dd + '</span><i class="ivf-raya"></i>' +
          '<span class="lado">' + f.y + '</span></div>' + pie + '</div></div>';

      case 'semana':
        return '<div class="ivf ivf-semana"><div data-rasp="0">' + kick +
          '<div class="fila" style="margin-top:8px">' +
          '<div class="lado">' + f.semana + (o.hora ? '<br>' + esc(o.hora) : '') + '</div>' +
          '<i class="ivf-sep"></i><div class="dia">' + f.dd + '</div><i class="ivf-sep"></i>' +
          '<div class="lado">' + f.mesLargo + '<br>' + f.y + '</div></div>' + pie + '</div></div>';

      case 'monograma':
        var ini = o.ini || iniciales();
        return '<div class="ivf ivf-mono"><div data-rasp="0">' +
          (ini ? '<div class="ini">' + esc(ini) + '</div>' : '') +
          '<div class="f">' + f.dd + ' · ' + f.mm + ' · ' + f.y + '</div>' + pie + '</div></div>';

      case 'grande':
        return '<div class="ivf ivf-grande"><div data-rasp="0">' + kick +
          '<div class="fila" style="margin-top:8px"><div class="dia">' + f.dd + '</div>' +
          '<div class="col"><span>' + f.mesLargo + '</span><span>' + f.y + '</span></div></div>' +
          pie + '</div></div>';

      case 'manuscrita':
        return '<div class="ivf ivf-manu"><div data-rasp="0">' +
          '<div class="save">' + esc(o.kick || 'Save the date') + '</div>' +
          '<div class="f">' + f.dd + ' · ' + f.mm + ' · ' + f.y + '</div>' + pie + '</div></div>';

      default:   /* fichas: lo arma la raspadita */
        return '';
    }
  }

  var firmaVieja = null;

  function armar() {
    var tipo = disposicion();
    if (!tipo || tipo === 'fichas') return;

    var card = document.getElementById('scratchcard');
    if (!card) return;
    var under = card.querySelector('.scratch-under');
    if (!under) return;

    var f = leerFecha();
    if (!f) return;                       /* sin fecha no se inventa nada */

    var o = {
      col:    color(opt('color', 'fechaColor'), ''),
      ac:     color(opt('acento', 'fechaAcento'), ''),
      kick:   opt('kick', 'fechaKick') || '',
      pie:    opt('pie', 'fechaPie') || '',
      hora:   opt('hora', 'fechaHora') || '',
      ini:    opt('ini', 'fechaIni') || '',
      foto1:  opt('foto1', 'fechaFoto1') || '',
      foto2:  opt('foto2', 'fechaFoto2') || '',
      foto3:  opt('foto3', 'fechaFoto3') || ''
    };

    var firma = JSON.stringify([tipo, f, o]);
    if (firma === firmaVieja && card.querySelector('.ivf')) return;
    firmaVieja = firma;

    ponerEstilos();

    var previo = card.querySelector('.ivf');
    if (previo) previo.remove();
    var cv = document.getElementById('scratch-cv');
    if (cv) cv.style.display = 'none';

    var html = dibujar(tipo, f, o);
    if (!html) return;

    var cont = document.createElement('div');
    cont.innerHTML = html;
    var nodo = cont.firstChild;

    /* el color: si no se eligió, se toma el que ya usa la invitación */
    var base = getComputedStyle(document.getElementById('sc-day') || under).color;
    nodo.style.setProperty('--ivf-col', o.col || base);
    nodo.style.setProperty('--ivf-ac',  o.ac || o.col || base);

    under.style.visibility = 'hidden';    /* la fecha original se esconde */
    card.appendChild(nodo);

    /* aviso a la raspadita, por si ya estaba armada */
    try { window.dispatchEvent(new Event('resize')); } catch (e) {}
  }

  function arrancar() {
    armar();
    addEventListener('message', function () { setTimeout(armar, 60); });
    if (ES_PREVIEW) {
      setInterval(armar, 700);
    } else {
      var n = 0, t = setInterval(function () {
        armar();
        if (document.querySelector('.ivf') || ++n > 60) clearInterval(t);
      }, 250);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
