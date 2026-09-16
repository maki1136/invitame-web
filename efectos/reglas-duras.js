/* ===== LAS REGLAS DURAS DEL MOTOR ===========================================

   POR QUE EXISTE ESTE ARCHIVO  (16/9/2026)

   Maki, cansado, despues de que las mismas tres cosas salieran mal por
   tercera vez:

     «te dije que dejes... la frase sigue asi grande, eliminala directo y
      anotate no quiero mas asi grande fuera de diseno. vos ves la skill antes
      de trabajar? ya lo habiamos agregado o no?»

   Si: ya estaba agregado. Estaba escrito en la skill de muestras, con sus
   palabras, y aun asi se repitio. La conclusion la eligio el:

     «las reglas duras adentro del motor» — que el motor NO PUEDA pintarlo mal,
     en vez de confiar en que alguien se acuerde de leer la regla.

   Eso es este archivo. No es una coleccion ni un gusto: son tres reglas que
   Maki ya dicto y que valen para TODAS las invitaciones.

   ---------------------------------------------------------------------------
   REGLA 1 — LA FRASE NO SE PINTA SUELTA. NUNCA.

     «Donde esta la frase, jamas podemos dejarla asi como la haces siempre, es
      muy poco estetica.»
     «El sobre que se abre la carta lo quiero en lugar de la frase. A partir de
      ahora la frase va con el sobre.»

   Una frase grande, centrada, sola sobre una banda de color es lo que Maki
   llama «fuera de diseno». El texto vive dentro de la pieza de la carta.

   ⚠️ Y HAY UNA TRAMPA MEDIDA: vaciar el campo `frase` NO alcanza. Medido en
      martina-mis15 el 16/9/2026 — con el campo en blanco, `.fraseSec` seguia
      en el DOM y traia el texto de la boda de EJEMPLO («Hay un instante en la
      vida...»). Es el mismo problema de la tarea #187. Por eso este modulo no
      mira el dato: saca la seccion y punto.

   REGLA 2 — LA CARTA VA ARRIBA, EN EL LUGAR QUE DEJO LA FRASE

   El motor la deja al final, entre la mesa de regalos y el clima. En Perlas ya
   se subia con `efectos/carta-perlas.js`, pero con un candado `esPerlas()` y
   anclada a `.fraseSec`. Ahora que la frase se elimina de todas, ese ancla
   desaparece y el lugar queda libre en todas: la carta sube a ocuparlo.

   ⚠️ ANCLA MEDIDA EN EL DOM REAL, no supuesta. Los sectores que arma `secOrden`
      (eventos, itinerario, hospedaje, dresscode, padres, galeria, trivia,
      regalos) NO TIENEN id: son `.sec` pelados. Los unicos con id son los
      bloques sueltos del motor (`carta-sec`, `clima-sec`, `video-sec`,
      `spotify-sec`, `share-sec`, `pv-sec`, `filtro-sec`, `gal-seccion`,
      `contacto-sec`). Por eso la carta NO se ancla por id de sector: se
      cuelga despues de la entrada — portada, pase con QR y raspadita — que es
      exactamente donde estaba la frase, que era el primero de `secOrden`.

   Si esta cargada `carta-perlas.js`, ese modulo gana y este no hace nada: no
   se pelean dos manos por el mismo nodo.

   REGLA 3 — EL VIDEO Y LA PLAYLIST NUNCA SE VEN CRUDOS

     «esta el rectangulo blanco y despues el logotipo...»

   El preview de YouTube y el widget pelado de Spotify no se muestran jamas.
   El metodo correcto ya estaba resuelto en Perlas y se respeta tal cual:

     NO SE TAPA UN PAPEL CON OTRO PAPEL. Se esconde el medio con `visibility`
     y se deja pasar una tapa dibujada encima.

   Tapar con un rectangulo opaco es justamente el arreglo que Maki rechazo.

   ⚠️ Los dos medios se bajan tarde (tarea #188): el iframe existe desde el
      arranque pero con `src` vacio hasta que el invitado lo abre. Por eso
      alcanza con mirar si HAY iframe, sin esperar a que cargue.

   ---------------------------------------------------------------------------
   COMO ESTA HECHO

   · Reversible: se saca la linea de `efectos/index.js` y la invitacion vuelve
     exactamente a como estaba. No toca el motor ni reescribe nada.
   · Cede ante las colecciones: si una coleccion ya resolvio el bloque, este
     modulo se aparta.
   · Revisa cada tanto, porque EL PANEL REPINTA: cada tecla que toca Jazmin en
     la vista previa vuelve a armar los sectores. Misma leccion que dejaron el
     itinerario y la carta de Perlas.
   ============================================================================ */
(function () {

  var CADA  = 700;      /* cada cuanto revisa que siga bien puesto */
  var HASTA = 60000;    /* al minuto ya esta todo armado */

  /* ── ayudas ───────────────────────────────────────────────────────────── */

  function datos() { return window.INVEV || {}; }

  function laColeccion() {
    var D = datos();
    return String((D.fx && D.fx.coleccion) || D.coleccion || '').toLowerCase();
  }

  /* Perlas ya tiene su propio modulo para la carta y su propia tapa de video.
     Ahi este archivo no se mete. */
  function loResuelveLaColeccion() {
    return laColeccion() === 'perlas';
  }

  function elMarco() { return document.querySelector('.frame'); }


  /* ── REGLA 1: fuera la frase suelta ───────────────────────────────────── */

  function sacarLaFrase() {
    var secs = document.querySelectorAll('.fraseSec, section.frase');
    for (var i = 0; i < secs.length; i++) {
      var s = secs[i];
      if (s.getAttribute('data-regla-frase') === 'fuera') continue;

      /* Se saca SIEMPRE, tenga o no texto: si tiene, es la frase suelta que
         Maki no quiere; si no tiene, es una seccion vacia que ademas puede
         rellenarse sola con el texto de la boda de ejemplo. */
      s.setAttribute('data-regla-frase', 'fuera');
      s.style.display = 'none';
    }
  }


  /* ── REGLA 2: la carta, arriba ────────────────────────────────────────── */

  /* Devuelve el ULTIMO bloque de la entrada: la raspadita si esta, si no el
     pase con el QR, si no la portada. La carta va justo despues de eso. */
  function finDeLaEntrada() {
    var marco = elMarco();
    if (!marco) return null;

    var ultimo = null;
    var hijos = marco.children;
    for (var i = 0; i < hijos.length; i++) {
      var n = hijos[i];
      var c = ' ' + String(n.className || '') + ' ';
      if (c.indexOf(' portada ') >= 0 ||
          c.indexOf(' pase ') >= 0 ||
          c.indexOf(' scratch-sec ') >= 0) {
        ultimo = n;
      }
    }
    return ultimo;
  }

  function subirLaCarta() {
    if (loResuelveLaColeccion()) return;

    var carta = document.getElementById('carta-sec');
    var tope  = finDeLaEntrada();
    if (!carta || !tope) return;
    if (carta.parentNode !== tope.parentNode) return;   /* distinto padre: no aplica */
    if (tope.nextElementSibling === carta) return;      /* ya esta: no tocar, mover
                                                           reinicia las animaciones
                                                           de entrada y parpadea */
    tope.parentNode.insertBefore(carta, tope.nextSibling);
  }


  /* ── REGLA 3: el video y la playlist, tapados ─────────────────────────── */

  var CSS_ID = 'reglas-duras-css';

  function ponerCss() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement('style');
    s.id = CSS_ID;
    s.textContent = [
      '[data-crudo="tapado"]{position:relative}',
      /* el medio se esconde, no se cubre */
      '[data-crudo="tapado"] > iframe,',
      '[data-crudo="tapado"] > video{visibility:hidden}',
      '.rd-tapa{position:absolute;inset:0;z-index:2;display:flex;',
      '  flex-direction:column;align-items:center;justify-content:center;gap:10px;',
      '  border-radius:inherit;cursor:pointer;',
      '  background:var(--lino,#f4f1ea)}',
      '.rd-tapa .rd-aro{width:62px;height:62px;border-radius:50%;',
      '  border:1px solid currentColor;display:flex;align-items:center;',
      '  justify-content:center;opacity:.75}',
      '.rd-tapa .rd-aro::after{content:"";border-style:solid;',
      '  border-width:9px 0 9px 15px;margin-left:4px;',
      '  border-color:transparent transparent transparent currentColor}',
      '.rd-tapa .rd-txt{font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.65}',
      '.rd-tapa.rd-ida{opacity:0;pointer-events:none;transition:opacity .45s ease}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  function taparUno(caja, rotulo) {
    if (!caja) return;
    if (caja.querySelector('.rd-tapa')) return;          /* ya tiene la nuestra */
    if (caja.querySelector('.col-vtapa')) return;        /* la puso la coleccion */
    if (!caja.querySelector('iframe') && !caja.querySelector('video')) return;

    ponerCss();
    caja.setAttribute('data-crudo', 'tapado');

    var tapa = document.createElement('div');
    tapa.className = 'rd-tapa';
    var aro = document.createElement('div'); aro.className = 'rd-aro';
    var txt = document.createElement('div'); txt.className = 'rd-txt';
    txt.textContent = rotulo;
    tapa.appendChild(aro); tapa.appendChild(txt);

    /* Al tocar, la tapa se va y recien ahi aparece el medio. Antes de eso el
       invitado nunca ve el rectangulo blanco de YouTube. */
    tapa.addEventListener('click', function () {
      caja.removeAttribute('data-crudo');
      tapa.classList.add('rd-ida');
      setTimeout(function () { if (tapa.parentNode) tapa.parentNode.removeChild(tapa); }, 500);
    });

    caja.appendChild(tapa);
  }

  function taparCrudos() {
    if (loResuelveLaColeccion()) return;
    taparUno(document.getElementById('video-embed'), 'Nuestro video');
    taparUno(document.getElementById('spotify-embed'), 'La playlist');
  }


  /* ── el ciclo ─────────────────────────────────────────────────────────── */

  function pasada() {
    if (!elMarco()) return;
    sacarLaFrase();
    subirLaCarta();
    taparCrudos();
  }

  function arrancar() {
    pasada();

    var t0 = Date.now();
    var t = setInterval(function () {
      pasada();
      if (Date.now() - t0 > HASTA) clearInterval(t);
    }, CADA);

    /* En la vista previa del panel el repintado no para nunca. */
    window.addEventListener('message', function () { setTimeout(pasada, 120); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
