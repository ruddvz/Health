/** Per-route document titles for the Health PWA shell. */
const ROUTE_TITLES: Record<string, string> = {
	'/': 'Welcome',
	'/import': 'Import plan',
	'/today': 'Today',
	'/meals': 'Meals',
	'/train': 'Training',
	'/train/session': 'Workout',
	'/progress': 'Progress',
	'/system': 'System',
	'/system/phases': 'Phases',
	'/system/grocery': 'Grocery',
	'/system/prep': 'Prep',
	'/system/supplements': 'Supplements',
	'/system/security': 'Security',
	'/system/settings': 'Settings',
	'/system/diagnostics': 'Diagnostics',
	'/system/about': 'About',
	'/system/privacy': 'Privacy'
};

export function documentTitleForPath(pathname: string): string {
	const label = ROUTE_TITLES[pathname];
	if (!label) return 'Health — Personal Plan';
	if (label === 'Welcome') return 'Health — Personal Plan';
	return `${label} — Health`;
}
