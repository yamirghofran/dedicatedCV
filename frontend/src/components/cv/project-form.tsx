/**
 * ProjectForm Component
 * Reusable form for creating/editing projects
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import type { ProjectCreate } from "@/lib/api/types";

interface ProjectFormProps {
	initialData?: {
		id?: number;
		name: string;
		description?: string | null;
		technologies?: string | null;
		url?: string | null;
	};
	onSubmit: (data: Omit<ProjectCreate, "cv_id">) => void;
	onCancel?: () => void;
	isSubmitting?: boolean;
	submitLabel?: string;
}

export function ProjectForm({
	initialData,
	onSubmit,
	onCancel,
	isSubmitting = false,
	submitLabel = "Save",
}: ProjectFormProps) {
	const [form, setForm] = useState({
		name: initialData?.name || "",
		description: initialData?.description || "",
		technologies: initialData?.technologies || "",
		url: initialData?.url || "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (initialData) {
			setForm({
				name: initialData.name || "",
				description: initialData.description || "",
				technologies: initialData.technologies || "",
				url: initialData.url || "",
			});
		}
	}, [initialData]);

	const handleChange = (
		field: keyof typeof form,
		value: string | undefined,
	) => {
		setForm((prev) => ({ ...prev, [field]: value || "" }));
		if (errors[field]) {
			setErrors((prev) => {
				const next = { ...prev };
				delete next[field];
				return next;
			});
		}
	};

	const validate = () => {
		const newErrors: Record<string, string> = {};

		if (!form.name.trim()) {
			newErrors.name = "Project name is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validate()) {
			return;
		}

		onSubmit({
			name: form.name,
			description: form.description || undefined,
			technologies: form.technologies || undefined,
			url: form.url || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{/* Name */}
			<div className="space-y-2">
				<Label htmlFor="name" className="text-sm font-medium">
					Project Name <span className="text-destructive">*</span>
				</Label>
				<Input
					id="name"
					value={form.name}
					onChange={(e) => handleChange("name", e.target.value)}
					placeholder="My Awesome Project"
					className={errors.name ? "border-destructive" : ""}
				/>
				{errors.name && (
					<p className="text-xs text-destructive">{errors.name}</p>
				)}
			</div>

			{/* Technologies */}
			<div className="space-y-2">
				<Label htmlFor="technologies" className="text-sm font-medium">
					Technologies / Stack
				</Label>
				<Input
					id="technologies"
					value={form.technologies}
					onChange={(e) => handleChange("technologies", e.target.value)}
					placeholder="React, Node.js, PostgreSQL"
				/>
			</div>

			{/* URL */}
			<div className="space-y-2">
				<Label htmlFor="url" className="text-sm font-medium">
					Project URL
				</Label>
				<Input
					id="url"
					type="url"
					value={form.url}
					onChange={(e) => handleChange("url", e.target.value)}
					placeholder="https://github.com/username/project"
				/>
			</div>

			{/* Description */}
			<div className="space-y-2">
				<Label htmlFor="description" className="text-sm font-medium">
					Description
				</Label>
				<Textarea
					id="description"
					value={form.description}
					onChange={(e) => handleChange("description", e.target.value)}
					placeholder="A brief description of your project and its impact"
					rows={4}
					className="resize-none"
				/>
			</div>

			{/* Actions */}
			<div className="flex gap-3 pt-2">
				{onCancel && (
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isSubmitting}
						className="flex-1"
					>
						Cancel
					</Button>
				)}
				<Button type="submit" disabled={isSubmitting} className="flex-1">
					{isSubmitting ? "Saving..." : submitLabel}
				</Button>
			</div>
		</form>
	);
}
