/* ===== VESTIMENTA · EL DIBUJO DE ARRIBA DEL TEXTO, ELEGIBLE (12/11/2026) ======
   Jazmín: «diferentes opciones para colocar en el sector de código de
   vestimenta… que no haya tantas, que sea como los sobres y los regalitos»;
   Maki: «mejor que puedas vos cargar las que quieran además del catálogo».
   fx.dresscodeOpc = { dibujo: ''|'sin'|<id>|'propia', url }  (sin:true = 'sin').
   Los del catálogo son dibujos de línea con fondo transparente: se pintan como
   máscara con el color del texto de la sección, así combinan con cada paleta.
   La imagen propia va tal cual (puede ser a color).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invVestDibujo) return; window.__invVestDibujo = 1;
  var B = 'https://res.cloudinary.com/oc8cgqt4/image/upload/';
  window.INVDRESS_CATALOGO = [
    { id: 'gala',   nombre: 'Gala (smoking y vestido sirena)', url: B + 'v1794506357/invitame/vestimenta/dc-gala.png' },
    { id: 'quince', nombre: 'XV (vestido de princesa y traje)', url: B + 'v1794506357/invitame/vestimenta/dc-quince.png' },
    { id: 'coctel', nombre: 'Cóctel (vestido midi y saco)',   url: B + 'v1794506358/invitame/vestimenta/dc-coctel.png' },
    { id: 'playa',  nombre: 'Playa (vestido boho y guayabera)', url: B + 'v1794506358/invitame/vestimenta/dc-playa.png' }
  ];
  if (!/\/i\//.test(location.pathname)) return;
  var st = document.createElement('style');
  st.textContent =
    'html[data-dc-dibujo] #dc-mono > :not(.dc-ilus){display:none!important}' +
    '#dc-mono .dc-ilus{display:block;margin:6px auto 4px;height:170px;max-width:100%;}' +
    '#dc-mono .dc-ilus.linea{width:100%;background-color:currentColor;-webkit-mask:var(--dc-u) center/contain no-repeat;mask:var(--dc-u) center/contain no-repeat}' +
    '#dc-mono img.dc-ilus{object-fit:contain;width:auto}' +
    'html[data-dc-sin] #dc-mono{display:none!important}';
  (document.head || document.documentElement).appendChild(st);
  function aplicar() {
    var e = window.INVEV; if (!e) return;
    var o = (e.fx && e.fx.dresscodeOpc) || {}, a = o.dibujo || (o.sin === true ? 'sin' : '');
    var h = document.documentElement, m = document.getElementById('dc-mono');
    if (a === 'sin') h.setAttribute('data-dc-sin', ''); else h.removeAttribute('data-dc-sin');
    var url = '', linea = false;
    if (a === 'propia' && /^https:\/\/[^\s"'()<>]+$/.test(String(o.url || ''))) url = o.url;
    else { var c = window.INVDRESS_CATALOGO.filter(function (x) { return x.id === a; })[0]; if (c) { url = c.url; linea = true; } }
    if (!m) return;
    var ya = m.querySelector('.dc-ilus');
    if (!url) { if (ya) ya.remove(); h.removeAttribute('data-dc-dibujo'); return; }
    h.setAttribute('data-dc-dibujo', '');
    if (ya && ya.getAttribute('data-u') === url) return;
    if (ya) ya.remove();
    var n;
    if (linea) { n = document.createElement('span'); n.className = 'dc-ilus linea'; n.style.setProperty('--dc-u', "url('" + url + "')"); n.setAttribute('role', 'img'); n.setAttribute('aria-label', 'Vestimenta'); }
    else { n = document.createElement('img'); n.className = 'dc-ilus'; n.src = url; n.alt = 'Vestimenta'; }
    n.setAttribute('data-u', url);
    m.insertBefore(n, m.firstChild);
  }
  var k = 0, t = setInterval(function () { aplicar(); if (++k > 40) clearInterval(t); }, 400);
  addEventListener('message', function () { setTimeout(aplicar, 150); setTimeout(aplicar, 700); });
})();
