import type { CVWithRelations } from "@/lib/api";

type Props = {
	cv: CVWithRelations;
};

const base = { fontFamily: '"Geist", sans-serif', color: "#0f172a" };
const title = { fontSize: 32, fontWeight: 700, margin: 0 };
const small = { fontSize: 18, lineHeight: 1.6 };
const xs = { fontSize: 14, color: "#475569" };
const sectionTitle = {
	fontSize: 14,
	letterSpacing: "0.08em",
	textTransform: "uppercase",
	fontWeight: 700,
	marginBottom: 8,
};

const bulletListStyle = {
	paddingLeft: 22,
	marginTop: 6,
	marginBottom: 0,
	listStyleType: "disc",
};
const bulletItemStyle = { fontSize: 15, lineHeight: 1.5, color: "#0f172a" };

function renderBullets(text?: string | null) {
	if (!text) return null;
	const bullets = text
		.split(/\r?\n/)
		.map((line) => line.trim().replace(/^[-•]\s*/, ""))
		.filter(Boolean);
	if (!bullets.length) return null;
	return (
		<ul style={bulletListStyle}>
			{bullets.map((b) => (
				<li key={b} style={bulletItemStyle}>
					{b}
				</li>
			))}
		</ul>
	);
}

export function ModernTemplate({ cv }: Props) {
	return (
		<div
			style={{
				...base,
				background: "#f8fafc",
				padding: 36,
				display: "grid",
				gap: 18,
			}}
		>
			<header
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					gap: 12,
					marginBottom: 8,
				}}
			>
				<div>
					<h1 style={title}>{cv.full_name}</h1>
					<div style={xs}>
						<span>{cv.email}</span>
						{cv.phone && (
							<span>
								{" • "}
								{cv.phone}
							</span>
						)}
					</div>
				</div>
				{cv.location && (
					<span
						style={{
							background: "#0f172a",
							color: "#fff",
							padding: "6px 10px",
							borderRadius: 999,
							fontSize: 12,
						}}
					>
						{cv.location}
					</span>
				)}
			</header>

			{cv.summary && (
				<section>
					<div style={sectionTitle}>Profile</div>
					<p style={small}>{cv.summary}</p>
				</section>
			)}

			{cv.work_experiences?.length > 0 && (
				<section>
					<div style={sectionTitle}>Experience</div>
					<div style={{ display: "grid", gap: 12 }}>
						{cv.work_experiences.map((w) => (
							<div
								key={w.id}
								style={{
									border: "1px solid #e2e8f0",
									background: "#fff",
									borderRadius: 8,
									padding: 12,
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										fontSize: 14,
										fontWeight: 600,
									}}
								>
									<span>{w.position}</span>
									<span style={xs}>
										{w.start_date} - {w.end_date || "Present"}
									</span>
								</div>
								<div style={xs}>
									{w.company} {w.location ? `• ${w.location}` : ""}
								</div>
								{renderBullets(w.description)}
							</div>
						))}
					</div>
				</section>
			)}

			<div
				style={{
					display: "grid",
					gap: 12,
					gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
				}}
			>
				{cv.educations?.length > 0 && (
					<section>
						<div style={sectionTitle}>Education</div>
						<div style={{ display: "grid", gap: 8 }}>
							{cv.educations.map((e) => (
								<div
									key={e.id}
									style={{
										border: "1px solid #e2e8f0",
										background: "#fff",
										borderRadius: 8,
										padding: 12,
									}}
								>
									<div style={{ ...small, fontWeight: 600 }}>
										{e.institution}
									</div>
									<div style={xs}>
										{e.degree} — {e.start_date} - {e.end_date || "Present"}
									</div>
									{e.gpa && <div style={xs}>GPA: {e.gpa}</div>}
								</div>
							))}
						</div>
					</section>
				)}

				{cv.skills?.length > 0 && (
					<section>
						<div style={sectionTitle}>Skills</div>
						<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
							{cv.skills.map((s) => (
								<span
									key={s.id}
									style={{
										border: "1px solid #e2e8f0",
										background: "#fff",
										borderRadius: 999,
										padding: "4px 10px",
										fontSize: 12,
									}}
								>
									{s.name}
								</span>
							))}
						</div>
					</section>
				)}
			</div>

			{cv.projects?.length > 0 && (
				<section>
					<div style={sectionTitle}>Projects</div>
					<div style={{ display: "grid", gap: 12 }}>
						{cv.projects.map((p) => (
							<div
								key={p.id}
								style={{
									border: "1px solid #e2e8f0",
									background: "#fff",
									borderRadius: 8,
									padding: 12,
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										fontSize: 14,
										fontWeight: 600,
									}}
								>
									<span>{p.name}</span>
									{(p.start_date || p.end_date) && (
										<span style={xs}>
											{p.start_date || ""} {p.end_date ? `- ${p.end_date}` : ""}
										</span>
									)}
								</div>
								{p.technologies && <div style={xs}>{p.technologies}</div>}
								{renderBullets(p.description)}
							</div>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
