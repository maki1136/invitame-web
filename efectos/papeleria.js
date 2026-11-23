/* ===== DISEÑO «JUEGO DE PAPELERÍA»: CADA SECCIÓN ES UNA TARJETA ==============

   Pedido de Maki, 23/11/2026, con la referencia «Sofía y Diego» de Jazmín:
   «¿tienen que ser todas iguales las estructuras de las invitaciones? ¿no
   podés armar otro modelo como el que te pasé?».

   En la referencia la invitación es un juego de papelería apoyado sobre el
   mármol: una tarjeta en arco, otra con las esquinas cortadas, una blonda de
   encaje, otra festoneada, un óvalo… cada una un poco girada y con su lacre.

   Esto hace eso con CUALQUIER colección: cada sección (menos la portada, la
   frase con foto y el cierre) se apoya sobre una tarjeta de papel con una
   forma distinta, que se van turnando. El contenido de la sección queda
   derecho y encima; solo el papel se gira un poco.

   ⚠️ APAGADO POR DEFECTO. Solo actúa con `fx.papeleria.on`. Ninguna
      invitación entregada cambia.

   LOS CAMPOS (panel: PRINCIPAL → «Diseño de tarjetas de papelería»,
   /efectos/panel-papeleria.js)
     · fx.papeleria.on     → prendido
     · fx.papeleria.color  → color del papel (vacío = marfil #FAF8F3)
     · fx.papeleria.sello  → lacre arriba de algunas tarjetas: «si» usa el
                             medallón del itinerario (fx.estiloSec.itinerario.medallon)

   CÓMO ESTÁ HECHO
     <section data-pap="arco">
       <div class="pap-hoja">          ← la sombra (filter: drop-shadow)
         <div class="pap-forma"></div> ← el papel con la forma (radius o máscara)
       </div>
       …el contenido de siempre…
     </section>
   La sombra va en el padre y la forma en el hijo porque una máscara recorta
   la sombra del mismo elemento: así la sombra sigue la forma.
   ============================================================================ */
(function () {
  'use strict';
  var FORMAS = ['arco', 'esquinas', 'blonda', 'feston', 'ovalo'];
  var GIRO   = [-1.1, 0.8, -0.5, 1.0, -0.8];

  function on(v) { return v === true || /^(true|si|sí|1|on)$/i.test(String(v)); }
  function cfg() {
    var ev = window.INVEV;
    return (ev && ev.fx && ev.fx.papeleria) || null;
  }
  function sello() {
    var ev = window.INVEV, p = cfg();
    if (!p || !on(p.sello)) return '';
    var es = ev && ev.fx && ev.fx.estiloSec && ev.fx.estiloSec.itinerario;
    return (es && es.medallon) || '';
  }

  function css() {
    if (document.getElementById('pap-css')) return;
    var s = document.createElement('style');
    s.id = 'pap-css';
    s.textContent = [
      'html.inv-papeleria .frame>section[data-pap]:not(#pap_):not(#pap__){position:relative!important;isolation:isolate!important;background-color:transparent!important;margin:30px 12px!important;padding:46px 20px 42px!important;background:transparent!important;background-image:none!important;border-radius:0!important;box-shadow:none!important;overflow:visible!important}',
      'html.inv-papeleria .frame>section[data-pap]::before,html.inv-papeleria .frame>section[data-pap]::after{opacity:0!important}',
      'html.inv-papeleria .frame>section>.pap-hoja:not(#pap_):not(#pap__){position:absolute!important;inset:0!important;width:auto!important;height:auto!important;margin:0!important;padding:0!important;z-index:-1!important;pointer-events:none;transform:rotate(var(--pap-giro,0deg));filter:drop-shadow(0 10px 14px rgba(45,38,30,.16)) drop-shadow(0 1px 2px rgba(45,38,30,.14))}',
      '.pap-forma{position:absolute!important;inset:0;background:var(--pap-papel,#FAF8F3);background-image:radial-gradient(120% 90% at 30% 20%,rgba(255,255,255,.55),rgba(255,255,255,0) 60%),radial-gradient(90% 70% at 80% 90%,rgba(120,105,85,.06),rgba(0,0,0,0) 70%);box-shadow:inset 0 0 0 9px var(--pap-papel,#FAF8F3),inset 0 0 0 10px rgba(130,115,95,.32)}',
      /* arco */
      'html.inv-papeleria .frame>section[data-pap=arco]:not(#pap_):not(#pap__){padding-top:84px!important}',
      'section[data-pap=arco] .pap-forma{border-radius:50% 50% 10px 10px/150px 150px 10px 10px}',
      /* esquinas cortadas hacia adentro */
      'section[data-pap=esquinas] .pap-forma{--r:24px;-webkit-mask:radial-gradient(var(--r) at 0 0,#0000 98%,#000) 0 0/51% 51% no-repeat,radial-gradient(var(--r) at 100% 0,#0000 98%,#000) 100% 0/51% 51% no-repeat,radial-gradient(var(--r) at 0 100%,#0000 98%,#000) 0 100%/51% 51% no-repeat,radial-gradient(var(--r) at 100% 100%,#0000 98%,#000) 100% 100%/51% 51% no-repeat;mask:radial-gradient(var(--r) at 0 0,#0000 98%,#000) 0 0/51% 51% no-repeat,radial-gradient(var(--r) at 100% 0,#0000 98%,#000) 100% 0/51% 51% no-repeat,radial-gradient(var(--r) at 0 100%,#0000 98%,#000) 0 100%/51% 51% no-repeat,radial-gradient(var(--r) at 100% 100%,#0000 98%,#000) 100% 100%/51% 51% no-repeat}',
      /* blonda: óvalo con borde de encaje (puntos) */
      'html.inv-papeleria .frame>section[data-pap=blonda]:not(#pap_):not(#pap__){padding:78px 30px 70px!important}',
      'section[data-pap=blonda] .pap-forma{inset:8px;border-radius:50%/120px;outline:10px dotted rgba(255,255,255,.96);outline-offset:3px;box-shadow:0 0 0 13px rgba(255,255,255,.55),inset 0 0 0 7px var(--pap-papel,#FAF8F3),inset 0 0 0 8px rgba(130,115,95,.30)}',
      /* festón arriba y abajo */
      'section[data-pap=feston] .pap-forma{--r:9px;-webkit-mask:radial-gradient(var(--r) at 50% var(--r),#000 97%,#0000 101%) 50% 0/calc(2*var(--r)) calc(2*var(--r)) repeat-x,linear-gradient(#000 0 0) 0 var(--r)/100% calc(100% - 2*var(--r)) no-repeat,radial-gradient(var(--r) at 50% calc(100% - var(--r)),#000 97%,#0000 101%) 50% 100%/calc(2*var(--r)) calc(2*var(--r)) repeat-x;mask:radial-gradient(var(--r) at 50% var(--r),#000 97%,#0000 101%) 50% 0/calc(2*var(--r)) calc(2*var(--r)) repeat-x,linear-gradient(#000 0 0) 0 var(--r)/100% calc(100% - 2*var(--r)) no-repeat,radial-gradient(var(--r) at 50% calc(100% - var(--r)),#000 97%,#0000 101%) 50% 100%/calc(2*var(--r)) calc(2*var(--r)) repeat-x}',
      /* óvalo alargado */
      'html.inv-papeleria .frame>section[data-pap=ovalo]:not(#pap_):not(#pap__){padding:70px 26px 64px!important}',
      'section[data-pap=ovalo] .pap-forma{border-radius:50%/110px}',
      /* el lacre */
      'html.inv-papeleria .frame>section>.pap-sello:not(#pap_):not(#pap__){position:absolute!important;left:50%!important;right:auto!important;top:-22px;width:54px!important;height:54px!important;margin:0 0 0 -27px!important;padding:0!important;border-radius:50%;background:center/cover no-repeat;z-index:3;pointer-events:none;filter:drop-shadow(0 3px 4px rgba(40,30,15,.35))}',
      'html.inv-papeleria .frame>section[data-pap=arco]>.pap-sello:not(#pap_):not(#pap__){top:10px}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  }

  var n = 0;
  function aplicar() {
    var p = cfg();
    var html = document.documentElement;
    if (!p || !on(p.on)) {
      if (html.classList.contains('inv-papeleria')) {
        html.classList.remove('inv-papeleria');
        [].forEach.call(document.querySelectorAll('.pap-hoja,.pap-sello'), function (e) { e.remove(); });
        [].forEach.call(document.querySelectorAll('[data-pap]'), function (e) { e.removeAttribute('data-pap'); });
        n = 0;
      }
      return;
    }
    css();
    html.classList.add('inv-papeleria');
    if (p.color) html.style.setProperty('--pap-papel', p.color);
    var lacre = sello();
    var secs = [].slice.call(document.querySelectorAll('.frame>section.sec,.frame>section.pase'));
    secs.forEach(function (s) {
      if (s.classList.contains('fraseSec') || s.classList.contains('portada')) return;
      if (s.offsetHeight < 60 || getComputedStyle(s).display === 'none') return;
      if (!s.dataset.pap) {
        var i = n++ % FORMAS.length, forma0 = FORMAS[i];
        /* el óvalo y la blonda recortan las esquinas: en una sección baja
           (el pase, el hashtag) tapan el contenido → van con esquinas */
        if ((forma0 === 'blonda' || forma0 === 'ovalo') && s.offsetHeight < 520) forma0 = 'esquinas';
        s.dataset.pap = forma0;
        s.style.setProperty('--pap-giro', GIRO[i] + 'deg');
        var h = document.createElement('div'); h.className = 'pap-hoja';
        var f = document.createElement('div'); f.className = 'pap-forma';
        h.appendChild(f);
        s.insertBefore(h, s.firstChild);
      }
      /* algunas secciones traen su fondo en el style (estilo de la sección): la
         tarjeta ya es el fondo, así que el de la sección queda transparente */
      if (s.style.getPropertyValue('background-color') !== 'transparent') {
        s.style.setProperty('background-color', 'transparent', 'important');
        s.style.setProperty('background-image', 'none', 'important');
      }
      var forma = s.dataset.pap, tiene = s.querySelector(':scope>.pap-sello');
      var quiere = lacre && (forma === 'arco' || forma === 'esquinas');
      if (quiere && !tiene) {
        var im = document.createElement('div'); im.className = 'pap-sello'; im.style.backgroundImage = 'url("' + lacre + '")';
        s.insertBefore(im, s.firstChild.nextSibling);
      } else if (!quiere && tiene) tiene.remove();
    });
  }

  /* las secciones aparecen tarde (Live, filtro, playlist): un repaso cada 1,2 s */
  function arrancar() { aplicar(); setInterval(aplicar, 1200); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
