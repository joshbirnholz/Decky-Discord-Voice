#!/usr/bin/env bash
#
# Discord Voice for Steam Deck — installer / updater.
#
# Sets up everything needed on a Steam Deck, and is safe to re-run at any time
# to update to the latest version of everything:
#
#   1. A private Node.js + pnpm toolchain (kept in ~/.local/share/decky-discord-voice,
#      does not touch the system)
#   2. Vencord, built from source with the DeckVoiceBridge user plugin included
#   3. Vesktop (flatpak), pointed at that custom Vencord build, with the
#      DeckVoiceBridge plugin enabled
#   4. The "Discord Voice" Decky plugin, built and installed into Decky Loader
#
# Run this in Desktop Mode in a terminal (Konsole):
#
#   curl -fsSL https://raw.githubusercontent.com/joshbirnholz/Decky-Discord-Voice/main/install.sh | bash
#
# Requirements:
#   - Decky Loader already installed (https://decky.xyz)
#   - A sudo password set (run `passwd` once if you never set one)

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/joshbirnholz/Decky-Discord-Voice.git}"
VENCORD_URL="${VENCORD_URL:-https://github.com/Vendicated/Vencord.git}"

BASE_DIR="$HOME/.local/share/decky-discord-voice"
SRC_DIR="$BASE_DIR/Decky-Discord-Voice"
VENCORD_DIR="$BASE_DIR/Vencord"

NODE_VERSION="${NODE_VERSION:-22.14.0}"
NODE_DIR="$BASE_DIR/node-v$NODE_VERSION"
NODE_URL="https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz"

PLUGIN_ID="discord-voice"
PLUGIN_DEST="$HOME/homebrew/plugins/$PLUGIN_ID"

VESKTOP_APP="dev.vencord.Vesktop"
VESKTOP_CONF="$HOME/.var/app/$VESKTOP_APP/config/vesktop"

log()  { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33mWarning: %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31mError: %s\033[0m\n' "$*" >&2; exit 1; }

# ---------------------------------------------------------------- preflight --

command -v git     >/dev/null 2>&1 || die "git is required but not found."
command -v curl    >/dev/null 2>&1 || die "curl is required but not found."
command -v flatpak >/dev/null 2>&1 || die "flatpak is required but not found."
command -v python3 >/dev/null 2>&1 || die "python3 is required but not found."

[ -d "$HOME/homebrew/services" ] || die \
  "Decky Loader doesn't seem to be installed (no ~/homebrew/services). Install it first: https://decky.xyz"

# Installing into ~/homebrew/plugins and restarting the loader needs sudo.
if ! sudo -n true 2>/dev/null; then
  pw_status="$(passwd -S "$USER" 2>/dev/null | awk '{print $2}' || true)"
  if [ "$pw_status" != "P" ] && [ -n "$pw_status" ]; then
    die "No sudo password is set for '$USER'. Run 'passwd' to set one, then re-run this script."
  fi
  log "sudo access is needed to install the Decky plugin — you may be prompted for your password."
  sudo -v
fi

mkdir -p "$BASE_DIR"

# ------------------------------------------------------------ node + pnpm ---

if ! "$NODE_DIR/bin/node" --version >/dev/null 2>&1; then
  log "Downloading Node.js v$NODE_VERSION (private copy, no system changes)"
  curl -fL "$NODE_URL" | tar -xJ -C "$BASE_DIR"
fi
export PATH="$NODE_DIR/bin:$PATH"

if ! command -v pnpm >/dev/null 2>&1; then
  log "Installing pnpm"
  npm install -g pnpm >/dev/null
fi

# --------------------------------------------------------------- git repos --

# Clone (first run) or hard-update (later runs) a managed repo checkout.
sync_repo() {
  local url="$1" dir="$2"
  if [ -d "$dir/.git" ]; then
    log "Updating $(basename "$dir")"
    git -C "$dir" fetch origin --prune
    git -C "$dir" remote set-head origin -a >/dev/null
    local branch
    branch="$(git -C "$dir" symbolic-ref --short refs/remotes/origin/HEAD | cut -d/ -f2-)"
    git -C "$dir" reset --hard "origin/$branch"
  else
    log "Cloning $url"
    git clone --depth 1 "$url" "$dir"
  fi
}

sync_repo "$REPO_URL" "$SRC_DIR"
sync_repo "$VENCORD_URL" "$VENCORD_DIR"

# ------------------------------------------------ Vencord + DeckVoiceBridge --

log "Adding DeckVoiceBridge user plugin to Vencord"
mkdir -p "$VENCORD_DIR/src/userplugins"
rm -rf "$VENCORD_DIR/src/userplugins/deckVoiceBridge"
cp -r "$SRC_DIR/vencord/deckVoiceBridge" "$VENCORD_DIR/src/userplugins/"

log "Building Vencord (this takes a few minutes on first run)"
(
  cd "$VENCORD_DIR"
  pnpm install --frozen-lockfile || {
    warn "frozen install failed, retrying with a plain install"
    pnpm install
  }
  pnpm build
)
[ -f "$VENCORD_DIR/dist/vencordDesktopMain.js" ] || die \
  "Vencord build finished but dist/vencordDesktopMain.js is missing — build layout may have changed."

# ------------------------------------------------------------------ Vesktop --

if ! flatpak info "$VESKTOP_APP" >/dev/null 2>&1; then
  log "Installing Vesktop (flatpak)"
  flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
  flatpak install --user -y flathub "$VESKTOP_APP"
fi

# The flatpak sandbox must be able to read the custom Vencord build.
flatpak override --user --filesystem="$VENCORD_DIR" "$VESKTOP_APP"

# Vesktop rewrites its settings on exit, which would clobber our edits.
if flatpak ps 2>/dev/null | grep -q "$VESKTOP_APP"; then
  log "Closing Vesktop so settings can be updated"
  flatpak kill "$VESKTOP_APP" || true
  sleep 2
fi

log "Pointing Vesktop at the custom Vencord build and enabling DeckVoiceBridge"
python3 - "$VESKTOP_CONF" "$VENCORD_DIR/dist" <<'PYEOF'
import json, os, sys

conf_dir, vencord_dist = sys.argv[1], sys.argv[2]

def merge(path, mutate):
    data = {}
    if os.path.exists(path):
        with open(path) as f:
            data = json.load(f)
    mutate(data)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=4)

# Vesktop's own settings: where to load Vencord from.
merge(os.path.join(conf_dir, "settings.json"),
      lambda s: s.__setitem__("vencordDir", vencord_dist))

# Vencord's settings: make sure the bridge plugin is enabled.
def enable_plugin(s):
    s.setdefault("plugins", {}).setdefault("DeckVoiceBridge", {})["enabled"] = True
merge(os.path.join(conf_dir, "settings", "settings.json"), enable_plugin)
PYEOF

# -------------------------------------------------------------- Decky plugin --

log "Building the Decky plugin"
(
  cd "$SRC_DIR"
  pnpm install --frozen-lockfile || {
    warn "frozen install failed, retrying with a plain install"
    pnpm install
  }
  pnpm build
)
[ -f "$SRC_DIR/dist/index.js" ] || die "Decky plugin build failed (no dist/index.js)."

log "Installing the Decky plugin into $PLUGIN_DEST (sudo)"
sudo rm -rf "$PLUGIN_DEST"
sudo mkdir -p "$PLUGIN_DEST"
sudo cp -r "$SRC_DIR/dist" "$SRC_DIR/main.py" "$SRC_DIR/plugin.json" "$SRC_DIR/package.json" "$PLUGIN_DEST/"

log "Restarting Decky Loader"
sudo systemctl restart plugin_loader

# -------------------------------------------------------------- first login --

# From now on the Decky plugin starts Vesktop in the background by itself, but
# the very first Discord login has to be done interactively — open it now.
if ! flatpak ps 2>/dev/null | grep -q "$VESKTOP_APP"; then
  log "Launching Vesktop — log in to Discord if you haven't already"
  (nohup flatpak run "$VESKTOP_APP" >/dev/null 2>&1 &)
fi

# --------------------------------------------------------------------- done --

log "Done!"
cat <<EOF

  Installed / updated:
    - Vencord (custom build):  $VENCORD_DIR
    - Vesktop (flatpak):       $VESKTOP_APP
    - Decky plugin:            $PLUGIN_DEST

  Next steps:
    1. Log in to Discord in the Vesktop window that just opened (first install
       only — your login is remembered after that).
    2. That's it. In Gaming Mode the plugin starts Discord in the background
       automatically; open the Quick Access Menu -> plug icon -> "Discord Voice".

  To update later, just re-run this script.
EOF
