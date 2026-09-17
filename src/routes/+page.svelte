<script>
	import { products, categories } from '$lib/data/products.js';
	import { filter } from '$lib/stores/ui.js';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import WarningSticker from '$lib/components/WarningSticker.svelte';

	let shown = $derived(
		$filter === 'All' ? products : products.filter((p) => p.category === $filter)
	);

	function toggleFilter(cat) {
		filter.update((f) => (f === cat ? 'All' : cat));
	}
</script>

<svelte:head>
	<title>ADR — Artisanal Design &amp; Realization</title>
</svelte:head>

<!-- decorative studio sticker, hung over the top edge -->
<div class="sticker-slot">
	<WarningSticker />
</div>

<!-- meta bar -->
<div class="metabar">
	<span class="adr-meta">Things we&rsquo;ve designed and/or built:</span>
	<span class="filters adr-meta">
		Filters:
		{#each categories as cat}
			<button
				class="filter"
				class:active={$filter === cat}
				onclick={() => toggleFilter(cat)}>[{cat}]</button
			>
		{/each}
	</span>
</div>

<!-- catalogue grid -->
<section class="catalogue" aria-label="Catalogue">
	{#each shown as product (product.slug)}
		<div class="cell">
			<ProductCard {product} />
		</div>
	{/each}
</section>

<!-- bottom chrome -->
<footer class="footbar">
	<span class="imprint adr-meta">
		<a href="/imprint">Imprint</a>
		<a href="/agb">AGB</a>
		<a href="/contact">Contact</a>
	</span>
</footer>

<style>
	.sticker-slot {
		position: absolute;
		top: calc(var(--adr-header-h) * -1 + 6px);
		left: clamp(240px, 28vw, 560px);
		z-index: 5;
		pointer-events: none;
	}

	.metabar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 6px clamp(14px, 2vw, 30px);
		border-top: 2px solid var(--adr-frame);
		border-bottom: 2px solid var(--adr-frame);
	}
	.filters {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.filter {
		font: inherit;
		font-weight: 700;
		color: var(--adr-muted);
	}
	.filter.active {
		color: var(--adr-orange);
	}
	.filter:hover {
		color: var(--adr-ink);
	}

	.catalogue {
		--cols: 5;
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		border-left: var(--adr-cell-line-w) solid var(--adr-cell-line);
		flex: 1 1 auto;
	}
	.cell {
		border-right: var(--adr-cell-line-w) solid var(--adr-cell-line);
		border-bottom: var(--adr-cell-line-w) solid var(--adr-cell-line);
		min-height: clamp(240px, 30vh, 360px);
		display: flex;
	}
	.cell :global(.card) {
		width: 100%;
	}

	@media (max-width: 1200px) {
		.catalogue {
			--cols: 4;
		}
	}
	@media (max-width: 900px) {
		.catalogue {
			--cols: 3;
		}
	}
	@media (max-width: 640px) {
		.catalogue {
			--cols: 2;
		}
	}
	@media (max-width: 420px) {
		.catalogue {
			--cols: 1;
		}
	}

	.footbar {
		display: flex;
		justify-content: flex-end;
		padding: 8px clamp(14px, 2vw, 30px) 16px;
	}
	.imprint {
		display: inline-flex;
		gap: 12px;
	}
	.imprint a {
		text-decoration: underline;
		text-underline-offset: 2px;
	}
</style>
