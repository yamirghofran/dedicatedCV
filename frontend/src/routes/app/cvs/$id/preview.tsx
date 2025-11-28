import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download } from 'lucide-react'
import { useCV } from '@/hooks/use-cvs'
import { Skeleton } from '@/components/ui/skeleton'
import { ClassicTemplate, ModernTemplate, MinimalTemplate } from '@/templates'

export const Route = createFileRoute('/app/cvs/$id/preview')({
  component: CVPreviewPlaceholder,
})

function CVPreviewPlaceholder() {
  const { id } = Route.useParams()
  const cvId = Number(id)
  const { data: cv, isLoading } = useCV(cvId)
  const [selectedTemplate, setSelectedTemplate] = useState<'Classic' | 'Modern' | 'Minimal'>('Classic')

  useEffect(() => {
    const stored = localStorage.getItem(`cv_template_${cvId}`)
    if (stored === 'Modern' || stored === 'Minimal' || stored === 'Classic') {
      setSelectedTemplate(stored)
    }
  }, [cvId])

  useEffect(() => {
    localStorage.setItem(`cv_template_${cvId}`, selectedTemplate)
  }, [cvId, selectedTemplate])

  const TemplateComponent = useMemo(() => {
    switch (selectedTemplate) {
      case 'Modern':
        return ModernTemplate
      case 'Minimal':
        return MinimalTemplate
      default:
        return ClassicTemplate
    }
  }, [selectedTemplate])

  if (isLoading || !cv) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="aspect-[8.5/11] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Preview</p>
          <h1 className="text-3xl font-bold">{cv.title}</h1>
          <p className="text-muted-foreground mt-1">
            Print-optimized preview with template selection.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(['Classic', 'Modern', 'Minimal'] as const).map((template) => (
              <Button
                key={template}
                variant={selectedTemplate === template ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTemplate(template)}
              >
                {template}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
        <Link to="/app/cvs/$id/edit" params={{ id }} state={{ cvTitle: cv.title }}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to editor
          </Button>
        </Link>
          <Link
            to="/app/cvs/$id/export"
            params={{ id }}
            state={{ cvTitle: cv.title }}
          >
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Go to export
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>A4 ratio preview; scroll if content overflows.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-lg border border-dashed bg-muted p-6 print:bg-white"
            style={{
              width: 800,
              maxWidth: '100%',
              aspectRatio: '8.5 / 11',
              overflow: 'auto',
              margin: '0 auto',
            }}
          >
            <TemplateComponent cv={cv} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
