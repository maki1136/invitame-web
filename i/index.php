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
   ============================================================================ */
$SOBRES_VIDEO = array(
  'lacre'         => array('poster' => '/sobres/sobre-lacre-poster.jpg',   'carta' => false),
  'flores'        => array('poster' => '/sobres/sobre-flores-poster.jpg',  'carta' => false),
  'lazo'          => array('poster' => '/sobres/sobre-lazo-poster.jpg',    'carta' => false),
  'toscana'       => array('poster' => '/sobres/sobre-toscana-poster.jpg', 'carta' => false),
  'carta-toscana' => array('poster' => '/sobres/carta-toscana-poster.jpg', 'carta' => true)
);

/* ===== LAS TABLAS QUE MANDAN ==================================================
   Se leen ACÁ ARRIBA, antes de hablar con Firestore, porque de ellas sale la
   lista de campos que hay que pedirle. Así, sumar una paleta, un tamaño o un
   elemento a apagar NO obliga a tocar este archivo.
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

$PALETAS = array(); $TAMANOS = array();
$tablaPaletas = __DIR__ . '/paletas.php';
if (is_file($tablaPaletas)) { include $tablaPaletas; }

// slug seguro
$slug = isset($_GET['e']) ? strtolower($_GET['e']) : '';
$slug = preg_replace('/[^a-z0-9\-]/', '', $slug);

$img = ''; $title = ''; $desc = ''; $kick = ''; $ver = ''; $sobre = '';
$coverReal = ''; $idioma = ''; $paleta = '';

$campos = array(); $tamElegidos = array(); $leyoEvento = false;

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

    // 2) titulo al compartir, o los nombres de la pareja
    $title = $firstOf(array('c_titulo-al-compartir'));
    if ($title !== '') $titleEsPropio = true;
    if ($title === '') {
      $n1 = $sv('n1'); $n2 = $sv('n2');
      if ($n1 !== '' || $n2 !== '') $title = trim($n1 . ($n1 && $n2 ? ' & ' : '') . $n2);
    }

    // 3) descripcion al compartir, o la frase del evento
    $desc = $firstOf(array('c_descripcion-al-compartir', 'c_descripci-n-al-compartir', 'frase'));

    $kick   = $sv('kick');
    $ver    = $sv('ver');
    $idioma = $sv('idioma');
    $paleta = strtolower($sv('paleta'));

    // QUÉ SOBRE ES. Vive anidado: fx → sobre → modelo.
    if (isset($f['fx']['mapValue']['fields']['sobre']['mapValue']['fields']['modelo']['stringValue'])) {
      $sobre = trim($f['fx']['mapValue']['fields']['sobre']['mapValue']['fields']['modelo']['stringValue']);
    }

    // los campos que tapan los datos de ejemplo (la lista sale de la tabla)
    foreach ($DEMO_CAMPOS as $k) { $campos[$k] = $sv($k); }

    // los tamaños que haya elegido: campo `tam_<clave>`
    foreach ($TAMANOS as $k => $cfg) {
      $v = $sv('tam_' . $k);
      if ($v !== '' && is_numeric($v)) {
        $n = (float)$v;
        if ($n >= $cfg[2] && $n <= $cfg[3]) $tamElegidos[$k] = $n;
      }
    }

    $leyoEvento = true;
  }
}

/* Para poder PROBAR una paleta o un tamaño sin guardarlos:
   ?paleta=olivo   ?tam_titulo=40                                            */
if (isset($_GET['paleta']) && $_GET['paleta'] !== '') {
  $paleta = strtolower(preg_replace('/[^a-z0-9\-]/i', '', $_GET['paleta']));
}
foreach ($TAMANOS as $k => $cfg) {
  if (isset($_GET['tam_' . $k]) && is_numeric($_GET['tam_' . $k])) {
    $n = (float)$_GET['tam_' . $k];
    if ($n >= $cfg[2] && $n <= $cfg[3]) $tamElegidos[$k] = $n;
  }
}

// ===== VERSIONADO =====
if (isset($_GET['ver']) && $_GET['ver'] !== '') { $ver = $_GET['ver']; }
if ($ver === '') { $ver = $BASE_VER; }
$ver = preg_replace('/[^a-zA-Z0-9._-]/', '', (string)$ver);

$tpl = false;
if ($ver === 'viva') { $tpl = @file_get_contents(dirname(__DIR__) . '/prueba/index.html'); }
if ($tpl === false && $ver !== '') {
  $ruta = __DIR__ . '/v/' . $ver . '/index.html';
  if (is_file($ruta)) { $tpl = @file_get_contents($ruta); }
}
if ($tpl === false) { $tpl = @file_get_contents(__DIR__ . '/index.html'); }
if ($tpl === false) { http_response_code(500); echo 'Error'; exit; }


/* ===== LO QUE SE VE ANTES DE QUE CORRA UN SOLO SCRIPT =========================

   ⚠️⚠️ ACÁ ESTÁN LOS SEIS BUGS MÁS FEOS QUE TUVO LA PLATAFORMA. LEER ANTES DE TOCAR.

   EL PATRÓN: el `index.html` trae valores POR DEFECTO escritos a mano y el
   encuadre lo pone un `<script defer>`. Todo eso llega DESPUÉS del primer
   pintado, y en ese hueco el invitado ve cosas que no son suyas.

   ⚠️ LA REGLA: si algo se ve mal SÓLO EL PRIMER SEGUNDO y "se acomoda" al
   recargar, NO se arregla en un módulo de /efectos/. Se arregla acá.

   ⚠️ Y PARA ENCONTRARLOS HAY QUE PROBAR CON RED LENTA Y CACHÉ VACÍA.

   BUG 1 — EL SOBRE ROTO. Antes de cargar el video se veía OTRO sobre a
   pantalla completa. Se arregló mal tres veces: se culpó a Safari (pasaba en
   todos lados); se arregló en un `defer` que además apuntaba a una clase que
   agrega el JS; y se escribió `#e-back` cuando son CLASES. Adentro de `#env`
   conviven CUATRO sobres superpuestos: `.triflap`+`#tri-glow`+`#tri-seal`,
   `#scene`, `.ct-wrap` y `#env-vid`. Y el principal: `#env-vid` nace en
   `display:none`; apagar los otros tres sin encenderlo dejaba todo VACÍO.

   BUG 2 — LA PORTADA DE OTRA INVITACIÓN. `--cover` está escrita a mano en el
   `:root`; el motor la pisa por JS, pero el primer pintado ya pasó.

   BUG 3 — LA PORTADA SALÍA A LO ANCHO UN INSTANTE. El encuadre lo inyectaba un
   módulo diferido. Ahora ese CSS va también acá, con EL MISMO `id`, así el
   módulo lo encuentra puesto y no lo duplica.

   BUG 4 — DECÍA "INGRESÁ". El motor está en voseo y lo traducía un módulo
   diferido. ⚠️ El arreglo falló la primera vez por algo invisible: la
   condición era `preg_match('/m[eé]xico|mx/i',...)` y NUNCA daba verdadero —
   en UTF-8 la `é` son DOS bytes y sin la marca `u` la clase `[eé]` es un
   conjunto de BYTES. Fallaba en silencio. Ahora se busca `xico`, sin regex.

   BUG 5 — LA BODA DE OTRA GENTE ADENTRO. El motor trae una boda inventada y
   sólo la PISA cuando hay dato: con el campo vacío se queda la de ejemplo.
   Unos XV mostraban la ceremonia en la "Basílica de Santa María". Tabla en
   `i/sin-demo.php`.

   BUG 6 — LAS INVITACIONES SE ENTREGABAN SIN LA MITAD DE LAS FUNCIONES. Las
   carpetas congeladas de `i/v/` no tienen la etiqueta que carga
   `/sobres/catalogo.js`, que es el ÚNICO enganche de los módulos. Lo vendido
   salía sin raspadita, sin calendario, sin música y sin los textos plegados.
   No se notaba porque las muestras se miraban en /prueba/, que sí lo tiene.
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

  $apagar = '#env .triflap,#env #tri-glow,#env #tri-seal,#env #scene';
  if (!$usaCarta) $apagar .= ',#env .ct-wrap';

  $preFirma .=
    $apagar . '{display:none!important}' .
    '#env::before{content:"";position:absolute;inset:0;z-index:1;' .
    '  background:#efe9e0 url("' . $poster . '") center/cover no-repeat;' .
    '  pointer-events:none}' .
    /* ⚠️ encender el video: nace en display:none. Sin esto queda todo vacío. */
    '#env-vid{display:block!important;position:absolute;inset:0;' .
    '  width:100%;height:100%;object-fit:cover;z-index:2}' .
    '@media (min-width:680px){' .
    '  #env{background:#cfc4b4}' .
    '  #env::before,#env-vid{' .
    '    inset:auto!important;left:50%!important;top:50%!important;' .
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

/* ===== LA PALETA Y LOS TAMAÑOS ===============================================

   Las dos formas de elegir color conviven:

     · PALETA: la clienta elige una de las veinte de `i/paletas.php`. El
       servidor escribe los cuatro colores acá, con `!important`, porque una
       paleta elegida tiene que ganarle a todo — incluso al color suelto que
       hubiera quedado guardado de antes.

     · PERSONALIZADA: `paleta` vacío o "personalizada". No se escribe NADA de
       color, y mandan los selectores sueltos del panel como siempre.

   ⚠️⚠️ POR QUÉ ESTA DIFERENCIA IMPORTA. `!important` en una hoja le gana al
   estilo en línea que escribe el panel. Ya pasó una vez: se le puso
   `!important` a `--verde` para sacar el verde del motor, y eso APAGÓ el
   selector de color principal — tres invitaciones con colores distintos se
   veían las tres iguales, y no se notaba porque se miran de a una.

   Regla: `!important` sólo cuando la clienta eligió explícitamente ESO.

   Los TAMAÑOS son aparte y siempre se escriben como variables: si la clienta
   no eligió ninguno, no se escribe nada y quedan los de la hoja.

   Para probar sin guardar:  ?paleta=olivo   ?tam_titulo=40
   ============================================================================ */
$paletaCss = '';
$reglas = array();

if ($paleta !== '' && $paleta !== 'personalizada' && isset($PALETAS[$paleta])) {
  $p = $PALETAS[$paleta];
  $reglas[] = '--verde:'   . $p[1] . '!important';
  $reglas[] = '--sage:'    . $p[2] . '!important';
  $reglas[] = '--sage-cl:' . $p[3] . '!important';
  $reglas[] = '--muted:'   . $p[4] . '!important';
}
foreach ($tamElegidos as $k => $n) {
  $reglas[] = '--fs-' . $k . ':' . $n . 'px';
}
if ($reglas) {
  $paletaCss = '<style id="paleta-servidor">:root{' . implode(';', $reglas) . '}</style>';
}

/* ===== QUE TODAS LAS INVITACIONES TENGAN TODO (BUG 6) =========================
   `/sobres/catalogo.js` es el único enganche de los módulos. Se agrega acá para
   TODAS, comprobando antes que el HTML no lo traiga ya.

   ⚠️ QUÉ SIGNIFICA PARA EL CONGELADO: el HTML sigue clavado, pero los MÓDULOS
   son los de hoy. Es a propósito: es la única forma de que un arreglo llegue a
   quien ya compró. La contra es que un error nuevo también llega — por eso el
   banco corre contra la invitación de verdad antes de dar nada por bueno.
   ============================================================================ */
$engancheModulos = (strpos($tpl, 'catalogo.js') === false)
  ? '<script src="/sobres/catalogo.js" defer></script>'
  : '';

/* ===== LOS ARREGLOS DE ESTILO QUE VALEN PARA TODAS ============================
   Van en `i/estilos-servidor.css`. Si el archivo no está, no se inyecta nada.
   ============================================================================ */
$hojaExtra = @file_get_contents(__DIR__ . '/estilos-servidor.css');
$estilosServidor = ($hojaExtra !== false && trim($hojaExtra) !== '')
  ? '<style id="estilos-servidor">' . $hojaExtra . '</style>'
  : '';

/* el cartel rojo sólo cuando se sirve el motor de /prueba/ desde acá */
$apagarBanner = ($ver === 'viva') ? '<style>#banner-prueba{display:none!important}</style>' : '';

/* ⚠️ EL ORDEN IMPORTA: la hoja general primero y la paleta DESPUÉS, para que
   lo que eligió la clienta sea lo último en escribirse. */
$aInyectar = $apagarBanner . $encuadreColumna . $encuadreSobre . $sinDemo .
             $estilosServidor . $paletaCss . $engancheModulos;
if ($aInyectar !== '') {
  if (strpos($tpl, '</head>') !== false) {
    $tpl = str_replace('</head>', $aInyectar . '</head>', $tpl);
  } else {
    $tpl = $aInyectar . $tpl;
  }
}


/* ===== ESPAÑOL DE MÉXICO, EN EL HTML, ANTES DE MANDARLO ======================
   ⚠️ El idioma NO se detecta con expresión regular: la `é` de "México" son dos
   bytes en UTF-8 y sin la marca `u` la condición falla EN SILENCIO. Se busca
   `xico`. La lista de palabras vive en `i/textos-es-mx.php`.
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
  if (strpos($img, 'http') !== 0) { $img = $SITE . ($img[0] === '/' ? '' : '/i/') . $img; }
  $tpl = setMeta($tpl, 'property', 'og:image', $img);
  $tpl = setMeta($tpl, 'name', 'twitter:image', $img);
}
if ($title !== '') {
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
