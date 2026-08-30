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
      toques seguidos mandan dos veces. Este módulo pone el cerrojo que falta.

   ⚠️ HAY MÁS DE UN BLOQUE DE CONFIRMACIÓN.  ← esto costó un bug
      Una invitación puede traer varios (por ejemplo un evento y otro). La
      primera versión recorría TODOS los botones de la página y se quedaba con
      el último par: ponía el interruptor en un bloque y dejaba los demás con
      los botones viejos. Media invitación con una cosa y media con otra.
      Ahora se recorre bloque por bloque y cada uno recibe el suyo.

   ⚠️ LOS BOTONES SE BUSCAN POR LO QUE HACEN, NO POR SU TEXTO.
      El texto lo traduce es-mx.js y lo puede cambiar la diseñadora; el
      `onclick="rsvp('si')"` no. Buscar por texto se rompería en silencio.
   ============================================================================ */
(function () {
  'use strict';

  var MARCA = 'data-rsvp-sw';   /* para no volver a vestir un bloque ya vestido */

  function activo() {
    try {
      var fx = (window.INVEV && window.INVEV.fx) || {};
      if ((fx.rsvp || {}).estilo === 'interruptor') return true;
    } catch (e) {}
    try { return new URLSearchParams(location.search).get('rsvp') === 'interruptor'; }
    catch (e) { return false; }
  }

  /* los dos botones DE ESTE bloque */
  function parDe(form) {
    var si = null, no = null;
    [].slice.call(form.querySelectorAll('button')).forEach(function (b) {
      var o = (b.getAttribute('onclick') || '') + '';
      if (/rsvp\(\s*['"]si['"]/.test(o)) si = b;
      if (/rsvp\(\s*['"]no['"]/.test(o)) no = b;
    });
    return (si && no) ? { si: si, no: no } : null;
  }

  var CSS =
    /* la caja manda el tamaño, y los rótulos toman su ancho: así "No podré"
       queda sobre la mitad izquierda y "Sí, asistiré" sobre la derecha, que es
       lo que le dice al invitado para dónde tocar. */
    '.rsvp-caja{--alto:68px;--pad:8px;width:calc(var(--alto)*2.45 + 52px);' +
      'margin:0 auto;text-align:center}' +
    '.rsvp-rot{display:flex;justify-content:space-between;padding:0 2px;margin:0 0 6px;' +
      'font-size:11.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.62}' +
    '.rsvp-rot span{transition:opacity .25s}' +
    '.rsvp-caja[data-r="si"] .rsvp-rot .s{opacity:1;text-decoration:underline;text-underline-offset:4px}' +
    '.rsvp-caja[data-r="no"] .rsvp-rot .n{opacity:1;text-decoration:underline;text-underline-offset:4px}' +

    '.rsvp-sw{position:relative;width:calc(var(--alto)*2.45);height:var(--alto);' +
      'margin:0 auto 10px;border:0;padding:0;background:transparent;border-radius:999px;cursor:pointer;' +
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
    /* la perilla: apoyada ADENTRO del pozo, su sombra cae sobre el fondo */
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

  /* un interruptor por bloque, cada uno con SU cerrojo */
  function construir(bs) {
    var enviado = false;

    var caja = document.createElement('div');
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

  function vestir(form) {
    var bs = parDe(form);
    if (!bs) return;
    hoja();
    bs.si.parentNode.insertBefore(construir(bs), bs.si);
    /* se esconden, NO se borran: si este módulo se saca, vuelven */
    bs.si.style.display = 'none';
    bs.no.style.display = 'none';
    form.setAttribute(MARCA, '1');
  }

  function desvestir(form) {
    var c = form.querySelector('.rsvp-caja');
    if (c) c.remove();
    var bs = parDe(form);
    if (bs) { bs.si.style.display = ''; bs.no.style.display = ''; }
    form.removeAttribute(MARCA);
  }

  function repasar() {
    var formularios = [].slice.call(document.querySelectorAll('.rsvpform'));
    var on = activo();
    formularios.forEach(function (f) {
      var vestido = f.hasAttribute(MARCA);
      if (on && !vestido) vestir(f);
      else if (!on && vestido) desvestir(f);
    });
  }

  var n = 0;
  var t = setInterval(function () {
    repasar();
    if (++n > 240) clearInterval(t);       /* dos minutos y listo */
  }, 500);
})();
