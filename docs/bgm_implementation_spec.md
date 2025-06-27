# BGM機能実装仕様書

## 概要

エピソード再生時にBGMを自動再生する機能を最小限の実装で追加する。

## 実装方針

- **シンプル性を最優先**：最低限の機能で確実に動作する
- **静的ファイル配信**：フロントエンドのpublicディレクトリに配置
- **既存アーキテクチャの保持**：AWS構成やAPIは変更しない
- **段階的拡張可能**：将来的な機能追加に対応可能な設計

## 技術仕様

### BGMファイル仕様

| 項目 | 仕様 |
|------|------|
| ファイル形式 | MP3 |
| ビットレート | 64-96kbps |
| ファイルサイズ | 1-3MB程度 |
| 長さ | 30秒-2分（ループ再生） |
| 音量レベル | マスタリング時点で調整済み |

### ファイル配置

```
news-audio-frontend/
├── public/
│   └── audio/
│       └── bgm/
│           └── background.mp3  # BGMファイル
```

### 音量設定

- **固定音量**：15%（0.15）
- **変更不可**：ユーザーによる音量調整機能は提供しない
- **調整方法**：実装時にコード内の数値を変更

## 実装内容

### 1. SimpleBGMコンポーネント

**ファイル**: `components/audio/SimpleBGM.tsx`

```typescript
import { useEffect, useRef } from 'react';

interface SimpleBGMProps {
  isPlaying: boolean;
}

export const SimpleBGM = ({ isPlaying }: SimpleBGMProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {
        // ユーザーがまだページと interaction していない場合のエラーを無視
        console.log('BGM再生待機中...');
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  return (
    <audio
      ref={audioRef}
      src="/audio/bgm/background.mp3"
      loop
      volume={0.15}  // 固定音量（15%）
      preload="auto"
    />
  );
};
```

### 2. 既存プレーヤーへの統合

**対象ファイル**: `components/episodes/EpisodePlayer.tsx`

```typescript
// 追加インポート
import { SimpleBGM } from '../audio/SimpleBGM';

// JSX内に追加
<SimpleBGM isPlaying={isPlaying} />
```

### 3. 状態管理

既存の`isPlaying`状態を活用：

```typescript
const [isPlaying, setIsPlaying] = useState(false);

// 既存のaudioイベントハンドラで状態を更新
<audio 
  onPlay={() => setIsPlaying(true)}
  onPause={() => setIsPlaying(false)}
  onEnded={() => setIsPlaying(false)}
>
```

## ディレクトリ構造変更

### 追加ファイル

```
components/
└── audio/
    └── SimpleBGM.tsx         # 新規作成

public/
└── audio/
    └── bgm/
        └── background.mp3    # 新規追加
```

### 変更ファイル

```
components/
└── episodes/
    └── EpisodePlayer.tsx     # import文とJSX要素を追加
```

## 実装手順

### ステップ1: ディレクトリ準備

```bash
# BGM用ディレクトリ作成
mkdir -p public/audio/bgm

# audio componentディレクトリ作成（存在しない場合）
mkdir -p components/audio
```

### ステップ2: BGMファイル配置

1. BGMファイル（background.mp3）を`public/audio/bgm/`に配置
2. ファイルサイズとビットレートを確認

### ステップ3: SimpleBGMコンポーネント作成

1. `components/audio/SimpleBGM.tsx`を作成
2. 上記仕様通りに実装

### ステップ4: EpisodePlayerの修正

1. `components/episodes/EpisodePlayer.tsx`を開く
2. import文を追加
3. JSX内にSimpleBGMコンポーネントを追加

### ステップ5: テスト

1. **ローカルテスト**
   ```bash
   npm run dev
   ```
   - エピソード再生時にBGMが開始されることを確認
   - エピソード停止時にBGMが停止することを確認

2. **デプロイテスト**
   - Vercel等にデプロイ後、本番環境での動作確認

## 技術的考慮事項

### ブラウザの自動再生ポリシー

- **現象**: ユーザーがページと interaction する前は自動再生がブロックされる
- **対処**: 正常な動作として扱う（エラーハンドリングで無視）
- **影響**: 初回アクセス時は再生ボタンを押すまでBGMが開始されない場合がある

### パフォーマンス

- **プリロード**: `preload="auto"`でBGMファイルを事前読み込み
- **ファイルサイズ**: 1-3MB程度に抑制してページ読み込み速度に影響を最小化
- **CDN配信**: Vercel等のCDNで自動的に最適化される

### エラーハンドリング

- **ファイル読み込みエラー**: コンソールログのみ、機能停止はしない
- **再生エラー**: catch文で無視、メインプレーヤーには影響しない

## 将来的な拡張予定

### Phase 2: 体験向上機能

- フェードイン・フェードアウト効果
- 記事切り替え時の音量調整
- 複数BGMテーマの対応

### Phase 3: 高度な機能

- サーバーサイドでのミキシング処理
- ユーザー設定による音量調整
- BGM ON/OFF切り替え機能

## 運用・保守

### BGMファイルの更新

1. 新しいBGMファイルを`public/audio/bgm/background.mp3`として配置
2. デプロイ（自動的に反映）

### 音量調整

SimpleBGMコンポーネント内の`volume={0.15}`の数値を変更

### トラブルシューティング

| 問題 | 原因 | 対処法 |
|------|------|--------|
| BGMが再生されない | ブラウザの自動再生制限 | ユーザーに再生ボタンクリックを促す |
| 音量が大きすぎる | volume設定値が高い | SimpleBGM.tsxのvolume値を調整 |
| ファイルが見つからない | パス間違い | public/audio/bgm/background.mp3の存在確認 |

## 完了基準

- [x] SimpleBGMコンポーネントの作成
- [x] EpisodePlayerへの統合
- [x] ローカル環境での動作確認
- [x] BGMファイルの配置
- [x] デプロイ後の動作確認

## 関連ドキュメント

- [システム設計書](../システム設計_20250417.md)
- [既存実装計画](./implementation_plan.md)

---

**作成日**: 2025-04-17  
**更新日**: 2025-04-17  
**作成者**: Ken  
**バージョン**: 1.0
