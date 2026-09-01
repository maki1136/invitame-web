/* ===== LOS MÓDULOS DEL FRONT ==================================================

   Esta es LA LISTA. Cada mejora del front vive en su propio archivo dentro de
   /efectos/ y se enciende sumándola acá.

     · Para agregar una: crear /efectos/loquesea.js y sumar la línea.
     · Para apagarla: borrar o comentar la línea. Nada más.

   Los archivos se cargan con `defer`, así que no frenan la carga de la
   invitación, y cada uno se ocupa de no hacer nada si no le toca.

   Quién carga este archivo:
     · la invitación (/i/) y /prueba/admin.html, vía `sobres/catalogo.js`;
     · el admin de PRODUCCIÓN (/admin.html), vía `firebase-inv.js`.
   Por eso sumar cosas nuevas nunca obliga a tocar los HTML grandes
   (index.html y admin.html, de 144-200 KB, que sólo se suben a mano).

   ⚠️ Este archivo lo tocan varias manos. Antes de sobrescribirlo, LEERLO:
   aparecieron módulos puestos por otro lado. Nunca reescribirlo de memoria:
   bajarlo, agregar la línea y subirlo.

   ★★★★★ TODA FUNCIÓN TIENE QUE ESTAR EN EL PANEL ★★★★★  (1/9/2026)
      Maki, dicho tres veces ya: «recordate que todos tienen que estar en el
      panel para que Jazmín lo pueda modificar y pueda verlo y funcionando
      todo, ¿no? Obvio».
      Una función que sólo se prende escribiendo `fx` en la base a mano es, para
      quien usa el panel, UNA FUNCIÓN QUE NO EXISTE. Pasó con el interruptor de
      la confirmación (semanas), y volvió a pasar con la raspadita y las
      disposiciones de fecha (Maki las reportó como bugs: «la raspada viene ya
      raspada», «iban solamente los círculos»).
      → Un módulo nuevo no está terminado hasta que tiene su `panel-*.js`.
      → Y el bloque del panel tiene que AVISAR de las combinaciones que rompen,
        no dejar que el que edita las descubra en la invitación.

   ★★★ LO QUE SE CARGA ADENTRO DE UNA CAJA DE 0 PX SE DIBUJA EN 0×0 ★★★ (1/9/2026)
      Los tres "Ver mapa" y "Ver inspiración" abrían y adentro había un
      rectángulo blanco vacío. La dirección estaba cargada y el iframe tenía su
      `src` bien puesto: mirando los datos y mirando el HTML no se veía nada.
      El acordeón arranca en `max-height:0` — CERO PÍXELES DE ALTO —, el
      navegador igual carga el iframe, Google Maps se dibuja en 0×0, y cuando
      el panel se abre adentro del iframe no hay nadie que se entere de que
      ahora hay lugar.
      → Lo arregla `/efectos/acordeon.js`: al abrir, le vuelve a poner el `src`.
      → La regla general: si algo se carga adentro de una caja de 0 px (un
        acordeón, un tab escondido, un carrusel), hay que RECARGARLO cuando se
        muestra. No alcanza con darle tamaño después.
      ⚠️ Y la pista falsa: `getComputedStyle` devolvía `max-height: 0px`
         incluso con la clase `.open` puesta, mientras una copia del mismo nodo
         pegada en otro lado medía 560px. Parecía un problema de CSS y no lo era.

   ★★★ LA VIDRIERA: LO QUE SE ESCONDE SIN LINK DE INVITADO ★★★  (1/9/2026)
      Si la invitación se abre SIN `INVDATA.token`, el motor entra en modo
      vidriera y esconde el formulario de confirmación y el pase con QR, y
      reemplaza la frase de la sección por «Esta es una muestra…».
      Para una invitación entregada está bien. Para LA MUESTRA que se le manda
      a alguien que todavía no compró, no: ahí la confirmación es justo lo que
      hay que mostrar. Maki: «no me pongas un cartelito».
      → Lo resuelve `/efectos/rsvp-muestra.js`, con su interruptor en el panel.
      → Sólo actúa en vidriera: con link de invitado real no toca nada, así que
        dejarlo prendido en una invitación entregada no rompe nada.

   ★★★ LAS COLECCIONES ★★★  (31/8/2026)
      `/colecciones/*.js` es otra cosa que `/efectos/*.js`, aunque se carguen
      desde la misma lista.
      · Un EFECTO es una perilla suelta: la paleta, el material de los botones,
        el fondo, la galería. Jazmín las combina.
      · Una COLECCIÓN es UNA decisión que trae TODO junto —tipografía, aire,
        bandas de color, paleta, motivo— copiada de una referencia que mandó
        Maki. Jazmín elige "Perlas" y no arma nada más.
      Cada referencia nueva = un archivo nuevo en /colecciones/. No se pisan.

      ⚠️ UNA COLECCIÓN DISFRAZA EL MOTOR. NO DIBUJA UNA INVITACIÓN NUEVA.
         Palabras de Maki: «la idea es no romper nada, que puedas seguir con
         las plantillas como venimos, pero disfrazarlas».
         Es una hoja de estilos y unos pocos movimientos de nodos, todo
         reversible. No se toca index.html, no se pierde ninguna función, y las
         invitaciones ya entregadas no se enteran.
         Lo que NO puede hacer una colección: partir una sección en dos o
         inventar una que el motor no tenga. Si hace falta eso → avisarle a
         Maki, NO improvisar.

      ★★★ Y SE COPIA MIRANDO LA MUESTRA, OBJETO POR OBJETO ★★★  (1/9/2026)
         Maki: «tu problema es que no ves la muestra. Tendrías que ver la
         muestra, pensar cómo adaptar todo a la nuestra, y cuando lo adaptás,
         VOLVER a la muestra a ver si tiene algo que ver. Porque si ves que la
         bandeja de plata tiene una frase arriba, adiviná dónde tendría que
         estar en nuestra invi».
         Lo que se había hecho mal: mirar la referencia UNA vez, sacar reglas
         abstractas (tipografía, aire, bandas) y después colocar las piezas por
         regla, sin volver. Resultado, textual: «está puesto así por poner».
         El idioma de esa referencia era: **cada objeto SOSTIENE un texto**.
         → Antes de colocar una pieza: buscarla en la muestra, ver qué
           sostiene, buscar la sección nuestra que dice lo mismo, y MIRARLO en
           el navegador antes de subirlo. Si no hay sección que diga lo mismo,
           no se pone.

      Ficha de lectura de las referencias, prompts de las fotos y las trampas:
      skill `invitame-plantillas`.

   ★★★ LAS PIEZAS FOTOGRAFIADAS ★★★  (31/8/2026, ampliado 1/9/2026)
      `/colecciones/pieza-*.js` y `/efectos/perla.js` no dibujan nada: son
      MATERIAL. Cada uno deja una foto como data URI en un global
      (`window.INVPERLA`, `window.INVPIEZAS.*`) y las colecciones las usan.
      Generadas en Flow por Maki.

      ⚠️ TRES TRATAMIENTOS DISTINTOS, SEGÚN CÓMO SE APOYA LA PIEZA:
        1. RECORTAR con alfa — lo que tiene que flotar sobre CUALQUIER fondo
           (broche, dije, perla). Se pide sobre GRIS para poder recortarlo.
        2. DIFUMINAR — lo que vive adentro de una sección clara (bandeja,
           sobre, moño). Se pide sobre PAPEL MARFIL, no se recorta, y se
           disuelve con `mask-image` en el borde.
        3. MULTIPLICAR — lo que se apoya sobre papel de COLOR y tiene que
           andar en las 20 paletas (collar). El archivo no lleva alfa: se
           divide el papel por su propio color hasta dejarlo blanco puro, y en
           el navegador va con `mix-blend-mode: multiply`. El blanco no pinta
           nada y quedan sólo el objeto y su sombra, tomando el tono de la
           sección. Es el más robusto de los tres.
           ⚠️ Con multiply, `opacity` baja NO hace la pieza más sutil: la hace
              GRIS. Para que sea más discreta, achicarla.
           ⚠️ Y multiply no puede ACLARAR: un brillo más claro que la sección
              se recorta. Se acepta a cambio de conservar la sombra.

      ⚠️ AL AGREGAR UNA PIEZA NUEVA: base64 en bloques de 4.000 y VERIFICAR con
         suma de control. Llegó un archivo con caracteres cambiados en el medio
         que decodificaba al tamaño exacto y con cabecera RIFF válida: el
         tamaño y la cabecera NO alcanzan.

      ⚠️ UNA FOTO CHICA REPETIDA MUCHAS VECES SE LEE COMO DIBUJO. La guirnalda
         hecha repitiendo UNA perla recortada la vio Maki enseguida: «se nota
         que están dibujadas». El ojo ve el patrón —todas idénticas, mismo
         brillo, misma orientación— y no la perla. La perla repetida sirve en
         CHICO (el hilo entre secciones, la línea del programa, los corazones);
         para una pieza protagonista hace falta la foto del objeto entero.

   ★★★ SE TRABAJA EN PRODUCCIÓN, NO EN LA ZONA DE PRUEBA ★★★
      Regla de Maki, dicha más de una vez y con razón:
      «la zona de prueba es al pedo porque después pasa esto siempre; probá
       directo en el original».

      El caso que lo demostró (30/8/2026): los bloques del panel —paletas,
      botones, el fondo— estaban hechos, probados y "andando"… en
      /prueba/admin.html. En el admin de VERDAD no aparecían, y nadie se dio
      cuenta durante semanas: /prueba/admin.html carga `sobres/catalogo.js` y
      /admin.html no lo cargaba. Trabajo hecho dos veces por probar en el lugar
      equivocado.

      Entonces:
      · el admin es  https://invitame.littlemomentsok.com/admin.html
      · la muestra es `camila-y-tomas`
      · /prueba/ NO se usa para dar nada por verificado. Si algo anda ahí y no
        se probó en producción, NO está listo.

   ★★★ Y SE PRUEBA DESDE EL PANEL, COMO JAZMÍN ★★★
      El interruptor de la confirmación estaba hecho y verificado… pero la
      única forma de prenderlo era escribir `fx.rsvp.estilo` en la base a mano.
      Para quien usa el panel, la función NO estaba.

      Antes de decir que algo está listo:
      1. ¿se ve en la invitación?  (mirar, no medir solamente)
      2. ¿se puede prender y apagar DESDE EL PANEL, sin tocar la base?

      ⚠️ Para operar el panel desde la consola: "Guardar y publicar" llama a
         `publicar()`, que abre un `confirm()` nativo — y un cartel nativo
         CONGELA la página. Hay que pisar `window.confirm` antes y llamar a
         `publicar()` directo, no clickear. Detalle en la skill
         `invitame-flujo-ingenieria`.

      Dónde es cada cosa:
      · /admin.html  → el panel de edición. El único con `.mejoras`, que es
        donde se montan estos bloques. Escribe con `INV.saveEvento` (con merge).
      · /crear.html  → el formulario de alta. NO escribe `fx`.
      · /mi-panel.html → el panel de los novios (slug + clave).
      · /panel.html  → el tablero de métricas.

   ★★ LA MUESTRA OFICIAL ES `camila-y-tomas` — Y ES MEXICANA ★★
      https://invitame.littlemomentsok.com/i/?e=camila-y-tomas
      Todo lo nuevo se prueba y se mira AHÍ antes de mostrárselo a Maki.
      Es la más cargada de todas: 90 campos con contenido de verdad.
      ⚠️ Es la PRIMERA muestra real del sistema nuevo: se la va a ver gente que
         todavía no compró. Todo tiene que estar en español de México y con
         lugares de México — la boda es en Playa del Carmen. Quedaron
         direcciones de Uruguay dando vueltas durante semanas y nadie las vio.
      ⚠️ El evento llamado `muestra` NO es la muestra. Está marcado "NO USAR".

   ★ EL VOSEO YA NO SE PARCHEA: SE ESCRIBE BIEN DE ENTRADA (30/8/2026)
      Se borró `es-mx.js`, que traducía DESPUÉS de dibujar con un
      MutationObserver sobre todo el documento. Ya no hace falta:
        · el MOTOR lo traduce el servidor (`i/index.php` + `i/textos-es-mx.php`);
        · los MÓDULOS ya escriben en español de México;
        · los DATOS de 4 invitaciones se corrigieron.

      ⚠️ AL ESCRIBIR UN MÓDULO NUEVO: los textos van en español de México. Lo
         que escribe un módulo NO pasa por el traductor del servidor.
      ⚠️ Y LOS TÍTULOS EN ESPAÑOL SON MÁS LARGOS: `PROGRAM` mide la mitad que
         `CÓMO VA A SER EL DÍA`. Los tamaños van con `clamp()`. Nunca acortar
         el texto del cliente para que entre.

   ★ LAS COSAS DIBUJADAS CON CSS NO REEMPLAZAN A UNA FOTO (31/8/2026)
      Las perlas del motivo estaban hechas con gradientes. Se veían "de
      dibujito" y Maki lo dijo sin vueltas. Un objeto fotografiado —una perla,
      un lacre, un moño— tiene microrrelieve y nácar que el CSS no imita.
      El CSS sigue siendo la herramienta correcta para superficies (papel,
      terciopelo, el velo del fondo) y para LÍNEAS (la cadena del dije), no
      para objetos.

   ★ !important NO ALCANZA PARA GANARLE A UN MÓDULO (1/9/2026)
      La colección se inserta ANTES que casi todos los módulos. Si su regla
      tiene la MISMA especificidad que la del módulo y las dos son !important,
      desempata el orden y gana el módulo. Pasó con `inv-fondo-css`, que pinta
      `html[data-fondo] .sec.verde` y dejaba la sección verde aunque la regla
      de la colección estuviera bien escrita.
      → Repetir el atributo o la clase: `[data-col-lugar][data-col-lugar]`
        sube la especificidad sin depender de nada del motor.
      → Y la única forma de darse cuenta es MIRAR LA PÁGINA, no el código.

   ★ NO COLGAR NADA DE `window.INVEV` (31/8/2026)
      `INVEV` es el OBJETO DE DATOS DEL EVENTO: el motor lo REEMPLAZA entero
      cuando llega la invitación desde Firestore, y se lleva puesto cualquier
      agregado, sin error ni aviso. La perla se perdió así en la primera vuelta
      y la guirnalda salía con los gradientes de respaldo.
      Los materiales van en su propio global —`window.INVPALETAS`,
      `window.INVPERLA`, `window.INVPIEZAS`—. De `INVEV` sólo se LEE `fx`.

   ★ EN LOS BLOQUES DEL PANEL, NO GUARDARSE `D.fx` AL CONSTRUIR (31/8/2026)
      El bloque se arma a los ~500 ms, ANTES de que cargue el evento. Cuando el
      evento llega, el panel REEMPLAZA `D.fx` por el objeto de Firestore y la
      referencia guardada antes queda huérfana: los selectores se mueven, la
      vista previa se refresca… y no guarda nada. Parece andar y no anda.
      → `datos()` se llama de nuevo adentro de cada `onchange`, y los
        selectores se re-sincronizan desde `D` mientras nadie los haya tocado.

   ★ NUNCA GUARDAR UNA COPIA DEL HTML PARA "DESHACER" (31/8/2026)
      La colección guardaba `h1.innerHTML` antes de tocarlo, para restaurarlo.
      Resultado: la invitación mostraba "María & Diego", los nombres de la BODA
      DE EJEMPLO. El motor dibuja primero el ejemplo y recién después pone los
      datos del cliente; la copia se tomaba con el ejemplo adentro.
      → Deshacer se hace SIEMPRE mirando el DOM de AHORA.

   ⚠️ EL ORDEN IMPORTA en veintidós casos:
   · `paleta.js` va PRIMERO: deja puestos los colores antes de que se pinte
     nada, así no se ve el salto desde los colores por defecto.
   · `panel-paleta.js` va DESPUÉS de `paleta.js`: el selector arma las tarjetas
     leyendo la lista de window.INVPALETAS, que la publica paleta.js.
   · `botones.js` va DESPUÉS de `paleta.js`: cada material se pinta con las
     variables de color de la paleta.
   · `panel-botones.js` va DESPUÉS de `botones.js`.
   · `rsvp-interruptor.js` va DESPUÉS de `botones.js`.
   · `panel-rsvp.js` va DESPUÉS de `rsvp-interruptor.js`: escribe fx.rsvp.estilo.
   · `rsvp-muestra.js` NO tiene orden: sólo actúa si no hay link de invitado y
     se vuelve a pasar solo cada 400 ms.
   · `panel-muestra.js` va DESPUÉS de `panel-rsvp.js`: se monta justo debajo de
     ese bloque, porque habla de lo mismo.
   · `panel-fecha.js` va DESPUÉS de `panel-muestra.js`, por la misma razón.
   · `fondo-invitacion.js` va DESPUÉS de `paleta.js`: el velo se tiñe con el
     papel de la paleta.
   · `panel-fondo.js` va DESPUÉS de `fondo-invitacion.js`.
   · `itinerario-momentos.js` va ANTES de `itinerario.js`.
   · `fecha.js` va ANTES de `raspadita.js`: la raspadita se monta encima.
   · `panel-galeria.js` va DESPUÉS de `galeria.js`.
   · `perla.js` va ANTES de `motivo.js`: le deja la foto en `window.INVPERLA`.
     No dibuja nada; es sólo el material. Si falta, motivo.js cae en las perlas
     de gradiente y no se rompe.
   · `motivo.js` va ÚLTIMO de los que dibujan: cuelga las perlas del marco y de
     los separadores, así que necesita que las secciones ya estén puestas. Y va
     después de `paleta.js` porque el broche se pinta con sus colores.
   · `panel-motivo.js` va DESPUÉS de `motivo.js`: escribe fx.motivo.
   · `colecciones/pieza-*.js` van ANTES de `colecciones/perlas.js`: son el
     material que la colección coloca. Si falta alguno, la colección no lo
     coloca y no se rompe nada.
   · `dresscode-colores.js` va DESPUÉS de `paleta.js`: cuando los colores son
     automáticos los lee de las variables de la paleta, en vivo. Y DESPUÉS de
     `colecciones/perlas.js`, porque uno de los dos disparadores es que haya
     una colección puesta (la marca `data-coleccion` en el html).
   · `panel-dresscode.js` va DESPUÉS de `panel-coleccion.js`: se monta justo
     debajo de ese bloque.
   · `colecciones/perlas.js` va AL FINAL DE LOS QUE DIBUJAN: manda sobre los
     demás. Cambia la tipografía y el aire de secciones que escriben los otros
     módulos, así que necesita que ya estén puestas. Igual se vuelve a pasar
     sola cada 400 ms por si aparece algo nuevo.
   · `panel-coleccion.js` va DESPUÉS de `panel-paleta.js`: al elegir colección
     propone la paleta que le corresponde, y para eso el selector de paletas
     tiene que existir.
   · `acordeon.js` NO tiene orden: se cuelga del click y no depende de nadie.
   ============================================================================ */
(function () {
  var MODULOS = [
    '/efectos/paleta.js',              /* la paleta: pinta las 12 variables de color de una */
    '/efectos/panel-paleta.js',        /* y el selector de las 20, en el panel */
    '/efectos/botones.js',             /* el material de los botones: lacre, cristal, nácar… */
    '/efectos/panel-botones.js',       /* y su selector, debajo del de paletas */
    '/efectos/rsvp-interruptor.js',    /* el sí/no de la confirmación, como interruptor */
    '/efectos/panel-rsvp.js',          /* y el selector para volver a los dos botones */
    '/efectos/rsvp-muestra.js',        /* la muestra: la confirmación y el pase, sin invitado */
    '/efectos/panel-muestra.js',       /* y su interruptor, con el invitado de ejemplo */
    '/efectos/fondo-invitacion.js',    /* imagen o video en lugar del papel de la invitación */
    '/efectos/panel-fondo.js',         /* y su bloque en el panel, con el subidor */
    '/efectos/itinerario-momentos.js', /* carga los momentos reales del itinerario */
    '/efectos/itinerario.js',          /* y la línea se dibuja con el scroll */
    '/efectos/calendario.js',          /* el calendario del mes con la fecha marcada */
    '/efectos/fecha.js',               /* las nueve maneras de mostrar la fecha */
    '/efectos/raspadita.js',           /* la raspadita: se monta sobre la fecha */
    '/efectos/panel-fecha.js',         /* y las dos, por fin, en el panel */
    '/efectos/encuadre-monitor.js',    /* en compu: todo en una columna */
    '/efectos/pieza-carta.js',         /* escribe los nombres sobre la tarjeta del sobre */
    '/efectos/panel-pieza.js',         /* y sus ajustes dentro del bloque ✨ Efectos */
    '/efectos/panel-etiquetas.js',     /* nombres únicos en el panel */
    '/efectos/imagen-cierre.js',       /* el "¡Gracias!" del final iba sobre una foto de stock */
    '/efectos/musica.js',              /* la Platinum vende Música y el motor no la tenía */
    '/efectos/wa-flotante.js',         /* el flotante de WhatsApp iba a wa.me/ sin número */
    '/efectos/textos-largos.js',       /* hoteles y vestimenta: se pliegan con "Ver más" */
    '/efectos/acordeon.js',            /* los "Ver mapa" abrían en blanco: recarga los iframes */
    '/efectos/galeria.js',             /* la galería de fotos de invitados (fx.galeria) */
    '/efectos/panel-galeria.js',       /* y sus campos en el panel (prender, código, QR) */
    '/efectos/perla.js',               /* el material: una perla de verdad, recortada (3.3 KB) */
    '/efectos/motivo.js',              /* el motivo que recorre todo: por ahora, las perlas */
    '/efectos/panel-motivo.js',        /* y su bloque en el panel, para prenderlo y graduarlo */

    /* ---- EL MATERIAL: fotos generadas en Flow ---- */
    '/colecciones/pieza-broche.js',    /* RECORTADO sobre gris · cierra el hilo del programa */
    '/colecciones/pieza-dije.js',      /* RECORTADO sobre gris · cuelga de la cuenta regresiva */
    '/colecciones/pieza-bandeja.js',   /* DIFUMINADO · el marco de la tarjeta del lugar */
    '/colecciones/pieza-sobre.js',     /* DIFUMINADO · la carta */
    '/colecciones/pieza-mono.js',      /* DIFUMINADO · el soporte de la tarjeta de contacto */
    '/colecciones/pieza-collar.js',    /* MULTIPLICADO · el collar que cruza la invitación */

    /* ---- LAS COLECCIONES: una decisión que trae todo junto ---- */
    '/colecciones/perlas.js',          /* copia de la referencia de Maki: serif fina, aire, perlas */
    '/efectos/panel-coleccion.js',     /* y el selector con el que Jazmín la elige */

    '/efectos/dresscode-colores.js',   /* los colores de la boda, en círculos, en Vestimenta */
    '/efectos/panel-dresscode.js'      /* y el editor para elegirlos a mano */
  ];

  MODULOS.forEach(function (src) {
    if (document.querySelector('script[src="' + src + '"]')) return;
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  });
})();
