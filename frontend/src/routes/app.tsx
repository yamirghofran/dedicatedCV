import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authService } from '@/lib/api/services/auth.service'

// Protected route layout - all /app/* routes go through here
export const Route = createFileRoute('/app')({
  beforeLoad: async () => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw redirect({
        to: '/auth/login',
      })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  // The __root.tsx already provides the sidebar layout
  // So we just need to render the child routes
  return <Outlet />
}
