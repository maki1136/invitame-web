/* ===== CAMBIAR EL LINK DE UNA INVITACIÓN (13/11/2026) =========================
   Jazmín: «¿te puedo pedir que le cambies el nombre a una invitación? Que se
   llame aniversario-de-rubi». Maki: botón en el panel, que sirva siempre.

   QUÉ HACE el botón «Cambiar link» (al lado de «Duplicar»), con la invitación
   abierta:
     1. copia la invitación (inv_eventos) al nombre nuevo, tal cual;
     2. copia sus datos privados (inv_privado: clave del panel, mail, clave);
     3. copia CADA invitado con SU MISMO token (inv_invitados) → los pases y
        las confirmaciones siguen siendo los mismos;
     4. copia el panel de los novios (inv_paneles: mesas, itinerario…) y la trivia;
     5. recién al final marca la vieja con `mudadaA: <nuevo>`:
          · /i/?e=<viejo>&g=<pase>  → el servidor lleva a /i/?e=<nuevo>&g=<pase>
          · el panel de los novios entra solo al nuevo.
   NUNCA BORRA NADA: lo viejo queda guardado, sólo apunta al nuevo.
   Si el nombre nuevo ya existe: sólo se pisa si es una copia sin entregar
   (sin estado de entregada y sin nº de orden), y preguntando.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invCambiarLink) return; window.__invCambiarLink = 1;
  var FS = 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

  function DD() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function limpio(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''); }

  async function cambiarLink() {
    if (!window.INV || !window.INV.ok || !window.INV.db) { alert('Todavía no se conectó la base. Esperá 2 segundos.'); return; }
    var viejo = String((DD() && DD().slug) || '').trim();
    if (!viejo || !new URLSearchParams(location.search).get('e')) { alert('Primero abrí la invitación que querés cambiar.'); return; }
    var pedido = prompt('Cambiar el link de esta invitación.\n\nHoy es: ' + viejo + '\n\nEscribí el link NUEVO (minúsculas, sin espacios, ej: aniversario-de-rubi).\n\nTodo se pasa al nuevo (invitados con sus mismos pases, panel de los clientes, Live) y el link viejo lleva solo al nuevo.', '');
    if (!pedido) return;
    var nuevo = limpio(pedido);
    if (!nuevo || nuevo === viejo) { alert('Ese link no sirve o es el mismo de ahora.'); return; }
    var m = await import(FS), db = INV.db;
    try {
      var sv = await m.getDoc(m.doc(db, 'inv_eventos', viejo));
      if (!sv.exists()) { alert('No encontré la invitación «' + viejo + '» guardada. Tocá «Guardar y publicar» primero.'); return; }
      var ev = sv.data();
      if (ev.mudadaA) { alert('Esta invitación ya se mudó a «' + ev.mudadaA + '». Abrí esa.'); return; }
      var sn = await m.getDoc(m.doc(db, 'inv_eventos', nuevo));
      if (sn.exists()) {
        var x = sn.data() || {};
        if (x.estado === 'entregada' || x.orden || x.mudadaDe) { alert('Ya hay otra invitación de verdad con el link «' + nuevo + '». Elegí otro nombre.'); return; }
        if (!confirm('Ya existe «' + nuevo + '» (parece una copia sin entregar). ¿La reemplazo por esta invitación?')) return;
      }
      if (!confirm('Voy a pasar «' + viejo + '» a «' + nuevo + '».\n\nEl link viejo y los pases que ya mandaron siguen andando: llevan solos al nuevo. No se borra nada.\n\n¿Sigo?')) return;
      var btn = document.getElementById('btn-cambiar-link'); if (btn) { btn.disabled = true; btn.textContent = 'Cambiando…'; }

      /* 1 · la invitación */
      var nuevoEv = Object.assign({}, ev, { slug: nuevo, mudadaDe: viejo });
      delete nuevoEv.mudadaA;
      await m.setDoc(m.doc(db, 'inv_eventos', nuevo), nuevoEv);
      /* 2 · lo privado */
      var pv = null;
      try { var sp = await m.getDoc(m.doc(db, 'inv_privado', viejo)); if (sp.exists()) pv = sp.data(); } catch (e) {}
      if (pv) await m.setDoc(m.doc(db, 'inv_privado', nuevo), Object.assign({}, pv, { slug: nuevo }));
      /* 3 · los invitados, con sus mismos tokens */
      var qs = await m.getDocs(m.query(m.collection(db, 'inv_invitados'), m.where('slug', '==', viejo)));
      var docs = qs.docs, n = 0;
      for (var i = 0; i < docs.length; i += 20) {
        await Promise.all(docs.slice(i, i + 20).map(function (d) {
          var g = d.data(), tok = g.token || String(d.id).split('__').slice(1).join('__');
          if (!tok) return null;
          n++;
          return m.setDoc(m.doc(db, 'inv_invitados', nuevo + '__' + tok), Object.assign({}, g, { slug: nuevo, token: tok }));
        }));
        if (btn) btn.textContent = 'Cambiando… ' + Math.min(i + 20, docs.length) + '/' + docs.length;
      }
      /* 4 · el panel de los clientes y la trivia */
      var clave = String((pv && pv['c_clave-del-panel-de-los-novios']) || '').trim(), panelOk = false;
      if (clave) {
        try {
          var spn = await m.getDoc(m.doc(db, 'inv_paneles', viejo + '__' + clave));
          if (spn.exists()) {
            await m.setDoc(m.doc(db, 'inv_paneles', nuevo + '__' + clave), Object.assign({}, spn.data(), { slug: nuevo }));
            await m.setDoc(m.doc(db, 'inv_paneles', viejo + '__' + clave), { mudadaA: nuevo }, { merge: true });
            panelOk = true;
          }
        } catch (e) { console.error('cambiar link · panel', e); }
      }
      try {
        var st = await m.getDoc(m.doc(db, 'inv_trivia', viejo));
        if (st.exists()) await m.setDoc(m.doc(db, 'inv_trivia', nuevo), st.data());
      } catch (e) { console.error('cambiar link · trivia', e); }
      /* 5 · recién ahora la vieja apunta a la nueva */
      await m.setDoc(m.doc(db, 'inv_eventos', viejo), { mudadaA: nuevo }, { merge: true });

      alert('¡Listo! La invitación ahora es:\n' + location.origin + '/i/?e=' + nuevo +
        '\n\n· ' + n + ' invitados pasados, con sus mismos pases.' +
        (clave ? (panelOk ? '\n· El panel de los clientes también (misma clave).' : '\n· Ojo: no encontré el panel de los clientes; se arma solo al «Guardar y publicar».') : '') +
        '\n· El link viejo y los pases viejos llevan solos al nuevo.\n\nAhora se abre la invitación nueva en el editor.');
      location.href = 'admin.html?e=' + encodeURIComponent(nuevo);
    } catch (e) {
      console.error('cambiar link', e);
      alert('No se pudo terminar: ' + (e && e.message || e) + '\n\nNo se borró nada. La invitación vieja sigue andando igual. Avisale a Maki.');
      var b2 = document.getElementById('btn-cambiar-link'); if (b2) { b2.disabled = false; b2.textContent = 'Cambiar link'; }
    }
  }
  window.cambiarLink = cambiarLink;

  /* el botón, al lado de «Duplicar» */
  function boton() {
    if (document.getElementById('btn-cambiar-link')) return;
    var dup = [].filter.call(document.querySelectorAll('button'), function (b) { return /duplicarActual\(/.test(b.getAttribute('onclick') || ''); })[0];
    if (!dup || !dup.parentNode) return;
    var b = document.createElement('button');
    b.id = 'btn-cambiar-link'; b.className = dup.className; b.type = 'button';
    b.title = 'Cambiarle el link a esta invitación (el viejo lleva solo al nuevo)';
    b.textContent = 'Cambiar link';
    b.onclick = cambiarLink;
    dup.parentNode.insertBefore(b, dup.nextSibling);
  }
  /* si se abre una invitación vieja que ya se mudó, se avisa */
  function avisoMudada() {
    var d = DD(); if (!d || !d.mudadaA || document.getElementById('aviso-mudada')) return;
    var a = document.createElement('div'); a.id = 'aviso-mudada';
    a.style.cssText = 'position:fixed;left:50%;top:70px;transform:translateX(-50%);z-index:99998;background:#6D1233;color:#fff;padding:12px 18px;border-radius:12px;font:14px Nunito,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25)';
    a.innerHTML = 'Esta invitación se mudó a <b>' + String(d.mudadaA).replace(/[<>&"]/g, '') + '</b>. Los cambios se hacen allá. <a style="color:#fff;text-decoration:underline;margin-left:8px" href="admin.html?e=' + encodeURIComponent(d.mudadaA) + '">Abrir la nueva</a>';
    document.body.appendChild(a);
  }
  setInterval(function () { try { boton(); avisoMudada(); } catch (e) {} }, 1000);
})();
