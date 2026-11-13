/* ===== INVITACIÓN EN IMAGEN: EL SOBRE SE ABRE Y APARECE LA IMAGEN DEL CLIENTE (12/11/2026)
   Jazmín, 12/11: «un cliente quiere que hagamos el efecto de sobre, pero cuando
   lo abran aparezca esta imagen» (una invitación ya diseñada, en JPG).

   QUÉ HACE — si fx.invImagen.on y hay imagen:
     · el sobre del catálogo funciona como siempre (y la música arranca al tocarlo);
     · debajo del sobre, en vez de la invitación, queda la IMAGEN a pantalla
       completa, entera (sin recortes) sobre un fondo hecho con la misma imagen
       desenfocada;
     · abajo, botones: «Confirmar asistencia» (WhatsApp), «Ver ubicación» (si
       hay dirección o link) y «Descargar imagen».

   EL DATO — fx.invImagen = { on, url, wa, mensaje, mapa, textoConfirmar,
     sinDescarga, sinConfirmar }
     wa vacío → el «Número de WhatsApp» de Contacto (c_numero-de-whatsapp / waN1).
   Panel: PRINCIPAL → «Invitación en imagen (sobre + la imagen del cliente)».
   ⚠️ Sin la casilla NO HACE NADA: ninguna invitación entregada cambia.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invImagen) return; window.__invImagen = 1;
  if (!/^\/i\//.test(location.pathname)) return;

  var ID = 'inv-imagen';
  function cfg() { try { return ((window.INVEV || {}).fx || {}).invImagen || {}; } catch (e) { return {}; } }
  function si(v) { return v === true || v === 'true' || v === 1; }
  function dig(s) { return String(s || '').replace(/[^\d]/g, ''); }
  function url(v) { v = String(v || '').trim(); return /^https?:\/\//i.test(v) ? v : ''; }

  function enlaceMapa(m) {
    m = String(m || '').trim();
    if (!m) return '';
    if (/^https?:\/\//i.test(m)) return m;
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(m);
  }

  function boton(txt, href, claro) {
    var a = document.createElement('a');
    a.textContent = txt; a.href = href; a.target = '_blank'; a.rel = 'noopener';
    a.style.cssText = 'flex:1 1 0;min-width:0;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;' +
      'font:600 13px/1 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.02em;text-decoration:none;' +
      'padding:14px 12px;border-radius:999px;' +
      (claro ? 'background:rgba(255,255,255,.94);color:#1d1b1f;' : 'background:rgba(20,18,22,.72);color:#fff;border:1px solid rgba(255,255,255,.35);') +
      'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)';
    return a;
  }

  var firma = '';
  function armar() {
    var c = cfg(), ev = window.INVEV || {}, img = url(c.url);
    var ya = document.getElementById(ID);
    if (!si(c.on) || !img) {
      if (ya) { ya.remove(); document.documentElement.style.overflow = ''; if (document.body) document.body.style.overflow = ''; firma = ''; }
      return;
    }
    var wa = dig(c.wa) || dig(ev['c_numero-de-whatsapp'] || ev.waN1 || '');
    var msj = String(c.mensaje || '').trim() ||
      ('¡Hola! Confirmo mi asistencia' + (ev.n1 ? ' a la celebración de ' + [ev.n1, ev.n2].filter(Boolean).join(' y ') : '') + '.');
    var mapa = enlaceMapa(c.mapa);
    var f = JSON.stringify([img, wa, msj, mapa, c.textoConfirmar, !!si(c.sinDescarga), !!si(c.sinConfirmar)]);
    if (ya && f === firma) return;
    firma = f;
    if (ya) ya.remove();

    var box = document.createElement('div');
    box.id = ID;
    /* debajo del sobre (#env es z-index 100) y encima de toda la invitación */
    box.style.cssText = 'position:fixed;inset:0;z-index:99;background:#111;overflow:hidden;display:flex;flex-direction:column;';
    var fondo = document.createElement('div');
    fondo.style.cssText = 'position:absolute;inset:-40px;background:center/cover no-repeat url("' + img.replace(/"/g, '%22') + '");' +
      'filter:blur(28px) saturate(1.1);opacity:.75;transform:scale(1.05)';
    var marco = document.createElement('div');
    marco.style.cssText = 'position:relative;flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;padding:10px 10px 0';
    var im = document.createElement('img');
    im.src = img; im.alt = 'Invitación';
    im.style.cssText = 'display:block;max-width:100%;max-height:100%;object-fit:contain;border-radius:6px;box-shadow:0 10px 40px rgba(0,0,0,.35)';
    marco.appendChild(im);
    var barra = document.createElement('div');
    barra.style.cssText = 'position:relative;display:flex;gap:8px;padding:12px 12px calc(14px + env(safe-area-inset-bottom));max-width:560px;width:100%;margin:0 auto;box-sizing:border-box';
    if (wa && !si(c.sinConfirmar)) barra.appendChild(boton(String(c.textoConfirmar || '').trim() || 'Confirmar asistencia', 'https://wa.me/' + wa + '?text=' + encodeURIComponent(msj), true));
    if (mapa) barra.appendChild(boton('Ver ubicación', mapa, false));
    if (!si(c.sinDescarga)) {
      var d = boton('Descargar imagen', img, false);
      d.removeAttribute('target');
      d.addEventListener('click', function (e) {
        e.preventDefault();
        fetch(img).then(function (r) { return r.blob(); }).then(function (b) {
          var u = URL.createObjectURL(b), a = document.createElement('a');
          a.href = u; a.download = 'invitacion.jpg'; document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
        }).catch(function () { window.open(img, '_blank'); });
      });
      barra.appendChild(d);
    }
    box.appendChild(fondo); box.appendChild(marco);
    if (barra.children.length) box.appendChild(barra);
    (document.body || document.documentElement).appendChild(box);
    document.documentElement.style.overflow = 'hidden';
    if (document.body) document.body.style.overflow = 'hidden';
    document.documentElement.setAttribute('data-inv-imagen', '1');
  }

  window.INVIMAGEN = { armar: armar };
  function arrancar() {
    armar();
    addEventListener('message', function () { setTimeout(armar, 150); });
    var n = 0, t = setInterval(function () { armar(); if (++n > 40) clearInterval(t); }, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
