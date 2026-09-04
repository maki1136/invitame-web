/* ===== UN MENSAJE DE VOZ PARA CADA INVITADO ==================================
   Lo graban LOS NOVIOS, desde su propio panel, uno por uno. Aparece un punto
   rojo al lado de cada persona de la lista: se aprieta, se graba, se escucha, y
   recien ahi se guarda. Ese audio queda pegado a ESA ficha y lo escucha SOLO esa
   persona cuando abre su link. Puede ser para todos o para uno solo.

   POR QUE ESTE MODULO EXISTE APARTE DE mi-panel.js
   mi-panel.js pesa 39 KB y el techo de una subida al repo es ~45 KB. Metiendo
   esto adentro, cualquier retoque del grabador obligaria a reescribir el panel
   entero. Aca vive todo lo del audio; mi-panel.js solo pone el boton y presta
   sus datos por window.MIPANEL.

   COMO VIAJA EL AUDIO
     1. se graba con MediaRecorder            (nunca sale del navegador todavia)
     2. se mide la onda ACA, con el archivo en memoria
     3. se sube a Cloudinary                  (para Cloudinary un audio es video)
     4. se guarda en la ficha por /pase-voz-guardar.php

   /!\ EL PASO 4 NO ES UN CAPRICHO. Las reglas de Firestore NO dejan que los
       novios escriban en inv_invitados, y esta bien: en ese mismo documento
       viven los pases que lee el escaner de la puerta. Cualquiera con la clave
       del panel podria regalarse ingresos. Por eso escribe el servidor, que
       antes chequea la clave y que el invitado sea de ese evento.

   /!\ LA ONDA SE MIDE ACA Y NO EN LA INVITACION. Son 26 numeros que dibujan las
       rayitas del boleto sin bajar el audio. Si se calcularan al abrir la
       invitacion habria que bajar el audio siempre, y se perderia el ahorro.

   /!\ EL MICROFONO SOLO ANDA EN https. En http el navegador ni pregunta.
   ========================================================================== */
(function () {
  'use strict';

  var ABC   = '0123456789abcdefghijklmnopqrstuvwxyz';
  var TOPE  = 60000;                     /* un minuto, igual que en crear.html */
  var CLOUD = { name: 'oc8cgqt4', preset: 'invitame_unsigned', folder: 'invitame' };
  var APIKEY = 'AIzaSyBXWZc9xdpXx7HCkJfxcyofgI00buNlIXc';   /* la web key es publica */

  function P() { return window.MIPANEL || null; }

  /* ---- la pinta ---------------------------------------------------------- */
  function estilo() {
    if (document.getElementById('pv-mic-css')) return;
    var s = document.createElement('style');
    s.id = 'pv-mic-css';
    s.textContent = [
      '.pv-mic{width:26px;height:26px;padding:0;border-radius:50%;cursor:pointer;',
      '  border:1px solid #d9d2c8;background:#fff;display:inline-flex;',
      '  align-items:center;justify-content:center}',
      '.pv-mic::before{content:"";width:9px;height:9px;border-radius:50%;background:#d93b3b}',
      '.pv-mic.tiene{border-color:#3d8b4a}',
      '.pv-mic.tiene::before{background:#3d8b4a}',

      '.pv-tapa{position:fixed;inset:0;z-index:9999;background:rgba(30,24,18,.46);',
      '  display:flex;align-items:center;justify-content:center;padding:16px}',
      '.pv-caja{background:#fff;border-radius:14px;max-width:430px;width:100%;',
      '  padding:20px 20px 16px;box-shadow:0 18px 50px rgba(30,24,18,.3);',
      '  font-family:inherit;color:#3a332c;max-height:90vh;overflow:auto}',
      '.pv-caja h3{margin:0 0 2px;font-size:17px}',
      '.pv-caja .quien{margin:0 0 14px;font-size:13px;color:#8a7f73}',
      '.pv-caja .est{font-size:13px;color:#6b6058;line-height:1.5;margin:12px 0 0;min-height:20px}',
      '.pv-caja audio{width:100%;margin-top:12px}',
      '.pv-rec{width:100%;padding:13px;border-radius:10px;border:0;cursor:pointer;',
      '  background:#d93b3b;color:#fff;font-size:15px;font-weight:600;font-family:inherit}',
      '.pv-rec.grabando{background:#3a332c}',
      '.pv-fila{display:flex;gap:8px;margin-top:12px}',
      '.pv-fila button{flex:1;padding:11px;border-radius:10px;cursor:pointer;font-family:inherit;',
      '  font-size:14px;border:1px solid #d9d2c8;background:#fff;color:#3a332c}',
      '.pv-fila button.ok{background:#3d8b4a;border-color:#3d8b4a;color:#fff;font-weight:600}',
      '.pv-fila button.mal{color:#b03a3a}',
      '.pv-cerrar{margin-top:14px;width:100%;background:none;border:0;cursor:pointer;',
      '  color:#8a7f73;font-size:13px;font-family:inherit;padding:6px}',
      '.pv-apagado{margin:10px 0 0;padding:9px 11px;border-radius:9px;font-size:12.5px;',
      '  line-height:1.5;background:#fdf3e2;color:#8a6a2f}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ---- la onda: 26 picos, normalizados contra el mas alto ----------------- */
  function medir(blob) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return Promise.resolve('');
    return blob.arrayBuffer()
      .then(function (buf) { return new AC().decodeAudioData(buf); })
      .then(function (audio) {
        var d = audio.getChannelData(0), paso = Math.floor(d.length / 26) || 1;
        var picos = [], i, k, m, tope, v;
        for (i = 0; i < 26; i++) {
          m = 0; tope = Math.min(d.length, (i + 1) * paso);
          for (k = i * paso; k < tope; k++) { v = d[k] < 0 ? -d[k] : d[k]; if (v > m) m = v; }
          picos.push(m);
        }
        var alto = Math.max.apply(null, picos) || 1;
        return picos.map(function (p) {
          return ABC.charAt(Math.max(0, Math.min(35, Math.round(p / alto * 35))));
        }).join('');
      })
      .catch(function () { return ''; });   /* sin onda el pase igual anda */
  }

  /* ---- Cloudinary: para Cloudinary un audio es un video sin imagen -------- */
  function subir(blob) {
    var fd = new FormData();
    fd.append('file', new File([blob], 'pase-voz.webm', { type: blob.type || 'audio/webm' }));
    fd.append('upload_preset', CLOUD.preset);
    fd.append('folder', CLOUD.folder);
    return fetch('https://api.cloudinary.com/v1_1/' + CLOUD.name + '/video/upload',
                 { method: 'POST', body: fd })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.secure_url) return j.secure_url;
        throw new Error((j && j.error && j.error.message) || 'No se pudo subir el audio');
      });
  }

  /* ---- el servidor: el unico que puede escribir en la ficha --------------- */
  function guardarEnLaFicha(token, url, onda) {
    var p = P();
    return fetch('/pase-voz-guardar.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: p.slug, clave: p.clave, token: token, audio: url, onda: onda || '' })
    })
      .then(function (r) { return r.json().catch(function () { return null; }); })
      .then(function (j) {
        if (j && j.ok) return true;
        var e = (j && j.error) || 'red';
        /* las claves son EXACTAMENTE las que devuelve pase-voz-guardar.php */
        throw new Error({
          'clave':          'Tu clave no coincide. Volvé a entrar al panel.',
          'invitado':       'No encontramos a esa persona en tu lista.',
          'invitado-ajeno': 'Esa persona no es de tu evento.',
          'audio-ajeno':    'Ese audio no salió de nuestro servidor.',
          'faltan-datos':   'Faltaron datos. Recargá el panel y probá de nuevo.',
          'muy-grande':     'El pedido salió demasiado grande.',
          'sin-config':     'El servidor no está configurado. Avisanos.',
          'login':          'El servidor no pudo entrar a la base. Probá en un rato.',
          'guardar':        'La base no aceptó el cambio. Probá en un rato.',
          'metodo':         'El pedido salió mal armado.'
        }[e] || 'No se pudo guardar (' + e + ').');
      });
  }

  /* ---- ¿esta prendido el pase con voz en la invitacion? -------------------
     Si esta apagado, el audio se guarda igual pero NO SE VE, y los novios
     grabarian veinte mensajes al vacio. Una lectura chica al evento evita esa
     trampa. Si el evento es privado la regla no deja leerlo: ahi no se dice
     nada, que es mejor que decir algo falso.                                  */
  var prendido = null;
  function revisarSiEstaPrendido() {
    if (prendido !== null) return Promise.resolve(prendido);
    var p = P(); if (!p || !p.slug) return Promise.resolve(null);
    return fetch('https://firestore.googleapis.com/v1/projects/invitame-9b51f/databases/(default)' +
                 '/documents/inv_eventos/' + encodeURIComponent(p.slug) + '?key=' + APIKEY)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        try {
          var f = j.fields.fx.mapValue.fields.pasevoz.mapValue.fields;
          prendido = !!(f.encendido && f.encendido.booleanValue);
        } catch (e) { prendido = null; }
        return prendido;
      })
      .catch(function () { return null; });
  }

  /* ---- el cartel ---------------------------------------------------------- */
  function abrir(token) {
    var p = P(); if (!p) return;
    var g = p.invitado(token); if (!g) return;
    estilo();

    var tapa = document.createElement('div');
    tapa.className = 'pv-tapa';
    tapa.innerHTML =
      '<div class="pv-caja" role="dialog" aria-modal="true">' +
        '<h3>Un mensaje de voz</h3>' +
        '<p class="quien"></p>' +
        '<div class="pv-avisoOff"></div>' +
        '<button class="pv-rec" type="button">Grabar</button>' +
        '<audio class="pv-oir" controls style="display:none"></audio>' +
        '<div class="pv-fila" style="display:none">' +
          '<button type="button" class="ok">Guardar</button>' +
          '<button type="button" class="otra">Grabar otro</button>' +
        '</div>' +
        '<div class="pv-fila pv-quitar" style="display:none">' +
          '<button type="button" class="mal">Quitar este mensaje</button>' +
        '</div>' +
        '<p class="est"></p>' +
        '<button class="pv-cerrar" type="button">Cerrar</button>' +
      '</div>';
    document.body.appendChild(tapa);

    var caja   = tapa.querySelector('.pv-caja');
    var rec    = tapa.querySelector('.pv-rec');
    var oir    = tapa.querySelector('.pv-oir');
    var fila   = tapa.querySelector('.pv-fila');
    var bOk    = tapa.querySelector('.ok');
    var bOtra  = tapa.querySelector('.otra');
    var quitar = tapa.querySelector('.pv-quitar');
    var bMal   = tapa.querySelector('.mal');
    var est    = tapa.querySelector('.est');
    var avisoOff = tapa.querySelector('.pv-avisoOff');

    tapa.querySelector('.quien').textContent = 'Para ' + (g.nombre || 'esta persona');

    var grabadora = null, trozos = [], corte = null, blobListo = null, urlLocal = '';

    function cerrar() {
      try { if (grabadora && grabadora.state === 'recording') grabadora.stop(); } catch (e) {}
      if (corte) clearTimeout(corte);
      if (urlLocal) URL.revokeObjectURL(urlLocal);
      tapa.parentNode && tapa.parentNode.removeChild(tapa);
      document.removeEventListener('keydown', porEscape);
    }
    function porEscape(e) { if (e.key === 'Escape') cerrar(); }
    document.addEventListener('keydown', porEscape);
    tapa.addEventListener('click', function (e) { if (e.target === tapa) cerrar(); });
    tapa.querySelector('.pv-cerrar').addEventListener('click', cerrar);

    /* estado de arranque: ya tiene uno guardado, o no tiene nada */
    if (g.pasevozAudio) {
      oir.src = g.pasevozAudio; oir.style.display = 'block';
      quitar.style.display = 'flex';
      est.textContent = 'Ya tiene un mensaje. Podes escucharlo, grabar otro encima o quitarlo.';
      rec.textContent = 'Grabar otro';
    } else {
      est.textContent = 'Hasta 60 segundos. Se graba desde el celular o la computadora.';
    }

    revisarSiEstaPrendido().then(function (ok) {
      if (ok === false) {
        avisoOff.innerHTML = '<p class="pv-apagado">El pase con voz esta apagado en tu invitacion, ' +
          'asi que estos mensajes todavia no se escuchan. Pedile a quien te armo la invitacion que lo prenda.</p>';
      }
    });

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      rec.style.opacity = '.5'; rec.style.pointerEvents = 'none';
      est.textContent = 'Este navegador no puede grabar. Probá desde el celular, o mandanos el audio y lo cargamos nosotros.';
      return;
    }

    function parar() {
      if (corte) { clearTimeout(corte); corte = null; }
      if (grabadora && grabadora.state !== 'inactive') grabadora.stop();
    }

    function arrancar() {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (senal) {
        trozos = []; grabadora = new MediaRecorder(senal);
        grabadora.ondataavailable = function (e) { if (e.data && e.data.size) trozos.push(e.data); };
        grabadora.onstop = function () {
          senal.getTracks().forEach(function (t) { t.stop(); });   /* apaga el microfono */
          var blob = new Blob(trozos, { type: grabadora.mimeType || 'audio/webm' });
          rec.classList.remove('grabando');
          if (blob.size <= 1000) {
            rec.textContent = 'Grabar'; est.textContent = 'Quedo muy cortito. Proba de nuevo.';
            return;
          }
          blobListo = blob;
          if (urlLocal) URL.revokeObjectURL(urlLocal);
          urlLocal = URL.createObjectURL(blob);
          oir.src = urlLocal; oir.style.display = 'block';
          rec.style.display = 'none';
          quitar.style.display = 'none';
          fila.style.display = 'flex';
          est.textContent = 'Escuchalo. Si te gusta, guardalo; si no, grabalo de nuevo.';
        };
        grabadora.start();
        rec.textContent = 'Detener';
        rec.classList.add('grabando');
        est.textContent = 'Grabando… hablá tranquilo.';
        corte = setTimeout(parar, TOPE);          /* el minuto, solo */
      }).catch(function () {
        est.textContent = 'No nos dejó usar el micrófono. Se habilita en los permisos del navegador.';
      });
    }

    rec.addEventListener('click', function () {
      if (grabadora && grabadora.state === 'recording') parar(); else arrancar();
    });

    bOtra.addEventListener('click', function () {
      blobListo = null;
      fila.style.display = 'none';
      oir.style.display = 'none'; oir.removeAttribute('src');
      rec.style.display = 'block'; rec.textContent = 'Grabar';
      est.textContent = 'Hasta 60 segundos.';
    });

    bOk.addEventListener('click', function () {
      if (!blobListo) return;
      bOk.disabled = bOtra.disabled = true;
      est.textContent = 'Subiendo el mensaje…';
      Promise.all([subir(blobListo), medir(blobListo)])
        .then(function (r) { return guardarEnLaFicha(token, r[0], r[1]); })
        .then(function () {
          est.textContent = 'Guardado. Ya lo escucha ' + (g.nombre || 'esa persona') + ' al abrir su link.';
          if (P().toast) P().toast('Mensaje guardado');
          return P().recargar();
        })
        .then(cerrar)
        .catch(function (err) {
          bOk.disabled = bOtra.disabled = false;
          est.textContent = err.message || 'No se pudo guardar.';
        });
    });

    bMal.addEventListener('click', function () {
      if (!confirm('¿Quitar el mensaje de voz de ' + (g.nombre || 'esta persona') + '?')) return;
      bMal.disabled = true;
      est.textContent = 'Quitando…';
      /* audio vacio = borrar. Asi lo entiende pase-voz-guardar.php a proposito. */
      guardarEnLaFicha(token, '', '')
        .then(function () {
          if (P().toast) P().toast('Mensaje quitado');
          return P().recargar();
        })
        .then(cerrar)
        .catch(function (err) {
          bMal.disabled = false;
          est.textContent = err.message || 'No se pudo quitar.';
        });
    });

    caja.querySelector('.pv-rec').focus();
  }

  /* ---- el enganche --------------------------------------------------------
     El boton lo dibuja mi-panel.js (una linea en la fila de cada invitado); el
     click lo escucha este modulo. Delegado en document: la tabla se rehace
     entera cada vez que se filtra o se busca, y un listener por boton se
     perderia en la primera vuelta.                                            */
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('[data-pvgrab]');
    if (!b) return;
    e.preventDefault();
    abrir(b.getAttribute('data-pvgrab'));
  });

  estilo();
  window.PVGRABAR = abrir;
})();
