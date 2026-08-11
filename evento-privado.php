<?php
/**
 * Invitame — CANDADO REAL de la "invitacion privada".
 *
 * Antes la clave se comparaba en el navegador: el candado era un cartel de CSS
 * y el contenido de la invitacion ya estaba descargado. Cualquiera que supiera
 * mirar el codigo la veia igual.
 *
 * Ahora, cuando un evento tiene clave:
 *   - el documento publico queda marcado con  privado: true
 *   - la REGLA de Firestore no lo deja leer (ni con el link)
 *   - la invitacion pide los datos ACA, mandando la clave
 *   - este archivo verifica la clave contra inv_privado/{slug} (que tampoco se
 *     puede leer sin sesion) y recien entonces devuelve el evento.
 *
 * O sea: sin la clave, los datos del evento NO salen del servidor.
 *
 * Entrada (POST JSON): { slug, clave }
 * Salida: { ok:true, evento:{...} }  |  { ok:false, error:"..." }
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405);
  echo json_encode(array('ok' => false, 'error' => 'metodo'));
  exit;
}

// Cuerpo chico: acá solo entran un slug y una clave.
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 2048) {
  http_response_code(413);
  echo json_encode(array('ok' => false, 'error' => 'grande'));
  exit;
}

$PROJECT    = 'invitame-9b51f';
$APIKEY_WEB = 'AIzaSyBXWZc9xdpXx7HCkJfxcyofgI00buNlIXc';   // publica por diseño, no es un secreto

// ---------- entrada ----------
$raw = file_get_contents('php://input');
$in  = json_decode($raw, true);
if (!is_array($in)) $in = array();

$slug = strtolower(trim(is_string($in['slug'] ?? '') ? $in['slug'] : ''));
$slug = preg_replace('/[^a-z0-9\-]/', '', $slug);
$slug = substr($slug, 0, 60);
$clave = is_string($in['clave'] ?? '') ? trim($in['clave']) : '';
$clave = mb_substr($clave, 0, 120);

if ($slug === '') {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'datos'));
  exit;
}

// ---------- freno anti fuerza bruta ----------
// Este es el punto donde alguien probaria claves una atras de otra, asi que el
// tope por invitacion es apretado a proposito (a diferencia del alta de pases,
// donde un uso normal puede ser de cientos por hora).
$rutaLim = dirname(__FILE__) . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  iv_frenar(array(
    // 12 intentos por hora para la misma invitacion desde la misma conexion.
    // Un invitado que se equivoca 2 o 3 veces no se topa nunca.
    array('priv-try-' . $slug . '-' . iv_ip(), 12,   3600),
    array('priv-inv-' . $slug,                 120,  3600),   // 120/h por invitacion (todas las conexiones)
    array('priv-ip-'  . iv_ip(),               200,  3600),   // 200/h por conexion
    array('priv-glob',                         5000, 3600),   // tope global
  ));
}

// ---------- helpers de Firestore ----------
function fs_doc_auth($project, $coleccion, $id, $idToken) {
  $url = 'https://firestore.googleapis.com/v1/projects/' . $project .
         '/databases/(default)/documents/' . $coleccion . '/' . rawurlencode($id);
  $ch = curl_init($url);
  curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_TIMEOUT        => 8,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_HTTPHEADER     => array('Authorization: Bearer ' . $idToken),
  ));
  $r = curl_exec($ch);
  $c = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return array($r, $c);
}

// Entra a Firebase con la cuenta del sistema. Las credenciales viven FUERA del
// repo publico, en invitame-panel.php, arriba de public_html.
function fs_login($apikey) {
  $PANEL_USER = ''; $PANEL_PASS = '';
  $raiz = dirname($_SERVER['DOCUMENT_ROOT'] ?? '/');
  $candidatos = array($raiz . '/invitame-panel.php', dirname($raiz) . '/invitame-panel.php');
  foreach ($candidatos as $ruta) {
    if (!is_readable($ruta)) continue;
    include $ruta;
    // OJO: cortar solo cuando las variables quedaron cargadas. Si se corta en el
    // primer archivo que existe, se puede terminar leyendo el config de Cloudinary.
    if ($PANEL_USER !== '' && $PANEL_PASS !== '') break;
  }
  if ($PANEL_USER === '' || $PANEL_PASS === '') return '';
  $ch = curl_init('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' . $apikey);
  curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode(array('email'=>$PANEL_USER,'password'=>$PANEL_PASS,'returnSecureToken'=>true)),
    CURLOPT_HTTPHEADER     => array('Content-Type: application/json'),
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_TIMEOUT        => 8,
    CURLOPT_SSL_VERIFYPEER => true,
  ));
  $r = curl_exec($ch); curl_close($ch);
  $j = json_decode((string)$r, true);
  return isset($j['idToken']) ? $j['idToken'] : '';
}

// Firestore devuelve los valores "tipados" ({stringValue:..}). La invitacion espera
// un objeto comun, igual al que le da el SDK. Esto los convierte.
function fs_val($v) {
  if (!is_array($v)) return null;
  if (array_key_exists('nullValue', $v))      return null;
  if (array_key_exists('stringValue', $v))    return $v['stringValue'];
  if (array_key_exists('booleanValue', $v))   return (bool)$v['booleanValue'];
  if (array_key_exists('integerValue', $v))   return (int)$v['integerValue'];
  if (array_key_exists('doubleValue', $v))    return (float)$v['doubleValue'];
  if (array_key_exists('timestampValue', $v)) return $v['timestampValue'];
  if (array_key_exists('bytesValue', $v))     return null;
  if (array_key_exists('referenceValue', $v)) return $v['referenceValue'];
  if (array_key_exists('geoPointValue', $v))  return $v['geoPointValue'];
  if (array_key_exists('arrayValue', $v)) {
    $out = array();
    $items = isset($v['arrayValue']['values']) ? $v['arrayValue']['values'] : array();
    foreach ($items as $it) $out[] = fs_val($it);
    return $out;
  }
  if (array_key_exists('mapValue', $v)) {
    $out = array();
    $campos = isset($v['mapValue']['fields']) ? $v['mapValue']['fields'] : array();
    foreach ($campos as $k => $it) $out[$k] = fs_val($it);
    return (object)$out;   // objeto, no lista, aunque venga vacio
  }
  return null;
}
function fs_campos($doc) {
  $out = array();
  $f = isset($doc['fields']) ? $doc['fields'] : array();
  foreach ($f as $k => $v) $out[$k] = fs_val($v);
  return $out;
}

// ---------- 1) sesion del sistema ----------
$idToken = fs_login($APIKEY_WEB);
if ($idToken === '') {
  http_response_code(503);
  echo json_encode(array('ok' => false, 'error' => 'sin-config'));
  exit;
}

// ---------- 2) la clave guardada ----------
list($rp, $cp) = fs_doc_auth($PROJECT, 'inv_privado', $slug, $idToken);
$priv = ($cp === 200) ? fs_campos(json_decode((string)$rp, true)) : array();
$guardada = isset($priv['c_contrasena-para-el-evento']) ? trim((string)$priv['c_contrasena-para-el-evento']) : '';

if ($guardada === '') {
  // El evento no tiene clave privada. No hay nada que desbloquear por aca:
  // la invitacion se lee derecho desde Firestore como siempre.
  echo json_encode(array('ok' => false, 'error' => 'sin-clave'));
  exit;
}

// Comparacion en tiempo constante (que no se pueda deducir la clave midiendo cuanto tarda)
if (!hash_equals($guardada, $clave)) {
  // 401 a proposito: el que la escribio mal tiene que ver "clave incorrecta",
  // no un error raro.
  http_response_code(401);
  echo json_encode(array('ok' => false, 'error' => 'clave'));
  exit;
}

// ---------- 3) clave correcta: recien ahora se entrega el evento ----------
list($re, $ce) = fs_doc_auth($PROJECT, 'inv_eventos', $slug, $idToken);
if ($ce !== 200) {
  http_response_code(404);
  echo json_encode(array('ok' => false, 'error' => 'evento'));
  exit;
}
$evento = fs_campos(json_decode((string)$re, true));

// Nunca devolver los campos privados, aunque hubieran quedado de antes.
foreach (array('c_contrasena-para-el-evento', 'c_clave-del-panel-de-los-novios', 'c_email-para-confirmaciones') as $k) {
  unset($evento[$k]);
}

echo json_encode(array('ok' => true, 'evento' => $evento), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
