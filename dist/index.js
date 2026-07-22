const manifest = {"name":"Discord Voice"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const callable = api.callable;
const addEventListener = api.addEventListener;
const removeEventListener = api.removeEventListener;
const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var attr = props.attr,
      size = props.size,
      title = props.title,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaDiscord (props) {
  return GenIcon({"attr":{"viewBox":"0 0 640 512"},"child":[{"tag":"path","attr":{"d":"M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"},"child":[]}]})(props);
}function FaVolumeUp (props) {
  return GenIcon({"attr":{"viewBox":"0 0 576 512"},"child":[{"tag":"path","attr":{"d":"M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zm233.32-51.08c-11.17-7.33-26.18-4.24-33.51 6.95-7.34 11.17-4.22 26.18 6.95 33.51 66.27 43.49 105.82 116.6 105.82 195.58 0 78.98-39.55 152.09-105.82 195.58-11.17 7.32-14.29 22.34-6.95 33.5 7.04 10.71 21.93 14.56 33.51 6.95C528.27 439.58 576 351.33 576 256S528.27 72.43 448.35 19.97zM480 256c0-63.53-32.06-121.94-85.77-156.24-11.19-7.14-26.03-3.82-33.12 7.46s-3.78 26.21 7.41 33.36C408.27 165.97 432 209.11 432 256s-23.73 90.03-63.48 115.42c-11.19 7.14-14.5 22.07-7.41 33.36 6.51 10.36 21.12 15.14 33.12 7.46C447.94 377.94 480 319.54 480 256zm-141.77-76.87c-11.58-6.33-26.19-2.16-32.61 9.45-6.39 11.61-2.16 26.2 9.45 32.61C327.98 228.28 336 241.63 336 256c0 14.38-8.02 27.72-20.92 34.81-11.61 6.41-15.84 21-9.45 32.61 6.43 11.66 21.05 15.8 32.61 9.45 28.23-15.55 45.77-45 45.77-76.88s-17.54-61.32-45.78-76.86z"},"child":[]}]})(props);
}function FaVolumeMute (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zM461.64 256l45.64-45.64c6.3-6.3 6.3-16.52 0-22.82l-22.82-22.82c-6.3-6.3-16.52-6.3-22.82 0L416 210.36l-45.64-45.64c-6.3-6.3-16.52-6.3-22.82 0l-22.82 22.82c-6.3 6.3-6.3 16.52 0 22.82L370.36 256l-45.63 45.63c-6.3 6.3-6.3 16.52 0 22.82l22.82 22.82c6.3 6.3 16.52 6.3 22.82 0L416 301.64l45.64 45.64c6.3 6.3 16.52 6.3 22.82 0l22.82-22.82c6.3-6.3 6.3-16.52 0-22.82L461.64 256z"},"child":[]}]})(props);
}function FaPhoneAlt (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M497.39 361.8l-112-48a24 24 0 0 0-28 6.9l-49.6 60.6A370.66 370.66 0 0 1 130.6 204.11l60.6-49.6a23.94 23.94 0 0 0 6.9-28l-48-112A24.16 24.16 0 0 0 122.6.61l-104 24A24 24 0 0 0 0 48c0 256.5 207.9 464 464 464a24 24 0 0 0 23.4-18.6l24-104a24.29 24.29 0 0 0-14.01-27.6z"},"child":[]}]})(props);
}function FaHeadset (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M192 208c0-17.67-14.33-32-32-32h-16c-35.35 0-64 28.65-64 64v48c0 35.35 28.65 64 64 64h16c17.67 0 32-14.33 32-32V208zm176 144c35.35 0 64-28.65 64-64v-48c0-35.35-28.65-64-64-64h-16c-17.67 0-32 14.33-32 32v112c0 17.67 14.33 32 32 32h16zM256 0C113.18 0 4.58 118.83 0 256v16c0 8.84 7.16 16 16 16h16c8.84 0 16-7.16 16-16v-16c0-114.69 93.31-208 208-208s208 93.31 208 208h-.12c.08 2.43.12 165.72.12 165.72 0 23.35-18.93 42.28-42.28 42.28H320c0-26.51-21.49-48-48-48h-32c-26.51 0-48 21.49-48 48s21.49 48 48 48h181.72c49.86 0 90.28-40.42 90.28-90.28V256C507.42 118.83 398.82 0 256 0z"},"child":[]}]})(props);
}function FaChevronLeft (props) {
  return GenIcon({"attr":{"viewBox":"0 0 320 512"},"child":[{"tag":"path","attr":{"d":"M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"},"child":[]}]})(props);
}

const getState = callable("get_state");
const listGuilds = callable("list_guilds");
const listDMs = callable("list_dms");
const listChannels = callable("list_channels");
const joinChannel = callable("join");
const leaveCall = callable("leave");
const setUserMute = callable("set_user_mute");
const setUserVolume = callable("set_user_volume");
const setMuteAll = callable("set_mute_all");

// ---- Small presentational pieces ----
function CircleIcon({ src, size = 28 }) {
    if (!src) {
        return (SP_JSX.jsx("div", { style: {
                width: size,
                height: size,
                borderRadius: "50%",
                background: "#5865F2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
            }, children: SP_JSX.jsx(FaDiscord, { size: size * 0.6, color: "#fff" }) }));
    }
    return (SP_JSX.jsx("img", { src: src, style: { width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 } }));
}
function IconRow({ icon, label, sublabel }) {
    return (SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }, children: [icon, SP_JSX.jsxs("div", { style: { minWidth: 0, textAlign: "left" }, children: [SP_JSX.jsx("div", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: label }), sublabel && (SP_JSX.jsx("div", { style: { fontSize: "0.75em", opacity: 0.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: sublabel }))] })] }));
}
/** First two avatars of channel occupants plus a "+N" style count bubble. */
function AvatarStack({ users }) {
    if (users.length === 0)
        return null;
    const shown = users.slice(0, 2);
    const overflow = users.length - shown.length;
    return (SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", flexShrink: 0 }, children: [shown.map((u, i) => (SP_JSX.jsx("img", { src: u.avatar, style: {
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginLeft: i === 0 ? 0 : -8,
                    border: "2px solid #23262e"
                } }, u.id))), overflow > 0 && (SP_JSX.jsx("div", { style: {
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
                }, children: overflow }))] }));
}
function BackRow({ onClick }) {
    return (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: onClick, children: SP_JSX.jsx(IconRow, { icon: SP_JSX.jsx(FaChevronLeft, {}), label: "Back" }) }) }));
}
// ---- Browse: DM entry + server list (screenshot 1) ----
function BrowseView({ onSelectDMs, onSelectGuild }) {
    const [guilds, setGuilds] = SP_REACT.useState(null);
    const [error, setError] = SP_REACT.useState(null);
    SP_REACT.useEffect(() => {
        listGuilds().then(res => {
            if (res.ok)
                setGuilds(res.data ?? []);
            else
                setError(res.error ?? "Failed to load servers");
        });
    }, []);
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: onSelectDMs, children: SP_JSX.jsx(IconRow, { icon: SP_JSX.jsx(FaPhoneAlt, {}), label: "Direct Voice Chats" }) }) }) }), SP_JSX.jsxs(DFL.PanelSection, { title: "Servers", children: [error && SP_JSX.jsx(DFL.PanelSectionRow, { children: error }), guilds === null && !error && SP_JSX.jsx(DFL.PanelSectionRow, { children: "Loading\u2026" }), guilds?.map(guild => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => onSelectGuild(guild), children: SP_JSX.jsx(IconRow, { icon: SP_JSX.jsx(CircleIcon, { src: guild.icon }), label: guild.name }) }) }, guild.id)))] })] }));
}
// ---- DM list ----
function DMView({ onBack }) {
    const [dms, setDMs] = SP_REACT.useState(null);
    const [error, setError] = SP_REACT.useState(null);
    SP_REACT.useEffect(() => {
        listDMs().then(res => {
            if (res.ok)
                setDMs(res.data ?? []);
            else
                setError(res.error ?? "Failed to load DMs");
        });
    }, []);
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(BackRow, { onClick: onBack }) }), SP_JSX.jsxs(DFL.PanelSection, { title: "Direct Voice Chats", children: [error && SP_JSX.jsx(DFL.PanelSectionRow, { children: error }), dms === null && !error && SP_JSX.jsx(DFL.PanelSectionRow, { children: "Loading\u2026" }), dms?.map(dm => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => joinChannel(dm.id), children: SP_JSX.jsx(IconRow, { icon: SP_JSX.jsx(CircleIcon, { src: dm.icon }), label: dm.name }) }) }, dm.id))), dms?.length === 0 && SP_JSX.jsx(DFL.PanelSectionRow, { children: "No direct messages found." })] })] }));
}
// ---- Server channel list, grouped by category (screenshots 2 & 3) ----
function GuildView({ guild, onBack }) {
    const [channels, setChannels] = SP_REACT.useState(null);
    const [error, setError] = SP_REACT.useState(null);
    SP_REACT.useEffect(() => {
        listChannels(guild.id).then(res => {
            if (res.ok)
                setChannels(res.data ?? []);
            else
                setError(res.error ?? "Failed to load channels");
        });
    }, [guild.id]);
    const groups = [];
    for (const channel of channels ?? []) {
        const last = groups[groups.length - 1];
        if (last && last.name === channel.category)
            last.channels.push(channel);
        else
            groups.push({ name: channel.category, channels: [channel] });
    }
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }, children: [SP_JSX.jsx(CircleIcon, { src: guild.icon, size: 24 }), SP_JSX.jsx("div", { style: { fontWeight: 600 }, children: guild.name })] }) }), SP_JSX.jsx(BackRow, { onClick: onBack })] }), error && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: error }) })), channels === null && !error && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: "Loading\u2026" }) })), groups.map((group, i) => (SP_JSX.jsx(DFL.PanelSection, { title: group.name ?? undefined, children: group.channels.map(channel => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => joinChannel(channel.id), children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }, children: [SP_JSX.jsx(IconRow, { icon: SP_JSX.jsx(FaVolumeUp, {}), label: channel.name }), SP_JSX.jsx(AvatarStack, { users: channel.users })] }) }) }, channel.id))) }, group.name ?? `group-${i}`))), channels?.length === 0 && (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: "No voice channels in this server." }) }))] }));
}
// ---- In-call view (screenshot 4) ----
function InCallView({ state, onSelectMember }) {
    const call = state.call;
    const others = call.members.filter(m => !m.isSelf);
    const allMuted = others.length > 0 && others.every(m => m.muted);
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: `Joined: 1`, children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "8px 10px",
                                border: "1px solid rgba(255,255,255,0.25)",
                                borderRadius: "6px"
                            }, children: [SP_JSX.jsx(CircleIcon, { src: call.icon, size: 26 }), SP_JSX.jsxs("div", { style: { minWidth: 0 }, children: [SP_JSX.jsx("div", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: call.channelName }), call.guildName && (SP_JSX.jsx("div", { style: { fontSize: "0.75em", opacity: 0.6 }, children: call.guildName }))] })] }) }), others.length > 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => setMuteAll(!allMuted), children: SP_JSX.jsx(IconRow, { icon: allMuted ? SP_JSX.jsx(FaVolumeUp, {}) : SP_JSX.jsx(FaVolumeMute, {}), label: allMuted ? "Unmute All" : "Mute All" }) }) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => leaveCall(), children: "Leave" }) })] }), SP_JSX.jsx(DFL.PanelSection, { title: `Members: ${call.members.length}`, children: call.members.map(member => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", disabled: member.isSelf, onClick: () => onSelectMember(member), children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }, children: [SP_JSX.jsx(IconRow, { icon: SP_JSX.jsx(CircleIcon, { src: member.avatar, size: 26 }), label: member.name, sublabel: member.isSelf ? "You" : undefined }), member.muted && !member.isSelf && SP_JSX.jsx(FaVolumeMute, { style: { opacity: 0.7, flexShrink: 0 } })] }) }) }, member.id))) })] }));
}
// ---- Per-member mute/volume (screenshot 5) ----
function MemberView({ member, onBack }) {
    const [volume, setVolume] = SP_REACT.useState(member.volume);
    const lastMemberId = SP_REACT.useRef(member.id);
    if (lastMemberId.current !== member.id) {
        lastMemberId.current = member.id;
        setVolume(member.volume);
    }
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }, children: [SP_JSX.jsx(CircleIcon, { src: member.avatar, size: 26 }), SP_JSX.jsx("div", { style: { fontWeight: 600 }, children: member.name })] }) }), SP_JSX.jsx(BackRow, { onClick: onBack })] }), SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Mute", checked: member.muted, onChange: muted => setUserMute(member.id, muted) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Volume", value: volume, min: 0, max: 200, step: 5, showValue: true, onChange: v => {
                                setVolume(v);
                                setUserVolume(member.id, v);
                            } }) })] })] }));
}
// ---- Root ----
function Content() {
    const [state, setState] = SP_REACT.useState({ connected: false, call: null });
    const [nav, setNav] = SP_REACT.useState({ view: "root" });
    const lastCallChannel = SP_REACT.useRef(null);
    SP_REACT.useEffect(() => {
        const listener = addEventListener("discord_state", next => setState(next));
        getState().then(setState);
        return () => removeEventListener("discord_state", listener);
    }, []);
    // When a call starts or ends, snap back to the root view so the UI follows
    // the actual voice state.
    SP_REACT.useEffect(() => {
        const channelId = state.call?.channelId ?? null;
        if (channelId !== lastCallChannel.current) {
            lastCallChannel.current = channelId;
            setNav({ view: "root" });
        }
    }, [state.call?.channelId]);
    if (!state.connected) {
        return (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px", opacity: 0.8 }, children: [SP_JSX.jsx(FaDiscord, { size: 22 }), SP_JSX.jsx("span", { children: "Waiting for Discord\u2026 Make sure Discord is running with the DeckVoiceBridge Vencord plugin enabled." })] }) }) }));
    }
    if (state.call) {
        if (nav.view === "member") {
            const member = state.call.members.find(m => m.id === nav.memberId);
            if (member) {
                return SP_JSX.jsx(MemberView, { member: member, onBack: () => setNav({ view: "root" }) });
            }
            // Member left the call; fall through to the call view.
        }
        return (SP_JSX.jsx(InCallView, { state: state, onSelectMember: member => setNav({ view: "member", memberId: member.id }) }));
    }
    switch (nav.view) {
        case "dms":
            return SP_JSX.jsx(DMView, { onBack: () => setNav({ view: "root" }) });
        case "guild":
            return SP_JSX.jsx(GuildView, { guild: nav.guild, onBack: () => setNav({ view: "root" }) });
        default:
            return (SP_JSX.jsx(BrowseView, { onSelectDMs: () => setNav({ view: "dms" }), onSelectGuild: guild => setNav({ view: "guild", guild }) }));
    }
}
var index = definePlugin(() => ({
    name: "Discord Voice",
    titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "Discord Voice" }),
    content: SP_JSX.jsx(Content, {}),
    icon: SP_JSX.jsx(FaHeadset, {}),
    onDismount() { }
}));

export { index as default };
//# sourceMappingURL=index.js.map
