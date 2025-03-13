// src/components/NewsCard.tsx
import React from 'react';
import Link from 'next/link';

// NewsItemの型定義
export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  summary: string;
  audio_url: string;
  processed_at: string;
}

// コンポーネントのProps型定義
interface NewsCardProps {
  news: NewsItem;
  onPlay: (news: NewsItem) => void;
}

export default function NewsCard({ news, onPlay }: NewsCardProps) {
  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-xl font-semibold mb-2">{news.title}</h2>
      <p className="text-sm text-gray-500 mb-1">出典: {news.source}</p>
      <p className="text-sm text-gray-500 mb-3">
        {new Date(news.processed_at).toLocaleString()}
      </p>
      <p className="mb-4">{news.summary}</p>
      <div className="flex justify-between">
        <button
          onClick={() => onPlay(news)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          再生
        </button>
        <Link
          href={news.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline px-4 py-2"
        >
          元記事を読む
        </Link>
      </div>
    </div>
  );
}