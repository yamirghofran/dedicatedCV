import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText } from 'lucide-react'

export const Route = createFileRoute('/app/cvs/')({
  component: CVListPage,
})

function CVListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My CVs</h1>
          <p className="text-muted-foreground mt-1">
            Manage all of your resumes in one place.
          </p>
        </div>
        <Link to="/app/cvs/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create New CV
          </Button>
        </Link>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            No CVs yet
          </CardTitle>
          <CardDescription>
            Start by creating a CV or use a template to move faster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Link to="/app/cvs/new">
              <Button>Create from scratch</Button>
            </Link>
            <Button variant="outline" disabled>
              Browse templates (coming soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
