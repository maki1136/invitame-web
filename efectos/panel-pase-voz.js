/* ===== EL PASE CON VOZ, EN EL PANEL ===========================================

   QUE ES ESTO
   El bloque con el que Jazmin maneja el ticket del mensaje de voz que dibuja
   /efectos/pase-voz.js. Ese modulo lee VEINTE campos de `fx.pasevoz` y, sin
   este archivo, ninguno se podia tocar sin entrar a la base. La regla de Maki,
   otra vez: si Jaz no lo puede cambiar sola, no esta terminado.

   /!\ `D` NO CUELGA DE window
   Es un `const` del script principal de admin.html. Se lee con `borrador()`,
   igual que en panel-carta.js y panel-itinerario.js.

   /!\ NO GUARDARSE `D.fx`
   Cuando llega el evento de Firestore el panel REEMPLAZA `D.fx` entero. Una
   referencia tomada al construir queda huerfana: se ve el cambio en pantalla y
   no se guarda nada. Por eso `datos()` se vuelve a llamar DENTRO de cada
   handler.

   /!\ `encendido` ES AL REVES QUE `carta.on`
   El motor pide `if (!f.encendido || !f.audio) return`. O sea: undefined =
   APAGADO, y ademas sin audio no hay pase aunque este prendido. Por eso el
   cartel de "falta el audio" y no un interruptor que miente.

   /!\ LA ONDA SON 26 CARACTERES BASE36
   `0` es mudo y `z` es pico. La invitacion los usa para dibujar las rayitas
   SIN bajar el audio: ese es el ahorro entero de la funcion. Si la onda esta
   vacia, el pase igual funciona pero las rayitas salen todas parejas y se nota
   que es de mentira. El boton "Medir la onda" baja el audio ACA, en el panel,
   una sola vez, y deja los 26 numeros escritos.

   /!\ `departe` Y `nota` ENGORDAN EL TICKET
   Con los dos llenos la proporcion se va de 2,56:1 a 1,64:1 y deja de parecer
   un boleto. Por eso el aviso al lado de esos dos campos, y por eso vienen
   vacios de fabrica.

   ───────────────────────────────────────────────────────────────────────────
   EL SUBIDOR DE AUDIO  (4/9/2026)

   Faltaba, y era el agujero mas grande del bloque: habia un campo para PEGAR
   UN LINK, pero ningun cliente tiene un link. Tiene un archivo. Los caminos
   reales por los que llega un audio son dos:

     · el cliente lo graba solo en /crear.html (eso ya andaba), o
     · se lo manda a Jazmin por WhatsApp — y ahi no habia NADA que hacer.

   Ahora se elige el archivo y el panel se ocupa de todo: lo sube a Cloudinary
   con `INV.uploadVideo`, escribe el link, MIDE LA ONDA con el archivo que ya
   esta en memoria, y prende el pase. Un clic.

   /!\ CLOUDINARY RECIBE EL AUDIO POR EL ENDPOINT DE **VIDEO**. `uploadVideo`
       es el correcto y no es un error: para Cloudinary un audio es un video
       sin imagen. `uploadImage` lo rechaza.
   /!\ LA ONDA SE MIDE DEL ARCHIVO LOCAL, NO DEL LINK. Es mas rapido, no gasta
       una bajada, y sobre todo NO SE CHOCA CON CORS: medir desde la URL de
       Cloudinary a veces falla por eso, y ese es justo el error que mostraba
       "No se pudo medir" despues de una subida que habia salido bien.
   /!\ NO SE COMPRIME. Un mensaje de voz de 15 segundos pesa poco, y recomprimir
       en el navegador le mete otra generacion de perdida a algo que ya viene
       comprimido. Si algun dia llega un audio enorme, se avisa y listo.
   ============================================================================ */
(function () {

  var ID = 'pasevoz-selector';
  var N = 26;
  var ABC = '0123456789abcdefghijklmnopqrstuvwxyz';
  var PESO_AVISO = 8 * 1024 * 1024;   /* arriba de esto se avisa, no se frena */

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  /* se llama de nuevo en cada handler: nunca guardarse el resultado */
  function datos(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.pasevoz) d.fx.pasevoz = {};
    return d.fx.pasevoz;
  }

  function chico(el, css) { el.style.cssText = css; return el; }

  function rotulo(txt) {
    var l = document.createElement('label');
    l.textContent = txt;
    return chico(l, 'display:block;font-size:12px;font-weight:600;margin:0 0 3px');
  }
  function ayudita(txt) {
    var h = document.createElement('div');
    h.textContent = txt;
    return chico(h, 'font-size:11.5px;opacity:.62;margin-top:3px;line-height:1.35');
  }

  /* ---- los 26 picos, a partir de bytes que ya tenemos ---- */
  function ondaDeBuffer(buf) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return Promise.resolve('');
    return new AC().decodeAudioData(buf).then(function (audio) {
      var d = audio.getChannelData(0);
      var paso = Math.floor(d.length / N) || 1;
      var picos = [], i, k, tope, m, v;
      for (i = 0; i < N; i++) {
        m = 0; tope = Math.min(d.length, (i + 1) * paso);
        for (k = i * paso; k < tope; k++) { v = d[k] < 0 ? -d[k] : d[k]; if (v > m) m = v; }
        picos.push(m);
      }
      /* se normaliza contra el pico mas alto: un audio bajito igual se ve */
      var alto = Math.max.apply(null, picos) || 1;
      var s = '';
      for (i = 0; i < N; i++) {
        s += ABC.charAt(Math.max(0, Math.min(35, Math.round(picos[i] / alto * 35))));
      }
      return s;
    });
  }

  /* ---- medir bajando el audio del link (para los que ya estan cargados) ---- */
  function medirOnda(url, listo, falla) {
    if (!window.fetch) { falla('Este navegador no puede medirla.'); return; }
    fetch(url).then(function (r) {
      if (!r.ok) throw new Error('no se pudo bajar');
      return r.arrayBuffer();
    }).then(ondaDeBuffer).then(function (s) {
      if (s) listo(s); else falla('Este navegador no puede medirla.');
    }).catch(function () {
      falla('No se pudo medir. Suele ser el audio en otro dominio.');
    });
  }

  function construir(d) {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';

    var t = chico(document.createElement('div'),
      'font-size:13px;font-weight:600;margin-bottom:2px');
    t.textContent = 'El pase con voz';
    caja.appendChild(t);

    var a = chico(document.createElement('div'),
      'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35');
    a.textContent = 'El ticket con el mensaje grabado por los novios. Va al final, antes de los contactos.';
    caja.appendChild(a);

    /* ---- prendido o apagado ---- */
    var filaOn = chico(document.createElement('label'),
      'display:flex;align-items:center;gap:7px;font-size:12px;margin:0 0 10px;cursor:pointer');
    var chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = !!datos(d).encendido;
    chk.onchange = function () {
      datos(borrador() || d).encendido = chk.checked ? true : false;
      acomodar(); refrescar();
    };
    filaOn.appendChild(chk);
    filaOn.appendChild(document.createTextNode('Mostrar el pase con voz'));
    caja.appendChild(filaOn);

    /* ---- el aviso de que falta el audio ---- */
    var aviso = chico(document.createElement('div'),
      'display:none;font-size:11.5px;line-height:1.35;margin:0 0 10px;padding:7px 9px;' +
      'border-radius:6px;background:rgba(190,120,0,.10);color:#7a4d00');
    aviso.textContent = 'Sin audio el pase no aparece, aunque este prendido. ' +
      'Subilo aca abajo, o pega el link si ya esta en algun lado.';
    caja.appendChild(aviso);

    /* ---- el cuerpo (se apaga entero si el pase esta apagado) ---- */
    var cuerpo = document.createElement('div');
    caja.appendChild(cuerpo);

    function campo(rot, clave, marca, ayuda, contenedor) {
      var f = chico(document.createElement('div'), 'margin:0 0 10px');
      f.appendChild(rotulo(rot));
      var i = document.createElement('input');
      i.type = 'text'; i.placeholder = marca || '';
      i.value = datos(d)[clave] || '';
      i.style.cssText = 'width:100%';
      i.oninput = function () { datos(borrador() || d)[clave] = i.value; refrescar(); };
      f.appendChild(i);
      if (ayuda) f.appendChild(ayudita(ayuda));
      (contenedor || cuerpo).appendChild(f);
      return i;
    }

    /* ---- EL SUBIDOR: el camino normal ---- */
    var fSub = chico(document.createElement('div'), 'margin:0 0 10px');
    fSub.appendChild(rotulo('El audio'));

    var bSubir = chico(document.createElement('div'),
      'border:1.5px dashed #d9c7bd;border-radius:10px;padding:11px;text-align:center;' +
      'cursor:pointer;font-weight:700;font-size:12.5px;background:#fdf8f4');
    bSubir.textContent = 'Elegir el archivo de audio';

    var fileIn = document.createElement('input');
    fileIn.type = 'file';
    fileIn.accept = 'audio/*';
    fileIn.style.display = 'none';
    bSubir.onclick = function () { fileIn.click(); };

    var oir = document.createElement('audio');
    oir.controls = true;
    oir.style.cssText = 'display:none;width:100%;margin-top:8px';

    fileIn.onchange = function () {
      var f = fileIn.files && fileIn.files[0];
      if (!f) return;
      if (!window.INV || typeof window.INV.uploadVideo !== 'function') {
        estadoSub.textContent = 'No esta lista la conexion. Espera unos segundos y proba de nuevo.';
        return;
      }
      if (f.size > PESO_AVISO) {
        var mb = Math.round(f.size / 1048576);
        if (!confirm('El audio pesa ' + mb + ' MB. Para un mensaje de voz es muchisimo y ' +
                     'va a tardar. Lo ideal es menos de 1 MB. Subir igual?')) {
          fileIn.value = ''; return;
        }
      }

      bSubir.textContent = 'Subiendo el audio…';
      estadoSub.textContent = '';

      /* se lee UNA vez y sirve para las dos cosas: subir y medir */
      var lector = new FileReader();
      lector.onload = function () {
        var buf = lector.result;
        /* ⚠️ la onda se mide del archivo local, NO del link: sin CORS de por medio */
        var pOnda = ondaDeBuffer(buf.slice(0)).catch(function () { return ''; });
        var pSubir = window.INV.uploadVideo(f);

        Promise.all([pSubir, pOnda]).then(function (r) {
          var url = r[0], onda = r[1];
          var dd = datos(borrador() || d);
          dd.audio = url;
          if (onda) dd.onda = onda;
          dd.encendido = true;

          iAudio.value = url;
          if (onda) { iOnda.value = onda; }
          if (!chk.checked) chk.checked = true;
          try { oir.src = URL.createObjectURL(f); oir.style.display = 'block'; } catch (e) {}
          bSubir.textContent = 'Audio cargado — cambiar';
          estadoSub.textContent = onda
            ? 'Listo: subido, medido y prendido. Escuchalo aca abajo.'
            : 'Subido y prendido. La onda no se pudo medir sola: toca "Medir la onda".';
          contarOnda(); acomodar(); refrescar();
        }).catch(function (err) {
          bSubir.textContent = 'Elegir el archivo de audio';
          estadoSub.textContent = 'No se pudo subir: ' + ((err && err.message) || err);
        });
      };
      lector.onerror = function () {
        bSubir.textContent = 'Elegir el archivo de audio';
        estadoSub.textContent = 'No se pudo leer el archivo.';
      };
      lector.readAsArrayBuffer(f);
    };

    fSub.appendChild(bSubir);
    fSub.appendChild(fileIn);
    var estadoSub = ayudita('Sirve mp3, m4a, wav o el audio de WhatsApp. Se sube y se mide solo.');
    fSub.appendChild(estadoSub);
    fSub.appendChild(oir);
    /* ⚠️ VA EN `caja`, NO EN `cuerpo`, Y ESTO NO ES UN DETALLE. `cuerpo` se apaga
       con `pointer-events:none` cuando el pase esta apagado — que es el estado
       de fabrica. Con el subidor adentro, el boton para elegir el audio nacia
       MUERTO: se veia, no se podia tocar, y como sin audio el pase no se puede
       prender, no habia forma de salir de ahi. Maki se comio ese pozo el 4/9.
       ⚠️ Y `pointer-events:''` en el hijo NO alcanza para revivirlo: hay que
          sacarlo del padre apagado o poner 'auto' explicito. */
    caja.insertBefore(fSub, cuerpo);

    /* ---- el link, por si ya esta subido en otro lado ---- */
    var iAudio = campo('Link del audio', 'audio', 'https://…/mensaje.m4a',
      'Se llena solo al subir. Solo hace falta tocarlo si el audio ya vive en otro lado.');
    var alSubirAudio = iAudio.oninput;
    iAudio.oninput = function () { alSubirAudio(); acomodar(); };

    /* ---- la onda ---- */
    var fOnda = chico(document.createElement('div'), 'margin:0 0 10px');
    fOnda.appendChild(rotulo('Onda del audio (26 caracteres)'));
    var filaOnda = chico(document.createElement('div'),
      'display:flex;align-items:center;gap:6px');
    var iOnda = document.createElement('input');
    iOnda.type = 'text';
    iOnda.value = datos(d).onda || '';
    iOnda.maxLength = N;
    iOnda.style.cssText = 'flex:1;min-width:0;font-family:ui-monospace,monospace;letter-spacing:.06em';
    iOnda.oninput = function () {
      datos(borrador() || d).onda = iOnda.value.toLowerCase();
      contarOnda(); refrescar();
    };
    var bMedir = chico(document.createElement('button'),
      'cursor:pointer;padding:5px 9px;font-size:11.5px;white-space:nowrap');
    bMedir.type = 'button'; bMedir.textContent = 'Medir la onda';
    bMedir.onclick = function () {
      var url = (datos(borrador() || d).audio || '').trim();
      if (!url) { estadoOnda.textContent = 'Primero hace falta subir el audio.'; return; }
      bMedir.disabled = true; estadoOnda.textContent = 'Midiendo…';
      medirOnda(url, function (s) {
        bMedir.disabled = false;
        datos(borrador() || d).onda = s;
        iOnda.value = s; contarOnda(); refrescar();
      }, function (msg) {
        bMedir.disabled = false;
        estadoOnda.textContent = msg;
      });
    };
    filaOnda.appendChild(iOnda); filaOnda.appendChild(bMedir);
    fOnda.appendChild(filaOnda);
    var estadoOnda = ayudita('');
    fOnda.appendChild(estadoOnda);
    cuerpo.appendChild(fOnda);

    function contarOnda() {
      var s = (datos(borrador() || d).onda || '');
      estadoOnda.textContent = !s
        ? 'Vacia: las rayitas salen todas iguales y se nota. Conviene medirla.'
        : (s.length === N
          ? 'Lista: ' + N + ' caracteres.'
          : s.length + ' de ' + N + ' caracteres — las que faltan salen parejas.');
    }
    contarOnda();

    /* ---- los textos del ticket ---- */
    var iTalon = campo('Talon (el texto vertical)', 'talon', 'Admite dos');
    var iOver  = campo('Renglon chico de arriba', 'over', 'PASE DE INVITADO');
    var iTit   = campo('Titulo del pase', 'titulo', 'Un mensaje para ti');

    var iDeparte = campo('De parte de', 'departe', 'Camila y Tomas',
      'Se puede dejar vacio. Con este y la Nota llenos, el ticket se pone alto y deja de parecer un boleto.');
    var iNota    = campo('Nota', 'nota', '',
      'Igual que el anterior: mejor uno de los dos, no los dos.');

    var dosR = chico(document.createElement('div'),
      'display:grid;grid-template-columns:1fr 1fr;gap:10px');
    var iFecha = campo('Fecha (como se lee)', 'fecha', '14 · 02 · 2027', '', dosR);
    var iHora  = campo('Hora', 'hora', '19:00', '', dosR);
    cuerpo.appendChild(dosR);

    var dosRot = chico(document.createElement('div'),
      'display:grid;grid-template-columns:1fr 1fr;gap:10px');
    var iRotF = campo('Rotulo de la fecha', 'rotuloFecha', 'Fecha', '', dosRot);
    var iRotH = campo('Rotulo de la hora', 'rotuloHora', 'Hora', '', dosRot);
    cuerpo.appendChild(dosRot);

    /* ---- los colores ---- */
    function campoColor(rot, clave, porDefecto, contenedor) {
      var f = chico(document.createElement('div'), '');
      f.appendChild(rotulo(rot));
      var fila = chico(document.createElement('div'),
        'display:flex;align-items:center;gap:6px');
      var i = document.createElement('input');
      i.type = 'color';
      i.value = datos(d)[clave] || porDefecto;
      i.style.cssText = 'width:46px;height:32px;padding:0;border:0;background:none;cursor:pointer';
      var borrar = chico(document.createElement('button'),
        'cursor:pointer;padding:4px 8px;font-size:11.5px');
      borrar.type = 'button'; borrar.textContent = 'Sacar';
      borrar.title = 'Volver al color de la paleta';
      i.oninput = function () { datos(borrador() || d)[clave] = i.value; refrescar(); };
      borrar.onclick = function () { datos(borrador() || d)[clave] = ''; refrescar(); };
      fila.appendChild(i); fila.appendChild(borrar);
      f.appendChild(fila);
      contenedor.appendChild(f);
      return i;
    }

    var tres = chico(document.createElement('div'),
      'display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:2px 0 8px');
    var cPapel  = campoColor('Papel',  'papel',  '#e9eee6', tres);
    var cTinta  = campoColor('Tinta',  'tinta',  '#48564a', tres);
    var cAcento = campoColor('Acento', 'acento', '#c8a96a', tres);
    cuerpo.appendChild(tres);
    cuerpo.appendChild(ayudita('Vacios toman los colores de la paleta de la invitacion.'));

    function acomodar() {
      var dd = datos(borrador() || d);
      var prendido = !!dd.encendido;
      cuerpo.style.opacity = prendido ? '1' : '.42';
      cuerpo.style.pointerEvents = prendido ? '' : 'none';
      aviso.style.display = (prendido && !(dd.audio || '').trim()) ? 'block' : 'none';
      /* el subidor vive FUERA de `cuerpo` (ver la nota de arriba), asi que no lo
         alcanza el apagado. Se deja explicito igual: si alguien lo vuelve a
         meter adentro, que al menos siga clickeable. */
      fSub.style.opacity = '1';
      fSub.style.pointerEvents = 'auto';
    }
    acomodar();

    /* el evento llega DESPUES de que se arma esto: hay que re-sincronizar */
    caja.__sync = function () {
      var dd = borrador(); if (!dd) return;
      if (document.activeElement && caja.contains(document.activeElement)) return;
      var p = datos(dd);
      if (chk.checked !== !!p.encendido) chk.checked = !!p.encendido;
      var pares = [
        [iAudio, 'audio'], [iOnda, 'onda'], [iTalon, 'talon'], [iOver, 'over'],
        [iTit, 'titulo'], [iDeparte, 'departe'], [iNota, 'nota'],
        [iFecha, 'fecha'], [iHora, 'hora'], [iRotF, 'rotuloFecha'], [iRotH, 'rotuloHora']
      ];
      for (var k = 0; k < pares.length; k++) {
        var val = p[pares[k][1]] || '';
        if (pares[k][0].value !== val) pares[k][0].value = val;
      }
      if (p.papel  && cPapel.value  !== p.papel)  cPapel.value  = p.papel;
      if (p.tinta  && cTinta.value  !== p.tinta)  cTinta.value  = p.tinta;
      if (p.acento && cAcento.value !== p.acento) cAcento.value = p.acento;
      if ((p.audio || '').trim() && bSubir.textContent.indexOf('cargado') < 0) {
        bSubir.textContent = 'Audio cargado — cambiar';
      }
      contarOnda(); acomodar();
    };

    return caja;
  }

  function revisar() {
    var d = borrador();
    if (!d) return;

    var ya = document.getElementById(ID);
    if (ya) { if (ya.__sync) ya.__sync(); return; }

    var m = document.querySelector('.mejoras');
    if (!m) return;

    /* al final, que es donde se ve en la invitacion */
    var ancla = document.getElementById('galeria-selector') ||
                document.getElementById('carta-selector') ||
                document.getElementById('itinerario-selector');
    var caja = construir(d);
    if (ancla && ancla.parentNode === m) m.insertBefore(caja, ancla.nextSibling);
    else m.appendChild(caja);
  }

  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) {
      clearInterval(t); setInterval(revisar, 700); revisar();
    }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
