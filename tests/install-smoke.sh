#!/bin/sh
set -eu
installer="content/install.sh"
sh -n "$installer"
grep -q "checksum mismatch" "$installer"
grep -q "\.cortex.install" "$installer"
grep -q -- "--proto '=https'" "$installer"
echo "installer smoke: ok"
