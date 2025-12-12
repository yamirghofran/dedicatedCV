import { apiClient } from "../client";
import type { TranslateCVRequest, TranslateCVResponse } from "../types";

export const translationService = {
	translateCv(data: TranslateCVRequest): Promise<TranslateCVResponse> {
		return apiClient.post<TranslateCVResponse>("translation/translate-cv", data);
	},
};
