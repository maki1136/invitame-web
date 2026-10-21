<?php
/**
 * Invítame — CONFIRMACIÓN CON UN SOLO LINK PARA TODOS (Pack Estándar) · 20/10/2026
 *
 * Pedido de Jazmín: en el Estándar se manda el mismo link a todos, sin pase por
 * invitado. Hasta hoy, sin link propio el invitado no podía confirmar.
 *
 * QUÉ HACE
 *   1. Recibe nombre, sí/no, personas y mensaje desde la invitación
 *      (/efectos/rsvp-general.js).
 *   2. Sólo sigue si la invitación tiene prendido `fx.rsvp.general` (panel →
 *      CONFIRMACIÓN → «Un solo link para todos») y NO es una muestra de venta.
 *   3. Guarda la respuesta como un invitado más en `inv_invitados`
 *      (`<slug>__g<9 letras>`, marcado `general:true`), con la cuenta del
 *      sistema: así aparece en la pestaña INVITADOS, en el panel de los novios
 *      y en sus números, igual que una confirmación con link propio.
 *      ⭐ La misma persona (mismo nombre) que vuelve a contestar NO se duplica:
 *         el código sale del nombre, y se actualiza su respuesta.
 *   4. Si la invitación tiene «Habilitar aviso por mail» y un mail cargado,
 *      manda UN correo con la respuesta nueva y la lista completa actualizada
 *      (rsvp-mail-lib.php).
 *
 * ANTI-ABUSO: campo trampa + tiempo mínimo + topes por conexión, por invitación,
 * por nombre y del sistema entero (invitame-limite.php).
 */

header('Content-Type: application/json; charset=utf-8');
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { http_response_code(405); echo json_encode(array('ok' => false, 'error' => 'metodo')); exit; }
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 6000) { http_response_code(413); echo json_encode(array('ok' => false, 'error' => 'muy-grande')); exit; }

$PROJECT = 'invitame-9b51f';
$APIKEY  = 'AIzaSyBXWZc9xdpXx7HCkJfxcyofgI00buNlIXc';
$SITE    = 'https://invitameok.net';
$FS      = 'https://firestore.googleapis.com/v1/projects/' . $PROJECT . '/databases/(default)/documents/';

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = array();
function limpio($v, $max = 200) {
  $v = is_string($v) ? $v : '';
  $v = strip_tags($v);
  $v = str_replace(array("\r", "\n"), ' ', $v);
  return trim(mb_substr($v, 0, $max));
}
$slug     = preg_replace('/[^a-z0-9\-]/', '', strtolower(limpio($in['slug'] ?? '', 60)));
$nombre   = preg_replace('/\s+/u', ' ', limpio($in['nombre'] ?? '', 80));
$estado   = (($in['estado'] ?? '') === 'si') ? 'confirmado' : ((($in['estado'] ?? '') === 'no') ? 'rechazado' : '');
$personas = max(1, min(20, (int)($in['personas'] ?? 1)));
$mensaje  = limpio($in['mensaje'] ?? '', 500);
$trampa   = limpio($in['trampa'] ?? '', 50);
$segundos = (int)($in['segundos'] ?? 0);

if ($slug === '' || $estado === '' || mb_strlen($nombre) < 2) { http_response_code(400); echo json_encode(array('ok' => false, 'error' => 'datos')); exit; }
/* un programa llena el campo invisible, o contesta en menos de 2 segundos */
if ($trampa !== '' || $segundos < 2) { echo json_encode(array('ok' => true)); exit; }

$rutaLim = __DIR__ . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  $clNom = mb_strtolower($nombre);
  iv_frenar(array(
    array('rg-ip-'  . iv_ip(),                 20,   3600),   // 20 por hora desde una conexión (una familia con un celular)
    array('rg-nom-' . $slug . '|' . $clNom,    6,    86400),  // 6 cambios por persona por día
    array('rg-inv-' . $slug,                   800,  86400),  // 800 por invitación por día
    array('rg-glob',                           5000, 86400),
  ));
}

function pedir($url, $metodo = 'GET', $cuerpo = null, $headers = array()) {
  $ch = curl_init($url);
  $opt = array(CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $metodo, CURLOPT_CONNECTTIMEOUT => 5,
               CURLOPT_TIMEOUT => 12, CURLOPT_SSL_VERIFYPEER => true);
  if ($cuerpo !== null) { $opt[CURLOPT_POSTFIELDS] = $cuerpo; $headers[] = 'Content-Type: application/json'; }
  if ($headers) $opt[CURLOPT_HTTPHEADER] = $headers;
  curl_setopt_array($ch, $opt);
  $r = curl_exec($ch); $c = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
  return array($r, $c);
}

/* ---------- 1. el evento: ¿tiene prendido el link general? ---------- */
list($re, $ce) = pedir($FS . 'inv_eventos/' . rawurlencode($slug) . '?key=' . $APIKEY);
if ($ce != 200) { echo json_encode(array('ok' => false, 'error' => 'evento')); exit; }
$ev = json_decode($re, true);
$f  = isset($ev['fields']) ? $ev['fields'] : array();
$fx = isset($f['fx']['mapValue']['fields']) ? $f['fx']['mapValue']['fields'] : array();
$rs = isset($fx['rsvp']['mapValue']['fields']) ? $fx['rsvp']['mapValue']['fields'] : array();
if (!(isset($rs['general']['booleanValue']) && $rs['general']['booleanValue'] === true)) { echo json_encode(array('ok' => false, 'error' => 'apagado')); exit; }
$mu = isset($fx['muestra']['mapValue']['fields']) ? $fx['muestra']['mapValue']['fields'] : array();
if (isset($mu['venta']['booleanValue']) && $mu['venta']['booleanValue'] === true) { echo json_encode(array('ok' => true, 'muestra' => true)); exit; }
$sv = function ($k) use ($f) { return isset($f[$k]['stringValue']) ? trim($f[$k]['stringValue']) : ''; };

/* ---------- 2. la cuenta del sistema ---------- */
$PANEL_USER = ''; $PANEL_PASS = '';
$cand = array();
for ($dir = __DIR__, $i = 0; $i < 6; $i++) { $cand[] = $dir . '/invitame-panel.php'; $p = dirname($dir); if ($p === $dir) break; $dir = $p; }
if (isset($_SERVER['DOCUMENT_ROOT'])) { $cand[] = dirname($_SERVER['DOCUMENT_ROOT']) . '/invitame-panel.php'; $cand[] = dirname(dirname($_SERVER['DOCUMENT_ROOT'])) . '/invitame-panel.php'; }
foreach (array_unique($cand) as $ruta) { if (!is_readable($ruta)) continue; include $ruta; if ($PANEL_USER !== '' && $PANEL_PASS !== '') break; }
if ($PANEL_USER === '' || $PANEL_PASS === '') { echo json_encode(array('ok' => false, 'error' => 'sin-config')); exit; }
list($ra, $ca) = pedir('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' . $APIKEY, 'POST',
  json_encode(array('email' => $PANEL_USER, 'password' => $PANEL_PASS, 'returnSecureToken' => true)));
$ses = json_decode((string)$ra, true);
$idToken = isset($ses['idToken']) ? $ses['idToken'] : '';
if ($ca != 200 || $idToken === '') { echo json_encode(array('ok' => false, 'error' => 'login')); exit; }
$auth = array('Authorization: Bearer ' . $idToken);

/* ---------- 3. guardar la respuesta (la misma persona no se duplica) ---------- */
$clave = preg_replace('/[^a-z0-9]/', '', strtr(mb_strtolower($nombre), array('á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ü'=>'u','ñ'=>'n')));
$token = 'g' . substr(sha1($slug . '|' . $clave), 0, 9);
$ahora = gmdate('Y-m-d\TH:i:s\Z');
$doc = array('fields' => array(
  'slug'         => array('stringValue'  => $slug),
  'token'        => array('stringValue'  => $token),
  'nombre'       => array('stringValue'  => $nombre),
  'pases'        => array('integerValue' => (string)$personas),
  'mesa'         => array('stringValue'  => '-'),
  'usosMax'      => array('integerValue' => (string)$personas),
  'usos'         => array('integerValue' => (string)$personas),
  'rsvp'         => array('stringValue'  => $estado),
  'rsvpPersonas' => ($estado === 'confirmado') ? array('integerValue' => (string)$personas) : array('integerValue' => '0'),
  'rsvpMensaje'  => array('stringValue'  => $mensaje),
  'rsvpAt'       => array('timestampValue' => $ahora),
  'general'      => array('booleanValue' => true),
  'updatedAt'    => array('timestampValue' => $ahora),
));
list($rc, $cc) = pedir($FS . 'inv_invitados/' . rawurlencode($slug . '__' . $token), 'PATCH', json_encode($doc), $auth);
if ($cc < 200 || $cc >= 300) { echo json_encode(array('ok' => false, 'error' => 'guardar', 'detalle' => 'http' . $cc)); exit; }

/* ---------- 4. el mail con la lista actualizada ---------- */
$mail = 'apagado';
if (isset($f['c_habilitar-aviso-por-mail']['booleanValue']) && $f['c_habilitar-aviso-por-mail']['booleanValue'] === true) {
  $para = '';
  list($rpv, $cpv) = pedir($FS . 'inv_privado/' . rawurlencode($slug), 'GET', null, $auth);
  if ($cpv == 200) { $jpv = json_decode((string)$rpv, true); if (isset($jpv['fields']['c_email-para-confirmaciones']['stringValue'])) $para = trim($jpv['fields']['c_email-para-confirmaciones']['stringValue']); }
  if ($para === '') $para = $sv('c_email-para-confirmaciones');
  if ($para !== '' && filter_var($para, FILTER_VALIDATE_EMAIL)) {
    include_once __DIR__ . '/rsvp-mail-lib.php';
    $lista = ivm_listado($PROJECT, $slug, $idToken);
    $n1 = $sv('n1'); $n2 = $sv('n2');
    $pareja = trim($n1 . (($n1 !== '' && $n2 !== '') ? ' & ' : '') . $n2); if ($pareja === '') $pareja = $slug;
    $base = $sv('c_titulo-del-correo'); if ($base === '') $base = 'Confirmación de asistencia';
    list($html, $texto) = ivm_armar($pareja, array('token' => $token, 'nombre' => $nombre, 'estado' => $estado,
      'personas' => ($estado === 'confirmado' ? $personas : 0), 'mensaje' => $mensaje), $lista ?: array(), '');
    list($ok, $via) = ivm_enviar($para, $base . ' — ' . $nombre . ' (' . $pareja . ')', $html, $texto, $SITE);
    $mail = $ok ? 'enviado' : 'fallo';
  } else $mail = 'sin-mail';
}

echo json_encode(array('ok' => true, 'mail' => $mail));
