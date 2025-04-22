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
}

export interface Episode {
  episode_id: string;
  title: string;
  created_at: string;
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

export interface AudioPlayerState {
  isPlaying: boolean;
  currentArticleId: string | null;
  currentLanguage: Language;
  volume: number;
  progress: number;
  duration: number;
}
