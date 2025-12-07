import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@/components/animate-ui/components/radix/toggle-group";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGenerateSummary, useScoreCv } from "@/hooks/use-ai-optimization";
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
	const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);
	const scoreMutation = useScoreCv();
	const summaryMutation = useGenerateSummary();

	const parsedRawScores = useMemo(() => {
		const raw = scoreMutation.data?.raw;
		if (!raw) return null;
		try {
			const parsed = JSON.parse(raw);
			return parsed;
		} catch (e) {
			return null;
		}
	}, [scoreMutation.data?.raw]);

	const metricEntries = useMemo(() => {
		if (!scoreMutation.data) return [];
		const fromParsed = parsedRawScores;
		return (
			[
				{
					label: "Impact / Achievement Density",
					value:
						scoreMutation.data.impact_achievement_density ||
						fromParsed?.impact_achievement_density,
				},
				{
					label: "Clarity & Readability",
					value:
						scoreMutation.data.clarity_readability ||
						fromParsed?.clarity_readability,
				},
				{
					label: "Action Verb Strength",
					value:
						scoreMutation.data.action_verb_strength ||
						fromParsed?.action_verb_strength,
				},
				{
					label: "Professionalism",
					value:
						scoreMutation.data.professionalism || fromParsed?.professionalism,
				},
			] as const
		).filter((m) => m.value);
	}, [parsedRawScores, scoreMutation.data]);

	const scoreColor = (score: number) => {
		if (score <= 3) return "#ef4444"; // red
		if (score <= 7) return "#f97316"; // orange
		return "#22c55e"; // green
	};

	const CircleScore = ({ score }: { score: number }) => {
		const radius = 25;
		const circumference = 2 * Math.PI * radius;
		const offset = circumference - (score / 10) * circumference;
		const color = scoreColor(score);
		return (
			<div className="relative h-14 w-14">
				<svg
					viewBox="0 0 60 60"
					className="h-full w-full"
					role="img"
					aria-label={`Score ${score}/10`}
				>
					<circle
						cx="30"
						cy="30"
						r={radius}
						fill="none"
						stroke="#e5e7eb"
						strokeWidth="6"
					/>
					<circle
						cx="30"
						cy="30"
						r={radius}
						fill="none"
						stroke={color}
						strokeWidth="6"
						strokeDasharray={circumference}
						strokeDashoffset={offset}
						strokeLinecap="round"
						transform="rotate(-90 30 30)"
					/>
				</svg>
				<div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
					{score}/10
				</div>
			</div>
		);
	};

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
					<Button
						variant="secondary"
						size={isMobile ? "sm" : "default"}
						className="gap-2"
						onClick={() => {
							setIsAiSheetOpen(true);
							if (cv && !scoreMutation.data && !scoreMutation.isPending) {
								scoreMutation.mutate({ cv_id: cv.id });
							}
						}}
					>
						<Sparkles className="h-4 w-4" />
						{!isMobile && "Review with AI"}
					</Button>
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

			<BottomSheet
				open={isAiSheetOpen}
				onOpenChange={setIsAiSheetOpen}
				title="AI Optimization"
				description="Preview AI-powered review and summary for this CV."
				footer={
					<div className="flex gap-2">
						<Button
							variant="outline"
							className="flex-1"
							onClick={() => setIsAiSheetOpen(false)}
						>
							Close
						</Button>
						<Button
							className="flex-1"
							variant="secondary"
							onClick={() => {
								if (cv) {
									summaryMutation.mutate({ cv_id: cv.id });
								}
							}}
							disabled={summaryMutation.isPending}
						>
							{summaryMutation.isPending ? "Generating…" : "Generate summary"}
						</Button>
					</div>
				}
			>
				<div className="space-y-4">
					<div className="space-y-2">
						<p className="text-sm font-medium">AI Review</p>
						{scoreMutation.isPending && (
							<p className="text-sm text-muted-foreground">Scoring your CV…</p>
						)}
						{scoreMutation.isError && (
							<p className="text-sm text-destructive">
								Failed to score CV. {scoreMutation.error.message}
							</p>
						)}
						{scoreMutation.data && (
							<div className="space-y-2 rounded-md border p-3 bg-muted/50">
								{scoreMutation.data.raw && metricEntries.length === 0 && (
									<p className="text-sm whitespace-pre-line">
										{scoreMutation.data.raw}
									</p>
								)}
								{metricEntries.length > 0 && (
									<div className="space-y-3">
										{metricEntries.map(({ label, value }) => (
											<div
												key={label}
												className="flex items-start gap-3 rounded-md bg-white/70 p-3"
											>
												<CircleScore score={value!.score} />
												<div className="flex-1">
													<p className="font-medium">{label}</p>
													<p className="text-sm text-muted-foreground">
														{value!.reason}
													</p>
												</div>
											</div>
										))}
									</div>
								)}
								{(scoreMutation.data.summary_insight ||
									parsedRawScores?.summary_insight) && (
									<div className="pt-2 text-sm">
										<p className="font-medium">Summary insight</p>
										<p className="text-muted-foreground">
											{scoreMutation.data.summary_insight ||
												parsedRawScores?.summary_insight}
										</p>
									</div>
								)}
							</div>
						)}
					</div>

					<div className="space-y-2">
						<p className="text-sm font-medium">Professional summary</p>
						{summaryMutation.isPending && (
							<p className="text-sm text-muted-foreground">
								Generating summary…
							</p>
						)}
						{summaryMutation.isError && (
							<p className="text-sm text-destructive">
								Failed to generate summary. {summaryMutation.error.message}
							</p>
						)}
						{summaryMutation.data && (
							<div className="rounded-md border p-3 text-sm bg-muted/50">
								{summaryMutation.data.summary}
							</div>
						)}
					</div>
				</div>
			</BottomSheet>
		</div>
	);
}
