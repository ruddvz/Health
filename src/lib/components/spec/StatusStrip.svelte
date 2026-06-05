<div class="strip" role="status" aria-live="off">
	<span class="pill">
		<span class="dot" aria-hidden="true"></span>
		<span class="label">Health</span>
	</span>
</div>

<style>
	.strip {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 32px;
		padding: var(--s-2) 0 var(--s-1);
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 28px;
		padding: 0 var(--s-3);
		border-radius: var(--r-pill);
		background: var(--h-surface-2);
		border: 1px solid var(--h-line);
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--h-accent);
		box-shadow: 0 0 8px var(--h-accent-line);
		flex-shrink: 0;
	}

	.label {
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-text-soft);
		letter-spacing: -0.01em;
	}
</style>
