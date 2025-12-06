/**
 * Recent CVs Section
 * Shows the 3 most recently updated CVs
 */

import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Eye, FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import type { CV } from "@/lib/api/types";

interface RecentCVsProps {
	cvs: CV[];
	isLoading?: boolean;
}

export function RecentCVs({ cvs, isLoading }: RecentCVsProps) {
	if (isLoading) {
		return (
			<div>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg md:text-xl font-semibold">Recent CVs</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map((key) => (
						<Card key={key} className="animate-pulse">
							<CardHeader className="space-y-2">
								<div className="h-6 bg-muted rounded" />
								<div className="h-4 bg-muted rounded w-2/3" />
							</CardHeader>
							<CardContent>
								<div className="h-16 bg-muted rounded" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (cvs.length === 0) {
		return (
			<div>
				<h2 className="text-lg md:text-xl font-semibold mb-4">Recent CVs</h2>
				<Card className="border-dashed">
					<CardContent className="py-12 text-center">
						<div className="p-4 bg-muted rounded-full mb-4 inline-block">
							<FileText className="h-8 w-8 text-muted-foreground" />
						</div>
						<p className="text-muted-foreground mb-4">No CVs yet</p>
						<Link to="/app/cvs/new">
							<Button className="gap-2">
								<FileText className="h-4 w-4" />
								Create Your First CV
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg md:text-xl font-semibold">Recent CVs</h2>
				<Link
					to="/app/cvs"
					className="text-sm text-primary hover:underline flex items-center gap-1"
				>
					View All <ArrowRight className="h-4 w-4" />
				</Link>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{cvs.map((cv) => (
					<Card key={cv.id} className="">
						<CardHeader>
							<div className="flex items-start gap-3">
								<div className="p-2 bg-primary/10 rounded-lg">
									<FileText className="h-5 w-5 text-primary" />
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold truncate">{cv.title}</h3>
									<p className="text-sm text-muted-foreground truncate">
										{cv.full_name}
									</p>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground truncate">
									{cv.email}
								</p>
								<p className="text-xs text-muted-foreground">
									Updated{" "}
									{formatDistanceToNow(new Date(cv.updated_at), {
										addSuffix: true,
									})}
								</p>
								{cv.summary && (
									<p className="text-xs text-muted-foreground line-clamp-2 mt-2">
										{cv.summary}
									</p>
								)}
							</div>
						</CardContent>
						<CardFooter className="flex gap-2">
							<Link
								to="/app/cvs/$id/edit"
								params={{ id: cv.id.toString() }}
								className="flex-1"
							>
								<Button variant="outline" className="w-full gap-2" size="sm">
									<Pencil className="h-4 w-4" />
									<span className="hidden sm:inline">Edit</span>
								</Button>
							</Link>
							<Link
								to="/app/cvs/$id/preview"
								params={{ id: cv.id.toString() }}
								className="flex-1"
							>
								<Button variant="outline" className="w-full gap-2" size="sm">
									<Eye className="h-4 w-4" />
									<span className="hidden sm:inline">Preview</span>
								</Button>
							</Link>
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
}
