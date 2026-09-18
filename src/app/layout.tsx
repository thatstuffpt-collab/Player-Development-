import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "That's Tuff Player Development",
  description: "Player development tracking for That's Tuff Performance Training",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
