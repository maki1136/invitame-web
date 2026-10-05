#!/bin/bash
# ===== EL SAFARI 16 DEL IPAD DE MAKI, EN LA NUBE (5/10/2026) ==================
# Maki tiene un iPad con Safari 16.6.1 (iPadOS 16). Playwright 1.32 trae el motor
# WebKit 16.4. En Ubuntu 24.04 le faltan librerías de Ubuntu 22.04 y choca con
# la glib nueva del sistema: esto lo deja andando.
# Uso:  bash preparar.sh /home/claude/wk16
#       cd /home/claude/wk16 && PLAYWRIGHT_BROWSERS_PATH=$PWD/br MODO=bueno S=camila-y-tomas V=1 node probar-ipad.cjs
#  MODO=malo  usa todo-viejo.js / catalogo-viejo.js (armar con `php efectos/todo.php` en un commit viejo)
#  SACAR=anim,fondo,opaco,iframes,filtros,sombrasf,pbg,...  apaga piezas del dibujo (bisección)
#  NOVID=1 sin videos · REC=1 graba video
# Control: una página común anda a 20-27 cuadros/s en este motor.
# Calibración: este motor es ~6 veces más lento que el iPad real (sábado: 62 s acá ≈ 10 s en el iPad).
set -e
D=${1:-/home/claude/wk16}; mkdir -p $D/debs && cd $D
npm init -y >/dev/null; PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i playwright@1.32.3 --no-audit --no-fund >/dev/null
PLAYWRIGHT_BROWSERS_PATH=$D/br npx playwright install webkit
B=http://archive.ubuntu.com/ubuntu/pool/main; cd debs
for p in i/icu/libicu70_70.1-2_amd64.deb p/pcre3/libpcre3_8.39-13ubuntu0.22.04.1_amd64.deb libs/libsoup2.4/libsoup2.4-1_2.74.2-3_amd64.deb libv/libvpx/libvpx7_1.11.0-2ubuntu2_amd64.deb; do curl -s -O $B/$p; done
for d in *.deb; do dpkg-deb -x $d x; done
W=$(ls -d $D/br/webkit-*)/minibrowser-wpe
find x -name "*.so*" -exec cp -P {} $W/lib/ \;
mkdir -p $W/sys/quitadas && mv $W/sys/lib/libglib-2.0.so* $W/sys/lib/libgobject-2.0.so* $W/sys/quitadas/ 2>/dev/null || true
cp "$(dirname "$0")/probar-ipad.cjs" $D/ 2>/dev/null || true
echo listo
