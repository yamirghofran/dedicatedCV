/**
 * API Types
 * TypeScript types matching the backend API models
 */

// User & Authentication
export interface User {
	id: number;
	email: string;
	full_name: string | null;
	is_active: boolean;
	is_superuser: boolean;
	created_at: string;
	updated_at: string;
}

export interface UserCreate {
	email: string;
	password: string;
	full_name?: string;
	is_active?: boolean;
	is_superuser?: boolean;
}

export interface Token {
	access_token: string;
	token_type: string;
}

export interface LoginCredentials {
	username: string; // email
	password: string;
}

// CV
export interface CV {
	id: number;
	user_id: number;
	title: string;
	full_name: string;
	email: string;
	phone: string | null;
	location: string | null;
	summary: string | null;
	created_at: string;
	updated_at: string;
}

export interface CVCreate {
	title: string;
	full_name: string;
	email: string;
	phone?: string;
	location?: string;
	summary?: string;
}

export interface CVUpdate {
	title?: string;
	full_name?: string;
	email?: string;
	phone?: string;
	location?: string;
	summary?: string;
}

export interface CVWithRelations extends CV {
	work_experiences: WorkExperience[];
	educations: Education[];
	skills: Skill[];
	projects: Project[];
}

// Work Experience
export interface WorkExperience {
	id: number;
	cv_id: number;
	company: string;
	position: string;
	location: string | null;
	start_date: string;
	end_date: string | null;
	description: string | null;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export interface WorkExperienceCreate {
	cv_id: number;
	company: string;
	position: string;
	location?: string;
	start_date: string;
	end_date?: string;
	description?: string;
	display_order?: number;
}

export interface WorkExperienceUpdate {
	company?: string;
	position?: string;
	location?: string;
	start_date?: string;
	end_date?: string;
	description?: string;
	display_order?: number;
}

// Education
export interface Education {
	id: number;
	cv_id: number;
	institution: string;
	degree: string;
	field_of_study: string | null;
	start_date: string;
	end_date: string | null;
	description: string | null;
	display_order: number;
	gpa: string | null;
	honors: string | null;
	relevant_subjects: string | null;
	thesis_title: string | null;
	created_at: string;
	updated_at: string;
}

export interface EducationCreate {
	cv_id: number;
	institution: string;
	degree: string;
	field_of_study?: string;
	start_date: string;
	end_date?: string;
	description?: string;
	display_order?: number;
	gpa?: number;
	honors?: string;
	relevant_subjects?: string;
	thesis_title?: string;
}

export interface EducationUpdate {
	institution?: string;
	degree?: string;
	field_of_study?: string;
	start_date?: string;
	end_date?: string;
	description?: string;
	display_order?: number;
	gpa?: number;
	honors?: string;
	relevant_subjects?: string;
	thesis_title?: string;
}

// Skill
export interface Skill {
	id: number;
	cv_id: number;
	name: string;
	category: string | null;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export interface SkillCreate {
	cv_id: number;
	name: string;
	category?: string;
	display_order?: number;
}

export interface SkillUpdate {
	name?: string;
	category?: string;
	display_order?: number;
}

// Project
export interface Project {
	id: number;
	cv_id: number;
	name: string;
	description: string | null;
	role: string | null;
	technologies: string | null;
	start_date: string | null;
	end_date: string | null;
	url: string | null;
	github_url: string | null;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export interface ProjectCreate {
	cv_id: number;
	name: string;
	description?: string;
	role?: string;
	technologies?: string;
	start_date?: string;
	end_date?: string;
	url?: string;
	github_url?: string;
	display_order?: number;
}

export interface ProjectUpdate {
	name?: string;
	description?: string;
	role?: string;
	technologies?: string;
	start_date?: string;
	end_date?: string;
	url?: string;
	github_url?: string;
	display_order?: number;
}

// Dashboard
export interface IncompleteCVInfo {
	id: number;
	title: string;
	completion_rate: number;
	missing_sections: string[];
}

export interface DashboardStats {
	total_cvs: number;
	templates_used: number;
	avg_completion_rate: number;
	last_activity: string;
	recent_cvs: CV[];
	incomplete_cvs: IncompleteCVInfo[];
}

// Health
export interface HealthCheck {
	status: string;
	app_name: string;
	version: string;
	database: string;
}

// AI Optimization
export interface OptimizeDescriptionRequest {
	original_text: string;
	field_type: "work_experience" | "education" | "project" | "summary";
	context?: {
		position?: string;
		company?: string;
		duration?: string;
		[key: string]: string | undefined;
	};
}

export interface OptimizeDescriptionResponse {
	original: string;
	optimized: string;
}

export interface GenerateSummaryRequest {
	cv_id: number;
	tone?: "professional" | "casual" | "formal";
}

export interface GenerateSummaryResponse {
	summary: string;
}
