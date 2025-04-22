import React, { useState, useEffect, useRef } from 'react';
import { fetchEpisodes, Episode } from '../lib/api';

const IndexPage: React.FC = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [page, setPage] = useState(1);
  const limit = 5;
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchEpisodes(page, limit).then(data => setEpisodes(data.episodes));
  }, [page]);

  const handleSelectEpisode = (index: number) => {
    setSelectedTrackIndex(index);
  };

  const renderPagination = () => (
    <div style={{ margin: '10px 0' }}>
      <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
        前へ
      </button>
      <span style={{ margin: '0 10px' }}>ページ {page}</span>
      <button onClick={() => setPage(page + 1)}>次へ</button>
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>エピソード一覧</h1>
      {renderPagination()}
      <ul>
        {episodes.map((episode, index) => (
          <li key={episode.id} style={{ marginBottom: '10px' }}>
            <div>{episode.title}</div>
            <div>{episode.description}</div>
            <button onClick={() => handleSelectEpisode(index)}>再生する</button>
          </li>
        ))}
      </ul>
      {selectedTrackIndex !== null && (
        <AudioPlayer playlist={episodes.slice(selectedTrackIndex).map(ep => ep.audioUrl)} />
      )}
    </div>
  );
};

interface AudioPlayerProps {
  playlist: string[];
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ playlist }) => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleEnded = () => {
      if (currentTrack < playlist.length - 1) {
        setCurrentTrack(currentTrack + 1);
      }
    };
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleEnded);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [currentTrack, playlist]);

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>オーディオプレーヤー</h2>
      <audio ref={audioRef} controls autoPlay src={playlist[currentTrack]} />
    </div>
  );
};

export default IndexPage; 