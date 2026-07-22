# Discord Voice (Decky plugin)

Manage Discord voice chat from the Steam Deck Quick Access Menu, modeled on the
PS5 Discord integration:

- Browse **Direct Voice Chats** or your **server list**
- Pick a voice channel (grouped by category, with avatars of who's in each one)
- In-call view: channel + server icon, **Mute All / Unmute All**, **Leave**, member list
- Select a member to **mute** them or adjust their **volume** (0–200%)

## How it works

```
QAM frontend (src/)  ←→  Decky backend (main.py)  ←→  Vencord plugin (vencord/deckVoiceBridge/)
     @decky/ui            WebSocket server on              runs inside Discord,
                          ws://127.0.0.1:48642             connects out to the backend
```

The Python backend hosts a small dependency-free WebSocket server on localhost.
The `DeckVoiceBridge` Vencord plugin connects to it from inside your running,
already-logged-in Discord client and executes the actual actions (join/leave,
local mute, local volume) using Discord's own internal stores — no token
handling, no separate Discord connection.

> **Note:** client mods like Vencord are against Discord's ToS. Enforcement is
> historically rare for cosmetic/client mods, but use at your own discretion.

## Install

Prerequisites on the Deck:

- [Decky Loader](https://decky.xyz) installed
- A sudo password set (run `passwd` in a terminal once if you never set one)

Then, in **Desktop Mode**, open a terminal (Konsole) and run:

```bash
curl -fsSL https://raw.githubusercontent.com/joshbirnholz/Decky-Discord-Voice/main/install.sh | bash
```

The script sets up everything:

1. A private Node.js + pnpm toolchain in `~/.local/share/decky-discord-voice`
   (nothing system-wide is touched)
2. [Vencord](https://vencord.dev), built from source with the
   **DeckVoiceBridge** user plugin included
3. [Vesktop](https://github.com/Vencord/Vesktop) (flatpak), pointed at that
   custom Vencord build with the plugin enabled — Discord on the Deck is
   easiest via Vesktop, which runs well in Gaming Mode
4. The **Discord Voice** Decky plugin, built and installed into Decky Loader

**To update later, just re-run the same command** — it pulls the latest
version of this plugin and Vencord, rebuilds, and redeploys.

After installing, launch Vesktop once and log in to Discord. The bridge plugin
retries the localhost connection every 5 s, so start order doesn't matter.

<details>
<summary><b>Manual install / development</b></summary>

### 1. The Vencord plugin (inside Discord on the Deck)

To add a custom ("user") plugin you need a Vencord build from source:

1. Clone Vencord, copy `vencord/deckVoiceBridge/` into `src/userplugins/`.
2. Build and install per the
   [Vencord custom-plugin docs](https://docs.vencord.dev/installing/custom-plugins/)
   (for Vesktop, point it at your custom Vencord build in its settings).
3. Enable **DeckVoiceBridge** in Vencord's plugin settings.

### 2. The Decky plugin (on the Deck)

Build on your dev machine:

```bash
pnpm install
pnpm build
```

Then deploy to the Deck (Decky Loader must be installed):

```bash
DECK=deck@steamdeck   # adjust host
ssh $DECK "mkdir -p ~/homebrew/plugins/discord-voice"
scp -r dist main.py plugin.json package.json "$DECK:~/homebrew/plugins/discord-voice/"
ssh $DECK "systemctl --user restart plugin_loader 2>/dev/null || sudo systemctl restart plugin_loader"
```

</details>

### Running in Gaming Mode

Discord (Vesktop) has to be running for the plugin to work. The install script
tries to add it to Steam automatically; if it isn't there, add it as a
non-Steam app (right-click Vesktop in the app launcher → "Add to Steam").
Launch it once per session; it keeps running in the
background while you play. The QAM panel shows a waiting message until the
bridge connects.

## Configuration

The bridge port is `48642`, hardcoded in two places if you need to change it:
`WS_PORT` in `main.py` and `BRIDGE_URL` in `vencord/deckVoiceBridge/index.ts`.

## Behavior notes

- **Mute All** applies a *local* mute to every other member (you can still
  talk, like the PS5 feature); Unmute All reverses it.
- Joining a channel while in a call switches channels (Discord's normal
  behavior). The in-call view replaces the browse view whenever you're in a
  call; **Leave** returns you to browsing.
- Member volume matches Discord's user-volume slider (100 = default, up to 200).
- Voice state, member lists, and local mute/volume changes are pushed from
  Discord to the QAM live; no polling.
