/* ===== PANEL · «NUESTRO VIDEO»: SUBIR EL ARCHIVO EN VEZ DE UN LINK (9/11/2026) =
   Jazmín (Ivon & Carlos): el video estaba en Google Drive y «para verlo los
   manda directamente a Drive» / el reproductor de Drive se veía negro.
   Drive no es un lugar para reproducir videos dentro de una página: pide
   permisos, a veces no procesa el video y siempre muestra su propio
   reproductor.

   QUÉ HACE: al lado de «URL Video:» (pestaña GALERIA_INSTA_VID) agrega
   «Subir el video desde la compu». Sube el archivo a Cloudinary y guarda su
   dirección en el mismo campo (videoUrl), con la receta para que cargue
   rápido en el celular (1080 de ancho, calidad automática) y CON SONIDO.
   El motor ya sabe reproducir esa dirección dentro de la invitación.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPanelVideoSubir) return; window.__invPanelVideoSubir = 1;
  if (/^\/i\//.test(location.pathname)) return;

  var ID = 'video-subir-btn';
  var MAX_MB = 95;

  function campo() {
    var ins = document.querySelectorAll('input[type="text"],input:not([type])');
    for (var i = 0; i < ins.length; i++) {
      var o = ins[i].getAttribute('oninput') || '';
      if (/setB\(\s*['"]videoUrl['"]/.test(o)) return ins[i];
    }
    return null;
  }

  function poner(url) {
    if (typeof window.setB === 'function') window.setB('videoUrl', url);
    else { try { D.videoUrl = url; } catch (e) {} if (typeof window.render === 'function') window.render(); }
    var c = campo(); if (c) c.value = url;
  }

  function subir(f, btn) {
    if (!f) return;
    if (!window.INV || !INV.uploadVideo) { alert('Todavía no cargó la base. Esperá 2 segundos y probá de nuevo.'); return; }
    var mb = f.size / 1048576;
    if (mb > MAX_MB) { alert('El video pesa ' + Math.round(mb) + ' MB y el máximo es ' + MAX_MB + ' MB. Pedile al cliente una versión más liviana (o recortala) y subila de nuevo.'); return; }
    var antes = btn.textContent;
    btn.textContent = 'Subiendo video… (' + Math.round(mb) + ' MB, puede tardar)';
    btn.disabled = true;
    INV.uploadVideo(f).then(function (url) {
      var m = String(url).match(/^(.*\/video\/upload\/)(v\d+\/.*)$/);
      if (m) url = m[1] + 'q_auto,vc_auto,w_1080,c_limit/' + m[2];
      try { fetch(url, { mode: 'no-cors' }).catch(function () {}); } catch (e) {}   /* que quede fabricado */
      poner(url);
      btn.textContent = '✓ Video subido — Guardar y publicar';
      btn.disabled = false;
    }).catch(function (e) {
      btn.textContent = antes; btn.disabled = false;
      alert('No se pudo subir: ' + (e && e.message ? e.message : e));
    });
  }

  function revisar() {
    var c = campo();
    if (!c || document.getElementById(ID)) return;
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin:6px 0 2px';
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'video/*'; inp.style.display = 'none';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Subir el video desde la compu (mejor que un link de Drive)';
    btn.style.cssText = 'padding:7px 12px;border-radius:8px;border:1px solid #c9b8a8;background:#fff;cursor:pointer;font-size:12px';
    btn.onclick = function () { inp.click(); };
    inp.onchange = function () { subir(inp.files && inp.files[0], btn); inp.value = ''; };
    var nota = document.createElement('div');
    nota.style.cssText = 'font-size:11px;opacity:.65;margin-top:4px;line-height:1.35';
    nota.textContent = 'Así se reproduce dentro de la invitación. Un link de YouTube también funciona. Con Drive, el invitado ve el reproductor de Drive y a veces no carga.';
    caja.appendChild(btn); caja.appendChild(inp); caja.appendChild(nota);
    c.parentNode.insertBefore(caja, c.nextSibling);
  }

  setInterval(revisar, 800);
})();
