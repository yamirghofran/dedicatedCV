import { type ReactNode } from "react";

interface AuthLayoutProps {
	children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="min-h-screen">
			{/* Hero Section - Full Viewport */}
			<div className="h-screen flex items-center justify-center bg-white">
				{children}
			</div>

			{/* Technical Architecture Documentation - Revealed on Scroll */}
			<div className="bg-gray-50 py-16 px-6">
				<div className="max-w-4xl mx-auto">
					<div className="space-y-12">
						{/* Header */}
						<div className="border-b pb-6">
							<h1 className="text-3xl font-light mb-2">Technical Architecture</h1>
							<p className="text-sm text-gray-600">
								A full-stack CV management system built with modern web technologies
							</p>
							<p className="text-xs text-gray-500 mt-1">
								Class Project Documentation • Fall 2024
							</p>
						</div>

						{/* System Overview */}
						<section>
							<h2 className="text-xl font-medium mb-4">System Overview</h2>
							<p className="text-sm text-gray-700 leading-relaxed mb-4">
								DedicatedCV is a full-stack web application that enables users to create, manage, and export professional CVs.
								The system employs a RESTful API architecture with a FastAPI backend and React-based single-page application frontend.
								The application demonstrates modern software engineering practices including automated CI/CD, comprehensive testing,
								and production-grade monitoring.
							</p>
							<div className="grid grid-cols-2 gap-4 text-xs">
								<div className="border p-3 bg-white">
									<div className="font-medium mb-1">Backend</div>
									<div className="text-gray-600">FastAPI 0.115+ • Python 3.13</div>
								</div>
								<div className="border p-3 bg-white">
									<div className="font-medium mb-1">Frontend</div>
									<div className="text-gray-600">React 19 • TypeScript 5.7</div>
								</div>
								<div className="border p-3 bg-white">
									<div className="font-medium mb-1">Database</div>
									<div className="text-gray-600">PostgreSQL 17 • SQLAlchemy 2.0</div>
								</div>
								<div className="border p-3 bg-white">
									<div className="font-medium mb-1">AI Integration</div>
									<div className="text-gray-600">Groq API • Llama 3.1</div>
								</div>
							</div>
						</section>

						{/* Backend Architecture */}
						<section>
							<h2 className="text-xl font-medium mb-4">Backend Architecture</h2>

							<h3 className="text-sm font-medium mb-2 mt-4">Application Structure</h3>
							<p className="text-xs text-gray-700 leading-relaxed mb-3">
								The backend follows a layered architecture pattern with clear separation of concerns. The FastAPI application
								is initialized with lifespan management for startup/shutdown events, including Azure Application Insights telemetry
								initialization and graceful shutdown with telemetry flushing.
							</p>

							<h3 className="text-sm font-medium mb-2 mt-4">Database Layer</h3>
							<p className="text-xs text-gray-700 leading-relaxed mb-2">
								Seven SQLAlchemy 2.0 models implement the domain logic with proper foreign key relationships and cascade behaviors:
							</p>
							<ul className="text-xs text-gray-700 space-y-1 ml-4">
								<li>• <code className="bg-gray-100 px-1">User</code> - Authentication with Argon2 password hashing</li>
								<li>• <code className="bg-gray-100 px-1">CV</code> - Primary document entity with one-to-many relationships</li>
								<li>• <code className="bg-gray-100 px-1">WorkExperience</code> - Professional history with date ranges and descriptions</li>
								<li>• <code className="bg-gray-100 px-1">Education</code> - Academic credentials with GPA, honors, and thesis support</li>
								<li>• <code className="bg-gray-100 px-1">Skill</code> - Technical and soft skills with category tagging</li>
								<li>• <code className="bg-gray-100 px-1">Project</code> - Portfolio items with technology stack metadata</li>
								<li>• <code className="bg-gray-100 px-1">AlembicVersion</code> - Migration versioning</li>
							</ul>
							<p className="text-xs text-gray-700 leading-relaxed mt-2">
								All child entities implement ON DELETE CASCADE to maintain referential integrity. Alembic manages schema migrations
								with four applied migrations tracking database evolution.
							</p>

							<h3 className="text-sm font-medium mb-2 mt-4">Authentication System</h3>
							<p className="text-xs text-gray-700 leading-relaxed mb-2">
								JWT-based authentication with the following security measures:
							</p>
							<ul className="text-xs text-gray-700 space-y-1 ml-4">
								<li>• Argon2 password hashing (OWASP recommended algorithm)</li>
								<li>• HS256 JWT tokens with 30-minute expiration</li>
								<li>• Bearer token authentication via FastAPI dependencies</li>
								<li>• Authorization checks ensuring users can only access their own resources</li>
							</ul>

							<h3 className="text-sm font-medium mb-2 mt-4">API Endpoints</h3>
							<p className="text-xs text-gray-700 leading-relaxed mb-2">
								39 REST endpoints organized under <code className="bg-gray-100 px-1">/api/v1</code>:
							</p>
							<div className="grid grid-cols-2 gap-2 text-xs">
								<div className="border p-2 bg-white">
									<div className="font-medium">Authentication (4)</div>
									<div className="text-gray-600 text-[10px] mt-1">POST register, login, GET /me, test-token</div>
								</div>
								<div className="border p-2 bg-white">
									<div className="font-medium">CVs (5)</div>
									<div className="text-gray-600 text-[10px] mt-1">Full CRUD with nested eager loading</div>
								</div>
								<div className="border p-2 bg-white">
									<div className="font-medium">Sections (20)</div>
									<div className="text-gray-600 text-[10px] mt-1">5 endpoints each for work, education, skills, projects</div>
								</div>
								<div className="border p-2 bg-white">
									<div className="font-medium">AI + Health (3)</div>
									<div className="text-gray-600 text-[10px] mt-1">Description optimization, summary generation, health check</div>
								</div>
							</div>

							<h3 className="text-sm font-medium mb-2 mt-4">AI Integration</h3>
							<p className="text-xs text-gray-700 leading-relaxed">
								Groq API integration for CV content enhancement using Llama 3.1 8B Instant model. The AI service provides
								context-aware text optimization for work experience descriptions and professional summary generation with
								configurable tone (professional, casual, formal).
							</p>
						</section>

						{/* Frontend Architecture */}
						<section>
							<h2 className="text-xl font-medium mb-4">Frontend Architecture</h2>

							<h3 className="text-sm font-medium mb-2 mt-4">Routing & Data Fetching</h3>
							<p className="text-xs text-gray-700 leading-relaxed mb-2">
								TanStack Router provides type-safe, file-based routing with automatic code splitting. TanStack Query handles
								server state management with intelligent caching, background refetching, and optimistic updates. Query keys
								are namespaced by resource type (CVs, work experiences, etc.) for granular cache invalidation.
							</p>

							<h3 className="text-sm font-medium mb-2 mt-4">Component Architecture</h3>
							<p className="text-xs text-gray-700 leading-relaxed mb-2">
								Three-tier component structure:
							</p>
							<ul className="text-xs text-gray-700 space-y-1 ml-4">
								<li>• <span className="font-medium">UI Primitives</span> - Radix UI with Framer Motion animations (Sheet, Dialog, Toggle, etc.)</li>
								<li>• <span className="font-medium">Domain Components</span> - Reusable forms for CV sections with validation</li>
								<li>• <span className="font-medium">Route Components</span> - Page-level components managing business logic</li>
							</ul>

							<h3 className="text-sm font-medium mb-2 mt-4">Mobile-First Design</h3>
							<p className="text-xs text-gray-700 leading-relaxed mb-2">
								Responsive interface with adaptive patterns:
							</p>
							<ul className="text-xs text-gray-700 space-y-1 ml-4">
								<li>• Bottom sheets on mobile (85vh), side panels on desktop (540px)</li>
								<li>• Collapsible accordion sections for mobile, full cards for desktop</li>
								<li>• Floating Action Buttons for primary actions on touchscreens</li>
								<li>• Minimum 44×44px touch targets per iOS Human Interface Guidelines</li>
							</ul>

							<h3 className="text-sm font-medium mb-2 mt-4">CV Templates</h3>
							<p className="text-xs text-gray-700 leading-relaxed">
								Three PDF-optimized templates (Classic, Modern, Minimal) with A4 aspect ratio rendering. Templates use CSS
								print media queries for optimal PDF generation with proper page breaks and font scaling.
							</p>
						</section>

						{/* DevOps & Quality Assurance */}
						<section>
							<h2 className="text-xl font-medium mb-4">DevOps & Quality Assurance</h2>

							<h3 className="text-sm font-medium mb-2 mt-4">CI/CD Pipeline</h3>
							<p className="text-xs text-gray-700 leading-relaxed mb-2">
								GitHub Actions workflow with intelligent path-based job triggering. Backend and frontend jobs run conditionally
								based on changed files, optimizing CI resource usage.
							</p>
							<div className="border p-3 bg-white text-xs space-y-1 mt-2">
								<div className="font-medium">Backend Pipeline</div>
								<div className="text-gray-600">Ruff linting → MyPy type checking → Pytest → pip-audit → Semgrep SAST</div>
								<div className="font-medium mt-2">Frontend Pipeline</div>
								<div className="text-gray-600">Biome linting → TypeScript checking → Vitest → npm audit → Semgrep SAST</div>
								<div className="font-medium mt-2">Security</div>
								<div className="text-gray-600">Gitleaks secret scanning (always runs)</div>
							</div>

							<h3 className="text-sm font-medium mb-2 mt-4">Pre-commit Hooks</h3>
							<p className="text-xs text-gray-700 leading-relaxed">
								Automated code quality enforcement at commit time: Ruff formatting and linting for Python, Biome for TypeScript,
								and Gitleaks for secret detection. Hooks prevent commits that fail quality standards.
							</p>

							<h3 className="text-sm font-medium mb-2 mt-4">Testing Strategy</h3>
							<p className="text-xs text-gray-700 leading-relaxed mb-2">
								Backend: 14 pytest test files covering authentication, CRUD operations, validation, and authorization. Tests use
								in-memory SQLite for isolation and speed. Frontend: Vitest unit tests for components and hooks.
							</p>
						</section>

						{/* Security & Monitoring */}
						<section>
							<h2 className="text-xl font-medium mb-4">Security & Monitoring</h2>

							<h3 className="text-sm font-medium mb-2 mt-4">Security Measures</h3>
							<ul className="text-xs text-gray-700 space-y-1 ml-4">
								<li>• Argon2 password hashing with automatic salt generation</li>
								<li>• JWT token expiration and validation</li>
								<li>• CORS configuration restricting allowed origins</li>
								<li>• SQL injection prevention via SQLAlchemy ORM</li>
								<li>• Input validation with Pydantic models</li>
								<li>• Dependency vulnerability scanning (pip-audit, npm audit)</li>
								<li>• Static Application Security Testing with Semgrep</li>
								<li>• Secret detection with Gitleaks</li>
							</ul>

							<h3 className="text-sm font-medium mb-2 mt-4">Production Monitoring</h3>
							<p className="text-xs text-gray-700 leading-relaxed">
								Azure Application Insights integration tracks application performance, exceptions, and custom events. Middleware
								captures request/response telemetry with automatic exception tracking and correlation IDs for distributed tracing.
							</p>
						</section>

						{/* Deployment Architecture */}
						<section>
							<h2 className="text-xl font-medium mb-4">Deployment Architecture</h2>
							<p className="text-xs text-gray-700 leading-relaxed mb-3">
								Azure-based deployment with separate services for frontend and backend. Backend runs on Azure App Service with
								PostgreSQL managed database. Frontend deploys to Azure Static Web Apps or Container Instances with nginx serving
								the React SPA.
							</p>
							<p className="text-xs text-gray-700 leading-relaxed">
								Environment variables manage configuration across environments. GitHub Actions CD pipeline builds Docker images,
								pushes to Azure Container Registry, and triggers rolling deployments with zero-downtime updates.
							</p>
						</section>

						{/* Technical Decisions */}
						<section>
							<h2 className="text-xl font-medium mb-4">Key Technical Decisions</h2>
							<div className="space-y-3 text-xs">
								<div>
									<div className="font-medium">FastAPI over Django/Flask</div>
									<div className="text-gray-600">Automatic OpenAPI documentation, native async support, Pydantic validation, superior performance</div>
								</div>
								<div>
									<div className="font-medium">TanStack Router over React Router</div>
									<div className="text-gray-600">Type-safe routing, automatic code splitting, better TypeScript integration</div>
								</div>
								<div>
									<div className="font-medium">PostgreSQL over MongoDB</div>
									<div className="text-gray-600">ACID compliance, foreign key constraints, complex query support, data integrity</div>
								</div>
								<div>
									<div className="font-medium">Bun over npm/yarn</div>
									<div className="text-gray-600">3-10x faster package installation, native TypeScript support, unified toolchain</div>
								</div>
								<div>
									<div className="font-medium">Groq over OpenAI</div>
									<div className="text-gray-600">Lower latency, cost-effective for high-volume inference, open-source models</div>
								</div>
							</div>
						</section>

						{/* Conclusion */}
						<section className="border-t pt-6">
							<p className="text-xs text-gray-700 leading-relaxed">
								This architecture demonstrates modern full-stack development practices with emphasis on type safety, automated
								quality assurance, and production-grade monitoring. The system successfully balances developer experience with
								operational reliability, resulting in a maintainable and scalable application suitable for real-world deployment.
							</p>
							<div className="mt-6 text-[10px] text-gray-500">
								<div>Repository: github.com/yamirghofran/dedicatedCV</div>
								<div className="mt-1">Stack: FastAPI • React • PostgreSQL • Azure • GitHub Actions</div>
							</div>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
