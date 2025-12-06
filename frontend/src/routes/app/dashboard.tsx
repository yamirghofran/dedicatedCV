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
		<div className="space-y-6 md:space-y-8 pb-8">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold">
						Welcome back,{" "}
						{user?.full_name || user?.email?.split("@")[0] || "there"}!
					</h1>
					<p className="text-sm md:text-base text-muted-foreground mt-1">
						Your CV portfolio at a glance
					</p>
				</div>
				<Link to="/app/cvs/new" className="shrink-0">
					<Button size="lg" className="gap-2 w-full sm:w-auto">
						<Plus className="h-5 w-5" />
						Create CV
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
