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

   ⚠️ LA COLECCIÓN PROPONE SU PALETA, NO LA TRABA.  ← decisión de Maki
      La referencia ES crema y topo; con otra paleta deja de parecerse. Al
      elegir la colección se cambia la paleta sola a la que le corresponde,
      pero Jazmín puede cambiarla después: el selector de paletas sigue
      andando. Sólo se le avisa que puede romper el diseño.
      ⚠️ NO se pisa una paleta ya elegida sin avisar: si la invitación ya
         tenía una, se pregunta antes de cambiarla.

   ⚠️ NO GUARDARSE `D.fx` AL CONSTRUIR.  ← bug real, ya pasó con panel-motivo
      El bloque se arma a los ~500 ms, ANTES de que cargue el evento. Cuando el
      evento llega, el panel REEMPLAZA `D.fx` por el objeto de Firestore y
      cualquier referencia guardada antes queda apuntando a un objeto huérfano:
      los selectores se mueven, la vista previa se refresca… y no guarda nada.
      Parece andar y no anda. Por eso `datos()` se llama de nuevo adentro de
      cada `onchange`, y los selectores se re-sincronizan desde `D` mientras el
      usuario no los haya tocado.

   ⚠️ PARA APAGAR SE GUARDA `''`, NO SE BORRA LA CLAVE.
      `INV.saveEvento` guarda con merge: borrar la clave del borrador NO la
      borra en Firestore y la colección "no se apaga".

   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
      Misma nota en panel-fondo.js, panel-pieza.js, panel-rsvp.js, panel-motivo.js.
   ============================================================================ */
(function () {

  var ID = 'coleccion-selector';

  /* El catálogo. Cada entrada nueva de /colecciones/ se suma acá. */
  var COLECCIONES = [
    { id: '',       nombre: 'Sin colección',
      paleta: null,
      ayuda: 'La invitación queda como está, con la tipografía de siempre.' },
    { id: 'perlas', nombre: 'Perlas',
      paleta: 'cafe-caramelo',
      ayuda: 'Serif fina en mayúsculas con la cursiva debajo, mucho aire, ' +
             'bandas crema y topo, y un hilo de perlas de verdad que recorre todo.' }
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

    var aviso = document.createElement('div');
    aviso.style.cssText = 'font-size:11px;line-height:1.4;margin-top:7px;padding:7px 9px;' +
      'border-radius:7px;background:rgba(190,150,60,.12);display:none';
    caja.appendChild(aviso);

    sel.onchange = function () {
      var fx = datos(); if (!fx) return;
      caja.dataset.tocado = '1';

      var c = deId(sel.value);
      fx.coleccion = c.id;                 /* ⚠️ vacío, NO borrar la clave */

      aviso.style.display = 'none';
      if (c.paleta) {
        if (!fx.paleta || fx.paleta === c.paleta) {
          fx.paleta = c.paleta;            /* no había ninguna: se pone la suya */
        } else {
          /* ya tenía una elegida: NO se pisa sin avisar */
          aviso.innerHTML = 'Esta colección está diseñada para la paleta ' +
            '<b>Café y caramelo</b>, y esta invitación tiene otra. ' +
            'Podés dejarla así, pero puede no verse como la muestra. ' +
            '<u style="cursor:pointer" id="col-usar-paleta">Usar la paleta de la colección</u>';
          aviso.style.display = 'block';
          var u = aviso.querySelector('#col-usar-paleta');
          if (u) u.onclick = function () {
            var f2 = datos(); if (!f2) return;
            f2.paleta = c.paleta;
            aviso.style.display = 'none';
            refrescar();
          };
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
