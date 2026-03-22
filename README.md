# keisetsu Mobile

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/kumo01GitHub/keisetsu-mobile/pulls)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/kumo01GitHub/keisetsu-mobile/actions/workflows/ci.yml/badge.svg)](https://github.com/kumo01GitHub/keisetsu-mobile/actions/workflows/ci.yml)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/99ebf607cb804fd4a7e7fb2f037605a0)](https://app.codacy.com/gh/kumo01GitHub/keisetsu-mobile/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/99ebf607cb804fd4a7e7fb2f037605a0)](https://app.codacy.com/gh/kumo01GitHub/keisetsu-mobile/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)


This is the learning client for keisetsu.
Built with Expo + React Native, it handles fetching catalog/manifest/`.kdb` and enables offline study.


## App Features

- Load the catalog from GitHub and fetch the list of available decks
- Select a deck to download its `.kdb` and save it to the device's SQLite storage
- Import local `.kdb` files via file picker
- Study mode for viewing word cards
- Test mode for self-grading with random questions
- Save recent test history (correct/incorrect, missed vocabulary) on the device
- Switch and delete saved decks


## Architecture

```text
App.tsx
  |- Screen state management (study / test / source / source-settings)
  |- Catalog fetch, manifest resolution, deck download
  |- Test history saving
  |
  +-- src/components/
  |     |- SourceScreen, SourceSettingsScreen
  |     |- StudyScreen, TestScreen
  |     |- AppHeader, FooterNav
  |
  +-- src/services/database.ts
  |     |- SQLite I/O (cards, deck_metadata)
  |     |- Get DB list, update metadata, delete
  |
  +-- src/constants, src/types, src/utils
        |- Config values, type definitions, URL generation/display name resolution, etc.
```

### Data Model (Key Points)

- Use `deck_metadata.display_name` as the deck display name
- `cards` require `term` and `summary` fields
- If `summary` is missing, use the `meaning` column as a fallback
- Use `detail` or `example` for supplementary text


## Local Development Steps

### Prerequisites

- Node.js 20.x or higher (recommended)
- npm
- iOS Simulator (Xcode) or Android Emulator

### Setup

```bash
cd keisetsu-mobile
npm ci
```

### Start Development Server

```bash
npm run start
```

### Launch on Device/Simulator

```bash
npm run ios
npm run android
```

### Quality Checks

```bash
npm run lint
npm run typecheck
npm run build:ci
```

## Expo Deployment Steps

1. Create an Expo account and log in with the `eas` CLI.
  ```bash
  npm ci
  eas login
  ```
2. Check the project ID (`projectId` in app.json)
3. Publish build/update:
  ```bash
  eas update --branch main
  ```
  The public URL can be found in `updates.url` in `app.json`.

## Related Links

- [keisetsu-database](https://github.com/kumo01GitHub/keisetsu-database)
- [keisetsu-publisher](https://github.com/kumo01GitHub/keisetsu-publisher)
- [keisetsu-docs](https://github.com/kumo01GitHub/keisetsu-docs)
