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
  
  return new Promise(async (resolve, reject) => {
    try {
      // 絶対URLを確保（すでに絶対URLであればそのまま）
      const absoluteUrl = (url.startsWith('http') || url.startsWith('blob:')) 
        ? url 
        : window.location.origin + (url.startsWith('/') ? '' : '/') + url;
      
      console.log('Using absolute URL:', absoluteUrl);
      
      // Blobとして音声を取得
      console.log('Fetching audio file as blob...');
      const response = await fetch(absoluteUrl, { cache: 'no-store' });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('Audio blob fetched successfully, MIME type:', blob.type);
      
      // BlobURLを作成
      const blobUrl = URL.createObjectURL(blob);
      console.log('Created Blob URL:', blobUrl);
      
      // 新しいURLを設定
      audio.src = blobUrl;
      
      // 先頭から確実に再生するために位置をリセット
      try {
        audio.currentTime = 0;
      } catch (e) {
        // Safari などで currentTime に即座にアクセスできない場合があるため無視
      }
      
      // URLをキャッシュ
      cachedAudioSrc = url;
      
      // エラーイベントリスナーを追加
      const handleError = (event: Event) => {
        console.error('Audio error event occurred:', event);
        if (audio.error) {
          console.error('Audio error code:', audio.error.code);
          console.error('Audio error message:', audio.error.message);
        }
      };
      
      // 既存のイベントリスナーをクリア
      audio.oncanplay = null;
      audio.onloadeddata = null;
      audio.onerror = null;
      
      audio.addEventListener('error', handleError);
      
      // 音声メタデータの読み込み完了を検知（duration など取得可能）
      audio.onloadedmetadata = () => {
        console.log('Metadata loaded, resetting to start and playing');
        try {
          audio.currentTime = 0;
        } catch {}
        audio.play()
          .then(() => {
            console.log('Audio playback started successfully');
            audio.removeEventListener('error', handleError);
            resolve();
          })
          .catch((error) => {
            console.error('Audio play() failed:', error);
            audio.removeEventListener('error', handleError);
            reject(error);
          });
      };
      
      // 5秒以内に再生できない場合はタイムアウト
      const timeout = setTimeout(() => {
        console.error('Audio loading timeout');
        audio.removeEventListener('error', handleError);
        reject(new Error('Audio loading timeout'));
      }, 5000);
      
      // 音声データが正常に読み込まれたことを検知
      audio.onloadeddata = () => {
        clearTimeout(timeout);
        console.log('Audio loaded successfully');
      };
      
      // エラーハンドリング
      audio.onerror = (event) => {
        console.error('Audio error event triggered in onerror handler:', event);
        clearTimeout(timeout);
        audio.removeEventListener('error', handleError);
        
        // エラーオブジェクトがある場合は詳細を表示
        if (audio.error) {
          const errorMessage = `Audio error: ${audio.error.message || 'unknown error'} (code: ${audio.error.code})`;
          console.error(errorMessage);
          reject(new Error(errorMessage));
        } else {
          reject(new Error('Unknown audio error occurred'));
        }
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
  return audio.duration || 0;
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
