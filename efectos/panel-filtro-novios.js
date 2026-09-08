/* ===== LA FRASE DEL FILTRO, EN EL PANEL DE LOS NOVIOS ========================

   Aparece una tarjeta en «Opciones» para que los novios cambien la frase que va
   arriba de los nombres en el marco de la foto:
       EN LA BODA DE / Camila & Tomás / 6 DE MARZO DE 2027

   POR QUÉ ESTÁ ACÁ Y NO EN mi-panel.js
   Mismo criterio que panel-audio-invitado.js: mi-panel.js pesa 40 KB y todo lo
   que se pueda resolver desde /efectos/ se resuelve desde acá. mi-panel.js sólo
   presta sus datos por `window.MIPANEL`.

   ⚠️ LOS NOVIOS NO ESCRIBEN EN FIRESTORE. El pedido va a /filtro-guardar.php,
      que comprueba la clave del panel y cambia SÓLO esa frase, con updateMask.
      En `inv_eventos` vive la invitación entera: si se abriera a escritura,
      cualquiera con el link de un panel podría rehacerla.

   ⚠️ GANA EL ÚLTIMO QUE GUARDA. La frase también la puede cambiar el equipo
      desde el panel de Jazmín. Por eso acá se muestra cuándo se guardó la
      última vez y quién la tocó: para que nadie se sorprenda.

   ⚠️ EL CAMPO ARRANCA VACÍO A PROPÓSITO, con la frase automática de fondo como
      placeholder. Vacío quiere decir «la que corresponda al tipo de evento», y
      es un estado distinto de «escribí esta frase». Si arrancara con el texto ya
      puesto, guardar sin querer congelaría la automática.

   ⚠️ NO SE ROMPE SI EL FILTRO ESTÁ APAGADO: la tarjeta no aparece.
   ============================================================================ */
(function () {
  'use strict';

  var ID = 'filtro-frase-novios';
  var APIKEY = 'AIzaSyBXWZc9xdpXx7HCkJfxcyofgI00buNlIXc';   /* la web key es pública */
  var FS = 'https://firestore.googleapis.com/v1/projects/invitame-9b51f/databases/(default)/documents/';

  var EV = null;        /* el evento, leído una sola vez */
  var pidiendo = false;

  function P() { return window.MIPANEL || null; }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* La invitación es de lectura pública (es lo que abre el invitado), así que
     para MOSTRAR alcanza con la clave web. Para ESCRIBIR, no: eso va por el PHP. */
  function traerEvento() {
    var p = P();
    if (!p || !p.slug || pidiendo) return;
    pidiendo = true;
    fetch(FS + 'inv_eventos/' + encodeURIComponent(p.slug) + '?key=' + APIKEY)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        pidiendo = false;
        EV = j ? aplanar(j.fields || {}) : {};
        revisar();
      })
      .catch(function () { pidiendo = false; EV = {}; });
  }

  /* Firestore devuelve cada valor envuelto ({stringValue:…}). Se desenvuelve
     sólo lo que hace falta: es más corto que traerse una librería. */
  function aplanar(f) {
    var o = {};
    for (var k in f) {
      var v = f[k];
      if (v.stringValue !== undefined) o[k] = v.stringValue;
      else if (v.booleanValue !== undefined) o[k] = v.booleanValue;
      else if (v.integerValue !== undefined) o[k] = +v.integerValue;
      else if (v.mapValue) o[k] = aplanar(v.mapValue.fields || {});
    }
    return o;
  }

  function cfg() { return (EV && EV.fx && EV.fx.filtro) || {}; }

  function prendido() {
    var e = cfg().encendido;
    return e === true || e === 'on' || e === 'si';
  }

  /* La frase automática sale de la MISMA tabla que usa la invitación. Si por lo
     que sea filtro-marcos.js no cargó, se muestra el rótulo genérico. */
  function fraseAutomatica() {
    var t = String((EV && (EV.tipoEvento || EV.tipo)) || 'boda').toLowerCase();
    var F = (window.INVFILTRO && window.INVFILTRO.frases) || {};
    return F[t] || F.otro || 'En la fiesta de';
  }

  function cuandoYQuien() {
    var c = cfg();
    if (!c.fraseAt) return '';
    var d = new Date(c.fraseAt);
    if (isNaN(d.getTime())) return '';
    var quien = (c.frasePor === 'novios') ? 'ustedes' : 'quien armó la invitación';
    return 'Última vez que se cambió: ' + d.toLocaleDateString() + ', por ' + quien + '.';
  }

  function tarjeta() {
    var c = cfg();
    var caja = document.createElement('div');
    caja.className = 'card';
    caja.id = ID;
    caja.style.maxWidth = '560px';
    caja.innerHTML =
      '<h3>La frase de tu filtro</h3>' +
      '<p style="font-size:13px;color:#6b6058;margin:0 0 10px;line-height:1.55">' +
        'Es el renglón que va arriba de los nombres cuando tus invitados se toman ' +
        'una foto con el marco de la fiesta. Si se deja vacío sale ' +
        '<b>' + esc(fraseAutomatica()) + '</b>.</p>' +
      '<input type="text" id="ff-txt" maxlength="60" value="' + esc(c.frase || '') + '" ' +
        'placeholder="' + esc(fraseAutomatica()) + '">' +
      '<button class="btn" id="ff-guardar" style="max-width:200px">Guardar</button>' +
      '<div id="ff-est" style="font-size:12.5px;color:#6b6058;margin-top:8px;min-height:18px">' +
        esc(cuandoYQuien()) + '</div>';

    caja.querySelector('#ff-guardar').addEventListener('click', guardar);
    return caja;
  }

  function guardar() {
    var p = P();
    if (!p) return;
    var txt = document.getElementById('ff-txt');
    var est = document.getElementById('ff-est');
    var btn = document.getElementById('ff-guardar');
    if (!txt) return;
    btn.disabled = true;
    est.textContent = 'Guardando…';

    fetch('/filtro-guardar.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: p.slug, clave: p.clave, frase: txt.value })
    })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        btn.disabled = false;
        if (!j || !j.ok) {
          est.textContent = 'No se pudo guardar. Probá de nuevo en un momento.';
          return;
        }
        /* Se refresca lo que tenemos en memoria para que el cartelito diga la verdad. */
        if (!EV.fx) EV.fx = {};
        if (!EV.fx.filtro) EV.fx.filtro = {};
        EV.fx.filtro.frase = j.frase;
        EV.fx.filtro.fraseAt = j.cuando;
        EV.fx.filtro.frasePor = 'novios';
        est.textContent = (j.vacia ? 'Listo: vuelve a salir la frase automática. ' : 'Listo. ') +
          cuandoYQuien();
        if (p.toast) p.toast('Guardado');
      })
      .catch(function () {
        btn.disabled = false;
        est.textContent = 'No se pudo guardar. Revisá la conexión.';
      });
  }

  /* ---- engancharse al panel ---------------------------------------------

     La señal de que estamos en «Opciones» es el botón de guardar el mensaje
     para compartir, que sólo existe en esa vista. La tarjeta se cuelga justo
     después de esa tarjeta.
     ⚠️ La vista se redibuja entera cada vez que se cambia de sección, y se
        lleva puesto lo que hayamos insertado: por eso se revisa seguido en vez
        de una sola vez. Es barato: si ya está, la función sale en la segunda
        línea. */
  function revisar() {
    var ancla = document.getElementById('guardarOps');
    var ya = document.getElementById(ID);
    if (!ancla) { if (ya) ya.remove(); return; }
    if (ya) return;
    if (!EV) { traerEvento(); return; }
    if (!prendido()) return;                 /* el filtro está apagado: no va */
    var tarj = ancla.closest ? ancla.closest('.card') : null;
    if (!tarj || !tarj.parentNode) return;
    tarj.parentNode.insertBefore(tarjeta(), tarj.nextSibling);
  }

  var n = 0;
  var t = setInterval(function () {
    if (window.MIPANEL) { clearInterval(t); setInterval(revisar, 700); revisar(); }
    if (++n > 80) clearInterval(t);          /* no es el panel de los novios */
  }, 500);
})();
