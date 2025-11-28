import { apiClient } from '../client'
import type { Skill, SkillCreate, SkillUpdate } from '../types'

export const skillService = {
  create(data: SkillCreate): Promise<Skill> {
    return apiClient.post<Skill>('skills/', data)
  },
  update(id: number, data: SkillUpdate): Promise<Skill> {
    return apiClient.put<Skill>(`skills/${id}`, data)
  },
  delete(id: number): Promise<void> {
    return apiClient.delete<void>(`skills/${id}`)
  },
}
