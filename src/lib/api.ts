// src/lib/api.ts
export async function getNewsData() {
    // 開発環境では、ローカルのモックデータを使用
    if (process.env.NODE_ENV === 'development') {
      // ローカルのモックデータをインポート
      const mockData = await import('./mockData').then(mod => mod.default);
      return mockData;
    }
  
    // 本番環境ではS3からデータを取得
    try {
      const response = await fetch(
        'https://your-s3-bucket-name.s3.ap-northeast-1.amazonaws.com/data/processed_articles.json'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch news data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching news data:', error);
      return [];
    }
  }