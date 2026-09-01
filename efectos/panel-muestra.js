/* ===== "INVITACIÓN DE MUESTRA", EN EL PANEL ==================================

   El interruptor que hace que la confirmación de asistencia y el pase con QR
   se VEAN funcionando cuando la invitación se abre sin link de invitado.
   Lo obedece /efectos/rsvp-muestra.js.

   POR QUÉ EXISTE
   Maki: «recordate que todos tienen que estar en el panel para que Jazmín lo
   pueda modificar y pueda verlo y funcionando todo».
   Es la misma regla que ya nos costó una vez con el interruptor de la
   confirmación: una función que sólo se prende escribiendo `fx` en la base a
   mano es una función que, para quien usa el panel, NO EXISTE.

   ⚠️ ESTO NO CAMBIA NADA EN LAS INVITACIONES ENTREGADAS.
      El módulo sólo actúa si NO hay link de invitado. En cuanto la invitación
      se abre con el link de un invitado real, manda el invitado: su nombre,
      sus pases y su QR. Por eso dejarlo prendido no rompe nada.

   ⚠️ Y NO GUARDA NADA. El visitante ve el formulario y la respuesta, pero no
      hay a quién anotar. Está dicho en el texto de ayuda del bloque, para que
      Jazmín no crea que le van a llegar confirmaciones desde la muestra.

   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
      Ver la misma nota en panel-rsvp.js, panel-fondo.js y panel-pieza.js.

   ⚠️ NO GUARDARSE `D.fx` AL CONSTRUIR. El bloque se arma a los ~500 ms, antes
      de que llegue el evento; cuando llega, el panel REEMPLAZA `D.fx` y la
      referencia vieja queda huérfana. Por eso `datos()` se vuelve a llamar
      adentro de cada `onchange`.
   ============================================================================ */
(function () {

  var ID = 'muestra-selector';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  function datos(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.muestra) d.fx.muestra = {};
    return d.fx.muestra;
  }

  function titulo(caja, texto, ayuda) {
    var t = document.createElement('div');
    t.textContent = texto;
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(t);
    var a = document.createElement('div');
    a.textContent = ayuda;
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(a);
  }

  function campo(caja, etiqueta, valor, alCambiar, ancho) {
    var fila = document.createElement('div');
    fila.style.cssText = 'margin:0 0 8px' + (ancho ? ';flex:1 1 ' + ancho : '');
    var lab = document.createElement('label');
    lab.textContent = etiqueta;
    lab.style.cssText = 'display:block;font-size:12px;font-weight:600;margin:0 0 3px';
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.value = valor;
    inp.style.cssText = 'width:100%';
    inp.oninput = function () { alCambiar(inp.value); refrescar(); };
    fila.appendChild(lab);
    fila.appendChild(inp);
    caja.appendChild(fila);
    return inp;
  }

  function construir(d) {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';

    titulo(caja, 'Invitación de muestra',
      'Para mostrarle la invitación a alguien que todavía no compró: se ve la ' +
      'confirmación de asistencia y el pase con QR funcionando, con un invitado ' +
      'de ejemplo. Lo que contesten NO se guarda: no hay a quién anotar.');

    /* ---- el interruptor ---- */
    var lin = document.createElement('label');
    lin.style.cssText = 'display:flex;align-items:flex-start;gap:8px;font-size:12.5px;margin:0 0 10px;cursor:pointer';
    var chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.style.cssText = 'margin-top:2px';
    chk.checked = (function () {
      var v = datos(d).rsvp;
      return v === true || String(v) === '1' || /^(si|sí|true)$/i.test(String(v || ''));
    })();
    var sp = document.createElement('span');
    sp.textContent = 'Mostrar la confirmación y el pase aunque no haya link de invitado';
    lin.appendChild(chk);
    lin.appendChild(sp);
    caja.appendChild(lin);

    /* ---- los datos del invitado de ejemplo ---- */
    var sub = document.createElement('div');
    sub.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';

    var m = datos(d);
    campo(sub, 'Nombre de ejemplo', m.nombre || '', function (v) { datos(d).nombre = v; }, '100%');

    var fila2 = document.createElement('div');
    fila2.style.cssText = 'display:flex;gap:8px;width:100%';
    campo(fila2, 'Personas', m.pases || '',  function (v) { datos(d).pases = v; },  '33%');
    campo(fila2, 'Mesa',     m.mesa || '',   function (v) { datos(d).mesa = v; },   '33%');
    campo(fila2, 'Estado',   m.estado || '', function (v) { datos(d).estado = v; }, '33%');
    sub.appendChild(fila2);

    caja.appendChild(sub);

    var pie = document.createElement('div');
    pie.style.cssText = 'font-size:11px;opacity:.6;line-height:1.35';
    caja.appendChild(pie);

    function pintar() {
      sub.style.display = chk.checked ? 'flex' : 'none';
      pie.textContent = chk.checked
        ? 'Si abrís la invitación con el link de un invitado real, esto no se aplica: manda el invitado.'
        : 'Apagado: sin link de invitado, la sección muestra el aviso de siempre.';
    }
    chk.onchange = function () {
      datos(d).rsvp = chk.checked;
      pintar();
      refrescar();
    };
    pintar();

    return caja;
  }

  function revisar() {
    var d = borrador();
    if (!d) return;
    if (document.getElementById(ID)) return;
    var m = document.querySelector('.mejoras');
    if (!m) return;

    /* debajo del bloque de la confirmación, que es de lo que habla */
    var ancla = document.getElementById('rsvp-selector') ||
                document.getElementById('fondo-selector') ||
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
