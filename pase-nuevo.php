<?php
/**
 * Invitame — alta de un invitado NUEVO desde el panel de los novios.
 *
 * Por qué existe este archivo y no se hace directo desde el navegador:
 *   Los novios NO pueden escribir en la lista de invitados (la regla de Firestore se
 *   los impide, y está bien: si pudieran, cualquiera con la clave del panel podría
 *   inventarse pases). Entonces el pedido pasa por acá:
 *
 *     1. Se comprueba que quien pide CONOCE la clave del panel de esa invitación.
 *        La prueba es que exista el documento inv_paneles/{direccion}__{clave}.
 *        Sin la clave exacta, ese documento no se puede ni encontrar.
 *     2. Recién entonces este archivo entra a Firebase como un usuario del sistema
 *        (el de $PANEL_USER) y crea el invitado con su token, que es su QR.
 *
 * El usuario y la contraseña viven FUERA del repositorio, en invitame-config.php.
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

// ---------- entrada ----------
$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = array();

function limpio($v, $max = 200) {
  $v = is_string($v) ? $v : '';
  $v = strip_tags($v);
  $v = str_replace(array("\r", "\n"), ' ', $v);
  return trim(mb_substr($v, 0, $max));
}

$slug     = preg_replace('/[^a-z0-9\-]/', '', strtolower(limpio($in['slug'] ?? '', 60)));
$clave    = limpio($in['clave'] ?? '', 60);
$nombre   = limpio($in['nombre'] ?? '', 120);
$personas = max(1, min(30, (int)($in['personas'] ?? 1)));
$mesa     = limpio($in['mesa'] ?? '', 20);
$usos     = (int)($in['usos'] ?? 0);
if ($usos < 1 || $usos > 30) $usos = $personas;
$desc     = limpio($in['desc'] ?? '', 200);
$mensaje  = limpio($in['mensaje'] ?? '', 300);

if ($slug === '' || $clave === '' || $nombre === '') {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'faltan-datos'));
  exit;
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
$panel = json_decode($rp, true);
$campos = isset($panel['fields']) ? $panel['fields'] : array();

// ---------- 2. credenciales del sistema ----------
$PANEL_USER = ''; $PANEL_PASS = '';
// Se busca hacia ARRIBA desde esta carpeta. El archivo vive fuera de public_html
// (no es alcanzable desde internet), y segun el dominio la profundidad cambia.
$dir = __DIR__;
for ($i = 0; $i < 5; $i++) {
  $ruta = $dir . '/invitame-config.php';
  if (is_readable($ruta)) { include $ruta; break; }
  $padre = dirname($dir);
  if ($padre === $dir) break;
  $dir = $padre;
}
if ($PANEL_USER === '' && isset($_SERVER['DOCUMENT_ROOT'])) {
  $alt = dirname($_SERVER['DOCUMENT_ROOT']) . '/invitame-config.php';
  if (is_readable($alt)) include $alt;
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
$sesion = json_decode($ra, true);
$idToken = isset($sesion['idToken']) ? $sesion['idToken'] : '';
if ($idToken === '') { echo json_encode(array('ok' => false, 'error' => 'login')); exit; }
$auth = array('Authorization: Bearer ' . $idToken);

// ---------- 3. token libre ----------
function nuevoToken() {
  $abc = 'abcdefghijkmnpqrstuvwxyz23456789';   // sin l/o/0/1: se confunden al dictarlas
  $t = '';
  for ($i = 0; $i < 6; $i++) $t .= $abc[random_int(0, strlen($abc) - 1)];
  return $t;
}
$token = '';
for ($i = 0; $i < 8; $i++) {
  $t = nuevoToken();
  list($rr, $cc) = pedir($FS . 'inv_invitados/' . rawurlencode($slug . '__' . $t) . '?key=' . $APIKEY);
  if ($cc == 404) { $token = $t; break; }
}
if ($token === '') { echo json_encode(array('ok' => false, 'error' => 'token')); exit; }

// ---------- 4. crear el invitado ----------
$doc = array('fields' => array(
  'slug'         => array('stringValue'  => $slug),
  'token'        => array('stringValue'  => $token),
  'nombre'       => array('stringValue'  => $nombre),
  'pases'        => array('integerValue' => (string)$personas),
  'mesa'         => array('stringValue'  => ($mesa === '' ? '-' : $mesa)),
  'usosMax'      => array('integerValue' => (string)$usos),
  'usos'         => array('integerValue' => (string)$usos),
  'rsvp'         => array('stringValue'  => 'pendiente'),
  'rsvpPersonas' => array('nullValue'    => null),
  'restriccion'  => array('stringValue'  => $desc),
  'notaNovios'   => array('stringValue'  => $mensaje),
  'altaNovios'   => array('booleanValue' => true),
  'updatedAt'    => array('timestampValue' => gmdate('Y-m-d\TH:i:s\Z')),
));
list($rc, $cc) = pedir($FS . 'inv_invitados/' . rawurlencode($slug . '__' . $token), 'PATCH', json_encode($doc), $auth);
if ($cc < 200 || $cc >= 300) {
  echo json_encode(array('ok' => false, 'error' => 'crear', 'detalle' => 'http' . $cc . ' ' . substr((string)$rc, 0, 200)));
  exit;
}

// ---------- 5. sumarlo a la lista del panel ----------
$tokens = array();
if (isset($campos['tokens']['arrayValue']['values'])) {
  foreach ($campos['tokens']['arrayValue']['values'] as $v) {
    if (isset($v['stringValue'])) $tokens[] = array('stringValue' => $v['stringValue']);
  }
}
$tokens[] = array('stringValue' => $token);
$patch = array('fields' => array('tokens' => array('arrayValue' => array('values' => $tokens))));
pedir($FS . 'inv_paneles/' . rawurlencode($idPanel) . '?updateMask.fieldPaths=tokens', 'PATCH', json_encode($patch), $auth);

echo json_encode(array(
  'ok'    => true,
  'token' => $token,
  'link'  => 'https://invitame.littlemomentsok.com/i/?e=' . rawurlencode($slug) . '&g=' . $token,
));
