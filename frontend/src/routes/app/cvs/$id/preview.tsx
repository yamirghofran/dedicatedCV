import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCV } from "@/hooks/use-cvs";
import { ClassicTemplate, MinimalTemplate, ModernTemplate } from "@/templates";

export const Route = createFileRoute("/app/cvs/$id/preview")({
	component: CVPreviewPlaceholder,
});

function CVPreviewPlaceholder() {
	const { id } = Route.useParams();
	const cvId = Number(id);
	const { data: cv, isLoading } = useCV(cvId);
	const [selectedTemplate, setSelectedTemplate] = useState<
		"Classic" | "Modern" | "Minimal"
	>("Classic");

	useEffect(() => {
		const stored = localStorage.getItem(`cv_template_${cvId}`);
		if (stored === "Modern" || stored === "Minimal" || stored === "Classic") {
			setSelectedTemplate(stored);
		}
	}, [cvId]);

	useEffect(() => {
		localStorage.setItem(`cv_template_${cvId}`, selectedTemplate);
	}, [cvId, selectedTemplate]);

	const TemplateComponent = useMemo(() => {
		switch (selectedTemplate) {
			case "Modern":
				return ModernTemplate;
			case "Minimal":
				return MinimalTemplate;
			default:
				return ClassicTemplate;
		}
	}, [selectedTemplate]);

	if (isLoading || !cv) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-40" />
				<Skeleton className="aspect-[8.5/11] w-full" />
			</div>
		);
	}

		return (
			<div className="space-y-6">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div className="w-full sm:w-auto">
						<p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
							Preview
						</p>
						<h1 className="text-2xl md:text-3xl font-bold truncate">{cv.title}</h1>
						<p className="text-xs md:text-sm text-muted-foreground mt-1">
							Print-optimized preview with template selection.
						</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{(["Classic", "Modern", "Minimal"] as const).map((template) => (
								<Button
									key={template}
									variant={selectedTemplate === template ? "default" : "outline"}
									size="sm"
									onClick={() => setSelectedTemplate(template)}
								>
									{template}
								</Button>
							))}
						</div>
					</div>
					<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
						<Link to="/app/cvs/$id/edit" params={{ id }} className="w-full sm:w-auto">
							<Button variant="outline" className="gap-2 w-full sm:w-auto">
								<ArrowLeft className="h-4 w-4" />
								<span className="hidden sm:inline">Back to editor</span>
								<span className="sm:hidden">Back</span>
							</Button>
						</Link>
						<Link to="/app/cvs/$id/export" params={{ id }} className="w-full sm:w-auto">
							<Button className="gap-2 w-full sm:w-auto">
								<Download className="h-4 w-4" />
								<span className="hidden sm:inline">Go to export</span>
								<span className="sm:hidden">Export</span>
							</Button>
						</Link>
					</div>
				</div>			<Card>
				<CardHeader>
					<CardTitle className="text-base md:text-lg">Preview</CardTitle>
					<CardDescription className="text-xs md:text-sm">
						A4 ratio preview; scroll if content overflows.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div
						className="rounded-lg border border-dashed bg-muted p-3 md:p-6 print:bg-white"
						style={{
							// Even wider preview for maximum text size in PDF
							width: "100%",
							maxWidth: 1200,
							aspectRatio: "8.5 / 11",
							overflow: "auto",
							margin: "0 auto",
						}}
					>
						<TemplateComponent cv={cv} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
