import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importPlanViaPaste } from './helpers/importPlan';

const minimalPlan = readFileSync(join(process.cwd(), 'samples/minimal-plan-v2.json'), 'utf8');

const routes = [
	{ name: 'welcome', path: './' },
	{ name: 'import', path: './import' },
	{ name: 'today-empty', path: './today' },
	{ name: 'meals-empty', path: './meals' },
	{ name: 'train-empty', path: './train' },
	{ name: 'progress-empty', path: './progress' },
	{ name: 'system', path: './system' },
	{ name: 'diagnostics-empty', path: './system/diagnostics' },
	{ name: 'phases-empty', path: './system/phases' }
] as const;

for (const route of routes) {
	test(`screenshot ${route.name}`, async ({ page }) => {
		await page.goto(route.path);
		await page.waitForLoadState('networkidle');
		await expect(page).toHaveScreenshot(`${route.name}.png`, {
			fullPage: true,
			maxDiffPixelRatio: 0.02
		});
	});
}

test('screenshot today with plan', async ({ page }) => {
	await importPlanViaPaste(page, minimalPlan);
	await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
	await expect(page).toHaveScreenshot('today-with-plan.png', {
		fullPage: true,
		maxDiffPixelRatio: 0.02
	});
});

test('screenshot meals with plan', async ({ page }) => {
	await importPlanViaPaste(page, minimalPlan);
	await page.goto('./meals');
	await page.waitForLoadState('networkidle');
	await expect(page).toHaveScreenshot('meals-with-plan.png', {
		fullPage: true,
		maxDiffPixelRatio: 0.02
	});
});
