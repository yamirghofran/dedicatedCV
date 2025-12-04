/**
 * BottomSheet Component
 * A mobile-first sheet component that slides up from the bottom
 * Uses the existing Sheet primitive with mobile-optimized styling
 */

import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/animate-ui/components/radix/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ReactNode } from "react";

interface BottomSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: ReactNode;
	title?: string;
	description?: string;
	footer?: ReactNode;
	className?: string;
}

export function BottomSheet({
	open,
	onOpenChange,
	children,
	title,
	description,
	footer,
	className,
}: BottomSheetProps) {
	const isMobile = useIsMobile();

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side={isMobile ? "bottom" : "right"}
				className={cn(
					"flex flex-col",
					isMobile
						? "h-[85vh] rounded-t-2xl w-full p-0"
						: "w-[90vw] max-w-[540px] p-0",
					className,
				)}
			>
				{/* Drag handle for mobile */}
				{isMobile && (
					<div className="flex justify-center pt-3 pb-2">
						<div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
					</div>
				)}

				{/* Header */}
				{(title || description) && (
					<SheetHeader className="border-b px-6 py-4 text-left">
						{title && <SheetTitle className="text-lg">{title}</SheetTitle>}
						{description && (
							<SheetDescription className="text-sm">
								{description}
							</SheetDescription>
						)}
					</SheetHeader>
				)}

				{/* Scrollable content */}
				<div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

				{/* Footer */}
				{footer && (
					<SheetFooter className="border-t px-6 py-4 flex-row gap-2">
						{footer}
					</SheetFooter>
				)}
			</SheetContent>
		</Sheet>
	);
}

export { SheetClose as BottomSheetClose };
