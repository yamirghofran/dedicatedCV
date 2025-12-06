/**
 * Dashboard Stats Cards
 * Hero metrics display at the top of dashboard
 */

import { formatDistanceToNow } from "date-fns";
import { Clock, FileText, Layout, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
	totalCVs: number;
	templatesUsed: number;
	avgCompletion: number;
	lastActivity: string;
	isLoading?: boolean;
}

export function StatsCards({
	totalCVs,
	templatesUsed,
	avgCompletion,
	lastActivity,
	isLoading,
}: StatsCardsProps) {
	const stats = [
		{
			label: "Total CVs",
			value: totalCVs,
			icon: FileText,
			color: "text-blue-600",
			bgColor: "bg-blue-50",
		},
		{
			label: "Templates",
			value: templatesUsed,
			icon: Layout,
			color: "text-purple-600",
			bgColor: "bg-purple-50",
		},
		{
			label: "Avg Complete",
			value: `${avgCompletion}%`,
			icon: TrendingUp,
			color: "text-green-600",
			bgColor: "bg-green-50",
		},
		{
			label: "Last Update",
			value: formatDistanceToNow(new Date(lastActivity), { addSuffix: true }),
			icon: Clock,
			color: "text-orange-600",
			bgColor: "bg-orange-50",
			isRelative: true,
		},
	];

	if (isLoading) {
		return (
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
				{Array.from({ length: 4 }, (_, i) => `skeleton-stat-${i}`).map(
					(key) => (
						<Card key={key} className="animate-pulse">
							<CardContent className="p-4 md:p-6">
								<div className="h-20 bg-muted rounded" />
							</CardContent>
						</Card>
					),
				)}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
			{stats.map((stat) => {
				const Icon = stat.icon;
				return (
					<Card key={stat.label} className=" transition-none">
						<CardContent className="p-4 md:p-6">
							<div className="flex items-start justify-between mb-3">
								<div className={`p-2 rounded-lg ${stat.bgColor}`}>
									<Icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
								</div>
							</div>
							<div>
								<div className="text-2xl md:text-3xl font-bold mb-1">
									{stat.value}
								</div>
								<p className="text-xs md:text-sm text-muted-foreground">
									{stat.label}
								</p>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
