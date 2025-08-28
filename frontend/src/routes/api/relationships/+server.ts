import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const BACKEND_URL = 'http://localhost:3000';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const params = new URLSearchParams(url.searchParams);
		const backendUrl = `${BACKEND_URL}/api/relationships?${params.toString()}`;
		
		const response = await fetch(backendUrl);
		
		if (!response.ok) {
			throw new Error(`Backend responded with status: ${response.status}`);
		}
		
		const data = await response.json();
		return json(data);
	} catch (error) {
		console.error('Error fetching relationships from backend:', error);
		return json(
			{ error: 'Failed to fetch relationships' },
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const relationshipData = await request.json();
		
		const response = await fetch(`${BACKEND_URL}/api/relationships`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(relationshipData),
		});
		
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Failed to create relationship' }));
			return json(errorData, { status: response.status });
		}
		
		const data = await response.json();
		return json(data);
	} catch (error) {
		console.error('Error creating relationship:', error);
		return json(
			{ error: 'Failed to create relationship' },
			{ status: 500 }
		);
	}
};