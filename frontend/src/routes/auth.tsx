import { createFileRoute, Outlet } from "@tanstack/react-router";
import AuthLayout from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/auth")({
	component: AuthLayoutRoute,
});

function AuthLayoutRoute() {
	return (
		<AuthLayout>
			<Outlet />
		</AuthLayout>
	);
}
