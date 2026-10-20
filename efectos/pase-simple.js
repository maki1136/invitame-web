/* ===== EL PASE SIMPLE: SÓLO «¡ESPERAMOS CONTAR CONTIGO!» Y LAS PERSONAS ========

   EL PEDIDO (Jazmín, 20/10/2026, por una clienta que estaba comprando)
   Como el link de la plataforma vieja
     invitameok.com/elegante-clasica?n=&p=1%20persona&m=¡Te%20esperamos!
   el pase del invitado NO lleva nombre, ni QR, ni mesa. Sólo:
     · el título «¡Esperamos contar contigo!»
     · la cantidad de personas: «2 personas».
   Maki: «sacamos QR y mesa».

   CÓMO SE PRENDE
     fx.pase.modo = 'simple'      (panel → «Cómo se confirma la asistencia»)
     fx.pase.titulo               opcional, por defecto «¡Esperamos contar contigo!»
     fx.pase.personas             lo que se ve sin link de invitado (muestra), p. ej. «2 personas»

   DE DÓNDE SALEN LAS PERSONAS (en este orden)
     1. el link:  /i/?e=<slug>&per=2      → «2 personas» (también acepta texto: per=2%20personas)
        ⚠️ NO se usa `p=` como en la plataforma vieja: `p=1` ya lo usa
           pase-validar.js para la puerta (el QR lleva &p=1).
     2. el invitado cargado en el panel (link con &g=…): sus pases.
     3. fx.pase.personas (la muestra).

   ⚠️ No toca la base ni la confirmación: sólo cómo se ve la sección del pase.
   ============================================================================ */
(function () {
  'use strict';

  function cfg() {
    try { var p = ((window.INVEV || {}).fx || {}).pase; return (p && typeof p === 'object') ? p : {}; }
    catch (e) { return {}; }
  }
  function activo() { return String(cfg().modo || '').toLowerCase() === 'simple'; }

  var QS = new URLSearchParams(location.search);

  function texto(v) {
    v = String(v == null ? '' : v).trim();
    if (!v) return '';
    if (/^\d+$/.test(v)) { var n = parseInt(v, 10); return n === 1 ? '1 persona' : n + ' personas'; }
    return v;
  }

  function personas() {
    var u = texto(QS.get('per'));
    if (u) return u;
    if (QS.get('g')) {
      var e = document.getElementById('pv-per');
      var t = texto(e && e.textContent);
      if (t) return t;
    }
    return texto(cfg().personas) || '2 personas';
  }

  function css() {
    if (document.getElementById('pase-simple-css')) return;
    var s = document.createElement('style');
    s.id = 'pase-simple-css';
    s.textContent = [
      'section.pase.pase-simple .pasecard{display:block!important;text-align:center!important;padding:26px 18px!important}',
      'section.pase.pase-simple .pasecard > :not(.ps-caja){display:none!important}',
      'section.pase.pase-simple .ps-caja{display:block}',
      'section.pase.pase-simple .ps-kick{font-size:11px;letter-spacing:.32em;text-transform:uppercase;opacity:.7;margin-bottom:8px}',
      'section.pase.pase-simple .ps-num{font-size:40px;line-height:1.1}',
      'section.pase.pase-simple .ps-linea{width:56px;height:1px;margin:14px auto 0;background:currentColor;opacity:.45}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  }

  function aplicar() {
    if (!activo()) return;
    var sec = document.querySelector('section.pase');
    if (!sec) return;
    css();
    /* el motor esconde el pase sin link de invitado: acá se muestra igual,
       porque no tiene nada personal */
    sec.style.display = '';
    sec.classList.add('pase-simple');

    var t = sec.querySelector('.t');
    var titulo = String(cfg().titulo || '').trim() || '¡Esperamos contar contigo!';
    if (t && t.textContent !== titulo) t.textContent = titulo;

    var card = sec.querySelector('.pasecard');
    if (!card) return;
    var caja = card.querySelector('.ps-caja');
    if (!caja) {
      caja = document.createElement('div');
      caja.className = 'ps-caja';
      caja.innerHTML = '<div class="ps-kick">Pase para</div><div class="ps-num"></div><div class="ps-linea"></div>';
      card.appendChild(caja);
    }
    /* la letra de los números: la del título de la colección */
    var num = caja.querySelector('.ps-num');
    var h = t || document.querySelector('.frame h2');
    if (h && !num.style.fontFamily) { try { num.style.fontFamily = getComputedStyle(h).fontFamily; } catch (e) {} }
    /* ⚠️ el color se copia del título de la sección: la tarjeta del pase de
       cada colección trae su propio color de letra pensado para el QR, y en
       las colecciones claras (Celebra) salía papel sobre papel (20/10/2026). */
    if (t) { try { var col = getComputedStyle(t).color; if (caja.style.color !== col) caja.style.color = col; } catch (e) {} }
    var p = personas();
    if (num.textContent !== p) num.textContent = p;
    if (card.classList.contains('reveal')) card.classList.add('in');
  }

  var n = 0;
  var tk = setInterval(function () { aplicar(); if (++n > 40) clearInterval(tk); }, 300);
  addEventListener('message', function () { setTimeout(aplicar, 120); });
  /* el motor y otros módulos redibujan: se repasa de vez en cuando */
  setInterval(aplicar, 1500);
})();
