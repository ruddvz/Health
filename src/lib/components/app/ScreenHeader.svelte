<script lang="ts">
	/** Plan alias — same as ScreenHeaderBlock for iOS shell consistency. */
	import ScreenHeaderBlock from '$lib/components/spec/ScreenHeaderBlock.svelte';

	interface Props {
		title: string;
		subtitle?: string;
		eyebrow?: string;
	}

	let { title, subtitle, eyebrow }: Props = $props();
</script>

<ScreenHeaderBlock {title} {subtitle} {eyebrow} />
