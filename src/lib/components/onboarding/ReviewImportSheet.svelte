<script lang="ts">
	import BottomSheet from '$lib/components/app/BottomSheet.svelte';
	import HealthButton from '$lib/components/ui/HealthButton.svelte';
	import { onboarding } from '$lib/stores/healthApp';

	interface Props {
		open: boolean;
		onClose: () => void;
		onConfirm: () => void;
	}
	let { open, onClose, onConfirm }: Props = $props();
</script>

<BottomSheet {open} title="Review & import" {onClose}>
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
	{#snippet footer()}
		<HealthButton variant="ghost" block onclick={onClose}>Back</HealthButton>
		<HealthButton variant="primary" block onclick={onConfirm}>Go to Import</HealthButton>
	{/snippet}
</BottomSheet>

<style>
	.rev-p {
		margin: 0 0 var(--s-3);
		font-size: var(--t-footnote);
		line-height: var(--lh-body);
		color: var(--h-text-soft);
	}

	.rev-ul {
		margin: 0;
		padding-left: 1.2rem;
		font-size: var(--t-footnote);
		line-height: var(--lh-body);
		color: var(--h-text-soft);
	}
</style>
