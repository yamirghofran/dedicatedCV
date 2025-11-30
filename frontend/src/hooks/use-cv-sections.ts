/**
 * Hooks for CV related sections (work experience, education, skills, projects)
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
	EducationCreate,
	EducationUpdate,
	ProjectCreate,
	ProjectUpdate,
	SkillCreate,
	SkillUpdate,
	WorkExperienceCreate,
	WorkExperienceUpdate,
} from "@/lib/api";
import {
	educationService,
	projectService,
	skillService,
	workExperienceService,
} from "@/lib/api";
import { CV_KEYS } from "./use-cvs";

export function useWorkExperienceMutations(cvId: number) {
	const queryClient = useQueryClient();
	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: CV_KEYS.detail(cvId) });

	const create = useMutation({
		mutationFn: (data: WorkExperienceCreate) =>
			workExperienceService.create(data),
		onSuccess: invalidate,
	});

	const update = useMutation({
		mutationFn: ({ id, data }: { id: number; data: WorkExperienceUpdate }) =>
			workExperienceService.update(id, data),
		onSuccess: invalidate,
	});

	const remove = useMutation({
		mutationFn: (id: number) => workExperienceService.delete(id),
		onSuccess: invalidate,
	});

	return { create, update, remove };
}

export function useEducationMutations(cvId: number) {
	const queryClient = useQueryClient();
	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: CV_KEYS.detail(cvId) });

	const create = useMutation({
		mutationFn: (data: EducationCreate) => educationService.create(data),
		onSuccess: invalidate,
	});

	const update = useMutation({
		mutationFn: ({ id, data }: { id: number; data: EducationUpdate }) =>
			educationService.update(id, data),
		onSuccess: invalidate,
	});

	const remove = useMutation({
		mutationFn: (id: number) => educationService.delete(id),
		onSuccess: invalidate,
	});

	return { create, update, remove };
}

export function useSkillMutations(cvId: number) {
	const queryClient = useQueryClient();
	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: CV_KEYS.detail(cvId) });

	const create = useMutation({
		mutationFn: (data: SkillCreate) => skillService.create(data),
		onSuccess: invalidate,
	});

	const update = useMutation({
		mutationFn: ({ id, data }: { id: number; data: SkillUpdate }) =>
			skillService.update(id, data),
		onSuccess: invalidate,
	});

	const remove = useMutation({
		mutationFn: (id: number) => skillService.delete(id),
		onSuccess: invalidate,
	});

	return { create, update, remove };
}

export function useProjectMutations(cvId: number) {
	const queryClient = useQueryClient();
	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: CV_KEYS.detail(cvId) });

	const create = useMutation({
		mutationFn: (data: ProjectCreate) => projectService.create(data),
		onSuccess: invalidate,
	});

	const update = useMutation({
		mutationFn: ({ id, data }: { id: number; data: ProjectUpdate }) =>
			projectService.update(id, data),
		onSuccess: invalidate,
	});

	const remove = useMutation({
		mutationFn: (id: number) => projectService.delete(id),
		onSuccess: invalidate,
	});

	return { create, update, remove };
}
