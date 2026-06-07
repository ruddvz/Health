import { expect, test } from '@playwright/test';

test.describe('Import paste modal', () => {
	test('invalid JSON shows error inside paste sheet', async ({ page }) => {
		await page.goto('./import');
		await page.getByRole('button', { name: /paste json/i }).click();
		await expect(page.getByRole('dialog', { name: /paste plan json/i })).toBeVisible();
		await page.getByRole('textbox', { name: 'Plan JSON' }).fill('{ not valid json');
		await page.getByRole('button', { name: 'Review plan' }).click();
		await expect(page.locator('.paste-err')).toContainText(/json/i);
	});
});
