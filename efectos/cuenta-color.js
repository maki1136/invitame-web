/* ===== COLOR DE LA CUENTA REGRESIVA, DESDE EL PANEL (26/10/2026) ================
   Jazmín, Evelyn: «cambiar a color dorado los números/unidades del contador
   regresivo (Días, Horas, Minutos, Segundos)». No había control: lo decidía la
   colección. Ahora: PRINCIPAL → «Color cuenta regresiva:» (c_color-cuenta-regresiva).
   Vacío = el de la colección. Pinta números, rótulos y separadores.
   Corre en la miniatura del panel.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invCuentaColor) return; window.__invCuentaColor = 1;
  var ID = 'inv-cuenta-color';
  function aplicar() {
    var ev = window.INVEV; if (!ev) return;
    var c = String(ev['c_color-cuenta-regresiva'] || '').trim();
    var st = document.getElementById(ID);
    if (!/^#[0-9a-f]{3,8}$/i.test(c)) { if (st) st.textContent = ''; return; }
    if (!st) { st = document.createElement('style'); st.id = ID; document.head.appendChild(st); }
    var S = 'html body .portada .count.count.count';
    var txt = S + ' :is(.num,.lab,.sep){color:' + c + '!important;-webkit-text-fill-color:' + c + '!important;background:none!important}';
    if (st.textContent !== txt) st.textContent = txt;
  }
  var n = 0, t = setInterval(function () { aplicar(); if (++n > 40) clearInterval(t); }, 400);
  window.addEventListener('message', function () { setTimeout(aplicar, 80); setTimeout(aplicar, 600); });
})();
