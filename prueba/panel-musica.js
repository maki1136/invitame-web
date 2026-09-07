/* ===== LA MÚSICA, EN LA PESTAÑA DONDE SE LA BUSCA ============================

   EL PROBLEMA
   Los dos bloques de música del panel —«Música de fondo» y «Playlist de
   Spotify»— se dibujan dentro de `galeriaHtml()` (admin.html, línea 468), así
   que aparecen en la pestaña GALERIA_INSTA_VID, mezclados con las fotos y el
   hashtag de Instagram. La pestaña MUSIC_PASES, que es donde cualquiera los
   buscaría, no los tiene. Jazmín entra a MUSIC_PASES, no encuentra la música,
   y cree que la invitación no la trae.

   QUÉ HACE ESTE MÓDULO
   1. Dibuja los dos bloques en MUSIC_PASES.
   2. En GALERIA deja en su lugar un cartel que dice dónde están ahora, para
      que nadie los busque donde ya no están.
   3. Avisa, en rojo, si en el campo de la música de fondo se pega un link de
      Spotify o de YouTube — que es EL error que más veces se hizo.

   ⚠️ POR QUÉ NO SE ARREGLA EN admin.html DIRECTAMENTE
   `admin.html` pesa 159 KB y no entra de una sola vez por el camino que
   tenemos para subir archivos. Por eso se corrige desde acá, igual que hace
   `panel-etiquetas.js` con los nombres repetidos.

   ⚠️ LOS DOS CAMPOS NO SON LO MISMO — ver la nota larga en `efectos/musica.js`:
     · `musicaUrl`  = música de FONDO. Sólo .mp3/.m4a/.aac/.ogg/.wav. Si se le
       pone otra cosa, el motor la descarta EN SILENCIO y esconde la bocina.
     · `spotifyUrl` = la PLAYLIST que se muestra para escuchar y sugerir.

   ⚠️ LOS BOTONES USAN FUNCIONES DEL PANEL (`setB`, `subirAudio`). Por eso los
   `oninput`/`onchange` van como atributo y no con addEventListener: tienen que
   resolverse en el ámbito global de admin.html, igual que los del panel.

   ⚠️ EL PANEL SE REDIBUJA ENTERO (`renderPanel()` pisa el innerHTML). Por eso
   hay un observador: si no, esto aparece una vez y se borra al cambiar de
   pestaña y volver.
   ============================================================================ */
(function () {
  'use strict';

  if (!/admin\.html$/.test(location.pathname)) return;   /* sólo en el panel */

  var ID_BLOQUES = 'inv-musica-panel';
  var ID_CARTEL  = 'inv-musica-cartel';

  function pestania() {
    var t = document.querySelector('.tab.on');
    return t ? (t.textContent || '').trim() : '';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ⚠️ `D` es un `const` de nivel superior de admin.html: NO está en `window`,
     pero sí es una variable global visible desde otro <script>. Por eso se lee
     con el nombre pelado y no como `window.D`, que da undefined. */
  function dato(k) {
    try { return (D && D[k]) || ''; } catch (e) { return ''; }
  }

  /* los bloques originales, para taparlos en la pestaña de la galería */
  function bloquesOriginales() {
    return [].slice.call(document.querySelectorAll('.mejoras')).filter(function (b) {
      var h = b.querySelector('.h');
      return h && /Música de fondo|Playlist de Spotify/i.test(h.textContent || '');
    });
  }

  function html() {
    return '' +
      '<div class="mejoras"><div class="h">Música de fondo</div>' +
       '<div class="hint" style="margin-bottom:8px">Arranca cuando el invitado abre el sobre; ' +
       'queda un botón para silenciar. Tiene que ser un ARCHIVO de audio: .mp3, .m4a, .aac, ' +
       '.ogg o .wav. Un link de Spotify acá no suena.</div>' +
       '<div class="file" onclick="this.nextElementSibling.click()">Subir audio (.mp3)</div>' +
       '<input type="file" accept="audio/*" style="display:none" onchange="subirAudio(this)">' +
       '<input id="inv-mus-fondo" style="margin-top:8px" value="' + esc(dato('musicaUrl')) + '" ' +
       'oninput="setB(\'musicaUrl\',this.value)" placeholder="…o pegá el link del audio (.mp3)">' +
       '<div id="inv-mus-aviso" style="display:none;margin-top:6px;color:#a4243b;font-size:13px"></div>' +
      '</div>' +
      '<div class="mejoras"><div class="h">Playlist de Spotify</div>' +
       '<div class="hint" style="margin-bottom:8px">En Spotify: Compartir → Copiar enlace de la ' +
       'playlist, y pegalo acá. Se muestra en la sección «Playlist del evento», con el ' +
       'reproductor y el botón para sugerir una canción.</div>' +
       '<input value="' + esc(dato('spotifyUrl')) + '" oninput="setB(\'spotifyUrl\',this.value)" ' +
       'placeholder="https://open.spotify.com/playlist/...">' +
      '</div>';
  }

  function revisarAviso() {
    var i = document.getElementById('inv-mus-fondo');
    var a = document.getElementById('inv-mus-aviso');
    if (!i || !a) return;
    var v = String(i.value || '').trim();
    var mal = v && /spotify|youtube|youtu\.be|deezer|apple\.com\/.*music/i.test(v);
    a.textContent = mal
      ? 'Eso es un link de una app de música, no un archivo. Acá no va a sonar nada. ' +
        'Si es una playlist de Spotify, va en el bloque de abajo.'
      : '';
    a.style.display = mal ? '' : 'none';
  }

  function poner() {
    var p = document.getElementById('panel');
    if (!p) return;
    var tab = pestania();

    if (tab === 'MUSIC_PASES') {
      if (!document.getElementById(ID_BLOQUES)) {
        var d = document.createElement('div');
        d.id = ID_BLOQUES;
        d.innerHTML = html();
        p.insertBefore(d, p.firstChild);
        var i = document.getElementById('inv-mus-fondo');
        if (i) i.addEventListener('input', revisarAviso);
        revisarAviso();
      }
      return;
    }

    if (tab === 'GALERIA_INSTA_VID') {
      var b = bloquesOriginales();
      if (!b.length || document.getElementById(ID_CARTEL)) return;
      var cartel = document.createElement('div');
      cartel.id = ID_CARTEL;
      cartel.className = 'mejoras';
      cartel.innerHTML = '<div class="h">La música se mudó</div>' +
        '<div class="hint">La música de fondo y la playlist de Spotify ahora están en la ' +
        'pestaña MUSIC_PASES, que es donde corresponde.</div>';
      b[0].parentNode.insertBefore(cartel, b[0]);
      b.forEach(function (x) { x.style.display = 'none'; });
    }
  }

  function arrancar() {
    poner();
    var p = document.getElementById('panel');
    if (p) new MutationObserver(function () { poner(); })
             .observe(p, { childList: true });
    /* las solapas también se redibujan enteras */
    var t = document.getElementById('tabs');
    if (t) new MutationObserver(function () { setTimeout(poner, 30); })
             .observe(t, { childList: true });
    setInterval(poner, 1200);   /* red de seguridad, barata */
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
