import { createFileRoute } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/app/help/faq")({
	component: HelpFaqPage,
});

const faqItems = [
	{
		question: "How fast can I create a resume?",
		answer:
			"Our goal is under 5 minutes from sign-up to export using the wizard and templates.",
	},
	{
		question: "Can I make multiple CVs?",
		answer:
			"Yes. Each account can hold multiple CVs tailored to different roles.",
	},
	{
		question: "Will there be PDF templates?",
		answer:
			"Classic template is first, with modern/minimal options planned for v2.",
	},
	{
		question: "Is collaboration supported?",
		answer:
			"Not yet. Real-time collaboration is on the roadmap as a future enhancement.",
	},
];

function HelpFaqPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">FAQ</h1>
				<p className="text-muted-foreground mt-1">
					Quick answers to common questions.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Frequently asked</CardTitle>
					<CardDescription>
						We’ll expand this as we learn from users.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{faqItems.map((item, index) => (
						<div key={item.question} className="space-y-1">
							<p className="font-medium">{item.question}</p>
							<p className="text-sm text-muted-foreground">{item.answer}</p>
							{index < faqItems.length - 1 && <Separator />}
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
