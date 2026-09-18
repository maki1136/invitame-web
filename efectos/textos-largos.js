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
   · La MÚSICA y los formularios.
   Plegar algo que no hacía falta plegar es peor que no plegar nada.

   ⚠️⚠️ Y LA CARTA SE ESTABA PLEGANDO IGUAL  (17/9/2026)

     Maki, sobre Renata y Patricio: «la frase con el ver más queda cortada,
     mirá bien el print: o estirás un poco más para que se vea completa, o
     sacás el ver más directamente».

     La lista de prohibidos decía `.carta, .sobre-carta, #carta` — y ninguno
     de los tres existe. En la invitación real la carta vive en
     `#carta-sec > #cartafx > .cf-letter`. Los selectores estaban escritos de
     memoria, no leídos del HTML, así que la exclusión no agarraba nada y la
     pieza más emocional de la invitación quedaba cortada a la mitad con un
     "Ver más" encima.

     LA LECCIÓN: un selector de exclusión que no matchea nada NO FALLA, calla.
     Se ve igual que si no existiera. Cuando se agrega uno hay que ir a la
     invitación viva y confirmar que el bloque que se quería proteger
     efectivamente quedó afuera.

   ⚠️ EL UMBRAL: 165 CARACTERES. Arrancó en 220 y estaba mal: el texto del
   código de vestimenta mide 204 y se quedaba afuera justo, que era una de las
   dos cosas que había que plegar. 165 agarra los dos (hoteles y vestimenta) y
   sigue dejando tranquilos los textos cortos de las otras secciones.

   ⚠️ Se mide en CARACTERES, no en renglones. Los renglones dependen del ancho
   de la pantalla y del cuerpo de letra, así que en un celular chico se habría
   plegado cualquier cosa.

   Y si al final entraba entero igual, el botón se saca solo: un "Ver más" que
   no abre nada es peor que no tenerlo.

   CÓMO SE APAGA
   Desde el panel, `fx.textos.plegar = false`. O `?plegar=0` en la dirección.
   ============================================================================ */
(function () {
  'use strict';

  var LARGO_MINIMO = 165;      /* menos que esto no se pliega — ver la nota */
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
    /* ⚠️ EL CORTE CAE ENTRE RENGLONES, NUNCA POR LA MITAD DE UNA LÍNEA.
       (17/9/2026) Maki: «en nuestra carta se corta al medio unas palabras
       arriba del Ver más». `-webkit-line-clamp` solo no alcanza: si el texto
       hereda un `line-height` con decimales, la caja queda con una altura que
       no es múltiplo exacto del renglón y la última línea asoma cortada al
       medio. Con el `line-height` fijado acá y el `max-height` en `em`, la
       altura es exactamente N renglones y el corte queda limpio. */
    '.iv-plie .iv-plie-txt{display:-webkit-box;-webkit-box-orient:vertical;',
    /* ⚠️ Y TODAVÍA CORTABA: los rasgos que BAJAN (p, g, j) salen del renglón.
       Con la caja midiendo exactamente N renglones, `overflow:hidden` les comía
       la patita y la última línea seguía pareciendo cortada al medio.
       → Un respiro abajo: el relleno le da lugar a los descendentes y
         `-webkit-line-clamp` sigue siendo el que manda cuántas líneas se ven,
         así que no se asoma un renglón de más. (17/9/2026) */
    '  line-height:1.6;max-height:calc(1.6em * ' + RENGLONES + ' + .3em);',
    '  padding-bottom:.3em;',
    '  -webkit-line-clamp:' + RENGLONES + ';overflow:hidden}',
    '.iv-plie.abierto .iv-plie-txt{display:block;-webkit-line-clamp:unset;',
    '  max-height:none;overflow:visible}',
    '.iv-plie-btn{display:inline-block;margin-top:10px;cursor:pointer;',
    '  background:none;border:0;padding:4px 2px;font:inherit;',
    '  font-size:.8em;letter-spacing:.1em;text-transform:uppercase;',
    '  opacity:.65;color:inherit;border-bottom:1px solid currentColor;',
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

  /* ---- LOS SECTORES QUE NO SE TOCAN NUNCA -------------------------------
     ⚠️ ESTOS SELECTORES ESTÁN LEÍDOS DEL HTML VIVO, no escritos de memoria.
        Si se agrega uno nuevo, hay que abrir la invitación y confirmar que el
        bloque quedó afuera: un selector que no matchea no avisa.

        · la carta del sobre  →  #carta-sec > #cartafx > .cf-letter
        · la frase            →  .fraseSec
        · el itinerario       →  .tl
     ---------------------------------------------------------------------- */
  var PROHIBIDOS = [
    '#inv-musica',
    '.fraseSec', '.frase-sec', '#frase', '#frase-sec',
    '#carta-sec', '#cartafx', '.cartafx', '.cf-letter',
    '.carta', '.sobre-carta', '#carta',
    '.tl', '.itin', '.timeline',
    '#env',
    'form'
  ].join(',');

  function prohibido(el) {
    if (!el) return true;
    return !!el.closest(PROHIBIDOS);
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

    /* si al final entraba entero, se saca el botón */
    setTimeout(function () {
      if (cuerpo.scrollHeight <= cuerpo.clientHeight + 4) btn.remove();
    }, 400);
  }

  /* ---- DESPLEGAR LO QUE YA SE HABÍA PLEGADO MAL -------------------------
     Los módulos corren varias veces mientras la invitación se arma. Si un
     bloque prohibido llegó a plegarse en una pasada anterior (porque todavía
     no tenía puesta su clase), acá se deshace: el texto vuelve a su lugar y
     el botón se va. Sin esto, el arreglo de arriba sólo servía en la primera
     pasada. */
  function desplegarProhibidos() {
    [].forEach.call(document.querySelectorAll('.iv-plie'), function (caja) {
      if (!prohibido(caja)) return;
      var cuerpo = caja.querySelector('.iv-plie-txt');
      if (!cuerpo) return;
      while (cuerpo.firstChild) {
        var hijo = cuerpo.firstChild;
        if (hijo.dataset) delete hijo.dataset.ivPlie;
        caja.parentNode.insertBefore(hijo, caja);
      }
      caja.remove();
    });
  }

  function pasar() {
    if (!encendido()) return;
    ponerEstilos();
    [].forEach.call(document.querySelectorAll('section p, .sec p'), plegar);
    desplegarProhibidos();
  }

  function arrancar() {
    pasar();
    var n = 0, t = setInterval(function () { pasar(); if (++n > 40) clearInterval(t); }, 350);
    addEventListener('message', function () { setTimeout(pasar, 120); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
