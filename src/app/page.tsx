'use client';

import { useState, useEffect } from 'react';
import { getEpisodesList, getEpisodeById } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// エピソードの型定義
interface Episode {
  episode_id: string;
  title: string;
  created_at: string;
  article_count: number;
}

// ページネーションの設定
const EPISODES_PER_PAGE = 10;

export default function Home() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getEpisodesList();
        console.log('取得したエピソードデータ:', data);
        setEpisodes(data);

        setLoading(false);
      } catch (err) {
        setError('エピソードリストの取得に失敗しました');
        setEpisodes([]);
        setLoading(false);
        console.error(err);
      }
    }

    loadData();
  }, []);

  // 最新エピソード
  const latestEpisode = episodes.length > 0 ? episodes[0] : null;

  // ページネーション用のエピソードリスト
  const pageCount = Math.ceil((episodes.length - 1) / EPISODES_PER_PAGE);
  const paginatedEpisodes = Array.isArray(episodes) ? episodes.slice(1).slice(
    (currentPage - 1) * EPISODES_PER_PAGE,
    currentPage * EPISODES_PER_PAGE
  ) : [];

  // 最新エピソードのクリック処理
  const handleLatestEpisodeClick = () => {
    if (latestEpisode) {
      router.push(`/episode/${latestEpisode.episode_id}`);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">ITニュース音声要約</h1>
      
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
        <>
          {/* 最新エピソード */}
          {latestEpisode && (
            <div 
              className="bg-blue-50 p-6 rounded-lg shadow-md mb-8 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={handleLatestEpisodeClick}
            >
              <h2 className="text-2xl font-semibold mb-2">
                {latestEpisode.title} <span className="text-sm bg-blue-500 text-white px-2 py-1 rounded ml-2">NEW</span>
              </h2>
              <p className="text-gray-600 mb-2">
                {new Date(latestEpisode.created_at).toLocaleDateString()} - {latestEpisode.article_count}件の記事
              </p>
              <p className="text-blue-600">クリックして聴く →</p>
            </div>
          )}
          
          {/* 過去のエピソード一覧 */}
          <h2 className="text-2xl font-semibold mb-4">過去のエピソード</h2>
          <div className="divide-y">
            {paginatedEpisodes.map((episode) => (
              <Link 
                href={`/episode/${episode.episode_id}`} 
                key={episode.episode_id}
                className="block py-4 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-medium">{episode.title}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(episode.created_at).toLocaleDateString()} - {episode.article_count}件の記事
                </p>
              </Link>
            ))}
          </div>
          
          {/* ページネーション */}
          {pageCount > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => setCurrentPage(current => Math.max(current - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-l-md ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  前へ
                </button>
                
                <span className="px-4 py-2 bg-blue-500 text-white">
                  {currentPage} / {pageCount}
                </span>
                
                <button
                  onClick={() => setCurrentPage(current => Math.min(current + 1, pageCount))}
                  disabled={currentPage === pageCount}
                  className={`px-4 py-2 rounded-r-md ${
                    currentPage === pageCount 
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  次へ
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </main>
  );
}