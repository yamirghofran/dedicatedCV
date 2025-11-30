/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
	version: import.meta.env.VITE_API_VERSION || "v1",
	timeout: 30000, // 30 seconds
} as const;

export const getApiUrl = (path: string): string => {
	const cleanPath = path.startsWith("/") ? path.slice(1) : path;
	return `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/${cleanPath}`;
};
