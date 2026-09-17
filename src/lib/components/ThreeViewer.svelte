<!--
  ThreeViewer — Svelte lifecycle wrapper around lib/three/viewer.js.

  3D-first with graceful degradation: it reports `onready` once the model is on
  screen and `onfail` if WebGL is missing, the GLB errors, or loading exceeds
  the timeout. The parent keeps a 2D still visible until `onready`, and forever
  on `onfail` — so the grid always shows something.
-->
<script>
	import { onMount } from 'svelte';
	import { createViewer } from '$lib/three/viewer.js';

	let {
		model,
		view = { scale: 1, yaw: 0.5, pitch: 0.1, offsetY: 0 },
		controls = false,
		autoRotate = true,
		autoRotateSpeed = 0.6,
		fitOffset = 2.0,
		lazy = true,
		timeout = 12000,
		onready = () => {},
		onfail = () => {}
	} = $props();

	let canvas = $state(null);
	let host = $state(null);
	let viewer = null;
	let settled = false;

	function fail(reason) {
		if (settled) return;
		settled = true;
		console.warn('[ThreeViewer] falling back to 2D:', model, reason);
		viewer?.dispose();
		viewer = null;
		onfail();
	}

	function hasWebGL() {
		try {
			const c = document.createElement('canvas');
			return !!(
				window.WebGLRenderingContext &&
				(c.getContext('webgl') || c.getContext('experimental-webgl'))
			);
		} catch {
			return false;
		}
	}

	async function boot() {
		if (viewer || settled || !canvas) return;
		if (!hasWebGL()) return fail('no-webgl');

		const timer = setTimeout(() => fail('timeout'), timeout);
		try {
			viewer = await createViewer(canvas, {
				model,
				view,
				controls,
				autoRotate,
				autoRotateSpeed,
				fitOffset
			});
			await viewer.ready;
			clearTimeout(timer);
			if (settled) {
				// failed/timed-out in the meantime
				viewer?.dispose();
				viewer = null;
				return;
			}
			settled = true;
			onready();
		} catch (e) {
			clearTimeout(timer);
			fail(e);
		}
	}

	onMount(() => {
		if (!lazy) {
			boot();
			return () => viewer?.dispose();
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					boot();
					io.disconnect();
				}
			},
			{ rootMargin: '200px' }
		);
		if (host) io.observe(host);
		return () => {
			io.disconnect();
			viewer?.dispose();
			viewer = null;
		};
	});
</script>

<div class="viewer" bind:this={host} class:controls>
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.viewer {
		position: relative;
		width: 100%;
		height: 100%;
	}
	.viewer.controls canvas {
		touch-action: none;
	}
	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
