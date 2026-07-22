import asyncio
import base64
import hashlib
import json
import os
import pwd
import struct
import subprocess
import time

import decky

WS_HOST = "127.0.0.1"
WS_PORT = 48642
WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
REQUEST_TIMEOUT = 10.0

VESKTOP_APP = "dev.vencord.Vesktop"
VESKTOP_LAUNCH_COOLDOWN = 20.0
# Gamescope (Gaming Mode) and Desktop Mode expose different X displays; try
# both, alternating between launch attempts.
VESKTOP_DISPLAYS = [":0", ":1"]


class Plugin:
    async def _main(self):
        self.server = None
        self.bridge_writer = None
        self.pending = {}
        self.next_req_id = 1
        self.state = {"connected": False, "call": None}
        self.last_vesktop_launch = 0.0
        self.vesktop_launch_count = 0
        self.server = await asyncio.start_server(
            self._handle_client, WS_HOST, WS_PORT
        )
        decky.logger.info(f"Discord Voice bridge listening on ws://{WS_HOST}:{WS_PORT}")
        await self.ensure_discord_running()

    async def _unload(self):
        if self.bridge_writer is not None:
            try:
                self.bridge_writer.close()
            except Exception:
                pass
            self.bridge_writer = None
        if self.server is not None:
            self.server.close()
            await self.server.wait_closed()
            self.server = None
        decky.logger.info("Discord Voice bridge stopped")

    # ---- Methods callable from the frontend ----

    async def get_state(self):
        return self.state

    async def list_guilds(self):
        return await self._request("listGuilds")

    async def list_dms(self):
        return await self._request("listDMs")

    async def list_channels(self, guild_id):
        return await self._request("listChannels", {"guildId": guild_id})

    async def join(self, channel_id):
        return await self._request("join", {"channelId": channel_id})

    async def leave(self):
        return await self._request("leave")

    async def set_user_mute(self, user_id, muted):
        return await self._request("setMute", {"userId": user_id, "muted": muted})

    async def set_user_volume(self, user_id, volume):
        return await self._request("setVolume", {"userId": user_id, "volume": volume})

    async def set_mute_all(self, muted):
        return await self._request("muteAll", {"muted": muted})

    async def ensure_discord_running(self):
        """Start Vesktop in the background if it isn't already running.

        Called on plugin load and periodically by the frontend while the
        bridge is disconnected, so Discord comes up without the user ever
        launching or seeing it.
        """
        if self.state.get("connected") or self._vesktop_running():
            return {"running": True, "launched": False}
        now = time.monotonic()
        if now - self.last_vesktop_launch < VESKTOP_LAUNCH_COOLDOWN:
            return {"running": False, "launched": False}
        self.last_vesktop_launch = now
        return {"running": False, "launched": self._launch_vesktop()}

    # ---- Vesktop lifecycle ----

    def _vesktop_running(self):
        try:
            result = subprocess.run(
                ["pgrep", "-f", VESKTOP_APP],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            return result.returncode == 0
        except OSError:
            return False

    def _launch_vesktop(self):
        user = getattr(decky, "DECKY_USER", None) or "deck"
        try:
            info = pwd.getpwnam(user)
        except KeyError:
            decky.logger.warning(f"Cannot launch Vesktop: no such user '{user}'")
            return False

        display = VESKTOP_DISPLAYS[self.vesktop_launch_count % len(VESKTOP_DISPLAYS)]
        self.vesktop_launch_count += 1

        env = dict(os.environ)
        env.update(
            {
                "HOME": info.pw_dir,
                "USER": user,
                "LOGNAME": user,
                "XDG_RUNTIME_DIR": f"/run/user/{info.pw_uid}",
                "DBUS_SESSION_BUS_ADDRESS": f"unix:path=/run/user/{info.pw_uid}/bus",
                "DISPLAY": env.get("DISPLAY") or display,
            }
        )
        env.setdefault("PATH", "/usr/local/bin:/usr/bin:/bin")

        # The backend may run as root (Decky) — drop to the desktop user so
        # the flatpak sees the right session, audio, and Discord login.
        demote = None
        if os.geteuid() == 0:
            def demote():
                os.initgroups(user, info.pw_gid)
                os.setgid(info.pw_gid)
                os.setuid(info.pw_uid)

        try:
            subprocess.Popen(
                ["flatpak", "run", VESKTOP_APP, "--start-minimized"],
                env=env,
                preexec_fn=demote,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
            decky.logger.info(f"Launched Vesktop in the background (DISPLAY={env['DISPLAY']})")
            return True
        except Exception as e:
            decky.logger.warning(f"Failed to launch Vesktop: {e}")
            return False

    # ---- Bridge request/response plumbing ----

    async def _request(self, cmd, args=None):
        if self.bridge_writer is None:
            return {"ok": False, "error": "Discord bridge is not connected"}
        req_id = self.next_req_id
        self.next_req_id += 1
        future = asyncio.get_event_loop().create_future()
        self.pending[req_id] = future
        try:
            await self._send_json(
                self.bridge_writer,
                {"type": "request", "id": req_id, "cmd": cmd, "args": args or {}},
            )
            return await asyncio.wait_for(future, REQUEST_TIMEOUT)
        except asyncio.TimeoutError:
            return {"ok": False, "error": f"Discord bridge timed out on '{cmd}'"}
        except Exception as e:
            return {"ok": False, "error": str(e)}
        finally:
            self.pending.pop(req_id, None)

    async def _on_bridge_message(self, text):
        try:
            msg = json.loads(text)
        except ValueError:
            decky.logger.warning("Bridge sent invalid JSON")
            return
        mtype = msg.get("type")
        if mtype == "response":
            future = self.pending.get(msg.get("id"))
            if future is not None and not future.done():
                future.set_result(
                    {"ok": msg.get("ok", False), "data": msg.get("data"), "error": msg.get("error")}
                )
        elif mtype == "event" and msg.get("event") == "state":
            self.state = {"connected": True, "call": msg.get("data")}
            await decky.emit("discord_state", self.state)

    async def _set_connected(self, connected):
        self.state = {"connected": connected, "call": self.state.get("call") if connected else None}
        await decky.emit("discord_state", self.state)

    # ---- Minimal WebSocket server (stdlib only) ----

    async def _handle_client(self, reader, writer):
        try:
            if not await self._handshake(reader, writer):
                writer.close()
                return
            # Only one bridge at a time; replace any stale connection.
            if self.bridge_writer is not None:
                try:
                    self.bridge_writer.close()
                except Exception:
                    pass
            self.bridge_writer = writer
            decky.logger.info("Discord bridge connected")
            await self._set_connected(True)
            while True:
                message = await self._read_message(reader, writer)
                if message is None:
                    break
                await self._on_bridge_message(message)
        except (asyncio.IncompleteReadError, ConnectionResetError, OSError):
            pass
        except Exception as e:
            decky.logger.exception(f"Bridge connection error: {e}")
        finally:
            if self.bridge_writer is writer:
                self.bridge_writer = None
                for future in self.pending.values():
                    if not future.done():
                        future.set_result({"ok": False, "error": "Discord bridge disconnected"})
                decky.logger.info("Discord bridge disconnected")
                await self._set_connected(False)
            try:
                writer.close()
            except Exception:
                pass

    async def _handshake(self, reader, writer):
        data = b""
        while b"\r\n\r\n" not in data:
            chunk = await reader.read(1024)
            if not chunk:
                return False
            data += chunk
            if len(data) > 16384:
                return False
        headers = {}
        for line in data.split(b"\r\n")[1:]:
            if b":" in line:
                key, value = line.split(b":", 1)
                headers[key.strip().lower()] = value.strip()
        key = headers.get(b"sec-websocket-key")
        if key is None:
            return False
        accept = base64.b64encode(hashlib.sha1(key + WS_GUID.encode()).digest()).decode()
        writer.write(
            (
                "HTTP/1.1 101 Switching Protocols\r\n"
                "Upgrade: websocket\r\n"
                "Connection: Upgrade\r\n"
                f"Sec-WebSocket-Accept: {accept}\r\n\r\n"
            ).encode()
        )
        await writer.drain()
        return True

    async def _read_frame(self, reader):
        header = await reader.readexactly(2)
        fin = bool(header[0] & 0x80)
        opcode = header[0] & 0x0F
        masked = bool(header[1] & 0x80)
        length = header[1] & 0x7F
        if length == 126:
            length = struct.unpack(">H", await reader.readexactly(2))[0]
        elif length == 127:
            length = struct.unpack(">Q", await reader.readexactly(8))[0]
        mask = await reader.readexactly(4) if masked else None
        payload = await reader.readexactly(length) if length else b""
        if mask is not None:
            payload = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
        return fin, opcode, payload

    async def _read_message(self, reader, writer):
        buffer = b""
        while True:
            fin, opcode, payload = await self._read_frame(reader)
            if opcode == 0x8:  # close
                return None
            if opcode == 0x9:  # ping -> pong
                writer.write(self._make_frame(payload, opcode=0xA))
                await writer.drain()
                continue
            if opcode == 0xA:  # pong
                continue
            if opcode in (0x1, 0x2, 0x0):
                buffer += payload
                if fin:
                    return buffer.decode("utf-8", errors="replace")

    @staticmethod
    def _make_frame(payload, opcode=0x1):
        frame = bytearray([0x80 | opcode])
        n = len(payload)
        if n < 126:
            frame.append(n)
        elif n < 65536:
            frame.append(126)
            frame += struct.pack(">H", n)
        else:
            frame.append(127)
            frame += struct.pack(">Q", n)
        return bytes(frame) + payload

    async def _send_json(self, writer, obj):
        writer.write(self._make_frame(json.dumps(obj).encode()))
        await writer.drain()
