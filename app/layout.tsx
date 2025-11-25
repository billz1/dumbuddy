import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tell Me True — Intimacy Edition",
  description:
    "A consent-first intimacy card game for adults 18+. Deep questions, clear boundaries, real connection.",
  applicationName: "Tell Me True",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Tell Me True — Intimacy Game for Adults",
    description:
      "A modern, consent-focused intimacy game. Draw a card, answer honestly, always respect boundaries.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
