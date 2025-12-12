/**
 * Authentication Service
 * Handles user authentication, registration, and token management
 */

import { apiClient } from "../client";
import type { LoginCredentials, Token, User, UserCreate } from "../types";

const TOKEN_KEY = "access_token";
const USER_KEY = "user";

export const authService = {
	/**
	 * Register a new user
	 */
	async register(data: UserCreate): Promise<User> {
		const user = await apiClient.post<User>("auth/register", data);
		return user;
	},

	/**
	 * Login with email and password
	 */
	async login(
		credentials: LoginCredentials,
	): Promise<{ user: User; token: Token }> {
		// Convert to URL-encoded form data for OAuth2 password flow
		const formData = new URLSearchParams();
		formData.append("username", credentials.username);
		formData.append("password", credentials.password);

		const token = await apiClient.post<Token>("auth/login", formData, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		// Store token
		this.setToken(token.access_token);

		// Get current user
		const user = await this.getCurrentUser();

		// Store user
		this.setUser(user);

		return { user, token };
	},

	/**
	 * Logout user
	 */
	logout(): void {
		this.removeToken();
		this.removeUser();
	},

	/**
	 * Get current authenticated user
	 */
	async getCurrentUser(): Promise<User> {
		return apiClient.get<User>("auth/me");
	},

	/**
	 * Test if current token is valid
	 */
	async testToken(): Promise<User> {
		return apiClient.post<User>("auth/test-token");
	},

	async uploadProfilePicture(file: File): Promise<User> {
		const formData = new FormData();
		formData.append("file", file);
		return apiClient.post<User>("auth/profile-picture", formData);
	},

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		return this.getToken() !== null;
	},

	/**
	 * Get stored token
	 */
	getToken(): string | null {
		return localStorage.getItem(TOKEN_KEY);
	},

	/**
	 * Set token in storage
	 */
	setToken(token: string): void {
		localStorage.setItem(TOKEN_KEY, token);
	},

	/**
	 * Remove token from storage
	 */
	removeToken(): void {
		localStorage.removeItem(TOKEN_KEY);
	},

	/**
	 * Get stored user
	 */
	getUser(): User | null {
		const userJson = localStorage.getItem(USER_KEY);
		return userJson ? JSON.parse(userJson) : null;
	},

	/**
	 * Set user in storage
	 */
	setUser(user: User): void {
		localStorage.setItem(USER_KEY, JSON.stringify(user));
	},

	/**
	 * Remove user from storage
	 */
	removeUser(): void {
		localStorage.removeItem(USER_KEY);
	},
};
