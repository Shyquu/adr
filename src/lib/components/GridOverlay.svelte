<!--
  GridOverlay — a purely decorative graph-paper grid laid over the whole page.

  Fixed, full-viewport, pointer-events:none — it never intercepts clicks, hovers
  or drags; it's just a texture on top of everything (but below the About pop-up
  and the custom cursor).
-->
<div class="grid-overlay" aria-hidden="true"></div>

<style>
	.grid-overlay {
		position: fixed;
		inset: 0;
		z-index: 40;
		pointer-events: none;
		background-image:
			linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
			linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
		background-size: var(--adr-grid-size, 40px) var(--adr-grid-size, 40px);
	}
</style>
