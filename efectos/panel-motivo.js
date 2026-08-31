/* ===== EL MOTIVO, EN EL PANEL ================================================

   El bloque para prender el hilo de perlas que recorre la invitación, elegir
   cuánto se carga y dónde va. Lo obedece /efectos/motivo.js.

   POR QUÉ EXISTE  ← la regla, no un detalle
   El interruptor de la confirmación ya nos había pasado: estaba hecho y
   andando, pero la única manera de prenderlo era escribir en la base a mano.
   Una función que no se puede tocar desde el panel es una función que NO
   EXISTE para Jazmín ni para el cliente. El motivo nace con su bloque.

   ⚠️ VIENE APAGADO. El valor vacío es "sin motivo": una invitación no se llena
      de perlas porque sí. Se prende cuando la boda lo pide.

   ⚠️ NO GUARDARSE `D.fx.motivo` EN UNA VARIABLE AL CONSTRUIR.  ← bug real
      El bloque se arma a los ~500 ms, ANTES de que termine de cargar el
      evento. Cuando el evento llega, el panel REEMPLAZA `D.fx` por el objeto
      que viene de Firestore, y cualquier referencia guardada antes queda
      apuntando a un objeto huérfano: los selectores se movían, la vista previa
      se refrescaba… y en `D.fx.motivo` no quedaba nada. Se veía andar y no
      guardaba.
      Por eso `datos(D)` se llama DE NUEVO adentro de cada `onchange`, igual
      que en panel-rsvp.js. Y por eso los selectores se re-sincronizan desde
      `D` mientras el usuario no los haya tocado: si la invitación ya tenía el
      motivo prendido, el panel tiene que mostrarlo prendido.

   ⚠️ SÓLO ES DECORACIÓN. No toca textos, ni la confirmación, ni los datos del
      evento. Todo va con `pointer-events:none` y por debajo del texto, así que
      no tapa ni roba clics.

   ⚠️ PARA APAGARLO SE GUARDA `''`, NO SE BORRA LA CLAVE.
      `INV.saveEvento` guarda con merge: borrar la clave del borrador NO la
      borra en Firestore, queda la anterior y el motivo "no se apaga". Hay que
      escribir el vacío.

   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
      Ver la misma nota en panel-fondo.js, panel-pieza.js y panel-rsvp.js.
   ============================================================================ */
(function () {

  var ID = 'motivo-selector';

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
    if (!d.fx.motivo) d.fx.motivo = {};
    return d.fx.motivo;
  }

  function elegir(etiqueta, opciones, alCambiar) {
    var fila = document.createElement('div');
    fila.style.cssText = 'margin:0 0 8px';
    var lab = document.createElement('label');
    lab.textContent = etiqueta;
    lab.style.cssText = 'display:block;font-size:12px;font-weight:600;margin:0 0 3px';
    var sel = document.createElement('select');
    sel.style.cssText = 'width:100%';
    opciones.forEach(function (o) {
      var op = document.createElement('option');
      op.value = o[0]; op.textContent = o[1];
      sel.appendChild(op);
    });
    sel.onchange = function () { alCambiar(sel.value); };
    fila.appendChild(lab);
    fila.appendChild(sel);
    fila.sel = sel;
    return fila;
  }

  function construir() {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';

    var t = document.createElement('div');
    t.textContent = 'Un motivo que recorra la invitación';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(t);

    var a = document.createElement('div');
    a.textContent = 'Un hilo de perlas de verdad que cuelga de la portada, ' +
                    'reemplaza los adornos entre secciones y le da unidad a todo.';
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(a);

    function tocado() { caja.dataset.tocado = '1'; }

    var fJuego = elegir('El motivo',
      [['',       'Sin motivo'],
       ['perlas', 'Un hilo de perlas']],
      function (v) {
        var m = datos(); if (!m) return;
        tocado();
        /* ⚠️ vacío, NO borrar la clave: el guardado es con merge */
        m.juego = v;
        if (v && typeof m.densidad !== 'number') m.densidad = 1;
        if (v && !m.donde) m.donde = 'todo';
        pintar();
        refrescar();
      });
    caja.appendChild(fJuego);

    var fDonde = elegir('Dónde va',
      [['todo',        'En toda la invitación'],
       ['guirnalda',   'Sólo colgando de la portada'],
       ['separadores', 'Sólo entre las secciones']],
      function (v) {
        var m = datos(); if (!m) return;
        tocado(); m.donde = v; refrescar();
      });
    caja.appendChild(fDonde);

    var fDens = elegir('Cuánto',
      [['0.6', 'Discreto'],
       ['1',   'Normal'],
       ['1.4', 'Cargado']],
      function (v) {
        var m = datos(); if (!m) return;
        tocado(); m.densidad = parseFloat(v); refrescar();
      });
    caja.appendChild(fDens);

    var ayuda = document.createElement('div');
    ayuda.style.cssText = 'font-size:11px;opacity:.6;line-height:1.35';
    caja.appendChild(ayuda);

    /* dibuja los selectores según lo que dice HOY el borrador */
    function pintar() {
      var m = datos() || {};
      var prendido = (m.juego === 'perlas');
      fJuego.sel.value = prendido ? 'perlas' : '';
      fDonde.sel.value = m.donde || 'todo';
      fDens.sel.value  = String(typeof m.densidad === 'number' ? m.densidad : 1);
      fDonde.style.display = prendido ? '' : 'none';
      fDens.style.display  = prendido ? '' : 'none';
      ayuda.textContent = prendido
        ? 'Perlas fotografiadas, no dibujadas. Se adaptan al ancho de cada pantalla.'
        : 'La invitación queda como está, con los adornos de siempre.';
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
      /* mientras nadie lo tocó, seguir lo que diga el evento que se cargó */
      if (!caja.dataset.tocado && caja.pintar) caja.pintar();
      return;
    }

    /* último de la fila de decisiones visuales */
    var ancla = document.getElementById('rsvp-selector') ||
                document.getElementById('fondo-selector') ||
                document.getElementById('boton-selector') ||
                document.getElementById('paleta-selector');
    caja = construir();
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
