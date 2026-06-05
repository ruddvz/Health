<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import BottomSheet from '$lib/components/app/BottomSheet.svelte';
	import PasskeyOfferSheet from '$lib/components/security/PasskeyOfferSheet.svelte';
	import DashedUploadButton from '$lib/components/spec/DashedUploadButton.svelte';
	import ImportPreviewCard from '$lib/components/spec/ImportPreviewCard.svelte';
	import InlineErrorCard from '$lib/components/spec/InlineErrorCard.svelte';
	import JsonDropZone from '$lib/components/spec/JsonDropZone.svelte';
	import ListRowButton from '$lib/components/spec/ListRowButton.svelte';
	import { loadSamplePlan } from '$lib/logic/loadSamplePlan';
	import { buildImportPreview } from '$lib/logic/importPreview';
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';
	import StatusStrip from '$lib/components/spec/StatusStrip.svelte';
	import HealthButton from '$lib/components/ui/HealthButton.svelte';
	import SafetyCard from '$lib/components/ui/SafetyCard.svelte';
	import TextLinkButton from '$lib/components/spec/TextLinkButton.svelte';
	import { MAX_PLAN_BYTES, SS_OFFER_PASSKEY } from '$lib/constants/storage';
	import { buildClaudePrompt, copyTextToClipboard } from '$lib/logic/buildClaudePrompt';
	import { flattenGrocery } from '$lib/logic/planDerive';
	import type { PlanV2 } from '$lib/types/planV2';
	import { onboarding, persistProgress, plan, progress, savePlan } from '$lib/stores/healthApp';
	import { securityConfig } from '$lib/stores/healthLock';
	import { get } from 'svelte/store';
	import { parsePlanJsonText } from '$lib/validation/planV2';
	import type { ValidationIssue } from '$lib/validation/issues';

	let busy = $state(false);
	let error = $state<string | null>(null);
	let pasteOpen = $state(false);
	let pasteText = $state('');
	let fileInput: HTMLInputElement | null = null;
	let copyHint = $state<string | null>(null);
	let copyTimer: ReturnType<typeof setTimeout> | null = null;
	let showPasskeyOffer = $state(false);

	let pendingPlan = $state<PlanV2 | null>(null);
	let pendingIssues = $state<ValidationIssue[]>([]);
	let pendingWarnings = $state<string[]>([]);

	const OPEN_BRACE = '{';
	const CLOSE_BRACE = '}';

	const promptBody = $derived(buildClaudePrompt($onboarding));
	const preview = $derived(pendingPlan ? buildImportPreview(pendingPlan, pendingIssues) : null);
	const pasteCharCount = $derived(pasteText.length);

	const HEALTH_DISCLAIMER =
		'Health is a planning and tracking companion. It does not provide medical diagnosis or emergency advice. Review major diet, supplement, medication, injury, pregnancy, diabetes, eating-disorder, or medical-condition decisions with a qualified professional.';

	function mergeGroceryCheckedIntoProgress(planObj: PlanV2) {
		const items = flattenGrocery(planObj);
		const cur = get(progress);
		const next = { ...(cur.groceryChecked ?? {}) };
		for (const it of items) {
			if (!(it.key in next)) next[it.key] = false;
		}
		persistProgress({ ...cur, groceryChecked: next });
	}

	function clearPending() {
		pendingPlan = null;
		pendingIssues = [];
		pendingWarnings = [];
	}

	function reviewParsed(text: string): boolean {
		error = null;
		const r = parsePlanJsonText(text);
		if (!r.ok) {
			error = r.error;
			clearPending();
			return false;
		}
		pendingPlan = r.plan;
		pendingIssues = r.issues;
		pendingWarnings = r.warnings;
		return true;
	}

	function confirmApply() {
		if (!pendingPlan) return;
		const existing = get(plan);
		if (
			existing &&
			browser &&
			!window.confirm(
				'Replace your current plan on this device? Consider exporting a backup from System → Settings first.'
			)
		) {
			return;
		}
		busy = true;
		try {
			savePlan(pendingPlan, pendingWarnings);
			mergeGroceryCheckedIntoProgress(pendingPlan);
			clearPending();
			const lockOn = get(securityConfig).enabled;
			if (!lockOn && browser) {
				sessionStorage.setItem(SS_OFFER_PASSKEY, '1');
				showPasskeyOffer = true;
			} else {
				goto(resolve('/today'));
			}
		} finally {
			busy = false;
		}
	}

	async function readFile(f: File) {
		if (f.size > MAX_PLAN_BYTES) {
			error = `File exceeds ${MAX_PLAN_BYTES / (1024 * 1024)} MB limit.`;
			return;
		}
		busy = true;
		try {
			const text = await f.text();
			reviewParsed(text);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Could not read file';
		} finally {
			busy = false;
		}
	}

	async function onFile(ev: Event) {
		const t = ev.target as HTMLInputElement;
		const f = t.files?.[0];
		t.value = '';
		if (!f) return;
		await readFile(f);
	}

	async function onDropFiles(files: File[]) {
		const f = files[0];
		if (!f) return;
		await readFile(f);
	}

	function openPicker() {
		fileInput?.click();
	}

	async function copyPrompt() {
		error = null;
		copyHint = null;
		if (copyTimer) {
			clearTimeout(copyTimer);
			copyTimer = null;
		}
		const text = buildClaudePrompt(get(onboarding));
		const how = await copyTextToClipboard(text);
		if (how === 'failed') {
			copyHint =
				'Automatic copy failed — scroll to the prompt box below, tap inside it, then use your browser’s copy command.';
			return;
		}
		copyHint =
			how === 'execCommand'
				? 'Copied (fallback). Paste into Claude.'
				: 'Copied. Paste into Claude.';
		copyTimer = setTimeout(() => {
			copyHint = null;
			copyTimer = null;
		}, 2500);
	}

	function reviewPaste() {
		if (reviewParsed(pasteText)) pasteOpen = false;
	}

	function declinePasskeyOffer() {
		showPasskeyOffer = false;
		if (browser) sessionStorage.removeItem(SS_OFFER_PASSKEY);
		goto(resolve('/today'));
	}
</script>

<input
	bind:this={fileInput}
	class="sr"
	type="file"
	accept=".json,application/json"
	onchange={onFile}
/>

<main class="screen page-stack">
	<StatusStrip />
	<ScreenHeaderBlock title="Import plan" subtitle="Your data stays on this iPhone." />

	<section class="import-hero health-card">
		<p class="import-hero__body">
			Paste or upload your plan file. Validation happens on this device — nothing is uploaded.
		</p>
	</section>

	<SafetyCard body={HEALTH_DISCLAIMER} />

	{#if preview && pendingPlan}
		<ImportPreviewCard
			{preview}
			issues={pendingIssues}
			{busy}
			onApply={confirmApply}
			onCancel={clearPending}
		/>
	{:else}
		<JsonDropZone {busy} onFiles={onDropFiles} onBrowse={openPicker} />

		<section class="prompt-block nothing-surface" aria-labelledby="prompt-h">
			<h2 id="prompt-h" class="mono-caps sec-title">Claude prompt</h2>
			<p class="sec-sub">
				Built from your saved intake answers. Blank fields appear as "not specified" in the profile
				JSON.
			</p>
			<ListRowButton
				label={copyHint?.startsWith('Copied') ? 'Copied ✓' : 'Copy prompt'}
				onclick={copyPrompt}
			/>
			{#if copyHint}
				<p class="copy-hint" role="status">{copyHint}</p>
			{/if}
			<label class="sr-only" for="prompt-ta">Generated Claude prompt</label>
			<textarea id="prompt-ta" class="prompt-ta" readonly rows="12" value={promptBody}></textarea>
			<TextLinkButton text="Edit intake answers" onclick={() => goto(resolve('/'))} />
		</section>

		<ListRowButton label="Paste JSON" chevron onclick={() => (pasteOpen = true)} />
		<DashedUploadButton label="Upload Plan File" onclick={openPicker} />
		<ListRowButton
			label="Load sample plan (demo)"
			chevron
			onclick={async () => {
				busy = true;
				error = null;
				try {
					await loadSamplePlan();
				} catch (e) {
					error = e instanceof Error ? e.message : 'Could not load sample';
				} finally {
					busy = false;
				}
			}}
		/>

		<section class="steps nothing-surface" aria-labelledby="steps-h">
			<h2 id="steps-h" class="mono-caps sec-title">After you copy</h2>
			<ol class="steps-list">
				<li><strong>Step 1</strong> — Open claude.ai (or the Claude app).</li>
				<li><strong>Step 2</strong> — Paste the prompt into a new conversation and send.</li>
				<li>
					<strong>Step 3</strong> — Wait for plain JSON (starts with <kbd>{OPEN_BRACE}</kbd>, ends
					with
					<kbd>{CLOSE_BRACE}</kbd>).
				</li>
				<li>
					<strong>Step 4</strong> — Save as <kbd>myplan.json</kbd> or use
					<strong>Paste JSON</strong>.
				</li>
				<li><strong>Step 5</strong> — Review the preview, then tap <strong>Apply plan</strong>.</li>
			</ol>
		</section>

		<p class="helper">
			Your plan is stored only in this browser. Clipboard copy works best over <strong>HTTPS</strong
			>.
		</p>
	{/if}

	{#if error}
		<InlineErrorCard title="Import blocked" body={error} />
	{/if}
</main>

{#if showPasskeyOffer}
	<PasskeyOfferSheet ondecline={declinePasskeyOffer} />
{/if}

<BottomSheet open={pasteOpen} title="Paste plan JSON" onClose={() => (pasteOpen = false)}>
	<textarea class="ta" rows="12" bind:value={pasteText} aria-label="Plan JSON"></textarea>
	<p class="paste-meta" aria-live="polite">{pasteCharCount.toLocaleString()} characters</p>
	{#if error}
		<p class="paste-err" role="alert">{error}</p>
	{/if}
	{#snippet footer()}
		<HealthButton variant="ghost" block onclick={() => (pasteOpen = false)}>Cancel</HealthButton>
		<HealthButton variant="primary" block onclick={reviewPaste}>Review plan</HealthButton>
	{/snippet}
</BottomSheet>

<style>
	.screen {
		flex: 1;
		padding-bottom: var(--space-8);
	}

	.import-hero__body {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--health-muted);
	}

	.helper {
		margin: var(--space-3) 0 0;
		font-size: 12px;
		line-height: calc(17 / 12);
		color: var(--text-3);
	}

	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
		opacity: 0.02;
	}

	.prompt-block,
	.steps {
		padding: var(--space-4);
		margin-bottom: var(--space-3);
		border-radius: var(--radius-list);
		border: 1px solid var(--line-1);
	}

	.sec-title {
		margin: 0 0 var(--space-2);
		font-size: 10px;
		color: var(--text-3);
		letter-spacing: 0.08em;
	}

	.sec-sub {
		margin: 0 0 var(--space-3);
		font-size: 13px;
		line-height: 1.45;
		color: var(--text-2);
	}

	.copy-hint {
		margin: calc(var(--space-2) * -1) 0 var(--space-3);
		font-size: 13px;
		line-height: 1.4;
		color: var(--text-2);
	}

	.prompt-ta {
		width: 100%;
		min-height: 200px;
		margin: var(--space-2) 0 var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-xs);
		border: 1px solid var(--line-1);
		background: var(--input-bg);
		color: var(--text-2);
		font-family: var(--font-mono);
		font-size: 11px;
		line-height: 1.4;
		resize: vertical;
	}

	.steps-list {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 13px;
		line-height: 1.5;
		color: var(--text-2);
	}

	.steps-list li {
		margin-bottom: var(--space-2);
	}

	.steps-list kbd {
		font-family: var(--font-mono);
		font-size: 0.95em;
		padding: 0 4px;
		border-radius: 4px;
		border: 1px solid var(--line-2);
		background: var(--input-bg);
	}

	.ta {
		width: 100%;
		min-height: 280px;
		padding: var(--space-3);
		border-radius: var(--radius-xs);
		border: 1px solid var(--line-1);
		background: var(--input-bg);
		color: var(--text-2);
		font-family: var(--font-mono);
		font-size: 12px;
		line-height: 1.45;
		resize: vertical;
	}

	.paste-meta {
		margin: var(--s-2) 0 0;
		font-size: var(--t-caption);
		color: var(--h-text-muted);
	}

	.paste-err {
		margin: var(--s-2) 0;
		font-size: var(--t-footnote);
		color: var(--h-red);
	}
</style>
