import { writable } from 'svelte/store';

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastMessage {
	id: string;
	text: string;
	tone: ToastTone;
}

export const toasts = writable<ToastMessage[]>([]);

let seq = 0;

export function showToast(text: string, tone: ToastTone = 'info', ms = 3200) {
	const id = `t-${++seq}`;
	toasts.update((list) => [...list, { id, text, tone }]);
	setTimeout(() => {
		toasts.update((list) => list.filter((t) => t.id !== id));
	}, ms);
}
