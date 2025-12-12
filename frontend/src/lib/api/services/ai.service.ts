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
	ScoreCVRequest,
	ScoreCVResponse,
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

	/**
	 * Score cv on 5 pre-defined metrics
	 */
	scoreCv: async (data: ScoreCVRequest): Promise<ScoreCVResponse> => {
		return apiClient.post("/ai/score-cv", data);
	},
};
