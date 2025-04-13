'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import EpisodeList from '@/components/episodes/EpisodeList';
import Pagination from '@/components/ui/Pagination';
import { getEpisodes } from '@/services/api';
import { EpisodeSummary } from '@/types';

export default function Home() {
  const [episodes, setEpisodes] = useState<EpisodeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const pageSize = 10; // 1ページあたりの表示件数

  // エピソードデータを取得
  const loadEpisodes = async (page: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getEpisodes(page, pageSize);
      setEpisodes(result.episodes);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
      setTotalEpisodes(result.totalEpisodes);
    } catch (err) {
      setError('エピソードの取得に失敗しました。後でもう一度お試しください。');
      console.error('Failed to fetch episodes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ページ変更時の処理
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadEpisodes(page);
    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 初回レンダリング時にデータを取得
  useEffect(() => {
    loadEpisodes(currentPage);
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">ITニュース 音声まとめ</h1>
        <p className="mt-2 text-sm text-gray-500">
          最新のITニュースをAIが要約し、音声で聴けるサービスです
        </p>
        {totalEpisodes > 0 && (
          <p className="mt-1 text-sm text-gray-500">
            全 {totalEpisodes} 件のエピソード
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <EpisodeList episodes={episodes} />
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          )}
        </>
      )}
    </Layout>
  );
}
