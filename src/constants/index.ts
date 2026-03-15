import type { Card, Screen, SourceConfig } from "../types";

export const STORAGE_KEYS = {
  sourceConfig: "keisetsu/source-config",
  testHistory: "keisetsu/test-history",
};

export const SAMPLE_CARDS: Card[] = [
  {
    id: "1",
    term: "継続",
    summary: "続けて行うこと。学習を細く長く保つこと。",
    detail: "毎日10分でも継続すると定着しやすい。",
    category: "学習",
  },
  {
    id: "2",
    term: "敬意",
    summary: "相手を尊重する気持ち。",
    detail: "言葉づかいには敬意が表れる。",
    category: "日本語",
  },
  {
    id: "3",
    term: "abandon",
    summary: "見捨てる、断念する。",
    detail: "Do not abandon the plan too early.",
    category: "English",
  },
  {
    id: "4",
    term: "resilient",
    summary: "回復力がある、しなやかに立ち直る。",
    detail: "A resilient learner recovers quickly from mistakes.",
    category: "English",
  },
];

export const DEFAULT_SOURCE_CONFIG: SourceConfig = {
  owner: "kumo01GitHub",
  repo: "keisetsu-database",
  refType: "branch",
  refName: "main",
  dbPath: "databases/starter-basic.kdb",
  localImportDeckName: "",
  activeDbName: null,
  activeSource: "sample",
};

export const SCREEN_TABS: {
  key: Screen;
  label: string;
  caption: string;
}[] = [
  { key: "study", label: "学習", caption: "カードを見る" },
  { key: "test", label: "テスト", caption: "結果を記録" },
  { key: "source", label: "単語帳", caption: "使うカードを選ぶ" },
];
