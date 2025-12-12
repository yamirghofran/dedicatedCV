/**
 * EducationForm Component
 * Reusable form for creating/editing education entries
 */

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EducationCreate } from "@/lib/api/types";

interface EducationFormProps {
	initialData?: {
		id?: number;
		institution: string;
		degree: string;
		field_of_study?: string | null;
		start_date?: string | null;
		end_date?: string | null;
	};
	onSubmit: (data: Omit<EducationCreate, "cv_id">) => void;
	onCancel?: () => void;
	isSubmitting?: boolean;
	submitLabel?: string;
}

export function EducationForm({
	initialData,
	onSubmit,
	onCancel,
	isSubmitting = false,
	submitLabel = "Save",
}: EducationFormProps) {
	const institutionId = useId();
	const degreeId = useId();
	const fieldOfStudyId = useId();

	const [form, setForm] = useState({
		institution: initialData?.institution || "",
		degree: initialData?.degree || "",
		field_of_study: initialData?.field_of_study || "",
		start_date: initialData?.start_date || "",
		end_date: initialData?.end_date || "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (initialData) {
			setForm({
				institution: initialData.institution || "",
				degree: initialData.degree || "",
				field_of_study: initialData.field_of_study || "",
				start_date: initialData.start_date || "",
				end_date: initialData.end_date || "",
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

		if (!form.institution.trim()) {
			newErrors.institution = "Institution is required";
		}
		if (!form.degree.trim()) {
			newErrors.degree = "Degree is required";
		}
		if (!form.start_date) {
			newErrors.start_date = "Start date is required";
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
			institution: form.institution,
			degree: form.degree,
			field_of_study: form.field_of_study || undefined,
			start_date: form.start_date,
			end_date: form.end_date || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{/* Institution */}
			<div className="space-y-2">
				<Label htmlFor={institutionId} className="text-sm font-medium">
					Institution <span className="text-destructive">*</span>
				</Label>
				<Input
					id={institutionId}
					value={form.institution}
					onChange={(e) => handleChange("institution", e.target.value)}
					placeholder="University of California"
					className={errors.institution ? "border-destructive" : ""}
				/>
				{errors.institution && (
					<p className="text-xs text-destructive">{errors.institution}</p>
				)}
			</div>

			{/* Degree */}
			<div className="space-y-2">
				<Label htmlFor={degreeId} className="text-sm font-medium">
					Degree <span className="text-destructive">*</span>
				</Label>
				<Input
					id={degreeId}
					value={form.degree}
					onChange={(e) => handleChange("degree", e.target.value)}
					placeholder="Bachelor of Science"
					className={errors.degree ? "border-destructive" : ""}
				/>
				{errors.degree && (
					<p className="text-xs text-destructive">{errors.degree}</p>
				)}
			</div>

			{/* Field of Study */}
			<div className="space-y-2">
				<Label htmlFor={fieldOfStudyId} className="text-sm font-medium">
					Field of Study
				</Label>
				<Input
					id={fieldOfStudyId}
					value={form.field_of_study}
					onChange={(e) => handleChange("field_of_study", e.target.value)}
					placeholder="Computer Science"
				/>
			</div>

			{/* Dates */}
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<DatePicker
						label="Start date"
						value={form.start_date}
						onChange={(value) => handleChange("start_date", value)}
					/>
					{errors.start_date && (
						<p className="text-xs text-destructive">{errors.start_date}</p>
					)}
				</div>
				<div className="space-y-2">
					<DatePicker
						label="End date"
						value={form.end_date}
						onChange={(value) => handleChange("end_date", value)}
					/>
					<p className="text-xs text-muted-foreground">
						Leave empty if current
					</p>
				</div>
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
