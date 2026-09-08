<?php
/**
 * Invitame — guarda LA FRASE DEL FILTRO, pedida desde el panel de los novios.
 *
 * QUÉ ES LA FRASE
 *   El renglón que va arriba de los nombres en el marco de la foto:
 *   «EN LA BODA DE / Camila & Tomás / 6 DE MARZO DE 2027».
 *   Si está vacía, la invitación pone la que corresponde al tipo de evento.
 *
 * POR QUÉ NO SE ESCRIBE DIRECTO DESDE EL NAVEGADOR
 *   Es el mismo motivo que `pase-voz-guardar.php`. Los novios NO pueden escribir
 *   en `inv_eventos` (la regla de Firestore se los impide, y está bien): en ese
 *   MISMO documento viven las fotos, los lugares, los textos y el diseño entero
 *   de la invitación. Si se abriera a escritura, cualquiera con el link de un
 *   panel podría rehacerle la invitación a una pareja.
 *
 *   Entonces el pedido pasa por acá:
 *     1. Se comprueba que quien pide CONOCE la clave del panel de esa invitación.
 *        La prueba es que exista el documento inv_paneles/{slug}__{clave}.
 *     2. Recién entonces este archivo entra a Firebase como usuario del sistema
 *        y escribe, y escribe SOLO la frase.
 *
 * ⚠️ EL `updateMask` NO ES OPCIONAL, Y ACÁ MENOS QUE NUNCA. Un PATCH sin máscara
 *    REEMPLAZA EL DOCUMENTO ENTERO: borraría la invitación completa. Con la
 *    máscara `fx.filtro.frase` se toca SÓLO esa hoja.
 *    Probado el 8/9/2026 en un documento de descarte: después del PATCH
 *    sobrevivieron `fx.paleta`, `fx.coleccion`, `fx.sobre` y, dentro de
 *    `fx.filtro`, `encendido` y `diseno`. Si algún día se cambia esta máscara,
 *    se vuelve a probar así, en un documento de descarte, NUNCA en uno real.
 *
 * ⚠️ GANA EL ÚLTIMO QUE GUARDA. La frase la pueden cambiar los novios desde acá
 *    y el equipo desde el panel. Por eso se guardan también QUIÉN y CUÁNDO, para
 *    que los dos paneles puedan mostrarlo y nadie se sorprenda.
 *
 * ⚠️ LA FRASE ES TEXTO DE GENTE. Se le sacan las etiquetas y los saltos de línea
 *    acá, y la invitación además la escapa antes de dibujarla.
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

// ---------- entrada ----------
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 4096) { http_response_code(413); echo json_encode(array('ok'=>false,'error'=>'muy-grande')); exit; }
$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = array();

function limpio($v, $max = 200) {
  $v = is_string($v) ? $v : '';
  $v = strip_tags($v);
  $v = str_replace(array("\r", "\n", "\t"), ' ', $v);
  $v = preg_replace('/\s+/u', ' ', $v);
  return trim(mb_substr($v, 0, $max));
}

$slug  = preg_replace('/[^a-z0-9\-]/', '', strtolower(limpio($in['slug'] ?? '', 60)));
$clave = limpio($in['clave'] ?? '', 60);
$frase = limpio($in['frase'] ?? '', 60);   // vacía es válido: vuelve a la automática

if ($slug === '' || $clave === '') {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'faltan-datos'));
  exit;
}

// Freno anti-abuso. Los topes son generosos: es un campo de texto que se toca
// dos o tres veces en toda la vida de una invitación.
$rutaLim = __DIR__ . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  iv_frenar(array(
    array('ff-ip-'  . iv_ip(), 60,  3600),
    array('ff-inv-' . $slug,   60,  3600),
    array('ff-glob',           600, 3600),
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

// ---------- 2. ¿la invitación existe? ----------
list($re, $ce) = pedir($FS . 'inv_eventos/' . rawurlencode($slug) . '?key=' . $APIKEY);
if ($ce != 200) {
  http_response_code(404);
  echo json_encode(array('ok' => false, 'error' => 'invitacion'));
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

// ---------- 4. escribir SOLO la frase ----------
// ⚠️ Las tres hojas y nada más. Ver la nota grande de arriba.
$cuando = gmdate('Y-m-d\TH:i:s\Z');
$mask = 'updateMask.fieldPaths=fx.filtro.frase'
      . '&updateMask.fieldPaths=fx.filtro.fraseAt'
      . '&updateMask.fieldPaths=fx.filtro.frasePor';
$doc = array('fields' => array('fx' => array('mapValue' => array('fields' => array(
  'filtro' => array('mapValue' => array('fields' => array(
    'frase'    => array('stringValue' => $frase),
    'fraseAt'  => array('stringValue' => $cuando),
    'frasePor' => array('stringValue' => 'novios'),
  ))),
)))));
list($rc, $cc) = pedir(
  $FS . 'inv_eventos/' . rawurlencode($slug) . '?' . $mask,
  'PATCH', json_encode($doc), $auth
);
if ($cc < 200 || $cc >= 300) {
  echo json_encode(array('ok' => false, 'error' => 'guardar', 'detalle' => 'http' . $cc . ' ' . substr((string)$rc, 0, 200)));
  exit;
}

echo json_encode(array(
  'ok'     => true,
  'frase'  => $frase,
  'cuando' => $cuando,
  'vacia'  => ($frase === '')
));
