import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRegister } from "@/hooks/use-auth";
import AuthLayout from "@/components/auth/AuthLayout";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/auth/register")({
	component: RegisterPage,
});

function RegisterPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});

	const { mutate: register, isPending, error } = useRegister();

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!email) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = "Please enter a valid email";
		}

		if (!password) {
			newErrors.password = "Password is required";
		} else if (password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		const userData: { email: string; password: string; full_name?: string } = {
			email,
			password,
		};

		if (fullName) {
			userData.full_name = fullName;
		}

		register(userData, {
			onSuccess: () => {
				navigate({ to: "/app/dashboard" });
			},
		});
	};

	return (
		<AuthLayout>
			<div className="w-full max-w-sm mx-auto">
				<div className="text-center mb-6">
					<h1 className="text-2xl font-semibold">Create an account</h1>
					<p className="text-gray-500">Start your journey</p>
				</div>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<input
							type="text"
							id="fullName"
							placeholder="Full Name"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							className="mt-1 block w-full px-6 py-3 bg-transparent border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
						/>
					</div>
					<div>
						<input
							type="email"
							id="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className={`mt-1 block w-full px-6 py-3 bg-transparent border rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm ${
								errors.email ? "border-red-500" : "border-gray-300"
							}`}
						/>
						{errors.email && (
							<p className="text-sm text-red-600 mt-1">{errors.email}</p>
						)}
					</div>
					<div>
						<input
							type="password"
							id="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className={`mt-1 block w-full px-6 py-3 bg-transparent border rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm ${
								errors.password ? "border-red-500" : "border-gray-300"
							}`}
						/>
						{errors.password && (
							<p className="text-sm text-red-600 mt-1">{errors.password}</p>
						)}
					</div>
					{error && (
						<div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
							{(error as any)?.data?.detail ||
								error.message ||
								"Registration failed. Please try again."}
						</div>
					)}
					<Button
						type="submit"
						variant="dark"
						size="default"
						disabled={isPending}
						loading={isPending}
						icon={<ArrowUpRight />}
						className="w-full"
					>
						{isPending ? "Creating Account..." : "Sign Up"}
					</Button>
				</form>
				<p className="text-center text-sm text-gray-500 mt-6">
					Already have an account?{" "}
					<Link
						to="/auth/login"
						className="font-medium text-black hover:text-gray-800 cursor-pointer"
					>
						Login
					</Link>
				</p>
			</div>
		</AuthLayout>
	);
}
