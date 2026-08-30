/* ===== EL INTERRUPTOR DE LA CONFIRMACIÓN ======================================

   Reemplaza los dos botones "Sí, asistiré" / "No podré" por un interruptor
   físico: aro que sobresale, pozo hundido y perilla apoyada adentro.

   Cómo se enciende:  INVEV.fx.rsvp.estilo = 'interruptor'
   Cómo se apaga:     INVEV.fx.rsvp.estilo = ''   (vuelven los dos botones)

   ⚠️ ESTO TOCA LA CONFIRMACIÓN, QUE ES POR DONDE ENTRA LA PLATA.
      Por eso está hecho como una PIEL y no como un reemplazo:

      · los botones originales NO se borran, se esconden;
      · al elegir, se llama a `.click()` DEL BOTÓN ORIGINAL — o sea que se
        recorre exactamente el mismo camino de siempre, con sus validaciones y
        su pantalla de gracias. Este módulo no habla con la base;
      · si este archivo falla o se saca de la lista, vuelven los dos botones y
        la confirmación sigue funcionando igual.

   ⚠️ LA PERILLA ARRANCA AL MEDIO, SIN RESPUESTA.
      Un interruptor común necesita una posición inicial, y en una confirmación
      cualquier posición inicial es una respuesta ya dada: el invitado abre la
      invitación y ya dice "sí" sin haber tocado nada. Acá arranca en el medio,
      apagado, y recién toma partido cuando lo tocan.

   ⚠️ MANDA UNA SOLA VEZ.
      `rsvp()` escribe en la base al instante y NO deshabilita el botón: dos
      toques seguidos mandan dos veces. Este módulo pone el cerrojo que falta —
      una vez enviado no vuelve a disparar, y mientras tanto muestra "enviando".

   ⚠️ LOS BOTONES SE BUSCAN POR LO QUE HACEN, NO POR SU TEXTO.
      El texto lo traduce es-mx.js y lo puede cambiar la diseñadora; el
      `onclick="rsvp('si')"` no. Buscar por texto se rompería en silencio.
   ============================================================================ */
(function () {
  'use strict';

  var ID = 'rsvp-interruptor';

  function activo() {
    try {
      var fx = (window.INVEV && window.INVEV.fx) || {};
      if ((fx.rsvp || {}).estilo === 'interruptor') return true;
    } catch (e) {}
    try { return new URLSearchParams(location.search).get('rsvp') === 'interruptor'; }
    catch (e) { return false; }
  }

  function botones() {
    var todos = [].slice.call(document.querySelectorAll('.rsvpform button'));
    var si = null, no = null;
    todos.forEach(function (b) {
      var o = (b.getAttribute('onclick') || '') + '';
      if (/rsvp\(\s*['"]si['"]/.test(o)) si = b;
      if (/rsvp\(\s*['"]no['"]/.test(o)) no = b;
    });
    return (si && no) ? { si: si, no: no } : null;
  }

  var CSS =
    '.rsvp-sw{--alto:62px;--pad:7px;position:relative;width:calc(var(--alto)*2.45);height:var(--alto);' +
      'margin:6px auto 10px;border:0;padding:0;background:transparent;border-radius:999px;cursor:pointer;' +
      'display:block;-webkit-tap-highlight-color:transparent;' +
      'filter:drop-shadow(-4px 6px 6px rgba(0,0,0,.18)) drop-shadow(-10px 15px 20px rgba(0,0,0,.16))}' +
    /* el aro: sobresale. la luz le viene de arriba a la derecha */
    '.rsvp-sw .aro{position:absolute;inset:0;border-radius:999px;' +
      'background:linear-gradient(215deg, color-mix(in srgb,var(--lino2,#faf7f1) 60%,#fff),' +
      ' var(--lino2,#faf7f1) 30%, color-mix(in srgb,var(--cream,#eeeeee) 70%,var(--muted,#888888)));' +
      'box-shadow:inset -2px 2px 0 rgba(255,255,255,.95), inset 5px -6px 13px rgba(0,0,0,.16),' +
      ' inset 0 0 0 1px rgba(255,255,255,.5)}' +
    /* el pozo: hundido. la luz va AL REVÉS que en el aro, si no se aplana */
    '.rsvp-sw .pozo{position:absolute;inset:var(--pad);border-radius:999px;overflow:hidden;' +
      'background:linear-gradient(215deg,#cfcfcb,#b9b9b4);transition:background .3s;' +
      'box-shadow:inset -7px 9px 15px rgba(0,0,0,.34), inset 5px -6px 12px rgba(255,255,255,.20),' +
      ' inset 0 0 0 1px rgba(0,0,0,.18)}' +
    '.rsvp-sw[data-r="si"] .pozo{background:linear-gradient(215deg,' +
      ' color-mix(in srgb,var(--sage,#5f9e4a) 75%,#fff), var(--sage,#5f9e4a))}' +
    '.rsvp-sw[data-r="no"] .pozo{background:linear-gradient(215deg,' +
      ' color-mix(in srgb,var(--muted,#8a7f78) 60%,#fff), var(--muted,#8a7f78))}' +
    /* la perilla: apoyada ADENTRO del pozo, así que su sombra cae sobre el fondo */
    '.rsvp-sw .per{position:absolute;top:var(--pad);bottom:var(--pad);' +
      'width:calc(var(--alto) - var(--pad)*2);border-radius:50%;' +
      'left:calc(50% - (var(--alto) - var(--pad)*2)/2);' +
      'background:radial-gradient(58% 52% at 68% 24%, #fff, rgba(255,255,255,0) 70%),' +
      ' linear-gradient(215deg,#ffffff,#f2f0ec 48%,#d8d5cf);' +
      'box-shadow:inset -2px 2px 0 rgba(255,255,255,.95), inset 4px -5px 11px rgba(0,0,0,.16),' +
      ' -4px 6px 7px rgba(0,0,0,.30), -9px 13px 16px rgba(0,0,0,.18);' +
      'transition:left .32s cubic-bezier(.34,1.3,.5,1)}' +
    '.rsvp-sw[data-r="si"] .per{left:calc(100% - var(--pad) - (var(--alto) - var(--pad)*2))}' +
    '.rsvp-sw[data-r="no"] .per{left:var(--pad)}' +
    '.rsvp-sw:active .per{transform:scale(.97)}' +
    /* las dos mitades sensibles */
    '.rsvp-sw .mitad{position:absolute;top:0;bottom:0;width:50%;border:0;background:transparent;' +
      'cursor:pointer;padding:0;z-index:3}' +
    '.rsvp-sw .mitad.izq{left:0} .rsvp-sw .mitad.der{right:0}' +
    /* los rótulos, afuera */
    '.rsvp-rot{display:flex;justify-content:center;gap:26px;font-size:11.5px;font-weight:700;' +
      'letter-spacing:.1em;text-transform:uppercase;opacity:.62;margin:0 0 4px}' +
    '.rsvp-rot span{transition:opacity .25s}' +
    '.rsvp-caja[data-r="si"] .rsvp-rot .s{opacity:1;text-decoration:underline;text-underline-offset:4px}' +
    '.rsvp-caja[data-r="no"] .rsvp-rot .n{opacity:1;text-decoration:underline;text-underline-offset:4px}' +
    '.rsvp-pie{text-align:center;font-size:12px;opacity:.72;min-height:17px;margin:2px 0 0}' +
    '.rsvp-sw[disabled]{opacity:.6;cursor:default}' +
    '@media (prefers-reduced-motion:reduce){.rsvp-sw .per{transition:none}}';

  function hoja() {
    if (document.getElementById('rsvp-sw-css')) return;
    var s = document.createElement('style');
    s.id = 'rsvp-sw-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  var enviado = false;

  function construir(bs) {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.className = 'rsvp-caja';

    var rot = document.createElement('div');
    rot.className = 'rsvp-rot';
    rot.innerHTML = '<span class="n">No podré</span><span class="s">Sí, asistiré</span>';
    caja.appendChild(rot);

    var sw = document.createElement('div');
    sw.className = 'rsvp-sw';
    sw.setAttribute('role', 'group');
    sw.setAttribute('aria-label', '¿Vas a poder venir?');
    sw.innerHTML = '<span class="aro"></span><span class="pozo"></span><span class="per"></span>';

    var izq = document.createElement('button');
    izq.type = 'button'; izq.className = 'mitad izq';
    izq.setAttribute('aria-label', 'No podré');
    var der = document.createElement('button');
    der.type = 'button'; der.className = 'mitad der';
    der.setAttribute('aria-label', 'Sí, asistiré');
    sw.appendChild(izq); sw.appendChild(der);
    caja.appendChild(sw);

    var pie = document.createElement('p');
    pie.className = 'rsvp-pie';
    pie.textContent = 'Tocá de un lado o del otro';
    caja.appendChild(pie);

    function elegir(cual) {
      if (enviado) return;                 /* el cerrojo que le falta a rsvp() */
      enviado = true;
      sw.setAttribute('data-r', cual);
      caja.setAttribute('data-r', cual);
      sw.setAttribute('disabled', 'disabled');
      pie.textContent = 'Enviando…';
      /* se dispara el botón ORIGINAL: mismo camino de siempre */
      setTimeout(function () {
        try { (cual === 'si' ? bs.si : bs.no).click(); }
        catch (e) {
          /* si algo falla, devolver el control en vez de dejarlo trabado */
          enviado = false;
          sw.removeAttribute('disabled');
          pie.textContent = 'No se pudo enviar. Probá de nuevo.';
        }
      }, 360);                             /* que se vea moverse antes de irse */
    }

    izq.onclick = function () { elegir('no'); };
    der.onclick = function () { elegir('si'); };
    return caja;
  }

  function mostrarBotones(ver) {
    var bs = botones();
    if (!bs) return;
    /* se esconden, NO se borran: si este módulo se saca, vuelven */
    bs.si.style.display = ver ? '' : 'none';
    bs.no.style.display = ver ? '' : 'none';
  }

  function poner() {
    if (!activo()) {
      var v = document.getElementById(ID);
      if (v) { v.remove(); mostrarBotones(true); }
      return;
    }
    if (document.getElementById(ID)) return;
    var bs = botones();
    if (!bs) return;                        /* la confirmación todavía no está */
    hoja();
    bs.si.parentNode.insertBefore(construir(bs), bs.si);
    mostrarBotones(false);
  }

  var n = 0;
  var t = setInterval(function () {
    poner();
    if (++n > 240) clearInterval(t);       /* dos minutos y listo */
  }, 500);
})();
