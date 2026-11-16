<?php
/**
 * Invitame — LA TRIVIA EN EL PANEL DE LOS NOVIOS (16/11/2026)
 *
 * Jazmín: «Los resultados de la trivia no se ven en el panel» y «en ese sector
 * ellos pueden modificar las preguntas o respuestas» (como la plataforma vieja:
 * PreguntaME! → Trivia / Resultados).
 *
 * Desde mi-panel.html, con la clave que ya tienen, los novios:
 *   · ven sus preguntas y las cambian           (acción 'ver' / 'guardar')
 *   · ven la tabla de posiciones                (acción 'ver')
 *   · sacan a un jugador de la tabla            (acción 'borrar')
 *   · reinician la trivia (tabla en cero)       (acción 'reiniciar')
 *
 * POR QUÉ PASA POR ACÁ (igual que itinerario-guardar.php)
 *   Los novios no pueden escribir en `inv_eventos` ni leer `inv_trivia`, y está
 *   bien. Se comprueba que CONOCEN la clave del panel (existe
 *   `inv_paneles/{slug}__{clave}`) y recién ahí este archivo entra como usuario
 *   del sistema.
 *
 * ⚠️ El `updateMask` no es opcional: un PATCH sin máscara reemplaza el documento
 *    entero. En `inv_eventos` se toca SÓLO `trivia`; en `inv_trivia` sólo
 *    `jugadores.<clave>` o `jugadores`.
 *
 * Las credenciales del sistema viven FUERA del repo, en invitame-panel.php.
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

if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 30000) { http_response_code(413); echo json_encode(array('ok'=>false,'error'=>'muy-grande')); exit; }
$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = array();

function limpio($v, $max = 200) {
  $v = is_string($v) ? $v : (is_numeric($v) ? (string)$v : '');
  $v = strip_tags($v);
  $v = str_replace(array("\r", "\n", "\t"), ' ', $v);
  $v = preg_replace('/\s+/u', ' ', $v);
  return trim(mb_substr($v, 0, $max));
}

$slug   = preg_replace('/[^a-z0-9\-]/', '', strtolower(limpio($in['slug'] ?? '', 60)));
$clave  = limpio($in['clave'] ?? '', 60);
$accion = limpio($in['accion'] ?? 'ver', 20);
if ($slug === '' || $clave === '' || !in_array($accion, array('ver', 'guardar', 'borrar', 'reiniciar'), true)) {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'faltan-datos'));
  exit;
}

$rutaLim = __DIR__ . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  iv_frenar(array(
    array('tn-ip-'  . iv_ip(), 300,  3600),
    array('tn-inv-' . $slug,   300,  3600),
    array('tn-glob',           3000, 3600),
  ));
}

function pedir($url, $metodo = 'GET', $cuerpo = null, $headers = array()) {
  $ch = curl_init($url);
  $opt = array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => $metodo,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_SSL_VERIFYPEER => true,
  );
  if ($cuerpo !== null) { $opt[CURLOPT_POSTFIELDS] = $cuerpo; $headers[] = 'Content-Type: application/json'; }
  if ($headers) $opt[CURLOPT_HTTPHEADER] = $headers;
  curl_setopt_array($ch, $opt);
  $r = curl_exec($ch);
  $c = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return array($r, $c);
}

// ---------- 1. ¿conoce la clave del panel? ----------
list($rp, $cp) = pedir($FS . 'inv_paneles/' . rawurlencode($slug . '__' . $clave) . '?key=' . $APIKEY);
if ($cp != 200) { http_response_code(403); echo json_encode(array('ok' => false, 'error' => 'clave')); exit; }

// ---------- 2. credenciales del sistema ----------
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
if ($PANEL_USER === '' || $PANEL_PASS === '') { echo json_encode(array('ok' => false, 'error' => 'sin-config')); exit; }
list($ra, $ca) = pedir('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' . $APIKEY, 'POST',
  json_encode(array('email' => $PANEL_USER, 'password' => $PANEL_PASS, 'returnSecureToken' => true)));
if ($ca != 200) { echo json_encode(array('ok' => false, 'error' => 'login')); exit; }
$sesion  = json_decode($ra, true);
$idToken = isset($sesion['idToken']) ? $sesion['idToken'] : '';
if ($idToken === '') { echo json_encode(array('ok' => false, 'error' => 'login')); exit; }
$auth = array('Authorization: Bearer ' . $idToken);

// ---------- las preguntas: se aceptan las dos formas guardadas ({q,o,c} y {p,o,r}) ----------
function leerPreguntas($campos) {
  $out = array();
  if (!isset($campos['trivia']['arrayValue']['values'])) return $out;
  foreach ($campos['trivia']['arrayValue']['values'] as $v) {
    $f = isset($v['mapValue']['fields']) ? $v['mapValue']['fields'] : array();
    $q = isset($f['q']['stringValue']) ? $f['q']['stringValue'] : (isset($f['p']['stringValue']) ? $f['p']['stringValue'] : '');
    $o = array();
    if (isset($f['o']['arrayValue']['values'])) foreach ($f['o']['arrayValue']['values'] as $x) $o[] = isset($x['stringValue']) ? $x['stringValue'] : '';
    $c = isset($f['c']['integerValue']) ? (int)$f['c']['integerValue'] : (isset($f['r']['integerValue']) ? (int)$f['r']['integerValue'] : 0);
    $out[] = array('q' => $q, 'o' => $o, 'c' => $c);
  }
  return $out;
}
function leerJugadores($FS, $slug, $auth) {
  list($rt, $ct) = pedir($FS . 'inv_trivia/' . rawurlencode($slug), 'GET', null, $auth);
  $jug = array();
  if ($ct != 200) return $jug;
  $doc = json_decode($rt, true);
  if (!isset($doc['fields']['jugadores']['mapValue']['fields'])) return $jug;
  foreach ($doc['fields']['jugadores']['mapValue']['fields'] as $k => $v) {
    $f = isset($v['mapValue']['fields']) ? $v['mapValue']['fields'] : array();
    $jug[] = array(
      'clave'   => $k,
      'nombre'  => isset($f['nombre']['stringValue']) ? $f['nombre']['stringValue'] : '',
      'puntaje' => isset($f['puntaje']['integerValue']) ? (int)$f['puntaje']['integerValue'] : 0,
      'at'      => isset($f['at']['timestampValue']) ? $f['at']['timestampValue'] : '',
    );
  }
  usort($jug, function ($a, $b) { return ($b['puntaje'] - $a['puntaje']) ?: strcmp($a['at'], $b['at']); });
  return $jug;
}

// ---------- GUARDAR las preguntas ----------
if ($accion === 'guardar') {
  $lista = isset($in['preguntas']) && is_array($in['preguntas']) ? $in['preguntas'] : array();
  $vals = array();
  foreach ($lista as $p) {
    if (!is_array($p)) continue;
    $q = limpio($p['q'] ?? '', 200);
    $o = array();
    if (isset($p['o']) && is_array($p['o'])) foreach ($p['o'] as $x) { $x = limpio($x, 100); if ($x !== '') $o[] = $x; if (count($o) >= 4) break; }
    if ($q === '' || count($o) < 2) continue;              // pregunta incompleta: no viaja
    $c = (int)($p['c'] ?? 0); if ($c < 0 || $c >= count($o)) $c = 0;
    $ov = array(); foreach ($o as $x) $ov[] = array('stringValue' => $x);
    $vals[] = array('mapValue' => array('fields' => array(
      'q' => array('stringValue' => $q),
      'o' => array('arrayValue' => array('values' => $ov)),
      'c' => array('integerValue' => (string)$c),
    )));
    if (count($vals) >= 15) break;
  }
  if (!count($vals)) { echo json_encode(array('ok' => false, 'error' => 'sin-preguntas')); exit; }
  $doc = array('fields' => array('trivia' => array('arrayValue' => array('values' => $vals))));
  list($rc, $cc) = pedir($FS . 'inv_eventos/' . rawurlencode($slug) . '?updateMask.fieldPaths=trivia', 'PATCH', json_encode($doc), $auth);
  if ($cc < 200 || $cc >= 300) { echo json_encode(array('ok' => false, 'error' => 'guardar', 'detalle' => 'http' . $cc)); exit; }
  echo json_encode(array('ok' => true, 'preguntas' => count($vals)));
  exit;
}

// ---------- BORRAR un jugador / REINICIAR ----------
if ($accion === 'borrar' || $accion === 'reiniciar') {
  if ($accion === 'borrar') {
    $k = preg_replace('/[^a-zA-Z0-9]/', '', limpio($in['jugador'] ?? '', 80));
    if ($k === '') { echo json_encode(array('ok' => false, 'error' => 'faltan-datos')); exit; }
    $mask = 'updateMask.fieldPaths=' . rawurlencode('jugadores.' . $k);   // sin valor en el cuerpo = se borra ese jugador
    $doc = array('fields' => (object)array());
  } else {
    $mask = 'updateMask.fieldPaths=jugadores';
    $doc = array('fields' => array('jugadores' => array('mapValue' => array('fields' => (object)array()))));
  }
  list($rc, $cc) = pedir($FS . 'inv_trivia/' . rawurlencode($slug) . '?' . $mask, 'PATCH', json_encode($doc), $auth);
  if ($cc < 200 || $cc >= 300) { echo json_encode(array('ok' => false, 'error' => 'guardar', 'detalle' => 'http' . $cc)); exit; }
  echo json_encode(array('ok' => true, 'jugadores' => leerJugadores($FS, $slug, $auth)), JSON_UNESCAPED_UNICODE);
  exit;
}

// ---------- VER ----------
list($re, $ce) = pedir($FS . 'inv_eventos/' . rawurlencode($slug) . '?mask.fieldPaths=trivia&mask.fieldPaths=' . rawurlencode('`c_habilitar-trivia`'), 'GET', null, $auth);
$campos = array();
if ($ce == 200) { $e = json_decode($re, true); $campos = isset($e['fields']) ? $e['fields'] : array(); }
$hab = isset($campos['c_habilitar-trivia']) ? (isset($campos['c_habilitar-trivia']['booleanValue']) ? $campos['c_habilitar-trivia']['booleanValue'] : (string)($campos['c_habilitar-trivia']['stringValue'] ?? '')) : '';
echo json_encode(array(
  'ok'         => true,
  'habilitada' => ($hab === true || preg_match('/^(true|si|sí|1)$/i', (string)$hab) === 1),
  'preguntas'  => leerPreguntas($campos),
  'jugadores'  => leerJugadores($FS, $slug, $auth),
), JSON_UNESCAPED_UNICODE);
