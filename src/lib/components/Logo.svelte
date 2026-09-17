<!--
  Logo — the official ADR mark (static/adrlogo.svg): a red/white striped
  diamond with the ADR wordmark. Rendered as an <img> so it stays pixel-crisp.
-->
<script>
	let { size = 72 } = $props();
</script>

<img class="logo" src="/adrlogo.svg" width={size} height={size} alt="ADR — Artisanal Design & Realization" />

<style>
	.logo {
		display: block;
		height: auto;
	}
</style>
