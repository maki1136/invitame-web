/* ============================================================================
   EL FILTRO DE LA BODA · la cámara con el marco, adentro de la invitación
   ============================================================================

   QUÉ ES Y POR QUÉ EXISTE (8/9/2026)
   A Maki le piden todo el tiempo "el filtro de la boda": un efecto de cámara
   con los nombres y la fecha, para que los invitados se saquen la selfie y la
   suban a sus historias. Ese producto se vendía como filtro de Instagram.

   ⚠️ EN INSTAGRAM YA NO EXISTE. Meta cerró Meta Spark el 14 de enero de 2025 y
      ese día borró de Instagram, Facebook y Messenger TODOS los efectos hechos
      por terceros. No hay reemplazo ni versión paga. Quedan Snapchat y TikTok,
      que obligan al invitado a tener esa app.

   Por eso el filtro vive acá adentro: el invitado ya está en la invitación, no
   se baja nada, y no depende de una plataforma que pueda apagarlo.

   CÓMO FUNCIONA
   1. Una sección con un botón. Al tocarlo se abre una capa a pantalla completa.
   2. La cámara en vivo con el marco encima. Botón para dar vuelta la cámara.
   3. El disparador arma una foto de 1080 × 1920 (9:16) = cámara + marco.
   4. La foto se guarda o se comparte, y —si la galería de la fiesta está
      prendida— se puede mandar directo a la galería.

   ⚠️ LA CÁMARA DEL NAVEGADOR NO SIEMPRE ESTÁ. Adentro del navegador de
      WhatsApp en iPhone, `getUserMedia` puede no andar. Cuando eso pasa NO se
      muestra un error: se abre la cámara del teléfono con el selector de
      archivos (`capture`), que funciona en todos lados, y el marco se compone
      igual. El invitado no se entera de la diferencia.

   ⚠️ EL MARCO SUBIDO SE PIDE CON crossOrigin. Sin eso el navegador "ensucia" el
      canvas y `toBlob` devuelve null: la foto no se puede guardar y no hay
      ningún error a la vista. Cloudinary responde con CORS abierto.

   ⚠️ EL `#` DE UN COLOR NO PUEDE IR CRUDO EN UN data:image/svg+xml. Por eso acá
      el marco de fábrica NO se dibuja con SVG: se dibuja con canvas, que además
      puede usar las tipografías que ya cargó la invitación. Un SVG dentro de un
      <img> no descarga fuentes web.

   ⚠️ LOS TEXTOS QUE LEE EL INVITADO VAN EN ESPAÑOL DE MÉXICO, no en voseo.
      Lo que escribe un módulo NO pasa por i/textos-es-mx.php.

   ⚠️ NADA DE LA BODA DE EJEMPLO. Si no hay nombres o no hay fecha, el marco de
      fábrica sale sin esa línea. Nunca con datos inventados.

   Se enciende desde el panel: fx.filtro = { encendido, marco, titulo, bajada,
   boton, colorMarco, vidriera, aGaleria }.
   ============================================================================ */
(function () {

  var ANCHO = 1080, ALTO = 1920;          /* 9:16, la medida de una historia */
  var ID_SEC = 'filtro-sec';
  var ID_CAPA = 'filtro-capa';
  var WORKER = 'https://galeria.littlemomentsok.workers.dev';
  var FORMA_GID = /^[A-Za-z0-9_-]{16,64}$/;

  var stream = null;      /* la cámara prendida, para poder apagarla */
  var camara = 'user';    /* 'user' = frontal (selfie) · 'environment' = trasera */
  var marco = null;       /* el marco ya resuelto, como <img> o <canvas> */

  function on(v) { return v === true || v === 'on' || v === 'si' || v === 1; }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function cfg() {
    var ev = window.INVEV;
    return (ev && ev.fx && ev.fx.filtro) ? ev.fx.filtro : null;
  }

  /* El color de la invitación. Si la paleta no está puesta, un marfil que
     queda bien sobre cualquier foto. */
  function acento() {
    var c = '';
    try {
      c = getComputedStyle(document.documentElement).getPropertyValue('--verde') || '';
    } catch (e) {}
    return (c || '').trim() || '#6D1233';
  }
  function tinta() {
    var k = cfg();
    if (k && k.colorMarco) return String(k.colorMarco);
    var c = '';
    try {
      c = getComputedStyle(document.documentElement).getPropertyValue('--cream') || '';
    } catch (e) {}
    return (c || '').trim() || '#F2E9D8';
  }

  /* ---------------------------------------------------------------- el marco */

  /* El de fábrica: dos filetes finos y, abajo, los nombres y la fecha con la
     tipografía de la invitación. Se dibuja una sola vez. */
  function marcoDeFabrica() {
    var ev = window.INVEV || {};
    var c = document.createElement('canvas');
    c.width = ANCHO; c.height = ALTO;
    var x = c.getContext('2d');
    var col = tinta();

    /* Un velo abajo para que el texto se lea sobre cualquier foto. */
    var velo = x.createLinearGradient(0, ALTO * 0.62, 0, ALTO);
    velo.addColorStop(0, 'rgba(20,12,16,0)');
    velo.addColorStop(1, 'rgba(20,12,16,.42)');
    x.fillStyle = velo;
    x.fillRect(0, ALTO * 0.62, ANCHO, ALTO * 0.38);

    /* Los dos filetes. */
    x.strokeStyle = col;
    x.globalAlpha = 0.9;  x.lineWidth = 4;  x.strokeRect(46, 46, ANCHO - 92, ALTO - 92);
    x.globalAlpha = 0.55; x.lineWidth = 2;  x.strokeRect(66, 66, ANCHO - 132, ALTO - 132);
    x.globalAlpha = 1;

    /* Los nombres. Si no hay, no se escribe nada: no se inventa una pareja. */
    var n1 = String(ev.n1 || '').trim();
    var n2 = String(ev.n2 || '').trim();
    var nombres = n1 && n2 ? (n1 + ' & ' + n2) : (n1 || n2 || '');

    x.textAlign = 'center';
    x.fillStyle = col;

    if (nombres) {
      var fuente = (ev.nfont && String(ev.nfont)) || "'Great Vibes', cursive";
      x.font = '120px ' + fuente;
      /* Si la tipografía elegida no entra en el ancho, se achica hasta entrar. */
      var tam = 120;
      while (tam > 46 && x.measureText(nombres).width > ANCHO - 220) {
        tam -= 4; x.font = tam + 'px ' + fuente;
      }
      x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 18; x.shadowOffsetY = 3;
      x.fillText(nombres, ANCHO / 2, ALTO - 250);
      x.shadowColor = 'transparent'; x.shadowBlur = 0; x.shadowOffsetY = 0;
    }

    var fecha = textoFecha(ev);
    if (fecha) {
      x.font = "42px 'Forum', 'Cormorant Garamond', Georgia, serif";
      x.globalAlpha = 0.92;
      x.fillText(espaciar(fecha.toUpperCase()), ANCHO / 2, ALTO - 168);
      x.globalAlpha = 1;
    }

    return c;
  }

  /* canvas no tiene letter-spacing: se mete un cabello de espacio a mano. */
  function espaciar(s) { return String(s).split('').join(' '); }

  function textoFecha(ev) {
    var t = String(ev.fechaTexto || '').trim();
    if (t) return t.slice(0, 40);
    var f = ev.fecha || ev.fechaISO || '';
    if (!f) return '';
    var d = new Date(f);
    if (isNaN(d.getTime())) return '';
    var M = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
             'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return d.getDate() + ' de ' + M[d.getMonth()] + ' de ' + d.getFullYear();
  }

  /* Devuelve el marco listo para dibujar. Promesa, porque el subido tarda. */
  function conseguirMarco() {
    if (marco) return Promise.resolve(marco);
    var k = cfg() || {};
    var url = String(k.marco || '').trim();
    if (!url) { marco = marcoDeFabrica(); return Promise.resolve(marco); }

    return new Promise(function (listo) {
      var img = new Image();
      /* ⚠️ SIN ESTO el canvas queda "sucio" y la foto no se puede guardar. */
      img.crossOrigin = 'anonymous';
      img.onload = function () { marco = img; listo(marco); };
      /* Si el marco subido no carga, la fiesta sigue: sale el de fábrica. */
      img.onerror = function () { marco = marcoDeFabrica(); listo(marco); };
      img.src = url;
    });
  }

  /* ------------------------------------------------------------- la sección */

  function seccion() {
    var k = cfg();
    var col = acento();
    var titulo = String(k.titulo || 'El filtro de la boda');
    var bajada = String(k.bajada || 'Tómate una foto con el marco de nuestra fiesta y compártela.');
    var boton  = String(k.boton  || 'Abrir la cámara');
    var vidriera = on(k.vidriera);

    var sec = document.createElement('section');
    sec.id = ID_SEC;
    sec.className = 'sec';
    sec.style.cssText = document.querySelector('.sec')
      ? 'text-align:center;'
      : 'text-align:center;padding:52px 22px;';

    sec.innerHTML =
      '<div style="display:inline-flex;align-items:center;justify-content:center;' +
        'width:62px;height:62px;border-radius:50%;margin-bottom:16px;' +
        'background:' + col + ';color:#fff;' +
        'box-shadow:0 2px 3px rgba(40,6,20,.22), 7px 9px 15px -3px rgba(40,6,20,.42),' +
        'inset 0 2px 0 rgba(255,255,255,.35), inset 0 -3px 7px rgba(0,0,0,.22);">' +
        '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
          'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<rect x="3" y="3" width="18" height="18" rx="3"/>' +
          '<circle cx="12" cy="12" r="4"/>' +
          '<path d="M7.2 7.2h.01M16.8 16.8h.01"/>' +
        '</svg>' +
      '</div>' +
      '<h2 style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:600;' +
        'font-size:2rem;line-height:1.15;margin:0 0 10px;">' + esc(titulo) + '</h2>' +
      '<p style="margin:0 auto 24px;max-width:34ch;opacity:.75;font-size:1rem;">' +
        esc(bajada) + '</p>' +
      '<button type="button" id="filtro-abrir"' +
        ' style="display:inline-block;padding:17px 38px;border:0;cursor:pointer;' +
        'font-family:inherit;border-radius:99px;background:' + col + ';color:#fff;' +
        'font-weight:700;font-size:1.06rem;letter-spacing:.01em;' +
        'box-shadow:0 1px 2px rgba(60,10,30,.16), 0 4px 7px rgba(60,10,30,.14),' +
        '0 12px 20px -5px rgba(60,10,30,.22), 0 26px 38px -14px rgba(60,10,30,.34),' +
        'inset 0 1.5px 0 rgba(255,255,255,.42), inset 0 -2px 5px rgba(0,0,0,.20);' +
        'transition:transform .14s cubic-bezier(.2,.8,.3,1), box-shadow .14s ease;">' +
        esc(boton) + '</button>' +
      (vidriera
        ? '<p style="margin:16px auto 0;max-width:34ch;opacity:.6;font-size:.86rem;">' +
            esc(k.notaVidriera || 'En tu invitación, este botón abre la cámara con el marco de tu fiesta.') +
          '</p>'
        : '');

    var b = sec.querySelector('#filtro-abrir');
    b.addEventListener('pointerdown', function () {
      b.style.transform = 'translateY(4px) scale(.985)';
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (e) {
      b.addEventListener(e, function () { b.style.transform = ''; });
    });
    b.addEventListener('click', abrir);

    return sec;
  }

  /* ----------------------------------------------------------------- la capa */

  function abrir() {
    if (document.getElementById(ID_CAPA)) return;
    var col = acento();

    var capa = document.createElement('div');
    capa.id = ID_CAPA;
    capa.style.cssText =
      'position:fixed;inset:0;z-index:99998;background:#0d0a0c;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'padding:0;overscroll-behavior:contain;';

    capa.innerHTML =
      '<div id="filtro-marco-caja" style="position:relative;width:100%;max-width:calc(100vh * 0.5625);' +
        'aspect-ratio:9/16;max-height:100%;background:#000;overflow:hidden;">' +
        '<video id="filtro-video" playsinline autoplay muted ' +
          'style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"></video>' +
        '<img id="filtro-vista" alt="" ' +
          'style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none;">' +
        '<img id="filtro-overlay" alt="" ' +
          'style="position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none;">' +
      '</div>' +
      '<div id="filtro-aviso" style="position:absolute;left:16px;right:16px;top:50%;' +
        'transform:translateY(-50%);color:#f4ece2;text-align:center;font-size:.98rem;' +
        'line-height:1.5;display:none;"></div>' +
      '<div id="filtro-barra" style="position:absolute;left:0;right:0;bottom:0;' +
        'padding:18px 16px calc(18px + env(safe-area-inset-bottom));' +
        'display:flex;align-items:center;justify-content:center;gap:18px;"></div>' +
      '<button type="button" id="filtro-cerrar" aria-label="Cerrar" ' +
        'style="position:absolute;top:calc(12px + env(safe-area-inset-top));right:12px;' +
        'width:44px;height:44px;border:0;border-radius:50%;cursor:pointer;' +
        'background:rgba(255,255,255,.16);color:#fff;display:flex;align-items:center;justify-content:center;">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
          'stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
      '<input type="file" id="filtro-archivo" accept="image/*" capture="user" style="display:none">';

    document.body.appendChild(capa);
    document.body.style.overflow = 'hidden';

    capa.querySelector('#filtro-cerrar').addEventListener('click', cerrar);
    capa.querySelector('#filtro-archivo').addEventListener('change', desdeArchivo);

    conseguirMarco().then(function (m) {
      var o = document.getElementById('filtro-overlay');
      if (o) o.src = (m.tagName === 'IMG') ? m.src : m.toDataURL('image/png');
      prenderCamara(col);
    });
  }

  function cerrar() {
    apagarCamara();
    var capa = document.getElementById(ID_CAPA);
    if (capa) capa.remove();
    document.body.style.overflow = '';
  }

  function apagarCamara() {
    if (stream) {
      try { stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
      stream = null;
    }
  }

  function prenderCamara(col) {
    var v = document.getElementById('filtro-video');
    if (!v) return;
    var puede = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    if (!puede) return porArchivo();

    apagarCamara();
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: camara, width: { ideal: 1080 }, height: { ideal: 1920 } },
      audio: false
    }).then(function (s) {
      stream = s;
      v.srcObject = s;
      v.style.transform = (camara === 'user') ? 'scaleX(-1)' : '';
      v.play().catch(function () {});
      barraDeCamara(col);
    }).catch(function () {
      /* Permiso negado, o un navegador de adentro de otra app que no la da.
         No se muestra un error: se usa la cámara del teléfono. */
      porArchivo();
    });
  }

  /* La salida que funciona en todos lados, incluido WhatsApp en iPhone. */
  function porArchivo() {
    var v = document.getElementById('filtro-video');
    var av = document.getElementById('filtro-aviso');
    var ov = document.getElementById('filtro-overlay');
    if (v) v.style.display = 'none';
    if (ov) ov.style.display = 'none';
    if (av) {
      av.style.display = 'block';
      av.textContent = 'Tómate la foto con la cámara de tu teléfono y le ponemos el marco.';
    }
    barraDeArchivo();
    var inp = document.getElementById('filtro-archivo');
    if (inp) inp.click();
  }

  function desdeArchivo(e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var img = new Image();
    img.onload = function () {
      componer(img, img.naturalWidth, img.naturalHeight, false).then(mostrarResultado);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(f);
  }

  /* ------------------------------------------------------------- los botones */

  function limpiarBarra() {
    var b = document.getElementById('filtro-barra');
    if (b) b.textContent = '';
    return b;
  }

  function boton(texto, alTocar, principal) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = texto;
    b.style.cssText = 'font-family:inherit;border:0;cursor:pointer;border-radius:99px;' +
      'padding:14px 26px;font-weight:700;font-size:.98rem;' +
      (principal
        ? 'background:' + acento() + ';color:#fff;box-shadow:0 8px 18px -6px rgba(0,0,0,.6);'
        : 'background:rgba(255,255,255,.16);color:#f4ece2;');
    b.addEventListener('click', alTocar);
    return b;
  }

  function barraDeCamara(col) {
    var b = limpiarBarra();
    if (!b) return;

    var girar = document.createElement('button');
    girar.type = 'button';
    girar.setAttribute('aria-label', 'Cambiar de cámara');
    girar.style.cssText = 'width:48px;height:48px;border:0;border-radius:50%;cursor:pointer;' +
      'background:rgba(255,255,255,.16);color:#fff;display:flex;align-items:center;justify-content:center;';
    girar.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M3 12a9 9 0 0 1 14.5-7"/><path d="M21 12a9 9 0 0 1-14.5 7"/>' +
      '<path d="M17.5 2v3.5H14"/><path d="M6.5 22v-3.5H10"/></svg>';
    girar.addEventListener('click', function () {
      camara = (camara === 'user') ? 'environment' : 'user';
      prenderCamara(col);
    });

    var tirar = document.createElement('button');
    tirar.type = 'button';
    tirar.setAttribute('aria-label', 'Tomar la foto');
    tirar.style.cssText = 'width:74px;height:74px;border-radius:50%;cursor:pointer;' +
      'border:5px solid rgba(255,255,255,.85);background:' + (col || '#fff') + ';' +
      'box-shadow:0 10px 24px -8px rgba(0,0,0,.7);';
    tirar.addEventListener('click', disparar);

    b.appendChild(girar);
    b.appendChild(tirar);
    b.appendChild(hueco());
  }

  function barraDeArchivo() {
    var b = limpiarBarra();
    if (!b) return;
    b.appendChild(boton('Tomar la foto', function () {
      var inp = document.getElementById('filtro-archivo');
      if (inp) inp.click();
    }, true));
  }

  function hueco() {
    var d = document.createElement('div');
    d.style.cssText = 'width:48px;height:48px';
    return d;
  }

  /* -------------------------------------------------------------- la captura */

  function disparar() {
    var v = document.getElementById('filtro-video');
    if (!v || !v.videoWidth) return;
    componer(v, v.videoWidth, v.videoHeight, camara === 'user').then(mostrarResultado);
  }

  /* Dibuja la foto recortada a 9:16 y le pone el marco encima. */
  function componer(fuente, fw, fh, espejo) {
    return conseguirMarco().then(function (m) {
      var c = document.createElement('canvas');
      c.width = ANCHO; c.height = ALTO;
      var x = c.getContext('2d');

      /* Recorte "cover": se llena la caja y se corta lo que sobra. */
      var escala = Math.max(ANCHO / fw, ALTO / fh);
      var w = fw * escala, h = fh * escala;
      var dx = (ANCHO - w) / 2, dy = (ALTO - h) / 2;

      if (espejo) { x.translate(ANCHO, 0); x.scale(-1, 1); }
      x.drawImage(fuente, dx, dy, w, h);
      if (espejo) { x.setTransform(1, 0, 0, 1, 0, 0); }

      x.drawImage(m, 0, 0, ANCHO, ALTO);
      return c;
    });
  }

  function mostrarResultado(canvas) {
    apagarCamara();
    var v = document.getElementById('filtro-video');
    var vista = document.getElementById('filtro-vista');
    var ov = document.getElementById('filtro-overlay');
    var av = document.getElementById('filtro-aviso');
    if (v) v.style.display = 'none';
    if (ov) ov.style.display = 'none';
    if (av) av.style.display = 'none';
    if (vista) {
      vista.src = canvas.toDataURL('image/jpeg', 0.92);
      vista.style.display = 'block';
    }

    var b = limpiarBarra();
    if (!b) return;

    b.appendChild(boton('Otra foto', function () {
      if (vista) vista.style.display = 'none';
      if (ov) ov.style.display = '';
      if (v) v.style.display = '';
      prenderCamara(acento());
    }));

    b.appendChild(boton('Guardar', function () { guardar(canvas); }, true));

    if (gidGaleria()) {
      b.appendChild(boton('A la galería', function (e) {
        enviarAGaleria(canvas, e.target);
      }));
    }
  }

  function nombreArchivo() {
    var ev = window.INVEV || {};
    var s = String(ev.slug || 'invitame').replace(/[^a-z0-9-]/gi, '');
    return s + '-filtro.jpg';
  }

  /* Compartir es lo que la gente espera en el teléfono; si no está, se baja. */
  function guardar(canvas) {
    canvas.toBlob(function (blob) {
      if (!blob) return;
      var archivo = null;
      try { archivo = new File([blob], nombreArchivo(), { type: 'image/jpeg' }); } catch (e) {}
      if (archivo && navigator.canShare && navigator.canShare({ files: [archivo] })) {
        navigator.share({ files: [archivo] }).catch(function () {});
        return;
      }
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nombreArchivo();
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    }, 'image/jpeg', 0.92);
  }

  /* ------------------------------------------------------- ir a la galería */

  /* Sólo si la galería de ESTA fiesta está prendida y tiene un código válido.
     En una muestra no hay galería: sin código, el botón no aparece. */
  function gidGaleria() {
    var k = cfg() || {};
    if (!on(k.aGaleria)) return '';
    var ev = window.INVEV;
    var g = ev && ev.fx && ev.fx.galeria;
    if (!g || !on(g.encendido) || on(g.vidriera)) return '';
    var id = String(g.gid || '').trim();
    return FORMA_GID.test(id) ? id : '';
  }

  function nombreInvitado() {
    var e = document.getElementById('pv-gname');
    var n = e ? String(e.textContent || '').trim() : '';
    if (!n) {
      var r = document.getElementById('rname');
      n = r ? String(r.value || '').trim() : '';
    }
    return n.slice(0, 40) || 'Invitado';
  }

  function tokenInvitado() {
    try {
      if (window.INVDATA && window.INVDATA.token) return String(window.INVDATA.token);
    } catch (e) {}
    return new URLSearchParams(location.search).get('g') || '';
  }

  function enviarAGaleria(canvas, btn) {
    var gid = gidGaleria();
    if (!gid) return;
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }

    achicar(canvas, 320).then(function (thumb) {
      canvas.toBlob(function (foto) {
        if (!foto) { if (btn) btn.textContent = 'No se pudo'; return; }
        var fd = new FormData();
        fd.append('gid', gid);
        fd.append('autor', JSON.stringify({
          nombre: nombreInvitado(), origen: 'invitacion', token: tokenInvitado() || null
        }));
        fd.append('w', String(ANCHO));
        fd.append('h', String(ALTO));
        fd.append('foto', foto, 'f');
        fd.append('thumb', thumb, 't');
        fetch(WORKER + '/subir', { method: 'POST', body: fd })
          .then(function (r) {
            if (btn) {
              btn.textContent = r.ok ? 'Ya está en la galería' : 'No se pudo';
              btn.disabled = r.ok;
            }
          })
          .catch(function () { if (btn) { btn.textContent = 'No se pudo'; btn.disabled = false; } });
      }, 'image/jpeg', 0.9);
    });
  }

  function achicar(canvas, ancho) {
    return new Promise(function (listo) {
      var c = document.createElement('canvas');
      c.width = ancho;
      c.height = Math.round(ancho * ALTO / ANCHO);
      c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height);
      c.toBlob(function (b) { listo(b); }, 'image/jpeg', 0.7);
    });
  }

  /* --------------------------------------------------------------- arranque */

  /* Se cuelga entre las secciones reales, adentro de `.frame`. Colgarla del
     body la dejaría FUERA de la caja de la invitación (ver galeria.js). */
  function colgar(sec) {
    var marcoInv = document.querySelector('.frame') || document.body;
    var antes = document.getElementById('gal-seccion')
             || document.getElementById('contacto-sec')
             || document.getElementById('share-sec')
             || document.querySelector('.cierre, #cierre, footer');
    if (antes && antes.parentNode) { antes.parentNode.insertBefore(sec, antes); return; }
    marcoInv.appendChild(sec);
  }

  function arrancar() {
    var k = cfg();
    if (!k || !on(k.encendido)) return;
    if (document.getElementById(ID_SEC)) return;
    colgar(seccion());
  }

  if (window.INVEV) arrancar();
  else {
    var intentos = 0;
    var t = setInterval(function () {
      if (window.INVEV || ++intentos > 40) { clearInterval(t); arrancar(); }
    }, 250);
  }
})();
