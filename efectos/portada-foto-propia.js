/* ===== LA FOTO DE PORTADA QUE SUBEN GANA AL VIDEO DE LA MUESTRA (11/11/2026) ==
   Jazmín (ilse-y-christian): «No podemos modificar foto final ni portada».
   La invitación se armó desde una muestra que trae VIDEO de portada
   (coverVideo = invitame/oleo-jardin/jd-portada-loop.mp4). El motor pone el
   video encima de la foto, así que la foto que subían en «Foto de portada» se
   guardaba bien pero no se veía nunca.
   REGLA: si `cover` es una foto subida para esta fiesta (carpeta raíz
   invitame/<archivo>) y `coverVideo` es de una muestra (invitame/<carpeta>/…),
   manda la foto.
     · Invitación: se esconde el video de la muestra.
     · Panel: al subir la foto, se vacía solo el video de la muestra.
   Un video subido para la fiesta (carpeta raíz) no se toca nunca.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPortadaPropia) return; window.__invPortadaPropia = 1;
  function deMuestra(u) { return typeof u === 'string' && /\/invitame\/[^\/?#]+\/[^?#]/.test(u); }
  function propia(u) { return typeof u === 'string' && /res\.cloudinary\.com\/.*\/invitame\/[^\/?#]+$/.test(u.split('?')[0]); }
  function manda(ev) { return ev && propia(ev.cover) && deMuestra(ev.coverVideo); }

  if (/\/i\//.test(location.pathname)) {
    var st = document.createElement('style');
    st.textContent = 'html[data-portada-propia] .portada video.cover-vid{display:none!important}html[data-portada-propia] .portada .pbg{display:block!important}';
    (document.head || document.documentElement).appendChild(st);
    var aplicar = function () {
      var si = manda(window.INVEV);
      var h = document.documentElement;
      if (si) {
        h.setAttribute('data-portada-propia', '');
        document.querySelectorAll('.portada video.cover-vid').forEach(function (v) { try { v.pause(); } catch (e) {} });
      } else h.removeAttribute('data-portada-propia');
    };
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 400);
    addEventListener('message', function () { setTimeout(aplicar, 150); setTimeout(aplicar, 700); });
    return;
  }

  if (!/admin/.test(location.pathname)) return;
  var ultima = null;
  setInterval(function () {
    var D_; try { D_ = (typeof D === 'object' && D) ? D : null; } catch (e) { D_ = null; }
    if (!D_) return;
    var clave = D_.slug + '|' + D_.cover;
    if (ultima === null || ultima.split('|')[0] !== String(D_.slug)) { ultima = clave; return; }  /* recién abierta: no tocar */
    if (clave === ultima) return;
    ultima = clave;
    if (manda(D_)) {
      D_.coverVideo = '';
      document.querySelectorAll('input[placeholder*="link del video"]').forEach(function (i) { i.value = ''; });
      if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
    }
  }, 700);
})();
