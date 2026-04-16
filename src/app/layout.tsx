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
  title: "PoGo Pal — Your Pokemon GO battle companion",
  description:
    "Your Pokemon GO battle companion. Find counters, build teams, copy search strings.",
  manifest: "/manifest.json",
  openGraph: {
    title: "PoGo Pal — Your Pokemon GO battle companion",
    description:
      "Your Pokemon GO battle companion. Find counters, build teams, copy search strings.",
    type: "website",
    url: "https://pogopal.com",
    siteName: "PoGo Pal",
  },
  twitter: {
    card: "summary",
    title: "PoGo Pal — Your Pokemon GO battle companion",
    description:
      "Your Pokemon GO battle companion. Find counters, build teams, copy search strings.",
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
        <script dangerouslySetInnerHTML={{ __html: `document.addEventListener('touchstart',function(){},true);(function(){var d=document.documentElement;var m=window.matchMedia('(prefers-color-scheme:dark)');function a(){d.classList.toggle('dark',m.matches)}a();m.addEventListener('change',a)})();` }} />
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
