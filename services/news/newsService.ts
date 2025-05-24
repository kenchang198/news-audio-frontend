import axios from 'axios';
import { Article, Episode } from '@/types';

// 環境変数から API の URL を取得
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
// 一時的に開発環境でモックデータを使用するように設定
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.NEXT_PUBLIC_USE_MOCK_DATA;

// デバッグ用ログ
console.log('Environment variables:', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
  USE_MOCK_DATA: USE_MOCK_DATA
});

// S3バケットの設定（環境変数から取得）
const S3_BUCKET_BASE_URL = process.env.NEXT_PUBLIC_S3_BUCKET_URL 
  ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/audio`
  : '';
const S3_DATA_BASE_URL = process.env.NEXT_PUBLIC_S3_BUCKET_URL 
  ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/data`
  : '';

// モックデータのパス
const MOCK_PATH = {
  episodesList: '/mock/episodes_list.json',
  latestEpisode: '/mock/news-data.json',
  episodeById: (id: string) => `/mock/episode_${id}.json`
};

/**
 * 日付からS3音声URLを生成する
 */
export const generateS3AudioUrl = (episodeId: string): string => {
  if (!S3_BUCKET_BASE_URL) {
    console.error('S3_BUCKET_BASE_URL is not configured. Please set NEXT_PUBLIC_S3_BUCKET_URL environment variable.');
    return '';
  }
  // episodeIdが日付形式（YYYY-MM-DD）であることを前提とする
  const url = `${S3_BUCKET_BASE_URL}/${episodeId}.mp3`;
  console.log(`Generated S3 audio URL for episode ${episodeId}:`, url);
  return url;
};

/**
 * エピソードIDから日付を抽出する（YYYY-MM-DD形式）
 */
export const extractDateFromEpisodeId = (episodeId: string): string => {
  // episodeIdが既に日付形式の場合はそのまま返す
  if (/^\d{4}-\d{2}-\d{2}$/.test(episodeId)) {
    console.log(`Episode ID ${episodeId} is already in date format`);
    return episodeId;
  }
  
  // その他の形式の場合は今日の日付を返す（フォールバック）
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const fallbackDate = `${year}-${month}-${day}`;
  console.log(`Episode ID ${episodeId} converted to date format:`, fallbackDate);
  return fallbackDate;
};

/**
 * エピソード一覧を取得する
 */
export const fetchEpisodesList = async () => {
  try {
    if (USE_MOCK_DATA) {
      // モックデータを使用
      console.log('Using mock data for episodes list');
      const response = await axios.get(MOCK_PATH.episodesList);
      return response.data;
    } else {
      // S3バケットから直接取得
      if (!S3_DATA_BASE_URL) {
        console.error('S3_DATA_BASE_URL is not configured. Please set NEXT_PUBLIC_S3_BUCKET_URL environment variable.');
        return [];
      }
      console.log('Fetching episodes list from S3 bucket');
      const response = await axios.get(`${S3_DATA_BASE_URL}/episodes_list.json`);
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
      console.log('Using mock data for latest episode');
      const response = await axios.get(MOCK_PATH.latestEpisode);
      return response.data;
    } else {
      // S3バケットから直接取得
      if (!S3_DATA_BASE_URL) {
        console.error('S3_DATA_BASE_URL is not configured. Please set NEXT_PUBLIC_S3_BUCKET_URL environment variable.');
        return null;
      }
      console.log('Fetching latest episode from S3 bucket');
      const response = await axios.get(`${S3_DATA_BASE_URL}/latest_episode.json`);
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
    } else {
      // S3バケットから直接取得
      if (!S3_DATA_BASE_URL) {
        console.error('S3_DATA_BASE_URL is not configured. Please set NEXT_PUBLIC_S3_BUCKET_URL environment variable.');
        return null;
      }
      console.log(`Fetching episode ${episodeId} from S3 bucket`);
      try {
        const response = await axios.get(`${S3_DATA_BASE_URL}/episode_${episodeId}.json`);
        return response.data;
      } catch (e) {
        // 該当するJSONがない場合は最新のエピソードを返す
        console.warn(`Episode file for ID ${episodeId} not found in S3, using latest episode`);
        const response = await axios.get(`${S3_DATA_BASE_URL}/latest_episode.json`);
        return response.data;
      }
    }
  } catch (error) {
    console.error(`Failed to fetch episode with ID ${episodeId}:`, error);
    return null;
  }
};

/**
 * 記事の英語音声URLを取得する
 */
export const getEnglishAudioUrl = (article: Article, episodeId?: string) => {
  // S3バケット直参照方式を使用する場合
  if (episodeId && !USE_MOCK_DATA) {
    const dateStr = extractDateFromEpisodeId(episodeId);
    return generateS3AudioUrl(dateStr);
  }
  
  // モックデータの場合は記事のaudio_urlを使用
  const url = article.audio_url || '';
  console.log('English audio URL:', url);
  // 開発環境では絶対URLに変換して返す
  if (url && url.startsWith('/mock/') && typeof window !== 'undefined') {
    const baseUrl = window.location.origin;
    const absoluteUrl = `${baseUrl}${url}`;
    console.log('Converted to absolute URL:', absoluteUrl);
    return absoluteUrl;
  }
  return url;
};

/**
 * 記事の日本語音声URLを取得する
 */
export const getJapaneseAudioUrl = (article: Article, episodeId?: string) => {
  // S3バケット直参照方式を使用する場合
  if (episodeId && !USE_MOCK_DATA) {
    const dateStr = extractDateFromEpisodeId(episodeId);
    return generateS3AudioUrl(dateStr);
  }
  
  // モックデータの場合は記事のaudio_urlを使用
  const url = article.audio_url || '';
  console.log('Japanese audio URL:', url);
  // 開発環境では絶対URLに変換して返す
  if (url && url.startsWith('/mock/') && typeof window !== 'undefined') {
    const baseUrl = window.location.origin;
    const absoluteUrl = `${baseUrl}${url}`;
    console.log('Converted to absolute URL:', absoluteUrl);
    return absoluteUrl;
  }
  return url;
};

/**
 * エピソード全体の音声URLを取得する（S3バケット直参照方式）
 */
export const getEpisodeAudioUrl = (episodeId: string): string => {
  // S3バケット直参照方式を使用する場合
  if (!USE_MOCK_DATA) {
    console.log(`Using S3 bucket direct access for episode: ${episodeId}`);
    const dateStr = extractDateFromEpisodeId(episodeId);
    return generateS3AudioUrl(dateStr);
  }
  
  // モックデータの場合は従来通り
  console.log(`Using mock data for episode: ${episodeId}`);
  return `/mock/audio/episode_${episodeId}.mp3`;
};

/**
 * エピソード全体の英語音声URLのリストを取得する
 */
export const getEpisodeEnglishAudioUrls = (episode: Episode) => {
  if (!episode || !episode.articles || !Array.isArray(episode.articles)) {
    return [];
  }
  
  // S3バケット直参照方式の場合は、エピソード全体で一つの音声ファイル
  if (!USE_MOCK_DATA) {
    const audioUrl = getEpisodeAudioUrl(episode.episode_id);
    return [audioUrl];
  }
  
  // モックデータの場合は従来通り記事ごとの音声URL
  return episode.articles
    .filter(article => article.audio_url)
    .map(article => getEnglishAudioUrl(article, episode.episode_id));
};

/**
 * エピソード全体の日本語音声URLのリストを取得する
 */
export const getEpisodeJapaneseAudioUrls = (episode: Episode) => {
  if (!episode || !episode.articles || !Array.isArray(episode.articles)) {
    return [];
  }
  
  // S3バケット直参照方式の場合は、エピソード全体で一つの音声ファイル
  if (!USE_MOCK_DATA) {
    const audioUrl = getEpisodeAudioUrl(episode.episode_id);
    return [audioUrl];
  }
  
  // モックデータの場合は従来通り記事ごとの音声URL
  return episode.articles
    .filter(article => article.audio_url)
    .map(article => getJapaneseAudioUrl(article, episode.episode_id));
};
