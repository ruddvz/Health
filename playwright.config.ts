import { defineConfig, devices } from '@playwright/test';

/** Vite preview binds `localhost` (see `vite preview` output); path matches `kit.paths.base`. Trailing slash so relative navigation stays under `/Health/`. */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173/Health/';

export default defineConfig({
	testDir: 'e2e',
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	timeout: 60_000,
	expect: { timeout: 15_000 },
	snapshotPathTemplate: '{testDir}/screenshots/{projectName}/{arg}{ext}',
	projects: [
		{
			name: 'chromium',
			testIgnore: /screenshots-routes\.spec\.ts/,
			use: { ...devices['Pixel 5'] }
		},
		{
			name: 'screenshots-mobile',
			testMatch: /screenshots-routes\.spec\.ts/,
			use: { ...devices['Pixel 5'] }
		},
		{
			name: 'screenshots-iphone',
			testMatch: /screenshots-routes\.spec\.ts/,
			use: {
				...devices['Pixel 5'],
				viewport: { width: 393, height: 852 },
				deviceScaleFactor: 3,
				isMobile: true,
				hasTouch: true,
				userAgent: devices['iPhone 13'].userAgent
			}
		}
	],
	use: {
		baseURL
	},
	webServer: {
		command: 'npm run build && npm run preview -- --port 4173 --strictPort',
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 300_000
	}
});
