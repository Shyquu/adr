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
	import { onMount, tick } from 'svelte';
	import popupSvg from '$lib/popup.svg?raw';
	import { shakeElement } from '$lib/actions/impact.js';

	let { open = false, onclose = () => {} } = $props();

	let el = $state(null);
	let S = $state(460); // square side (px)

	// shatter-on-close state
	let shattering = $state(false);
	let shards = $state([]);
	let shatterStart = 0;
	const SHARD_G = 0.6; // shard gravity
	const SHARD_AIR = 0.995;
	const HOLD_MS = 120; // brief "cracked but still together" beat before falling
	const rand = (a, b) => a + Math.random() * (b - a);

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
		if (open && el && !shattering) center();
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

	// --- shatter on close ------------------------------------------------------
	// Fracture the diamond into a relatively even field of pieces (a jittered
	// grid tiling the whole SVG), then let them fall off-screen. The current
	// rotation (theta) is carried through so it never snaps upright.

	const DIAMOND = [
		[0.5, 0],
		[1, 0.5],
		[0.5, 1],
		[0, 0.5]
	];

	function polyArea(pts) {
		let a = 0;
		for (let i = 0; i < pts.length; i++) {
			const p = pts[i];
			const q = pts[(i + 1) % pts.length];
			a += p[0] * q[1] - q[0] * p[1];
		}
		return Math.abs(a) / 2;
	}

	const inDiamond = (x, y) => Math.abs(x - 0.5) + Math.abs(y - 0.5) <= 0.5 + 1e-6;

	// even fracture: a jittered grid over the whole box, keeping the cells that
	// overlap the diamond -> roughly uniform pieces across the SVG.
	function buildFracture() {
		const cols = 5;
		const rows = 5;
		const jx = (0.9 / cols) * 0.5; // max jitter per interior vertex
		const jy = (0.9 / rows) * 0.5;

		// grid vertices (interior ones jittered)
		const gv = [];
		for (let r = 0; r <= rows; r++) {
			gv[r] = [];
			for (let c = 0; c <= cols; c++) {
				let x = c / cols;
				let y = r / rows;
				if (c > 0 && c < cols) x += rand(-jx, jx);
				if (r > 0 && r < rows) y += rand(-jy, jy);
				gv[r][c] = [x, y];
			}
		}

		const cells = [];
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const quad = [gv[r][c], gv[r][c + 1], gv[r + 1][c + 1], gv[r + 1][c]];
				const cxq = (quad[0][0] + quad[1][0] + quad[2][0] + quad[3][0]) / 4;
				const cyq = (quad[0][1] + quad[1][1] + quad[2][1] + quad[3][1]) / 4;
				// drop cells that sit fully in the transparent corners
				if (!quad.some((p) => inDiamond(p[0], p[1])) && !inDiamond(cxq, cyq)) continue;
				if (polyArea(quad) < 0.001) continue;
				cells.push({ pts: quad, impact: [0.5, 0.5] });
			}
		}
		return cells;
	}

	async function shatter() {
		if (shattering) return;
		cancelAnimationFrame(raf);
		dragging = false;
		physics = false;
		window.removeEventListener('pointermove', move);
		window.removeEventListener('pointerup', release);

		const cosT = Math.cos(theta);
		const sinT = Math.sin(theta);
		// map a box-local normalised point -> world (carrying the current pose)
		const toWorld = (nx, ny) => {
			const lx = (nx - 0.5) * S;
			const ly = (ny - 0.5) * S;
			return [cx + (lx * cosT - ly * sinT), cy + (lx * sinT + ly * cosT)];
		};

		const cells = buildFracture();
		const [pwx, pwy] = toWorld(cells[0]?.impact[0] ?? 0.5, cells[0]?.impact[1] ?? 0.13);

		const list = [];
		for (const cell of cells) {
			const pts = cell.pts;
			let sx = 0;
			let sy = 0;
			for (const p of pts) {
				sx += p[0];
				sy += p[1];
			}
			const cnx = sx / pts.length;
			const cny = sy / pts.length;
			const [wx, wy] = toWorld(cnx, cny);

			// pieces radiate from the impact point; nearer ones scatter faster
			let dx = wx - pwx;
			let dy = wy - pwy;
			let len = Math.hypot(dx, dy);
			if (len < 1) {
				dx = rand(-1, 1);
				dy = rand(-1, 1);
				len = Math.hypot(dx, dy) || 1;
			}
			// even, gentle outward scatter (pieces mostly just fall)
			const speed = rand(1.2, 2.6);

			list.push({
				clip: `polygon(${pts.map((p) => `${(p[0] * 100).toFixed(2)}% ${(p[1] * 100).toFixed(2)}%`).join(', ')})`,
				cnx,
				cny,
				px: wx,
				py: wy,
				angle: theta,
				vx: (dx / len) * speed + vx * 0.25 + rand(-0.5, 0.5),
				vy: (dy / len) * speed * 0.6 + vy * 0.25 - rand(0.4, 1.6),
				av: rand(-0.14, 0.14),
				el: null
			});
		}

		shards = list;
		shattering = true; // hides the intact diamond, renders the shards
		shatterStart = performance.now();

		// screen shake on the hammer's impact (synced with the swing)
		const shell = document.querySelector('.shell');
		if (shell) setTimeout(() => shakeElement(shell, 'adr-shake', 400), 150);

		await tick(); // wait for shard elements to mount
		raf = requestAnimationFrame(shardStep);
	}

	function shardStep() {
		// hold the fractured diamond together for a beat, then let it drop
		if (performance.now() - shatterStart < HOLD_MS) {
			raf = requestAnimationFrame(shardStep);
			return;
		}
		const H = window.innerHeight;
		let allGone = true;
		for (const sh of shards) {
			sh.vy += SHARD_G;
			sh.vx *= SHARD_AIR;
			sh.px += sh.vx;
			sh.py += sh.vy;
			sh.angle += sh.av;
			if (sh.el) {
				sh.el.style.transform = `translate3d(${Math.round(sh.px - sh.cnx * S)}px, ${Math.round(sh.py - sh.cny * S)}px, 0) rotate(${sh.angle}rad)`;
			}
			if (sh.py < H + S) allGone = false;
		}
		// finish when every piece has fallen past the bottom (or after a safety timeout)
		if (allGone || performance.now() - shatterStart > 5000) {
			finishClose();
			return;
		}
		raf = requestAnimationFrame(shardStep);
	}

	function finishClose() {
		cancelAnimationFrame(raf);
		shattering = false;
		shards = [];
		onclose();
	}

	function onkey(e) {
		if (e.key === 'Escape') shatter();
	}
	function closeX(e) {
		e.stopPropagation();
		shatter();
	}

	onMount(() => {
		const onResize = () => {
			if (shattering) return;
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

{#if open && !shattering}
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

{#if open && shattering}
	{#each shards as sh (sh)}
		<div
			class="shard"
			bind:this={sh.el}
			style="width:{S}px;height:{S}px; transform-origin:{sh.cnx * 100}% {sh.cny * 100}%; transform:translate3d({sh.px - sh.cnx * S}px,{sh.py - sh.cny * S}px,0) rotate({sh.angle}rad); clip-path:{sh.clip}; -webkit-clip-path:{sh.clip};"
		></div>
	{/each}
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
	.shard {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 901;
		pointer-events: none;
		background: url('/popup.svg') center / 100% 100% no-repeat;
		will-change: transform;
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
