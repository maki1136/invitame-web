/* ===== EL DISEÑO, EN EL FORMULARIO DEL CLIENTE ================================

   Maki, 8/9/2026: *«va a haber una solapa con todos los diseños disponibles, y
   ellos ya con eso van a tener el diseño… y que la vaya viendo mientras la va
   armando, como hace Jazmín en su panel»*. Y sobre personalizar: *«sí quiero
   que puedan elegir su paleta o personalizada con sus colores, porque eso es
   muy personal y de gusto, lo mismo que la tipografía»*.

   ⭐ EL PRINCIPIO QUE MANDA ACÁ: **lo fácil tiene que salir hermoso solo.**
   El cliente elige un diseño y ya terminó. La parte de personalizar está
   CERRADA por defecto: es para quien quiere meterse, nunca un paso obligatorio.
   Si alguien no la abre jamás, su invitación tiene que quedar igual de linda
   que la que armaría el equipo.

   QUÉ HACE
     · Muestra los diseños con nombre (los mismos de /catalogo.html).
     · Deja abrir «Personalizar» y cambiar la paleta y la tipografía.
     · Y dibuja la invitación DE VERDAD, en vivo, mientras el cliente escribe.

   ⚠️ LA VISTA PREVIA NO ES UN DIBUJO NI UNA MAQUETA. Es la invitación real
      adentro de un marco, recibiendo los datos por `postMessage`. Es el mismo
      mecanismo que usa el panel de Jazmín (`postPreview` en admin/3-evento.js).
      Por eso lo que ve el cliente es exactamente lo que va a ver su invitado.

   ⚠️ NADA DE ACÁ SE ESCRIBE SOLO. Este archivo arma un borrador en memoria; la
      invitación se crea cuando el cliente manda el formulario, y de eso se
      ocupa `/solicitud-crear.php`.

   ⚠️ NO SE PRENDE NINGUNA FUNCIÓN DESDE ACÁ. Colores y letras son libres para
      todos porque no cuestan nada; prender la galería, el filtro o el QR lo
      decide el PAQUETE (ver /paquetes.js). Si esta pantalla pudiera prenderlos,
      el cliente del plan más barato se regalaría solo lo único irrepetible.

   DE QUÉ DEPENDE (todo ya existía; acá no se copió nada)
     · window.MUESTRAS_INVITAME  → /muestras/catalogo.js
     · window.INVPALETAS         → /efectos/paleta.js
     · window.INVVESTIR          → /vestir.js
     · window.SOLICITUD_A_EVENTO → /solicitud-a-evento.js
     · window.CREAR.leerFormulario → /crear.js
   ============================================================================ */
(function () {
  'use strict';

  var elegido = null;      /* id de la muestra elegida */
  var paleta  = null;      /* id de paleta, o null = la que trae el diseño */
  var letra   = null;      /* índice de LETRAS, o null = la del diseño */
  var muestraCache = {};   /* slug -> evento, para no bajarlo dos veces */
  var iframe = null, listo = false, pendiente = null, timer = null;

  var LLAVE = 'inv_diseno_elegido';

  /* Pares de tipografías que ya usa el motor. Izquierda: los nombres grandes.
     Derecha: los títulos de sección. */
  var LETRAS = [
    { n: 'Clásica',   nfont: "'Cormorant Garamond',serif", fTit: "'Marcellus',serif" },
    { n: 'Romántica', nfont: "'Great Vibes',cursive",      fTit: "'Cormorant Garamond',serif" },
    { n: 'Delicada',  nfont: "'Parisienne',cursive",       fTit: "'Montserrat',sans-serif" },
    { n: 'Moderna',   nfont: "'Prata',serif",              fTit: "'Montserrat',sans-serif" },
    { n: 'Serena',    nfont: "'Italiana',serif",           fTit: "'Jost',sans-serif" }
  ];

  var $ = function (id) { return document.getElementById(id); };

  function guardarElegido() {
    try { localStorage.setItem(LLAVE, JSON.stringify({ elegido: elegido, paleta: paleta, letra: letra })); } catch (e) {}
  }
  function recuperarElegido() {
    try {
      var d = JSON.parse(localStorage.getItem(LLAVE) || 'null');
      if (d) { elegido = d.elegido || elegido; paleta = d.paleta || null; letra = (d.letra == null ? null : d.letra); }
    } catch (e) {}
  }

  /* ---------------------------------------------------------------------------
     EL BORRADOR QUE SE DIBUJA
     Es el mismo camino que recorre la invitación de verdad al crearse:
        lo que llenó el cliente  ->  mapear  ->  vestir con la muestra
     Por eso la vista previa no puede mentir: usa exactamente los mismos dos
     módulos que usa el servidor cuando la crea.
     --------------------------------------------------------------------------- */
  /* ===== LO QUE ELIGIÓ EL CLIENTE, ENCIMA DEL VESTIDO =======================
     ⚠️⚠️ Y ACÁ HAY UNA TRAMPA QUE NO ES DE ESTA PANTALLA, ES DEL MOTOR:
     **el color cargado a mano le gana a la paleta.** `efectos/paleta.js` lo
     dice explícitamente: si el evento tiene `color`, ese pisa a `--verde`.
     Y `color` es una de las cosas que se copian de la muestra al vestirse.
     Resultado medido: el cliente elegía otra paleta y el color principal no
     se movía ni un poco. No era la vista previa: pasaría igual en la
     invitación entregada.
     → Si eligió paleta, se borran los colores a mano que le ganarían. Elegir
       una paleta tiene que verse.
     ========================================================================= */
  function aplicarEleccion(d) {
    if (paleta) {
      d.fx = d.fx || {};
      d.fx.paleta = { id: paleta };
      delete d.color;                                   /* --verde */
      if (d.fx.sobre) delete d.fx.sobre.selloColor;     /* el lacre */
    }
    if (letra != null && LETRAS[letra]) {
      d.nfont = LETRAS[letra].nfont;
      d.fTit  = LETRAS[letra].fTit;
    }
    return d;
  }

  function armarBorrador() {
    if (!window.CREAR || !window.SOLICITUD_A_EVENTO) return null;
    var s = window.CREAR.leerFormulario();
    var d = window.SOLICITUD_A_EVENTO.mapear(s, {});
    var m = elegido && window.muestraDe ? window.muestraDe(elegido) : null;
    var ev = (m && m.muestra && muestraCache[m.muestra]) ? muestraCache[m.muestra] : null;
    if (ev && window.INVVESTIR) window.INVVESTIR.vestir(d, ev, s);

    /* lo que eligió el cliente en «Personalizar» va DESPUÉS del vestido: es su
       decisión y le gana a la de la muestra */
    return aplicarEleccion(d);
  }

  function dibujar() {
    if (!iframe || !listo) return;
    var d = armarBorrador();
    if (!d) return;
    try {
      /* el ida y vuelta por JSON deja afuera cualquier cosa que no se pueda
         clonar (elementos del DOM, la marca de hora de Firestore). Sin esto,
         postMessage tira DataCloneError y no se dibuja nada. */
      var copia = JSON.parse(JSON.stringify(d));
      delete copia.creado;
      delete copia.invitados;                 /* la vista previa no los necesita */
      iframe.contentWindow.postMessage({ type: 'inv-preview', ev: copia }, '*');
    } catch (e) {}
  }
  /* se dibuja con un respiro: escribir una letra no puede repintar la invitación
     entera en cada tecla */
  function pedirDibujo() {
    clearTimeout(timer);
    timer = setTimeout(dibujar, 350);
  }

  function bajarYDibujar(id) {
    var m = window.muestraDe ? window.muestraDe(id) : null;
    if (!m || !m.muestra) { pedirDibujo(); return; }
    if (muestraCache[m.muestra]) { pedirDibujo(); return; }
    if (!window.INVVESTIR) { pedirDibujo(); return; }
    window.INVVESTIR.bajarMuestra(m.muestra).then(function (ev) {
      muestraCache[m.muestra] = ev;
      pedirDibujo();
    })['catch'](function () { pedirDibujo(); });
  }

  /* ---------------------------------------------------------------------------
     LA PANTALLA
     --------------------------------------------------------------------------- */
  function css() {
    if ($('dis-css')) return;
    var st = document.createElement('style');
    st.id = 'dis-css';
    st.textContent = [
      '#dis-modelos{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:10px 0 4px}',
      '.dis-m{border:1px solid #e5d8ca;border-radius:12px;padding:11px 12px;cursor:pointer;background:#fff;text-align:left;transition:.15s}',
      '.dis-m:hover{border-color:#c9b9a6}',
      '.dis-m.on{border-color:#6D1233;box-shadow:0 0 0 2px rgba(109,18,51,.13)}',
      '.dis-m .sw{width:100%;height:34px;border-radius:8px;margin-bottom:8px}',
      '.dis-m .nm{font-weight:800;font-size:13.5px;color:#3f3730}',
      '.dis-m .bj{font-size:11.5px;line-height:1.35;color:#8a7a6a;margin-top:3px}',
      '#dis-mas{margin-top:14px;border-top:1px solid #eee3d6;padding-top:10px}',
      '#dis-mas>summary{cursor:pointer;font-weight:700;font-size:13.5px;color:#6D1233;list-style:none}',
      '#dis-mas>summary::-webkit-details-marker{display:none}',
      '#dis-mas>summary::before{content:"+ ";font-weight:800}',
      '#dis-mas[open]>summary::before{content:"– "}',
      '.dis-tit{font-size:12px;font-weight:700;margin:12px 0 6px;color:#3f3730}',
      '#dis-paletas{display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:7px}',
      '.dis-p{border:1px solid #e5d8ca;border-radius:10px;padding:7px;cursor:pointer;background:#fff;text-align:left}',
      '.dis-p.on{border-color:#6D1233;box-shadow:0 0 0 2px rgba(109,18,51,.13)}',
      '.dis-p .tiras{display:flex;height:16px;border-radius:5px;overflow:hidden;margin-bottom:5px}',
      '.dis-p .tiras i{flex:1}',
      '.dis-p .nm{font-size:11px;color:#6b6058;line-height:1.25;display:block}',
      '.dis-l{display:inline-block;border:1px solid #e5d8ca;border-radius:9px;padding:7px 12px;',
      '  margin:0 6px 6px 0;cursor:pointer;background:#fff;font-size:15px}',
      '.dis-l.on{border-color:#6D1233;box-shadow:0 0 0 2px rgba(109,18,51,.13)}',
      /* el celular */
      '#dis-fono{position:fixed;right:18px;bottom:18px;z-index:60;width:274px;',
      '  border-radius:26px;background:#efe6da;padding:9px;box-shadow:0 22px 48px rgba(40,28,12,.30);display:none}',
      '#dis-fono .pant{border-radius:19px;overflow:hidden;background:#fbf6ef;height:498px}',
      '#dis-fono iframe{width:390px;height:844px;border:0;transform-origin:0 0;transform:scale(.6564)}',
      '#dis-fono .cab{display:flex;align-items:center;justify-content:space-between;',
      '  font-size:11.5px;color:#6b6058;padding:2px 6px 7px;font-weight:700}',
      '#dis-fono .cerrar{cursor:pointer;border:0;background:none;font-size:15px;color:#8a7a6a;line-height:1}',
      '#dis-ver{position:fixed;right:16px;bottom:16px;z-index:59;border:0;cursor:pointer;',
      '  background:#6D1233;color:#fff;font-weight:800;font-size:13.5px;padding:12px 17px;',
      '  border-radius:999px;box-shadow:0 12px 26px rgba(109,18,51,.34)}',
      '@media(min-width:1180px){#dis-fono{display:block}#dis-ver{display:none}}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function tarjetasModelos(caja) {
    var M = window.MUESTRAS_INVITAME || {};
    caja.innerHTML = '';
    Object.keys(M).forEach(function (id) {
      var m = M[id];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dis-m' + (id === elegido ? ' on' : '');
      b.innerHTML = '<div class="sw" style="background:' + (m.color || '#ded3c4') + '"></div>' +
                    '<div class="nm"></div><div class="bj"></div>';
      b.querySelector('.nm').textContent = m.nombre || id;
      b.querySelector('.bj').textContent = m.bajada || '';
      b.onclick = function () {
        elegido = id;
        [].forEach.call(caja.querySelectorAll('.dis-m'), function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        guardarElegido();
        bajarYDibujar(id);
        recargarFono();   /* el diseño trae su propia paleta */
        abrirFono();
      };
      caja.appendChild(b);
    });
  }

  function tarjetasPaletas(caja) {
    var P = window.INVPALETAS || [];
    caja.innerHTML = '';
    /* la primera opción es «la del diseño»: volver atrás tiene que ser fácil */
    var cero = document.createElement('button');
    cero.type = 'button';
    cero.className = 'dis-p' + (paleta ? '' : ' on');
    cero.innerHTML = '<div class="tiras"><i style="background:#e9e2d6"></i><i style="background:#cfc4b4"></i>' +
                     '<i style="background:#8a7a6a"></i></div><span class="nm">La del diseño</span>';
    cero.onclick = function () { paleta = null; guardarElegido(); tarjetasPaletas(caja); recargarFono(); };
    caja.appendChild(cero);

    P.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dis-p' + (paleta === p.id ? ' on' : '');
      b.innerHTML = '<div class="tiras">' +
        '<i style="background:' + p.verde + '"></i>' +
        '<i style="background:' + p.sage + '"></i>' +
        '<i style="background:' + p.sageCl + '"></i>' +
        '<i style="background:' + p.lino + '"></i></div>' +
        '<span class="nm"></span>';
      b.querySelector('.nm').textContent = p.nombre;
      b.onclick = function () { paleta = p.id; guardarElegido(); tarjetasPaletas(caja); recargarFono(); };
      caja.appendChild(b);
    });
  }

  function botonesLetra(caja) {
    caja.innerHTML = '';
    var cero = document.createElement('button');
    cero.type = 'button';
    cero.className = 'dis-l' + (letra == null ? ' on' : '');
    cero.textContent = 'La del diseño';
    cero.style.fontSize = '13px';
    cero.onclick = function () { letra = null; guardarElegido(); botonesLetra(caja); recargarFono(); };
    caja.appendChild(cero);

    LETRAS.forEach(function (l, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dis-l' + (letra === i ? ' on' : '');
      b.textContent = l.n;
      b.style.fontFamily = l.nfont;
      b.onclick = function () { letra = i; guardarElegido(); botonesLetra(caja); recargarFono(); };
      caja.appendChild(b);
    });
  }

  /* ⚠️ LA PALETA Y LA LETRA NO SE REPINTAN CON UN `inv-preview` A SECAS.
     Medido: se cambia la paleta, el nombre se actualiza al instante pero los
     colores se quedan en los de la muestra. Es porque el motor aplica la
     paleta UNA sola vez, cuando arranca —parte la escribe el servidor con
     `!important`, parte /efectos/paleta.js al cargar— y un mensaje posterior
     no vuelve a pasar por ahí.
     Se recarga el marco entero: son 300 ms y el resultado es la verdad. Los
     datos (nombres, fechas, textos) siguen yendo por mensaje, sin recargar. */
  function recargarFono() {
    if (!iframe) return;
    listo = false;
    iframe.src = '/i/?preview=1&r=' + Date.now();   /* al cargar, dibuja solo */
  }

  function abrirFono() {
    var f = $('dis-fono'); if (!f) return;
    if (window.matchMedia('(min-width:1180px)').matches) return;   /* ya está fijo */
    f.style.display = 'block';
    f.style.left = '50%'; f.style.right = 'auto';
    f.style.transform = 'translateX(-50%)';
  }

  function armarFono() {
    if ($('dis-fono')) return;
    var f = document.createElement('div');
    f.id = 'dis-fono';
    f.innerHTML = '<div class="cab"><span>Así se va a ver</span>' +
                  '<button type="button" class="cerrar" id="dis-cerrar" aria-label="Cerrar">&#10005;</button></div>' +
                  '<div class="pant"><iframe id="dis-frame" title="Vista previa de tu invitación"></iframe></div>';
    document.body.appendChild(f);

    var b = document.createElement('button');
    b.type = 'button'; b.id = 'dis-ver';
    b.textContent = 'Ver mi invitación';
    b.onclick = function () {
      var caja = $('dis-fono');
      var abierto = caja.style.display === 'block';
      if (abierto) { caja.style.display = 'none'; b.textContent = 'Ver mi invitación'; }
      else { abrirFono(); b.textContent = 'Ocultar'; dibujar(); }
    };
    document.body.appendChild(b);
    $('dis-cerrar').onclick = function () {
      $('dis-fono').style.display = 'none';
      var v = $('dis-ver'); if (v) v.textContent = 'Ver mi invitación';
    };

    iframe = $('dis-frame');
    /* ⚠️ NO ALCANZA CON ESPERAR EL AVISO DEL MOTOR. La invitación manda un
       `inv-preview-ready` cuando terminó de cargar, pero medido acá: ese aviso
       no llegaba —o llegaba antes de que este archivo estuviera escuchando— y
       la vista previa se quedaba mostrando la boda de ejemplo para siempre.
       Sin dar ningún error: el envío salía y nadie lo recibía.
       El panel de Jazmín ya resolvía esto igual (`fr.addEventListener('load',
       postPreview)` en admin/3-evento.js): se escuchan LAS DOS señales. */
    iframe.addEventListener('load', function () { listo = true; dibujar(); });
    iframe.src = '/i/?preview=1';
  }

  /* el motor avisa cuando terminó de cargar y recién ahí escucha */
  window.addEventListener('message', function (e) {
    if (e && e.data && e.data.type === 'inv-preview-ready') { listo = true; dibujar(); }
  });

  function armar() {
    /* ⚠️ EL BOTÓN DE ENVIAR NO ESTÁ ADENTRO DE NINGUNA TARJETA: es hermano de
       la última. Con `closest('.card')` esto daba null y el bloque no se
       montaba nunca —sin dar ningún error. Se cuelga de la última tarjeta. */
    var cards = document.querySelectorAll('#wrap .card');
    var anclaje = cards.length ? cards[cards.length - 1] : null;
    if (!anclaje || $('card-diseno')) return false;
    css();

    var card = document.createElement('div');
    card.className = 'card';
    card.id = 'card-diseno';
    card.innerHTML =
      '<h3>El diseño de tu invitación</h3>' +
      '<p class="desc">Elige el que más te guste. Lo vas viendo al instante, ' +
      'y lo puedes cambiar todas las veces que quieras.</p>' +
      '<div id="dis-modelos"></div>' +
      '<details id="dis-mas">' +
        '<summary>Personalizar los colores y la letra</summary>' +
        '<div class="dis-tit">Los colores</div><div id="dis-paletas"></div>' +
        '<div class="dis-tit">La letra</div><div id="dis-letras"></div>' +
      '</details>';
    anclaje.parentNode.insertBefore(card, anclaje);

    recuperarElegido();
    if (!elegido) {
      /* el que venía del catálogo, si entró por ahí */
      var t = new URLSearchParams(location.search).get('tpl');
      if (t && window.MUESTRAS_INVITAME && window.MUESTRAS_INVITAME[t]) elegido = t;
    }
    tarjetasModelos($('dis-modelos'));
    tarjetasPaletas($('dis-paletas'));
    botonesLetra($('dis-letras'));
    armarFono();
    avisoBorrador();
    if (elegido) bajarYDibujar(elegido);

    /* mientras escribe, la invitación se va armando */
    document.addEventListener('input',  function (e) { if (e.target && e.target.closest('.card,#guests')) pedirDibujo(); });
    document.addEventListener('change', function (e) { if (e.target && e.target.closest('.card,#guests')) pedirDibujo(); });
    return true;
  }

  /* lo que este archivo le presta a /crear.js al enviar */
  window.CREAR_DISENO = {
    elegido: function () { return elegido; },
    /* le pone el vestido al borrador que se va a mandar al servidor */
    vestirLoQueSeManda: function (d, solicitud) {
      var m = elegido && window.muestraDe ? window.muestraDe(elegido) : null;
      var ev = (m && m.muestra && muestraCache[m.muestra]) ? muestraCache[m.muestra] : null;
      if (ev && window.INVVESTIR) window.INVVESTIR.vestir(d, ev, solicitud);
      return aplicarEleccion(d);
    }
  };

  /* ===== QUE SEPA QUE SE GUARDA SOLO  (8/9/2026) ============================
     Maki: «imagino que van a ir completando los campos de a poco… un botón que
     diga guardar y seguir más adelante».
     El borrador YA existía: /crear.js guarda en cada tecla y lo ofrece de
     vuelta hasta 30 días después. El problema era otro: NADIE SE ENTERABA. Sin
     un cartel, el cliente siente que tiene que terminar de una sentada.
     ⚠️ Dice «en este dispositivo» a propósito: el borrador vive en ESTE
        navegador. Prometer que puede seguir desde el celular sería mentirle. */
  function avisoBorrador() {
    if ($('dis-borrador')) return;
    var b = $('send'); if (!b) return;
    var caja = document.createElement('div');
    caja.id = 'dis-borrador';
    caja.style.cssText = 'display:flex;gap:10px;align-items:center;justify-content:center;' +
      'flex-wrap:wrap;margin:16px 0 0;padding:11px 14px;border-radius:12px;' +
      'background:#f6f1e8;border:1px solid #e8ddcb';
    var t = document.createElement('span');
    t.style.cssText = 'font-size:13px;color:#6b6058;line-height:1.45';
    t.textContent = 'Tranquilo: se guarda solo mientras escribes. Puedes cerrar y continuar después en este dispositivo.';
    var g = document.createElement('button');
    g.type = 'button';
    g.style.cssText = 'border:1px solid #cbb9a2;background:#fff;color:#6D1233;font-weight:800;' +
      'font-size:13px;padding:9px 14px;border-radius:999px;cursor:pointer';
    g.textContent = 'Guardar y seguir después';
    g.onclick = function () {
      var antes = g.textContent;
      g.textContent = 'Guardado'; g.disabled = true;
      t.textContent = 'Listo, guardamos lo que llevas. Cuando vuelvas a abrir esta página desde este dispositivo, seguimos donde quedaste.';
      setTimeout(function () { g.textContent = antes; g.disabled = false; }, 3200);
    };
    caja.appendChild(t); caja.appendChild(g);
    b.parentNode.insertBefore(caja, b.nextSibling);
  }

  var n = 0;
  var t = setInterval(function () {
    if (armar() || ++n > 60) clearInterval(t);
  }, 400);
})();
