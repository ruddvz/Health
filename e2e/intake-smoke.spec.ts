import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importPlanViaPaste } from './helpers/importPlan';

test.describe('Health PWA smoke', () => {
	test('welcome then intake first step', async ({ page }) => {
		await page.goto('.');
		await expect(
			page.getByRole('heading', { name: /daily health plan, without the noise/i })
		).toBeVisible();
		await page
			.getByRole('button', { name: /Create plan prompt/ })
			.first()
			.click();
		await expect(page.getByText('About you').first()).toBeVisible();
		await expect(page.getByText('Answers save automatically on this device.')).toBeVisible();
	});

	test('import sample plan and open Today', async ({ page }) => {
		const sample = readFileSync(join(process.cwd(), 'samples', 'minimal-plan-v2.json'), 'utf-8');
		await importPlanViaPaste(page, sample);
		await expect(page).toHaveURL(/\/today/, { timeout: 15000 });
		await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
	});
});
