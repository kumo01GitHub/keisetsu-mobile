import { expect, test } from '@playwright/test';

test('mobile app renders and can switch to test tab', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('keisetsu')).toBeVisible();
  await expect(page.getByText('単語帳で学ぶ')).toBeVisible();

  await page.getByText('テスト', { exact: true }).click();
  await expect(page.getByText('4択テスト')).toBeVisible();
});
