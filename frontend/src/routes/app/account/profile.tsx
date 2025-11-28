import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useCurrentUser } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/app/account/profile')({
  component: AccountProfilePage,
})

function AccountProfilePage() {
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading || !user) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic info</CardTitle>
          <CardDescription>Avatar, name, and email settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-lg">
              <AvatarFallback className="rounded-lg text-lg">
                {(user.full_name || user.email || 'U')[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" disabled>Change photo (soon)</Button>
          </div>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={user.full_name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email} disabled />
            </div>
          </div>
          <Button disabled>Save changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}
