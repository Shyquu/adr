<!--
  CustomCursor — the hammer.

  Plays a sequence of transparent WebP frames (not a video) so the alpha channel
  renders everywhere — Safari doesn't show the transparency of VP9/alpha WebM and
  paints it black, so we swap PNG→WebP frames on a rAF timer instead.

  Desktop (fine pointer): a fixed hammer follows the pointer and swings on every
  pointer-down; the native cursor is hidden.

  Mobile / touch: on each tap the hammer pops in at the tap point, plays its
  swing once, then fades out. The native cursor is left alone.
-->
<script>
	import { onMount } from 'svelte';
	import { shakeElement } from '$lib/actions/impact.js';

	// Displayed size (px) and where in the sprite the head sits (0..1).
	const SIZE = 92;
	const HOTSPOT_X = 0.34;
	const HOTSPOT_Y = 0.26;

	// swing frames (frame 0 == rest; last frame returns to rest)
	const FRAMES = Array.from({ length: 8 }, (_, i) => `/cursor/frames/hammer_${i}.webp`);
	const FRAME_MS = 60; // ~16 fps → ~0.5s swing

	let el = $state(null);
	let frame = $state(0);
	let visible = $state(false);
	let pressed = $state(false);
	let enabled = $state(false);
	let touchMode = $state(false);

	let animRaf = 0;

	function playSwing() {
		cancelAnimationFrame(animRaf);
		const start = performance.now();
		const step = (now) => {
			const idx = Math.floor((now - start) / FRAME_MS);
			if (idx >= FRAMES.length) {
				frame = 0; // back to rest
				if (touchMode) visible = false; // fade out after the swing on touch
				return;
			}
			frame = idx;
			animRaf = requestAnimationFrame(step);
		};
		frame = 0;
		animRaf = requestAnimationFrame(step);
	}

	onMount(() => {
		const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		enabled = true;
		if (fine) document.documentElement.classList.add('adr-custom-cursor');
		else touchMode = true;

		let hideTimer;

		const position = (x, y) => {
			if (el) el.style.transform = `translate(${x - SIZE * HOTSPOT_X}px, ${y - SIZE * HOTSPOT_Y}px)`;
		};

		const move = (e) => {
			visible = true;
			position(e.clientX, e.clientY);
		};

		const down = (e) => {
			pressed = true;
			if (e.clientX != null) position(e.clientX, e.clientY);
			visible = true;
			playSwing();
			if (touchMode) {
				clearTimeout(hideTimer);
				hideTimer = setTimeout(() => (visible = false), 900); // fade-out fallback
			}

			// Screen shake ONLY when the hammer hits something non-interactive.
			if (reduce) return;
			const t = e.target;
			if (!t || !t.closest) return;
			if (t.closest('.wrap')) return; // About diamond
			if (t.closest('.viewer.controls')) return; // 3D inspector drag
			if (t.closest('.card, a[href], button, input, select, textarea, label, [role="button"]'))
				return; // interactive → no screen shake
			const shell = document.querySelector('.shell');
			if (shell) setTimeout(() => shakeElement(shell, 'adr-shake', 400), 170);
		};
		const up = () => (pressed = false);
		const enter = () => (visible = true);
		const leave = () => (visible = false);

		// capture phase: fires before any target that calls stopPropagation
		// (e.g. the About [X]), so the hammer still swings on those clicks.
		window.addEventListener('pointerdown', down, { passive: true, capture: true });
		window.addEventListener('pointerup', up, { passive: true });
		if (fine) {
			window.addEventListener('pointermove', move, { passive: true });
			document.addEventListener('pointerenter', enter);
			document.addEventListener('mouseleave', leave);
		}

		return () => {
			document.documentElement.classList.remove('adr-custom-cursor');
			window.removeEventListener('pointerdown', down, { capture: true });
			window.removeEventListener('pointerup', up);
			window.removeEventListener('pointermove', move);
			document.removeEventListener('pointerenter', enter);
			document.removeEventListener('mouseleave', leave);
			clearTimeout(hideTimer);
			cancelAnimationFrame(animRaf);
		};
	});
</script>

{#if enabled}
	<div
		class="cursor"
		class:visible
		class:pressed
		class:touch={touchMode}
		bind:this={el}
		style="--size:{SIZE}px"
		aria-hidden="true"
	>
		{#each FRAMES as src, i}
			<img class="frame" class:on={i === frame} {src} alt="" draggable="false" loading="eager" />
		{/each}
	</div>
{/if}

<style>
	.cursor {
		position: fixed;
		top: 0;
		left: 0;
		width: var(--size);
		height: var(--size);
		z-index: 10000;
		pointer-events: none;
		opacity: 0;
		will-change: transform;
		transition: opacity 0.12s ease;
	}
	.cursor.visible {
		opacity: 1;
	}
	.cursor.touch {
		transition: opacity 0.18s ease;
	}
	.frame {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: none;
	}
	.frame.on {
		display: block;
	}
</style>
