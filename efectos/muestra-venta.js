/* ===== LA MUESTRA VENDE =====================================================

   Las invitaciones de muestra no son una demo interna: están colgadas en la
   web y se las mandamos a la gente. Cada muestra dando vueltas es un vendedor.
   Maki: «tenemos que tener en cuenta que estas muestras van a estar colgadas
   en la web y se las enviamos a los clientes como muestras así que están por
   todos lados para vender».

   Entonces, cuando la invitación está en MODO MUESTRA, este módulo hace dos
   cosas:

   1. LOS TELÉFONOS. Los botones de contacto («Escríbele a Camila», «Escríbele
      a Tomás») y el WhatsApp verde flotante apuntan al número de ventas de
      Invítame, con un mensaje ya escrito. Quien toca cualquiera de esos
      botones cae en la bandeja de ventas, no en un número inventado.

   2. EL LLAMADO DEL CIERRE. Abajo de todo, donde dice «Invitación creada con
      InvitaME», aparece «¿Quieres la tuya?» con un botón de WhatsApp y el
      mensaje precargado. Es el único lugar de la invitación donde le hablamos
      al visitante y no al invitado.

   ⚠️ SÓLO EN LAS MUESTRAS. El módulo se planta y no hace NADA si:
        · hay link de invitado (INVDATA.token) → es una invitación entregada;
        · o `fx.muestra.venta` está apagado.
      Una invitación de un cliente real jamás muestra el número de Invítame ni
      el llamado. Ese es todo el punto del interruptor.

   ⚠️ NO SE PISA CON wa-flotante.js. Ese módulo escribe el href UNA sola vez
      (no tiene setInterval), así que alcanza con reescribirlo después. Igual
      lo revisamos en cada vuelta, por si algún día cambia.

   ⚠️ LA LETRA NO SE ELIGE: SE COPIA DE AL LADO. La primera versión dejaba
      `font-family:inherit` y el llamado salía con la tipografía por defecto
      del navegador, al lado de un «¡Gracias!» en Cormorant: se veía pegado.
      El módulo no sabe qué colección está puesta, así que le pregunta al DOM:
      le copia la familia y el color al «¡Gracias!» (#fin-frase) que ya está
      ahí arriba. Así queda bien con cualquier colección, incluidas las que
      todavía no existen.

   Se maneja desde el panel: /efectos/panel-muestra.js, «Sector de muestras».
   El compañero de este módulo es /efectos/rsvp-muestra.js, que destapa la
   confirmación y el pase.
   ============================================================================ */
(function () {

  var TEL_POR_DEFECTO = '+52 1 999 416 0750';   /* el mismo de invitameok.com */

  /* ---------- de dónde salen los datos ---------- */

  function ev() { return (window.INVEV || {}); }
  function cfg() { return (ev().fx || {}).muestra || {}; }

  function sinInvitado() {
    var d = window.INVDATA || {};
    return !d.token;
  }
  function prendida() {
    /* el modo muestra se puede forzar con ?muestra=1 para mirarla nosotros */
    try {
      if (/[?&]muestra=1/.test(location.search)) return true;
    } catch (e) {}
    var c = cfg();
    var v = c.venta;
    if (v === false || String(v) === '0' || /^(no|false)$/i.test(String(v || ''))) return false;
    return v === true || String(v) === '1' || /^(si|sí|true)$/i.test(String(v || ''));
  }

  function soloNumeros(t) { return String(t || '').replace(/[^0-9]/g, ''); }

  function telVenta() {
    return soloNumeros(cfg().tel || TEL_POR_DEFECTO);
  }

  function nombresDeLaFiesta() {
    var n = document.getElementById('fin-nombres');
    var t = n ? (n.textContent || '') : '';
    t = t.split('·')[0].trim();
    if (t) return t;
    var e = ev();
    var a = String(e.n1 || '').trim(), b = String(e.n2 || '').trim();
    if (a && b) return a + ' & ' + b;
    return a || b || '';
  }

  function mensaje() {
    var m = String(cfg().msj || '').trim();
    if (m) return m;
    var n = nombresDeLaFiesta();
    return 'Hola, me gustó esta muestra' + (n ? ' (' + n + ')' : '') +
           ' y quiero más info sobre las invitaciones digitales.';
  }

  function textoLlamado() {
    return String(cfg().cta || '').trim() || '¿Quieres la tuya?';
  }

  function enlace() {
    return 'https://wa.me/' + telVenta() + '?text=' + encodeURIComponent(mensaje());
  }

  /* ---------- 1. los teléfonos ---------- */

  function ponerTelefonos() {
    var url = enlace();
    var lista = [];
    ['wa-p1', 'wa-p2'].forEach(function (id) {
      var a = document.getElementById(id);
      if (a) lista.push(a);
    });
    [].forEach.call(document.querySelectorAll('.wafloat'), function (a) { lista.push(a); });

    lista.forEach(function (a) {
      if (a.getAttribute('href') === url) return;
      a.setAttribute('href', url);
      a.setAttribute('data-mvta', '1');
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }

  /* ---------- 2. el llamado del cierre ---------- */

  function estilo() {
    if (document.getElementById('col-mvta-css')) return;
    var s = document.createElement('style');
    s.id = 'col-mvta-css';
    s.textContent = [
      /* Sin caja, sin papel: una línea fina y letras. Así queda bien sobre
         cualquier fondo, que en el cierre es una foto y cambia en cada boda. */
      '.col-mvta{margin:22px auto 0;max-width:340px;text-align:center;',
        'display:flex;flex-direction:column;align-items:center;gap:13px}',
      '.col-mvta-t{font-size:21px;font-weight:300;letter-spacing:.005em;',
        'opacity:.94;line-height:1.25}',
      '.col-mvta-b{display:inline-block;text-decoration:none;color:inherit;',
        'font-family:Montserrat,"Helvetica Neue",Arial,sans-serif;',
        'font-size:10px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;',
        'padding:9px 20px 9px calc(20px + .2em);border:1px solid currentColor;',
        'border-radius:999px;opacity:.72;transition:opacity .25s ease}',
      '.col-mvta-b:hover,.col-mvta-b:focus{opacity:1}',
      '@media (max-width:420px){.col-mvta{margin-top:20px}.col-mvta-t{font-size:19px}}'
    ].join('');
    document.head.appendChild(s);
  }

  /* le copia la letra al «¡Gracias!» que ya está ahí arriba */
  function heredarLetra(tt) {
    var g = document.getElementById('fin-frase') ||
            document.querySelector('.footer .n');
    if (!g || !tt) return;
    var c = getComputedStyle(g);
    if (!c || !c.fontFamily) return;
    if (tt.dataset.letra === c.fontFamily) return;
    tt.dataset.letra = c.fontFamily;
    tt.style.fontFamily = c.fontFamily;
    tt.style.fontStyle = c.fontStyle;
  }

  function ponerLlamado() {
    var pie = document.getElementById('pie-pub');
    if (!pie || !pie.parentNode) return;

    var caja = document.getElementById('col-mvta');
    if (!caja) {
      estilo();
      caja = document.createElement('div');
      caja.id = 'col-mvta';
      caja.className = 'col-mvta';
      var t = document.createElement('div');
      t.className = 'col-mvta-t';
      var a = document.createElement('a');
      a.className = 'col-mvta-b';
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Escríbenos por WhatsApp';
      caja.appendChild(t);
      caja.appendChild(a);
      pie.parentNode.insertBefore(caja, pie.nextSibling);
    } else if (caja.previousElementSibling !== pie) {
      /* si el motor volvió a dibujar el cierre, lo reacomodamos */
      pie.parentNode.insertBefore(caja, pie.nextSibling);
    }

    var tt = caja.querySelector('.col-mvta-t');
    var aa = caja.querySelector('.col-mvta-b');
    var txt = textoLlamado();
    var url = enlace();
    if (tt && tt.textContent !== txt) tt.textContent = txt;
    if (aa && aa.getAttribute('href') !== url) aa.setAttribute('href', url);
    heredarLetra(tt);
  }

  function sacarLlamado() {
    var caja = document.getElementById('col-mvta');
    if (caja && caja.parentNode) caja.parentNode.removeChild(caja);
  }

  /* ---------- la vuelta ---------- */

  function vuelta() {
    if (!sinInvitado()) { sacarLlamado(); return; }
    if (!prendida())    { sacarLlamado(); return; }
    ponerTelefonos();
    ponerLlamado();
  }

  function arrancar() {
    vuelta();
    setInterval(vuelta, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
