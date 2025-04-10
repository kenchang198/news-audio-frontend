import React, { useEffect, useState, useRef } from 'react';
import { Language } from '@/types';
import * as audioUtils from '@/utils/audioPlayer';
import LanguageToggle from './LanguageToggle';

interface AudioPlayerProps {
  articleId: string;
  audioUrls: {
    ja?: string;
    en?: string;
  };
  language: Language;
  onLanguageChange: (language: Language) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  articleId,
  audioUrls,
  language,
  onLanguageChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // 現在の言語に対応する音声URLを取得
  const currentAudioUrl = audioUrls[language];

  // 音声再生が終了したときの処理
  useEffect(() => {
    audioUtils.onAudioEnded(() => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    // 再生時間の更新を監視
    audioUtils.onTimeUpdate(() => {
      setCurrentTime(audioUtils.getCurrentTime());
    });

    // 音声メタデータの読み込み完了時に総再生時間を設定
    audioUtils.onLoadedMetadata(() => {
      setDuration(audioUtils.getDuration());
    });

    // コンポーネントのクリーンアップ
    return () => {
      audioUtils.stopAudio();
    };
  }, []);

  // 再生/一時停止の切り替え
  const togglePlayPause = async () => {
    if (!currentAudioUrl) return;
    
    if (isPlaying) {
      audioUtils.pauseAudio();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        await audioUtils.playAudio(currentAudioUrl);
        setIsPlaying(true);
      } catch (error) {
        console.error('Failed to play audio:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 言語が変更されたときに再生を停止
  useEffect(() => {
    if (isPlaying) {
      audioUtils.stopAudio();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [language]);

  // 言語切り替え処理
  const handleLanguageChange = (newLanguage: Language) => {
    onLanguageChange(newLanguage);
  };

  // ミュート切り替え
  const toggleMute = () => {
    const newMuteState = !isMuted;
    audioUtils.setVolume(newMuteState ? 0 : 1);
    setIsMuted(newMuteState);
  };

  // プログレスバーのクリック処理
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !currentAudioUrl) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const progressWidth = rect.width;
    const clickRatio = clickPosition / progressWidth;
    const newTime = duration * clickRatio;
    
    audioUtils.setCurrentTime(newTime);
    setCurrentTime(newTime);
  };

  // 再生時間のパーセント計算
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col space-y-2">
      {!currentAudioUrl && (
        <p className="text-sm text-gray-500">
          {language === 'ja' ? '日本語の音声は利用できません' : 'English audio is not available'}
        </p>
      )}
      
      {currentAudioUrl && (
        <div className="bg-gray-100 rounded-full p-2 flex items-center space-x-2">
          {/* 再生/停止ボタン */}
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="text-gray-700 hover:text-gray-900 focus:outline-none p-1"
            aria-label={isPlaying ? '停止' : '再生'}
          >
            {isLoading ? (
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isPlaying ? (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7-11-7z" />
              </svg>
            )}
          </button>
          
          {/* 再生時間表示 */}
          <div className="text-sm text-gray-700 min-w-[72px]">
            {audioUtils.formatTime(currentTime)} / {audioUtils.formatTime(duration)}
          </div>
          
          {/* プログレスバー */}
          <div 
            ref={progressRef}
            className="flex-1 h-2 bg-gray-300 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-2 bg-blue-500 rounded-full" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          
          {/* 音量ボタン */}
          <button
            onClick={toggleMute}
            className="text-gray-700 hover:text-gray-900 focus:outline-none p-1"
            aria-label={isMuted ? 'ミュート解除' : 'ミュート'}
          >
            {isMuted ? (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
          
          {/* メニューボタン（言語切り替えを含む） */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none p-1"
              aria-label="メニュー"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700">
                    <p className="font-medium mb-1">言語選択</p>
                    <LanguageToggle
                      language={language}
                      onChange={(newLang) => {
                        handleLanguageChange(newLang);
                        setIsMenuOpen(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
