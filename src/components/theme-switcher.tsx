import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect } from "react";
import { useTheme } from "@/theme/theme-provider";
import { cn } from "@/lib/utils";

const themes = [
  {
    key: "light" as const,
    icon: Sun,
    label: "Light theme",
  },
  {
    key: "dark" as const,
    icon: Moon,
    label: "Dark theme",
  },
];

type TThemeSwitcherProps = {
  className?: string;
};

export const ThemeSwitcher = ({ className }: TThemeSwitcherProps) => {
  const { theme: currentTheme, setTheme, mounted } = useTheme();

  const [theme, setInternalTheme] = useControllableState({
    defaultProp: currentTheme,
    prop: currentTheme,
    onChange: (newTheme) => {
      if (newTheme) setTheme(newTheme);
    },
  });

  const handleThemeClick = useCallback(
    (themeKey: "light" | "dark") => {
      setInternalTheme(themeKey);
    },
    [setInternalTheme],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "d") {
        event.preventDefault();
        setTheme(theme === "dark" ? "light" : "dark");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [theme, setTheme]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative isolate flex h-8 rounded-full bg-background p-1 ring-1 ring-border",
        className,
      )}
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key;
        return (
          <button
            aria-label={label}
            className="relative h-6 w-6 rounded-full cursor-pointer"
            key={key}
            onClick={() => handleThemeClick(key)}
            type="button"
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-secondary"
                layoutId="activeTheme"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <Icon
              className={cn(
                "relative z-10 m-auto h-4 w-4",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
