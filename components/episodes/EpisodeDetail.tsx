import React from 'react';
import { Episode } from '@/types';
import ArticleItem from './ArticleItem';

interface EpisodeDetailProps {
  episode: Episode;
}

const EpisodeDetail: React.FC<EpisodeDetailProps> = ({ episode }) => {
  // 日付文字列をDate型に変換
  const episodeDate = new Date(episode.created_at);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">
        {episode.title}
      </h2>
      
      <div className="text-sm text-gray-500 mb-6">
        {episodeDate.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })} - {episode.source}
      </div>
      
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
