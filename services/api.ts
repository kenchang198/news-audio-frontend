import axios from 'axios';
import { Episode, EpisodeSummary, Language, Article, PlaylistItem, Playlist } from '@/types';

// API基本URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_UR || 'http://localhost:5001/api';

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
  episodeById: (id: string) => `/mock/episode_${id}.json`,
  playlistById: (id: string) => `/mock/playlist_${id}.json`
};

// ページネーション情報はフロント側で計算
interface EpisodesResponse {
  episodes: EpisodeSummary[];
}

// API関数
// エピソード一覧を取得
export const getEpisodes = async (page: number = 1, limit: number = 10): Promise<{
  episodes: EpisodeSummary[];
  totalPages: number;
  currentPage: number;
  totalEpisodes: number;
}> => {
  if (USE_MOCK_DATA) {
    // モックデータを使用 (JSONファイルから取得)
    console.log('Using mock data for episodes from JSON file');
    try {
      const response = await axios.get(MOCK_PATH.episodesList);
      const allEpisodes: EpisodeSummary[] = response.data.episodes || response.data;
      
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
    const response = await apiClient.get<EpisodesResponse>('/episodes');
    const allEpisodes = (response.data as any).episodes ?? response.data;
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
    const response = await apiClient.get<Episode>(`/episodes/${episodeId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch episode ${episodeId}:`, error);
    return null;
  }
};

// エピソードのプレイリストを取得
export const getEpisodePlaylist = async (episodeId: string): Promise<Playlist | null> => {
  if (USE_MOCK_DATA) {
    console.log(`Using mock data for playlist ${episodeId} from JSON file`);
    try {
      // モックJSONファイルからプレイリストを取得
      const response = await axios.get<Playlist>(MOCK_PATH.playlistById(episodeId));
      return response.data;
    } catch (error) {
      // モックファイルがない場合は空のプレイリストを返すか、nullを返す
      console.warn(`Mock playlist file for ID ${episodeId} not found.`);
      return null;
    }
  }

  try {
    // APIからプレイリストを取得
    const response = await apiClient.get<Playlist>(`/episodes/${episodeId}/playlist`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch playlist for episode ${episodeId}:`, error);
    return null;
  }
};

// 記事の要約取得APIは現状未対応のため、ダミー実装または削除
// export const getArticleSummary = async (articleId: string, language: Language): Promise<string | null> => {
//   return null;
// };

// 記事の音声URL取得APIは現状未対応のため、ダミー実装または削除
// export const getArticleAudio = async (articleId: string, language: Language): Promise<string | null> => {
//   return null;
// };
