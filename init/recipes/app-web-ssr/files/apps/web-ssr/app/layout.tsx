import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "{{PROJECT_NAME}}", template: "%s | {{PROJECT_NAME}}" },
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
