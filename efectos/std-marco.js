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
  var VER = '2';

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
    function entregar(b, nombre) { return entregarArchivos([[b, nombre]]); }
    /* devuelve 'listo' (entregada) o 'otra-vez' (la armó, pero hace falta un toque más) */
    function descargar(nombre) {
      var k = clave();
      if (foto && fotoDe === k) return entregar(foto, nombre).then(function () { return 'listo'; }, function () { return 'otra-vez'; });
      return sacar().then(function (b) { return entregar(b, nombre).then(function () { return 'listo'; }, function () { return 'otra-vez'; }); });
    }
    return { listo: listo, armar: armar, descargar: descargar };
  }

  /* Entrega una o varias imágenes: en el celular, la hoja de compartir («Guardar
     en Fotos»); en la compu, una descarga por archivo. Si el celular dice que no
     (pasó mucho tiempo desde el toque), la promesa falla y el panel pide otro toque. */
  function entregarArchivos(lista) {
    var files = [];
    try { files = lista.map(function (x) { return new File([x[0]], x[1], { type: 'image/jpeg' }); }); } catch (e) { files = []; }
    var tactil = matchMedia('(pointer:coarse)').matches;
    if (files.length && tactil && navigator.canShare && navigator.canShare({ files: files })) {
      return navigator.share({ files: files }).then(function () { return true; }, function (e) { if (e && e.name === 'AbortError') return true; throw e; });
    }
    lista.forEach(function (x, i) {
      setTimeout(function () {
        var a = document.createElement('a'); a.href = URL.createObjectURL(x[0]); a.download = x[1];
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 60000);
      }, i * 600);
    });
    return Promise.resolve(true);
  }

  /* EL RECUERDO (la invitación entera, efectos/recuerdo.js). Se arma en un iframe
     aparte de 390 × 844, fuera de la vista, y tarda: ~2 minutos. Devuelve
     {descargar()} cuando está listo; `avisar(texto)` cuenta por dónde va. */
  function recuerdo(slug, avisar) {
    avisar = avisar || function () {};
    var fr = document.createElement('iframe');
    fr.setAttribute('aria-hidden', 'true'); fr.setAttribute('tabindex', '-1');
    fr.style.cssText = 'position:fixed;left:-10000px;top:0;width:390px;height:844px;border:0;opacity:0;pointer-events:none';
    document.body.appendChild(fr);
    var hecho = new Promise(function (ok, no) {
      fr.onload = function () {
        try {
          var w = fr.contentWindow, d = fr.contentDocument;
          var s1 = d.createElement('script'); s1.src = '/efectos/save-the-date.js?v=' + VER;
          s1.onload = function () {
            var s2 = d.createElement('script'); s2.src = '/efectos/recuerdo.js?v=' + VER;
            s2.onload = function () { w.INVREC.armar(avisar).then(ok, no); };
            s2.onerror = function () { no(new Error('No cargó el armado del recuerdo.')); };
            d.head.appendChild(s2);
          };
          s1.onerror = function () { no(new Error('No cargó el armado del recuerdo.')); };
          d.head.appendChild(s1);
        } catch (e) { no(e); }
      };
      fr.src = '/i/?e=' + encodeURIComponent(slug) + '&recuerdo=1&cb=' + Date.now();
    });
    return hecho.then(function (r) {
      fr.remove();
      var lista = [[r.hoja, 'recuerdo-' + slug + '-en-una-hoja.jpg']];
      r.partes.forEach(function (b, i) { lista.push([b, 'recuerdo-' + slug + '-parte-' + (i + 1) + '-de-' + r.partes.length + '.jpg']); });
      return { cuantas: lista.length, descargar: function () { return entregarArchivos(lista).then(function () { return 'listo'; }, function () { return 'otra-vez'; }); } };
    }, function (e) { fr.remove(); throw e; });
  }

  /* El botón del recuerdo, igual en los dos paneles. `b` es un <button> ya
     estilado por cada panel; `nota` un elemento donde se cuenta el avance. */
  function botonRecuerdo(b, nota, slugDe) {
    var listo = null, base = b.textContent;
    b.onclick = function () {
      var slug = slugDe(); if (!slug) return;
      if (listo) {
        b.disabled = true;
        listo.descargar().then(function (r) {
          b.disabled = false;
          if (r === 'listo') { b.textContent = base; nota.textContent = 'Listo: ' + listo.cuantas + ' imágenes (la hoja con todo y la invitación larga en partes).'; listo = null; }
        });
        return;
      }
      b.disabled = true; b.textContent = 'Armando el recuerdo…';
      nota.textContent = 'Tarda un par de minutos: recorre la invitación entera. No cierres esta pantalla.';
      recuerdo(slug, function (txt) { nota.textContent = txt + ' (no cierres esta pantalla)'; }).then(function (r) {
        listo = r;
        return r.descargar().then(function (res) {
          b.disabled = false;
          if (res === 'otra-vez') { b.textContent = 'Guardar el recuerdo'; nota.textContent = 'Ya está listo: tocá el botón para guardarlo.'; }
          else { b.textContent = base; nota.textContent = 'Listo: ' + r.cuantas + ' imágenes (la hoja con todo y la invitación larga en partes).'; listo = null; }
        });
      }).catch(function () { b.disabled = false; b.textContent = base; nota.textContent = 'No se pudo armar el recuerdo. ¿Está publicada la invitación? Probá de nuevo.'; });
    };
  }

  window.INVSTD_MARCO = { crear: crear, recuerdo: recuerdo, botonRecuerdo: botonRecuerdo };
})();
