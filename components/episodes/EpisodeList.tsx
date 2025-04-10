import React from 'react';
import { Episode } from '@/types';
import Link from 'next/link';

interface EpisodeListProps {
  episodes: Episode[];
}

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes }) => {
  if (episodes.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-500">エピソードがありません</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {episodes.map((episode) => (
        <div
          key={episode.id}
          className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          <Link href={`/episodes/${episode.id}`} className="block p-4">
            <h3 className="text-lg font-medium text-gray-900">
              {new Date(episode.date).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}のエピソード
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {episode.articles.length}件の記事
            </p>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default EpisodeList;
