<?php
/**
 * Invitame — PORTERO DE LA API DE HIGGSFIELD (video e imagen, pago por uso).
 *
 * ⭐ POR QUÉ EXISTE (23/9/2026)
 *   Los sobres, fondos y portadas de las muestras se hacían en Google Flow y los
 *   créditos de video se terminaron. Higgsfield lanzó (sep 2026) una API propia:
 *   saldo en dólares, se paga por generación, sin suscripción. La clave de esa API
 *   es un SECRETO y el repo es público, así que no puede viajar en el navegador:
 *   el panel le pide a este archivo, y este archivo le pide a Higgsfield.
 *
 * ⚠️ QUIÉN PUEDE USARLO: sólo el equipo. Mismo control que galeria-alta.php: el
 *    navegador manda el token de su sesión de Firebase y Google dice de quién es.
 *
 * ⚠️ LA CLAVE NO ESTÁ ACÁ. Vive en 'invitame-higgsfield.php', FUERA de
 *    public_html (al lado de invitame-galeria.php), con dos líneas:
 *        <?php $HF_KEY_ID = '...'; $HF_KEY_SECRET = '...';
 *    La pega Maki desde hPanel. Archivo propio: si se rompe, no se cae nada más.
 *
 * USO (POST JSON):
 *   { idToken, accion:'crear',  ruta:'kling-video/v3.0/pro/image-to-video', cuerpo:{...} }
 *   { idToken, accion:'estado', id:'<request_id>' }
 *   { idToken, accion:'probar' }   → dice si la clave está puesta (no gasta nada)
 */

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405); echo json_encode(array('ok' => false, 'error' => 'metodo')); exit;
}

$APIKEY = 'AIzaSyBXWZc9xdpXx7HCkJfxcyofgI00buNlIXc';   // Firebase web key (pública)
$EQUIPO = array('littlemomentsok@gmail.com', 'info@invitameok.com');
$BASE   = 'https://api.higgsfield.ai';

if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 65536) { http_response_code(413); echo json_encode(array('ok'=>false,'error'=>'muy-grande')); exit; }
$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = array();

$idToken = is_string($in['idToken'] ?? null) ? trim($in['idToken']) : '';
$accion  = is_string($in['accion'] ?? null) ? $in['accion'] : '';
if ($idToken === '' || !in_array($accion, array('crear', 'estado', 'probar'), true)) {
  http_response_code(400); echo json_encode(array('ok' => false, 'error' => 'faltan-datos')); exit;
}

// freno anti-abuso (si existe el helper de la casa)
$rutaLim = __DIR__ . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  iv_frenar(array(array('hf-ip-' . iv_ip(), 300, 3600), array('hf-glob', 1500, 3600)));
}

function pedir($url, $metodo = 'GET', $cuerpo = null, $headers = array(), $timeout = 30) {
  $ch = curl_init($url);
  $opt = array(
    CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $metodo,
    CURLOPT_CONNECTTIMEOUT => 8, CURLOPT_TIMEOUT => $timeout, CURLOPT_SSL_VERIFYPEER => true,
  );
  if ($cuerpo !== null) { $opt[CURLOPT_POSTFIELDS] = $cuerpo; $headers[] = 'Content-Type: application/json'; }
  if ($headers) $opt[CURLOPT_HTTPHEADER] = $headers;
  curl_setopt_array($ch, $opt);
  $r = curl_exec($ch); $c = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
  return array($r, $c);
}

// ---------- 1. ¿quién es? ----------
list($ru, $cu) = pedir('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' . $APIKEY,
  'POST', json_encode(array('idToken' => $idToken)), array(), 10);
if ($cu != 200) { http_response_code(401); echo json_encode(array('ok' => false, 'error' => 'sesion')); exit; }
$u = json_decode($ru, true);
$mail = isset($u['users'][0]['email']) ? strtolower(trim($u['users'][0]['email'])) : '';
$permitido = false;
foreach ($EQUIPO as $e) { if ($mail !== '' && $mail === strtolower($e)) { $permitido = true; break; } }
if (!$permitido) { http_response_code(403); echo json_encode(array('ok' => false, 'error' => 'no-sos-del-equipo')); exit; }

// ---------- 2. la clave ----------
$HF_KEY_ID = ''; $HF_KEY_SECRET = '';
$candidatos = array(); $dir = __DIR__;
for ($i = 0; $i < 6; $i++) {
  $candidatos[] = $dir . '/invitame-higgsfield.php';
  $padre = dirname($dir); if ($padre === $dir) break; $dir = $padre;
}
if (isset($_SERVER['DOCUMENT_ROOT'])) {
  $candidatos[] = dirname($_SERVER['DOCUMENT_ROOT']) . '/invitame-higgsfield.php';
  $candidatos[] = dirname(dirname($_SERVER['DOCUMENT_ROOT'])) . '/invitame-higgsfield.php';
}
foreach (array_unique($candidatos) as $ruta) {
  if (!is_readable($ruta)) continue;
  include $ruta;
  if ($HF_KEY_ID !== '' && $HF_KEY_SECRET !== '') break;
}
if ($HF_KEY_ID === '' || $HF_KEY_SECRET === '') {
  echo json_encode(array('ok' => false, 'error' => 'sin-clave',
    'detalle' => 'Falta invitame-higgsfield.php con $HF_KEY_ID y $HF_KEY_SECRET')); exit;
}
$AUTH = array('Authorization: Key ' . $HF_KEY_ID . ':' . $HF_KEY_SECRET);

if ($accion === 'probar') { echo json_encode(array('ok' => true, 'clave' => 'puesta', 'por' => $mail)); exit; }

// ---------- 3a. estado de un pedido ----------
if ($accion === 'estado') {
  $id = is_string($in['id'] ?? null) ? $in['id'] : '';
  if (!preg_match('/^[a-zA-Z0-9\-]{8,80}$/', $id)) { http_response_code(400); echo json_encode(array('ok'=>false,'error'=>'id')); exit; }
  list($r, $c) = pedir($BASE . '/requests/' . $id . '/status', 'GET', null, $AUTH);
  http_response_code($c ?: 502);
  echo $r !== false ? $r : json_encode(array('ok' => false, 'error' => 'red'));
  exit;
}

// ---------- 3b. crear una generación ----------
$ruta = is_string($in['ruta'] ?? null) ? trim($in['ruta'], '/') : '';
if (!preg_match('/^[a-z0-9][a-z0-9\-\.\/]{2,120}$/', $ruta) || strpos($ruta, '..') !== false || strpos($ruta, 'requests') === 0) {
  http_response_code(400); echo json_encode(array('ok' => false, 'error' => 'ruta')); exit;
}
$cuerpo = $in['cuerpo'] ?? array();
if (!is_array($cuerpo)) $cuerpo = array();
list($r, $c) = pedir($BASE . '/' . $ruta, 'POST', json_encode($cuerpo), $AUTH, 60);
http_response_code($c ?: 502);
echo $r !== false ? $r : json_encode(array('ok' => false, 'error' => 'red'));
