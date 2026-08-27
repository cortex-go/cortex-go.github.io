#!/bin/sh
set -eu

repo="cortex-go/cortex"
mode="user"

usage() {
  cat <<'EOF'
Cortex installer

Usage:
  install.sh             Install for the current user to ~/.local/bin
  install.sh --system    Install system-wide to /usr/local/bin
  install.sh --help      Show this help

Environment:
  CORTEX_INSTALL_DIR     Override the per-user install directory
                         (cannot be combined with --system)
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --system)
      mode="system"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Cortex installer: unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [ "$mode" = "system" ]; then
  if [ -n "${CORTEX_INSTALL_DIR:-}" ]; then
    echo "Cortex installer: CORTEX_INSTALL_DIR cannot be combined with --system" >&2
    exit 2
  fi
  if [ "$(id -u)" -ne 0 ]; then
    echo "Cortex installer: --system installs to /usr/local/bin and requires root." >&2
    echo "Run: curl -fsSL https://cortex-go.github.io/install.sh | sudo sh -s -- --system" >&2
    exit 1
  fi
  install_dir="/usr/local/bin"
else
  if [ "$(id -u)" -eq 0 ] && [ -z "${CORTEX_INSTALL_DIR:-}" ]; then
    echo "Cortex installer: do not use sudo for the default per-user install." >&2
    echo "Run without sudo, or use --system to install to /usr/local/bin." >&2
    exit 1
  fi
  install_dir="${CORTEX_INSTALL_DIR:-$HOME/.local/bin}"
fi

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
curl --proto '=https' --tlsv1.2 -fL "$url" -o "$tmp/$asset"
curl --proto '=https' --tlsv1.2 -fL "https://github.com/${repo}/releases/latest/download/checksums.txt" -o "$tmp/checksums.txt"
expected="$(awk -v file="$asset" '$2 == file || $2 == "*" file {print $1}' "$tmp/checksums.txt")"
if [ -z "$expected" ]; then echo "Cortex installer: checksum missing for $asset" >&2; exit 1; fi
if command -v sha256sum >/dev/null 2>&1; then actual="$(sha256sum "$tmp/$asset" | awk '{print $1}')"; else actual="$(shasum -a 256 "$tmp/$asset" | awk '{print $1}')"; fi
if [ "$actual" != "$expected" ]; then echo "Cortex installer: checksum mismatch for $asset" >&2; exit 1; fi
tar -xzf "$tmp/$asset" -C "$tmp" cortex
mkdir -p "$install_dir"
stage="$install_dir/.cortex.install.$$"
trap 'rm -rf "$tmp"; rm -f "$stage"' EXIT INT TERM
install -m 0755 "$tmp/cortex" "$stage"
mv -f "$stage" "$install_dir/cortex"

echo "Installed Cortex to $install_dir/cortex"

case ":${PATH:-}:" in
  *":$install_dir:"*) ;;
  *)
    echo
    echo "$install_dir is not currently in PATH."
    if [ "$mode" = "user" ] && [ "$install_dir" = "$HOME/.local/bin" ]; then
      echo "Add this to your shell profile, then open a new shell:"
      echo '  export PATH="$HOME/.local/bin:$PATH"'
    else
      echo "Add $install_dir to PATH before running Cortex by name."
    fi
    ;;
esac

echo
echo "Cortex requires OpenCode to be installed separately and available in PATH."
