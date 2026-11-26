/* ===== PORTADA · LETRA LIMPIA SOBRE LA FOTO O EL VIDEO (10/11/2026) ===========
   Línea Roja · White Swan (copia de «Opaline» de @on_the_list._): la portada es
   un VIDEO de una puerta de terciopelo y la letra va limpia encima, como en la
   referencia. Marfil le pone detrás de los nombres un velo de papel claro
   (radial-gradient crema con blur, pensado para la portada SIN foto): sobre el
   terciopelo se veía como una mancha blanca.

   EL DATO — fx.estiloSec.portada:
     sinVelo       : true → saca el velo claro de detrás de los nombres
     fuenteNombres : letra de los nombres (opcional)
     tamNombres    : tamaño de los nombres en px (opcional)
     colorNombres  : color de nombres, fecha y cuenta regresiva (opcional)
     sinOscurecer  : true → saca el oscurecido que se le pone a la foto de portada
                     (para fotos claras: la tarjeta de encaje de «Encaje y nácar»)
     sombra        : true → sombra suave detrás de la letra (portadas de gris medio:
                     Pasarela tiene el panel plateado justo detrás de los nombres)
     cuentaVisible : true → la cuenta regresiva se lee siempre: números más gruesos y
                     grandes, rótulos más grandes, y un recuadro claro translúcido detrás
                     de cada número (Encaje y nácar, Maki 19/11: «sigue sin verse en la
                     portada cuántos días, minutos y segundos faltan»)
     colorCuenta   : color de los números y rótulos de la cuenta (vacío = el de los nombres)
     sinSombra     : true → saca la sombra oscura que Marfil le pone a los nombres y a
                     la cuenta regresiva (pensada para letra clara sobre foto) y deja
                     un brillo claro apenas. Para letra OSCURA sobre portada clara:
                     con la sombra oscura la letra se veía borrosa (Encaje y nácar,
                     Maki 19/11: «nos casamos, nuestra boda, todo medio difuso»)
   Panel: PRINCIPAL → «Portada · letra limpia sobre la foto o el video».
   ⚠️ Sin ningún campo cargado NO HACE NADA: ninguna invitación entregada cambia.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invPortadaLimpia) return; window.__invPortadaLimpia = 1;

  var ID = 'inv-portada-limpia';
  function cfg() {
    try { return (((window.INVEV || {}).fx || {}).estiloSec || {}).portada || {}; } catch (e) { return {}; }
  }
  function si(v) { return v === true || v === 'true' || v === 1; }
  function hex(v) { v = String(v || '').trim(); return /^#[0-9a-f]{3,8}$/i.test(v) ? v : ''; }
  function fuente(v) { v = String(v || '').trim().replace(/["<>;{}]/g, ''); return v; }

  function pedirLetra(f) {
    if (!f || document.querySelector('link[data-portada-limpia-fuente="' + f + '"]')) return;
    try {
      var lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.setAttribute('data-portada-limpia-fuente', f);
      lk.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(f).replace(/%20/g, '+') + '&display=swap';
      (document.head || document.documentElement).appendChild(lk);
    } catch (e) {}
  }
  /* la fecha cambia de lugar dentro de la portada; sin posición vuelve a donde estaba */
  function moverFecha(pos) {
    var pf = document.getElementById('pv-fecha'); if (!pf || !pf.parentNode) return;
    var c = pf.parentNode, kick = document.getElementById('pv-kick'), cnt = c.querySelector(':scope > .count');
    var nom = document.getElementById('pv-names');
    if (pos !== 'arriba' && pos !== 'abajo' && !pf.__movida) return;   /* nunca se toca una fecha que no movimos nosotros */
    pf.__movida = (pos === 'arriba' || pos === 'abajo');
    if (pos === 'arriba') { var a = kick && kick.parentNode === c ? kick : c.firstElementChild; if (a && pf.nextElementSibling !== a && a !== pf) c.insertBefore(pf, a); }
    else if (pos === 'abajo') { if (cnt && pf.previousElementSibling !== cnt) c.insertBefore(pf, cnt.nextSibling); }
    else if (nom && nom.parentNode === c && pf.previousElementSibling !== nom) c.insertBefore(pf, nom.nextSibling);
  }
  var DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  /* «2027-01-23T17:00» → «Sábado 23 de enero de 2027 · 17:00 hs» (sin hora si no la tiene) */
  function fechaCompleta(iso) {
    var m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/); if (!m) return '';
    var d = new Date(+m[1], +m[2] - 1, +m[3]); if (isNaN(d)) return '';
    var s = DIAS[d.getDay()] + ' ' + (+m[3]) + ' de ' + MESES[+m[2] - 1] + ' de ' + m[1];
    if (m[4] && !(m[4] === '00' && m[5] === '00')) s += ' · ' + m[4] + ':' + m[5] + ' hs';
    return s;
  }

  var ultimo = null;
  function aplicar() {
    /* el atributo va repetido: Marfil escribe sus reglas con DOS atributos + id y !important.
       19/11: CUATRO veces. Marfil pone `#pv-names > span:not(.col-mf-y)`: el :not suma una clase
       y empataba con tres atributos; con el empate ganaba el que cargara último y la letra elegida
       salía a veces y a veces no (Encaje y nácar: Pinyon Script ↔ Cormorant según la carga). */
    var c = cfg(), r = [], H = 'html[data-portada-limpia][data-portada-limpia][data-portada-limpia][data-portada-limpia] ';
    if (si(c.sinVelo)) {
      r.push(H + '.portada .c::before, ' + H + '.portada > .c::before { display:none !important; background:none !important }');
    }
    if (si(c.sinOscurecer)) {
      r.push(H + '.portada .pveil, ' + H + '.portada #pbg::after, ' + H + '.portada .pbg::after { background:none !important; display:none !important }');
    }
    var f = fuente(c.fuenteNombres);
    /* 12/11: la letra elegida se baja de Google Fonts si la invitación no la tiene ya
       (Encaje y nácar: Pinyon Script salía en la letra de reemplazo) */
    if (f && !document.querySelector('link[data-portada-limpia-fuente="' + f + '"]')) {
      try {
        var lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.setAttribute('data-portada-limpia-fuente', f);
        lk.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(f).replace(/%20/g, '+') + '&display=swap';
        (document.head || document.documentElement).appendChild(lk);
      } catch (e) {}
    }
    if (f) r.push(H + '#pv-names, ' + H + '#pv-names > span { font-family:"' + f + '", "Cormorant Garamond", Georgia, serif !important;' +
      /* con letra elegida, los nombres van como se escriben: una cursiva en mayúsculas espaciadas no se lee */
      ' text-transform:none !important; letter-spacing:.01em !important }');
    var t = Number(c.tamNombres);
    if (t >= 16 && t <= 96) r.push(H + '#pv-names, ' + H + '#pv-names > span { font-size:' + t + 'px !important }');
    var col = hex(c.colorNombres);
    if (col) r.push(H + '#pv-names, ' + H + '#pv-names > span, ' + H + '#pv-fecha, ' + H + '#pv-kick, ' +
      H + '.portada .count .num, ' + H + '.portada .count .lab { color:' + col + ' !important }');
    if (si(c.sombra)) r.push(H + '#pv-names, ' + H + '#pv-names > span, ' + H + '#pv-fecha, ' + H + '#pv-kick, ' +
      H + '.portada .count .num, ' + H + '.portada .count .lab, ' + H + '.portada .count .sep' +
      ' { text-shadow:0 1px 3px rgba(0,0,0,.55), 0 2px 18px rgba(0,0,0,.5) !important }');
    if (si(c.sinSombra)) r.push(H + '#pv-names, ' + H + '#pv-names > span, ' + H + '#pv-fecha, ' + H + '#pv-kick, ' +
      H + '.portada .count .num, ' + H + '.portada .count .lab, ' + H + '.portada .count .sep' +
      /* ★ 26/11 (Jazmín, Valentina Gpe: «por más que le saque el sombreado se sigue viendo así»): «sin sombra»
         dejaba un halo blanco que sobre fondos claros empasta la letra. Ahora es SIN sombra de verdad.
         Las entregadas que no se vuelven a guardar quedan como estaban (INVCAMBIO). */
      (window.INVCAMBIO && window.INVCAMBIO(null, '2026-11-26T18:30:00Z') ? ' { text-shadow:none !important }'
        : ' { text-shadow:0 0 1px rgba(255,255,255,.55), 0 0 12px rgba(255,255,255,.35) !important }'));
    if (si(c.cuentaVisible)) {
      var cc = hex(c.colorCuenta) || col || '';
      r.push(H + '.portada .count { gap:8px !important; opacity:1 }');
      r.push(H + '.portada .count .b { background:rgba(255,255,255,.55) !important; border-radius:12px !important;' +
        ' padding:8px 6px 6px !important; min-width:62px !important; box-shadow:0 2px 10px rgba(0,0,0,.06) !important;' +
        ' -webkit-backdrop-filter:blur(3px); backdrop-filter:blur(3px) }');
      r.push(H + '.portada .count .num { font-weight:600 !important; font-size:32px !important; text-shadow:none !important;' + (cc ? ' color:' + cc + ' !important;' : '') + ' }');
      r.push(H + '.portada .count .lab { font-size:10.5px !important; opacity:1 !important; font-weight:600 !important;' +
        ' letter-spacing:.08em !important; text-shadow:none !important;' + (cc ? ' color:' + cc + ' !important;' : '') + ' }');
      r.push(H + '.portada .count .sep { display:none !important }');
    }
    /* ★ 23/11 (CUHE): la foto ya trae su texto → sin sobretítulo y/o sin nombres */
    if (si(c.sinKick)) r.push(H + '#pv-kick { display:none !important }');
    /* ★ 24/11 (Jazmín, César & Helene: «los nombres están en minúsculas pero aparecen en mayúsculas»): la colección los pasa a mayúsculas */
    if (si(c.nombresComoEstan)) r.push(H + '#pv-names, ' + H + '#pv-names *, ' + H + '.portada h1 { text-transform:none !important; font-variant:normal !important }');
    /* ★ 25/11 (Jazmín, Diego y Sofía: «no quiere cuenta regresiva y no sé cómo sacarla») */
    if (si(c.sinCuenta)) r.push(H + '.portada .count, ' + H + '.portada .countdown, ' + H + '.portada [class*="cuenta-reg"] { display:none !important }');
    if (si(c.sinNombres)) r.push(H + '#pv-names, ' + H + '.portada .names, ' + H + '.portada .amp { display:none !important }');
    /* ★ 20/11 (Diana XV): la fecha completa en la portada, con día y hora. El motor
       la trae escondida (CONFIG.mostrarFecha=false) y en formato corto («Sábado 23 · Enero 2027») */
    var pf = document.getElementById('pv-fecha');
    if (si(c.fechaVer) && pf) {
      var ft = String(c.fechaTexto || '').trim() || fechaCompleta((window.INVEV || {}).fecha);
      if (ft && pf.textContent !== ft) pf.textContent = ft;
      if (pf.style.display === 'none') pf.style.display = '';
      r.push(H + '#pv-fecha { display:block !important; visibility:visible !important; opacity:1 !important;' +
        ' text-transform:none !important; letter-spacing:.05em !important; line-height:1.35 !important; margin-top:6px !important }');
      /* ★ 21/11 (Jazmín): letra, tamaño, color y lugar de la fecha */
      var ff = fuente(c.fechaFuente);
      if (ff) { pedirLetra(ff); r.push(H + '#pv-fecha { font-family:"' + ff + '", "Cormorant Garamond", Georgia, serif !important }'); }
      var fs = Number(c.fechaTam);
      if (fs >= 8 && fs <= 60) r.push(H + '#pv-fecha { font-size:' + fs + 'px !important }');
      if (/^#[0-9a-f]{6}$/i.test(c.fechaColor || '')) r.push(H + '#pv-fecha { color:' + c.fechaColor + ' !important }');
      if (c.fechaPos === 'arriba') r.push(H + '#pv-fecha { margin:0 0 10px !important }');
      if (c.fechaPos === 'abajo') r.push(H + '#pv-fecha { margin:14px 0 0 !important }');
    }
    moverFecha(si(c.fechaVer) ? c.fechaPos : '');
    /* ★ 20/11 (cesar-helene 01-03): achicar o agrandar la cuenta regresiva entera */
    var tc = Number(c.tamCuenta);
    if (tc > 1.5) tc = tc / 100;   /* el rango con «%» del panel guarda la fracción (0.62); por las dudas se acepta 62 */
    if (tc >= 0.3 && tc <= 1.5 && tc !== 1) r.push(H + '.portada .count { zoom:' + tc + ' !important }');
        var raiz = document.documentElement, st = document.getElementById(ID);
    var txt = r.join('\n');
    if (!txt) {
      if (ultimo !== '') { if (st) st.textContent = ''; raiz.removeAttribute('data-portada-limpia'); ultimo = ''; }
      return;
    }
    if (!st) { st = document.createElement('style'); st.id = ID; (document.head || raiz).appendChild(st); }
    if (ultimo !== txt) { st.textContent = txt; ultimo = txt; }
    raiz.setAttribute('data-portada-limpia', '1');
  }

  var n = 0, iv = setInterval(function () { aplicar(); if (++n > 40) clearInterval(iv); }, 300);
  var n2 = 0, iv2 = setInterval(function () { aplicar(); if (++n2 > 30) clearInterval(iv2); }, 2000);   /* 20/11: el motor reescribe #pv-fecha cuando llegan los datos */
  addEventListener('message', function () { setTimeout(aplicar, 150); });
  setInterval(aplicar, 1500);
})();
