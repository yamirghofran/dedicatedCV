import {
	type ButtonHTMLAttributes,
	forwardRef,
	cloneElement,
	isValidElement,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const authButtonVariants = cva(
	"inline-flex items-center justify-between gap-2 rounded-full py-3 text-sm font-medium ring-offset-background transition-colors transition-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none cursor-pointer",
	{
		variants: {
			variant: {
				default:
					"bg-light-grey border border-grey text-black hover:bg-light-grey/75 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700",
				dark: "bg-black text-white hover:bg-black/80",
				primary:
					"bg-brand-blue border border-grey text-black hover:bg-brand-blue/80 dark:bg-brand-blue dark:border-gray-700 dark:text-black dark:hover:bg-brand-blue/80",
			},
			size: {
				default: "h-12 py-3",
				sm: "h-9 py-2 text-xs",
				lg: "h-14 py-4 text-base",
			},
			hasIcon: {
				true: "pl-6 pr-2",
				false: "px-6",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			hasIcon: false,
		},
	},
);

export interface AuthButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof authButtonVariants> {
	children: React.ReactNode;
	icon?: React.ReactNode;
	isGoogle?: boolean;
	loading?: boolean;
}

const LoadingSpinner = ({
	size,
	variant,
}: {
	size: "sm" | "default" | "lg" | null | undefined;
	variant: "default" | "dark" | "primary" | null | undefined;
}) => {
	const dim = size === "sm" ? 16 : size === "lg" ? 24 : 20;
	return (
		<div
			className="animate-spin"
			style={{
				width: `${dim}px`,
				height: `${dim}px`,
				borderRadius: "50%",
				border: `1px solid ${variant === "dark" ? "#ffffff" : "#000000"}`,
				borderTopColor: "transparent",
				boxSizing: "border-box",
			}}
			data-testid="loading-spinner"
		/>
	);
};

const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
	(
		{ className, variant, size, children, icon, isGoogle, loading, ...props },
		ref,
	) => {
		// Always show the icon container if there's an icon OR if we're loading
		const showIconContainer = icon || loading;
		const hasIcon = !!showIconContainer;

		return (
			<button
				className={cn(
					authButtonVariants({ variant, size, hasIcon, className }),
				)}
				ref={ref}
				disabled={props.disabled || loading}
				{...props}
			>
				<span>{children}</span>
				{showIconContainer && (
					<span
						className={cn(
							"ml-2 flex items-center justify-center rounded-full",
							size === "sm" && "h-6 w-6",
							size === "default" && "h-8 w-8",
							size === "lg" && "h-10 w-10",
							variant === "default" &&
								(isGoogle
									? "bg-transparent text-black dark:text-white"
									: "bg-brand-blue text-black border border-grey dark:border-gray-700"),
							variant === "dark" && "bg-white text-black",
							variant === "primary" &&
								"bg-white border-grey text-black dark:bg-gray-200",
						)}
					>
						{loading ? (
							<LoadingSpinner size={size} variant={variant} />
						) : icon ? (
							isValidElement(icon) ? (
								cloneElement(
									icon as React.ReactElement<{
										size?: number;
										strokeWidth?: number;
									}>,
									{
										size: 20,
										strokeWidth: 2,
									},
								)
							) : (
								icon
							)
						) : null}
					</span>
				)}
			</button>
		);
	},
);

AuthButton.displayName = "AuthButton";

export { AuthButton, authButtonVariants };
