import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5173,
		host: true
	},
	// three.js is large; keep it as a single pre-bundled dep.
	optimizeDeps: {
		include: ['three']
	}
});
