/* ===== COLECCIÓN «LA BELLA Y LA BESTIA» =======================================

   El cuento de Villeneuve (1740) y Beaumont (1756), no la película. Nace del
   pedido de Maki del 23/9/2026: seguir la línea de princesas después de
   Cenicienta, «respetando esta invitación que armamos juntos».

   ⭐ QUÉ LA HACE DISTINTA DE LAS DEMÁS
        · Es la primera OSCURA de la línea de princesas. Cenicienta es azul
          hielo y plata, Perlas violeta, Marfil blanco y gris, Campestre oliva,
          Bohemia marrón y camel, Disco plata sobre negro. Ésta es ORO VIEJO,
          BORGOÑA Y VERDE BOTELLA sobre madera, a la luz de tres velas.
        · Los títulos van en CINZEL — romana de capitales, lapidaria. No la usa
          ninguna otra. El nombre va en PINYON SCRIPT, no en Alex Brush.
        · El fondo es un VIDEO de la mesa con la rosa, y lo que se mueve son
          LAS TRES VELAS: cada una late con su propio ritmo y su luz respira
          sobre el bronce. Movimiento medido 3,62 (playa aprobado = 2,85).
        · La marca del itinerario es una ROSA HERÁLDICA de cinco pétalos.
        · El botón va en ORO CEPILLADO, elegido DESDE EL PANEL
          (`fx.boton.estilo = 'oro'`). Cenicienta cristal, Perlas lacre,
          Marfil nácar, Campestre arcilla, Bohemia relieve seco.
          ⚠️ La colección NO pinta el botón: el material lo elige Jazmín.

   ⚠️⚠️ LOS COLORES ESTÁN MEDIDOS CONTRA EL VIDEO, NO ELEGIDOS DE OJO.
      El fondo tiene un rango enorme: p5 = 3 (terciopelo casi negro) y
      p95 = 204 (el manuscrito iluminado y las llamas). Color medio (90,72,57).
      El 3% MÁS CLARO —el peor caso para una tinta clara— mide (239,223,195).

      Con el papel de la sección al 15% (`fx.fondo.paso = 0.85`) el compuesto
      queda (84,65,52) típico y (210,194,169) en el peor caso.

      🔴 CONTRA ESE PEOR CASO NINGUNA TINTA SOLA SIRVE:
             crema #F4E7CE → 1,43     oro #E3C88A → 1,07
         Y una tinta oscura se borra sobre el terciopelo. Por eso acá el VELO DE
         LECTURA NO ES OPCIONAL: es lo que hace legible la colección.

      Calculado el alfa necesario del velo para que la crema pase el piso de 5:
             0,45 → 3,84      0,55 → 5,01      0,65 → 6,60
         Se usa 0,62, que deja el compuesto peor en (95,84,70):
             TINTA  #F6EAD2 → 6,23     TINTA2 #EADCBD → 5,44
             ORO    #E3C88A → 4,56  ← títulos y adorno, NO texto chico
             TINTA3 #A98A5F → 2,29  ← SÓLO filetes y bordes, NUNCA texto

   ⚠️⚠️ LO QUE SE ARREGLÓ EL 23/9/2026, MIRANDO LAS OCHO PANTALLAS A 100 %
        (la hoja de contactos sirve para ENCONTRAR sospechosos; el veredicto
         se da a tamaño real, y estos seis salieron de ahí):
          1. el velo abría 16 % a cada lado y los títulos caían fuera → `inset:0`
          2. `section.pase` seguía crema — no es `.sec`, no la destapaba la regla
          3. las tarjetas de lugar son `.evento`, no `.card` → seguían crema
          4. `#scratchcard` traía su recuadro blanco (vive en el `::after`)
          5. `.padres` es grilla de DOS columnas → los tres padrinos caían 2+1
          6. `.btn` clavado con `!important` peleaba con el material del panel

   ⭐ SE PRENDE con `INVEV.fx.coleccion = 'bella'`.
   ============================================================================ */
(function () {
  'use strict';

  var ID     = 'bella';
  var ID_CSS = 'col-bella';
  var P      = 'html[data-col="bella"][data-coleccion="bella"] ';

  /* ---------------------------------------------------------------- paleta */

  var TINTA  = '#F6EAD2';   /* la principal: títulos, nombres, datos */
  var TINTA2 = '#EADCBD';   /* bajadas y textos secundarios */
  var TINTA3 = '#A98A5F';   /* SÓLO filetes, bordes y separadores */
  var ORO    = '#E3C88A';   /* el acento. Títulos y decoración, no texto chico */
  var ORO2   = '#C9A75E';   /* el oro más hondo, para bordes y sellos */
  var PAPEL  = '#2E1F14';   /* el papel OSCURO de la sección */
  var PAPEL2 = '#241809';
  var TABACO = '#1A1008';   /* el fondo del velo de lectura */
  var VINO   = '#6E1F2A';   /* la borgoña de la rosa, para detalles */

  var VELO_A = 0.62;        /* MEDIDO. Ver la cabecera. No bajarlo. */

  /* ------------------------------------------------------------- utilidades */

  function ev() { try { return window.INVEV || {}; } catch (e) { return {}; } }

  function activa() {
    var f = (ev().fx) || {};
    return String(f.coleccion || '') === ID;
  }

  /* La rosa heráldica del adorno de los títulos.
     ⚠️ Dibujada para el TAMAÑO REAL: `.adorno` mide 40 px medidos en vivo, así
        que la rosa se ve como un círculo de unos 18 px. Ahí no entra una rosa
        de jardín con pétalos sueltos: entra una rosa HERÁLDICA, cinco pétalos
        y un botón. Verificada renderizándola a 40, 60 y 100 px.
        Es la misma lección del reloj de Cenicienta: doce marcas no entran,
        entran cuatro. */
  /* El capullo de rosa del adorno de los títulos.
     ⚠️ Dibujado para el TAMAÑO REAL: `.adorno` mide 40 px, o sea que la figura
        se ve a unos 18 px. Probadas y DESCARTADAS, renderizándolas a 40/64/110:
          · rosa de líneas con pétalos radiales → se lee como un monigote
          · rosa llena de cinco círculos        → margarita de sticker
          · rosa heráldica de pétalos en punta  → se lee como una ESTRELLA
          · espiral (rosa enrollada)            → ambigua a 40 px
        La que sí se lee es el CAPULLO DE PERFIL con tallo y dos hojas: a 40 px
        es inconfundible, y además es la rosa del cuento, la que el padre corta.
        Misma lección que el reloj de Cenicienta: se dibuja para el tamaño real,
        no para el viewBox. */
  function rosaSVG(color) {
    return "data:image/svg+xml;utf8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' +
      '<g fill="' + color + '">' +
      '<path d="M24 5.5 C30.6 8.4 34.2 13.4 34.2 19.2 C34.2 25.6 29.6 30 24 30 ' +
      'C18.4 30 13.8 25.6 13.8 19.2 C13.8 13.4 17.4 8.4 24 5.5 Z"/>' +
      '<path d="M24 35 C19.5 35 16.5 33 15 30.2 C19 29.2 22.2 31 24 35 Z"/>' +
      '<path d="M24 38.5 C28.5 38.5 31.5 36.5 33 33.7 C29 32.7 25.8 34.5 24 38.5 Z"/>' +
      '</g>' +
      '<g fill="none" stroke="' + color + '" stroke-width="2.2" stroke-linecap="round">' +
      '<path d="M24 30 L24 43"/></g>' +
      '<g fill="none" stroke="' + PAPEL + '" stroke-width="1.9" stroke-linecap="round">' +
      '<path d="M24 11.5 C20.8 14 19.6 17.4 20.4 21.2"/>' +
      '<path d="M24 11.5 C27.2 14 28.4 17.4 27.6 21.2"/></g>' +
      '</svg>');
  }

  /* ------------------------------------------------------------------- CSS */

  function armarCSS() {
    return [

      /* ---- variables de la colección ---- */
      P + '{',
      '  --tinta:'   + TINTA  + '; --tinta2:' + TINTA2 + '; --tinta3:' + TINTA3 + ';',
      '  --oro:'     + ORO    + '; --oro2:'   + ORO2   + ';',
      '  --papel:'   + PAPEL  + '; --papel2:' + PAPEL2 + ';',
      '  --vino:'    + VINO   + '; --tabaco:' + TABACO + ';',
      '  --sage:'    + ORO    + '; --sage-cl:' + ORO2  + ';',
      '  --cream:'   + TINTA  + '; --muted:'  + TINTA2 + ';',
      '}',

      /* ---- 🔴 DESTAPAR EL FONDO ----------------------------------------
         El motor pinta `.sec` con `i/tex-acuarela.jpg`, un JPEG SIN alfa, así
         que TAPA el video entero. Es el mismo bug que se pagó en Campestre y
         en Cenicienta. El filtro es `:not([style*="url("])`, NO
         "background-image": las secciones con foto propia la escriben EN LÍNEA
         y hay que dejarlas en paz. */
      P + '.sec:not([style*="url("]){',
      '  background-color:transparent!important;',
      /* ⭐⭐ EL CLARO OSCURO DETRÁS DEL TEXTO. Ver la nota grande de abajo. */
      '  background-image:radial-gradient(118% 76% at 50% 50%,',
      '    rgba(12,7,3,.66) 0%, rgba(12,7,3,.50) 44%, rgba(12,7,3,0) 90%)!important;',
      '  background-size:100% 100%!important;',
      '  background-repeat:no-repeat!important;',
      '}',

      /* ---- 🔴🔴 EL VELO DE LECTURA: **UNA SOLA CAPA**, SOBRE EL FONDO ------
         Tercera versión, y las dos anteriores están medidas:
           1ª · un `::before` absoluto por sección. En Chrome, perfecto.
                En WebKit, «Target crashed» AL CARGAR. Aislado cambiando una
                cosa por vez: sin el `filter:blur` → igual crash (no era el
                blur); sin el velo entero → VIVE. Y con el `inset:0 16%` viejo
                también crash (no era el ancho). Era LA CAPA: veinte
                pseudo-elementos absolutos del tamaño de su sección, cada uno
                abriendo su contexto de apilado. Clara, en el MISMO WebKit,
                abre sin una queja: el sospechoso era esta colección.
           2ª · el degradado como `background-image` de cada sección. Safari
                revive, pero el velo deja de estar ENTRE el fondo y el texto y
                pasa a estar DETRÁS de todo lo que la sección dibuja encima.
                Medido escondiendo el texto: de 0 fallas a **20**.
           3ª · ésta. El velo tapa EL FONDO, así que va sobre el fondo: una
                sola capa fija en `#inv-fondo::after`, del tamaño de la
                pantalla, que no scrollea porque el fondo tampoco.
                Medido: 63 textos, **2** por debajo del piso (y esos dos eran
                otra cosa: el cielo blanco del ambiente, más abajo).
         ⚠️ `position:fixed` y no `absolute`: el fondo es fijo; una capa
            absoluta se quedaría en el primer viewport.
         ⚠️ No lleva `blur`: el degradado ya llega a 0 en las dos puntas, así
            que no hay rectángulo que disimular. El collage sigue entrando por
            los 34 px de cada costado (8 % / 92 %), que es lo medido. */
      P + '#inv-fondo{ position:fixed!important; }',
      P + '#inv-fondo::after{',
      '  content:""!important; position:fixed!important; inset:0!important;',
      '  pointer-events:none!important; z-index:2!important;',
      '  background:linear-gradient(90deg,',
      '    rgba(26,16,8,0) 0%, rgba(26,16,8,' + VELO_A + ') 8%,',
      '    rgba(26,16,8,' + VELO_A + ') 92%, rgba(26,16,8,0) 100%)!important;',
      '}',

      /* ---- 🔴 EL CIELO DEL AMBIENTE: LA NOCHE, NO UN MEDIODÍA -------------
         `fx.ambiente.tipo = 'nubes'` está prendido en el itinerario, y ese
         efecto dibuja SIEMPRE la misma foto —`/i/cielo.jpg`—, un cielo DIURNO
         y BLANCO que tapa el fondo de la sección entera. Los colores de la
         temática (acá #3A2A1C y #2E1F14, bien cargados) no los usa para nada.
         Ya estaba escrito para Cantera y Bella volvió a caer: medido el 23/9,
         los píxeles del itinerario daban (240,244,248) y los dos únicos textos
         que fallaban el contraste eran «Itinerario» (1,05) y «El gran día»
         (1,45) — crema sobre blanco.
         ⚠️ Y acá va al revés que en Cenicienta: ESA sección es de papel claro
            con tinta oscura, así que su cielo se mantiene claro. La de Bella
            es oscura con tinta clara, así que el cielo va de NOCHE.
            Es el mismo error de siempre, dado vuelta: mirar de qué color es la
            tinta ANTES de elegir el fondo.
         ⚠️ `.sky` ya trae la animación `skyken` (34 s): las chispas viajan con
            ella y no hace falta sumar otra. */
      P + '.ambiente .sky{',
      '  background-image:',
      '    radial-gradient(1.8px 1.8px at 21% 13%, rgba(227,200,138,.95), rgba(227,200,138,0) 60%),',
      '    radial-gradient(1.2px 1.2px at 67% 8%,  rgba(255,232,178,.90), rgba(255,232,178,0) 60%),',
      '    radial-gradient(2.2px 2.2px at 85% 30%, rgba(227,200,138,.85), rgba(227,200,138,0) 62%),',
      '    radial-gradient(1.3px 1.3px at 37% 38%, rgba(255,232,178,.85), rgba(255,232,178,0) 60%),',
      '    radial-gradient(2.0px 2.0px at 11% 56%, rgba(227,200,138,.88), rgba(227,200,138,0) 62%),',
      '    radial-gradient(1.2px 1.2px at 73% 65%, rgba(255,232,178,.82), rgba(255,232,178,0) 60%),',
      '    radial-gradient(1.9px 1.9px at 46% 81%, rgba(227,200,138,.90), rgba(227,200,138,0) 62%),',
      '    radial-gradient(1.1px 1.1px at 89% 90%, rgba(255,232,178,.80), rgba(255,232,178,0) 60%),',
      '    linear-gradient(180deg, rgba(26,16,8,.92) 0%, rgba(46,31,20,.86) 100%)!important;',
      '  background-size:168px 168px,168px 168px,168px 168px,168px 168px,',
      '                  168px 168px,168px 168px,168px 168px,168px 168px,100% 100%!important;',
      '  background-repeat:repeat,repeat,repeat,repeat,repeat,repeat,repeat,repeat,no-repeat!important;',
      '}',
      /* ⚠️ MEDIDO EN VIVO: matar sólo `background-image` NO alcanza en una
         colección OSCURA. El motor además pinta varias secciones con un COLOR
         de fondo claro —medido rgb(244,231,206)— y ahí la tinta clara queda
         crema sobre crema y desaparece. En Cenicienta no se nota porque esa
         colección es clara. Hay que matar también `background-color`. */

      /* ---- 🔴🔴🔴 LOS TEXTOS QUE SE PIERDEN CON EL FONDO  (23/9/2026) ------
         Maki: «los textos no se llegan a leer. "Con el corazón lleno", "Una
         carta para ti", por ejemplo, y así con todos: se pierde con el fondo».
         Y también: «el "Para tu comodidad" no lo veo, no se lee nada».

         ⚠️⚠️ YO LOS HABÍA DADO POR BUENOS MIDIENDO. El barrido escondiendo el
            texto daba **64 textos, 0 por debajo del piso**, con el peor en 5,09.
            Y ella los mira y no se leen. **Manda el ojo.**

         POR QUÉ MENTÍA EL NÚMERO, y esto vale para cualquier colección sobre
         foto: la razón de contraste compara DOS luminancias planas. Acá el
         problema no es la luminancia media — es que un TRAZO FINO DE CURSIVA
         (Pinyon Script a 34 px, un pelo de grosor) cae sobre una foto de mucho
         DETALLE —el manuscrito, los pétalos, la llama— y el ojo pierde el
         borde de la letra aunque el promedio dé 6. **Una letra no compite con
         un fondo por brillo: compite por FRECUENCIA.**

         LO QUE SE PROBÓ, mirando las capturas a 100 % en los tres lugares que
         ella nombró, no midiendo:
            base       · la cursiva se come el fondo, tal cual lo dijo
            sólo halo  · mejora, pero en el manuscrito todavía cuesta
            radial fuerte (.78) · se lee perfecto y APAGA demasiado el collage
            **radial .66 + halo** · se lee limpio y el collage sigue entrando
                         por los costados: se ven la rosa, la vela y los arcos
         ⚠️ El radial va en el `background-image` de la sección, **sin
            `position:relative` ni `z-index`**: probado en WebKit, vive. La
            versión con z-index se ve igual y no hace falta — y ya sabemos a
            qué huele esa familia de reglas acá.
         ⚠️ Y es RADIAL, nunca una banda recta: deja el fondo a la vista en los
            bordes, que es de lo que se trata. */
      P + '.sec .kick, ' + P + '.sec h2, ' + P + '.sec .h2{',
      '  text-shadow:0 1px 2px rgba(12,7,3,.90), 0 0 16px rgba(12,7,3,.72)!important;',
      '}',
      P + '.sec p, ' + P + '.sec .txt, ' + P + '.sec li{',
      '  text-shadow:0 1px 2px rgba(12,7,3,.82)!important;',
      '}',
      /* ⚠️ La hoja de la carta es papel CLARO con tinta oscura: ahí el halo
         oscuro ensucia en vez de ayudar. Se le saca. */
      P + '.cf-letter p, ' + P + '.cf-letter h3, ' + P + '.cf-letter *{ text-shadow:none!important; }',
      P + ':is(.evento, .hotel, .pasecard) *{ text-shadow:none!important; }',

      /* ---- 🔴 LA HOJA DE LA CARTA TIENE QUE SALIR DEL SOBRE --------------
         Maki, 23/9: «la carta está muy larga, tiene que ser la mitad». Se
         cortó a la mitad (437 → 225 caracteres, 51 %) y ahí apareció lo de
         abajo, que estaba tapado por el largo: **la solapa de adelante se come
         las últimas líneas**.
         Medido dentro de `.cartafx` (340×490):
              .cf-letter   92 → 318      el párrafo  148 → 297
              .cf-front   258 → 490      ← y su tinte va al 0,88, casi opaco
              o sea: 39 px de TEXTO detrás de la solapa
         Probados, con el solape del texto medido en cada uno:
              0 px → +39 (tapado) · −40 → −1 · **−50 → −11** · −60 → −21
         Queda −50: el texto entero por arriba de la solapa y la hoja todavía
         metida 10 px adentro del sobre, que es lo que la hace leer como que
         SALE de ahí. Con −60 el solape es 0 y la hoja flota suelta.
         ⚠️ El número está calibrado para ESTE largo de carta. Si el texto
            crece, se vuelve a medir el solape — no se estima. */
      P + '.cf-letter{ transform:translateY(-50px)!important; }',

      /* ---- tipografía ----
         Cinzel para los títulos (romana de capitales, no la usa ninguna otra
         colección) y Cormorant Garamond para el cuerpo. */
      P + '.sec h2, ' + P + '.sec .h2, ' + P + '.stitle, ' + P + '.dq-h2{',
      '  font-family:"Cinzel",serif!important;',
      '  letter-spacing:.055em!important;',
      '  color:' + TINTA + '!important;',
      '}',
      P + '.sec, ' + P + '.sec div, ' + P + '.sec span{ color:' + TINTA2 + '; }',
      P + '.sec p, ' + P + '.sec li, ' + P + '.sec .txt{',
      '  font-family:"Cormorant Garamond",serif!important;',
      '  color:' + TINTA2 + '!important;',
      '}',
      P + '.kick, ' + P + '.sec .kick{',
      '  font-family:"Pinyon Script",cursive!important;',
      '  color:' + ORO + '!important;',
      '  letter-spacing:.01em!important;',
      '}',

      /* ---- filetes y separadores: TINTA3, que NO se usa nunca para texto ---- */
      P + '.sec hr, ' + P + '.filete, ' + P + '.sep{',
      '  border-color:' + TINTA3 + '!important; background:' + TINTA3 + '!important;',
      '  opacity:.55!important;',
      '}',

      /* ---- el adorno del título: la rosa heráldica ---- */
      P + '.adorno{',
      '  background-image:url("' + rosaSVG(ORO) + '")!important;',
      '  background-size:contain!important; background-repeat:no-repeat!important;',
      '  background-position:center!important;',
      '}',
      P + '.adorno svg, ' + P + '.adorno img{ display:none!important; }',

      /* ---- 🔴 EL BOTÓN: LA COLECCIÓN NO LO CLAVA -------------------------
         La primera versión pintaba `.btn` de oro con `!important`. NO GANABA,
         y además estaba mal de raíz. Medido el 23/9: los botones de Victoria
         salían `cristal` —pastilla blanca— porque el MATERIAL del botón lo
         elige Jazmín desde el panel (`fx.boton.estilo`, once estilos en
         `efectos/botones.js`) y cada estilo declara su `color` y su
         `background` con `!important`. Es la misma lección ya escrita en
         Cantera: «LA COLECCIÓN NO CLAVA LA TINTA DEL BOTÓN».
         → El material se elige DESDE EL PANEL: para Bella va `oro` (Oro
           cepillado), que lee `var(--oro)` y ahí toma el oro de esta paleta.
         → La colección sólo PROPONE, sin `!important`, y el relleno sigue a
           `currentColor` para no pelearse con el material elegido. */
      P + '.btn:not(.gh):not(.ghost){ letter-spacing:.12em; -webkit-text-fill-color:currentColor; }',
      P + '.btn.gh, ' + P + '.btn.ghost, ' + P + 'a.btn.ghost{',
      '  background-color:transparent!important; background-image:none!important;',
      '  color:' + TINTA + '!important; -webkit-text-fill-color:' + TINTA + '!important;',
      '  border:1px solid rgba(169,138,95,.55)!important; box-shadow:none!important;',
      '}',
      /* la flecha del acordeón no tiene color propio: hereda el del botón */
      P + '.btn .chev, ' + P + '.chev{ color:inherit!important; opacity:.85!important; }',

      /* ---- 🔴 EL BOTÓN DEL FILTRO NO ESTÁ EN `botones.js` ------------------
         Medido: `#filtro-abrir` nace rgb(244,231,206) con letra rgb(96,96,96)
         y NO lo alcanza `:is(.btn,#btn-ingresar,.wsp,.tv-btn,.inv-prev-btn)`,
         que es el conjunto que pinta el material. En una colección clara no
         canta; en ésta es una pastilla crema en medio de la madera.
         ⚠️ Y `#gal-entrar` —«Entrar a la galería», el botón de Invítame Live—
            es el MISMO caso: medido 230×54 en rgb(244,231,206). Apareció recién
            al prender la galería, o sea que el barrido de superficies claras
            hay que correrlo DESPUÉS de tener todo cargado, no antes.
         (Anotado para el motor: los dos deberían entrar en el conjunto.) */
      P + '#filtro-abrir, ' + P + '#gal-entrar{',
      '  background:linear-gradient(180deg,' + ORO + ' 0%,' + ORO2 + ' 100%)!important;',
      '  color:#2E1F14!important; -webkit-text-fill-color:#2E1F14!important;',
      '  border:0!important;',
      '  box-shadow:inset 0 1px 0 rgba(255,240,205,.55), 0 4px 12px rgba(0,0,0,.38)!important;',
      '}',

      /* ---- tarjetas y cajas: papel oscuro, no blanco ----
         ⚠️ Regla del chequeo «sin-parches-claros»: en una colección OSCURA
            cualquier superficie clara suelta canta. Se pintan TODAS. */
      P + '.card, ' + P + '.caja, ' + P + '.ev-card, ' + P + '.hotel, ' + P + '.tl{',
      '  background:linear-gradient(180deg,rgba(46,31,20,.92),rgba(36,24,9,.94))!important;',
      '  border:1px solid rgba(169,138,95,.40)!important;',
      '  color:' + TINTA2 + '!important;',
      '}',
      P + '.card h3, ' + P + '.ev-card h3{ color:' + TINTA + '!important; font-family:"Cinzel",serif!important; }',

      /* ---- 🔴 LAS TRES TARJETAS QUE SEGUÍAN CLARAS ------------------------
         Medido el 23/9 barriendo la página entera por superficies claras
         (área > 7.000 px², luminancia > 150). Quedaban once, y tres eran
         de la invitación —las otras son el sobre y el propio QR—:
            section.pase           430x303  rgb(244,231,206)
            .evento  (Misa)        374x359  rgb(250,247,241)
            .evento  (Recepción)   374x339  rgb(250,247,241)
         Mi regla de tarjetas apuntaba a `.card/.caja/.ev-card/.hotel/.tl`
         y NINGUNA de esas clases existe acá: las tarjetas de lugar son
         `.evento` y el pase es `section.pase`, que NO es `.sec` y por eso
         tampoco lo destapaba la regla del fondo.
         ⚠️ `#qr` queda BLANCO A PROPÓSITO: un QR sin zona blanca no escanea. */
      P + ':is(.evento, .hotel, .pasecard, .card, .caja, .ev-card, .tl){',
      '  background-color:' + PAPEL + '!important;',
      '  background-image:none!important;',
      '  border:1px solid rgba(169,138,95,.40)!important;',
      '  box-shadow:0 8px 22px rgba(0,0,0,.34)!important;',
      '}',
      P + ':is(.evento, .hotel, .pasecard) :is(h3, p, .sub, .addr, .t, .v, .k){',
      '  color:' + TINTA2 + '!important;',
      '}',
      P + ':is(.evento, .hotel) h3, ' + P + '.pasecard .v{',
      '  color:' + TINTA + '!important; font-family:"Cinzel",serif!important;',
      '}',
      P + '.frame .pase, ' + P + 'section.pase{',
      '  background-color:transparent!important;',
      '  background-image:none!important;',
      '  position:relative!important;',
      '}',
      P + '.pase > *{ position:relative!important; z-index:1!important; }',
      P + '.pasecard .estado{ color:' + ORO + '!important; border-color:' + TINTA3 + '!important; }',

      /* ---- 🔴 LA RASPADITA VA SIN RECUADRO --------------------------------
         Regla vieja de Maki, y estaba incumplida: `#scratchcard` traía su
         propia tarjeta blanca —medida rgb(250,247,241)— apoyada sobre el
         papel. En una colección oscura es el parche más visible de todos.
         ⚠️ EL RECUADRO VIVE EN `.scratchcard::after`: `border:0` NO lo apaga.
            (Lección ya escrita en Cantera; acá se repitió igual.) */
      /* ---- 🔴 LAS TAPAS DE LA RASPADITA: EL LACRE DE LA ROSA ---------------
         Maki, 23/9/2026: «la raspada, estaría bueno que le pongas algo con la
         temática de la invitación». Salía el degradado plateado de fábrica, que
         no dice nada y encima es lo único frío de una invitación de oro viejo.
         La pieza: el MISMO lacre del sobre, fotografiado de cerca y recortado a
         su caja (512×512). Así la rosa del lacre aparece en el sobre, en los
         títulos y en la raspadita: una sola marca, tres veces.
         ⚠️⚠️ `--r3-tapa` la lee `efectos/raspadita.js` DESDE EL CANVAS, y una
            variable de CSS sólo baja a los DESCENDIENTES: hay que declararla en
            TODA la rama (`.scratch-sec`, `.rasp-3`, `.rasp-zona`, `#scratchcard`),
            no en `.rasp-3` sola. Igual que en Bohemia y en Cantera.
         ⚠️⚠️ Y VA SIN PREFIJO: el canvas se pinta UNA sola vez al cargar, antes
            de que la colección alcance a poner `data-col`. Con el prefijo la
            variable no existe todavía en ese instante y se pinta el plateado.
         ⚠️ El motor APAGA las casillas que todavía no se pueden raspar
            (`.rasp-zona.dormida canvas{filter:brightness(.84) saturate(.72)}`).
            Con un degradado eso se lee como «más oscuro»; con una FOTO de lacre
            se lee como TRES LACRES DE DISTINTO COLOR, que es lo que Maki ya
            marcó en Cantera. Se apaga el filtro, con prefijo y todo, porque esa
            regla es (0,2,1) y también lleva !important. */
      ':is(.scratch-sec, .rasp-3, .rasp-zona, #scratchcard){',
      '  --r3-tapa:url("https://res.cloudinary.com/oc8cgqt4/image/upload/q_auto,f_auto/v1790159979/invitame/piezas/bella-rasp-tapa-23-9.webp");',
      '}',
      P + '.rasp-zona.dormida canvas{ filter:none!important; }',

      P + '.scratchcard, ' + P + '#scratchcard{',
      '  background-color:transparent!important;',
      '  background-image:none!important;',
      '  border:0!important;',
      '  box-shadow:none!important;',
      '}',
      P + '.scratchcard::after, ' + P + '#scratchcard::after{ display:none!important; }',

      /* ---- 🔴 LAS PERSONAS, EN UNA SOLA FILA ------------------------------
         Regla de la skill de armado, y estaba incumplida: medido, `.padres`
         nace `display:grid` con `grid-template-columns:168px 168px` — DOS
         columnas fijas—, así que los tres padrinos caían 2 + 1.
         Se hace como en Cantera: tres columnas iguales y el avatar más chico
         para que entren en 430 px. */
      P + '.padres{',
      '  grid-template-columns:repeat(3,1fr)!important;',
      '  gap:10px 8px!important; background-color:transparent!important;',
      '}',
      P + '.padres[data-col-n="1"]{ grid-template-columns:minmax(0,220px)!important; justify-content:center!important; }',
      P + '.padres[data-col-n="2"]{ grid-template-columns:repeat(2,1fr)!important; }',
      P + '.padres[data-col-n="4"]{ grid-template-columns:repeat(4,1fr)!important; gap:8px 6px!important; }',
      P + '.padres .av{ width:100px!important; height:100px!important; border-radius:50%!important; border:1px solid ' + TINTA3 + '!important; }',
      P + '.padres .nm{ font-size:17px!important; color:' + TINTA2 + '!important; font-family:"Cormorant Garamond",serif!important; }',
      '@media (max-width:360px){' + P + '.padres{ gap:8px 5px!important; }' + P + '.padres .av{ width:86px!important; height:86px!important; }}',

      /* ---- 🔴 LA TAPA DE LA PLAYLIST NO ES UN PAPEL -----------------------
         Regla vieja de Maki («en ver video está el rectángulo que no me gusta,
         y la playlist lo mismo») y último parche claro que quedaba en Victoria.
         Medido el 23/9 con la playlist ya cargada: `.rd-tapa` nace en
         rgb(244,239,230) —crema— de 366×156, con `.rd-txt` en rgb(90,80,57),
         un oliva que no pertenece a esta paleta. Lo cantó la regla 2 del
         chequeo: «1 texto con un color fuera de la familia · La playlist».
         ⚠️ LA CLASE ES `.rd-tapa`, LA MISMA para el video y para la playlist.
            `.sp-tapa` y `.tv-tapa` NO EXISTEN. Ya está escrito, y va de nuevo.
         ⚠️ El aro y el triángulo del play NO se reemplazan por una foto: van
            en el mismo lenguaje que los filetes, oro sobre papel oscuro. */
      P + '.rd-tapa{',
      '  background-color:' + PAPEL2 + '!important;',
      '  background-image:url("' + rosaSVG('rgba(227,200,138,.10)') + '")!important;',
      '  background-size:78px!important; background-repeat:no-repeat!important;',
      '  background-position:right 16px bottom 12px!important;',
      '  border:1px solid rgba(169,138,95,.38)!important;',
      '  box-shadow:inset 0 1px 0 rgba(246,234,210,.07), 0 8px 22px rgba(0,0,0,.34)!important;',
      '}',
      P + '.rd-tapa .rd-aro{',
      '  border-color:' + ORO + '!important; color:' + ORO + '!important;',
      '  background:rgba(227,200,138,.07)!important;',
      '}',
      P + '.rd-tapa .rd-txt{',
      '  color:' + TINTA2 + '!important; -webkit-text-fill-color:' + TINTA2 + '!important;',
      '  letter-spacing:.18em!important;',
      '}',

      /* ---- campos de formulario ---- */
      P + 'input, ' + P + 'select, ' + P + 'textarea{',
      '  background:rgba(26,16,8,.55)!important; color:' + TINTA + '!important;',
      '  border:1px solid ' + TINTA3 + '!important;',
      '}',
      P + 'input::placeholder, ' + P + 'textarea::placeholder{ color:rgba(234,220,189,.55)!important; }',

      /* ---- 🔴 LA MARCA DEL ITINERARIO: EL CAPULLO, NO EL CIRCULITO --------
         Maki, de siempre: «no me gustan los circulitos». Es la regla 5 del
         chequeo, y Bella la estaba FALLANDO: medido el 23/9/2026,
         «no hay símbolo: la marca es el circulito de fábrica».
         ⚠️ SON DOS COSAS Y HACEN FALTA LAS DOS:
            · la foto o el dibujo en `.it::before` (la regla pide un `url(`)
            · `data-marca-propia` en el <html> CON EL NOMBRE DE LA COLECCIÓN.
              Vacío no sirve: la regla lo lee con `|| ''` y una cadena vacía
              cae a la rama del circulito. Cantera lo puso vacío el 21/9 y la
              regla falló con el medallón perfectamente puesto.
         ⚠️ Y va el CAPULLO VECTORIAL, no una foto: acá la marca se repite en
            serie a lo largo de la vía, y una foto recortada repetida se lee
            como calcomanías pegadas (la lección de la rosa de Bohemia). */
      P + '.it::before{',
      '  background-image:url("' + rosaSVG(ORO) + '")!important;',
      '  background-color:transparent!important;',
      '  background-size:contain!important; background-repeat:no-repeat!important;',
      '  background-position:center!important;',
      '  border:0!important; box-shadow:none!important; opacity:1!important;',
      '}',
      /* la vía, en filete: TINTA3, que nunca se usa para texto */
      P + '.tl::before{ background:' + TINTA3 + '!important; opacity:.6!important; }',
      P + '.it .h{ color:' + ORO + '!important; font-family:"Cinzel",serif!important; }',
      P + '.it .t{ color:' + TINTA2 + '!important; }',

      /* ---- 🔴 LA PORTADA: EL BLOQUE ARRANCA EN EL 56 %, NO EN EL 66 % -----
         Regla 7bis. El número no se elige: se COPIA de la referencia aprobada.
         Medido el 23/9/2026 en la ventana de Maki (1280×645), las dos abiertas
         desde el sobre:
              Clara (referencia)   arranca 56 %  cierra 91 %  ocupa 35 %
              Victoria de fábrica  arranca 66 %  cierra 91 %  ocupa 25 %
         Las dos cierran en 91 —el aire de abajo lo pone el motor y está bien—:
         lo que faltaba era CUERPO. Pinyon Script a 54 px deja una caja de 59 px;
         Alex Brush en Clara, a 48 px, deja 84. La cursiva es más chica de lo que
         dice su número.
         Probados y anotados, en la ventana de Maki:
              72 px → 60 %      80 px → 59 %      88 px → 57 %
              96 px → 55 %     104 px → 54 %
         Queda 92, que cae en 56. En el teléfono (430×932) el mismo bloque
         arranca en 70 %: la portada ahí mide 932 px y el bloque pesa menos.
         Son DOS números y van los dos.
         ⚠️ Van por ID: `i/estilos-servidor.css` tiene `#pv-names` con
            `!important`, y un selector de clase no le gana.
         ⚠️ `line-height:1` + `padding-bottom` y NO un line-height grande: la
            cola de una cursiva se sale de la caja de línea y se mete en el
            renglón de abajo, pero abrir el line-height también despega el
            nombre de lo de arriba. */
      P + '#pv-names{',
      '  font-size:92px!important; line-height:1!important;',
      '  padding-bottom:.26em!important;',
      '  font-family:"Pinyon Script",cursive!important;',
      '}',
      P + '#pv-kick{ font-size:13px!important; }',
      P + '.portada h1, ' + P + '#nombre{ font-family:"Pinyon Script",cursive!important; }',

      /* ---- 🔴 LA CHAPITA «SIN USAR» ERA DE OTRA COLECCIÓN -----------------
         Medido: `.estado` nace en rgb(77,106,79) — el sage de otra colección,
         clavado en el motor. Verde militar en una invitación de oro y borgoña.
         Es el mismo caso que el gris de `.v`: cosas del molde que hay que
         apagar a propósito, una por una. */
      P + '.pasecard .estado{',
      '  background-color:rgba(227,200,138,.16)!important;',
      '  color:' + ORO + '!important; -webkit-text-fill-color:' + ORO + '!important;',
      '  border:1px solid rgba(201,167,94,.55)!important;',
      '}',

      ''
    ].join('\n');
  }

  /* ---------------------------------------------------------------- fuentes */

  function fuentes() {
    /* ⚠️ Se pide SÓLO el nombre de la familia. Con una pila CSS entera
       ("'Alex Brush',cursive") Google Fonts devuelve 400 y la fuente no carga.
       Eso está medido en la invitación de Clara. */
    var href = 'https://fonts.googleapis.com/css2' +
      '?family=Cinzel:wght@400;600' +
      '&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400' +
      '&family=Pinyon+Script' +
      '&display=swap';
    if (document.querySelector('link[data-col-fuentes="' + ID + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    l.setAttribute('data-col-fuentes', ID);
    document.head.appendChild(l);
  }

  /* ------------------------------------------------------------ poner/sacar */

  function hoja() {
    var s = document.getElementById(ID_CSS);
    if (!s) { s = document.createElement('style'); s.id = ID_CSS; document.head.appendChild(s); }
    return s;
  }

  /* El motor no numera `.padres`; Perlas inventó `data-col-n` y acá se usa
     igual, así la fila sirve para 1, 2, 3 o 4 personas y no sólo para tres. */
  /* ⚠️ `reglas-duras.js` le escribe a `.rd-txt` un `color` INLINE con
     `!important`, derivado del papel CLARO que la tapa tenía antes. Contra un
     inline con `!important` no hay hoja que gane: hay que BORRARLO, y volver a
     borrarlo en cada repaso porque el corrector lo vuelve a poner cuando la
     tapa cambia. Se le saca también la marca `data-regla-orig`, que es donde
     guarda la tinta de fábrica para reusarla siempre. */
  function limpiarTapa() {
    try {
      [].forEach.call(document.querySelectorAll('.rd-tapa .rd-txt'), function (e) {
        if (e.style && e.style.color) {
          e.style.removeProperty('color');
          e.style.removeProperty('-webkit-text-fill-color');
        }
        if (e.hasAttribute('data-regla-orig')) e.removeAttribute('data-regla-orig');
      });
    } catch (e) {}
  }

  function marcarPadres() {
    try {
      var p = document.querySelector('.padres');
      if (!p) return;
      var n = String(p.children.length);
      if (p.getAttribute('data-col-n') !== n) p.setAttribute('data-col-n', n);
    } catch (e) {}
  }
  function desmarcarPadres() {
    try {
      var p = document.querySelector('.padres');
      if (p) p.removeAttribute('data-col-n');
    } catch (e) {}
  }

  /* 🔴 EL PASE CON EL QR VA ABAJO DE LA RASPADITA. Lo pidió Maki y el motor
     lo deja pegado a la portada; quien lo baja es LA COLECCIÓN. Perlas lo hace
     con esta misma función y Cantera la copió; Bella salía con el pase arriba.
     Ninguna de las ocho reglas del chequeo lo mira: se ve con
        [...document.querySelectorAll('.frame > *')].filter(e=>e.offsetHeight>30)
     que tiene que dar portada, scratch-sec, pase, …
     ⚠️ Sólo se mueve si son HERMANOS, y se corta si ya está puesto: esta
        función la vuelve a llamar el repaso de cada 1,2 s. */
  function moverPase() {
    try {
      var pase = document.querySelector('.pase');
      var rasp = document.querySelector('.sec.scratch-sec');
      if (!pase || !rasp) return;
      if (rasp.parentElement !== pase.parentElement) return;
      if (pase.previousElementSibling === rasp) return;
      rasp.parentNode.insertBefore(pase, rasp.nextSibling);
    } catch (e) {}
  }
  function devolverPase() {
    try {
      var pase = document.querySelector('.pase');
      var port = document.querySelector('.portada');
      if (!pase || !port) return;
      if (port.parentElement !== pase.parentElement) return;
      if (pase.previousElementSibling === port) return;
      port.parentNode.insertBefore(pase, port.nextSibling);
    } catch (e) {}
  }

  function poner() {
    fuentes();
    hoja().textContent = armarCSS();
    document.documentElement.setAttribute('data-col', ID);
    document.documentElement.setAttribute('data-coleccion', ID);
    window.INVCOLPALETA = {
      tinta: TINTA, tinta2: TINTA2, tinta3: TINTA3,
      acento: ORO, acentoHondo: ORO2, papel: PAPEL, oscura: true
    };
    /* ⚠️ `chequeo/muestra.js` decide si la colección es oscura MIRANDO el fondo
       de `.frame` (`esOscura()`: luminancia < 0,25). Acá la oscuridad no está
       en el papel: está en el VIDEO y en el velo, y `.frame` mide transparente.
       Resultado medido el 23/9: la regla 6 «sin-parches-claros» se saltea con
       «la colección no es oscura» — o sea PASA sin mirar nada.
       Se deja la marca puesta igual, para el día que el chequeo la lea.
       (Anotado para Maki: es un cambio de una línea en `esOscura()`.) */
    document.documentElement.setAttribute('data-col-oscura', '1');
    document.documentElement.setAttribute('data-marca-propia', ID);
    marcarPadres();
    moverPase();
    limpiarTapa();
    /* ⚠️ ACÁ HABÍA UN MutationObserver, Y ESTABA MAL. Cenicienta lo tiene
       escrito con todas las letras: «NADA DE MutationObserver: la invitación
       muta en bucle (reglas-duras.js corre con cada cambio de clase del marco)
       y un observador dispararía decenas de veces por segundo».
       `.padres` se arma después del primer pintado, así que hace falta volver
       a mirarlo — pero eso ya lo hace el repaso de cada 1,2 s de `arrancar()`,
       que vuelve a entrar por acá. No hace falta nada más. */
  }

  function sacar() {
    var s = document.getElementById(ID_CSS); if (s) s.remove();
    desmarcarPadres();
    devolverPase();
    if (document.documentElement.getAttribute('data-col') === ID) {
      document.documentElement.removeAttribute('data-col');
      document.documentElement.removeAttribute('data-coleccion');
      document.documentElement.removeAttribute('data-col-oscura');
      if (document.documentElement.getAttribute('data-marca-propia') === ID) {
        document.documentElement.removeAttribute('data-marca-propia');
      }
    }
  }

  function sincronizar() { if (activa()) poner(); else sacar(); }

  /* ⚠️⚠️ ESTO FALTABA Y LA COLECCIÓN SALÍA APAGADA. Medido el 23/9/2026
     corriendo `?chequeo=1`: `INVEV.fx.coleccion` decía 'bella', `INVBELLA`
     estaba cargado… y `data-col` era null, la hoja `col-bella` no existía y
     `INVCOLPALETA` estaba sin definir. O sea: la invitación se veía SIN la
     colección, y de forma INTERMITENTE — en las corridas de Playwright sí
     aplicaba.
     LA CAUSA: `arrancar()` miraba `activa()` en tres momentos (ya, DOMContentLoaded
     y load) y `INVEV` puede llegar DESPUÉS de los tres. Si llega tarde, la
     colección no se prende nunca y no hay ningún error en consola.
     LA CURA, que es la de Cenicienta y la de Cantera: un repaso cada 1,2 s.
     Y `arrancar()` mismo espera a que haya documento. */
  function arrancar() {
    sincronizar();
    setInterval(sincronizar, 1200);
    document.addEventListener('DOMContentLoaded', sincronizar);
    window.addEventListener('load', sincronizar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();

  window.INVBELLA = { poner: poner, sacar: sacar, css: armarCSS, rosa: rosaSVG };
})();
