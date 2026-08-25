/* ===== LA MÚSICA DE LA FIESTA ================================================

   POR QUÉ EXISTE ESTE ARCHIVO
   La página de planes de Invítame vende "Música" como una de las funciones de
   la Platinum. El motor NO la tiene. Hay un `#music` en el index.html, pero
   son cuatro `<i>` vacíos: es un adorno animado, no una sección. El motor lee
   `ev.musicaUrl` y `ev.musica` y no los muestra en ningún lado.

   Resultado: una novia que paga la Platinum no recibe algo que le vendimos.
   Esto lo arregla.

   QUÉ MUESTRA
   · El texto que escriban los novios (`musica`).
   · La lista de Spotify embebida, para escucharla ahí mismo (`musicaUrl`).
   · Un botón para sugerir una canción por WhatsApp, si hay número cargado.

   SI NO HAY LISTA CARGADA NO APARECE NADA. Es opcional, como el calendario.

   DÓNDE SE UBICA
   Justo antes de la mesa de regalos. Es el orden natural: primero la fiesta
   (qué se baila), después el detalle.

   ⚠️ `secOrden` NO acepta "musica": la lista de secciones que ordena el panel
   está escrita en el motor y no la incluye. Por eso esta sección se inserta
   sola en un lugar fijo en vez de pedirle permiso a `secOrden`.

   ⚠️ El link tiene que ser de Spotify. Se convierte a `/embed/` para poder
   incrustarlo; si el link es de otra cosa (YouTube, Apple Music) se muestra
   igual pero como botón, sin reproductor.
   ============================================================================ */
(function () {
  'use strict';

  var ID = 'inv-musica';

  function ev() { return window.INVEV || {}; }

  function limpio(s) {
    return String(s == null ? '' : s).trim();
  }

  function esc(s) {
    return limpio(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* open.spotify.com/playlist/ID  →  open.spotify.com/embed/playlist/ID */
  function aEmbed(url) {
    var m = String(url).match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(playlist|album|track|artist)\/([A-Za-z0-9]+)/);
    if (!m) return null;
    return 'https://open.spotify.com/embed/' + m[1] + '/' + m[2] + '?theme=0';
  }

  function telefono() {
    var e = ev();
    var t = limpio(e['c_numero-de-whatsapp'] || e['c_numero-de-whatsapp-2'] || '');
    return t.replace(/[^0-9]/g, '');
  }

  function donde() {
    /* antes de la mesa de regalos; si no está, antes del cierre */
    var secs = [].slice.call(document.querySelectorAll('section.sec'));
    var regalos = secs.filter(function (s) {
      return /mesa de regalos|regalos/i.test(s.innerText || '');
    })[0];
    if (regalos) return regalos;
    return null;
  }

  function construir() {
    var e = ev();
    var url = limpio(e.musicaUrl);
    if (!url) return null;

    var texto = limpio(e.musica);
    var embed = aEmbed(url);
    var tel = telefono();
    var nombres = [limpio(e.n1), limpio(e.n2)].filter(Boolean).join(' y ');

    var s = document.createElement('section');
    s.className = 'sec';
    s.id = ID;

    var html = '<div class="kick reveal">La fiesta</div>' +
               '<h2 class="reveal">La música</h2>';

    if (texto) {
      html += '<p class="reveal" style="max-width:34em;margin:0 auto 18px;line-height:1.6">' +
              esc(texto) + '</p>';
    }

    if (embed) {
      html += '<div class="reveal" style="max-width:520px;margin:0 auto;' +
              'border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(60,45,30,.16)">' +
              '<iframe src="' + esc(embed) + '" width="100%" height="352" frameborder="0" ' +
              'loading="lazy" style="display:block;border:0" ' +
              'allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>' +
              '</div>';
    } else {
      html += '<div class="reveal" style="margin-top:6px">' +
              '<a class="btn" href="' + esc(url) + '" target="_blank" rel="noopener">Escuchar la lista</a>' +
              '</div>';
    }

    if (tel) {
      var msg = 'Hola! Para la boda' + (nombres ? ' de ' + nombres : '') +
                ' quiero sugerir una canción: ';
      html += '<div class="reveal" style="margin-top:18px">' +
              '<a class="btn" target="_blank" rel="noopener" href="https://wa.me/' + tel +
              '?text=' + encodeURIComponent(msg) + '">Sugerir una canción</a></div>';
    }

    s.innerHTML = html;
    return s;
  }

  function poner() {
    if (document.getElementById(ID)) return;
    var s = construir();
    if (!s) return;
    var ancla = donde();
    if (!ancla || !ancla.parentNode) return;
    ancla.parentNode.insertBefore(s, ancla);
    /* las clases `reveal` del motor aparecen con el scroll; si el observador
       del motor ya terminó, las dejamos visibles a mano */
    setTimeout(function () {
      [].forEach.call(s.querySelectorAll('.reveal'), function (e) {
        if (!e.classList.contains('on')) e.classList.add('on');
      });
    }, 700);
  }

  function arrancar() {
    poner();
    var n = 0, t = setInterval(function () {
      poner();
      if (document.getElementById(ID) || ++n > 50) clearInterval(t);
    }, 320);
    addEventListener('message', function () { setTimeout(poner, 120); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
