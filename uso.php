<?php
// ============================================================
//  uso.php  ·  Trae el uso REAL de Cloudinary para el panel
//  El secreto vive acá (en el servidor), nunca se ve en el navegador.
// ============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store');

// ====== PEGÁ TUS DATOS DE CLOUDINARY ACÁ ======
// Los sacás de: https://console.cloudinary.com/  →  Settings (rueda) → API Keys
$CLOUD_NAME = 'oc8cgqt4';                   // cuenta PROPIA de Invítame, no lo toques
$API_KEY    = 'PEGAR_API_KEY';             // ← API Key de la cuenta NUEVA (oc8cgqt4)
$API_SECRET = 'PEGAR_API_SECRET';          // ← API Secret de la cuenta NUEVA (¡NO lo compartas!)
// ==============================================

if ($API_KEY === 'PEGAR_API_KEY' || $API_SECRET === 'PEGAR_API_SECRET' || $API_KEY === '' || $API_SECRET === '') {
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
