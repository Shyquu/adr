<!--
  CustomCursor — the hammer.

  A fixed video element follows the pointer. Idle it rests on frame 1 (poster);
  on every pointer-down it plays the WebM once: the hammer swings down (~frame 4)
  and back to rest (frame 8 == frame 1). The "hotspot" (the real click point) is
  aligned to the hammer's striking head via HOTSPOT_X/Y.

  Disabled on coarse/touch pointers, which keep the native behaviour.
-->
<script>
	import { onMount } from 'svelte';
	import { shakeElement } from '$lib/actions/impact.js';

	// Displayed cursor size (px) and where in the sprite the head sits (0..1).
	const SIZE = 92;
	const HOTSPOT_X = 0.34;
	const HOTSPOT_Y = 0.26;

	let el = $state(null);
	let video = $state(null);
	let visible = $state(false);
	let pressed = $state(false);
	let enabled = $state(false);

	onMount(() => {
		const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
		if (!fine.matches) return;

		enabled = true;
		document.documentElement.classList.add('adr-custom-cursor');

		const move = (e) => {
			visible = true;
			const x = e.clientX - SIZE * HOTSPOT_X;
			const y = e.clientY - SIZE * HOTSPOT_Y;
			if (el) el.style.transform = `translate(${x}px, ${y}px)`;
		};

		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const down = (e) => {
			pressed = true;
			if (video) {
				try {
					video.currentTime = 0;
					video.play();
				} catch {
					/* autoplay guard — safe to ignore */
				}
			}
			// Screen shake ONLY when the hammer hits something non-interactive.
			// Skip: the draggable About diamond, the 3D inspector (drag-to-rotate),
			// product cards (they run their own object shake + cascade) and any
			// other interactive control.
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

		window.addEventListener('pointermove', move, { passive: true });
		// capture phase: fires before any target that calls stopPropagation
		// (e.g. the About [X]), so the hammer still swings on those clicks.
		window.addEventListener('pointerdown', down, { passive: true, capture: true });
		window.addEventListener('pointerup', up, { passive: true });
		document.addEventListener('pointerenter', enter);
		document.addEventListener('mouseleave', leave);

		return () => {
			document.documentElement.classList.remove('adr-custom-cursor');
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerdown', down, { capture: true });
			window.removeEventListener('pointerup', up);
			document.removeEventListener('pointerenter', enter);
			document.removeEventListener('mouseleave', leave);
		};
	});

	function onEnded() {
		if (video) {
			video.pause();
			video.currentTime = 0;
		}
	}
</script>

{#if enabled}
	<div
		class="cursor"
		class:visible
		class:pressed
		bind:this={el}
		style="--size:{SIZE}px"
		aria-hidden="true"
	>
		<video
			bind:this={video}
			src="/cursor/hammer.webm"
			poster="/cursor/hammer_idle.png"
			muted
			playsinline
			preload="auto"
			onended={onEnded}
		></video>
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
	.cursor video {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>
