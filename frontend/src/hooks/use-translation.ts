import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	cvService,
	educationService,
	projectService,
	skillService,
	translationService,
	workExperienceService,
} from "@/lib/api/services";
import type {
	CVUpdate,
	CVWithRelations,
	EducationUpdate,
	ProjectUpdate,
	SkillUpdate,
	TranslatedCV,
	TranslateCVRequest,
	WorkExperienceUpdate,
} from "@/lib/api/types";
import { CV_KEYS } from "./use-cvs";

type TranslateVariables = {
	cv: CVWithRelations;
	inputLanguage: string;
	outputLanguage: string;
};

const toUpdateString = (value?: string | null) =>
	value === undefined || value === null ? undefined : value;

const toIdMap = <T extends { id?: number }>(items?: T[]) => {
	const map = new Map<number, T>();
	items?.forEach((item) => {
		if (typeof item.id === "number") {
			map.set(item.id, item);
		}
	});
	return map;
};

async function persistTranslation(
	currentCv: CVWithRelations,
	translated: TranslatedCV,
) {
	const baseUpdate: CVUpdate = {};

	const title = toUpdateString(translated.title);
	if (title !== undefined) baseUpdate.title = title;

	const fullName = toUpdateString(translated.full_name);
	if (fullName !== undefined) baseUpdate.full_name = fullName;

	const location = toUpdateString(translated.location);
	if (location !== undefined) baseUpdate.location = location;

	const summary = toUpdateString(translated.summary);
	if (summary !== undefined) baseUpdate.summary = summary;

	if (Object.keys(baseUpdate).length > 0) {
		await cvService.update(currentCv.id, baseUpdate);
	}

	const translatedWork = toIdMap(translated.work_experiences);
	const workUpdates = currentCv.work_experiences
		.map((exp) => {
			const updated = translatedWork.get(exp.id);
			if (!updated) return null;

			const payload: WorkExperienceUpdate = {};
			const company = toUpdateString(updated.company);
			if (company !== undefined) payload.company = company;

			const position = toUpdateString(updated.position);
			if (position !== undefined) payload.position = position;

			const expLocation = toUpdateString(updated.location);
			if (expLocation !== undefined) payload.location = expLocation;

			const description = toUpdateString(updated.description);
			if (description !== undefined) payload.description = description;

			return Object.keys(payload).length
				? workExperienceService.update(exp.id, payload)
				: null;
		})
		.filter(Boolean) as Promise<unknown>[];

	const translatedEducation = toIdMap(translated.educations);
	const educationUpdates = currentCv.educations
		.map((edu) => {
			const updated = translatedEducation.get(edu.id);
			if (!updated) return null;

			const payload: EducationUpdate = {};
			const institution = toUpdateString(updated.institution);
			if (institution !== undefined) payload.institution = institution;

			const degree = toUpdateString(updated.degree);
			if (degree !== undefined) payload.degree = degree;

			const field = toUpdateString(updated.field_of_study);
			if (field !== undefined) payload.field_of_study = field;

			const description = toUpdateString(updated.description);
			if (description !== undefined) payload.description = description;

			const honors = toUpdateString(updated.honors);
			if (honors !== undefined) payload.honors = honors;

			const subjects = toUpdateString(updated.relevant_subjects);
			if (subjects !== undefined) payload.relevant_subjects = subjects;

			const thesis = toUpdateString(updated.thesis_title);
			if (thesis !== undefined) payload.thesis_title = thesis;

			return Object.keys(payload).length
				? educationService.update(edu.id, payload)
				: null;
		})
		.filter(Boolean) as Promise<unknown>[];

	const translatedProjects = toIdMap(translated.projects);
	const projectUpdates = currentCv.projects
		.map((project) => {
			const updated = translatedProjects.get(project.id);
			if (!updated) return null;

			const payload: ProjectUpdate = {};
			const name = toUpdateString(updated.name);
			if (name !== undefined) payload.name = name;

			const description = toUpdateString(updated.description);
			if (description !== undefined) payload.description = description;

			const role = toUpdateString(updated.role);
			if (role !== undefined) payload.role = role;

			const technologies = toUpdateString(updated.technologies);
			if (technologies !== undefined) payload.technologies = technologies;

			return Object.keys(payload).length
				? projectService.update(project.id, payload)
				: null;
		})
		.filter(Boolean) as Promise<unknown>[];

	const translatedSkills = toIdMap(translated.skills);
	const skillUpdates = currentCv.skills
		.map((skill) => {
			const updated = translatedSkills.get(skill.id);
			if (!updated) return null;

			const payload: SkillUpdate = {};
			const name = toUpdateString(updated.name);
			if (name !== undefined) payload.name = name;

			const category = toUpdateString(updated.category);
			if (category !== undefined) payload.category = category;

			return Object.keys(payload).length
				? skillService.update(skill.id, payload)
				: null;
		})
		.filter(Boolean) as Promise<unknown>[];

	await Promise.all([
		...workUpdates,
		...educationUpdates,
		...projectUpdates,
		...skillUpdates,
	]);
}

export function useTranslateCv() {
	const queryClient = useQueryClient();

	return useMutation<CVWithRelations, Error, TranslateVariables>({
		mutationFn: async ({ cv, inputLanguage, outputLanguage }) => {
			if (inputLanguage === outputLanguage) {
				return cv;
			}

			const payload: TranslateCVRequest = {
				input_language: inputLanguage,
				output_language: outputLanguage,
				cv,
			};

			const { translation } = await translationService.translateCv(payload);
			await persistTranslation(cv, translation);
			const refreshed = await cvService.getById(cv.id);
			return refreshed;
		},
		onSuccess: (updatedCv) => {
			queryClient.setQueryData(CV_KEYS.detail(updatedCv.id), updatedCv);
			queryClient.invalidateQueries({ queryKey: CV_KEYS.lists() });
		},
	});
}
