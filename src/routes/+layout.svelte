<script>
	import '$lib/styles/app.css';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import CustomCursor from '$lib/components/CustomCursor.svelte';
	import GridOverlay from '$lib/components/GridOverlay.svelte';
	import Header from '$lib/components/Header.svelte';
	import AboutModal from '$lib/components/AboutModal.svelte';

	let { children } = $props();
	let aboutOpen = $state(false);

	// Show the About pop-up automatically on first visit of the session.
	onMount(() => {
		try {
			if (!sessionStorage.getItem('adr:aboutSeen')) {
				aboutOpen = true;
				sessionStorage.setItem('adr:aboutSeen', '1');
			}
		} catch {
			aboutOpen = true;
		}
	});

	// Native View Transitions: the surrounding chrome cross-fades between the
	// grid and a detail page so the object appears to stay put while everything
	// around it animates. No-ops gracefully where the API isn't supported.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<CustomCursor />
<GridOverlay />

<div class="shell">
	<Header onabout={() => (aboutOpen = true)} />
	<main>
		{@render children()}
	</main>
</div>

<AboutModal open={aboutOpen} onclose={() => (aboutOpen = false)} />

<style>
	.shell {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	main {
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
	}
</style>
