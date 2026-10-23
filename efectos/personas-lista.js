/* ===== PERSONAS: SÓLO TEXTO, UNA DEBAJO DE LA OTRA (23/10/2026) ==============
   citlalli-y-hedwin-jesus: «Con la bendición de Dios y de nuestros padres. No
   quiero agregar ninguna imagen. Únicamente es texto», con la relación arriba
   («PADRES DE LA NOVIA») y los nombres abajo, cada uno en su renglón y el «&»
   en el medio.
   `fx.personas.estilo = 'lista'` (casilla en PERSONAS). Sin fotos, una persona
   (o pareja) por renglón, centradas. Le gana a personas-centradas.js.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPersonasLista) return; window.__invPersonasLista = 1;
  var ID = 'inv-personas-lista';
  var CSS = 'html.inv-pl .padres{display:flex!important;flex-direction:column!important;align-items:center!important;gap:26px!important;grid-template-columns:none!important;max-width:100%!important}' +
    'html.inv-pl .padres > .p{width:100%!important;max-width:340px!important;display:flex!important;flex-direction:column!important;align-items:center!important;background:transparent!important;box-shadow:none!important;border:0!important;padding:0!important}' +
    'html.inv-pl .padres .av{display:none!important}' +
    'html.inv-pl .padres .rl{order:-1!important;font-size:11px!important;letter-spacing:.22em!important;text-transform:uppercase!important;margin:0 0 6px!important;opacity:.85}' +
    'html.inv-pl .padres .rl::after{content:"";display:block;width:34px;height:1px;margin:7px auto 0;background:currentColor;opacity:.45}' +
    'html.inv-pl .padres .nm{font-size:21px!important;line-height:1.3!important;white-space:normal!important}' +
    'html.inv-pl .padres .nm .pl-amp{display:block;font-size:.9em;margin:.1em 0}';
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var on = !!(ev.fx && ev.fx.personas && ev.fx.personas.estilo === 'lista');
    document.documentElement.classList.toggle('inv-pl', on);
    var st = document.getElementById(ID);
    if (on && !st) { st = document.createElement('style'); st.id = ID; st.textContent = CSS; document.head.appendChild(st); }
    if (!on) return;
    [].forEach.call(document.querySelectorAll('.padres .nm'), function (nm) {
      if (nm.querySelector('.pl-amp')) return;
      var t = nm.textContent || '';
      if (t.indexOf('&') < 0) return;
      var partes = t.split('&').map(function (s) { return s.trim(); }).filter(Boolean);
      if (partes.length < 2) return;
      nm.textContent = '';
      partes.forEach(function (s, i) {
        if (i) { var a = document.createElement('span'); a.className = 'pl-amp'; a.textContent = '&'; nm.appendChild(a); }
        var x = document.createElement('span'); x.style.display = 'block'; x.textContent = s; nm.appendChild(x);
      });
    });
  }
  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    aplicar();
    addEventListener('message', function () { setTimeout(aplicar, 200); });
    setInterval(aplicar, 1000);
  }
  arrancar();
})();
