import React, { useState, useEffect } from 'react';
import { EpisodeSummary, Episode, Language } from '@/types';
import Link from 'next/link';
import { fetchEpisodeById, getEpisodeEnglishAudioUrls, getEpisodeJapaneseAudioUrls } from '@/services/news/newsService';
import { useAudio } from '@/contexts/AudioContext';
import LanguageToggle from '@/components/ui/LanguageToggle';

interface EpisodeListProps {
  episodes: EpisodeSummary[];
}

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes }) => {
  const { playPlaylist, nowPlaying, pause, resumePlayback, setLanguage } = useAudio();
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingEpisodes, setPlayingEpisodes] = useState<Record<string, boolean>>({});
  const [language, setPreferredLanguage] = useState<Language>('ja');

  // 現在再生中のエピソードの状態を監視
  useEffect(() => {
    const newPlayingState: Record<string, boolean> = {};
    
    if (nowPlaying?.episodeId && nowPlaying.isPlaylist) {
      newPlayingState[nowPlaying.episodeId] = nowPlaying.isPlaying;
    }
    
    setPlayingEpisodes(newPlayingState);
  }, [nowPlaying]);

  // エピソードの再生/一時停止を切り替え
  const handlePlayToggle = async (episodeId: string) => {
    // 既に再生中の場合は一時停止
    if (playingEpisodes[episodeId]) {
      pause();
      return;
    }
    
    // 一時停止中の同じエピソードなら再開
    if (nowPlaying?.episodeId === episodeId && !nowPlaying.isPlaying) {
      resumePlayback();
      return;
    }
    
    // そうでなければ新しく再生開始
    setIsLoading(true);
    setError(null);

    try {
      const episodeData = await fetchEpisodeById(episodeId);
      if (episodeData) {
        // フッターで直接再生
        playEpisode(episodeData);
      } else {
        setError('エピソードの取得に失敗しました');
      }
    } catch (err) {
      setError('エピソードの取得中にエラーが発生しました');
      console.error('Failed to fetch episode:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // エピソードをフッターで再生
  const playEpisode = (episode: Episode) => {
    const englishAudioUrls = getEpisodeEnglishAudioUrls(episode);
    const japaneseAudioUrls = getEpisodeJapaneseAudioUrls(episode);
    
    // 選択された言語で再生（対応する言語がなければ他方を使用）
    let selectedLanguage = language;
    if (selectedLanguage === 'ja' && japaneseAudioUrls.length === 0) {
      selectedLanguage = 'en';
    } else if (selectedLanguage === 'en' && englishAudioUrls.length === 0) {
      selectedLanguage = 'ja';
    }
    
    playPlaylist(
      episode.episode_id,
      episode.title,
      {
        ja: japaneseAudioUrls,
        en: englishAudioUrls
      },
      selectedLanguage
    );
  };
  
  // 言語切り替え処理
  const handleLanguageChange = (newLanguage: Language) => {
    setPreferredLanguage(newLanguage);
    
    // 現在再生中のエピソードがある場合は言語を切り替える
    if (nowPlaying?.isPlaylist && nowPlaying.isPlaying) {
      setLanguage(newLanguage);
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
      
      {/* 言語切り替え */}
      <div className="mb-6 flex justify-end">
        <LanguageToggle 
          language={language} 
          onChange={handleLanguageChange} 
        />
      </div>

      {/* エピソード一覧 */}
      <div className="space-y-4">
        {episodes.map((episode) => {
          // 日付文字列をDate型に変換
          const episodeDate = new Date(episode.created_at);

          return (
            <div
              key={episode.episode_id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start">
                  {/* 再生/一時停止ボタン（左側に配置） - 大きく */}
                  <button
                    onClick={() => handlePlayToggle(episode.episode_id)}
                    className="mr-4 p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center"
                    disabled={isLoading}
                    aria-label={playingEpisodes[episode.episode_id] ? '一時停止' : 'フッターで再生'}
                  >
                    {isLoading && selectedEpisode?.episode_id === episode.episode_id ? (
                      <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : playingEpisodes[episode.episode_id] ? (
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
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
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            {episode.source}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {episodeDate.toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-500">
                        {episode.article_count}件の記事
                      </p>
                      
                      {/* 詳細リンクを明示的に表示 */}
                      <div className="mt-3">
                        <Link 
                          href={`/episodes/${episode.episode_id}`}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50"
                        >
                          <span>詳細を表示</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
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
