/* ===== LOS COLORES DE LA BODA, EN CÍRCULOS ===================================

   En la sección de Vestimenta, debajo del dibujo del traje, aparece una fila de
   círculos con los colores de la boda. Sale de la referencia que mandó Maki:
   ahí el dress code no se explica sólo con palabras, se MUESTRA.

   ⚠️ VIENE APAGADO. Se prende de dos maneras:
      1. Jazmín elige colores a mano en el panel  →  `fx.dresscode.colores`
      2. La Colección Perlas está puesta          →  se arman solos con la paleta
      Sin ninguna de las dos, este archivo no hace absolutamente nada.

   ⚠️ LOS COLORES A MANO LE GANAN A LOS DE LA PALETA. Si Jazmín eligió, se
      respeta lo que eligió y no se toca. Misma regla que en toda la colección:
      la colección propone, Jazmín dispone.

   ⚠️ CUANDO SON AUTOMÁTICOS SE LEEN DE LA PALETA EN VIVO, no de una lista fija.
      Se toman `--verde`, `--sage`, `--oro`, `--muted` y `--cream` del CSS, así
      que si Jazmín cambia la paleta, los círculos cambian solos y siempre
      combinan. Una lista de colores escrita a mano acá se desincronizaría de
      las 20 paletas en cuanto alguien tocara algo.

   ⚠️ DÓNDE VA: enganchado a `.dc-mono`, que es el dibujo del traje de la
      sección de Vestimenta. Es el único elemento confiable para encontrar esa
      sección: los títulos los escribe el cliente y cambian.

   ⚠️ NO REEMPLAZA AL DIBUJO DEL TRAJE. Se pone DEBAJO. El dibujo lo eligió
      alguien y sacarlo sería decidir por Jazmín.

   ⚠️ TEXTO EN ESPAÑOL DE MÉXICO. Lo que escribe un módulo NO pasa por el
      traductor del servidor (`i/textos-es-mx.php`), así que se escribe bien de
      entrada. Nada de "elegí" ni "podés".

   ⚠️ ES DECORACIÓN, NO UN DATO. No toca la confirmación, ni los invitados, ni
      nada que se guarde. `pointer-events:none` y listo.
   ============================================================================ */
(function () {
  'use strict';

  var ID_CSS = 'inv-dc-colores-css';
  var CLASE  = 'col-dc';

  /* las variables de la paleta que se usan cuando los colores son automáticos.
     Son cinco: tres de color, una neutra y una clara. */
  var DE_LA_PALETA = ['--verde', '--sage', '--oro', '--muted', '--cream'];

  function fx() {
    try { return ((window.INVEV || {}).fx) || {}; } catch (e) { return {}; }
  }

  function coleccionPuesta() {
    return !!document.documentElement.getAttribute('data-coleccion');
  }

  /* devuelve la lista de colores a mostrar, o null si no hay que mostrar nada */
  function colores() {
    var d = fx().dresscode || {};
    var c = d.colores;
    if (Object.prototype.toString.call(c) === '[object Array]') {
      c = c.filter(function (x) { return x && String(x).trim(); });
      if (c.length) return c;                       /* los de Jazmín, tal cual */
    }
    if (!coleccionPuesta()) return null;            /* no hay colores ni colección */

    /* automáticos: se leen de la paleta que esté puesta AHORA */
    var cs = getComputedStyle(document.documentElement);
    var out = [];
    DE_LA_PALETA.forEach(function (v) {
      var x = (cs.getPropertyValue(v) || '').trim();
      if (x && out.indexOf(x) < 0) out.push(x);
    });
    return out.length ? out : null;
  }

  var CSS =
    '.' + CLASE + '{margin:22px auto 4px;text-align:center;pointer-events:none}' +
    '.' + CLASE + ' .col-dc-tit{' +
      'font-family:Montserrat,sans-serif;text-transform:uppercase;' +
      'font-size:9.5px;letter-spacing:.24em;padding-left:.24em;' +
      'opacity:.62;margin-bottom:12px}' +
    '.' + CLASE + ' .col-dc-fila{' +
      'display:flex;flex-wrap:wrap;justify-content:center;gap:11px}' +
    '.' + CLASE + ' .col-dc-c{' +
      'width:38px;height:38px;border-radius:50%;display:block;' +
      'box-shadow:inset 0 0 0 1px rgba(255,255,255,.30),' +
        '0 1px 2px rgba(60,50,40,.16),0 5px 12px rgba(60,50,40,.13)}' +
    '@media (max-width:420px){.' + CLASE + ' .col-dc-c{width:33px;height:33px}' +
      '.' + CLASE + ' .col-dc-fila{gap:9px}}';

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) {
      s = document.createElement('style');
      s.id = ID_CSS;
      (document.head || document.documentElement).appendChild(s);
    }
    if (s.textContent !== CSS) s.textContent = CSS;
  }

  function sacar() {
    [].forEach.call(document.querySelectorAll('.' + CLASE), function (e) { e.remove(); });
  }

  function poner(lista) {
    var ancla = document.querySelector('.dc-mono');
    if (!ancla) return;

    /* si ya está puesto con los mismos colores, no se toca nada */
    var firma = lista.join('|');
    var ya = ancla.parentNode.querySelector('.' + CLASE);
    if (ya && ya.dataset.firma === firma) return;
    if (ya) ya.remove();

    var caja = document.createElement('div');
    caja.className = CLASE;
    caja.dataset.firma = firma;

    var t = document.createElement('div');
    t.className = 'col-dc-tit';
    t.textContent = 'Los colores de la boda';   /* español de México */
    caja.appendChild(t);

    var fila = document.createElement('div');
    fila.className = 'col-dc-fila';
    lista.forEach(function (c) {
      var e = document.createElement('span');
      e.className = 'col-dc-c';
      e.style.background = c;
      fila.appendChild(e);
    });
    caja.appendChild(fila);

    ancla.parentNode.insertBefore(caja, ancla.nextSibling);
  }

  function sincronizar() {
    var lista = colores();
    if (!lista) { sacar(); return; }
    hoja();
    poner(lista);
  }

  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    sincronizar();
    addEventListener('message', function () { setTimeout(sincronizar, 80); });
    /* el motor y la colección siguen escribiendo un rato largo */
    var n = 0, t = setInterval(function () {
      sincronizar();
      if (++n > 40) clearInterval(t);
    }, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
