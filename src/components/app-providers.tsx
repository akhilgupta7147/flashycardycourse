"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark as darkTheme, shadcn } from "@clerk/themes";
import { useEffect, useState } from "react";

export function AppProviders({
  initialTheme,
  children,
}: {
  initialTheme: "light" | "dark";
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    function sync() {
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
    }
    window.addEventListener("flashycardy-theme", sync);
    return () => window.removeEventListener("flashycardy-theme", sync);
  }, []);

  return (
    <ClerkProvider
      appearance={{
        theme: theme === "dark" ? [shadcn, darkTheme] : shadcn,
        variables: {
          colorPrimary: theme === "dark" ? "#34d399" : "#059669",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
