/* ===== EL ENCUADRE EN MONITOR ================================================

   EL PROBLEMA
   La invitación está pensada para el celular, y en el celular está bien: todo
   entra en una sola columna del ancho de la pantalla. Pero en una compu la
   ventana es apaisada y cada sector se estiraba distinto:

     · la portada y el pie   ->  474 px
     · las tarjetas y la galería ->  680-720 px
     · la foto del itinerario y la de hoteles -> 1200 px
     · las bandas de fondo (frase, contacto) -> todo el ancho de la ventana

   O sea: cuatro anchos distintos en la misma pieza.

   LA SOLUCIÓN — la misma que ya usa el sobre
   La invitación entera se muestra centrada, del ancho con el que se ve en un
   celular, y el resto de la pantalla se llena con la propia foto de portada muy
   desenfocada más un viñeteado.

   ⚠️⚠️ LA COLUMNA SE COMÍA A SÍ MISMA. ESTO SE VIO EN SAFARI Y ERA GRAVE.

   Qué pasaba: se medía el ancho de `.portada` y con ese número se le ponía un
   `max-width` a `.frame`. Pero **la portada vive ADENTRO del marco**. O sea que
   en la vuelta siguiente se medía una portada que YA ESTABA LIMITADA por la
   medición anterior, y salía un número más chico. Y otra vez. Y otra. La
   medición se realimentaba a sí misma y la columna se iba achicando sola.

   En Chrome se frenaba pronto y casi no se notaba. En Safari seguía bajando:
   la invitación quedaba como una tira angosta y el contador de días se salía
   por los costados — se veía "416" cortado a la izquierda y los segundos
   cortados a la derecha.

   CÓMO SE ARREGLA DE VERDAD
   1. Se busca el ancho NATURAL de la portada: el `max-width` que le puso el
      motor. Ese número no depende de nada que hagamos nosotros, así que no se
      puede realimentar.
   2. Si el motor no lo declara en píxeles, se mide — pero SACANDO primero la
      restricción del marco, para medir la portada libre y no la ya apretada.
   3. Y se FIJA UNA SOLA VEZ. Una vez que hay un número bueno, no se vuelve a
      medir salvo que cambie el tamaño de la ventana, y ahí se repite el
      procedimiento completo (soltar, medir, fijar).

   ⚠️ SI ALGUIEN VUELVE A PONER UN `medirColumna()` QUE LEA
   `getBoundingClientRect()` SIN SOLTAR EL MARCO, VUELVE A PASAR.

   Además hay un piso de 320 px: por debajo de eso ya no es una invitación, es
   una tira, y conviene que no se aplique nada antes que aplicar algo roto.

   EN EL CELULAR NO HACE NADA: vive dentro de un @media de 680px para arriba.
   ============================================================================ */
(function () {

  var MIN_VENTANA = 680;   /* de acá para arriba se encuadra */
  var MIN_COLUMNA = 320;   /* menos que esto no es una columna, es una tira */

  function laPortada() {
    return document.querySelector('.portada');
  }
  function elMarco() {
    return document.querySelector('.frame');
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
      '@media (min-width:' + MIN_VENTANA + 'px){',
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

  /* ⚠️ una vez que hay un ancho bueno, se congela: no se vuelve a medir */
  var anchoFijado = 0;

  /* El ancho que el motor le declara a la portada. Es el dato bueno porque no
     depende de nada que hagamos nosotros. */
  function anchoDeclarado(p) {
    var mw = getComputedStyle(p).maxWidth || '';
    var m = mw.match(/^([\d.]+)px$/);
    return m ? Math.round(parseFloat(m[1])) : 0;
  }

  /* Medir SOLTANDO el marco, para no medir lo que ya apretamos antes. */
  function anchoMedidoLibre(p) {
    var f = elMarco();
    var previo = f ? f.style.maxWidth : null;
    if (f) f.style.maxWidth = 'none';
    var w = Math.round(p.getBoundingClientRect().width);
    if (f) { if (previo) f.style.maxWidth = previo; else f.style.removeProperty('max-width'); }
    return w;
  }

  function medirColumna() {
    if (anchoFijado) return true;
    var p = laPortada();
    if (!p) return false;

    var w = anchoDeclarado(p) || anchoMedidoLibre(p);

    if (w >= MIN_COLUMNA && w < window.innerWidth - 40) {
      anchoFijado = w;
      document.documentElement.style.setProperty('--inv-col', w + 'px');
      return true;
    }
    return false;   /* todavía no se puede confiar: se reintenta */
  }

  function pintarFondo() {
    var frame = elMarco();
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
    if (!elMarco()) return;   /* no es una invitación */
    ponerEstilos();

    /* El motor arma la portada y elige la foto después de que corre esto, así
       que se reintenta un rato hasta que las dos cosas estén listas. */
    var n = 0;
    var t = setInterval(function () {
      medirColumna();
      pintarFondo();
      if (++n > 40) clearInterval(t);
    }, 250);
    setTimeout(function () { clearInterval(t); }, 12000);

    /* Al cambiar el tamaño de la ventana se vuelve a empezar: se descongela,
       se suelta el marco y se mide de nuevo. Nunca se mide encima de lo ya
       apretado. */
    var espera = null;
    window.addEventListener('resize', function () {
      clearTimeout(espera);
      espera = setTimeout(function () {
        anchoFijado = 0;
        medirColumna();
      }, 200);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
