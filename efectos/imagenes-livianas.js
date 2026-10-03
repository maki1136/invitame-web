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

  /* ═══ LA CACHÉ (1/10/2026) ═══════════════════════════════════════════════
     Si `i/index.php` puso `window.INV_CACHE_MEDIOS` (la dirección del Worker de
     la galería), cada foto, video y audio de Cloudinary se pide a través del
     Worker, que guarda una copia en R2 y la entrega sin que Cloudinary cobre la
     entrega. La dirección queda IGUAL con el Worker adelante:
         https://res.cloudinary.com/oc8cgqt4/...
         https://galeria.littlemomentsok.workers.dev/res.cloudinary.com/oc8cgqt4/...
     ⚠️ Sólo se cambia lo que el NAVEGADOR va a pedir, en el último momento. Los
        datos de la fiesta no se tocan: el panel y la base siguen con Cloudinary.
     ⚠️ Sin `INV_CACHE_MEDIOS` esto no hace NADA: `alCache` devuelve lo mismo
        que recibe y todo funciona exactamente como antes. */
  var BASE_CACHE = '';
  try {
    var bc = window.INV_CACHE_MEDIOS;
    if (typeof bc === 'string' && /^https:\/\/[a-z0-9.-]+\/$/.test(bc)) BASE_CACHE = bc;
  } catch (e) {}
  var CLD = 'res.cloudinary.com/oc8cgqt4/';
  function alCache(u) {
    if (!BASE_CACHE || typeof u !== 'string') return u;
    if (u.indexOf('https://' + CLD) === 0) return BASE_CACHE + u.slice(8);
    if (u.indexOf('http://' + CLD) === 0) return BASE_CACHE + u.slice(7);
    if (u.indexOf('//' + CLD) === 0) return BASE_CACHE + u.slice(2);
    return u;
  }
  /* La dirección final de una FOTO: primero liviana, después por la caché. */
  function fin(u) { return alCache(liviana(u) || u); }

  /* La dirección liviana, o '' si no hay que tocarla. */
  function liviana(url) {
    if (typeof url !== 'string' || url.indexOf('res.cloudinary.com') < 0) return '';
    if (url.indexOf('/image/upload/') < 0) return '';          /* el video, no */
    var i = url.indexOf('/upload/') + 8;
    var cola = url.slice(i);
    if (/^v\d+\//.test(cola)) return url.slice(0, i) + RECETA + cola;

    /* ⚠️ LA FOTO FIJA DEL VIDEO DE FONDO TAMBIÉN CUENTA. (14/9/2026)
       Cuando la clienta pone un VIDEO de fondo, la foto de respaldo es un
       cuadro que saca Cloudinary del propio video, y llega escrita así:
           /image/upload/so_1.5/v1788.../archivo.jpg
                         └─ "segundo 1,5 del video"
       Como ya trae UNA instrucción, la regla de arriba la dejaba pasar entera
       —y viajaba sin `f_auto`, en el formato y el peso originales—. El banco la
       marcaba una y otra vez como «foto sin optimizar» y tenía razón.
       No se puede pisar el `so_`: sin él no hay cuadro. Se ENCADENA: primero
       Cloudinary saca el cuadro, y después lo achica y lo convierte. El orden
       importa y es éste.
       Si la dirección ya pide formato o calidad, no se toca: alguien decidió. */
    var m = cola.match(/^([^\/]+)\/(v\d+\/.*)$/);
    if (m && !/\b(f_|q_)/.test(m[1])) {
      return url.slice(0, i) + m[1] + '/' + RECETA + m[2];
    }
    return '';                              /* ya tiene instrucciones: se respeta */
  }

  /* Lo mismo, adentro de un texto de CSS: url("...") */
  function livianaCss(txt) {
    if (typeof txt !== 'string' || txt.indexOf('res.cloudinary.com') < 0) return '';
    var cambio = false;
    var salida = txt.replace(/url\((['"]?)([^'")]+)\1\)/g, function (todo, comilla, u) {
      var n = fin(u);
      if (n === u) return todo;
      cambio = true;
      return 'url("' + n + '")';
    });
    return cambio ? salida : '';
  }

  /* Cualquier dirección de Cloudinary adentro de un texto: un pedazo de HTML
     armado a mano, una hoja de estilo escrita por un módulo, lo que sea. */
  function livianaTexto(txt) {
    if (typeof txt !== 'string' || txt.indexOf('res.cloudinary.com') < 0) return '';
    var cambio = false;
    var salida = txt.replace(/https?:\/\/res\.cloudinary\.com\/[^\s"'<>()]+/g, function (u) {
      var n = fin(u);
      if (n === u) return u;
      cambio = true;
      return n;
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
        set: function (v) { descSrc.set.call(this, fin(v)); }
      });
    }

    /* 1 bis. video.poster = '...' */
    var descPoster = Object.getOwnPropertyDescriptor(HTMLVideoElement.prototype, 'poster');
    if (descPoster && descPoster.set) {
      Object.defineProperty(HTMLVideoElement.prototype, 'poster', {
        configurable: true,
        enumerable: descPoster.enumerable,
        get: descPoster.get,
        set: function (v) { descPoster.set.call(this, fin(v)); }
      });
    }

    /* 2. elemento.setAttribute('src', ...) y setAttribute('style', ...) */
    var setAttrOriginal = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (nombre, valor) {
      try {
        var n = String(nombre).toLowerCase();
        if ((n === 'src' || n === 'data-src') && this.tagName === 'IMG') {
          valor = fin(valor);
        } else if (n === 'src' && /^(VIDEO|AUDIO|SOURCE)$/.test(this.tagName)) {
          valor = alCache(valor);
        } else if (n === 'poster') {
          /* el <video> del fondo y el del sobre ponen su foto fija por acá */
          valor = fin(valor);
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

    /* 4. ⚠️⚠️ EL CAMINO QUE FALTABA: `innerHTML`.
       Medido: con los tres de arriba puestos, seguían bajando OCHO fotos
       pesadas. Los módulos no crean las imágenes una por una: arman un pedazo
       de HTML como texto («<img src=…>») y lo sueltan de una. Ahí no pasa por
       `img.src` ni por `setAttribute`: el navegador lee el texto y pide la foto
       en el mismo instante. Por eso también se corrige el TEXTO, antes de que
       se convierta en pantalla. */
    ['innerHTML', 'outerHTML'].forEach(function (prop) {
      var d = Object.getOwnPropertyDescriptor(Element.prototype, prop);
      if (!d || !d.set) return;
      Object.defineProperty(Element.prototype, prop, {
        configurable: true, enumerable: d.enumerable, get: d.get,
        set: function (v) {
          var n = livianaTexto(v) || v;
          /* misma nota que en textContent, más abajo: una hoja que ya dice
             exactamente eso no se vuelve a escribir */
          if (prop === 'innerHTML' && this.tagName === 'STYLE' && d.get && d.get.call(this) === n) return;
          d.set.call(this, n);
        }
      });
    });
    var insertarOriginal = Element.prototype.insertAdjacentHTML;
    Element.prototype.insertAdjacentHTML = function (donde, html) {
      return insertarOriginal.call(this, donde, livianaTexto(html) || html);
    };
    /* Y las hojas de estilo que escriben los módulos con textContent. */
    var dTexto = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
    if (dTexto && dTexto.set) {
      Object.defineProperty(Node.prototype, 'textContent', {
        configurable: true, enumerable: dTexto.enumerable, get: dTexto.get,
        set: function (v) {
          if (this.tagName === 'STYLE') {
            v = livianaTexto(v) || v;
            /* ⚠️⚠️ 2/10/2026 — EL PARPADEO DE SAFARI. Las colecciones escriben
               su hoja con «si no dice lo mismo, reescribirla» (óleo cada 400 ms
               y cada 1,2 s). Pero acá le cambiamos las direcciones de las fotos,
               así que la hoja NUNCA dice lo mismo que lo que la colección
               quiere escribir, y se reescribía para siempre. Chrome no se
               entera; Safari (iPhone) a veces recalcula la página justo en el
               medio, sin esa hoja, y se queda con el color de fábrica hasta la
               próxima vuelta. Medido en lucia-y-sebastian: «Con cariño, te
               esperamos» saltaba de verde oscuro a crema (invisible sobre el
               papel) varias veces por segundo, y en la portada de elena-y-julian
               los rótulos pasaban de oscuros a blancos sobre la foto clara.
               → Si la hoja ya dice exactamente esto, no se toca. */
            if (dTexto.get && dTexto.get.call(this) === v) return;
          }
          dTexto.set.call(this, v);
        }
      });
    }

    /* 5. Las que ya vinieran escritas en el HTML. Acá sí hay que mirarlas, pero
          este archivo corre antes del cuerpo, así que todavía no existe
          ninguna: es sólo por si alguna se cuela. */
    var repasar = function () {
      try {
        var imgs = document.querySelectorAll('img[src*="res.cloudinary.com"]');
        for (var i = 0; i < imgs.length; i++) {
          var a0 = imgs[i].getAttribute('src') || '';
          var n = fin(a0);
          if (n !== a0) imgs[i].setAttribute('src', n);
        }
      } catch (e) {}
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', repasar, { once: true });
    } else { repasar(); }

    /* 6. (1/10/2026, caché) video.src / audio.src / <source src> por propiedad,
          y los que ya vinieran escritos en el HTML. Sólo existe para la caché:
          sin INV_CACHE_MEDIOS no se instala nada. Va en su propio `try` para
          que un navegador raro no se lleve puesto lo de arriba. */
    if (BASE_CACHE) {
      try {
        [window.HTMLMediaElement, window.HTMLSourceElement].forEach(function (C) {
          if (!C) return;
          var d = Object.getOwnPropertyDescriptor(C.prototype, 'src');
          if (!d || !d.set) return;
          Object.defineProperty(C.prototype, 'src', {
            configurable: true, enumerable: d.enumerable, get: d.get,
            set: function (v) { d.set.call(this, alCache(v)); }
          });
        });
      } catch (e) {}
      var repasarMedios = function () {
        try {
          var ms = document.querySelectorAll('video[src*="res.cloudinary.com"],audio[src*="res.cloudinary.com"],source[src*="res.cloudinary.com"],video[poster*="res.cloudinary.com"]');
          for (var i = 0; i < ms.length; i++) {
            var s0 = ms[i].getAttribute('src');
            if (s0 && alCache(s0) !== s0) ms[i].setAttribute('src', alCache(s0));
            var p0 = ms[i].getAttribute('poster');
            if (p0 && fin(p0) !== p0) ms[i].setAttribute('poster', fin(p0));
          }
        } catch (e) {}
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', repasarMedios, { once: true });
      } else { repasarMedios(); }
    }

  } catch (e) {
    /* Si algo de esto no se puede hacer en este navegador, no pasa nada:
       la invitación sigue igual que siempre, con las fotos como están. */
  }
})();
