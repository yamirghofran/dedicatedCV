/**
 * CV Service
 * Handles CV CRUD operations
 */

import { apiClient } from "../client";
import type { CV, CVCreate, CVUpdate, CVWithRelations } from "../types";

export const cvService = {
	/**
	 * Get all CVs for authenticated user
	 */
	async getAll(params?: { skip?: number; limit?: number }): Promise<CV[]> {
		return apiClient.get<CV[]>("cvs/", { params });
	},

	/**
	 * Get a single CV with all relations
	 */
	async getById(id: number): Promise<CVWithRelations> {
		return apiClient.get<CVWithRelations>(`cvs/${id}`);
	},

	/**
	 * Create a new CV
	 */
	async create(data: CVCreate): Promise<CV> {
		return apiClient.post<CV>("cvs/", data);
	},

	/**
	 * Update an existing CV
	 */
	async update(id: number, data: CVUpdate): Promise<CV> {
		return apiClient.put<CV>(`cvs/${id}`, data);
	},

	/**
	 * Delete a CV
	 */
	async delete(id: number): Promise<void> {
		return apiClient.delete<void>(`cvs/${id}`);
	},
};
