import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Download,
	HelpCircle,
	Languages,
	Sparkles,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useScoreCv } from "@/hooks/use-ai-optimization";
import { useCV } from "@/hooks/use-cvs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslateCv } from "@/hooks/use-translation";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/animate-ui/components/animate/tooltip";
import { ClassicTemplate, MinimalTemplate, ModernTemplate } from "@/templates";

const scoreColor = (score: number) => {
	if (score <= 3) return "#ef4444"; // red
	if (score <= 7) return "#f97316"; // orange
	return "#22c55e"; // green
};

function CircleScore({ score }: { score: number }) {
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
}

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
	const [sheetMode, setSheetMode] = useState<"ai" | "translate">("ai");
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [sourceLanguage, setSourceLanguage] = useState("en");
	const [targetLanguage, setTargetLanguage] = useState("es");
	const scoreMutation = useScoreCv();
	const translateMutation = useTranslateCv();
	const sourceLanguageOptions = [
		{ label: "English", value: "en" },
		{ label: "Spanish", value: "es" },
		{ label: "French", value: "fr" },
		{ label: "German", value: "de" },
		{ label: "Italian", value: "it" },
	];
	const targetLanguageOptions = [
		{ label: "Spanish", value: "es", disabled: false },
		{ label: "English", value: "en", disabled: false },
		{ label: "French", value: "fr", disabled: false },
		{ label: "German", value: "de", disabled: false },
		{ label: "Italian", value: "it", disabled: false },
	];
	const translationSupportCopy =
		"Supports English, Spanish, French, German, and Italian.";

	const parsedRawScores = useMemo(() => {
		const raw = scoreMutation.data?.raw;
		if (!raw) return null;
		try {
			const parsed = JSON.parse(raw);
			return parsed;
		} catch (_e) {
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

	const isSameLanguage = sourceLanguage === targetLanguage;
	const sourceLanguageId = useId();
	const targetLanguageId = useId();

	const handleOpenAiSheet = () => {
		setSheetMode("ai");
		setIsSheetOpen(true);
		if (cv && !scoreMutation.data && !scoreMutation.isPending) {
			scoreMutation.mutate({ cv_id: cv.id });
		}
	};

	const handleOpenTranslateSheet = () => {
		translateMutation.reset();
		setSheetMode("translate");
		setIsSheetOpen(true);
	};

	const handleTranslate = () => {
		if (!cv || translateMutation.isPending) return;
		translateMutation.mutate({
			cv,
			inputLanguage: sourceLanguage,
			outputLanguage: targetLanguage,
		});
	};

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
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
				<div className="grid grid-cols-2 gap-2 w-full sm:grid-cols-[auto_auto] sm:auto-rows-auto sm:items-start sm:justify-start sm:w-auto lg:flex lg:flex-wrap lg:justify-end lg:gap-3 lg:w-auto lg:flex-shrink-0">
					<Link
						to="/app/cvs/$id/edit"
						params={{ id }}
						className="col-span-2 sm:col-auto sm:w-auto"
					>
						<Button
							variant="outline"
							size={isMobile ? "sm" : "default"}
							className="gap-2 w-full sm:w-auto"
						>
							<ArrowLeft className="h-4 w-4" />
							{!isMobile && "Back to editor"}
						</Button>
					</Link>
					<Button
						variant="secondary"
						size={isMobile ? "sm" : "default"}
						className="gap-2 w-full sm:w-auto"
						onClick={handleOpenAiSheet}
					>
						<Sparkles className="h-4 w-4" />
						{!isMobile && "Review with AI"}
					</Button>
					<Button
						variant="outline"
						size={isMobile ? "sm" : "default"}
						className="gap-2 w-full sm:w-auto"
						onClick={handleOpenTranslateSheet}
					>
						<Languages className="h-4 w-4" />
						{!isMobile && "Translate"}
					</Button>
					<Link
						to="/app/cvs/$id/export"
						params={{ id }}
						className="col-span-2 sm:col-auto sm:w-auto"
					>
						<Button
							size={isMobile ? "sm" : "default"}
							className="gap-2 w-full sm:w-auto"
						>
							<Download className="h-4 w-4" />
							{!isMobile && "Go to export"}
						</Button>
					</Link>
				</div>
			</div>

			<Card className="w-full">
				<CardHeader className="pb-4 sm:pb-6">
					<CardTitle className="text-base md:text-lg">Preview</CardTitle>
					<CardDescription className="text-xs md:text-sm">
						A4 ratio preview; scroll if content overflows.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex justify-center">
					<div className="w-full max-w-screen-lg sm:max-w-screen-xl mx-auto rounded-lg border border-dashed bg-muted p-3 sm:p-6 print:bg-white aspect-[8.5/11] overflow-auto shadow-sm">
						<TemplateComponent cv={cv} />
					</div>
				</CardContent>
			</Card>

			<BottomSheet
				open={isSheetOpen}
				onOpenChange={setIsSheetOpen}
				title={sheetMode === "ai" ? "AI Optimization" : "Translate CV"}
				description={
					sheetMode === "ai"
						? "Preview AI-powered review for this CV."
						: `Select the current and target languages to translate this CV.`
				}
				footer={
					sheetMode === "ai" ? (
						<div className="flex gap-2">
							<Button
								variant="outline"
								className="flex-1"
								onClick={() => setIsSheetOpen(false)}
							>
								Close
							</Button>
						</div>
					) : (
						<div className="flex gap-2">
							<Button
								variant="outline"
								className="flex-1"
								onClick={() => setIsSheetOpen(false)}
								disabled={translateMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								className="flex-1"
								onClick={handleTranslate}
								disabled={!cv || translateMutation.isPending || isSameLanguage}
							>
								{translateMutation.isPending ? "Translating…" : "Translate"}
							</Button>
						</div>
					)
				}
			>
				{sheetMode === "ai" ? (
					<div className="space-y-4">
						<div className="space-y-2">
							<p className="text-sm font-medium">AI Review</p>
							{scoreMutation.isPending && (
								<p className="text-sm text-muted-foreground">
									Scoring your CV…
								</p>
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
													<CircleScore score={value?.score ?? 0} />
													<div className="flex-1">
														<p className="font-medium">{label}</p>
														<p className="text-sm text-muted-foreground">
															{value?.reason ?? ""}
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
					</div>
				) : (
					<div className="space-y-4">
						<div className="grid gap-3 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor={sourceLanguageId}>Current language</Label>
								<Select
									value={sourceLanguage}
									onValueChange={(value) => setSourceLanguage(value)}
								>
									<SelectTrigger id={sourceLanguageId} className="w-full">
										<SelectValue placeholder="Select language" />
									</SelectTrigger>
									<SelectContent>
										{sourceLanguageOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Label htmlFor={targetLanguageId} className="mb-0">
										Target language
									</Label>
									<TooltipProvider openDelay={0}>
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													aria-label="Translation support details"
													className="text-muted-foreground hover:text-foreground transition-colors"
												>
													<HelpCircle className="h-4 w-4" />
												</button>
											</TooltipTrigger>
											<TooltipContent>{translationSupportCopy}</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
								<Select
									value={targetLanguage}
									onValueChange={(value) => {
										setTargetLanguage(value);
									}}
								>
									<SelectTrigger id={targetLanguageId} className="w-full">
										<SelectValue placeholder="Select target language" />
									</SelectTrigger>
									<SelectContent>
										{targetLanguageOptions.map((option) => (
											<SelectItem
												key={option.value}
												value={option.value}
												disabled={option.disabled}
											>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						{isSameLanguage && (
							<p className="text-xs text-destructive">
								Choose a different target language to translate.
							</p>
						)}
						{translateMutation.isPending && (
							<p className="text-sm text-muted-foreground">
								Translating CV and saving changes…
							</p>
						)}
						{translateMutation.isError && (
							<p className="text-sm text-destructive">
								Failed to translate CV. {translateMutation.error.message}
							</p>
						)}
						{translateMutation.isSuccess && !translateMutation.isPending && (
							<div className="rounded-md border bg-muted/50 p-3 text-sm">
								CV translated to{" "}
								{targetLanguageOptions.find(
									(option) => option.value === targetLanguage,
								)?.label || targetLanguage}
								. Preview refreshed.
							</div>
						)}
					</div>
				)}
			</BottomSheet>
		</div>
	);
}
