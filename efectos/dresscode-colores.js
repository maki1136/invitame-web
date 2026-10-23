/* ===== LOS COLORES DE LA FIESTA, EN CÍRCULOS =================================

   En la sección de Vestimenta, debajo del dibujo del traje, aparece una fila de
   círculos con los colores de la fiesta. Sale de la referencia que mandó Maki:
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
      combinan. Una lista escrita a mano acá se desincronizaría de las 20
      paletas en cuanto alguien tocara algo.

      ⚠️ Esto anda porque acá estamos DENTRO de la invitación, donde la paleta
         está aplicada al documento. En el ADMIN no se puede: la invitación se
         dibuja en un iframe, así que `panel-dresscode.js` los saca de
         `window.INVPALETAS`. Son dos caminos distintos a propósito.

   ⚠️ EL TÍTULO TAMBIÉN LO DECIDE JAZMÍN  →  `fx.dresscode.titulo`
      · sin definir  → "Los colores de la fiesta"
      · con texto    → ese texto
      · vacío ('')   → sin título, sólo los círculos
      Estaba fijo en el código y era justamente lo que no hay que hacer: si no
      se puede tocar desde el panel, para Jazmín no existe.

      ⚠️⚠️ Y EL DEFECTO DECÍA «DE LA BODA», QUE MIENTE EN LA MITAD DE LOS CASOS.
         Encontrado el 23/9/2026 armando Victoria, que son XV.
         El motor **no tiene ninguna señal de XV contra boda**: se buscaron
         `esXV`, `esQuince`, `tipoEvento`, `ev.tipo` y `fx.tipo` en el paquete
         entero y no existe ninguna. Cada efecto trae su texto clavado — al lado
         de éste, `fx.neon.bajada` nace en «Mis XV años» — y el que decide
         siempre es Jazmín desde el panel.
         Como no hay nada que consultar, el defecto pasa a ser NEUTRO: «Los
         colores de la fiesta» sirve para una boda y para unos XV. Lo específico
         sigue estando a un campo de distancia, que es donde tiene que estar.
         ⭐ La regla: un texto por defecto que sólo sirve para la mitad de los
            eventos no es un defecto, es un error esperando su turno. Si no hay
            señal para elegir, el defecto se escribe neutro.

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

  /* ★ 15/10/2026 — LOS COLORES A EVITAR (pedido de Jazmín).
     `fx.dresscode.evitar` = lista de colores. Se dibujan en una segunda fila,
     con una raya cruzada, debajo de los sugeridos. Título en
     `fx.dresscode.tituloEvitar` (mismo criterio: sin definir = «Colores a
     evitar», '' = sin título). Se carga desde el formulario del cliente y
     desde el panel (efectos/panel-dresscode.js). Sin lista, no aparece. */
  var TITULO_EVITAR = 'Colores a evitar';
  var ID_CSS = 'inv-dc-colores-css';
  var CLASE  = 'col-dc';
  var TITULO_POR_DEFECTO = 'Los colores de la fiesta';

  /* las variables de la paleta que se usan cuando los colores son automáticos:
     tres de color, una neutra y una clara */
  var DE_LA_PALETA = ['--verde', '--sage', '--oro', '--muted', '--cream'];

  function fx() {
    try { return ((window.INVEV || {}).fx) || {}; } catch (e) { return {}; }
  }

  function coleccionPuesta() {
    return !!document.documentElement.getAttribute('data-coleccion');
  }

  /* ⚠️ vacío ('') significa "sin título", que NO es lo mismo que sin definir */
  function titulo() {
    var d = fx().dresscode || {};
    if (typeof d.titulo === 'string') return d.titulo;
    return TITULO_POR_DEFECTO;
  }

  /* la lista de colores a mostrar, o null si no hay que mostrar nada */
  /* 23/10/2026 — citlalli-y-hedwin-jesus: «quitar "Los colores de la fiesta" y
     los colores… abajo las bolitas con los colores que NO deben llevar».
     `fx.dresscode.soloEvitar` = true → sólo la fila de los colores a evitar,
     sin tachar, al pie de la sección: imagen, texto y abajo las bolitas. */
  function soloEvitar() { return (fx().dresscode || {}).soloEvitar === true; }

  function colores() {
    var d = fx().dresscode || {};
    if (soloEvitar()) return null;
    var c = d.colores;
    if (Object.prototype.toString.call(c) === '[object Array]') {
      c = c.filter(function (x) { return x && String(x).trim(); });
      if (c.length) return c;                       /* los de Jazmín, tal cual */
    }
    if (!coleccionPuesta()) return null;            /* ni colores ni colección */

    /* automáticos: se leen de la paleta que esté puesta AHORA */
    var cs = getComputedStyle(document.documentElement);
    var out = [];
    DE_LA_PALETA.forEach(function (v) {
      var x = (cs.getPropertyValue(v) || '').trim();
      if (x && out.indexOf(x) < 0) out.push(x);
    });
    return out.length ? out : null;
  }

  function evitar() {
    var d = fx().dresscode || {};
    var c = d.evitar;
    if (Object.prototype.toString.call(c) !== '[object Array]') return null;
    c = c.filter(function (x) { return x && String(x).trim(); });
    return c.length ? c : null;
  }
  function tituloEvitar() {
    var d = fx().dresscode || {};
    if (soloEvitar()) return typeof d.tituloEvitar === 'string' ? d.tituloEvitar : '';
    if (typeof d.tituloEvitar === 'string') return d.tituloEvitar;
    return TITULO_EVITAR;
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
    '.' + CLASE + ' .col-dc-no{margin-top:16px}' +
    '.' + CLASE + ' .col-dc-x{position:relative}' +
    '.' + CLASE + ' .col-dc-x::after{content:"";position:absolute;left:3px;right:3px;top:50%;' +
      'height:2px;margin-top:-1px;background:#b0334a;transform:rotate(-45deg);' +
      'box-shadow:0 0 0 1px rgba(255,255,255,.55)}' +
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

  function fila(caja, lista, tit, tachados) {
    if (!lista || !lista.length) return;
    var bloque = document.createElement('div');
    if (tachados) bloque.className = 'col-dc-no';
    if (tit) {                                  /* vacío = sin título */
      var t = document.createElement('div');
      t.className = 'col-dc-tit';
      t.textContent = tit;
      bloque.appendChild(t);
    }
    var f = document.createElement('div');
    f.className = 'col-dc-fila';
    lista.forEach(function (c) {
      var e = document.createElement('span');
      e.className = 'col-dc-c' + (tachados ? ' col-dc-x' : '');
      e.style.background = c;
      f.appendChild(e);
    });
    bloque.appendChild(f);
    caja.appendChild(bloque);
  }

  function poner(lista, tit, ev, titEv) {
    var ancla = document.querySelector('.dc-mono');
    if (!ancla) return;

    /* si ya está puesto igual, no se toca nada */
    var firma = (soloEvitar() ? 'S§' : '') + tit + '§' + (lista || []).join('|') + '§' + titEv + '§' + (ev || []).join('|');
    var ya = ancla.parentNode.querySelector('.' + CLASE);
    if (ya && ya.dataset.firma === firma) return;
    if (ya) ya.remove();

    var caja = document.createElement('div');
    caja.className = CLASE;
    caja.dataset.firma = firma;

    fila(caja, lista, tit, false);
    fila(caja, ev, titEv, !soloEvitar());

    if (soloEvitar()) {
      /* la imagen arriba del texto, y las bolitas al final de todo eso */
      var tx = document.getElementById('dress-texto'), im = document.getElementById('dress-img');
      if (tx && im && im.style.display !== 'none' && im.nextElementSibling !== tx && tx.parentNode === im.parentNode) {
        im.parentNode.insertBefore(im, tx);
      }
      var ult = (tx && im && im.style.display !== 'none') ? (im.compareDocumentPosition(tx) & 4 ? tx : im) : (tx || ancla);
      ult.parentNode.insertBefore(caja, ult.nextSibling);
      caja.style.marginTop = '16px';
    } else {
      ancla.parentNode.insertBefore(caja, ancla.nextSibling);
    }
  }

  function sincronizar() {
    /* ★ 22/10/2026 (Jazmín: «un cliente no los quiere y no tengo opción de
       sacarlos»): `fx.dresscode.sinColores` = true → no se muestran ni los
       colores sugeridos ni los a evitar. Casilla en el panel. */
    if ((fx().dresscode || {}).sinColores === true) { sacar(); return; }
    var lista = colores(), ev = evitar();
    if (!lista && !ev) { sacar(); return; }
    hoja();
    poner(lista, titulo(), ev, tituloEvitar());
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
