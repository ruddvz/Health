<script lang="ts">
	import BottomSheet from '$lib/components/app/BottomSheet.svelte';
	import HealthButton from '$lib/components/ui/HealthButton.svelte';
	import type { MealRowDetail } from '$lib/logic/planDerive';

	interface Props {
		open: boolean;
		meal: MealRowDetail | null;
		onClose: () => void;
	}

	let { open, meal, onClose }: Props = $props();

	let timerLeft = $state(0);
	let timerLabel = $state('—');
	let timerId: ReturnType<typeof setInterval> | null = null;
	let reducedMotion = $state(false);

	$effect(() => {
		if (typeof window === 'undefined') return;
		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	const steps = $derived.by(() => {
		if (!meal?.description) return ['Follow your meal card or plan notes.'];
		const chunks = meal.description
			.split(/\n+|\.(?:\s+|$)/)
			.map((s) => s.trim())
			.filter((s) => s.length > 3);
		if (!chunks.length) return [meal.description];
		return chunks.slice(0, 14).map((c) => (c.endsWith('.') ? c : `${c}.`));
	});

	function clearTimer() {
		if (timerId) {
			clearInterval(timerId);
			timerId = null;
		}
	}

	function startTimer(seconds: number) {
		clearTimer();
		timerLeft = seconds;
		if (reducedMotion) {
			timerLabel = `${seconds}s`;
			return;
		}
		const tick = () => {
			timerLabel = timerLeft > 0 ? `${timerLeft}s` : 'Done';
			if (timerLeft <= 0) {
				clearTimer();
				if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
					try {
						navigator.vibrate(200);
					} catch {
						/* ignore */
					}
				}
				return;
			}
			timerLeft -= 1;
		};
		tick();
		timerId = setInterval(tick, 1000);
	}

	function close() {
		clearTimer();
		timerLabel = '—';
		onClose();
	}
</script>

<BottomSheet open={open && meal !== null} title={meal?.name ?? 'Cook mode'} onClose={close}>
	{#if meal}
		{#if meal.prep_method || meal.prep_minutes}
			<p class="meta">
				{meal.prep_method ?? 'Prep'}{meal.prep_minutes ? ` · ${meal.prep_minutes} min` : ''}
			</p>
		{/if}

		<p class="lab">Ingredients</p>
		<ul class="ing">
			{#if meal.ingredients?.length}
				{#each meal.ingredients as ing (ing.name)}
					<li>
						<label class="ing-row">
							<input type="checkbox" />
							<span>{ing.grams != null ? `${ing.grams}g ` : ''}{ing.name}</span>
						</label>
					</li>
				{/each}
			{:else}
				<li class="muted">No ingredient list in JSON — follow the description below.</li>
			{/if}
		</ul>

		<p class="lab">Steps</p>
		<ol class="steps">
			{#each steps as step, i (i)}
				<li>{step}</li>
			{/each}
		</ol>

		<p class="lab">Timer</p>
		<p class="timer-display" aria-live="polite">{timerLabel}</p>
		<div class="timers">
			<button type="button" class="tbtn pressable" onclick={() => startTimer(300)}>5 min</button>
			<button type="button" class="tbtn pressable" onclick={() => startTimer(600)}>10 min</button>
			<button type="button" class="tbtn pressable" onclick={() => startTimer(900)}>15 min</button>
		</div>
	{/if}
	{#snippet footer()}
		<HealthButton variant="primary" block onclick={close}>Done</HealthButton>
	{/snippet}
</BottomSheet>

<style>
	.meta {
		margin: 0 0 var(--s-3);
		font-size: var(--t-caption);
		color: var(--h-text-muted);
	}

	.lab {
		margin: var(--s-3) 0 var(--s-2);
		font-size: var(--t-caption);
		font-weight: var(--weight-semibold);
		color: var(--h-text-faint);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.ing {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.ing-row {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 8px 0;
		font-size: var(--t-footnote);
		color: var(--h-text-soft);
		cursor: pointer;
	}

	.muted {
		font-size: var(--t-footnote);
		color: var(--h-text-muted);
		padding: 4px 0;
	}

	.steps {
		margin: 0;
		padding-left: 1.2rem;
		font-size: var(--t-footnote);
		line-height: var(--lh-body);
		color: var(--h-text-soft);
	}

	.timer-display {
		margin: 0 0 var(--s-2);
		font-size: 28px;
		font-weight: var(--weight-bold);
		font-family: var(--font-mono);
		color: var(--h-accent);
	}

	.timers {
		display: flex;
		gap: var(--s-2);
		margin-bottom: var(--s-2);
	}

	.tbtn {
		flex: 1;
		min-height: 44px;
		border-radius: var(--r-control);
		border: 1px solid var(--h-line);
		background: var(--h-surface-2);
		color: var(--h-text);
		font-weight: var(--weight-semibold);
		cursor: pointer;
	}
</style>
