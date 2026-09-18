/* ══════════════════════════════════════════════════════════════════════════
   EL VESTIDO BÁSICO: lo que se pone la invitación CUANDO NO HAY COLECCIÓN.
   ══════════════════════════════════════════════════════════════════════════

   Maki, 17/9/2026, mirando el XV de Martina —que no tiene colección elegida—:

     «en la parte del qr ponele un recuadro con buen diseño como en perlas
      que quedó bueno pero algo así o diferente pero salí de lo plano»
     «el fondo del itinerario no se puede poner alguna textura clara?»

   Perlas y Marfil visten TODO. Una invitación sin colección se quedaba con lo
   que trae el motor: una caja de vidrio sobre una foto, y un itinerario
   flotando sobre el papel. Plano.

   Este módulo es el piso: el vestido que tiene CUALQUIER invitación aunque
   nadie elija colección.

   ══════════════════════════════════════════════════════════════════════════
   ★★★ EL ERROR QUE ORIGINÓ LA SEGUNDA VERSIÓN  (17/9/2026)
   ══════════════════════════════════════════════════════════════════════════

   La primera versión vestía todo con UNA textura de papel dibujada por CSS:
   marfil con rayitas de papel verjurado. Prolijo, sí. Pero era la MISMA en
   todas las invitaciones. Maki lo cazó mirando la boda en la playa:

     «El fondo de itinerario es igual que el de XV, no me gusta nada: todo
      tiene que ver con la temática siempre, si no, no sirve.»
     «El pase está todo blanco, no le pusiste ganas a esta invitación.»
     «Podrías haber armado en Flow los fondos como las de Perlas, y detalle de
      todo, así la arma cualquiera. Quiero detalle de toda la temática.»

   La lección: **una textura genérica no es un vestido, es un uniforme.** Dos
   bodas distintas con el mismo papel se ven como la misma invitación con otro
   texto, que es exactamente lo que ella no quiere vender.

   Entonces ahora el vestido NO trae su propia textura: **se la pide al
   evento**. Cada muestra genera su temática en Flow (agua, nácar, cantera,
   lino…) y la declara una sola vez. El vestido la usa en todas las hojas.

   ══════════════════════════════════════════════════════════════════════════
   CÓMO SE LE DA LA TEMÁTICA A UNA INVITACIÓN
   ══════════════════════════════════════════════════════════════════════════

     INVEV.fx.tematica = {
       papel:  'https://…',   // LA textura clara de esta temática. Va detrás
                              //   del itinerario, el pase, la raspadita y las
                              //   tapas de la playlist y el video.
       velo:   0.55,          // cuánto se aclara esa textura para que el texto
                              //   se lea encima (0 = la foto cruda, 1 = blanco)
       tinta:  '#1f3a44',     // la tinta de los datos sobre esas hojas
       tinta2: '#4a6670',     // los rótulos chiquitos (NOMBRE, MESA, …)
       borde:  'rgba(31,58,68,.20)'   // el filete de las hojas
     }

   Si `papel` no está, el vestido vuelve al papel verjurado de CSS de la
   primera versión: así el XV de Martina —que todavía no tiene temática
   declarada— no se rompe y sigue viéndose como hasta ahora.

   ⚠⚠ NO SE APLICA SI HAY COLECCIÓN. `html:not([data-coleccion])` es toda la
      regla: Perlas y Marfil ya resolvieron estos bloques a su manera y
      pisarlos sería romperles el diseño. Por eso tampoco hace falta orden de
      carga: el selector se apaga solo.

   ⚠ LA TEMÁTICA LLEGA TARDE. El módulo carga antes que los datos de Firestore.
     Por eso se vuelve a pintar unas cuantas veces durante los primeros seis
     segundos y, si la temática cambió, se rehace la hoja de estilos entera.
     Sin esto, la invitación arrancaba con el papel de respaldo y se quedaba
     con él para siempre.

   ══════════════════════════════════════════════════════════════════════════
   ★★ LAS TRES PERSONAS VAN EN UNA FILA — SIEMPRE
   ══════════════════════════════════════════════════════════════════════════

     Maki, 17/9/2026: «te dije en la skill de armado que las 3 personas tienen
     que estar en línea, no una abajo. Anotalo y respetalo.»

   El motor las pone en una grilla de dos columnas: con tres personas quedan
   dos arriba y una colgada abajo, desbalanceado. Acá se fuerza `grid-auto-flow:
   column`, que las deja en UNA sola fila sea cual sea la cantidad, y se achica
   el círculo para que tres entren cómodas en el ancho de un celular.

   ⚠ Esto NO depende de la temática: es una regla de armado y va siempre.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var ID = 'inv-vestido-basico';
  var NO_COL = 'html:not([data-coleccion]) ';

  /* el papel de respaldo, cuando el evento todavía no declaró su temática */
  var PAPEL_CSS = [
    '  background-color:#faf7f1;',
    '  background-image:',
    '    repeating-linear-gradient(0deg, rgba(120,104,86,.055) 0 1px, rgba(0,0,0,0) 1px 3px),',
    '    repeating-linear-gradient(90deg, rgba(120,104,86,.04) 0 1px, rgba(0,0,0,0) 1px 4px),',
    '    radial-gradient(130% 90% at 50% 0%, rgba(255,255,255,.95), rgba(244,238,229,.95));'
  ].join('\n');

  function tema() {
    try { return (((window.INVEV || {}).fx) || {}).tematica || {}; }
    catch (e) { return {}; }
  }

  function firma(t) {
    return [t.papel || '', t.velo, t.tinta || '', t.tinta2 || '', t.borde || ''].join('|');
  }

  /* la hoja de papel de ESTA temática */
  function hoja(t) {
    if (!t.papel) return PAPEL_CSS;
    var v = (t.velo === undefined || t.velo === null) ? 0.55 : Number(t.velo);
    if (!(v >= 0 && v <= 1)) v = 0.55;
    var blanco = 'rgba(255,255,255,' + v + ')';
    return [
      '  background-color:#f6f3ed;',
      '  background-image:linear-gradient(' + blanco + ',' + blanco + '),',
      '    url("' + String(t.papel).replace(/"/g, '%22') + '");',
      '  background-size:cover, cover;',
      '  background-position:center, center;'
    ].join('\n');
  }

  function armarCSS() {
    var t      = tema();
    var papel  = hoja(t);
    var tinta  = t.tinta  || '#2f2a26';
    var tinta2 = t.tinta2 || '#6a6156';
    var borde  = t.borde  || 'rgba(120,104,86,.20)';
    var bordeF = t.borde  || 'rgba(120,104,86,.13)';

    return [

      /* ── EL PASE CON EL QR ────────────────────────────────────────────
         Maki: «salí de lo plano» y, en la playa, «el pase está todo blanco».
         Es una LÁMINA con la textura de la temática: esquina casi recta, dos
         filetes (uno al borde y otro por dentro, que es lo que le da el aire
         de papelería fina), y el QR levantado con su sombra.
         ⚠ La lámina es CLARA y su tinta va fijada acá. La probé primero oscura
           y semitransparente: sobre la banda rosa clara de Martina quedaba una
           mancha gris. Un pase tiene que verse igual de bien sobre una banda
           clara, una oscura o una foto — por eso la hoja no depende del fondo
           que tenga abajo, sino de la temática del evento. */
      NO_COL + '.pase .pasecard {',
      papel,
      '  background-attachment:scroll !important;',
      '  -webkit-backdrop-filter:none !important; backdrop-filter:none !important;',
      '  border:1px solid ' + borde + ' !important;',
      '  border-radius:3px !important;',
      '  box-shadow:0 1px 0 rgba(255,255,255,.9) inset,',
      '             0 16px 36px rgba(20,16,14,.28) !important;',
      '  max-width:330px !important; margin:0 auto !important;',
      '  padding:24px 20px !important; position:relative !important;',
      '  color:' + tinta + ' !important;',
      '}',
      NO_COL + '.pase .pasecard::before {',
      '  content:""; position:absolute; inset:6px; pointer-events:none;',
      '  border:1px solid ' + bordeF + ';',
      '}',
      NO_COL + '.pase .pasecard .v { color:' + tinta + ' !important; }',
      NO_COL + '.pase .pasecard .k {',
      '  opacity:1 !important; color:' + tinta2 + ' !important;',
      '  letter-spacing:.2em !important; text-transform:uppercase !important;',
      '}',
      NO_COL + '.pase #qr {',
      '  background:#fff !important; padding:9px !important;',
      '  border-radius:2px !important;',
      '  box-shadow:0 0 0 1px ' + borde + ',',
      '             0 2px 4px rgba(20,16,14,.16) !important;',
      '}',

      /* ── EL ITINERARIO, SOBRE LA HOJA DE LA TEMÁTICA ──────────────────
         ⚠ Va en `.tl` —la línea de tiempo— y no en la sección entera: así el
           título y el adorno siguen sobre el fondo de la invitación, y lo que
           se levanta como hoja es sólo la lista de momentos. */
      NO_COL + '.tl {',
      '  position:relative; padding:26px 22px !important;',
      '  margin:18px auto 0 !important; max-width:420px;',
      '  border-radius:3px;',
      papel,
      '  border:1px solid ' + borde + ';',
      '  box-shadow:0 1px 0 rgba(255,255,255,.85) inset,',
      '             0 12px 30px rgba(30,24,20,.14);',
      '}',
      NO_COL + '.tl::after {',
      '  content:""; position:absolute; inset:6px; pointer-events:none;',
      '  border:1px solid ' + bordeF + ';',
      '}',

      /* ── LA RASPADITA ─────────────────────────────────────────────────
         Era una caja blanca con tres monedas grises encima: lo único de la
         invitación que no pertenecía a ninguna boda. Ahora es otra hoja de la
         misma temática, con el mismo filete que el pase y el itinerario. */
      NO_COL + '.scratchcard {',
      '  position:relative;',
      papel,
      '  border:1px solid ' + borde + ' !important;',
      '  border-radius:3px !important;',
      '  box-shadow:0 1px 0 rgba(255,255,255,.85) inset,',
      '             0 12px 28px rgba(30,24,20,.16) !important;',
      '}',
      NO_COL + '.scratchcard::after {',
      '  content:""; position:absolute; inset:6px; pointer-events:none;',
      '  border:1px solid ' + bordeF + ';',
      '}',
      NO_COL + '.scratch-sec .scratch-hint { color:' + tinta2 + ' !important; opacity:1 !important; }',
      NO_COL + '.sc-day, ' + NO_COL + '.sc-mon { color:' + tinta + ' !important; }',

      /* ── LAS TAPAS DIBUJADAS (playlist y video) ───────────────────────
         `.rd-tapa` es lo que tapa el preview crudo de YouTube y la caja de
         Spotify. Existía para que no se vea el crudo, pero era un rectángulo
         blanco: cumplía la regla y arruinaba el diseño. Ahora es de la
         temática, como todo lo demás. */
      NO_COL + '.rd-tapa {',
      papel,
      '  border:1px solid ' + borde + ' !important;',
      '  border-radius:3px !important;',
      '  box-shadow:0 1px 0 rgba(255,255,255,.8) inset,',
      '             0 10px 26px rgba(30,24,20,.14) !important;',
      '  color:' + tinta + ' !important;',
      '}',

      /* ── LAS PERSONAS, EN UNA SOLA FILA ───────────────────────────────
         Regla de Maki, no de temática: va con o sin `fx.tematica`. */
      NO_COL + '.padres {',
      '  display:grid !important;',
      '  grid-auto-flow:column !important;',
      '  grid-template-columns:none !important;',
      '  grid-auto-columns:1fr !important;',
      '  gap:8px !important;',
      '  justify-content:center !important;',
      '  align-items:start !important;',
      '}',
      NO_COL + '.padres .p { min-width:0 !important; }',
      NO_COL + '.padres .av {',
      '  width:76px !important; height:76px !important; margin:0 auto !important;',
      '}',
      NO_COL + '.padres .nm { font-size:.92em !important; line-height:1.25 !important; }',
      NO_COL + '.padres .rl { font-size:.78em !important; line-height:1.25 !important; }'

    ].join('\n');
  }

  var ultimaFirma = null;

  function poner() {
    var t = tema();
    var f = firma(t);
    var s = document.getElementById(ID);
    if (s && f === ultimaFirma) return;
    ultimaFirma = f;
    if (!s) {
      s = document.createElement('style');
      s.id = ID;
      (document.head || document.documentElement).appendChild(s);
    }
    s.textContent = armarCSS();
  }

  /* ⚠ la temática llega de Firestore DESPUÉS que este archivo: se repasa */
  function arrancar() {
    poner();
    var n = 0;
    var t = setInterval(function () {
      poner();
      if (++n > 24) clearInterval(t);   /* 24 × 250 ms = 6 s */
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
