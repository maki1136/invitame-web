<?php
// ============================================================
//  uso.php  ·  Trae el uso REAL de Cloudinary para el panel
//  El secreto vive acá (en el servidor), nunca se ve en el navegador.
// ============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store');

// ============================================================
//  El SECRETO no vive acá (este archivo está en el repo PÚBLICO y
//  se sobrescribe en cada deploy). Vive en un archivo APARTE, FUERA
//  del repo, que el deploy nunca toca:
//     public_html/invitame-config.php   (un nivel ARRIBA de la carpeta invitame)
//
//  Ese archivo tiene que verse así (pegando tus datos reales):
//     <?php
//     $CLOUD_NAME = 'oc8cgqt4';
//     $API_KEY    = 'tu_api_key';
//     $API_SECRET = 'tu_api_secret';
// ============================================================
$CLOUD_NAME = 'oc8cgqt4';   // por defecto la cuenta de Invítame
$API_KEY    = '';
$API_SECRET = '';

// 1) ruta principal (DETERMINISTA): un nivel ARRIBA de la carpeta invitame,
//    o sea en  public_html/invitame-config.php  (fuera de la carpeta que se deploya)
$cfgArriba = dirname(dirname(__FILE__)) . '/invitame-config.php';   // .../public_html/invitame-config.php
$cfgHome   = dirname($_SERVER['DOCUMENT_ROOT']) . '/invitame-config.php'; // por si el doc root es la carpeta invitame
$cfgLado   = __DIR__ . '/invitame-config.php';                       // fallback (NO recomendado en repo público)
if      (is_readable($cfgArriba)) { include $cfgArriba; }
elseif  (is_readable($cfgHome))   { include $cfgHome; }
elseif  (is_readable($cfgLado))   { include $cfgLado; }

if ($API_KEY === '' || $API_SECRET === '') {
  echo json_encode(['ok' => false, 'error' => 'faltan_credenciales']);
  exit;
}

$url = "https://api.cloudinary.com/v1_1/$CLOUD_NAME/usage";
$ch = curl_init($url);
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_USERPWD        => $API_KEY . ':' . $API_SECRET,
  CURLOPT_TIMEOUT        => 15,
  CURLOPT_SSL_VERIFYPEER => true,
]);
$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err  = curl_error($ch);
curl_close($ch);

if ($resp === false) { echo json_encode(['ok' => false, 'error' => 'curl_' . $err]); exit; }
if ($code !== 200)   { echo json_encode(['ok' => false, 'error' => 'cloudinary_' . $code]); exit; }

$d = json_decode($resp, true);
if (!is_array($d)) { echo json_encode(['ok' => false, 'error' => 'respuesta_invalida']); exit; }

echo json_encode([
  'ok'              => true,
  'plan'            => isset($d['plan']) ? $d['plan'] : '',
  'credits'         => isset($d['credits']) ? $d['credits'] : null,
  'storage'         => isset($d['storage']) ? $d['storage'] : null,
  'bandwidth'       => isset($d['bandwidth']) ? $d['bandwidth'] : null,
  'transformations' => isset($d['transformations']) ? $d['transformations'] : null,
  'objects'         => isset($d['objects']) ? $d['objects'] : null,
  'requested_at'    => date('c'),
]);
