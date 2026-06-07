import type { Page } from '@playwright/test';

/** Paste JSON, review preview, apply plan, dismiss passkey offer if shown. */
export async function importPlanViaPaste(page: Page, json: string) {
	await page.goto('./import');
	await page.getByRole('button', { name: 'Paste JSON' }).click();
	await page.getByRole('textbox', { name: 'Plan JSON' }).fill(json);
	await page.getByRole('button', { name: 'Review plan' }).click();
	await page.getByRole('button', { name: 'Apply plan' }).click();
	const passkey = page.getByRole('dialog', { name: /protect your health plan/i });
	if (await passkey.isVisible().catch(() => false)) {
		await page.getByRole('button', { name: /not now/i }).click();
	}
}
