/* ===== «COMPARTÍ LA INVITACIÓN», EN EL PANEL ===================================
   Pestaña CONFIRMACIÓN (su casa la decide invCasa, en admin/3-evento.js).
   Lo aplica /efectos/compartir.js. Ver el porqué allá.
   ⚠️ `D` NO cuelga de window, y `D.fx` se reemplaza al llegar el evento: por
      eso `datos()` se vuelve a pedir adentro de cada handler.
   ============================================================================ */
(function () {
  var ID = 'compartir-selector';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  function datos() {
    var d = borrador(); if (!d.fx) d.fx = {};
    if (!d.fx.compartir) d.fx.compartir = {};
    return d.fx.compartir;
  }

  function construir() {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';
    var t = document.createElement('div');
    t.textContent = 'Compartí la invitación';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(t);
    var a = document.createElement('div');
    a.textContent = 'La sección con el botón verde para mandar la invitación por WhatsApp. Está cerca del final, arriba de Contacto.';
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(a);

    var fila = document.createElement('label');
    fila.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;margin:0 0 10px;cursor:pointer';
    var chk = document.createElement('input'); chk.type = 'checkbox';
    chk.checked = datos().on !== false;
    fila.appendChild(chk); fila.appendChild(document.createTextNode('Mostrar la sección'));
    caja.appendChild(fila);

    var campos = document.createElement('div');
    [['kick', 'Texto chico de arriba', 'Pasá la voz'],
     ['titulo', 'Título', 'Compartí la invitación'],
     ['frase', 'Frase', 'Ayudanos a que no falte nadie en nuestro gran día.'],
     ['boton', 'Texto del botón', 'Compartir por WhatsApp']].forEach(function (c) {
      var f = document.createElement('div'); f.style.cssText = 'margin:0 0 8px';
      var l = document.createElement('label'); l.textContent = c[1];
      l.style.cssText = 'display:block;font-size:12px;font-weight:600;margin:0 0 3px';
      var i = document.createElement('input'); i.type = 'text'; i.style.cssText = 'width:100%';
      i.placeholder = c[2]; i.value = datos()[c[0]] || '';
      i.oninput = function () { datos()[c[0]] = i.value; refrescar(); };
      f.appendChild(l); f.appendChild(i); campos.appendChild(f);
    });
    caja.appendChild(campos);
    var pie = document.createElement('div');
    pie.style.cssText = 'font-size:11px;opacity:.6;line-height:1.35';
    pie.textContent = 'Vacío = el texto de siempre (el que se ve en gris).';
    caja.appendChild(pie);

    function pintar() { campos.style.display = chk.checked ? '' : 'none'; pie.style.display = chk.checked ? '' : 'none'; }
    chk.onchange = function () { datos().on = chk.checked ? true : false; pintar(); refrescar(); };
    pintar();
    return caja;
  }

  function revisar() {
    if (!borrador() || !window.invCasa) return;
    if (document.getElementById(ID)) return;
    var m = window.invCasa(ID); if (!m) return;
    m.appendChild(construir());
  }

  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) { clearInterval(t); setInterval(revisar, 700); revisar(); }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
