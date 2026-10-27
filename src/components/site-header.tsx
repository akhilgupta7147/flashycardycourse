"use client";

import { Show, UserButton } from "@clerk/nextjs";
import { Brain } from "lucide-react";
import Link from "next/link";
import { AuthNavButtons } from "@/components/auth-nav-buttons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#about", label: "About" },
];

export function SiteHeader({
  initialTheme,
}: {
  initialTheme: "light" | "dark";
}) {
  return (
    <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
      <Button variant="ghost" nativeButton={false} render={<Link href="/" />}>
        <Brain className="text-primary" />
        FlashyCardy
      </Button>
      <nav className="flex flex-wrap items-center gap-1" aria-label="Main">
        {links.map((link) => (
          <Button
            key={link.href}
            variant="ghost"
            nativeButton={false}
            render={<Link href={link.href} />}
          >
            {link.label}
          </Button>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <ThemeToggle initialTheme={initialTheme} />
        <Show when="signed-out">
          <AuthNavButtons />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
