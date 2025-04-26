'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import EpisodeDetail from '@/components/episodes/EpisodeDetail';
import { getEpisode } from '@/services/api';
import { Episode } from '@/types';

export default function EpisodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // エピソードIDを取得
  const episodeId = params.id as string;

  // エピソードデータを取得
  const loadEpisode = async () => {
    if (!episodeId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getEpisode(episodeId);
      if (data) {
        setEpisode(data);
      } else {
        setError('エピソードが見つかりませんでした。');
      }
    } catch (err) {
      setError('エピソードの取得に失敗しました。後でもう一度お試しください。');
      console.error('Failed to fetch episode:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 初回レンダリング時にデータを取得
  useEffect(() => {
    if (episodeId) {
      loadEpisode();
    }
  }, [episodeId]);

  // ホームに戻る処理
  const handleGoBack = () => {
    router.push('/');
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center">
        <button
          onClick={handleGoBack}
          className="inline-flex items-center mr-4 text-blue-500 hover:text-blue-700"
        >
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          戻る
        </button>
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
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : episode ? (
        <EpisodeDetail episode={episode} />
      ) : null}
    </Layout>
  );
}
