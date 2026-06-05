<script lang="ts">
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import { LS_PLAN } from '$lib/constants/storage';
	import { clearAllLocalHealthData, clearPlanParseError } from '$lib/stores/healthApp';

	interface Props {
		message: string;
	}

	let { message }: Props = $props();

	function exportRaw() {
		if (!browser) return;
		const raw = localStorage.getItem(LS_PLAN);
		if (!raw) return;
		const blob = new Blob([raw], { type: 'application/json' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'health-corrupted-plan-raw.json';
		a.click();
		URL.revokeObjectURL(a.href);
	}

	function wipe() {
		if (
			!browser ||
			!window.confirm(
				'Clear all local Health data and start fresh? Export the raw file first if you want to fix it offline.'
			)
		) {
			return;
		}
		clearAllLocalHealthData();
		clearPlanParseError();
	}
</script>

<section class="recovery nothing-surface" role="alert" aria-labelledby="recovery-title">
	<h2 id="recovery-title" class="title">Stored plan could not be read</h2>
	<p class="body">{message}</p>
	<div class="actions">
		<button type="button" class="btn-secondary pressable" onclick={exportRaw}
			>Export raw data</button
		>
		<a class="btn-primary" href={resolve('/import')}>Import a new plan</a>
		<button type="button" class="btn-ghost pressable" onclick={wipe}>Clear local data</button>
	</div>
</section>

<style>
	.recovery {
		margin: var(--space-3) var(--space-4);
		padding: var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid var(--danger, var(--red));
	}

	.title {
		margin: 0 0 var(--space-2);
		font-size: 17px;
		font-weight: 650;
		color: var(--text-1);
	}

	.body {
		margin: 0;
		font-size: 14px;
		line-height: 1.5;
		color: var(--text-2);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: var(--space-4);
	}

	.btn-primary {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
		padding: 12px 18px;
		border-radius: var(--radius-control, var(--radius-sm));
		background: linear-gradient(180deg, rgba(167, 255, 106, 0.95), rgba(112, 242, 166, 0.86));
		color: #081008;
		border-color: rgba(167, 255, 106, 0.28);
		color: #fff;
		font-size: 16px;
		font-weight: 650;
		text-decoration: none;
	}

	.btn-secondary {
		min-height: 48px;
		padding: 12px 18px;
		border-radius: var(--radius-control, var(--radius-sm));
		border: 1px solid var(--line-2);
		background: transparent;
		color: var(--text-1);
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-ghost {
		min-height: 44px;
		border: none;
		background: transparent;
		color: var(--text-2);
		font-size: 14px;
		text-decoration: underline;
		cursor: pointer;
	}
</style>
