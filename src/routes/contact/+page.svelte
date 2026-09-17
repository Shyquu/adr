<svelte:head>
	<title>ADR — Contact</title>
</svelte:head>

<a class="back adr-meta" href="/">&larr; BACK</a>

<section class="page">
	<h1>Contact</h1>
	<p>
		ADR — Artisanal Design &amp; Realization<br />
		Object design &amp; construction studio, Berlin.
	</p>
	<p class="lines">
		<a href="mailto:studio@adr.studio">studio@adr.studio</a><br />
		<span>Berlin, Germany</span>
	</p>
</section>

<style>
	.back {
		display: block;
		padding: 6px clamp(14px, 2vw, 30px);
		border-top: 2px solid var(--adr-frame);
		border-bottom: 2px solid var(--adr-frame);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.page {
		padding: clamp(24px, 5vw, 80px) clamp(14px, 2vw, 30px);
		max-width: 640px;
	}
	h1 {
		font-size: clamp(2rem, 6vw, 4rem);
		font-weight: 900;
		margin-bottom: 24px;
	}
	p {
		font-size: 1.05rem;
		line-height: 1.5;
		margin-bottom: 20px;
	}
	.lines a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
