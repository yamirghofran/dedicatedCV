import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, ArrowLeft, Palette } from 'lucide-react'

export const Route = createFileRoute('/app/cvs/$id/export')({
  component: CVExportPlaceholder,
})

function CVExportPlaceholder() {
  const { id } = Route.useParams()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Export</p>
          <h1 className="text-3xl font-bold">Export CV #{id}</h1>
          <p className="text-muted-foreground mt-1">
            Format selection and template picker will be wired here.
          </p>
        </div>
        <Link to="/app/cvs/$id/preview" params={{ id }}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to preview
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Format</CardTitle>
            <CardDescription>Pick the file type for download.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { id: 'pdf', label: 'PDF (recommended)', disabled: false },
              { id: 'docx', label: 'Word (.docx) — soon', disabled: true },
              { id: 'txt', label: 'Plain text — soon', disabled: true },
            ].map((option) => (
              <label
                key={option.id}
                htmlFor={option.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${option.disabled ? 'opacity-60' : ''}`}
              >
                <input
                  id={option.id}
                  name="format"
                  type="radio"
                  defaultChecked={option.id === 'pdf'}
                  disabled={option.disabled}
                  className="h-4 w-4"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Template
            </CardTitle>
            <CardDescription>Classic, modern, and minimal options will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="aspect-[3/4] rounded-lg border border-dashed bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Button className="gap-2" disabled>
        <Download className="h-4 w-4" />
        Download (coming soon)
      </Button>
    </div>
  )
}
