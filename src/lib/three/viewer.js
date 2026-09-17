/**
 * Reusable Three.js GLB viewer.
 *
 * One factory, two uses:
 *   - grid tiles   -> { autoRotate:true, controls:false }  (ambient spin)
 *   - detail page  -> { autoRotate:true, controls:true  }  (drag to inspect)
 *
 * Handles: renderer/scene/camera setup, RoomEnvironment lighting for PBR
 * metals, DRACO-compressed GLB loading, auto-framing, pointer-drag orbit,
 * resize, and full disposal. Import three lazily so the grid stays light
 * until 3D mode is actually switched on.
 */

let THREE;
let modules;

async function ensureThree() {
	if (THREE) return;
	THREE = await import('three');
	const [{ GLTFLoader }, { DRACOLoader }, { OrbitControls }, { RoomEnvironment }] =
		await Promise.all([
			import('three/examples/jsm/loaders/GLTFLoader.js'),
			import('three/examples/jsm/loaders/DRACOLoader.js'),
			import('three/examples/jsm/controls/OrbitControls.js'),
			import('three/examples/jsm/environments/RoomEnvironment.js')
		]);
	modules = { GLTFLoader, DRACOLoader, OrbitControls, RoomEnvironment };
}

// One DRACO decoder shared by every loader instance.
let dracoLoader;
function getDraco() {
	if (!dracoLoader) {
		dracoLoader = new modules.DRACOLoader();
		dracoLoader.setDecoderPath('/draco/gltf/');
	}
	return dracoLoader;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} opts
 * @param {string} opts.model                 GLB url
 * @param {{scale:number,yaw:number,pitch:number,offsetY:number}} [opts.view]
 * @param {boolean} [opts.controls=false]     enable orbit drag
 * @param {boolean} [opts.autoRotate=true]
 * @param {number}  [opts.autoRotateSpeed=0.6]
 * @param {number}  [opts.fitOffset=1.3]      camera distance multiplier
 */
export async function createViewer(canvas, opts) {
	await ensureThree();

	const {
		model,
		view = { scale: 1, yaw: 0.5, pitch: 0.1, offsetY: 0 },
		controls: useControls = false,
		autoRotate = true,
		autoRotateSpeed = 0.6,
		fitOffset = 2.0
	} = opts;

	const renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: true,
		alpha: true,
		powerPreference: 'high-performance'
	});
	renderer.setClearColor(0x000000, 0);
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;

	const scene = new THREE.Scene();

	// Image-based lighting so metals read correctly.
	const pmrem = new THREE.PMREMGenerator(renderer);
	scene.environment = pmrem.fromScene(new modules.RoomEnvironment(), 0.04).texture;

	// A little direct light for definition on the matte pieces.
	const key = new THREE.DirectionalLight(0xffffff, 1.4);
	key.position.set(2.5, 4, 3);
	scene.add(key);
	const fill = new THREE.DirectionalLight(0xffffff, 0.5);
	fill.position.set(-3, 1, -2);
	scene.add(fill);

	const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
	camera.position.set(0, 0, 5);

	const pivot = new THREE.Group();
	scene.add(pivot);

	let controls = null;
	if (useControls) {
		controls = new modules.OrbitControls(camera, canvas);
		controls.enableDamping = true;
		controls.dampingFactor = 0.08;
		controls.enablePan = false;
		controls.minDistance = 0.5;
		controls.maxDistance = 20;
		controls.autoRotate = autoRotate;
		controls.autoRotateSpeed = autoRotateSpeed;
	}

	let modelRoot = null;
	let disposed = false;
	let raf = 0;

	function frameModel(object) {
		const box = new THREE.Box3().setFromObject(object);
		const size = box.getSize(new THREE.Vector3());
		const center = box.getCenter(new THREE.Vector3());

		// Recentre the model on the pivot origin.
		object.position.sub(center);
		object.position.y += view.offsetY * size.y;

		const maxDim = Math.max(size.x, size.y, size.z) || 1;
		const fov = (camera.fov * Math.PI) / 180;
		const dist = (maxDim / 2 / Math.tan(fov / 2)) * fitOffset;

		camera.position.set(0, 0, dist);
		camera.near = dist / 100;
		camera.far = dist * 100;
		camera.updateProjectionMatrix();
		if (controls) {
			controls.target.set(0, 0, 0);
			controls.update();
		}

		pivot.scale.setScalar(view.scale);
		pivot.rotation.y = view.yaw;
		pivot.rotation.x = view.pitch;
	}

	const loader = new modules.GLTFLoader();
	loader.setDRACOLoader(getDraco());

	const ready = new Promise((resolve, reject) => {
		loader.load(
			model,
			(gltf) => {
				if (disposed) return;
				modelRoot = gltf.scene;
				pivot.add(modelRoot);
				frameModel(modelRoot);
				resolve(modelRoot);
			},
			undefined,
			(err) => reject(err)
		);
	});

	// Manual auto-rotate when OrbitControls isn't driving it.
	let last = performance.now();
	function tick(now) {
		if (disposed) return;
		const dt = (now - last) / 1000;
		last = now;
		if (controls) {
			controls.update();
		} else if (autoRotate && pivot) {
			pivot.rotation.y += autoRotateSpeed * dt;
		}
		renderer.render(scene, camera);
		raf = requestAnimationFrame(tick);
	}
	raf = requestAnimationFrame(tick);

	function resize() {
		const w = canvas.clientWidth || 1;
		const h = canvas.clientHeight || 1;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		renderer.setPixelRatio(dpr);
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	}
	resize();
	const ro = new ResizeObserver(resize);
	ro.observe(canvas);

	function dispose() {
		if (disposed) return;
		disposed = true;
		cancelAnimationFrame(raf);
		ro.disconnect();
		controls?.dispose();
		scene.traverse((o) => {
			if (o.geometry) o.geometry.dispose();
			if (o.material) {
				const mats = Array.isArray(o.material) ? o.material : [o.material];
				for (const m of mats) {
					for (const k in m) {
						const v = m[k];
						if (v && v.isTexture) v.dispose();
					}
					m.dispose();
				}
			}
		});
		pmrem.dispose();
		renderer.dispose();
	}

	return {
		ready,
		resize,
		dispose,
		get pivot() {
			return pivot;
		},
		setAutoRotate(v) {
			if (controls) controls.autoRotate = v;
			autoRotate = v;
		}
	};
}
