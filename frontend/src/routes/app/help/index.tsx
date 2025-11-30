import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/app/help/")({
	component: HelpHomePage,
});

function HelpHomePage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Help Center</h1>
				<p className="text-muted-foreground mt-1">
					Guides to get you from zero to exported resume.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="h-4 w-4" />
							Getting started
						</CardTitle>
						<CardDescription>
							Step-by-step walkthrough for new users.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link to="/app/help/getting-started">
							<Button>Open guide</Button>
						</Link>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MessageCircle className="h-4 w-4" />
							FAQ
						</CardTitle>
						<CardDescription>Answers to common questions.</CardDescription>
					</CardHeader>
					<CardContent>
						<Link to="/app/help/faq">
							<Button variant="outline">Browse FAQ</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
