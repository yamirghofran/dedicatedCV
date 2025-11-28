import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/app/cvs/$id/edit')({
  component: CVEditorPlaceholder,
})

function CVEditorPlaceholder() {
  const { id } = Route.useParams()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">CV Editor</p>
          <h1 className="text-3xl font-bold">Editing CV #{id}</h1>
          <p className="text-muted-foreground mt-1">
            Split-pane editor with sections, inline editing, and auto-save will live here.
          </p>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-3 py-1">Preview</span>
          <span className="rounded-full border px-3 py-1">Export</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Personal Information</p>
            <p>Work Experience</p>
            <p>Education</p>
            <p>Skills</p>
            <p>Projects</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>This will become the main editing surface with inline forms and drag-to-reorder.</p>
            <p>Auto-save indicator, keyboard shortcuts, and optimistic updates will be wired here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
