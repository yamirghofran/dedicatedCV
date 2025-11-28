import type { CVWithRelations } from '@/lib/api'

type Props = {
  cv: CVWithRelations
}

const baseFont = { fontFamily: '"Geist", sans-serif', color: '#111827' }
const heading = { fontSize: 24, fontWeight: 700, margin: 0 }
const textSm = { fontSize: 14, lineHeight: 1.5 }
const textXs = { fontSize: 12, color: '#4b5563' }
const sectionTitle = { fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }

export function ClassicTemplate({ cv }: Props) {
  return (
    <div style={{ ...baseFont, background: '#fff', padding: 32, border: '1px solid #e5e7eb', display: 'grid', gap: 16 }}>
      <header style={{ borderBottom: '2px solid #111827', paddingBottom: 12, marginBottom: 8 }}>
        <h1 style={heading}>{cv.full_name}</h1>
        <div style={{ ...textXs, color: '#4b5563' }}>
          <span>{cv.email}</span>
          {cv.phone && <span>{' • '}{cv.phone}</span>}
          {cv.location && <span>{' • '}{cv.location}</span>}
        </div>
      </header>

      {cv.summary && (
        <section>
          <div style={sectionTitle}>Summary</div>
          <p style={textSm}>{cv.summary}</p>
        </section>
      )}

      {cv.work_experiences?.length > 0 && (
        <section>
          <div style={sectionTitle}>Work Experience</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {cv.work_experiences.map((w) => (
              <div key={w.id}>
                <div style={{ ...textSm, fontWeight: 600 }}>
                  {w.position} — {w.company}
                </div>
                <div style={textXs}>
                  {w.start_date} - {w.end_date || 'Present'} {w.location ? `• ${w.location}` : ''}
                </div>
                {w.description && <p style={{ ...textSm, marginTop: 4 }}>{w.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {cv.educations?.length > 0 && (
        <section>
          <div style={sectionTitle}>Education</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {cv.educations.map((e) => (
              <div key={e.id}>
                <div style={{ ...textSm, fontWeight: 600 }}>
                  {e.degree} — {e.institution}
                </div>
                <div style={textXs}>
                  {e.start_date} - {e.end_date || 'Present'}
                </div>
                {e.gpa && <div style={textXs}>GPA: {e.gpa}</div>}
                {e.honors && <div style={textXs}>Honors: {e.honors}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {cv.skills?.length > 0 && (
        <section>
          <div style={sectionTitle}>Skills</div>
          <p style={textSm}>
            {cv.skills.map((s) => s.name).join(', ')}
          </p>
        </section>
      )}

      {cv.projects?.length > 0 && (
        <section>
          <div style={sectionTitle}>Projects</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {cv.projects.map((p) => (
              <div key={p.id}>
                <div style={{ ...textSm, fontWeight: 600 }}>{p.name || (p as any).title}</div>
                {p.technologies && (
                  <div style={textXs}>{p.technologies}</div>
                )}
                {p.description && <p style={{ ...textSm, marginTop: 4 }}>{p.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
