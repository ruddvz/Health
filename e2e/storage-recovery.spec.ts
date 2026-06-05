import { expect, test } from '@playwright/test';

test.describe('Storage recovery', () => {
	test('shows recovery banner when saved plan JSON is invalid', async ({ page }) => {
		await page.goto('./');
		await page.evaluate(() => {
			localStorage.setItem('health.v2.plan', '{not valid json');
		});
		await page.reload();
		await expect(
			page.getByRole('heading', { name: 'Stored plan could not be read' })
		).toBeVisible();
		await expect(page.getByRole('button', { name: 'Clear local data' })).toBeVisible();
	});
});
