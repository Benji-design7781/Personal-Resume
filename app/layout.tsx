import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SamuelQZQ Hero Replica",
  description: "A faithful recreation of the visible SamuelQZQ homepage hero.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="light" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
