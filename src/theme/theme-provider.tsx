import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type EditorTheme = "light" | "dark";

const STORAGE_KEY = "jv.theme";
const DEFAULT_THEME: EditorTheme = "dark";

type ThemeContextValue = {
  theme: EditorTheme;
  setTheme: (theme: EditorTheme) => void;
  toggleTheme: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readSystemTheme(): EditorTheme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredTheme(): Promise<EditorTheme | null> {
  return new Promise((resolve) => {
    try {
      const area = chrome?.storage?.local;
      if (!area || typeof area.get !== "function") {
        resolve(null);
        return;
      }
      area.get(STORAGE_KEY, (result) => {
        const value = result?.[STORAGE_KEY];
        resolve(value === "light" || value === "dark" ? value : null);
      });
    } catch {
      resolve(null);
    }
  });
}

function writeStoredTheme(theme: EditorTheme) {
  try {
    const area = chrome?.storage?.local;
    if (!area || typeof area.set !== "function") return;
    area.set({ [STORAGE_KEY]: theme });
  } catch {
    /* storage unavailable - ignore */
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<EditorTheme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void readStoredTheme().then((stored) => {
      if (cancelled) return;
      const initial = stored ?? readSystemTheme();
      setThemeState(initial);
      setMounted(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  const setTheme = useCallback((next: EditorTheme) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: EditorTheme = current === "dark" ? "light" : "dark";
      writeStoredTheme(next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme, mounted }),
    [theme, setTheme, toggleTheme, mounted],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }
  return ctx;
}
