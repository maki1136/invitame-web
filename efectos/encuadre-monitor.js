/* ===== EL ENCUADRE EN MONITOR ================================================

   EL PROBLEMA
   La invitación está pensada para el celular, y en el celular está bien: todo
   entra en una sola columna del ancho de la pantalla. Pero en una compu la
   ventana es apaisada y cada sector se estiraba distinto:

     · la portada y el pie   ->  474 px
     · las tarjetas y la galería ->  680-720 px
     · la foto del itinerario y la de hoteles -> 1200 px
     · las bandas de fondo (frase, contacto) -> todo el ancho de la ventana

   O sea: cuatro anchos distintos en la misma pieza. En un monitor de 1440 la
   foto del itinerario salía dos veces y media más ancha que la tarjeta que
   tenía justo arriba.

   LA SOLUCIÓN — la misma que ya usa el sobre
   La invitación entera se muestra centrada, del ancho con el que se ve en un
   celular, y el resto de la pantalla se llena con la propia foto de portada muy
   desenfocada más un viñeteado. La pantalla queda llena, sin bandas de color
   plano, y la pieza queda igual de uniforme que en el teléfono.

   POR QUÉ EL ANCHO SE MIDE Y NO SE ESCRIBE
   El ancho sale de medir `.portada` en vivo, no de un número escrito acá. Si
   algún día se cambia el `max-width` de la portada en el motor, esto la sigue
   sola y no hay dos números que mantener sincronizados.

   EN EL CELULAR NO HACE NADA: vive dentro de un @media de 680px para arriba.
   ============================================================================ */
(function () {

  var MIN = 680;

  function laPortada() {
    return document.querySelector('.portada');
  }

  /* La foto de fondo: la misma de la portada, sea <img> o background-image. */
  function fotoDeFondo() {
    var p = laPortada();
    if (!p) return '';
    var img = p.querySelector('img');
    if (img && img.currentSrc) return img.currentSrc;
    if (img && img.src) return img.src;
    var cand = p.querySelector('.pbg') || p;
    var bg = getComputedStyle(cand).backgroundImage || '';
    var m = bg.match(/url\((['"]?)(.*?)\1\)/);
    return m ? m[2] : '';
  }

  function ponerEstilos() {
    if (document.getElementById('encuadre-monitor')) return;
    var s = document.createElement('style');
    s.id = 'encuadre-monitor';
    s.textContent = [
      '#inv-lienzo,#inv-vinieta{display:none}',
      '@media (min-width:' + MIN + 'px){',
      '  #inv-lienzo{display:block;position:fixed;inset:0;z-index:-2;',
      '    background-size:cover;background-position:center;',
      '    filter:blur(70px) saturate(.65) brightness(.92);transform:scale(1.3)}',
      '  #inv-vinieta{display:block;position:fixed;inset:0;z-index:-1;pointer-events:none;',
      '    background:radial-gradient(120% 85% at 50% 45%,rgba(0,0,0,0) 36%,',
      '    rgba(0,0,0,.18) 76%, rgba(0,0,0,.34) 100%)}',
      '  html{background:#cfc4b4}',
      '  .frame{max-width:var(--inv-col,474px);margin-left:auto;margin-right:auto;',
      '    overflow:hidden;box-shadow:0 32px 74px rgba(40,28,12,.34)}',
      '  .frame img{max-width:100%;height:auto}',
      '}'
    ].join('\n');
    /* al final del head: gana sobre lo que ya trae la página, sin !important */
    (document.head || document.documentElement).appendChild(s);
  }

  function medirColumna() {
    var p = laPortada();
    if (!p) return;
    var w = Math.round(p.getBoundingClientRect().width);
    /* Si la portada todavía no se dibujó, o quedó a lo ancho de la ventana
       porque el sobre está encima, no pisamos el valor: reintentamos después. */
    if (w > 120 && w < window.innerWidth - 40) {
      document.documentElement.style.setProperty('--inv-col', w + 'px');
      return true;
    }
    return false;
  }

  function pintarFondo() {
    var frame = document.querySelector('.frame');
    if (!frame) return;
    var url = fotoDeFondo();
    if (!url) return;

    var l = document.getElementById('inv-lienzo');
    if (!l) {
      l = document.createElement('div'); l.id = 'inv-lienzo';
      var v = document.createElement('div'); v.id = 'inv-vinieta';
      document.body.appendChild(l);
      document.body.appendChild(v);
    }
    var css = 'url("' + url.replace(/"/g, '%22') + '")';
    if (l.style.backgroundImage !== css) l.style.backgroundImage = css;
  }

  function arrancar() {
    if (!document.querySelector('.frame')) return;   /* no es una invitación */
    ponerEstilos();

    /* El motor arma la portada y elige la foto después de que corre esto, así
       que reintentamos un rato hasta que las dos cosas estén listas. */
    var n = 0;
    var t = setInterval(function () {
      var listo = medirColumna();
      pintarFondo();
      if (++n > 40 || (listo && document.getElementById('inv-lienzo'))) {
        if (n > 40) clearInterval(t);
      }
    }, 250);
    setTimeout(function () { clearInterval(t); }, 12000);

    window.addEventListener('resize', function () { medirColumna(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
