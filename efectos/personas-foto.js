/* ===== PERSONAS: CON FOTO, SIN FOTO O CON EL ADORNO DEL DISEÑO (20/10/2026) ====

   Pedido de Jazmín: «en el sector de personas, que haya opción de no colocar
   foto, y de colocar una imagen relacionada con el diseño (ese detalle que
   aparece en toda la invitación)».

   El panel (admin/3-evento.js, pestaña PERSONAS) guarda por persona:
     personas[i].modo = 'foto' (o vacío) | 'nada' | 'adorno'
   y una pieza para todas en `fx.personas.adorno`.

   El motor (congelado) pinta cada persona como
     .padres > .p > .av (background-image) + .nm + .rl
   filtrando las que no tienen ni nombre ni foto. Este módulo recorre las
   tarjetas con EL MISMO filtro y:
     · 'nada'   → saca el círculo de esa tarjeta
     · 'adorno' → pone en el círculo `fx.personas.adorno`; si no se subió,
                  la tapa de la raspadita de la colección (`--r3-tapa`), que
                  es la pieza de la temática. Sin ninguna de las dos, queda
                  sin círculo (nunca un círculo vacío).
   Corre también en la miniatura del panel: escucha los mensajes del panel y
   vigila la grilla, porque el motor la vuelve a dibujar en cada cambio.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPersonasFoto) return; window.__invPersonasFoto = 1;
  if (!/\/i\//.test(location.pathname)) return;

  function ev() { return window.INVEV || null; }

  function tapaDeLaColeccion() {
    var el = document.querySelector('.rasp-zona, .scratch-sec, .rasp-3');
    if (!el) return '';
    var v = getComputedStyle(el).getPropertyValue('--r3-tapa').trim();
    var m = v.match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
    return m ? m[1] : '';
  }

  function adorno(e) {
    var a = e && e.fx && e.fx.personas && e.fx.personas.adorno;
    return a || tapaDeLaColeccion();
  }

  var pintando = false;
  function aplicar() {
    var e = ev();
    if (!e || !Array.isArray(e.personas)) return;
    var grid = document.querySelector('[data-sec="padres"] .padres');
    if (!grid) return;
    var lista = e.personas.filter(function (p) { return p && (p.nombre || p.foto); }).slice(0, 12);
    var tarjetas = grid.querySelectorAll(':scope > .p');
    if (!tarjetas.length) return;
    var img = adorno(e);
    pintando = true;
    lista.forEach(function (p, i) {
      var t = tarjetas[i]; if (!t) return;
      var av = t.querySelector('.av'); if (!av) return;
      var modo = p.modo || 'foto';
      if (modo === 'nada' || (modo === 'adorno' && !img)) {
        av.style.setProperty('display', 'none', 'important');
        t.style.alignSelf = 'center';            /* sin círculo, el nombre queda a media altura de los demás */
        t.setAttribute('data-pfoto', 'nada');
      } else if (modo === 'adorno') {
        av.style.removeProperty('display');
        av.style.setProperty('background-image', "url('" + String(img).replace(/'/g, '%27') + "')", 'important');
        av.style.setProperty('background-size', 'cover', 'important');
        av.style.setProperty('background-position', 'center', 'important');
        t.setAttribute('data-pfoto', 'adorno');
      } else {
        av.style.removeProperty('display');
        t.style.alignSelf = '';
        t.removeAttribute('data-pfoto');
      }
    });
    pintando = false;
  }

  var vigilada = null;
  function vigilar() {
    var grid = document.querySelector('[data-sec="padres"] .padres');
    if (!grid || grid === vigilada) return;
    vigilada = grid;
    new MutationObserver(function () { if (!pintando) setTimeout(aplicar, 0); })
      .observe(grid, { childList: true });
  }

  function paso() { vigilar(); aplicar(); }
  var n = 0, t = setInterval(function () { paso(); if (++n > 40) clearInterval(t); }, 300);
  window.addEventListener('message', function () { setTimeout(paso, 80); setTimeout(paso, 600); });
})();
