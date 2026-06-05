/** True when running as an installed PWA (standalone display mode). */
export function isStandalonePwa(): boolean {
	if (typeof window === 'undefined') return false;
	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		(window.navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}
