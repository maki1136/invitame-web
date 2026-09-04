<?php
/**
 * Invitame — guarda el AUDIO PERSONALIZADO de un invitado, pedido desde el panel
 * de los novios.
 *
 * Por qué existe este archivo y no se hace directo desde el navegador:
 *   Es el mismo motivo que `pase-nuevo.php`, y conviene repetirlo porque es la
 *   pregunta que siempre vuelve. Los novios NO pueden escribir en
 *   `inv_invitados` (la regla de Firestore se los impide, y está bien): en ese
 *   MISMO documento viven el nombre, la mesa, la confirmación y —sobre todo—
 *   los PASES, que son los que lee el escáner de la puerta. Si se abriera a
 *   escritura, cualquiera con el link de un panel podría cambiarle los pases a
 *   toda la lista: meter gente o dejar afuera a media boda.
 *
 *   Entonces el pedido pasa por acá:
 *     1. Se comprueba que quien pide CONOCE la clave del panel de esa invitación.
 *        La prueba es que exista el documento inv_paneles/{slug}__{clave}.
 *     2. Se comprueba que el invitado EXISTA y sea de ESA invitación.
 *     3. Recién entonces este archivo entra a Firebase como usuario del sistema
 *        y escribe, y escribe SOLO los dos campos del audio.
 *
 * ⚠️ EL `updateMask` NO ES OPCIONAL. Un PATCH de Firestore SIN updateMask
 *    REEMPLAZA EL DOCUMENTO ENTERO: dejaría al invitado sin nombre, sin pases y
 *    sin QR. Es exactamente el mismo error que ya cometimos una vez con un
 *    `setDoc` sin `{merge:true}`, que les borraba las mesas a los novios. Con la
 *    máscara sólo se tocan los campos nombrados y el resto ni se mira.
 *
 * ⚠️ LA URL DEL AUDIO SE VALIDA. Sin eso, alguien podría dejar apuntado un
 *    archivo de cualquier lado y hacerlo sonar dentro de la invitación de un
 *    cliente. Sólo se acepta nuestra cuenta de Cloudinary.
 *
 * El usuario y la contraseña viven FUERA del repositorio, en invitame-panel.php
 * (fuera del repo y fuera de public_html).
 */

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405);
  echo json_encode(array('ok' => false, 'error' => 'metodo'));
  exit;
}

$PROJECT = 'invitame-9b51f';
$APIKEY  = 'AIzaSyBXWZc9xdpXx7HCkJfxcyofgI00buNlIXc';
$FS      = 'https://firestore.googleapis.com/v1/projects/' . $PROJECT . '/databases/(default)/documents/';
$CLOUD   = 'https://res.cloudinary.com/oc8cgqt4/';   // la cuenta de Invitame

// ---------- entrada ----------
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 8192) { http_response_code(413); echo json_encode(array('ok'=>false,'error'=>'muy-grande')); exit; }
$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = array();

function limpio($v, $max = 200) {
  $v = is_string($v) ? $v : '';
  $v = strip_tags($v);
  $v = str_replace(array("\r", "\n"), ' ', $v);
  return trim(mb_substr($v, 0, $max));
}

$slug  = preg_replace('/[^a-z0-9\-]/', '', strtolower(limpio($in['slug'] ?? '', 60)));
$clave = limpio($in['clave'] ?? '', 60);
$token = preg_replace('/[^A-Za-z0-9]/', '', limpio($in['token'] ?? '', 20));
$audio = limpio($in['audio'] ?? '', 400);
$onda  = strtolower(preg_replace('/[^0-9a-zA-Z]/', '', limpio($in['onda'] ?? '', 40)));

if ($slug === '' || $clave === '' || $token === '') {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'faltan-datos'));
  exit;
}

// El audio vacío es válido a propósito: es como se BORRA el audio de un invitado.
if ($audio !== '' && strpos($audio, $CLOUD) !== 0) {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'audio-ajeno'));
  exit;
}
// La onda son 26 caracteres base36. Si viene con otro largo se guarda vacía: el
// pase igual anda, sólo dibuja las rayitas parejas.
if (strlen($onda) !== 26) $onda = '';

// Freno anti-abuso. Los topes son generosos: una pareja puede grabarle a toda su
// lista de una sentada. Lo que se corta es el abuso automatizado.
$rutaLim = __DIR__ . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  iv_frenar(array(
    array('pv-ip-'  . iv_ip(), 300,  3600),
    array('pv-inv-' . $slug,   500,  3600),
    array('pv-glob',           3000, 3600),
  ));
}

// ---------- helper HTTP ----------
function pedir($url, $metodo = 'GET', $cuerpo = null, $headers = array()) {
  $ch = curl_init($url);
  $opt = array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => $metodo,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT        => 12,
    CURLOPT_SSL_VERIFYPEER => true,
  );
  if ($cuerpo !== null) {
    $opt[CURLOPT_POSTFIELDS] = $cuerpo;
    $headers[] = 'Content-Type: application/json';
  }
  if ($headers) $opt[CURLOPT_HTTPHEADER] = $headers;
  curl_setopt_array($ch, $opt);
  $r = curl_exec($ch);
  $c = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return array($r, $c);
}

// ---------- 1. ¿conoce la clave del panel? ----------
$idPanel = $slug . '__' . $clave;
list($rp, $cp) = pedir($FS . 'inv_paneles/' . rawurlencode($idPanel) . '?key=' . $APIKEY);
if ($cp != 200) {
  http_response_code(403);
  echo json_encode(array('ok' => false, 'error' => 'clave'));
  exit;
}

// ---------- 2. ¿el invitado existe y es de ESTA invitación? ----------
// Sin este paso, alguien con la clave de SU panel podría escribirle el audio a
// un invitado de OTRA boda mandando otro token.
$idInv = $slug . '__' . $token;
list($rg, $cg) = pedir($FS . 'inv_invitados/' . rawurlencode($idInv) . '?key=' . $APIKEY);
if ($cg != 200) {
  http_response_code(404);
  echo json_encode(array('ok' => false, 'error' => 'invitado'));
  exit;
}
$inv = json_decode($rg, true);
$slugInv = isset($inv['fields']['slug']['stringValue']) ? $inv['fields']['slug']['stringValue'] : '';
if ($slugInv !== $slug) {
  http_response_code(403);
  echo json_encode(array('ok' => false, 'error' => 'invitado-ajeno'));
  exit;
}

// ---------- 3. credenciales del sistema ----------
$PANEL_USER = ''; $PANEL_PASS = '';
// Se busca hacia ARRIBA desde esta carpeta. El archivo vive fuera de public_html.
// OJO: en public_html hay OTRO invitame-config.php (el de Cloudinary). Por eso el
// del panel se llama distinto y sólo cortamos cuando de verdad quedaron cargadas
// las dos variables.
$candidatos = array();
$dir = __DIR__;
for ($i = 0; $i < 6; $i++) {
  $candidatos[] = $dir . '/invitame-panel.php';
  $candidatos[] = $dir . '/invitame-config.php';
  $padre = dirname($dir);
  if ($padre === $dir) break;
  $dir = $padre;
}
if (isset($_SERVER['DOCUMENT_ROOT'])) {
  $candidatos[] = dirname($_SERVER['DOCUMENT_ROOT']) . '/invitame-panel.php';
  $candidatos[] = dirname(dirname($_SERVER['DOCUMENT_ROOT'])) . '/invitame-panel.php';
}
foreach (array_unique($candidatos) as $ruta) {
  if (!is_readable($ruta)) continue;
  include $ruta;
  if ($PANEL_USER !== '' && $PANEL_PASS !== '') break;
}
if ($PANEL_USER === '' || $PANEL_PASS === '') {
  echo json_encode(array('ok' => false, 'error' => 'sin-config'));
  exit;
}

list($ra, $ca) = pedir(
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' . $APIKEY,
  'POST',
  json_encode(array('email' => $PANEL_USER, 'password' => $PANEL_PASS, 'returnSecureToken' => true))
);
if ($ca != 200) {
  echo json_encode(array('ok' => false, 'error' => 'login', 'detalle' => 'http' . $ca));
  exit;
}
$sesion  = json_decode($ra, true);
$idToken = isset($sesion['idToken']) ? $sesion['idToken'] : '';
if ($idToken === '') { echo json_encode(array('ok' => false, 'error' => 'login')); exit; }
$auth = array('Authorization: Bearer ' . $idToken);

// ---------- 4. escribir SOLO los campos del audio ----------
// ⚠️ La máscara es lo que salva al invitado. Ver la nota grande de arriba.
$mask = 'updateMask.fieldPaths=pasevozAudio'
      . '&updateMask.fieldPaths=pasevozOnda'
      . '&updateMask.fieldPaths=pasevozAt';
$doc = array('fields' => array(
  'pasevozAudio' => array('stringValue'    => $audio),
  'pasevozOnda'  => array('stringValue'    => $onda),
  'pasevozAt'    => array('timestampValue' => gmdate('Y-m-d\TH:i:s\Z')),
));
list($rc, $cc) = pedir(
  $FS . 'inv_invitados/' . rawurlencode($idInv) . '?' . $mask,
  'PATCH', json_encode($doc), $auth
);
if ($cc < 200 || $cc >= 300) {
  echo json_encode(array('ok' => false, 'error' => 'guardar', 'detalle' => 'http' . $cc . ' ' . substr((string)$rc, 0, 200)));
  exit;
}

echo json_encode(array(
  'ok'    => true,
  'token' => $token,
  'audio' => $audio,
  'onda'  => $onda,
  'vacio' => ($audio === '')
));
