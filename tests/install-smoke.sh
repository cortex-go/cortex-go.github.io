#!/bin/sh
set -eu
installer="content/install.sh"
sh -n "$installer"
sh -n content/download.sh content/update.sh
grep -q "checksum mismatch" "$installer"
grep -q "\.cortex.install" "$installer"
grep -q -- "--proto '=https'" "$installer"
grep -q 'github.com/crtx-dev/cortex' content/download.sh
cmp content/install.sh public/install.sh
cmp content/download.sh public/download.sh
cmp content/update.sh public/update.sh
echo "installer smoke: ok"
