import { apiClient } from "../client";
import type { Education, EducationCreate, EducationUpdate } from "../types";

export const educationService = {
	create(data: EducationCreate): Promise<Education> {
		return apiClient.post<Education>("educations/", data);
	},
	update(id: number, data: EducationUpdate): Promise<Education> {
		return apiClient.put<Education>(`educations/${id}`, data);
	},
	delete(id: number): Promise<void> {
		return apiClient.delete<void>(`educations/${id}`);
	},
};
