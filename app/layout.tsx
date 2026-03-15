import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
  title: "Hyperlinks Space Landing",
  description:
    "Blockchain & AI Application. Features recommendations, chat, swap, trading, wallet and deals. AI Transmitter accesses on-chain data.",
  openGraph: {
    title: "Hyperlinks Space Landing",
    description:
      "Blockchain & AI Application. Features recommendations, chat, swap, trading, wallet and deals. AI Transmitter accesses on-chain data.",
    images: ["/82.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyperlinks Space Landing",
    description:
      "Blockchain & AI Application. Features recommendations, chat, swap, trading, wallet and deals. AI Transmitter accesses on-chain data.",
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
      </body>
    </html>
  );
}
