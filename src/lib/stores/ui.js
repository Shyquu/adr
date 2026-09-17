import { writable } from 'svelte/store';

/**
 * Global UI state.
 *  - filter : active catalogue category or 'All'
 *
 * (The old 2D/3D toggle was removed — the grid is 3D-first and falls back to
 *  the still image automatically when WebGL is unavailable or a model is slow
 *  to load. See ProductCard / ThreeViewer.)
 */
export const filter = writable('All');
