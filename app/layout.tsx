import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const graviticaCompressed = localFont({
  src: [
    {
      path: "../public/app/fonts/GraviticaCompressed-DemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/app/fonts/GraviticaCompressed-Bold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-gravitica-compressed",
  display: "swap",
});

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
    <html
      lang="zh-CN"
      className={`${graviticaCompressed.variable} light`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
