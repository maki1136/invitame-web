/* ===== «← VOLVER» A LA WEB, SÓLO CUANDO LA WEB ABRE LA MUESTRA (22/10/2026) =====
   La web abre las muestras con `&volver=<url de la web>`:
     /i/?e=julia-y-santiago&volver=https%3A%2F%2Finvitameweb.littlemomentsok.com%2Fmx%2F%23muestras
   Sin ese parámetro no aparece NUNCA (los invitados reales no lo ven).
   · Pastilla chica arriba a la izquierda, fija, por encima del sobre (#env).
   · Al tocarla: si venimos de esa misma web (referrer), history.back() — así
     vuelve a la misma sección y posición —; si no, va a la dirección de volver.
   · Sólo acepta https de invitameweb.littlemomentsok.com o invitameok.com.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invVolver) return; window.__invVolver = 1;
  if (!/\/i\//.test(location.pathname)) return;
  if (window.top !== window) return;                 /* no en la miniatura del panel ni en la capa de la web */

  var crudo = (location.search.match(/[?&]volver=([^&]+)/) || [])[1];
  if (!crudo) return;
  var url;
  try { url = new URL(decodeURIComponent(crudo)); } catch (e) { return; }
  var okHost = /^(?:www\.)?(?:invitameweb\.littlemomentsok\.com|invitameok\.com)$/i;
  if (url.protocol !== 'https:' || !okHost.test(url.hostname)) return;

  function poner() {
    if (!document.body) { setTimeout(poner, 50); return; }
    if (document.getElementById('inv-volver')) return;
    var st = document.createElement('style');
    st.textContent =
      '#inv-volver{position:fixed;z-index:2147483000;left:calc(12px + env(safe-area-inset-left));' +
      'top:calc(12px + env(safe-area-inset-top));display:inline-flex;align-items:center;gap:6px;' +
      'padding:8px 14px 8px 11px;border-radius:999px;background:rgba(255,255,255,.9);color:#2a2622;' +
      'font:600 13px/1 Montserrat,system-ui,-apple-system,sans-serif;letter-spacing:.02em;text-decoration:none;' +
      'box-shadow:0 2px 10px rgba(0,0,0,.18);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);' +
      'border:0;cursor:pointer;-webkit-tap-highlight-color:transparent;pointer-events:auto;visibility:visible!important}' +
      '#inv-volver svg{width:14px;height:14px}';
    document.head.appendChild(st);
    var a = document.createElement('a');
    a.id = 'inv-volver';
    a.href = url.href;
    a.setAttribute('aria-label', 'Volver a la web');
    a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>Volver';
    a.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var ref = '';
      try { ref = document.referrer || ''; } catch (x) {}
      if (ref && ref.indexOf(url.origin) === 0 && history.length > 1) history.back();
      else location.href = url.href;
    }, true);
    /* que el toque no abra el sobre que está abajo */
    ['touchstart', 'touchend', 'pointerdown', 'mousedown'].forEach(function (ev) {
      a.addEventListener(ev, function (e) { e.stopPropagation(); }, true);
    });
    document.body.appendChild(a);
  }
  poner();
})();
