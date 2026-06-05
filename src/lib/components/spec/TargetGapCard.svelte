<script lang="ts">
	interface M {
		label: string;
		value: string;
		color: 'red' | 'warning' | 'text';
	}
	interface Props {
		title: string;
		message: string;
		metrics: M[];
		cta: string;
		onCta?: () => void;
	}
	let { title, message, metrics, cta, onCta }: Props = $props();
</script>

<section class="card nothing-surface" aria-label={title}>
	<p class="t">{title}</p>
	<p class="msg">{message}</p>
	<div class="grid">
		{#each metrics as m (m.label)}
			<div class="cell">
				<p class="lab">{m.label}</p>
				<p class="val" class:red={m.color === 'red'} class:warn={m.color === 'warning'}>
					{m.value}
				</p>
			</div>
		{/each}
	</div>
	<button type="button" class="cta pressable" onclick={() => onCta?.()}>{cta}</button>
</section>

<style>
	.card {
		padding: var(--s-4);
		margin-bottom: var(--s-3);
		border: 1px solid var(--h-orange-line);
		background: linear-gradient(180deg, var(--h-orange-soft), var(--h-surface));
	}

	.t {
		margin: 0;
		color: var(--h-orange);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
	}

	.msg {
		margin: var(--s-2) 0 var(--s-3);
		font-size: var(--t-callout);
		color: var(--h-text);
		line-height: var(--lh-body);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--s-2);
		margin-bottom: var(--s-3);
	}

	.cell {
		padding: var(--s-2);
		border-radius: var(--r-card-inner);
		background: var(--h-surface-2);
		border: 1px solid var(--h-line-soft);
	}

	.lab {
		margin: 0 0 var(--s-1);
		font-size: var(--t-caption-2);
		font-weight: var(--weight-semibold);
		color: var(--h-text-faint);
	}

	.val {
		margin: 0;
		font-size: var(--t-footnote);
		font-weight: var(--weight-bold);
		color: var(--h-text);
	}

	.val.red {
		color: var(--h-red);
	}

	.val.warn {
		color: var(--h-orange);
	}

	.cta {
		width: 100%;
		min-height: 44px;
		border-radius: var(--r-pill);
		border: none;
		background: var(--h-accent);
		color: var(--health-primary-text);
		font-weight: var(--weight-semibold);
		font-size: var(--t-footnote);
		cursor: pointer;
		box-shadow: var(--shadow-glow);
	}
</style>
