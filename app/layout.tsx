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
  metadataBase: new URL("https://news-audio-frontend.vercel.app"),
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
        url: "/ogimage.png",  // publicディレクトリに配置して相対パスで指定
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
    images: ["/ogimage.png"],
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        {children}
      </body>
    </html>
  );
}
