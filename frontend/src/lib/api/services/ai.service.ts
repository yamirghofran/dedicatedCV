/**
 * AI Service
 * API calls for AI optimization features
 */

import { apiClient } from "../client";
import type {
	GenerateSummaryRequest,
	GenerateSummaryResponse,
	OptimizeDescriptionRequest,
	OptimizeDescriptionResponse,
} from "../types";

export const aiService = {
	/**
	 * Optimize a CV field description using AI
	 */
	optimizeDescription: async (
		data: OptimizeDescriptionRequest,
	): Promise<OptimizeDescriptionResponse> => {
		return apiClient.post("/ai/optimize-description", data);
	},

	/**
	 * Generate a professional summary based on CV data
	 */
	generateSummary: async (
		data: GenerateSummaryRequest,
	): Promise<GenerateSummaryResponse> => {
		return apiClient.post("/ai/generate-summary", data);
	},
};
