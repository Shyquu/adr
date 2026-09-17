import { error } from '@sveltejs/kit';
import { getProduct } from '$lib/data/products.js';

export function load({ params }) {
	const product = getProduct(params.slug);
	if (!product) {
		throw error(404, 'Object not found');
	}
	return { product };
}
