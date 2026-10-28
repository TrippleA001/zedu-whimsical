"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SilkCanvas from "~/components/silk-canvas";
import Icon from "~/components/icon";
import { members, memberById } from "~/lib/data";
import { cn, formatClock } from "~/lib/utils";

export default function BuzzRoom({
  channelName,
  onLeave,
  onToggleSound,
  sound,
}: {
  channelName: string;
  onLeave: () => void;
  onToggleSound: () => void;
  sound: boolean;
}) {
  const [muted, setMuted] = useState(false);
  const [cam, setCam] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [speaking, setSpeaking] = useState<string | null>("amara");
  const talkTimer = useRef<number | undefined>(undefined);

  const people = useMemo(() => members.filter((m) => m.online).slice(0, 5), []);

  useEffect(() => {
    const tick = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const rotate = () => {
      const pool = ["amara", "tomas", "priya", "nkem", ...(muted ? [] : ["you"])];
      setSpeaking(pool[Math.floor(Math.random() * pool.length)]);
      talkTimer.current = window.setTimeout(rotate, 2200 + Math.random() * 1800);
    };
    talkTimer.current = window.setTimeout(rotate, 1800);
    return () => window.clearTimeout(talkTimer.current);
  }, [muted]);

  return (
    <div
      className="scrim"
      role="dialog"
      aria-modal="true"
      aria-label="Buzz room"
    >
      <div className="buzz">
        <SilkCanvas
          className="buzz__canvas"
          symmetry={3}
          hues={[258, 172, 330]}
          ambient
          interactive={false}
          fadeAfter={11}
          baseWidth={1.1}
        />
        <div className="buzz__inner">
          <div className="buzz__top">
            <span className="buzz__live">
              <i /> live
            </span>
            <span className="buzz__timer">
              #{channelName} · {formatClock(seconds)}
            </span>
            <button
              className="icon-btn buzz__close"
              onClick={onLeave}
              aria-label="Leave the call"
            >
              <Icon name="close" size={17} />
            </button>
          </div>

          <div className="buzz__stage">
            {people.map((m) => (
              <div
                className={cn("buzz__tile", speaking === m.id && "is-speaking")}
                key={m.id}
              >
                <span
                  className="orb"
                  style={{ ["--h" as string]: m.hue }}
                  data-talking={speaking === m.id}
                >
                  {m.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </span>
                <span>{m.name.split(" ")[0]}</span>
                {speaking === m.id && (
                  <span
                    className="mono"
                    style={{ color: "var(--teal)", fontSize: 9 }}
                  >
                    speaking
                  </span>
                )}
              </div>
            ))}
            <div
              className={cn("buzz__tile", speaking === "you" && "is-speaking")}
            >
              <span
                className="orb"
                style={{ ["--h" as string]: 262 }}
                data-talking={speaking === "you"}
              >
                Y
              </span>
              <span>You</span>
              {speaking === "you" && (
                <span className="mono" style={{ color: "var(--teal)", fontSize: 9 }}>
                  speaking
                </span>
              )}
            </div>
          </div>

          <div className="buzz__controls">
            <button
              className={cn("buzz__ctrl", muted && "is-off")}
              onClick={() => setMuted((v) => !v)}
              aria-label={muted ? "Unmute" : "Mute"}
              aria-pressed={muted}
            >
              <Icon name={muted ? "mic-off" : "mic"} size={19} />
            </button>
            <button
              className={cn("buzz__ctrl", cam && "is-off")}
              onClick={() => setCam((v) => !v)}
              aria-label={cam ? "Turn camera off" : "Turn camera on"}
              aria-pressed={cam}
            >
              <Icon name="camera" size={19} />
            </button>
            <button
              className="buzz__ctrl"
              onClick={onToggleSound}
              aria-label={sound ? "Mute interface sound" : "Enable interface sound"}
            >
              <Icon name={sound ? "sound-on" : "sound-off"} size={19} />
            </button>
            <button
              className="buzz__ctrl is-danger"
              onClick={onLeave}
              aria-label="Leave call"
            >
              <Icon name="leave" size={19} />
            </button>
          </div>

          <p
            className="mono"
            style={{ textAlign: "center", margin: 0, fontSize: 9.5 }}
          >
            {muted
              ? "you are muted — the room can still see you thinking"
              : `the room is humming · ${
                  speaking === "you"
                    ? "you have"
                    : `${memberById(speaking ?? "amara").name} has`
                } the floor`}
          </p>
        </div>
      </div>
    </div>
  );
}
