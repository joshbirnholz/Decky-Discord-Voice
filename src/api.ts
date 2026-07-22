import { callable } from "@decky/api";

import type { BridgeState, DM, Guild, RpcResult, VoiceChannel } from "./types";

export const getState = callable<[], BridgeState>("get_state");
export const ensureDiscordRunning = callable<[], { running: boolean; launched: boolean }>("ensure_discord_running");
export const listGuilds = callable<[], RpcResult<Guild[]>>("list_guilds");
export const listDMs = callable<[], RpcResult<DM[]>>("list_dms");
export const listChannels = callable<[guildId: string], RpcResult<VoiceChannel[]>>("list_channels");
export const joinChannel = callable<[channelId: string], RpcResult<null>>("join");
export const leaveCall = callable<[], RpcResult<null>>("leave");
export const setUserMute = callable<[userId: string, muted: boolean], RpcResult<null>>("set_user_mute");
export const setUserVolume = callable<[userId: string, volume: number], RpcResult<null>>("set_user_volume");
export const setMuteAll = callable<[muted: boolean], RpcResult<null>>("set_mute_all");
