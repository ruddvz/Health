import { expect, test } from '@playwright/test';

test.describe('No-plan empty states', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('./');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
	});

	test('welcome screen explains the app', async ({ page }) => {
		await expect(
			page.getByRole('heading', { name: /daily health plan, without the noise/i })
		).toBeVisible();
		await expect(page.getByRole('button', { name: /Create plan prompt/i }).first()).toBeVisible();
		await expect(page.getByRole('link', { name: /Import my plan/i }).first()).toBeVisible();
	});

	test('Today shows no-plan state', async ({ page }) => {
		await page.goto('./today');
		await expect(page.getByText('Build your daily command center')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Import plan' })).toBeVisible();
	});

	test('Meals shows no-plan state', async ({ page }) => {
		await page.goto('./meals');
		await expect(page.getByText('Meals appear after import')).toBeVisible();
	});

	test('Train shows no-plan state', async ({ page }) => {
		await page.goto('./train');
		await expect(page.getByText('Training unlocks with your plan')).toBeVisible();
	});

	test('Progress allows logging without plan', async ({ page }) => {
		await page.goto('./progress');
		await expect(page.getByRole('heading', { name: /Track progress privately/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /log check-in/i }).first()).toBeVisible();
	});

	test('Diagnostics does not claim schema parses without plan', async ({ page }) => {
		await page.goto('./system/diagnostics');
		await expect(page.getByText('No plan loaded')).toBeVisible();
		await expect(page.getByText('Plan JSON parses')).not.toBeVisible();
	});

	test('System Phases shows no-plan state', async ({ page }) => {
		await page.goto('./system/phases');
		await expect(page.getByRole('heading', { name: /Phases need a plan/i })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Import plan' })).toBeVisible();
	});

	test('System Grocery shows no-plan state', async ({ page }) => {
		await page.goto('./system/grocery');
		await expect(page.getByRole('heading', { name: /Grocery list needs a plan/i })).toBeVisible();
	});

	test('System Prep shows no-plan state', async ({ page }) => {
		await page.goto('./system/prep');
		await expect(page.getByRole('heading', { name: /Prep guide needs a plan/i })).toBeVisible();
	});

	test('System Supplements shows no-plan state', async ({ page }) => {
		await page.goto('./system/supplements');
		await expect(page.getByRole('heading', { name: /Supplements need a plan/i })).toBeVisible();
	});
});
