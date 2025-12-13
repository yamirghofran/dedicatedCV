/**
 * Dashboard hooks
 * React Query hooks for dashboard statistics
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { DashboardStats } from "@/lib/api/types";

/**
 * Fetch dashboard statistics
 */
export function useDashboardStats() {
	return useQuery({
		queryKey: ["dashboard", "stats"],
		queryFn: () => apiClient.get<DashboardStats>("/dashboard/stats"),
		staleTime: 60 * 1000, // Consider data fresh for 1 minute
		refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
	});
}
