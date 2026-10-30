<?php
/**
 * Invítame — LA PUERTA SIN CUENTA DEL EQUIPO: «CLAVE DE PUERTA» POR FIESTA (30/10/2026)
 *
 * Maki: «como vamos a ir nosotros a todas las fiestas de latam… cada fiesta con
 * qr debe tener eso sino no anda nada».
 *
 * Hasta hoy el escáner (/scan.html) sólo abría con correo y contraseña del
 * equipo de Invítame, y esa cuenta ve TODAS las invitaciones. Los novios no
 * tenían nada para darle a la persona del salón que controla la puerta.
 *
 * Ahora cada fiesta tiene su CLAVE DE PUERTA:
 *   · Los novios la ven en su panel (mi-panel → «Puerta (escáner QR)») y la
 *     mandan por WhatsApp a quien esté en la puerta.
 *   · Esa persona abre /scan.html, toca «Entrar con la clave de la fiesta»,
 *     pone la dirección y la clave, y escanea. Sólo ve ESA fiesta.
 *
 * ⭐ LA CLAVE NO SE GUARDA EN NINGÚN LADO: es una firma (HMAC) de la dirección
 *    de la fiesta con la contraseña del sistema, que vive sólo en el servidor.
 *    Así existe desde ya para TODAS las fiestas, sin tocar la base, y nadie la
 *    puede deducir sin esa contraseña.
 *
 * ACCIONES (POST JSON):
 *   {accion:'clave',  slug, clave}         → la clave de puerta. `clave` = la del panel de los novios.
 *   {accion:'lista',  slug, puerta}        → {ok, invitados:[…activos], bloqueado}
 *   {accion:'uno',    slug, puerta, token} → {ok, invitado|null}
 *   {accion:'uso',    slug, puerta, token} → igual que INV.marcarUso: {ok, restantes, data} | {ok:false, motivo}
 *
 * ⚠️ El descuento es una TRANSACCIÓN de Firestore (beginTransaction → get →
 *    commit): con dos celulares en la puerta, el mismo QR no entra dos veces.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function salir($a, $c = 200) { http_response_code($c); echo json_encode($a, JSON_UNESCAPED_UNICODE); exit; }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') salir(array('ok' => false, 'error' => 'metodo'), 405);
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 4096) salir(array('ok' => false, 'error' => 'muy-grande'), 413);

$PROJECT = 'invitame-9b51f';
$APIKEY  = 'AIzaSyBXWZc9xdpXx7HCkJfxcyofgI00buNlIXc';
$BASE    = 'projects/' . $PROJECT . '/databases/(default)/documents';
$FS      = 'https://firestore.googleapis.com/v1/' . $BASE . '/';

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = array();
$accion = (string)($in['accion'] ?? '');
$slug   = preg_replace('/[^a-z0-9\-]/', '', strtolower((string)($in['slug'] ?? '')));
$token  = preg_replace('/[^A-Za-z0-9_\-]/', '', (string)($in['token'] ?? ''));
$puerta = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', (string)($in['puerta'] ?? '')));
if ($slug === '') salir(array('ok' => false, 'error' => 'faltan-datos'), 400);

/* Freno: una puerta escanea mucho (hasta ~1 por segundo en una fiesta grande),
   así que el tope por IP es alto; lo que se frena aparte son las claves MAL
   puestas (ver más abajo). */
$rutaLim = __DIR__ . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  iv_frenar(array(array('pu-ip-' . iv_ip(), 3000, 3600), array('pu-glob', 60000, 3600)));
}

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

/* ---------- la contraseña del sistema (la misma que usan los otros porteros) ---------- */
$PANEL_USER = ''; $PANEL_PASS = '';
$candidatos = array(); $dir = __DIR__;
for ($i = 0; $i < 6; $i++) { $candidatos[] = $dir . '/invitame-panel.php'; $p = dirname($dir); if ($p === $dir) break; $dir = $p; }
if (isset($_SERVER['DOCUMENT_ROOT'])) {
  $candidatos[] = dirname($_SERVER['DOCUMENT_ROOT']) . '/invitame-panel.php';
  $candidatos[] = dirname(dirname($_SERVER['DOCUMENT_ROOT'])) . '/invitame-panel.php';
}
foreach (array_unique($candidatos) as $ruta) {
  if (!is_readable($ruta)) continue;
  include $ruta;
  if ($PANEL_USER !== '' && $PANEL_PASS !== '') break;
}
if ($PANEL_USER === '' || $PANEL_PASS === '') salir(array('ok' => false, 'error' => 'sin-config'));

/* La clave de puerta: 8 letras/números sin los que se confunden (0/O, 1/I/L). */
function clavePuerta($slug, $secreto) {
  $h = hash_hmac('sha256', 'puerta|' . $slug, $secreto, true);
  $abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  $s = '';
  for ($i = 0; $i < 8; $i++) $s .= $abc[ord($h[$i]) % strlen($abc)];
  return $s;
}
$CLAVE = clavePuerta($slug, $PANEL_PASS);

/* ---------- 1. pedir la clave: sólo con la clave del panel de los novios ---------- */
if ($accion === 'clave') {
  $clave = preg_replace('/[^A-Za-z0-9_\-]/', '', (string)($in['clave'] ?? ''));
  if ($clave === '') salir(array('ok' => false, 'error' => 'faltan-datos'), 400);
  list($rp, $cp) = pedir($FS . 'inv_paneles/' . rawurlencode($slug . '__' . $clave) . '?key=' . $APIKEY);
  if ($cp != 200) salir(array('ok' => false, 'error' => 'clave'), 403);
  salir(array('ok' => true, 'puerta' => $CLAVE, 'link' => 'https://invitameok.net/scan.html?e=' . rawurlencode($slug)));
}

/* ---------- 2. todo lo demás: con la clave de puerta ---------- */
if (!hash_equals($CLAVE, $puerta)) {
  if (function_exists('iv_frenar')) iv_frenar(array(array('pu-mal-' . iv_ip(), 40, 3600)));
  salir(array('ok' => false, 'error' => 'clave-puerta'), 403);
}

list($ra, $ca) = pedir('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' . $APIKEY, 'POST',
  json_encode(array('email' => $PANEL_USER, 'password' => $PANEL_PASS, 'returnSecureToken' => true)));
if ($ca != 200) salir(array('ok' => false, 'error' => 'login'));
$ses = json_decode($ra, true); $tok = $ses['idToken'] ?? '';
if ($tok === '') salir(array('ok' => false, 'error' => 'login'));
$auth = array('Authorization: Bearer ' . $tok);

/* Firestore → arreglo simple */
function valor($v) {
  if (isset($v['stringValue']))  return $v['stringValue'];
  if (isset($v['integerValue'])) return (int)$v['integerValue'];
  if (isset($v['doubleValue']))  return (float)$v['doubleValue'];
  if (isset($v['booleanValue'])) return (bool)$v['booleanValue'];
  if (isset($v['nullValue']))    return null;
  if (isset($v['timestampValue'])) return $v['timestampValue'];
  return null;
}
function ficha($f) {
  $o = array();
  foreach (array('token','nombre','pases','usos','usosMax','mesa','restriccion','activo','rsvp','rsvpPersonas') as $k)
    if (isset($f[$k])) $o[$k] = valor($f[$k]);
  return $o;
}

/* ¿el evento bloqueó el control de accesos desde el panel? */
function bloqueado($FS, $slug, $auth) {
  list($r, $c) = pedir($FS . 'inv_eventos/' . rawurlencode($slug) . '?mask.fieldPaths=' . rawurlencode('`c_bloquear-control-de-accesos-qr-y-mesas`') . '&mask.fieldPaths=n1&mask.fieldPaths=n2', 'GET', null, $auth);
  if ($c != 200) return array(null, '');
  $f = (json_decode($r, true)['fields']) ?? array();
  $b = isset($f['c_bloquear-control-de-accesos-qr-y-mesas']) ? valor($f['c_bloquear-control-de-accesos-qr-y-mesas']) : null;
  $nom = trim((isset($f['n1']) ? valor($f['n1']) : '') . ' & ' . (isset($f['n2']) ? valor($f['n2']) : ''), ' &');
  return array(($b === true || $b === 'true' || $b === 1 || $b === '1' || $b === 'si' || $b === 'sí'), $nom);
}

if ($accion === 'lista') {
  list($bl, $nom) = bloqueado($FS, $slug, $auth);
  if ($bl === null) salir(array('ok' => false, 'error' => 'no-existe'));
  if ($bl) salir(array('ok' => true, 'bloqueado' => true, 'nombres' => $nom, 'invitados' => array()));
  $q = array('structuredQuery' => array(
    'from'  => array(array('collectionId' => 'inv_invitados')),
    'where' => array('fieldFilter' => array('field' => array('fieldPath' => 'slug'), 'op' => 'EQUAL', 'value' => array('stringValue' => $slug))),
    'limit' => 3000));
  list($r, $c) = pedir('https://firestore.googleapis.com/v1/' . $GLOBALS['BASE'] . ':runQuery', 'POST', json_encode($q), $auth);
  if ($c != 200) salir(array('ok' => false, 'error' => 'base'));
  $out = array();
  foreach ((array)json_decode((string)$r, true) as $fila) {
    if (!isset($fila['document']['fields'])) continue;
    $g = ficha($fila['document']['fields']);
    if (isset($g['activo']) && $g['activo'] === false) continue;
    $out[] = $g;
  }
  salir(array('ok' => true, 'bloqueado' => false, 'nombres' => $nom, 'invitados' => $out));
}

if ($token === '') salir(array('ok' => false, 'error' => 'faltan-datos'), 400);
$docName = $BASE . '/inv_invitados/' . $slug . '__' . $token;

if ($accion === 'uno') {
  list($r, $c) = pedir($FS . 'inv_invitados/' . rawurlencode($slug . '__' . $token), 'GET', null, $auth);
  if ($c == 404) salir(array('ok' => true, 'invitado' => null));
  if ($c != 200) salir(array('ok' => false, 'error' => 'base'));
  $g = ficha((json_decode($r, true)['fields']) ?? array());
  salir(array('ok' => true, 'invitado' => $g));
}

if ($accion === 'uso') {
  list($bl,) = bloqueado($FS, $slug, $auth);
  if ($bl) salir(array('ok' => false, 'motivo' => 'bloqueado'));
  $API = 'https://firestore.googleapis.com/v1/' . $BASE;
  for ($intento = 0; $intento < 4; $intento++) {
    list($rt, $ct) = pedir($API . ':beginTransaction', 'POST', json_encode(array('options' => array('readWrite' => new stdClass()))), $auth);
    if ($ct != 200) continue;
    $tx = json_decode($rt, true)['transaction'] ?? '';
    list($rg, $cg) = pedir('https://firestore.googleapis.com/v1/' . $docName . '?transaction=' . rawurlencode($tx), 'GET', null, $auth);
    if ($cg == 404) { pedir($API . ':rollback', 'POST', json_encode(array('transaction' => $tx)), $auth); salir(array('ok' => false, 'motivo' => 'no-existe')); }
    if ($cg != 200) { pedir($API . ':rollback', 'POST', json_encode(array('transaction' => $tx)), $auth); continue; }
    $f = (json_decode($rg, true)['fields']) ?? array();
    $d = ficha($f);
    if (isset($d['activo']) && $d['activo'] === false) { pedir($API . ':rollback', 'POST', json_encode(array('transaction' => $tx)), $auth); salir(array('ok' => false, 'motivo' => 'baja', 'data' => $d)); }
    $usos = isset($d['usos']) ? (int)$d['usos'] : 0;
    if ($usos <= 0) { pedir($API . ':rollback', 'POST', json_encode(array('transaction' => $tx)), $auth); salir(array('ok' => false, 'motivo' => 'sin-usos', 'data' => $d)); }
    $commit = array('transaction' => $tx, 'writes' => array(array(
      'update' => array('name' => $docName, 'fields' => array(
        'usos' => array('integerValue' => (string)($usos - 1)),
        'ultimoIngreso' => array('timestampValue' => gmdate('Y-m-d\TH:i:s\Z')),
        'ultimoIngresoPor' => array('stringValue' => 'puerta'))),
      'updateMask' => array('fieldPaths' => array('usos', 'ultimoIngreso', 'ultimoIngresoPor')),
      'currentDocument' => array('exists' => true))));
    list($rc, $cc) = pedir($API . ':commit', 'POST', json_encode($commit), $auth);
    if ($cc == 200) { $d['usos'] = $usos - 1; salir(array('ok' => true, 'restantes' => $usos - 1, 'data' => $d)); }
    /* 409 / ABORTED = otro celular escaneó justo a la vez: se reintenta */
  }
  salir(array('ok' => false, 'motivo' => 'reintentar'));
}

salir(array('ok' => false, 'error' => 'accion'), 400);
