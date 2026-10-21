<?php
/**
 * Invítame — EL MAIL DE CONFIRMACIONES CON LA LISTA COMPLETA (20/10/2026)
 *
 * Pedido de Jazmín: «que no sea un mail por confirmación suelta: que llegue un
 * correo con las confirmaciones ACTUALIZADAS, como en el sistema actual».
 * Cada aviso trae arriba la respuesta nueva y abajo la «Asistencia actual»:
 * TODOS los que ya contestaron, el último primero, con los totales.
 *
 * Lo usan:
 *   · aviso-rsvp.php     → invitado con su propio link (Premium / Platinum)
 *   · rsvp-general.php   → un solo link para todos (Pack Estándar)
 *
 * ⚠️ La clave del servicio de mail vive en invitame-config.php, FUERA del repo.
 * ⚠️ Sólo se llama si la invitación tiene prendido «Habilitar aviso por mail» y
 *    un mail en «Email para confirmaciones» (eso lo chequea quien llama).
 */

function ivm_h($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

/* Todas las respuestas de la invitación (con sesión del sistema). */
function ivm_listado($project, $slug, $idToken) {
  $url = 'https://firestore.googleapis.com/v1/projects/' . $project . '/databases/(default)/documents:runQuery';
  $q = array('structuredQuery' => array(
    'from'  => array(array('collectionId' => 'inv_invitados')),
    'where' => array('fieldFilter' => array(
      'field' => array('fieldPath' => 'slug'), 'op' => 'EQUAL', 'value' => array('stringValue' => $slug))),
    'limit' => 3000,
  ));
  $ch = curl_init($url);
  curl_setopt_array($ch, array(
    CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($q), CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => array('Content-Type: application/json', 'Authorization: Bearer ' . $idToken),
    CURLOPT_CONNECTTIMEOUT => 4, CURLOPT_TIMEOUT => 10, CURLOPT_SSL_VERIFYPEER => true,
  ));
  $r = curl_exec($ch); $c = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
  if ($c != 200) return null;
  $out = array();
  foreach ((array)json_decode((string)$r, true) as $fila) {
    if (!isset($fila['document']['fields'])) continue;
    $f = $fila['document']['fields'];
    $s = function ($k) use ($f) { return isset($f[$k]['stringValue']) ? $f[$k]['stringValue'] : ''; };
    $n = function ($k) use ($f) {
      if (isset($f[$k]['integerValue'])) return (int)$f[$k]['integerValue'];
      if (isset($f[$k]['doubleValue'])) return (int)$f[$k]['doubleValue'];
      return null;
    };
    if (isset($f['activo']['booleanValue']) && $f['activo']['booleanValue'] === false) continue;
    $estado = $s('rsvp');
    if ($estado !== 'confirmado' && $estado !== 'rechazado') continue;
    $out[] = array(
      'token'    => $s('token'),
      'nombre'   => $s('nombre'),
      'estado'   => $estado,
      'personas' => ($estado === 'confirmado') ? ($n('rsvpPersonas') !== null ? $n('rsvpPersonas') : $n('pases')) : 0,
      'mensaje'  => $s('rsvpMensaje'),
      'cuando'   => isset($f['rsvpAt']['timestampValue']) ? $f['rsvpAt']['timestampValue'] : '',
    );
  }
  usort($out, function ($a, $b) { return strcmp($b['cuando'], $a['cuando']); });
  return $out;
}

/* Arma el mail: la respuesta nueva arriba y la lista completa abajo.
   `$nuevo` = array(token, nombre, estado, personas, mensaje). Se pone primero en
   la lista aunque la base todavía no lo tenga (el aviso del invitado con link
   propio llega casi a la vez que la escritura de su respuesta). */
function ivm_armar($pareja, $nuevo, $lista, $linkPanel) {
  $lista = array_values(array_filter((array)$lista, function ($x) use ($nuevo) { return $nuevo['token'] === '' || $x['token'] !== $nuevo['token']; }));
  array_unshift($lista, array('token' => $nuevo['token'], 'nombre' => $nuevo['nombre'], 'estado' => $nuevo['estado'],
                              'personas' => (int)$nuevo['personas'], 'mensaje' => $nuevo['mensaje'], 'cuando' => ''));
  $si = 0; $per = 0; $no = 0;
  foreach ($lista as $x) { if ($x['estado'] === 'confirmado') { $si++; $per += max(1, (int)$x['personas']); } else $no++; }
  $quien = $nuevo['nombre'] !== '' ? $nuevo['nombre'] : 'Un invitado';
  $esSi  = $nuevo['estado'] === 'confirmado';
  $rojo = '#c2185b'; $tinta = '#3b2a2e';

  $h  = '<div style="font-family:Arial,Helvetica,sans-serif;color:' . $tinta . ';max-width:680px">';
  $h .= '<div style="font-size:28px;font-weight:900;color:#F56770;letter-spacing:.5px">INVITAME!</div>';
  $h .= '<div style="font-size:11px;letter-spacing:2px;color:#b07a86;margin-bottom:18px">INVITACIONES INTELIGENTES</div>';
  $h .= '<p style="font-size:15px;margin:0 0 6px"><b style="color:' . $rojo . '">' . ivm_h($quien) . '</b> confirma que <b style="color:' . $rojo . '">'
      . ($esSi ? 'Sí' : 'No') . '</b> asistirá' . ($esSi && $nuevo['personas'] > 0 ? ' (' . (int)$nuevo['personas'] . ' ' . ($nuevo['personas'] == 1 ? 'persona' : 'personas') . ')' : '') . '.</p>';
  if ($nuevo['mensaje'] !== '') $h .= '<p style="font-size:14px;margin:0 0 6px"><b style="color:' . $rojo . '">Mensaje:</b> ' . ivm_h($nuevo['mensaje']) . '</p>';
  $h .= '<p style="font-size:13px;color:#8a7b7e;margin:22px 0 6px">Asistencia actual de ' . ivm_h($pareja) . ': <b>' . $si . '</b> confirmaron (' . $per . ' ' . ($per == 1 ? 'persona' : 'personas') . ') · <b>' . $no . '</b> no podrán asistir</p>';
  $h .= '<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:13px">';
  $h .= '<tr style="background:#f8d9cf;text-align:left"><th>Nombre y apellido</th><th style="text-align:center">Asistirá</th><th style="text-align:center">Personas</th><th>Mensaje</th></tr>';
  foreach ($lista as $x) {
    $h .= '<tr style="border-bottom:1px solid #f1e3de"><td>' . ivm_h($x['nombre']) . '</td><td style="text-align:center">' . ($x['estado'] === 'confirmado' ? 'Sí' : 'No')
        . '</td><td style="text-align:center">' . ($x['estado'] === 'confirmado' ? max(1, (int)$x['personas']) : '-') . '</td><td>' . ivm_h($x['mensaje']) . '</td></tr>';
  }
  $h .= '</table>';
  if ($linkPanel !== '') $h .= '<p style="font-size:12px;color:#8a7b7e;margin-top:18px">Ver todo en el panel: <a href="' . ivm_h($linkPanel) . '">' . ivm_h($linkPanel) . '</a></p>';
  $h .= '<p style="font-size:11px;color:#b9aaa6;margin-top:18px">Invítame · aviso automático</p></div>';

  $t  = $quien . ' confirma que ' . ($esSi ? 'SÍ' : 'NO') . " asistirá.\n";
  if ($nuevo['mensaje'] !== '') $t .= 'Mensaje: ' . $nuevo['mensaje'] . "\n";
  $t .= "\nAsistencia actual: $si confirmaron ($per personas) · $no no podrán asistir\n\n";
  foreach ($lista as $x) $t .= '- ' . $x['nombre'] . ' — ' . ($x['estado'] === 'confirmado' ? 'Sí (' . max(1, (int)$x['personas']) . ')' : 'No') . ($x['mensaje'] !== '' ? ' — ' . $x['mensaje'] : '') . "\n";
  if ($linkPanel !== '') $t .= "\nPanel: " . $linkPanel . "\n";
  $t .= "\n-- \nInvítame · aviso automático\n";
  return array($h, $t);
}

/* Manda el mail por la API (Resend / Brevo) o, sin clave, por mail() del hosting. */
function ivm_enviar($para, $asunto, $html, $texto, $site) {
  $MAIL_KEY = ''; $MAIL_FROM = ''; $MAIL_API = '';
  for ($ivDir = __DIR__, $ivI = 0; $ivI < 6; $ivI++) {
    /* ★ 20/10: la clave del mail puede ir en su PROPIO archivo, invitame-mail.php
       (fuera de public_html), para no tocar invitame-config.php, que es el de Cloudinary. */
    if (is_readable($ivDir . '/invitame-mail.php')) { include $ivDir . '/invitame-mail.php'; if ($MAIL_KEY !== '') break; }
    if (is_readable($ivDir . '/invitame-config.php')) { include $ivDir . '/invitame-config.php'; if ($MAIL_KEY !== '') break; }
    $ivPadre = dirname($ivDir); if ($ivPadre === $ivDir) break; $ivDir = $ivPadre;
  }
  $de = ($MAIL_FROM !== '' && filter_var($MAIL_FROM, FILTER_VALIDATE_EMAIL)) ? $MAIL_FROM : 'invitaciones@' . parse_url($site, PHP_URL_HOST);
  $enviado = false; $via = 'mail'; $detalle = '';
  if ($MAIL_KEY !== '') {
    $api = $MAIL_API !== '' ? strtolower($MAIL_API) : ((strpos($MAIL_KEY, 're_') === 0) ? 'resend' : 'brevo');
    if ($api === 'resend') {
      $url = 'https://api.resend.com/emails';
      $hdr = array('Authorization: Bearer ' . $MAIL_KEY, 'Content-Type: application/json');
      $pay = json_encode(array('from' => 'Invitame <' . $de . '>', 'to' => array($para), 'reply_to' => $para,
                               'subject' => $asunto, 'html' => $html, 'text' => $texto));
    } else {
      $url = 'https://api.brevo.com/v3/smtp/email';
      $hdr = array('api-key: ' . $MAIL_KEY, 'Content-Type: application/json', 'accept: application/json');
      $pay = json_encode(array('sender' => array('name' => 'Invitame', 'email' => $de), 'to' => array(array('email' => $para)),
                               'replyTo' => array('email' => $para), 'subject' => $asunto, 'htmlContent' => $html, 'textContent' => $texto));
    }
    $ch = curl_init($url);
    curl_setopt_array($ch, array(CURLOPT_POST => true, CURLOPT_POSTFIELDS => $pay, CURLOPT_HTTPHEADER => $hdr,
      CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 4, CURLOPT_TIMEOUT => 8));
    $rr = curl_exec($ch); $cc = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    $via = $api; $enviado = ($cc >= 200 && $cc < 300);
    if (!$enviado) $detalle = 'http' . $cc . ' ' . substr((string)$rr, 0, 200);
  } else {
    $headers  = "From: Invitame <" . $de . ">\r\nReply-To: " . $para . "\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nX-Mailer: Invitame\r\n";
    if (function_exists('mail')) $enviado = @mail($para, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $html, $headers, '-f' . $de);
  }
  return array($enviado, $via, $detalle);
}
