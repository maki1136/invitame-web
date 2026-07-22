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

// slug seguro
$slug = isset($_GET['e']) ? strtolower($_GET['e']) : '';
$slug = preg_replace('/[^a-z0-9\-]/', '', $slug);

$img = ''; $title = ''; $desc = ''; $kick = ''; $ver = '';

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

    // 1) imagen: primero la "miniatura al compartir", si no, la portada (cover)
    $img = $sv('img_f-im-gen-miniatura-al-compartir');
    if ($img === '') $img = $sv('cover');

    // 2) titulo: nombres de la pareja
    $n1 = $sv('n1'); $n2 = $sv('n2');
    if ($n1 !== '' || $n2 !== '') {
      $title = trim($n1 . ($n1 && $n2 ? ' & ' : '') . $n2);
    }

    // 3) descripcion: la frase del evento
    $desc = $sv('frase');

    // 4) textito de arriba (Nuestra Boda / Mis XV / Mi Bautismo...) para el subtítulo
    $kick = $sv('kick');

    // 5) VERSION con la que se publicó esta invitación (para que no la afecten cambios futuros)
    $ver = $sv('ver');
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
if ($ver !== '') {
  $ruta = __DIR__ . '/v/' . $ver . '/index.html';
  if (is_file($ruta)) { $tpl = @file_get_contents($ruta); }
}
// Sin versión (o versión inexistente) => la última. Nunca rompe.
if ($tpl === false) { $tpl = @file_get_contents(__DIR__ . '/index.html'); }
if ($tpl === false) { http_response_code(500); echo 'Error'; exit; }

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
  $sfx = ($kick !== '') ? ' — ' . $kick : '';
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
