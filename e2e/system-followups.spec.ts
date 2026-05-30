import { expect, test } from '@playwright/test';

test.describe('Audit follow-ups', () => {
	test('settings shows appearance controls', async ({ page }) => {
		await page.goto('./system/settings');
		await expect(page.getByText('Appearance').first()).toBeVisible();
		await expect(page.getByRole('button', { name: 'Dark' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Light' })).toBeVisible();
	});

	test('system hub links to phases', async ({ page }) => {
		await page.goto('./system');
		await expect(page.getByRole('link', { name: /Phases/i })).toBeVisible();
	});
});
