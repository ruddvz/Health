<script lang="ts">
	import TextLinkButton from '$lib/components/spec/TextLinkButton.svelte';

	interface Props {
		onUseDefaults: () => void;
	}
	let { onUseDefaults }: Props = $props();
</script>

<div class="defaults-block">
	<p class="defaults-copy">
		Example values fill only empty or invalid fields on this step. The rest of your answers stay as
		they are.
	</p>
	<TextLinkButton text="Use example values for this step" onclick={onUseDefaults} />
</div>
