/* ===== LOS TEXTOS LARGOS SE PLIEGAN ==========================================

   EL PROBLEMA
   Los sectores de hospedaje y de código de vestimenta terminan siendo un
   bloque de ocho o diez renglones seguidos. Toda esa información hace falta
   —los hoteles, la tarifa, el transporte, qué ponerse— pero puesta de corrido
   arruina el diseño: el invitado abre la invitación y ve una pared de texto.

   QUÉ HACE
   Deja los primeros tres renglones a la vista y esconde el resto detrás de un
   "Ver más" chiquito. El que quiere el dato lo abre; el que sólo mira, ve una
   invitación limpia.

   QUÉ NO TOCA — y esto importa
   · La FRASE de los novios: es larga a propósito, es la pieza emocional.
   · La CARTA del sobre: idem.
   · El ITINERARIO: cada momento ya es corto.
   · Nada que mida menos de 220 caracteres: si entra, no se esconde.
   Plegar algo que no hacía falta plegar es peor que no plegar nada.

   ⚠️ Se mide en CARACTERES, no en renglones. Los renglones dependen del ancho
   de la pantalla y del tamaño de letra, así que en un celular chico se habría
   plegado cualquier cosa.

   CÓMO SE APAGA
   Desde el panel, `fx.textos.plegar = false`. O `?plegar=0` en la dirección.
   ============================================================================ */
(function () {
  'use strict';

  var LARGO_MINIMO = 220;      /* menos que esto no se pliega */
  var RENGLONES    = 3;        /* cuántos quedan a la vista */

  var URLP = new URLSearchParams(location.search);

  function encendido() {
    if (URLP.get('plegar') === '0') return false;
    try {
      var t = window.INVEV && window.INVEV.fx && window.INVEV.fx.textos;
      if (t && t.plegar === false) return false;
    } catch (e) {}
    return true;
  }

  var CSS = [
    '.iv-plie{position:relative}',
    '.iv-plie .iv-plie-txt{display:-webkit-box;-webkit-box-orient:vertical;',
    '  -webkit-line-clamp:' + RENGLONES + ';overflow:hidden;',
    '  transition:none}',
    '.iv-plie.abierto .iv-plie-txt{display:block;-webkit-line-clamp:unset;overflow:visible}',
    /* el degradado que avisa que hay más abajo */
    '.iv-plie .iv-plie-txt::after{content:""}',
    '.iv-plie-btn{display:inline-block;margin-top:8px;cursor:pointer;',
    '  background:none;border:0;padding:4px 2px;font:inherit;',
    '  font-size:.82em;letter-spacing:.09em;text-transform:uppercase;',
    '  opacity:.7;color:inherit;border-bottom:1px solid currentColor;',
    '  line-height:1.2}',
    '.iv-plie-btn:hover{opacity:1}'
  ].join('\n');

  function ponerEstilos() {
    if (document.getElementById('iv-plie-css')) return;
    var s = document.createElement('style');
    s.id = 'iv-plie-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* los sectores que NO se tocan nunca */
  function prohibido(el) {
    if (!el) return true;
    if (el.closest('#inv-musica')) return true;
    if (el.closest('.fraseSec')) return true;
    if (el.closest('.carta,.sobre-carta,#carta')) return true;
    if (el.closest('.tl,.itin,.timeline')) return true;
    if (el.closest('#env')) return true;
    if (el.closest('form')) return true;
    return false;
  }

  function plegar(p) {
    if (p.dataset.ivPlie) return;
    var txt = (p.textContent || '').trim();
    if (txt.length < LARGO_MINIMO) return;
    if (prohibido(p)) return;
    if (p.querySelector('a,button,input,img,iframe')) return;   /* tiene cosas adentro */

    p.dataset.ivPlie = '1';

    var caja = document.createElement('div');
    caja.className = 'iv-plie';

    var cuerpo = document.createElement('div');
    cuerpo.className = 'iv-plie-txt';

    p.parentNode.insertBefore(caja, p);
    cuerpo.appendChild(p);
    caja.appendChild(cuerpo);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'iv-plie-btn';
    btn.textContent = 'Ver más';
    btn.setAttribute('aria-expanded', 'false');
    btn.onclick = function () {
      var abierto = caja.classList.toggle('abierto');
      btn.textContent = abierto ? 'Ver menos' : 'Ver más';
      btn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    };
    caja.appendChild(btn);

    /* ⚠️ Si al final entraba entero, se saca el botón. Pasa cuando la pantalla
       es ancha: 300 caracteres pueden entrar en tres renglones y el "Ver más"
       no abriría nada. Un botón que no hace nada es peor que no tenerlo. */
    setTimeout(function () {
      if (cuerpo.scrollHeight <= cuerpo.clientHeight + 4) btn.remove();
    }, 350);
  }

  function pasar() {
    if (!encendido()) return;
    ponerEstilos();
    [].forEach.call(document.querySelectorAll('section p, .sec p'), plegar);
  }

  function arrancar() {
    pasar();
    var n = 0, t = setInterval(function () { pasar(); if (++n > 40) clearInterval(t); }, 350);
    addEventListener('message', function () { setTimeout(pasar, 120); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
