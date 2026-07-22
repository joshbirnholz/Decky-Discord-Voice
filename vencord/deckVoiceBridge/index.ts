/*
 * DeckVoiceBridge — companion Vencord plugin for the "Discord Voice" Decky plugin.
 *
 * Connects to the Decky plugin's localhost WebSocket server and exposes a small
 * command surface (list guilds/DMs/channels, join/leave voice, local mute and
 * volume) plus pushes voice-call state changes as events.
 */

import definePlugin from "@utils/types";
import { findByPropsLazy, findStoreLazy } from "@webpack";
import {
    ChannelStore,
    FluxDispatcher,
    GuildStore,
    SelectedChannelStore,
    UserStore
} from "@webpack/common";

const BRIDGE_URL = "ws://127.0.0.1:48642";
const RECONNECT_MS = 5000;

const ChannelActions = findByPropsLazy("selectVoiceChannel");
const VolumeActions = findByPropsLazy("setLocalVolume");
const MuteActions = findByPropsLazy("toggleLocalMute");
const GuildChannelStore = findStoreLazy("GuildChannelStore");
const VoiceStateStore = findStoreLazy("VoiceStateStore");
const MediaEngineStore = findStoreLazy("MediaEngineStore");
const SortedGuildStore = findStoreLazy("SortedGuildStore");
const PrivateChannelSortStore = findStoreLazy("PrivateChannelSortStore");

const CDN = "https://cdn.discordapp.com";

const FLUX_EVENTS = [
    "VOICE_STATE_UPDATES",
    "VOICE_CHANNEL_SELECT",
    "AUDIO_TOGGLE_LOCAL_MUTE",
    "AUDIO_SET_LOCAL_VOLUME",
    "CONNECTION_OPEN"
];

let ws: WebSocket | null = null;
let reconnectTimer: any = null;
let pushTimer: any = null;
let stopped = false;

function userAvatarUrl(user: any): string {
    if (user?.avatar)
        return `${CDN}/avatars/${user.id}/${user.avatar}.png?size=64`;
    let index = 0;
    try {
        index = Number(BigInt(user?.id ?? "0") >> 22n) % 6;
    } catch {
        index = 0;
    }
    return `${CDN}/embed/avatars/${index}.png`;
}

function guildIconUrl(guild: any): string | null {
    return guild?.icon ? `${CDN}/icons/${guild.id}/${guild.icon}.png?size=64` : null;
}

function displayName(user: any): string {
    return user?.globalName ?? user?.global_name ?? user?.username ?? "Unknown";
}

function dmInfo(channel: any): { name: string; icon: string | null } {
    if (channel?.type === 3) { // group DM
        const name = channel.name
            || (channel.recipients ?? [])
                .map((id: string) => displayName(UserStore.getUser(id)))
                .join(", ")
            || "Group DM";
        const icon = channel.icon
            ? `${CDN}/channel-icons/${channel.id}/${channel.icon}.png?size=64`
            : null;
        return { name, icon };
    }
    const recipient = UserStore.getUser(channel?.recipients?.[0]);
    return { name: displayName(recipient), icon: recipient ? userAvatarUrl(recipient) : null };
}

function channelUsers(channelId: string) {
    const states = VoiceStateStore.getVoiceStatesForChannel(channelId) ?? {};
    return Object.keys(states).map(userId => {
        const user = UserStore.getUser(userId);
        return { id: userId, name: displayName(user), avatar: userAvatarUrl(user) };
    });
}

function getCallState() {
    const channelId = SelectedChannelStore.getVoiceChannelId();
    if (!channelId) return null;
    const channel = ChannelStore.getChannel(channelId);
    if (!channel) return null;
    const guild = channel.guild_id ? GuildStore.getGuild(channel.guild_id) : null;
    const meId = UserStore.getCurrentUser()?.id;
    const states = VoiceStateStore.getVoiceStatesForChannel(channelId) ?? {};

    const members = Object.keys(states).map(userId => {
        const user = UserStore.getUser(userId);
        return {
            id: userId,
            name: displayName(user),
            avatar: userAvatarUrl(user),
            isSelf: userId === meId,
            muted: !!MediaEngineStore.isLocalMute(userId),
            volume: Math.round(MediaEngineStore.getLocalVolume(userId) ?? 100)
        };
    });

    let channelName = channel.name;
    let icon = guild ? guildIconUrl(guild) : null;
    if (!guild) {
        const dm = dmInfo(channel);
        channelName = channelName || dm.name;
        icon = dm.icon;
    }

    return {
        channelId,
        channelName: channelName ?? "Voice",
        guildName: guild?.name ?? null,
        icon,
        members
    };
}

function listGuilds() {
    const order: string[] = SortedGuildStore.getFlattenedGuildIds?.() ?? [];
    const all = GuildStore.getGuilds();
    const ids = order.length ? order : Object.keys(all);
    return ids
        .map(id => all[id])
        .filter(Boolean)
        .map((guild: any) => ({
            id: guild.id,
            name: guild.name,
            icon: guildIconUrl(guild)
        }));
}

function listDMs() {
    const ids: string[] = PrivateChannelSortStore.getPrivateChannelIds?.() ?? [];
    return ids
        .map(id => ChannelStore.getChannel(id))
        .filter((c: any) => c && (c.type === 1 || c.type === 3))
        .map((c: any) => {
            const { name, icon } = dmInfo(c);
            return { id: c.id, name, icon };
        });
}

function listChannels(guildId: string) {
    const vocal: any[] = GuildChannelStore.getChannels(guildId)?.VOCAL ?? [];
    const channels = vocal
        .map(entry => entry.channel)
        .filter((c: any) => c && (c.type === 2 || c.type === 13));

    const withSort = channels.map((c: any) => {
        const parent = c.parent_id ? ChannelStore.getChannel(c.parent_id) : null;
        return {
            channel: c,
            category: parent?.name ?? null,
            categoryPos: parent?.position ?? -1
        };
    });
    withSort.sort((a, b) =>
        a.categoryPos - b.categoryPos || a.channel.position - b.channel.position
    );

    return withSort.map(({ channel, category }) => ({
        id: channel.id,
        name: channel.name,
        category,
        isStage: channel.type === 13,
        users: channelUsers(channel.id)
    }));
}

function othersInCall(): string[] {
    const channelId = SelectedChannelStore.getVoiceChannelId();
    if (!channelId) return [];
    const meId = UserStore.getCurrentUser()?.id;
    const states = VoiceStateStore.getVoiceStatesForChannel(channelId) ?? {};
    return Object.keys(states).filter(id => id !== meId);
}

function setLocalMute(userId: string, muted: boolean) {
    if (!!MediaEngineStore.isLocalMute(userId) !== muted)
        MuteActions.toggleLocalMute(userId);
}

function handleCommand(cmd: string, args: any): any {
    switch (cmd) {
        case "getState":
            return getCallState();
        case "listGuilds":
            return listGuilds();
        case "listDMs":
            return listDMs();
        case "listChannels":
            return listChannels(args.guildId);
        case "join":
            ChannelActions.selectVoiceChannel(args.channelId);
            return null;
        case "leave":
            ChannelActions.selectVoiceChannel(null);
            return null;
        case "setMute":
            setLocalMute(args.userId, !!args.muted);
            return null;
        case "setVolume":
            VolumeActions.setLocalVolume(args.userId, Number(args.volume));
            return null;
        case "muteAll":
            for (const userId of othersInCall()) setLocalMute(userId, !!args.muted);
            return null;
        default:
            throw new Error(`Unknown command: ${cmd}`);
    }
}

function send(obj: any) {
    if (ws?.readyState === WebSocket.OPEN)
        ws.send(JSON.stringify(obj));
}

function pushState() {
    if (pushTimer) return;
    pushTimer = setTimeout(() => {
        pushTimer = null;
        send({ type: "event", event: "state", data: getCallState() });
    }, 150);
}

function onFlux() {
    pushState();
}

function connect() {
    if (stopped) return;
    try {
        ws = new WebSocket(BRIDGE_URL);
    } catch {
        scheduleReconnect();
        return;
    }
    ws.onopen = () => {
        send({ type: "event", event: "state", data: getCallState() });
    };
    ws.onmessage = e => {
        let msg: any;
        try {
            msg = JSON.parse(e.data);
        } catch {
            return;
        }
        if (msg?.type !== "request") return;
        try {
            const data = handleCommand(msg.cmd, msg.args ?? {});
            send({ type: "response", id: msg.id, ok: true, data });
        } catch (err) {
            send({ type: "response", id: msg.id, ok: false, error: String(err) });
        }
        // Actions change state; make sure the deck hears about it even if no
        // flux event fires (e.g. local mute of a user who then stays silent).
        pushState();
    };
    ws.onclose = () => {
        ws = null;
        scheduleReconnect();
    };
    ws.onerror = () => {
        try {
            ws?.close();
        } catch { /* ignore */ }
    };
}

function scheduleReconnect() {
    if (stopped || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
    }, RECONNECT_MS);
}

export default definePlugin({
    name: "DeckVoiceBridge",
    description: "Bridges Discord voice controls to the Steam Deck 'Discord Voice' Decky plugin over a localhost WebSocket.",
    authors: [{ name: "compc", id: 0n }],

    start() {
        stopped = false;
        for (const event of FLUX_EVENTS)
            FluxDispatcher.subscribe(event, onFlux);
        connect();
    },

    stop() {
        stopped = true;
        for (const event of FLUX_EVENTS)
            FluxDispatcher.unsubscribe(event, onFlux);
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        if (pushTimer) {
            clearTimeout(pushTimer);
            pushTimer = null;
        }
        try {
            ws?.close();
        } catch { /* ignore */ }
        ws = null;
    }
});
