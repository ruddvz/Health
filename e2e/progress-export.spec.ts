import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const minimalPlan = readFileSync(join(process.cwd(), 'samples/minimal-plan-v2.json'), 'utf8');

async function importMinimalPlan(page: import('@playwright/test').Page) {
	await page.goto('./import');
	await page.getByRole('button', { name: 'Paste JSON' }).click();
	await page.getByLabel('Plan JSON').fill(minimalPlan);
	await page.getByRole('button', { name: 'Validate' }).click();
	const passkey = page.getByRole('dialog', { name: /protect your health plan/i });
	if (await passkey.isVisible().catch(() => false)) {
		await page.getByRole('button', { name: /not now/i }).click();
	}
}

test.describe('Progress export', () => {
	test('settings progress export section is reachable', async ({ page }) => {
		await importMinimalPlan(page);
		await page.goto('./system/settings#progress-export');
		await expect(page.getByRole('button', { name: 'Download progress JSON only' })).toBeVisible();
	});
});
