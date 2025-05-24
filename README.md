# IT ニュースオーディオフロントエンド

ニュースの要約と音声生成サービスのフロントエンドアプリケーション。最新の IT ニュースを AI が要約し、Amazon Polly で音声化して聴くことができます。

## 機能

- エピソード一覧表示（フィルタリング・検索機能付き）
- 記事の詳細表示
- 記事要約の日英切り替え
- 音声再生機能（日英切り替え可能）
- S3 バケット直参照による音声ファイル取得

## 技術スタック

- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **HTTP クライアント**: Axios
- **音声再生**: HTML5 Audio API
- **音声ストレージ**: Amazon S3

## 音声データ取得方式

### S3 バケット直参照方式（本番環境）

本番環境では、音声データとエピソードデータは Amazon S3 バケットから直接取得されます：

#### 音声ファイル

- **ファイル命名規則**: `YYYY-MM-DD.mp3`（例：`2025-05-23.mp3`）
- **特徴**:
  - エピソード全体の音声が一本化されている
  - 日付ベースのファイル名で管理
  - API を経由せず直接 S3 から取得

#### データファイル

- **ファイル構成**:
  - `episodes_list.json`: エピソード一覧データ
  - `latest_episode.json`: 最新エピソードデータ
  - `episode_YYYY-MM-DD.json`: 各日付のエピソード詳細データ

### モックデータ方式（開発環境）

開発環境では、ローカルのモックデータを使用します：

- **パス**: `/public/mock/`
- **ファイル構成**:
  - `episodes_list.json`: エピソード一覧
  - `news-data.json`: 最新エピソード
  - `episode_YYYY-MM-DD.json`: 各エピソード詳細
  - `audio/`: 音声ファイル用ディレクトリ

## 環境変数の設定

`.env.local`ファイルをプロジェクトのルートに作成し、以下の環境変数を設定してください：

```bash
# 本番環境設定（S3バケット直参照方式を使用）
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=
# S3バケットのベースURL
NEXT_PUBLIC_S3_BUCKET_URL=https://your-bucket-name.s3.region.amazonaws.com

# 開発環境設定（モックデータを使用する場合）
# NEXT_PUBLIC_USE_MOCK_DATA=true
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
# NEXT_PUBLIC_S3_BUCKET_URL=
```

- `NEXT_PUBLIC_USE_MOCK_DATA=false`: S3 バケット直参照方式を使用
- `NEXT_PUBLIC_USE_MOCK_DATA=true`: モックデータを使用（開発環境）
- `NEXT_PUBLIC_S3_BUCKET_URL`: S3 バケットのベース URL（本番環境で必要）

**注意**: 実際の S3 バケット URL は機密情報のため、`.env.local`ファイルに設定し、Git リポジトリにはコミットしないでください。`env.example`ファイルを参考に設定してください。

## セットアップ

### 必要条件

- Node.js 18.0 以上
- npm 9.0 以上

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
