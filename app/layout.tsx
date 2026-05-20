import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

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
  title: "Benji | Systems, Workflows, and Product Judgment",
  description:
    "A personal site by Benji, presenting capability slices across AI product design, Agent workflows, complex system thinking, and product delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${graviticaCompressed.variable} light`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
