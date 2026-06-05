import { expect, test } from '@playwright/test';

test.describe('No-plan empty states', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('./');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
	});

	test('welcome screen explains the app', async ({ page }) => {
		await expect(page.getByRole('heading', { name: /private daily health plan/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /Create plan prompt/ }).first()).toBeVisible();
		await expect(page.getByRole('link', { name: /import json/i }).first()).toBeVisible();
	});

	test('Today shows no-plan state', async ({ page }) => {
		await page.goto('./today');
		await expect(page.getByText('No plan loaded yet')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Import JSON' })).toBeVisible();
	});

	test('Meals shows no-plan state', async ({ page }) => {
		await page.goto('./meals');
		await expect(page.getByText('Meals come from your plan')).toBeVisible();
	});

	test('Train shows no-plan state', async ({ page }) => {
		await page.goto('./train');
		await expect(page.getByText('Training needs a plan')).toBeVisible();
	});

	test('Progress allows logging without plan', async ({ page }) => {
		await page.goto('./progress');
		await expect(page.getByText(/No plan loaded/i)).toBeVisible();
		await expect(page.getByText('Log Check-in')).toBeVisible();
	});

	test('Diagnostics does not claim schema parses without plan', async ({ page }) => {
		await page.goto('./system/diagnostics');
		await expect(page.getByText('No plan loaded')).toBeVisible();
		await expect(page.getByText('Plan JSON parses')).not.toBeVisible();
	});
});
