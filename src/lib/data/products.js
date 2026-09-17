/**
 * ADR catalogue.
 *
 * One entry per object. The grid, the 2D/3D toggle and the detail pages all
 * read from here — add an object by adding a record, nothing else.
 *
 * Fields
 *  - code      short catalogue number shown before the title  (◆ 2601)
 *  - title     product name
 *  - client    artist / project the object was built for       [Ski Aggu]
 *  - category  used by the [Objects] / [Stages] filters
 *  - image     transparent PNG thumbnail (in /static/product_images)
 *  - model     draco-compressed GLB (in /static/models) or null if 2D only
 *  - view      per-model framing hints for the Three.js viewer
 *  - gallery   lifestyle shots for the detail page
 *  - blurb     one-line summary
 *  - body      paragraphs for the detail page
 *  - specs     right-hand spec column on the detail page, as groups of lines
 *              (each inner array renders as a block, blocks separated by a gap
 *              so they line up with the description paragraphs)
 */

const IMG = '/product_images';
const MDL = '/models';

/** @typedef {{ scale:number, yaw:number, pitch:number, offsetY:number }} ViewHint */

/** @type {ViewHint} */
const DEFAULT_VIEW = { scale: 1, yaw: 0.5, pitch: 0.1, offsetY: 0 };

export const products = [
	{
		slug: 'ear-speakers',
		code: '2601',
		title: 'Ear Speakers',
		client: 'Ski Aggu',
		category: 'Objects',
		image: `${IMG}/ear_Speaker.png`,
		model: null,
		view: DEFAULT_VIEW,
		gallery: [`${IMG}/product_showcase_speaker01.png`, `${IMG}/product_showcase_speaker02.png`],
		blurb: 'Ear-shaped monitor speakers, 1.20 m tall.',
		body: [
			"Accompanying German rapper Ski Aggu's new album, we designed & built these 1.20 m tall ear-shaped speakers.",
			'The speakers were used for the album cover set design, multiple music videos as well as the artist’s festival stage design.'
		],
		specs: [
			['120cm h', '30cm t', '20cm b'],
			['4kg', '2026']
		]
	},
	{
		slug: 'big-phone',
		code: '2602',
		title: 'Big Phone',
		client: 'Ski Aggu',
		category: 'Objects',
		image: `${IMG}/phone.png`,
		model: `${MDL}/big_phone.glb`,
		view: { scale: 1, yaw: 0.35, pitch: 0.05, offsetY: 0 },
		gallery: [],
		blurb: 'Oversized handset prop for stage & video.',
		body: [
			'A larger-than-life smartphone prop, milled and finished for close-up camera work.',
			'Built as a hero object for the tour visuals and used across the artist’s social rollout.'
		],
		specs: [
			['90cm h', '44cm w', '8cm d'],
			['6kg', '2026']
		]
	},
	{
		slug: 'incense-holder',
		code: '2603',
		title: 'Incense Holder',
		client: 'ADR Editions',
		category: 'Objects',
		image: `${IMG}/incense_stick_holder.png`,
		model: `${MDL}/incense_holder.glb`,
		view: { scale: 1, yaw: 0.6, pitch: 0.12, offsetY: 0 },
		gallery: [],
		blurb: 'Cast sculptural incense holder.',
		body: [
			'A sculptural incense holder from the ADR in-house editions line.',
			'Organic cast body with a machined brass ball finial — one of a small numbered run.'
		],
		specs: [
			['34cm h', '18cm w', '18cm d'],
			['2kg', '2026']
		]
	},
	{
		slug: 'face-mask',
		code: '2604',
		title: 'Face Mask',
		client: 'Ski Aggu',
		category: 'Objects',
		image: `${IMG}/skiaggu_mask.png`,
		model: `${MDL}/aggu_maske.glb`,
		view: { scale: 1, yaw: 0.4, pitch: 0.05, offsetY: 0 },
		gallery: [],
		blurb: 'Screaming mask, cast & finished.',
		body: [
			'A screaming face mask designed for the live show — lightweight cast shell finished in matte white.',
			'Used as a recurring motif across the campaign and worn on stage.'
		],
		specs: [
			['26cm h', '18cm w', '12cm d'],
			['0.4kg', '2026']
		]
	},
	{
		slug: 'goggles',
		code: '2605',
		title: 'Goggles',
		client: 'Ski Aggu',
		category: 'Objects',
		image: `${IMG}/skiaggu_goggles.png`,
		model: null,
		view: DEFAULT_VIEW,
		gallery: [],
		blurb: 'Custom mirrored stage goggles.',
		body: [
			'Custom mirrored goggles built as a signature stage-wear piece.',
			'Dual amber lenses set in a moulded frame with an adjustable strap.'
		],
		specs: [
			['20cm w', '9cm h', '8cm d'],
			['0.2kg', '2026']
		]
	},
	{
		slug: 'microphone',
		code: '2606',
		title: 'Microphone',
		client: 'Bani',
		category: 'Objects',
		image: `${IMG}/bani_mic.png`,
		model: `${MDL}/bani_mic.glb`,
		view: { scale: 1, yaw: 0.5, pitch: 0.08, offsetY: 0 },
		gallery: [],
		blurb: 'Sculpted hero microphone prop.',
		body: [
			'A sculpted hero microphone built for artist Bani’s music video.',
			'Machined body with a fabricated mesh head, finished for macro camera work.'
		],
		specs: [
			['24cm h', 'Ø 6cm'],
			['0.6kg', '2026']
		]
	},
	{
		slug: 'ear-lighter',
		code: '2607',
		title: 'Ear Lighter',
		client: 'Ski Aggu',
		category: 'Objects',
		image: `${IMG}/ear_lighter.png`,
		model: null,
		view: DEFAULT_VIEW,
		gallery: [],
		blurb: 'Ear-cast pocket lighter object.',
		body: [
			'A chrome ear-cast lighter object from the same family as the Ear Speakers.',
			'Small-run collectible produced alongside the album release.'
		],
		specs: [
			['8cm h', '5cm w', '2cm d'],
			['0.1kg', '2026']
		]
	},
	{
		slug: 'ear-speakers-stage',
		code: '2608',
		title: 'Ear Speakers — Stage',
		client: 'Ski Aggu',
		category: 'Stages',
		image: `${IMG}/ear_Speaker.png`,
		model: null,
		view: DEFAULT_VIEW,
		gallery: [`${IMG}/product_showcase_speaker02.png`, `${IMG}/product_showcase_speaker01.png`],
		blurb: 'Festival stage design built around the ears.',
		body: [
			'The full festival stage design developed around the Ear Speakers object.',
			'Scenic build, placement and lighting integration for the touring set.'
		],
		specs: [
			['900cm w', '400cm h', '350cm d'],
			['2026']
		]
	}
];

/** Lookup by slug. */
export function getProduct(slug) {
	return products.find((p) => p.slug === slug) ?? null;
}

/** Distinct categories, for the filter bar. */
export const categories = [...new Set(products.map((p) => p.category))];
