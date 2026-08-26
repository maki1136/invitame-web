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

$img = ''; $title = ''; $desc = ''; $kick = ''; $ver = ''; $sobre = ''; $coverReal = '';

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


/* ===== LO QUE SE VE ANTES DE QUE CORRA UN SOLO SCRIPT =========================

   ⚠️⚠️ ACÁ ESTÁN LOS DOS BUGS MÁS FEOS QUE TUVO LA PLATAFORMA. LEER ANTES DE TOCAR.

   EL PATRÓN, QUE ES EL MISMO EN LOS DOS
   El `index.html` trae valores POR DEFECTO escritos a mano en el `:root` —fotos
   de banco de imágenes, de otra pareja— y el motor los reemplaza por los de
   esta boda RECIÉN cuando corre su JavaScript. Entre el primer pintado y ese
   momento pasan uno o dos segundos, y en esos segundos el invitado ve cosas que
   no son suyas. Los `<script defer>` no llegan a tiempo. Nunca van a llegar.
   Por eso esto se resuelve ACÁ, en el servidor, que ya leyó el evento de
   Firestore y puede escribir los valores correctos en el `<head>`.

   BUG 1 — EL SOBRE ROTO
   Antes de cargar el video se veía OTRO sobre a pantalla completa: una diagonal
   blanca gigante, el monograma enorme y borroso, un panel de papel estirado.
   Se arregló mal tres veces:
   1. Se lo trató como bug de Safari. No lo era: pasaba en Chrome, Safari,
      iPhone e incógnito.
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
   Al tocar el sello, antes de aparecer la foto de los novios, se veía la foto de
   OTRA pareja. Misma causa: `--cover` está escrita a mano en el `:root`. El
   motor la pisa por JS, pero el primer pintado ya se hizo. Ahora el servidor
   escribe `--cover` con la portada de verdad.

   POR QUÉ LA FOTO DEL SOBRE VA EN `#env::before`
   Un `<video>` sin datos no pinta nada: ni su `poster`, ni el `background` que
   le pongas por CSS. Con el fondo puesto sólo en el video quedaba un segundo de
   pantalla vacía. `#env::before` es un pseudo-elemento común: pinta la foto en
   la misma caja desde el primer frame, y el video le pasa por encima cuando
   está listo. El empalme no se nota porque son la misma imagen.

   ⚠️ NO USAR `aspect-ratio` PARA EL ANCHO DEL VIDEO: en Safari no se aplica
   igual sobre elementos reemplazados y el video se va a pantalla completa.
   El ancho va con `calc()`.
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

$encuadre = ($preFirma !== '')
  ? '<style id="sobre-encuadre-servidor">' . $preFirma . '</style>'
  : '';

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
