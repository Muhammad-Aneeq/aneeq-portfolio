"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      className="grid size-9 place-items-center rounded-md border border-border text-muted transition-colors duration-200 hover:border-border-strong hover:text-text"
    >
      {/*
        The accessible name is driven by the same CSS that drives the icon, rather
        than by a mounted flag. next-themes stamps the class on <html> before first
        paint, so both stay correct through SSR with no hydration mismatch and no
        setState-in-effect. `hidden` is display:none, so it drops out of the
        accessible name computation.
      */}
      <span className="sr-only [.light_&]:hidden">Switch to light theme</span>
      <span className="sr-only hidden [.light_&]:block">Switch to dark theme</span>

      <Sun className="hidden size-4 [.light_&]:block" aria-hidden />
      <Moon className="size-4 [.light_&]:hidden" aria-hidden />
    </button>
  );
}
