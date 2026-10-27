"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "~/components/icon";
import {
  isAmbienceEnabled,
  playSound,
  startAmbience,
  stopAmbience,
  unlockAudio,
} from "~/lib/sound";

const KEY = "zedu-sound";

/**
 * Sound starts quietly on the first gesture (browsers refuse earlier), then
 * follows you from the landing into the studio. One key, one switch.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(true);
  const onRef = useRef(true);

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    const enabled = saved !== "off";
    setOn(enabled);
    onRef.current = enabled;

    if (isAmbienceEnabled()) {
      setOn(true);
      onRef.current = true;
      return;
    }
    if (!enabled) return;

    const begin = () => {
      if (!onRef.current) return;
      unlockAudio();
      startAmbience();
    };

    window.addEventListener("pointerdown", begin, { once: true });
    window.addEventListener("keydown", begin, { once: true });
    return () => {
      window.removeEventListener("pointerdown", begin);
      window.removeEventListener("keydown", begin);
    };
  }, []);

  const toggle = () => {
    const next = !onRef.current;
    onRef.current = next;
    setOn(next);
    window.localStorage.setItem(KEY, next ? "on" : "off");

    if (next) {
      unlockAudio();
      startAmbience();
      playSound("open", true);
    } else {
      stopAmbience();
    }
  };

  return (
    <button
      className={`sound-toggle${on ? " is-on" : ""}`}
      type="button"
      onClick={toggle}
      aria-label={on ? "Mute ambient sound" : "Enable ambient sound"}
      aria-pressed={on}
      title={on ? "Sound on" : "Sound off"}
    >
      <Icon name={on ? "sound-on" : "sound-off"} size={16} />
      <span className="sound-toggle__bars" aria-hidden>
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}
