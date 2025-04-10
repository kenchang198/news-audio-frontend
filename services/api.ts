import axios from 'axios';
import { Episode, PaginatedEpisodes, Language } from '@/types';

// API基本URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// モックモード有効化フラグ (バックエンド接続できない場合に使用)
const USE_MOCK_DATA = true; // テスト中はtrueに設定、本番環境ではfalseに変更

// APIクライアントの作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// モックデータ
const mockEpisodes: Episode[] = [
  {
    id: '1',
    date: '2025-04-10',
    articles: [
      {
        id: '101',
        title: 'AIの発展について',
        url: 'https://medium.com/sample/ai-development',
        source: 'Medium',
        summary: {
          ja: 'AIテクノロジーは急速に発展しており、様々な分野で活用されています。機械学習とディープラーニングの進歩により、より高度なAIシステムが開発されています。',
          en: 'AI technology is rapidly evolving and being utilized in various fields. Advances in machine learning and deep learning are enabling the development of more sophisticated AI systems.'
        },
        audio: {
          ja: 'https://example.com/audio/ja/101',
          en: 'https://example.com/audio/en/101'
        }
      },
      {
        id: '102',
        title: 'ウェブ開発の最新トレンド',
        url: 'https://medium.com/sample/web-dev-trends',
        source: 'Medium',
        summary: {
          ja: 'モダンなウェブ開発では、ReactやNext.jsなどのフレームワークが人気です。また、TailwindCSSのようなユーティリティファーストのCSSフレームワークも広く採用されています。',
          en: 'In modern web development, frameworks like React and Next.js are popular. Utility-first CSS frameworks like TailwindCSS are also widely adopted.'
        },
        audio: {
          ja: 'https://example.com/audio/ja/102',
          en: 'https://example.com/audio/en/102'
        }
      }
    ]
  },
  {
    id: '2',
    date: '2025-04-09',
    articles: [
      {
        id: '201',
        title: 'データサイエンスの基礎',
        url: 'https://medium.com/sample/data-science-basics',
        source: 'Medium',
        summary: {
          ja: 'データサイエンスは、データから有用な洞察を引き出すための科学的方法論です。統計学、機械学習、ドメイン知識を組み合わせて分析を行います。',
          en: 'Data science is a scientific methodology for extracting useful insights from data. It combines statistics, machine learning, and domain knowledge for analysis.'
        },
        audio: {
          ja: 'https://example.com/audio/ja/201',
          en: 'https://example.com/audio/en/201'
        }
      }
    ]
  }
];

// エピソード一覧を取得
export const getEpisodes = async (page: number = 1, limit: number = 10): Promise<PaginatedEpisodes> => {
  if (USE_MOCK_DATA) {
    // モックデータを使用
    console.log('Using mock data for episodes');
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedEpisodes = mockEpisodes.slice(start, end);
    return {
      episodes: paginatedEpisodes,
      totalPages: Math.ceil(mockEpisodes.length / limit),
      currentPage: page
    };
  }
  
  try {
    const response = await apiClient.get(`/episodes`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch episodes:', error);
    return { episodes: [], totalPages: 0, currentPage: page };
  }
};

// 特定のエピソードを取得
export const getEpisode = async (episodeId: string): Promise<Episode | null> => {
  if (USE_MOCK_DATA) {
    // モックデータを使用
    console.log(`Using mock data for episode ${episodeId}`);
    const episode = mockEpisodes.find(ep => ep.id === episodeId);
    return episode || null;
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
    // モックデータを使用
    console.log(`Using mock data for article summary ${articleId}, language: ${language}`);
    for (const episode of mockEpisodes) {
      const article = episode.articles.find(art => art.id === articleId);
      if (article && article.summary && article.summary[language]) {
        return article.summary[language] || null;
      }
    }
    return null;
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
    // モックデータを使用
    console.log(`Using mock data for article audio ${articleId}, language: ${language}`);
    for (const episode of mockEpisodes) {
      const article = episode.articles.find(art => art.id === articleId);
      if (article && article.audio && article.audio[language]) {
        return article.audio[language] || null;
      }
    }
    return null;
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
