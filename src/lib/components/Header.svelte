<!--
  Header — ADR mark (links home) + the oversized About / Contact nav.
  "About" opens the orange modal; "Contact" routes to the contact page.
-->
<script>
	import Logo from './Logo.svelte';

	let { onabout = () => {} } = $props();
</script>

<header class="header">
	<a class="brand" href="/" aria-label="ADR home">
		<Logo size={72} />
	</a>

	<nav class="nav" aria-label="Primary">
		<button class="link about" onclick={onabout}>About</button>
		<span class="arrow" aria-hidden="true">&#10132;</span>
		<a class="link contact adr-underline" href="/contact">Contact</a>
		<span class="arrow" aria-hidden="true">&#11013;</span>
	</nav>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		padding: 14px clamp(14px, 2vw, 30px);
		min-height: var(--adr-header-h);
	}
	.brand {
		flex: 0 0 auto;
		display: inline-flex;
	}
	.nav {
		display: flex;
		align-items: center;
		gap: clamp(8px, 1.4vw, 22px);
		font-weight: 900;
		font-size: var(--adr-fs-nav);
		line-height: 1;
	}
	.link {
		font-weight: 900;
		letter-spacing: -0.01em;
	}
	.about {
		color: var(--adr-ink);
		text-decoration: underline;
		text-underline-offset: 4px;
		text-decoration-thickness: 3px;
	}
	.contact {
		color: var(--adr-ink);
		text-decoration: underline;
		text-underline-offset: 4px;
		text-decoration-thickness: 3px;
	}
	.link:hover {
		color: var(--adr-orange);
	}
	.arrow {
		font-size: 0.82em;
	}
	@media (max-width: 640px) {
		.nav {
			gap: 8px;
		}
		.arrow {
			display: none;
		}
	}
</style>
