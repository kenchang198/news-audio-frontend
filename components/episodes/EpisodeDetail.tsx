import React, { useState, useEffect } from 'react';
import { Episode } from '@/types';
import ArticleItem from './ArticleItem';
import { getEpisodeEnglishAudioUrls, getEpisodeJapaneseAudioUrls } from '@/services/news/newsService';
import { useAudio } from '@/contexts/AudioContext';

interface EpisodeDetailProps {
  episode: Episode;
}

const EpisodeDetail: React.FC<EpisodeDetailProps> = ({ episode }) => {
  const { playPlaylist, nowPlaying, pause, resumePlayback } = useAudio();
  const [isJaPlaying, setIsJaPlaying] = useState(false);
  const [isEnPlaying, setIsEnPlaying] = useState(false);
  
  // 再生状態を監視して更新
  useEffect(() => {
    if (nowPlaying?.episodeId === episode.episode_id) {
      if (nowPlaying.language === 'ja') {
        setIsJaPlaying(nowPlaying.isPlaying);
        setIsEnPlaying(false);
      } else if (nowPlaying.language === 'en') {
        setIsEnPlaying(nowPlaying.isPlaying);
        setIsJaPlaying(false);
      }
    } else {
      setIsJaPlaying(false);
      setIsEnPlaying(false);
    }
  }, [nowPlaying, episode.episode_id]);
  
  // 日付文字列をDate型に変換
  const episodeDate = new Date(episode.created_at);
  
  // エピソード全体の音声URL
  const englishAudioUrls = getEpisodeEnglishAudioUrls(episode);
  const japaneseAudioUrls = getEpisodeJapaneseAudioUrls(episode);
  
  // フッターでエピソード全体を再生/一時停止
  const handlePlayToggle = (language: 'ja' | 'en') => {
    const isPlaying = language === 'ja' ? isJaPlaying : isEnPlaying;
    
    if (isPlaying) {
      // 再生中なら一時停止
      pause();
    } else if (nowPlaying?.episodeId === episode.episode_id && 
               nowPlaying.language === language && 
               !nowPlaying.isPlaying) {
      // 一時停止中の同じエピソードなら再開
      resumePlayback();
    } else {
      // 新規再生開始
      playPlaylist(
        episode.episode_id,
        episode.title,
        {
          ja: japaneseAudioUrls,
          en: englishAudioUrls
        },
        language
      );
    }
  };
  
  // 音声が存在するかどうか
  const hasAudio = japaneseAudioUrls.length > 0 || englishAudioUrls.length > 0;
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">
        {episode.title}
      </h2>
      
      <div className="text-sm text-gray-500 mb-4">
        {episodeDate.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })} - {episode.source}
      </div>
      
      {/* エピソード全体の再生ボタン */}
      <div className="mb-8 flex space-x-4">
        <button
          onClick={() => handlePlayToggle('ja')}
          disabled={japaneseAudioUrls.length === 0}
          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${
            japaneseAudioUrls.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isJaPlaying ? (
            <>
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              日本語のエピソードを一時停止
            </>
          ) : (
            <>
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7-11-7z" />
              </svg>
              日本語でエピソード全体を再生
            </>
          )}
        </button>
        
        <button
          onClick={() => handlePlayToggle('en')}
          disabled={englishAudioUrls.length === 0}
          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${
            englishAudioUrls.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isEnPlaying ? (
            <>
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              英語のエピソードを一時停止
            </>
          ) : (
            <>
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7-11-7z" />
              </svg>
              英語でエピソード全体を再生
            </>
          )}
        </button>
      </div>
      
      {/* 記事一覧 */}
      <h3 className="text-xl font-semibold mb-4 border-b pb-2">記事一覧</h3>
      
      {episode.articles.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">このエピソードには記事がありません</p>
        </div>
      ) : (
        <div className="space-y-6">
          {episode.articles.map((article) => (
            <ArticleItem key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EpisodeDetail;
