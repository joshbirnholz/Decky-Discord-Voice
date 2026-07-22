import {
  addEventListener,
  definePlugin,
  removeEventListener
} from "@decky/api";
import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  SliderField,
  ToggleField,
  staticClasses
} from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaDiscord, FaHeadset, FaPhoneAlt, FaVolumeMute, FaVolumeUp } from "react-icons/fa";

import {
  getState,
  joinChannel,
  leaveCall,
  listChannels,
  listDMs,
  listGuilds,
  setMuteAll,
  setUserMute,
  setUserVolume
} from "./api";
import type { BridgeState, DM, Guild, Member, VoiceChannel } from "./types";

type Nav =
  | { view: "root" }
  | { view: "dms" }
  | { view: "guild"; guild: Guild }
  | { view: "member"; memberId: string };

// ---- Small presentational pieces ----

function CircleIcon({ src, size = 28 }: { src: string | null; size?: number }) {
  if (!src) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#5865F2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}
      >
        <FaDiscord size={size * 0.6} color="#fff" />
      </div>
    );
  }
  return (
    <img
      src={src}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
    />
  );
}

function IconRow({ icon, label, sublabel }: { icon: React.ReactNode; label: string; sublabel?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
      {icon}
      <div style={{ minWidth: 0, textAlign: "left" }}>
        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
        {sublabel && (
          <div style={{ fontSize: "0.75em", opacity: 0.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}

/** First two avatars of channel occupants plus a "+N" style count bubble. */
function AvatarStack({ users }: { users: { id: string; avatar: string }[] }) {
  if (users.length === 0) return null;
  const shown = users.slice(0, 2);
  const overflow = users.length - shown.length;
  return (
    <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
      {shown.map((u, i) => (
        <img
          key={u.id}
          src={u.avatar}
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            objectFit: "cover",
            marginLeft: i === 0 ? 0 : -8,
            border: "2px solid #23262e"
          }}
        />
      ))}
      {overflow > 0 && (
        <div
          style={{
            minWidth: 22,
            height: 22,
            borderRadius: 11,
            marginLeft: -8,
            background: "#3a3d46",
            border: "2px solid #23262e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.7em",
            padding: "0 3px"
          }}
        >
          {overflow}
        </div>
      )}
    </div>
  );
}

function BackRow({ onClick }: { onClick: () => void }) {
  return (
    <PanelSectionRow>
      <ButtonItem layout="below" onClick={onClick}>
        <IconRow icon={<FaChevronLeft />} label="Back" />
      </ButtonItem>
    </PanelSectionRow>
  );
}

// ---- Browse: DM entry + server list (screenshot 1) ----

function BrowseView({ onSelectDMs, onSelectGuild }: {
  onSelectDMs: () => void;
  onSelectGuild: (guild: Guild) => void;
}) {
  const [guilds, setGuilds] = useState<Guild[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listGuilds().then(res => {
      if (res.ok) setGuilds(res.data ?? []);
      else setError(res.error ?? "Failed to load servers");
    });
  }, []);

  return (
    <>
      <PanelSection>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={onSelectDMs}>
            <IconRow icon={<FaPhoneAlt />} label="Direct Voice Chats" />
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title="Servers">
        {error && <PanelSectionRow>{error}</PanelSectionRow>}
        {guilds === null && !error && <PanelSectionRow>Loading…</PanelSectionRow>}
        {guilds?.map(guild => (
          <PanelSectionRow key={guild.id}>
            <ButtonItem layout="below" onClick={() => onSelectGuild(guild)}>
              <IconRow icon={<CircleIcon src={guild.icon} />} label={guild.name} />
            </ButtonItem>
          </PanelSectionRow>
        ))}
      </PanelSection>
    </>
  );
}

// ---- DM list ----

function DMView({ onBack }: { onBack: () => void }) {
  const [dms, setDMs] = useState<DM[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listDMs().then(res => {
      if (res.ok) setDMs(res.data ?? []);
      else setError(res.error ?? "Failed to load DMs");
    });
  }, []);

  return (
    <>
      <PanelSection>
        <BackRow onClick={onBack} />
      </PanelSection>
      <PanelSection title="Direct Voice Chats">
        {error && <PanelSectionRow>{error}</PanelSectionRow>}
        {dms === null && !error && <PanelSectionRow>Loading…</PanelSectionRow>}
        {dms?.map(dm => (
          <PanelSectionRow key={dm.id}>
            <ButtonItem layout="below" onClick={() => joinChannel(dm.id)}>
              <IconRow icon={<CircleIcon src={dm.icon} />} label={dm.name} />
            </ButtonItem>
          </PanelSectionRow>
        ))}
        {dms?.length === 0 && <PanelSectionRow>No direct messages found.</PanelSectionRow>}
      </PanelSection>
    </>
  );
}

// ---- Server channel list, grouped by category (screenshots 2 & 3) ----

function GuildView({ guild, onBack }: { guild: Guild; onBack: () => void }) {
  const [channels, setChannels] = useState<VoiceChannel[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listChannels(guild.id).then(res => {
      if (res.ok) setChannels(res.data ?? []);
      else setError(res.error ?? "Failed to load channels");
    });
  }, [guild.id]);

  const groups: { name: string | null; channels: VoiceChannel[] }[] = [];
  for (const channel of channels ?? []) {
    const last = groups[groups.length - 1];
    if (last && last.name === channel.category) last.channels.push(channel);
    else groups.push({ name: channel.category, channels: [channel] });
  }

  return (
    <>
      <PanelSection>
        <PanelSectionRow>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }}>
            <CircleIcon src={guild.icon} size={24} />
            <div style={{ fontWeight: 600 }}>{guild.name}</div>
          </div>
        </PanelSectionRow>
        <BackRow onClick={onBack} />
      </PanelSection>
      {error && (
        <PanelSection>
          <PanelSectionRow>{error}</PanelSectionRow>
        </PanelSection>
      )}
      {channels === null && !error && (
        <PanelSection>
          <PanelSectionRow>Loading…</PanelSectionRow>
        </PanelSection>
      )}
      {groups.map((group, i) => (
        <PanelSection key={group.name ?? `group-${i}`} title={group.name ?? undefined}>
          {group.channels.map(channel => (
            <PanelSectionRow key={channel.id}>
              <ButtonItem layout="below" onClick={() => joinChannel(channel.id)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <IconRow icon={<FaVolumeUp />} label={channel.name} />
                  <AvatarStack users={channel.users} />
                </div>
              </ButtonItem>
            </PanelSectionRow>
          ))}
        </PanelSection>
      ))}
      {channels?.length === 0 && (
        <PanelSection>
          <PanelSectionRow>No voice channels in this server.</PanelSectionRow>
        </PanelSection>
      )}
    </>
  );
}

// ---- In-call view (screenshot 4) ----

function InCallView({ state, onSelectMember }: {
  state: BridgeState;
  onSelectMember: (member: Member) => void;
}) {
  const call = state.call!;
  const others = call.members.filter(m => !m.isSelf);
  const allMuted = others.length > 0 && others.every(m => m.muted);

  return (
    <>
      <PanelSection title={`Joined: 1`}>
        <PanelSectionRow>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 10px",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "6px"
            }}
          >
            <CircleIcon src={call.icon} size={26} />
            <div style={{ minWidth: 0 }}>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {call.channelName}
              </div>
              {call.guildName && (
                <div style={{ fontSize: "0.75em", opacity: 0.6 }}>{call.guildName}</div>
              )}
            </div>
          </div>
        </PanelSectionRow>
        {others.length > 0 && (
          <PanelSectionRow>
            <ButtonItem layout="below" onClick={() => setMuteAll(!allMuted)}>
              <IconRow
                icon={allMuted ? <FaVolumeUp /> : <FaVolumeMute />}
                label={allMuted ? "Unmute All" : "Mute All"}
              />
            </ButtonItem>
          </PanelSectionRow>
        )}
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => leaveCall()}>
            Leave
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={`Members: ${call.members.length}`}>
        {call.members.map(member => (
          <PanelSectionRow key={member.id}>
            <ButtonItem
              layout="below"
              disabled={member.isSelf}
              onClick={() => onSelectMember(member)}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <IconRow
                  icon={<CircleIcon src={member.avatar} size={26} />}
                  label={member.name}
                  sublabel={member.isSelf ? "You" : undefined}
                />
                {member.muted && !member.isSelf && <FaVolumeMute style={{ opacity: 0.7, flexShrink: 0 }} />}
              </div>
            </ButtonItem>
          </PanelSectionRow>
        ))}
      </PanelSection>
    </>
  );
}

// ---- Per-member mute/volume (screenshot 5) ----

function MemberView({ member, onBack }: { member: Member; onBack: () => void }) {
  const [volume, setVolume] = useState(member.volume);
  const lastMemberId = useRef(member.id);

  if (lastMemberId.current !== member.id) {
    lastMemberId.current = member.id;
    setVolume(member.volume);
  }

  return (
    <>
      <PanelSection>
        <PanelSectionRow>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }}>
            <CircleIcon src={member.avatar} size={26} />
            <div style={{ fontWeight: 600 }}>{member.name}</div>
          </div>
        </PanelSectionRow>
        <BackRow onClick={onBack} />
      </PanelSection>
      <PanelSection>
        <PanelSectionRow>
          <ToggleField
            label="Mute"
            checked={member.muted}
            onChange={muted => setUserMute(member.id, muted)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField
            label="Volume"
            value={volume}
            min={0}
            max={200}
            step={5}
            showValue
            onChange={v => {
              setVolume(v);
              setUserVolume(member.id, v);
            }}
          />
        </PanelSectionRow>
      </PanelSection>
    </>
  );
}

// ---- Root ----

function Content() {
  const [state, setState] = useState<BridgeState>({ connected: false, call: null });
  const [nav, setNav] = useState<Nav>({ view: "root" });
  const lastCallChannel = useRef<string | null>(null);

  useEffect(() => {
    const listener = addEventListener<[BridgeState]>("discord_state", next => setState(next));
    getState().then(setState);
    return () => removeEventListener("discord_state", listener);
  }, []);

  // When a call starts or ends, snap back to the root view so the UI follows
  // the actual voice state.
  useEffect(() => {
    const channelId = state.call?.channelId ?? null;
    if (channelId !== lastCallChannel.current) {
      lastCallChannel.current = channelId;
      setNav({ view: "root" });
    }
  }, [state.call?.channelId]);

  if (!state.connected) {
    return (
      <PanelSection>
        <PanelSectionRow>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", opacity: 0.8 }}>
            <FaDiscord size={22} />
            <span>
              Waiting for Discord… Make sure Discord is running with the DeckVoiceBridge
              Vencord plugin enabled.
            </span>
          </div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  if (state.call) {
    if (nav.view === "member") {
      const member = state.call.members.find(m => m.id === nav.memberId);
      if (member) {
        return <MemberView member={member} onBack={() => setNav({ view: "root" })} />;
      }
      // Member left the call; fall through to the call view.
    }
    return (
      <InCallView
        state={state}
        onSelectMember={member => setNav({ view: "member", memberId: member.id })}
      />
    );
  }

  switch (nav.view) {
    case "dms":
      return <DMView onBack={() => setNav({ view: "root" })} />;
    case "guild":
      return <GuildView guild={nav.guild} onBack={() => setNav({ view: "root" })} />;
    default:
      return (
        <BrowseView
          onSelectDMs={() => setNav({ view: "dms" })}
          onSelectGuild={guild => setNav({ view: "guild", guild })}
        />
      );
  }
}

export default definePlugin(() => ({
  name: "Discord Voice",
  titleView: <div className={staticClasses.Title}>Discord Voice</div>,
  content: <Content />,
  icon: <FaHeadset />,
  onDismount() {}
}));
