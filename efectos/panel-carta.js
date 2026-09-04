/* ===== EL BLOQUE DE LA CARTA EN EL PANEL ======================================

   EL AGUJERO QUE TAPA
   La carta (la hoja que sale del sobre, seccion `#carta-sec`) se dibuja con
   SIETE campos que el motor lee de `fx.carta`:
       on, kicker, titulo, texto, fuente, sobreColor, colorTexto
   ... y NINGUNO tenia control en el panel. Se cargaban a mano en la base. Eso
   ya causo un problema real: la muestra salio con el titulo de la confirmacion
   y el sobre verde de otra coleccion, y hubo que corregirlo por atras.
   Una invitacion que no se puede rehacer entera desde el panel no se puede
   vender.

   /!\ `D` NO CUELGA DE window
   Es un `const` del script principal de admin.html. Se lee con el truco de
   `borrador()`, igual que en panel-itinerario.js.

   /!\ NO GUARDARSE `D.fx`
   Cuando llega el evento de Firestore, el panel REEMPLAZA el objeto `D.fx`
   entero. Si me guardo una referencia al construir, escribo en un objeto
   huerfano: el panel muestra el cambio y no se guarda nada. Por eso `datos()`
   se vuelve a llamar DENTRO de cada handler.

   /!\ `on` ES BOOLEANO Y EL MOTOR PREGUNTA POR `=== false`
   `if (FX.carta.on === false)` esconde la seccion. O sea: undefined = prendido.
   Al apagar hay que escribir `false` de verdad, no borrar la clave.

   /!\ LA FUENTE VA PELADA
   El motor escribe `--cf-font: '<lo que haya>'`. Se guarda "Cormorant Garamond",
   NO "'Cormorant Garamond',serif". Quien la descarga es
   /efectos/carta-fuente.js -- sin ese modulo, elegir una fuente que no use
   ninguna otra parte de la invitacion no se nota.
   ============================================================================ */
(function () {

  var ID = 'carta-selector';

  var FUENTES = [
    'Cormorant Garamond', 'Great Vibes', 'Parisienne', 'Dancing Script',
    'Sacramento', 'Tangerine', 'Playfair Display', 'EB Garamond',
    'Marcellus', 'Forum', 'Lora', 'Cinzel', 'Prata', 'Montserrat', 'Jost'
  ];

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  /* se llama de nuevo en cada handler: nunca guardarse el resultado */
  function datos(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.carta) d.fx.carta = {};
    return d.fx.carta;
  }

  function chico(el, css) { el.style.cssText = css; return el; }

  function rotulo(txt) {
    return chico(function () {
      var l = document.createElement('label'); l.textContent = txt; return l;
    }(), 'display:block;font-size:12px;font-weight:600;margin:0 0 3px');
  }

  function construir(d) {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';

    var t = chico(document.createElement('div'),
      'font-size:13px;font-weight:600;margin-bottom:2px');
    t.textContent = 'La carta';
    caja.appendChild(t);

    var a = chico(document.createElement('div'),
      'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35');
    a.textContent = 'La hoja escrita que sale del sobre. Va despues de la frase.';
    caja.appendChild(a);

    /* ---- prendida o apagada ---- */
    var filaOn = chico(document.createElement('label'),
      'display:flex;align-items:center;gap:7px;font-size:12px;margin:0 0 12px;cursor:pointer');
    var chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = (datos(d).on !== false);
    chk.onchange = function () {
      /* el motor pregunta por === false: hay que escribir el booleano */
      datos(borrador() || d).on = chk.checked ? true : false;
      acomodar(); refrescar();
    };
    filaOn.appendChild(chk);
    filaOn.appendChild(document.createTextNode('Mostrar la carta en la invitacion'));
    caja.appendChild(filaOn);

    /* ---- el cuerpo (se apaga entero si la carta esta apagada) ---- */
    var cuerpo = document.createElement('div');
    caja.appendChild(cuerpo);

    function campoTexto(rot, clave, marca, ayuda) {
      var f = chico(document.createElement('div'), 'margin:0 0 10px');
      f.appendChild(rotulo(rot));
      var i = document.createElement('input');
      i.type = 'text'; i.placeholder = marca || '';
      i.value = datos(d)[clave] || '';
      i.style.cssText = 'width:100%';
      i.oninput = function () { datos(borrador() || d)[clave] = i.value; refrescar(); };
      f.appendChild(i);
      if (ayuda) {
        var h = chico(document.createElement('div'),
          'font-size:11.5px;opacity:.62;margin-top:3px;line-height:1.35');
        h.textContent = ayuda; f.appendChild(h);
      }
      cuerpo.appendChild(f);
      return i;
    }

    var iKick = campoTexto('Bajada (arriba del titulo)', 'kicker', 'Con mucha alegria');
    var iTit  = campoTexto('Titulo de la carta', 'titulo', 'Queridos amigos y familia');

    /* ---- el texto largo ---- */
    var fTxt = chico(document.createElement('div'), 'margin:0 0 10px');
    fTxt.appendChild(rotulo('Texto de la carta'));
    var ta = document.createElement('textarea');
    ta.value = datos(d).texto || '';
    ta.rows = 5;
    ta.style.cssText = 'width:100%;min-height:96px';
    ta.oninput = function () { datos(borrador() || d).texto = ta.value; medir(); refrescar(); };
    fTxt.appendChild(ta);
    var medida = chico(document.createElement('div'),
      'font-size:11.5px;opacity:.62;margin-top:3px;line-height:1.35');
    fTxt.appendChild(medida);
    cuerpo.appendChild(fTxt);

    function medir() {
      var c = datos(borrador() || d);
      var n = String((c.texto || '') + (c.titulo || '')).length;
      /* los mismos cortes que usa el motor para achicar la letra */
      medida.textContent = n <= 210
        ? n + ' caracteres — entra comodo.'
        : (n <= 340
          ? n + ' caracteres — la letra se achica un poco.'
          : n + ' caracteres — letra chica y hoja mas alta. Conviene acortar.');
    }
    medir();

    /* ---- la tipografia ---- */
    var fFu = chico(document.createElement('div'), 'margin:0 0 10px');
    fFu.appendChild(rotulo('Tipografia de la carta'));
    var selFu = chico(document.createElement('select'), 'width:100%');
    var op0 = document.createElement('option');
    op0.value = ''; op0.textContent = 'La de la coleccion (por defecto)';
    selFu.appendChild(op0);
    FUENTES.forEach(function (f) {
      var op = document.createElement('option');
      op.value = f; op.textContent = f;
      selFu.appendChild(op);
    });
    selFu.value = datos(d).fuente || '';
    selFu.onchange = function () {
      datos(borrador() || d).fuente = selFu.value;
      refrescar();
    };
    fFu.appendChild(selFu);
    cuerpo.appendChild(fFu);

    /* ---- los dos colores ---- */
    function campoColor(rot, clave, porDefecto) {
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
      borrar.title = 'Volver al color de la coleccion';
      i.oninput = function () { datos(borrador() || d)[clave] = i.value; refrescar(); };
      borrar.onclick = function () { datos(borrador() || d)[clave] = ''; refrescar(); };
      fila.appendChild(i); fila.appendChild(borrar);
      f.appendChild(fila);
      return { caja: f, input: i };
    }

    var dos = chico(document.createElement('div'),
      'display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 4px');
    var cSobre = campoColor('Color del sobre', 'sobreColor', '#e6ded0');
    var cLetra = campoColor('Color de la letra', 'colorTexto', '#48564a');
    dos.appendChild(cSobre.caja); dos.appendChild(cLetra.caja);
    cuerpo.appendChild(dos);

    function acomodar() {
      var prendida = (datos(borrador() || d).on !== false);
      cuerpo.style.opacity = prendida ? '1' : '.42';
      cuerpo.style.pointerEvents = prendida ? '' : 'none';
    }
    acomodar();

    /* el evento llega DESPUES de que se arma esto: hay que re-sincronizar */
    caja.__sync = function () {
      var dd = borrador(); if (!dd) return;
      if (document.activeElement && caja.contains(document.activeElement)) return;
      var c = datos(dd);
      var quiero = (c.on !== false);
      if (chk.checked !== quiero) chk.checked = quiero;
      if (iKick.value !== (c.kicker || '')) iKick.value = c.kicker || '';
      if (iTit.value  !== (c.titulo || '')) iTit.value  = c.titulo || '';
      if (ta.value    !== (c.texto  || '')) { ta.value  = c.texto  || ''; }
      if (selFu.value !== (c.fuente || '')) selFu.value = c.fuente || '';
      if (c.sobreColor && cSobre.input.value !== c.sobreColor) cSobre.input.value = c.sobreColor;
      if (c.colorTexto && cLetra.input.value !== c.colorTexto) cLetra.input.value = c.colorTexto;
      medir(); acomodar();
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

    /* despues del itinerario, que es el orden en que se ven en la invitacion */
    var ancla = document.getElementById('itinerario-selector') ||
                document.getElementById('fecha-selector') ||
                document.getElementById('rsvp-selector');
    var caja = construir(d);
    if (ancla && ancla.parentNode === m) m.insertBefore(caja, ancla.nextSibling);
    else m.insertBefore(caja, m.firstChild);
  }

  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) {
      clearInterval(t); setInterval(revisar, 700); revisar();
    }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
