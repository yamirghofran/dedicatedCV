/**
 * SkillForm Component
 * Reusable form for creating/editing skills
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useId } from "react";
import type { SkillCreate } from "@/lib/api/types";

interface SkillFormProps {
	initialData?: {
		id?: number;
		name: string;
		category?: string | null;
	};
	onSubmit: (data: Omit<SkillCreate, "cv_id">) => void;
	onCancel?: () => void;
	isSubmitting?: boolean;
	submitLabel?: string;
}

export function SkillForm({
	initialData,
	onSubmit,
	onCancel,
	isSubmitting = false,
	submitLabel = "Save",
}: SkillFormProps) {
	const nameId = useId();
	const categoryId = useId();

	const [form, setForm] = useState({
		name: initialData?.name || "",
		category: initialData?.category || "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (initialData) {
			setForm({
				name: initialData.name || "",
				category: initialData.category || "",
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
			newErrors.name = "Skill name is required";
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
			category: form.category || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{/* Name */}
			<div className="space-y-2">
				<Label htmlFor={nameId} className="text-sm font-medium">
					Skill Name <span className="text-destructive">*</span>
				</Label>
				<Input
					id={nameId}
					value={form.name}
					onChange={(e) => handleChange("name", e.target.value)}
					placeholder="React, TypeScript, etc."
					className={errors.name ? "border-destructive" : ""}
				/>
				{errors.name && (
					<p className="text-xs text-destructive">{errors.name}</p>
				)}
			</div>

			{/* Category */}
			<div className="space-y-2">
				<Label htmlFor={categoryId} className="text-sm font-medium">
					Category
				</Label>
				<Input
					id={categoryId}
					value={form.category}
					onChange={(e) => handleChange("category", e.target.value)}
					placeholder="Programming Languages, Tools, etc."
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
