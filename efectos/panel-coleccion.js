/* ===== LA COLECCIÓN, EN EL PANEL =============================================

   El selector con el que Jazmín elige la colección de diseño. Lo obedecen los
   archivos de /colecciones/.

   ⚠️ SE LLAMA "COLECCIÓN". Decisión de Maki (31/8/2026).
      Ni "plantilla" —suena prearmado y barato para la novia— ni "estilo", que
      se confunde con la paleta y con el material de los botones, que están
      justo al lado en este mismo panel. "Colección Perlas" se vende como
      catálogo, que es a dónde va esto.

   ⚠️ VIENE APAGADA. Vacío = "Sin colección" = la invitación de siempre.
      Ninguna invitación ya entregada se entera.

   ★★ LA COLECCIÓN PROPONE, JAZMÍN DISPONE ★★  ← decisión de Maki
      «sí, que Jaz pueda cambiar».
      La colección NUNCA pisa algo que Jazmín ya eligió. Cuando hay conflicto,
      avisa y ofrece el cambio con un clic. Hoy son dos cosas:

      1. LA PALETA. La referencia ES crema y topo; con otra paleta deja de
         parecerse. Si la invitación no tenía paleta, se pone la de la
         colección. Si ya tenía otra, se avisa y se ofrece cambiarla.

      2. LA TIPOGRAFÍA DE LOS NOMBRES. El motor le escribe a los nombres la
         familia y el tamaño EN LÍNEA, desde los campos `nfont` y `nsize`, y un
         estilo en línea le gana a cualquier hoja. Entonces:
         · si `nfont` está vacía, la colección los pone en serif fina y
           mayúsculas, como la referencia;
         · si `nfont` tiene algo elegido, la colección NO toca los nombres.
         Acá se le ofrece a Jazmín vaciar el campo con un clic. Y si después
         quiere volver a la manuscrita, elige la fuente y la colección se hace
         a un lado.

         ⚠️ El tratamiento de los nombres va TODO junto o no va: poner en
            mayúsculas una letra manuscrita queda horrible.

   ★★ `fx.paleta` ES UN OBJETO `{id:"..."}`, NO UN TEXTO ★★  ← bug real
      La primera versión escribía `fx.paleta = 'cafe-caramelo'` y comparaba
      `fx.paleta === c.paleta`. Las dos cosas están mal:
        · la comparación NUNCA daba verdadero, así que a una invitación que ya
          tenía la paleta correcta igual le salía el cartel de conflicto;
        · y al escribir un texto donde el resto del sistema espera un objeto,
          el selector de paletas se quedaba sin poder leer el `id`.
      → Se lee siempre `fx.paleta.id` (aceptando texto por si alguna invitación
        vieja lo tiene así) y se escribe siempre `{ id: '...' }`.

   ⚠️ NO GUARDARSE `D.fx` AL CONSTRUIR.  ← bug real, ya pasó con panel-motivo
      El bloque se arma a los ~500 ms, ANTES de que cargue el evento. Cuando el
      evento llega, el panel REEMPLAZA `D.fx` por el objeto de Firestore y
      cualquier referencia guardada antes queda apuntando a un objeto huérfano:
      los selectores se mueven, la vista previa se refresca… y no guarda nada.
      Parece andar y no anda. Por eso `datos()` se llama de nuevo adentro de
      cada `onchange`.

   ⚠️ PARA APAGAR SE GUARDA `''`, NO SE BORRA LA CLAVE.
      `INV.saveEvento` guarda con merge: borrar la clave del borrador NO la
      borra en Firestore y la colección "no se apaga". Lo mismo vale para
      `nfont`: para devolverle la tipografía a la colección hay que guardar
      `''`, no borrar el campo.

   ⚠️ `nfont` y `nsize` NO viven en `fx`: son campos del evento, al lado de los
      nombres. Por eso se escriben en `D` directo, no en `D.fx`.

   ⚠️ `D` (el borrador) NO cuelga de window: es un `const` del script principal.
      Misma nota en panel-fondo.js, panel-pieza.js, panel-rsvp.js, panel-motivo.js.
   ============================================================================ */
(function () {

  var ID = 'coleccion-selector';

  /* El catálogo. Cada entrada nueva de /colecciones/ se suma acá. */
  var COLECCIONES = [
    { id: '', nombre: 'Sin colección',
      paleta: null, paletaNombre: null,
      ayuda: 'La invitación queda como está, con la tipografía de siempre.' },
    { id: 'perlas', nombre: 'Perlas',
      paleta: 'cafe-caramelo', paletaNombre: 'Café y caramelo',
      ayuda: 'Serif fina en mayúsculas con la cursiva debajo, mucho aire, ' +
             'arcos, la foto en blanco y negro y un hilo de perlas de verdad ' +
             'que recorre todo.' },
    { id: 'marfil', nombre: 'Marfil',
      paleta: null, paletaNombre: null,
      ayuda: 'Papel marfil con textura, portada solo tipografica, la tarjeta ' +
             'flotando y las perlas de los margenes. Trae su propia paleta.' },
    { id: 'disco', nombre: 'Disco',
      paleta: 'azul-noche-plata', paletaNombre: 'Azul noche y plata',
      ayuda: 'Noche, bolas de espejos y plata. Portada sobria, con el nombre ' +
             'en plata sobre negro.' },
    { id: 'disco-neon', nombre: 'Disco Neon',
      paleta: 'azul-noche-plata', paletaNombre: 'Azul noche y plata',
      ayuda: 'El mismo Disco, con OTRA portada: dos palabras en neon arriba y ' +
             'el nombre en cursiva cromada. Los textos se escriben aca abajo.' },
    { id: 'campestre', nombre: 'Campestre',
      paleta: null, paletaNombre: null,
      ayuda: 'Campo al atardecer en video, papel crema y tinta oliva, ' +
             'guirnaldas de luces y una rodaja de madera como marca. Trae su ' +
             'propia paleta y su propio fondo.' },
    { id: 'bohemia', nombre: 'Bohemia',
      paleta: null, paletaNombre: null,
      ayuda: 'Boho chic: pampas en video, papel crema y tinta marron con ' +
             'acento camel, los nombres en versalitas muy abiertas SIN cursiva ' +
             'y una rosa seca fotografiada como marca. Trae su propia paleta.' },
    { id: 'cenicienta', nombre: 'Cenicienta',
      paleta: null, paletaNombre: null,
      ayuda: 'Cuento de hadas de hielo: nieve y palacio en video, azul hielo y ' +
             'plata, titulos en Forum y el nombre en cursiva grande, con una ' +
             'zapatilla de cristal fotografiada como marca. Trae su propia paleta.' },
    { id: 'cantera', nombre: 'Cantera',
      paleta: null, paletaNombre: null,
      ayuda: 'Boda religiosa tradicional mexicana: cantera rosa, laton y olivo. ' +
             'Las secciones van en ARCO de medio punto y la marca es un medallon ' +
             'de laton con una rama de olivo. Trae su propia paleta.' },
    { id: 'bella', nombre: 'La Bella y la Bestia',
      paleta: null, paletaNombre: null,
      ayuda: 'La primera OSCURA de la linea de princesas: oro viejo, borgoña y ' +
             'verde botella sobre madera, a la luz de tres velas que titilan en ' +
             'el fondo. Titulos en Cinzel, el nombre en Pinyon Script y un capullo ' +
             'de rosa como marca. Trae su propia paleta.' },
    { id: 'sirena', nombre: 'La Sirenita',
      paleta: null, paletaNombre: null,
      ayuda: 'La tercera de la linea de princesas, y la unica en NACAR, CORAL y ' +
             'VERDE MAR: el fondo del mar con la red de luz del agua EN VIDEO, ' +
             'papel nacar y tinta verde abisal. Titulos en Italiana, el nombre en ' +
             'Parisienne y una VIEIRA (la valva de la concha) como marca del ' +
             'itinerario y adorno de los titulos. Trae su propia paleta.' },
    { id: 'oleo', nombre: 'Óleo',
      paleta: null, paletaNombre: null,
      ayuda: 'Linea ARTE: pintura al oleo con espatula de fondo, en video. ' +
             'Rosa empolvado, nude, champaña y hoja de oro; las tarjetas son lienzos ' +
             'colgados y la marca es una pincelada. Trae su propia paleta.' },
    { id: 'oleo-piedra', nombre: 'Óleo · Piedra',
      paleta: null, paletaNombre: null,
      ayuda: 'Linea ARTE, el mismo diseño de Óleo en otro tono: greige, arena, ' +
             'gris cálido, marfil y pan de plata. Para bodas civiles, viñedo, ' +
             'haciendas de piedra. Trae su propia paleta.' },
    { id: 'oleo-champagne', nombre: 'Óleo · Champagne',
      paleta: null, paletaNombre: null,
      ayuda: 'Linea ARTE, la más luminosa: champagne, marfil cálido, rubor y oro ' +
             'pálido, pintado con espátula a la hora dorada. Para haciendas coloniales, ' +
             'bodas de tarde y San Miguel de Allende. Trae su propia paleta.' },
    { id: 'oleo-jardin', nombre: 'Óleo · Jardín',
      paleta: null, paletaNombre: null,
      ayuda: 'Linea ARTE, la verde: salvia, glicina lila, rubor y oro viejo, un ' +
             'jardín secreto pintado con espátula y con el fondo EN VIDEO (la glicina ' +
             'se mece, corre la fuente). Para bodas de jardín y de día. Trae su propia paleta.' },
    { id: 'oleo-eucalipto', nombre: 'Botánica · Eucalipto',
      paleta: null, paletaNombre: null,
      ayuda: 'Eucalipto real verde plateado sobre lino marfil, con rosas blancas; fotos hiperrealistas y fondo EN VIDEO. Para bodas de bosque, jardín o campo. Trae su propia paleta.' },
    { id: 'oleo-acuarela', nombre: 'Botánica · Eucalipto en acuarela',
      paleta: null, paletaNombre: null,
      ayuda: 'Papel de algodón blanco con aguadas de acuarela salvia, eucalipto real y rosas blancas en las esquinas y un arco dorado; fondo EN VIDEO (las ramas se mecen). Básica y luminosa, para bodas de jardín. Trae su propia paleta.' },
    { id: 'oleo-mexicana', nombre: 'Tradición · Mexicana',
      paleta: null, paletaNombre: null,
      ayuda: 'Muro de cal con corazón de hojalata, pajaritos de barro de Oaxaca, guirnalda de cempasúchil y bugambilia y papel picado que se mueve en el fondo EN VIDEO. Para bodas mexicanas con color y tradición. Trae su propia paleta.' },
    { id: 'oleo-talavera', nombre: 'Tradición · Talavera',
      paleta: null, paletaNombre: null,
      ayuda: 'Nicho de cal enmarcado en azulejo de Talavera de Puebla, limoneros y bugambilia blanca; portada SIN foto de los novios, en video. Azul cobalto, blanco y amarillo limón. Trae su propia paleta.' },
    { id: 'oleo-vaquera', nombre: 'XV · Vaquera',
      paleta: null, paletaNombre: null,
      ayuda: 'Botas rosas bordadas, sombrero, peonías y pampas sobre heno contra madera blanca; portada SIN foto de la quinceañera, en video. Rosa viejo, café cuero y crema. Trae su propia paleta.' },
    { id: 'oleo-monarca', nombre: 'XV · Mariposa monarca',
      paleta: null, paletaNombre: null,
      ayuda: 'Bosque de oyameles de Michoacán con monarcas en video (cámara quieta); portada SIN foto de la quinceañera. Naranja monarca, oro y crema. Trae su propia paleta.' },
    { id: 'oleo-mascarada', nombre: 'XV · Mascarada rosé',
      paleta: null, paletaNombre: null,
      ayuda: 'Baile de máscaras: antifaz dorado, champaña y arañas de cristal sobre terciopelo rosa, en video; portada SIN foto de la quinceañera. Rosa, oro rosé y malva. Trae su propia paleta.' },
    { id: 'oleo-cerezo', nombre: 'XV · Flor de cerezo',
      paleta: null, paletaNombre: null,
      ayuda: 'Fondo rosa con ramas de cerezo en las esquinas y pétalos que caen, en video; portada SIN foto de la quinceañera, nombre al medio en oro. Rosa, ciruela y oro. Trae su propia paleta.' },
    { id: 'oleo-espatulado', nombre: 'Textura · Espatulado',
      paleta: null, paletaNombre: null,
      ayuda: 'Yeso blanco trabajado con espátula en relieve, con ramitas de hoja de oro; elegante y clásica, fondo EN VIDEO. Trae su propia paleta.' },
    { id: 'oleo-marmol', nombre: 'Textura · Mármol',
      paleta: null, paletaNombre: null,
      ayuda: 'Mármol blanco con vetas de oro, capillas y lirios; para bodas religiosas, fondo EN VIDEO. Trae su propia paleta.' },
    { id: 'oleo-nocturno', nombre: 'Óleo · Nocturno',
      paleta: null, paletaNombre: null,
      ayuda: 'Linea ARTE, la primera OSCURA: azul noche, carbón, marfil y pan de ' +
             'oro, con cielo estrellado pintado con espátula. Para bodas de noche, ' +
             'haciendas y velas. Trae su propia paleta.' },

  ];

  function borrador() {
    try { return (typeof D === 'object' && D) ? D : null; } catch (e) { return null; }
  }
  function refrescar() {
    if (typeof postPreview === 'function') { try { postPreview(); } catch (e) {} }
  }
  /* ⚠️ SIEMPRE fresco: nunca guardar lo que devuelve. Ver la nota de arriba. */
  function datos() {
    var d = borrador();
    if (!d) return null;
    if (!d.fx) d.fx = {};
    return d.fx;
  }
  function deId(id) {
    for (var i = 0; i < COLECCIONES.length; i++) if (COLECCIONES[i].id === id) return COLECCIONES[i];
    return COLECCIONES[0];
  }
  /* ⚠️ `fx.paleta` es `{id:"..."}`. Ver la nota grande de arriba. */
  function idDePaleta(fx) {
    var p = (fx || {}).paleta;
    if (!p) return '';
    return (typeof p === 'string') ? p : (p.id || '');
  }

  function construir() {
    var caja = document.createElement('div');
    caja.id = ID;
    caja.style.cssText = 'margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.10)';

    var t = document.createElement('div');
    t.textContent = 'Colección de diseño';
    t.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:2px';
    caja.appendChild(t);

    var a = document.createElement('div');
    a.textContent = 'Cambia toda la invitación de una: tipografía, aire, colores y adornos.';
    a.style.cssText = 'font-size:11.5px;opacity:.62;margin-bottom:10px;line-height:1.35';
    caja.appendChild(a);

    var lab = document.createElement('label');
    lab.textContent = 'La colección';
    lab.style.cssText = 'display:block;font-size:12px;font-weight:600;margin:0 0 3px';
    caja.appendChild(lab);

    var sel = document.createElement('select');
    sel.style.cssText = 'width:100%;margin-bottom:8px';
    COLECCIONES.forEach(function (c) {
      var op = document.createElement('option');
      op.value = c.id; op.textContent = c.nombre;
      sel.appendChild(op);
    });
    caja.appendChild(sel);

    var ayuda = document.createElement('div');
    ayuda.style.cssText = 'font-size:11px;opacity:.6;line-height:1.4';
    caja.appendChild(ayuda);

    /* ⭐⭐ LOS CAMPOS DE «DISCO NEON».
       Regla de Maki (21/9/2026): «todo lo que agregamos a las muestras despues
       tiene que estar en el panel accesible para que Jazmin pueda armarlas asi
       personalizadas. No puede pasar que mostramos una de estas muestras y
       despues no la podamos armar manualmente».
       Esta portada tiene tres textos propios, una altura y un color. Sin esto
       solo se podian escribir a mano en la base. Se ven SOLO con «disco-neon». */
    var neon = document.createElement('div');
    neon.style.cssText = 'display:none;margin-top:10px;padding:10px 11px;border-radius:8px;' +
      'background:rgba(0,0,0,.045);border:1px solid rgba(0,0,0,.08)';
    caja.appendChild(neon);

    var neonT = document.createElement('div');
    neonT.textContent = 'La portada de neon';
    neonT.style.cssText = 'font-size:12px;font-weight:600;margin-bottom:2px';
    neon.appendChild(neonT);

    function campoNeon(rotulo, clave, ejemplo, ayudita) {
      var l = document.createElement('label');
      l.textContent = rotulo;
      l.style.cssText = 'display:block;font-size:11.5px;font-weight:600;margin:8px 0 3px';
      neon.appendChild(l);
      var i = document.createElement('input');
      i.type = 'text'; i.placeholder = ejemplo || '';
      i.style.cssText = 'width:100%';
      i.oninput = function () {
        var fx = datos(); if (!fx) return;
        if (!fx.neon) fx.neon = {};
        fx.neon[clave] = i.value;
        refrescar();
      };
      neon.appendChild(i);
      if (ayudita) {
        var h = document.createElement('div');
        h.textContent = ayudita;
        h.style.cssText = 'font-size:10.5px;opacity:.6;margin-top:2px;line-height:1.35';
        neon.appendChild(h);
      }
      return i;
    }

    var inPalabra = campoNeon('Palabra en neon', 'palabra', "LET'S",
      'La de arriba de todo, en imprenta gruesa.');
    var inScript = campoNeon('Palabra en cursiva', 'script', 'Party',
      'Va pisando a la de arriba. Vacia = no se dibuja.');
    var inBajada = campoNeon('Bajada, debajo del nombre', 'bajada', 'Mis XV anos',
      'Vacia = no se dibuja.');

    var labAlto = document.createElement('label');
    labAlto.textContent = 'Donde va el bloque';
    labAlto.style.cssText = 'display:block;font-size:11.5px;font-weight:600;margin:8px 0 3px';
    neon.appendChild(labAlto);
    var selAlto = document.createElement('select');
    selAlto.style.cssText = 'width:100%';
    [['centro', 'Centrado'], ['sube', 'Mas arriba']].forEach(function (o) {
      var op = document.createElement('option');
      op.value = o[0]; op.textContent = o[1];
      selAlto.appendChild(op);
    });
    selAlto.onchange = function () {
      var fx = datos(); if (!fx) return;
      if (!fx.neon) fx.neon = {};
      fx.neon.alto = selAlto.value;
      refrescar();
    };
    neon.appendChild(selAlto);

    var labColor = document.createElement('label');
    labColor.textContent = 'Color del neon';
    labColor.style.cssText = 'display:block;font-size:11.5px;font-weight:600;margin:8px 0 3px';
    neon.appendChild(labColor);
    var inColor = document.createElement('input');
    inColor.type = 'color';
    inColor.style.cssText = 'width:66px;height:28px;padding:0;border:0;background:none;cursor:pointer';
    inColor.oninput = function () {
      var fx = datos(); if (!fx) return;
      if (!fx.neon) fx.neon = {};
      fx.neon.color = inColor.value;
      refrescar();
    };
    neon.appendChild(inColor);

    /* ⚠ no se pisa lo que Jazmin esta escribiendo: pintar() corre cada 700 ms,
       asi que el campo con el foco no se reescribe. */
    function pintarNeon() {
      var fx = datos() || {};
      var esNeon = String(fx.coleccion || '') === 'disco-neon';
      neon.style.display = esNeon ? 'block' : 'none';
      if (!esNeon) return;
      var n = fx.neon || {};
      var act = document.activeElement;
      if (act !== inPalabra) inPalabra.value = (n.palabra != null) ? n.palabra : '';
      if (act !== inScript)  inScript.value  = (n.script  != null) ? n.script  : '';
      if (act !== inBajada)  inBajada.value  = (n.bajada  != null) ? n.bajada  : '';
      selAlto.value = (String(n.alto || 'centro').toLowerCase() === 'sube') ? 'sube' : 'centro';
      inColor.value = /^#[0-9a-fA-F]{6}$/.test(String(n.color || '')) ? n.color : '#EAF4FF';
    }

    /* los dos avisos: la paleta y la tipografía */
    function hacerAviso() {
      var e = document.createElement('div');
      e.style.cssText = 'font-size:11px;line-height:1.45;margin-top:7px;padding:8px 10px;' +
        'border-radius:7px;background:rgba(190,150,60,.13);display:none';
      caja.appendChild(e);
      return e;
    }
    var avPaleta = hacerAviso();
    var avTipo   = hacerAviso();

    function enlace(e, texto, alTocar) {
      var u = document.createElement('u');
      u.textContent = texto;
      u.style.cssText = 'cursor:pointer;white-space:nowrap';
      u.onclick = alTocar;
      e.appendChild(document.createTextNode(' '));
      e.appendChild(u);
    }

    sel.onchange = function () {
      var d = borrador(); if (!d) return;
      var fx = datos(); if (!fx) return;
      caja.dataset.tocado = '1';

      var c = deId(sel.value);
      fx.coleccion = c.id;                 /* ⚠️ vacío, NO borrar la clave */

      avPaleta.style.display = 'none';
      avTipo.style.display = 'none';

      if (c.id) {
        /* ---- 1. la paleta ---- */
        var actual = idDePaleta(fx);
        if (!c.paleta) {
          /* ⚠ la coleccion trae su propia paleta adentro: no propone ninguna.
             Sin esta guarda se escribia `fx.paleta = {id:null}` y el selector
             de paletas se quedaba sin id que leer. */
        } else if (!actual || actual === c.paleta) {
          fx.paleta = { id: c.paleta };    /* ⚠️ objeto, no texto */
        } else {
          avPaleta.textContent = 'Esta colección está diseñada para la paleta ' +
            c.paletaNombre + ', y esta invitación tiene otra. Podés dejarla así, ' +
            'pero puede no verse como la muestra.';
          enlace(avPaleta, 'Usar la paleta de la colección', function () {
            var f2 = datos(); if (!f2) return;
            f2.paleta = { id: c.paleta };
            avPaleta.style.display = 'none';
            refrescar();
          });
          avPaleta.style.display = 'block';
        }

        /* ---- 3. los textos de la portada de neon ----
           Se siembran con lo de la muestra para que al elegirla se vea igual
           que en el catalogo. Jazmin los cambia o los vacia. */
        if (c.id === 'disco-neon') {
          if (!fx.neon) fx.neon = {};
          if (fx.neon.palabra == null) fx.neon.palabra = "LET'S";
          if (fx.neon.script  == null) fx.neon.script  = 'Party';
          if (fx.neon.bajada  == null) fx.neon.bajada  = 'Mis XV años';
          if (!fx.neon.alto)  fx.neon.alto  = 'centro';
          if (!fx.neon.color) fx.neon.color = '#EAF4FF';
        }

        /* ---- 2. la tipografía de los nombres ----
           No se pisa. Se ofrece. Ver la nota grande de arriba. */
        if (d.nfont && String(d.nfont).trim()) {
          avTipo.textContent = 'Los nombres tienen una tipografía elegida a mano, ' +
            'así que la colección no los toca. En la muestra van en serif fina y ' +
            'mayúsculas.';
          enlace(avTipo, 'Usar la tipografía de la colección', function () {
            var d2 = borrador(); if (!d2) return;
            d2.nfont = '';                 /* ⚠️ vacío, NO borrar: se guarda con merge */
            d2.nsize = '';
            avTipo.style.display = 'none';
            refrescar();
          });
          avTipo.style.display = 'block';
        }
      }

      pintar(true);
      refrescar();
    };

    /* dibuja el selector y la ayuda según lo que dice HOY el borrador */
    function pintar(soloAyuda) {
      var fx = datos() || {};
      var c = deId(fx.coleccion || '');
      if (!soloAyuda) sel.value = c.id;
      ayuda.textContent = c.ayuda;
      pintarNeon();
    }

    caja.pintar = pintar;
    pintar();
    return caja;
  }

  function revisar() {
    var d = borrador();
    if (!d) return;
    var m = document.querySelector('.mejoras');
    if (!m) return;

    var caja = document.getElementById(ID);
    if (caja) {
      if (!caja.dataset.tocado && caja.pintar) caja.pintar();
      return;
    }

    /* PRIMERO de todos los bloques: es la decisión que manda sobre las demás */
    caja = construir();
    m.insertBefore(caja, m.firstChild);
  }

  var n = 0;
  var t = setInterval(function () {
    if (borrador() || document.querySelector('.mejoras')) {
      clearInterval(t); setInterval(revisar, 700); revisar();
    }
    if (++n > 60) clearInterval(t);
  }, 500);
})();
