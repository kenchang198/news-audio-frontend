import React, { useEffect, useState } from 'react';
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

  // 現在の言語に対応する音声URLを取得
  const currentAudioUrl = audioUrls[language];

  // 音声再生が終了したときの処理
  useEffect(() => {
    audioUtils.onAudioEnded(() => {
      setIsPlaying(false);
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
    }
  }, [language]);

  // 言語切り替え処理
  const handleLanguageChange = (newLanguage: Language) => {
    onLanguageChange(newLanguage);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={togglePlayPause}
          disabled={!currentAudioUrl || isLoading}
          className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ${
            !currentAudioUrl
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isPlaying
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isPlaying ? '停止' : '再生'}
        </button>
        <LanguageToggle
          language={language}
          onChange={handleLanguageChange}
        />
      </div>

      {!currentAudioUrl && (
        <p className="text-sm text-gray-500">
          {language === 'ja' ? '日本語の音声は利用できません' : 'English audio is not available'}
        </p>
      )}
    </div>
  );
};

export default AudioPlayer;
