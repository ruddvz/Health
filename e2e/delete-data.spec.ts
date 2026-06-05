import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importPlanViaPaste } from './helpers/importPlan';

const minimalPlan = readFileSync(join(process.cwd(), 'samples/minimal-plan-v2.json'), 'utf8');

test.describe('Delete local data', () => {
	test('clears plan and returns to welcome', async ({ page }) => {
		await importPlanViaPaste(page, minimalPlan);
		await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

		await page.goto('./system/settings');
		page.once('dialog', (d) => d.accept());
		await page.getByRole('button', { name: /delete all local/i }).click();

		await expect(page).toHaveURL(/\/Health\/?$/);
		await expect(
			page.getByRole('heading', { name: /Your private daily health plan/i })
		).toBeVisible({
			timeout: 15_000
		});

		await page.goto('./today');
		await expect(page.getByText('Build your daily command center')).toBeVisible();
	});
});
