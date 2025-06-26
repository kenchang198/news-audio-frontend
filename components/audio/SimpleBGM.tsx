import { useEffect, useRef } from 'react';

interface SimpleBGMProps {
  isPlaying: boolean;
}

export const SimpleBGM = ({ isPlaying }: SimpleBGMProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {
        console.log('BGM再生待機中...');
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  return (
    <audio
      ref={audioRef}
      src="/audio/bgm/background.mp3"
      loop
      volume={0.15}
      preload="auto"
    />
  );
};