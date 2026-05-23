const PBKDF2_ITERATIONS = 210_000;

function b64(bytes: ArrayBuffer): string {
	const bin = String.fromCharCode(...new Uint8Array(bytes));
	return btoa(bin);
}

function fromB64(s: string): Uint8Array {
	const bin = atob(s);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

async function sha256Hex(text: string): Promise<string> {
	const data = new TextEncoder().encode(text);
	const buf = await crypto.subtle.digest('SHA-256', data);
	return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Normalize recovery code input: uppercase, strip spaces/dashes. */
export function normalizeRecoveryCode(input: string): string {
	return input.replace(/[\s-]/g, '').toUpperCase();
}

export async function hashRecoveryCode(code: string): Promise<string> {
	return sha256Hex(normalizeRecoveryCode(code));
}

export async function hashPin(pin: string, saltB64?: string): Promise<{
	hashB64: string;
	saltB64: string;
	iterations: number;
}> {
	const saltBytes = saltB64 ? fromB64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
	const salt = new Uint8Array(saltBytes);
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(pin),
		'PBKDF2',
		false,
		['deriveBits']
	);
	const bits = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt,
			iterations: PBKDF2_ITERATIONS,
			hash: 'SHA-256'
		},
		keyMaterial,
		256
	);
	return {
		hashB64: b64(bits),
		saltB64: b64(salt.buffer as ArrayBuffer),
		iterations: PBKDF2_ITERATIONS
	};
}

export async function verifyPin(pin: string, cred: { hashB64: string; saltB64: string }): Promise<boolean> {
	const next = await hashPin(pin, cred.saltB64);
	return next.hashB64 === cred.hashB64;
}

export function randomBytes(n: number): Uint8Array {
	return crypto.getRandomValues(new Uint8Array(n));
}

/** Generate human-readable recovery codes (8 chars, grouped). */
export function generateRecoveryCodes(count = 8): string[] {
	const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	const codes: string[] = [];
	for (let c = 0; c < count; c++) {
		let raw = '';
		const bytes = randomBytes(5);
		for (let i = 0; i < 8; i++) {
			raw += alphabet[bytes[i % bytes.length]! % alphabet.length];
		}
		codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
	}
	return codes;
}

export function validatePinFormat(pin: string): string | null {
	if (!/^\d{4,8}$/.test(pin)) return 'PIN must be 4–8 digits.';
	return null;
}
