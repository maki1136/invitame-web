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
    var velo = auto ? (hayFoto ? 'foto' : veloSegunLetra()) : c.velo;
    var colorPropio = String(ev.fraseColor || '').trim();
    var firma = foto + '|' + velo + '|' + pos + '|' + colorPropio;
    if (firma === ultima && document.getElementById(ID_CSS)) { soltarCorrector(velo === 'foto'); return; }
    ultima = firma;
    /* dos :not(#id) para ganarle a las colecciones, que pintan la frase con selectores largos */
    var S = 'html body section.fraseSec.fraseSec:not(#fb-a):not(#fb-b)';
    var css = [];
    if (foto === 'llena') {
      /* la foto cubre toda la franja: sin la copia borrosa ni la foto chica al medio */
      /* la foto que subieron está en #bandfg (entera): pasa a cubrir toda la franja */
      css.push(S + ' #bandfg{background-size:cover!important;background-position:center!important}');
    }
    if (velo === 'foto') {
      var g = pos === 'arriba' ? 'linear-gradient(to bottom, rgba(0,0,0,0) 6%, rgba(0,0,0,.34) 20%, rgba(0,0,0,.20) 40%, rgba(0,0,0,0) 58%)'
            : pos === 'abajo' ? 'linear-gradient(to top, rgba(0,0,0,0) 6%, rgba(0,0,0,.34) 20%, rgba(0,0,0,.20) 40%, rgba(0,0,0,0) 58%)'
            : 'radial-gradient(80% 38% at 50% 50%, rgba(0,0,0,.32) 0%, rgba(0,0,0,.14) 55%, rgba(0,0,0,0) 100%)';
      /* la letra: la que eligieron en el panel o blanca. Si es oscura, la sombra
         de atrás pasa a ser clara. */
      var letra = colorPropio || '#fff';
      var oscura = luz(letra) < 0.5;
      if (oscura) g = g.replace(/rgba\(0,0,0,/g, 'rgba(255,255,255,');
      css.push(S + ' #frase-tint{background:' + g + '!important}');
      css.push(S + ' > p.frase.frase{color:' + letra + '!important;-webkit-text-fill-color:' + letra + '!important;text-shadow:' +
        (oscura ? '0 1px 2px rgba(255,255,255,.6),0 0 14px rgba(255,255,255,.5)' : '0 1px 3px rgba(0,0,0,.55),0 2px 14px rgba(0,0,0,.45)') + '!important}');
    } else {
      css.push(S + ' #frase-tint{background:' + VELOS[velo] + '!important}');
    }
    css.push(S + '{align-items:' + POS[pos] + '!important}');
    /* lejos de los bordes: arriba y abajo la franja se esfuma (máscara del 14 %) */
    if (pos === 'arriba') css.push(S + '{padding-top:clamp(56px,20%,140px)!important}');
    if (pos === 'abajo')  css.push(S + '{padding-bottom:clamp(56px,20%,140px)!important}');
    soltarCorrector(velo === 'foto');
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

  function construir(d) {
    var caja = document.createElement('div'); caja.id = ID;
    var t = document.createElement('div'); t.textContent = 'Cómo se ve la frase larga';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    var a = document.createElement('div');
    a.textContent = 'La foto es la de «Fondo sección frase larga»: subí una del cliente o usá la imagen del diseño.';
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(t); caja.appendChild(a);
    var c = datos(d);
    caja.appendChild(select('Ubicación de la frase', [['arriba', 'Arriba'], ['centro', 'Centrado'], ['abajo', 'Abajo']],
      c.pos || 'centro', function (v) { datos(borrador() || d).pos = v; }));
    caja.appendChild(select('Velo sobre la foto (para que se lea)', [['', 'Automático (sombra suave detrás de la frase)'], ['suave', 'Oscurecer suave'], ['oscuro', 'Oscurecer fuerte'], ['ninguno', 'Sin velo'], ['claro', 'Aclarar suave'], ['claro-fuerte', 'Aclarar fuerte']],
      c.velo || '', function (v) { datos(borrador() || d).velo = v; }));
    caja.appendChild(select('Cómo entra la foto', [['llena', 'Ocupa toda la franja'], ['entera', 'Entera, sobre una copia borrosa']],
      c.foto || 'llena', function (v) { datos(borrador() || d).foto = v; }));

    var b = document.createElement('button'); b.type = 'button';
    b.textContent = 'Usar la imagen del diseño';
    b.style.cssText = 'margin:2px 0 6px;padding:8px 12px;border-radius:10px;border:1px solid rgba(0,0,0,.15);background:#fff;cursor:pointer;font-size:12.5px';
    b.onclick = function () { traerDelDiseno(borrador() || d, b); };
    caja.appendChild(b);
    return caja;
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
    if (document.getElementById(ID)) return;
    var a = window.invCasa ? window.invCasa(ID) : null;
    if (!a) return;
    a.appendChild(construir(d));
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
