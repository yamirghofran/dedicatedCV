import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Copy, Download, Palette } from "lucide-react";
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
import { cvService } from "@/lib/api";
import { ClassicTemplate, MinimalTemplate, ModernTemplate } from "@/templates";

type ExportFormat = "pdf" | "link" | "docx";

export const Route = createFileRoute("/app/cvs/$id/export")({
	component: CVExportPlaceholder,
});

function CVExportPlaceholder() {
	const { id } = Route.useParams();
	const cvId = Number(id);
	const { data: cv, isLoading } = useCV(cvId);
	const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
	const [selectedTemplate, setSelectedTemplate] = useState<
		"Classic" | "Modern" | "Minimal"
	>("Classic");
	const [isExporting, setIsExporting] = useState(false);
	const [shareLink, setShareLink] = useState<{
		url: string;
		expiresAt?: string;
	} | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
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

	useEffect(() => {
		if (!copyFeedback) return;
		const timer = window.setTimeout(() => setCopyFeedback(null), 2000);
		return () => window.clearTimeout(timer);
	}, [copyFeedback]);

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

	const generatePdfDocument = async () => {
		if (!previewRef.current || !cv) {
			throw new Error("Preview not ready");
		}

		const html2canvasModule = await import("html2canvas");
		const html2canvas = html2canvasModule.default ?? html2canvasModule;
		const jsPDFModule = await import("jspdf");
		const JsPDFCtor =
			jsPDFModule.jsPDF ??
			(jsPDFModule.default &&
			typeof jsPDFModule.default === "object" &&
			"jsPDF" in jsPDFModule.default
				? (jsPDFModule.default as { jsPDF?: typeof jsPDFModule.jsPDF }).jsPDF
				: undefined) ??
			(jsPDFModule.default as typeof jsPDFModule.jsPDF | undefined);

		if (!JsPDFCtor) {
			throw new Error("Unable to load jsPDF");
		}

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
		const filename = `${safeName}_Resume.pdf`;

		return { pdf, filename };
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopyFeedback("Copied to clipboard");
		} catch (err) {
			console.error("Clipboard copy failed", err);
			setCopyFeedback("Copy failed. Please copy manually.");
		}
	};

	const handleExport = async () => {
		if (!previewRef.current || !cv) return;
		if (selectedFormat === "docx") {
			alert("Only PDF and shareable links are available right now.");
			return;
		}

		if (selectedFormat === "link" && shareLink?.url) {
			await copyToClipboard(shareLink.url);
			return;
		}

		setIsExporting(true);
		setErrorMessage(null);

		try {
			const { pdf, filename } = await generatePdfDocument();

			if (selectedFormat === "pdf") {
				pdf.save(filename);
				setShareLink(null);
			} else {
				const pdfBlob = (await pdf.output("blob")) as Blob;
				const file = new File([pdfBlob], filename, { type: "application/pdf" });
				const response = await cvService.createShareLink(cvId, file);
				const linkPayload = {
					url: response.url,
					expiresAt: response.expires_at,
				};
				setShareLink(linkPayload);
				await copyToClipboard(linkPayload.url);
			}
		} catch (err) {
			console.error(err);
			const message =
				err instanceof Error
					? err.message
					: "Please try again after ensuring html2canvas/jspdf are installed.";
			setErrorMessage(message);
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

	const exportButtonLabel = isExporting
		? selectedFormat === "link"
			? "Generating link…"
			: "Exporting…"
		: selectedFormat === "link"
			? "Copy share link"
			: "Download (PDF)";

	const exportButtonIcon =
		selectedFormat === "link" ? (
			<Copy className="h-4 w-4" />
		) : (
			<Download className="h-4 w-4" />
		);

	return (
		<div className="space-y-4 md:space-y-6">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="min-w-0">
					<p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
						Export
					</p>
					<h1 className="text-2xl md:text-3xl font-bold truncate">
						Export {cv.title}
					</h1>
					<p className="text-xs md:text-sm text-muted-foreground mt-1">
						Format selection and template picker will be wired here.
					</p>
				</div>
				<Link
					to="/app/cvs/$id/preview"
					params={{ id }}
					className="w-full sm:w-auto"
				>
					<Button
						variant="outline"
						className="gap-2 w-full sm:w-auto text-xs md:text-sm"
					>
						<ArrowLeft className="h-4 w-4" />
						<span className="hidden sm:inline">Back to preview</span>
						<span className="sm:hidden">Back</span>
					</Button>
				</Link>
			</div>

			<div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
				<Card className="lg:col-span-2 order-2 lg:order-1">
					<CardHeader className="pb-3 md:pb-6">
						<CardTitle className="text-lg md:text-xl">Preview</CardTitle>
						<CardDescription className="text-xs md:text-sm">
							The exported PDF matches this view.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div
							ref={previewRef}
							className="aspect-[8.5/11] w-full rounded-lg border border-dashed bg-white p-3 md:p-4 overflow-auto"
							style={{ width: "100%", minHeight: 0, maxHeight: "800px" }}
						>
							<TemplateComponent cv={cv} />
						</div>
					</CardContent>
				</Card>

				<div className="space-y-4 order-1 lg:order-2">
					<Card>
						<CardHeader className="pb-3 md:pb-6">
							<CardTitle className="flex items-center gap-2 text-lg md:text-xl">
								<Palette className="h-4 w-4" />
								Template
							</CardTitle>
							<CardDescription className="text-xs md:text-sm">
								Classic, modern, and minimal options.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-3 gap-2 md:gap-3">
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
						<CardHeader className="pb-3 md:pb-6">
							<CardTitle className="text-lg md:text-xl">Format</CardTitle>
							<CardDescription className="text-xs md:text-sm">
								Pick the file type for download.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							{[
								{ id: "pdf", label: "PDF (recommended)", disabled: false },
								{ id: "link", label: "Share a link", disabled: false },
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
										onChange={() => {
											setSelectedFormat(option.id as ExportFormat);
											setShareLink(null);
											setErrorMessage(null);
										}}
									/>
									<span className="text-sm">{option.label}</span>
								</label>
							))}
						</CardContent>
					</Card>

					<Button
						className="gap-2 w-full text-xs md:text-sm"
						onClick={handleExport}
						disabled={isExporting}
					>
						{exportButtonIcon}
						{exportButtonLabel}
					</Button>

					{copyFeedback && (
						<p className="text-xs text-green-600 transition-opacity duration-500">
							{copyFeedback}
						</p>
					)}

					{errorMessage && (
						<p className="text-sm text-destructive">{errorMessage}</p>
					)}
				</div>
			</div>
		</div>
	);
}
