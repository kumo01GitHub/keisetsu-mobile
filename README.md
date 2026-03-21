# keisetsu Mobile

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/kumo01GitHub/keisetsu/pulls)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/kumo01GitHub/keisetsu-mobile/actions/workflows/ci.yml/badge.svg)](https://github.com/kumo01GitHub/keisetsu-mobile/actions/workflows/ci.yml)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/99ebf607cb804fd4a7e7fb2f037605a0)](https://app.codacy.com/gh/kumo01GitHub/keisetsu-mobile/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/99ebf607cb804fd4a7e7fb2f037605a0)](https://app.codacy.com/gh/kumo01GitHub/keisetsu-mobile/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)

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

## アプリの使い方

### 1. Expo Go アプリのインストール

スマートフォンで下記の公式アプリをインストールしてください。

- [Expo Go (iOS)](https://apps.apple.com/app/expo-go/id982107779)
- [Expo Go (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 2. keisetsu アプリの起動

Expo Go アプリを開き、下記のいずれかの方法で keisetsu アプリを起動してください。

**公開URL**

[https://u.expo.dev/e7aad213-54f2-490d-8cc3-7e06ea89c3d9](https://u.expo.dev/e7aad213-54f2-490d-8cc3-7e06ea89c3d9)

**QRコード**

![Expo QR](assets/keisetsu-expo-qr.png)

これで keisetsu アプリをすぐに利用開始できます。

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

## Expo での公開手順

1. Expo アカウントを作成し、`eas` CLI でログイン。
  ```bash
  npm ci
  eas login
  ```
2. プロジェクトID（app.jsonの `projectId`）を確認
3. 公開ビルド・アップデート
  ```bash
  eas update --branch main
  ```
  公開URLは `app.json` の `updates.url` で確認できます。

## 関連リンク

- [keisetsu-database](https://github.com/kumo01GitHub/keisetsu-database)
- [keisetsu-admin](https://github.com/kumo01GitHub/keisetsu-admin)
- [keisetsu-docs](https://github.com/kumo01GitHub/keisetsu-docs)
