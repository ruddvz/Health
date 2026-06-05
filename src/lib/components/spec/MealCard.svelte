<script lang="ts">
	type SlotState = 'pending' | 'logged' | 'skipped';

	interface TrackProps {
		status: SlotState;
		onChange: (next: SlotState) => void;
	}

	interface Props {
		index: number;
		time: string;
		name: string;
		kcal: number;
		protein: string;
		carbs: string;
		fat: string;
		track?: TrackProps;
		onclick?: () => void;
	}
	let { index, time, name, kcal, protein, carbs, fat, track, onclick }: Props = $props();
</script>

{#if track}
	<div class="wrap nothing-surface">
		<div class="track" role="group" aria-label="Meal intake for this slot">
			<button
				type="button"
				class="tb pressable"
				data-on={track.status === 'logged'}
				onclick={() => track.onChange('logged')}
			>
				Log
			</button>
			<button
				type="button"
				class="tb pressable"
				data-on={track.status === 'skipped'}
				onclick={() => track.onChange('skipped')}
			>
				Skip
			</button>
			<button type="button" class="tb ghost pressable" onclick={() => track.onChange('pending')}
				>Reset</button
			>
		</div>
		<div class="row-main">
			<span class="idx">{index}</span>
			<div class="body">
				<p class="time">{time}</p>
				<p class="n">{name}</p>
				<p class="m">{kcal} kcal · P {protein} · C {carbs} · F {fat}</p>
			</div>
		</div>
	</div>
{:else}
	<button type="button" class="card nothing-surface pressable" {onclick}>
		<span class="idx">{index}</span>
		<div class="body">
			<p class="time">{time}</p>
			<p class="n">{name}</p>
			<p class="m">{kcal} kcal · P {protein} · C {carbs} · F {fat}</p>
		</div>
	</button>
{/if}

<style>
	.wrap,
	.card {
		border-radius: var(--r-card);
	}

	.wrap {
		width: 100%;
		margin-bottom: var(--s-2);
		padding: var(--s-3) var(--s-4);
	}

	.row-main {
		display: flex;
		gap: var(--s-3);
		align-items: flex-start;
		margin-top: var(--s-3);
	}

	.card {
		display: flex;
		gap: var(--s-3);
		width: 100%;
		min-height: 92px;
		padding: var(--s-3) var(--s-4);
		margin-bottom: var(--s-2);
		text-align: left;
		cursor: pointer;
	}

	.idx {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: var(--r-xxs);
		background: var(--h-surface-3);
		color: var(--h-text-muted);
		font-size: var(--t-caption-2);
		font-weight: var(--weight-semibold);
		flex-shrink: 0;
		margin-top: 2px;
	}

	.body {
		flex: 1;
		min-width: 0;
	}

	.time {
		margin: 0;
		font-size: var(--t-caption-2);
		font-weight: var(--weight-semibold);
		color: var(--h-text-faint);
	}

	.n {
		margin: var(--s-1) 0 0;
		font-size: var(--t-body);
		font-weight: var(--weight-semibold);
		color: var(--h-text);
	}

	.m {
		margin: var(--s-2) 0 0;
		font-size: var(--t-caption);
		color: var(--h-text-muted);
		line-height: var(--lh-caption);
	}

	.track {
		display: flex;
		gap: var(--s-2);
	}

	.tb {
		flex: 1;
		min-height: 44px;
		border-radius: var(--r-pill);
		border: 1px solid var(--h-line);
		background: var(--h-surface-3);
		color: var(--h-text-soft);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		cursor: pointer;
	}

	.tb[data-on='true'] {
		border-color: var(--h-accent-line);
		color: var(--h-text);
		background: var(--h-accent-soft);
	}

	.tb.ghost {
		flex: 0.6;
		opacity: 0.85;
	}
</style>
