/* ===== MARFIL · LA TINTA EN OTRO COLOR (10/11/2026) ===========================
   Línea Roja · White Swan: la referencia («Opaline» de @on_the_list._) es papel
   marfil con TODA la letra en carmesí. Marfil tiene la tinta clavada en gris
   pardo (#4a4642) a propósito —es su identidad— y la reclama por encima de la
   paleta (window.INVCOLPALETA). Por eso no alcanzaba con elegir otra paleta.

   QUÉ HACE — si fx.estiloSec.marfil.tinta tiene un color:
     · copia la hoja de Marfil (#inv-coleccion-marfil) cambiando SUS tintas por
       la elegida (principal, bajadas, filetes, oscura y acento) y la pone
       DESPUÉS: mismos selectores, mismo !important, gana la última;
     · y le pasa a la paleta las mismas variables (--verde, --muted, --sage…).
   Las bajadas y los filetes salen de mezclar la tinta con el papel, así
   cualquier color queda parejo.
   CÓMO SE PRENDE — panel → PRINCIPAL → «Marfil · color de la tinta».
   ⚠️ Sin color cargado NO HACE NADA: ninguna invitación entregada cambia.
   ⚠️ Sólo con la colección Marfil.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invMarfilTinta) return; window.__invMarfilTinta = 1;

  var ID = 'inv-marfil-tinta';
  var PAPEL = [229, 224, 213];   /* #e5e0d5, el papel de Marfil */
  /* las tintas que Marfil escribe en su hoja */
  var ORIG = { tinta: '#4a4642', tinta2: '#55514b', tinta3: '#b6b0a8', oscura: '#3a3733', acento: '#635c4d', acentoCl: '#cdc5b4' };

  function cfg() {
    try { return (((window.INVEV || {}).fx || {}).estiloSec || {}).marfil || {}; } catch (e) { return {}; }
  }
  function rgb(h) {
    h = String(h || '').trim().replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    if (!/^[0-9a-f]{6}$/i.test(h)) return null;
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }
  function hex(c) { return '#' + c.map(function (x) { return ('0' + Math.round(Math.max(0, Math.min(255, x))).toString(16)).slice(-2); }).join(''); }
  function mezcla(a, b, t) { return [0, 1, 2].map(function (i) { return a[i] * (1 - t) + b[i] * t; }); }

  function tonos(t) {
    var c = rgb(t); if (!c) return null;
    return {
      tinta: hex(c),
      tinta2: hex(mezcla(c, PAPEL, 0.18)),
      tinta3: hex(mezcla(c, PAPEL, 0.62)),
      oscura: hex(mezcla(c, [0, 0, 0], 0.22)),
      acento: hex(mezcla(c, PAPEL, 0.12)),
      acentoCl: hex(mezcla(c, PAPEL, 0.72))
    };
  }

  function reemplazar(txt, T) {
    Object.keys(ORIG).forEach(function (k) {
      txt = txt.split(ORIG[k]).join(T[k]).split(ORIG[k].toUpperCase()).join(T[k]);
    });
    return txt;
  }

  var ultimo = null, paletaPrevia = null;
  function aplicar() {
    var raiz = document.documentElement, st = document.getElementById(ID);
    var T = tonos(cfg().tinta);
    var marfil = raiz.getAttribute('data-coleccion') === 'marfil' && document.getElementById('inv-coleccion-marfil');
    if (!T || !marfil) {
      if (ultimo !== '') {
        if (st) st.textContent = '';
        if (paletaPrevia && window.INVCOLPALETA && window.INVCOLPALETA.__mfTinta) window.INVCOLPALETA = paletaPrevia;
        ultimo = '';
      }
      return;
    }
    var txt = reemplazar(marfil.textContent || '', T);
    if (!st) { st = document.createElement('style'); st.id = ID; }
    /* siempre DESPUÉS de la hoja de Marfil */
    if (st.previousElementSibling !== marfil) marfil.parentNode.insertBefore(st, marfil.nextSibling);
    if (ultimo !== txt) { st.textContent = txt; ultimo = txt; }
    var P = window.INVCOLPALETA;
    if (P && !P.__mfTinta) {
      paletaPrevia = P;
      var N = {}; Object.keys(P).forEach(function (k) { N[k] = P[k]; });
      N['--verde'] = T.tinta; N['--sec-col-v'] = T.tinta; N['--verde2'] = T.oscura;
      N['--muted'] = T.tinta2; N['--sage'] = T.acento; N['--sage-cl'] = T.acentoCl;
      N.__mfTinta = 1;
      window.INVCOLPALETA = N;
    }
  }

  var n = 0, iv = setInterval(function () { aplicar(); if (++n > 40) clearInterval(iv); }, 300);
  addEventListener('message', function () { setTimeout(aplicar, 200); });
  setInterval(aplicar, 500);   /* Marfil vuelve a poner su paleta: se le gana seguido */
})();
