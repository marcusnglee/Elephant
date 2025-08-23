import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	// Load environment variables
	const env = loadEnv(mode, process.cwd(), '');
	const API_URL = env.API_URL || 'http://localhost:3000';
	
	return {
		plugins: [sveltekit()],
		server: {
			proxy: {
				'/api': {
					target: API_URL,
					changeOrigin: true
				},
				'/media': {
					target: API_URL,
					changeOrigin: true
				}
			}
		}
	};
});