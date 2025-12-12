import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateCV } from "@/hooks/use-cvs";
import { useGenerateSummaryPreview } from "@/hooks/use-ai-optimization";

export const Route = createFileRoute("/app/cvs/new")({
	component: NewCVPage,
});

function NewCVPage() {
	const navigate = useNavigate();
	const [step, setStep] = useState(1);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Form data
	const [title, setTitle] = useState("");
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [location, setLocation] = useState("");
	const [summary, setSummary] = useState("");
	const [selectedSections, setSelectedSections] = useState<string[]>([
		"work_experience",
		"education",
		"skills",
		"projects",
	]);
	const [isSummarySheetOpen, setIsSummarySheetOpen] = useState(false);
	const [summaryAi, setSummaryAi] = useState<{
		original: string;
		generated: string;
	}>({ original: "", generated: "" });

	const { mutate: createCV, isPending } = useCreateCV();
	const generateSummaryPreview = useGenerateSummaryPreview();

	const buildSummaryPreviewPayload = () => ({
		cv_data: {
			general: {
				title,
				full_name: fullName,
				email,
				location,
				summary,
			},
			work_experiences: [],
			educations: [],
			skills: [],
			projects: [],
		},
		tone: "professional" as const,
	});

	const handleOpenSummaryAi = () => {
		setSummaryAi({
			original: summary || "No summary provided yet.",
			generated: "",
		});
		setIsSummarySheetOpen(true);
		generateSummaryPreview.mutate(buildSummaryPreviewPayload(), {
			onSuccess: (data) => {
				setSummaryAi((prev) => ({ ...prev, generated: data.summary }));
			},
		});
	};

	const handleApplySummaryAi = () => {
		if (summaryAi.generated) {
			setSummary(summaryAi.generated);
		}
		setIsSummarySheetOpen(false);
	};

	const handleRegenerateSummaryAi = () => {
		generateSummaryPreview.mutate(buildSummaryPreviewPayload(), {
			onSuccess: (data) => {
				setSummaryAi((prev) => ({ ...prev, generated: data.summary }));
			},
		});
	};

	const validateStep1 = () => {
		const newErrors: Record<string, string> = {};

		if (!title) newErrors.title = "CV title is required";
		if (!fullName) newErrors.fullName = "Full name is required";
		if (!email) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = "Please enter a valid email";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		if (step === 1 && !validateStep1()) return;
		setStep(step + 1);
	};

	const handleBack = () => {
		setStep(step - 1);
	};

	const handleSubmit = () => {
		// We currently only persist base CV fields; section choices inform the editor onboarding
		createCV(
			{
				title,
				full_name: fullName,
				email,
				phone: phone || undefined,
				location: location || undefined,
				summary: summary || undefined,
			},
			{
				onSuccess: (data) => {
					// Store initial section preference as a hint for editor onboarding
					if (selectedSections.length) {
						localStorage.setItem(
							`cv_sections_${data.id}`,
							JSON.stringify(selectedSections),
						);
					}
					navigate({
						to: "/app/cvs/$id/edit",
						params: { id: data.id.toString() },
					});
				},
			},
		);
	};

	const toggleSection = (key: string) => {
		setSelectedSections((prev) =>
			prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
		);
	};

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm text-muted-foreground uppercase tracking-wide">
					Create New CV
				</p>
				<h1 className="text-3xl font-bold">
					{step === 1
						? "Basic Information"
						: step === 2
							? "Professional Summary"
							: "Review & Create"}
				</h1>
				<p className="text-muted-foreground mt-1">Step {step} of 3</p>
			</div>

			{/* Progress bar */}
			<div className="flex gap-2 max-w-md">
				{[1, 2, 3].map((s) => (
					<div
						key={s}
						className={`h-2 flex-1 rounded-full ${
							s <= step ? "bg-primary" : "bg-muted"
						}`}
					/>
				))}
			</div>

			<Card className="max-w-4xl">
				<CardHeader>
					<CardTitle>
						{step === 1 && "Who are you?"}
						{step === 2 && "Tell us about yourself"}
						{step === 3 && "Ready to create your CV?"}
					</CardTitle>
					<CardDescription>
						{step === 1 && "Enter your basic contact information"}
						{step === 2 && "Write a brief professional summary (2-3 sentences)"}
						{step === 3 && "Review your information and create your CV"}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{step === 1 && (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title">
									CV Title <span className="text-destructive">*</span>
								</Label>
								<Input
									id="title"
									placeholder="e.g., Software Engineer Resume"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className={errors.title ? "border-destructive" : ""}
								/>
								{errors.title && (
									<p className="text-sm text-destructive">{errors.title}</p>
								)}
								<p className="text-xs text-muted-foreground">
									Give this CV a descriptive name to help you identify it later
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="fullName">
									Full Name <span className="text-destructive">*</span>
								</Label>
								<Input
									id="fullName"
									placeholder="John Doe"
									value={fullName}
									onChange={(e) => setFullName(e.target.value)}
									className={errors.fullName ? "border-destructive" : ""}
								/>
								{errors.fullName && (
									<p className="text-sm text-destructive">{errors.fullName}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">
									Email <span className="text-destructive">*</span>
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className={errors.email ? "border-destructive" : ""}
								/>
								{errors.email && (
									<p className="text-sm text-destructive">{errors.email}</p>
								)}
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="phone">Phone</Label>
									<Input
										id="phone"
										type="tel"
										placeholder="+1-555-0000"
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="location">Location</Label>
									<Input
										id="location"
										placeholder="San Francisco, CA"
										value={location}
										onChange={(e) => setLocation(e.target.value)}
									/>
								</div>
							</div>
						</div>
					)}

					{step === 2 && (
						<div className="space-y-4">
							<div className="space-y-2">
								<div className="flex items-center justify-between gap-2">
									<Label htmlFor="summary">Professional Summary</Label>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="gap-2"
										onClick={handleOpenSummaryAi}
										disabled={generateSummaryPreview.isPending}
									>
										<Sparkles className="h-4 w-4" />
										Generate with AI
									</Button>
								</div>
								<Textarea
									id="summary"
									placeholder="Experienced software engineer with 5+ years building scalable web applications..."
									value={summary}
									onChange={(e) => setSummary(e.target.value)}
									rows={6}
									className="resize-none"
								/>
								<div className="flex items-center justify-between text-xs text-muted-foreground">
									<span>Tip: Focus on your impact, stack, and outcomes.</span>
									<button
										type="button"
										className="text-primary underline underline-offset-4"
										onClick={() => setSummary("")}
									>
										Skip for now
									</button>
								</div>
							</div>
						</div>
					)}

					{step === 3 && (
						<div className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div className="rounded-lg border p-4 space-y-3">
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											CV Title
										</p>
										<p className="text-lg font-semibold">{title}</p>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Name
										</p>
										<p>{fullName}</p>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Contact
										</p>
										<p>{email}</p>
										{phone && <p>{phone}</p>}
										{location && <p>{location}</p>}
									</div>
									{summary && (
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Summary
											</p>
											<p className="text-sm">{summary}</p>
										</div>
									)}
								</div>

								<div className="rounded-lg border p-4 space-y-3">
									<p className="text-sm font-medium">
										Choose sections to start with
									</p>
									<div className="grid gap-2">
										{[
											{
												key: "work_experience",
												label: "Work Experience",
												note: "Recommended",
											},
											{
												key: "education",
												label: "Education",
												note: "Recommended",
											},
											{ key: "skills", label: "Skills", note: "Optional" },
											{ key: "projects", label: "Projects", note: "Optional" },
										].map((section) => (
											<label
												key={section.key}
												className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
													selectedSections.includes(section.key)
														? "bg-primary/5 border-primary/40"
														: ""
												}`}
											>
												<div className="flex items-center gap-3">
													<input
														type="checkbox"
														checked={selectedSections.includes(section.key)}
														onChange={() => toggleSection(section.key)}
														className="h-4 w-4"
													/>
													<span className="text-sm">{section.label}</span>
												</div>
												<span className="text-xs text-muted-foreground">
													{section.note}
												</span>
											</label>
										))}
									</div>
									<p className="text-xs text-muted-foreground">
										You can add/remove sections later in the editor.
									</p>
								</div>
							</div>

							<p className="text-sm text-muted-foreground">
								After creating your CV, you'll be able to add work experience,
								education, skills, and projects.
							</p>
						</div>
					)}

					<div className="flex justify-between pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={
								step === 1
									? () => navigate({ to: "/app/dashboard" })
									: handleBack
							}
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							{step === 1 ? "Cancel" : "Back"}
						</Button>

						{step < 3 ? (
							<Button type="button" onClick={handleNext}>
								Next
								<ArrowRight className="h-4 w-4 ml-2" />
							</Button>
						) : (
							<Button type="button" onClick={handleSubmit} disabled={isPending}>
								{isPending ? "Creating..." : "Create CV & Start Editing"}
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			<BottomSheet
				open={isSummarySheetOpen}
				onOpenChange={(open) => {
					if (!open) {
						setIsSummarySheetOpen(false);
					}
				}}
				title="AI Summary"
				description="Generate a professional summary using your current details."
				footer={
					<>
						<Button
							variant="outline"
							onClick={handleRegenerateSummaryAi}
							disabled={generateSummaryPreview.isPending}
							className="flex-1"
						>
							Regenerate
						</Button>
						<Button
							onClick={handleApplySummaryAi}
							disabled={generateSummaryPreview.isPending}
							className="flex-1"
						>
							Apply
						</Button>
					</>
				}
			>
				<div className="space-y-6">
					<div>
						<Label className="text-sm font-medium mb-2 block">Original</Label>
						<div className="rounded-md bg-muted p-3 text-sm">
							{summaryAi.original || "No summary provided"}
						</div>
					</div>

					<div>
						<Label className="text-sm font-medium mb-2 block">
							AI Generated
						</Label>
						{generateSummaryPreview.isPending ? (
							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-5/6" />
								<Skeleton className="h-4 w-3/4" />
								<p className="text-xs text-muted-foreground mt-2">
									Generating summary…
								</p>
							</div>
						) : generateSummaryPreview.isError ? (
							<div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm">
								<p className="text-destructive font-medium mb-2">
									Failed to generate
								</p>
								<p className="text-muted-foreground text-xs">
									{generateSummaryPreview.error?.message ||
										"Please check that the AI service is configured."}
								</p>
							</div>
						) : (
							<Textarea
								value={summaryAi.generated}
								onChange={(e) =>
									setSummaryAi((prev) => ({
										...prev,
										generated: e.target.value,
									}))
								}
								rows={10}
								className="resize-none"
								placeholder="AI-generated summary will appear here..."
							/>
						)}
					</div>
				</div>
			</BottomSheet>
		</div>
	);
}
