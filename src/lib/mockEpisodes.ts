export default [
{
    "episode_id": "2023-05-15",
    "title": "ITニュース要約 (2023-05-15)",
    "created_at": "2023-05-15 09:00:00",
    "article_count": 3
},
{
    "episode_id": "2023-05-14",
    "title": "ITニュース要約 (2023-05-14)",
    "created_at": "2023-05-14 09:00:00",
    "article_count": 2
},
{
    "episode_id": "2023-05-13",
    "title": "ITニュース要約 (2023-05-13)",
    "created_at": "2023-05-13 09:00:00",
    "article_count": 4
}
];

// モックエピソードの詳細データ
export const episodeDetails = {
    "2023-05-15": {
        "episode_id": "2023-05-15",
        "title": "ITニュース要約 (2023-05-15)",
        "created_at": "2023-05-15 09:00:00",
        "articles": [
            {
                "id": "article1",
                "title": "AIが変える未来の働き方",
                "link": "https://example.com/article1",
                "source": "テックニュース",
                "summary": "AIの発展により、多くの業務が自動化され、私たちの働き方が大きく変わろうとしています。専門家は今後5年間でおよそ30%の仕事がAIによって代替される可能性があると予測しています。",
                "audio_url": "/mock-audio/sample1.mp3",
                "processed_at": "2023-05-15 08:30:22"
            },
            {
                "id": "article2",
                "title": "新しいプログラミング言語が話題に",
                "link": "https://example.com/article2",
                "source": "プログラミングジャーナル",
                "summary": "シンプルな構文と高いパフォーマンスを兼ね備えた新プログラミング言語「Swift++」が開発者コミュニティで注目を集めています。特にAIアプリケーション開発において優位性があるとされています。",
                "audio_url": "/mock-audio/sample2.mp3",
                "processed_at": "2023-05-15 08:35:10"
            },
            {
                "id": "article3",
                "title": "サイバーセキュリティの最新トレンド",
                "link": "https://example.com/article3",
                "source": "セキュリティマガジン",
                "summary": "ランサムウェア攻撃が2023年第1四半期に前年比40%増加したことが報告されました。企業はゼロトラストセキュリティモデルの採用を急いでいます。",
                "audio_url": "/mock-audio/sample3.mp3",
                "processed_at": "2023-05-15 08:40:15"
            }
        ]
    },
    "2023-05-14": {
        "episode_id": "2023-05-14",
        "title": "ITニュース要約 (2023-05-14)",
        "created_at": "2023-05-14 09:00:00",
        "articles": [
            {
                "id": "article4",
                "title": "クラウドコンピューティングの最新動向",
                "link": "https://example.com/article4",
                "source": "クラウドウォッチ",
                "summary": "マルチクラウド戦略を採用する企業が増加しています。単一のクラウドプロバイダーへの依存リスクを減らすため、複数のクラウドサービスを組み合わせる企業が前年比で15%増加しました。",
                "audio_url": "/mock-audio/sample4.mp3",
                "processed_at": "2023-05-14 08:30:00"
            },
            {
                "id": "article5",
                "title": "量子コンピューティングの進展",
                "link": "https://example.com/article5",
                "source": "サイエンスデイリー",
                "summary": "研究者たちが新たな量子ビット制御方法を開発し、エラー率を大幅に低減することに成功しました。これにより実用的な量子コンピュータの実現が一歩近づいたとされています。",
                "audio_url": "/mock-audio/sample5.mp3",
                "processed_at": "2023-05-14 08:35:00"
            }
        ]
    }
};