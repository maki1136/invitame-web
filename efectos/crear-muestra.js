/* ===== EL MODELO ELEGIDO, EN EL FORMULARIO DEL CLIENTE =========================

   QUE HACE
   En /crear.html, arriba de todo, hay un cartel que dice "Modelo elegido" con un
   circulito de color y un nombre. Ese nombre salia de una tabla de CINCO temas
   escrita adentro de crear.html: cualquier modelo que no estuviera en esa tabla
   caia en "Boho". O sea que si el cliente elegia "Perlas", leia "Boho" y se
   asustaba con razon.

   Este modulo lee /muestras/catalogo.js --la lista de verdad-- y escribe el
   nombre, la bajada, la paleta y un link para ver la muestra.

   /!\ POR QUE NO SE ARREGLA EN crear.html
   crear.html pesa 50 KB. La herramienta con la que subo archivos al repo tiene
   un techo medido de ~45 KB por llamada: tocar ese archivo obliga a reescribirlo
   entero, con riesgo de subirlo cortado. Lo carga /firebase-inv.js, que si es
   chico, y por ahi entra este modulo.

   /!\ EL ID VIAJA EN `tpl`
   No se inventa un campo nuevo: el formulario ya guardaba `tpl` con el modelo
   elegido. `catalogo.html` manda `?tpl=perlas` y el formulario lo guarda solo en
   la solicitud. Del otro lado, `/efectos/panel-solicitud-muestra.js` lo lee y
   clona el diseno.

   /!\ NO TOCA NINGUN DATO
   Solo reescribe el cartel. Si el catalogo no cargo o el id no existe, se va sin
   hacer nada y queda lo que estaba.
   ============================================================================ */
(function () {
  'use strict';

  function elegido() {
    try {
      var p = new URLSearchParams(location.search).get('tpl');
      return String(p || '').toLowerCase();
    } catch (e) { return ''; }
  }

  function pintar() {
    var id = elegido(); if (!id) return true;      /* sin modelo: nada que hacer */
    if (typeof window.muestraDe !== 'function') return false;   /* todavia no cargo */
    var m = window.muestraDe(id); if (!m) return true;          /* id que no conozco */

    var caja = document.getElementById('modelo');
    var nom  = document.getElementById('modelo-nom');
    if (!caja || !nom) return false;

    if (nom.textContent === m.nombre && caja.dataset.muestraLista === '1') return true;

    nom.textContent = m.nombre;

    /* el circulito de color */
    var sw = caja.querySelector('.sw');
    if (sw && m.color) sw.style.background = m.color;

    /* la paleta, la bajada y el link a la muestra: se agregan una sola vez */
    if (caja.dataset.muestraLista !== '1') {
      var col = nom.parentNode;
      if (col && m.bajada) {
        var b = document.createElement('div');
        b.style.cssText = 'font-size:12px;color:var(--muted);margin-top:2px;line-height:1.35';
        b.textContent = m.bajada;
        col.appendChild(b);
      }
      if (col && m.paleta && m.paleta.length) {
        var p = document.createElement('div');
        p.style.cssText = 'display:flex;gap:5px;margin-top:6px';
        m.paleta.forEach(function (c) {
          var i = document.createElement('i');
          i.style.cssText = 'width:15px;height:15px;border-radius:50%;display:block;' +
                            'border:1px solid rgba(0,0,0,.08);background:' + c;
          p.appendChild(i);
        });
        col.appendChild(p);
      }
      /* el "cambiar" ya existe; al lado, ver la muestra de verdad */
      if (m.muestra) {
        var a = document.createElement('a');
        a.href = '/i/?e=' + encodeURIComponent(m.muestra);
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = 'ver la muestra';
        a.style.cssText = 'color:var(--uva,#6D1233);font-weight:800;text-decoration:none;' +
                          'font-size:13px;margin-left:12px';
        var ch = caja.querySelector('.ch');
        if (ch && ch.parentNode) ch.parentNode.insertBefore(a, ch);
        else caja.appendChild(a);
      }
      caja.dataset.muestraLista = '1';
    }
    return true;
  }

  /* crear.html arma el cartel con su propio script: hay que esperarlo */
  var n = 0;
  var t = setInterval(function () {
    var listo = false;
    try { listo = pintar(); } catch (e) { listo = true; }
    if (listo || ++n > 60) clearInterval(t);
  }, 250);
})();
