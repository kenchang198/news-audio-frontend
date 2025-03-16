// インターフェース定義
interface EpisodeData {
  episode_id: string;
  title: string;
  created_at: string;
  articles: Array<{
    id: string;
    title: string;
    link: string;
    source: string;
    summary: string;
    audio_url: string;
    processed_at: string;
  }>;
}
interface EpisodeDetails {
  [key: string]: EpisodeData;  // 文字列インデックスシグネチャを追加
}

export async function getEpisodesList() {
  // 開発環境では、ローカルのモックデータを使用
  
  if (process.env.NODE_ENV === 'development') {
    const episodeDetails = await import('./mockEpisodes').then(mod => mod.episodeDetails as EpisodeDetails);
    // return mockEpisodes;
    const episodesArray = Object.keys(episodeDetails).map(key => {
      const episode = episodeDetails[key];
      return {
        episode_id: episode.episode_id,
        title: episode.title,
        created_at: episode.created_at,
        article_count: episode.articles.length
      };
    });
    
    // 日付でソート（新しい順）
    episodesArray.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return episodesArray;
  }

  // 本番環境ではS3からエピソードリストを取得
  try {
    const response = await fetch(
      'https://your-s3-bucket-name.s3.ap-northeast-1.amazonaws.com/data/episodes_list.json'
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch episodes list');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching episodes list:', error);
    return [];
  }
}

export async function getEpisodeById(episodeId: string) {
  // 開発環境では、ローカルのモックデータを使用
  if (process.env.NODE_ENV === 'development') {
    const mockEpisodes = await import('./mockEpisodes').then(mod => mod.episodeDetails as EpisodeDetails);
    return mockEpisodes[episodeId] || null;
  }

  // 本番環境ではS3から特定のエピソードデータを取得
  try {
    const response = await fetch(
      `https://your-s3-bucket-name.s3.ap-northeast-1.amazonaws.com/data/episodes/episode_${episodeId}.json`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch episode ${episodeId}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching episode ${episodeId}:`, error);
    return null;
  }
}