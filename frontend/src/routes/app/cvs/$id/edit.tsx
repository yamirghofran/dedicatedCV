import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Eye } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
	useEducationMutations,
	useProjectMutations,
	useSkillMutations,
	useWorkExperienceMutations,
} from "@/hooks/use-cv-sections";
import { useCV, useUpdateCV } from "@/hooks/use-cvs";

export const Route = createFileRoute("/app/cvs/$id/edit")({
	component: CVEditor,
});

function CVEditor() {
	const { id } = Route.useParams();
	const cvId = Number(id);
	const { data: cv, isLoading } = useCV(cvId);
	const { mutate: updateCV, isPending: isSaving } = useUpdateCV();
	const workMutations = useWorkExperienceMutations(cvId);
	const educationMutations = useEducationMutations(cvId);
	const skillMutations = useSkillMutations(cvId);
	const projectMutations = useProjectMutations(cvId);
	const personalRef = useRef<HTMLDivElement | null>(null);
	const workRef = useRef<HTMLDivElement | null>(null);
	const educationRef = useRef<HTMLDivElement | null>(null);
	const skillsRef = useRef<HTMLDivElement | null>(null);
	const projectsRef = useRef<HTMLDivElement | null>(null);

	const [form, setForm] = useState({
		title: "",
		full_name: "",
		email: "",
		phone: "",
		location: "",
		summary: "",
	});
	const [autoSaveStatus, setAutoSaveStatus] = useState<
		"idle" | "saving" | "saved"
	>("idle");
	const [sectionsHint, setSectionsHint] = useState<string[] | null>(null);

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

	useEffect(() => {
		if (cv) {
			const stored = localStorage.getItem(`cv_sections_${cv.id}`);
			if (stored) {
				try {
					setSectionsHint(JSON.parse(stored));
				} catch {
					setSectionsHint(null);
				}
			}
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

	if (isLoading || !cv) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-64" />
				<div className="grid gap-4 md:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-48 w-full" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4 md:space-y-6">
			<div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
						CV Editor
					</p>
					<h1 className="text-2xl md:text-3xl font-bold truncate">{cv.title}</h1>
					<p className="text-xs md:text-sm text-muted-foreground mt-1">
						Edit your base information and then add experiences, education,
						skills, and projects.
					</p>
					{sectionsHint && sectionsHint.length > 0 && (
						<p className="text-xs text-muted-foreground mt-2">
							You chose to start with: {sectionsHint.join(", ")}.
						</p>
					)}
				</div>
				<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
					<Link to="/app/cvs/$id/preview" params={{ id: cv.id.toString() }} className="flex-1 sm:flex-none">
						<Button variant="outline" className="gap-2 w-full sm:w-auto text-xs md:text-sm">
							<Eye className="h-4 w-4" />
							<span className="hidden sm:inline">Preview</span>
							<span className="sm:hidden">View</span>
						</Button>
					</Link>
					<Link to="/app/cvs/$id/export" params={{ id: cv.id.toString() }} className="flex-1 sm:flex-none">
						<Button variant="outline" className="gap-2 w-full sm:w-auto text-xs md:text-sm">
							<Download className="h-4 w-4" />
							<span className="hidden sm:inline">Export</span>
							<span className="sm:hidden">PDF</span>
						</Button>
					</Link>
					<Button
						onClick={handleSave}
						disabled={!isDirty || isSaving}
						className="gap-2 flex-1 sm:flex-none text-xs md:text-sm"
					>
						{isSaving || autoSaveStatus === "saving"
							? "Saving…"
							: isDirty
								? "Save changes"
								: autoSaveStatus === "saved"
									? "Saved"
									: "Saved"}
					</Button>
				</div>
			</div>

			<div className="grid">
				<Card className="md:col-span-2" ref={personalRef}>
					<CardHeader className="pb-3 md:pb-6">
						<CardTitle className="text-lg md:text-xl">Personal & Summary</CardTitle>
						<CardDescription className="text-xs md:text-sm">
							Save updates to persist to the backend.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 grid-cols-1 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="title" className="text-xs md:text-sm">CV Title</Label>
								<Input
									id="title"
									value={form.title}
									onChange={handleChange("title")}
									className="text-xs md:text-sm"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="full_name" className="text-xs md:text-sm">Full Name</Label>
								<Input
									id="full_name"
									value={form.full_name}
									onChange={handleChange("full_name")}
									className="text-xs md:text-sm"
								/>
							</div>
						</div>
						<div className="grid gap-4 grid-cols-1 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-xs md:text-sm">Email</Label>
								<Input
									id="email"
									type="email"
									value={form.email}
									onChange={handleChange("email")}
									className="text-xs md:text-sm"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="phone" className="text-xs md:text-sm">Phone</Label>
								<Input
									id="phone"
									value={form.phone}
									onChange={handleChange("phone")}
									className="text-xs md:text-sm"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="location" className="text-xs md:text-sm">Location</Label>
							<Input
								id="location"
								value={form.location}
								onChange={handleChange("location")}
								className="text-xs md:text-sm"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="summary" className="text-xs md:text-sm">Professional Summary</Label>
							<Textarea
								id="summary"
								rows={5}
								value={form.summary}
								onChange={handleChange("summary")}
								placeholder="Highlight your impact, stack, and focus areas."
								className="text-xs md:text-sm"
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			<Separator />

			<div className="grid gap-4 grid-cols-1 md:grid-cols-2">
				<Card ref={workRef}>
					<CardHeader className="pb-3 md:pb-6">
						<CardTitle className="text-lg md:text-xl">Work Experience</CardTitle>
						<CardDescription className="text-xs md:text-sm">
							Add roles tied to this CV (immediately saved to the API).
						</CardDescription>
					</CardHeader>
					<CardContent className="text-xs md:text-sm text-muted-foreground space-y-3">
						<WorkList
							items={(cv.work_experiences ?? []).map((w) => ({
								id: w.id,
								company: w.company,
								position: w.position,
								location: w.location,
								start_date: w.start_date,
								end_date: w.end_date,
								description: w.description,
							}))}
							cvId={cv.id}
							mutations={workMutations}
						/>
					</CardContent>
				</Card>

				<Card ref={educationRef}>
					<CardHeader className="pb-3 md:pb-6">
						<CardTitle className="text-lg md:text-xl">Education</CardTitle>
						<CardDescription className="text-xs md:text-sm">
							Add degrees for this CV (saved to the API on submit).
						</CardDescription>
					</CardHeader>
					<CardContent className="text-xs md:text-sm text-muted-foreground space-y-3">
						<EducationList
							items={(cv.educations ?? []).map((e) => ({
								id: e.id,
								institution: e.institution,
								degree: e.degree,
								start_date: e.start_date,
								end_date: e.end_date,
							}))}
							cvId={cv.id}
							mutations={educationMutations}
						/>
					</CardContent>
				</Card>

				<Card ref={skillsRef}>
					<CardHeader className="pb-3 md:pb-6">
						<CardTitle className="text-lg md:text-xl">Skills</CardTitle>
						<CardDescription className="text-xs md:text-sm">
							Track skills for this CV; adds/removals are sent to the API.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-xs md:text-sm text-muted-foreground space-y-3">
						<SkillList
							items={(cv.skills ?? []).map((s) => ({
								id: s.id,
								name: s.name,
								category: s.category,
							}))}
							cvId={cv.id}
							mutations={skillMutations}
						/>
					</CardContent>
				</Card>

				<Card ref={projectsRef}>
					<CardHeader className="pb-3 md:pb-6">
						<CardTitle className="text-lg md:text-xl">Projects</CardTitle>
						<CardDescription className="text-xs md:text-sm">
							Log projects with stack notes; actions persist via API.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-xs md:text-sm text-muted-foreground space-y-3">
						<ProjectList
							items={(cv.projects ?? []).map((p) => ({
								id: p.id,
								name: p.name,
								stack: p.technologies ?? p.description ?? "",
							}))}
							cvId={cv.id}
							mutations={projectMutations}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function WorkList({
	items,
	cvId,
	mutations,
}: {
	items: Array<{
		id: number;
		company: string;
		position: string;
		location?: string | null;
		start_date?: string | null;
		end_date?: string | null;
		description?: string | null;
	}>;
	cvId: number;
	mutations: ReturnType<typeof useWorkExperienceMutations>;
}) {
	const [draft, setDraft] = useState({
		company: "",
		position: "",
		location: "",
		start_date: "",
		end_date: "",
		description: "",
	});

	return (
		<div className="space-y-2">
			{items.length === 0 && (
				<p className="text-muted-foreground">No experiences yet.</p>
			)}
			<div className="space-y-1">
				<Label className="text-xs">Company</Label>
				<Input
					value={draft.company}
					onChange={(e) => setDraft({ ...draft, company: e.target.value })}
				/>
				<Label className="text-xs">Role</Label>
				<Input
					value={draft.position}
					onChange={(e) => setDraft({ ...draft, position: e.target.value })}
				/>
				<Label className="text-xs">Location</Label>
				<Input
					value={draft.location}
					onChange={(e) => setDraft({ ...draft, location: e.target.value })}
				/>
				<div className="grid grid-cols-2 gap-2">
					<DatePicker
						label="Start date"
						value={draft.start_date}
						onChange={(value) => setDraft({ ...draft, start_date: value })}
					/>
					<DatePicker
						label="End date"
						value={draft.end_date}
						onChange={(value) => setDraft({ ...draft, end_date: value })}
					/>
				</div>
				<Label className="text-xs">Description</Label>
				<Input
					value={draft.description}
					onChange={(e) => setDraft({ ...draft, description: e.target.value })}
					placeholder="What did you deliver?"
				/>
				<Button
					size="sm"
					className="mt-2"
					onClick={() => {
						if (!draft.company || !draft.position || !draft.start_date) return;
						mutations.create.mutate({
							cv_id: cvId,
							company: draft.company,
							position: draft.position,
							location: draft.location || undefined,
							start_date: draft.start_date,
							end_date: draft.end_date || undefined,
							description: draft.description || undefined,
						});
						setDraft({
							company: "",
							position: "",
							location: "",
							start_date: "",
							end_date: "",
							description: "",
						});
					}}
					disabled={mutations.create.isPending}
				>
					Add experience
				</Button>
			</div>
			{items.length > 0 && (
				<div className="space-y-2">
					{items.map((item) => (
						<div
							key={item.id}
							className="rounded-lg border px-3 py-2 flex items-center justify-between"
						>
							<div>
								<div className="font-medium text-foreground">
									{item.position}
								</div>
								<div className="text-xs text-muted-foreground">
									{item.company} · {item.start_date} -{" "}
									{item.end_date || "Present"}
								</div>
							</div>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => mutations.remove.mutate(item.id)}
								disabled={mutations.remove.isPending}
							>
								Delete
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function EducationList({
	items,
	cvId,
	mutations,
}: {
	items: Array<{
		id: number;
		institution: string;
		degree: string;
		start_date?: string | null;
		end_date?: string | null;
	}>;
	cvId: number;
	mutations: ReturnType<typeof useEducationMutations>;
}) {
	const [draft, setDraft] = useState({
		institution: "",
		degree: "",
		start_date: "",
		end_date: "",
	});

	return (
		<div className="space-y-2">
			{items.length === 0 && (
				<p className="text-muted-foreground">No education entries yet.</p>
			)}
			<div className="space-y-1">
				<Label className="text-xs">Institution</Label>
				<Input
					value={draft.institution}
					onChange={(e) => setDraft({ ...draft, institution: e.target.value })}
				/>
				<Label className="text-xs">Degree</Label>
				<Input
					value={draft.degree}
					onChange={(e) => setDraft({ ...draft, degree: e.target.value })}
				/>
				<div className="grid grid-cols-2 gap-2">
					<DatePicker
						label="Start date"
						value={draft.start_date}
						onChange={(value) => setDraft({ ...draft, start_date: value })}
					/>
					<DatePicker
						label="End date"
						value={draft.end_date}
						onChange={(value) => setDraft({ ...draft, end_date: value })}
					/>
				</div>
				<Button
					size="sm"
					className="mt-2"
					onClick={() => {
						if (!draft.institution || !draft.degree || !draft.start_date)
							return;
						mutations.create.mutate({
							cv_id: cvId,
							institution: draft.institution,
							degree: draft.degree,
							start_date: draft.start_date,
							end_date: draft.end_date || undefined,
						});
						setDraft({
							institution: "",
							degree: "",
							start_date: "",
							end_date: "",
						});
					}}
					disabled={mutations.create.isPending}
				>
					Add education
				</Button>
			</div>
			{items.length > 0 && (
				<div className="space-y-2">
					{items.map((item) => (
						<div
							key={item.id}
							className="rounded-lg border px-3 py-2 flex items-center justify-between"
						>
							<div>
								<div className="font-medium text-foreground">
									{item.institution}
								</div>
								<div className="text-xs text-muted-foreground">
									{item.degree} · {item.start_date} -{" "}
									{item.end_date || "Present"}
								</div>
							</div>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => mutations.remove.mutate(item.id)}
								disabled={mutations.remove.isPending}
							>
								Delete
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function SkillList({
	items,
	cvId,
	mutations,
}: {
	items: Array<{ id: number; name: string; category?: string | null }>;
	cvId: number;
	mutations: ReturnType<typeof useSkillMutations>;
}) {
	const [draft, setDraft] = useState("");
	const add = () => {
		if (!draft) return;
		mutations.create.mutate({ cv_id: cvId, name: draft });
		setDraft("");
	};

	return (
		<div className="space-y-2">
			{items.length === 0 && (
				<p className="text-muted-foreground">No skills yet.</p>
			)}
			<div className="flex gap-2">
				<Input
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					placeholder="e.g., React"
				/>
				<Button size="sm" onClick={add}>
					Add
				</Button>
			</div>
			{items.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{items.map((item) => (
						<span
							key={item.id}
							className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
						>
							{item.name}
							<button
								onClick={() => mutations.remove.mutate(item.id)}
								className="text-muted-foreground text-xs"
								disabled={mutations.remove.isPending}
							>
								×
							</button>
						</span>
					))}
				</div>
			)}
		</div>
	);
}

function ProjectList({
	items,
	cvId,
	mutations,
}: {
	items: Array<{ id: number; name: string; stack: string }>;
	cvId: number;
	mutations: ReturnType<typeof useProjectMutations>;
}) {
	const [draft, setDraft] = useState({ name: "", stack: "" });
	const add = () => {
		if (!draft.name) return;
		mutations.create.mutate({
			cv_id: cvId,
			name: draft.name,
			technologies: draft.stack || undefined,
		});
		setDraft({ name: "", stack: "" });
	};

	return (
		<div className="space-y-2">
			{items.length === 0 && (
				<p className="text-muted-foreground">No projects yet.</p>
			)}
			<div className="space-y-1">
				<Label className="text-xs">Project name</Label>
				<Input
					value={draft.name}
					onChange={(e) => setDraft({ ...draft, name: e.target.value })}
				/>
				<Label className="text-xs">Stack / description</Label>
				<Input
					value={draft.stack}
					onChange={(e) => setDraft({ ...draft, stack: e.target.value })}
					placeholder="React, Node, Postgres"
				/>
				<Button size="sm" className="mt-2" onClick={add}>
					Add project
				</Button>
			</div>
			{items.length > 0 && (
				<div className="space-y-2">
					{items.map((item) => (
						<div
							key={item.id}
							className="rounded-lg border px-3 py-2 flex items-center justify-between"
						>
							<div>
								<div className="font-medium text-foreground">{item.name}</div>
								<div className="text-xs text-muted-foreground">
									{item.stack}
								</div>
							</div>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => mutations.remove.mutate(item.id)}
								disabled={mutations.remove.isPending}
							>
								Delete
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
