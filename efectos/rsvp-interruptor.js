/* ===== EL INTERRUPTOR DE LA CONFIRMACIÓN ======================================

   Reemplaza los dos botones "Sí, asistiré" / "No podré" por un interruptor
   físico chiquito, con los rótulos a los costados:

        NO PODRÉ   (●    )   SÍ, ASISTIRÉ

   ⚠️ VIENE ENCENDIDO POR DEFECTO (decisión de Maki, 30/8/2026).
      · Para volver a los dos botones: en el panel, "Cómo se confirma la
        asistencia" → "Los dos botones de siempre" (escribe fx.rsvp.estilo =
        'botones').
      · Para probar sin tocar nada: `?rsvp=botones` o `?rsvp=interruptor`.
      Antes venía apagado y la única forma de prenderlo era escribir la base a
      mano desde la consola. Una función que no se puede tocar desde el panel es
      una función que no existe: por eso ahora hay un selector
      (`efectos/panel-rsvp.js`) y el default es el interruptor.

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
      Probado: tres toques seguidos → una sola confirmación.

   ⚠️ ES CHICO A LA VISTA PERO GRANDE AL TACTO.
      La pastilla mide 30px de alto. Las dos mitades sensibles se estiran 12px
      para arriba y para abajo, así que el dedo tiene 54px. Achicar lo que se ve
      está bien; achicar lo que se toca es un problema de uso.

   ⚠️ HAY MÁS DE UN BLOQUE DE CONFIRMACIÓN.
      Una invitación puede traer varios. Se recorre bloque por bloque y cada uno
      recibe el suyo, con su propio cerrojo.

   ⚠️ LOS BOTONES SE BUSCAN POR LO QUE HACEN, NO POR SU TEXTO.
      El texto lo puede cambiar la diseñadora; el `onclick="rsvp('si')"` no.
      Buscar por texto se rompería en silencio.

   ⚠️ LOS TEXTOS VAN EN ESPAÑOL DE MÉXICO, no en voseo.
      El motor se traduce en el servidor (i/textos-es-mx.php), pero lo que
      escribe un módulo NO pasa por ahí. Si acá dijera "Tocá tu respuesta", el
      invitado mexicano lo lee así. Se escribe bien de entrada.
   ============================================================================ */
(function () {
  'use strict';

  var MARCA = 'data-rsvp-sw';   /* para no volver a vestir un bloque ya vestido */

  /* ⚠️ Por defecto SÍ. Sólo se apaga si el panel eligió 'botones'. */
  function activo() {
    try {
      var forzado = new URLSearchParams(location.search).get('rsvp');
      if (forzado === 'botones') return false;
      if (forzado === 'interruptor') return true;
    } catch (e) {}
    try {
      var fx = (window.INVEV && window.INVEV.fx) || {};
      return (fx.rsvp || {}).estilo !== 'botones';
    } catch (e) {}
    return true;
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
    '.rsvp-caja{margin:14px auto 4px;text-align:center}' +
    '.rsvp-fila{display:flex;align-items:center;justify-content:center;gap:16px}' +
    '.rsvp-fila .et{font-size:10.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;' +
      'opacity:.45;white-space:nowrap;transition:opacity .25s}' +
    '.rsvp-caja[data-r="si"] .et.s{opacity:1}' +
    '.rsvp-caja[data-r="no"] .et.n{opacity:1}' +
    '.rsvp-pie{font-size:10.5px;opacity:.5;letter-spacing:.04em;margin:8px 0 0;min-height:15px}' +

    /* chico y sobrio: las sombras a la mitad de lo que pedía el tamaño grande */
    '.rsvp-sw{--alto:30px;--pad:4px;position:relative;flex:0 0 auto;' +
      'width:calc(var(--alto)*2.55);height:var(--alto);border-radius:999px;' +
      'border:0;padding:0;margin:0;background:transparent;cursor:pointer;' +
      '-webkit-tap-highlight-color:transparent;' +
      'filter:drop-shadow(-1px 2px 2px rgba(0,0,0,.16)) drop-shadow(-3px 5px 7px rgba(0,0,0,.12))}' +
    /* el aro: sobresale. la luz le viene de arriba a la derecha */
    '.rsvp-sw .aro{position:absolute;inset:0;border-radius:999px;' +
      'background:linear-gradient(215deg, color-mix(in srgb,var(--lino2,#faf7f1) 60%,#fff),' +
      ' var(--lino2,#faf7f1) 30%, color-mix(in srgb,var(--cream,#eeeeee) 70%,var(--muted,#888888)));' +
      'box-shadow:inset -1px 1px 0 rgba(255,255,255,.9), inset 2px -2px 5px rgba(0,0,0,.13),' +
      ' inset 0 0 0 1px rgba(255,255,255,.45)}' +
    /* el pozo: hundido. la luz va AL REVÉS que en el aro, si no se aplana */
    '.rsvp-sw .pozo{position:absolute;inset:var(--pad);border-radius:999px;overflow:hidden;' +
      'background:linear-gradient(215deg,#cfcfcb,#b9b9b4);transition:background .3s;' +
      'box-shadow:inset -3px 4px 6px rgba(0,0,0,.28), inset 2px -2px 5px rgba(255,255,255,.18),' +
      ' inset 0 0 0 1px rgba(0,0,0,.14)}' +
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
      'box-shadow:inset -1px 1px 0 rgba(255,255,255,.95), inset 2px -2px 5px rgba(0,0,0,.14),' +
      ' -2px 3px 4px rgba(0,0,0,.26), -4px 6px 8px rgba(0,0,0,.14);' +
      'transition:left .3s cubic-bezier(.34,1.3,.5,1)}' +
    '.rsvp-sw[data-r="si"] .per{left:calc(100% - var(--pad) - (var(--alto) - var(--pad)*2))}' +
    '.rsvp-sw[data-r="no"] .per{left:var(--pad)}' +
    '.rsvp-sw:active .per{transform:scale(.96)}' +
    /* chico a la vista, grande al tacto: 30px de pastilla, 54px de dedo */
    '.rsvp-sw .mitad{position:absolute;top:-12px;bottom:-12px;width:50%;border:0;' +
      'background:transparent;cursor:pointer;padding:0;z-index:3}' +
    '.rsvp-sw .mitad.izq{left:0} .rsvp-sw .mitad.der{right:0}' +
    '.rsvp-sw[disabled]{opacity:.6;cursor:default}' +
    /* en pantallas angostas, que no se rompa el renglón */
    '@media (max-width:360px){.rsvp-fila{gap:10px}.rsvp-fila .et{font-size:9.5px;letter-spacing:.1em}}' +
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

    var fila = document.createElement('div');
    fila.className = 'rsvp-fila';

    var etNo = document.createElement('span');
    etNo.className = 'et n'; etNo.textContent = 'No podré';

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

    var etSi = document.createElement('span');
    etSi.className = 'et s'; etSi.textContent = 'Sí, asistiré';

    fila.appendChild(etNo); fila.appendChild(sw); fila.appendChild(etSi);
    caja.appendChild(fila);

    var pie = document.createElement('p');
    pie.className = 'rsvp-pie';
    pie.textContent = 'Toca tu respuesta';
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
          pie.textContent = 'No se pudo enviar. Prueba de nuevo.';
        }
      }, 340);                             /* que se vea moverse antes de irse */
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
