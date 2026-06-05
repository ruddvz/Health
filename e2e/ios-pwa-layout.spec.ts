import { expect, test } from '@playwright/test';

const widths = [375, 390, 430, 768, 1024] as const;

for (const width of widths) {
	test(`shell layout at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 });
		await page.goto('./today');
		await expect(page.locator('nav.bottom-nav, nav[aria-label="Primary"]')).toBeVisible();
		const main = page.locator('.app-shell__main');
		await expect(main).toBeVisible();
		const box = await main.boundingBox();
		expect(box).toBeTruthy();
		if (box) {
			expect(box.width).toBeLessThanOrEqual(width);
		}
	});
}

test('bottom tab has active state on Today', async ({ page }) => {
	await page.goto('./today');
	const todayTab = page.getByRole('link', { name: 'Today' });
	await expect(todayTab).toHaveAttribute('aria-current', 'page');
});
