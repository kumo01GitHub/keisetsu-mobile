import { expect, test } from '@playwright/test';

const APP_TITLE = /単語帳で学ぶ|Learn with flashcards/;
const TEST_TAB = /テスト|Test/;
const TEST_SCREEN_TITLE = /4択テスト|Multiple choice/;
const DECK_TAB = /単語帳|Decks/;
const SETTINGS_BUTTON = /詳細設定|Settings/;
const BACK_BUTTON = /戻る|Back/;
const FETCH_CATALOG_BUTTON = /カタログを取得|Fetch catalog/;
const LATEST_ERROR = /最新のエラー|Latest error/;

test.describe('mobile major flows', () => {
  test('renders app and switches to test tab', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('keisetsu')).toBeVisible();
    await expect(page.getByText(APP_TITLE)).toBeVisible();

    await page.getByText(TEST_TAB, { exact: true }).click();
    await expect(page.getByText(TEST_SCREEN_TITLE)).toBeVisible();
  });

  test('shows catalog fetch error for invalid repository', async ({ page }) => {
    await page.goto('/');

    await page.getByText(DECK_TAB, { exact: true }).click();
    await page.getByText(SETTINGS_BUTTON, { exact: true }).click();

    await page.locator('input[value="keisetsu-database"]').fill('repo-that-does-not-exist');
    await page.getByText(BACK_BUTTON, { exact: true }).click();

    await page.getByText(FETCH_CATALOG_BUTTON, { exact: true }).click();
    await expect(page.getByText(LATEST_ERROR)).toBeVisible();
    await expect(page.getByText(/HTTP\s+404/)).toBeVisible();
  });
});
