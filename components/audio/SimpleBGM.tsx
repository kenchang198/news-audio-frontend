import { useEffect, useRef } from 'react';

interface SimpleBGMProps {
  isPlaying: boolean;
}

export const SimpleBGM = ({ isPlaying }: SimpleBGMProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 初期化時に音量を設定
    audio.volume = 0.15;

    if (isPlaying) {
      // 音声再生開始
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .catch((error) => {
            // ユーザーがまだページと interaction していない場合のエラーを無視
            if (error.name !== 'NotAllowedError') {
              console.error('BGM再生エラー:', error);
            }
          });
      }
    } else {
      audio.pause();
      audio.currentTime = 0; // 停止時にリセット
    }
  }, [isPlaying]);

  // コンポーネントマウント時の初期化
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 音量を初期設定
    audio.volume = 0.15;

    // エラーハンドリング
    const handleError = (event: Event) => {
      console.error('BGMファイル読み込みエラー:', event);
    };

    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      src="/audio/bgm/background.mp3"
      loop
      preload="auto"
    />
  );
};