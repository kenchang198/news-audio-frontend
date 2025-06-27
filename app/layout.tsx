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
    title: "はてブ Tech Radio - はてなブックマーク［テクノロジー］カテゴリの音声サービス",
    description: "はてなブックマーク［テクノロジー］カテゴリの人気記事を要約し、最新のテクノロジートレンドを音声でお届けします。",
    images: ["https://news-audio-files-kenchang198-dev.s3.ap-northeast-1.amazonaws.com/assets/hateb-tech-ogimage.png"],
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
