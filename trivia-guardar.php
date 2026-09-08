<?php
/**
 * Invitame — guarda el PUNTAJE de la trivia de un invitado y devuelve la tabla
 * de posiciones de ESA boda.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO
 *   Hasta el 7/9/2026 la trivia no guardaba nada: cada celular jugaba solo y la
 *   "tabla de posiciones" mostraba cuatro invitados INVENTADOS (Familia Gómez,
 *   Lucía Fernández…) que aparecían en la boda de todos los clientes.
 *   Maki: «si es con ranking, obvio, con los invitados de la fiesta».
 *
 *   Los invitados NO tienen usuario: no pueden escribir en Firestore, y eso está
 *   bien —en 'inv_invitados' viven los pases que lee el escáner de la puerta—.
 *   Entonces el puntaje pasa por acá, igual que el audio del pase con voz:
 *   este archivo entra a Firebase como usuario del sistema y escribe SOLO el
 *   puntaje, en una colección aparte.
 *
 * DÓNDE SE GUARDA
 *   'inv_trivia/{slug}' — UN documento por boda, con un mapa 'jugadores':
 *       jugadores: { <clave>: { nombre, puntaje, at } }
 *   Un solo documento por boda a propósito:
 *     · la tabla se arma con UNA lectura, sin índices compuestos de Firestore;
 *     · el PATCH con 'updateMask=jugadores.<clave>' toca sólo a ese jugador y
 *       no pisa a los demás (mismo cuidado que el '{merge:true}' de los novios).
 *   ⚠️ Por eso la clave del jugador es SÓLO letras y números: en un fieldPath de
 *      Firestore, un guion obliga a comillas raras y se rompe en silencio.
 *
 * QUÉ SE VALIDA, Y POR QUÉ CADA COSA
 *   1. Freno anti-abuso por IP, por boda y global (invitame-limite.php).
 *   2. La boda existe. Si no, no hay dónde guardar.
 *   3. El puntaje NO puede superar lo que dan las preguntas de ESA boda
 *      (10 por pregunta). Sin esto, cualquiera manda 99999 y se corona solo.
 *   4. Si la invitación se abrió con el link personal ('?g=token'), el nombre NO
 *      se acepta del navegador: se usa el nombre REAL del invitado que está en
 *      la lista. Así el ranking es de los invitados de la fiesta y nadie entra
 *      con el nombre de otro.
 *   5. SE JUEGA UNA SOLA VEZ. Vale el PRIMER puntaje y no se puede pisar.
 *      Maki: «obvio no pueden jugar mas de una vez porque sino sabrian la respuesta».
 *      Si pudieran repetir, la segunda vuelta la contestan de memoria y el ranking
 *      no dice nada. El freno está ACÁ, en el servidor: aunque alguien toque el
 *      navegador, el segundo puntaje se ignora.
 *   6. Tope de 400 jugadores por boda, para que nadie llene el documento.
 *   7. Modo CONSULTA ('consultar': true, sin puntaje): la invitación pregunta si
 *      esa persona ya jugó ANTES de mostrarle las preguntas. Así no la hace jugar
 *      al pedo para después decirle que no cuenta.
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
$TOPE_JUGADORES = 400;

// ---------- entrada ----------
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 4096) { http_response_code(413); echo json_encode(array('ok'=>false,'error'=>'muy-grande')); exit; }
$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = array();

function limpio($v, $max = 100) {
  $v = is_string($v) ? $v : '';
  $v = strip_tags($v);
  $v = str_replace(array("\r", "\n", "\t"), ' ', $v);
  $v = preg_replace('/\s+/u', ' ', $v);
  return trim(mb_substr($v, 0, $max));
}
/** clave de fieldPath: sólo letras y números, sin acentos. Ver la nota de arriba. */
function claveJugador($s) {
  $s = mb_strtolower($s, 'UTF-8');
  $s = strtr($s, array('á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ü'=>'u','ñ'=>'n','à'=>'a','è'=>'e','ì'=>'i','ò'=>'o','ù'=>'u'));
  $s = preg_replace('/[^a-z0-9]/', '', $s);
  return substr($s, 0, 40);
}

$slug    = preg_replace('/[^a-z0-9\-]/', '', strtolower(limpio($in['slug'] ?? '', 60)));
$token   = preg_replace('/[^A-Za-z0-9]/', '', limpio($in['token'] ?? '', 20));
$nombre  = limpio($in['nombre'] ?? '', 40);
$puntaje = isset($in['puntaje']) ? (int)$in['puntaje'] : -1;
$consultar = !empty($in['consultar']);       // preguntar si ya jugó, sin guardar nada
if ($consultar && $puntaje < 0) $puntaje = 0;

if ($slug === '' || $puntaje < 0) {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'faltan-datos'));
  exit;
}

$rutaLim = __DIR__ . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  iv_frenar(array(
    array('tv-ip-'  . iv_ip(), 60,   3600),
    array('tv-inv-' . $slug,   600,  3600),
    array('tv-glob',           4000, 3600),
  ));
}

// ---------- helper HTTP (mismo que pase-voz-guardar.php) ----------
function pedir($url, $metodo = 'GET', $cuerpo = null, $headers = array()) {
  $ch = curl_init($url);
  $opt = array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => $metodo,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT        => 12,
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

// ---------- 1. la boda existe, y cuánto se puede sacar como máximo ----------
list($re, $ce) = pedir($FS . 'inv_eventos/' . rawurlencode($slug) . '?key=' . $APIKEY);
if ($ce != 200) {
  http_response_code(404);
  echo json_encode(array('ok' => false, 'error' => 'evento'));
  exit;
}
$ev = json_decode($re, true);
$preg = 0;
if (isset($ev['fields']['trivia']['arrayValue']['values'])) $preg = count($ev['fields']['trivia']['arrayValue']['values']);
if ($preg < 1) {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'sin-preguntas'));
  exit;
}
if ($puntaje > $preg * 10) {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'puntaje-imposible'));
  exit;
}

// ---------- 2. quién es: si vino por su link personal, manda la lista ----------
$clave = '';
if ($token !== '') {
  list($rg, $cg) = pedir($FS . 'inv_invitados/' . rawurlencode($slug . '__' . $token) . '?key=' . $APIKEY);
  if ($cg == 200) {
    $inv = json_decode($rg, true);
    $slugInv = isset($inv['fields']['slug']['stringValue']) ? $inv['fields']['slug']['stringValue'] : '';
    $nomInv  = isset($inv['fields']['nombre']['stringValue']) ? $inv['fields']['nombre']['stringValue'] : '';
    if ($slugInv === $slug && $nomInv !== '') {
      $nombre = limpio($nomInv, 40);   // el nombre de la lista le gana al del navegador
      $clave  = 'g' . $token;
    }
  }
}
if ($nombre === '') {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'sin-nombre'));
  exit;
}
if ($clave === '') $clave = 'n' . claveJugador($nombre);
if ($clave === 'n') { http_response_code(400); echo json_encode(array('ok'=>false,'error'=>'nombre-raro')); exit; }

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
if ($PANEL_USER === '' || $PANEL_PASS === '') { echo json_encode(array('ok'=>false,'error'=>'sin-config')); exit; }

list($ra, $ca) = pedir(
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' . $APIKEY,
  'POST',
  json_encode(array('email' => $PANEL_USER, 'password' => $PANEL_PASS, 'returnSecureToken' => true))
);
if ($ca != 200) { echo json_encode(array('ok'=>false,'error'=>'login','detalle'=>'http'.$ca)); exit; }
$sesion  = json_decode($ra, true);
$idToken = isset($sesion['idToken']) ? $sesion['idToken'] : '';
if ($idToken === '') { echo json_encode(array('ok'=>false,'error'=>'login')); exit; }
$auth = array('Authorization: Bearer ' . $idToken);

// ---------- 4. la tabla que ya había ----------
list($rt, $ct) = pedir($FS . 'inv_trivia/' . rawurlencode($slug), 'GET', null, $auth);
$jug = array();
if ($ct == 200) {
  $doc = json_decode($rt, true);
  if (isset($doc['fields']['jugadores']['mapValue']['fields'])) {
    foreach ($doc['fields']['jugadores']['mapValue']['fields'] as $k => $v) {
      $f = isset($v['mapValue']['fields']) ? $v['mapValue']['fields'] : array();
      $jug[$k] = array(
        'nombre'  => isset($f['nombre']['stringValue']) ? $f['nombre']['stringValue'] : '',
        'puntaje' => isset($f['puntaje']['integerValue']) ? (int)$f['puntaje']['integerValue'] : 0,
      );
    }
  }
}

$yaJugo   = isset($jug[$clave]);
$anterior = $yaJugo ? (int)$jug[$clave]['puntaje'] : -1;
/* ⚠️ VALE LA PRIMERA VUELTA Y NADA MÁS. No es "se guarda el mejor": el que ya
   jugó conoce las respuestas, así que un segundo intento no cuenta ni aunque
   sea más alto. En modo consulta tampoco se escribe nada. */
$guardar = (!$yaJugo && !$consultar);
if (!$yaJugo && count($jug) >= $TOPE_JUGADORES) $guardar = false;       // boda llena

// ---------- 5. escribir SOLO a este jugador ----------
if ($guardar) {
  $campo = 'jugadores.' . $clave;                          // clave alfanumérica: fieldPath seguro
  $cuerpo = array('fields' => array(
    'slug'      => array('stringValue' => $slug),
    'jugadores' => array('mapValue' => array('fields' => array(
      $clave => array('mapValue' => array('fields' => array(
        'nombre'  => array('stringValue'    => $nombre),
        'puntaje' => array('integerValue'   => (string)$puntaje),
        'at'      => array('timestampValue' => gmdate('Y-m-d\TH:i:s\Z')),
      ))),
    ))),
  ));
  $mask = 'updateMask.fieldPaths=slug&updateMask.fieldPaths=' . rawurlencode($campo);
  list($rc, $cc) = pedir($FS . 'inv_trivia/' . rawurlencode($slug) . '?' . $mask, 'PATCH', json_encode($cuerpo), $auth);
  if ($cc != 200) {
    echo json_encode(array('ok' => false, 'error' => 'guardar', 'detalle' => 'http' . $cc));
    exit;
  }
  $jug[$clave] = array('nombre' => $nombre, 'puntaje' => $puntaje);
}

// ---------- 6. la tabla, de mayor a menor ----------
$tabla = array();
foreach ($jug as $k => $v) $tabla[] = array('clave'=>$k, 'nombre'=>$v['nombre'], 'puntaje'=>(int)$v['puntaje']);
usort($tabla, function ($a, $b) { return $b['puntaje'] - $a['puntaje']; });
$top = array_slice($tabla, 0, 10);
$puesto = 0;
foreach ($tabla as $i => $t) { if ($t['clave'] === $clave) { $puesto = $i + 1; break; } }

echo json_encode(array(
  'ok'         => true,
  'guardado'   => $guardar,
  'yaJugaste'  => $yaJugo,                 // la invitación lo usa para no dejarlo repetir
  'miPuntaje'  => $yaJugo ? $anterior : ($guardar ? $puntaje : null),
  'yo'         => $clave,
  'puesto'     => $puesto,
  'total'      => count($tabla),
  'tabla'      => $top,
), JSON_UNESCAPED_UNICODE);
