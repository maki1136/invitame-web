/* ===== LA COLECCIÓN, EN EL PANEL =============================================

   El selector con el que Jazmín elige la colección de diseño. Lo obedecen los
   archivos de /colecciones/.

   ⚠️ SE LLAMA "COLECCIÓN". Decisión de Maki (31/8/2026).
      Ni "plantilla" —suena prearmado y barato para la novia— ni "estilo", que
      se confunde con la paleta y con el material de los botones, que están
      justo al lado en este mismo panel. "Colección Perlas" se vende como
      catálogo, que es a dónde va esto.

   ⚠️ VIENE APAGADA. Vacío = "Sin colección" = la invitación de siempre.
      Ninguna invitación ya entregada se entera.

   ★★ LA COLECCIÓN PROPONE, JAZMÍN DISPONE ★★  ← decisión de Maki
      «sí, que Jaz pueda cambiar».
      La colección NUNCA pisa algo que Jazmín ya eligió. Cuando hay conflicto,
      avisa y ofrece el cambio con un clic. Hoy son dos cosas:

      1. LA PALETA. La referencia ES crema y topo; con otra paleta deja de
         parecerse. Si la invitación no tenía paleta, se pone la de la
         colección. Si ya tenía otra, se avisa y se ofrece cambiarla.

      2. LA TIPOGRAFÍA DE LOS NOMBRES. El motor le escribe a los nombres la
         familia y el tamaño EN LÍNEA, desde los campos `nfont` y `nsize`, y un
         estilo en línea le gana a cualquier hoja. Entonces:
         · si `nfont` está vacía, la colección los pone en serif fina y
           mayúsculas, como la referencia;
         · si `nfont` tiene algo elegido, la colección NO toca los nombres.
         Acá se le ofrece a Jazmín vaciar el campo con un clic. Y si después
         quiere volver a la manuscrita, elige la fuente y la colección se hace
         a un lado.

         ⚠️ El tratamiento de los nombres va TODO junto o no va: poner en
            mayúsculas una letra manuscrita queda horrible.

   ★★ `fx.paleta` ES UN OBJETO `{id:"..."}`, NO UN TEXTO ★★  ← bug real
      La primera versión escribía `fx.paleta = 'cafe-caramelo'` y comparaba
      `fx.paleta === c.paleta`. Las dos cosas están mal:
        · la comparación NUNCA daba verdadero, así que a una invitación que ya
          tenía la paleta correcta igual le salía el cartel de conflicto;
        · y al escribir un texto donde el resto del sistema espera un objeto,
          el selector de paletas se quedaba sin poder leer el `id`.
      → Se lee siempre `fx.paleta.id` (aceptando texto por si alguna invitación
        vieja lo tiene así) y se escribe siempre `{ id: '...' }`.

   ⚠️ NO GUARDARSE `D.fx` AL CONSTRUIR.  ← bug real, ya pasó con panel-motivo
      El bloque se arma a los ~500 ms, ANTES de que cargue el evento. Cuando el
      evento llega, el panel REEMPLAZA `D.fx` por el objeto de Firestore y
      cualquier referencia guardada antes queda apuntando a un objeto huérfano:
      los selectores se mueven, la vista previa se refresca… y no guarda nada.
      Parece andar y no anda. Por eso `datos()` se llama de nuevo adentro de
      cada `onchange`.

   ⚠️ PARA APAGAR SE GUARDA `''`, NO SE BORRA LA CLAVE.
      `INV.saveEvento` guarda con merge: borrar la clave del borrador NO la
      borra en Firestore y la colección "no se apaga". Lo mismo vale para
      `nfont`: para devolverle la tipografía a la colección hay que guardar
      `''`, no borrar el campo.

   ⚠️ `nfont` y `nsize` NO viven en `fx`: son campos del evento, al lado de los
      nombres. Por eso se escriben en `D` directo, no en `D.fx`.

   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
      Misma nota en panel-fondo.js, panel-pieza.js, panel-rsvp.js, panel-motivo.js.
   ============================================================================ */
(function () {

  var ID = 'coleccion-selector';

  /* El catálogo. Cada entrada nueva de /colecciones/ se suma acá. */
  var COLECCIONES = [
    { id: '', nombre: 'Sin colección',
      paleta: null, paletaNombre: null,
      ayuda: 'La invitación queda como está, con la tipografía de siempre.' },
    { id: 'perlas', nombre: 'Perlas',
      paleta: 'cafe-caramelo', paletaNombre: 'Café y caramelo',
      ayuda: 'Serif fina en mayúsculas con la cursiva debajo, mucho aire, ' +
             'arcos, la foto en blanco y negro y un hilo de perlas de verdad ' +
             'que recorre todo.' }
  ];

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  /* ⚠️ SIEMPRE fresco: nunca guardar lo que devuelve. Ver la nota de arriba. */
  function datos() {
    var d = borrador();
    if (!d) return null;
    if (!d.fx) d.fx = {};
    return d.fx;
  }
  function deId(id) {
    for (var i = 0; i < COLECCIONES.length; i++) if (COLECCIONES[i].id === id) return COLECCIONES[i];
    return COLECCIONES[0];
  }
  /* ⚠️ `fx.paleta` es `{id:"..."}`. Ver la nota grande de arriba. */
  function idDePaleta(fx) {
    var p = (fx || {}).paleta;
    if (!p) return '';
    return (typeof p === 'string') ? p : (p.id || '');
  }

  function construir() {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';

    var t = document.createElement('div');
    t.textContent = 'Colección de diseño';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(t);

    var a = document.createElement('div');
    a.textContent = 'Cambia toda la invitación de una: tipografía, aire, colores y adornos.';
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(a);

    var lab = document.createElement('label');
    lab.textContent = 'La colección';
    lab.style.cssText = 'display:block;font-size:12px;font-weight:600;margin:0 0 3px';
    caja.appendChild(lab);

    var sel = document.createElement('select');
    sel.style.cssText = 'width:100%;margin-bottom:8px';
    COLECCIONES.forEach(function (c) {
      var op = document.createElement('option');
      op.value = c.id; op.textContent = c.nombre;
      sel.appendChild(op);
    });
    caja.appendChild(sel);

    var ayuda = document.createElement('div');
    ayuda.style.cssText = 'font-size:11px;opacity:.6;line-height:1.4';
    caja.appendChild(ayuda);

    /* los dos avisos: la paleta y la tipografía */
    function hacerAviso() {
      var e = document.createElement('div');
      e.style.cssText = 'font-size:11px;line-height:1.45;margin-top:7px;padding:8px 10px;' +
        'border-radius:7px;background:rgba(190,150,60,.13);display:none';
      caja.appendChild(e);
      return e;
    }
    var avPaleta = hacerAviso();
    var avTipo   = hacerAviso();

    function enlace(e, texto, alTocar) {
      var u = document.createElement('u');
      u.textContent = texto;
      u.style.cssText = 'cursor:pointer;white-space:nowrap';
      u.onclick = alTocar;
      e.appendChild(document.createTextNode(' '));
      e.appendChild(u);
    }

    sel.onchange = function () {
      var d = borrador(); if (!d) return;
      var fx = datos(); if (!fx) return;
      caja.dataset.tocado = '1';

      var c = deId(sel.value);
      fx.coleccion = c.id;                 /* ⚠️ vacío, NO borrar la clave */

      avPaleta.style.display = 'none';
      avTipo.style.display = 'none';

      if (c.id) {
        /* ---- 1. la paleta ---- */
        var actual = idDePaleta(fx);
        if (!actual || actual === c.paleta) {
          fx.paleta = { id: c.paleta };    /* ⚠️ objeto, no texto */
        } else {
          avPaleta.textContent = 'Esta colección está diseñada para la paleta ' +
            c.paletaNombre + ', y esta invitación tiene otra. Podés dejarla así, ' +
            'pero puede no verse como la muestra.';
          enlace(avPaleta, 'Usar la paleta de la colección', function () {
            var f2 = datos(); if (!f2) return;
            f2.paleta = { id: c.paleta };
            avPaleta.style.display = 'none';
            refrescar();
          });
          avPaleta.style.display = 'block';
        }

        /* ---- 2. la tipografía de los nombres ----
           No se pisa. Se ofrece. Ver la nota grande de arriba. */
        if (d.nfont && String(d.nfont).trim()) {
          avTipo.textContent = 'Los nombres tienen una tipografía elegida a mano, ' +
            'así que la colección no los toca. En la muestra van en serif fina y ' +
            'mayúsculas.';
          enlace(avTipo, 'Usar la tipografía de la colección', function () {
            var d2 = borrador(); if (!d2) return;
            d2.nfont = '';                 /* ⚠️ vacío, NO borrar: se guarda con merge */
            d2.nsize = '';
            avTipo.style.display = 'none';
            refrescar();
          });
          avTipo.style.display = 'block';
        }
      }

      pintar(true);
      refrescar();
    };

    /* dibuja el selector y la ayuda según lo que dice HOY el borrador */
    function pintar(soloAyuda) {
      var fx = datos() || {};
      var c = deId(fx.coleccion || '');
      if (!soloAyuda) sel.value = c.id;
      ayuda.textContent = c.ayuda;
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

    /* PRIMERO de todos los bloques: es la decisión que manda sobre las demás */
    caja = construir();
    m.insertBefore(caja, m.firstChild);
  }

  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) {
      clearInterval(t); setInterval(revisar, 700); revisar();
    }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
