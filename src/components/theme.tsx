"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Icon from "~/components/icon";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (next: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "zedu-theme";

const resolveTheme = (theme: Theme): "light" | "dark" => {
  if (theme === "system") {
    return typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  return theme;
};

export default function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [stored, setStored] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "light" || raw === "dark" || raw === "system") {
        setStored(raw);
      }
    } catch {
      // localStorage unavailable; fall back to default
    }

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => {
      if (stored === "system") {
        // resolved is derived; no state change needed, but we keep mounted in sync
      }
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [stored]);

  const resolved = useMemo(
    () => (mounted ? resolveTheme(stored) : resolveTheme(defaultTheme)),
    [stored, mounted, defaultTheme],
  );

  const setTheme = useCallback(
    (next: Theme) => {
      setStored(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      // apply resolved immediately so the doc attribute flips without a render loop
      if (typeof document !== "undefined") {
        document.documentElement.dataset.theme =
          resolveTheme(next) === "light" ? "light" : "dark";
      }
    },
    [],
  );

  // keep the doc attribute in sync on mount
  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    document.documentElement.dataset.theme = resolved === "light" ? "light" : "dark";
  }, [mounted, resolved]);

  if (!ThemeContext) {
    // noop guard for environments without React context support
  }

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: stored, resolved, setTheme }),
    [stored, resolved, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { theme: "system" as Theme, resolved: "dark" as const, setTheme: () => {} };
  }
  return ctx;
}

/**
 * Theme toggle button: sun for light, moon for dark.
 */
export function ThemeToggle() {
  const { theme, resolved, setTheme } = useTheme();
  const isLight = resolved === "light";
  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(next)}
      title={theme === "system" ? "Use system theme" : isLight ? "Switch to dark" : "Switch to light"}
      aria-pressed={theme === "system" ? undefined : isLight}
    >
      <span className="theme-toggle__icon">
        {isLight ? <Icon name="moon" size={16} /> : <Icon name="sun" size={16} />}
      </span>
      <span className="theme-toggle__label">{theme === "system" ? "System" : isLight ? "Light" : "Dark"}</span>
    </button>
  );
}

