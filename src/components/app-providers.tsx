"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";

/**
 * Clerk reads the same CSS variables as the rest of the app, so sign-in,
 * sign-up, and pricing follow the light/dark class on <html>. The backdrop
 * stays translucent; Clerk's default is solid black.
 */
const authAppearance = {
  theme: shadcn,
  variables: {
    colorModalBackdrop: "rgba(0, 0, 0, 0.45)",
  },
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ClerkProvider appearance={authAppearance}>{children}</ClerkProvider>;
}
