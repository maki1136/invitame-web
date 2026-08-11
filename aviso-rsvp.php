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

// Igual que traerDoc pero con sesion iniciada. Hace falta para leer inv_privado,
// que a proposito NO se puede leer sin login.
function traerDocAuth($project, $coleccion, $id, $idToken) {
  $url = 'https://firestore.googleapis.com/v1/projects/' . $project .
         '/databases/(default)/documents/' . $coleccion . '/' . rawurlencode($id);
  $ch = curl_init($url);
  curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_TIMEOUT        => 5,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_HTTPHEADER     => array('Authorization: Bearer ' . $idToken),
  ));
  $r = curl_exec($ch);
  $c = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return array($r, $c);
}

// Entra a Firebase con la cuenta del sistema y devuelve el idToken (o '' si no puede).
function entrarAlSistema($apikey) {
  $PANEL_USER = ''; $PANEL_PASS = '';
  $raiz = dirname($_SERVER['DOCUMENT_ROOT'] ?? '/');
  foreach (array($raiz . '/invitame-panel.php', dirname($raiz) . '/invitame-panel.php') as $ruta) {
    if (is_readable($ruta)) { include $ruta; if ($PANEL_USER !== '') break; }
  }
  if ($PANEL_USER === '' || $PANEL_PASS === '') return '';
  $ch = curl_init('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' . $apikey);
  curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode(array('email'=>$PANEL_USER,'password'=>$PANEL_PASS,'returnSecureToken'=>true)),
    CURLOPT_HTTPHEADER     => array('Content-Type: application/json'),
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_TIMEOUT        => 6,
    CURLOPT_SSL_VERIFYPEER => true,
  ));
  $r = curl_exec($ch); curl_close($ch);
  $j = json_decode((string)$r, true);
  return isset($j['idToken']) ? $j['idToken'] : '';
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

// El aviso por mail es OPCIONAL y viene APAGADO en todas las invitaciones.
// Se prende una por una desde el panel ("Habilitar aviso por mail"), porque cada
// mail enviado tiene costo. Este chequeo va del lado del SERVIDOR a propósito:
// aunque alguien llame este archivo a mano, sin el interruptor no se manda nada.
$bv = function ($k) use ($f) {
  return isset($f[$k]['booleanValue']) && $f[$k]['booleanValue'] === true;
};
if (!$bv('c_habilitar-aviso-por-mail')) {
  echo json_encode(array('ok' => false, 'error' => 'aviso-apagado'));
  exit;
}

// Freno anti-abuso. Este endpoint es el mas caro de todos: cada llamada puede mandar
// un mail. Sin tope, alguien con un solo link de invitado valido puede disparar miles
// de mails a los novios y agotar la cuota PAGA de mails de toda la plataforma (lo que
// ademas puede hacer que el proveedor suspenda la cuenta por reputacion).
// El tope por token tambien evita el aviso duplicado si el invitado toca dos veces.
$rutaLim = dirname(__FILE__) . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  iv_frenar(array(
    // El tope por invitado (3/dia) es el que corta el abuso de verdad y ademas evita
    // el aviso duplicado. Los otros estan holgados: una boda de 300 personas
    // confirmando el mismo dia NO se puede topar.
    array('rsvp-tok-' . $slug . '__' . $token, 3,    86400),  // 3 avisos por invitado por dia
    array('rsvp-inv-' . $slug,                 800,  86400),  // 800 por invitacion por dia
    array('rsvp-ip-'  . iv_ip(),               60,   3600),   // 60 por hora por conexion
    array('rsvp-glob',                         5000, 86400),  // 5000 por dia en todo el sistema
  ));
}

// El mail de los novios YA NO vive en el documento publico del evento: ese lo lee
// cualquiera que tenga el link de una invitacion, y era una fuga de datos personales.
// Ahora vive en inv_privado/{slug}, que solo se lee con sesion iniciada.
$para = '';
$APIKEY_WEB = 'AIzaSyBXWZc9xdpXx7HCkJfxcyofgI00buNlIXc';
$idToken = entrarAlSistema($APIKEY_WEB);
if ($idToken !== '') {
  list($rpv, $cpv) = traerDocAuth($PROJECT, 'inv_privado', $slug, $idToken);
  if ($cpv == 200) {
    $jpv = json_decode((string)$rpv, true);
    if (isset($jpv['fields']['c_email-para-confirmaciones']['stringValue'])) {
      $para = trim($jpv['fields']['c_email-para-confirmaciones']['stringValue']);
    }
  }
}
// Compatibilidad con invitaciones viejas que todavia lo tienen en el doc publico.
if ($para === '') $para = $sv('c_email-para-confirmaciones');
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

// ============================================================
//  ENVÍO
//  Camino A (RECOMENDADO): servicio de mail por API (Brevo / Resend).
//    La clave vive FUERA del repo público, en:
//        public_html/invitame-config.php
//    con estas líneas (además de las de Cloudinary):
//        $MAIL_KEY  = 'la_clave_del_servicio';
//        $MAIL_FROM = 'littlemomentsok@gmail.com';   // remitente verificado
//        // $MAIL_API = 'brevo';  // o 'resend' (si no se pone, se detecta solo)
//
//  Camino B (fallback): mail() de Hostinger. Funciona sólo si el dominio
//    tiene MX/SPF/DKIM configurados; si no, Gmail lo descarta en silencio.
// ============================================================
$MAIL_KEY = ''; $MAIL_FROM = ''; $MAIL_API = '';
$cfgArriba = dirname(dirname(__FILE__)) . '/invitame-config.php';
$cfgHome   = dirname($_SERVER['DOCUMENT_ROOT']) . '/invitame-config.php';
$cfgLado   = __DIR__ . '/invitame-config.php';
if      (is_readable($cfgArriba)) { include $cfgArriba; }
elseif  (is_readable($cfgHome))   { include $cfgHome; }
elseif  (is_readable($cfgLado))   { include $cfgLado; }

$deDominio = parse_url($SITE, PHP_URL_HOST);
$de = ($MAIL_FROM !== '' && filter_var($MAIL_FROM, FILTER_VALIDATE_EMAIL))
      ? $MAIL_FROM
      : 'invitaciones@' . $deDominio;

$enviado = false;
$via     = 'mail';
$detalle = '';

if ($MAIL_KEY !== '') {
  $api = $MAIL_API !== '' ? strtolower($MAIL_API)
                          : ((strpos($MAIL_KEY, 're_') === 0) ? 'resend' : 'brevo');
  if ($api === 'resend') {
    $url = 'https://api.resend.com/emails';
    $hdr = array('Authorization: Bearer ' . $MAIL_KEY, 'Content-Type: application/json');
    $pay = json_encode(array(
      'from'     => 'Invitame <' . $de . '>',
      'to'       => array($para),
      'reply_to' => $para,
      'subject'  => $asunto,
      'text'     => $cuerpo,
    ));
  } else {
    $url = 'https://api.brevo.com/v3/smtp/email';
    $hdr = array('api-key: ' . $MAIL_KEY, 'Content-Type: application/json', 'accept: application/json');
    $pay = json_encode(array(
      'sender'      => array('name' => 'Invitame', 'email' => $de),
      'to'          => array(array('email' => $para)),
      'replyTo'     => array('email' => $para),
      'subject'     => $asunto,
      'textContent' => $cuerpo,
    ));
  }
  $ch = curl_init($url);
  curl_setopt_array($ch, array(
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $pay,
    CURLOPT_HTTPHEADER     => $hdr,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 4,
    CURLOPT_TIMEOUT        => 8,
  ));
  $rr = curl_exec($ch);
  $cc = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  $via     = $api;
  $enviado = ($cc >= 200 && $cc < 300);
  if (!$enviado) $detalle = 'http' . $cc . ' ' . substr((string) $rr, 0, 200);
}

// fallback: mail() del hosting
if (!$enviado && $MAIL_KEY === '') {
  $headers  = "From: Invitame <" . $de . ">\r\n";
  $headers .= "Reply-To: " . $para . "\r\n";
  $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
  $headers .= "X-Mailer: Invitame\r\n";
  if (function_exists('mail')) {
    $enviado = @mail($para, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $cuerpo, $headers, '-f' . $de);
  }
  $via = 'mail';
}

echo json_encode(array(
  'ok'         => (bool) $enviado,
  'destino_ok' => true,
  'enviado'    => (bool) $enviado,
  'via'        => $via,
  'detalle'    => $detalle,
));
