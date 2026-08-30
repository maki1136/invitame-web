/* ===== EL ESTILO DE LA CONFIRMACIÓN, EN EL PANEL ==============================

   El selector para elegir cómo se ve el "¿venís o no?": el interruptor nuevo o
   los dos botones de siempre. Lo obedece /efectos/rsvp-interruptor.js.

   POR QUÉ EXISTE  ← y es el motivo de fondo, no un detalle
   El interruptor estaba hecho y andando, pero la ÚNICA manera de prenderlo o
   apagarlo era escribir `fx.rsvp.estilo` en la base a mano, desde la consola.
   O sea: servía para quien programa, no para quien usa el panel. Una función
   que no se puede tocar desde el panel es una función que no existe.

   ⚠️ EL INTERRUPTOR VIENE ENCENDIDO POR DEFECTO.
      Decisión de Maki. Por eso acá el valor vacío significa "interruptor", y
      para volver a los dos botones hay que elegirlo expresamente. Cambiar el
      default sin cambiar este texto deja el panel mintiendo.

   ⚠️ ESTO TOCA LA CONFIRMACIÓN, QUE ES POR DONDE ENTRA LA PLATA.
      El selector sólo cambia cómo SE VE. Las dos opciones terminan llamando al
      mismo botón original del motor, con las mismas validaciones. Ninguna de
      las dos habla con la base por su cuenta.

   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
      Ver la misma nota en panel-fondo.js y panel-pieza.js.
   ============================================================================ */
(function () {

  var ID = 'rsvp-selector';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  function datos(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.rsvp) d.fx.rsvp = {};
    return d.fx.rsvp;
  }

  function construir(d) {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';

    var t = document.createElement('div');
    t.textContent = 'Cómo se confirma la asistencia';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(t);

    var a = document.createElement('div');
    a.textContent = 'Sólo cambia cómo se ve. Las dos opciones confirman igual.';
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(a);

    var sel = document.createElement('select');
    sel.style.cssText = 'width:100%';
    [['interruptor', 'Un interruptor (por defecto)'],
     ['botones',     'Los dos botones de siempre']].forEach(function (o) {
      var op = document.createElement('option');
      op.value = o[0]; op.textContent = o[1];
      sel.appendChild(op);
    });
    /* vacío = interruptor: es el default */
    sel.value = (datos(d).estilo === 'botones') ? 'botones' : 'interruptor';
    sel.onchange = function () {
      datos(d).estilo = sel.value;
      refrescar();
      ayuda.textContent = texto(sel.value);
    };

    var fila = document.createElement('div');
    fila.style.cssText = 'margin:0 0 8px';
    var lab = document.createElement('label');
    lab.textContent = 'El estilo';
    lab.style.cssText = 'display:block;font-size:12px;font-weight:600;margin:0 0 3px';
    fila.appendChild(lab);
    fila.appendChild(sel);
    caja.appendChild(fila);

    function texto(v) {
      return (v === 'botones')
        ? 'Dos botones: "Sí, asistiré" y "No podré".'
        : 'Una pastilla chiquita que se corre de un lado al otro. Arranca al medio, sin respuesta dada.';
    }
    var ayuda = document.createElement('div');
    ayuda.textContent = texto(sel.value);
    ayuda.style.cssText = 'font-size:11px;opacity:.6;line-height:1.35';
    caja.appendChild(ayuda);

    return caja;
  }

  function revisar() {
    var d = borrador();
    if (!d) return;
    if (document.getElementById(ID)) return;
    var m = document.querySelector('.mejoras');
    if (!m) return;

    /* debajo del bloque del fondo, que es la decisión anterior */
    var ancla = document.getElementById('fondo-selector') ||
                document.getElementById('boton-selector') ||
                document.getElementById('paleta-selector');
    var caja = construir(d);
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
