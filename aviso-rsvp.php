<?php
/**
 * Invitame — aviso por MAIL cuando un invitado confirma o rechaza.
 *
 * La invitación llama acá después de guardar el RSVP en Firebase.
 * Recibe: slug, token, estado (confirmado|rechazado), personas, mensaje, nombre.
 *
 * SEGURIDAD (importante):
 *   El mail de destino NO viene del navegador: se lee del evento en Firestore
 *   (campo "Email para confirmaciones"). Así nadie puede usar este archivo para
 *   mandar mails a direcciones arbitrarias.
 *
 * Si el hosting no puede enviar mail, devuelve ok:false y la invitación NO se rompe
 * (la confirmación ya quedó guardada en Firebase de todas formas).
 */

header('Content-Type: application/json; charset=utf-8');

// Solo POST
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405);
  echo json_encode(array('ok' => false, 'error' => 'metodo'));
  exit;
}

$PROJECT = 'invitame-9b51f';
$SITE    = 'https://invitame.littlemomentsok.com';

// ---------- entrada ----------
$raw = file_get_contents('php://input');
$in  = json_decode($raw, true);
if (!is_array($in)) $in = array();

function limpio($v, $max = 300) {
  $v = is_string($v) ? $v : '';
  $v = strip_tags($v);
  $v = str_replace(array("\r", "\n"), ' ', $v);   // evita inyección en headers
  $v = trim($v);
  return mb_substr($v, 0, $max);
}

$slug = strtolower(limpio(isset($in['slug']) ? $in['slug'] : '', 60));
$slug = preg_replace('/[^a-z0-9\-]/', '', $slug);
$token    = preg_replace('/[^A-Za-z0-9]/', '', limpio(isset($in['token']) ? $in['token'] : '', 20));
$estado   = limpio(isset($in['estado']) ? $in['estado'] : '', 20);
$personas = (int) (isset($in['personas']) ? $in['personas'] : 0);
$mensaje  = limpio(isset($in['mensaje']) ? $in['mensaje'] : '', 500);
$nombre   = limpio(isset($in['nombre']) ? $in['nombre'] : '', 120);

if ($slug === '' || ($estado !== 'confirmado' && $estado !== 'rechazado')) {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'datos'));
  exit;
}

// helper para leer un documento de Firestore
function traerDoc($project, $coleccion, $id) {
  $url = 'https://firestore.googleapis.com/v1/projects/' . $project .
         '/databases/(default)/documents/' . $coleccion . '/' . rawurlencode($id);
  $ch = curl_init($url);
  curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_TIMEOUT        => 5,
    CURLOPT_SSL_VERIFYPEER => true,
  ));
  $r = curl_exec($ch);
  $c = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return array($r, $c);
}

// ---------- el token tiene que ser un invitado REAL de este evento ----------
// (así nadie de afuera puede disparar avisos y llenar la casilla de mails)
if ($token === '') {
  echo json_encode(array('ok' => false, 'error' => 'token'));
  exit;
}
list($ri, $ci) = traerDoc($PROJECT, 'inv_invitados', $slug . '__' . $token);
if (!$ri || $ci != 200) {
  echo json_encode(array('ok' => false, 'error' => 'invitado'));
  exit;
}

// ---------- leer el evento (de ahí sale el mail de destino) ----------
list($res, $code) = traerDoc($PROJECT, 'inv_eventos', $slug);

if (!$res || $code != 200) {
  echo json_encode(array('ok' => false, 'error' => 'evento'));
  exit;
}

$data = json_decode($res, true);
$f = isset($data['fields']) ? $data['fields'] : array();
$sv = function ($k) use ($f) {
  return isset($f[$k]['stringValue']) ? trim($f[$k]['stringValue']) : '';
};

// el campo del panel: "Email para confirmaciones:"
$para = $sv('c_email-para-confirmaciones');
if ($para === '' || !filter_var($para, FILTER_VALIDATE_EMAIL)) {
  // sin mail configurado no es un error: simplemente no se avisa
  echo json_encode(array('ok' => false, 'error' => 'sin-mail'));
  exit;
}

$n1 = $sv('n1'); $n2 = $sv('n2');
$pareja = trim($n1 . (($n1 !== '' && $n2 !== '') ? ' & ' : '') . $n2);
if ($pareja === '') $pareja = $slug;

// ---------- armar el mail ----------
$asuntoBase = $sv('c_titulo-del-correo');
if ($asuntoBase === '') $asuntoBase = 'Confirmación de asistencia';
$quien   = ($nombre !== '') ? $nombre : 'Un invitado';
$estadoT = ($estado === 'confirmado') ? 'CONFIRMÓ' : 'NO podrá asistir';

$asunto = $asuntoBase . ' — ' . $quien . ' (' . $pareja . ')';

$cuerpo  = "Nueva respuesta en tu invitación\n";
$cuerpo .= "----------------------------------\n\n";
$cuerpo .= "Evento:    " . $pareja . "\n";
$cuerpo .= "Invitado:  " . $quien . "\n";
$cuerpo .= "Respuesta: " . $estadoT . "\n";
if ($estado === 'confirmado' && $personas > 0) {
  $cuerpo .= "Personas:  " . $personas . "\n";
}
if ($mensaje !== '') {
  $cuerpo .= "\nMensaje que dejó:\n\"" . $mensaje . "\"\n";
}
$cuerpo .= "\nVer todas las confirmaciones en el panel:\n";
$cuerpo .= $SITE . "/admin.html?e=" . rawurlencode($slug) . "\n\n";
$cuerpo .= "-- \nInvítame · aviso automático\n";

// Remitente: del dominio propio, para que no lo tomen por falsificado
$deDominio = parse_url($SITE, PHP_URL_HOST);
$de = 'invitaciones@' . $deDominio;

$headers  = "From: Invitame <" . $de . ">\r\n";
$headers .= "Reply-To: " . $para . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: Invitame\r\n";

$enviado = false;
if (function_exists('mail')) {
  $enviado = @mail($para, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $cuerpo, $headers, '-f' . $de);
}

echo json_encode(array('ok' => (bool) $enviado, 'destino_ok' => true, 'enviado' => (bool) $enviado));
