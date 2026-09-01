/* ===== LA MUESTRA: QUE LA CONFIRMACIÓN SE VEA FUNCIONANDO ====================

   EL PEDIDO
   Maki: «esa va a ser una muestra que la va a ver la gente, entonces tiene que
   verla cómo funciona la gente. No me pongas un cartelito cuando alguien la
   compre va a tener una confirmación de asistencia. Necesito que se vea todo
   perfecto como va a quedar».

   QUÉ HACE EL MOTOR HOY  (y por qué está bien que lo haga)
   El motor tiene modo VIDRIERA: si la invitación se abre SIN link de invitado
   —o sea, sin `INVDATA.token`— esconde
     · el formulario de confirmación (`.rsvpform`), y
     · el pase con el QR (`.pase`, con nombre, personas, mesa y estado),
   y reemplaza la frase de la sección por «Esta es una muestra. En la invitación
   real, cada invitado entra con su propio link…».

   Para una invitación de VERDAD eso está perfecto: sin invitado no hay a quién
   anotar, y un formulario que no guarda nada sería mentira.
   Para LA MUESTRA que se le manda a alguien que todavía no compró, es justo al
   revés: la confirmación ES lo que hay que mostrar.

   QUÉ HACE ESTE MÓDULO
   Con el interruptor prendido, y SÓLO cuando no hay invitado, devuelve el
   formulario y el pase, y les pone datos de ejemplo (nombre, personas, mesa)
   que se editan desde el panel. El visitante contesta y ve exactamente la misma
   respuesta que vería un invitado real.

   ⚠️ NO ESCRIBE EN LA BASE, y no puede: no hay invitado a quien anotar. El
      motor ya se ocupa de eso solo — `rsvp()` sólo guarda si hay
      `INVDATA.slug` Y `INVDATA.token`. Acá no tocamos nada de eso.

   ⚠️ SÓLO ACTÚA EN VIDRIERA. Si la invitación se abre con link de invitado,
      este módulo no hace absolutamente nada: manda el invitado de verdad, con
      su nombre, sus pases y su QR. Así, dejarlo prendido en una invitación
      entregada no rompe nada.

   ⚠️ EL QR YA ESTÁ DIBUJADO. `pintarQR` corre igual en vidriera: la imagen del
      QR existe aunque el pase esté escondido. Por eso alcanza con mostrarlo.

   ⚠️ EL NOMBRE SE ESCRIBE UNA SOLA VEZ. El motor redibuja, y este módulo se
      vuelve a pasar cada 400 ms; si reescribiera `#rname` en cada vuelta, le
      borraría al visitante lo que está tipeando. Por eso la bandera `tocado`.

   CÓMO SE CONFIGURA  (panel → /efectos/panel-muestra.js)
     fx.muestra.rsvp    → prendido / apagado
     fx.muestra.nombre  → el nombre del invitado de ejemplo
     fx.muestra.pases   → cuántos lugares
     fx.muestra.mesa    → la mesa
     fx.muestra.estado  → qué dice "Estado del pase"
   ============================================================================ */
(function () {
  'use strict';

  function fx() {
    try { return ((window.INVEV || {}).fx) || {}; } catch (e) { return {}; }
  }
  function cfg() {
    var m = fx().muestra;
    return (m && typeof m === 'object') ? m : {};
  }
  function siNo(v) {
    return v === true || String(v) === '1' || /^(si|sí|true)$/i.test(String(v || ''));
  }

  /* Prendido desde el panel, o a mano con ?muestra=1 para probar sin guardar */
  function encendida() {
    try {
      var u = new URLSearchParams(location.search).get('muestra');
      if (u !== null) return u !== '0';
    } catch (e) {}
    return siNo(cfg().rsvp);
  }

  /* vidriera = la invitación se abrió sin link de invitado */
  function sinInvitado() {
    try { return !((window.INVDATA || {}).token); } catch (e) { return true; }
  }

  function dato(k, porDefecto) {
    var v = cfg()[k];
    return (v === undefined || v === null || String(v).trim() === '')
      ? porDefecto : String(v).trim();
  }

  function ponerTexto(id, v) {
    var e = document.getElementById(id);
    if (e && e.textContent !== v) e.textContent = v;
  }

  /* ⚠️ una sola vez: si no, le borra al visitante lo que está escribiendo */
  var tocado = false;
  function ponerNombre(v) {
    var e = document.getElementById('rname');
    if (!e || tocado) return;
    if (e.value && e.value !== v) { tocado = true; return; }
    if (!e.value) {
      e.value = v;
      e.addEventListener('input', function () { tocado = true; }, { once: true });
    }
  }

  function poner() {
    if (!encendida() || !sinInvitado()) return;

    /* el formulario, que la vidriera escondió */
    [].forEach.call(document.querySelectorAll('.rsvpform'), function (f) {
      if (f.style.display === 'none') f.style.display = '';
    });

    /* la frase de la sección: la vidriera la pisa con el cartelito */
    var p = document.querySelector('[data-sec="confirmacion"] p');
    var frase = '';
    try {
      var ev = window.INVEV || {};
      frase = String(ev['c_frase-para-seccion-confirmacion'] ||
                     ev['c_frase-para-secci-n-de-confirmaci-n'] || '').trim();
    } catch (e) {}
    if (p && frase && p.textContent !== frase) p.textContent = frase;

    /* el pase con el QR — el QR ya está dibujado, sólo estaba escondido */
    var pase = document.querySelector('.pase');
    if (pase && pase.style.display === 'none') pase.style.display = '';

    ponerTexto('pv-gname',  dato('nombre', 'Familia Rivera'));
    ponerTexto('pv-per',    dato('pases',  '2'));
    ponerTexto('pv-mesa',   dato('mesa',   '7'));
    ponerTexto('pv-estado', dato('estado', 'Sin usar'));
    ponerNombre(dato('nombre', 'Familia Rivera'));
  }

  function arrancar() {
    if (!document.body) { setTimeout(arrancar, 60); return; }
    poner();
    addEventListener('message', function () { setTimeout(poner, 80); });
    var n = 0, t = setInterval(function () {
      poner();
      if (++n > 80) clearInterval(t);
    }, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
