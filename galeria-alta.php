<?php
/**
 * Invitame — ALTA DE UNA GALERÍA («Invítame Live») PARA UN CLIENTE PROPIO.
 *
 * ⚠️⚠️ POR QUÉ EXISTE ESTE ARCHIVO — la confusión que resolvió
 *
 *   El Worker de la galería tiene DOS puertas para dar de alta una fiesta, y
 *   hacen cosas distintas:
 *
 *     1. `X-Clave: CLAVE_ALTA`         → **NO gasta crédito**.
 *        Es la puerta de la casa: la que se usa cuando la fiesta es de un
 *        cliente de Invítame. La clave es un secreto del Worker, así que NO
 *        puede viajar en el navegador (este repo es público). Por eso hace
 *        falta este portero.
 *
 *     2. `Authorization: Bearer <token de Firebase>` → **gasta 1 crédito**.
 *        Es la puerta de los clientes B2B. Un fotógrafo entra con SU cuenta y
 *        consume las fiestas que te compró.
 *
 *   Maki, 8/9/2026: *«pero no entiendo que gasten créditos los B2C»*. Tenía
 *   razón. Los créditos son la unidad de venta del canal B2B; en una venta
 *   directa no hay ninguna razón para descontar nada. La primera versión del
 *   botón del panel usaba la puerta 2 y por eso pedía saldo: estaba mal.
 *
 *   Regla que queda: **el alta de un cliente propio va SIEMPRE por acá.**
 *
 * ⚠️ QUIÉN PUEDE PEDIRLA
 *   Sólo el equipo. Se comprueba de verdad: el navegador manda el token de su
 *   sesión de Firebase, este archivo se lo da a Google para que diga de quién
 *   es, y recién si ese mail está en la lista de abajo sigue. Sin esa
 *   comprobación, cualquiera que encontrara la dirección podría crear galerías
 *   y quemarte los gigas del mes.
 *
 * ⚠️ LA CLAVE NO ESTÁ ACÁ. Vive en `invitame-galeria.php`, fuera del repo y
 *    fuera de public_html, en la variable `$GALERIA_CLAVE_ALTA`.
 *
 *    ⭐ ES UN ARCHIVO PROPIO, DE UNA SOLA LÍNEA, Y ESO ES A PROPÓSITO. La
 *    tentación era meterla en `invitame-panel.php`, que ya existe. Pero ese
 *    archivo guarda el usuario y la contraseña del sistema: si al editarlo se
 *    pisa algo o la línea nueva queda después del `?>`, se caen de golpe TODOS
 *    los porteros — las mesas, el itinerario, los pases, la confirmación y la
 *    trivia. Un archivo nuevo no puede romper nada que ya funcione.
 *    (Igual se sigue aceptando en `invitame-panel.php`, por si alguna vez está
 *    ahí.)
 *
 * ⚠️ ACÁ NO SE ESCRIBE NADA EN LA INVITACIÓN. Devuelve el código y listo; el
 *    panel lo guarda con «Guardar y publicar», como cualquier otro campo.
 */

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405);
  echo json_encode(array('ok' => false, 'error' => 'metodo'));
  exit;
}

$APIKEY = 'AIzaSyBXWZc9xdpXx7HCkJfxcyofgI00buNlIXc';
$WORKER = 'https://galeria.littlemomentsok.workers.dev';

/* Quiénes pueden dar de alta una galería de la casa. No es un secreto: sin la
   sesión de esa persona, saber el mail no sirve para nada. Se agrega uno nuevo
   escribiéndolo acá. */
$EQUIPO = array(
  'littlemomentsok@gmail.com',
  'info@invitameok.com',
);

// ---------- entrada ----------
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 4096) { http_response_code(413); echo json_encode(array('ok'=>false,'error'=>'muy-grande')); exit; }
$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = array();

function limpio($v, $max = 120) {
  $v = is_string($v) ? $v : '';
  $v = strip_tags($v);
  $v = str_replace(array("\r", "\n", "\t"), ' ', $v);
  $v = preg_replace('/\s+/u', ' ', $v);
  return trim(mb_substr($v, 0, $max));
}

$idToken = is_string($in['idToken'] ?? null) ? trim($in['idToken']) : '';
$nombre  = limpio($in['nombre'] ?? '', 80);
$fecha   = limpio($in['fecha'] ?? '', 10);
$modo    = (($in['modo'] ?? '') === 'previa') ? 'previa' : 'auto';
$audios  = !isset($in['audios']) || !!$in['audios'];

if ($idToken === '' || $nombre === '') {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'faltan-datos'));
  exit;
}
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) $fecha = '';

// Freno anti-abuso. Una galería por fiesta: los topes son bajos a propósito.
$rutaLim = __DIR__ . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  iv_frenar(array(
    array('ga-ip-' . iv_ip(), 30,  3600),
    array('ga-glob',          200, 3600),
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

// ---------- 1. ¿quién es? Se lo preguntamos a Google ----------
/* `accounts:lookup` devuelve la ficha del usuario SÓLO si el token es válido y
   no venció. Es la comprobación de verdad: no alcanza con que el navegador
   diga quién es. */
list($ru, $cu) = pedir(
  'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' . $APIKEY,
  'POST', json_encode(array('idToken' => $idToken))
);
if ($cu != 200) {
  http_response_code(401);
  echo json_encode(array('ok' => false, 'error' => 'sesion'));
  exit;
}
$u = json_decode($ru, true);
$mail = '';
if (isset($u['users'][0]['email'])) $mail = strtolower(trim($u['users'][0]['email']));

$permitido = false;
foreach ($EQUIPO as $e) { if ($mail !== '' && $mail === strtolower($e)) { $permitido = true; break; } }
if (!$permitido) {
  http_response_code(403);
  echo json_encode(array('ok' => false, 'error' => 'no-sos-del-equipo'));
  exit;
}

// ---------- 2. la clave del Worker ----------
$GALERIA_CLAVE_ALTA = '';
$PANEL_USER = ''; $PANEL_PASS = '';   // los declara el mismo archivo de config
$candidatos = array();
$dir = __DIR__;
for ($i = 0; $i < 6; $i++) {
  $candidatos[] = $dir . '/invitame-galeria.php';
  $candidatos[] = $dir . '/invitame-panel.php';
  $padre = dirname($dir);
  if ($padre === $dir) break;
  $dir = $padre;
}
if (isset($_SERVER['DOCUMENT_ROOT'])) {
  $candidatos[] = dirname($_SERVER['DOCUMENT_ROOT']) . '/invitame-galeria.php';
  $candidatos[] = dirname(dirname($_SERVER['DOCUMENT_ROOT'])) . '/invitame-galeria.php';
  $candidatos[] = dirname($_SERVER['DOCUMENT_ROOT']) . '/invitame-panel.php';
  $candidatos[] = dirname(dirname($_SERVER['DOCUMENT_ROOT'])) . '/invitame-panel.php';
}
foreach (array_unique($candidatos) as $ruta) {
  if (!is_readable($ruta)) continue;
  include $ruta;
  if ($GALERIA_CLAVE_ALTA !== '') break;
}
if ($GALERIA_CLAVE_ALTA === '') {
  echo json_encode(array(
    'ok' => false, 'error' => 'sin-clave',
    'detalle' => 'Falta $GALERIA_CLAVE_ALTA en invitame-galeria.php'
  ));
  exit;
}

// ---------- 3. el alta, por la puerta que NO gasta crédito ----------
list($rc, $cc) = pedir(
  $WORKER . '/crear', 'POST',
  json_encode(array('nombre' => $nombre, 'fecha' => $fecha, 'modo' => $modo, 'audios' => $audios)),
  array('X-Clave: ' . $GALERIA_CLAVE_ALTA)
);
$j = json_decode((string)$rc, true);
if ($cc < 200 || $cc >= 300 || !isset($j['gid'])) {
  echo json_encode(array(
    'ok' => false, 'error' => 'crear',
    'detalle' => (isset($j['error']) ? $j['error'] : ('http' . $cc))
  ));
  exit;
}

echo json_encode(array('ok' => true, 'gid' => $j['gid'], 'por' => $mail));
