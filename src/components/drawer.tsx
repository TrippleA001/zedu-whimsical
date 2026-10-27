"use client";

import { useEffect, type ReactNode } from "react";
import Icon from "~/components/icon";

export default function Drawer({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="drawer-scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="drawer__head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close panel"
          >
            <Icon name="close" size={16} />
          </button>
        </header>

        <div className="drawer__body">{children}</div>

        {footer && <div className="drawer__foot">{footer}</div>}
      </aside>
    </div>
  );
}
