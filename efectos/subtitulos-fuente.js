/* ===== LA LETRA DE LOS SUBTÍTULOS, DESDE EL PANEL (30/10/2026) ================
   Jazmín (diego-y-viviana): «Quiero cambiarle los subtítulos esos en cursiva y
   no se puede».

   Los subtítulos son los `.kick`: el textito en cursiva ARRIBA de cada título
   («Dónde & Cuándo», «El gran día», «Te esperamos»…). El motor los dibuja con
   Rouge Script clavada y ningún campo del panel la cambiaba.

   Ahora: PRINCIPAL → «Tipografía de los subtítulos (cursiva arriba de cada
   título):» → c_tipografia-subtitulos. Si está vacío no se toca nada (las
   invitaciones entregadas quedan igual). La familia la pide fuentes-extra.js
   (lee todo c_tipograf…).
   ============================================================================ */
(function () {
  'use strict';
  if (window.__invSubtitulosFuente) return; window.__invSubtitulosFuente = 1;
  var ID = 'inv-subtitulos-fuente', K = 'c_tipografia-subtitulos', ultima = null;
  function fuente() {
    var e = window.INVEV;
    var f = e && typeof e[K] === 'string' ? e[K].trim() : '';
    return /^[\w\s'",\-]+$/.test(f) ? f : '';
  }
  function aplicar() {
    var f = fuente();
    var st = document.getElementById(ID);
    if (f === ultima && (!f || (st && st === st.parentNode.lastElementChild))) return;
    ultima = f;
    if (!f) { if (st) st.remove(); return; }
    if (!st) { st = document.createElement('style'); st.id = ID; }
    /* las letras script son más grandes de ojo que una serif: al cambiar a una
       que no es cursiva, se baja el tamaño para que no quede gritando */
    var script = /cursive|script|vibes|allura|brush|culpa|tangerine|sacramento|parisienne|pinyon/i.test(f);
    st.textContent = 'html body .kick.kick, html body .sec .kick, html body [id$="-kick"]{font-family:' + f + '!important;font-style:normal!important;' +
      (script ? '' : 'font-size:clamp(15px,4.2vw,20px)!important;letter-spacing:.12em!important;text-transform:uppercase!important;line-height:1.5!important;') + '}';
    (document.head || document.documentElement).appendChild(st);   /* al final: le gana a las colecciones */
  }
  function arrancar() {
    if (typeof D === 'object' && D && !window.INVEV) return;   /* panel: corre en la miniatura */
    aplicar();
    var n = 0, t = setInterval(function () { aplicar(); if (++n > 60) clearInterval(t); }, 700);
    window.addEventListener('message', function () { ultima = null; setTimeout(aplicar, 120); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
