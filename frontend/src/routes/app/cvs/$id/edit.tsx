import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ChevronDown,
	ChevronRight,
	Download,
	Edit,
	Eye,
	Plus,
	Sparkles,
	Trash,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EducationForm } from "@/components/cv/education-form";
import { ProjectForm } from "@/components/cv/project-form";
import { SkillForm } from "@/components/cv/skill-form";
import { WorkExperienceForm } from "@/components/cv/work-experience-form";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
	useGenerateSummaryPreview,
	useOptimizeDescription,
} from "@/hooks/use-ai-optimization";
import {
	useEducationMutations,
	useProjectMutations,
	useSkillMutations,
	useWorkExperienceMutations,
} from "@/hooks/use-cv-sections";
import { useCV, useUpdateCV } from "@/hooks/use-cvs";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/app/cvs/$id/edit")({
	component: CVEditor,
});

type SectionType = "work" | "education" | "skills" | "projects";

function CVEditor() {
	const { id } = Route.useParams();
	const cvId = Number(id);
	const { data: cv, isLoading } = useCV(cvId);
	const { mutate: updateCV, isPending: isSaving } = useUpdateCV();
	const isMobile = useIsMobile();

	const workMutations = useWorkExperienceMutations(cvId);
	const educationMutations = useEducationMutations(cvId);
	const skillMutations = useSkillMutations(cvId);
	const projectMutations = useProjectMutations(cvId);
	const optimizeMutation = useOptimizeDescription();
	const generateSummaryPreview = useGenerateSummaryPreview();

	// Personal info form state
	const [form, setForm] = useState({
		title: "",
		full_name: "",
		email: "",
		phone: "",
		location: "",
		summary: "",
	});

	// UI state
	const [autoSaveStatus, setAutoSaveStatus] = useState<
		"idle" | "saving" | "saved"
	>("idle");
	const [expandedSection, setExpandedSection] = useState<SectionType | null>(
		null,
	);
	const [activeSheet, setActiveSheet] = useState<{
		type: "add" | "edit" | "ai";
		section: SectionType | null;
		data?: any;
	}>({ type: "add", section: null });

	// AI optimization state
	const [aiOptimization, setAiOptimization] = useState<{
		original: string;
		optimized: string;
		itemId: number;
		section: SectionType;
	} | null>(null);
	const [summarySheetOpen, setSummarySheetOpen] = useState(false);
	const [summaryAi, setSummaryAi] = useState<{ original: string; generated: string }>(
		{ original: "", generated: "" },
	);

	// Load CV data
	useEffect(() => {
		if (cv) {
			setForm({
				title: cv.title,
				full_name: cv.full_name,
				email: cv.email,
				phone: cv.phone ?? "",
				location: cv.location ?? "",
				summary: cv.summary ?? "",
			});
		}
	}, [cv]);

	const isDirty = useMemo(() => {
		if (!cv) return false;
		return (
			form.title !== cv.title ||
			form.full_name !== cv.full_name ||
			form.email !== cv.email ||
			(form.phone ?? "") !== (cv.phone ?? "") ||
			(form.location ?? "") !== (cv.location ?? "") ||
			(form.summary ?? "") !== (cv.summary ?? "")
		);
	}, [cv, form]);

	const handleChange =
		(key: keyof typeof form) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			setForm((prev) => ({ ...prev, [key]: e.target.value }));
		};

	const handleSave = () => {
		if (!cv) return;
		setAutoSaveStatus("saving");
		updateCV(
			{
				id: cv.id,
				data: {
					title: form.title,
					full_name: form.full_name,
					email: form.email,
					phone: form.phone || undefined,
					location: form.location || undefined,
					summary: form.summary || undefined,
				},
			},
			{
				onSuccess: () => {
					setAutoSaveStatus("saved");
					setTimeout(() => setAutoSaveStatus("idle"), 1500);
				},
				onError: () => {
					setAutoSaveStatus("idle");
				},
			},
		);
	};

	const handleOptimizeWorkExperience = (item: any) => {
		const startDate = item.start_date ? new Date(item.start_date) : null;
		const endDate = item.end_date ? new Date(item.end_date) : new Date();
		const years =
			startDate && endDate
				? Math.round(
						((endDate.getTime() - startDate.getTime()) /
							(1000 * 60 * 60 * 24 * 365)) *
							10,
					) / 10
				: 0;
		const duration = years > 0 ? `${years} years` : "Less than 1 year";

		setAiOptimization({
			original: item.description || "",
			optimized: "",
			itemId: item.id,
			section: "work",
		});

		optimizeMutation.mutate(
			{
				original_text: item.description || "No description provided",
				field_type: "work_experience",
				context: {
					position: item.position,
					company: item.company,
					duration,
				},
			},
			{
				onSuccess: (data) => {
					setAiOptimization((prev) =>
						prev ? { ...prev, optimized: data.optimized } : null,
					);
				},
			},
		);
	};

	const handleApplyAiOptimization = () => {
		if (!aiOptimization || !cv) return;

		const item = cv.work_experiences?.find(
			(w) => w.id === aiOptimization.itemId,
		);
		if (!item) return;

		workMutations.update.mutate(
			{
				id: item.id,
				data: {
					company: item.company,
					position: item.position,
					location: item.location || undefined,
					start_date: item.start_date || undefined,
					end_date: item.end_date || undefined,
					description: aiOptimization.optimized,
				},
			},
			{
				onSuccess: () => {
					setAiOptimization(null);
				},
			},
		);
	};

	const handleRegenerateAi = () => {
		if (!aiOptimization || !cv) return;

		const item = cv.work_experiences?.find(
			(w) => w.id === aiOptimization.itemId,
		);
		if (!item) return;

		handleOptimizeWorkExperience(item);
	};

	const buildSummaryPreviewPayload = () => ({
		cv_data: {
			general: {
				title: form.title,
				full_name: form.full_name,
				email: form.email,
				location: form.location,
				summary: form.summary,
			},
			work_experiences: cv?.work_experiences?.map((exp) => ({
				position: exp.position,
				company: exp.company,
				description: exp.description,
			})),
			educations: cv?.educations?.map((edu) => ({
				degree: edu.degree,
				institution: edu.institution,
				field_of_study: edu.field_of_study,
			})),
			skills: cv?.skills?.map((skill) => ({ name: skill.name })),
		},
		tone: "professional" as const,
	});

	const handleOpenSummaryAi = () => {
		setSummaryAi({
			original: form.summary || "No summary provided.",
			generated: "",
		});
		setSummarySheetOpen(true);
		generateSummaryPreview.mutate(buildSummaryPreviewPayload(), {
			onSuccess: (data) => {
				setSummaryAi((prev) => ({ ...prev, generated: data.summary }));
			},
		});
	};

	const handleApplySummaryAi = () => {
		if (summaryAi.generated) {
			setForm((prev) => ({ ...prev, summary: summaryAi.generated }));
		}
		setSummarySheetOpen(false);
	};

	const handleRegenerateSummaryAi = () => {
		generateSummaryPreview.mutate(buildSummaryPreviewPayload(), {
			onSuccess: (data) => {
				setSummaryAi((prev) => ({ ...prev, generated: data.summary }));
			},
		});
	};

	if (isLoading || !cv) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-64" />
				<div className="grid gap-4">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-48 w-full" />
					))}
				</div>
			</div>
		);
	}

	const sections = [
		{
			id: "work" as const,
			title: "Work Experience",
			description: "Add your professional experience",
			count: cv.work_experiences?.length || 0,
			items: cv.work_experiences || [],
		},
		{
			id: "education" as const,
			title: "Education",
			description: "Add your educational background",
			count: cv.educations?.length || 0,
			items: cv.educations || [],
		},
		{
			id: "skills" as const,
			title: "Skills",
			description: "List your technical and soft skills",
			count: cv.skills?.length || 0,
			items: cv.skills || [],
		},
		{
			id: "projects" as const,
			title: "Projects",
			description: "Showcase your key projects",
			count: cv.projects?.length || 0,
			items: cv.projects || [],
		},
	];

	return (
		<div className="space-y-6 pb-24">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="min-w-0 flex-1">
					<p className="text-sm text-muted-foreground uppercase tracking-wide">
						CV Editor
					</p>
					<h1 className="text-2xl sm:text-3xl font-bold truncate">
						{cv.title}
					</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						Edit your information and manage your CV sections
					</p>
				</div>
				<div className="flex gap-2 flex-wrap sm:flex-nowrap">
					<Link to="/app/cvs/$id/preview" params={{ id: cv.id.toString() }}>
						<Button variant="outline" size="sm" className="gap-2">
							<Eye className="h-4 w-4" />
							{!isMobile && "Preview"}
						</Button>
					</Link>
					<Link to="/app/cvs/$id/export" params={{ id: cv.id.toString() }}>
						<Button variant="outline" size="sm" className="gap-2">
							<Download className="h-4 w-4" />
							{!isMobile && "Export"}
						</Button>
					</Link>
					<Button
						onClick={handleSave}
						disabled={!isDirty || isSaving}
						size="sm"
						className="gap-2"
					>
						{isSaving || autoSaveStatus === "saving"
							? "Saving…"
							: isDirty
								? "Save"
								: autoSaveStatus === "saved"
									? "Saved"
									: "Saved"}
					</Button>
				</div>
			</div>

			{/* Personal Information */}
			<Card>
				<CardHeader>
					<CardTitle>Personal Information</CardTitle>
					<CardDescription>
						Update your personal details and professional summary
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="title">CV Title</Label>
							<Input
								id="title"
								value={form.title}
								onChange={handleChange("title")}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="full_name">Full Name</Label>
							<Input
								id="full_name"
								value={form.full_name}
								onChange={handleChange("full_name")}
							/>
						</div>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={form.email}
								onChange={handleChange("email")}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="phone">Phone</Label>
							<Input
								id="phone"
								value={form.phone}
								onChange={handleChange("phone")}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="location">Location</Label>
						<Input
							id="location"
							value={form.location}
							onChange={handleChange("location")}
						/>
					</div>
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
							rows={5}
							value={form.summary}
							onChange={handleChange("summary")}
							placeholder="Highlight your impact, stack, and focus areas."
						/>
					</div>
				</CardContent>
			</Card>

			{/* CV Sections - Mobile: Collapsible, Desktop: Cards */}
			<div className="space-y-3">
				{sections.map((section) => (
					<div key={section.id}>
						{/* Mobile: Collapsible Section */}
						{isMobile ? (
							<Card className="overflow-hidden">
								<button
									type="button"
									onClick={() =>
										setExpandedSection(
											expandedSection === section.id ? null : section.id,
										)
									}
									className="w-full text-left"
								>
									<CardHeader className="flex-row items-center justify-between py-4">
										<div className="flex-1">
											<CardTitle className="text-base flex items-center gap-2">
												{section.title}
												{section.count > 0 && (
													<span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
														{section.count}
													</span>
												)}
											</CardTitle>
										</div>
										{expandedSection === section.id ? (
											<ChevronDown className="h-5 w-5 text-muted-foreground" />
										) : (
											<ChevronRight className="h-5 w-5 text-muted-foreground" />
										)}
									</CardHeader>
								</button>

								{expandedSection === section.id && (
									<CardContent className="pt-0 pb-4 space-y-3">
										{section.items.length === 0 ? (
											<div className="text-center py-8">
												<p className="text-sm text-muted-foreground mb-4">
													No {section.title.toLowerCase()} added yet
												</p>
												<Button
													size="sm"
													onClick={() =>
														setActiveSheet({ type: "add", section: section.id })
													}
												>
													<Plus className="h-4 w-4 mr-2" />
													Add {section.title}
												</Button>
											</div>
										) : (
											<>
												{section.id === "work" &&
													cv.work_experiences?.map((item) => (
														<div
															key={item.id}
															className="rounded-lg border p-3 space-y-2"
														>
															<div className="flex items-start justify-between gap-2">
																<div className="flex-1 min-w-0">
																	<div className="font-medium text-sm">
																		{item.position}
																	</div>
																	<div className="text-xs text-muted-foreground">
																		{item.company}
																	</div>
																	<div className="text-xs text-muted-foreground">
																		{item.start_date} -{" "}
																		{item.end_date || "Present"}
																	</div>
																</div>
																<div className="flex gap-1 shrink-0">
																	<Button
																		size="icon-sm"
																		variant="ghost"
																		onClick={() =>
																			setActiveSheet({
																				type: "edit",
																				section: "work",
																				data: item,
																			})
																		}
																	>
																		<Edit className="h-4 w-4" />
																	</Button>
																	<Button
																		size="icon-sm"
																		variant="ghost"
																		onClick={() =>
																			handleOptimizeWorkExperience(item)
																		}
																		disabled={!item.description}
																	>
																		<Sparkles className="h-4 w-4" />
																	</Button>
																	<Button
																		size="icon-sm"
																		variant="ghost"
																		onClick={() =>
																			workMutations.remove.mutate(item.id)
																		}
																	>
																		<Trash className="h-4 w-4 text-destructive" />
																	</Button>
																</div>
															</div>
															{item.description && (
																<p className="text-xs text-muted-foreground line-clamp-2">
																	{item.description}
																</p>
															)}
														</div>
													))}

												{section.id === "education" &&
													cv.educations?.map((item) => (
														<div
															key={item.id}
															className="rounded-lg border p-3 space-y-2"
														>
															<div className="flex items-start justify-between gap-2">
																<div className="flex-1 min-w-0">
																	<div className="font-medium text-sm">
																		{item.institution}
																	</div>
																	<div className="text-xs text-muted-foreground">
																		{item.degree}
																	</div>
																	<div className="text-xs text-muted-foreground">
																		{item.start_date} -{" "}
																		{item.end_date || "Present"}
																	</div>
																</div>
																<div className="flex gap-1 shrink-0">
																	<Button
																		size="icon-sm"
																		variant="ghost"
																		onClick={() =>
																			setActiveSheet({
																				type: "edit",
																				section: "education",
																				data: item,
																			})
																		}
																	>
																		<Edit className="h-4 w-4" />
																	</Button>
																	<Button
																		size="icon-sm"
																		variant="ghost"
																		onClick={() =>
																			educationMutations.remove.mutate(item.id)
																		}
																	>
																		<Trash className="h-4 w-4 text-destructive" />
																	</Button>
																</div>
															</div>
														</div>
													))}

												{section.id === "skills" &&
													cv.skills &&
													cv.skills.length > 0 && (
														<div className="flex flex-wrap gap-2">
															{cv.skills.map((item) => (
																<div
																	key={item.id}
																	className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
																>
																	<span>{item.name}</span>
																	<button
																		type="button"
																		onClick={() =>
																			skillMutations.remove.mutate(item.id)
																		}
																		className="text-muted-foreground hover:text-destructive"
																	>
																		×
																	</button>
																</div>
															))}
														</div>
													)}

												{section.id === "projects" &&
													cv.projects?.map((item) => (
														<div
															key={item.id}
															className="rounded-lg border p-3 space-y-2"
														>
															<div className="flex items-start justify-between gap-2">
																<div className="flex-1 min-w-0">
																	<div className="font-medium text-sm">
																		{item.name}
																	</div>
																	{item.technologies && (
																		<div className="text-xs text-muted-foreground">
																			{item.technologies}
																		</div>
																	)}
																</div>
																<div className="flex gap-1 shrink-0">
																	<Button
																		size="icon-sm"
																		variant="ghost"
																		onClick={() =>
																			setActiveSheet({
																				type: "edit",
																				section: "projects",
																				data: item,
																			})
																		}
																	>
																		<Edit className="h-4 w-4" />
																	</Button>
																	<Button
																		size="icon-sm"
																		variant="ghost"
																		onClick={() =>
																			projectMutations.remove.mutate(item.id)
																		}
																	>
																		<Trash className="h-4 w-4 text-destructive" />
																	</Button>
																</div>
															</div>
														</div>
													))}

												<Button
													variant="outline"
													size="sm"
													className="w-full"
													onClick={() =>
														setActiveSheet({ type: "add", section: section.id })
													}
												>
													<Plus className="h-4 w-4 mr-2" />
													Add {section.title}
												</Button>
											</>
										)}
									</CardContent>
								)}
							</Card>
						) : (
							/* Desktop: Card Layout */
							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle>{section.title}</CardTitle>
											<CardDescription>{section.description}</CardDescription>
										</div>
										<Button
											size="sm"
											onClick={() =>
												setActiveSheet({ type: "add", section: section.id })
											}
										>
											<Plus className="h-4 w-4 mr-2" />
											Add
										</Button>
									</div>
								</CardHeader>
								<CardContent>
									{section.items.length === 0 ? (
										<p className="text-sm text-muted-foreground text-center py-8">
											No {section.title.toLowerCase()} added yet
										</p>
									) : (
										<div className="space-y-3">
											{section.id === "work" &&
												cv.work_experiences?.map((item) => (
													<div
														key={item.id}
														className="rounded-lg border p-4 flex items-start justify-between gap-4"
													>
														<div className="flex-1 min-w-0">
															<div className="font-medium">{item.position}</div>
															<div className="text-sm text-muted-foreground">
																{item.company} · {item.start_date} -{" "}
																{item.end_date || "Present"}
															</div>
															{item.description && (
																<p className="text-sm text-muted-foreground mt-2 line-clamp-2">
																	{item.description}
																</p>
															)}
														</div>
														<div className="flex gap-2 shrink-0">
															<Button
																size="sm"
																variant="ghost"
																onClick={() =>
																	setActiveSheet({
																		type: "edit",
																		section: "work",
																		data: item,
																	})
																}
															>
																<Edit className="h-4 w-4" />
															</Button>
															<Button
																size="sm"
																variant="ghost"
																onClick={() =>
																	handleOptimizeWorkExperience(item)
																}
																disabled={!item.description}
															>
																<Sparkles className="h-4 w-4" />
															</Button>
															<Button
																size="sm"
																variant="ghost"
																onClick={() =>
																	workMutations.remove.mutate(item.id)
																}
															>
																<Trash className="h-4 w-4 text-destructive" />
															</Button>
														</div>
													</div>
												))}

											{section.id === "education" &&
												cv.educations?.map((item) => (
													<div
														key={item.id}
														className="rounded-lg border p-4 flex items-start justify-between gap-4"
													>
														<div className="flex-1 min-w-0">
															<div className="font-medium">
																{item.institution}
															</div>
															<div className="text-sm text-muted-foreground">
																{item.degree} · {item.start_date} -{" "}
																{item.end_date || "Present"}
															</div>
														</div>
														<div className="flex gap-2 shrink-0">
															<Button
																size="sm"
																variant="ghost"
																onClick={() =>
																	setActiveSheet({
																		type: "edit",
																		section: "education",
																		data: item,
																	})
																}
															>
																<Edit className="h-4 w-4" />
															</Button>
															<Button
																size="sm"
																variant="ghost"
																onClick={() =>
																	educationMutations.remove.mutate(item.id)
																}
															>
																<Trash className="h-4 w-4 text-destructive" />
															</Button>
														</div>
													</div>
												))}

											{section.id === "skills" &&
												cv.skills &&
												cv.skills.length > 0 && (
													<div className="flex flex-wrap gap-2">
														{cv.skills.map((item) => (
															<div
																key={item.id}
																className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
															>
																<span>{item.name}</span>
																<button
																	type="button"
																	onClick={() =>
																		skillMutations.remove.mutate(item.id)
																	}
																	className="text-muted-foreground hover:text-destructive text-base"
																>
																	×
																</button>
															</div>
														))}
													</div>
												)}

											{section.id === "projects" &&
												cv.projects?.map((item) => (
													<div
														key={item.id}
														className="rounded-lg border p-4 flex items-start justify-between gap-4"
													>
														<div className="flex-1 min-w-0">
															<div className="font-medium">{item.name}</div>
															{item.technologies && (
																<div className="text-sm text-muted-foreground">
																	{item.technologies}
																</div>
															)}
														</div>
														<div className="flex gap-2 shrink-0">
															<Button
																size="sm"
																variant="ghost"
																onClick={() =>
																	setActiveSheet({
																		type: "edit",
																		section: "projects",
																		data: item,
																	})
																}
															>
																<Edit className="h-4 w-4" />
															</Button>
															<Button
																size="sm"
																variant="ghost"
																onClick={() =>
																	projectMutations.remove.mutate(item.id)
																}
															>
																<Trash className="h-4 w-4 text-destructive" />
															</Button>
														</div>
													</div>
												))}
										</div>
									)}
								</CardContent>
							</Card>
						)}
					</div>
				))}
			</div>

			{/* FAB - Only show on mobile when a section is expanded */}
			{isMobile && expandedSection && (
				<FloatingActionButton
					onClick={() =>
						setActiveSheet({ type: "add", section: expandedSection })
					}
				/>
			)}

			{/* Add/Edit Bottom Sheet */}
			<BottomSheet
				open={activeSheet.section !== null && activeSheet.type !== "ai"}
				onOpenChange={(open) => {
					if (!open) {
						setActiveSheet({ type: "add", section: null });
					}
				}}
				title={
					activeSheet.type === "edit"
						? `Edit ${activeSheet.section === "work" ? "Work Experience" : activeSheet.section === "education" ? "Education" : activeSheet.section === "skills" ? "Skill" : "Project"}`
						: `Add ${activeSheet.section === "work" ? "Work Experience" : activeSheet.section === "education" ? "Education" : activeSheet.section === "skills" ? "Skill" : "Project"}`
				}
			>
				{activeSheet.section === "work" && (
					<WorkExperienceForm
						initialData={
							activeSheet.type === "edit" ? activeSheet.data : undefined
						}
						onSubmit={(data) => {
							if (activeSheet.type === "edit") {
								workMutations.update.mutate(
									{
										id: activeSheet.data.id,
										data: data,
									},
									{
										onSuccess: () => {
											setActiveSheet({ type: "add", section: null });
										},
									},
								);
							} else {
								workMutations.create.mutate(
									{ ...data, cv_id: cvId },
									{
										onSuccess: () => {
											setActiveSheet({ type: "add", section: null });
										},
									},
								);
							}
						}}
						onCancel={() => setActiveSheet({ type: "add", section: null })}
						isSubmitting={
							workMutations.create.isPending || workMutations.update.isPending
						}
						submitLabel={
							activeSheet.type === "edit" ? "Save Changes" : "Add Experience"
						}
					/>
				)}

				{activeSheet.section === "education" && (
					<EducationForm
						initialData={
							activeSheet.type === "edit" ? activeSheet.data : undefined
						}
						onSubmit={(data) => {
							if (activeSheet.type === "edit") {
								educationMutations.update.mutate(
									{
										id: activeSheet.data.id,
										data: data,
									},
									{
										onSuccess: () => {
											setActiveSheet({ type: "add", section: null });
										},
									},
								);
							} else {
								educationMutations.create.mutate(
									{ ...data, cv_id: cvId },
									{
										onSuccess: () => {
											setActiveSheet({ type: "add", section: null });
										},
									},
								);
							}
						}}
						onCancel={() => setActiveSheet({ type: "add", section: null })}
						isSubmitting={
							educationMutations.create.isPending ||
							educationMutations.update.isPending
						}
						submitLabel={
							activeSheet.type === "edit" ? "Save Changes" : "Add Education"
						}
					/>
				)}

				{activeSheet.section === "skills" && (
					<SkillForm
						initialData={
							activeSheet.type === "edit" ? activeSheet.data : undefined
						}
						onSubmit={(data) => {
							if (activeSheet.type === "edit") {
								skillMutations.update.mutate(
									{
										id: activeSheet.data.id,
										data: data,
									},
									{
										onSuccess: () => {
											setActiveSheet({ type: "add", section: null });
										},
									},
								);
							} else {
								skillMutations.create.mutate(
									{ ...data, cv_id: cvId },
									{
										onSuccess: () => {
											setActiveSheet({ type: "add", section: null });
										},
									},
								);
							}
						}}
						onCancel={() => setActiveSheet({ type: "add", section: null })}
						isSubmitting={
							skillMutations.create.isPending || skillMutations.update.isPending
						}
						submitLabel={
							activeSheet.type === "edit" ? "Save Changes" : "Add Skill"
						}
					/>
				)}

				{activeSheet.section === "projects" && (
					<ProjectForm
						initialData={
							activeSheet.type === "edit" ? activeSheet.data : undefined
						}
						onSubmit={(data) => {
							if (activeSheet.type === "edit") {
								projectMutations.update.mutate(
									{
										id: activeSheet.data.id,
										data: data,
									},
									{
										onSuccess: () => {
											setActiveSheet({ type: "add", section: null });
										},
									},
								);
							} else {
								projectMutations.create.mutate(
									{ ...data, cv_id: cvId },
									{
										onSuccess: () => {
											setActiveSheet({ type: "add", section: null });
										},
									},
								);
							}
						}}
						onCancel={() => setActiveSheet({ type: "add", section: null })}
						isSubmitting={
							projectMutations.create.isPending ||
							projectMutations.update.isPending
						}
						submitLabel={
							activeSheet.type === "edit" ? "Save Changes" : "Add Project"
						}
					/>
				)}
			</BottomSheet>

			{/* AI Optimization Bottom Sheet */}
			<BottomSheet
				open={aiOptimization !== null}
				onOpenChange={(open) => {
					if (!open) {
						setAiOptimization(null);
					}
				}}
				title="AI Optimization"
				description="Enhance your description with AI-powered suggestions"
				footer={
					<>
						<Button
							variant="outline"
							onClick={handleRegenerateAi}
							disabled={optimizeMutation.isPending}
							className="flex-1"
						>
							Regenerate
						</Button>
						<Button
							onClick={handleApplyAiOptimization}
							disabled={
								optimizeMutation.isPending || workMutations.update.isPending
							}
							className="flex-1"
						>
							Apply
						</Button>
					</>
				}
			>
				{aiOptimization && (
					<div className="space-y-6">
						{/* Original */}
						<div>
							<Label className="text-sm font-medium mb-2 block">Original</Label>
							<div className="rounded-md bg-muted p-3 text-sm">
								{aiOptimization.original || "No description"}
							</div>
						</div>

						{/* AI Optimized */}
						<div>
							<Label className="text-sm font-medium mb-2 block">
								AI Optimized
							</Label>
							{optimizeMutation.isPending ? (
								<div className="space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
									<p className="text-xs text-muted-foreground mt-2">
										Generating AI-powered suggestions...
									</p>
								</div>
							) : optimizeMutation.isError ? (
								<div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm">
									<p className="text-destructive font-medium mb-2">
										Failed to optimize
									</p>
									<p className="text-muted-foreground text-xs">
										{optimizeMutation.error?.message ||
											"Please check that GROQ_API_KEY is configured in the backend"}
									</p>
								</div>
							) : (
								<Textarea
									value={aiOptimization.optimized}
									onChange={(e) =>
										setAiOptimization((prev) =>
											prev ? { ...prev, optimized: e.target.value } : null,
										)
									}
									rows={10}
									className="resize-none"
									placeholder="AI-optimized description will appear here..."
								/>
							)}
						</div>
					</div>
				)}
			</BottomSheet>

			<BottomSheet
				open={summarySheetOpen}
				onOpenChange={(open) => {
					if (!open) {
						setSummarySheetOpen(false);
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
