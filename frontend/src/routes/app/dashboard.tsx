import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Plus } from "lucide-react";
import { RecentCVs } from "@/components/dashboard/RecentCVs";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-auth";
import { useDashboardStats } from "@/hooks/use-dashboard";

export const Route = createFileRoute("/app/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	const { data: user } = useCurrentUser();
	const { data: stats, isLoading, isError } = useDashboardStats();

	// Error state
	if (isError) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
						<p className="text-muted-foreground mt-1">
							Unable to load dashboard statistics
						</p>
					</div>
				</div>
				<div className="flex items-center gap-3 p-4 border border-destructive/50 bg-destructive/5 rounded-lg">
					<AlertCircle className="h-5 w-5 text-destructive shrink-0" />
					<div className="flex-1">
						<p className="text-sm font-medium">Failed to load dashboard data</p>
						<p className="text-xs text-muted-foreground mt-1">
							Please try refreshing the page
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => window.location.reload()}
					>
						Refresh
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4 md:space-y-6">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="min-w-0">
					<h1 className="text-2xl md:text-3xl font-bold">
						Welcome back,{" "}
						{user?.full_name || user?.email?.split("@")[0] || "there"}!
					</h1>
					<p className="text-sm md:text-base text-muted-foreground mt-1">
						Manage your professional resumes
					</p>
				</div>
				<Link to="/app/cvs/new" className="w-full sm:w-auto">
					<Button size="lg" className="gap-2 w-full sm:w-auto">
						<Plus className="h-4 w-4 md:h-5 md:w-5" />
						<span className="hidden sm:inline">Create New CV</span>
						<span className="sm:hidden">Create CV</span>
					</Button>
				</Link>
			</div>

			{/* Stats Cards */}
			<StatsCards
				totalCVs={stats?.total_cvs ?? 0}
				templatesUsed={stats?.templates_used ?? 0}
				avgCompletion={stats?.avg_completion_rate ?? 0}
				lastActivity={stats?.last_activity ?? new Date().toISOString()}
				isLoading={isLoading}
			/>

			{/* Recent CVs */}
			<RecentCVs cvs={stats?.recent_cvs ?? []} isLoading={isLoading} />
		</div>
	);
}
				</div>

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
												<CardTitle className="truncate text-base">{cv.title}</CardTitle>
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
													<Copy className="h-4 w-4 " />
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
													className="text-destructive cursor-pointer hover:!text-destructive"
												>
													<Trash2 className="h-4 w-4 text-destructive " />
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
										<Button variant="outline" className="w-full text-xs md:text-sm">
											Edit
										</Button>
									</Link>
									<Link
										to="/app/cvs/$id/preview"
										params={{ id: cv.id.toString() }}
										className="flex-1"
									>
										<Button variant="outline" className="w-full text-xs md:text-sm">
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
=======
			{/* Stats Cards */}
			<StatsCards
				totalCVs={stats?.total_cvs ?? 0}
				templatesUsed={stats?.templates_used ?? 0}
				avgCompletion={stats?.avg_completion_rate ?? 0}
				lastActivity={stats?.last_activity ?? new Date().toISOString()}
				isLoading={isLoading}
			/>

			{/* Recent CVs */}
			<RecentCVs cvs={stats?.recent_cvs ?? []} isLoading={isLoading} />
>>>>>>> origin/main
		</div>
	);
}
