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
   ============================================================================ */
(function () {

  var ID = 'pasevoz-selector';
  var N = 26;
  var ABC = '0123456789abcdefghijklmnopqrstuvwxyz';

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

  /* ---- medir la onda: se baja el audio ACA, no en la invitacion ---- */
  function medirOnda(url, listo, falla) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || !window.fetch) { falla('Este navegador no puede medirla.'); return; }
    fetch(url).then(function (r) {
      if (!r.ok) throw new Error('no se pudo bajar');
      return r.arrayBuffer();
    }).then(function (buf) {
      return new AC().decodeAudioData(buf);
    }).then(function (audio) {
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
      listo(s);
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
      'Lo graban los novios al armar la invitacion, o se pega el link aca abajo.';
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

    /* ---- el audio ---- */
    var iAudio = campo('Link del audio', 'audio', 'https://…/mensaje.m4a',
      'Lo deja grabado el cliente. Si hay que reemplazarlo, se pega el link aca.');
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
      if (!url) { estadoOnda.textContent = 'Primero hace falta el link del audio.'; return; }
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
    var iTit   = campo('Titulo del pase', 'titulo', 'Un mensaje para vos');

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
