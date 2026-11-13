/* ===== SECCIONES LIBRES, EN EL PANEL ============================================
   El bloque que escribe fx.libre y fx.libre2 (los dibuja /efectos/libre.js).
   Pestaña PRINCIPAL, junto al cierre. Rótulos: window.INV_ROTULOS_FX (/admin/0-claves.js).
   ============================================================================ */
(function () {
  'use strict';
  var KEYS = [['libre', 'Sección libre 1'], ['libre2', 'Sección libre 2']];
  function arrancar() {
    var S = window.INVSN; if (!S) { setTimeout(arrancar, 100); return; }
    var R = S.rotulo;
    KEYS.forEach(function (par) {
      var key = par[0], ID = 'libre-ed-' + key, nombre = R(key, par[1]);
      S.anotarCasa(ID, 'PRINCIPAL', 'cierre', null, '[data-sec=' + key + ']');
      S.registrarOrden(key, nombre, key === 'libre2' ? ['libre', 'confirmacion'] : ['confirmacion']);
      S.bloque(ID, function (caja) {
        S.registrarOrden(key, nombre, key === 'libre2' ? ['libre', 'confirmacion'] : ['confirmacion']);
        var a = function () { var d = S.borrador(); return d ? S.datos(d, key) : {}; };
        S.titulo(caja, nombre,
          'Para lo que piden distinto: un título, un texto, una imagen y un botón con link, todo opcional. ' +
          'Va antes de «Confirmar asistencia» (se puede mover en «Orden de las secciones»). Apagada, no aparece.');
        var syncs = [
          S.interruptor(caja, R(key + '.encendido', 'Mostrar esta sección'),
            function () { return S.on(a().encendido); }, function (v) { a().encendido = v; }),
          S.texto(caja, R(key + '.kick', 'Sobretítulo (chiquito, arriba)'), 'Ej: Un detalle',
            function () { return a().kick; }, function (v) { a().kick = v; }, false, 60),
          S.texto(caja, R(key + '.titulo', 'Título'), 'Ej: Nuestra historia',
            function () { return a().titulo; }, function (v) { a().titulo = v; if (v && a().encendido == null) a().encendido = true; }, false, 90),
          S.texto(caja, R(key + '.texto', 'Texto (podés usar Enter)'), '',
            function () { return a().texto; }, function (v) { a().texto = v; if (v && a().encendido == null) a().encendido = true; }, true, 1500)
        ];
        /* la imagen: subir o pegar el link */
        var lab = document.createElement('div'); lab.textContent = R(key + '.imagen', 'Imagen (opcional)');
        lab.style.cssText = 'font-size:12px;font-weight:600;margin:8px 0 4px'; caja.appendChild(lab);
        var fila = document.createElement('div'); fila.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap';
        var bu = document.createElement('button'); bu.type = 'button'; bu.className = 'addbtn gh'; bu.style.cssText = 'padding:6px 12px;font-size:12px'; bu.textContent = 'Subir imagen';
        var fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'image/*'; fi.style.display = 'none';
        var qu = document.createElement('button'); qu.type = 'button'; qu.className = 'addbtn gh'; qu.style.cssText = 'padding:6px 12px;font-size:12px'; qu.textContent = 'Quitar imagen';
        var pv = document.createElement('img'); pv.style.cssText = 'height:48px;border-radius:6px;display:none';
        bu.onclick = function () { fi.click(); };
        fi.onchange = async function () {
          var f = fi.files && fi.files[0]; if (!f) return;
          if (!window.INV || !INV.uploadImage) { alert('Todavía no cargó la base. Esperá 2 seg.'); return; }
          bu.textContent = 'Subiendo…';
          try { var u = await INV.uploadImage(f); a().imagen = u; if (a().encendido == null) a().encendido = true; S.refrescar(); }
          catch (e) { alert('No se pudo subir: ' + (e.message || e)); }
          bu.textContent = 'Subir imagen'; fi.value = ''; img();
        };
        qu.onclick = function () { delete a().imagen; S.refrescar(); img(); };
        fila.appendChild(bu); fila.appendChild(fi); fila.appendChild(qu); fila.appendChild(pv); caja.appendChild(fila);
        function img() { var u = a().imagen; pv.style.display = u ? '' : 'none'; if (u) pv.src = u; qu.style.display = u ? '' : 'none'; }
        syncs.push(img);
        syncs.push(S.texto(caja, R(key + '.boton', 'Texto del botón'), 'Ver más',
          function () { return a().boton; }, function (v) { a().boton = v; }, false, 50));
        syncs.push(S.texto(caja, R(key + '.link', 'Link del botón (sin link no hay botón)'), 'https://…',
          function () { return a().link; }, function (v) { a().link = v; }, false, 500));
        syncs.push(S.estilo(caja, key));
        return syncs;
      });
    });
  }
  arrancar();
})();
