import React from 'react';
import { Episode } from '@/types';
import ArticleItem from './ArticleItem';
import { getEpisodeEnglishAudioUrls, getEpisodeJapaneseAudioUrls } from '@/services/news/newsService';
import { useAudio } from '@/contexts/AudioContext';

interface EpisodeDetailProps {
  episode: Episode;
}

const EpisodeDetail: React.FC<EpisodeDetailProps> = ({ episode }) => {
  const { playPlaylist } = useAudio();
  
  // 日付文字列をDate型に変換
  const episodeDate = new Date(episode.created_at);
  
  // エピソード全体の音声URL
  const englishAudioUrls = getEpisodeEnglishAudioUrls(episode);
  const japaneseAudioUrls = getEpisodeJapaneseAudioUrls(episode);
  
  // フッターでエピソード全体を再生
  const handlePlayAll = (language: 'ja' | 'en') => {
    playPlaylist(
      episode.episode_id,
      episode.title,
      {
        ja: japaneseAudioUrls,
        en: englishAudioUrls
      },
      language
    );
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
          onClick={() => handlePlayAll('ja')}
          disabled={japaneseAudioUrls.length === 0}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            japaneseAudioUrls.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          日本語でエピソード全体を再生
        </button>
        
        <button
          onClick={() => handlePlayAll('en')}
          disabled={englishAudioUrls.length === 0}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            englishAudioUrls.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          英語でエピソード全体を再生
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
