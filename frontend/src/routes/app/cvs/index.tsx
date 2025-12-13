import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Copy,
	Eye,
	FileText,
	MoreVertical,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useCreateCV, useCVs, useDeleteCV } from "@/hooks/use-cvs";
import type { CV } from "@/lib/api";

export const Route = createFileRoute("/app/cvs/")({
	component: CVListPage,
});

function CVListPage() {
	const { data: cvs, isLoading, isError } = useCVs();
	const { mutate: deleteCV } = useDeleteCV();
	const { mutate: createCV, isPending: isDuplicating } = useCreateCV();
	const [message, setMessage] = useState<string | null>(null);

	const handleDelete = (id: number, title: string) => {
		if (confirm(`Delete "${title}"? This cannot be undone.`)) {
			deleteCV(id);
		}
	};

	const handleDuplicate = (cv: CV) => {
		createCV(
			{
				title: `${cv.title} (Copy)`,
				full_name: cv.full_name,
				email: cv.email,
				phone: cv.phone ?? "",
				location: cv.location ?? "",
				summary: cv.summary ?? "",
			},
			{
				onSuccess: () => {
					setMessage(`Duplicated "${cv.title}"`);
					setTimeout(() => setMessage(null), 2500);
				},
				onError: () => {
					setMessage("Could not duplicate CV");
					setTimeout(() => setMessage(null), 2500);
				},
			},
		);
	};

	const emptyState = (
		<Card className="border-dashed">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg md:text-xl">
					<FileText className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
					No CVs yet
				</CardTitle>
				<CardDescription className="text-xs md:text-sm">
					Start by creating a CV or use a template to move faster.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
					<Link to="/app/cvs/new" className="flex-1">
						<Button className="w-full text-xs md:text-sm">
							Create from scratch
						</Button>
					</Link>
					<Button
						variant="outline"
						disabled
						className="flex-1 text-xs md:text-sm"
					>
						Browse templates (coming soon)
					</Button>
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="space-y-4 md:space-y-6">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="min-w-0">
					<h1 className="text-2xl md:text-3xl font-bold">My CVs</h1>
					<p className="text-sm md:text-base text-muted-foreground mt-1">
						Manage all of your resumes in one place.
					</p>
				</div>
				<Link to="/app/cvs/new" className="w-full sm:w-auto">
					<Button className="gap-2 w-full sm:w-auto text-xs md:text-sm">
						<Plus className="h-4 w-4" />
						<span className="hidden sm:inline">Create New CV</span>
						<span className="sm:hidden">Create CV</span>
					</Button>
				</Link>
			</div>

			{message && (
				<p className="text-xs md:text-sm text-muted-foreground">{message}</p>
			)}

			{isLoading ? (
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader className="space-y-2">
								<div className="h-6 bg-muted rounded" />
								<div className="h-4 bg-muted rounded w-2/3" />
							</CardHeader>
							<CardContent>
								<div className="h-20 bg-muted rounded" />
							</CardContent>
						</Card>
					))}
				</div>
			) : isError ? (
				<Card className="border-dashed">
					<CardContent className="py-8 text-xs md:text-sm text-destructive text-center">
						Unable to load CVs. Please retry.
					</CardContent>
				</Card>
			) : cvs && cvs.length > 0 ? (
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					{cvs.map((cv) => (
						<Card key={cv.id} className="transition-none flex flex-col">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between gap-2">
									<div className="flex items-start gap-2 flex-1 min-w-0">
										<div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
											<FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
										</div>
										<div className="flex-1 min-w-0">
											<CardTitle className="truncate text-base">
												{cv.title}
											</CardTitle>
											<CardDescription className="truncate text-xs md:text-sm">
												{cv.full_name}
											</CardDescription>
										</div>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0 flex-shrink-0"
											>
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem>
												<Link
													to="/app/cvs/$id/preview"
													params={{ id: cv.id.toString() }}
													className="cursor-pointer flex items-center gap-2"
												>
													<Eye className="h-4 w-4" />
													Preview
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleDuplicate(cv)}
												disabled={isDuplicating}
												className="cursor-pointer"
											>
												<Copy className="h-4 w-4 mr-2" />
												Duplicate
											</DropdownMenuItem>
											<DropdownMenuItem>
												<Link
													to="/app/cvs/$id/edit"
													params={{ id: cv.id.toString() }}
													className="cursor-pointer flex items-center gap-2"
												>
													<Pencil className="h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleDelete(cv.id, cv.title)}
												className="text-destructive cursor-pointer"
											>
												<Trash2 className="h-4 w-4 mr-2" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardHeader>
							<CardContent className="pb-3 flex-1">
								<div className="space-y-1 text-xs md:text-sm text-muted-foreground">
									<p className="truncate">{cv.email}</p>
									{cv.summary && (
										<p className="line-clamp-2 text-xs">{cv.summary}</p>
									)}
								</div>
							</CardContent>
							<CardFooter className="flex gap-2 pt-0">
								<Link
									to="/app/cvs/$id/edit"
									params={{ id: cv.id.toString() }}
									className="flex-1"
								>
									<Button
										variant="outline"
										className="w-full text-xs md:text-sm"
									>
										Edit
									</Button>
								</Link>
								<Link
									to="/app/cvs/$id/preview"
									params={{ id: cv.id.toString() }}
									className="flex-1"
								>
									<Button
										variant="outline"
										className="w-full text-xs md:text-sm"
									>
										Preview
									</Button>
								</Link>
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				emptyState
			)}
		</div>
	);
}
