import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/shared/providers/app-providers";

export const metadata: Metadata = {
  title: "TaskOrbit",
  description: "AI-first productivity operating system for life and work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
