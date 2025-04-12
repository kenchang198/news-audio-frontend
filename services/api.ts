import axios from 'axios';
import { Episode, EpisodeSummary, Language, Article } from '@/types';

// API基本URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

// モックモード有効化フラグ (バックエンド接続できない場合に使用)
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// APIクライアントの作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// モックデータのパス
const MOCK_PATH = {
  episodesList: '/mock/episodes_list.json',
  latestEpisode: '/mock/news-data.json',
  episodeById: (id: string) => `/mock/episode_${id}.json`
};

// インターフェース
interface PaginatedEpisodes {
  episodes: EpisodeSummary[];
  totalPages: number;
  currentPage: number;
  totalEpisodes: number;
}

// API関数
// エピソード一覧を取得
export const getEpisodes = async (page: number = 1, limit: number = 10): Promise<PaginatedEpisodes> => {
  if (USE_MOCK_DATA) {
    // モックデータを使用 (JSONファイルから取得)
    console.log('Using mock data for episodes from JSON file');
    try {
      const response = await axios.get(MOCK_PATH.episodesList);
      const allEpisodes: EpisodeSummary[] = response.data;
      
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedEpisodes = allEpisodes.slice(start, end);
      
      return {
        episodes: paginatedEpisodes,
        totalPages: Math.ceil(allEpisodes.length / limit),
        currentPage: page,
        totalEpisodes: allEpisodes.length
      };
    } catch (error) {
      console.error('Failed to fetch mock episodes:', error);
      return { episodes: [], totalPages: 0, currentPage: page, totalEpisodes: 0 };
    }
  }
  
  try {
    const response = await apiClient.get('/episodes', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch episodes:', error);
    return { episodes: [], totalPages: 0, currentPage: page, totalEpisodes: 0 };
  }
};

// 特定のエピソードを取得
export const getEpisode = async (episodeId: string): Promise<Episode | null> => {
  if (USE_MOCK_DATA) {
    // モックデータを使用 (JSONファイルから取得)
    console.log(`Using mock data for episode ${episodeId} from JSON file`);
    try {
      const response = await axios.get(MOCK_PATH.episodeById(episodeId));
      return response.data;
    } catch (error) {
      // 該当するJSONがない場合は最新のエピソードを返す (newsService.tsと同様の挙動)
      console.warn(`Episode file for ID ${episodeId} not found, using latest episode`);
      try {
        const response = await axios.get(MOCK_PATH.latestEpisode);
        return response.data;
      } catch (latestError) {
        console.error(`Failed to fetch mock episode ${episodeId} or latest episode:`, latestError);
        return null;
      }
    }
  }
  
  try {
    const response = await apiClient.get(`/episodes/${episodeId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch episode ${episodeId}:`, error);
    return null;
  }
};

// 記事の要約を取得
export const getArticleSummary = async (articleId: string, language: Language): Promise<string | null> => {
  if (USE_MOCK_DATA) {
    // モックデータを使用 (JSONファイルから取得)
    console.log(`Using mock data for article summary ${articleId}, language: ${language} from JSON file`);
    try {
      // 記事IDからエピソードIDを推測 (newsService.tsにはないロジックだが、ここでは必要)
      // 例: "GPT_5の進化複雑な推論が可能に_e8f4a2b1" -> news-data.json を参照
      // 例: "メタバースが教育分野で急成長_2q3r4s5t" -> episode_2025-04-09.json を参照
      // この推測ロジックは複雑になるため、ここでは最新エピソードから探す簡易的な実装とする
      // (より正確にするには、全エピソードJSONを読み込むか、記事IDの命名規則に依存する必要がある)
      const episodeResponse = await axios.get(MOCK_PATH.latestEpisode); // 最新エピソードから探す
      const episode: Episode = episodeResponse.data;
      
      const article = episode.articles.find(a => a.id === articleId);
      if (!article) {
         // 見つからない場合は他のエピソードも探す (簡易実装のため省略)
         console.warn(`Article ${articleId} not found in latest mock episode.`);
         return null;
      }
      
      return language === 'en' ? article.english_summary : article.japanese_summary;
    } catch (error) {
      console.error(`Failed to fetch mock article summary for ${articleId}:`, error);
      return null;
    }
  }
  
  try {
    const response = await apiClient.get(`/articles/${articleId}/summary`, {
      params: { language },
    });
    return response.data.summary;
  } catch (error) {
    console.error(`Failed to fetch summary for article ${articleId}:`, error);
    return null;
  }
};

// 記事の音声URLを取得
export const getArticleAudio = async (articleId: string, language: Language): Promise<string | null> => {
  if (USE_MOCK_DATA) {
    // モックデータを使用 (JSONファイルから取得)
    console.log(`Using mock data for article audio ${articleId}, language: ${language} from JSON file`);
     try {
      // 記事IDからエピソードIDを推測 (getArticleSummaryと同様の簡易実装)
      const episodeResponse = await axios.get(MOCK_PATH.latestEpisode); // 最新エピソードから探す
      const episode: Episode = episodeResponse.data;
      
      const article = episode.articles.find(a => a.id === articleId);
       if (!article) {
         // 見つからない場合は他のエピソードも探す (簡易実装のため省略)
         console.warn(`Article ${articleId} not found in latest mock episode.`);
         return null;
      }
      
      const audioUrl = language === 'en' ? article.english_audio_url : article.japanese_audio_url;
      
      // newsService.tsと同様に、相対パスを絶対パスに変換する処理を追加
      if (audioUrl && audioUrl.startsWith('/mock/') && typeof window !== 'undefined') {
        const baseUrl = window.location.origin;
        return `${baseUrl}${audioUrl}`;
      }
      return audioUrl || null; // URLがない場合はnullを返す
      
    } catch (error) {
      console.error(`Failed to fetch mock article audio for ${articleId}:`, error);
      return null;
    }
  }
  
  try {
    const response = await apiClient.get(`/articles/${articleId}/audio`, {
      params: { language },
    });
    return response.data.audioUrl;
  } catch (error) {
    console.error(`Failed to fetch audio for article ${articleId}:`, error);
    return null;
  }
};
