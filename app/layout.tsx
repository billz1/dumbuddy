import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "dümBuddy — Friendsgiving Edition",
  description:
    "No.1 party game for adults 18+. Deep questions, clear boundaries, real connection.",
  applicationName: "dümBuddy",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "dümBuddy — Live at Aidan's",
    description:
      "Skip the bullshit. Draw a card, answer honestly, always respect boundaries.",
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
