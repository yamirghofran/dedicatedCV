import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/app/help/getting-started')({
  component: HelpGettingStartedPage,
})

function HelpGettingStartedPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-wide">Help</p>
        <h1 className="text-3xl font-bold">Getting started</h1>
        <p className="text-muted-foreground mt-1">
          Quick steps to create your first CV in under 5 minutes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fast path</CardTitle>
          <CardDescription>Follow this flow for the quickest success.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>Register or log in</li>
            <li>Use the “Create New CV” wizard</li>
            <li>Add at least 1 work experience and education</li>
            <li>Drop in 5–10 skills</li>
            <li>Preview, then export</li>
          </ol>
          <Separator />
          <p className="text-sm text-muted-foreground">
            We’ll expand this guide with videos and inline tips during editor work.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
