// ソースURLをキャッシュしておく変数
let cachedAudioSrc: string | null = null;
let audioInstance: HTMLAudioElement | null = null;

// 音声インスタンスを取得または作成
export const getAudioInstance = (): HTMLAudioElement => {
  if (!audioInstance) {
    audioInstance = new Audio();
  }
  return audioInstance;
};

// BlobURLの保持用キャッシュ
const blobUrlCache: Record<string, string> = {};

// プリロードキャッシュ
interface PreloadEntry {
  blobUrl: string;
  audio: HTMLAudioElement;
  isReady: boolean;
}
const preloadCache: Record<string, PreloadEntry> = {};

// 音声をプリロード
export const preloadAudio = async (url: string): Promise<void> => {
  if (preloadCache[url]?.isReady) {
    console.log('Audio already preloaded:', url);
    return;
  }

  try {
    const absoluteUrl = (url.startsWith('http') || url.startsWith('blob:')) 
      ? url 
      : window.location.origin + (url.startsWith('/') ? '' : '/') + url;

    console.log('Preloading audio:', absoluteUrl);
    
    const response = await fetch(absoluteUrl, { cache: 'force-cache' });
    if (!response.ok) {
      throw new Error(`Failed to preload audio: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const preloadAudio = new Audio();
    preloadAudio.preload = 'auto';
    preloadAudio.src = blobUrl;
    
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Preload timeout'));
      }, 10000);
      
      preloadAudio.oncanplaythrough = () => {
        clearTimeout(timeout);
        resolve();
      };
      
      preloadAudio.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Preload failed'));
      };
    });
    
    preloadCache[url] = {
      blobUrl,
      audio: preloadAudio,
      isReady: true
    };
    
    console.log('Audio preloaded successfully:', url);
  } catch (error) {
    console.error('Failed to preload audio:', error);
  }
};

// 音声を再生
export const playAudio = (url: string): Promise<void> => {
  const audio = getAudioInstance();
  
  console.log('Attempting to play audio from URL:', url);
  
  // 再生中なら一時停止
  if (!audio.paused) {
    audio.pause();
  }
  
  // 新しい曲を再生する場合は前の曲のリソースを解放
  if (audio.src && url !== cachedAudioSrc) {
    audio.currentTime = 0;
    
    // もし現在のURLがblobで始まる場合、それを解放
    if (audio.src.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(audio.src);
        console.log('Revoked previous Blob URL:', audio.src);
      } catch (error) {
        console.error('Error revoking blob URL:', error);
      }
    }
    
    audio.removeAttribute('src'); // srcを明示的にクリア
  }
  
  // プリロードされた音声があるかチェック
  const preloaded = preloadCache[url];
  if (preloaded?.isReady) {
    console.log('Using preloaded audio:', url);
    audio.src = preloaded.blobUrl;
    audio.currentTime = 0;
    cachedAudioSrc = url;
    
    return audio.play().then(() => {
      console.log('Preloaded audio playback started successfully');
    }).catch((error) => {
      console.error('Preloaded audio play() failed:', error);
      throw error;
    });
  }
  
  // プリロードがない場合は従来の方法で再生
  return new Promise(async (resolve, reject) => {
    try {
      // 絶対URLを確保
      const absoluteUrl = (url.startsWith('http') || url.startsWith('blob:')) 
        ? url 
        : window.location.origin + (url.startsWith('/') ? '' : '/') + url;
      
      console.log('Fetching audio (no preload):', absoluteUrl);
      
      const response = await fetch(absoluteUrl, { cache: 'force-cache' });
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      audio.src = blobUrl;
      audio.currentTime = 0;
      cachedAudioSrc = url;
      
      const timeout = setTimeout(() => {
        reject(new Error('Audio loading timeout'));
      }, 5000);
      
      audio.oncanplaythrough = () => {
        clearTimeout(timeout);
        audio.play()
          .then(() => {
            console.log('Audio playback started');
            resolve();
          })
          .catch(reject);
      };
      
      audio.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Audio load error'));
      };
      
    } catch (error) {
      console.error('Unexpected error in playAudio:', error);
      reject(error);
    }
  });
};

// 音声を一時停止
export const pauseAudio = (): void => {
  const audio = getAudioInstance();
  if (!audio.paused) {
    audio.pause();
  }
};

// 音声を再開
export const resumeAudio = (): Promise<void> => {
  const audio = getAudioInstance();
  console.log('Resuming audio playback from position:', audio.currentTime);
  if (audio.paused && audio.src) {
    return audio.play()
      .then(() => {
        console.log('Audio playback successfully resumed');
      })
      .catch((error) => {
        console.error('Failed to resume audio playback:', error);
        throw error;
      });
  }
  return Promise.resolve();
};

// 音声の現在の状態を確認
export const isAudioPlaying = (): boolean => {
  const audio = getAudioInstance();
  return !audio.paused;
};

// プリロードキャッシュをクリア
export const clearPreloadCache = (): void => {
  Object.keys(preloadCache).forEach(url => {
    const entry = preloadCache[url];
    if (entry.blobUrl) {
      URL.revokeObjectURL(entry.blobUrl);
    }
    delete preloadCache[url];
  });
  console.log('Preload cache cleared');
};

// 再生を停止して音声をクリア
export const stopAudio = (): void => {
  const audio = getAudioInstance();
  
  // 現在のURLがBlobURLの場合は解放
  if (audio.src && audio.src.startsWith('blob:')) {
    try {
      // メモリリークを防ぐためにBlobURLを解放
      URL.revokeObjectURL(audio.src);
      console.log('Revoked Blob URL:', audio.src);
      
      // blobUrlCacheからこのURLに対応するエントリを削除
      Object.keys(blobUrlCache).forEach(key => {
        if (blobUrlCache[key] === audio.src) {
          delete blobUrlCache[key];
        }
      });
    } catch (error) {
      console.error('Error revoking Blob URL:', error);
    }
  }
  
  audio.pause();
  audio.currentTime = 0;
  audio.src = '';
  cachedAudioSrc = null; // キャッシュもクリア
};

// 再生が終了したときのコールバックを設定
export const onAudioEnded = (callback: () => void): void => {
  const audio = getAudioInstance();
  audio.onended = callback;
};

// 現在の再生時間を取得
export const getCurrentTime = (): number => {
  const audio = getAudioInstance();
  return audio.currentTime;
};

// 総再生時間を取得
export const getDuration = (): number => {
  const audio = getAudioInstance();
  const duration = audio.duration;
  return (duration && !isNaN(duration) && isFinite(duration)) ? duration : 0;
};

// 再生位置を設定
export const setCurrentTime = (time: number): void => {
  const audio = getAudioInstance();
  if (time >= 0 && time <= getDuration()) {
    audio.currentTime = time;
  }
};

// 音量を設定 (0.0〜1.0)
export const setVolume = (volume: number): void => {
  const audio = getAudioInstance();
  if (volume >= 0 && volume <= 1) {
    audio.volume = volume;
  }
};

// 音量を取得
export const getVolume = (): number => {
  const audio = getAudioInstance();
  return audio.volume;
};

// 時間を「分:秒」形式にフォーマット
export const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return '0:00';
  
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// 再生位置の変更時のコールバックを設定
export const onTimeUpdate = (callback: () => void): void => {
  const audio = getAudioInstance();
  audio.ontimeupdate = callback;
};

// 音声の読み込み完了時のコールバックを設定
export const onLoadedMetadata = (callback: () => void): void => {
  const audio = getAudioInstance();
  audio.onloadedmetadata = callback;
};
