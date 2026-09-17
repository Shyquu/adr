<!--
  WarningSticker — the yellow high-voltage tag from the reference, hung
  upside-down over the top edge. Purely decorative studio flavour.
-->
<script>
	let { rotate = 180 } = $props();
</script>

<div class="sticker" style="--rot:{rotate}deg" aria-hidden="true">
	<div class="tag">
		<div class="row top">
			<span>ACHTUNG</span>
			<svg class="bolt" viewBox="0 0 24 24" width="20" height="20">
				<circle cx="12" cy="12" r="11" fill="none" stroke="#111" stroke-width="1.5" />
				<path d="M13 3 L6 13 h4 l-1 8 L18 10 h-4 z" fill="#111" />
			</svg>
			<span>ATTENTION</span>
		</div>
		<div class="row sub">
			<span>Hochspannung</span>
			<span>High voltage</span>
			<span>Haute tension</span>
		</div>
		<div class="row code"><span>2 122014</span></div>
	</div>
</div>

<style>
	.sticker {
		transform: rotate(var(--rot));
		transform-origin: center;
		filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.25));
	}
	.tag {
		background: var(--adr-yellow);
		border: 3px solid #111;
		/* trapezoid — wider at the (visually) hanging edge */
		clip-path: polygon(12% 0, 88% 0, 100% 100%, 0 100%);
		padding: 8px 26px 12px;
		min-width: 210px;
		text-align: center;
		font-weight: 800;
		color: #111;
		line-height: 1;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}
	.top {
		font-size: 0.92rem;
		letter-spacing: 0.02em;
	}
	.bolt {
		flex: 0 0 auto;
	}
	.sub {
		margin-top: 5px;
		font-size: 0.5rem;
		font-weight: 700;
		gap: 12px;
	}
	.code {
		margin-top: 4px;
		font-size: 0.42rem;
		font-weight: 700;
		opacity: 0.85;
	}
</style>
