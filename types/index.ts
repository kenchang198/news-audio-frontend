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


export interface Episode {
  episode_id: string;
  title: string;
  created_at: string;
  audio_url: string;
  articles: Article[];
  intro_audio_url?: string;
  outro_audio_url?: string;
}

export interface EpisodeSummary {
  episode_id: string;
  title: string;
  created_at: string;
}

export type Language = 'en' | 'ja';
