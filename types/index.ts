export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  summary?: {
    ja?: string;
    en?: string;
  };
  audio?: {
    ja?: string;
    en?: string;
  };
}

export interface Episode {
  id: string;
  date: string;
  articles: Article[];
}

export interface PaginatedEpisodes {
  episodes: Episode[];
  totalPages: number;
  currentPage: number;
}

export type Language = 'ja' | 'en';

export interface AudioPlayerState {
  isPlaying: boolean;
  currentArticleId: string | null;
  currentLanguage: Language;
}
