/* ===== EL SAVE THE DATE EN LOS PANELES: LA VISTA PREVIA Y LA DESCARGA (9/10/2026) =====

   Lo usan los dos paneles con el MISMO código, para que lo que ve la diseñadora
   en admin.html sea exactamente lo que bajan los novios en mi-panel.html:
     · efectos/panel-save-the-date.js (admin, pestaña EFECTOS)
     · mi-panel.js, vista «Save the date»

     var m = INVSTD_MARCO.crear(caja, slug);   // la invitación PUBLICADA, en chico
     m.listo.then(function (r) { … });         // r.auto = los textos que salen solos,
                                               // r.disenio = los que dejó la diseñadora (fx.std publicado)
     m.armar({titulo, frase, nombres, fecha, detalle, pie});
     m.descargar('save-the-date-camila-y-tomas.jpg');

   Adentro hay un iframe de 360 × 640 (la medida de la imagen, dividida por 3)
   con la invitación publicada y efectos/save-the-date.js, que es el que arma y
   saca la foto. Ver el porqué allá.

   ⚠️ LA IMAGEN SE PREPARA ANTES DEL TOQUE. En el iPhone, «Guardar en Fotos»
   (compartir) sólo se abre si sale del toque mismo; si en el medio hay 5
   segundos de armado, Safari lo niega. Por eso se vuelve a sacar sola cada vez
   que cambia un texto (2 s después de dejar de escribir) y el botón la entrega
   ya hecha. Si todavía no está, se arma y el botón pasa a «Guardar la imagen».
   ============================================================================ */
(function () {
  if (window.INVSTD_MARCO) return;
  var VER = '1';

  function crear(caja, slug) {
    caja.innerHTML = '';
    var marco = document.createElement('div');
    marco.style.cssText = 'position:relative;width:180px;height:320px;border-radius:12px;overflow:hidden;background:#eee;box-shadow:0 10px 26px -14px rgba(0,0,0,.5);flex:none';
    var fr = document.createElement('iframe');
    fr.setAttribute('title', 'Vista previa del save the date');
    fr.setAttribute('scrolling', 'no');
    fr.style.cssText = 'position:absolute;left:0;top:0;width:360px;height:640px;border:0;transform:scale(.5);transform-origin:0 0;pointer-events:none';
    var velo = document.createElement('div');
    velo.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:16px;font:600 12px/1.4 system-ui,sans-serif;color:#6b5f6f;background:#f3eff4';
    velo.textContent = 'Preparando el save the date…';
    marco.appendChild(fr); marco.appendChild(velo); caja.appendChild(marco);

    var datos = null, foto = null, fotoDe = null, sacando = null, timer = null;
    var clave = function () { return JSON.stringify(datos || {}); };

    var listo = new Promise(function (ok, no) {
      var tope = setTimeout(function () { no(new Error('La invitación tardó demasiado en abrir.')); }, 90000);
      fr.onload = function () {
        try {
          var w = fr.contentWindow, d = fr.contentDocument;
          var s = d.createElement('script'); s.src = '/efectos/save-the-date.js?v=' + VER;
          s.onload = function () { w.INVSTD.preparar().then(function (r) { clearTimeout(tope); velo.remove(); ok(r); }, no); };
          s.onerror = function () { no(new Error('No cargó el armado del save the date.')); };
          d.head.appendChild(s);
        } catch (e) { no(e); }
      };
      fr.src = '/i/?e=' + encodeURIComponent(slug) + '&std=1&cb=' + Date.now();
    });
    listo.catch(function (e) { velo.textContent = (e && e.message) || 'No se pudo abrir la invitación.'; velo.style.color = '#a3333d'; });

    function sacar() {
      var k = clave();
      if (foto && fotoDe === k) return Promise.resolve(foto);
      if (sacando && sacando.k === k) return sacando.p;
      var p = listo.then(function () { return fr.contentWindow.INVSTD.capturar(); })
        .then(function (b) { if (clave() === k) { foto = b; fotoDe = k; } return b; });
      sacando = { k: k, p: p };
      return p;
    }
    function armar(d) {
      datos = d;
      listo.then(function () { fr.contentWindow.INVSTD.armar(d); });
      clearTimeout(timer); timer = setTimeout(function () { sacar().catch(function () {}); }, 2000);
    }
    function entregar(b, nombre) {
      var file = null;
      try { file = new File([b], nombre, { type: 'image/jpeg' }); } catch (e) {}
      var tactil = matchMedia('(pointer:coarse)').matches;
      if (file && tactil && navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({ files: [file] }).then(function () { return true; }, function (e) { if (e && e.name === 'AbortError') return true; throw e; });
      }
      var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nombre;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 60000);
      return Promise.resolve(true);
    }
    /* devuelve 'listo' (entregada) o 'otra-vez' (la armó, pero hace falta un toque más) */
    function descargar(nombre) {
      var k = clave();
      if (foto && fotoDe === k) return entregar(foto, nombre).then(function () { return 'listo'; }, function () { return 'otra-vez'; });
      return sacar().then(function (b) { return entregar(b, nombre).then(function () { return 'listo'; }, function () { return 'otra-vez'; }); });
    }
    return { listo: listo, armar: armar, descargar: descargar };
  }

  window.INVSTD_MARCO = { crear: crear };
})();
