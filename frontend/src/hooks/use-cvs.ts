/**
 * CV Hooks
 * React Query hooks for CV operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cvService } from '@/lib/api'
import type { CVCreate, CVUpdate } from '@/lib/api'

export const CV_KEYS = {
  all: ['cvs'] as const,
  lists: () => [...CV_KEYS.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...CV_KEYS.lists(), filters] as const,
  details: () => [...CV_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...CV_KEYS.details(), id] as const,
}

/**
 * Get all CVs
 */
export function useCVs(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: CV_KEYS.list(params),
    queryFn: () => cvService.getAll(params),
  })
}

/**
 * Get a single CV by ID
 */
export function useCV(id: number) {
  return useQuery({
    queryKey: CV_KEYS.detail(id),
    queryFn: () => cvService.getById(id),
    enabled: !!id,
  })
}

/**
 * Create a new CV
 */
export function useCreateCV() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CVCreate) => cvService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CV_KEYS.lists() })
    },
  })
}

/**
 * Update a CV
 */
export function useUpdateCV() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CVUpdate }) =>
      cvService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CV_KEYS.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: CV_KEYS.lists() })
    },
  })
}

/**
 * Delete a CV
 */
export function useDeleteCV() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => cvService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CV_KEYS.lists() })
    },
  })
}
