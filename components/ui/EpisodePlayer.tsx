import React, { useState, useRef, useEffect } from 'react';
import { Language } from '@/types';
import LanguageToggle from './LanguageToggle';
import { SimpleBGM } from '../audio/SimpleBGM';

interface EpisodePlayerProps {
  englishAudioUrls: string[];
  japaneseAudioUrls: string[];
  defaultLanguage?: Language;
  title?: string;
  showLanguageToggle?: boolean;
}

const EpisodePlayer: React.FC<EpisodePlayerProps> = ({
  englishAudioUrls,
  japaneseAudioUrls,
  defaultLanguage = 'ja',
  title,
  showLanguageToggle = true,
}) => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // 現在の言語の音声URLリスト
  const audioUrls = language === 'ja' ? japaneseAudioUrls : englishAudioUrls;
  
  // 音声が存在するかどうか
  const hasAudio = audioUrls.length > 0;
  
  // 音声のURL
  const currentAudioUrl = hasAudio ? audioUrls[currentTrackIndex] : '';
  
  // 音声の総数
  const totalTracks = audioUrls.length;
  
  // 再生/一時停止の切り替え
  const togglePlay = () => {
    if (!hasAudio) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  // 次の音声へ
  const nextTrack = () => {
    if (!hasAudio) return;
    
    if (currentTrackIndex < totalTracks - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };
  
  // 前の音声へ
  const prevTrack = () => {
    if (!hasAudio) return;
    
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };
  
  // 言語切り替え時の処理
  const handleLanguageChange = (newLanguage: Language) => {
    const currentTime = audioRef.current?.currentTime || 0;
    const wasPlaying = isPlaying;
    
    setLanguage(newLanguage);
    
    // 音声が切り替わった後、同じ位置から再生を続ける
    // （ただし、言語によって記事数が異なる場合は最初から）
    if (language === 'ja' && newLanguage === 'en') {
      if (currentTrackIndex < englishAudioUrls.length) {
        // インデックスが有効なら同じインデックスを使用
        setCurrentTrackIndex(currentTrackIndex);
      } else {
        // インデックスが無効なら最初から
        setCurrentTrackIndex(0);
      }
    } else if (language === 'en' && newLanguage === 'ja') {
      if (currentTrackIndex < japaneseAudioUrls.length) {
        // インデックスが有効なら同じインデックスを使用
        setCurrentTrackIndex(currentTrackIndex);
      } else {
        // インデックスが無効なら最初から
        setCurrentTrackIndex(0);
      }
    }
    
    // audio要素の更新後に実行するために少し遅延させる
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = currentTime;
        if (wasPlaying) {
          audioRef.current.play().catch(() => {
            // 自動再生が許可されていない場合などのエラーを無視
          });
        }
      }
    }, 100);
  };
  

  
  // 音声の読み込み完了時
  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    
    setDuration(audioRef.current.duration);
  };
  
  // 再生時間の更新
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    
    setCurrentTime(audioRef.current.currentTime);
  };
  
  // 音声の再生終了時
  const handleEnded = () => {
    if (currentTrackIndex < totalTracks - 1) {
      // 次の音声がある場合
      setCurrentTrackIndex(currentTrackIndex + 1);
      
      // audio要素の更新後に再生を開始するために少し遅延させる
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {
            // 自動再生が許可されていない場合などのエラーを無視
          });
        }
      }, 100);
    } else {
      // 最後の音声の場合
      setIsPlaying(false);
      setCurrentTrackIndex(0);
      setCurrentTime(0);
    }
  };
  
  // audio要素のソース変更時
  useEffect(() => {
    if (!audioRef.current) return;
    
    // 音声が変更されたら現在時間をリセット
    setCurrentTime(0);
    
    // 再生中なら音声を切り替えた後も再生を継続
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentAudioUrl, isPlaying]);
  
  // 時間の表示フォーマット（MM:SS）
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <div>
      {title && (
        <div className="text-sm font-medium mb-2 text-gray-700">{title}</div>
      )}
      
      <audio
        ref={audioRef}
        src={currentAudioUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />
      
      <SimpleBGM isPlaying={isPlaying} />
      
      {hasAudio ? (
        <div className="bg-gray-100 rounded-full p-2 flex items-center space-x-2">
          {/* 前の音声ボタン */}
          <button 
            onClick={prevTrack}
            disabled={currentTrackIndex === 0}
            className={`text-gray-700 hover:text-gray-900 focus:outline-none p-1 ${currentTrackIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="前の音声"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          
          {/* 再生/停止ボタン */}
          <button
            onClick={togglePlay}
            className="text-gray-700 hover:text-gray-900 focus:outline-none p-1"
            aria-label={isPlaying ? '停止' : '再生'}
          >
            {isPlaying ? (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7-11-7z" />
              </svg>
            )}
          </button>
          
          {/* 次の音声ボタン */}
          <button 
            onClick={nextTrack}
            disabled={currentTrackIndex === totalTracks - 1}
            className={`text-gray-700 hover:text-gray-900 focus:outline-none p-1 ${currentTrackIndex === totalTracks - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="次の音声"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
          
          {/* 再生時間表示 */}
          <div className="text-sm text-gray-700 min-w-[75px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          {/* プログレスバー */}
          <div className="flex-1 relative h-2 bg-gray-300 rounded-full cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPosition = e.clientX - rect.left;
            const progressWidth = rect.width;
            const clickRatio = clickPosition / progressWidth;
            const newTime = duration * clickRatio;
            
            if (audioRef.current) {
              audioRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }
          }}>
            <div 
              className="h-2 bg-blue-500 rounded-full" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
          
          {/* 音声数カウンター */}
          <div className="text-xs text-gray-500">
            {currentTrackIndex + 1}/{totalTracks}
          </div>
          
          {/* 言語切り替え */}
          {showLanguageToggle && (
            <div className="ml-1">
              <LanguageToggle 
                language={language} 
                onChange={handleLanguageChange}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-100 rounded-full p-2 text-center text-sm text-gray-500">
          このエピソードの音声はありません
        </div>
      )}
    </div>
  );
};

export default EpisodePlayer;
