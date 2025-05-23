# ITニュースオーディオフロントエンド

ニュースの要約と音声生成サービスのフロントエンドアプリケーション。最新のITニュースをAIが要約し、Amazon Pollyで音声化して聴くことができます。

## 機能

- エピソード一覧表示（フィルタリング・検索機能付き）
- 記事の詳細表示
- 記事要約の日英切り替え
- 音声再生機能（日英切り替え可能）

## 技術スタック

- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **HTTP クライアント**: Axios
- **音声再生**: HTML5 Audio API

## セットアップ

### 必要条件

- Node.js 18.0以上
- npm 9.0以上

### インストール

```bash
# 依存関係をインストール
npm install
```

### モックデータのセットアップ (開発環境用)

バックエンドが完成するまでの開発段階では、モックデータを使用します。これらのモックデータは`.gitignore`に指定されているため、リポジトリにはコミットされません。

開発者は以下のディレクトリ・ファイルを作成する必要があります：

```
/public/mock/
├── audio/                         # ダミー音声ファイル用ディレクトリ
│   ├── dummy-audio-1-en.mp3       # 英語音声ファイル
│   ├── dummy-audio-1-ja.mp3       # 日本語音声ファイル
│   └── ...
├── news-data.json                 # 最新エピソードデータ
├── episodes_list.json             # エピソード一覧リスト
└── episode_YYYY-MM-DD.json        # 各日付のエピソードデータ
```

モックデータの構造は以下の通りです:

#### 最新エピソードデータ (news-data.json):
```json
{
  "episode_id": "2025-04-10",
  "title": "Tech News (2025-04-10)",
  "created_at": "2025-04-10 08:30:45",
  "articles": [
    {
      "id": "記事ID",
      "title": "記事タイトル",
      "link": "元記事URL",
      "summary": "元の記事サマリー",
      "author": "著者名",
      "published": "公開日",
      "source": "Medium",
      "source_id": "medium",
      "english_summary": "英語要約テキスト",
      "japanese_summary": "日本語要約テキスト",
      "english_audio_url": "/mock/audio/dummy-audio-1-en.mp3",
      "japanese_audio_url": "/mock/audio/dummy-audio-1-ja.mp3"
    }
  ],
  "source": "Medium"
}
```

#### エピソード一覧 (episodes_list.json):
```json
[
  {
    "episode_id": "2025-04-10",
    "title": "Tech News (2025-04-10)",
    "created_at": "2025-04-10 08:30:45",
    "article_count": 5,
    "source": "Medium"
  }
]
```

### 環境変数の設定

`.env.local`ファイルをプロジェクトのルートに作成し、以下の環境変数を設定してください：

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_S3_BUCKET_URL=https://your-bucket-name.s3.amazonaws.com
NEXT_PUBLIC_USE_S3_DATA=true
```

必要に応じてAPIのURLやS3バケットのURLを変更してください。
`NEXT_PUBLIC_USE_S3_DATA`を`true`に設定すると、APIの代わりにS3バケットからデータを取得します。

### 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)で開発サーバーが起動します。

## ビルドと実行

```bash
# プロダクション用にビルド
npm run build

# プロダクションモードで実行
npm start
```

## プロジェクト構造

```
/
├── app/                  # Next.js App Router
│   ├── episodes/[id]/    # エピソード詳細ページ
│   └── page.tsx          # ホームページ（エピソード一覧）
├── components/           # Reactコンポーネント
│   ├── episodes/         # エピソード関連のコンポーネント
│   ├── layout/           # レイアウトコンポーネント
│   └── ui/               # UI共通コンポーネント
├── public/               # 静的ファイル
│   └── mock/             # モックデータ (gitでは管理しない)
├── services/             # API通信などのサービス
├── types/                # TypeScript型定義
└── utils/                # ユーティリティ関数
```
