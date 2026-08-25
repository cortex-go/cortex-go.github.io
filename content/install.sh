#!/bin/sh
set -eu

repo="cortex-go/cortex"
install_dir="${CORTEX_INSTALL_DIR:-$HOME/.local/bin}"

case "$(uname -s)" in
  Linux) os="linux" ;;
  Darwin) os="darwin" ;;
  *) echo "Cortex installer: unsupported operating system: $(uname -s)" >&2; exit 1 ;;
esac

case "$(uname -m)" in
  x86_64|amd64) arch="amd64" ;;
  arm64|aarch64) arch="arm64" ;;
  *) echo "Cortex installer: unsupported architecture: $(uname -m)" >&2; exit 1 ;;
esac

asset="cortex-${os}-${arch}.tar.gz"
url="https://github.com/${repo}/releases/latest/download/${asset}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT INT TERM

echo "Downloading ${asset}..."
curl -fL "$url" -o "$tmp/$asset"
tar -xzf "$tmp/$asset" -C "$tmp" cortex
mkdir -p "$install_dir"
install -m 0755 "$tmp/cortex" "$install_dir/cortex"

echo "Installed Cortex to $install_dir/cortex"
case ":$PATH:" in
  *":$install_dir:"*) ;;
  *) echo "Add $install_dir to PATH if it is not already available in your shell." ;;
esac

echo "Cortex requires OpenCode to be installed separately and available in PATH."
