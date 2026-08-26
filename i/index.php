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

// slug seguro
$slug = isset($_GET['e']) ? strtolower($_GET['e']) : '';
$slug = preg_replace('/[^a-z0-9\-]/', '', $slug);

$img = ''; $title = ''; $desc = ''; $kick = ''; $ver = ''; $sobre = '';

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
    if ($img === '') $img = $sv('cover');

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

    // 6) QUÉ SOBRE ES. Vive anidado: fx → sobre → modelo.
    if (isset($f['fx']['mapValue']['fields']['sobre']['mapValue']['fields']['modelo']['stringValue'])) {
      $sobre = trim($f['fx']['mapValue']['fields']['sobre']['mapValue']['fields']['modelo']['stringValue']);
    }
  }
}

// ===== VERSIONADO =====
// Cada invitación queda clavada a la versión con la que se publicó. Así, cuando
// mejoramos la plataforma, las invitaciones ya entregadas NO cambian.
// Se puede forzar una versión por URL (?ver=) para la vista previa del panel.
if (isset($_GET['ver']) && $_GET['ver'] !== '') { $ver = $_GET['ver']; }
// Las invitaciones publicadas ANTES del versionado no tienen 'ver' guardado.
// Se las trata como la versión base: quedan congeladas tal como se entregaron.
if ($ver === '') { $ver = $BASE_VER; }
$ver = preg_replace('/[^a-zA-Z0-9._-]/', '', (string)$ver);

$tpl = false;

/* ===== LA VERSIÓN "viva" ======================================================

   Una invitación con `ver = viva` NO queda congelada: se sirve con el motor que
   está hoy en /prueba/, que es el único que tiene el sobre en video y el que
   carga /sobres/catalogo.js (y con él los módulos de /efectos/).

   ⚠️ NO ES PARA CLIENTES QUE YA PAGARON: cambia cuando cambia /prueba/. Es para
   las MUESTRAS. Ninguna invitación ya entregada se ve afectada: cada una
   conserva su propio `ver` y sigue leyendo su carpeta de siempre.
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


/* ===== EL ENCUADRE DEL SOBRE, EN EL PRIMER PINTADO ============================

   ⚠️⚠️ ESTO ARREGLA EL BUG MÁS FEO QUE TUVO LA PLATAFORMA. LEER ANTES DE TOCAR.

   QUÉ SE VEÍA
   Al abrir la invitación, durante los primeros segundos —hasta que cargaba el
   video del sobre— aparecía OTRO sobre a pantalla completa: una diagonal blanca
   gigante, el monograma de los novios enorme y borroso, y un panel de papel
   estirado. Recién después aparecía el sobre de verdad. Pasaba en Chrome, en
   Safari, en el iPhone y en incógnito.

   LOS CUATRO ERRORES QUE HUBO QUE ENCONTRAR — se arregló mal tres veces
   1. Se lo trató como un bug de Safari. No lo era: pasaba en todos lados.
   2. Se arregló en el CSS de /sobres/catalogo.js. Ese archivo es un
      `<script defer>`: corre DESPUÉS del primer pintado. Y sus reglas apuntan a
      `#env.carta-video`, una clase que el motor agrega por JavaScript y que
      TAMPOCO existe en el primer pintado. El CSS estaba bien escrito, pero
      llegaba tarde y no matcheaba nada. El problema nunca fue el CSS: era
      CUÁNDO llegaba.
   3. Dentro de `#env` conviven CUATRO sobres superpuestos, no dos:
        · `.triflap` + `#tri-glow` + `#tri-seal`   (el de cuatro solapas)
        · `#scene` → adentro `.envelope`, `.e-back`, `.e-pocket`, `.e-flap`,
                     `.e-tint`, `.seal`, `#ephoto`, `#hint`   (el clásico)
        · `.ct-wrap` → la tarjeta que se escribe sola
        · `#env-vid` → el video
      La primera vez se escribió `#e-back`, `#e-pocket`, `#e-flap` con
      almohadilla, y son CLASES, no ids: por eso el panel de papel seguía ahí.
   4. Y EL PRINCIPAL: `#env-vid` nace con `display:none` en la hoja del motor.
      Sólo se enciende cuando el JS agrega `.carta-video`. Al apagar los otros
      tres sobres sin encender el video, la pantalla quedaba VACÍA. Hay que
      hacer las dos cosas: apagar los otros Y encender el video.

   CÓMO SE ARREGLA DE VERDAD
   El servidor ya sabe qué sobre es (lo leyó de Firestore, más arriba). Mete el
   encuadre directamente en el `<head>` antes de mandar el HTML: llega con la
   primera línea, no hay ningún instante sin él. Y como sabe cuál es el `poster`,
   se lo pone de fondo al `<video>`: la foto del sobre aparece al instante, en su
   caja correcta, mientras el video todavía baja.

   Las reglas se apoyan en `#env-vid` y en las clases del HTML, NUNCA en
   `carta-video`. Es la diferencia entre que ande y que no ande.

   ⚠️ NO USAR `aspect-ratio` PARA EL ANCHO: sobre un `<video>` Safari no lo
   aplica igual y el video se va a pantalla completa. El ancho va con `calc()`.
   ============================================================================ */
$encuadre = '';
if ($sobre !== '' && isset($SOBRES_VIDEO[$sobre])) {
  $poster    = $SOBRES_VIDEO[$sobre]['poster'];
  $usaCarta  = $SOBRES_VIDEO[$sobre]['carta'];
  $alto  = 'min(84vh,843px)';
  $ancho = 'calc(' . $alto . ' * 9 / 16)';

  /* los otros tres sobres, apagados */
  $apagar = '#env .triflap,#env #tri-glow,#env #tri-seal,#env #scene';
  if (!$usaCarta) $apagar .= ',#env .ct-wrap';

  $encuadre =
    '<style id="sobre-encuadre-servidor">' .
    $apagar . '{display:none!important}' .

    /* ⚠️ encender el video: nace en display:none. Sin esto queda todo vacío. */
    '#env-vid{display:block!important;position:absolute;inset:0;' .
    '  width:100%;height:100%;object-fit:cover;' .
    '  background:#efe9e0 url("' . $poster . '") center/cover no-repeat}' .

    '@media (min-width:680px){' .
    '  #env{background:#cfc4b4}' .
    '  #env-vid{' .
    '    inset:auto!important;' .
    '    left:50%!important;top:50%!important;' .
    '    transform:translate(-50%,-50%)!important;z-index:2;' .
    '    height:' . $alto . '!important;width:' . $ancho . '!important;' .
    '    max-width:92vw!important;border-radius:30px;' .
    '    box-shadow:0 32px 74px rgba(40,28,12,.34)}' .
    '}' .
    '</style>';
}

/* el cartel rojo sólo cuando se sirve el motor de /prueba/ desde acá */
$apagarBanner = ($ver === 'viva') ? '<style>#banner-prueba{display:none!important}</style>' : '';

$aInyectar = $apagarBanner . $encuadre;
if ($aInyectar !== '') {
  if (strpos($tpl, '</head>') !== false) {
    $tpl = str_replace('</head>', $aInyectar . '</head>', $tpl);
  } else {
    $tpl = $aInyectar . $tpl;
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
