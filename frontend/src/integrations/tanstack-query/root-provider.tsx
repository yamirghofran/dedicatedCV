import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

export function getContext() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				refetchOnWindowFocus: false,
				staleTime: 5 * 60 * 1000, // 5 minutes
			},
			mutations: {
				retry: false,
			},
		},
	});
	return {
		queryClient,
	};
}

export function Provider({
	children,
	queryClient,
}: {
	children: React.ReactNode;
	queryClient: QueryClient;
}) {
	useEffect(() => {
		// Listen for unauthorized events and clear the query cache
		const handleUnauthorized = () => {
			queryClient.clear();
		};

		window.addEventListener("auth:unauthorized", handleUnauthorized);

		return () => {
			window.removeEventListener("auth:unauthorized", handleUnauthorized);
		};
	}, [queryClient]);

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
