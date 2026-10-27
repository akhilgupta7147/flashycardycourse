"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({
  initialTheme,
}: {
  initialTheme: "light" | "dark";
}) {
  const [theme, setTheme] = useState(initialTheme);
  const isDark = theme === "dark";

  function toggle() {
    const next = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
    setTheme(next);
    window.dispatchEvent(new Event("flashycardy-theme"));
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
