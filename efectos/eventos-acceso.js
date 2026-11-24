/* ===== DÓNDE Y CUÁNDO: TEXTOS DE LOS BOTONES Y FECHA GRANDE · CONFIRMACIÓN SIN FORMULARIO (23/11/2026)
   Jazmín, «Promo 2026» (CIERG):
     · «En el botón que dice VER MAPA me gustaría que diga CÓMO LLEGAR, y abajo
       en otro botón, en vez de AGENDAR, que diga AGENDAR LA FECHA. No me gusta
       que esté un botón al lado del otro sino abajo del otro.»
     · «Que la fecha y la hora se vean más claro y más grande.»
     · «En vez de confirmar asistencia, porque no lo vamos a tener, quiero que
       diga: TU ACCESO A LA FIESTA (Montserrat, en rojo). La pulsera de acceso
       se entregará en la entrada del evento…»

   EL DATO
     fx.estiloSec.eventos = { txtMapa, txtAgendar, apilados, tamFecha, colorFecha }
     fx.estiloSec.confirmacion = { sinRsvp, textoPropio, fuenteTexto }
       (el título se cambia con «CONFIRMAR ASISTENCIA (MENÚ Y TÍTULOS)», y su
        letra, tamaño y color con los controles de diseño de esa sección; el
        color y tamaño del texto, con «Color del texto» / «Tamaño del texto»)
   PANEL: LUGAR_VEST → «Dónde y cuándo · diseño» y CONFIRMACIÓN → «Confirmar
   asistencia · diseño» (panel-estilo-secciones.js).
   ⚠️ Con todo vacío NO HACE NADA: ninguna invitación entregada cambia.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invEventosAcceso) return; window.__invEventosAcceso = 1;
  if (!/^\/i\//.test(location.pathname) && !/[?&]preview=1/.test(location.search)) return;

  function es(k) { try { return (((window.INVEV || {}).fx || {}).estiloSec || {})[k] || {}; } catch (e) { return {}; } }
  function colorOk(c) { c = String(c || '').trim(); return /^#[0-9a-f]{3,8}$/i.test(c) || /^rgba?\(/i.test(c) ? c : ''; }
  var pedidas = {};
  function pedirFuente(f) {
    f = String(f || '').trim(); if (!f || pedidas[f]) return; pedidas[f] = 1;
    try { if (typeof window.cargarFont === 'function') { window.cargarFont(f); return; } } catch (e) {}
    var l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(f).replace(/%20/g, '+') + ':wght@400;600;700&display=swap';
    document.head.appendChild(l);
  }
  function hoja(id, css) {
    var s = document.getElementById(id);
    if (!css) { if (s) s.remove(); return; }
    if (!s) { s = document.createElement('style'); s.id = id; (document.head || document.documentElement).appendChild(s); }
    if (s.textContent !== css) s.textContent = css;
  }

  /* ---------- Dónde y cuándo ---------- */
  var ES_FECHA = /\d{1,2}[:.]\d{2}|\bhs\b|\bhrs?\b|\b\d{1,2}\s*(a\.?\s?m|p\.?\s?m)|\b(ene|feb|mar|abr|may|jun|jul|ago|sep|set|oct|nov|dic)[a-z]*\b|\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b/i;

  function eventos() {
    var c = es('eventos');
    var tm = String(c.txtMapa || '').trim(), ta = String(c.txtAgendar || '').trim();
    [].forEach.call(document.querySelectorAll('[data-sec="eventos"] .evento .acc-btn'), function (b) {
      var t = b.firstChild;
      if (!t || t.nodeType !== 3) return;
      if (b.dataset.txtOrig === undefined) b.dataset.txtOrig = t.nodeValue;
      /* sin texto propio no se toca (si no, pisa a otros módulos, p. ej. la traducción de /efectos/bilingue.js) */
      if (!tm && !b.dataset.txtPuesto) return;
      var v = tm ? tm + ' ' : b.dataset.txtOrig;
      if (tm) b.dataset.txtPuesto = '1'; else delete b.dataset.txtPuesto;
      if (t.nodeValue !== v) t.nodeValue = v;
    });
    [1, 2, 3].forEach(function (n) {
      var a = document.getElementById('ev' + n + '-cal'); if (!a) return;
      if (a.dataset.txtOrig === undefined) a.dataset.txtOrig = a.textContent;
      if (!ta && !a.dataset.txtPuesto) return;
      var v = ta || a.dataset.txtOrig;
      if (ta) a.dataset.txtPuesto = '1'; else delete a.dataset.txtPuesto;
      if (a.textContent !== v) a.textContent = v;
    });

    /* la fecha y la hora, en su renglón y más grandes */
    var tam = parseInt(c.tamFecha, 10) || 0, col = colorOk(c.colorFecha);
    [1, 2, 3].forEach(function (n) {
      var a = document.getElementById('ev' + n + '-a'); if (!a) return;
      var hecho = a.querySelector(':scope > .ev-fh');
      if (!tam && !col) {
        if (hecho && a.dataset.fhOrig !== undefined) { a.innerHTML = a.dataset.fhOrig; delete a.dataset.fhOrig; delete a.dataset.fhHecho; }
        return;
      }
      /* si el motor (o los renglones) reescribieron el texto, se vuelve a partir */
      if (hecho && a.dataset.fhHecho === a.innerHTML) {
        hecho.style.fontSize = tam ? tam + 'px' : ''; hecho.style.color = col;
        return;
      }
      /* innerText respeta los <br> y los bloques que pone el motor (textContent los pega: «20:00 hsIslas») */
      var txt = (a.innerText || a.textContent || '').replace(/\r/g, ''); if (!txt.trim()) return;
      var renglones = txt.split('\n'), primero = renglones[0];
      var partes = primero.split(/\s+·\s+/), fecha = [], i = 0;
      while (i < partes.length && ES_FECHA.test(partes[i])) { fecha.push(partes[i]); i++; }
      if (!fecha.length) return;
      var resto = [partes.slice(i).join(' · ')].concat(renglones.slice(1)).join('\n').replace(/^\n+/, '');
      a.dataset.fhOrig = a.innerHTML;
      a.textContent = '';
      var s = document.createElement('span'); s.className = 'ev-fh';
      s.textContent = fecha.join(' · ');
      s.style.cssText = 'display:block;font-weight:700;letter-spacing:.02em;margin:2px 0 4px';
      s.style.fontSize = tam ? tam + 'px' : ''; s.style.color = col;
      if (col) s.style.setProperty('-webkit-text-fill-color', col, 'important');
      a.appendChild(s);
      if (resto) { var r = document.createElement('span'); r.className = 'ev-dir'; r.style.cssText = 'display:block;white-space:pre-line'; r.textContent = resto; a.appendChild(r); }
      a.style.whiteSpace = 'pre-line';
      a.dataset.fhHecho = a.innerHTML;
    });

    hoja('inv-ev-apilados', c.apilados
      ? '[data-sec="eventos"] .evento .btnrow{display:flex!important;flex-direction:column!important;align-items:center!important;gap:10px!important}' +
        '[data-sec="eventos"] .evento .btnrow>.btn{width:min(100%,280px)!important;margin:0!important;justify-content:center!important;text-align:center!important}'
      : '');
  }

  /* ---------- Confirmación sin formulario ---------- */
  function confirmacion() {
    var c = es('confirmacion'), sec = document.querySelector('[data-sec="confirmacion"]');
    if (!sec) return;
    var sin = c.sinRsvp === true || c.sinRsvp === 'true';
    var txt = String(c.textoPropio || '').trim();
    var p = document.getElementById('cf-propio');
    if (!sin) {
      if (sec.hasAttribute('data-sin-rsvp')) sec.removeAttribute('data-sin-rsvp');
      if (p) p.remove();
      hoja('inv-cf-sin', '');
      return;
    }
    sec.setAttribute('data-sin-rsvp', '1');
    /* ⚠️ Disco pone `filter:grayscale(.88)` a la sección entera cuando tiene foto de
       fondo, y eso grisaba también el título: el rojo de «Tu acceso a la fiesta»
       salía marrón. Sin formulario, la sección va sin ese filtro. */
    hoja('inv-cf-sin', '[data-sec="confirmacion"][data-sin-rsvp]>*:not(.kick):not(h2):not(.adorno):not(.inv-banda-deco):not(#cf-propio){display:none!important}' +
      'html body [data-sec="confirmacion"][data-sin-rsvp][data-sin-rsvp]{filter:none!important}');
    if (txt) {
      if (!p) {
        p = document.createElement('p'); p.id = 'cf-propio';
        p.style.cssText = 'white-space:pre-line;max-width:520px;margin:14px auto 0;line-height:1.55;position:relative;z-index:1';
        var h = sec.querySelector(':scope > h2');
        if (h && h.nextSibling) sec.insertBefore(p, h.nextSibling); else sec.appendChild(p);
      }
      if (p.textContent !== txt) p.textContent = txt;
      if (c.fuenteTexto) { pedirFuente(c.fuenteTexto); p.style.fontFamily = "'" + c.fuenteTexto + "', sans-serif"; }
      else p.style.fontFamily = '';
    } else if (p) p.remove();
  }

  function aplicar() { try { eventos(); } catch (e) {} try { confirmacion(); } catch (e) {} }
  var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 400);
  setInterval(aplicar, 2000);
  addEventListener('message', function () { setTimeout(aplicar, 150); setTimeout(aplicar, 800); });
})();
