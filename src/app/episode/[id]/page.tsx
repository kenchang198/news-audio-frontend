'use client';

import { useState, useEffect, useRef } from 'react';
import { getEpisodeById } from '@/lib/api';
import Link from 'next/link';
import { NewsItem } from '@/components/NewsCard';

interface EpisodeData {
  episode_id: string;
  title: string;
  created_at: string;
  articles: NewsItem[];
}

export default function EpisodePage({ params }: { params: { id: string } }) {
  const [episode, setEpisode] = useState<EpisodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    async function loadEpisode() {
      try {
        const data = await getEpisodeById(params.id);
        if (data) {
          setEpisode(data);
        } else {
          setError('エピソードが見つかりませんでした');
        }
        setLoading(false);
      } catch (err) {
        setError('エピソードデータの取得に失敗しました');
        setLoading(false);
        console.error(err);
      }
    }

    loadEpisode();
  }, [params.id]);

  useEffect(() => {
    if (!episode || !audioRef.current) return;

    const audio = audioRef.current;

    const handleEnded = () => {
      // 次の記事に進む
      if (currentArticleIndex < episode.articles.length - 1) {
        setCurrentArticleIndex(prev => prev + 1);
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

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [episode, currentArticleIndex]);

  // 再生、一時停止を切り替える
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 特定の記事を選択して再生する
  const playArticle = (index: number) => {
    setCurrentArticleIndex(index);
    setIsPlaying(true);
    // 次のレンダリング後に再生するため、setTimeout を使用
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <p>エピソードデータを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error || 'エピソードデータの取得に失敗しました'}
        </div>
        <Link href="/" className="text-blue-500 hover:underline">
          ← エピソード一覧に戻る
        </Link>
      </div>
    );
  }

  const currentArticle = episode.articles[currentArticleIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
        ← エピソード一覧に戻る
      </Link>
      
      <h1 className="text-3xl font-bold mb-2">{episode.title}</h1>
      <p className="text-gray-600 mb-6">
        {new Date(episode.created_at).toLocaleDateString()} - {episode.articles.length}件の記事
      </p>
      
      {/* 音声プレーヤー */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-8">
        <audio 
          ref={audioRef}
          src={currentArticle?.audio_url}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">
            再生中: {currentArticleIndex + 1}/{episode.articles.length}
          </h3>
          <p className="font-medium">{currentArticle?.title}</p>
          <p className="text-sm text-gray-600">{currentArticle?.source}</p>
        </div>
        
        {/* プログレスバー */}
        <div className="w-full bg-gray-300 rounded-full h-2.5 mb-4">
          <div 
            className="bg-blue-500 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* コントロール */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlayback}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full"
            >
              {isPlaying ? '⏸' : '▶️'}
            </button>
            
            <div>
              <button
                onClick={() => playArticle(Math.max(currentArticleIndex - 1, 0))}
                disabled={currentArticleIndex === 0}
                className={`p-2 ${currentArticleIndex === 0 ? 'text-gray-400' : 'text-blue-500 hover:text-blue-600'}`}
              >
                ⏮️ 前の記事
              </button>
              
              <button
                onClick={() => playArticle(Math.min(currentArticleIndex + 1, episode.articles.length - 1))}
                disabled={currentArticleIndex === episode.articles.length - 1}
                className={`p-2 ml-4 ${currentArticleIndex === episode.articles.length - 1 ? 'text-gray-400' : 'text-blue-500 hover:text-blue-600'}`}
              >
                次の記事 ⏭️
              </button>
            </div>
          </div>
          
          <Link
            href={currentArticle?.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            元記事を読む →
          </Link>
        </div>
      </div>
      
      {/* エピソード内の記事一覧 */}
      <h2 className="text-2xl font-semibold mb-4">このエピソードの記事一覧</h2>
      <div className="divide-y">
        {episode.articles.map((article, index) => (
          <div 
            key={article.id}
            className={`py-4 ${currentArticleIndex === index ? 'bg-blue-50' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{article.title}</h3>
                <p className="text-sm text-gray-600">{article.source}</p>
              </div>
              <button
                onClick={() => playArticle(index)}
                className={`px-4 py-2 rounded-md ${
                  currentArticleIndex === index && isPlaying
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {currentArticleIndex === index && isPlaying ? '再生中' : '再生'}
              </button>
            </div>
            <p className="mt-2">{article.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}