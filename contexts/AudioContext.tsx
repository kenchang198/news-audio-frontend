import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language } from '@/types';
import * as audioUtils from '@/utils/audioPlayer';

interface NowPlaying {
  // 単一記事の場合はarticleId, プレイリストの場合はepisodeId
  articleId?: string | null;
  episodeId?: string | null;
  title: string;
  // 単一音声URL
  audioUrls?: {
    ja?: string;
    en?: string;
  };
  // プレイリスト用の音声URL配列
  playlistUrls?: {
    ja: string[];
    en: string[];
  };
  language: Language;
  isPlaying: boolean;
  // プレイリスト用のインデックス
  currentTrackIndex?: number;
  isPlaylist?: boolean;
}

interface AudioContextType {
  nowPlaying: NowPlaying | null;
  play: (articleId: string, title: string, audioUrls: { ja?: string; en?: string }, language: Language) => void;
  playPlaylist: (episodeId: string, title: string, playlistUrls: { ja: string[], en: string[] }, language: Language) => void;
  pause: () => void;
  stop: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setLanguage: (language: Language) => void;
  isVisible: boolean;
  showPlayer: () => void;
  hidePlayer: () => void;
}

const defaultAudioContext: AudioContextType = {
  nowPlaying: null,
  play: () => {},
  playPlaylist: () => {},
  pause: () => {},
  stop: () => {},
  nextTrack: () => {},
  prevTrack: () => {},
  setLanguage: () => {},
  isVisible: false,
  showPlayer: () => {},
  hidePlayer: () => {},
};

const AudioContext = createContext<AudioContextType>(defaultAudioContext);

export const useAudio = () => useContext(AudioContext);

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 音声の再生終了を監視
  useEffect(() => {
    audioUtils.onAudioEnded(() => {
      if (!nowPlaying) return;

      if (nowPlaying.isPlaylist && nowPlaying.playlistUrls) {
        // プレイリストの場合、次のトラックを再生
        const currentIndex = nowPlaying.currentTrackIndex || 0;
        const urls = nowPlaying.language === 'ja' ? nowPlaying.playlistUrls.ja : nowPlaying.playlistUrls.en;
        
        if (currentIndex < urls.length - 1) {
          // 次のトラックがある場合
          const nextIndex = currentIndex + 1;
          const nextUrl = urls[nextIndex];
          
          if (nextUrl) {
            setNowPlaying({
              ...nowPlaying,
              currentTrackIndex: nextIndex,
              isPlaying: true,
            });
            
            audioUtils.playAudio(nextUrl).catch((error) => {
              console.error('Failed to play next track:', error);
              setNowPlaying((prev) => prev ? { ...prev, isPlaying: false } : null);
            });
            return;
          }
        }
      }
      
      // プレイリストの最後または単一トラックの場合
      setNowPlaying((prev) => prev ? { ...prev, isPlaying: false } : null);
    });

    return () => {
      audioUtils.stopAudio();
    };
  }, [nowPlaying]);

  // 単一の音声を再生
  const play = (articleId: string, title: string, audioUrls: { ja?: string; en?: string }, language: Language) => {
    const currentUrl = language === 'ja' ? audioUrls.ja : audioUrls.en;
    
    if (!currentUrl) return;

    // 既に再生中の場合は停止
    if (nowPlaying?.isPlaying) {
      audioUtils.stopAudio();
    }

    setNowPlaying({
      articleId,
      title,
      audioUrls,
      language,
      isPlaying: true,
      isPlaylist: false,
    });

    setIsVisible(true);

    audioUtils.playAudio(currentUrl).catch((error) => {
      console.error('Failed to play audio:', error);
      setNowPlaying((prev) => prev ? { ...prev, isPlaying: false } : null);
    });
  };

  // プレイリスト（エピソード全体）を再生
  const playPlaylist = (episodeId: string, title: string, playlistUrls: { ja: string[], en: string[] }, language: Language) => {
    const urls = language === 'ja' ? playlistUrls.ja : playlistUrls.en;
    
    if (!urls.length) return;

    // 既に再生中の場合は停止
    if (nowPlaying?.isPlaying) {
      audioUtils.stopAudio();
    }

    setNowPlaying({
      episodeId,
      title,
      playlistUrls,
      language,
      isPlaying: true,
      currentTrackIndex: 0,
      isPlaylist: true,
    });

    setIsVisible(true);

    audioUtils.playAudio(urls[0]).catch((error) => {
      console.error('Failed to play audio:', error);
      setNowPlaying((prev) => prev ? { ...prev, isPlaying: false } : null);
    });
  };

  // 一時停止
  const pause = () => {
    if (!nowPlaying) return;

    audioUtils.pauseAudio();
    setNowPlaying({ ...nowPlaying, isPlaying: false });
  };

  // 停止
  const stop = () => {
    audioUtils.stopAudio();
    setNowPlaying(null);
    setIsVisible(false);
  };

  // 次のトラックへ
  const nextTrack = () => {
    if (!nowPlaying || !nowPlaying.isPlaylist || nowPlaying.currentTrackIndex === undefined) return;

    const urls = nowPlaying.language === 'ja' 
      ? nowPlaying.playlistUrls?.ja 
      : nowPlaying.playlistUrls?.en;
    
    if (!urls || nowPlaying.currentTrackIndex >= urls.length - 1) return;

    const nextIndex = nowPlaying.currentTrackIndex + 1;
    const nextUrl = urls[nextIndex];

    if (!nextUrl) return;

    audioUtils.stopAudio();

    setNowPlaying({
      ...nowPlaying,
      currentTrackIndex: nextIndex,
      isPlaying: true,
    });

    audioUtils.playAudio(nextUrl).catch((error) => {
      console.error('Failed to play next track:', error);
      setNowPlaying((prev) => prev ? { ...prev, isPlaying: false } : null);
    });
  };

  // 前のトラックへ
  const prevTrack = () => {
    if (!nowPlaying || !nowPlaying.isPlaylist || nowPlaying.currentTrackIndex === undefined) return;

    if (nowPlaying.currentTrackIndex <= 0) return;

    const urls = nowPlaying.language === 'ja' 
      ? nowPlaying.playlistUrls?.ja 
      : nowPlaying.playlistUrls?.en;
    
    if (!urls) return;

    const prevIndex = nowPlaying.currentTrackIndex - 1;
    const prevUrl = urls[prevIndex];

    if (!prevUrl) return;

    audioUtils.stopAudio();

    setNowPlaying({
      ...nowPlaying,
      currentTrackIndex: prevIndex,
      isPlaying: true,
    });

    audioUtils.playAudio(prevUrl).catch((error) => {
      console.error('Failed to play previous track:', error);
      setNowPlaying((prev) => prev ? { ...prev, isPlaying: false } : null);
    });
  };

  // 言語切り替え
  const setLanguage = (language: Language) => {
    if (!nowPlaying) return;

    let currentUrl: string | undefined;

    if (nowPlaying.isPlaylist && nowPlaying.playlistUrls) {
      // プレイリストの場合
      const urls = language === 'ja' ? nowPlaying.playlistUrls.ja : nowPlaying.playlistUrls.en;
      const index = nowPlaying.currentTrackIndex || 0;
      
      if (urls.length <= index) {
        // 対応する言語のプレイリストがない場合
        setNowPlaying({ ...nowPlaying, language, isPlaying: false });
        audioUtils.stopAudio();
        return;
      }
      
      currentUrl = urls[index];
    } else if (nowPlaying.audioUrls) {
      // 単一音声の場合
      currentUrl = language === 'ja' ? nowPlaying.audioUrls.ja : nowPlaying.audioUrls.en;
    }
    
    if (!currentUrl) {
      // 対応する言語の音声がない場合
      setNowPlaying({ ...nowPlaying, language, isPlaying: false });
      audioUtils.stopAudio();
      return;
    }

    const wasPlaying = nowPlaying.isPlaying;
    
    // 現在再生中なら一旦停止
    if (wasPlaying) {
      audioUtils.pauseAudio();
    }

    setNowPlaying({ ...nowPlaying, language, isPlaying: wasPlaying });

    // 再生中だった場合は新しい言語で再生開始
    if (wasPlaying) {
      audioUtils.playAudio(currentUrl).catch((error) => {
        console.error('Failed to play audio after language change:', error);
        setNowPlaying((prev) => prev ? { ...prev, isPlaying: false } : null);
      });
    }
  };

  // フッタープレーヤーの表示
  const showPlayer = () => {
    setIsVisible(true);
  };

  // フッタープレーヤーの非表示
  const hidePlayer = () => {
    setIsVisible(false);
  };

  return (
    <AudioContext.Provider
      value={{
        nowPlaying,
        play,
        playPlaylist,
        pause,
        stop,
        nextTrack,
        prevTrack,
        setLanguage,
        isVisible,
        showPlayer,
        hidePlayer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};