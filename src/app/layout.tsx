import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ToastProvider } from "@/components/toast-provider";
import { BottomNav } from "@/components/bottom-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poke Pal — Pokemon GO PvP Search Strings",
  description:
    "Find counters, build teams, copy search strings. Paste in Pokemon GO.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Poke Pal — Pokemon GO PvP Search Strings",
    description:
      "Find counters, build teams, copy search strings. Paste in Pokemon GO.",
    type: "website",
    url: "https://poke-pal.pages.dev",
    siteName: "Poke Pal",
  },
  twitter: {
    card: "summary",
    title: "Poke Pal — Pokemon GO PvP Search Strings",
    description:
      "Find counters, build teams, copy search strings. Paste in Pokemon GO.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Empty touchstart listener enables CSS :active on iOS Safari */}
        <script dangerouslySetInnerHTML={{ __html: `document.addEventListener('touchstart',function(){},true);` }} />
      </head>
      <body
        className={`${geistSans.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <main className="mx-auto flex min-h-[100dvh] max-w-lg flex-col px-4 pb-20">{children}</main>
        <BottomNav />
        <ToastProvider />
      </body>
    </html>
  );
}
