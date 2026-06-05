<script lang="ts">
	export type IconName =
		| 'health'
		| 'sun'
		| 'fork'
		| 'bolt'
		| 'chart'
		| 'shield'
		| 'lock'
		| 'key'
		| 'import'
		| 'export'
		| 'trash'
		| 'warning'
		| 'check'
		| 'water'
		| 'timer'
		| 'cart'
		| 'pill'
		| 'device'
		| 'chevron'
		| 'settings';

	interface Props {
		name: IconName;
		size?: number;
	}

	let { name, size = 20 }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	aria-hidden="true"
	class="health-icon"
>
	{#if name === 'health'}
		<rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" stroke-width="1.8" />
		<path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
	{:else if name === 'sun'}
		<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8" />
		<path
			d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linecap="round"
		/>
	{:else if name === 'fork'}
		<path
			d="M8 4v8a2 2 0 0 0 4 0V4M10 12v8M6 4v6M12 4v6"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	{:else if name === 'bolt'}
		<path
			d="M13 2 4 14h7l-1 8 10-14h-7l0-6Z"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linejoin="round"
		/>
	{:else if name === 'chart'}
		<path
			d="M4 18V8M10 18V5M16 18v-6M22 18V4"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linecap="round"
		/>
	{:else if name === 'shield'}
		<path
			d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linejoin="round"
		/>
	{:else if name === 'lock'}
		<rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.8" />
		<path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.8" />
	{:else if name === 'key'}
		<circle cx="8" cy="15" r="3" stroke="currentColor" stroke-width="1.8" />
		<path d="M10.5 13 20 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
	{:else if name === 'import'}
		<path
			d="M12 4v10M8 10l4 4 4-4M5 20h14"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	{:else if name === 'export'}
		<path
			d="M12 14V4M8 8l4-4 4 4M5 20h14"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	{:else if name === 'trash'}
		<path
			d="M4 7h16M9 7V5h6v2M10 11v6M14 11v6M7 7l1 12h8l1-12"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	{:else if name === 'warning'}
		<path
			d="M12 4 3 20h18L12 4Z"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linejoin="round"
		/>
		<path d="M12 10v4M12 17h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
	{:else if name === 'check'}
		<path
			d="M5 12l4 4 10-10"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	{:else if name === 'water'}
		<path
			d="M12 3c3 5 6 8 6 12a6 6 0 1 1-12 0c0-4 3-7 6-12Z"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linejoin="round"
		/>
	{:else if name === 'timer'}
		<circle cx="12" cy="13" r="8" stroke="currentColor" stroke-width="1.8" />
		<path d="M12 9v5l3 2M10 3h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
	{:else if name === 'cart'}
		<path
			d="M6 6h15l-2 9H8L6 6ZM9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linejoin="round"
		/>
	{:else if name === 'pill'}
		<rect x="4" y="9" width="16" height="6" rx="3" stroke="currentColor" stroke-width="1.8" />
		<path d="M12 9v6" stroke="currentColor" stroke-width="1.8" />
	{:else if name === 'device'}
		<rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" stroke-width="1.8" />
		<path d="M10 18h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
	{:else if name === 'chevron'}
		<path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
	{:else if name === 'settings'}
		<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" />
		<path
			d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.54V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.54 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.54-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.54-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.54V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.54 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c0 .66.39 1.26 1 1.54H21a2 2 0 1 1 0 4h-.09c-.61.28-1 .88-1 1.54Z"
			stroke="currentColor"
			stroke-width="1.2"
		/>
	{/if}
</svg>

<style>
	.health-icon {
		display: block;
		flex-shrink: 0;
	}
</style>
