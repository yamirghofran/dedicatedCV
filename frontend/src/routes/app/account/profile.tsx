import { createFileRoute } from "@tanstack/react-router";
import { useId, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser, useUploadProfilePicture } from "@/hooks/use-auth";

export const Route = createFileRoute("/app/account/profile")({
	component: AccountProfilePage,
});

function AccountProfilePage() {
	const { data: user, isLoading } = useCurrentUser();
	const uploadMutation = useUploadProfilePicture();
	const [uploadError, setUploadError] = useState<string | null>(null);
	const avatarInputId = useId();
	const fullNameId = useId();
	const emailId = useId();

	if (isLoading || !user) {
		return (
			<div className="max-w-2xl space-y-4">
				<Skeleton className="h-10 w-32" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	return (
		<div className="max-w-2xl space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Profile</h1>
				<p className="text-muted-foreground mt-1">
					Manage your account details.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Basic info</CardTitle>
					<CardDescription>Avatar, name, and email settings.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center gap-4">
						<Avatar className="h-16 w-16 rounded-lg">
							{user.profile_picture_url ? (
								<AvatarImage
									src={user.profile_picture_url}
									alt={user.full_name || user.email}
									className="rounded-lg object-cover"
								/>
							) : null}
							<AvatarFallback className="rounded-lg text-lg">
								{(user.full_name || user.email || "U")[0]?.toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="space-y-2">
							<input
								id={avatarInputId}
								type="file"
								accept="image/png,image/jpeg"
								className="hidden"
								onChange={(e) => {
									setUploadError(null);
									const file = e.target.files?.[0];
									if (!file) return;
									uploadMutation.mutate(file, {
										onError: (err) => {
											setUploadError(err.message || "Upload failed");
										},
									});
								}}
							/>
							<Button
								variant="outline"
								onClick={() => document.getElementById(avatarInputId)?.click()}
								disabled={uploadMutation.isPending}
							>
								{uploadMutation.isPending ? "Uploading…" : "Change photo"}
							</Button>
							{uploadError && (
								<p className="text-xs text-destructive">{uploadError}</p>
							)}
						</div>
					</div>
					<div className="grid gap-4">
						<div className="space-y-2">
							<Label htmlFor={fullNameId}>Full name</Label>
							<Input id={fullNameId} value={user.full_name || ""} disabled />
						</div>
						<div className="space-y-2">
							<Label htmlFor={emailId}>Email</Label>
							<Input id={emailId} type="email" value={user.email} disabled />
						</div>
					</div>
					<Button disabled>Save changes</Button>
				</CardContent>
			</Card>
		</div>
	);
}
