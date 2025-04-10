let audioInstance: HTMLAudioElement | null = null;

// 音声インスタンスを取得または作成
export const getAudioInstance = (): HTMLAudioElement => {
  if (!audioInstance) {
    audioInstance = new Audio();
  }
  return audioInstance;
};

// 音声を再生
export const playAudio = (url: string): Promise<void> => {
  const audio = getAudioInstance();
  
  // 現在の再生を停止
  if (audio.src) {
    audio.pause();
    audio.currentTime = 0;
  }
  
  // 新しいURLを設定して再生
  audio.src = url;
  
  return new Promise((resolve, reject) => {
    audio.oncanplay = () => {
      audio.play()
        .then(() => resolve())
        .catch((error) => reject(error));
    };
    
    audio.onerror = (error) => {
      reject(error);
    };
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
  if (audio.paused && audio.src) {
    return audio.play();
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
  audio.pause();
  audio.currentTime = 0;
  audio.src = '';
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
