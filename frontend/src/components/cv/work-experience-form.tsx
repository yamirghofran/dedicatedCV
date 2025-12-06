/**
 * WorkExperienceForm Component
 * Reusable form for creating/editing work experience entries
 */

import { Sparkles } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WorkExperienceCreate } from "@/lib/api/types";

interface WorkExperienceFormProps {
	initialData?: {
		id?: number;
		company: string;
		position: string;
		location?: string | null;
		start_date?: string | null;
		end_date?: string | null;
		description?: string | null;
	};
	onSubmit: (data: Omit<WorkExperienceCreate, "cv_id">) => void;
	onCancel?: () => void;
	onOptimize?: (description: string) => void;
	isSubmitting?: boolean;
	submitLabel?: string;
}

export function WorkExperienceForm({
	initialData,
	onSubmit,
	onCancel,
	onOptimize,
	isSubmitting = false,
	submitLabel = "Save",
}: WorkExperienceFormProps) {
	const companyId = useId();
	const positionId = useId();
	const locationId = useId();
	const descriptionId = useId();

	const [form, setForm] = useState({
		company: initialData?.company || "",
		position: initialData?.position || "",
		location: initialData?.location || "",
		start_date: initialData?.start_date || "",
		end_date: initialData?.end_date || "",
		description: initialData?.description || "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	// Update form when initialData changes
	useEffect(() => {
		if (initialData) {
			setForm({
				company: initialData.company || "",
				position: initialData.position || "",
				location: initialData.location || "",
				start_date: initialData.start_date || "",
				end_date: initialData.end_date || "",
				description: initialData.description || "",
			});
		}
	}, [initialData]);

	const handleChange = (
		field: keyof typeof form,
		value: string | undefined,
	) => {
		setForm((prev) => ({ ...prev, [field]: value || "" }));
		// Clear error when user starts typing
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

		if (!form.company.trim()) {
			newErrors.company = "Company is required";
		}
		if (!form.position.trim()) {
			newErrors.position = "Position is required";
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
			company: form.company,
			position: form.position,
			location: form.location || undefined,
			start_date: form.start_date,
			end_date: form.end_date || undefined,
			description: form.description || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{/* Company */}
			<div className="space-y-2">
				<Label htmlFor={companyId} className="text-sm font-medium">
					Company <span className="text-destructive">*</span>
				</Label>
				<Input
					id={companyId}
					value={form.company}
					onChange={(e) => handleChange("company", e.target.value)}
					placeholder="Acme Corp"
					className={errors.company ? "border-destructive" : ""}
				/>
				{errors.company && (
					<p className="text-xs text-destructive">{errors.company}</p>
				)}
			</div>

			{/* Position */}
			<div className="space-y-2">
				<Label htmlFor={positionId} className="text-sm font-medium">
					Position <span className="text-destructive">*</span>
				</Label>
				<Input
					id={positionId}
					value={form.position}
					onChange={(e) => handleChange("position", e.target.value)}
					placeholder="Senior Developer"
					className={errors.position ? "border-destructive" : ""}
				/>
				{errors.position && (
					<p className="text-xs text-destructive">{errors.position}</p>
				)}
			</div>

			{/* Location */}
			<div className="space-y-2">
				<Label htmlFor={locationId} className="text-sm font-medium">
					Location
				</Label>
				<Input
					id={locationId}
					value={form.location}
					onChange={(e) => handleChange("location", e.target.value)}
					placeholder="San Francisco, CA"
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

			{/* Description */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label htmlFor={descriptionId} className="text-sm font-medium">
						Description
					</Label>
					{onOptimize && form.description && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => onOptimize(form.description)}
							className="gap-1 text-xs h-7"
						>
							<Sparkles className="h-3 w-3" />
							Optimize
						</Button>
					)}
				</div>
				<Textarea
					id={descriptionId}
					value={form.description}
					onChange={(e) => handleChange("description", e.target.value)}
					placeholder="Led a team of 5 engineers to deliver..."
					rows={5}
					className="resize-none"
				/>
				<p className="text-xs text-muted-foreground">
					Highlight your key achievements and responsibilities
				</p>
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
