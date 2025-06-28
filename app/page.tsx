'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import EpisodeList from '@/components/episodes/EpisodeList';
import Pagination from '@/components/ui/Pagination';
import { fetchEpisodesList, getEpisodeAudioUrl } from '@/services/news/newsService';
import { EpisodeSummary } from '@/types';
import { preloadAudio } from '@/utils/audioPlayer';

export default function Home() {
  const [episodes, setEpisodes] = useState<EpisodeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreloadingAudio, setIsPreloadingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const pageSize = 5; // 1ページあたりの表示件数

  // エピソードデータを取得
  const loadEpisodes = async (page: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading episodes from S3 bucket...');
      const allEpisodes = await fetchEpisodesList();
      
      console.log('Fetched episodes data:', allEpisodes);
      
      if (!allEpisodes) {
        throw new Error('No episodes data received');
      }
      
      if (!Array.isArray(allEpisodes)) {
        console.error('Episodes data is not an array:', typeof allEpisodes, allEpisodes);
        throw new Error('Invalid episodes data format - expected array');
      }
      
      // ページネーション処理
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedEpisodes = allEpisodes.slice(start, end);
      
      setEpisodes(paginatedEpisodes);
      setTotalPages(Math.ceil(allEpisodes.length / pageSize));
      setCurrentPage(page);
      setTotalEpisodes(allEpisodes.length);
      
      console.log(`Loaded ${paginatedEpisodes.length} episodes for page ${page} (total: ${allEpisodes.length})`);
      
      // 初回アクセス時（1ページ目）は全エピソードの音声ファイルをプリロード
      if (page === 1) {
        setIsPreloadingAudio(true);
        console.log('Starting audio preload for first page episodes...');
        
        try {
          await Promise.allSettled(
            paginatedEpisodes.map(async (episode) => {
              try {
                const audioUrl = getEpisodeAudioUrl(episode.episode_id);
                await preloadAudio(audioUrl);
                console.log(`Preloaded episode: ${episode.episode_id}`);
              } catch (error) {
                console.error(`Failed to preload episode ${episode.episode_id}:`, error);
              }
            })
          );
          console.log('Audio preload completed for first page');
        } catch (error) {
          console.error('Audio preload failed:', error);
        } finally {
          setIsPreloadingAudio(false);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`エピソードの取得に失敗しました: ${errorMessage}`);
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
  }, [currentPage]);

  return (
    <Layout>
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          <a href="https://b.hatena.ne.jp/hotentry/it" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">はてなブックマーク［テクノロジー］カテゴリの人気記事</a>を要約し、最新のテクノロジートレンドを音声でお届けします。
        </p>
        {totalEpisodes > 0 && (
          <p className="mt-1 text-sm text-gray-500">
            全 {totalEpisodes} 件のエピソード
          </p>
        )}
      </div>

      {isLoading || isPreloadingAudio ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-sm text-gray-600">
            {isLoading ? 'エピソードを読み込み中...' : '音声ファイルを準備中...'}
          </p>
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
