<!--
  ProductCard — one cell in the catalogue grid.

  3D-first: if the object has a GLB, a live auto-spinning Three.js model is
  mounted over the still render. The still stays visible as the placeholder
  until the model is ready, and permanently if 3D can't load (no WebGL, error,
  or timeout). Objects without a GLB just show the still.
-->
<script>
	import { goto } from '$app/navigation';
	import ThreeViewer from './ThreeViewer.svelte';
	import { impactCascade, prefersReducedMotion } from '$lib/actions/impact.js';

	let { product } = $props();

	let ready = $state(false);
	let failed = $state(false);
	let cardEl = $state(null);

	let use3d = $derived(!!product.model && !failed);

	const href = `/product/${product.slug}`;

	// Clicking an object: hammer it (shake + cascade to neighbours), then open.
	function onClick(e) {
		// let modifier / middle clicks open in a new tab as usual
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
		e.preventDefault();
		if (prefersReducedMotion()) {
			goto(href);
			return;
		}
		setTimeout(() => impactCascade(cardEl), 120);
		setTimeout(() => goto(href), 300);
	}
</script>

<a
	class="card"
	bind:this={cardEl}
	{href}
	data-slug={product.slug}
	onclick={onClick}
	aria-label="{product.code} — {product.title} for {product.client}"
>
	<div class="stage">
		<img
			class="shot"
			class:hidden={ready}
			src={product.image}
			alt={product.title}
			loading="lazy"
			draggable="false"
		/>
		{#if use3d}
			<div class="canvas-layer" class:visible={ready}>
				<ThreeViewer
					model={product.model}
					view={product.view}
					autoRotate={true}
					fitOffset={2.1}
					onready={() => (ready = true)}
					onfail={() => (failed = true)}
				/>
			</div>
		{/if}
	</div>

	<div class="label">
		<span class="title"><span class="dia">&#9670;</span> {product.code} - {product.title}</span>
		<span class="client">[{product.client}]</span>
	</div>
</a>

<style>
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 18px 20px 16px;
		transition: background 0.2s ease;
	}
	.card:hover {
		background: rgba(255, 255, 255, 0.05);
	}
	.stage {
		position: relative;
		flex: 1 1 auto;
		min-height: 190px;
		display: grid;
		place-items: center;
	}
	.shot {
		max-height: 78%;
		max-width: 78%;
		width: auto;
		height: auto;
		object-fit: contain;
		transition: transform 0.3s var(--adr-ease), opacity 0.35s ease;
	}
	.shot.hidden {
		opacity: 0;
	}
	.card:hover .shot {
		transform: translateY(-4px) scale(1.03);
	}
	.canvas-layer {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 0.45s ease;
	}
	.canvas-layer.visible {
		opacity: 1;
	}
	.label {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: var(--adr-fs-card);
		line-height: 1.18;
	}
	.title {
		font-weight: 800;
		color: var(--adr-ink);
	}
	.dia {
		font-size: 0.7em;
		vertical-align: middle;
	}
	.client {
		font-weight: 700;
		color: var(--adr-muted);
	}
</style>
