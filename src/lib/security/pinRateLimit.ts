import { browser } from '$app/environment';

const LS_PIN_RATE = 'health.v2.pinRate';
const MAX_ATTEMPTS = 5;
const BASE_LOCK_MS = 30_000;

interface PinRateState {
	failures: number;
	lockedUntil: number;
}

let memoryState: PinRateState = { failures: 0, lockedUntil: 0 };

function readState(): PinRateState {
	if (!browser) return { ...memoryState };
	try {
		const raw = localStorage.getItem(LS_PIN_RATE);
		if (!raw) return { failures: 0, lockedUntil: 0 };
		const o = JSON.parse(raw) as PinRateState;
		return {
			failures: typeof o.failures === 'number' ? o.failures : 0,
			lockedUntil: typeof o.lockedUntil === 'number' ? o.lockedUntil : 0
		};
	} catch {
		return { failures: 0, lockedUntil: 0 };
	}
}

function writeState(s: PinRateState) {
	memoryState = { ...s };
	if (!browser) return;
	localStorage.setItem(LS_PIN_RATE, JSON.stringify(s));
}

export function pinLockoutRemainingMs(): number {
	const s = readState();
	if (!s.lockedUntil) return 0;
	const left = s.lockedUntil - Date.now();
	return left > 0 ? left : 0;
}

export function pinLockoutMessage(): string | null {
	const ms = pinLockoutRemainingMs();
	if (ms <= 0) return null;
	const sec = Math.ceil(ms / 1000);
	return `Too many attempts. Try again in ${sec} second${sec === 1 ? '' : 's'}.`;
}

export function recordPinFailure(): void {
	const s = readState();
	const failures = s.failures + 1;
	let lockedUntil = 0;
	if (failures >= MAX_ATTEMPTS) {
		const exponent = Math.min(failures - MAX_ATTEMPTS, 4);
		lockedUntil = Date.now() + BASE_LOCK_MS * 2 ** exponent;
	}
	writeState({ failures, lockedUntil });
}

export function clearPinFailures(): void {
	writeState({ failures: 0, lockedUntil: 0 });
}

export function isPinLockedOut(): boolean {
	return pinLockoutRemainingMs() > 0;
}
