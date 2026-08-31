/* ===== LOS COLORES DE LA BODA, EN EL PANEL ===================================

   Para que Jazmín arme a mano la paleta de círculos que se muestra en la
   sección de Vestimenta. Lo obedece /efectos/dresscode-colores.js.

   CÓMO FUNCIONA, EN UNA LÍNEA
   Vacío = automáticos (salen de la paleta de la invitación, y sólo se ven si
   está puesta una colección). Con colores cargados = manda esta lista, siempre,
   con colección o sin colección.

   ★★ `fx.paleta` ES UN OBJETO `{id:"..."}`, NO UN TEXTO ★★  ← bug real
      Comparar `fx.paleta === 'salvia-marfil'` NUNCA da verdadero. La primera
      versión hacía eso, no encontraba la paleta, caía en la primera de la lista
      y traía los colores de **Terracota y arena** cuando la invitación tenía
      **Salvia y marfil**. Salía una fila de círculos prolija… del color
      equivocado, que es peor que un error visible.
      → Siempre leer `fx.paleta.id`, y aceptar también el caso texto por si
        alguna invitación vieja lo tiene guardado así.

   ★★ EN EL ADMIN NO SE PUEDEN LEER LAS VARIABLES DE COLOR ★★  ← otro bug real
      La primera versión sacaba los colores de `getComputedStyle` sobre el
      `<html>`, como hace el módulo que dibuja los círculos en la invitación.
      En la INVITACIÓN eso anda: la paleta está aplicada al documento.
      En el ADMIN no: la invitación se dibuja adentro de un iframe de vista
      previa, así que en el documento del panel las variables no existen. El
      botón "Usar los de la paleta" traía UN solo color (`--muted`, la única que
      resolvía) en vez de cinco.
      → En el panel los colores se leen de `window.INVPALETAS`, que es la fuente
        de verdad y sí está disponible acá. La publica `paleta.js`.

   ⚠️ NO SE BORRA LA CLAVE PARA VOLVER A AUTOMÁTICO: SE GUARDA UNA LISTA VACÍA.
      `INV.saveEvento` guarda con merge. Borrar `colores` del borrador NO lo
      borra en Firestore: queda la lista anterior y los círculos "no se apagan".
      Por eso "Volver a los automáticos" escribe `[]`, no hace `delete`.

   ⚠️ NO GUARDARSE `D.fx` AL CONSTRUIR.  ← el bug de siempre
      El bloque se arma a los ~500 ms, ANTES de que cargue el evento. Cuando el
      evento llega, el panel REEMPLAZA `D.fx` por el objeto de Firestore y la
      referencia guardada antes queda huérfana: los controles se mueven, la
      vista previa se refresca… y no guarda nada. Parece andar y no anda.
      Por eso `datos()` se llama de nuevo adentro de cada handler.

   ⚠️ LOS `input type="color"` DEVUELVEN SIEMPRE `#rrggbb`. Al pasar los colores
      de la paleta al selector se normalizan a hex, y eso está bien: a partir de
      ahí son colores propios de esta invitación y ya no siguen a la paleta. Es
      exactamente lo que Jazmín quiere cuando los toca.

   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
      Misma nota en panel-fondo.js, panel-rsvp.js, panel-motivo.js,
      panel-coleccion.js.
   ============================================================================ */
(function () {

  var ID = 'dresscode-selector';
  var MAX = 8;
  /* las cinco claves de una paleta que se usan para vestir: tres de color, una
     neutra y una clara */
  var CLAVES = ['verde', 'sage', 'oro', 'muted', 'cream'];
  var POR_DEFECTO = ['#44513f', '#7d8a72', '#b9a56a', '#6e6058', '#e9e8dd'];

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  /* ⚠️ SIEMPRE fresco: nunca guardar lo que devuelve */
  function datos() {
    var d = borrador();
    if (!d) return null;
    if (!d.fx) d.fx = {};
    if (!d.fx.dresscode) d.fx.dresscode = {};
    return d.fx.dresscode;
  }
  function lista() {
    var dc = datos() || {};
    var c = dc.colores;
    return (Object.prototype.toString.call(c) === '[object Array]') ? c.slice() : [];
  }
  function guardar(arr) {
    var dc = datos(); if (!dc) return;
    dc.colores = arr;          /* ⚠️ [] para volver a automático, NO delete */
    refrescar();
  }

  /* ⚠️ `fx.paleta` es `{id:"..."}`. Ver la nota grande de arriba. */
  function idDePaleta() {
    try {
      var p = ((borrador() || {}).fx || {}).paleta;
      if (!p) return '';
      return (typeof p === 'string') ? p : (p.id || '');
    } catch (e) { return ''; }
  }

  /* Los colores de la paleta elegida, desde INVPALETAS */
  function deLaPaleta() {
    try {
      var id = idDePaleta();
      var todas = window.INVPALETAS || [];
      var p = null, i;
      for (i = 0; i < todas.length; i++) if (todas[i].id === id) { p = todas[i]; break; }
      /* ⚠️ si no se encuentra NO se agarra la primera: daría los colores de otra
         boda. Mejor los neutros por defecto. */
      if (p) {
        var out = [];
        CLAVES.forEach(function (k) {
          var x = (p[k] || '').trim();
          if (x && out.indexOf(x) < 0) out.push(x);
        });
        if (out.length) return out;
      }
    } catch (e) {}

    /* por si algún día esto corre en un documento donde SÍ están las variables */
    try {
      var cs = getComputedStyle(document.documentElement);
      var o2 = [];
      ['--verde', '--sage', '--oro', '--muted', '--cream'].forEach(function (v) {
        var x = (cs.getPropertyValue(v) || '').trim();
        if (x && x.charAt(0) === '#' && o2.indexOf(x) < 0) o2.push(x);
      });
      if (o2.length >= 3) return o2;
    } catch (e) {}

    return POR_DEFECTO.slice();
  }

  function construir() {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';

    var t = document.createElement('div');
    t.textContent = 'Los colores de la boda';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(t);

    var a = document.createElement('div');
    a.textContent = 'Se muestran como círculos en la sección de Vestimenta, ' +
                    'para que los invitados sepan de qué color vestirse.';
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(a);

    var fila = document.createElement('div');
    fila.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:10px';
    caja.appendChild(fila);

    var pie = document.createElement('div');
    pie.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center';
    caja.appendChild(pie);

    var ayuda = document.createElement('div');
    ayuda.style.cssText = 'font-size:11px;opacity:.6;line-height:1.4;margin-top:8px';
    caja.appendChild(ayuda);

    function boton(texto, alTocar) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = texto;
      b.style.cssText = 'font-size:11.5px;padding:5px 10px;border-radius:6px;' +
        'border:1px solid rgba(0,0,0,.18);background:#fff;cursor:pointer';
      b.onclick = function (ev) { ev.preventDefault(); alTocar(); };
      return b;
    }

    function pintar() {
      var arr = lista();
      fila.textContent = '';

      arr.forEach(function (c, i) {
        var env = document.createElement('span');
        env.style.cssText = 'position:relative;display:inline-block;line-height:0';

        var inp = document.createElement('input');
        inp.type = 'color';
        inp.value = c;
        inp.title = 'Color ' + (i + 1);
        inp.style.cssText = 'width:38px;height:38px;padding:0;border:1px solid rgba(0,0,0,.18);' +
          'border-radius:50%;background:none;cursor:pointer;overflow:hidden';
        inp.oninput = function () {
          var l = lista(); l[i] = inp.value; guardar(l);
        };

        var x = document.createElement('button');
        x.type = 'button';
        x.textContent = '×';
        x.title = 'Quitar este color';
        x.style.cssText = 'position:absolute;top:-6px;right:-6px;width:17px;height:17px;' +
          'line-height:15px;padding:0;border-radius:50%;border:1px solid rgba(0,0,0,.2);' +
          'background:#fff;font-size:12px;cursor:pointer';
        x.onclick = function (ev) {
          ev.preventDefault();
          var l = lista(); l.splice(i, 1); guardar(l); pintar();
        };

        env.appendChild(inp);
        env.appendChild(x);
        fila.appendChild(env);
      });

      pie.textContent = '';
      if (arr.length < MAX) {
        pie.appendChild(boton('+ Agregar color', function () {
          var l = lista();
          var sug = deLaPaleta();
          l.push(sug[l.length % sug.length] || '#c8c2b4');
          guardar(l); pintar();
        }));
      }
      pie.appendChild(boton('Usar los de la paleta', function () {
        guardar(deLaPaleta()); pintar();
      }));
      if (arr.length) {
        pie.appendChild(boton('Volver a los automáticos', function () {
          guardar([]);            /* ⚠️ vacío, NO delete: el guardado es con merge */
          pintar();
        }));
      }

      ayuda.textContent = arr.length
        ? 'Estos colores mandan siempre, tenga o no una colección puesta.'
        : 'Automáticos: salen solos de la paleta de la invitación, y se ven ' +
          'cuando hay una colección puesta. Si querés otros, cargalos acá.';
    }

    caja.pintar = pintar;
    pintar();
    return caja;
  }

  function revisar() {
    var d = borrador();
    if (!d) return;
    var m = document.querySelector('.mejoras');
    if (!m) return;

    var caja = document.getElementById(ID);
    if (caja) {
      if (!caja.dataset.tocado && caja.pintar) caja.pintar();
      return;
    }

    /* debajo del bloque de la colección, que es de donde salen los automáticos */
    var ancla = document.getElementById('coleccion-selector') ||
                document.getElementById('paleta-selector');
    caja = construir();
    /* una vez que Jazmín toca algo se deja de repintar solo, para no
       interrumpirla mientras elige */
    caja.addEventListener('input', function () { caja.dataset.tocado = '1'; });
    caja.addEventListener('click', function () { caja.dataset.tocado = '1'; });

    if (ancla && ancla.parentNode === m) m.insertBefore(caja, ancla.nextSibling);
    else m.insertBefore(caja, m.firstChild);
  }

  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) {
      clearInterval(t); setInterval(revisar, 700); revisar();
    }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
