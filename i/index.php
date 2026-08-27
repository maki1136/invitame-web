<?php
/**
 * Invitame — render dinamico de la portada para vista previa (WhatsApp/Facebook/etc).
 * Lee el evento desde Firestore por el parametro ?e=slug y arma los meta tags
 * Open Graph con la imagen, nombres y frase de ESA pareja.
 * Si algo falla, cae en los valores por defecto que ya trae index.html (nunca rompe).
 */

$SITE = 'https://invitame.littlemomentsok.com';
$PROJECT = 'invitame-9b51f';
// Versión base: la que estaba viva cuando arrancó el versionado.
$BASE_VER = '2026-07-20';

/* ===== LOS SOBRES QUE SON VIDEO ===============================================
   ⚠️ ESTA LISTA ESTÁ DUPLICADA A PROPÓSITO. La original vive en
   /sobres/catalogo.js (los que tienen `video`). Acá hace falta otra vez porque
   el servidor tiene que saber ANTES de mandar el HTML si este sobre es un
   video, y no puede leer un archivo .js.

   SI SE AGREGA UN SOBRE CON VIDEO AL CATÁLOGO, HAY QUE SUMARLO ACÁ TAMBIÉN.
   Si alguien se olvida, no se rompe nada: sólo vuelve a verse el parpadeo feo
   del sobre viejo mientras carga.

   `carta` en true significa que ese sobre usa además el sistema `.ct-*` (la
   tarjeta que se escribe sola). A ese no se le apaga `.ct-wrap`.
   ============================================================================ */
$SOBRES_VIDEO = array(
  'lacre'         => array('poster' => '/sobres/sobre-lacre-poster.jpg',   'carta' => false),
  'flores'        => array('poster' => '/sobres/sobre-flores-poster.jpg',  'carta' => false),
  'lazo'          => array('poster' => '/sobres/sobre-lazo-poster.jpg',    'carta' => false),
  'toscana'       => array('poster' => '/sobres/sobre-toscana-poster.jpg', 'carta' => false),
  'carta-toscana' => array('poster' => '/sobres/carta-toscana-poster.jpg', 'carta' => true)
);

/* ===== LA TABLA DE LOS DATOS DE EJEMPLO =======================================
   Se lee ACÁ ARRIBA, antes de hablar con Firestore, porque de la propia tabla
   sale la lista de campos que hay que pedirle. Así, sumar un elemento nuevo se
   hace en `i/sin-demo.php` y NO hay que tocar este archivo.
   ============================================================================ */
$DEMO_APAGAR = array();
$DEMO_CAMPOS = array();
$tablaDemo = __DIR__ . '/sin-demo.php';
if (is_file($tablaDemo)) {
  include $tablaDemo;
  foreach ($DEMO_APAGAR as $claves) {
    foreach ($claves as $k) { $DEMO_CAMPOS[$k] = true; }
  }
  $DEMO_CAMPOS = array_keys($DEMO_CAMPOS);
}

// slug seguro
$slug = isset($_GET['e']) ? strtolower($_GET['e']) : '';
$slug = preg_replace('/[^a-z0-9\-]/', '', $slug);

$img = ''; $title = ''; $desc = ''; $kick = ''; $ver = ''; $sobre = '';
$coverReal = ''; $idioma = '';

/* Los valores de esos campos para ESTE evento.
   `$leyoEvento` queda en false si Firestore no contestó: en ese caso NO se
   apaga nada, porque no sabemos qué cargó la clienta. */
$campos = array(); $leyoEvento = false;

if ($slug !== '') {
  $url = 'https://firestore.googleapis.com/v1/projects/' . $PROJECT .
         '/databases/(default)/documents/inv_eventos/' . rawurlencode($slug);
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_TIMEOUT        => 4,
    CURLOPT_SSL_VERIFYPEER => true,
  ]);
  $res  = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if ($res && $code == 200) {
    $data = json_decode($res, true);
    $f = isset($data['fields']) ? $data['fields'] : [];
    $sv = function ($k) use ($f) { return isset($f[$k]['stringValue']) ? trim($f[$k]['stringValue']) : ''; };

    // Devuelve el primer valor no vacío de una lista de claves.
    // (El admin cambió de convención con los acentos: antes 'im-gen', ahora 'imagen'.
    //  Probamos todas para no depender de eso y que nunca se desconecte en silencio.)
    $firstOf = function ($keys) use ($sv) {
      foreach ($keys as $k) {
        $v = $sv($k);
        if ($v !== '') return $v;
      }
      return '';
    };

    // 1) imagen: primero la "miniatura al compartir", si no, la portada (cover)
    $img = $firstOf(array(
      'img_c_imagen-miniatura-al-compartir',
      'img_f-im-gen-miniatura-al-compartir',
      'img_c_im-gen-miniatura-al-compartir',
      'img_f-imagen-miniatura-al-compartir'
    ));
    $coverReal = $sv('cover');
    if ($img === '') $img = $coverReal;

    // 2) titulo: el "Titulo al compartir" si lo cargaron; si no, los nombres de la pareja
    $title = $firstOf(array('c_titulo-al-compartir'));
    if ($title !== '') $titleEsPropio = true;   // si es propio, NO se le agrega el sufijo
    if ($title === '') {
      $n1 = $sv('n1');
      $n2 = $sv('n2');
      if ($n1 !== '' || $n2 !== '') {
        $title = trim($n1 . ($n1 && $n2 ? ' & ' : '') . $n2);
      }
    }

    // 3) descripcion: la "Descripción al compartir" si la cargaron; si no, la frase del evento
    $desc = $firstOf(array('c_descripcion-al-compartir', 'c_descripci-n-al-compartir', 'frase'));

    // 4) textito de arriba (Nuestra Boda / Mis XV / Mi Bautismo...) para el subtítulo
    $kick = $sv('kick');

    // 5) VERSION con la que se publicó esta invitación (para que no la afecten cambios futuros)
    $ver = $sv('ver');

    // 6) EL IDIOMA, para saber si hay que pasar los textos a español de México
    $idioma = $sv('idioma');

    // 7) QUÉ SOBRE ES. Vive anidado: fx → sobre → modelo.
    if (isset($f['fx']['mapValue']['fields']['sobre']['mapValue']['fields']['modelo']['stringValue'])) {
      $sobre = trim($f['fx']['mapValue']['fields']['sobre']['mapValue']['fields']['modelo']['stringValue']);
    }

    // 8) LOS CAMPOS QUE TAPAN LOS DATOS DE EJEMPLO. La lista sale de la tabla.
    foreach ($DEMO_CAMPOS as $k) { $campos[$k] = $sv($k); }
    $leyoEvento = true;
  }
}

// ===== VERSIONADO =====
// Cada invitación queda clavada a la versión con la que se publicó.
// Se puede forzar una versión por URL (?ver=) para la vista previa del panel.
if (isset($_GET['ver']) && $_GET['ver'] !== '') { $ver = $_GET['ver']; }
// Las invitaciones publicadas ANTES del versionado no tienen 'ver' guardado.
if ($ver === '') { $ver = $BASE_VER; }
$ver = preg_replace('/[^a-zA-Z0-9._-]/', '', (string)$ver);

$tpl = false;

/* ===== LA VERSIÓN "viva" ======================================================

   Una invitación con `ver = viva` se sirve con el motor que está hoy en
   /prueba/. Es para las MUESTRAS.
   ============================================================================ */
if ($ver === 'viva') {
  $tpl = @file_get_contents(dirname(__DIR__) . '/prueba/index.html');
}

if ($tpl === false && $ver !== '') {
  $ruta = __DIR__ . '/v/' . $ver . '/index.html';
  if (is_file($ruta)) { $tpl = @file_get_contents($ruta); }
}
// Sin versión (o versión inexistente) => la última. Nunca rompe.
if ($tpl === false) { $tpl = @file_get_contents(__DIR__ . '/index.html'); }
if ($tpl === false) { http_response_code(500); echo 'Error'; exit; }


/* ===== LO QUE SE VE ANTES DE QUE CORRA UN SOLO SCRIPT =========================

   ⚠️⚠️ ACÁ ESTÁN LOS SEIS BUGS MÁS FEOS QUE TUVO LA PLATAFORMA. LEER ANTES DE TOCAR.

   EL PATRÓN, QUE ES EL MISMO EN CASI TODOS
   El `index.html` trae valores POR DEFECTO escritos a mano —fotos de banco de
   imágenes, textos en argentino, una boda entera inventada— y el encuadre de la
   pantalla grande lo pone un `<script defer>`. Todo eso llega DESPUÉS del primer
   pintado. En ese hueco de uno o dos segundos el invitado ve cosas que no son
   suyas o mal armadas. Los scripts diferidos no llegan a tiempo.

   Por eso todo esto se resuelve ACÁ, en el servidor, que ya leyó el evento de
   Firestore y escribe los valores correctos antes de mandar el HTML.

   ⚠️ LA REGLA: si algo se ve mal SÓLO EL PRIMER SEGUNDO, y "se acomoda" al
   recargar, NO se arregla en el módulo de /efectos/. Se arregla acá.

   ⚠️ Y PARA ENCONTRARLOS HAY QUE PROBAR CON RED LENTA Y CACHÉ VACÍA. En una
   máquina rápida el archivo llega en 5 ms y el bug no aparece — pero está.

   BUG 1 — EL SOBRE ROTO
   Antes de cargar el video se veía OTRO sobre a pantalla completa. Se arregló
   mal tres veces:
   1. Se lo trató como bug de Safari. No lo era: pasaba en todos lados.
   2. Se arregló en el CSS de /sobres/catalogo.js, que es `defer` y encima
      apunta a `#env.carta-video`, clase que agrega el JS. Llegaba tarde Y no
      matcheaba nada.
   3. Adentro de `#env` conviven CUATRO sobres superpuestos, no dos:
        · `.triflap` + `#tri-glow` + `#tri-seal`   (el de cuatro solapas)
        · `#scene` → `.envelope`, `.e-back`, `.e-pocket`, `.e-flap`, `.e-tint`,
                     `.seal`, `#ephoto`, `#hint`   (el clásico)
        · `.ct-wrap` → la tarjeta que se escribe sola
        · `#env-vid` → el video
      Se escribió `#e-back` con almohadilla y son CLASES: por eso seguía.
   4. Y el principal: `#env-vid` nace en `display:none`. Apagar los otros tres
      sin encender el video dejaba la pantalla VACÍA.

   BUG 2 — LA PORTADA DE OTRA INVITACIÓN
   Al tocar el sello se veía la foto de OTRA pareja. `--cover` está escrita a
   mano en el `:root`; el motor la pisa por JS, pero el primer pintado ya pasó.

   BUG 3 — LA PORTADA SALÍA A LO ANCHO UN INSTANTE
   El encuadre de la columna lo inyectaba `efectos/encuadre-monitor.js`,
   diferido. Ahora ese CSS va también en el `<head>`, con EL MISMO `id` que usa
   el módulo, así el módulo lo encuentra puesto y no lo duplica.

   BUG 4 — DECÍA "INGRESÁ" Y "TOCÁ EL SELLO"
   El motor está escrito en voseo y lo traducía un módulo diferido. Ahora los
   textos se cambian ACÁ, antes de mandar el HTML.

   ⚠️⚠️ ESTE ARREGLO SALIÓ MAL LA PRIMERA VEZ POR ALGO QUE NO SE VE: la
   condición era `preg_match('/m[eé]xico|mx/i', $idioma)` y NUNCA daba
   verdadero. En UTF-8 la `é` son DOS bytes; sin la marca `u`, la clase `[eé]`
   es un conjunto de BYTES: consume el primer byte y choca contra el segundo.
   Fallaba en silencio. Ahora se busca `xico`, sin regex.

   BUG 5 — LA BODA DE OTRA GENTE ADENTRO DE LA INVITACIÓN
   El motor trae una boda entera inventada escrita a mano y sólo la PISA cuando
   hay dato: si la clienta dejó el campo vacío, se queda la de ejemplo. Unos XV
   mostraban la ceremonia en la "Basílica de Santa María" y un cumpleaños decía
   "Fiesta — Basílica de Santa María". La tabla está en `i/sin-demo.php`.

   BUG 6 — LAS INVITACIONES SE ENTREGABAN SIN LA MITAD DE LAS FUNCIONES
   El más caro de todos, y el más silencioso. Las carpetas congeladas de `i/v/`
   y el `i/index.html` de respaldo NO tienen la etiqueta que carga
   `/sobres/catalogo.js`, que es el ÚNICO enganche de los 14 módulos de
   `/efectos/`. Sólo la tiene `/prueba/`.

   O sea que una invitación vendida se entregaba SIN raspadita, SIN calendario,
   SIN el sector de música, SIN el arreglo de la foto del cierre y SIN los
   textos plegados. Los elementos estaban en el HTML, pero no había nada que
   los manejara. No se notaba porque las muestras se miraban en /prueba/, que
   sí los tiene.

   Se arregla abajo, inyectando la etiqueta desde el servidor: no hay que tocar
   los HTML de 200 KB, y ninguna invitación —vieja o nueva— queda sin nada.
   ============================================================================ */

$preFirma = '';

/* --- la portada de verdad, desde el primer frame --- */
if ($coverReal !== '') {
  $c = str_replace(array('"', '\\'), '', $coverReal);
  $preFirma .= ':root{--cover:url("' . $c . '")!important}';
}

/* --- el sobre --- */
if ($sobre !== '' && isset($SOBRES_VIDEO[$sobre])) {
  $poster    = $SOBRES_VIDEO[$sobre]['poster'];
  $usaCarta  = $SOBRES_VIDEO[$sobre]['carta'];
  $alto  = 'min(84vh,843px)';
  $ancho = 'calc(' . $alto . ' * 9 / 16)';

  /* los otros tres sobres, apagados */
  $apagar = '#env .triflap,#env #tri-glow,#env #tri-seal,#env #scene';
  if (!$usaCarta) $apagar .= ',#env .ct-wrap';

  $preFirma .=
    $apagar . '{display:none!important}' .

    /* la foto del sobre, pintada en el primer frame (el video tarda) */
    '#env::before{content:"";position:absolute;inset:0;z-index:1;' .
    '  background:#efe9e0 url("' . $poster . '") center/cover no-repeat;' .
    '  pointer-events:none}' .

    /* ⚠️ encender el video: nace en display:none. Sin esto queda todo vacío. */
    '#env-vid{display:block!important;position:absolute;inset:0;' .
    '  width:100%;height:100%;object-fit:cover;z-index:2}' .

    '@media (min-width:680px){' .
    '  #env{background:#cfc4b4}' .
    '  #env::before,#env-vid{' .
    '    inset:auto!important;' .
    '    left:50%!important;top:50%!important;' .
    '    transform:translate(-50%,-50%)!important;' .
    '    height:' . $alto . '!important;width:' . $ancho . '!important;' .
    '    max-width:92vw!important;border-radius:30px;' .
    '    box-shadow:0 32px 74px rgba(40,28,12,.34)}' .
    '}';
}

$encuadreSobre = ($preFirma !== '')
  ? '<style id="sobre-encuadre-servidor">' . $preFirma . '</style>'
  : '';

/* ===== EL ENCUADRE DE LA COLUMNA, DESDE EL PRIMER FRAME =======================
   ⚠️ Copia exacta del CSS de `efectos/encuadre-monitor.js`, con el MISMO id.
   El módulo hace `if (document.getElementById('encuadre-monitor')) return;`
   antes de inyectar el suyo, así que al encontrarlo ya puesto no lo duplica.
   SI SE CAMBIA ESE CSS EN EL MÓDULO, HAY QUE CAMBIARLO ACÁ TAMBIÉN.
   ============================================================================ */
$encuadreColumna =
  '<style id="encuadre-monitor">' .
  '#inv-lienzo,#inv-vinieta{display:none}' .
  '@media (min-width:680px){' .
  '  #inv-lienzo{display:block;position:fixed;inset:0;z-index:-2;' .
  '    background-size:cover;background-position:center;' .
  '    filter:blur(70px) saturate(.65) brightness(.92);transform:scale(1.3)}' .
  '  #inv-vinieta{display:block;position:fixed;inset:0;z-index:-1;pointer-events:none;' .
  '    background:radial-gradient(120% 85% at 50% 45%,rgba(0,0,0,0) 36%,' .
  '    rgba(0,0,0,.18) 76%, rgba(0,0,0,.34) 100%)}' .
  '  html{background:#cfc4b4}' .
  '  .frame{max-width:var(--inv-col,474px);margin-left:auto;margin-right:auto;' .
  '    overflow:hidden;box-shadow:0 32px 74px rgba(40,28,12,.34)}' .
  '  .frame img{max-width:100%;height:auto}' .
  '}' .
  '</style>';

/* ===== APAGAR LA BODA DE EJEMPLO (BUG 5) =====================================
   La tabla vive en `i/sin-demo.php` y ya se leyó arriba. Sumar uno nuevo cuesta
   una línea allá y NADA acá.

   ⚠️ Sólo si Firestore contestó. Si no leímos el evento no sabemos qué cargó la
   clienta, y apagar a ciegas le borraría la invitación: ante la duda, se
   muestra de más y no de menos.
   ============================================================================ */
$sinDemo = '';
if ($leyoEvento && $DEMO_APAGAR) {
  $aApagar = array();
  foreach ($DEMO_APAGAR as $sel => $claves) {
    $tieneAlgo = false;
    foreach ($claves as $k) {
      if (isset($campos[$k]) && $campos[$k] !== '') { $tieneAlgo = true; break; }
    }
    if (!$tieneAlgo) $aApagar[] = $sel;
  }
  if ($aApagar) {
    $sinDemo = '<style id="sin-demo-servidor">' .
               implode(',', $aApagar) . '{display:none!important}</style>';
  }
}

/* ===== QUE TODAS LAS INVITACIONES TENGAN TODO (BUG 6) =========================

   `/sobres/catalogo.js` es el único enganche: carga `efectos/index.js` y con él
   los 14 módulos. Las carpetas congeladas de `i/v/` no lo tienen, así que las
   invitaciones vendidas salían sin raspadita, sin calendario, sin música, sin
   el arreglo de la foto del cierre y sin los textos plegados.

   Se agrega acá, para TODAS. Es `defer`, así que no frena nada, y cada módulo
   ya está escrito para no hacer nada si no le toca.

   ⚠️ SE COMPRUEBA ANTES DE PONERLO. Si el HTML ya lo trae —el motor de
   /prueba/ sí— no se duplica.

   ⚠️ QUÉ SIGNIFICA ESTO PARA EL CONGELADO. Antes, una invitación entregada
   quedaba clavada para siempre. Ahora el HTML sigue clavado, pero los MÓDULOS
   son los de hoy. Es a propósito: es la única forma de que un arreglo llegue a
   quien ya compró. La contra es que un error nuevo en un módulo también llega:
   por eso el banco de pruebas corre contra la invitación de verdad antes de
   dar nada por bueno.
   ============================================================================ */
$engancheModulos = (strpos($tpl, 'catalogo.js') === false)
  ? '<script src="/sobres/catalogo.js" defer></script>'
  : '';

/* ===== LOS ARREGLOS DE ESTILO QUE VALEN PARA TODAS ============================
   Van en `i/estilos-servidor.css`, un archivo chico y aparte. La idea es la
   misma que con la lista de palabras mexicanas: retocar un estilo tiene que
   costar editar ese archivo, no reescribir este entero.
   Si el archivo no está, no pasa nada: simplemente no se inyecta.
   ============================================================================ */
$hojaExtra = @file_get_contents(__DIR__ . '/estilos-servidor.css');
$estilosServidor = ($hojaExtra !== false && trim($hojaExtra) !== '')
  ? '<style id="estilos-servidor">' . $hojaExtra . '</style>'
  : '';

/* el cartel rojo sólo cuando se sirve el motor de /prueba/ desde acá */
$apagarBanner = ($ver === 'viva') ? '<style>#banner-prueba{display:none!important}</style>' : '';

$aInyectar = $apagarBanner . $encuadreColumna . $encuadreSobre . $sinDemo .
             $estilosServidor . $engancheModulos;
if ($aInyectar !== '') {
  if (strpos($tpl, '</head>') !== false) {
    $tpl = str_replace('</head>', $aInyectar . '</head>', $tpl);
  } else {
    $tpl = $aInyectar . $tpl;
  }
}


/* ===== ESPAÑOL DE MÉXICO, EN EL HTML, ANTES DE MANDARLO ======================

   Ver la nota larga de BUG 4 arriba.

   ⚠️ CÓMO SE DETECTA EL IDIOMA: NO con expresión regular. La `é` de "México"
   son dos bytes en UTF-8 y sin la marca `u` la condición falla EN SILENCIO.
   Se busca `xico`, que agarra "México" y "Mexico" sin depender del acento.

   ⚠️ LA LISTA DE PALABRAS VIVE EN `i/textos-es-mx.php`, no acá.
   ============================================================================ */
$idiomaMin = function_exists('mb_strtolower')
  ? mb_strtolower($idioma, 'UTF-8')
  : strtolower($idioma);

$esMexico = ($idioma !== '') &&
            (strpos($idiomaMin, 'xico') !== false || strpos($idiomaMin, 'mx') !== false);

if ($esMexico) {
  $listas = __DIR__ . '/textos-es-mx.php';
  if (is_file($listas)) {
    $ES_MX_FRASES = array(); $ES_MX_PALABRAS = array();
    include $listas;
    /* las frases van PRIMERO: "Pasá la voz" es "Corre la voz", no "Pasa la voz" */
    if ($ES_MX_FRASES)   $tpl = str_replace(array_keys($ES_MX_FRASES),   array_values($ES_MX_FRASES),   $tpl);
    if ($ES_MX_PALABRAS) $tpl = str_replace(array_keys($ES_MX_PALABRAS), array_values($ES_MX_PALABRAS), $tpl);
  }
}


// setter seguro de meta tags (reemplaza solo el content, sin romper el HTML)
function setMeta($tpl, $attr, $key, $val) {
  if ($val === '') return $tpl;
  $val = htmlspecialchars($val, ENT_QUOTES, 'UTF-8');
  $pat = '/(<meta ' . $attr . '="' . preg_quote($key, '/') . '" content=")[^"]*(">)/';
  return preg_replace_callback($pat, function ($m) use ($val) {
    return $m[1] . $val . $m[2];
  }, $tpl, 1);
}

if ($img !== '') {
  // asegurar URL absoluta
  if (strpos($img, 'http') !== 0) {
    $img = $SITE . ($img[0] === '/' ? '' : '/i/') . $img;
  }
  $tpl = setMeta($tpl, 'property', 'og:image', $img);
  $tpl = setMeta($tpl, 'name', 'twitter:image', $img);
}
if ($title !== '') {
  // Suffix con el textito real del evento (ej: "Mis XV"). Si no hay, solo los nombres.
  $sfx = ($kick !== '' && empty($titleEsPropio)) ? ' — ' . $kick : '';
  $tpl = setMeta($tpl, 'property', 'og:title', $title . $sfx);
  $tpl = setMeta($tpl, 'name', 'twitter:title', $title . $sfx);
}
if ($desc !== '') {
  $tpl = setMeta($tpl, 'property', 'og:description', $desc);
  $tpl = setMeta($tpl, 'name', 'description', $desc);
}

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
echo $tpl;
