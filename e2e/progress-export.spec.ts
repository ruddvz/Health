import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importPlanViaPaste } from './helpers/importPlan';

const minimalPlan = readFileSync(join(process.cwd(), 'samples/minimal-plan-v2.json'), 'utf8');

test.describe('Progress export', () => {
	test('settings progress export section is reachable', async ({ page }) => {
		await importPlanViaPaste(page, minimalPlan);
		await page.goto('./system/settings#progress-export');
		await expect(page.getByRole('button', { name: 'Download progress JSON only' })).toBeVisible();
	});

	test('progress tab exports JSON', async ({ page }) => {
		await page.goto('./progress');
		await expect(page.getByRole('button', { name: 'Export backup' })).toBeVisible();
	});
});
