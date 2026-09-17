<!--
  AboutModal — the orange diamond (inlined from src/lib/popup.svg).

  Opens centred (auto on first visit, or via the About nav). It does NOT dim the
  page and casts no shadow.

  Grab it anywhere except the [X] and it turns into a rigid body: grabbing a
  corner makes it swing and hang from that point under gravity; a throw carries
  linear + angular momentum and it tumbles, bouncing off the screen edges. The
  [X] stays clickable at any time and closes it. Escape also closes.
-->
<script>
	import { onMount } from 'svelte';
	import popupSvg from '$lib/popup.svg?raw';

	let { open = false, onclose = () => {} } = $props();

	let el = $state(null);
	let S = $state(460); // square side (px)

	// rigid-body state (written straight to the DOM each frame)
	let cx = 0,
		cy = 0,
		vx = 0,
		vy = 0,
		theta = 0,
		omega = 0,
		raf = 0,
		physics = false;
	let dragging = $state(false);

	// drag bookkeeping
	let aLocalX = 0,
		aLocalY = 0; // grab anchor in body-local coords
	let curX = 0,
		curY = 0,
		prevCurX = 0,
		prevCurY = 0,
		anchorVX = 0,
		anchorVY = 0;

	// tuning — smooth, weighty, not bouncy
	const G_LIN = 0.6; // linear gravity (px/frame^2)
	const AIR = 0.99; // air drag
	const REST = 0.38; // wall restitution (low = little bounce)
	const FLOOR_FR = 0.72;
	const VMAX = 72;
	const OMEGA_DAMP = 0.97; // free-flight angular damping
	const GRAVDIR = 1.0; // pendulum weight
	const INERTIA = 0.8; // how much whipping the cursor swings it
	const SPRING = 0.026; // pull toward the hanging orientation
	const SDAMP = 0.9; // angular damping while dragged

	const r = () => S / 2; // collision radius (diamond tips sit at S/2)
	const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

	function place() {
		if (el)
			el.style.transform = `translate3d(${Math.round(cx - S / 2)}px, ${Math.round(cy - S / 2)}px, 0) rotate(${theta}rad)`;
	}

	function computeSize() {
		const vmin = Math.min(window.innerWidth, window.innerHeight);
		S = Math.round(Math.max(320, Math.min(vmin * 0.52, 500)));
	}

	function center() {
		cancelAnimationFrame(raf);
		physics = false;
		dragging = false;
		computeSize();
		cx = window.innerWidth / 2;
		cy = window.innerHeight / 2;
		vx = vy = omega = theta = 0;
		place();
	}

	$effect(() => {
		if (open && el) center();
	});

	function grab(e) {
		if (e.button !== undefined && e.button !== 0) return;
		cancelAnimationFrame(raf);
		physics = false;
		dragging = true;
		// record the grabbed point in body-local coordinates
		const dx = e.clientX - cx;
		const dy = e.clientY - cy;
		const c = Math.cos(-theta);
		const s = Math.sin(-theta);
		aLocalX = dx * c - dy * s;
		aLocalY = dx * s + dy * c;
		curX = prevCurX = e.clientX;
		curY = prevCurY = e.clientY;
		anchorVX = anchorVY = 0;
		omega = 0;
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', release);
		raf = requestAnimationFrame(loop);
	}

	function move(e) {
		if (!dragging) return;
		curX = clamp(e.clientX, 0, window.innerWidth);
		curY = clamp(e.clientY, 0, window.innerHeight);
	}

	function release() {
		dragging = false;
		window.removeEventListener('pointermove', move);
		window.removeEventListener('pointerup', release);
		vx = clamp(anchorVX, -VMAX, VMAX);
		vy = clamp(anchorVY, -VMAX, VMAX);
		physics = true; // loop keeps running, now in free-fall mode
	}

	function loop() {
		const W = window.innerWidth;
		const H = window.innerHeight;
		const rad = r();

		if (dragging) {
			// anchor (cursor) velocity + acceleration -> inertial swing
			const avx = curX - prevCurX;
			const avy = curY - prevCurY;
			prevCurX = curX;
			prevCurY = curY;
			const aax = avx - anchorVX;
			const aay = avy - anchorVY;
			anchorVX = avx;
			anchorVY = avy;

			// orientation that hangs the body below the effective gravity
			const gAng = Math.atan2(GRAVDIR - aay * INERTIA, -aax * INERTIA);
			const aAng = Math.atan2(aLocalY, aLocalX);
			let d = gAng - aAng - Math.PI - theta;
			d = Math.atan2(Math.sin(d), Math.cos(d)); // shortest path
			omega += d * SPRING;
			omega *= SDAMP;
			theta += omega;

			// keep the grabbed anchor pinned to the cursor
			const c = Math.cos(theta);
			const s = Math.sin(theta);
			cx = curX - (aLocalX * c - aLocalY * s);
			cy = curY - (aLocalX * s + aLocalY * c);
			cx = clamp(cx, -rad, W + rad);
			cy = clamp(cy, -rad, H + rad);
			vx = anchorVX;
			vy = anchorVY;
			place();
			raf = requestAnimationFrame(loop);
			return;
		}

		if (physics) {
			vy += G_LIN;
			vx *= AIR;
			cx += vx;
			cy += vy;
			theta += omega;
			omega *= OMEGA_DAMP;

			let hit = false;
			if (cx < rad) {
				cx = rad;
				vx = -vx * REST;
				omega += vy * 0.001;
				hit = true;
			} else if (cx > W - rad) {
				cx = W - rad;
				vx = -vx * REST;
				omega -= vy * 0.001;
				hit = true;
			}
			if (cy < rad) {
				cy = rad;
				vy = -vy * REST;
				hit = true;
			} else if (cy > H - rad) {
				cy = H - rad;
				vy = -vy * REST;
				vx *= FLOOR_FR;
				omega += vx * 0.0016;
				hit = true;
			}
			if (hit) omega = clamp(omega, -0.28, 0.28);
			place();

			// settle gently once it's resting on the floor with little energy
			const onFloor = cy >= H - rad - 0.5;
			if (onFloor && Math.abs(vy) < 1.6) {
				vy = 0;
				vx *= 0.86;
				omega *= 0.8;
				if (Math.abs(vx) < 0.25 && Math.abs(omega) < 0.01) {
					vx = 0;
					omega = 0;
					physics = false;
					return;
				}
			}
			raf = requestAnimationFrame(loop);
		}
	}

	function onkey(e) {
		if (e.key === 'Escape') onclose();
	}
	function closeX(e) {
		e.stopPropagation();
		onclose();
	}

	onMount(() => {
		const onResize = () => {
			if (physics || dragging) {
				cx = clamp(cx, r(), window.innerWidth - r());
				cy = clamp(cy, r(), window.innerHeight - r());
				place();
			} else if (open) {
				center();
			}
		};
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', release);
			cancelAnimationFrame(raf);
		};
	});
</script>

<svelte:window onkeydown={onkey} />

{#if open}
	<div
		class="wrap"
		class:dragging
		bind:this={el}
		style="width:{S}px;height:{S}px"
		role="dialog"
		aria-modal="false"
		aria-label="About ADR"
		onpointerdown={grab}
	>
		<!-- inline vector so it stays crisp at any size / rotation -->
		<div
			class="popup"
			role="img"
			aria-label="About ADR — an object design & construction studio based in Berlin."
		>
			{@html popupSvg}
		</div>
		<!-- invisible hotspot sitting exactly over the [X] drawn in popup.svg -->
		<button
			class="x"
			onpointerdown={(e) => e.stopPropagation()}
			onclick={closeX}
			aria-label="Close about"
		></button>
	</div>
{/if}

<style>
	.wrap {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 901;
		pointer-events: none; /* transparent corners pass clicks through */
		will-change: transform;
		animation: fadein 0.24s var(--adr-ease);
		touch-action: none;
	}
	.wrap.dragging {
		user-select: none;
	}
	.popup {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: auto;
		/* only the diamond area is interactive; corners pass clicks through */
		clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
		user-select: none;
	}
	.popup :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
	}
	.x {
		position: absolute;
		top: 12.4%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 15%;
		height: 9%;
		z-index: 2;
		pointer-events: auto;
		background: transparent;
		border: 0;
		font-size: 0;
	}
	@keyframes fadein {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
