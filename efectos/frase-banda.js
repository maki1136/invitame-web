/* ===== LA FRASE LARGA: FOTO, VELO Y UBICACIÓN (23/10/2026) ====================
   Jazmín, 23/10: «El sector de frase larga es muy importante y debe aparecer
   antes de Dónde y cuándo. Es un espacio en el cual podemos colocar una foto del
   cliente o una foto del diseño, acompañado de una frase.» Y después, en Regina,
   Abigail y Renata: «el sector de frase se ve oscuro y no tengo opción de
   cambiarlo». «Que en la frase se pueda seleccionar la tipografía, el tamaño y
   la ubicación (arriba, centrado, abajo).»

   LA CAJA OSCURA: el motor pone la foto ENTERA (contain) en el medio, sobre una
   copia borrosa de ella misma, y encima un velo verde oscuro al 50 %. Con una
   foto vertical o con la base del diseño eso se ve como una caja oscura en el
   medio de la franja.

   EL DATO — fx.frase:
     foto:  'llena' (la foto cubre toda la franja, por defecto) | 'entera' (como era antes)
     velo:  'ninguno' | 'claro' | 'claro-fuerte' | 'suave' | 'oscuro' — sin elegir, según el color de la letra
     pos:   'arriba' | 'centro' (por defecto) | 'abajo'
     ★ 29/10 (Jazmín: «poder ampliar la imagen sin que el texto también aumente
       de tamaño; las opciones separadas: 1. imagen, 2. texto»):
     alto:  px de la franja (0 = automático). Es un MÍNIMO: si el texto no entra, crece.
     zoom:  100–250 (%) acercar la foto, sin tocar la letra.
     foco:  0–100 (%) qué parte de la foto se ve (0 arriba, 50 centro, 100 abajo).
     Los tres son opt-in: sin tocarlos, nada cambia (invitaciones ya entregadas).
   La tipografía, el tamaño, el color y el texto ya estaban en PRINCIPAL
   (fraseFont, fraseSize, fraseColor, frase) y los sigue pintando el motor.
   La foto es «Fondo sección frase larga» (img_c_fondo-seccion-frase-larga); el
   botón «Usar la imagen del diseño» copia ahí la de la muestra elegida.
   Corre también en la miniatura (escucha los mensajes del panel).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invFraseBanda) return; window.__invFraseBanda = 1;

  var VELOS = {
    ninguno:        'transparent',
    claro:          'rgba(255,255,255,.30)',
    'claro-fuerte': 'rgba(255,255,255,.55)',
    suave:          'rgba(0,0,0,.22)',
    oscuro:         'rgba(0,0,0,.50)'
  };
  var POS = { arriba: 'flex-start', centro: 'center', abajo: 'flex-end' };

  function veloSegunLetra() {
    try {
      var f = document.querySelector('.fraseSec .frase'); if (!f) return 'suave';
      var m = getComputedStyle(f).color.match(/\d+(\.\d+)?/g); if (!m) return 'suave';
      var l = (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) / 255;
      return l > 0.55 ? 'suave' : 'claro';
    } catch (e) { return 'suave'; }
  }
  function luz(c) {
    var m = String(c).trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return 1;
    var h = m[1].length === 3 ? m[1].replace(/(.)/g, '$1$1') : m[1];
    var r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  /* el corrector de legibilidad (reglas-duras) no toca la frase cuando la maneja este módulo */
  function soltarCorrector(on) {
    var s = document.querySelector('section.fraseSec'); if (!s) return;
    if (!on) { s.removeAttribute('data-regla-no'); return; }
    if (s.getAttribute('data-regla-no')) return;
    s.setAttribute('data-regla-no', '1');
    var f = s.querySelector('.frase');
    if (f && f.hasAttribute('data-regla-luz')) {
      ['color', '-webkit-text-fill-color', 'text-shadow'].forEach(function (k) { f.style.removeProperty(k); });
      ['data-regla-luz', 'data-regla-orig', 'data-regla-inline', 'data-regla-opa', 'data-regla-fondo', 'data-regla-flojo'].forEach(function (k) { f.removeAttribute(k); });
    }
  }
  function papelVecino() {
    try {
      var s = document.querySelector('section.fraseSec'); if (!s) return '';
      var cands = [s.nextElementSibling, s.previousElementSibling, s.nextElementSibling && s.nextElementSibling.nextElementSibling];
      for (var i = 0; i < cands.length; i++) {
        var e = cands[i]; if (!e || !e.classList || !e.classList.contains('sec')) continue;
        var cs = getComputedStyle(e);
        var col = cs.backgroundColor, m = col.match(/[\d.]+/g);
        if (m && (m.length < 4 || +m[3] > 0.05)) return col;
      }
    } catch (e) {}
    return '';
  }
  /* va en el style del elemento: hay reglas de colección que le ganan a cualquier hoja */
  function ponerPapel(col) {
    var s = document.querySelector('section.fraseSec'); if (!s) return;
    if (col) { s.style.setProperty('background-color', col, 'important'); s.setAttribute('data-fb-papel', '1'); }
    else if (s.getAttribute('data-fb-papel')) { s.style.removeProperty('background-color'); s.removeAttribute('data-fb-papel'); }
  }
  function cfg(ev) { return (ev && ev.fx && ev.fx.frase) || {}; }

  /* ================= LADO INVITACIÓN ================= */
  var ID_CSS = 'inv-frase-banda';
  var ultima = null;
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var c = cfg(ev);
    var foto = c.foto === 'entera' ? 'entera' : 'llena';
    /* sin elegir: el velo sigue a la letra — letra clara, oscurece; letra oscura, aclara */
    var pos = POS[c.pos] ? c.pos : 'centro';
    /* ★ 23/10 (Jazmín, Regina: «se sigue viendo feo, muy oscura»). Sin elegir y
       con FOTO: la foto queda limpia, va una sombra suave sólo detrás de la
       frase y la letra pasa a blanca (si no eligieron un color en el panel). */
    /* la foto puede venir del campo o ponerla otro módulo (galería, muestra): se mira la franja */
    var hayFoto = !!(ev['img_c_fondo-seccion-frase-larga'] || ev['img_c_fondo-secci-n-frase-larga'] || ev['img_f-fondo-secci-n-frase-larga']);
    if (!hayFoto) {
      try {
        ['bandfg', 'bandbg'].forEach(function (id) {
          var e = document.getElementById(id);
          if (e && /url\(/.test(getComputedStyle(e).backgroundImage)) hayFoto = true;
        });
      } catch (e) {}
    }
    var auto = !VELOS[c.velo];
    /* sin foto: nada de degradé marrón de relleno; la frase va sobre el fondo de la invitación */
    var velo = auto ? (hayFoto ? 'foto' : 'sinfoto') : c.velo;
    var colorPropio = String(ev.fraseColor || '').trim();
    var peso = String(c.peso || '');
    /* ★ 28/10 (Maki: «¿y el tamaño qué onda?»). «Tamaño de la frase larga» y
       «Tipografía frase larga» (PRINCIPAL) el motor los pone en línea SIN
       !important, y las colecciones (bohemia, cantera, oleo, celebra…) los pisan
       con 17-19 px !important: el campo no hacía nada. Acá ganan. */
    var tamN = parseInt(ev.fraseSize, 10) || 0;
    var fuente = String(ev.fraseFont || '').trim();
    var alto = Math.max(0, Math.min(900, parseInt(c.alto, 10) || 0));
    var zoom = Math.max(100, Math.min(250, parseInt(c.zoom, 10) || 100));
    var foco = (c.foco === undefined || c.foco === '' || c.foco === null) ? null : Math.max(0, Math.min(100, parseInt(c.foco, 10) || 0));
    var firma = alto + '|' + zoom + '|' + foco + '|' + (window.INVNUEVA && window.INVNUEVA() ? 'N|' : 'V|') + foto + '|' + velo + '|' + pos + '|' + colorPropio + '|' + peso + '|' + tamN + '|' + fuente;
    if (firma === ultima && document.getElementById(ID_CSS)) { soltarCorrector(velo !== 'sinfoto' && velo !== 'ninguno'); return; }
    ultima = firma;
    /* dos :not(#id) para ganarle a las colecciones, que pintan la frase con selectores largos */
    var S = 'html body section.fraseSec.fraseSec:not(#fb-a):not(#fb-b)';
    var css = [];
    /* ★ la caja oscura de verdad: i/estilos-servidor.css le pone a TODA .capa un
       ::after con velo marrón al 46-56 %, y en la franja hay dos .capa (#bandfg y
       #frase-tint): dos velos apilados. Acá el velo lo decide este módulo. */
    css.push(S + ' .capa::after{display:none!important;content:none!important}');
    /* ★ 29/10 (gonzalo-surian: frase larga en 42 px, cortada arriba y abajo).
       La franja medía como mucho 320 px: una frase larga o grande se salía y la
       máscara de los bordes se la comía. Ahora crece con el texto. */
    if (window.INVNUEVA && window.INVNUEVA()) css.push(S + '{height:auto!important;max-height:none!important;min-height:clamp(200px,32vh,320px)!important;padding-top:56px!important;padding-bottom:56px!important;box-sizing:border-box!important}');
    /* 1. LA IMAGEN — independiente del texto */
    if (alto > 0) css.push(S + '{height:auto!important;max-height:none!important;min-height:' + alto + 'px!important;box-sizing:border-box!important}');
    if (zoom > 100 || foco !== null) {
      var fy = foco === null ? 50 : foco;
      css.push(S + '{overflow:hidden!important}');
      css.push(S + ' #bandfg{background-position:50% ' + fy + '%!important;transform:scale(' + (zoom / 100) + ')!important;transform-origin:50% ' + fy + '%!important}');
    }
    if (foto === 'llena') {
      /* la foto cubre toda la franja: sin la copia borrosa ni la foto chica al medio */
      /* la foto que subieron está en #bandfg (entera): pasa a cubrir toda la franja */
      css.push(S + ' #bandfg{background-size:cover!important' + (foco === null ? ';background-position:center!important' : '') + '}');
    }
    if (velo === 'sinfoto') {
      css.push(S + ' #bandbg, ' + S + ' #bandfg{background:none!important;filter:none!important}');
      css.push(S + ' #frase-tint{background:transparent!important}');
      /* y el papel de la sección vecina, para que no se vea el fondo de la invitación como una caja */
      var papel = papelVecino();
      ponerPapel(papel);
      if (papel) css.push(S + '{-webkit-mask-image:none!important;mask-image:none!important}');
      if (colorPropio) css.push(S + ' > p.frase.frase{color:' + colorPropio + '!important;-webkit-text-fill-color:' + colorPropio + '!important}');
    } else if (velo === 'foto') {
      var g = pos === 'arriba' ? 'linear-gradient(to bottom, rgba(0,0,0,0) 6%, rgba(0,0,0,.34) 20%, rgba(0,0,0,.20) 40%, rgba(0,0,0,0) 58%)'
            : pos === 'abajo' ? 'linear-gradient(to top, rgba(0,0,0,0) 6%, rgba(0,0,0,.34) 20%, rgba(0,0,0,.20) 40%, rgba(0,0,0,0) 58%)'
            : 'radial-gradient(80% 38% at 50% 50%, rgba(0,0,0,.32) 0%, rgba(0,0,0,.14) 55%, rgba(0,0,0,0) 100%)';
      /* la letra: la que eligieron en el panel o blanca. Si es oscura, la sombra
         de atrás pasa a ser clara. */
      var letra = colorPropio || '#fff';
      var oscura = luz(letra) < 0.5;
      /* ★ 28/10 (Jazmín, Gabriel y Dany: «no se ve»): con letra oscura sobre foto
         el aclarado tiene que ser bastante más fuerte que el oscurecido */
      if (oscura) g = g.replace(/rgba\(0,0,0,(\.?\d+)\)/g, function (m, a) { return 'rgba(255,255,255,' + Math.min(0.78, (+a) * 2.1).toFixed(2) + ')'; });
      css.push(S + ' #frase-tint{background:' + g + '!important}');
      css.push(S + ' > p.frase.frase{color:' + letra + '!important;-webkit-text-fill-color:' + letra + '!important;text-shadow:' +
        (oscura ? '0 1px 2px rgba(255,255,255,.6),0 0 14px rgba(255,255,255,.5)' : '0 1px 3px rgba(0,0,0,.55),0 2px 14px rgba(0,0,0,.45)') + '!important}');
    } else {
      css.push(S + ' #frase-tint{background:' + VELOS[velo] + '!important}');
      /* ★ 28/10 (Gabriel y Dany: velo oscuro con letra oscura = no se lee). Con
         velo elegido y sin color propio, la letra va contraria al velo. */
      if (velo !== 'ninguno') {
        var clara = /^(suave|oscuro)$/.test(velo);
        var lt = colorPropio || (clara ? '#ffffff' : '#2b2622');
        var esOsc = luz(lt) < 0.5;
        css.push(S + ' > p.frase.frase{color:' + lt + '!important;-webkit-text-fill-color:' + lt + '!important;text-shadow:' +
          (esOsc ? '0 1px 2px rgba(255,255,255,.7),0 0 16px rgba(255,255,255,.6)' : '0 1px 3px rgba(0,0,0,.6),0 2px 16px rgba(0,0,0,.5)') + '!important}');
      }
    }
    if (tamN > 0) css.push(S + ' > p.frase.frase{font-size:clamp(' + tamN + 'px, 7.2vw, ' + Math.round(tamN * 1.35) + 'px)!important;line-height:1.45!important}');
    if (fuente) css.push(S + ' > p.frase.frase{font-family:' + (/[,'"]/.test(fuente) ? fuente : "'" + fuente + "'") + '!important}');
    if (/^(400|500|600|700|800)$/.test(peso)) css.push(S + ' > p.frase.frase{font-weight:' + peso + '!important}');
    css.push(S + '{align-items:' + POS[pos] + '!important}');
    /* lejos de los bordes: arriba y abajo la franja se esfuma (máscara del 14 %) */
    if (pos === 'arriba') css.push(S + '{padding-top:clamp(56px,20%,140px)!important}');
    if (pos === 'abajo')  css.push(S + '{padding-bottom:clamp(56px,20%,140px)!important}');
    soltarCorrector(velo !== 'sinfoto' && velo !== 'ninguno');
    if (velo !== 'sinfoto') ponerPapel('');
    var st = document.getElementById(ID_CSS);
    if (!st) { st = document.createElement('style'); st.id = ID_CSS; document.head.appendChild(st); }
    st.textContent = css.join('\n');
  }

  /* ================= LADO PANEL ================= */
  var ID = 'frase-ajustes';
  function borrador() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function refrescar() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }
  function datos(d) { d.fx = d.fx || {}; d.fx.frase = d.fx.frase || {}; return d.fx.frase; }

  function select(etiqueta, opciones, valor, alCambiar) {
    var g = document.createElement('div'); g.className = 'grp';
    var l = document.createElement('label'); l.textContent = etiqueta; g.appendChild(l);
    var s = document.createElement('select');
    opciones.forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; s.appendChild(op); });
    s.value = valor; s.onchange = function () { alCambiar(s.value); refrescar(); };
    g.appendChild(s); return g;
  }

  function rango(etiqueta, min, max, paso, valor, mostrar, alCambiar) {
    var g = document.createElement('div'); g.className = 'grp';
    var l = document.createElement('label'); g.appendChild(l);
    var r = document.createElement('input'); r.type = 'range'; r.min = min; r.max = max; r.step = paso; r.value = valor;
    function rot() { l.textContent = etiqueta + ': ' + mostrar(+r.value); }
    rot();
    r.oninput = function () { rot(); alCambiar(+r.value); refrescar(); };
    g.appendChild(r); return g;
  }
  function titulo(txt) {
    var h = document.createElement('div'); h.textContent = txt;
    h.style.cssText = 'font-size:13px;font-weight:700;margin:14px 0 6px;padding-top:10px;border-top:1px solid rgba(0,0,0,.08);color:#6D1233';
    return h;
  }

  function construir(d) {
    var caja = document.createElement('div'); caja.id = ID;
    var t = document.createElement('div'); t.textContent = 'Cómo se ve la frase larga';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    var a = document.createElement('div');
    a.textContent = 'La imagen y el texto se ajustan por separado: agrandar la imagen no cambia la letra, y al revés.';
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:4px;line-height:1.35';
    caja.appendChild(t); caja.appendChild(a);
    var c = datos(d);

    /* ---- 1. LA IMAGEN ---- */
    caja.appendChild(titulo('1. La imagen'));
    var ai = document.createElement('div');
    ai.textContent = 'La foto es la de «Fondo sección frase larga» (arriba): subí una del cliente o usá la imagen del diseño.';
    ai.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:8px;line-height:1.35';
    caja.appendChild(ai);
    caja.appendChild(rango('Alto de la imagen', 0, 800, 10, parseInt(c.alto, 10) || 0,
      function (v) { return v < 200 ? 'automático' : v + ' px'; },
      function (v) { datos(borrador() || d).alto = v < 200 ? 0 : v; }));
    caja.appendChild(rango('Ampliar la imagen (zoom)', 100, 250, 5, parseInt(c.zoom, 10) || 100,
      function (v) { return v <= 100 ? 'sin zoom' : v + ' %'; },
      function (v) { datos(borrador() || d).zoom = v; }));
    caja.appendChild(rango('Qué parte de la foto se ve', 0, 100, 1, (c.foco === undefined || c.foco === '' || c.foco === null) ? 50 : c.foco,
      function (v) { return v < 34 ? 'más de arriba (' + v + ')' : v > 66 ? 'más de abajo (' + v + ')' : 'el centro (' + v + ')'; },
      function (v) { datos(borrador() || d).foco = v; }));
    caja.appendChild(select('Cómo entra la foto', [['llena', 'Ocupa toda la franja'], ['entera', 'Entera, sobre una copia borrosa']],
      c.foto || 'llena', function (v) { datos(borrador() || d).foto = v; }));
    caja.appendChild(select('Velo sobre la foto (para que se lea)', [['', 'Automático (sombra suave detrás de la frase)'], ['suave', 'Oscurecer suave'], ['oscuro', 'Oscurecer fuerte'], ['ninguno', 'Sin velo'], ['claro', 'Aclarar suave'], ['claro-fuerte', 'Aclarar fuerte']],
      c.velo || '', function (v) { datos(borrador() || d).velo = v; }));
    var b = document.createElement('button'); b.type = 'button';
    b.textContent = 'Usar la imagen del diseño';
    b.style.cssText = 'margin:2px 0 6px;padding:8px 12px;border-radius:10px;border:1px solid rgba(0,0,0,.15);background:#fff;cursor:pointer;font-size:12.5px';
    b.onclick = function () { traerDelDiseno(borrador() || d, b); };
    caja.appendChild(b);

    /* ---- 2. EL TEXTO ---- */
    caja.appendChild(titulo('2. El texto'));
    /* la tipografía, el tamaño y el color son los campos de siempre de PRINCIPAL
       (fraseFont, fraseSize, fraseColor): se MUDAN acá, no se duplican */
    var slot = document.createElement('div'); slot.className = 'fb-texto-campos';
    caja.appendChild(slot);
    caja.appendChild(select('Posición del texto', [['arriba', 'Arriba'], ['centro', 'Centrado'], ['abajo', 'Abajo']],
      c.pos || 'centro', function (v) { datos(borrador() || d).pos = v; }));
    caja.appendChild(select('Grosor de la letra', [['', 'El del diseño'], ['400', 'Normal'], ['500', 'Un poco más gruesa'], ['600', 'Gruesa'], ['700', 'Negrita']],
      c.peso || '', function (v) { datos(borrador() || d).peso = v; }));
    return caja;
  }

  /* los campos de texto de PRINCIPAL que viven en «2. El texto» (se buscan por
     el dato que guardan, no por el rótulo) */
  var CAMPOS_TEXTO = [
    ['fraseFont', 'Tipografía'],
    ['fraseSize', 'Tamaño del texto'],
    ['fraseColor', 'Color del texto']
  ];
  function mudarCampos() {
    var caja = document.getElementById(ID); if (!caja) return;
    var slot = caja.querySelector('.fb-texto-campos'); if (!slot) return;
    CAMPOS_TEXTO.forEach(function (k) {
      var sel = '[oninput*="\'' + k[0] + '\'"],[onchange*="\'' + k[0] + '\'"]';
      var todos = [].slice.call(document.querySelectorAll('#panel ' + sel));
      var afuera = todos.filter(function (x) { return !slot.contains(x); })[0];
      if (!afuera) return;
      var g = afuera.closest('.grp'); if (!g) return;
      [].forEach.call(slot.querySelectorAll('[data-fb-campo="' + k[0] + '"]'), function (v) { v.remove(); });
      g.setAttribute('data-fb-campo', k[0]);
      var lab = g.querySelector('label');
      if (lab) lab.textContent = k[1] + (k[0] === 'fraseSize' ? ' (a la izquierda del todo = automático)' : '');
      slot.appendChild(g);
    });
    /* el orden: tipografía, tamaño, color */
    CAMPOS_TEXTO.forEach(function (k) { var g = slot.querySelector('[data-fb-campo="' + k[0] + '"]'); if (g) slot.appendChild(g); });
  }

  function traerDelDiseno(d, btn) {
    var M = window.MUESTRAS_INVITAME || {}, tpl = String(d.tpl || '');
    var m = M[tpl] || M[tpl.toLowerCase()] || Object.keys(M).map(function (k) { return M[k]; })
      .filter(function (x) { return x && String(x.nombre || '').toLowerCase() === tpl.toLowerCase(); })[0];
    if (!m || !m.muestra || !window.INVVESTIR || !INVVESTIR.bajarMuestra) {
      alert('Primero elegí el diseño en PRINCIPAL → «Diseño del catálogo».'); return;
    }
    btn.disabled = true; btn.textContent = 'Trayendo…';
    INVVESTIR.bajarMuestra(m.muestra).then(function (mu) {
      var u = mu['img_c_fondo-seccion-frase-larga'] || mu['img_c_fondo-secci-n-frase-larga'] || mu['img_f-fondo-secci-n-frase-larga'] || mu.cover || '';
      btn.disabled = false; btn.textContent = 'Usar la imagen del diseño';
      if (!u) { alert('El diseño elegido no trae imagen para la frase.'); return; }
      d['img_c_fondo-seccion-frase-larga'] = u;
      /* que la casilla de la foto muestre la nueva */
      try { if (typeof renderPanel === 'function') renderPanel(); } catch (e) {}
      refrescar();
    }).catch(function () { btn.disabled = false; btn.textContent = 'Usar la imagen del diseño'; alert('No se pudo traer la imagen del diseño. Probá de nuevo.'); });
  }

  function revisarPanel() {
    var d = borrador(); if (!d) return;
    if (document.getElementById(ID)) { mudarCampos(); return; }
    var a = window.invCasa ? window.invCasa(ID) : null;
    if (!a) return;
    a.appendChild(construir(d));
    mudarCampos();
  }

  /* ================= ARRANQUE ================= */
  function esPanel() { return !!(borrador() || document.querySelector('.mejoras')); }
  function arrancar() {
    if (esPanel()) { setInterval(revisarPanel, 700); revisarPanel(); return; }
    aplicar();
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 300);
    window.addEventListener('message', function () { ultima = null; setTimeout(aplicar, 60); });
  }
  var i = 0;
  var esperar = setInterval(function () {
    if (window.INVEV || esPanel() || ++i > 40) { clearInterval(esperar); arrancar(); }
  }, 250);
})();
