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

  /* ★ 3/10/2026 — «LA CARTA LARGA QUEDA DETRÁS DEL BOLSILLO».
     Medido: la hoja se apoya a 172 px del piso de la escena y el bolsillo
     (`.cf-front`) mide 232: los últimos 60 px de la hoja están SIEMPRE metidos en
     el bolsillo. Con 20 px de margen abajo, los dos últimos renglones quedaban
     detrás del frente del sobre (camila: 70 px de texto tapado; paula: 65).
     Y el motor elegía el tamaño de letra (`cf-largo` / `cf-xlargo`) mirando
     `FX.carta.texto`, el campo viejo, no el texto que de verdad se muestra.
     Arreglo, sin tocar el motor congelado:
       1. el tamaño de letra sale del texto que SE VE (título + cuerpo);
       2. el margen de abajo de la hoja = lo que entra en el bolsillo + 14 px,
          medido en vivo (si una colección mueve la hoja o el bolsillo, se adapta).
          La hoja sigue «metida» en el sobre: lo que queda adentro es papel liso;
       3. la escena crece si la hoja ya no entra (como hacía el motor). */
  function acomodarHoja() {
    var hoja = document.querySelector('.cf-letter');
    var caja = document.getElementById('cartafx');
    if (!hoja || !caja) return;
    var h = document.getElementById('cf-titulo'), p = document.getElementById('cf-texto');
    var vis = function (e) { return e && getComputedStyle(e).display !== 'none'; };
    var largo = (vis(h) ? txt(h.textContent).length : 0) + (p ? txt(p.textContent).length : 0);
    hoja.classList.toggle('cf-largo', largo > 210 && largo <= 340);
    hoja.classList.toggle('cf-xlargo', largo > 340);

    var cs = getComputedStyle(hoja);
    if (hoja.__padBase == null) hoja.__padBase = parseFloat(cs.paddingBottom) || 0;
    var frente = caja.querySelector('.cf-front');
    var meter = 0;
    if (frente && getComputedStyle(frente).display !== 'none' && caja.offsetHeight) {
      var cr = caja.getBoundingClientRect(), fr = frente.getBoundingClientRect();
      var arribaFrente = cr.bottom - fr.top;                 /* alto del bolsillo */
      var apoyo = parseFloat(cs.bottom) || 0;                /* dónde se apoya la hoja */
      meter = Math.max(0, arribaFrente - apoyo);
    }
    var pad = Math.max(hoja.__padBase, meter ? meter + 14 : 0);
    if (Math.abs((parseFloat(hoja.style.paddingBottom) || 0) - pad) > 0.5) {
      hoja.style.setProperty('padding-bottom', pad + 'px', 'important');
    }
    var necesita = hoja.offsetHeight + (parseFloat(cs.bottom) || 0) + 30;
    if (necesita > caja.offsetHeight + 1) caja.style.height = Math.ceil(necesita) + 'px';
  }

  function repasar() {
    var e = ev();

    var cuerpo = txt(e.cartaTexto);
    if (cuerpo) {
      var p = document.getElementById('cf-texto');
      if (p) escribirParrafo(p, cuerpo);
    }

    var titulo = txt(e.cartaTitulo);
    var h = document.getElementById('cf-titulo');
    if (titulo) {
      if (h) { escribirTitulo(h, titulo); h.style.removeProperty('display'); }
    } else if (h) {
      /* ★ 3/10/2026 — sin encabezado propio, la hoja repetía el título de la
         sección: «Una carta para ti / Una carta para ti». Si dicen lo mismo,
         el de la hoja no se muestra. */
      var h2 = document.getElementById('cf-h2c');
      var igual = h2 && txt(h2.textContent).toLowerCase() === txt(h.textContent).toLowerCase();
      if (igual) h.style.setProperty('display', 'none', 'important');
      else h.style.removeProperty('display');
    }

    acomodarHoja();

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
