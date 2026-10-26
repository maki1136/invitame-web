/* ===== EL ESTILO DE LA CONFIRMACIÓN, EN EL PANEL ==============================

   El selector para elegir cómo se ve el "¿venís o no?": el interruptor nuevo o
   los dos botones de siempre. Lo obedece /efectos/rsvp-interruptor.js.

   POR QUÉ EXISTE  ← y es el motivo de fondo, no un detalle
   El interruptor estaba hecho y andando, pero la ÚNICA manera de prenderlo o
   apagarlo era escribir `fx.rsvp.estilo` en la base a mano, desde la consola.
   O sea: servía para quien programa, no para quien usa el panel. Una función
   que no se puede tocar desde el panel es una función que no existe.

   ⚠️ EL INTERRUPTOR VIENE ENCENDIDO POR DEFECTO.
      Decisión de Maki. Por eso acá el valor vacío significa "interruptor", y
      para volver a los dos botones hay que elegirlo expresamente. Cambiar el
      default sin cambiar este texto deja el panel mintiendo.

   ⚠️ ESTO TOCA LA CONFIRMACIÓN, QUE ES POR DONDE ENTRA LA PLATA.
      El selector sólo cambia cómo SE VE. Las dos opciones terminan llamando al
      mismo botón original del motor, con las mismas validaciones. Ninguna de
      las dos habla con la base por su cuenta.

   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
      Ver la misma nota en panel-fondo.js y panel-pieza.js.
   ============================================================================ */
(function () {

  var ID = 'rsvp-selector';

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  function datos(d) {
    if (!d.fx) d.fx = {};
    if (!d.fx.rsvp) d.fx.rsvp = {};
    return d.fx.rsvp;
  }

  function construir(d) {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';

    var t = document.createElement('div');
    t.textContent = 'Cómo se confirma la asistencia';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(t);

    var a = document.createElement('div');
    a.textContent = 'Sólo cambia cómo se ve. Las dos opciones confirman igual. Se ve con el link de cada invitado; ' +
      'sin link (la miniatura y la invitación abierta sin link) aparece el cartel de muestra. Para verlo en una muestra, ' +
      'prendé «Mostrar la confirmación y el pase…» en el Sector de muestras, acá abajo.';
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(a);

    var sel = document.createElement('select');
    sel.style.cssText = 'width:100%';
    [['interruptor', 'Un interruptor (por defecto)'],
     ['botones',     'Los dos botones de siempre']].forEach(function (o) {
      var op = document.createElement('option');
      op.value = o[0]; op.textContent = o[1];
      sel.appendChild(op);
    });
    /* vacío = interruptor: es el default */
    sel.value = (datos(d).estilo === 'botones') ? 'botones' : 'interruptor';
    sel.onchange = function () {
      datos(d).estilo = sel.value;
      refrescar();
      ayuda.textContent = texto(sel.value);
    };

    var fila = document.createElement('div');
    fila.style.cssText = 'margin:0 0 8px';
    var lab = document.createElement('label');
    lab.textContent = 'El estilo';
    lab.style.cssText = 'display:block;font-size:12px;font-weight:600;margin:0 0 3px';
    fila.appendChild(lab);
    fila.appendChild(sel);
    caja.appendChild(fila);

    function texto(v) {
      return (v === 'botones')
        ? 'Dos botones: "Sí, asistiré" y "No podré".'
        : 'Una pastilla chiquita que se corre de un lado al otro. Arranca al medio, sin respuesta dada.';
    }
    var ayuda = document.createElement('div');
    ayuda.textContent = texto(sel.value);
    ayuda.style.cssText = 'font-size:11px;opacity:.6;line-height:1.35';
    caja.appendChild(ayuda);

    /* ★ 15/10/2026 — pedido de Jazmín: la FECHA LÍMITE para confirmar y la
       pregunta de RESTRICCIONES ALIMENTARIAS. Las dibuja en la invitación
       /efectos/rsvp-extras.js; el formulario del cliente las manda ya puestas.
       ⚠️ Se escribe en el borrador VIVO (borrador()), no en el `d` de cuando
       se armó la caja: si Jazmín cambia de invitación sin recargar, la caja
       sigue en pantalla y no puede escribir en la anterior. */
    var filaF = document.createElement('div');
    filaF.style.cssText = 'margin:12px 0 8px';
    var labF = document.createElement('label');
    labF.textContent = 'Fecha límite para confirmar';
    labF.style.cssText = 'display:block;font-size:12px;font-weight:600;margin:0 0 3px';
    var fecha = document.createElement('input');
    fecha.type = 'date';
    fecha.id = 'rsvp-limite-panel';
    fecha.value = String(datos(d).limite || '');
    fecha.style.cssText = 'width:100%';
    fecha.onchange = function () {
      var b = borrador() || d;
      if (fecha.value) datos(b).limite = fecha.value; else delete datos(b).limite;
      refrescar();
    };
    var ayF = document.createElement('div');
    ayF.textContent = 'Aparece abajo de la frase: «Confirma antes del …». Vacía, no aparece. No cierra la confirmación.';
    ayF.style.cssText = 'font-size:11px;opacity:.6;line-height:1.35;margin-top:3px';
    filaF.appendChild(labF); filaF.appendChild(fecha); filaF.appendChild(ayF);
    caja.appendChild(filaF);

    var filaR = document.createElement('label');
    filaR.style.cssText = 'display:flex;gap:8px;align-items:flex-start;font-size:12px;font-weight:600;margin:6px 0 0;cursor:pointer';
    var chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.id = 'rsvp-restric-panel';
    chk.checked = !!datos(d).restricciones;
    chk.style.cssText = 'margin-top:2px';
    chk.onchange = function () {
      var b = borrador() || d;
      datos(b).restricciones = chk.checked;
      refrescar();
    };
    var txR = document.createElement('span');
    txR.innerHTML = 'Preguntar restricciones alimentarias<br><span style="font-weight:400;opacity:.62;font-size:11px">' +
      'Suma al formulario «¿Alguna restricción alimentaria?». Lo que contestan lo ven los novios en su panel.</span>';
    filaR.appendChild(chk); filaR.appendChild(txR);
    caja.appendChild(filaR);

    /* ★ 20/10/2026 — pedido de Jazmín: el PASE SIMPLE, como el link de la
       plataforma vieja. Sin nombre, sin QR y sin mesa: sólo «¡Esperamos contar
       contigo!» y la cantidad de personas. Lo dibuja /efectos/pase-simple.js. */
    var filaS = document.createElement('label');
    filaS.style.cssText = 'display:flex;gap:8px;align-items:flex-start;font-size:12px;font-weight:600;margin:10px 0 0;cursor:pointer';
    var chkS = document.createElement('input');
    chkS.type = 'checkbox';
    chkS.id = 'pase-simple-panel';
    chkS.checked = !!(d.fx && d.fx.pase && d.fx.pase.modo === 'simple');
    chkS.style.cssText = 'margin-top:2px';
    chkS.onchange = function () {
      var b = borrador() || d;
      if (!b.fx) b.fx = {};
      if (!b.fx.pase || typeof b.fx.pase !== 'object') b.fx.pase = {};
      if (chkS.checked) b.fx.pase.modo = 'simple'; else delete b.fx.pase.modo;
      refrescar();
    };
    var txS = document.createElement('span');
    txS.innerHTML = 'Pase simple (sin nombre, QR ni mesa)<br><span style="font-weight:400;opacity:.62;font-size:11px">' +
      'El pase dice sólo «¡Esperamos contar contigo!» y la cantidad de personas. Las personas van en el link: ' +
      '<b>…/i/?e=SLUG&amp;per=2</b> → «2 personas». Con link de invitado usa sus pases.</span>';
    filaS.appendChild(chkS); filaS.appendChild(txS);
    caja.appendChild(filaS);

    /* ★ 26/10/2026 (Jazmín, Pack PLUS): título, frase y el link de cada invitado
       con su cantidad, sin tener que escribir la dirección a mano. */
    var ps = function () { var b = borrador() || d; if (!b.fx) b.fx = {}; if (!b.fx.pase || typeof b.fx.pase !== 'object') b.fx.pase = {}; return b.fx.pase; };
    var cajaS = document.createElement('div');
    cajaS.id = 'pase-simple-extra';
    cajaS.style.cssText = 'margin:8px 0 0 22px;padding:10px 12px;border:1px dashed rgba(0,0,0,.15);border-radius:10px;font-size:12px';
    var mk = function (tag, css, txt) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; };
    var inTit = mk('input', 'width:100%;margin:2px 0 8px'); inTit.type = 'text'; inTit.placeholder = 'Título (por defecto: ¡Esperamos contar contigo!) — ej: Datos del invitado:';
    inTit.value = (d.fx && d.fx.pase && d.fx.pase.titulo) || '';
    inTit.oninput = function () { ps().titulo = inTit.value; refrescar(); };
    var inFr = mk('input', 'width:100%;margin:2px 0 10px'); inFr.type = 'text'; inFr.placeholder = 'Frase debajo de la cantidad — ej: ¡Te esperamos!';
    inFr.value = (d.fx && d.fx.pase && d.fx.pase.frase) || '';
    inFr.oninput = function () { ps().frase = inFr.value; refrescar(); };
    cajaS.appendChild(mk('div', 'font-weight:700;margin-bottom:2px', 'Título del pase')); cajaS.appendChild(inTit);
    cajaS.appendChild(mk('div', 'font-weight:700;margin-bottom:2px', 'Frase (para todos)')); cajaS.appendChild(inFr);
    cajaS.appendChild(mk('div', 'font-weight:700;margin:2px 0 4px', 'Armar el link de cada invitado'));
    var filaL = mk('div', 'display:flex;gap:6px;align-items:center;flex-wrap:wrap');
    var inN = mk('input', 'width:70px'); inN.type = 'number'; inN.min = 1; inN.max = 50; inN.value = 2; inN.title = 'Cantidad de personas';
    var inM = mk('input', 'flex:1;min-width:140px'); inM.type = 'text'; inM.placeholder = 'Frase sólo para este link (opcional)';
    var bt = mk('button', 'padding:6px 12px;border-radius:8px;border:0;background:#6D1233;color:#fff;cursor:pointer;font-weight:700', 'Copiar link'); bt.type = 'button';
    var out = mk('div', 'margin-top:6px;word-break:break-all;opacity:.75;font-size:11px', '');
    var armar = function () {
      var b = borrador() || d, n = parseInt(inN.value, 10) || 1;
      var u = location.origin + '/i/?e=' + encodeURIComponent(b.slug || '') + '&per=' + n;
      if (inM.value.trim()) u += '&msg=' + encodeURIComponent(inM.value.trim());
      out.textContent = u; return u;
    };
    inN.oninput = armar; inM.oninput = armar;
    bt.onclick = function () {
      var u = armar();
      var ok = function () { bt.textContent = '¡Copiado!'; setTimeout(function () { bt.textContent = 'Copiar link'; }, 1500); };
      try { navigator.clipboard.writeText(u).then(ok, function () { window.prompt('Copiá el link:', u); }); } catch (e) { window.prompt('Copiá el link:', u); }
    };
    filaL.appendChild(mk('span', '', 'Personas:')); filaL.appendChild(inN); filaL.appendChild(inM); filaL.appendChild(bt);
    cajaS.appendChild(filaL); cajaS.appendChild(out);
    var verS = function () { cajaS.style.display = chkS.checked ? '' : 'none'; };
    var prevOn = chkS.onchange; chkS.onchange = function () { prevOn(); verS(); };
    verS(); armar();
    caja.appendChild(cajaS);

    /* ★ 20/10/2026 — pedido de Jazmín: el Pack Estándar manda UN SOLO LINK para
       todos. Con esto, sin link de invitado se puede confirmar igual (nombre,
       sí/no, personas, mensaje). Lo hacen /efectos/rsvp-general.js y
       /rsvp-general.php. El mail al cliente sale del aviso por mail de abajo. */
    var filaG = document.createElement('label');
    filaG.style.cssText = 'display:flex;gap:8px;align-items:flex-start;font-size:12px;font-weight:600;margin:10px 0 0;cursor:pointer';
    var chkG = document.createElement('input');
    chkG.type = 'checkbox';
    chkG.id = 'rsvp-general-panel';
    chkG.checked = !!datos(d).general;
    chkG.style.cssText = 'margin-top:2px';
    chkG.onchange = function () {
      var b = borrador() || d;
      datos(b).general = !!chkG.checked;   /* false, no delete: guardar hace merge y un borrado no viaja */
      refrescar();
    };
    var txG = document.createElement('span');
    txG.innerHTML = 'Un solo link para todos (Pack Estándar)<br><span style="font-weight:400;opacity:.62;font-size:11px">' +
      'Con el link general cada invitado escribe su nombre y confirma. Las respuestas aparecen en INVITADOS. ' +
      'Si además prendés «Habilitar aviso por mail», al cliente le llega un correo con la lista actualizada en cada respuesta.</span>';
    filaG.appendChild(chkG); filaG.appendChild(txG);
    caja.appendChild(filaG);

    return caja;
  }

  function revisar() {
    var d = borrador();
    if (!d) return;
    if (document.getElementById(ID)) {
      /* ya está: se sincroniza con la invitación abierta (puede haber cambiado) */
      var r = (d.fx && d.fx.rsvp) || {};
      var f = document.getElementById('rsvp-limite-panel');
      if (f && document.activeElement !== f && f.value !== String(r.limite || '')) f.value = String(r.limite || '');
      var c = document.getElementById('rsvp-restric-panel');
      if (c && c.checked !== !!r.restricciones) c.checked = !!r.restricciones;
      var ps = document.getElementById('pase-simple-panel');
      var on = !!(d.fx && d.fx.pase && d.fx.pase.modo === 'simple');
      if (ps && ps.checked !== on) ps.checked = on;
      var ex = document.getElementById('pase-simple-extra'); if (ex) ex.style.display = on ? '' : 'none';
      return;
    }
    /* la casa de este bloque la decide el panel (invCasa en admin/3-evento.js):
       antes se colgaba del primer «.mejoras» y salía en cinco pestañas */
    var m = window.invCasa ? window.invCasa(ID) : document.querySelector('.mejoras');
    if (!m) return;

    /* debajo del bloque del fondo, que es la decisión anterior */
    var ancla = document.getElementById('fondo-selector') ||
                document.getElementById('boton-selector') ||
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
