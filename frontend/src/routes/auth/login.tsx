import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { AuthButton } from "@/components/auth/AuthButton";
import { useLogin } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth/login")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { mutate: login, isPending, error } = useLogin();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		login(
			{ username: email, password },
			{
				onSuccess: () => {
					navigate({ to: "/app/dashboard" });
				},
			},
		);
	};

	return (
		<div className="w-full max-w-sm mx-auto">
			<div className="text-center mb-6">
				<h1 className="text-2xl font-normal">Welcome back</h1>
				<p className="text-gray-500 font-light">Login with your details</p>
			</div>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="mt-1 block w-full px-6 py-3 bg-transparent border border-gray-300 rounded-full focus:outline-none sm:text-sm"
					/>
				</div>
				<div>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="mt-1 block w-full px-6 py-3 bg-transparent border border-gray-300 rounded-full focus:outline-none sm:text-sm"
					/>
				</div>
				{error && (
					<div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
						Invalid email or password. Please try again.
					</div>
				)}
				<AuthButton
					type="submit"
					variant="dark"
					size="default"
					loading={isPending}
					icon={<ArrowUpRight />}
					className="w-full"
				>
					{isPending ? "Signing In..." : "Login"}
				</AuthButton>
			</form>
			<p className="text-center text-sm text-gray-500 mt-6">
				Don't have an account?{" "}
				<Link
					to="/auth/register"
					className="font-medium text-black hover:text-gray-800 cursor-pointer"
				>
					Sign up
				</Link>
			</p>
		</div>
	);
}
