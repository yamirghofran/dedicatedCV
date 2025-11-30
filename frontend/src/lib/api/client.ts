/**
 * API Client
 * Core HTTP client with authentication and error handling
 */

import { getApiUrl } from "./config";

export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public data?: unknown,
	) {
		super(message);
		this.name = "ApiError";
	}
}

interface RequestOptions extends RequestInit {
	data?: unknown;
	params?: Record<string, string | number | boolean>;
}

class ApiClient {
	private getAuthToken(): string | null {
		return localStorage.getItem("access_token");
	}

	private handleUnauthorized() {
		localStorage.removeItem("access_token");
		localStorage.removeItem("user");
		if (typeof window !== "undefined") {
			const currentPath = window.location.pathname;
			if (!currentPath.startsWith("/auth")) {
				window.location.assign("/auth/login");
			}
		}
	}

	private async request<T>(
		endpoint: string,
		options: RequestOptions = {},
	): Promise<T> {
		const { data, params, headers = {}, ...fetchOptions } = options;

		// Build URL with query params
		const url = new URL(getApiUrl(endpoint));
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				url.searchParams.append(key, String(value));
			});
		}

		// Set up headers
		const requestHeaders: Record<string, string> = {
			...(headers as Record<string, string>),
		};

		// Only set Content-Type if not FormData or URLSearchParams (browser handles these)
		if (!(data instanceof FormData) && !(data instanceof URLSearchParams)) {
			requestHeaders["Content-Type"] = "application/json";
		}

		// Add auth token if available
		const token = this.getAuthToken();
		if (token) {
			requestHeaders["Authorization"] = `Bearer ${token}`;
		}

		// Prepare body
		let body: string | FormData | URLSearchParams | undefined;
		if (data instanceof FormData || data instanceof URLSearchParams) {
			body = data;
		} else if (data) {
			body = JSON.stringify(data);
		}

		// Make request
		const response = await fetch(url.toString(), {
			...fetchOptions,
			headers: requestHeaders,
			body,
		});

		// Handle response
		if (!response.ok) {
			let errorData: unknown;
			try {
				errorData = await response.json();
			} catch {
				errorData = await response.text();
			}

			if (response.status === 401) {
				this.handleUnauthorized();
			}

			throw new ApiError(
				`API Error: ${response.statusText}`,
				response.status,
				errorData,
			);
		}

		// Handle no content
		if (response.status === 204) {
			return undefined as T;
		}

		// Parse JSON response
		return response.json();
	}

	async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
		return this.request<T>(endpoint, { ...options, method: "GET" });
	}

	async post<T>(
		endpoint: string,
		data?: unknown,
		options?: RequestOptions,
	): Promise<T> {
		return this.request<T>(endpoint, { ...options, method: "POST", data });
	}

	async put<T>(
		endpoint: string,
		data?: unknown,
		options?: RequestOptions,
	): Promise<T> {
		return this.request<T>(endpoint, { ...options, method: "PUT", data });
	}

	async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
		return this.request<T>(endpoint, { ...options, method: "DELETE" });
	}
}

export const apiClient = new ApiClient();
