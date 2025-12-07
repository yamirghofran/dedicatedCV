/**
 * AI Optimization Hooks
 * React Query hooks for AI-powered CV optimization
 */

import { useMutation } from "@tanstack/react-query";
import { aiService } from "@/lib/api/services";
import type {
	GenerateSummaryRequest,
	GenerateSummaryResponse,
	OptimizeDescriptionRequest,
	OptimizeDescriptionResponse,
	ScoreCVRequest,
	ScoreCVResponse,
} from "@/lib/api/types";

/**
 * Hook to optimize a CV field description using AI
 */
export function useOptimizeDescription() {
	return useMutation<
		OptimizeDescriptionResponse,
		Error,
		OptimizeDescriptionRequest
	>({
		mutationFn: (data) => aiService.optimizeDescription(data),
	});
}

/**
 * Hook to generate a professional summary using AI
 */
export function useGenerateSummary() {
	return useMutation<GenerateSummaryResponse, Error, GenerateSummaryRequest>({
		mutationFn: (data) => aiService.generateSummary(data),
	});
}

export function useScoreCv() {
	return useMutation<ScoreCVResponse, Error, ScoreCVRequest>({
		mutationFn: (data) => aiService.scoreCv(data),
	});
}
