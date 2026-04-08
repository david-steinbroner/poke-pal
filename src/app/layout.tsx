import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ToastProvider } from "@/components/toast-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poke Pal — Pokemon GO Search Strings",
  description:
    "Copyable Pokemon GO search strings for any counter. Type the boss, copy the string, paste in GO.",
  manifest: "/manifest.json",
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
        <main className="mx-auto max-w-lg px-4 pb-8">{children}</main>
        <ToastProvider />
      </body>
    </html>
  );
}
