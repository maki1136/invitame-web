/* ===== LA CARTA DICE LO QUE DICE EL DATO ====================================

   Encontrado el 21/9/2026 armando la muestra Bohemia: **la carta que sale del
   sobre mostraba el mismo texto en TODAS las invitaciones**.

       «Queridos amigos y familia — Hoy queremos compartir con ustedes uno de
        los días más felices de nuestras vidas. Gracias por acompañarnos en
        este camino de amor.»

   Ese párrafo está CLAVADO en el HTML del motor:

       <div class="cf-letter">
         <h4 id="cf-titulo">Queridos amigos y familia</h4>
         <p  id="cf-texto">Hoy queremos compartir…</p>
       </div>

   Y `cartaTexto`, que es el campo donde se escribe la carta de verdad, **no lo
   lee nadie**: medido, aparece 0 veces en `efectos/todo.php` y 0 veces en el
   HTML servido. O sea que el campo existía en la base y no hacía nada.

   ⚠️ POR QUÉ ESTO VA EN /efectos/ Y NO EN EL HTML DEL MOTOR.
      El motor está CONGELADO POR VERSIÓN: `i/index.php` no sirve
      `i/index.html`, sirve `i/v/<version>/index.html`, y hay cinco versiones
      vivas. Un arreglo en el HTML no llega a ninguna invitación ya entregada.
      Lo que sí llega a TODAS es `/efectos/`, `/colecciones/` y
      `i/estilos-servidor.css`.

   ⚠️ NO PISA NADA SI NO HAY DATO. Si `cartaTexto` está vacío queda el texto de
      fábrica, exactamente como hasta hoy. Ninguna invitación entregada cambia.

   LOS CAMPOS
     · `cartaTexto`   → el cuerpo de la carta. Los saltos de línea se respetan.
     · `cartaTitulo`  → el encabezado («Queridos amigos y familia»). Opcional.
     · `cartaPapel`   → el color de la hoja. Opcional.
   Los tres se editan desde el panel (rótulos en `admin/0-claves.js`).

   ⚠️ NADA DE MutationObserver: la invitación muta en bucle (`reglas-duras.js`
      corre con cada cambio de clase del marco). Un repaso cada 1,2 s alcanza.
   ============================================================================ */
(function () {
  'use strict';

  function ev() { try { return window.INVEV || {}; } catch (e) { return {}; } }
  function txt(v) { return (v == null) ? '' : String(v).trim(); }

  /* Los saltos de línea del campo se respetan como saltos de verdad. Se arma
     con nodos, NO con innerHTML: el texto lo escribe una diseñadora y no tiene
     por qué ser HTML válido ni seguro. */
  function escribirParrafo(el, texto) {
    if (el.__cartaTxt === texto) return;      /* ya está: no se toca */
    while (el.firstChild) el.removeChild(el.firstChild);
    var lineas = texto.split(/\r?\n/);
    for (var i = 0; i < lineas.length; i++) {
      if (i) el.appendChild(document.createElement('br'));
      if (lineas[i]) el.appendChild(document.createTextNode(lineas[i]));
    }
    el.__cartaTxt = texto;
  }

  function escribirTitulo(el, texto) {
    if (el.textContent === texto) return;
    el.textContent = texto;
  }

  function repasar() {
    var e = ev();

    var cuerpo = txt(e.cartaTexto);
    if (cuerpo) {
      var p = document.getElementById('cf-texto');
      if (p) escribirParrafo(p, cuerpo);
    }

    var titulo = txt(e.cartaTitulo);
    if (titulo) {
      var h = document.getElementById('cf-titulo');
      if (h) escribirTitulo(h, titulo);
    }

    /* el papel de la hoja. `background-color`, nunca el atajo `background`:
       el atajo borraría la textura que pueda poner una colección. */
    var papel = txt(e.cartaPapel);
    if (papel) {
      var hoja = document.querySelector('.cf-letter');
      if (hoja && hoja.style.backgroundColor !== papel) {
        hoja.style.setProperty('background-color', papel, 'important');
      }
    }
  }

  function arrancar() {
    repasar();
    setInterval(repasar, 1200);
    document.addEventListener('DOMContentLoaded', repasar);
    window.addEventListener('load', repasar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();

  window.INVCARTATEXTO = { repasar: repasar };
})();
