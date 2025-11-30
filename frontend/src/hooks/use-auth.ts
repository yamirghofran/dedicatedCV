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
	return useQuery({
		queryKey: AUTH_KEYS.currentUser,
		queryFn: () => authService.getCurrentUser(),
		enabled: authService.isAuthenticated(),
		retry: false,
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
