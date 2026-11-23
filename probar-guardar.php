<?php
/**
 * Invítame — EL PROBADOR: GUARDA EL CONTACTO DE QUIEN PROBÓ UNA MUESTRA (23/11/2026)
 *
 * Maki: «quiero hacer un generador para el cliente de su muestra… que ponga una
 * imagen de ellos, sus nombres y su fecha. Obvio que deje el mail así nos queda
 * para retargeting».
 *
 * La página /probar.html arma la muestra con los datos del cliente EN EL LINK
 * (no se guarda ninguna invitación). Este archivo sólo guarda el contacto en
 * `inv_privado/__probadores-AAAA-MM` (lista `lista`), para el retargeting:
 *     muestra · tipo · nombres · fecha · mail · acepta promos · foto · mensaje · día
 *
 * ⚠️ PUERTA PÚBLICA Y ANÓNIMA: anti-robots, freno por IP y global, campos
 *    recortados y validados. El navegador NO elige el id ni la fecha de alta.
 * ⚠️ Si esto falla, el cliente IGUAL ve su invitación: la página no espera a
 *    este archivo para mostrarla.
 */
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405); echo json_encode(array('ok' => false, 'error' => 'metodo')); exit;
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) {
  http_response_code(413); echo json_encode(array('ok' => false, 'error' => 'muy-grande')); exit;
}
$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = array();

/* ANTI-ROBOTS LIVIANO: campo trampa y tiempo mínimo, SIN Turnstile.
   (23/11: con Turnstile, en Safari la casilla a veces no aparece y el cliente
   se quedaba sin ver su invitación. Acá sólo se guarda un contacto: el freno
   por IP y global de abajo alcanza.) */
$ar = isset($in['antiRobot']) && is_array($in['antiRobot']) ? $in['antiRobot'] : array();
$seg = (float)($ar['segundos'] ?? 0);
if (trim((string)($ar['trampa'] ?? '')) !== '' || $seg < 4) {
  http_response_code(403); echo json_encode(array('ok' => false, 'error' => 'anti-robot')); exit;
}

$rutaLim = __DIR__ . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  iv_frenar(array(
    array('pr-ip-' . iv_ip(), 20, 3600),
    array('pr-glob', 600, 3600),
  ));
}

function txt($v, $max) {
  $s = trim(preg_replace('/\s+/u', ' ', (string)$v));
  return function_exists('mb_substr') ? mb_substr($s, 0, $max, 'UTF-8') : substr($s, 0, $max);
}
$mail = strtolower(txt($in['mail'] ?? '', 120));
if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400); echo json_encode(array('ok' => false, 'error' => 'mail')); exit;
}
$muestra = preg_replace('/[^a-z0-9\-]/', '', strtolower((string)($in['muestra'] ?? '')));
$fecha   = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($in['fecha'] ?? '')) ? $in['fecha'] : '';
$foto    = (string)($in['foto'] ?? '');
if (!preg_match('~^https://res\.cloudinary\.com/oc8cgqt4/image/upload/[^\s"\'<>()\\\\]+$~', $foto)) $foto = '';

$doc = array(
  'muestra' => $muestra,
  'tipo'    => preg_replace('/[^a-z]/', '', strtolower((string)($in['tipo'] ?? ''))),
  'n1'      => txt($in['n1'] ?? '', 40),
  'n2'      => txt($in['n2'] ?? '', 40),
  'fecha'   => $fecha,
  'mensaje' => txt($in['msj'] ?? '', 220),
  'mail'    => $mail,
  'acepta'  => !empty($in['acepta']),
  'foto'    => $foto,
  'pais'    => strtoupper(substr(preg_replace('/[^A-Za-z]/', '', (string)($_SERVER['HTTP_CF_IPCOUNTRY'] ?? '')), 0, 2)),
  'creado'  => gmdate('Y-m-d\TH:i:s\Z'),
);

// ---------- la sesión del sistema (la misma de solicitud-crear.php) ----------
$PROJECT = 'invitame-9b51f';
$APIKEY  = 'AIzaSyBXWZc9xdpXx7HCkJfxcyofgI00buNlIXc';
$FS      = 'https://firestore.googleapis.com/v1/projects/' . $PROJECT . '/databases/(default)/documents/';
function pedir($url, $metodo = 'GET', $cuerpo = null, $headers = array()) {
  $ch = curl_init($url);
  $opt = array(CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $metodo,
               CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 15, CURLOPT_SSL_VERIFYPEER => true);
  if ($cuerpo !== null) { $opt[CURLOPT_POSTFIELDS] = $cuerpo; $headers[] = 'Content-Type: application/json'; }
  if ($headers) $opt[CURLOPT_HTTPHEADER] = $headers;
  curl_setopt_array($ch, $opt);
  $r = curl_exec($ch); $c = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
  return array($r, $c);
}
$PANEL_USER = ''; $PANEL_PASS = '';
$dir = __DIR__;
for ($i = 0; $i < 6; $i++) {
  foreach (array('/invitame-panel.php', '/invitame-config.php') as $n) {
    if ($PANEL_USER === '' && is_readable($dir . $n)) include $dir . $n;
  }
  $padre = dirname($dir); if ($padre === $dir) break; $dir = $padre;
}
if ($PANEL_USER === '' || $PANEL_PASS === '') { echo json_encode(array('ok' => false, 'error' => 'sin-config')); exit; }
list($ra, $ca) = pedir('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' . $APIKEY, 'POST',
  json_encode(array('email' => $PANEL_USER, 'password' => $PANEL_PASS, 'returnSecureToken' => true)));
$tok = ($ca == 200) ? (json_decode($ra, true)['idToken'] ?? '') : '';
if ($tok === '') { echo json_encode(array('ok' => false, 'error' => 'login')); exit; }

/* ⚠️ DÓNDE SE GUARDA: `inv_privado/__probadores-AAAA-MM`, una lista por mes.
   Una colección nueva (inv_probadores) la rechazan las reglas de Firestore (403,
   probado el 23/11), y `inv_privado` ya guarda cosas del sistema así
   (`__marcas`, ver marcas.php). Sólo se lee con sesión: el mail no queda público.
   Se agrega con `appendMissingElements`, así dos clientes a la vez no se pisan. */
$valores = array();
foreach ($doc as $k => $v) $valores[$k] = is_bool($v) ? array('booleanValue' => $v) : array('stringValue' => (string)$v);
$nombreDoc = 'projects/' . $PROJECT . '/databases/(default)/documents/inv_privado/__probadores-' . gmdate('Y-m');
$commit = array('writes' => array(array(
  'transform' => array('document' => $nombreDoc, 'fieldTransforms' => array(array(
    'fieldPath' => 'lista',
    'appendMissingElements' => array('values' => array(array('mapValue' => array('fields' => $valores)))),
  ))),
)));
list($rw, $cw) = pedir('https://firestore.googleapis.com/v1/projects/' . $PROJECT . '/databases/(default)/documents:commit',
                       'POST', json_encode($commit), array('Authorization: Bearer ' . $tok));
if ($cw != 200) { echo json_encode(array('ok' => false, 'error' => 'guardar', 'codigo' => $cw)); exit; }
echo json_encode(array('ok' => true));
