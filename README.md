# keisetsu Mobile

keisetsu の学習クライアントです。  
Expo + React Native で構成され、catalog / manifest / `.kdb` の取得とオフライン学習を担当します。

## アプリでできること

- GitHub 上の catalog を読み込み、配布中の deck 一覧を取得
- deck を選択して `.kdb` をダウンロードし、端末内 SQLite 領域に保存
- 端末ローカルの `.kdb` をファイルピッカーから取り込み
- 単語カードを閲覧する学習モード
- ランダム出題で自己採点するテストモード
- 直近テスト履歴（正誤、ミス語彙）を端末に保存
- 保存済み deck の切り替えと削除

## 対応言語

- English (`en`)
- 日本語 (`ja`)

## アーキテクチャ

```text
App.tsx
  |- 画面状態管理（study / test / source / source-settings）
  |- catalog取得、manifest解決、deckダウンロード
  |- テスト履歴保存
  |
  +-- src/components/
  |     |- SourceScreen, SourceSettingsScreen
  |     |- StudyScreen, TestScreen
  |     |- AppHeader, FooterNav
  |
  +-- src/services/database.ts
  |     |- SQLite入出力（cards, deck_metadata）
  |     |- DB一覧取得、メタデータ更新、削除
  |
  +-- src/constants, src/types, src/utils
        |- 設定値、型定義、URL生成/表示名解決など
```

### データモデル（要点）

- `deck_metadata.display_name` を単語帳の表示名に利用
- `cards` は `term`, `summary` を必須として扱う
- 互換入力として `summary` が無い場合 `meaning` 列を代替利用
- 補足文は `detail` または `example` を利用

## ローカル開発手順

### 前提

- Node.js 20 系以上（推奨）
- npm
- iOS シミュレータ（Xcode）または Android Emulator

### セットアップ

```bash
cd keisetsu-mobile
npm ci
```

### 開発サーバ起動

```bash
npm run start
```

### 実機/シミュレータ起動

```bash
npm run ios
npm run android
```

### 品質チェック

```bash
npm run lint
npm run typecheck
npm run build:ci
```

## catalog / kdb の取得先

アプリは次のURL形式を使用して deck 情報と kdb を取得します。

```text
https://raw.githubusercontent.com/{owner}/{repo}/{ref}/catalog/catalog.json
https://raw.githubusercontent.com/{owner}/{repo}/{ref}/catalog/decks/{deck-id}.json
manifest の path を使って .kdb を取得
例: https://raw.githubusercontent.com/{owner}/{repo}/{ref}/databases/starter-basic.kdb
```

## 関連リンク

- [keisetsu-database](https://github.com/kumo01GitHub/keisetsu-database)
- [keisetsu-admin](https://github.com/kumo01GitHub/keisetsu-admin)
- [keisetsu-docs](https://github.com/kumo01GitHub/keisetsu-docs)
