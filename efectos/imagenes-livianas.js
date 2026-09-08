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
   dirección:

       .../upload/v1784.../foto.png
       .../upload/f_auto,q_auto:good,w_1200,c_limit/v1784.../foto.png

     · `f_auto` → le manda a cada teléfono el formato que ese teléfono entiende
                  mejor (WebP o AVIF); si es viejo, el de siempre.
     · `q_auto:good` → la calidad justa. Ojo humano: no se nota. Peso: sí.
     · `w_1200,c_limit` → ninguna foto viaja más grande de lo que se ve.
                  `c_limit` sólo ACHICA: a una foto chica no la estira.

   MEDIDO en esta misma invitación: 995 KB → 50 KB y 528 KB → 53 KB.

   ⚠️⚠️ POR QUÉ SE CAMBIA LA DIRECCIÓN **ANTES** DE ASIGNARLA, Y NO DESPUÉS
   La primera versión de este archivo miraba las imágenes ya puestas en la
   pantalla y les corregía la dirección. **Salió peor.** Cuando una imagen ya
   está en el documento, el navegador YA empezó a bajarla: cambiarle la
   dirección no cancela ese pedido, agrega otro. Medido en vivo: 36 pedidos con
   la foto pesada (5113 KB) MÁS 36 con la liviana (2387 KB). El doble.

   Por eso ahora se corrige en el momento exacto en que alguien escribe la
   dirección —`img.src = ...`, `setAttribute('src', ...)`, el fondo por estilo—,
   antes de que el navegador se entere. Un solo pedido, y el liviano.

   ⚠️ SE CAMBIA SÓLO LA DIRECCIÓN, NUNCA LA FOTO. No se re-sube ni se modifica
      nada en Cloudinary. Si esto se apaga, todo vuelve a como estaba.

   ⚠️ NO SE TOCA NINGUNA FOTO QUE YA TENGA INSTRUCCIONES. Si la dirección ya
      trae algo (un recorte, un `g_face`, un tamaño), se la deja como está: ese
      recorte lo puso alguien a propósito y cambiarlo movería el encuadre.

   ⚠️ VA EN LA CABEZA DEL DOCUMENTO Y SIN `defer` (lo pone `i/index.php`), y no
      espera al `DOMContentLoaded`: tiene que estar puesto antes de que exista
      la primera imagen. En la lista de `efectos/index.js` NO sirve: llega a los
      1,2 s, cuando el motor ya pidió todo.

   ⚠️ TODO VA ADENTRO DE UN `try`: si algo de esto fallara, la invitación tiene
      que seguir funcionando exactamente como antes, con las fotos pesadas.
   ============================================================================ */
(function () {

  var RECETA = 'f_auto,q_auto:good,w_1200,c_limit/';

  /* La dirección liviana, o '' si no hay que tocarla. */
  function liviana(url) {
    if (typeof url !== 'string' || url.indexOf('res.cloudinary.com') < 0) return '';
    if (url.indexOf('/image/upload/') < 0) return '';          /* el video, no */
    var i = url.indexOf('/upload/') + 8;
    var cola = url.slice(i);
    if (!/^v\d+\//.test(cola)) return '';   /* ya tiene instrucciones: se respeta */
    return url.slice(0, i) + RECETA + cola;
  }

  /* Lo mismo, adentro de un texto de CSS: url("...") */
  function livianaCss(txt) {
    if (typeof txt !== 'string' || txt.indexOf('res.cloudinary.com') < 0) return '';
    var cambio = false;
    var salida = txt.replace(/url\((['"]?)([^'")]+)\1\)/g, function (todo, comilla, u) {
      var n = liviana(u);
      if (!n) return todo;
      cambio = true;
      return 'url("' + n + '")';
    });
    return cambio ? salida : '';
  }

  try {
    /* 1. img.src = '...' */
    var descSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (descSrc && descSrc.set) {
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        configurable: true,
        enumerable: descSrc.enumerable,
        get: descSrc.get,
        set: function (v) { descSrc.set.call(this, liviana(v) || v); }
      });
    }

    /* 2. elemento.setAttribute('src', ...) y setAttribute('style', ...) */
    var setAttrOriginal = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (nombre, valor) {
      try {
        var n = String(nombre).toLowerCase();
        if ((n === 'src' || n === 'data-src') && this.tagName === 'IMG') {
          valor = liviana(valor) || valor;
        } else if (n === 'style') {
          valor = livianaCss(valor) || valor;
        }
      } catch (e) {}
      return setAttrOriginal.call(this, nombre, valor);
    };

    /* 3. elemento.style.backgroundImage = 'url(...)' y setProperty(...) */
    var descBg = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'backgroundImage');
    if (descBg && descBg.set) {
      Object.defineProperty(CSSStyleDeclaration.prototype, 'backgroundImage', {
        configurable: true,
        enumerable: descBg.enumerable,
        get: descBg.get,
        set: function (v) { descBg.set.call(this, livianaCss(v) || v); }
      });
    }
    var setPropOriginal = CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty = function (prop, valor, prioridad) {
      try {
        if (typeof valor === 'string' && valor.indexOf('res.cloudinary.com') > -1) {
          valor = livianaCss(valor) || valor;
        }
      } catch (e) {}
      return setPropOriginal.call(this, prop, valor, prioridad);
    };

    /* 4. Las que ya vinieran escritas en el HTML. Acá sí hay que mirarlas, pero
          este archivo corre antes del cuerpo, así que todavía no existe
          ninguna: es sólo por si alguna se cuela. */
    var repasar = function () {
      try {
        var imgs = document.querySelectorAll('img[src*="res.cloudinary.com"]');
        for (var i = 0; i < imgs.length; i++) {
          var n = liviana(imgs[i].getAttribute('src') || '');
          if (n) imgs[i].setAttribute('src', n);
        }
      } catch (e) {}
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', repasar, { once: true });
    } else { repasar(); }

  } catch (e) {
    /* Si algo de esto no se puede hacer en este navegador, no pasa nada:
       la invitación sigue igual que siempre, con las fotos como están. */
  }
})();
