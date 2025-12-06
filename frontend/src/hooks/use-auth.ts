/**
 * Authentication Hooks
 * React Query hooks for authentication operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginCredentials, UserCreate } from "@/lib/api";
import { authService } from "@/lib/api";

export const AUTH_KEYS = {
	currentUser: ["auth", "current-user"] as const,
	testToken: ["auth", "test-token"] as const,
};

/**
 * Get current authenticated user
 */
export function useCurrentUser() {
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: AUTH_KEYS.currentUser,
		queryFn: async () => {
			// Double-check authentication before fetching
			if (!authService.isAuthenticated()) {
				// Clear all cached data if not authenticated
				queryClient.clear();
				return null;
			}

			try {
				return await authService.getCurrentUser();
			} catch (error) {
				// If getCurrentUser fails (e.g., 401), ensure we're logged out
				authService.logout();
				queryClient.clear();
				throw error;
			}
		},
		enabled: authService.isAuthenticated(),
		retry: false,
		staleTime: 0, // Always check freshness
		gcTime: 0, // Don't cache when query is unmounted
	});
}

/**
 * Register a new user
 */
export function useRegister() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UserCreate) => authService.register(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: AUTH_KEYS.currentUser });
		},
	});
}

/**
 * Login user
 */
export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (credentials: LoginCredentials) =>
			authService.login(credentials),
		onSuccess: (data) => {
			queryClient.setQueryData(AUTH_KEYS.currentUser, data.user);
			queryClient.invalidateQueries({ queryKey: AUTH_KEYS.currentUser });
		},
	});
}

/**
 * Logout user
 */
export function useLogout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => {
			authService.logout();
			return Promise.resolve();
		},
		onSuccess: () => {
			queryClient.clear();
		},
	});
}
