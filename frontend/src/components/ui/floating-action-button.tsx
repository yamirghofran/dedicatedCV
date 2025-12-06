/**
 * FloatingActionButton (FAB) Component
 * Mobile-first floating action button for primary actions
 */

import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
	onClick: () => void;
	icon?: LucideIcon;
	label?: string;
	className?: string;
	disabled?: boolean;
}

export function FloatingActionButton({
	onClick,
	icon: Icon = Plus,
	label,
	className,
	disabled = false,
}: FloatingActionButtonProps) {
	return (
		<Button
			onClick={onClick}
			disabled={disabled}
			size="lg"
			className={cn(
				"fixed bottom-6 right-6 z-50",
				"h-14 rounded-full shadow-lg",
				"transition-all duration-200",
				"hover:scale-110 active:scale-95",
				label ? "px-6 gap-2" : "w-14",
				className,
			)}
		>
			<Icon className="h-6 w-6" />
			{label && <span className="font-medium">{label}</span>}
		</Button>
	);
}
