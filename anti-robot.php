<?php
/* La clave PÚBLICA de Turnstile para el formulario. Vacía = Turnstile apagado. */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: max-age=300');
require __DIR__ . '/anti-robot-lib.php';
$c = iv_turnstile_cfg();
echo json_encode(array('sitekey' => $c ? $c['site'] : ''));
