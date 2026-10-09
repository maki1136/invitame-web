/* ===== EL SAVE THE DATE, EN EL PANEL (9/10/2026) ===================================
   Pestaña EFECTOS (su casa la decide invCasa, en admin/3-evento.js).
   Regalo para los novios: una imagen vertical con la portada de la invitación.
   La arma efectos/save-the-date.js; la vista previa y la descarga son
   efectos/std-marco.js, el MISMO que usan los novios en su panel.

   Lo que se guarda: D.fx.std = {titulo, frase, nombres, fecha, detalle, pie}.
   Vacío = el texto que sale solo de la invitación (se ve en gris).
   Los novios ven estos textos como punto de partida y los pueden cambiar en
   SU panel (eso queda en inv_paneles, no acá).

   ⚠️ La vista previa abre la invitación PUBLICADA: lo que se cambie en la
      portada se ve acá después de «Guardar y publicar» y «Volver a cargar».
   ⚠️ `D` NO cuelga de window, y `D.fx` se reemplaza al llegar el evento: por
      eso `datos()` se vuelve a pedir adentro de cada handler.
   ============================================================================ */
(function () {
  var ID = 'std-selector';
  var CAMPOS = [
    /* rótulos únicos a propósito: el banco del panel (chequeo/panel.cjs) los
       reconoce por «Save the date ·» como controles que no cambian la invitación */
    ['titulo', 'Save the date · título de arriba'],
    ['frase', 'Save the date · frase chica'],
    ['nombres', 'Save the date · nombres'],
    ['fecha', 'Save the date · fecha grande'],
    ['detalle', 'Save the date · día y lugar'],
    ['pie', 'Save the date · renglón final (opcional)']
  ];

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  function datos() {
    var d = borrador(); if (!d.fx) d.fx = {};
    if (!d.fx.std) d.fx.std = {};
    return d.fx.std;
  }
  function cargarMarco() {
    if (window.INVSTD_MARCO) return Promise.resolve();
    return new Promise(function (ok, no) { var s = document.createElement('script'); s.src = '/efectos/std-marco.js?v=1'; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  }

  function construir() {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';
    var t = document.createElement('div');
    t.textContent = 'Save the date (regalo para los novios)';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(t);
    var a = document.createElement('div');
    a.textContent = 'Una imagen vertical para estados de WhatsApp e Instagram, armada sola con la portada publicada. Los novios la bajan desde su panel y pueden cambiar estos textos.';
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(a);

    var fila = document.createElement('div');
    fila.style.cssText = 'display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap';
    var vista = document.createElement('div');
    vista.style.cssText = 'width:180px;flex:none';
    var campos = document.createElement('div');
    campos.style.cssText = 'flex:1;min-width:200px';
    fila.appendChild(vista); fila.appendChild(campos); caja.appendChild(fila);

    var m = null, inputs = {};
    var leer = function () { var o = {}; CAMPOS.forEach(function (c) { var v = datos()[c[0]]; if (v != null && String(v).trim() !== '') o[c[0]] = String(v); }); return o; };

    CAMPOS.forEach(function (c) {
      var f = document.createElement('div'); f.style.cssText = 'margin:0 0 8px';
      var l = document.createElement('label'); l.textContent = c[1];
      l.style.cssText = 'display:block;font-size:12px;font-weight:600;margin:0 0 3px';
      var i = document.createElement('input'); i.type = 'text'; i.style.cssText = 'width:100%';
      i.value = datos()[c[0]] || '';
      i.oninput = function () {
        if (i.value.trim()) datos()[c[0]] = i.value; else delete datos()[c[0]];
        refrescar(); if (m) m.armar(leer());
      };
      inputs[c[0]] = i;
      f.appendChild(l); f.appendChild(i); campos.appendChild(f);
    });
    var pie = document.createElement('div');
    pie.style.cssText = 'font-size:11px;opacity:.6;line-height:1.35;margin-bottom:10px';
    pie.textContent = 'Vacío = el texto que sale solo (el que se ve en gris). Para que un renglón no salga, escribí un guion: -';
    campos.appendChild(pie);

    var botones = document.createElement('div'); botones.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    var bVer = document.createElement('button'); bVer.type = 'button'; bVer.textContent = 'Ver el save the date';
    var bBajar = document.createElement('button'); bBajar.type = 'button'; bBajar.textContent = 'Descargar imagen'; bBajar.disabled = true;
    [bVer, bBajar].forEach(function (b) { b.style.cssText = 'border:0;border-radius:20px;padding:8px 14px;font-weight:700;cursor:pointer;background:#efe7de;color:#49111A'; botones.appendChild(b); });
    campos.appendChild(botones);
    var nota = document.createElement('div'); nota.style.cssText = 'font-size:11px;opacity:.7;margin-top:8px;line-height:1.35'; campos.appendChild(nota);

    vista.innerHTML = '<div style="width:180px;height:320px;border-radius:12px;background:#f3eff4;display:flex;align-items:center;justify-content:center;text-align:center;padding:16px;font-size:11.5px;color:#6b5f6f;line-height:1.4">Tocá «Ver el save the date» para armarlo con la portada publicada.</div>';

    bVer.onclick = function () {
      var slug = (borrador().slug || '').trim();
      if (!slug || slug === 'maria-y-diego') { nota.textContent = 'Primero poné la dirección del link y tocá «Guardar y publicar».'; return; }
      bVer.textContent = 'Volver a cargar'; bBajar.disabled = true; nota.textContent = 'Muestra la invitación publicada: lo que cambies en la portada se ve después de «Guardar y publicar».';
      cargarMarco().then(function () {
        m = window.INVSTD_MARCO.crear(vista, slug);
        m.listo.then(function (r) {
          CAMPOS.forEach(function (c) { inputs[c[0]].placeholder = r.auto[c[0]] || ''; });
          m.armar(leer()); bBajar.disabled = false;
        }, function () { nota.textContent = '¿Ya está publicada? El save the date sale de la invitación publicada.'; });
      });
    };
    bBajar.onclick = function () {
      if (!m) return;
      var txt = bBajar.textContent; bBajar.disabled = true; bBajar.textContent = 'Armando la imagen…';
      m.descargar('save-the-date-' + (borrador().slug || 'invitacion') + '.jpg').then(function (r) {
        bBajar.disabled = false; bBajar.textContent = r === 'otra-vez' ? 'Guardar la imagen' : txt;
      }, function () { bBajar.disabled = false; bBajar.textContent = txt; nota.textContent = 'No se pudo armar la imagen. Probá «Volver a cargar».'; });
    };
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
