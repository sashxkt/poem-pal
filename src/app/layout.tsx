import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Mono } from "next/font/google";

import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"]
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: "Poem Pal",
  description: "A dark daily poem exchange notebook."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
