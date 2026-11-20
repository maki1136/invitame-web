/* ===== ENTRADA CON IMAGEN: EN VEZ DEL SOBRE, LA IMAGEN DEL CLIENTE (19/11/2026)
   Jazmín (Any y Luismi): «ellos quieren que en vez del sobre, aparezca esa
   imagen, como inicio» — una portada ya diseñada por el cliente («Haz click
   para abrir tu invitación»). Al tocarla se abre la invitación de siempre.

   QUÉ HACE — si fx.entradaImagen.on y hay imagen:
     · tapa el sobre con la imagen, a pantalla completa. Por defecto ENTERA
       (sin recortar el texto que trae), sobre un fondo de la misma imagen
       desenfocada; con «llenar» ocupa todo el celular (puede recortar bordes);
     · al tocar en cualquier lado: arranca la música y se abre la invitación,
       igual que al abrir el sobre (abrir() del motor), sin la animación del sobre;
     · si «aviso» está prendido, suma abajo una pastilla «Toca para abrir».

   EL DATO — fx.entradaImagen = { on, url, llenar, aviso }
   Panel: PRINCIPAL → «Entrada con imagen» (panel-estilo-secciones.js).
   ⚠️ Sin la casilla NO HACE NADA: ninguna invitación entregada cambia.
   ⚠️ En la miniatura del panel no aparece, igual que el sobre: el motor
      esconde #env en ?preview=1. Se ve en el link de la invitación.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invEntradaImg) return; window.__invEntradaImg = 1;
  if (!/^\/i\//.test(location.pathname)) return;
  if (/[?&]preview=1/.test(location.search)) return;

  var ID = 'inv-entrada-img';
  function cfg() { try { return ((window.INVEV || {}).fx || {}).entradaImagen || {}; } catch (e) { return {}; } }
  function si(v) { return v === true || v === 'true' || v === 1; }
  function url(v) { v = String(v || '').trim(); return /^https?:\/\//i.test(v) ? v : ''; }
  function liviana(u, w) { return u.replace(/(res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?!f_auto)/, '$1f_auto,q_auto:good,w_' + w + ',c_limit/'); }
  var abierto = false;

  function abrirInvitacion(el) {
    if (abierto) return; abierto = true;
    try { if (typeof abrir === 'function') abrir(); } catch (e) {}
    var env = document.getElementById('env');
    if (env) { env.classList.add('gone'); env.style.opacity = '0'; env.style.visibility = 'hidden'; }
    el.style.opacity = '0';
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 900);
  }

  function enganchar(el) {
    if (el.__toque) return; el.__toque = 1;
    el.onclick = null;
    el.addEventListener('click', function () { abrirInvitacion(el); });
    if (window.__invEntradaPend) abrirInvitacion(el);   /* la tocaron antes de que esto cargara */
  }
  function armar() {
    var c = cfg(), u = url(c.url), el = document.getElementById(ID);
    var env = document.getElementById('env');
    /* todavía no llegaron los datos: si el servidor ya la escribió, se la deja como está */
    if (!window.INVEV) { if (el) enganchar(el); return; }
    if (!si(c.on) || !u || abierto || !env || env.classList.contains('gone')) { if (el && !abierto) el.parentNode.removeChild(el); return; }
    var llenar = si(c.llenar), aviso = si(c.aviso), firma = u + '|' + llenar + '|' + aviso;
    if (el && el.__f === firma) return;
    if (!el) {
      el = document.createElement('div'); el.id = ID;
      el.setAttribute('role', 'button'); el.setAttribute('aria-label', 'Abrir la invitación');
      document.body.appendChild(el);
    }
    enganchar(el);   /* la puede haber escrito ya i/index.php (20/11) */
    el.__f = firma;
    var img = liviana(u, 1440), fondo = liviana(u, 400);
    el.style.cssText = 'position:fixed;inset:0;z-index:2147483000;cursor:pointer;overflow:hidden;background:#1a1512;transition:opacity .8s ease;-webkit-tap-highlight-color:transparent';
    el.innerHTML =
      (llenar ? '' : '<div style="position:absolute;inset:-40px;background:url(&quot;' + fondo + '&quot;) center/cover;filter:blur(26px) brightness(.85);transform:scale(1.1)"></div>') +
      '<div style="position:absolute;inset:0;background:url(&quot;' + img + '&quot;) center/' + (llenar ? 'cover' : 'contain') + ' no-repeat"></div>' +
      (aviso ? '<div style="position:absolute;left:50%;bottom:max(28px,env(safe-area-inset-bottom));transform:translateX(-50%);padding:11px 22px;border-radius:999px;background:rgba(30,22,16,.72);color:#fbf7ef;font:600 13px/1 \'Cormorant Garamond\',Georgia,serif;letter-spacing:.2em;text-transform:uppercase;white-space:nowrap;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)">Toca para abrir</div>' : '');
  }

  armar();
  var n = 0, t = setInterval(function () { armar(); if (++n > 60 || abierto) clearInterval(t); }, 250);
  addEventListener('message', function () { setTimeout(armar, 120); });
})();
