/* ===== SECTOR DE MUESTRAS, EN EL PANEL ======================================

   Todo lo que hace que una invitación sea UNA MUESTRA, junto y en un solo
   lugar. Son dos cosas distintas y cada una tiene su interruptor:

   1. QUE SE VEA FUNCIONANDO. La confirmación de asistencia y el pase con QR
      se muestran con un invitado de ejemplo, aunque no haya link de invitado.
      Lo obedece /efectos/rsvp-muestra.js.

   2. QUE VENDA. Los botones de contacto y el WhatsApp verde flotante apuntan
      al número de ventas de Invítame, y abajo de todo aparece el llamado
      («¿Quieres la tuya?») con el mensaje ya escrito.
      Lo obedece /efectos/muestra-venta.js.

   POR QUÉ EXISTE ESTE BLOQUE
   Maki: «recordate que todos tienen que estar en el panel para que Jazmín lo
   pueda modificar y pueda verlo y funcionando todo».
   Es la misma regla que ya nos costó una vez con el interruptor de la
   confirmación: una función que sólo se prende escribiendo `fx` en la base a
   mano es una función que, para quien usa el panel, NO EXISTE.

   Y: «las muestras tienen que tener esas cosas, deberían hasta tener su sector
   de muestras en el panel o algo así». Esto es ese sector.

   ⚠️ ESTO NO CAMBIA NADA EN LAS INVITACIONES ENTREGADAS.
      Los dos módulos se plantan si hay link de invitado. En cuanto la
      invitación se abre con el link de un invitado real, manda el invitado: su
      nombre, sus pases y su QR, y no aparece ni el número de Invítame ni el
      llamado. Por eso dejarlo prendido en una muestra no rompe nada... pero
      hay que acordarse de APAGARLO si esta invitación pasa a ser de alguien.

   ⚠️ LA CONFIRMACIÓN DE LA MUESTRA NO GUARDA NADA. El visitante ve el
      formulario y la respuesta, pero no hay a quién anotar. Está dicho en el
      texto de ayuda, para que Jazmín no espere confirmaciones desde la muestra.

   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
      Ver la misma nota en panel-rsvp.js, panel-fondo.js y panel-pieza.js.

   ⚠️ NO GUARDARSE `D.fx` AL CONSTRUIR. El bloque se arma a los ~500 ms, antes
      de que llegue el evento; cuando llega, el panel REEMPLAZA `D.fx` y la
      referencia vieja queda huérfana. Por eso `datos()` se vuelve a llamar
      adentro de cada `onchange`.
   ============================================================================ */
(function () {

  var ID = 'muestra-selector';

  var TEL_VENTA = '+52 1 999 416 0750';   /* el mismo de invitameok.com */
  var CTA       = '¿Quieres la tuya?';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  function datos(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.muestra) d.fx.muestra = {};
    return d.fx.muestra;
  }
  function encendido(v) {
    return v === true || String(v) === '1' || /^(si|sí|true)$/i.test(String(v || ''));
  }

  function titulo(caja, texto, ayuda) {
    var t = document.createElement('div');
    t.textContent = texto;
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(t);
    var a = document.createElement('div');
    a.textContent = ayuda;
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(a);
  }

  function subtitulo(caja, texto) {
    var t = document.createElement('div');
    t.textContent = texto;
    t.style.cssText = 'font-size:12px;font-weight:600;margin:14px 0 6px;' +
                      'padding-top:12px;border-top:1px solid rgba(0,0,0,.07)';
    caja.appendChild(t);
    return t;
  }

  function interruptor(caja, texto, marcado, alCambiar) {
    var lin = document.createElement('label');
    lin.style.cssText = 'display:flex;align-items:flex-start;gap:8px;font-size:12.5px;' +
                        'margin:0 0 10px;cursor:pointer';
    var chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.style.cssText = 'margin-top:2px';
    chk.checked = marcado;
    var sp = document.createElement('span');
    sp.textContent = texto;
    lin.appendChild(chk);
    lin.appendChild(sp);
    caja.appendChild(lin);
    chk.onchange = function () { alCambiar(chk.checked); refrescar(); };
    return chk;
  }

  function campo(caja, etiqueta, valor, alCambiar, ancho, pista) {
    var fila = document.createElement('div');
    fila.style.cssText = 'margin:0 0 8px' + (ancho ? ';flex:1 1 ' + ancho : '');
    var lab = document.createElement('label');
    lab.textContent = etiqueta;
    lab.style.cssText = 'display:block;font-size:12px;font-weight:600;margin:0 0 3px';
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.value = valor;
    if (pista) inp.placeholder = pista;
    inp.style.cssText = 'width:100%';
    inp.oninput = function () { alCambiar(inp.value); refrescar(); };
    fila.appendChild(lab);
    fila.appendChild(inp);
    caja.appendChild(fila);
    return inp;
  }

  function construir(d) {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';

    titulo(caja, 'Sector de muestras',
      'Prendé esto SÓLO en las invitaciones que usamos de muestra: las que ' +
      'están colgadas en la web y las que le mandamos a la gente para vender. ' +
      'En una invitación de un cliente real dejalo todo apagado.');

    var m = datos(d);

    /* ======================= 1. que se vea funcionando ====================== */

    subtitulo(caja, 'Que se vea funcionando');

    var ayuda1 = document.createElement('div');
    ayuda1.textContent = 'Muestra la confirmación de asistencia y el pase con QR ' +
      'con un invitado inventado, para que se entienda cómo funciona. Lo que ' +
      'contesten NO se guarda: no hay a quién anotar.';
    ayuda1.style.cssText = 'font-size:11.5px;opacity:.62;margin:0 0 9px;line-height:1.35';
    caja.appendChild(ayuda1);

    var chkRsvp = interruptor(caja,
      'Mostrar la confirmación y el pase aunque no haya link de invitado',
      encendido(m.rsvp),
      function (v) { datos(d).rsvp = v; pintar(); });

    var sub = document.createElement('div');
    sub.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    campo(sub, 'Nombre de ejemplo', m.nombre || '', function (v) { datos(d).nombre = v; }, '100%', 'Familia Rivera');

    var fila2 = document.createElement('div');
    fila2.style.cssText = 'display:flex;gap:8px;width:100%';
    campo(fila2, 'Personas', m.pases || '',  function (v) { datos(d).pases = v; },  '33%', '2');
    campo(fila2, 'Mesa',     m.mesa || '',   function (v) { datos(d).mesa = v; },   '33%', '7');
    campo(fila2, 'Estado',   m.estado || '', function (v) { datos(d).estado = v; }, '33%', 'Sin usar');
    sub.appendChild(fila2);
    caja.appendChild(sub);

    var pie1 = document.createElement('div');
    pie1.style.cssText = 'font-size:11px;opacity:.6;line-height:1.35';
    caja.appendChild(pie1);

    /* =========================== 2. que venda ============================== */

    subtitulo(caja, 'Que venda');

    var ayuda2 = document.createElement('div');
    ayuda2.textContent = 'Los botones de contacto y el WhatsApp verde de abajo ' +
      'llevan al número de ventas de Invítame con el mensaje ya escrito, y al ' +
      'final de la invitación aparece el llamado. Así, cada muestra que anda ' +
      'dando vueltas trae consultas.';
    ayuda2.style.cssText = 'font-size:11.5px;opacity:.62;margin:0 0 9px;line-height:1.35';
    caja.appendChild(ayuda2);

    var chkVenta = interruptor(caja,
      'Usar los teléfonos de venta de Invítame y mostrar el llamado del final',
      encendido(m.venta),
      function (v) { datos(d).venta = v; pintar(); });

    var sub2 = document.createElement('div');
    campo(sub2, 'Teléfono de ventas', m.tel || '',
      function (v) { datos(d).tel = v; }, '', TEL_VENTA);
    campo(sub2, 'Texto del llamado', m.cta || '',
      function (v) { datos(d).cta = v; }, '', CTA);
    campo(sub2, 'Mensaje que va escrito en el WhatsApp', m.msj || '',
      function (v) { datos(d).msj = v; }, '',
      'Me gustó esta muestra y quiero más info');
    caja.appendChild(sub2);

    var pie2 = document.createElement('div');
    pie2.style.cssText = 'font-size:11px;opacity:.6;line-height:1.35';
    caja.appendChild(pie2);

    /* ================================ pintar ============================== */

    function pintar() {
      sub.style.display = chkRsvp.checked ? 'flex' : 'none';
      pie1.textContent = chkRsvp.checked
        ? 'Si abrís la invitación con el link de un invitado real, esto no se aplica: manda el invitado.'
        : 'Apagado: sin link de invitado, la sección muestra el aviso de siempre.';

      sub2.style.display = chkVenta.checked ? 'block' : 'none';
      pie2.textContent = chkVenta.checked
        ? 'Si los dejás vacíos usa ' + TEL_VENTA + ', «' + CTA + '» y un mensaje ' +
          'armado con los nombres de la fiesta. Con link de invitado no aparece nada de esto.'
        : 'Apagado: la invitación usa los teléfonos de los novios y no muestra el llamado.';
    }
    pintar();

    return caja;
  }

  function revisar() {
    var d = borrador();
    if (!d) return;
    if (document.getElementById(ID)) return;
    var m = document.querySelector('.mejoras');
    if (!m) return;

    /* debajo del bloque de la confirmación, que es de lo que habla */
    var ancla = document.getElementById('rsvp-selector') ||
                document.getElementById('fondo-selector') ||
                document.getElementById('paleta-selector');
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
