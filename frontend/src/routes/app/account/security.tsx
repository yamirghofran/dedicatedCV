import { createFileRoute } from "@tanstack/react-router";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/app/account/security")({
	component: AccountSecurityPage,
});

function AccountSecurityPage() {
	const currentPasswordId = useId();
	const newPasswordId = useId();

	return (
		<div className="max-w-2xl space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Security</h1>
				<p className="text-muted-foreground mt-1">
					Update your password and manage active sessions.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Change password</CardTitle>
					<CardDescription>
						Strength meter and validation will be added.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor={currentPasswordId}>Current password</Label>
						<Input
							id={currentPasswordId}
							type="password"
							placeholder="••••••"
							disabled
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor={newPasswordId}>New password</Label>
						<Input
							id={newPasswordId}
							type="password"
							placeholder="••••••"
							disabled
						/>
					</div>
					<Button disabled>Update password</Button>
				</CardContent>
			</Card>

			<Separator />

			<Card>
				<CardHeader>
					<CardTitle>Active sessions</CardTitle>
					<CardDescription>
						Device list and remote logout will appear here.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
						Current session — placeholder device info
					</div>
					<Button variant="outline" disabled>
						Log out all devices (soon)
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
