"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Icon, { type IconName } from "~/components/icon";
import DoodleModal from "~/components/doodle-modal";
import BuzzRoom from "~/components/buzz-room";
import CommandPalette from "~/components/command-palette";
import Drawer from "~/components/drawer";
import {
  ME,
  autoReplies,
  memberById,
  members,
  quickEmoji,
  seedChannels,
  type Channel,
  type Member,
  type Message,
  type Reaction,
} from "~/lib/data";
import { isAmbienceEnabled, playSound, startAmbience, stopAmbience, unlockAudio } from "~/lib/sound";
import { cn, nowLabel, renderInline, shrinkDataUrl, uid } from "~/lib/utils";

const meMember: Member = {
  id: ME,
  name: "You",
  role: "Instructor",
  hue: 262,
  online: true,
  vibe: "just arrived",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function Avatar({
  member,
  large,
}: {
  member: Member;
  large?: boolean;
}) {
  return (
    <span
      className={cn(
        "orb",
        large && "orb--lg",
        !member.online && "orb--offline",
      )}
      style={{ ["--h" as string]: member.hue }}
      title={member.name}
    >
      {initials(member.name)}
    </span>
  );
}

function ReactionChip({
  reaction,
  mine,
  onToggle,
}: {
  reaction: Reaction;
  mine: boolean;
  onToggle: () => void;
}) {
  const [bursts, setBursts] = useState<
    { id: number; bx: number; by: number }[]
  >([]);

  const fire = () => {
    const id = Date.now() + Math.random();
    const bx = (Math.random() - 0.5) * 34;
    const by = -12 - Math.random() * 18;
    setBursts((b) => [...b, { id, bx, by }]);
    window.setTimeout(
      () => setBursts((b) => b.filter((item) => item.id !== id)),
      640,
    );
    onToggle();
  };

  return (
    <button
      className={cn("reaction", mine && "is-mine")}
      onClick={fire}
      aria-pressed={mine}
      aria-label={`${reaction.emoji} ${reaction.by.length}`}
    >
      <span>{reaction.emoji}</span>
      <span className="reaction__count">{reaction.by.length}</span>
      {bursts.map((b) => (
        <i
          key={b.id}
          className="burst"
          style={{ ["--bx" as string]: `${b.bx}px`, ["--by" as string]: `${b.by}px` }}
        />
      ))}
    </button>
  );
}

function MessageRow({
  message,
  onReact,
  onDoodle,
  onCopy,
  onThread,
}: {
  message: Message;
  onReact: (emoji: string) => void;
  onDoodle: () => void;
  onCopy: (text: string) => void;
  onThread: () => void;
}) {
  if (message.system) {
    return (
      <div className="msg msg--system">
        <span>{message.body}</span>
      </div>
    );
  }

  const author =
    message.authorId === ME ? meMember : memberById(message.authorId);

  return (
    <article className="msg">
      <Avatar member={author} />
      <div style={{ minWidth: 0 }}>
        <div className="msg__head">
          <span className="msg__name">{author.name}</span>
          {author.bot && <span className="msg__role">agent</span>}
          {author.id === ME && <span className="msg__role">you</span>}
          <span className="msg__time">{message.time}</span>
        </div>

        {message.body && (
          <div
            className="msg__body"
            dangerouslySetInnerHTML={{ __html: renderInline(message.body) }}
          />
        )}

        {message.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="msg__img" src={message.image} alt="A silk doodle" />
        )}

        {message.reactions.length > 0 && (
          <div className="reactions">
            {message.reactions.map((reaction) => (
              <ReactionChip
                key={reaction.emoji}
                reaction={reaction}
                mine={reaction.by.includes(ME)}
                onToggle={() => onReact(reaction.emoji)}
              />
            ))}
          </div>
        )}

        {message.replies && message.replies.length > 0 && (
          <button className="thread-link" onClick={onThread}>
            <Icon name="thread" size={12} />
            {message.replies.length}{" "}
            {message.replies.length === 1 ? "reply" : "replies"}
            <span>View thread</span>
          </button>
        )}
      </div>

      <div className="msg__actions">
        <button title="React with 💜" onClick={() => onReact("💜")}>
          💜
        </button>
        <button title="Reply in thread" onClick={onThread}>
          <Icon name="thread" size={13} />
        </button>
        <button title="Doodle back" onClick={onDoodle}>
          <Icon name="pen" size={13} />
        </button>
        <button
          title="Copy text"
          onClick={() => onCopy(message.body)}
          aria-label="Copy message text"
        >
          <Icon name="paperclip" size={13} />
        </button>
      </div>
    </article>
  );
}

export default function StudioApp() {
  const [channels, setChannels] = useState<Channel[]>(seedChannels);
  const [activeId, setActiveId] = useState("cohort-4");
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [sound, setSound] = useState(false);
  const [typing, setTyping] = useState<{
    channelId: string;
    memberId: string;
  } | null>(null);
  const [buzz, setBuzz] = useState(false);
  const [doodle, setDoodle] = useState(false);
  const [palette, setPalette] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [panel, setPanel] = useState<
    "threads" | "files" | "agents" | "notifications" | "settings" | null
  >(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threadDraft, setThreadDraft] = useState("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [agentDraft, setAgentDraft] = useState("");
  const [agentLog, setAgentLog] = useState<
    { id: string; from: "you" | "telex"; body: string }[]
  >([
    {
      id: "hello",
      from: "telex",
      body: "Hi — I'm Telex. I can summarise threads, find resources, or tell you what's due. What do you need?",
    },
  ]);

  const soundRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);
  const toastTimer = useRef<number | undefined>(undefined);

  const active = channels.find((c) => c.id === activeId) ?? channels[0];

  /* ---------------- persistence ---------------- */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("zedu-whimsical-v1");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          channels?: Channel[];
          sound?: boolean;
          activeId?: string;
        };
        if (Array.isArray(parsed.channels) && parsed.channels.length) {
          setChannels(parsed.channels);
        }
        if (typeof parsed.sound === "boolean") {
          setSound(parsed.sound);
          soundRef.current = parsed.sound;
        }
        if (parsed.activeId) setActiveId(parsed.activeId);
      }
      const globalSound = window.localStorage.getItem("zedu-sound");
      if (globalSound === "off") {
        setSound(false);
        soundRef.current = false;
      } else if (globalSound === "on" || isAmbienceEnabled()) {
        setSound(true);
        soundRef.current = true;
      }
    } catch {
      /* a corrupt little world is still a world */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        "zedu-whimsical-v1",
        JSON.stringify({ channels, sound, activeId }),
      );
    } catch {
      /* quota can only be so big */
    }
  }, [channels, sound, activeId, hydrated]);

  /* ---------------- helpers ---------------- */
  const notify = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  }, []);

  const append = useCallback((channelId: string, message: Message) => {
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === channelId
          ? { ...channel, messages: [...channel.messages, message] }
          : channel,
      ),
    );
  }, []);

  const go = useCallback((id: string) => {
    setActiveId(id);
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === id ? { ...channel, unread: 0 } : channel,
      ),
    );
  }, []);

  const toggleSound = useCallback(() => {
    unlockAudio();
    const next = !soundRef.current;
    soundRef.current = next;
    setSound(next);
    window.localStorage.setItem("zedu-sound", next ? "on" : "off");
    if (next) startAmbience();
    else stopAmbience();
    playSound("open", next);
    notify(next ? "Sound on - the room has a voice" : "Sound off - silent running");
  }, [notify]);

  useEffect(() => {
    if (!hydrated || !sound) return;
    const begin = () => {
      if (!soundRef.current) return;
      unlockAudio();
      startAmbience();
    };
    window.addEventListener("pointerdown", begin, { once: true });
    window.addEventListener("keydown", begin, { once: true });
    return () => {
      window.removeEventListener("pointerdown", begin);
      window.removeEventListener("keydown", begin);
    };
  }, [hydrated, sound]);

  const queueReply = useCallback(
    (channelId: string) => {
      const pick =
        autoReplies[Math.floor(Math.random() * autoReplies.length)] ??
        autoReplies[0];

      const first = window.setTimeout(() => {
        setTyping({ channelId, memberId: pick.authorId });
        const second = window.setTimeout(
          () => {
            setTyping((current) =>
              current &&
              current.channelId === channelId &&
              current.memberId === pick.authorId
                ? null
                : current,
            );
            append(channelId, {
              id: uid(),
              authorId: pick.authorId,
              body: pick.body,
              time: nowLabel(),
              reactions: [],
            });
            playSound("receive", soundRef.current);
          },
          1300 + Math.random() * 700,
        );
        timers.current.push(second);
      }, 750 + Math.random() * 750);

      timers.current.push(first);
    },
    [append],
  );

  const submit = useCallback(() => {
    const text = draft.trim();
    if (!text && !attachment) return;

    append(active.id, {
      id: uid(),
      authorId: ME,
      body: text,
      time: nowLabel(),
      reactions: [],
      image: attachment ?? undefined,
    });

    playSound("send", soundRef.current);
    setDraft("");
    setAttachment(null);
    setEmojiOpen(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
    queueReply(active.id);
  }, [active.id, append, attachment, draft, queueReply]);

  const react = useCallback(
    (messageId: string, emoji: string) => {
      setChannels((prev) =>
        prev.map((channel) => {
          if (channel.id !== active.id) return channel;
          return {
            ...channel,
            messages: channel.messages.map((message) => {
              if (message.id !== messageId) return message;
              const index = message.reactions.findIndex(
                (r) => r.emoji === emoji,
              );
              let reactions: Reaction[];

              if (index === -1) {
                reactions = [...message.reactions, { emoji, by: [ME] }];
              } else {
                const existing = message.reactions[index];
                const mine = existing.by.includes(ME);
                const by = mine
                  ? existing.by.filter((id) => id !== ME)
                  : [...existing.by, ME];
                reactions = by.length
                  ? message.reactions.map((r, i) =>
                      i === index ? { ...r, by } : r,
                    )
                  : message.reactions.filter((_, i) => i !== index);
              }

              return { ...message, reactions };
            }),
          };
        }),
      );
      playSound("react", soundRef.current);
    },
    [active.id],
  );

  const createChannel = useCallback(() => {
    const suffix = Date.now().toString(36).slice(-4);
    const id = `channel-${suffix}`;
    const channel: Channel = {
      id,
      name: `new-channel-${suffix}`,
      emoji: "✦",
      topic: "A brand new channel. Say something and it becomes real.",
      unread: 0,
      messages: [
        {
          id: uid("sys"),
          authorId: "telex",
          body: "Channel created. Awkward silence is traditional — go on, break it.",
          time: nowLabel(),
          reactions: [],
          system: true,
        },
      ],
    };
    setChannels((prev) => [...prev, channel]);
    setActiveId(id);
    notify("Channel created ✦");
  }, [notify]);

  const copyInvite = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Invite link copied — it only works on your machine, mind");
    } catch {
      notify("The clipboard said no. Rude.");
    }
  }, [notify]);

  const openThread = useCallback((id: string) => {
    setThreadId(id);
    setPanel("threads");
    playSound("open", soundRef.current);
  }, []);

  const sendThreadReply = useCallback(() => {
    const body = threadDraft.trim();
    if (!threadId || !body) return;
    setChannels((prev) =>
      prev.map((channel) => ({
        ...channel,
        messages: channel.messages.map((message) =>
          message.id === threadId
            ? {
                ...message,
                replies: [
                  ...(message.replies ?? []),
                  {
                    id: uid("r"),
                    authorId: ME,
                    body,
                    time: nowLabel(),
                    reactions: [],
                  },
                ],
              }
            : message,
        ),
      })),
    );
    setThreadDraft("");
    playSound("send", soundRef.current);
    notify("Reply added to the thread");
  }, [notify, threadDraft, threadId]);

  const sendAgent = useCallback((text: string) => {
    const body = text.trim();
    if (!body) return;
    setAgentLog((log) => [...log, { id: uid("q"), from: "you", body }]);
    setAgentDraft("");

    const reply = /due|deadline|friday/i.test(body)
      ? "Week 3 project is due Friday at 11:59 PM. The checklist is pinned in #resources."
      : /summar|recap|thread/i.test(body)
        ? "This week: state should live at the lowest common ancestor, the Week 3 project is due Friday, and Thursday's live class covers accessible interfaces."
        : /resource|repo|link|slide/i.test(body)
          ? "Pinned in #resources: the Week 3 project brief, the starter repo, and the State & accessibility slides."
          : "I've noted that. I can also summarise a thread or pull the latest resources into one reply.";

    const timer = window.setTimeout(() => {
      setAgentLog((log) => [
        ...log,
        { id: uid("a"), from: "telex", body: reply },
      ]);
      playSound("receive", soundRef.current);
    }, 850);
    timers.current.push(timer);
  }, []);

  const markAllRead = useCallback(() => {
    setChannels((prev) => prev.map((channel) => ({ ...channel, unread: 0 })));
    notify("Everything marked as read");
  }, [notify]);

  const resetDemo = useCallback(() => {
    try {
      window.localStorage.removeItem("zedu-whimsical-v1");
    } catch {
      /* nothing to clear */
    }
    window.location.reload();
  }, []);

  const onFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Images only, for now");
      playSound("error", soundRef.current);
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const small = await shrinkDataUrl(String(reader.result), 900, 0.72);
      setAttachment(small);
      notify("Attached — press send");
    };
    reader.readAsDataURL(file);
  };

  /* ---------------- effects ---------------- */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active.id, active.messages.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette((open) => !open);
        playSound("open", soundRef.current);
      }
      if (event.key === "Escape") {
        setPalette(false);
        setDoodle(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const lastDoodle = useMemo(() => {
    for (let c = channels.length - 1; c >= 0; c -= 1) {
      const channel = channels[c];
      for (let m = channel.messages.length - 1; m >= 0; m -= 1) {
        const message = channel.messages[m];
        if (message.image) return message.image;
      }
    }
    return null;
  }, [channels]);

  const threadTarget = useMemo(() => {
    if (!threadId) return null;
    for (const channel of channels) {
      const message = channel.messages.find((item) => item.id === threadId);
      if (message) return { channel, message };
    }
    return null;
  }, [channels, threadId]);

  const files = useMemo(() => {
    const out: {
      id: string;
      image: string;
      channel: string;
      author: string;
      time: string;
    }[] = [];
    channels.forEach((channel) =>
      channel.messages.forEach((message) => {
        if (message.image) {
          out.push({
            id: message.id,
            image: message.image,
            channel: channel.name,
            author: memberById(message.authorId).name,
            time: message.time,
          });
        }
      }),
    );
    return out.reverse();
  }, [channels]);

  const unreadTotal = channels.reduce((sum, c) => sum + c.unread, 0);

  const paletteActions = [
    {
      id: "buzz",
      label: "Start a Buzz session",
      hint: "a live class with presence orbs",
      icon: "phone" as IconName,
      run: () => setBuzz(true),
    },
    {
      id: "doodle",
      label: "Open the doodle canvas",
      hint: "paint something, send it to the room",
      icon: "pen" as IconName,
      run: () => setDoodle(true),
    },
    {
      id: "sound",
      label: sound ? "Mute interface sound" : "Enable interface sound",
      hint: "synthesised, not sampled",
      icon: (sound ? "sound-on" : "sound-off") as IconName,
      run: toggleSound,
    },
    {
      id: "new",
      label: "Create a new channel",
      hint: "a fresh space for the next cohort",
      icon: "plus" as IconName,
      run: createChannel,
    },
    {
      id: "invite",
      label: "Copy invite link",
      hint: "it's a demo link, but still",
      icon: "shield" as IconName,
      run: copyInvite,
    },
  ];

  const online = members.filter((m) => m.online);

  return (
    <div className="studio">
      <div className="grain" aria-hidden />

      {/* ------------------------------- rail */}
      <aside className="rail" aria-label="Workspace">
        <Link
          href="/"
          className="rail__logo"
          aria-label="Back to the stage"
          title="Back to the stage"
        />

        <nav className="rail__nav">
          <Link href="/" className="rail__btn" title="Home" aria-label="Home">
            <Icon name="grid" />
          </Link>
          <button className="rail__btn is-active" title="Channels" aria-current>
            <Icon name="chat" />
          </button>
          <button
            className="rail__btn"
            title="Threads"
            onClick={() => setPanel("threads")}
          >
            <Icon name="thread" />
          </button>
          <button
            className="rail__btn"
            title="Files"
            onClick={() => setPanel("files")}
          >
            <Icon name="folder" />
          </button>
          <button
            className="rail__btn"
            title="Agents"
            onClick={() => setPanel("agents")}
          >
            <Icon name="spark" />
          </button>
          <button
            className="rail__btn"
            title="Buzz"
            onClick={() => setBuzz(true)}
          >
            <Icon name="phone" />
          </button>
        </nav>

        <div className="rail__spacer" />

        <button
          className={cn("rail__btn", panel === "notifications" && "is-on")}
          title="Notifications"
          onClick={() =>
            setPanel(panel === "notifications" ? null : "notifications")
          }
        >
          <Icon name="bell" />
          {unreadTotal > 0 && <span className="rail__badge">{unreadTotal}</span>}
        </button>

        <button
          className={cn("rail__btn", panel === "settings" && "is-on")}
          title="Settings"
          onClick={() => setPanel(panel === "settings" ? null : "settings")}
        >
          <Icon name="gear" />
        </button>

        <button
          className={cn("rail__btn", sound && "is-on")}
          onClick={toggleSound}
          title={sound ? "Sound on" : "Sound off"}
          aria-label={sound ? "Turn sound off" : "Turn sound on"}
          aria-pressed={sound}
        >
          <Icon name={sound ? "sound-on" : "sound-off"} />
        </button>

        <button
          className="rail__btn"
          onClick={() => setPalette(true)}
          title="Command palette (⌘K)"
          aria-label="Open command palette"
        >
          <Icon name="command" />
        </button>

        <button
          className="rail__avatar"
          style={{
            background:
              "radial-gradient(circle at 32% 28%, #c9b8ff, transparent 45%), linear-gradient(150deg, #8b5cf6, #4c1fd1)",
          }}
          title="You — Instructor"
          aria-label="Your profile"
          onClick={() => notify("You. Instructor. Currently delightful.")}
        />
      </aside>

      {/* ------------------------------- sidebar */}
      <aside className="sidebar" aria-label="Channels">
        <div className="ws">
          <span
            className="orb orb--lg"
            style={{ ["--h" as string]: 276 }}
            aria-hidden
          >
            Z
          </span>
          <div className="ws__meta">
            <div className="ws__name">
              {process.env.NEXT_PUBLIC_WORKSPACE_NAME ?? "Zedu"}
            </div>
            <div className="ws__sub">
              {members.length} members · {online.length} here
            </div>
          </div>
          <button
            className="icon-btn"
            onClick={createChannel}
            title="New room"
            aria-label="Create a new room"
          >
            <Icon name="plus" size={16} />
          </button>
        </div>

        <button className="searchbtn" onClick={() => setPalette(true)}>
          <Icon name="search" size={14} />
          <span style={{ flex: 1, textAlign: "left" }}>Search or jump to…</span>
          <kbd>⌘K</kbd>
        </button>

        <div className="side__scroll">
          <div className="side__group">
            <div className="side__label">
              Channels
              <button onClick={createChannel} aria-label="New channel">
                +
              </button>
            </div>
            {channels
              .filter((channel) => !channel.dm)
              .map((channel) => (
                <button
                  key={channel.id}
                  className={cn(
                    "chan",
                    channel.id === active.id && "is-active",
                  )}
                  onClick={() => go(channel.id)}
                >
                  <span className="chan__hash">#</span>
                  <span className="chan__name">{channel.name}</span>
                  {channel.unread > 0 && channel.id !== active.id && (
                    <span className="chan__badge">{channel.unread}</span>
                  )}
                </button>
              ))}
          </div>

          <div className="side__group">
            <div className="side__label">Direct messages</div>
            {channels
              .filter((channel) => channel.dm)
              .map((channel) => (
                <button
                  key={channel.id}
                  className={cn(
                    "chan",
                    channel.id === active.id && "is-active",
                  )}
                  onClick={() => go(channel.id)}
                >
                  <span className="chan__hash">@</span>
                  <span className="chan__name">{channel.name}</span>
                  {channel.unread > 0 && channel.id !== active.id && (
                    <span className="chan__badge">{channel.unread}</span>
                  )}
                </button>
              ))}
          </div>

          <div className="side__group">
            <div className="side__label">Here now</div>
            {online.map((member) => (
              <button
                key={member.id}
                className="member"
                onClick={() => notify(`${member.name} is ${member.vibe}.`)}
              >
                <Avatar member={member} />
                <span className="member__meta">
                  <span className="member__name">{member.name}</span>
                  <span className="member__vibe">{member.vibe}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: 12,
            borderTop: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            className="orb"
            style={{
              ["--h" as string]: 262,
              background:
                "radial-gradient(circle at 32% 28%, #c9b8ff, transparent 45%), linear-gradient(150deg, #8b5cf6, #4c1fd1)",
            }}
          >
            Y
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>You</div>
            <div style={{ fontSize: 10.5, color: "var(--dimmer)" }}>
              Instructor · here
            </div>
          </div>
          <button
            className="icon-btn"
            onClick={toggleSound}
            aria-label="Toggle sound"
            title="Toggle sound"
          >
            <Icon name={sound ? "sound-on" : "sound-off"} size={15} />
          </button>
        </div>
      </aside>

      {/* ------------------------------- chat */}
      <main className="chat">
        <header className="chat__head">
          <div className="chat__title">
            <h1>{active.dm ? active.name : `# ${active.name}`}</h1>
            <span className="chat__topic">{active.topic}</span>
          </div>

          <div className="chat__actions">
            <div className="facepile" aria-hidden>
              {online.slice(0, 3).map((member) => (
                <Avatar key={member.id} member={member} />
              ))}
            </div>
            <button
              className="icon-btn mobile-only"
              onClick={() => setPalette(true)}
              aria-label="Search"
            >
              <Icon name="search" size={17} />
            </button>
            <button
              className="icon-btn"
              onClick={() => setDoodle(true)}
              title="Doodle something"
              aria-label="Open doodle canvas"
            >
              <Icon name="pen" size={17} />
            </button>
            <button className="btn btn--sm btn--primary" onClick={() => setBuzz(true)}>
              <Icon name="phone" size={14} /> Buzz
            </button>
          </div>
        </header>

        <div className="chat__scroll" ref={scrollRef}>
          <div className="chat__spacer" aria-hidden />

          <div className="chat__intro">
            <h2>
              {active.dm ? active.name : `This is the start of #${active.name}`}
            </h2>
            <p>{active.topic}</p>
          </div>

          {active.messages.map((message) => (
            <MessageRow
              key={message.id}
              message={message}
              onReact={(emoji) => react(message.id, emoji)}
              onDoodle={() => setDoodle(true)}
              onThread={() => openThread(message.id)}
              onCopy={async (text) => {
                try {
                  await navigator.clipboard.writeText(text);
                  notify("Copied to your clipboard");
                } catch {
                  notify("Copy failed — select it by hand");
                }
              }}
            />
          ))}

          {typing && typing.channelId === active.id && (
            <div className="typing">
              <span className="typing__dots">
                <i />
                <i />
                <i />
              </span>
              {memberById(typing.memberId).name.split(" ")[0]} is weaving a
              reply…
            </div>
          )}
        </div>

        <div className="composer">
          {attachment && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
                padding: 8,
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "rgba(255,255,255,0.03)",
                width: "fit-content",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachment}
                alt="Attachment preview"
                style={{ width: 54, height: 40, objectFit: "cover", borderRadius: 8 }}
              />
              <span style={{ fontSize: 11.5, color: "var(--dim)" }}>
                ready to send
              </span>
              <button
                className="icon-btn"
                onClick={() => setAttachment(null)}
                aria-label="Remove attachment"
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          )}

          <div className="composer__box">
            {emojiOpen && (
              <div className="emoji-row">
                {quickEmoji.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setDraft((current) => current + emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              className="composer__input"
              rows={1}
              value={draft}
              placeholder={`Message ${active.dm ? active.name : `#${active.name}`}…`}
              onChange={(event) => {
                setDraft(event.target.value);
                const el = textareaRef.current;
                if (el) {
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
            />

            <div className="composer__tools">
              <button
                className="icon-btn"
                onClick={() => fileRef.current?.click()}
                title="Attach an image"
                aria-label="Attach an image"
              >
                <Icon name="paperclip" size={16} />
              </button>
              <button
                className="icon-btn"
                onClick={() => setDoodle(true)}
                title="Doodle instead"
                aria-label="Doodle instead"
              >
                <Icon name="pen" size={16} />
              </button>
              <button
                className={cn("icon-btn", emojiOpen && "is-on")}
                onClick={() => setEmojiOpen((open) => !open)}
                title="Emoji"
                aria-label="Emoji"
                aria-pressed={emojiOpen}
              >
                <Icon name="smile" size={16} />
              </button>

              <div className="composer__spacer" />
              <span className="composer__hint">enter to send</span>
              <button
                className="send"
                onClick={submit}
                disabled={!draft.trim() && !attachment}
              >
                Send <Icon name="send" size={13} />
              </button>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              onFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>
      </main>

      {/* ------------------------------- right panel */}
      <aside className="now" aria-label="Room details">
        <section className="now__section">
          <h3>In the room</h3>
          {online.map((member) => (
            <button
              key={member.id}
              className="member"
              onClick={() => setBuzz(true)}
            >
              <Avatar member={member} />
              <span className="member__meta">
                <span className="member__name">{member.name}</span>
                <span className="member__vibe">{member.vibe}</span>
              </span>
            </button>
          ))}
          <button className="orb-link" onClick={() => setBuzz(true)}>
            join the buzz →
          </button>
        </section>

        <section className="now__section">
          <h3>Today&apos;s session</h3>
          <div className="now__card">
            <p>Building accessible interfaces.</p>
            <span>Thu · 5:00 PM WAT · with Amara</span>
          </div>
          <button
            className="btn btn--sm btn--ghost"
            style={{ marginTop: 10, width: "100%" }}
            onClick={() => setBuzz(true)}
          >
            <Icon name="phone" size={13} /> Join Buzz
          </button>
        </section>

        <section className="now__section">
          <h3>Latest doodle</h3>
          {lastDoodle ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="msg__img"
              src={lastDoodle}
              alt="The most recent doodle"
              style={{ maxWidth: "100%" }}
            />
          ) : (
            <div className="now__card">
              <p style={{ fontSize: 16 }}>Nothing yet.</p>
              <span>Open the canvas and leave a mark.</span>
            </div>
          )}
          <button
            className="btn btn--sm btn--ghost"
            style={{ marginTop: 10, width: "100%" }}
            onClick={() => setDoodle(true)}
          >
            <Icon name="pen" size={13} /> Doodle
          </button>
        </section>

        <section className="now__section">
          <h3>Shortcuts</h3>
          <div className="now__card" style={{ display: "grid", gap: 8 }}>
            <span style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Command palette</span>
              <span className="mono">⌘K</span>
            </span>
            <span style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Send message</span>
              <span className="mono">↵</span>
            </span>
            <span style={{ display: "flex", justifyContent: "space-between" }}>
              <span>New line</span>
              <span className="mono">⇧↵</span>
            </span>
          </div>
        </section>
      </aside>

      {/* ------------------------------- overlays */}
      {palette && (
        <CommandPalette
          channels={channels}
          actions={paletteActions}
          onClose={() => setPalette(false)}
          onGo={go}
        />
      )}

      {doodle && (
        <DoodleModal
          channelName={active.name}
          onClose={() => setDoodle(false)}
          onSend={(image) => {
            setDoodle(false);
            append(active.id, {
              id: uid(),
              authorId: ME,
              body: "a doodle, fresh from the canvas",
              time: nowLabel(),
              reactions: [],
              image,
            });
            playSound("send", soundRef.current);
            queueReply(active.id);
            notify("Doodle sent — it's beautiful");
          }}
        />
      )}

      {buzz && (
        <BuzzRoom
          channelName={active.name}
          sound={sound}
          onToggleSound={toggleSound}
          onLeave={() => {
            setBuzz(false);
            playSound("leave", soundRef.current);
            notify("You left the Buzz. The orbs will cope.");
          }}
        />
      )}

      {panel && (
        <Drawer
          title={
            panel === "threads"
              ? "Threads"
              : panel === "files"
                ? "Files"
                : panel === "agents"
                  ? "Agents"
                  : panel === "notifications"
                    ? "Notifications"
                    : "Settings"
          }
          subtitle={
            panel === "threads"
              ? "Pull a conversation out of the channel."
              : panel === "files"
                ? `${files.length} ${files.length === 1 ? "file" : "files"} in this workspace`
                : panel === "agents"
                  ? "Telex · AI agent for this workspace"
                  : panel === "notifications"
                    ? unreadTotal > 0
                      ? `${unreadTotal} unread`
                      : "All caught up"
                    : "Make the room yours."
          }
          onClose={() => setPanel(null)}
          footer={
            panel === "threads" && threadTarget ? (
              <div className="drawer__composer">
                <input
                  value={threadDraft}
                  onChange={(event) => setThreadDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      sendThreadReply();
                    }
                  }}
                  placeholder={`Reply in thread…`}
                  aria-label="Reply in thread"
                />
                <button
                  className="send"
                  onClick={sendThreadReply}
                  disabled={!threadDraft.trim()}
                  aria-label="Send reply"
                >
                  <Icon name="send" size={14} />
                </button>
              </div>
            ) : panel === "agents" ? (
              <div className="drawer__composer">
                <input
                  value={agentDraft}
                  onChange={(event) => setAgentDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      sendAgent(agentDraft);
                    }
                  }}
                  placeholder="Ask Telex anything…"
                  aria-label="Ask Telex"
                />
                <button
                  className="send"
                  onClick={() => sendAgent(agentDraft)}
                  disabled={!agentDraft.trim()}
                  aria-label="Send to Telex"
                >
                  <Icon name="send" size={14} />
                </button>
              </div>
            ) : panel === "notifications" ? (
              <button
                className="btn btn--ghost"
                style={{ width: "100%" }}
                onClick={markAllRead}
              >
                Mark all as read
              </button>
            ) : undefined
          }
        >
          {panel === "threads" &&
            (threadTarget ? (
              <div className="thread">
                <p className="thread__channel mono">
                  #{threadTarget.channel.name}
                </p>
                <article className="thread__parent">
                  <Avatar member={memberById(threadTarget.message.authorId)} />
                  <div>
                    <header>
                      <b>{memberById(threadTarget.message.authorId).name}</b>
                      <span className="mono">{threadTarget.message.time}</span>
                    </header>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: renderInline(threadTarget.message.body),
                      }}
                    />
                  </div>
                </article>

                <div className="thread__replies">
                  {(threadTarget.message.replies ?? []).map((reply) => (
                    <article className="thread__reply" key={reply.id}>
                      <Avatar member={memberById(reply.authorId)} />
                      <div>
                        <header>
                          <b>{memberById(reply.authorId).name}</b>
                          <span className="mono">{reply.time}</span>
                        </header>
                        <p
                          dangerouslySetInnerHTML={{
                            __html: renderInline(reply.body),
                          }}
                        />
                      </div>
                    </article>
                  ))}
                  {(threadTarget.message.replies ?? []).length === 0 && (
                    <p className="drawer__hint">
                      No replies yet. Be the first to pull this thread apart.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="thread__list">
                {channels
                  .flatMap((channel) =>
                    channel.messages
                      .filter((message) => (message.replies ?? []).length > 0)
                      .map((message) => ({ channel, message })),
                  )
                  .map(({ channel, message }) => (
                    <button
                      className="thread__row"
                      key={message.id}
                      onClick={() => setThreadId(message.id)}
                    >
                      <span className="mono">#{channel.name}</span>
                      <b>
                        {memberById(message.authorId).name.split(" ")[0]}:{" "}
                        {message.body.slice(0, 60)}
                      </b>
                      <span className="thread__count">
                        {(message.replies ?? []).length} replies →
                      </span>
                    </button>
                  ))}
                {channels.every((channel) =>
                  channel.messages.every(
                    (message) => (message.replies ?? []).length === 0,
                  ),
                ) && (
                  <p className="drawer__hint">
                    No threads yet. Hover a message and tap the thread icon to
                    start one.
                  </p>
                )}
              </div>
            ))}

          {panel === "files" && (
            <>
              {files.length === 0 ? (
                <div className="drawer__empty">
                  <Icon name="folder" size={26} />
                  <p>Nothing here yet.</p>
                  <span>
                    Send a doodle or attach an image in any channel and it will
                    land here.
                  </span>
                </div>
              ) : (
                <div className="file-grid">
                  {files.map((file) => (
                    <button
                      className="file-tile"
                      key={file.id}
                      onClick={() => setFilePreview(file.image)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={file.image} alt="" />
                      <span>#{file.channel}</span>
                    </button>
                  ))}
                </div>
              )}
              {filePreview && (
                <button
                  className="file-preview"
                  onClick={() => setFilePreview(null)}
                  aria-label="Close preview"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={filePreview} alt="Shared file preview" />
                </button>
              )}
            </>
          )}

          {panel === "agents" && (
            <div className="agent">
              <div className="agent__log">
                {agentLog.map((entry) => (
                  <div
                    className={cn(
                      "agent__msg",
                      entry.from === "you" && "agent__msg--me",
                    )}
                    key={entry.id}
                  >
                    <span className="agent__who">
                      {entry.from === "you" ? "You" : "Telex"}
                    </span>
                    <p>{entry.body}</p>
                  </div>
                ))}
              </div>
              <div className="agent__quick">
                {[
                  "What's due this week?",
                  "Summarise the State thread",
                  "Where's the starter repo?",
                ].map((prompt) => (
                  <button key={prompt} onClick={() => sendAgent(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {panel === "notifications" && (
            <div className="notif">
              {channels
                .filter((channel) => channel.unread > 0)
                .map((channel) => (
                  <button
                    className="notif__row"
                    key={channel.id}
                    onClick={() => {
                      go(channel.id);
                      setPanel(null);
                    }}
                  >
                    <span className="notif__dot" aria-hidden />
                    <div>
                      <b>
                        {channel.dm ? channel.name : `#${channel.name}`}
                      </b>
                      <span>{channel.topic}</span>
                    </div>
                    <em>{channel.unread}</em>
                  </button>
                ))}
              {unreadTotal === 0 && (
                <div className="drawer__empty">
                  <Icon name="bell" size={26} />
                  <p>All caught up.</p>
                  <span>Nothing is waiting for you. Enjoy the silence.</span>
                </div>
              )}
            </div>
          )}

          {panel === "settings" && (
            <div className="set-list">
              <div className="set-row">
                <div>
                  <b>Interface sound</b>
                  <span>Synthesised in the browser. Nothing is downloaded.</span>
                </div>
                <button
                  className={cn("switch", sound && "is-on")}
                  onClick={toggleSound}
                  aria-pressed={sound}
                  aria-label="Toggle interface sound"
                >
                  <i />
                </button>
              </div>
              <div className="set-row">
                <div>
                  <b>Workspace</b>
                  <span>
                    {process.env.NEXT_PUBLIC_WORKSPACE_NAME ?? "Zedu"}
                  </span>
                </div>
                <span className="mono">read-only</span>
              </div>
              <div className="set-row">
                <div>
                  <b>Storage</b>
                  <span>Everything lives in this browser, not on a server.</span>
                </div>
                <button
                  className="btn btn--sm btn--ghost"
                  onClick={resetDemo}
                >
                  Reset demo
                </button>
              </div>
              <Link className="set-row" href="/">
                <div>
                  <b>Marketing site</b>
                  <span>Back to the stage.</span>
                </div>
                <span aria-hidden>→</span>
              </Link>
            </div>
          )}
        </Drawer>
      )}

      {toast && (
        <div className="toast" role="status">
          <i />
          {toast}
        </div>
      )}
    </div>
  );
}
