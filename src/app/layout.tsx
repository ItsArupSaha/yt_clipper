import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YT Clipper - Trim YouTube Videos with Precision",
  description: "Create perfect clips from YouTube videos in seconds. No registration required. Fast, reliable, and high-quality output.",
  keywords: ["YouTube", "video trimmer", "video clipper", "YouTube clips", "video editing", "online video editor"],
  authors: [{ name: "YT Clipper Team" }],
  metadataBase: new URL("https://yt-clipper.vercel.app"),
  openGraph: {
    title: "YT Clipper - Trim YouTube Videos with Precision",
    description: "Create perfect clips from YouTube videos in seconds. No registration required. Fast, reliable, and high-quality output.",
    url: "https://yt-clipper.vercel.app",
    siteName: "YT Clipper",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YT Clipper - YouTube Video Trimmer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YT Clipper - Trim YouTube Videos with Precision",
    description: "Create perfect clips from YouTube videos in seconds. No registration required. Fast, reliable, and high-quality output.",
    images: ["/og-image.png"],
    creator: "@ytclipper",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-touch-icon-precomposed.png" },
    ],
  },
  manifest: "/site.webmanifest",
  themeColor: "#f97316",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: "your-google-site-verification",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
