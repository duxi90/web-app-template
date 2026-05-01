import "./globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "webapp-template",
    template: "%s | webapp-template",
  },
  description: "Seed repo for Next.js + Cloudflare projects with an AI bootstrap agent.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <main className="mx-auto max-w-3xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
