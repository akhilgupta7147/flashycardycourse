import { cookies } from "next/headers";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FlashyCardy",
  description: "Build decks, flip cards, and remember more.",
};

// Render at the device width so the responsive layout is used on phones.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme =
    (await cookies()).get("theme")?.value === "dark" ? "dark" : "light";

  return (
    <html
      lang="en"
      className={`${poppins.className} ${poppins.variable} h-full bg-background antialiased${theme === "dark" ? " dark" : ""}`}
      style={{ colorScheme: theme }}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <AppProviders>
          <SiteHeader initialTheme={theme} />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
