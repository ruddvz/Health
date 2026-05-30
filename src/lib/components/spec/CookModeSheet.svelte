<script lang="ts">
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

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if open && meal}
	<div class="modal" role="presentation">
		<button type="button" class="backdrop" aria-label="Close cook mode" onclick={close}></button>
		<div class="sheet nothing-surface" role="dialog" aria-modal="true" aria-labelledby="cook-h">
			<div class="head">
				<h2 id="cook-h" class="title">{meal.name}</h2>
				<button type="button" class="x pressable" onclick={close} aria-label="Close">×</button>
			</div>
			{#if meal.prep_method || meal.prep_minutes}
				<p class="meta mono-caps">
					{meal.prep_method ?? 'Prep'}{meal.prep_minutes ? ` · ${meal.prep_minutes} min` : ''}
				</p>
			{/if}

			<p class="mono-caps lab">Ingredients</p>
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

			<p class="mono-caps lab">Steps</p>
			<ol class="steps">
				{#each steps as step, i (i)}
					<li>{step}</li>
				{/each}
			</ol>

			<p class="mono-caps lab">Timer</p>
			<p class="timer-display" aria-live="polite">{timerLabel}</p>
			<div class="timers">
				<button type="button" class="tbtn pressable" onclick={() => startTimer(300)}>5 min</button>
				<button type="button" class="tbtn pressable" onclick={() => startTimer(600)}>10 min</button>
				<button type="button" class="tbtn pressable" onclick={() => startTimer(900)}>15 min</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal {
		position: fixed;
		inset: 0;
		z-index: 220;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: rgba(0, 0, 0, 0.6);
		cursor: pointer;
	}

	.sheet {
		position: relative;
		width: min(100vw, 430px);
		max-height: 92dvh;
		overflow: auto;
		padding: var(--space-4);
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
	}

	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.title {
		margin: 0;
		font-size: 20px;
		font-weight: 650;
		color: var(--text-1);
	}

	.x {
		width: 44px;
		height: 44px;
		border: 1px solid var(--line-2);
		border-radius: var(--radius-xs);
		background: transparent;
		color: var(--text-1);
		font-size: 24px;
		line-height: 1;
		cursor: pointer;
		flex-shrink: 0;
	}

	.meta {
		margin: 0 0 var(--space-3);
		font-size: 9px;
		color: var(--text-3);
	}

	.lab {
		margin: var(--space-3) 0 var(--space-2);
		font-size: 9px;
		color: var(--text-3);
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
		font-size: 14px;
		color: var(--text-2);
		cursor: pointer;
	}

	.muted {
		font-size: 14px;
		color: var(--text-3);
		padding: 4px 0;
	}

	.steps {
		margin: 0;
		padding-left: 1.2rem;
		font-size: 14px;
		line-height: 1.5;
		color: var(--text-2);
	}

	.timer-display {
		margin: 0 0 var(--space-2);
		font-size: 28px;
		font-weight: 650;
		font-family: var(--font-mono);
		color: var(--red);
	}

	.timers {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.tbtn {
		flex: 1;
		min-height: 44px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--line-2);
		background: var(--surface-2);
		color: var(--text-1);
		font-weight: 650;
		cursor: pointer;
	}
</style>
