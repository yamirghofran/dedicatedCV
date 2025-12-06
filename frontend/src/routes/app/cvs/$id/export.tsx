import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Palette } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { ClassicTemplate, MinimalTemplate, ModernTemplate } from "@/templates";

export const Route = createFileRoute("/app/cvs/$id/export")({
	component: CVExportPlaceholder,
});

function CVExportPlaceholder() {
	const { id } = Route.useParams();
	const cvId = Number(id);
	const { data: cv, isLoading } = useCV(cvId);
	const [selectedFormat, setSelectedFormat] = useState<"pdf" | "docx" | "txt">(
		"pdf",
	);
	const [selectedTemplate, setSelectedTemplate] = useState<
		"Classic" | "Modern" | "Minimal"
	>("Classic");
	const [isExporting, setIsExporting] = useState(false);
	const previewRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const stored = localStorage.getItem(`cv_template_${cvId}`);
		if (stored === "Modern" || stored === "Minimal" || stored === "Classic") {
			setSelectedTemplate(stored);
		}
	}, [cvId]);

	useEffect(() => {
		localStorage.setItem(`cv_template_${cvId}`, selectedTemplate);
	}, [cvId, selectedTemplate]);

	const TemplateComponent = useMemo(() => {
		switch (selectedTemplate) {
			case "Modern":
				return ModernTemplate;
			case "Minimal":
				return MinimalTemplate;
			default:
				return ClassicTemplate;
		}
	}, [selectedTemplate]);

	const handleExport = async () => {
		if (!previewRef.current || !cv) return;
		if (selectedFormat !== "pdf") {
			alert("Only PDF is available right now.");
			return;
		}
		setIsExporting(true);
		try {
			const html2canvasModule = await import("html2canvas");
			const jsPDFModule = await import("jspdf");
			const html2canvas =
				(html2canvasModule as any).default ?? html2canvasModule;
			const JsPDFCtor =
				(jsPDFModule as any).jsPDF ??
				(jsPDFModule as any).default?.jsPDF ??
				(jsPDFModule as any).default ??
				jsPDFModule;

			const canvas = await html2canvas(previewRef.current, {
				// Aggressive scale for crisp, larger PDF text
				scale: 4,
				backgroundColor: "#ffffff",
				useCORS: true,
				onclone: (doc: Document) => {
					doc.querySelectorAll("style").forEach((style: HTMLStyleElement) => {
						if (style.textContent?.includes("oklch")) {
							style.remove();
						}
					});
					const root = doc.documentElement;
					const overrides: Record<string, string> = {
						"--background": "#ffffff",
						"--foreground": "#111827",
						"--card": "#ffffff",
						"--card-foreground": "#111827",
						"--popover": "#ffffff",
						"--popover-foreground": "#111827",
						"--primary": "#111827",
						"--primary-foreground": "#ffffff",
						"--secondary": "#f3f4f6",
						"--secondary-foreground": "#111827",
						"--muted": "#f3f4f6",
						"--muted-foreground": "#4b5563",
						"--accent": "#f3f4f6",
						"--accent-foreground": "#111827",
						"--destructive": "#ef4444",
						"--destructive-foreground": "#ffffff",
						"--border": "#e5e7eb",
						"--input": "#e5e7eb",
						"--ring": "#e5e7eb",
					};
					Object.entries(overrides).forEach(([key, value]) => {
						root.style.setProperty(key, value);
					});
				},
			});
			const imgData = canvas.toDataURL("image/png");
			const pdf = new JsPDFCtor("p", "pt", "a4");
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
			pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
			const safeName = (cv.full_name || "Resume").replace(/\s+/g, "_");
			pdf.save(`${safeName}_Resume.pdf`);
		} catch (err) {
			console.error(err);
			const message =
				err instanceof Error
					? err.message
					: "Please try again after ensuring html2canvas/jspdf are installed.";
			alert(`Export failed: ${message}`);
		} finally {
			setIsExporting(false);
		}
	};

	if (isLoading || !cv) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-48" />
				<Skeleton className="h-32 w-full" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-muted-foreground uppercase tracking-wide">
						Export
					</p>
					<h1 className="text-3xl font-bold">Export {cv.title}</h1>
					<p className="text-muted-foreground mt-1">
						Format selection and template picker will be wired here.
					</p>
				</div>
				<Link to="/app/cvs/$id/preview" params={{ id }}>
					<Button variant="outline" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Back to preview
					</Button>
				</Link>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Preview</CardTitle>
						<CardDescription>
							The exported PDF matches this view.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div
							ref={previewRef}
							className="aspect-[8.5/11] w-full rounded-lg border border-dashed bg-white p-4"
							style={{ width: "100%", minHeight: 0 }}
						>
							<TemplateComponent cv={cv} />
						</div>
					</CardContent>
				</Card>

				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Palette className="h-4 w-4" />
								Template
							</CardTitle>
							<CardDescription>
								Classic, modern, and minimal options.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-3 gap-3">
								{(["Classic", "Modern", "Minimal"] as const).map((template) => (
									<button
										key={template}
										type="button"
										onClick={() => setSelectedTemplate(template)}
										className={`aspect-[3/4] rounded-lg border border-dashed bg-muted text-sm flex items-center justify-center ${
											selectedTemplate === template ? "border-primary" : ""
										}`}
									>
										{template}
									</button>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Format</CardTitle>
							<CardDescription>
								Pick the file type for download.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							{[
								{ id: "pdf", label: "PDF (recommended)", disabled: false },
								{ id: "docx", label: "Word (.docx) — soon", disabled: true },
							].map((option) => (
								<label
									key={option.id}
									htmlFor={option.id}
									className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${option.disabled ? "opacity-60" : ""}`}
								>
									<input
										id={option.id}
										name="format"
										type="radio"
										checked={selectedFormat === option.id}
										disabled={option.disabled}
										className="h-4 w-4"
										onChange={() =>
											setSelectedFormat(option.id as "pdf" | "docx" | "txt")
										}
									/>
									<span className="text-sm">{option.label}</span>
								</label>
							))}
						</CardContent>
					</Card>

					<Button
						className="gap-2 w-full"
						onClick={handleExport}
						disabled={isExporting}
					>
						<Download className="h-4 w-4" />
						{isExporting
							? "Exporting…"
							: `Download (${selectedFormat.toUpperCase()})`}
					</Button>
				</div>
			</div>
		</div>
	);
}
