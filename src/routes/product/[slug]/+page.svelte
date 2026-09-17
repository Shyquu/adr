<script>
	import { fly, fade } from 'svelte/transition';
	import ThreeViewer from '$lib/components/ThreeViewer.svelte';

	let { data } = $props();
	let product = $derived(data.product);

	// gallery paging
	let g = $state(0);
	$effect(() => {
		product;
		g = 0;
	});
	function nextShot() {
		if (product.gallery.length) g = (g + 1) % product.gallery.length;
	}
	function prevShot() {
		if (product.gallery.length)
			g = (g - 1 + product.gallery.length) % product.gallery.length;
	}

	// pair each description paragraph with a spec group on the same grid row,
	// so dimensions line up beside the copy exactly as in the reference.
	let rows = $derived(Math.max(product.body.length, product.specs.length));

	// 3D-first inspector with 2D fallback (mirrors the grid behaviour)
	let ready = $state(false);
	let failed = $state(false);
	$effect(() => {
		product;
		ready = false;
		failed = false;
	});
	let use3d = $derived(!!product.model && !failed);
</script>

<svelte:head>
	<title>ADR — {product.title}</title>
</svelte:head>

<a class="back adr-meta" href="/">&larr; BACK</a>

<div class="detail">
	<!-- The object: full-height stage, left column. -->
	<div class="stage" in:fade={{ duration: 220 }}>
		<img class="still" class:hidden={ready} src={product.image} alt={product.title} draggable="false" />
		{#if use3d}
			<div class="canvas-layer" class:visible={ready}>
				<ThreeViewer
					model={product.model}
					view={product.view}
					controls={true}
					autoRotate={true}
					autoRotateSpeed={0.5}
					fitOffset={2.1}
					lazy={false}
					onready={() => (ready = true)}
					onfail={() => (failed = true)}
				/>
			</div>
			{#if ready}<span class="hint adr-meta">drag to rotate</span>{/if}
		{/if}
	</div>

	<!-- Gallery (top) + object copy (pinned to the bottom) fly in. -->
	<div class="col">
		{#if product.gallery.length}
			<div class="gallery" in:fly={{ y: -20, duration: 340, delay: 60 }}>
				{#each product.gallery as shot, i}
					<div class="frame" class:hidden={i !== g && product.gallery.length > 2}>
						<img src={shot} alt="{product.title} in use" draggable="false" />
					</div>
				{/each}
			</div>
			{#if product.gallery.length > 1}
				<div class="pager">
					<button onclick={prevShot} aria-label="Previous image">&larr;</button>
					<button onclick={nextShot} aria-label="Next image">&rarr;</button>
				</div>
			{/if}
		{/if}

		<div class="info" in:fly={{ y: 26, duration: 400, delay: 120 }}>
			<h1 class="title">
				<span class="dia">&#9670;</span> {product.code} - {product.title}
				<span class="client">[{product.client}]</span>
			</h1>
			<span class="specs-h">Specs</span>

			{#each { length: rows } as _, i}
				<p class="para">{product.body[i] ?? ''}</p>
				<div class="specgroup">
					{#each product.specs[i] ?? [] as line}
						<span>{line}</span>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.back {
		display: block;
		padding: 6px clamp(14px, 2vw, 30px);
		border-top: 2px solid var(--adr-frame);
		border-bottom: 2px solid var(--adr-frame);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.detail {
		display: grid;
		grid-template-columns: 43% 1fr;
		gap: clamp(16px, 2.4vw, 40px);
		padding: clamp(16px, 2vw, 30px) clamp(14px, 2vw, 30px) clamp(20px, 3vw, 40px);
		align-items: stretch;
		min-height: calc(100svh - var(--adr-header-h) - 96px);
	}

	/* -------- left: the object stage -------- */
	.stage {
		position: relative;
		background: var(--adr-viewer-bg);
		border: 1px solid rgba(0, 0, 0, 0.18);
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
		background-size: 22px 22px, 22px 22px;
		display: grid;
		place-items: center;
		overflow: hidden;
		min-height: 60vh;
	}
	.canvas-layer {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 0.5s ease;
	}
	.canvas-layer.visible {
		opacity: 1;
	}
	.still {
		max-width: 72%;
		max-height: 82%;
		object-fit: contain;
		transition: opacity 0.4s ease;
		/* no shadow */
	}
	.still.hidden {
		opacity: 0;
	}
	.hint {
		position: absolute;
		bottom: 12px;
		right: 14px;
		opacity: 0.55;
		pointer-events: none;
	}

	/* -------- right column -------- */
	.col {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.gallery {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}
	.gallery .frame {
		aspect-ratio: 4 / 3;
		overflow: hidden;
	}
	.gallery .frame.hidden {
		display: none;
	}
	.gallery img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.pager {
		display: flex;
		justify-content: flex-end;
		gap: 16px;
		margin-top: 12px;
		font-size: 1.35rem;
		font-weight: 800;
	}
	.pager button:hover {
		color: var(--adr-orange);
	}

	/* copy + specs, pinned to the bottom of the column.
	   One grid: title | Specs on row 1, then each paragraph is paired with a
	   spec group on the same row so the dimensions line up beside the copy. */
	.info {
		margin-top: auto;
		padding-top: 40px;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		column-gap: clamp(24px, 5vw, 100px);
		row-gap: clamp(14px, 1.8vw, 24px);
		align-items: start;
	}
	.title {
		grid-column: 1;
		align-self: end;
		font-size: clamp(1.3rem, 2.2vw, 2rem);
		font-weight: 900;
		line-height: 1.05;
		margin-bottom: 10px;
	}
	.dia {
		font-size: 0.72em;
	}
	.client {
		margin-left: clamp(14px, 3vw, 56px);
		font-weight: 900;
	}
	.specs-h {
		grid-column: 2;
		align-self: end;
		color: var(--adr-muted);
		font-size: clamp(0.9rem, 1.3vw, 1.1rem);
		font-weight: 700;
		margin-bottom: 10px;
	}
	.para {
		grid-column: 1;
		font-size: clamp(0.85rem, 1vw, 0.98rem);
		line-height: 1.35;
		max-width: 46ch;
		color: var(--adr-ink);
	}
	.specgroup {
		grid-column: 2;
		display: flex;
		flex-direction: column;
		gap: 3px;
		font-size: clamp(0.85rem, 1vw, 0.98rem);
		font-weight: 400;
		color: var(--adr-ink);
		white-space: nowrap;
	}

	@media (max-width: 860px) {
		.detail {
			grid-template-columns: 1fr;
			min-height: 0;
		}
		.stage {
			min-height: 52vh;
		}
		.info {
			margin-top: 24px;
		}
	}
</style>
