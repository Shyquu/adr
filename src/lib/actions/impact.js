/**
 * Hammer-impact helpers.
 *
 *  - shakeElement : re-triggerable class-based shake on one node.
 *  - impactCascade: hit one product card hard, then ripple a softer "falling"
 *                   shake outward to the other cards, delayed by distance.
 */

export function shakeElement(node, cls = 'adr-shake', ms = 420) {
	if (!node) return;
	node.classList.remove(cls);
	// force reflow so the animation restarts even on rapid re-hits
	void node.offsetWidth;
	node.classList.add(cls);
	window.setTimeout(() => node.classList.remove(cls), ms);
}

export function prefersReducedMotion() {
	try {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	} catch {
		return false;
	}
}

export function impactCascade(origin) {
	if (!origin) return;
	shakeElement(origin, 'adr-shake', 420);
	if (prefersReducedMotion()) return;

	const cards = Array.from(document.querySelectorAll('.card'));
	const o = origin.getBoundingClientRect();
	const ox = o.left + o.width / 2;
	const oy = o.top + o.height / 2;

	for (const c of cards) {
		if (c === origin) continue;
		const rect = c.getBoundingClientRect();
		const dist = Math.hypot(rect.left + rect.width / 2 - ox, rect.top + rect.height / 2 - oy);
		const delay = Math.min(320, 50 + dist * 0.32);
		window.setTimeout(() => shakeElement(c, 'adr-shake-soft', 540), delay);
	}
}
