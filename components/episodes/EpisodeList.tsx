import React, { useState, useEffect } from 'react';
import { EpisodeSummary } from '@/types';
import { getEpisode } from '@/services/api';
import { useAudio } from '@/contexts/AudioContext';

interface EpisodeListProps {
  episodes: EpisodeSummary[];
}

// selectedEpisode の型を緩和するか、ローディング中のIDだけ持つようにする
// ここではローディング判定のためだけに使うので、IDとタイトルだけ持つ仮の型にする
interface LoadingEpisodeInfo {
  episode_id: string;
  title: string;
}

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes }) => {
  const { play, nowPlaying, pause, resumePlayback } = useAudio();
  // selectedEpisode はローディング表示のために使う。型を緩和する
  const [selectedEpisode, setSelectedEpisode] = useState<LoadingEpisodeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingEpisodes, setPlayingEpisodes] = useState<Record<string, boolean>>({});

  // 現在再生中のエピソードの状態を監視
  useEffect(() => {
    const newPlayingState: Record<string, boolean> = {};
    
    if (nowPlaying?.isPlaylist && nowPlaying.episodeId) {
      newPlayingState[nowPlaying.episodeId] = nowPlaying.isPlaying;
    } else if (!nowPlaying?.isPlaylist && nowPlaying?.articleId) {
      newPlayingState[nowPlaying.articleId] = nowPlaying.isPlaying;
    }
    
    setPlayingEpisodes(newPlayingState);
  }, [nowPlaying]);

  // エピソードの再生/一時停止を切り替え
  const handlePlayToggle = async (episodeId: string, episodeTitle: string) => {
    if (playingEpisodes[episodeId]) {
      pause();
      return;
    }
    
    if (!nowPlaying?.isPlaylist && nowPlaying?.articleId === episodeId && !nowPlaying.isPlaying) {
      resumePlayback();
      return;
    }
    
    setIsLoading(true);
    setSelectedEpisode({ episode_id: episodeId, title: episodeTitle });
    setError(null);

    try {
      const episodeData = await getEpisode(episodeId);

      if (episodeData && episodeData.audio_url) {
        const toAbsoluteUrl = (url: string) => {
          if (url && !url.startsWith('http') && typeof window !== 'undefined') {
            return window.location.origin + (url.startsWith('/') ? '' : '/') + url;
          }
          return url;
        };

        const audioUrl = toAbsoluteUrl(episodeData.audio_url);

        play(
          episodeId,
          episodeTitle,
          { ja: audioUrl },
          'ja'
        );
      } else if (episodeData) {
        setError('音声ファイルが見つかりません');
        console.warn(`No audio_url found for episode ${episodeId}`);
      } else {
        setError('エピソードの取得に失敗しました');
      }
    } catch (err) {
      setError('エピソードの取得に失敗しました');
      console.error('Failed to fetch episode:', err);
    } finally {
      setIsLoading(false);
      setSelectedEpisode(null);
    }
  };

  if (episodes.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-500">エピソードがありません</h3>
      </div>
    );
  }

  return (
    <div>
      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {/* エピソード一覧 */}
      <div className="space-y-4">
        {episodes.map((episode) => {
          // 日付文字列をDate型に変換
          const episodeDate = new Date(episode.created_at);
          const isLoadingThis = isLoading && selectedEpisode?.episode_id === episode.episode_id;
          const isPlayingThis = playingEpisodes[episode.episode_id] === true;

          return (
            <div
              key={episode.episode_id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start">
                  {/* 再生/一時停止ボタン（左側に配置） - 大きく */}
                  <button
                    onClick={() => handlePlayToggle(episode.episode_id, episode.title)}
                    className="mr-4 p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center"
                    disabled={isLoadingThis}
                    aria-label={isPlayingThis ? '一時停止' : 'フッターで再生'}
                  >
                    {isLoadingThis ? (
                      <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7-11-7z" />
                      </svg>
                    )}
                  </button>
                  
                  {/* エピソード情報 */}
                  <div className="flex-1">
                    <div className="block">
                      <h3 className="text-lg font-medium text-gray-900">
                        {episode.title}
                      </h3>
                      
                      <div className="mt-2 flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-500">
                          {('source' in episode) && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                              {(episode as any).source}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          {episodeDate.toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      
                      {('article_count' in episode) && (
                        <p className="mt-2 text-sm text-gray-500">
                          {(episode as any).article_count}件の記事
                        </p>
                      )}
                      
                      {/* 詳細リンクはMVPでは非表示 */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EpisodeList;
