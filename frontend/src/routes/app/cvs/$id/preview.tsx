import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download } from 'lucide-react'

export const Route = createFileRoute('/app/cvs/$id/preview')({
  component: CVPreviewPlaceholder,
})

function CVPreviewPlaceholder() {
  const { id } = Route.useParams()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Preview</p>
          <h1 className="text-3xl font-bold">CV #{id} Preview</h1>
          <p className="text-muted-foreground mt-1">
            Print-optimized preview with template selection will live here.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/app/cvs/$id/edit" params={{ id }}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to editor
            </Button>
          </Link>
          <Button className="gap-2" disabled>
            <Download className="h-4 w-4" />
            Export PDF (soon)
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template canvas</CardTitle>
          <CardDescription>
            We will render a scaled paper view here with zoom controls and print styles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-[8.5/11] w-full rounded-lg border border-dashed bg-muted" />
        </CardContent>
      </Card>
    </div>
  )
}
