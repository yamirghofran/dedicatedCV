import type { CVWithRelations } from "@/lib/api";

type Props = {
	cv: CVWithRelations;
};

const base = { fontFamily: '"Geist", sans-serif', color: "#111827" };
const h1 = { fontSize: 32, fontWeight: 600, margin: 0 };
const sm = { fontSize: 18, lineHeight: 1.6 };
const xs = { fontSize: 14, color: "#4b5563" };
const sectionTitle = {
	fontSize: 14,
	letterSpacing: "0.08em",
	textTransform: "uppercase",
	fontWeight: 700,
	marginBottom: 8,
};

const bulletListStyle = {
	paddingLeft: 20,
	marginTop: 6,
	marginBottom: 0,
	listStyleType: "disc",
};
const bulletItemStyle = { ...xs, color: "#111827", marginBottom: 4 };

function renderBullets(text?: string | null) {
	if (!text) return null;
	const bullets = text
		.split(/\r?\n/)
		.map((line) => line.trim().replace(/^[-•]\s*/, ""))
		.filter(Boolean);
	if (!bullets.length) return null;
	return (
		<ul style={bulletListStyle}>
			{bullets.map((b, i) => (
				<li key={i} style={bulletItemStyle}>
					{b}
				</li>
			))}
		</ul>
	);
}

export function MinimalTemplate({ cv }: Props) {
	return (
		<div
			style={{
					...base,
					background: "#fff",
					padding: 36,
					display: "grid",
					gap: 14,
				}}
		>
			<header style={{ marginBottom: 8 }}>
				<h1 style={h1}>{cv.full_name}</h1>
				<div style={xs}>
					<span>{cv.email}</span>
					{cv.phone && (
						<span>
							{" • "}
							{cv.phone}
						</span>
					)}
					{cv.location && (
						<span>
							{" • "}
							{cv.location}
						</span>
					)}
				</div>
			</header>

			{cv.summary && (
				<section>
					<div style={sectionTitle}>Summary</div>
					<p style={sm}>{cv.summary}</p>
				</section>
			)}

			{cv.work_experiences?.length > 0 && (
				<section>
					<div style={sectionTitle}>Experience</div>
					<ul style={{ paddingLeft: 16, margin: 0 }}>
						{cv.work_experiences.map((w) => (
							<li key={w.id} style={{ marginBottom: 6 }}>
								<div style={{ ...sm, fontWeight: 600 }}>
									{w.position} — {w.company}
								</div>
								<div style={xs}>
									{w.start_date} - {w.end_date || "Present"}
								</div>
								{renderBullets(w.description)}
							</li>
						))}
					</ul>
				</section>
			)}

			{cv.educations?.length > 0 && (
				<section>
					<div style={sectionTitle}>Education</div>
					<ul style={{ paddingLeft: 16, margin: 0 }}>
						{cv.educations.map((e) => (
							<li key={e.id} style={{ marginBottom: 6 }}>
								<div style={{ ...sm, fontWeight: 600 }}>
									{e.degree} — {e.institution}
								</div>
								<div style={xs}>
									{e.start_date} - {e.end_date || "Present"}
								</div>
							</li>
						))}
					</ul>
				</section>
			)}

			{cv.skills?.length > 0 && (
				<section>
					<div style={sectionTitle}>Skills</div>
					<p style={sm}>{cv.skills.map((s) => s.name).join(", ")}</p>
				</section>
			)}

			{cv.projects?.length > 0 && (
				<section>
					<div style={sectionTitle}>Projects</div>
					<ul style={{ paddingLeft: 16, margin: 0 }}>
						{cv.projects.map((p) => (
							<li key={p.id} style={{ marginBottom: 6 }}>
								<div style={{ ...sm, fontWeight: 600 }}>
									{p.name || (p as any).title}
								</div>
								{p.technologies && <div style={xs}>{p.technologies}</div>}
								{renderBullets(p.description)}
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	);
}
