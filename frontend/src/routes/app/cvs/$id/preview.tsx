import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@/components/animate-ui/components/radix/toggle-group";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { ClassicTemplate, MinimalTemplate, ModernTemplate } from "@/templates";

export const Route = createFileRoute("/app/cvs/$id/preview")({
	component: CVPreviewPlaceholder,
});

function CVPreviewPlaceholder() {
	const { id } = Route.useParams();
	const cvId = Number(id);
	const { data: cv, isLoading } = useCV(cvId);
	const isMobile = useIsMobile();
	const [selectedTemplate, setSelectedTemplate] = useState<
		"classic" | "modern" | "minimal"
	>("classic");

	useEffect(() => {
		const stored = localStorage.getItem(`cv_template_${cvId}`);
		if (stored === "modern" || stored === "minimal" || stored === "classic") {
			setSelectedTemplate(stored);
		}
	}, [cvId]);

	useEffect(() => {
		localStorage.setItem(`cv_template_${cvId}`, selectedTemplate);
	}, [cvId, selectedTemplate]);

	const TemplateComponent = useMemo(() => {
		switch (selectedTemplate) {
			case "modern":
				return ModernTemplate;
			case "minimal":
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
			{/* Header - Mobile Responsive */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex-1 min-w-0">
					<p className="text-sm text-muted-foreground uppercase tracking-wide">
						Preview
					</p>
					<h1 className="text-2xl sm:text-3xl font-bold truncate">
						{cv.title}
					</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						Choose a template and preview your CV
					</p>

					{/* Template Toggle Group */}
					<div className="mt-4">
						<ToggleGroup
							type="single"
							value={selectedTemplate}
							onValueChange={(value) => {
								if (value) {
									setSelectedTemplate(value as typeof selectedTemplate);
								}
							}}
							variant="outline"
							size={isMobile ? "default" : "default"}
						>
							<ToggleGroupItem value="classic">Classic</ToggleGroupItem>
							<ToggleGroupItem value="modern">Modern</ToggleGroupItem>
							<ToggleGroupItem value="minimal">Minimal</ToggleGroupItem>
						</ToggleGroup>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-2 flex-wrap sm:flex-nowrap">
					<Link to="/app/cvs/$id/edit" params={{ id }}>
						<Button
							variant="outline"
							size={isMobile ? "sm" : "default"}
							className="gap-2"
						>
							<ArrowLeft className="h-4 w-4" />
							{!isMobile && "Back to editor"}
						</Button>
					</Link>
					<Link to="/app/cvs/$id/export" params={{ id }}>
						<Button size={isMobile ? "sm" : "default"} className="gap-2">
							<Download className="h-4 w-4" />
							{!isMobile && "Go to export"}
						</Button>
					</Link>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Preview</CardTitle>
					<CardDescription>
						A4 ratio preview; scroll if content overflows.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div
						className="rounded-lg border border-dashed bg-muted p-6 print:bg-white"
						style={{
							// Even wider preview for maximum text size in PDF
							width: 1200,
							maxWidth: "100%",
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
