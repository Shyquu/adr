import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// adapter-node produces a standalone Node server in ./build
		// which is exactly what pm2 runs (see ecosystem.config.cjs).
		adapter: adapter({
			out: 'build'
		})
	}
};

export default config;
