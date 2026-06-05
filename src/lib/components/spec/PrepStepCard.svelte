<script lang="ts">
	interface Props {
		title: string;
		subtitle: string;
		time: string;
		checked: boolean;
		onToggle?: () => void;
	}
	let { title, subtitle, time, checked, onToggle }: Props = $props();
</script>

<div class="card nothing-surface">
	<label class="row">
		<input type="checkbox" class="cb" {checked} onchange={() => onToggle?.()} />
		<div class="mid">
			<p class="t">{title}</p>
			<p class="s">{subtitle}</p>
		</div>
		<span class="tm">{time}</span>
	</label>
</div>

<style>
	.card {
		padding: 0;
		margin-bottom: var(--s-2);
		overflow: hidden;
	}

	.row {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		padding: var(--s-3) var(--s-4);
		min-height: 76px;
		cursor: pointer;
	}

	.cb {
		width: 22px;
		height: 22px;
		accent-color: var(--h-accent);
		flex-shrink: 0;
		cursor: pointer;
	}

	.mid {
		flex: 1;
		min-width: 0;
	}

	.t {
		margin: 0;
		font-size: var(--t-callout);
		font-weight: var(--weight-semibold);
		color: var(--h-text);
	}

	.s {
		margin: var(--s-1) 0 0;
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
		line-height: var(--lh-caption);
	}

	.tm {
		font-size: var(--t-caption-2);
		font-weight: var(--weight-semibold);
		color: var(--h-text-faint);
		flex-shrink: 0;
	}
</style>
