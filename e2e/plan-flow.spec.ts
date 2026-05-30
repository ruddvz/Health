import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const minimalPlan = readFileSync(join(process.cwd(), 'samples/minimal-plan-v2.json'), 'utf8');

test.describe('Plan loaded flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('./import');
		await page.getByRole('button', { name: 'Paste JSON' }).click();
		await page.getByLabel('Plan JSON').fill(minimalPlan);
		await page.getByRole('button', { name: 'Validate' }).click();
		const passkey = page.getByRole('dialog', { name: /protect your health plan/i });
		if (await passkey.isVisible().catch(() => false)) {
			await page.getByRole('button', { name: /not now/i }).click();
		}
		await expect(page.getByText('TODAY').first()).toBeVisible({ timeout: 15_000 });
	});

	test('Today shows quick navigation and privacy card', async ({ page }) => {
		await expect(page.getByText('Quick navigation').first()).toBeVisible();
		await expect(page.getByRole('link', { name: 'Phases' })).toBeVisible();
		await expect(page.getByText('Privacy & safety').first()).toBeVisible();
	});

	test('Quick nav opens Phases', async ({ page }) => {
		await page.getByRole('link', { name: 'Phases' }).click();
		await expect(page.getByText('PHASES').first()).toBeVisible();
		await expect(page.getByText('Foundation').first()).toBeVisible();
	});
});
