/* ===== PORTADA A COLOR AUNQUE LA COLECCIÓN LA PONGA EN BLANCO Y NEGRO (10/11) =
   Jazmín (jakzirhy-y-alexis, colección Perlas): «la portada en blanco y negro
   y no encuentran dónde modificarlo». Perlas aplica grayscale a la foto y al
   video de portada. Con `fx.portadaFoto.color === true` (casilla del panel,
   PRINCIPAL → «Portada · color de la foto») se ve a color.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPortadaColor) return; window.__invPortadaColor = 1;
  var st = document.createElement('style'); st.id = 'portada-color';
  st.textContent = 'html[data-portada-color] .portada .pbg,html[data-portada-color] .portada .cover-vid{filter:none!important}';
  (document.head || document.documentElement).appendChild(st);
  /* ★ 12/11 (Jazmín, xv-maria-ines): «sacar la transparencia oscura de la portada»,
     «agrandar el "XV años"… no se cambia de color, quedó negro, debería ser blanco»
     y «sacar los íconos predeterminados del dress code, que quede sólo texto».
     fx.portadaFoto.velo (0–1), .tamKick (px), .colorKick · fx.dresscodeOpc.sin.
     Se pisa por ID con el atributo doble: le gana a las colecciones (que usan
     html[data-col] #pv-kick con !important). */
  var st2 = document.createElement('style'); st2.id = 'portada-ajustes';
  (document.head || document.documentElement).appendChild(st2);
  function aplicar() {
    var e = window.INVEV; if (!e) return;
    var pf = (e.fx && e.fx.portadaFoto) || {};
    var on = pf.color === true;
    var h = document.documentElement;
    if (on) h.setAttribute('data-portada-color', ''); else h.removeAttribute('data-portada-color');
    var css = '', P = 'html[data-pajuste][data-pajuste] ';
    if (typeof pf.velo === 'number') css += P + '.portada .pbg::after,' + P + '.portada .pveil{opacity:' + Math.max(0, Math.min(1, pf.velo)) + '!important}';
    if (typeof pf.tamKick === 'number') css += P + '.portada #pv-kick{font-size:' + pf.tamKick + 'px!important}';
    if (/^#[0-9a-f]{3,8}$/i.test(String(pf.colorKick || ''))) css += P + '.portada #pv-kick{color:' + pf.colorKick + '!important;-webkit-text-fill-color:' + pf.colorKick + '!important}';

    /* ★ 13/11 (Jazmín, Ornela & Juan Rodolfo): «que la foto de portada quede del
       tamaño como es, así no se corta». fx.portadaFoto.entera: la foto entera
       (contain), sin el zoom lento, con la misma foto desenfocada de relleno
       detrás. «Arriba/Centro/Abajo» del encuadre la suben o la bajan. */
    /* ★ 13/11 (Jazmín, Ornela & Juan Rodolfo: «necesito que no amplíe la foto de
       portada, le corta la cabeza al novio»). fx.portadaFoto.sinZoom: la foto
       queda QUIETA y al tamaño de la portada (sin el acercamiento lento, sin el
       margen extra del parallax). Así lo que se ve es lo que se encuadró. */
    if (pf.sinZoom === true && pf.entera !== true) {
      css += P + '.portada #pbg{inset:0!important;animation:none!important;transform:none!important}';
    }
    var ent = pf.entera === true;
    var pb = document.getElementById('pbg');
    var rel = document.getElementById('pbg-relleno');
    if (ent && pb && pb.parentNode) {
      if (!rel) { rel = document.createElement('div'); rel.id = 'pbg-relleno'; rel.setAttribute('aria-hidden', 'true'); pb.parentNode.insertBefore(rel, pb); }
      css += '#pbg-relleno{position:absolute;inset:0;background:var(--cover) center/cover no-repeat;filter:blur(26px) saturate(1.05) brightness(.82);transform:scale(1.18);pointer-events:none}' +
        P + '.portada #pbg{inset:0!important;background-size:contain!important;background-repeat:no-repeat!important;animation:none!important;transform:none!important}';
    } else if (rel) rel.remove();

    if (css) h.setAttribute('data-pajuste', ''); else h.removeAttribute('data-pajuste');
    if (st2.textContent !== css) st2.textContent = css;
  }
  function arrancar() {
    aplicar();
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 30) clearInterval(t); }, 400);
    addEventListener('message', function () { setTimeout(aplicar, 120); setTimeout(aplicar, 600); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
