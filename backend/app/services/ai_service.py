"""AI optimization service using Groq LLM."""

from groq import APIConnectionError, Groq

from app.core.config import settings


class AIService:
    """Service for AI-powered CV optimization."""

    def __init__(self):
        """Initialize Groq client."""
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY not configured")
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL or "llama3-70b-8192"

    def optimize_description(
        self, original_text: str, field_type: str, context: dict
    ) -> str:
        """
        Optimize a CV field description using AI.

        Args:
            original_text: Original description text
            field_type: Type of field (work_experience, education, project, summary)
            context: Additional context (position, company, duration, etc.)

        Returns:
            Optimized description text
        """
        # Build context string
        context_parts = []
        if context.get("position"):
            context_parts.append(f"Position: {context['position']}")
        if context.get("company"):
            context_parts.append(f"Company/Institution: {context['company']}")
        if context.get("duration"):
            context_parts.append(f"Duration: {context['duration']}")

        context_str = (
            "\n".join(context_parts) if context_parts else "No additional context"
        )

        # Build prompt based on field type
        if field_type == "work_experience":
            prompt = f"""You are a professional CV writer. Optimize this work experience description to make it more impactful and achievement-oriented.

{context_str}

Original description:
{original_text}

Requirements:
- Use strong action verbs (led, architected, implemented, drove, etc.)
- Quantify achievements with metrics where possible (%, numbers, scale)
- Focus on impact and results, not just responsibilities
- Format as 3-5 concise bullet points
- Each bullet should highlight a specific achievement or responsibility
- Use professional tone
- Keep it truthful - don't invent facts, enhance what's there

Return ONLY the optimized bullet points, one per line, starting with •"""

        elif field_type == "education":
            prompt = f"""You are a professional CV writer. Optimize this education description to highlight academic achievements and relevant activities.

{context_str}

Original description:
{original_text}

Requirements:
- Highlight academic achievements, honors, awards
- Mention relevant coursework, projects, or research
- Include leadership roles, clubs, or activities if mentioned
- Format as 2-4 concise bullet points
- Use professional tone
- Keep it truthful

Return ONLY the optimized bullet points, one per line, starting with •"""

        elif field_type == "project":
            prompt = f"""You are a professional CV writer. Optimize this project description to showcase technical skills and impact.

{context_str}

Original description:
{original_text}

Requirements:
- Highlight technical skills and technologies used
- Emphasize the problem solved and impact
- Mention scale, users, or metrics if applicable
- Format as 2-4 concise bullet points
- Use professional tone
- Keep it truthful

Return ONLY the optimized bullet points, one per line, starting with •"""

        elif field_type == "summary":
            prompt = f"""You are a professional CV writer. Create a compelling professional summary based on this text.

Original text:
{original_text}

Requirements:
- 3-4 sentences maximum
- Highlight key strengths, experience, and value proposition
- Use professional, confident tone
- Focus on what makes this candidate unique
- Keep it truthful and based on the provided information

Return ONLY the optimized professional summary as a single paragraph."""

        else:
            # Default prompt
            prompt = f"""You are a professional CV writer. Improve this CV text to be more professional and impactful.

Original text:
{original_text}

Return the improved version, keeping the same general format."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,  # Balanced creativity and consistency
                max_tokens=600,  # Allow for detailed responses
            )

            optimized_text = response.choices[0].message.content.strip()
            return optimized_text

        except APIConnectionError as e:
            # Surface a clearer error so the API can return 503 (service unavailable)
            raise ConnectionError(
                "Unable to reach Groq API. Check internet connectivity and GROQ_API_KEY."
            ) from e
        except Exception as e:
            raise Exception(f"Failed to optimize text: {str(e)}") from e

    def generate_summary(self, cv_data: dict, tone: str = "professional") -> str:
        """
        Generate a professional summary based on CV data.

        Args:
            cv_data: Full CV data including work experiences, education, skills
            tone: Tone of the summary (professional, casual, formal)

        Returns:
            Generated professional summary
        """
        # Extract key information
        work_experiences = cv_data.get("work_experiences", [])
        educations = cv_data.get("educations", [])
        skills = cv_data.get("skills", [])

        # Build context
        work_summary = []
        for exp in work_experiences[:3]:  # Use top 3 experiences
            work_summary.append(f"- {exp.get('position')} at {exp.get('company')}")

        education_summary = []
        for edu in educations[:2]:  # Use top 2 education entries
            education_summary.append(
                f"- {edu.get('degree')} from {edu.get('institution')}"
            )

        skills_list = [s.get("name") for s in skills[:10]]  # Top 10 skills

        prompt = f"""You are a professional CV writer. Generate a compelling professional summary for this candidate.

Work Experience:
{chr(10).join(work_summary) if work_summary else "Not provided"}

Education:
{chr(10).join(education_summary) if education_summary else "Not provided"}

Key Skills:
{", ".join(skills_list) if skills_list else "Not provided"}

Requirements:
- Create a {tone} professional summary
- 3-4 sentences maximum
- Highlight years of experience, key expertise, and value proposition
- Focus on unique strengths and career highlights
- Make it compelling and achievement-oriented
- Use third-person perspective (e.g., "Experienced software engineer..." not "I am...")

Return ONLY the professional summary as a single paragraph."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8,  # Slightly higher for creative summaries
                max_tokens=400,
            )

            summary = response.choices[0].message.content.strip()
            return summary

        except APIConnectionError as e:
            raise ConnectionError(
                "Unable to reach Groq API. Check internet connectivity and GROQ_API_KEY."
            ) from e
        except Exception as e:
            raise Exception(f"Failed to generate summary: {str(e)}") from e
        
    def score_cv(self, cv_data: dict) -> str:
        """
        Evaluate key quality metrics for a CV:
        - Impact & Achievement Density
        - Clarity & Readability
        - Action Verb Strength
        - Professionalism

        Args:
            cv_data: Full CV data including general info, work experiences, education, skills, and projects.

        Returns:
            AI-generated score/assessment text.
        """

        # Extract sections
        general = cv_data.get("general", {})
        work_experiences = cv_data.get("work_experiences", [])
        educations = cv_data.get("educations", [])
        skills = cv_data.get("skills", [])
        projects = cv_data.get("projects", [])

        # GENERAL SECTION
        general_section = [
            f"Title: {general.get('title') or 'Not provided'}",
            f"Summary: {general.get('summary') or 'Not provided'}",
            f"Has Phone: {general.get('has_phone')}",
            f"Has Location: {general.get('has_location')}",
            f"Has Email: {general.get('has_email')}",
        ]
        general_text = "\n".join(general_section)

        # WORK EXPERIENCE
        work_section = []
        for exp in work_experiences:
            work_section.append(
                f"Position: {exp.get('position')}\n"
                f"Company: {exp.get('company')}\n"
                f"Description: {exp.get('description') or 'Not provided'}\n"
                f"Has Dates: {exp.get('has_dates')}\n"
                f"Has Location: {exp.get('has_location')}\n"
                "---"
            )
        work_text = "\n".join(work_section) if work_section else "Not provided"

        # EDUCATION
        education_section = []
        for edu in educations:
            education_section.append(
                f"Degree: {edu.get('degree')}\n"
                f"Institution: {edu.get('institution')}\n"
                f"Field of Study: {edu.get('field_of_study') or 'Not provided'}\n"
                f"Has Dates: {edu.get('has_dates')}\n"
                "---"
            )
        education_text = "\n".join(education_section) if education_section else "Not provided"

        # SKILLS
        skills_list = ", ".join([s.get("name") for s in skills]) if skills else "Not provided"

        # PROJECTS
        project_section = []
        for proj in projects:
            tech_list = ", ".join(proj.get("technologies", [])) if proj.get("technologies") else "None"
            project_section.append(
                f"Name: {proj.get('name')}\n"
                f"Description: {proj.get('description') or 'Not provided'}\n"
                f"Technologies: {tech_list}\n"
                f"Has URL: {proj.get('has_url')}\n"
                "---"
            )
        project_text = "\n".join(project_section) if project_section else "Not provided"

        # FINAL PROMPT
        prompt = f"""
        You are an expert CV analyst. Evaluate the following CV based on four specific quality metrics.

        ===========================
        GENERAL INFORMATION
        ===========================
        {general_text}

        ===========================
        WORK EXPERIENCE
        ===========================
        {work_text}

        ===========================
        EDUCATION
        ===========================
        {education_text}

        ===========================
        SKILLS
        ===========================
        {skills_list}

        ===========================
        PROJECTS
        ===========================
        {project_text}

        ===========================
        EVALUATION CRITERIA
        ===========================

        Evaluate the CV strictly on these four metrics:

        1. Impact & Achievement Density
        - Measures the presence of accomplishments, results, quantifiable outcomes,
            and whether the description goes beyond task lists.

        2. Clarity & Readability
        - Measures sentence simplicity, skimmability, structure,
            absence of filler, and overall clarity of expression.

        3. Action Verb Strength
        - Measures how consistently bullet points and descriptions start with strong,
            specific, active verbs and avoid passive language.

        4. Professionalism
        - Measures tone consistency, formality, appropriate language,
            and correctness in tense and writing style.

        ===========================
        SCORING REQUIREMENTS
        ===========================

        - Assign each metric a score from 1 to 10 (integer only).
        - Provide a short reason (1–2 sentences) explaining each score.
        - Then write a combined insight (2–3 sentences) summarizing strengths
        and priority areas for improvement.

        ===========================
        RETURN FORMAT (JSON ONLY)
        ===========================

        {{
        "impact_achievement_density": {{
            "score": <int>,
            "reason": "<short explanation>"
        }},
        "clarity_readability": {{
            "score": <int>,
            "reason": "<short explanation>"
        }},
        "action_verb_strength": {{
            "score": <int>,
            "reason": "<short explanation>"
        }},
        "professionalism": {{
            "score": <int>,
            "reason": "<short explanation>"
        }},
        "summary_insight": "<2–3 sentence combined overview>"
        }}

        Return ONLY valid JSON with no additional commentary.
        """

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4,
                max_tokens=600,
            )
            return response.choices[0].message.content.strip()
        except APIConnectionError as e:
            raise ConnectionError(
                "Unable to reach Groq API. Check internet connectivity and GROQ_API_KEY."
            ) from e
        except Exception as e:
            raise Exception(f"Failed to score CV: {str(e)}") from e


# Singleton instance
_ai_service: AIService | None = None


def get_ai_service() -> AIService:
    """Get or create AI service instance."""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service