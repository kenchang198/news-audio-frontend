import React from 'react';
import { EpisodeSummary } from '@/types';
import Link from 'next/link';

interface EpisodeListProps {
  episodes: EpisodeSummary[];
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
      {episodes.map((episode) => {
        // 日付文字列をDate型に変換
        const episodeDate = new Date(episode.created_at);

        return (
          <div
            key={episode.episode_id}
            className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <Link href={`/episodes/${episode.episode_id}`} className="block p-4">
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
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default EpisodeList;
