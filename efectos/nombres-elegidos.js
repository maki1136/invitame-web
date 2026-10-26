/* ===== LOS NOMBRES COMO LOS ELIGIERON EN EL PANEL (23/10/2026) ===============
   Jazmín, en evelyn-camarillo-saavedra (Vaquera vino): «no funcionan los botones
   para modificar los colores del nombre y el tamaño de letra». Las colecciones
   pintan #pv-names (y sus <span>) con !important, así que el color, el tamaño
   y la letra del panel no se veían nunca.
   Cuando se tocan en el panel queda una marca (fx.ncolorElegido, fx.nsizeElegido,
   fx.nfontElegida) y esto escribe una hoja con un selector de cuatro #pv-names
   seguidos: con !important le gana a cualquier regla de colección.
   ⚠️ NO en línea: el motor reescribe style.fontSize a cada repaso y eso borra
      el !important puesto en línea (medido: el tamaño no llegaba nunca).
   Sin marca no toca nada: las muestras siguen con lo de su colección.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invNombresElegidos) return; window.__invNombresElegidos = 1;
  var ID = 'inv-nombres-elegidos';
  var S = '#pv-names#pv-names#pv-names#pv-names';
  var ultima = null;

  function css(ev) {
    var fx = ev.fx || {}, r = [], q = [];
    if (fx.ncolorElegido && /^#[0-9a-f]{3,8}$/i.test(ev.ncolor || '')) {
      q.push('color:' + ev.ncolor + '!important', '-webkit-text-fill-color:' + ev.ncolor + '!important',
             'background-image:none!important');
    }
    if (fx.nfontElegida && ev.nfont) q.push('font-family:' + String(ev.nfont).replace(/[;{}<>]/g, '') + '!important');
    if (q.length) r.push(S + ',' + S + ' span{' + q.join(';') + '}');
    if (ev.nmayus === true) r.push(S + ',' + S + ' span{text-transform:uppercase!important}');
    if (ev.layout === 'tres') {
      r.push(S + ' span{display:block!important}');
      r.push(S + ' span.n-amp{font-size:.55em!important;line-height:1.1!important;margin:.08em 0!important}');
    }
    if (fx.nsizeElegido && ev.nsize) {
      var n = parseInt(ev.nsize, 10) || 52;
      var juntos = ev.layout === 'juntos' && !!ev.n2;
      r.push(S + '{font-size:min(' + n + 'px,' + (juntos ? 12 : 22) + 'vw)!important}');
      r.push(S + ' span{font-size:inherit!important}');
    }
    return r.join('\n');
  }

  /* «tres»: CITLALLI / & / HEDWIN JESÚS — el «&» solo en su renglón (pedido de
     la clienta de citlalli-y-hedwin-jesus). El motor escribe
     <span>N1</span><br><span>&amp; N2</span>; acá se parte en tres. */
  function tres(ev) {
    if (ev.layout !== 'tres' || !ev.n1 || !ev.n2) return;
    ['pv-names', 'ep-names'].forEach(function (id) {
      var e = document.getElementById(id); if (!e || e.querySelector('.n-amp')) return;
      var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
      e.innerHTML = '<span>' + esc(ev.n1) + '</span><span class="n-amp">&amp;</span><span>' + esc(ev.n2) + '</span>';
    });
  }

  /* 26/10 (Evelyn): el corrector de legibilidad (reglas-duras) le ponía blanco
     inline con !important a cada renglón del nombre. Con un color elegido en el
     panel, el nombre queda fuera del corrector. */
  function soltarCorrector(ev) {
    var on = !!((ev.fx || {}).ncolorElegido && /^#[0-9a-f]{3,8}$/i.test(ev.ncolor || ''));
    ['pv-names', 'ep-names'].forEach(function (id) {
      var e = document.getElementById(id); if (!e) return;
      if (!on) { e.removeAttribute('data-regla-no'); return; }
      e.setAttribute('data-regla-no', '1');
      [].forEach.call(e.querySelectorAll('[data-regla-luz]'), function (x) {
        ['color', '-webkit-text-fill-color'].forEach(function (k) { x.style.removeProperty(k); });
        ['data-regla-luz', 'data-regla-orig', 'data-regla-inline', 'data-regla-opa', 'data-regla-fondo', 'data-regla-flojo'].forEach(function (k) { x.removeAttribute(k); });
      });
    });
  }

  function revisar() {
    var ev = window.INVEV; if (!ev || typeof ev !== 'object') return;
    tres(ev);
    soltarCorrector(ev);
    var t = css(ev);
    if (t === ultima) return;
    ultima = t;
    var st = document.getElementById(ID);
    if (!st) { st = document.createElement('style'); st.id = ID; (document.head || document.documentElement).appendChild(st); }
    st.textContent = t;
  }

  revisar();
  window.addEventListener('message', function () { setTimeout(revisar, 80); }, false);
  setInterval(revisar, 800);
})();
