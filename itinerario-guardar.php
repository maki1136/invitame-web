<?php
/**
 * Invitame — EL ITINERARIO QUE CARGAN LOS NOVIOS, aplicado solo a la invitacion.
 *
 * QUE PROBLEMA RESUELVE
 *   Los horarios de una fiesta cambian mil veces, y los cambian los novios. Eso
 *   quedaba guardado en SU documento (`inv_paneles/{slug}__{clave}`), que la
 *   invitacion NO lee. Para que llegara, alguien del equipo tenia que abrir el
 *   admin, tocar «Traer lo de los novios» y despues «Guardar y publicar».
 *
 *   Maki, 8/9/2026, textual: «si lo cambian ellos, Jazmin que tiene que ver?».
 *
 * POR QUE NO LO ESCRIBE EL NAVEGADOR DE LOS NOVIOS
 *   Mismo motivo que `filtro-guardar.php`: las reglas de Firestore no los dejan
 *   escribir en `inv_eventos`, y esta bien. En ESE MISMO documento viven las
 *   fotos, los lugares, los textos y el diseno entero. Si se abriera a
 *   escritura, cualquiera con el link de un panel podria rehacerle la
 *   invitacion a una pareja. Entonces el pedido pasa por aca:
 *     1. Se comprueba que quien pide CONOCE la clave del panel. La prueba es
 *        que exista `inv_paneles/{slug}__{clave}`.
 *     2. Recien entonces este archivo entra como usuario del sistema y escribe,
 *        y escribe SOLO el itinerario.
 *
 * ⚠️ EL NAVEGADOR NO MANDA EL ITINERARIO. Manda direccion y clave. Los momentos
 *    se leen ACA, del mismo documento que sirvio para verificar la clave.
 *
 * ⚠️ EL `updateMask` NO ES OPCIONAL, Y ACA MENOS QUE NUNCA. Un PATCH sin
 *    mascara REEMPLAZA EL DOCUMENTO ENTERO: borraria la invitacion completa.
 *    Se tocan estas hojas y ninguna otra:
 *        fx.itinerario.modo
 *        fx.itinerario.momentos
 *        fx.itinerario.actualizadoEl
 *        `img_c_itinerario-imagen`   (solo si subieron una imagen)
 *
 * ⚠️ `fx.itinerario.estilo` NO SE TOCA. Esa es la decision de diseno de quien
 *    armo la invitacion (la linea al costado o al medio en zigzag), no de los
 *    novios. Si entrara en la mascara, cada vez que ellos corren un horario le
 *    pisarian el diseno al equipo.
 *
 * ⚠️ EL NOMBRE DEL CAMPO DE LA IMAGEN TIENE UN GUION. En Firestore, un camino
 *    de campo con guion HAY QUE ESCRIBIRLO ENTRE ACENTOS GRAVES (`) o el
 *    servidor lo entiende como otra cosa y la escritura no llega — en silencio,
 *    sin error. Ya nos habia pasado con la clave del jugador de la trivia.
 *    Por eso abajo va entre acentos graves y codificado como %60 en la URL.
 *
 * El usuario y la contrasena viven FUERA del repositorio, en invitame-panel.php
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

if ($slug === '' || $clave === '') {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'faltan-datos'));
  exit;
}

$rutaLim = __DIR__ . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  iv_frenar(array(
    array('ig-ip-'  . iv_ip(), 300,  3600),
    array('ig-inv-' . $slug,   300,  3600),
    array('ig-glob',           3000, 3600),
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

// ---------- 2. leer el itinerario DEL DOCUMENTO ----------
$it = isset($campos['itinerario']['mapValue']['fields']) ? $campos['itinerario']['mapValue']['fields'] : null;
if (!$it) {
  // Todavia no cargaron nada. NO se escribe: si escribieramos un itinerario
  // vacio, le borrariamos a la invitacion el que ya tenia cargado el equipo.
  echo json_encode(array('ok' => true, 'nada' => true));
  exit;
}

$modo   = isset($it['modo']['stringValue'])   ? $it['modo']['stringValue']   : '';
$imagen = isset($it['imagen']['stringValue']) ? $it['imagen']['stringValue'] : '';
if ($modo !== 'texto' && $modo !== 'imagen') $modo = '';

$momentos = array();
if (isset($it['momentos']['arrayValue']['values'])) {
  foreach ($it['momentos']['arrayValue']['values'] as $v) {
    $f = isset($v['mapValue']['fields']) ? $v['mapValue']['fields'] : array();
    $h = isset($f['h']['stringValue']) ? limpio($f['h']['stringValue'], 12)  : '';
    $t = isset($f['t']['stringValue']) ? limpio($f['t']['stringValue'], 80)  : '';
    $d = isset($f['d']['stringValue']) ? limpio($f['d']['stringValue'], 140) : '';
    if ($h === '' && $t === '' && $d === '') continue;   // renglon vacio: no viaja
    $momentos[] = array('mapValue' => array('fields' => array(
      'h' => array('stringValue' => $h),
      't' => array('stringValue' => $t),
      'd' => array('stringValue' => $d),
    )));
    if (count($momentos) >= 40) break;                   // techo sano
  }
}

// Eligieron «una imagen» pero todavia no la subieron: no se cambia el modo, o la
// seccion quedaria en blanco en la invitacion. Su panel ya se los avisa.
$soloImagenSinImagen = ($modo === 'imagen' && $imagen === '' );

// Si no hay NADA que aplicar, no se escribe.
if (!count($momentos) && $imagen === '' && ($modo === '' || $soloImagenSinImagen)) {
  echo json_encode(array('ok' => true, 'nada' => true));
  exit;
}

// ---------- 3. credenciales del sistema ----------
$PANEL_USER = ''; $PANEL_PASS = '';
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

// ---------- 4. escribir SOLO el itinerario ----------
$cuando = gmdate('Y-m-d\TH:i:s\Z');

$hojas = array('fx.itinerario.momentos', 'fx.itinerario.actualizadoEl');
$sub = array(
  'momentos'      => array('arrayValue' => array('values' => $momentos)),
  'actualizadoEl' => array('stringValue' => $cuando),
);
if ($modo !== '' && !$soloImagenSinImagen) {
  $hojas[] = 'fx.itinerario.modo';
  $sub['modo'] = array('stringValue' => $modo);
}

$doc = array('fields' => array('fx' => array('mapValue' => array('fields' => array(
  'itinerario' => array('mapValue' => array('fields' => $sub)),
)))));

// La imagen NO vive dentro de `fx`: es un campo suelto del evento, y su nombre
// lleva un guion. Ver la nota grande de arriba: sin los acentos graves, esto no
// se escribe y no avisa.
if ($imagen !== '' && preg_match('#^https://#', $imagen)) {
  $hojas[] = '`img_c_itinerario-imagen`';
  $doc['fields']['img_c_itinerario-imagen'] = array('stringValue' => $imagen);
}

$mask = '';
foreach ($hojas as $h) $mask .= ($mask === '' ? '' : '&') . 'updateMask.fieldPaths=' . rawurlencode($h);

list($rc, $cc) = pedir(
  $FS . 'inv_eventos/' . rawurlencode($slug) . '?' . $mask,
  'PATCH', json_encode($doc), $auth
);
if ($cc < 200 || $cc >= 300) {
  echo json_encode(array('ok' => false, 'error' => 'guardar', 'detalle' => 'http' . $cc . ' ' . substr((string)$rc, 0, 200)));
  exit;
}

echo json_encode(array(
  'ok'       => true,
  'modo'     => $modo,
  'momentos' => count($momentos),
  'imagen'   => ($imagen !== ''),
  'cuando'   => $cuando,
));
