import React, { useState, useEffect } from 'react';
import { Article } from '@/types';
import { getEpisodeAudioUrl } from '@/services/news/newsService';
import { useAudio } from '@/contexts/AudioContext';

interface ArticleItemProps {
  article: Article;
  episodeId?: string; // エピソードIDを追加
}

const ArticleItem: React.FC<ArticleItemProps> = ({ article, episodeId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { play, nowPlaying, pause, resumePlayback } = useAudio();
  
  // 現在再生中かどうかを監視
  useEffect(() => {
    if (nowPlaying?.articleId === article.id) {
      setIsPlaying(nowPlaying.isPlaying);
    } else {
      setIsPlaying(false);
    }
  }, [nowPlaying, article.id]);

  const toAbsoluteUrl = (url: string) => {
    if (url && !url.startsWith('http') && typeof window !== 'undefined') {
      return window.location.origin + (url.startsWith('/') ? '' : '/') + url;
    }
    return url;
  };

  const summary = article.summary;
  
  // S3バケット直参照方式で音声URLを取得
  const audioUrl = episodeId 
    ? getEpisodeAudioUrl(episodeId)
    : toAbsoluteUrl(article.audio_url);

  // 再生ボタンのクリックハンドラ
  const handlePlayToggle = () => {
    if (isPlaying) {
      // 再生中なら停止
      pause();
    } else if (nowPlaying?.articleId === article.id && !nowPlaying.isPlaying) {
      // 一時停止中の同じ記事なら再開
      resumePlayback();
    } else {
      // 新規再生
      play(
        article.id,
        article.title,
        { ja: audioUrl },
        'ja'
      );
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-900">
          {article.title}
        </h3>
      </div>
      
      {article.link && (
        <div className="text-sm text-gray-500 mb-4">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            元記事リンク
          </a>
        </div>
      )}
      
      {summary ? (
        <div className="text-gray-700 mb-4 text-sm">
          <p>{summary}</p>
        </div>
      ) : (
        <div className="text-gray-500 mb-4 text-sm">要約は利用できません</div>
      )}
      
      <div className="mt-4">
        {/* 音声再生ボタン - TOPページと同様のデザイン（サイズ小さめ） */}
        {audioUrl ? (
          <button 
            onClick={handlePlayToggle}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center"
            aria-label={isPlaying ? '一時停止' : 'フッターで再生'}
          >
            {isPlaying ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7-11-7z" />
              </svg>
            )}
          </button>
        ) : (
          <div className="text-gray-500 text-sm">音声は利用できません</div>
        )}
      </div>
    </div>
  );
};

export default ArticleItem;
