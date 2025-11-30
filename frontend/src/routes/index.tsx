import { createFileRoute, Navigate } from "@tanstack/react-router";
import { authService } from "@/lib/api/services/auth.service";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	// If user is authenticated, redirect to dashboard
	// Otherwise, redirect to login
	const isAuthenticated = authService.isAuthenticated();

	if (isAuthenticated) {
		return <Navigate to="/app/dashboard" />;
	}

	return <Navigate to="/auth/login" />;
}
