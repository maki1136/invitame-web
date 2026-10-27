/* ===== SECCIONES QUE NO VAN (20/10/2026) ======================================

   Pedido de Jazmín: «en el formulario tiene que estar la opción de omitir
   sectores, como por ejemplo el sector de FILTROS».

   EL DATO: `fx.ocultas = ['filtro', 'trivia', …]` — los nombres de LISTA.
   Lo escriben:
     · el cliente, en el formulario (crear.html → crear-secciones.js →
       solicitud `ocultas` → /solicitud-a-evento.js → fx.ocultas);
     · el equipo, desde el panel: pestaña PRINCIPAL, bloque «Secciones que no
       van» (abajo, en este mismo archivo).
   /vestir.js lo trata como contenido del cliente: la muestra no lo trae ni lo
   pisa (SECCIONES_FX).

   EN LA INVITACIÓN: una hoja con `display:none` para cada sección elegida.
   Corre también en la miniatura (escucha los mensajes del panel).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invSeccionesOcultas) return; window.__invSeccionesOcultas = 1;

  var LISTA = [
    /* 23/10 Jazmín: «que también esté la opción de ocultar la frase larga» */
    ['frase',      'Frase larga',            'section.fraseSec, [data-sec="frase"], #carta-sec .mf-frase'],
    ['itinerario', 'Itinerario',             '[data-sec="itinerario"]'],
    ['hospedaje',  'Hospedaje',              '[data-sec="hospedaje"]'],
    ['dresscode',  'Código de vestimenta',   '[data-sec="dresscode"]'],
    ['padres',     'Personas importantes',   '[data-sec="padres"]'],
    ['galeria',    'Galería de fotos',       '[data-sec="galeria"]'],
    ['regalos',    'Mesa de regalos',        '[data-sec="regalos"]'],
    ['carta',      'La carta',               '[data-sec="carta"]'],
    ['clima',      'El clima',               '[data-sec="clima"]'],
    ['hashtag',    'Hashtag de Instagram',   '[data-sec="hashtag"]'],
    ['video',      'Video',                  '[data-sec="video"]'],
    ['spotify',    'Playlist',               '[data-sec="spotify"]'],
    ['trivia',     'Trivia',                 '[data-sec="trivia"]'],
    /* 26/10 Jazmín: poder sacar el pase / «cantidad de invitados» a mano */
    ['pase',       'Pase del invitado (cantidad de personas)', 'section.pase'],
    ['filtro',     'Filtro de fotos',        '#filtro-sec'],
    ['live',       'Fotos de los invitados', '#gal-seccion'],
    ['contacto',   'Contacto',               '[data-sec="contacto"]'],
    /* 21/10 Jazmín: «hay clientes que sólo quieren confirmar por WhatsApp» */
    ['confirmacion', 'Confirmación (sólo por WhatsApp)', '[data-sec="confirmacion"]']
  ];
  window.INVOCULTAS = { lista: LISTA };

  function limpia(a) {
    var ok = {}; LISTA.forEach(function (x) { ok[x[0]] = 1; });
    return (Array.isArray(a) ? a : []).filter(function (k) { return ok[k]; });
  }

  /* ================= LADO INVITACIÓN ================= */
  var ID_CSS = 'inv-secciones-ocultas';
  var ultima = null;
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var ocultas = limpia(ev.fx && ev.fx.ocultas);
    var firma = ocultas.join(',');
    if (firma === ultima) return;
    ultima = firma;
    var st = document.getElementById(ID_CSS);
    if (!st) { st = document.createElement('style'); st.id = ID_CSS; document.head.appendChild(st); }
    st.textContent = ocultas.map(function (k) {
      var x = LISTA.filter(function (y) { return y[0] === k; })[0];
      return x[2] + '{display:none!important}';
    }).join('\n');
  }

  /* ================= LADO PANEL ================= */
  var ID = 'ocultas-selector';
  function borrador() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function construir(d) {
    var caja = document.createElement('div');
    caja.id = ID;
    var t = document.createElement('div');
    t.textContent = 'Secciones que no van';
    t.style.cssText = 'font-size:13px;font-weight:700;margin-bottom:2px';
    var a = document.createElement('div');
    a.textContent = 'Lo que marques no aparece en la invitación. El cliente también lo puede elegir en el formulario.';
    a.style.cssText = 'font-size:11.5px;opacity:.65;margin-bottom:10px;line-height:1.35';
    caja.appendChild(t); caja.appendChild(a);
    var g = document.createElement('div');
    g.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:6px 12px';
    var actuales = limpia(d.fx && d.fx.ocultas);
    LISTA.forEach(function (x) {
      var l = document.createElement('label');
      l.style.cssText = 'display:flex;align-items:center;gap:7px;font-size:13px;cursor:pointer';
      var c = document.createElement('input'); c.type = 'checkbox'; c.value = x[0];
      c.checked = actuales.indexOf(x[0]) >= 0;
      c.onchange = function () {
        d.fx = d.fx || {};
        var s = limpia(d.fx.ocultas).filter(function (k) { return k !== x[0]; });
        if (c.checked) s.push(x[0]);
        d.fx.ocultas = s;
        if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
      };
      l.appendChild(c); l.appendChild(document.createTextNode(x[1]));
      g.appendChild(l);
    });
    caja.appendChild(g);
    return caja;
  }
  function revisarPanel() {
    var d = borrador(); if (!d) return;
    if (document.getElementById(ID)) return;
    var a = window.invCasa ? window.invCasa(ID) : null;
    if (!a) return;
    a.appendChild(construir(d));
  }

  /* ================= ARRANQUE ================= */
  function esPanel() { return !!borrador() && !/\/i\//.test(location.pathname); }
  function arrancar() {
    if (esPanel()) { setInterval(revisarPanel, 700); revisarPanel(); return; }
    if (!/\/i\//.test(location.pathname)) return;
    aplicar();
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 300);
    window.addEventListener('message', function () { setTimeout(aplicar, 60); setTimeout(aplicar, 500); });
  }
  var i = 0, esperar = setInterval(function () {
    if (window.INVEV || borrador() || ++i > 40) { clearInterval(esperar); arrancar(); }
  }, 250);
})();
