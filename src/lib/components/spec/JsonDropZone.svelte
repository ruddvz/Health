<script lang="ts">
	interface Props {
		busy?: boolean;
		onFiles?: (files: File[]) => void;
		/** Opens the hidden file input (keyboard + screen reader friendly). */
		onBrowse?: () => void;
	}
	let { busy = false, onFiles, onBrowse }: Props = $props();

	let dragDepth = $state(0);
	const dragOver = $derived(dragDepth > 0);

	function onDragEnter(e: DragEvent) {
		e.preventDefault();
		dragDepth += 1;
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
	}

	function onDragLeave(e: DragEvent) {
		e.preventDefault();
		dragDepth = Math.max(0, dragDepth - 1);
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragDepth = 0;
		const list = e.dataTransfer?.files;
		if (!list?.length) return;
		const files = [...list].filter(
			(f) => f.type === 'application/json' || f.name.toLowerCase().endsWith('.json')
		);
		if (files.length) onFiles?.(files);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="zone nothing-surface"
	class:busy
	class:drag={dragOver}
	aria-busy={busy}
	ondragenter={onDragEnter}
	ondragover={onDragOver}
	ondragleave={onDragLeave}
	ondrop={onDrop}
>
	<div class="inner">
		<span class="brace" aria-hidden="true">{'{ }'}</span>
		<p class="lab">.JSON</p>
		<p class="hint">Drop a file, browse, or use upload below</p>
		{#if onBrowse}
			<button type="button" class="browse pressable" onclick={() => onBrowse()}>Browse files</button
			>
		{/if}
	</div>
</div>

<style>
	.zone {
		position: relative;
		min-height: 180px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--s-3);
		overflow: hidden;
		border-radius: var(--r-card);
	}

	@media (min-width: 768px) {
		.zone {
			min-height: 210px;
		}
	}

	.zone:focus-visible {
		box-shadow: none;
	}

	.zone::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle at 1px 1px, var(--h-line-soft) 1px, transparent 0);
		background-size: 18px 18px;
		opacity: 0.5;
		pointer-events: none;
	}

	.inner {
		position: relative;
		text-align: center;
		padding: var(--s-6);
	}

	.brace {
		display: block;
		font-family: var(--font-mono);
		font-size: 42px;
		color: var(--h-text-faint);
		letter-spacing: 0.08em;
		margin-bottom: var(--s-2);
	}

	.lab {
		margin: 0;
		font-size: var(--t-footnote);
		font-weight: var(--weight-semibold);
		color: var(--h-accent);
		letter-spacing: 0.12em;
	}

	.hint {
		margin: var(--s-3) 0 0;
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
	}

	.browse {
		margin-top: var(--s-4);
		min-height: 44px;
		padding: 0 var(--s-5);
		border-radius: var(--r-pill);
		border: 1px solid var(--h-line-strong);
		background: var(--h-surface-3);
		color: var(--h-text);
		font-weight: var(--weight-semibold);
		font-size: var(--t-footnote);
		cursor: pointer;
	}

	.busy {
		opacity: 0.65;
	}

	.zone.drag {
		outline: 2px solid var(--h-accent-line);
		outline-offset: -2px;
		background: var(--h-accent-soft);
	}
</style>
