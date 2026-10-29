/* ===== LO NUEVO, SÓLO EN LAS INVITACIONES NUEVAS (29/10/2026) =================
   Jazmín, 29/10: «que no toque las invitaciones que ya están listas… ya hay
   invitaciones entregadas y me están reclamando que aparecen cosas nuevas».
   Maki: «¿No sabés que ya están las invitaciones con los clientes?».

   LA REGLA: un cambio de la plataforma que se VE en la invitación no puede
   cambiar una invitación ya hecha. Lo nuevo aplica:
     · a las invitaciones creadas desde ahora (nEvento mayor que el CORTE), o
     · a una invitación vieja sólo si Jazmín lo prende a mano en el panel
       (PRINCIPAL → «Novedades de la plataforma»): fx.novedades = true.
   Y se puede apagar en una nueva con fx.novedades = false.

   Quién pregunta: pie-invitame, frase-banda (altura), pase-simple (esconderse
   sin link de invitado), rsvp-recordado (texto con la fecha adelante) y
   colecciones/marfil.js (la frase con la carta oculta).

   ⚠️ CUANDO SE SUMA OTRA NOVEDAD QUE SE VE: se pregunta INVNUEVA() y se sube
      el CORTE al número de la última invitación ya hecha ese día.
   ============================================================================ */
(function () {
  'use strict';
  /* la última invitación hecha antes de la regla (gonzalo-surian = 70,
     todavía en armado: entra en lo nuevo). Las 1–69 quedan como estaban. */
  var CORTE = 70;
  window.INVNOVEDADES_CORTE = CORTE;

  function si(v) { return v === true || v === 'true' || v === 1 || v === '1'; }
  function no(v) { return v === false || v === 'false' || v === 0 || v === '0'; }

  window.INVNUEVA = function (e) {
    e = e || window.INVEV || (typeof D === 'object' && D) || null;
    if (!e) return false;
    var fx = e.fx || {};
    if (si(fx.novedades)) return true;
    if (no(fx.novedades)) return false;
    var n = parseInt(e.nEvento, 10);
    if (!(n > 0)) return true;          /* sin número todavía = recién creada */
    return n >= CORTE;
  };

  /* ================= PANEL ================= */
  var ID = 'novedades-selector';
  function borrador() { try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; } }
  function refrescar() { if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} } }
  function firmaD(d) { return String(d.slug || '') + '|' + String(d.nEvento || '') + '|' + String((d.fx || {}).novedades); }

  function construir(d) {
    var caja = document.createElement('div'); caja.id = ID;
    caja.style.cssText = 'padding:4px 0 10px';
    var lab = document.createElement('label');
    lab.style.cssText = 'display:flex;gap:10px;align-items:flex-start;cursor:pointer;font-size:13px;line-height:1.35';
    var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = window.INVNUEVA(d);
    cb.style.cssText = 'margin-top:2px;width:18px;height:18px;flex:0 0 auto';
    var tx = document.createElement('div');
    var n = parseInt(d.nEvento, 10);
    tx.innerHTML = '<b>Novedades de la plataforma</b><br><span style="opacity:.65;font-size:11.5px">' +
      'El pie nuevo «¿Quieres una invitación como esta?», la frase larga que crece con el texto, el pase escondido en el link general y la fecha adelante en «confirmaste que asistirás». ' +
      (n > 0 && n < CORTE ? 'Esta invitación es de antes (n.º ' + n + '): queda como se entregó, salvo que la prendas acá.' : 'Las invitaciones nuevas lo traen prendido.') +
      '</span>';
    cb.onchange = function () {
      var dd = borrador() || d; dd.fx = dd.fx || {};
      dd.fx.novedades = !!cb.checked;
      refrescar();
    };
    lab.appendChild(cb); lab.appendChild(tx); caja.appendChild(lab);
    caja.__d = firmaD(d);
    return caja;
  }
  function revisarPanel() {
    var d = borrador(); if (!d) return;
    var ya = document.getElementById(ID);
    if (ya && ya.__d === firmaD(d)) return;
    if (ya) ya.remove();
    var casa = window.invCasa ? window.invCasa(ID) : null;
    if (!casa) return;
    casa.appendChild(construir(d));
  }
  function arrancar() {
    if (borrador() && !window.INVEV) { setInterval(revisarPanel, 800); revisarPanel(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
