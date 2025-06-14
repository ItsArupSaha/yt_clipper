import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "YT Clipper - Trim YouTube Videos with Precision",
  description: "Create perfect clips from your favorite YouTube videos in seconds. No downloads, no hassle.",
  keywords: ["YouTube", "video trimmer", "video clipper", "YouTube downloader", "video editor"],
  authors: [{ name: "Arup Saha" }],
  metadataBase: new URL("https://yt-clipper.vercel.app"),
  openGraph: {
    title: "YT Clipper - Trim YouTube Videos with Precision",
    description: "Create perfect clips from your favorite YouTube videos in seconds. No downloads, no hassle.",
    url: "https://yt-clipper.vercel.app",
    siteName: "YT Clipper",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "YT Clipper Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YT Clipper - Trim YouTube Videos with Precision",
    description: "Create perfect clips from your favorite YouTube videos in seconds. No downloads, no hassle.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
