export interface Guild {
  id: string;
  name: string;
  icon: string | null;
}

export interface DM {
  id: string;
  name: string;
  icon: string | null;
}

export interface ChannelUser {
  id: string;
  name: string;
  avatar: string;
}

export interface VoiceChannel {
  id: string;
  name: string;
  category: string | null;
  isStage: boolean;
  users: ChannelUser[];
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  isSelf: boolean;
  muted: boolean;
  volume: number;
}

export interface Call {
  channelId: string;
  channelName: string;
  guildName: string | null;
  icon: string | null;
  members: Member[];
}

export interface BridgeState {
  connected: boolean;
  call: Call | null;
}

export interface RpcResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
