<script>
	import { page } from '$app/stores';
</script>

<section class="err">
	<h1>{$page.status}</h1>
	<p>{$page.error?.message ?? 'Something broke.'}</p>
	<a class="home adr-underline" href="/">&larr; Back to the catalogue</a>
</section>

<style>
	.err {
		display: grid;
		place-content: center;
		gap: 12px;
		text-align: center;
		min-height: 60vh;
		padding: 40px;
	}
	h1 {
		font-size: clamp(4rem, 16vw, 10rem);
		font-weight: 900;
		line-height: 1;
	}
	p {
		font-size: 1.1rem;
		font-weight: 700;
	}
	.home {
		font-weight: 800;
	}
</style>
