/* ===== LAS FOTOS, LIVIANAS ====================================================

   EL PROBLEMA (medido el 8/9/2026, con la muestra oficial abierta)
   Maki: «con wifi y todo no carga, tarda muchísimo».

   Después de bajar los pedidos de 129 a 63, seguía lenta. Y no era el código:

       JavaScript, todo junto ...........  315 KB
       FOTOS ............................ 3031 KB   ← acá estaba

   Dos solas imágenes se llevaban un mega y medio:

       dc2sgshzghouc5b9uii8.png  ......  995 KB
       pmqhmccpaibs8bsn78ce.png  ......  528 KB

   Son PNG. Un PNG guarda cada pixel sin perder nada: perfecto para un logo,
   carísimo para una foto. Y estaban subidas tal cual, sin pedirle a Cloudinary
   que las adaptara.

   LA SOLUCIÓN, SIN TOCAR NINGUNA FOTO
   Cloudinary sabe convertir y achicar al vuelo: alcanza con pedírselo en la
   dirección. Este módulo agrega ese pedido a cada foto de la invitación:

       .../upload/v1784.../foto.png
       .../upload/f_auto,q_auto:good,w_1200,c_limit/v1784.../foto.png

     · `f_auto`  → le manda a cada teléfono el formato que ese teléfono entiende
                   mejor (WebP o AVIF); si es viejo, el de siempre.
     · `q_auto:good` → la calidad justa. Ojo humano: no se nota. Peso: sí.
     · `w_1200,c_limit` → ninguna foto viaja más grande de lo que se ve.
                   `c_limit` sólo ACHICA: a una foto chica no la estira.

   MEDIDO, esta misma invitación:  5961 KB  →  2247 KB   (62% menos)
   Las dos grandes:  995 KB → 50 KB  ·  528 KB → 53 KB.

   ⚠️ NO SE TOCA NINGUNA FOTO QUE YA TENGA INSTRUCCIONES. Si la dirección ya
      trae algo (un recorte, un `g_face`, un tamaño), se la deja como está: ese
      recorte lo puso alguien a propósito y cambiarlo movería el encuadre. Sólo
      se completan las que están crudas, que son justamente las pesadas.

   ⚠️ NO SE TOCA CLOUDINARY. No se re-sube ni se modifica ninguna imagen: se
      piden distinto. Si mañana esto se apaga, todo vuelve a como estaba.

   ⚠️ MIRA TAMBIÉN LAS QUE APARECEN DESPUÉS. La invitación arma secciones a
      medida que llegan los datos, así que no alcanza con pasar una vez: queda
      un observador escuchando lo que se agrega.
   ============================================================================ */
(function () {

  var RECETA = 'f_auto,q_auto:good,w_1200,c_limit/';

  /* Devuelve la dirección optimizada, o '' si no hay que tocarla. */
  function liviana(url) {
    if (!url || url.indexOf('res.cloudinary.com') < 0) return '';
    if (url.indexOf('/image/upload/') < 0) return '';        /* video no */
    var i = url.indexOf('/upload/') + 8;
    var cola = url.slice(i);
    /* ⚠️ Si lo que sigue a /upload/ NO es la versión (vNNN), ya hay
       instrucciones puestas a mano: no se tocan. */
    if (!/^v\d+\//.test(cola)) return '';
    return url.slice(0, i) + RECETA + cola;
  }

  function arreglarImg(img) {
    if (img.dataset.liviana) return;
    var n = liviana(img.getAttribute('src') || '');
    if (!n) { img.dataset.liviana = 'no'; return; }
    img.dataset.liviana = 'si';
    img.src = n;
  }

  /* Los fondos puestos por estilo: `background-image:url(...)`. */
  function arreglarFondo(el) {
    if (el.dataset && el.dataset.livianaBg) return;
    var bg = el.style && el.style.backgroundImage;
    if (!bg || bg.indexOf('res.cloudinary.com') < 0) return;
    var m = bg.match(/url\((['"]?)(.*?)\1\)/);
    if (!m) return;
    var n = liviana(m[2]);
    if (el.dataset) el.dataset.livianaBg = n ? 'si' : 'no';
    if (n) el.style.backgroundImage = 'url("' + n + '")';
  }

  function pasada(raiz) {
    if (!raiz || !raiz.querySelectorAll) return;
    var imgs = raiz.querySelectorAll('img[src*="res.cloudinary.com"]');
    for (var i = 0; i < imgs.length; i++) arreglarImg(imgs[i]);
    var fondos = raiz.querySelectorAll('[style*="res.cloudinary.com"]');
    for (var j = 0; j < fondos.length; j++) arreglarFondo(fondos[j]);
    if (raiz.tagName === 'IMG') arreglarImg(raiz);
  }

  function arrancar() {
    pasada(document);

    /* Lo que se agrega después: secciones, galería, tarjetas. */
    try {
      var obs = new MutationObserver(function (cambios) {
        for (var i = 0; i < cambios.length; i++) {
          var c = cambios[i];
          if (c.type === 'attributes') {
            if (c.target.tagName === 'IMG') { delete c.target.dataset.liviana; arreglarImg(c.target); }
            else { if (c.target.dataset) delete c.target.dataset.livianaBg; arreglarFondo(c.target); }
            continue;
          }
          for (var j = 0; j < c.addedNodes.length; j++) {
            var n = c.addedNodes[j];
            if (n.nodeType !== 1) continue;
            if (n.tagName === 'IMG') arreglarImg(n);
            arreglarFondo(n);
            pasada(n);
          }
        }
      });
      obs.observe(document.documentElement, {
        childList: true, subtree: true,
        attributes: true, attributeFilter: ['src', 'style']
      });
      /* A los 25 segundos ya está todo dibujado: se deja de escuchar. */
      setTimeout(function () { try { obs.disconnect(); } catch (e) {} }, 25000);
    } catch (e) { /* navegador viejo: al menos quedó la primera pasada */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
