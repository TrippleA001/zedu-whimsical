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

export type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolved: Resolved;
  setTheme: (next: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const THEME_KEY = "zedu-theme";

const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark" || value === "system";

export const resolveTheme = (theme: Theme): Resolved => {
  if (theme === "system") {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  return theme;
};

/** Paint the document before React hydrates so there is no flash of dark. */
export const themeBootstrapScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark"&&t!=="system"){t="system"}var m=window.matchMedia("(prefers-color-scheme: light)");var r=t==="system"?(m.matches?"light":"dark"):t;var d=document.documentElement;d.dataset.theme=r;d.style.colorScheme=r}catch(e){}})()`;

export default function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolved, setResolved] = useState<Resolved>("dark");

  /* read the stored preference once */
  useEffect(() => {
    let stored: Theme = defaultTheme;
    try {
      const raw = window.localStorage.getItem(THEME_KEY);
      if (isTheme(raw)) stored = raw;
    } catch {
      /* storage blocked — keep the default */
    }

    setThemeState(stored);
    const value = resolveTheme(stored);
    setResolved(value);
    document.documentElement.dataset.theme = value;
    document.documentElement.style.colorScheme = value;
  }, [defaultTheme]);

  /* follow the OS while the preference is "system" */
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      const next = resolveTheme("system");
      setResolved(next);
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next;
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    const value = resolveTheme(next);
    setResolved(value);
    document.documentElement.dataset.theme = value;
    document.documentElement.style.colorScheme = value;
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage blocked — the choice still applies for this session */
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "system" as Theme,
      resolved: "dark" as Resolved,
      setTheme: () => {},
    };
  }
  return ctx;
}

const OPTIONS: Array<{ id: Theme; label: string; icon: "monitor" | "sun" | "moon" }> =
  [
    { id: "system", label: "Match system", icon: "monitor" },
    { id: "light", label: "Light", icon: "sun" },
    { id: "dark", label: "Dark", icon: "moon" },
  ];

/** Rail-sized icon button for the studio: flips between light and dark. */
export function ThemeRailToggle() {
  const { resolved, setTheme } = useTheme();
  const isLight = resolved === "light";

  return (
    <button
      type="button"
      className={`rail__btn${isLight ? " is-on" : ""}`}
      onClick={() => setTheme(isLight ? "dark" : "light")}
      title={isLight ? "Switch to dark" : "Switch to light"}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
    >
      <Icon name={isLight ? "moon" : "sun"} />
    </button>
  );
}

/** Three-way appearance switch: system, light, dark. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`theme-toggle${className ? ` ${className}` : ""}`}
      role="group"
      aria-label="Colour theme"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`theme-toggle__opt${theme === option.id ? " is-on" : ""}`}
          onClick={() => setTheme(option.id)}
          aria-pressed={theme === option.id}
          title={option.label}
          aria-label={option.label}
        >
          <Icon name={option.icon} size={14} />
        </button>
      ))}
    </div>
  );
}
