<script lang="ts">
	import { focusTrap } from '$lib/a11y/focusTrap';
	import { onboarding } from '$lib/stores/healthApp';

	interface Props {
		open: boolean;
		onClose: () => void;
		onConfirm: () => void;
	}
	let { open, onClose, onConfirm }: Props = $props();
</script>

{#if open}
	<div class="modal" role="presentation">
		<button type="button" class="backdrop" aria-label="Close review" onclick={onClose}></button>
		<div
			class="sheet nothing-surface"
			use:focusTrap={{ onEscape: onClose }}
			role="dialog"
			aria-modal="true"
			aria-labelledby="rev-h"
		>
			<h2 id="rev-h" class="mono-caps h">Review & import</h2>
			<p class="rev-p">
				Next, use <strong>Copy prompt</strong> on Import, then paste JSON when Claude finishes.
			</p>
			<ul class="rev-ul">
				<li><strong>Name</strong>: {$onboarding.profile.name || '—'}</li>
				<li><strong>Goal</strong>: {$onboarding.goal.primary_goal || '—'}</li>
				<li><strong>Country</strong>: {$onboarding.lifestyle.country || '—'}</li>
				<li>
					<strong>Training</strong>: {$onboarding.training.days_per_week}×/wk, {$onboarding.training
						.location || '—'}
				</li>
			</ul>
			<div class="rev-row">
				<button type="button" class="ghost pressable" onclick={onClose}>Back</button>
				<button type="button" class="red pressable" onclick={onConfirm}>Go to Import</button>
			</div>
		</div>
	</div>
{/if}
