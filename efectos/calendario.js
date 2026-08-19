/* ===== EL CALENDARIO DE LA FECHA ==============================================

   QUÉ ES
   Un sector nuevo de la invitación: la grilla del mes del evento, con el día
   marcado. NO es una imagen: se dibuja solo a partir de la fecha, así que si la
   fecha cambia, el calendario se acomoda y el día nunca queda en la columna
   equivocada. Sirve para cualquier mes y cualquier año, sin que nadie cuente
   días a mano.

   ⚠️ VIENE APAGADO. No aparece en ninguna invitación salvo que se lo encienda.
   Ninguna invitación ya entregada se entera de que este archivo existe.

   CÓMO SE ENCIENDE Y SE CONFIGURA
   1. Desde el panel (cuando agreguemos los campos a admin.html), poniendo los
      valores en el body:
         document.body.dataset.cal       = '1'
         document.body.dataset.calFuente = 'prata'
         ... etc, un data- por opción (ver LISTA abajo)
   2. Para probar sin tocar nada, los mismos nombres por dirección web:
         ?cal=1&calFuente=prata&calMarca=circulo&calNum=b06a7e

   LISTA DE OPCIONES
     cal        1 para encender
     calFuente  forum · marcellus · prata · montserrat      (el tipo de número)
     calMarca   corazon · circulo · cuadrado · relleno       (el marcador del día)
     calNum     color de los números          (hex sin #, ej: 6b5f52)
     calMk      color del marcador            (hex sin #)
     calBg      color de fondo                (hex sin #, o un nombre de la paleta)
     calImg     imagen de fondo               (si se pone, manda sobre calBg)
     calVelo    0 a 100: cuánto se aclara la imagen para que se lean los números
     calKick    la bajada de arriba           (por defecto "Guardá la fecha")
     calPie     el texto de abajo             (por defecto vacío)
     calFecha   AAAA-MM-DD, sólo si hiciera falta forzarla

   LA PALETA (nombres que entiende calBg y calNum)
     lino #f4efe6 · kraft #e8e1d6 · uva #b06a7e · uvaclaro #e8d5da
     salvia #a9b8a0 · salviaclaro #dfe6db · oro #b9a56a · champagne #efe6d4
     tinta #4a4038 · blanco #ffffff

   DE DÓNDE SACA LA FECHA
   Del propio sector "Guardá la fecha" que la invitación ya muestra (#sc-day y
   #sc-mon). Si por lo que sea no la encuentra, no dibuja nada en vez de mostrar
   un mes equivocado.
   ============================================================================ */
(function () {
  'use strict';

  var MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
               'Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  var DOW = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  var PALETA = {
    lino:'#f4efe6', kraft:'#e8e1d6', uva:'#b06a7e', uvaclaro:'#e8d5da',
    salvia:'#a9b8a0', salviaclaro:'#dfe6db', oro:'#b9a56a', champagne:'#efe6d4',
    tinta:'#4a4038', blanco:'#ffffff'
  };

  var MARCAS = {
    corazon:'<svg viewBox="0 0 24 24"><path d="M12 20.5C7 16.8 3.6 14 3.6 10.4 3.6 7.7 5.7 5.7 8.3 5.7c1.6 0 3 .8 3.7 2 .7-1.2 2.1-2 3.7-2 2.6 0 4.7 2 4.7 4.7 0 3.6-3.4 6.4-8.4 10.1z"/></svg>',
    circulo:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.6"/></svg>',
    cuadrado:'<svg viewBox="0 0 24 24"><rect x="2.6" y="2.6" width="18.8" height="18.8" rx="2.4"/></svg>',
    relleno:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.6" class="relleno"/><circle cx="12" cy="12" r="9.6"/></svg>'
  };

  var FUENTES = {
    forum:"'Forum',serif", marcellus:"'Marcellus',serif",
    prata:"'Prata',serif", montserrat:"'Montserrat',sans-serif"
  };

  /* ---- de dónde salen los valores: primero el panel, después la dirección ---- */
  var URLP = new URLSearchParams(location.search);
  function opt(nombre) {
    var d = document.body && document.body.dataset ? document.body.dataset[nombre] : null;
    if (d !== undefined && d !== null && d !== '') return d;
    var u = URLP.get(nombre);
    return (u === null || u === '') ? null : u;
  }
  function color(v, porDefecto) {
    if (!v) return porDefecto;
    v = String(v).trim();
    if (PALETA[v.toLowerCase()]) return PALETA[v.toLowerCase()];
    if (/^#?[0-9a-fA-F]{3}$|^#?[0-9a-fA-F]{6}$/.test(v)) return v[0] === '#' ? v : '#' + v;
    return porDefecto;
  }

  /* ---- la fecha: del sector "Guardá la fecha" que ya existe ---- */
  function leerFecha() {
    var forzada = opt('calFecha');
    if (forzada && /^\d{4}-\d{2}-\d{2}$/.test(forzada)) {
      var p = forzada.split('-');
      return { y: +p[0], m: +p[1], d: +p[2] };
    }
    var elD = document.getElementById('sc-day');
    var elM = document.getElementById('sc-mon');
    if (!elD || !elM) return null;
    var dia = parseInt((elD.textContent || '').trim(), 10);
    var txt = (elM.textContent || '').trim();
    var anio = (txt.match(/(\d{4})/) || [])[1];
    var mes = -1;
    for (var i = 0; i < 12; i++) {
      if (txt.toLowerCase().indexOf(MESES[i].toLowerCase()) === 0 ||
          txt.toLowerCase().indexOf(' ' + MESES[i].toLowerCase()) > -1 ||
          txt.toLowerCase().indexOf(MESES[i].toLowerCase()) > -1) { mes = i + 1; break; }
    }
    if (!dia || !anio || mes < 1) return null;
    return { y: +anio, m: mes, d: dia };
  }

  var CSS = [
    '.ivcal{padding:56px 18px 60px;position:relative;overflow:hidden}',
    '.ivcal .ivcal-bg{position:absolute;inset:0;background-size:cover;background-position:center;z-index:0}',
    '.ivcal .ivcal-in{position:relative;z-index:2;max-width:390px;margin:0 auto}',
    '.ivcal .ivcal-kick{font-family:\'Great Vibes\',cursive;font-size:27px;text-align:center;',
    '  margin:0 0 2px;color:var(--ivcal-mk)}',
    '.ivcal .ivcal-mes{font-size:19px;letter-spacing:.06em;text-align:center;',
    '  margin:0 0 18px;color:var(--ivcal-num);font-family:var(--ivcal-font)}',
    '.ivcal .ivcal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px 2px;text-align:center}',
    '.ivcal .ivcal-dow{font-family:Montserrat,sans-serif;font-size:9.5px;letter-spacing:.14em;',
    '  text-transform:uppercase;opacity:.55;padding-bottom:8px;color:var(--ivcal-num)}',
    '.ivcal .ivcal-d{position:relative;aspect-ratio:1;display:flex;align-items:center;',
    '  justify-content:center;font-size:16.5px;line-height:1;',
    '  color:var(--ivcal-num);font-family:var(--ivcal-font)}',
    '.ivcal .ivcal-d.vacio{visibility:hidden}',
    '.ivcal .ivcal-d.marcado{color:var(--ivcal-mk)}',
    '.ivcal .ivcal-num{position:relative;z-index:2}',
    '.ivcal .ivcal-mk{position:absolute;left:50%;top:50%;translate:-50% -50%;',
    '  width:43px;height:43px;margin-top:2px;z-index:0}',
    '.ivcal .ivcal-mk svg{width:100%;height:100%;display:block;overflow:visible}',
    '.ivcal .ivcal-mk svg *{fill:none;stroke:var(--ivcal-mk);stroke-width:1.4}',
    '.ivcal .ivcal-mk svg .relleno{fill:var(--ivcal-mk);stroke:none;opacity:.15}',
    '.ivcal .ivcal-pie{text-align:center;margin-top:20px;font-size:14px;letter-spacing:.04em;',
    '  color:var(--ivcal-num);opacity:.85;font-family:var(--ivcal-font)}',
    /* aparece al llegar, como el resto de la invitación */
    '.ivcal .ivcal-in{opacity:0;transform:translateY(26px);',
    '  transition:opacity .9s ease,transform .9s cubic-bezier(.22,.72,.28,1)}',
    '.ivcal.visto .ivcal-in{opacity:1;transform:none}',
    '@media(prefers-reduced-motion:reduce){.ivcal .ivcal-in{opacity:1;transform:none}}'
  ].join('\n');

  function ponerEstilos() {
    if (document.getElementById('ivcal-css')) return;
    var s = document.createElement('style');
    s.id = 'ivcal-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);

    /* las tipografías del calendario, por si la invitación no las cargó */
    if (!document.getElementById('ivcal-fonts')) {
      var l = document.createElement('link');
      l.id = 'ivcal-fonts';
      l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Forum&family=Marcellus&family=Prata&family=Montserrat:wght@300;400&display=swap';
      document.head.appendChild(l);
    }
  }

  function dibujar(f) {
    var fuente  = FUENTES[(opt('calFuente') || 'forum').toLowerCase()] || FUENTES.forum;
    var marca   = MARCAS[(opt('calMarca') || 'corazon').toLowerCase()] || MARCAS.corazon;
    var cNum    = color(opt('calNum'), '#6b5f52');
    var cMk     = color(opt('calMk'), '#b06a7e');
    var cBg     = color(opt('calBg'), '#f4efe6');
    var img     = opt('calImg');
    var velo    = Math.max(0, Math.min(100, parseInt(opt('calVelo') || '55', 10))) / 100;
    var kick    = opt('calKick'); if (kick === null) kick = 'Guardá la fecha';
    var pie     = opt('calPie') || '';

    var sec = document.createElement('section');
    sec.className = 'sec ivcal';
    sec.id = 'ivcal-sec';
    sec.style.background = cBg;
    sec.style.setProperty('--ivcal-font', fuente);
    sec.style.setProperty('--ivcal-num', cNum);
    sec.style.setProperty('--ivcal-mk', cMk);

    var primero = new Date(f.y, f.m - 1, 1).getDay();     /* 0 = domingo */
    var dias = new Date(f.y, f.m, 0).getDate();

    var h = '';
    if (img) {
      /* el velo del propio color de fondo, para que los números se lean
         siempre, sin importar qué foto suban */
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
           (esEl ? '<span class="ivcal-mk">' + marca + '</span>' : '') +
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

  /* un color con transparencia, para el velo sobre la foto */
  function velar(hex, a) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return 'rgba(' + parseInt(h.slice(0,2),16) + ',' + parseInt(h.slice(2,4),16) +
           ',' + parseInt(h.slice(4,6),16) + ',' + a + ')';
  }

  function colocar() {
    if (document.getElementById('ivcal-sec')) return true;
    if (String(opt('cal') || '') !== '1') return false;

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
    if (String(opt('cal') || '') !== '1') return;   /* apagado: no hace nada */
    ponerEstilos();
    if (colocar()) return;
    /* el motor pinta la fecha después; se espera un rato a que aparezca */
    var n = 0, t = setInterval(function () {
      if (colocar() || ++n > 60) clearInterval(t);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
