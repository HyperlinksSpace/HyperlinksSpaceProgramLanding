import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  weight: "500",
  variable: "--font-inter-medium",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: "Hyperlinks Space Program Landing",
  description:
    "AI & Blockchain multiplatform solution for managing, investing and earning assets. Features recommendations, chats, swaps, trades, wallets and deals. AI Transmitter accesses chains&apos; data.",
  openGraph: {
    title: "Hyperlinks Space Program Landing",
    description:
      "AI & Blockchain multiplatform solution for managing, investing and earning assets. Features recommendations, chats, swaps, trades, wallets and deals. AI Transmitter accesses chains&apos; data.",
    images: ["/82.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyperlinks Space Program Landing",
    description:
      "AI & Blockchain multiplatform solution for managing, investing and earning assets. Features recommendations, chats, swaps, trades, wallets and deals. AI Transmitter accesses chains&apos; data.",
    images: ["/82.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
