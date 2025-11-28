import { apiClient } from '../client'
import type { Project, ProjectCreate, ProjectUpdate } from '../types'

export const projectService = {
  create(data: ProjectCreate): Promise<Project> {
    return apiClient.post<Project>('projects/', data)
  },
  update(id: number, data: ProjectUpdate): Promise<Project> {
    return apiClient.put<Project>(`projects/${id}`, data)
  },
  delete(id: number): Promise<void> {
    return apiClient.delete<void>(`projects/${id}`)
  },
}
