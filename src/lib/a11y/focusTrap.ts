const FOCUSABLE =
	'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type FocusTrapParams = {
	onEscape?: () => void;
};

function focusableIn(root: HTMLElement): HTMLElement[] {
	return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
		(el) => !el.hasAttribute('disabled') && el.tabIndex !== -1
	);
}

/** Keeps keyboard focus inside a modal dialog; restores focus on destroy. */
export function focusTrap(node: HTMLElement, params?: FocusTrapParams) {
	let lastFocused: HTMLElement | null = null;

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			params?.onEscape?.();
			return;
		}
		if (e.key !== 'Tab') return;

		const items = focusableIn(node);
		if (!items.length) {
			e.preventDefault();
			return;
		}

		const first = items[0];
		const last = items[items.length - 1];
		const active = document.activeElement as HTMLElement | null;

		if (e.shiftKey) {
			if (active === first || !node.contains(active)) {
				e.preventDefault();
				last.focus();
			}
		} else if (active === last || !node.contains(active)) {
			e.preventDefault();
			first.focus();
		}
	}

	lastFocused = document.activeElement as HTMLElement | null;
	node.addEventListener('keydown', onKeydown);

	requestAnimationFrame(() => {
		const items = focusableIn(node);
		(items[0] ?? node).focus();
	});

	return {
		update(next?: FocusTrapParams) {
			params = next;
		},
		destroy() {
			node.removeEventListener('keydown', onKeydown);
			lastFocused?.focus?.();
		}
	};
}
