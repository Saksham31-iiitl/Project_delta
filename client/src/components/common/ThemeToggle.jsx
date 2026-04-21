import { Moon, Sun } from "lucide-react";
import { useTheme } from "@hooks/useTheme.js";

export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="btn-press flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-all hover:border-brand-400 hover:text-brand-700 dark:border-[#243e2c] dark:bg-[#132419] dark:text-stone-300 dark:hover:border-accent-500 dark:hover:text-accent-400"
    >
      {dark ? <Sun className="h-[17px] w-[17px]" /> : <Moon className="h-[17px] w-[17px]" />}
    </button>
  );
}
