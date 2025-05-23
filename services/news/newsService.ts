import axios from 'axios';
import { Article, Episode } from '@/types';

// 環境変数から API の URL を取得
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
const S3_BUCKET_URL = process.env.NEXT_PUBLIC_S3_BUCKET_URL || '';
const USE_S3_DATA = process.env.NEXT_PUBLIC_USE_S3_DATA === 'true';

// モックデータのパス
const MOCK_PATH = {
  episodesList: '/mock/episodes_list.json',
  latestEpisode: '/mock/news-data.json',
  episodeById: (id: string) => `/mock/episode_${id}.json`
};

const S3_PATH = {
  episodesList: '/data/episodes_list.json',
  latestEpisode: '/data/news-data.json',
  episodeById: (id: string) => `/data/episode_${id}.json`
};

/**
 * エピソード一覧を取得する
 */
export const fetchEpisodesList = async () => {
  try {
    if (USE_MOCK_DATA) {
      // モックデータを使用
      const response = await axios.get(MOCK_PATH.episodesList);
      return response.data;
    } else if (USE_S3_DATA) {
      const response = await axios.get(`${S3_BUCKET_URL}${S3_PATH.episodesList}`);
      return response.data;
    } else {
      // 本番APIを使用
      const response = await axios.get(`${API_BASE_URL}/episodes`);
      return response.data;
    }
  } catch (error) {
    console.error('Failed to fetch episodes list:', error);
    return [];
  }
};

/**
 * 最新のエピソードを取得する
 */
export const fetchLatestEpisode = async () => {
  try {
    if (USE_MOCK_DATA) {
      // モックデータを使用
      const response = await axios.get(MOCK_PATH.latestEpisode);
      return response.data;
    } else if (USE_S3_DATA) {
      const response = await axios.get(`${S3_BUCKET_URL}${S3_PATH.latestEpisode}`);
      return response.data;
    } else {
      // 本番APIを使用
      const response = await axios.get(`${API_BASE_URL}/episodes/latest`);
      return response.data;
    }
  } catch (error) {
    console.error('Failed to fetch latest episode:', error);
    return null;
  }
};

/**
 * 特定のエピソードをIDで取得する
 */
export const fetchEpisodeById = async (episodeId: string) => {
  try {
    if (USE_MOCK_DATA) {
      // モックデータを使用
      try {
        // エピソードIDに対応するJSONファイルがあれば取得
        const response = await axios.get(MOCK_PATH.episodeById(episodeId));
        return response.data;
      } catch (e) {
        // 該当するJSONがない場合は最新のエピソードを返す
        console.warn(`Episode file for ID ${episodeId} not found, using latest episode`);
        const response = await axios.get(MOCK_PATH.latestEpisode);
        return response.data;
      }
    } else if (USE_S3_DATA) {
      try {
        // エピソードIDに対応するJSONファイルがあれば取得
        const response = await axios.get(`${S3_BUCKET_URL}${S3_PATH.episodeById(episodeId)}`);
        return response.data;
      } catch (e) {
        // 該当するJSONがない場合は最新のエピソードを返す
        console.warn(`Episode file for ID ${episodeId} not found in S3, using latest episode`);
        const response = await axios.get(`${S3_BUCKET_URL}${S3_PATH.latestEpisode}`);
        return response.data;
      }
    } else {
      // 本番APIを使用
      const response = await axios.get(`${API_BASE_URL}/episodes/${episodeId}`);
      return response.data;
    }
  } catch (error) {
    console.error(`Failed to fetch episode with ID ${episodeId}:`, error);
    return null;
  }
};

/**
 * 記事の英語音声URLを取得する
 */
export const getEnglishAudioUrl = (article: Article) => {
  const url = article.english_audio_url || '';
  console.log('English audio URL:', url);
  // 開発環境では絶対URLに変換して返す
  if (url && url.startsWith('/mock/') && typeof window !== 'undefined') {
    const baseUrl = window.location.origin;
    const absoluteUrl = `${baseUrl}${url}`;
    console.log('Converted to absolute URL:', absoluteUrl);
    return absoluteUrl;
  }
  if (url && url.startsWith('/data/') && USE_S3_DATA && S3_BUCKET_URL) {
    const absoluteUrl = `${S3_BUCKET_URL}${url}`;
    console.log('Converted to S3 URL:', absoluteUrl);
    return absoluteUrl;
  }
  return url;
};

/**
 * 記事の日本語音声URLを取得する
 */
export const getJapaneseAudioUrl = (article: Article) => {
  const url = article.japanese_audio_url || '';
  console.log('Japanese audio URL:', url);
  // 開発環境では絶対URLに変換して返す
  if (url && url.startsWith('/mock/') && typeof window !== 'undefined') {
    const baseUrl = window.location.origin;
    const absoluteUrl = `${baseUrl}${url}`;
    console.log('Converted to absolute URL:', absoluteUrl);
    return absoluteUrl;
  }
  if (url && url.startsWith('/data/') && USE_S3_DATA && S3_BUCKET_URL) {
    const absoluteUrl = `${S3_BUCKET_URL}${url}`;
    console.log('Converted to S3 URL:', absoluteUrl);
    return absoluteUrl;
  }
  return url;
};

/**
 * エピソード全体の英語音声URLのリストを取得する
 */
export const getEpisodeEnglishAudioUrls = (episode: Episode) => {
  if (!episode || !episode.articles || !Array.isArray(episode.articles)) {
    return [];
  }
  
  // getEnglishAudioUrl関数を使用してプレイリスト用のURLを取得（絶対URL変換を適用）
  return episode.articles
    .filter(article => article.english_audio_url)
    .map(article => getEnglishAudioUrl(article));
};

/**
 * エピソード全体の日本語音声URLのリストを取得する
 */
export const getEpisodeJapaneseAudioUrls = (episode: Episode) => {
  if (!episode || !episode.articles || !Array.isArray(episode.articles)) {
    return [];
  }
  
  // getJapaneseAudioUrl関数を使用してプレイリスト用のURLを取得（絶対URL変換を適用）
  return episode.articles
    .filter(article => article.japanese_audio_url)
    .map(article => getJapaneseAudioUrl(article));
};
