/* ===== EL MOTIVO, EN EL PANEL ================================================

   El bloque para prender el hilo de perlas que recorre la invitación, elegir
   cuánto se carga y dónde va. Lo obedece /efectos/motivo.js.

   POR QUÉ EXISTE  ← la regla, no un detalle
   Una función que no se puede tocar desde el panel es una función que NO
   EXISTE para Jazmín ni para el cliente.

   ⚠️ CADA COSA NUEVA QUE DIBUJE `motivo.js` TIENE QUE APARECER ACÁ.
      Si se dibuja algo y no se suma al selector, a Jazmín le aparece en la
      invitación y no lo puede sacar.

   ★ "DISCRETO" ES EL RECOMENDADO, Y NO ES UNA OPINIÓN
      Maki miró la versión con el motivo completo y descartó dos cosas:
        · la guirnalda de la portada: «se nota que están dibujadas». Repetir
          una misma foto muchas veces y grande se lee como patrón, aunque cada
          perla sea una foto de verdad;
        · las perlas sueltas: «hay perlas desparramadas que pisan los textos».
      Por eso `discreto` (el hilo entre secciones + los corazones) es lo que
      sugiere la Colección Perlas. Las otras opciones siguen ahí, pero la
      ayuda de abajo avisa qué pasó con cada una.

   ⚠️ VIENE APAGADO. El valor vacío es "sin motivo".

   ⚠️ NO GUARDARSE `D.fx.motivo` EN UNA VARIABLE AL CONSTRUIR.  ← bug real
      El bloque se arma a los ~500 ms, ANTES de que cargue el evento. Cuando el
      evento llega, el panel REEMPLAZA `D.fx` y la referencia guardada queda
      huérfana: los selectores se mueven, la vista previa se refresca… y no
      guarda nada. Por eso `datos()` se llama de nuevo adentro de cada
      `onchange`, y los selectores se re-sincronizan mientras nadie los tocó.

   ⚠️ SÓLO ES DECORACIÓN. `pointer-events:none` y por debajo del texto.

   ⚠️ PARA APAGARLO SE GUARDA `''`, NO SE BORRA LA CLAVE: el guardado es con
      merge y borrar la clave del borrador no la borra en Firestore.

   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
   ============================================================================ */
(function () {

  var ID = 'motivo-selector';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  /* ⚠️ SIEMPRE fresco: nunca guardar lo que devuelve. */
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
    a.textContent = 'Un hilo de perlas de verdad entre una sección y otra, que ' +
                    'cierra con dos corazones en la mesa de regalos.';
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
        if (v && !m.donde) m.donde = 'discreto';
        pintar();
        refrescar();
      });
    caja.appendChild(fJuego);

    var fDonde = elegir('Dónde va',
      [['discreto',    'Entre secciones y los corazones (recomendado)'],
       ['separadores', 'Sólo entre las secciones'],
       ['corazones',   'Sólo los corazones del final'],
       ['guirnalda',   'Sólo colgando de la portada'],
       ['todo',        'Todo, incluidas las perlas sueltas']],
      function (v) {
        var m = datos(); if (!m) return;
        tocado(); m.donde = v; pintar(); refrescar();
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
    ayuda.style.cssText = 'font-size:11px;opacity:.6;line-height:1.4';
    caja.appendChild(ayuda);

    var DONDE = {
      'discreto':    'El hilo que separa una sección de otra y los dos corazones ' +
                     'del final. Es lo que mejor quedó.',
      'separadores': 'Sólo el hilo que reemplaza los adornos entre secciones.',
      'corazones':   'Sólo los dos corazones de perlas, al final de la mesa de regalos.',
      'guirnalda':   'El collar colgando de la portada. Ojo: repetida y grande, la ' +
                     'perla se empieza a notar dibujada.',
      'todo':        'Todo junto. Ojo: las perlas sueltas se ubican solas y pueden ' +
                     'quedar encima de los textos.'
    };

    /* dibuja los selectores según lo que dice HOY el borrador */
    function pintar() {
      var m = datos() || {};
      var prendido = (m.juego === 'perlas');
      fJuego.sel.value = prendido ? 'perlas' : '';
      fDonde.sel.value = m.donde || 'discreto';
      fDens.sel.value  = String(typeof m.densidad === 'number' ? m.densidad : 1);
      fDonde.style.display = prendido ? '' : 'none';
      fDens.style.display  = prendido ? '' : 'none';
      ayuda.textContent = prendido
        ? (DONDE[m.donde || 'discreto'] || DONDE.discreto) +
          ' Son perlas fotografiadas, y se adaptan al ancho de cada pantalla.'
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
      if (!caja.dataset.tocado && caja.pintar) caja.pintar();
      return;
    }

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
