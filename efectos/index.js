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

   ★★★★★ ANTES DE ESCRIBIR CÓDIGO, MIRAR SI ES UN DATO ★★★★★  (3/9/2026)
      Maki señaló la sección de la carta en la muestra: «el sobre que quedó
      verde, no entiendo por qué está ahí con esa frase "confirma con alegría"
      sin ningún botón». Parecían tres bugs. Medido en la invitación en vivo,
      eran tres CAMPOS mal cargados y un solo problema de código:

        · «no tiene botón» → no faltaba nada: esa sección es la CARTA
          (`#carta-sec`), no la confirmación. El RSVP existe y anda, más abajo.
        · el título equivocado → el dato `cfTitulo`, cargado con "Confirma tu
          lugar", que es el texto del RSVP.
        · el sobre verde → el dato `fx.carta.sobreColor` = `#a8bda4`. El
          recoloreo ya existía; estaba puesto el verde de la colección Oliva.
        · lo único de código → el ORDEN: la carta iba después del pase con QR
          en vez de abajo del collar. Eso sí es un módulo
          (`/efectos/carta-perlas.js`).

      → Cuando algo "se ve roto", lo primero es leer los campos que lo pintan.
        Un rato en la consola mirando `INVEV` evita escribir un módulo entero
        para arreglar algo que se corrige tipeando en el panel.
      → Y al revés: un campo que sólo se puede corregir a mano en la base es,
        para Jazmín, un campo roto. Todo lo que se cargue mal tiene que poder
        corregirse desde el panel.

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

      ★ EL CASO MÁS CARO DE TODOS: EL ITINERARIO  (3/9/2026)
        `itinerario-momentos.js` sabía escribir los momentos de verdad desde
        `fx.itinerario.momentos` desde hacía rato… pero NO HABÍA DÓNDE
        CARGARLOS. Había que escribir el array en la base a mano.
        Consecuencia: las invitaciones terminaban subiendo el itinerario como
        una IMAGEN. Una foto no se anima, no se lee en pantalla chica, no la
        traduce el servidor y hay que rehacerla si se corre un horario.
        O sea que la falta de un bloque en el panel no dejó una función
        apagada: empujó a todo el mundo a la peor solución posible.
        → Lo arregla `/efectos/panel-itinerario.js`.

      ★ LA EXCEPCIÓN: LOS RETOQUES DE UNA COLECCIÓN  (3/9/2026)
        `/efectos/perlas-ajustes.js` y `/efectos/regalo-perlas.js` no tienen
        bloque en el panel, y está bien: no son perillas, son DISEÑO de la
        colección Perlas —el tamaño de las fotos de personas, el cuerpo de la
        frase, el papel de una banda, el motivo de la mesa de regalos—.
        Igual que `carta-perlas.js` y `itinerario-perlas.js`. Lo que Jazmín
        elige es la colección; lo de adentro es diseño, no configuración.

   ★★★★★ Y HAY QUE SEGUIR EL HILO HASTA LA PANTALLA ★★★★★  (2/9/2026)
      El sobre de entrada tenía TODO puesto —seis videos en el repo, el
      catálogo, el selector en el panel— y no se veía ninguno. Dos cortes
      distintos en el mismo hilo:

        1. El selector del panel estaba VACÍO (ver la nota de la lista vacía).
        2. El motor ni miraba el dato: `i/index.html` tiene
           `if (CONFIG.sobreTriangulos) initEnvTri(); else initEnvVideo();`
           con `sobreTriangulos: true` **escrito a mano adentro del motor**.
           Siempre abría con el sobre de triángulos.

      Ninguno de los dos daba error. Simplemente no pasaba nada, y «no pasa
      nada» se confunde con «todavía no lo configuraron».

      → Una función no está lista cuando el código existe: está lista cuando se
        sigue el camino ENTERO —dato guardado → panel que lo muestra → motor
        que lo lee → pantalla— y se mira el resultado.
      → Lo reconecta `/efectos/sobre-catalogo.js`, sin tocar el motor.

   ★★★★ UNA LISTA VACÍA EN EL PANEL ES UN BUG, NO UN VACÍO ★★★★  (2/9/2026)
      El selector «Sobre del catálogo» de ✨ Efectos tenía UNA sola opción:
      «— Elegí un sobre —». O sea que desde el panel **no se podía elegir
      ningún sobre de entrada**, y nadie lo notó porque una lista vacía no
      parece un error: parece que no hay nada cargado.

      La causa: el admin hace, arriba de todo y una sola vez,
          const SOBRES = window.SOBRES_INVITAME || {};
      Eso corre cuando el navegador lee el script del HTML, y `catalogo.js`
      llega DESPUÉS. `SOBRES` queda congelado en `{}` — es una copia, no una
      referencia — y ningún `renderPanel()` posterior la vuelve a mirar.

      → `const X = window.Y || {}` al principio de un archivo CONGELA el valor.
        Si `Y` lo publica otro script que llega después, X queda vacío para
        siempre y no hay ningún error en la consola.
      → Lo arregla `/efectos/panel-sobre.js`, que llena el select leyendo el
        catálogo en el momento.
      → Y la regla de revisión: **cada lista del panel se abre y se cuenta.**
        Si tiene menos opciones de las que debería, es un bug.

   ★★★★ LA MUESTRA NO ES UNA DEMO: ES UN VENDEDOR ★★★★  (1/9/2026)
      Maki: «tenemos que tener en cuenta que estas muestras van a estar
      colgadas en la web y se las enviamos a los clientes como muestras así que
      están por todos lados para vender».
      Una invitación de muestra tiene que hacer DOS cosas que una entregada no
      hace, y cada una tiene su interruptor en el «Sector de muestras» del
      panel:
        · MOSTRARSE ENTERA — la confirmación y el pase con QR funcionando, con
          un invitado inventado (`/efectos/rsvp-muestra.js`).
        · VENDER — los botones de contacto y el WhatsApp verde flotante van al
          número de ventas de Invítame, y abajo de todo aparece «¿Quieres la
          tuya?» con el mensaje ya escrito (`/efectos/muestra-venta.js`).
      → Los dos se plantan si hay link de invitado. Una invitación de un
        cliente real JAMÁS muestra el número de Invítame ni el llamado.
      → El teléfono de ventas es el mismo que atiende invitameok.com. Si algún
        día se separa el número de ventas del de planners, se cambia en el
        panel, no en el código.

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

      ⚠️ EL ATAJO `background:` BORRA LA TEXTURA  (3/9/2026)
         La colección escribía `html[data-coleccion="perlas"] .fraseSec
         { background: var(--lino) }`. `background` es un ATAJO: al escribirlo
         pone `background-image: none`. Resultado: esa sección perdía el papel
         de lino que sí tienen las demás claras, y quedaba una **franja blanca
         plana** con el collar de perlas colgado, separado del resto. Jazmín lo
         marcó con un círculo verde en el WhatsApp.
         → Si sólo se quiere el color, se escribe `background-color`.
         → Lo corrige `/efectos/perlas-ajustes.js` devolviéndole la textura.

      ★★★ Y SE COPIA MIRANDO LA MUESTRA, OBJETO POR OBJETO ★★★  (1/9/2026)
         Maki: «tu problema es que no ves la muestra. Tendrías que ver la
         muestra, pensar cómo adaptar todo a la nuestra, y cuando lo adaptás,
         VOLVER a la muestra a ver si tiene algo que ver».
         Lo que se había hecho mal: mirar la referencia UNA vez, sacar reglas
         abstractas y después colocar las piezas por regla, sin volver.
         Resultado, textual: «está puesto así por poner».
         El idioma de esa referencia era: **cada objeto SOSTIENE un texto**.

         ★ Y VOLVIÓ A PASAR CON EL SOBRE  (3/9/2026). Maki mandó un video del
           sobre abriéndose POR ARRIBA; se diseñó la apertura mirando la FOTO
           FIJA —que tiene los dobleces en X— y salió abriéndose de costado.
           Textual: «¿qué criterio estás usando para eso?».
           → La foto sirve para sacar el MATERIAL. El MOVIMIENTO sale del
             video. Y antes de mostrar algo que tiene referencia, se abre la
             referencia al lado y se comparan.

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
              se recorta. Por eso el sobrecito marfil de la frase, que estaba
              en multiply sobre papel marfil, directamente no se veía: no
              tenía con qué oscurecer. Se pasó a mezcla normal.

      ⚠️ AL AGREGAR UNA PIEZA NUEVA: base64 en bloques de 4.000 y VERIFICAR con
         suma de control. Llegó un archivo con caracteres cambiados en el medio
         que decodificaba al tamaño exacto y con cabecera RIFF válida: el
         tamaño y la cabecera NO alcanzan.

      ⚠️ UNA FOTO CHICA REPETIDA MUCHAS VECES SE LEE COMO DIBUJO. La guirnalda
         hecha repitiendo UNA perla recortada la vio Maki enseguida: «se nota
         que están dibujadas». La perla repetida sirve en CHICO (el hilo entre
         secciones, la línea del programa); para una pieza protagonista hace
         falta la foto del objeto entero.
         ★ Y ESE MISMO DEFECTO, EN CHICO, ES UNA HERRAMIENTA (4/9/2026). Maki:
           «poné algo con perlas, tipo un regalo con perlas, DIBUJADO, como
           hiciste con los corazones». Los corazones y el regalo son eso: la
           perla repetida sobre un recorrido, chica, leyéndose como dibujo a
           propósito. → `/efectos/regalo-perlas.js`.

   ★★★ LOS ARCHIVOS PESADOS NO LOS PUEDO SUBIR YO ★★★  (2/9/2026)
      Los videos de sobre y las fotos van a `/sobres/` y `/colecciones/` como
      archivos de verdad. Un asistente que trabaja por la API de GitHub NO
      puede subirlos: esa API escribe TEXTO, y el puente del navegador corta
      los envíos largos sin avisar (medido: 44.000 caracteres entraron como
      6.610). Un binario mandado así llega corrupto y no se nota hasta que el
      video no reproduce.
      → Los binarios los sube Maki, arrastrándolos a GitHub. Que sea UNA sola
        vez, con los archivos ya listos en una carpeta y la página abierta.
      → Todo lo demás —el catálogo, los módulos, los datos— sí se hace solo.
      → Y antes de pedirle que suba algo: mirar si el material YA ESTÁ. El
        sobre de anillos se abre con el `poster` que ya estaba en el repo, y el
        regalo de la mesa se dibuja con la perla que ya estaba.
      → Detalle completo: skill `no-pasarle-trabajo-manual-a-maki`.

   ★★★ SE TRABAJA EN PRODUCCIÓN, NO EN LA ZONA DE PRUEBA ★★★
      Regla de Maki: «la zona de prueba es al pedo porque después pasa esto
      siempre; probá directo en el original».

      El caso que lo demostró (30/8/2026): los bloques del panel estaban
      hechos, probados y "andando"… en /prueba/admin.html. En el admin de
      VERDAD no aparecían: /prueba/admin.html carga `sobres/catalogo.js` y
      /admin.html no lo cargaba. Trabajo hecho dos veces.

      Entonces:
      · el admin es  https://invitame.littlemomentsok.com/admin.html
      · la muestra es `camila-y-tomas`
      · /prueba/ NO se usa para dar nada por verificado.

   ★★★ Y SE PRUEBA DESDE EL PANEL, COMO JAZMÍN ★★★
      Antes de decir que algo está listo:
      1. ¿se ve en la invitación?  (mirar, no medir solamente)
      2. ¿se puede prender y apagar DESDE EL PANEL, sin tocar la base?
      3. ¿las listas del panel tienen TODAS sus opciones?
      4. ¿el MOTOR lee ese dato?

      ⚠️ Para operar el panel desde la consola: "Guardar y publicar" llama a
         `publicar()`, que abre un `confirm()` nativo — y un cartel nativo
         CONGELA la página. Hay que pisar `window.confirm` antes y llamar a
         `publicar()` directo, no clickear.

      Dónde es cada cosa:
      · /admin.html  → el panel de edición. El único con `.mejoras`, que es
        donde se montan estos bloques. Escribe con `INV.saveEvento` (con merge).
      · /crear.html  → el formulario de alta. NO escribe `fx`.
      · /mi-panel.html → el panel de los novios (slug + clave).
      · /panel.html  → el tablero de métricas.

   ★★ LA MUESTRA OFICIAL ES `camila-y-tomas` — Y ES MEXICANA ★★
      https://invitame.littlemomentsok.com/i/?e=camila-y-tomas
      Todo lo nuevo se prueba y se mira AHÍ antes de mostrárselo a Maki.
      ⚠️ Es la PRIMERA muestra real del sistema nuevo: se la va a ver gente que
         todavía no compró. Todo en español de México y con lugares de México.
      ⚠️ El evento llamado `muestra` NO es la muestra. Está marcado "NO USAR".

   ★ EL VOSEO YA NO SE PARCHEA: SE ESCRIBE BIEN DE ENTRADA (30/8/2026)
      Se borró `es-mx.js`. Ahora: el MOTOR lo traduce el servidor, los MÓDULOS
      escriben en español de México y los DATOS se corrigieron.
      ⚠️ Lo que escribe un módulo NO pasa por el traductor del servidor.
      ⚠️ Y LOS TÍTULOS EN ESPAÑOL SON MÁS LARGOS: `PROGRAM` mide la mitad que
         `CÓMO VA A SER EL DÍA`. Los tamaños van con `clamp()`.

   ★ LOS TAMAÑOS DEL MOTOR ESTÁN EN PÍXELES  (3/9/2026)
      Jazmín pidió «agrandar un poquito la tipografía de toda la invitación».
      No sirve subir la raíz del documento: casi nada está en `rem`, así que
      no lo hereda nadie. Hay que nombrar cada rol y medir primero cuál está
      realmente chico. Medido: el detalle del itinerario estaba en 13 px y su
      hora en 17, mientras los párrafos ya estaban en 22.
      → Lo hace `/efectos/perlas-ajustes.js`, con los números a la vista.

   ★ LAS COSAS DIBUJADAS CON CSS NO REEMPLAZAN A UNA FOTO (31/8/2026)
      Un objeto fotografiado —una perla, un lacre, un moño— tiene microrrelieve
      y nácar que el CSS no imita. El CSS sirve para SUPERFICIES (papel,
      terciopelo, el velo) y para LÍNEAS, no para objetos.

   ★ NO SE TAPA UN PAPEL CON OTRO PAPEL (1/9/2026)
      Para cubrir algo que ya está adentro de una sección con su propio papel,
      la tapa va TRANSPARENTE y lo de abajo se apaga con `visibility:hidden`.

   ★ EL EMPALME DEL SOBRE CON LA INVITACIÓN SE MIDE (2/9/2026)
      Un video de sobre tiene que TERMINAR EN BLANCO, o el corte se ve. Y el
      `color` del catálogo se saca leyendo el píxel del último cuadro.
      ⚠️ Salvo en los que se abren por SOLAPAS: ahí el color se mide en el
         papel de una esquina del primer cuadro. Ver `sobres/catalogo.js`.

   ★ NO DEFORMAR UNA PIEZA PARA ANIMARLA (3/9/2026)
      `scaleY` sobre la hebra de perlas del itinerario dejaba las perlas
      aplastadas como lentejas. Para que avance un objeto sin deformarlo:
      `clip-path: inset(...)`. Corta, no estira.

   ★ Y OJO CON `object-fit: cover` EN UNA PIEZA (4/9/2026)
      El collar de la frase es una foto de 680×341 metida en una caja de
      507×132: con `cover` se recorta casi la mitad del alto, y ese borde es un
      corte a cuchillo que se lee como una línea. Se disuelve con `mask-image`.

   ★ CUANDO ALGO NO SE VE Y TODO MIDE BIEN, MIRAR QUÉ HAY ENCIMA (3/9/2026)
      La apertura por solapas mostraba una tarjeta crema vacía. Las hojas
      existían, la foto cargaba, el tamaño era correcto, `visibility: visible`,
      `opacity: 1`, y ni con `background: red` se veía. Era el `<video>` del
      motor, vacío pero en `display:block` y con `z-index: 2`.
      → `elementFromPoint` lo resolvió en un minuto. Los estilos de un elemento
        nunca te dicen quién está ARRIBA.

   ★ !important NO ALCANZA PARA GANARLE A UN MÓDULO (1/9/2026)
      Si dos reglas !important tienen la misma especificidad, desempata el
      orden. Repetir la clase sube la especificidad sin depender del orden.
      ⚠️ Pero contra la COLECCIÓN no alcanza: sus reglas van con
         `html[data-coleccion="perlas"][data-col-perla]`, o sea dos atributos.
         Para ganarle hay que usar el MISMO prefijo y sumar algo.

   ★ NO COLGAR NADA DE `window.INVEV` (31/8/2026)
      El motor lo REEMPLAZA entero cuando llega la invitación desde Firestore.
      Los materiales van en su propio global. De `INVEV` sólo se LEE `fx`.

   ★ EN LOS BLOQUES DEL PANEL, NO GUARDARSE `D.fx` AL CONSTRUIR (31/8/2026)
      El panel REEMPLAZA `D.fx` cuando llega el evento y la referencia vieja
      queda huérfana: parece que guarda y no guarda.
      → `datos()` se llama de nuevo adentro de cada `onchange`.

   ★ NUNCA GUARDAR UNA COPIA DEL HTML PARA "DESHACER" (31/8/2026)
      El motor dibuja primero el ejemplo y recién después pone los datos del
      cliente; la copia se tomaba con el ejemplo adentro.
      → Deshacer se hace SIEMPRE mirando el DOM de AHORA.

   ⚠️ EL ORDEN IMPORTA en treinta casos:
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
   · `panel-itinerario.js` va DESPUÉS de `panel-fecha.js`: se monta debajo de
     ese bloque. Escribe `fx.itinerario.momentos` y `fx.itinerario.estilo`.
   · `panel-sobre.js` NO tiene orden: busca el select por su `onchange` y lee
     el catálogo en el momento.
   · `sobre-catalogo.js` va TEMPRANO y ANTES de que el invitado toque nada: es
     lo primero que se ve.
   · `muestra-venta.js` va DESPUÉS de `wa-flotante.js`: le pisa el número al
     flotante.
   · `fondo-invitacion.js` va DESPUÉS de `paleta.js`: el velo se tiñe con el
     papel de la paleta.
   · `panel-fondo.js` va DESPUÉS de `fondo-invitacion.js`.
   · `itinerario-momentos.js` va ANTES de `itinerario.js`.
   · `fecha.js` va ANTES de `raspadita.js`: la raspadita se monta encima.
   · `panel-galeria.js` va DESPUÉS de `galeria.js`.
   · `perla.js` va ANTES de `motivo.js`: le deja la foto en `window.INVPERLA`.
   · `motivo.js` va ÚLTIMO de los que dibujan: cuelga las perlas del marco y de
     los separadores, así que necesita que las secciones ya estén puestas.
   · `panel-motivo.js` va DESPUÉS de `motivo.js`: escribe fx.motivo.
   · `colecciones/pieza-*.js` van ANTES de `colecciones/perlas.js`: son el
     material que la colección coloca.
   · `dresscode-colores.js` va DESPUÉS de `paleta.js` y de
     `colecciones/perlas.js`, porque uno de sus disparadores es la marca
     `data-coleccion` en el html.
   · `panel-dresscode.js` va DESPUÉS de `panel-coleccion.js`.
   · `colecciones/perlas.js` va AL FINAL DE LOS QUE DIBUJAN: manda sobre los
     demás. Igual se vuelve a pasar sola cada 400 ms.
   · `carta-perlas.js` va DESPUÉS de `colecciones/perlas.js`: mueve la carta
     abajo del collar y de la frase.
   · `itinerario-perlas.js` va DESPUÉS de `colecciones/perlas.js`: copia la
     hebra de perlas que la colección le puso a `.tl::before`.
   · `perlas-ajustes.js` va AL FINAL DE LOS DE PERLAS: corrige cosas que la
     colección deja puestas (el papel de la banda de la frase, el tamaño de las
     fotos de personas, el cuerpo de la frase). Si corriera antes, la colección
     le pisaría todo.
   · `regalo-perlas.js` va DESPUÉS de `perlas-ajustes.js`: le copia la foto de
     la perla a una perla que ya esté puesta, y apaga los corazones que estaban
     en esa misma sección. Si corriera antes no tendría de dónde copiar.
   · `panel-coleccion.js` va DESPUÉS de `panel-paleta.js`: al elegir colección
     propone la paleta que le corresponde.
   · `acordeon.js` NO tiene orden: se cuelga del click y no depende de nadie.
   ============================================================================ */
(function () {
  var MODULOS = [
    '/efectos/sobre-catalogo.js',      /* el sobre de entrada: el motor lo ignoraba */
    '/efectos/paleta.js',              /* la paleta: pinta las 12 variables de color de una */
    '/efectos/panel-paleta.js',        /* y el selector de las 20, en el panel */
    '/efectos/botones.js',             /* el material de los botones: lacre, cristal, nácar… */
    '/efectos/panel-botones.js',       /* y su selector, debajo del de paletas */
    '/efectos/rsvp-interruptor.js',    /* el sí/no de la confirmación, como interruptor */
    '/efectos/panel-rsvp.js',          /* y el selector para volver a los dos botones */
    '/efectos/rsvp-muestra.js',        /* la muestra: la confirmación y el pase, sin invitado */
    '/efectos/panel-muestra.js',       /* el Sector de muestras del panel: los dos interruptores */
    '/efectos/panel-sobre.js',         /* el selector de sobres estaba VACÍO: lo llena */
    '/efectos/fondo-invitacion.js',    /* imagen o video en lugar del papel de la invitación */
    '/efectos/panel-fondo.js',         /* y su bloque en el panel, con el subidor */
    '/efectos/itinerario-momentos.js', /* carga los momentos reales del itinerario */
    '/efectos/itinerario.js',          /* y la línea se dibuja con el scroll */
    '/efectos/calendario.js',          /* el calendario del mes con la fecha marcada */
    '/efectos/fecha.js',               /* las nueve maneras de mostrar la fecha */
    '/efectos/raspadita.js',           /* la raspadita: se monta sobre la fecha */
    '/efectos/panel-fecha.js',         /* y las dos, por fin, en el panel */
    '/efectos/panel-itinerario.js',    /* los momentos del itinerario, por fin cargables */
    '/efectos/encuadre-monitor.js',    /* en compu: todo en una columna */
    '/efectos/pieza-carta.js',         /* escribe los nombres sobre la tarjeta del sobre */
    '/efectos/panel-pieza.js',         /* y sus ajustes dentro del bloque ✨ Efectos */
    '/efectos/panel-etiquetas.js',     /* nombres únicos en el panel */
    '/efectos/imagen-cierre.js',       /* el "¡Gracias!" del final iba sobre una foto de stock */
    '/efectos/musica.js',              /* la Platinum vende Música y el motor no la tenía */
    '/efectos/wa-flotante.js',         /* el flotante de WhatsApp iba a wa.me/ sin número */
    '/efectos/muestra-venta.js',       /* la muestra vende: teléfonos de Invítame y el llamado */
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
    '/efectos/carta-perlas.js',        /* y la carta va abajo del collar, no colgada del RSVP */
    '/efectos/itinerario-perlas.js',   /* y el collar se va enhebrando con el scroll */
    '/efectos/perlas-ajustes.js',      /* los retoques de Jazmín: el papel, las caras, la frase */
    '/efectos/regalo-perlas.js',       /* un regalo dibujado con perlas, en Mesa de regalos */
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
