/* ===== FORMULARIO «SOLO SAVE THE DATE» (3/11/2026) ===========================

   Jazmín: «¿Se podrá hacer un formulario súper simple para los SAVE THE DATE?
   Porque mucha gente primero realiza el SAVE sin la invitación… y actualmente
   la única forma es si completan el formulario completo». Maki: «sí, obvio».

   Es EL MISMO formulario (crear.html), con `?std=1`. No es una copia: el
   envío, el anti-robots, la solicitud y la invitación «por revisar» son los
   de siempre. Esto sólo deja a la vista lo que pidió Jazmín, en su orden:

     Modelo elegido · ¿Qué festejas? · Clave · Nombre · WhatsApp · Correo ·
     Frase para el título · Nombres · Fecha · Horario (opcional) · Frase final ·
     y la elección del Save the Date.

   QUÉ PASA AL ENVIAR
     · La solicitud llega a Jazmín marcada «★ SOLO SAVE THE DATE» (en ¿Algo más?).
     · La invitación nace «por revisar» como siempre: nadie la ve. En el panel →
       EFECTOS → Save the Date ya está el diseño que eligió, con sus textos,
       listo para descargar. Si después compran la invitación, se sigue armando
       sobre esa misma, con los datos ya cargados.
     · «Frase para el título» va al título del Save the Date (y al sobretítulo
       de la portada); «Frase final» va al pie del Save the Date (y al cierre).
   ============================================================================ */
(function () {
  var q = new URLSearchParams(location.search);
  if (q.get('std') !== '1') return;

  var MARCA = '★ SOLO SAVE THE DATE';
  function $(id) { return document.getElementById(id); }
  function tapar(el) { if (el) el.style.display = 'none'; }
  function etiquetaDe(inp) {
    var p = inp && inp.previousElementSibling;
    return (p && p.tagName === 'LABEL') ? p : null;
  }

  document.body.classList.add('solo-std');
  /* lo que se agrega solo después de cargar (las ayudas con «Así se ve», el
     teléfono de muestra, «Ver mi invitación», los colores de la invitación):
     por CSS, así no importa cuándo aparece */
  var css = document.createElement('style');
  css.textContent =
    'body.solo-std .ayuda, body.solo-std [data-ayuda], body.solo-std #dis-ver, body.solo-std #dis-fono,' +
    'body.solo-std #dis-colores, body.solo-std #paq,' +
    /* ★ 3/11 (Jazmín): «las muestras hay que eliminarlas de acá, porque abajo
       aparecen las del SAVE». Sin grilla de invitaciones: sólo Save the Date. */
    'body.solo-std #dis-modelos, body.solo-std #dis-elegido, body.solo-std #dis-perso{display:none!important}' +
    'body.solo-std #card-modelo .subt:first-of-type{border-top:0;padding-top:0;margin-top:4px}';
  var h2m = document.querySelector('#card-modelo > h2'); if (h2m) h2m.textContent = 'Tu Save the Date';
  var dsm = document.querySelector('#card-modelo > .desc'); if (dsm) dsm.textContent = 'Completa tus datos y elige el diseño al final. Te lo mandamos listo para compartir.';
  document.head.appendChild(css);
  /* el «Ver opciones» de un casillero escondido, también se va */
  var nOpc = 0, ivOpc = setInterval(function () {
    document.querySelectorAll('#wrap .opc-btn').forEach(function (b) {
      var a = b.previousElementSibling;
      if (a && a.style.display === 'none') b.style.display = 'none';
    });
    if (++nOpc > 40) clearInterval(ivOpc);
  }, 300);
  var sub = document.querySelector('.top .sub');
  if (sub) sub.textContent = 'Completa tus datos y armamos tu Save the Date';
  document.title = 'Tu Save the Date · Invítame';

  /* ---- 1. sólo quedan las tarjetas que van ---- */
  var portada = $('n1') && $('n1').closest('.card');
  var cierre = $('fraseFinal') && $('fraseFinal').closest('.card');
  var quedan = [$('card-modelo'), portada, $('card-std'), cierre];
  document.querySelectorAll('#wrap .card').forEach(function (c) {
    var va = quedan.some(function (k) { return k && (k === c || c.contains(k)); });
    if (!va) tapar(c);
  });

  /* ---- 2. sin «Modelo elegido»: el diseño es el del Save the Date (abajo).
     El envío pide un modelo: se le dice «save-the-date», que no es ninguna
     muestra. Así la solicitud llega marcada (tpl = save-the-date) y la
     invitación no se viste con ninguna muestra; si después compran la
     invitación, Jazmín elige el diseño en el panel. ---- */
  function sinModelo() {
    var D = window.CREAR_DISENO;
    if (!D || D.__soloStd) return !!D;
    D.elegido = function () { return 'save-the-date'; };
    D.__soloStd = true;
    return true;
  }
  if (!sinModelo()) { var nM = 0, ivM = setInterval(function () { if (sinModelo() || ++nM > 40) clearInterval(ivM); }, 250); }
  var hintC = $('cwsp') && $('cwsp').closest('.two') && $('cwsp').closest('.two').nextElementSibling;
  if (hintC && hintC.classList.contains('hint')) hintC.textContent = 'Por aquí te mandamos tu Save the Date en cuanto esté listo.';
  var hintClave = $('orden') && $('orden').nextElementSibling;
  if (hintClave && hintClave.classList.contains('hint')) hintClave.textContent = 'Es el código que te dimos al contratar tu Save the Date. Si no lo tienes a la mano, déjalo vacío.';

  /* ---- 3. «Tus datos»: sin fotos ni dedicatoria; fecha y horario separados ---- */
  if (portada) {
    var h2 = portada.querySelector('h2'); if (h2) h2.textContent = 'Tus datos';
    var d2 = portada.querySelector('.desc'); if (d2) d2.textContent = 'Lo que va escrito en tu Save the Date.';
    ['up-cover', 'up-covervid', 'prev-cover'].forEach(function (id) { tapar($(id)); });
    tapar($('up-cover') && $('up-cover').closest('.two'));
    portada.querySelectorAll('[data-ayuda], .hint').forEach(tapar);
    portada.querySelectorAll('label').forEach(function (l) { if (/Foto o video de portada/i.test(l.textContent)) tapar(l); });
    tapar($('frase')); tapar(etiquetaDe($('frase')));

    var kick = $('kick'), lk = etiquetaDe(kick);
    if (lk) lk.textContent = 'Frase para el título';
    if (kick) kick.placeholder = 'Ej: Save the Date · ¡Nos casamos!';

    var fecha = $('fecha'), lf = etiquetaDe(fecha);
    tapar(fecha); tapar(lf);
    var caja = document.createElement('div');
    caja.className = 'two';
    caja.innerHTML =
      '<div><label>Fecha <span class="req">*</span></label><input type="date" id="std-dia"></div>' +
      '<div><label>Horario (opcional)</label><input type="time" id="std-hora"></div>';
    fecha.parentNode.insertBefore(caja, fecha);
    var dia = $('std-dia'), hora = $('std-hora');
    var m = String(fecha.value || '').match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/);
    if (m) { dia.value = m[1]; if (m[2] && m[2] !== '00:00') hora.value = m[2]; }
    function pasar() {
      fecha.value = dia.value ? dia.value + 'T' + (hora.value || '00:00') : '';
      fecha.dispatchEvent(new Event('input', { bubbles: true }));
      fecha.dispatchEvent(new Event('change', { bubbles: true }));
    }
    dia.addEventListener('input', pasar); dia.addEventListener('change', pasar);
    hora.addEventListener('input', pasar); hora.addEventListener('change', pasar);
  }

  /* ---- 4. «Frase final»: sin foto ni texto largo ---- */
  if (cierre) {
    var h3 = cierre.querySelector('h2'); if (h3) h3.textContent = 'Frase final';
    var d3 = cierre.querySelector('.desc'); if (d3) d3.textContent = 'La frase de abajo de tu Save the Date.';
    tapar($('up-cierre'));
    cierre.querySelectorAll('[data-ayuda], .hint').forEach(tapar);
    tapar($('textoFinal')); tapar(etiquetaDe($('textoFinal')));
    var lff = etiquetaDe($('fraseFinal')); if (lff) lff.textContent = 'Frase final (opcional)';
    if ($('fraseFinal')) $('fraseFinal').placeholder = 'Ej: Invitación formal próximamente';
  }

  /* ---- 5. la elección del Save the Date, siempre a la vista ---- */
  var std = $('card-std');
  if (std) {
    var h4 = std.querySelector('h2'); if (h4) h4.textContent = 'Elige tu Save the Date';
    var dd = std.querySelector('.desc');
    if (dd) dd.textContent = 'Ya tiene tus nombres y tu fecha. Toca el que más te guste.';
    /* va al final, después de los datos: así las miniaturas ya salen con sus nombres */
    var ancla = cierre || portada;
    if (ancla && ancla.parentNode) ancla.parentNode.insertBefore(std, ancla.nextSibling);
  }
  function prenderStd() {
    var I = window.__INVFORM || {};
    var ex = (I.extras || []).slice(); if (ex.indexOf('saveTheDate') < 0) ex.push('saveTheDate');
    window.__INVFORM = { plan: I.plan || 'estandar', extras: ex };
    try { window.dispatchEvent(new Event('inv-paquete')); } catch (e) {}
  }
  prenderStd();
  /* el link del CRM (?f=) puede pisar __INVFORM después: se vuelve a sumar */
  window.addEventListener('inv-paquete', function () {
    var I = window.__INVFORM || {};
    if ((I.extras || []).indexOf('saveTheDate') < 0) setTimeout(prenderStd, 0);
  });

  /* ---- 6. los textos del cliente viajan con el Save the Date elegido ---- */
  function envolver() {
    var C = window.CREAR_STD;
    if (!C || C.__soloStd) return !!C;
    var leer = C.leer;
    C.leer = function () {
      var c = leer.apply(C, arguments);
      if (!c) return c;
      var tx = {};
      var t = ($('kick') && $('kick').value || '').trim();
      var p = ($('fraseFinal') && $('fraseFinal').value || '').trim();
      if (t) tx.titulo = t.slice(0, 60);
      if (p) tx.pie = p.slice(0, 80);
      if (Object.keys(tx).length) c.textos = tx;
      return c;
    };
    C.__soloStd = true;
    return true;
  }
  if (!envolver()) { var n = 0, iv = setInterval(function () { if (envolver() || ++n > 40) clearInterval(iv); }, 250); }

  /* ---- 7. antes de enviar: que haya elegido Save the Date, y la marca para Jazmín ---- */
  var send = $('send');
  if (send) {
    send.textContent = 'Enviar mis datos';
    var aviso = send.nextElementSibling;
    if (aviso && aviso.classList.contains('hint')) aviso.textContent = 'Al enviar, nuestro equipo arma tu Save the Date y te lo manda por WhatsApp.';
    send.addEventListener('click', function (ev) {
      var elegido = window.CREAR_STD && window.CREAR_STD.leer && window.CREAR_STD.leer();
      if (!elegido) {
        ev.preventDefault(); ev.stopImmediatePropagation();
        var e = $('err');
        if (e) { e.textContent = 'Elige el diseño de tu Save the Date.'; e.style.display = 'block'; }
        if (std) std.scrollIntoView({ block: 'start', behavior: 'smooth' });
        return;
      }
      var obs = $('obs');
      if (obs && obs.value.indexOf(MARCA) !== 0) obs.value = MARCA + (obs.value.trim() ? '\n' + obs.value : '');
    }, true);
  }

  /* ---- 8. el «¡Listo!» habla del Save the Date ---- */
  var done = $('done');
  if (done) {
    var h1 = done.querySelector('h1'); if (h1) h1.textContent = '¡Listo! Recibimos tus datos';
    var dt = $('done-txt');
    if (dt) dt.innerHTML = 'Ya estamos armando tu Save the Date.<br>Te lo mandamos por WhatsApp en cuanto esté listo. ¡Gracias!';
  }
})();
