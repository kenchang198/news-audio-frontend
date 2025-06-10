import React, { useEffect, useState, useRef } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import * as audioUtils from '@/utils/audioPlayer';

const FooterPlayer: React.FC = () => {
  const { nowPlaying, pause, stop, nextTrack, prevTrack, setLanguage, isVisible, resumePlayback } = useAudio();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  // 再生時間の更新を監視
  useEffect(() => {
    if (!nowPlaying) return;

    const updateTime = () => {
      setCurrentTime(audioUtils.getCurrentTime());
    };

    const updateDuration = () => {
      const newDuration = audioUtils.getDuration();
      if (newDuration && newDuration > 0) {
        setDuration(newDuration);
      }
    };

    audioUtils.onTimeUpdate(updateTime);
    audioUtils.onLoadedMetadata(updateDuration);
    
    const audio = audioUtils.getAudioInstance();
    const handleLoadedData = () => {
      updateDuration();
    };
    audio.addEventListener('loadeddata', handleLoadedData);

    // 初期値設定
    setCurrentTime(audioUtils.getCurrentTime());
    const initialDuration = audioUtils.getDuration();
    if (initialDuration && initialDuration > 0) {
      setDuration(initialDuration);
    }

    return () => {
      audioUtils.onTimeUpdate(() => {});
      audioUtils.onLoadedMetadata(() => {});
      const audio = audioUtils.getAudioInstance();
      audio.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [nowPlaying]);

  // 再生/一時停止の切り替え
  const togglePlayPause = async () => {
    if (!nowPlaying) return;

    if (nowPlaying.isPlaying) {
      pause();
    } else {
      // 一時停止から再開する場合
      try {
        await audioUtils.resumeAudio();
        // 再生状態をコンテキストに反映
        resumePlayback();
      } catch (error) {
        console.error('Failed to resume audio:', error);
      }
    }
  };

  // 言語切り替え処理
  const handleLanguageChange = (newLanguage: 'ja' | 'en') => {
    setLanguage(newLanguage);
  };

  // プログレスバーのクリック処理
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !nowPlaying) return;
    
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

  // 表示/非表示の切り替え
  if (!nowPlaying || !isVisible) return null;

  // プレイリスト用の表示
  const isPlaylist = nowPlaying.isPlaylist;
  const currentTrackIndex = nowPlaying.currentTrackIndex || 0;
  const totalTracks = isPlaylist && nowPlaying.playlistUrls 
    ? (nowPlaying.language === 'ja' ? nowPlaying.playlistUrls.ja.length : nowPlaying.playlistUrls.en.length) 
    : 0;
  
  // 現在の言語に対応する音声URLの存在確認
  let currentAudioUrl: string | undefined;
  if (isPlaylist && nowPlaying.playlistUrls) {
    const urls = nowPlaying.language === 'ja' ? nowPlaying.playlistUrls.ja : nowPlaying.playlistUrls.en;
    currentAudioUrl = urls[currentTrackIndex];
  } else if (nowPlaying.audioUrls) {
    currentAudioUrl = nowPlaying.language === 'ja' ? nowPlaying.audioUrls.ja : nowPlaying.audioUrls.en;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          {/* タイトル */}
          <div className="flex-shrink-0 max-w-xs overflow-hidden">
            <p className="text-sm font-medium text-gray-800 truncate">{nowPlaying.title}</p>
            {isPlaylist && (
              <p className="text-xs text-gray-500">
                トラック {currentTrackIndex + 1} / {totalTracks}
              </p>
            )}
          </div>
          
          {/* プレーヤーコントロール */}
          <div className="flex-1">
            <div className="bg-gray-100 rounded-full p-2 flex items-center space-x-2">
              {/* プレイリスト用の前へボタン */}
              {isPlaylist && (
                <button
                  onClick={prevTrack}
                  disabled={currentTrackIndex <= 0}
                  className={`text-gray-700 hover:text-gray-900 focus:outline-none p-1 ${currentTrackIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="前のトラック"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                  </svg>
                </button>
              )}
              
              {/* 再生/停止ボタン */}
              <button
                onClick={togglePlayPause}
                disabled={!currentAudioUrl}
                className={`text-gray-700 hover:text-gray-900 focus:outline-none p-1 ${!currentAudioUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label={nowPlaying.isPlaying ? '停止' : '再生'}
              >
                {nowPlaying.isPlaying ? (
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7-11-7z" />
                  </svg>
                )}
              </button>
              
              {/* プレイリスト用の次へボタン */}
              {isPlaylist && (
                <button
                  onClick={nextTrack}
                  disabled={currentTrackIndex >= totalTracks - 1}
                  className={`text-gray-700 hover:text-gray-900 focus:outline-none p-1 ${currentTrackIndex >= totalTracks - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="次のトラック"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                  </svg>
                </button>
              )}
              
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
              
              {/* 言語切り替え - Issue #1で削除 */}
              
              {/* 閉じるボタン */}
              <button
                onClick={stop}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="閉じる"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterPlayer;
