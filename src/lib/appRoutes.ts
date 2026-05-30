/** Known in-app paths used by `SettingsRowLink` and similar (keeps `resolve()` type-safe). */
export const ROUTES = {
	systemSecurity: '/system/security',
	systemPrivacy: '/system/privacy',
	systemSettings: '/system/settings',
	systemSettingsExport: '/system/settings#export',
	systemSettingsDanger: '/system/settings#danger',
	systemAbout: '/system/about',
	systemPhases: '/system/phases',
	systemDiagnostics: '/system/diagnostics',
	systemGrocery: '/system/grocery',
	systemPrep: '/system/prep',
	systemSupplements: '/system/supplements'
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
