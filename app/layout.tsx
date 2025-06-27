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
  title: "はてブ Tech Radio - はてなブックマーク［テクノロジー］カテゴリの音声サービス",
  description: "はてなブックマーク［テクノロジー］カテゴリの人気記事を要約し、最新のテクノロジートレンドを音声でお届けします。",
  keywords: ["はてなブックマーク", "テクノロジー", "音声", "ニュース", "要約", "ポッドキャスト"],
  authors: [{ name: "はてブ Tech Radio" }],
  creator: "はてブ Tech Radio",
  publisher: "はてブ Tech Radio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://news-audio-frontend.vercel.app"),
  alternates: {
    canonical: "https://news-audio-frontend.vercel.app",
  },
  openGraph: {
    title: "はてブ Tech Radio - はてなブックマーク［テクノロジー］カテゴリの音声サービス",
    description: "はてなブックマーク［テクノロジー］カテゴリの人気記事を要約し、最新のテクノロジートレンドを音声でお届けします。",
    type: "website",
    url: "https://news-audio-frontend.vercel.app",
    locale: "ja_JP",
    siteName: "はてブ Tech Radio",
    images: [
      {
        url: "https://news-audio-files-kenchang198-dev.s3.ap-northeast-1.amazonaws.com/assets/hateb-tech-ogimage.png",
        width: 1200,
        height: 630,
        alt: "はてブ Tech Radio - はてなブックマーク［テクノロジー］カテゴリの音声サービス",
        type: "image/png",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@hateb_tech_radio",
    creator: "@hateb_tech_radio", 
    title: "はてブ Tech Radio - はてなブックマーク［テクノロジー］カテゴリの音声サービス",
    description: "はてなブックマーク［テクノロジー］カテゴリの人気記事を要約し、最新のテクノロジートレンドを音声でお届けします。",
    images: ["https://news-audio-files-kenchang198-dev.s3.ap-northeast-1.amazonaws.com/assets/hateb-tech-ogimage.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: undefined, // 必要に応じてGoogle Search Console verification codeを追加
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/* Slack OGP compatibility */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:secure_url" content="https://news-audio-files-kenchang198-dev.s3.ap-northeast-1.amazonaws.com/assets/hateb-tech-ogimage.png" />
        <meta name="slack-app-id" content="" />
        {/* Additional metadata for better social sharing */}
        <meta property="article:author" content="はてブ Tech Radio" />
        <meta property="article:publisher" content="https://news-audio-frontend.vercel.app" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        {children}
      </body>
    </html>
  );
}
