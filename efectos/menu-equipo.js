/* ===== EL MENÚ DEL EQUIPO EN LA INVITACIÓN (23/10/2026) =========================
   Jazmín: «quiero que en la invitación haya un menú para seleccionar directamente
   la opción de EDITAR y sea más rápido. Si no hay que entrar a la plataforma,
   buscarla con la clave, buscar el panel». Lo tenía la plataforma vieja.

   · Sólo lo ve alguien del EQUIPO: sesión iniciada en el panel (mismo sitio,
     misma sesión de Firebase) y su correo cargado en `inv_equipo`. Los
     invitados nunca lo ven: no tienen sesión.
   · No va en la miniatura del panel (iframe).
   · Una pastilla chica abajo a la izquierda; al tocarla se abre: Editar,
     Panel de los novios, el paquete y el estado. «Ocultar» lo esconde hasta
     cerrar la pestaña.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invMenuEquipo) return; window.__invMenuEquipo = 1;
  if (!/\/i\//.test(location.pathname)) return;
  if (window.top !== window) return;
  try { if (sessionStorage.getItem('invMenuEquipoOculto') === '1') return; } catch (e) {}

  var PAQ = { estandar: 'Estándar', premium: 'Premium', platinum: 'Platinum' };
  var ESTADO = { 'entregada': 'Entregada', 'por-revisar': 'Por revisar', 'en-preparacion': 'En preparación', 'publicada': 'Publicada' };

  function slug() {
    var ev = window.INVEV || {};
    return ev.slug || new URLSearchParams(location.search).get('e') || '';
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function poner(miembro) {
    if (!document.body) { setTimeout(function () { poner(miembro); }, 60); return; }
    if (document.getElementById('inv-equipo')) return;
    var s = slug(); if (!s) return;
    var ev = window.INVEV || {};
    var paq = ((ev.fx || {}).paquete || {});
    var extras = (paq.extras || []).length;
    var est = ev.estado ? (ESTADO[ev.estado] || ev.estado) : '';

    var st = document.createElement('style');
    st.textContent =
      '#inv-equipo{position:fixed;z-index:2147483001;left:calc(12px + env(safe-area-inset-left));bottom:calc(12px + env(safe-area-inset-bottom));' +
      'font:600 13px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif;color:#2a2622}' +
      '#inv-equipo .ie-b{display:inline-flex;align-items:center;gap:6px;padding:8px 13px;border-radius:999px;border:0;cursor:pointer;' +
      'background:rgba(109,18,51,.92);color:#fff;font:inherit;box-shadow:0 4px 14px rgba(0,0,0,.25)}' +
      '#inv-equipo .ie-c{display:none;margin-bottom:8px;min-width:210px;background:#fff;border-radius:14px;padding:10px;box-shadow:0 10px 30px rgba(0,0,0,.28)}' +
      '#inv-equipo.abierto .ie-c{display:block}' +
      '#inv-equipo .ie-i{font-weight:500;font-size:12px;opacity:.75;padding:2px 6px 8px;border-bottom:1px solid #eee;margin-bottom:6px}' +
      '#inv-equipo a,#inv-equipo .ie-o{display:block;padding:9px 8px;border-radius:9px;color:#6D1233;text-decoration:none;cursor:pointer;background:none;border:0;font:inherit;text-align:left;width:100%}' +
      '#inv-equipo a:hover,#inv-equipo .ie-o:hover{background:#FBEFF2}' +
      '#inv-equipo .ie-o{color:#777;font-weight:500}';
    document.head.appendChild(st);

    var caja = document.createElement('div');
    caja.id = 'inv-equipo';
    caja.innerHTML =
      '<div class="ie-c">' +
        '<div class="ie-i">' + esc(s) +
          (paq.plan ? ' · ' + esc(PAQ[paq.plan] || paq.plan) + (extras ? ' + ' + extras + ' extra' + (extras > 1 ? 's' : '') : '') : '') +
          (est ? '<br>' + esc(est) : '') + '</div>' +
        '<a href="/admin.html?e=' + encodeURIComponent(s) + '" target="_blank" rel="noopener">✏️ Editar</a>' +
        '<a href="/mi-panel.html?e=' + encodeURIComponent(s) + '" target="_blank" rel="noopener">📋 Panel de los novios</a>' +
        '<button type="button" class="ie-o">Ocultar</button>' +
      '</div>' +
      '<button type="button" class="ie-b" aria-label="Menú del equipo">✏️ Equipo</button>';
    caja.querySelector('.ie-b').onclick = function (e) { e.stopPropagation(); caja.classList.toggle('abierto'); };
    caja.querySelector('.ie-o').onclick = function (e) {
      e.stopPropagation();
      try { sessionStorage.setItem('invMenuEquipoOculto', '1'); } catch (x) {}
      caja.remove();
    };
    caja.addEventListener('click', function (e) { e.stopPropagation(); });
    document.body.appendChild(caja);
  }

  var n = 0;
  (function esperar() {
    var I = window.INV;
    if (!I || !I.onAuth) { if (++n < 80) setTimeout(esperar, 250); return; }
    I.onAuth(function (u) {
      if (!u || !u.email || !I.getMiembro) return;
      I.getMiembro(u.email).then(function (m) {
        if (!m || m.activo === false) return;
        poner(m);
      }).catch(function () {});
    });
  })();
})();
