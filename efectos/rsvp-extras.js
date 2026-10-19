/* ===== LA CONFIRMACIÓN: FECHA LÍMITE Y RESTRICCIONES ALIMENTARIAS ============

   Pedido de Jazmín (15/10/2026), en el documento «AJUSTES FORMULARIO»:
     · «Incluir un campo para indicar la fecha límite de confirmación.»
     · «Permitir especificar si se desea consultar o aclarar restricciones
        alimentarias.»
   Maki: «hacelo y dejá todo checado».

   DE DÓNDE SALE
     fx.rsvp.limite         → 'AAAA-MM-DD'. Si está, abajo de la frase de la
                              sección aparece «Confirma antes del 1 de marzo».
     fx.rsvp.restricciones  → true. Si está, el formulario de confirmación
                              suma la pregunta «¿Alguna restricción
                              alimentaria?». Lo que escribe el invitado se
                              guarda en su ficha (`rsvpRestriccion`) y los
                              novios lo ven en su panel.

   Los dos se prenden desde:
     · el panel de Jazmín, pestaña de Confirmación (efectos/panel-rsvp.js)
     · el formulario del cliente (crear.html), que los manda ya puestos.

   ⚠️ ESTO TOCA LA CONFIRMACIÓN, QUE ES POR DONDE ENTRA LA PLATA.
      Este módulo no cambia los botones ni el camino de guardado: agrega una
      línea de texto, un casillero, y le pasa el casillero a `INV.saveRSVP`
      (firebase-inv.js), que lo guarda junto con la respuesta.
      Si este archivo falla, la confirmación sigue andando igual que antes.

   ⚠️⚠️ NO SE TOCA EL MOTOR (i/index.html), Y NO ES CAPRICHO.
      Las invitaciones se sirven desde versiones CONGELADAS (i/v/<versión>/),
      y la de cada una la trae el vestido de su muestra (`ver`). Un cambio en
      `rsvp()` del motor no llegaba a ninguna: medido el 15/10 en la primera
      invitación creada por el formulario nuevo, la restricción no viajaba.
      Por eso el casillero se lee ACÁ, envolviendo `INV.saveRSVP`, que sí es el
      mismo archivo para todas las versiones.

   ⚠️ LA FECHA NO CIERRA LA CONFIRMACIÓN. Pasado el día, el invitado puede
      confirmar igual: a los anfitriones les sirve más un «sí» tarde que
      ninguno. La línea cambia a «La fecha para confirmar era el …».
   ============================================================================ */
(function () {
  'use strict';

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
               'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function cfg() {
    try {
      var ev = window.INVEV || {};
      return (ev.fx && ev.fx.rsvp) || {};
    } catch (e) { return {}; }
  }

  function siNo(v) {
    return v === true || String(v) === '1' || /^(si|sí|true)$/i.test(String(v || ''));
  }

  /* 'AAAA-MM-DD' → Date a mediodía local (sin corrimiento de huso) */
  function laFecha(s) {
    var m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3], 12, 0, 0);
    return isNaN(d) ? null : d;
  }

  function lineaLimite() {
    var sec = document.querySelector('[data-sec="confirmacion"]');
    if (!sec) return;
    var d = laFecha(cfg().limite);
    var linea = document.getElementById('rsvp-limite');
    if (!d) { if (linea) linea.remove(); return; }
    if (!linea) {
      linea = document.createElement('p');
      linea.id = 'rsvp-limite';
      linea.style.cssText = 'margin:8px auto 0;font-weight:700;letter-spacing:.02em';
      var p = sec.querySelector('p');
      if (p && p.parentNode) p.parentNode.insertBefore(linea, p.nextSibling);
      else {
        var f = sec.querySelector('.rsvpform');
        if (f && f.parentNode) f.parentNode.insertBefore(linea, f); else sec.appendChild(linea);
      }
    }
    var txt = d.getDate() + ' de ' + MESES[d.getMonth()];
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var fin = new Date(d); fin.setHours(23, 59, 59, 0);
    var t = (fin < hoy) ? ('La fecha para confirmar era el ' + txt + '.')
                        : ('Confirma antes del ' + txt + '.');
    if (linea.textContent !== t) linea.textContent = t;
  }

  function preguntaRestricciones() {
    var on = siNo(cfg().restricciones);
    var formularios = document.querySelectorAll('.rsvpform');
    [].forEach.call(formularios, function (f, i) {
      var caja = f.querySelector('.rsvp-restric');
      if (!on) { if (caja) caja.style.display = 'none'; return; }
      if (!caja) {
        caja = document.createElement('div');
        caja.className = 'rsvp-restric';
        var lab = document.createElement('label');
        lab.textContent = '¿Alguna restricción alimentaria? (opcional)';
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.maxLength = 300;
        inp.placeholder = 'Ej: vegetariano, alergia a mariscos';
        /* el motor lee éste: sólo el primero lleva el id */
        if (i === 0) inp.id = 'rrestric';
        caja.appendChild(lab); caja.appendChild(inp);
        var botones = f.querySelector('.acc-r');
        if (botones) f.insertBefore(caja, botones); else f.appendChild(caja);
      }
      caja.style.display = '';
    });
  }

  /* le pasa la restricción a INV.saveRSVP cuando el motor no la manda */
  function envolverGuardado() {
    var I = window.INV;
    if (!I || typeof I.saveRSVP !== 'function' || I.saveRSVP.__conRestriccion) return;
    var original = I.saveRSVP;
    var envuelto = function (slug, token, estado, personas, mensaje, restriccion) {
      /* ★ 16/10/2026 — LA CANTIDAD QUE ELIGIÓ EL INVITADO. El motor manda la
         cantidad del PASE (el total, «4»), no la del selector «¿Cuántos
         asistirán?» («2»): medido por Jazmín, una familia de 4 que confirmó 2
         quedaba como «confirmaron 4». Se lee el selector, que es lo que eligió. */
      if (estado === 'confirmado') {
        var sel = null;
        [].some.call(document.querySelectorAll('.rsvpform select'), function (s) {
          if (s.offsetParent !== null) { sel = s; return true; } return false;
        });
        if (!sel) sel = document.querySelector('.rsvpform select');
        var n = sel ? parseInt(sel.value, 10) : NaN;
        if (!isNaN(n) && n > 0) personas = n;
      }
      if (restriccion == null || restriccion === '') {
        var r = document.getElementById('rrestric');
        restriccion = (r && r.offsetParent !== null && r.value) ? r.value : '';
      }
      return original.call(this, slug, token, estado, personas, mensaje, restriccion);
    };
    envuelto.__conRestriccion = true;
    I.saveRSVP = envuelto;
  }

  /* ★ 16/10/2026 — el selector «¿Cuántos asistirán?» venía fijo en 1 a 4, sin
     importar el pase: una familia de 6 no podía elegir 6, y una persona sola
     podía elegir 4. Con pase personal (#pv-per) se arma de 1 al total del
     pase, y arranca en el total. */
  function ajustarCantidad() {
    if (!/[?&]g=/.test(location.search)) return;    /* sólo con pase personal */
    var per = document.getElementById('pv-per');
    var n = per ? parseInt(per.textContent, 10) : NaN;
    if (isNaN(n) || n < 1 || n > 60) return;
    [].forEach.call(document.querySelectorAll('.rsvpform select'), function (s) {
      if (s.dataset.armadoPara === String(n)) return;
      var antes = parseInt(s.value, 10);
      s.innerHTML = '';
      for (var i = 1; i <= n; i++) {
        var o = document.createElement('option'); o.value = String(i); o.textContent = String(i); s.appendChild(o);
      }
      /* ⚠️ el motor arranca con un número de muestra en #pv-per (2) y recién
         después pone el del pase: si el invitado todavía no eligió, va el total */
      s.value = String((!s.dataset.tocado || isNaN(antes) || antes > n) ? n : antes);
      s.dataset.armadoPara = String(n);
      if (!s.dataset.escucha) { s.dataset.escucha = '1'; s.addEventListener('change', function () { s.dataset.tocado = '1'; }); }
    });
  }

  function poner() {
    try { ajustarCantidad(); } catch (e) {}
    try { lineaLimite(); } catch (e) {}
    try { preguntaRestricciones(); } catch (e) {}
    try { envolverGuardado(); } catch (e) {}
  }

  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    poner();
    /* la miniatura del panel manda el evento por mensaje: se repinta */
    addEventListener('message', function () { setTimeout(poner, 120); });
    var n = 0, t = setInterval(function () {
      poner();
      if (++n > 40) clearInterval(t);
    }, 500);
  }
  arrancar();
})();
