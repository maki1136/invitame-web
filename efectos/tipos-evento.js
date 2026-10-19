/* ===== LOS TIPOS DE EVENTO, PARA TODAS LAS VERSIONES DEL MOTOR ================

   Pedido de Maki (19/10/2026): muestras de baby shower, graduación y
   corporativo, además de los kids, bautizos, comuniones y cumples.

   EL PROBLEMA
   La tabla de tipos vive en el motor (i/index.html, «Adaptar textos según el
   tipo de evento») y el motor está CONGELADO POR VERSIÓN (i/v/<fecha>/). Un
   tipo que no está en esa tabla cae en BODA (`L[t]||L.boda`): un baby shower
   decía «Nuestros Padres» y «¿Cuánto conoces a la pareja?». Y las versiones
   viejas ni siquiera publican `window.INVTIPO`.

   QUÉ HACE ESTE MÓDULO
   · Publica `window.INVTIPOS` (LA tabla, con los tres nuevos) y
     `window.invTipoDe(ev)` (normaliza lo que haya en `ev.tipoEvento`).
   · En la invitación: completa `window.INVTIPO = {tipo, de, tv}` y reescribe
     #padres-kick, #padres-h2 y #tv-bajada igual que el motor. Respeta lo que
     se cargó a mano (`padresKick` / `padresTitulo`).
   · Marca el html con `data-tipo-evento="<tipo>"` (sirve a las colecciones).
   · CORPORATIVO: la trivia y el filtro van APAGADOS por defecto. Se prenden
     sólo con las casillas del panel (fx.corporativo.trivia / .filtro), que
     aparecen debajo de «Tipo de evento:» cuando se elige corporativo.
   · En el panel: el selector «Tipo de evento:» ofrecía «Cumple XV»,
     «InvitameKids» y «Empresarial», que el motor NO entiende (caían en boda).
     Se rearma con los valores reales. Los valores viejos se siguen leyendo
     (ver ALIAS) para no romper ninguna invitación ya cargada.

   ⚠️ Lo que se escribe desde JS NO pasa por i/textos-es-mx.php: va en mexicano.
   ============================================================================ */
(function () {
  'use strict';

  /* pk = bajada de Personas · ph = título de Personas
     de = cómo se nombra el evento en una frase · tv = a quién conocen en la trivia */
  var T = {
    boda:        { n: 'Boda',             pk: 'Nosotros',     ph: 'Nuestros Padres',        de: 'la boda',         tv: 'a la pareja' },
    xv:          { n: 'XV años',          pk: 'Con cariño',   ph: 'Mis Padres y Padrinos',  de: 'los XV',          tv: 'a la quinceañera' },
    bautismo:    { n: 'Bautizo',          pk: 'Mi familia',   ph: 'Mis Padres y Padrinos',  de: 'el bautizo',      tv: 'a la familia' },
    comunion:    { n: 'Primera comunión', pk: 'Mi familia',   ph: 'Mis Padres',             de: 'la comunión',     tv: 'a la familia' },
    cumple:      { n: 'Cumpleaños',       pk: 'Los míos',     ph: 'Mi Familia',             de: 'el cumple',       tv: 'al festejado' },
    babyshower:  { n: 'Baby shower',      pk: 'Con amor',     ph: 'Nuestra Familia',        de: 'el baby shower',  tv: 'a los papás' },
    graduacion:  { n: 'Graduación',       pk: 'Con orgullo',  ph: 'Mi Familia',             de: 'la graduación',   tv: 'al graduado' },
    corporativo: { n: 'Corporativo',      pk: 'Anfitriones',  ph: 'Quiénes nos acompañan',  de: 'el evento',       tv: '' },
    otro:        { n: 'Otro evento',      pk: 'Nosotros',     ph: 'Los Nuestros',           de: 'la fiesta',       tv: 'a los anfitriones' }
  };
  var ORDEN = ['boda', 'xv', 'cumple', 'bautismo', 'comunion', 'babyshower', 'graduacion', 'corporativo', 'otro'];

  /* lo que escribía el selector viejo del panel, y variantes sueltas */
  var ALIAS = {
    'cumple xv': 'xv', 'xv anos': 'xv', 'xv años': 'xv', 'quince': 'xv', 'quinceanera': 'xv',
    'invitamekids': 'cumple', 'kids': 'cumple', 'cumpleanos': 'cumple', 'cumpleaños': 'cumple',
    'empresarial': 'corporativo', 'empresa': 'corporativo',
    'bautizo': 'bautismo', 'comunión': 'comunion', 'primera comunion': 'comunion',
    'baby shower': 'babyshower', 'baby-shower': 'babyshower',
    'graduación': 'graduacion', 'egresados': 'graduacion'
  };

  function norm(v) {
    var t = String(v == null ? '' : v).trim().toLowerCase();
    if (!t) return 'boda';                 /* igual que el motor: vacío = boda */
    if (T[t]) return t;
    if (ALIAS[t]) return ALIAS[t];
    return 'otro';
  }
  function tipoDe(ev) { ev = ev || {}; return norm(ev.tipoEvento || ev.tipo); }

  window.INVTIPOS = T;
  window.INVTIPOS_ORDEN = ORDEN;
  window.invTipoDe = tipoDe;
  window.invTipoNorm = norm;

  function siNo(v) { return v === true || /^(true|si|sí|1)$/i.test(String(v)); }

  /* ======================= EN LA INVITACIÓN ======================= */
  function enInvitacion() {
    var ev = window.INVEV;
    if (!ev || !document.getElementById('padres-kick') && !document.querySelector('.frame')) return;
    var t = tipoDe(ev), c = T[t];
    var I = window.INVTIPO;
    if (!I || I.tipo !== t || I.de !== c.de || I.tv !== c.tv) window.INVTIPO = { tipo: t, de: c.de, tv: c.tv };

    var H = document.documentElement;
    if (H.getAttribute('data-tipo-evento') !== t) H.setAttribute('data-tipo-evento', t);

    var pk = document.getElementById('padres-kick'), ph = document.getElementById('padres-h2');
    var qk = String(ev.padresKick || '').trim() || c.pk;
    var qh = String(ev.padresTitulo || '').trim() || c.ph;
    if (pk && pk.textContent !== qk) pk.textContent = qk;
    if (ph && ph.textContent !== qh) ph.textContent = qh;

    if (t !== 'boda') {
      var tb = document.getElementById('tv-bajada');
      var q = c.tv ? ('¿Cuánto conoces ' + c.tv + '? Agrega puntos y entra al ranking.')
                   : 'Responde las preguntas, agrega puntos y entra al ranking.';
      if (tb && tb.textContent !== q) tb.textContent = q;
    }

    /* corporativo: trivia y filtro apagados salvo que el panel los prenda */
    var corp = (ev.fx && ev.fx.corporativo) || {};
    var esCorp = t === 'corporativo';
    var conTriv = !esCorp || siNo(corp.trivia), conFil = !esCorp || siNo(corp.filtro);
    if (H.hasAttribute('data-corp-sin-trivia') !== !conTriv) {
      if (conTriv) H.removeAttribute('data-corp-sin-trivia'); else H.setAttribute('data-corp-sin-trivia', '');
    }
    if (H.hasAttribute('data-corp-sin-filtro') !== !conFil) {
      if (conFil) H.removeAttribute('data-corp-sin-filtro'); else H.setAttribute('data-corp-sin-filtro', '');
    }
    if (!document.getElementById('tipos-evento-css')) {
      var st = document.createElement('style');
      st.id = 'tipos-evento-css';
      st.textContent =
        'html[data-corp-sin-trivia] .frame [data-sec="trivia"]{display:none!important}' +
        'html[data-corp-sin-filtro] .frame #filtro-sec{display:none!important}';
      (document.head || document.documentElement).appendChild(st);
    }
  }

  /* ======================= EN EL PANEL ======================= */
  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  function rotulo(k, def) {
    var R = window.INV_ROTULOS_FX || {};
    return R[k] || def;
  }

  function enPanel() {
    var d = borrador();
    if (!d) return;
    var sel = document.querySelector('#panel select[oninput*="tipoEvento"]') ||
              document.getElementById('f-tipo-de-evento');
    if (!sel) return;
    var actual = tipoDe(d);
    if (sel.dataset.tiposNuevos !== '1') {
      sel.innerHTML = '';
      ORDEN.forEach(function (k) {
        var o = document.createElement('option');
        o.value = k; o.textContent = T[k].n;
        sel.appendChild(o);
      });
      sel.dataset.tiposNuevos = '1';
      sel.addEventListener('change', function () {
        var b = borrador(); if (!b) return;
        b.tipoEvento = sel.value;
        caja();
        refrescar();
      });
    }
    /* el valor guardado puede ser viejo («Cumple XV»): se muestra el real */
    if (document.activeElement !== sel && sel.value !== actual) sel.value = actual;
    caja();
  }

  /* las dos casillas del corporativo, debajo del selector */
  function caja() {
    var d = borrador(); if (!d) return;
    var sel = document.querySelector('#panel select[oninput*="tipoEvento"]') ||
              document.getElementById('f-tipo-de-evento');
    if (!sel) return;
    var grp = sel.closest('.grp') || sel.parentNode;
    var box = document.getElementById('tipo-corp-ajustes');
    var esCorp = tipoDe(d) === 'corporativo';
    if (!esCorp) { if (box) box.remove(); return; }
    if (!box) {
      box = document.createElement('div');
      box.id = 'tipo-corp-ajustes';
      box.style.cssText = 'margin:-4px 0 14px;padding:10px 12px;border:1px dashed rgba(0,0,0,.18);border-radius:10px;font-size:12px';
      box.innerHTML = '<div style="font-weight:700;margin-bottom:4px"></div>' +
        '<div style="opacity:.62;font-size:11px;margin-bottom:6px;line-height:1.35">' +
        'En un evento corporativo la trivia y el filtro arrancan apagados. Prenderlos sólo si el cliente los pidió.</div>' +
        '<label style="display:flex;gap:8px;align-items:center;cursor:pointer;margin:3px 0"><input type="checkbox" data-k="trivia"> <span></span></label>' +
        '<label style="display:flex;gap:8px;align-items:center;cursor:pointer;margin:3px 0"><input type="checkbox" data-k="filtro"> <span></span></label>';
      box.firstChild.textContent = rotulo('corporativo', 'Evento corporativo');
      var spans = box.querySelectorAll('label span');
      spans[0].textContent = rotulo('corporativo.trivia', 'Mostrar la trivia');
      spans[1].textContent = rotulo('corporativo.filtro', 'Mostrar el filtro de la fiesta');
      [].forEach.call(box.querySelectorAll('input'), function (i) {
        i.onchange = function () {
          var b = borrador(); if (!b) return;
          b.fx = b.fx || {};
          b.fx.corporativo = b.fx.corporativo || {};
          b.fx.corporativo[i.getAttribute('data-k')] = i.checked;
          refrescar();
        };
      });
      grp.parentNode.insertBefore(box, grp.nextSibling);
    }
    var corp = (d.fx && d.fx.corporativo) || {};
    [].forEach.call(box.querySelectorAll('input'), function (i) {
      var v = siNo(corp[i.getAttribute('data-k')]);
      if (i.checked !== v) i.checked = v;
    });
  }

  function tic() {
    try { enInvitacion(); } catch (e) {}
    try { enPanel(); } catch (e) {}
  }
  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    tic();
    addEventListener('message', function () { setTimeout(tic, 120); });
    var n = 0, t = setInterval(function () {
      tic();
      if (++n > 40) { clearInterval(t); setInterval(tic, 1500); }
    }, 400);
  }
  arrancar();
})();
