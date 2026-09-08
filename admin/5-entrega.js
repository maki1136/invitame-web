/* ===== ADMIN DE INVÍTAME · parte 5 · LA ENTREGA ====================================

   ⭐ POR QUÉ EXISTE ESTE ARCHIVO
   Desde el 8/9/2026 la invitación se crea sola cuando el cliente manda el
   formulario. Nace «por-revisar»: existe, está armada, pero el link no muestra
   nada hasta que el equipo la aprueba.

   El problema era que Jazmín NO TENÍA CON QUÉ ENTREGARLA. En el panel no estaba
   ni el estado, ni el link de revisión, ni el botón de entregar, ni la clave del
   panel de los novios. El modo control de calidad existía en el servidor y no
   existía en la pantalla: sólo se podía entregar por código.

   Acá está esa caja. Es el trabajo diario de Jazmín:
       mirar cómo quedó  →  corregir  →  entregar  →  copiar y mandar.

   ⭐ Y ACÁ ESTÁ TAMBIÉN EL AJUSTE DE LAS MARCAS.
   Maki: «por ahora quiero que Jazmín haga el control de calidad, pero el otro
   sistema seguro lo use con otra marca». Cada marca tiene su propio interruptor
   y valen las dos al mismo tiempo. Lo guarda `/marcas.php`, que entra con el
   usuario del sistema: `inv_marcas` es una colección nueva y no hizo falta tocar
   ninguna regla de Firestore.

   ⚠️ ES UN ARCHIVO APARTE, Y ES A PROPÓSITO. Los otros cuatro módulos del panel
      ya funcionan; algo nuevo no tiene por qué poder romperlos. Se carga último.

   ⚠️ AL ENTREGAR SE ACTUALIZA TAMBIÉN `D.estado` EN MEMORIA. Sin eso, el
      siguiente «Guardar y publicar» volvería a escribir «por-revisar» y la
      invitación se escondería sola después de entregada.
   ============================================================================ */
(function () {

  var BASE = 'https://invitame.littlemomentsok.com';

  /* ⚠️⚠️ `D` ES UN `let` DE 1-campos.js: NO EXISTE COLGADO DE `window`.
     La primera versión de esta caja lo pedía por ahí, recibía undefined siempre,
     leía el estado vacío y dibujaba «Entregada» aunque la invitación estuviera
     por revisar. No dio ningún error: mintió en silencio.
     Se lee por el nombre pelado, con red por si el archivo todavía no cargó. */
  function dat() { try { return (typeof D !== 'undefined') ? D : null; } catch (e) { return null; } }

  function slugAbierto() {
    var p = new URLSearchParams(location.search);
    return (p.get('e') || '').trim();
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function estadoDe() {
    /* Vacío es «entregada»: las invitaciones de antes de este cambio no tienen
       el campo y se ven, como siempre. */
    var e = String((dat() && dat().estado) || '').trim();
    return e === 'por-revisar' ? 'por-revisar' : 'entregada';
  }

  // ---------------------------------------------------------------- la caja
  function pintar() {
    var slug = slugAbierto();
    var caja = document.getElementById('cajaentrega');
    if (!slug) { if (caja) caja.remove(); return; }

    var ed = document.querySelector('.editor');
    if (!ed) return;
    if (!caja) {
      caja = document.createElement('div');
      caja.id = 'cajaentrega';
      caja.style.cssText = 'margin:0 0 10px;border-radius:12px;padding:12px 14px;font-family:Manrope,system-ui,sans-serif';
      ed.insertBefore(caja, ed.firstChild);
    }

    var est   = estadoDe();
    var rev   = String((dat() && dat().revision) || '').trim();
    var clave = String((dat() && dat()['c_clave-del-panel-de-los-novios']) || '').trim();
    var linkInv = BASE + '/i/?e=' + encodeURIComponent(slug);
    var linkRev = linkInv + (rev ? '&rev=' + encodeURIComponent(rev) : '');
    var linkPan = BASE + '/mi-panel.html?e=' + encodeURIComponent(slug);

    /* Se vuelve a dibujar sólo si cambió algo. Si no, se le borrarían los
       «¡Copiado!» a Jazmín cada medio segundo. */
    var firma = [slug, est, rev, clave].join('|');
    if (caja.dataset.firma === firma) return;
    caja.dataset.firma = firma;

    var h = '';

    if (est === 'por-revisar') {
      caja.style.background = '#FFF6E8';
      caja.style.border = '1px solid #F0D5A8';
      h += '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
         + '<b style="color:#8a5a00;font-family:Epilogue,system-ui;font-weight:800">Por revisar</b>'
         + '<span style="font-size:12.5px;color:#7a6a55">El cliente todavía no la ve. Miralá, corregí lo que haga falta y entregala.</span>'
         + '</div>'
         + '<div style="margin-top:9px;display:flex;gap:8px;flex-wrap:wrap">'
         + '<a class="btn-c" href="' + esc(linkRev) + '" target="_blank" style="text-decoration:none">Ver cómo quedó</a>'
         + '<button class="btn-g" onclick="entregarInvitacion()">Entregar al cliente</button>'
         + '</div>';
    } else {
      caja.style.background = '#F1F8F1';
      caja.style.border = '1px solid #CBE3CB';
      h += '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
         + '<b style="color:#2f6b39;font-family:Epilogue,system-ui;font-weight:800">Entregada</b>'
         + '<span style="font-size:12.5px;color:#5c6b5c">El link ya funciona. Lo que cambien los novios entra solo.</span>'
         + '</div>'
         + campo('Link de la invitación', linkInv)
         + campo('Panel de los novios', linkPan)
         + (clave ? campo('Clave del panel', clave) : '')
         + '<div style="margin-top:9px;display:flex;gap:8px;flex-wrap:wrap">'
         + '<button class="btn-g" onclick="copiarMensajeEntrega(this)">Copiar el mensaje para el cliente</button>'
         + '<button class="btn-c" onclick="volverAOcultar()" title="Vuelve a esconderla mientras la corregís">Volver a ocultar</button>'
         + '</div>';
    }

    caja.innerHTML = h;
  }

  function campo(rot, val) {
    return '<div style="margin-top:8px">'
      + '<div style="font-size:11px;color:#8a8078;font-weight:700;margin-bottom:3px">' + esc(rot) + '</div>'
      + '<div style="display:flex;gap:6px">'
      + '<input readonly value="' + esc(val) + '" onclick="this.select()" style="flex:1;min-width:0;font-size:12px;padding:6px 8px;border:1px solid #ddd;border-radius:7px;background:#fff">'
      + '<button class="btn-c" style="padding:5px 10px;font-size:12px" onclick="copiarEsto(this,\'' + esc(val).replace(/'/g, "\\'") + '\')">Copiar</button>'
      + '</div></div>';
  }

  window.copiarEsto = function (btn, txt) {
    navigator.clipboard.writeText(txt);
    var antes = btn.textContent;
    btn.textContent = '¡Copiado!';
    setTimeout(function () { btn.textContent = antes; }, 1400);
  };

  window.copiarMensajeEntrega = function (btn) {
    var slug = slugAbierto();
    var clave = String((dat() && dat()['c_clave-del-panel-de-los-novios']) || '').trim();
    var nom = String((dat() && dat().n1) || '').trim() + ((dat() && dat().n2) ? ' y ' + dat().n2 : '');
    var t = '¡' + (nom || 'Hola') + ', ya está lista su invitación!\n\n'
      + 'Este es el link para compartir con sus invitados:\n'
      + BASE + '/i/?e=' + encodeURIComponent(slug) + '\n\n'
      + 'Y este es su panel, donde pueden cargar invitados, acomodar las mesas y el itinerario. '
      + 'Todo lo que cambien ahí se actualiza solo en la invitación:\n'
      + BASE + '/mi-panel.html?e=' + encodeURIComponent(slug) + '\n'
      + (clave ? 'Clave: ' + clave + '\n' : '')
      + '\nCualquier cosa nos escriben.';
    window.copiarEsto(btn, t);
  };

  // ------------------------------------------------------------ el estado
  async function ponerEstado(nuevo) {
    var slug = slugAbierto();
    if (!slug || !window.INV || !INV.db) { alert('Todavía no cargó la base. Esperá 2 segundos.'); return; }
    var m = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    await m.updateDoc(m.doc(INV.db, 'inv_eventos', slug), { estado: nuevo });
    /* ⚠️ También en memoria: si no, el próximo «Guardar y publicar» lo pisa. */
    if (dat()) dat().estado = nuevo;
    var c = document.getElementById('cajaentrega');
    if (c) c.dataset.firma = '';
    pintar();
  }

  window.entregarInvitacion = async function () {
    if (!confirm('¿Entregar la invitación? A partir de ahora el link funciona para cualquiera.')) return;
    try { await ponerEstado('entregada'); }
    catch (e) { alert('No se pudo entregar: ' + (e.message || e)); }
  };

  window.volverAOcultar = async function () {
    if (!confirm('¿Volver a ocultarla? El link deja de mostrar la invitación hasta que la entregues de nuevo.')) return;
    try { await ponerEstado('por-revisar'); }
    catch (e) { alert('No se pudo ocultar: ' + (e.message || e)); }
  };

  // ------------------------------------------------------------ las marcas
  async function pedirMarcas(cuerpo) {
    var u = window.INV && INV.auth && INV.auth.currentUser;
    if (!u) throw new Error('Entrá con el usuario del equipo');
    cuerpo.idToken = await u.getIdToken();
    var r = await fetch('/marcas.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo)
    });
    var j = await r.json().catch(function () { return {}; });
    if (!j.ok) throw new Error(j.error || ('http' + r.status));
    return j;
  }

  window.verMarcas = async function () {
    var box = document.getElementById('marcasbox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'marcasbox';
      box.style.cssText = 'position:fixed;inset:0;background:rgba(73,17,26,.55);display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding:26px 18px;overflow:auto';
      document.body.appendChild(box);
    }
    box.innerHTML = '<div class="mkmodal" style="background:#fff;max-width:600px;width:100%;border-radius:14px;padding:22px;font-family:Manrope,system-ui"><div style="color:#9a8f88">Cargando…</div></div>';
    try {
      var j = await pedirMarcas({ accion: 'listar' });
      pintarMarcas(box, j.marcas || []);
    } catch (e) {
      box.querySelector('.mkmodal').innerHTML = '<p style="color:#F56770">No se pudo: ' + esc(e.message || e) + '</p>'
        + '<button class="btn-c" onclick="document.getElementById(\'marcasbox\').remove()">Cerrar</button>';
    }
  };

  function pintarMarcas(box, marcas) {
    var filas = marcas.map(function (m) {
      return '<div style="display:flex;align-items:center;gap:10px;border:1px solid #efe7de;border-radius:10px;padding:11px 12px;margin-bottom:8px">'
        + '<div style="flex:1;min-width:0">'
        + '<b style="font-family:Epilogue,system-ui;font-weight:800;color:#49111A">' + esc(m.nombre) + '</b>'
        + '<div style="font-size:11px;color:#b0a89f">' + esc(m.id) + '  ·  /crear.html?marca=' + esc(m.id) + '</div>'
        + '</div>'
        + '<label style="display:flex;align-items:center;gap:7px;font-size:12.5px;color:#6b6259;cursor:pointer;white-space:nowrap">'
        + '<input type="checkbox" ' + (m.entregaAutomatica ? 'checked' : '')
        + ' onchange="guardarMarca(this,\'' + esc(m.id) + '\',\'' + esc(m.nombre).replace(/'/g, "\\'") + '\')">'
        + 'Se entrega sola</label>'
        + '</div>';
    }).join('');

    box.querySelector('.mkmodal').innerHTML =
      '<h3 style="margin:0 0 4px;color:#6D1233;font-family:Epilogue,system-ui;font-weight:800">Marcas y modo de entrega</h3>'
      + '<p style="color:#6b6259;font-size:13px;margin:0 0 6px;line-height:1.5">'
      + 'Con el interruptor <b>apagado</b>, la invitación nace escondida y Jazmín la revisa antes de entregarla.<br>'
      + 'Con el interruptor <b>prendido</b>, el cliente termina el formulario y ya se lleva su link y su panel.</p>'
      + '<p style="color:#b0a89f;font-size:12px;margin:0 0 14px">Cada marca decide por su cuenta: pueden convivir las dos formas al mismo tiempo.</p>'
      + filas
      + '<div style="border-top:1px solid #efe7de;margin-top:14px;padding-top:12px">'
      + '<div style="font-size:12px;color:#8a8078;font-weight:700;margin-bottom:6px">Agregar una marca</div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
      + '<input id="mkid" placeholder="direccion-corta" style="flex:1;min-width:130px;padding:8px 10px;border:1px solid #e7ddd3;border-radius:9px;font-family:Manrope;font-size:13px">'
      + '<input id="mknom" placeholder="Nombre visible" style="flex:1;min-width:130px;padding:8px 10px;border:1px solid #e7ddd3;border-radius:9px;font-family:Manrope;font-size:13px">'
      + '<button class="btn-c" onclick="agregarMarca()">Agregar</button>'
      + '</div>'
      + '<div style="font-size:11px;color:#b0a89f;margin-top:5px">Nace en control de calidad. Después la prendés si querés.</div>'
      + '</div>'
      + '<div style="margin-top:16px;text-align:right"><button class="btn-c" onclick="document.getElementById(\'marcasbox\').remove()">Cerrar</button></div>';
  }

  window.guardarMarca = async function (chk, id, nombre) {
    chk.disabled = true;
    try {
      await pedirMarcas({ accion: 'guardar', id: id, nombre: nombre, entregaAutomatica: chk.checked });
    } catch (e) {
      chk.checked = !chk.checked;
      alert('No se pudo guardar: ' + (e.message || e));
    }
    chk.disabled = false;
  };

  window.agregarMarca = async function () {
    var id = (document.getElementById('mkid').value || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
    var nom = (document.getElementById('mknom').value || '').trim();
    if (id.length < 2) { alert('Poné una dirección corta, sólo letras, números y guiones.'); return; }
    try {
      await pedirMarcas({ accion: 'guardar', id: id, nombre: nom || id, entregaAutomatica: false });
      await window.verMarcas();
    } catch (e) { alert('No se pudo agregar: ' + (e.message || e)); }
  };

  // ------------------------------------------------------------ el arranque
  /* El evento se carga solo y tarda: se mira cada medio segundo y se dibuja
     únicamente cuando cambió algo (ver la firma de arriba). */
  setInterval(pintar, 500);
  pintar();

})();
