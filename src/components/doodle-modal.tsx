"use client";

import { useEffect, useRef, useState } from "react";
import SilkCanvas, { type SilkHandle } from "~/components/silk-canvas";
import Icon from "~/components/icon";
import { cn, shrinkDataUrl } from "~/lib/utils";

const palettes: number[][] = [
  [258, 330, 172, 54, 276],
  [330, 14, 44, 0],
  [172, 192, 258, 276],
  [54, 44, 14, 0],
  [276, 258, 330, 172, 54],
];

const symmetries = [3, 6, 9, 12];

export default function DoodleModal({
  channelName,
  onClose,
  onSend,
}: {
  channelName: string;
  onClose: () => void;
  onSend: (image: string) => void;
}) {
  const silk = useRef<SilkHandle>(null);
  const [palette, setPalette] = useState(0);
  const [symmetry, setSymmetry] = useState(6);
  const [shuffle, setShuffle] = useState(0);
  const [sending, setSending] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const send = async () => {
    const png = silk.current?.exportPNG();
    if (!png) return;
    setSending(true);
    const small = await shrinkDataUrl(png, 860, 0.74);
    onSend(small);
  };

  return (
    <div
      className="scrim"
      role="dialog"
      aria-modal="true"
      aria-label="Doodle canvas"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="doodle">
        <div className="doodle__head">
          <div style={{ flex: 1 }}>
            <h3>Doodle a thought</h3>
            <p>
              It lands in <b style={{ color: "var(--violet-soft)" }}>#{channelName}</b>{" "}
              as an image. No talent required — the symmetry does the work.
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="doodle__canvas" onPointerDown={() => setTouched(true)}>
          <SilkCanvas
            ref={silk}
            key={`${palette}-${symmetry}-${shuffle}`}
            symmetry={symmetry}
            hues={palettes[palette]}
            ambient
            interactive
            listenOn="self"
            fadeAfter={120}
            baseWidth={2.6}
            mirror
          />

          {!touched && (
            <div className="doodle__hint" aria-hidden>
              <span>
                <Icon name="pen" size={14} /> Drag anywhere to draw
              </span>
              <em>the symmetry does the rest</em>
            </div>
          )}
        </div>

        <div className="doodle__bar">
          <div className="doodle__swatches" role="group" aria-label="Palettes">
            {palettes.map((p, i) => (
              <button
                key={i}
                className={cn("swatch", palette === i && "is-on")}
                style={{
                  background: `linear-gradient(135deg, hsl(${p[0]} 90% 62%), hsl(${
                    p[1] ?? p[0]
                  } 90% 58%))`,
                }}
                onClick={() => setPalette(i)}
                aria-label={`Palette ${i + 1}`}
                aria-pressed={palette === i}
              />
            ))}
            <button
              className="swatch"
              style={{
                background:
                  "conic-gradient(from 0deg, #7141f8, #e94fa1, #2be3cf, #ffe900, #7141f8)",
              }}
              onClick={() => {
                setPalette(Math.floor(Math.random() * palettes.length));
                setShuffle((s) => s + 1);
              }}
              aria-label="Surprise me"
              title="Surprise me"
            />
          </div>

          <div style={{ display: "flex", gap: 4, marginRight: 8 }}>
            {symmetries.map((s) => (
              <button
                key={s}
                className={cn("btn btn--sm", symmetry === s && "btn--primary")}
                style={{ height: 30, padding: "0 10px", fontSize: 11.5 }}
                onClick={() => setSymmetry(s)}
              >
                {s}×
              </button>
            ))}
          </div>

          <button
            className="btn btn--sm btn--ghost"
            style={{ height: 32 }}
            onClick={() => silk.current?.clear()}
          >
            <Icon name="trash" size={13} /> Clear
          </button>

          <button
            className="btn btn--sm btn--primary"
            style={{ height: 32 }}
            onClick={send}
            disabled={sending}
          >
            <Icon name="send" size={13} />
            {sending ? "Sending…" : `Send to #${channelName}`}
          </button>
        </div>
      </div>
    </div>
  );
}
