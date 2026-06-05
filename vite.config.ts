import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vitest/config';

const dev = process.argv.includes('dev');
const basePath = dev ? '' : '/Health';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'prompt',
			strategies: 'generateSW',
			includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'offline.html'],
			manifest: {
				id: `${basePath}/`,
				name: 'Health — Personal Plan',
				short_name: 'Health',
				lang: 'en',
				dir: 'ltr',
				description: 'Private offline health plan companion',
				start_url: `${basePath}/`,
				scope: `${basePath}/`,
				display: 'standalone',
				background_color: '#090a0c',
				theme_color: '#090a0c',
				orientation: 'portrait',
				categories: ['health', 'fitness', 'lifestyle'],
				shortcuts: [
					{
						name: 'Today',
						url: `${basePath}/today`,
						icons: [{ src: `${basePath}/icons/icon-192.png`, sizes: '192x192' }]
					},
					{
						name: 'Meals',
						url: `${basePath}/meals`,
						icons: [{ src: `${basePath}/icons/icon-192.png`, sizes: '192x192' }]
					},
					{
						name: 'Train',
						url: `${basePath}/train`,
						icons: [{ src: `${basePath}/icons/icon-192.png`, sizes: '192x192' }]
					},
					{
						name: 'Progress',
						url: `${basePath}/progress`,
						icons: [{ src: `${basePath}/icons/icon-192.png`, sizes: '192x192' }]
					}
				],
				icons: [
					{
						src: `${basePath}/icons/icon-192.png`,
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any maskable'
					},
					{
						src: `${basePath}/icons/icon-512.png`,
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable'
					}
				]
			},
			kit: {
				adapterFallback: '404.html',
				spa: true,
				includeVersionFile: true
			},
			workbox: {
				navigateFallbackDenylist: [/^\/api\//]
			},
			devOptions: {
				enabled: false
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
