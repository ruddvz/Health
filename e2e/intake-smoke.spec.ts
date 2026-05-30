import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test.describe('Health PWA smoke', () => {
	test('home shows intake first step', async ({ page }) => {
		await page.goto('.');
		await expect(page.getByText('About you').first()).toBeVisible();
		await expect(page.getByText('Answers save automatically on this device.')).toBeVisible();
	});

	test('import sample plan and open Today', async ({ page }) => {
		await page.goto('./import');
		const sample = readFileSync(join(process.cwd(), 'samples', 'minimal-plan-v2.json'), 'utf-8');
		await page.getByRole('button', { name: 'Paste JSON' }).click();
		await page.getByLabel('Plan JSON').fill(sample);
		await page.getByRole('button', { name: 'Validate' }).click();
		const passkey = page.getByRole('dialog', { name: /protect your health plan/i });
		if (await passkey.isVisible().catch(() => false)) {
			await page.getByRole('button', { name: /not now/i }).click();
		}
		await expect(page).toHaveURL(/\/today/, { timeout: 15000 });
		await expect(page.getByText('TODAY').first()).toBeVisible();
	});
});
