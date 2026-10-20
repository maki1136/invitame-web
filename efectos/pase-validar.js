/* ===== EL QR DEL PASE MUESTRA SI EL PASE ES VÁLIDO (16/10/2026) ==============

   Pedido de Jazmín (doc «Ajustes y mejoras», punto 7): «al escanear el QR se
   abre la invitación completa. Debería mostrarse claramente el estado de
   validación del pase».

   CÓMO FUNCIONA
   1. El QR del pase pasa a llevar `&p=1` al final:
        /i/?e=<slug>&g=<token>&p=1
      El motor lo pinta sin eso (está congelado en /i/v/<ver>/), así que este
      módulo lo REPINTA igual —mismo tamaño y colores— con el `p=1`.
   2. Cuando la invitación se abre CON `p=1` (o sea, alguien escaneó el QR),
      antes que nada aparece la pantalla del pase:
        · verde  «Pase válido»       → le quedan ingresos
        · ámbar  «Ya ingresó»        → usó todos sus pases
        · rojo   «Pase no válido»    → el código no existe o fue dado de baja
      con el nombre, los pases, cuántos quedan y la mesa.
   3. Si quien escanea es del EQUIPO y está logueado, aparece «Registrar
      ingreso», que descuenta uno igual que /scan.html (INV.marcarUso, con
      transacción: no se puede usar dos veces el mismo ingreso). Si no, se
      indica que el ingreso se registra con el escáner del equipo.
   4. «Ver invitación» cierra la pantalla y deja la invitación normal.

   ⚠️ Lee `inv_invitados/<slug>__<token>`, que ya es de lectura pública
      (lo lee la propia invitación para poner el nombre en el pase).
   ⚠️ No hace nada fuera de la invitación ni sin `g=` en la dirección.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPaseValidar) return; window.__invPaseValidar = 1;

  var qs = new URLSearchParams(location.search);
  var SLUG = (qs.get('e') || '').trim();
  var TOKEN = (qs.get('g') || '').trim();
  if (!/\/i\//.test(location.pathname) || !SLUG || !TOKEN || TOKEN === 'demo') return;

  function urlPase() {
    return location.origin + '/i/?e=' + encodeURIComponent(SLUG) + '&g=' + encodeURIComponent(TOKEN) + '&p=1';
  }

  /* ---------- 1) el QR con p=1 ---------- */
  var pintando = false, nuestro = null;
  function repintar(box) {
    if (!window.QRCode) return;
    pintando = true;
    box.innerHTML = '';
    new window.QRCode(box, { text: urlPase(), width: 92, height: 92, colorDark: '#2e433c', colorLight: '#ffffff' });
    nuestro = box.firstChild;
    pintando = false;
  }
  function vigilarQR() {
    var box = document.getElementById('qr');
    if (!box) return false;
    /* cada vez que el motor lo pinta (sin p=1), se repinta con p=1 */
    new MutationObserver(function () {
      if (!pintando && box.firstChild && box.firstChild !== nuestro) repintar(box);
    }).observe(box, { childList: true });
    if (box.firstChild) repintar(box);
    return true;
  }
  (function esperar(n) { if (!vigilarQR() && n < 60) setTimeout(function () { esperar(n + 1); }, 500); })(0);

  /* ---------- 2) la pantalla del pase (sólo si vino del QR) ---------- */
  if (qs.get('p') !== '1') return;

  var css = document.createElement('style');
  css.textContent =
    '#pv-validar{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:22px;background:rgba(10,9,8,.9);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#fff}' +
    '#pv-validar .rc{width:100%;max-width:380px;border-radius:22px;padding:26px 22px;text-align:center;box-shadow:0 18px 50px rgba(0,0,0,.45)}' +
    '#pv-validar .ok{background:linear-gradient(160deg,#1f7a4d,#14603b)}' +
    '#pv-validar .warn{background:linear-gradient(160deg,#9a7a22,#6d551a)}' +
    '#pv-validar .bad{background:linear-gradient(160deg,#8a2b2b,#6d1f1f)}' +
    '#pv-validar .wait{background:linear-gradient(160deg,#454b52,#33383d)}' +
    '#pv-validar .ico{font-size:54px;line-height:1}' +
    '#pv-validar .tit{font-size:24px;font-weight:800;margin:10px 0 2px;letter-spacing:.2px}' +
    '#pv-validar .nom{font-size:19px;font-weight:600;opacity:.95;margin-bottom:14px}' +
    '#pv-validar .grid{display:flex;gap:9px;justify-content:center;margin:4px 0 8px}' +
    '#pv-validar .g{background:rgba(255,255,255,.16);border-radius:12px;padding:10px 8px;min-width:62px}' +
    '#pv-validar .gn{font-size:22px;font-weight:800}#pv-validar .gl{font-size:11px;opacity:.85}' +
    '#pv-validar .nota{font-size:12.5px;opacity:.9;margin-top:10px;line-height:1.4}' +
    '#pv-validar button{display:block;width:100%;padding:13px;border:0;border-radius:12px;margin-top:10px;font-size:15px;font-weight:700;cursor:pointer;color:#fff;background:rgba(255,255,255,.22)}' +
    '#pv-validar button.fuerte{background:#fff;color:#14603b}';
  document.head.appendChild(css);

  var capa = document.createElement('div');
  capa.id = 'pv-validar';
  capa.setAttribute('role', 'dialog');
  capa.setAttribute('aria-label', 'Estado del pase');

  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function cerrar() {
    capa.remove();
    try { qs.delete('p'); history.replaceState(null, '', location.pathname + '?' + qs.toString() + location.hash); } catch (e) {}
  }

  function equipoLogueado() {
    try { return !!(window.INV && INV.auth && INV.auth.currentUser); } catch (e) { return false; }
  }
  /* la sesión de Firebase tarda un momento en aparecer: se espera a saberlo */
  function cuandoSepaSesion(cb) {
    var listo = false, fin = function () { if (!listo) { listo = true; cb(); } };
    try { if (window.INV && INV.onAuth) INV.onAuth(function () { fin(); }); } catch (e) {}
    setTimeout(fin, 3500);
  }

  /* ★ 19/10/2026 (Jazmín, «Ajustes de plataforma», punto 4): «si un pase tiene
     5 usos, valida los primeros cinco escaneos y al sexto muestra PASE
     INVÁLIDO. La validación debe ser automática.»
     → Si quien escanea es del equipo (sesión iniciada en ese celular), CADA
       escaneo descuenta una entrada solo, sin tocar nada. Sin sesión, se ve el
       estado pero no se descuenta: así un invitado curioso que escanea su
       propio QR no se gasta una entrada. */
  function pintar(estado, g, aviso) {
    var clase = { entra: 'ok', ok: 'ok', invalido: 'bad', cargando: 'wait', error: 'wait' }[estado];
    var ico = { entra: '✓', ok: '✓', invalido: '✕', cargando: '…', error: '?' }[estado];
    var tit = { entra: 'PASE VÁLIDO', ok: 'PASE VÁLIDO', invalido: 'PASE INVÁLIDO', cargando: 'Revisando el pase…', error: 'No se pudo revisar' }[estado];
    var h = '<div class="rc ' + clase + '"><div class="ico">' + ico + '</div><div class="tit">' + tit + '</div>';
    if (g) {
      var max = g.usosMax || g.pases || 1;
      var quedan = (g.usos != null) ? g.usos : max;
      h += '<div class="nom">' + esc(g.nombre || '') + '</div>' +
        '<div class="grid"><div class="g"><div class="gn">' + esc(max) + '</div><div class="gl">Entradas</div></div>' +
        '<div class="g"><div class="gn">' + esc(Math.max(0, max - quedan)) + '</div><div class="gl">Usadas</div></div>' +
        '<div class="g"><div class="gn">' + esc(quedan) + '</div><div class="gl">Quedan</div></div>' +
        '<div class="g"><div class="gn">' + esc(String(g.mesa || '-').replace(/^\s*mesa\s*/i, '') || '-') + '</div><div class="gl">Mesa</div></div></div>';
    }
    if (aviso) h += '<div class="nota"><b>' + esc(aviso) + '</b></div>';
    if (estado === 'ok') {
      h += '<div class="nota">Este celular solo mira el pase: no descuenta entradas. Para que cada escaneo cuente solo, iniciá sesión del equipo una vez en este celular.</div>' +
           '<button class="fuerte" id="pv-login">Iniciar sesión del equipo</button>';
    }
    if (estado === 'error') h += '<button id="pv-otra">Probar de nuevo</button>';
    if (estado !== 'cargando') h += '<button id="pv-ver">Ver invitación</button>';
    h += '</div>';
    capa.innerHTML = h;
    var b;
    if ((b = document.getElementById('pv-ver'))) b.onclick = cerrar;
    if ((b = document.getElementById('pv-otra'))) b.onclick = revisar;
    if ((b = document.getElementById('pv-login'))) b.onclick = function () { location.href = '/scan.html?e=' + encodeURIComponent(SLUG); };
  }

  function quedanDe(g) { return (g.usos != null) ? g.usos : (g.usosMax || g.pases || 1); }

  /* el equipo: se descuenta una entrada en el acto (transacción: no se puede
     usar dos veces la misma) */
  function registrar(g) {
    pintar('cargando', g);
    INV.marcarUso(SLUG, TOKEN).then(function (r) {
      if (r && r.ok) {
        g.usos = r.restantes;
        pintar('entra', g, '✓ Entrada registrada. Quedan ' + r.restantes + '.');
      } else if (r && r.motivo === 'sin-usos') {
        g.usos = 0;
        pintar('invalido', g, 'Ya usó todas sus entradas.');
      } else pintar('invalido', null, 'Este código no existe.');
    }).catch(function (e) {
      pintar(quedanDe(g) > 0 ? 'ok' : 'invalido', g, /permission|insufficient/i.test(String(e && e.message || e))
        ? 'Tu usuario no tiene permiso para registrar entradas.' : 'No se pudo registrar. Revisá la conexión.');
    });
  }

  function revisar() {
    pintar('cargando', null);
    (function esperarINV(n) {
      if (!(window.INV && INV.getInvitado)) {
        if (n < 40) return setTimeout(function () { esperarINV(n + 1); }, 250);
        return pintar('error', null, 'Sin conexión con la base.');
      }
      INV.getInvitado(SLUG, TOKEN).then(function (g) {
        if (!g || g.activo === false) return pintar('invalido', null, 'Este código no existe o fue dado de baja.');
        if (quedanDe(g) <= 0) return pintar('invalido', g, 'Ya usó todas sus entradas.');
        cuandoSepaSesion(function () {
          if (equipoLogueado()) registrar(g); else pintar('ok', g);
        });
      }).catch(function () { pintar('error', null, 'Revisá la conexión a internet.'); });
    })(0);
  }

  function montar() { document.body.appendChild(capa); revisar(); }
  if (document.body) montar(); else document.addEventListener('DOMContentLoaded', montar);
})();
