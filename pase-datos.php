<?php
/**
 * Invítame — EL WHATSAPP (Y EL CORREO) DE CADA INVITADO.
 *
 * ⭐ PARA QUÉ
 *   Maki, 8/9/2026: *«Envío directo por WhatsApp: un clic para enviar la
 *   invitación personalizada a cada invitado»*.
 *
 *   Hasta hoy el botón de WhatsApp del panel abría `wa.me/` **sin destinatario**:
 *   armaba el mensaje con el link, pero los novios tenían que buscar el contacto
 *   a mano, uno por uno, para 200 invitados. Lo único que faltaba para que fuera
 *   de UN clic era el dato que no estábamos guardando: el teléfono.
 *
 *   Con el número, el botón abre `wa.me/<numero>?text=<mensaje + su link>` y el
 *   chat de ESA persona se abre con todo escrito.
 *
 * QUÉ ESCRIBE
 *   `inv_invitados/{slug}__{token}` → sólo los campos `tel` y `mail`.
 *
 * ⚠️ EL PATRÓN DEL PORTERO, igual que `pase-nuevo.php` y `mesas-guardar.php`:
 *   1. El navegador manda la DIRECCIÓN y la CLAVE, no una sesión.
 *   2. Se comprueba que exista `inv_paneles/{slug}__{clave}`: sin la clave exacta
 *      ese documento no se puede ni encontrar.
 *   3. ⚠️⚠️ Y SE COMPRUEBA QUE EL TOKEN SEA DE ESA FIESTA. Sin esto, alguien con
 *      la clave de SU panel podría escribirle el teléfono al invitado de otra
 *      boda. La lista `tokens` del panel es la que manda.
 *   4. Recién entonces entra como usuario del sistema y escribe con `updateMask`.
 *
 * ⚠️ `currentDocument.exists=true`: si el token ya no existe, no se crea una
 *    ficha fantasma.
 *
 * ⚠️ El teléfono se guarda SÓLO CON DÍGITOS, que es lo que quiere wa.me. El «+»,
 *    los espacios y los guiones se limpian acá y no en el navegador, para que el
 *    dato quede parejo venga de donde venga (formulario, Excel, panel o admin).
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

if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 8192) {
  http_response_code(413);
  echo json_encode(array('ok' => false, 'error' => 'muy-grande'));
  exit;
}
$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = array();

$slug  = preg_replace('/[^a-z0-9\-]/', '', strtolower((string)($in['slug'] ?? '')));
$clave = preg_replace('/[^A-Za-z0-9_\-]/', '', (string)($in['clave'] ?? ''));
$token = preg_replace('/[^A-Za-z0-9_\-]/', '', (string)($in['token'] ?? ''));

/* Sólo dígitos: es lo que necesita wa.me. Máximo 15, que es el largo máximo de
   un número de teléfono en el mundo (norma E.164). Vacío = borrar el dato. */
$tel = preg_replace('/[^0-9]/', '', (string)($in['tel'] ?? ''));
if (strlen($tel) > 15) $tel = substr($tel, 0, 15);
if ($tel !== '' && strlen($tel) < 8) {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'telefono-corto'));
  exit;
}

$mail = trim((string)($in['mail'] ?? ''));
$mail = mb_substr(str_replace(array("\r", "\n", ' '), '', $mail), 0, 120);
if ($mail !== '' && !filter_var($mail, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'correo'));
  exit;
}

if ($slug === '' || $clave === '' || $token === '') {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'faltan-datos'));
  exit;
}

/* Freno anti-abuso. Cargar teléfonos es normal y se hace de a muchos, así que el
   tope es alto; lo que corta es el uso automático desde afuera. */
$rutaLim = __DIR__ . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  iv_frenar(array(
    array('pd-ip-' . iv_ip(), 400,  3600),
    array('pd-glob',          4000, 3600),
  ));
}

// ---------- helper HTTP ----------
function pedir($url, $metodo = 'GET', $cuerpo = null, $headers = array()) {
  $ch = curl_init($url);
  $opt = array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => $metodo,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT        => 15,
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
$panel  = json_decode($rp, true);
$campos = isset($panel['fields']) ? $panel['fields'] : array();

// ---------- 2. ⚠️ ¿ese invitado es de ESTA fiesta? ----------
$suyo = false;
if (isset($campos['tokens']['arrayValue']['values'])) {
  foreach ($campos['tokens']['arrayValue']['values'] as $v) {
    if (isset($v['stringValue']) && $v['stringValue'] === $token) { $suyo = true; break; }
  }
}
if (!$suyo) {
  http_response_code(403);
  echo json_encode(array('ok' => false, 'error' => 'no-es-de-esta-fiesta'));
  exit;
}

// ---------- 3. credenciales del sistema ----------
$PANEL_USER = ''; $PANEL_PASS = '';
$candidatos = array();
$dir = __DIR__;
for ($i = 0; $i < 6; $i++) {
  $candidatos[] = $dir . '/invitame-panel.php';
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
if ($ca != 200) { echo json_encode(array('ok' => false, 'error' => 'login')); exit; }
$ses = json_decode($ra, true);
$tok = isset($ses['idToken']) ? $ses['idToken'] : '';
if ($tok === '') { echo json_encode(array('ok' => false, 'error' => 'login')); exit; }
$auth = array('Authorization: Bearer ' . $tok);

// ---------- 4. escribir SÓLO tel y mail ----------
$cuerpo = json_encode(array('fields' => array(
  'tel'       => array('stringValue' => $tel),
  'mail'      => array('stringValue' => $mail),
  'updatedAt' => array('stringValue' => gmdate('Y-m-d\TH:i:s\Z')),
)));
$url = $FS . 'inv_invitados/' . rawurlencode($slug . '__' . $token)
     . '?updateMask.fieldPaths=tel'
     . '&updateMask.fieldPaths=mail'
     . '&updateMask.fieldPaths=updatedAt'
     . '&currentDocument.exists=true';
list($rw, $cw) = pedir($url, 'PATCH', $cuerpo, $auth);
if ($cw < 200 || $cw >= 300) {
  echo json_encode(array('ok' => false, 'error' => 'guardar', 'detalle' => 'http' . $cw));
  exit;
}

echo json_encode(array('ok' => true, 'token' => $token, 'tel' => $tel, 'mail' => $mail));
