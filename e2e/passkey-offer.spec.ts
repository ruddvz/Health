import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const minimalPlan = readFileSync(join(process.cwd(), 'samples/minimal-plan-v2.json'), 'utf8');

test.describe('Health Lock offer', () => {
	test('Not now skips passkey offer and opens Today', async ({ page }) => {
		await page.goto('./import');
		await page.getByRole('button', { name: /paste json/i }).click();
		await page.getByLabel('Plan JSON').fill(minimalPlan);
		await page.getByRole('button', { name: 'Review' }).click();
		await page.getByRole('button', { name: 'Apply plan' }).click();
		await expect(page.getByRole('dialog', { name: /protect your health plan/i })).toBeVisible();
		await page.getByRole('button', { name: /not now/i }).click();
		await expect(page).toHaveURL(/\/today\/?$/);
		await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
	});
});
