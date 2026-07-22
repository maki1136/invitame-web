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
//  de la carpeta web y FUERA del repo, que el deploy nunca toca:
//     <carpeta home de Hostinger>/invitame-config.php
//  (o sea, un nivel ARRIBA de public_html)
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

// 1) intentar leer el config seguro (arriba de public_html)
$cfgPath = dirname($_SERVER['DOCUMENT_ROOT']) . '/invitame-config.php';
if (is_readable($cfgPath)) { include $cfgPath; }
// 2) fallback: config al lado de este archivo (por si preferís ahí) — NO recomendado en repo público
elseif (is_readable(__DIR__ . '/invitame-config.php')) { include __DIR__ . '/invitame-config.php'; }

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
