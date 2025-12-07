import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/help/getting-started")({
	component: HelpGettingStartedPage,
});

function HelpGettingStartedPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Getting started</h1>
				<p className="text-muted-foreground mt-1">
					Quick steps to create your first CV in under 5 minutes.
				</p>
			</div>
		</div>
	);
}
