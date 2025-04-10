import React from 'react';
import { Episode } from '@/types';
import ArticleItem from './ArticleItem';

interface EpisodeDetailProps {
  episode: Episode;
}

const EpisodeDetail: React.FC<EpisodeDetailProps> = ({ episode }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        {new Date(episode.date).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}のエピソード
      </h2>
      
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
