# ニュースオーディオフロントエンド

Medium記事の要約と音声生成サービスのフロントエンドアプリケーション。

## 機能

- エピソード一覧表示（ページング機能付き）
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

### 環境変数の設定

`.env.local`ファイルをプロジェクトのルートに作成し、以下の環境変数を設定してください：

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

必要に応じてAPIのURLを変更してください。

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
├── services/             # API通信などのサービス
├── types/                # TypeScript型定義
└── utils/                # ユーティリティ関数
```
# news-audio-frontend
