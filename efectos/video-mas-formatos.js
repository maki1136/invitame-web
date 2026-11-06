/* ===== LA SECCIÓN «NUESTRO VIDEO» ACEPTA MÁS LINKS (6/11/2026) ===============
   Jazmín (Alejandra, Mis XV): «en el sector de IG no se visualiza el video».
   El motor sólo reconoce YouTube con «watch?v=» al principio, youtu.be,
   /shorts/, Vimeo y archivos .mp4/.webm/.mov. Cualquier otro link (un reel de
   Instagram, TikTok, Drive, Facebook, YouTube con «?si=…&v=», /live/, el
   video subido a Cloudinary sin extensión) dejaba la sección con un botón
   suelto y sin video.

   Este módulo corre DESPUÉS del motor: si hay link de video y el motor no
   pudo meter el reproductor, lo arma acá. Si el motor ya lo puso, no toca
   nada (no cambia ninguna invitación que ya se veía bien).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invVideoMas) return; window.__invVideoMas = 1;
  if (!/^\/i\//.test(location.pathname) && !/[?&]e=/.test(location.search)) return;

  var MARCO = 'width:100%;border:0;border-radius:12px;display:block';

  function armar(u) {
    var m;
    /* YouTube en cualquier forma */
    if (/(youtube\.com|youtu\.be|youtube-nocookie\.com)/i.test(u)) {
      m = u.match(/[?&]v=([A-Za-z0-9_-]{6,})/) || u.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/) ||
          u.match(/youtube\.com\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{6,})/);
      if (m) {
        var vert = /\/shorts\//.test(u);
        return '<iframe style="' + MARCO + ';aspect-ratio:' + (vert ? '9/16;max-width:340px;margin:0 auto' : '16/9') + '" src="https://www.youtube.com/embed/' + m[1] + '" allowfullscreen loading="lazy" allow="autoplay; encrypted-media; picture-in-picture"></iframe>';
      }
    }
    /* Instagram: reel, publicación o IGTV */
    m = u.match(/instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
    if (m) {
      var tipo = m[1].toLowerCase() === 'reels' ? 'reel' : m[1].toLowerCase();
      return '<iframe style="' + MARCO + ';height:620px;max-width:400px;margin:0 auto;background:#fff" src="https://www.instagram.com/' + tipo + '/' + m[2] + '/embed/" scrolling="no" allowtransparency="true" loading="lazy"></iframe>';
    }
    /* TikTok */
    m = u.match(/tiktok\.com\/.*\/video\/(\d+)/i);
    if (m) return '<iframe style="' + MARCO + ';height:740px;max-width:340px;margin:0 auto" src="https://www.tiktok.com/embed/v2/' + m[1] + '" allowfullscreen loading="lazy"></iframe>';
    /* Google Drive */
    m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([A-Za-z0-9_-]{10,})/i);
    if (m) return '<iframe style="' + MARCO + ';aspect-ratio:16/9" src="https://drive.google.com/file/d/' + m[1] + '/preview" allow="autoplay" allowfullscreen loading="lazy"></iframe>';
    /* Facebook */
    if (/(facebook\.com|fb\.watch)\//i.test(u)) {
      return '<iframe style="' + MARCO + ';aspect-ratio:16/9" src="https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(u) + '&show_text=false" allowfullscreen loading="lazy" allow="autoplay; encrypted-media; picture-in-picture"></iframe>';
    }
    /* Vimeo con otras formas (player, canales) */
    m = u.match(/vimeo\.com\/(?:.*\/)?(\d{6,})/i);
    if (m) return '<iframe style="' + MARCO + ';aspect-ratio:16/9" src="https://player.vimeo.com/video/' + m[1] + '" allowfullscreen loading="lazy"></iframe>';
    /* un video subido a Cloudinary sin extensión */
    if (/res\.cloudinary\.com\/[^/]+\/video\/upload\//i.test(u)) {
      return '<video src="' + u.replace(/"/g, '') + '" playsinline controls controlslist="nodownload noremoteplayback noplaybackrate" disablepictureinpicture preload="metadata" style="' + MARCO + '"></video>';
    }
    return '';
  }

  function revisar() {
    var ev = window.INVEV; if (!ev) return;
    var u = String(ev.videoUrl || '').trim();
    var emb = document.getElementById('video-embed');
    if (!u || !emb) return;
    if (emb.children.length) return;             /* el motor ya lo puso */
    if (emb.dataset.vmFirma === u) return;
    var html = armar(u);
    if (!html) return;
    emb.innerHTML = html; emb.dataset.vmFirma = u;
    var lk = document.getElementById('video-link'); if (lk) lk.style.display = 'none';
    var vs = document.getElementById('video-sec'); if (vs && vs.style.display === 'none') vs.style.display = '';
  }

  window.INVVIDEO_MAS = { armar: armar, revisar: revisar };
  function arrancar() {
    revisar();
    addEventListener('message', function () { setTimeout(revisar, 200); });
    var n = 0, t = setInterval(function () { revisar(); if (++n > 30) clearInterval(t); }, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
