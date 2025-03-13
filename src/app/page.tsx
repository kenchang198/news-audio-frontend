'use client';

import { useState, useEffect } from 'react';
import { getNewsData } from '@/lib/api';
import NewsCard, { NewsItem } from '@/components/NewsCard';
import AudioPlayer from '@/components/AudioPlayer';

export default function Home() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentAudio, setCurrentAudio] = useState<NewsItem | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getNewsData();
        setNewsItems(data);
        setLoading(false);
      } catch (err) {
        setError('ニュースデータの取得に失敗しました');
        setLoading(false);
        console.error(err);
      }
    }

    loadData();
  }, []);

  const handlePlay = (news: NewsItem) => {
    setCurrentAudio(news);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">IT ニュース 音声要約</h1>
      
      {/* オーディオプレーヤー */}
      {currentAudio && (
        <div className="sticky top-0 bg-white p-4 shadow-md mb-6 z-10">
          <AudioPlayer newsItem={currentAudio} />
        </div>
      )}
      
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* ローディング表示 */}
      {loading ? (
        <div className="text-center py-10">
          <p>データを読み込み中...</p>
        </div>
      ) : (
        /* ニュース一覧 */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newsItems.map((news) => (
            <NewsCard 
              key={news.id} 
              news={news} 
              onPlay={handlePlay} 
            />
          ))}
        </div>
      )}
    </main>
  );
}