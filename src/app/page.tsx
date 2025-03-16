// src/app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { getEpisodesList, getEpisodeById } from '@/lib/api';

// エピソードの型定義
interface Episode {
  episode_id: string;
  title: string;
  created_at: string;
  article_count?: number;
  article_titles?: string[]; // 記事タイトルのリスト
}

// エピソード詳細の型定義
interface EpisodeDetail {
  episode_id: string;
  title: string;
  created_at: string;
  articles: Array<{
    id: string;
    title: string;
    link: string;
    source: string;
    summary: string;
    audio_url: string;
    processed_at: string;
  }>;
}

// ページネーションの設定
const EPISODES_PER_PAGE = 10;

export default function Home() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState<EpisodeDetail | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showAllTitles, setShowAllTitles] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getEpisodesList();
        console.log('取得したエピソードデータ:', data);
        
        // オブジェクトから配列に変換（もし配列でない場合）
        let episodesArray = data;
        if (!Array.isArray(data) && typeof data === 'object') {
          episodesArray = Object.keys(data).map(key => {
            const episode = data[key];
            return {
              episode_id: episode.episode_id,
              title: episode.title,
              created_at: episode.created_at,
              article_count: episode.articles?.length || 0,
              // 記事タイトルも追加
              article_titles: episode.articles?.map(a => a.title) || []
            };
          });
          
          // 日付でソート（新しい順）
          episodesArray.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        
        const sortedEpisodes = Array.isArray(episodesArray) ? episodesArray : [];
        setEpisodes(sortedEpisodes);
        
        // データ取得後、最新のエピソードを自動選択
        if (sortedEpisodes.length > 0) {
          loadLatestEpisode(sortedEpisodes[0].episode_id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('エピソード取得エラー:', err);
        setError('エピソードリストの取得に失敗しました');
        setEpisodes([]);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // 最新エピソードを読み込む
  const loadLatestEpisode = async (episodeId: string) => {
    try {
      setLoading(true);
      const episodeData = await getEpisodeById(episodeId);
      
      if (episodeData) {
        setCurrentEpisode(episodeData);
        setCurrentArticleIndex(0);
        setLoading(false);
        // 自動再生はしない
      }
    } catch (err) {
      console.error('最新エピソード読み込みエラー:', err);
      setLoading(false);
    }
  };

  // エピソード再生処理
  const playEpisode = async (episodeId: string) => {
    try {
      // 現在のエピソードと異なる場合、新しいエピソードを読み込む
      if (!currentEpisode || currentEpisode.episode_id !== episodeId) {
        setLoading(true);
        const episodeData = await getEpisodeById(episodeId);
        
        if (episodeData) {
          setCurrentEpisode(episodeData);
          setCurrentArticleIndex(0);
          setIsPlaying(true);
          setLoading(false);
          
          // 次のレンダリング後に再生を始める
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play()
                .catch(e => console.error('音声再生エラー:', e));
            }
          }, 0);
        }
      } else {
        // 既に読み込まれているエピソードの場合は再生/一時停止を切り替え
        togglePlayback();
      }
    } catch (err) {
      console.error('エピソード詳細取得エラー:', err);
      setError('エピソードの読み込みに失敗しました');
      setLoading(false);
    }
  };

  // 再生/一時停止の切り替え
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play()
        .catch(e => console.error('音声再生エラー:', e));
    }
    setIsPlaying(!isPlaying);
  };

  // 再生位置の変更
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setProgress(newTime);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (newTime / 100) * audioRef.current.duration;
    }
  };

  // 音量の変更
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // 音声の進行状況の更新
  useEffect(() => {
    if (!currentEpisode || !audioRef.current) return;

    const audio = audioRef.current;

    const handleEnded = () => {
      // 次の記事に進む
      if (currentArticleIndex < currentEpisode.articles.length - 1) {
        setCurrentArticleIndex(prev => prev + 1);
        // 次のレンダリング後に再生
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play()
              .catch(e => console.error('音声再生エラー:', e));
          }
        }, 0);
      } else {
        setIsPlaying(false);
      }
    };

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', () => setIsPlaying(true));
      audio.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, [currentEpisode, currentArticleIndex]);

  // ページネーション計算
  const pageCount = Math.ceil(episodes.length / EPISODES_PER_PAGE);
  const paginatedEpisodes = episodes.slice(
    (currentPage - 1) * EPISODES_PER_PAGE,
    currentPage * EPISODES_PER_PAGE
  );

  // 現在再生中の記事情報
  const currentArticle = currentEpisode?.articles[currentArticleIndex];

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">ITニュース音声要約</h1>
      
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* 音声プレイヤー（現在再生中のエピソードがある場合） */}
      {currentEpisode && (
        <div className="bg-black text-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">
              {new Date(currentEpisode.created_at).toLocaleDateString()}
            </h2>
            
            {/* 記事タイトル一覧 - クリックで開閉 */}
            <div 
              className="bg-gray-800 p-3 rounded cursor-pointer"
              onClick={() => setShowAllTitles(!showAllTitles)}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">記事一覧</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 transition-transform ${showAllTitles ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {showAllTitles && (
                <ul className="mt-2 space-y-1 pl-2 border-l-2 border-gray-700">
                  {currentEpisode.articles.map((article, idx) => (
                    <li key={article.id} className="text-sm text-gray-300">
                      {idx + 1}. {article.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* オーディオ要素 */}
          {currentArticle && (
            <audio 
              ref={audioRef}
              src={currentArticle.audio_url}
              className="hidden"
            />
          )}
          
          {/* プログレスバー */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>
          
          {/* コントロール */}
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center">
              <button
                onClick={togglePlayback}
                className="bg-white text-black p-3 rounded-full hover:bg-gray-200 mr-4"
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
              
              {/* 現在再生中の記事タイトル */}
              <div className="text-sm">
                再生中: {currentArticleIndex + 1}/{currentEpisode.articles.length} - {currentArticle?.title}
              </div>
            </div>
            
            {/* 音量コントロール */}
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* エピソード一覧 */}
      <h2 className="text-2xl font-semibold mb-4">エピソード一覧</h2>
      
      {/* ローディング表示 */}
      {loading && !currentEpisode ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2">データを読み込み中...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {paginatedEpisodes.map((episode) => (
            <div
              key={episode.episode_id}
              onClick={() => playEpisode(episode.episode_id)}
              className={`p-4 rounded-md cursor-pointer transition-colors ${
                currentEpisode?.episode_id === episode.episode_id
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <div className="mr-4">
                  {currentEpisode?.episode_id === episode.episode_id && isPlaying ? (
                    <div className="w-10 h-10 flex items-center justify-center text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V5m7 14V5" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">
                    {new Date(episode.created_at).toLocaleDateString()}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {episode.article_titles?.slice(0, 3).map((title, index) => (
                      <span key={index}>
                        {index > 0 }「{title}」
                      </span>
                    ))}
                    {episode.article_titles && episode.article_titles.length > 3 ? '...' : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* ページネーション */}
      {pageCount > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => setCurrentPage(current => Math.max(current - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-l-md ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
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
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              次へ
            </button>
          </nav>
        </div>
      )}
    </main>
  );
}