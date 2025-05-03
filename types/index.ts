export interface Article {
  id: string;
  title: string;
  link?: string;
  summary: string;
  published?: string;
  content?: string;
  audio_url: string;
  intro_audio_url?: string;
  duration?: number;
}

export interface PlaylistItem {
  type: string; // intro, article_intro, article, outro など
  article_id?: string;
  audio_url: string;
  language?: string; // 言語情報（仕様書にはないが必要と思われる）
}

export interface Playlist {
  playlist: PlaylistItem[];
}

export interface Episode {
  episode_id: string;
  title: string;
  created_at: string;
  audio_url: string;
  articles: Article[];
  playlist: PlaylistItem[];
  intro_audio_url?: string;
  outro_audio_url?: string;
}

export interface EpisodeSummary {
  episode_id: string;
  title: string;
  created_at: string;
}

export type Language = 'en' | 'ja';

export interface AudioState {
  episodeId: string | null;
  episodeTitle: string | null;
  playlist: {
    ja: string[];
    en: string[];
  } | null;
  currentTrackIndex: number;
  currentLanguage: Language;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isPlaylist: boolean; // プレイリスト再生中かどうかのフラグ
}
