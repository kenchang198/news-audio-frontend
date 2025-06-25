import React, { useState, useEffect } from 'react';
import { EpisodeSummary, Episode } from '@/types';
import { getEpisodeAudioUrl, fetchEpisodeById } from '@/services/news/newsService';
import { useAudio } from '@/contexts/AudioContext';
import { formatEpisodeTitle } from '@/utils/dateUtils';

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
  
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<string>>(new Set());
  const [episodeDetails, setEpisodeDetails] = useState<Record<string, Episode>>({});
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

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
  const handlePlayToggle = async (episodeId: string, episodeTitle: string, createdAt: string) => {
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
      // S3バケット直参照方式で音声URLを取得
      const audioUrl = getEpisodeAudioUrl(episodeId);
      
      console.log('Playing episode with S3 URL:', audioUrl);

      play(
        episodeId,
        episodeTitle,
        { ja: audioUrl },
        'ja',
        createdAt
      );
    } catch (err) {
      setError('エピソードの再生に失敗しました');
      console.error('Failed to play episode:', err);
    } finally {
      setIsLoading(false);
      setSelectedEpisode(null);
    }
  };

  const handleShowNoteToggle = async (episodeId: string) => {
    const isExpanded = expandedEpisodes.has(episodeId);
    
    if (isExpanded) {
      const newExpanded = new Set(expandedEpisodes);
      newExpanded.delete(episodeId);
      setExpandedEpisodes(newExpanded);
    } else {
      const newExpanded = new Set(expandedEpisodes);
      newExpanded.add(episodeId);
      setExpandedEpisodes(newExpanded);
      
      if (!episodeDetails[episodeId]) {
        const newLoading = new Set(loadingDetails);
        newLoading.add(episodeId);
        setLoadingDetails(newLoading);
        
        try {
          const details = await fetchEpisodeById(episodeId);
          if (details) {
            setEpisodeDetails(prev => ({
              ...prev,
              [episodeId]: details
            }));
          }
        } catch (err) {
          console.error('Failed to fetch episode details:', err);
        } finally {
          const newLoading = new Set(loadingDetails);
          newLoading.delete(episodeId);
          setLoadingDetails(newLoading);
        }
      }
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

          const isExpanded = expandedEpisodes.has(episode.episode_id);
          const isLoadingDetails = loadingDetails.has(episode.episode_id);
          const details = episodeDetails[episode.episode_id];

          return (
            <div
              key={episode.episode_id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start">
                  {/* 再生/一時停止ボタン（左側に配置） - 大きく */}
                  <button
                    onClick={() => handlePlayToggle(episode.episode_id, episode.title, episode.created_at)}
                    className="mr-4 p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center"
                    disabled={isLoadingThis}
                    aria-label={isPlayingThis ? '一時停止' : 'フッターで再生'}
                  >
                    {isLoadingThis ? (
                      <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : isPlayingThis ? (
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7-11-7z" />
                      </svg>
                    )}
                  </button>
                  
                  {/* エピソード情報 - クリック可能エリア */}
                  <div 
                    className="flex-1 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                    onClick={() => handleShowNoteToggle(episode.episode_id)}
                  >
                    <div className="block">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {formatEpisodeTitle(episode.episode_id, episode.created_at)}
                        </h3>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-1">Show Notes</span>
                          <svg 
                            className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-500">
                          {('source' in episode) && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                              {(episode as EpisodeSummary & { source: string }).source}
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
                          {(episode as EpisodeSummary & { article_count: number }).article_count}件の記事
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Show Notes section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Show Notes</h4>
                    
                    {isLoadingDetails ? (
                      <div className="flex items-center justify-center py-4">
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="ml-2 text-sm text-gray-500">記事を読み込み中...</span>
                      </div>
                    ) : details && details.articles && details.articles.length > 0 ? (
                      <ul className="space-y-2">
                        {details.articles.map((article, index) => (
                          <li key={article.id || index} className="flex items-start">
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                            <div className="flex-1">
                              {article.link ? (
                                <a
                                  href={article.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {article.title}
                                </a>
                              ) : (
                                <span className="text-sm text-gray-700">
                                  {article.title}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">記事情報が見つかりませんでした。</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EpisodeList;
