import { apiClient } from '../client'
import type {
  WorkExperience,
  WorkExperienceCreate,
  WorkExperienceUpdate,
} from '../types'

export const workExperienceService = {
  create(data: WorkExperienceCreate): Promise<WorkExperience> {
    return apiClient.post<WorkExperience>('work-experiences/', data)
  },
  update(id: number, data: WorkExperienceUpdate): Promise<WorkExperience> {
    return apiClient.put<WorkExperience>(`work-experiences/${id}`, data)
  },
  delete(id: number): Promise<void> {
    return apiClient.delete<void>(`work-experiences/${id}`)
  },
}
