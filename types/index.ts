export interface Article {
  id: string;
  title: string;
  link: string;
  summary: string;
  author: string;
  published: string;
  source: string;
  source_id: string;
  english_summary: string;
  japanese_summary: string;
  english_audio_url: string;
  japanese_audio_url: string;
}

export interface Episode {
  episode_id: string;
  title: string;
  created_at: string;
  articles: Article[];
  source: string;
}

export interface EpisodeSummary {
  episode_id: string;
  title: string;
  created_at: string;
  article_count: number;
  source: string;
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
