"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Icon, { type IconName } from "~/components/icon";
import { cn } from "~/lib/utils";
import type { Channel } from "~/lib/data";

type Action = {
  id: string;
  label: string;
  hint: string;
  icon: IconName;
  run: () => void;
};

type Entry = {
  id: string;
  label: string;
  hint: string;
  icon: IconName;
  group: "channels" | "actions";
  run: () => void;
};

export default function CommandPalette({
  channels,
  actions,
  onClose,
  onGo,
}: {
  channels: Channel[];
  actions: Action[];
  onClose: () => void;
  onGo: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const entries: Entry[] = useMemo(() => {
    const chans: Entry[] = channels.map((c) => ({
      id: `c-${c.id}`,
      label: c.dm ? c.name : `# ${c.name}`,
      hint: c.topic,
      icon: c.dm ? "chat" : "grid",
      group: "channels",
      run: () => onGo(c.id),
    }));
    const acts: Entry[] = actions.map((a) => ({
      id: `a-${a.id}`,
      label: a.label,
      hint: a.hint,
      icon: a.icon,
      group: "actions",
      run: a.run,
    }));
    return [...chans, ...acts];
  }, [channels, actions, onGo]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.label.toLowerCase().includes(q) || e.hint.toLowerCase().includes(q),
    );
  }, [entries, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${index}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const choose = (entry: Entry | undefined) => {
    if (!entry) return;
    entry.run();
    onClose();
  };

  return (
    <div
      className="scrim"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="palette">
        <div className="palette__top">
          <Icon name="search" size={17} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a room, or do something…"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(i + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                choose(filtered[index]);
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
          />
          <kbd className="mono">esc</kbd>
        </div>

        <div className="palette__list" ref={listRef}>
          {filtered.length === 0 && (
            <p
              className="mono"
              style={{ padding: 18, textAlign: "center", lineHeight: 1.8 }}
            >
              nothing here. try “doodle” or “buzz”.
            </p>
          )}

          {(["channels", "actions"] as const).map((group) => {
            const items = filtered.filter((e) => e.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <div className="palette__label">
                  {group === "channels" ? "channels" : "actions"}
                </div>
                {items.map((entry) => {
                  const i = filtered.indexOf(entry);
                  return (
                    <button
                      key={entry.id}
                      data-idx={i}
                      className={cn(
                        "palette__item",
                        i === index && "is-active",
                      )}
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => choose(entry)}
                    >
                      <Icon name={entry.icon} size={16} />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {entry.label}
                        </span>
                        <span
                          style={{
                            display: "block",
                            fontSize: 10.5,
                            opacity: 0.55,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {entry.hint}
                        </span>
                      </span>
                      {i === index && <kbd>↵</kbd>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
