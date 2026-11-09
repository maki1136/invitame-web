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

  /* ★ 26/10/2026 (Jazmín, Pack PLUS): una frase debajo de la cantidad
     («¡Te esperamos!»). Del link: &msg=… (también &m=…, como la plataforma
     vieja); si no, fx.pase.frase. */
  function frase() {
    var u = String(QS.get('msg') || QS.get('m') || '').trim();
    if (u) return u.slice(0, 120);
    return String(cfg().frase || '').trim().slice(0, 120);
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
      'section.pase.pase-simple .pasecard > :not(.ps-caja):not(.ps-med){display:none!important}',
      'section.pase.pase-simple .ps-caja{display:block}',
      'section.pase.pase-simple .ps-kick{font-size:11px;letter-spacing:.32em;text-transform:uppercase;opacity:.7;margin-bottom:8px}',
      'section.pase.pase-simple .ps-num{font-size:40px;line-height:1.1}',
      'section.pase.pase-simple .ps-linea{width:56px;height:1px;margin:14px auto 0;background:currentColor;opacity:.45}',
      'section.pase.pase-simple .ps-frase{margin-top:14px;font-size:17px;line-height:1.35}',
      /* ★ 9/11/2026 — Maki (renata-y-patricio-platinum): «Datos del invitado, pase
         para dos personas, te esperamos: ponele un poco más de diseño, está
         horrible esa parte». Sólo en las invitaciones nuevas (ps-nueva):
         tarjeta con filete doble, la cantidad grande, un separador con rombo
         y la frase en cursiva. Los colores salen del título (currentColor). */
      'section.pase.pase-simple.ps-nueva .pasecard{border-radius:18px!important;padding:34px 24px 30px!important;',
      '  box-shadow:0 14px 34px rgba(0,0,0,.10),inset 0 0 0 1px rgba(255,255,255,.55)!important;position:relative!important}',
      'section.pase.pase-simple.ps-nueva .pasecard::after{content:"";position:absolute;inset:8px;border-radius:12px;',
      '  border:1px solid currentColor;opacity:.22;pointer-events:none}',
      'section.pase.pase-simple.ps-nueva .ps-kick{font-size:10.5px;letter-spacing:.42em;opacity:.75;margin-bottom:10px}',
      'section.pase.pase-simple.ps-nueva .ps-num{font-size:46px;line-height:1.05}',
      'section.pase.pase-simple.ps-nueva .ps-linea{width:auto;height:auto;background:none;opacity:1;margin:16px auto 0;',
      '  display:flex;align-items:center;justify-content:center;gap:10px}',
      'section.pase.pase-simple.ps-nueva .ps-linea::before,section.pase.pase-simple.ps-nueva .ps-linea::after{content:"";',
      '  display:block;width:46px;height:1px;background:currentColor;opacity:.45}',
      'section.pase.pase-simple.ps-nueva .ps-linea i{display:block;width:7px;height:7px;border:1px solid currentColor;',
      '  transform:rotate(45deg);opacity:.7}',
      'section.pase.pase-simple.ps-nueva .ps-frase{font-style:italic;font-size:19px;margin-top:14px;letter-spacing:.01em}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  }

  function aplicar() {
    if (!activo()) return;
    var sec = document.querySelector('section.pase');
    if (!sec) return;
    css();
    /* ⚠️ 29/10/2026 (Jazmín, gonzalo-surian: «¿por qué aparece ese sector si
       no lo habilité?»). Sin link de invitado (&g=… o &per=…) el pase se veía
       igual con «2 personas» inventado, también en invitaciones de clientes.
       Ahora, sin link de invitado se muestra SÓLO en las muestras que lo piden
       (panel → Sector de muestras → «Mostrar la confirmación y el pase…»). */
    var m = (((window.INVEV || {}).fx) || {}).muestra || {};
    var vidriera = m.rsvp === true || String(m.rsvp) === '1' || /^(si|sí|true)$/i.test(String(m.rsvp || ''));
    /* en la miniatura del panel se ve igual, para poder diseñarlo */
    /* ⛔ y sólo en las invitaciones nuevas: las ya entregadas siguen como estaban */
    var esNueva = window.INVNUEVA ? window.INVNUEVA() : false;
    if (esNueva && !QS.get('g') && !QS.get('per') && !vidriera && QS.get('preview') !== '1') { sec.style.display = 'none'; return; }
    /* el motor esconde el pase sin link de invitado: acá se muestra igual,
       porque no tiene nada personal */
    sec.style.display = '';
    sec.classList.add('pase-simple');
    /* el diseño nuevo: en las invitaciones nuevas, o cuando eligieron un medallón (opt-in) */
    sec.classList.toggle('ps-nueva', !!esNueva || document.documentElement.hasAttribute('data-medallon'));

    var t = sec.querySelector('.t');
    var titulo = String(cfg().titulo || '').trim() || '¡Esperamos contar contigo!';
    if (t && t.textContent !== titulo) t.textContent = titulo;

    var card = sec.querySelector('.pasecard');
    if (!card) return;
    var caja = card.querySelector('.ps-caja');
    if (!caja) {
      caja = document.createElement('div');
      caja.className = 'ps-caja';
      caja.innerHTML = '<div class="ps-kick">Pase para</div><div class="ps-num"></div><div class="ps-linea"><i></i></div>';
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
    var fr = caja.querySelector('.ps-frase'), ft = frase();
    if (ft && !fr) { fr = document.createElement('div'); fr.className = 'ps-frase'; caja.appendChild(fr); }
    if (fr) { if (fr.textContent !== ft) fr.textContent = ft; fr.style.display = ft ? '' : 'none'; }
    if (card.classList.contains('reveal')) card.classList.add('in');
  }

  var n = 0;
  var tk = setInterval(function () { aplicar(); if (++n > 40) clearInterval(tk); }, 300);
  addEventListener('message', function () { setTimeout(aplicar, 120); });
  /* el motor y otros módulos redibujan: se repasa de vez en cuando */
  setInterval(aplicar, 1500);
})();
