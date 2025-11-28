# API Integration Documentation

Complete guide for using the backend API from the React frontend.

## Architecture Overview

The frontend uses a modular, layered architecture for API integration:

```
src/
├── lib/api/
│   ├── config.ts          # API configuration (base URL, version)
│   ├── client.ts          # HTTP client with auth & error handling
│   ├── types.ts           # TypeScript types matching backend models
│   ├── services/          # Service layer for API calls
│   │   ├── auth.service.ts
│   │   ├── cv.service.ts
│   │   └── index.ts
│   └── index.ts           # Main export
└── hooks/
    ├── use-auth.ts        # React Query hooks for authentication
    └── use-cvs.ts         # React Query hooks for CVs
```

## Configuration

### Environment Variables

Create `.env` file in frontend root:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1
```

### API Client

The API client (`src/lib/api/client.ts`) provides:
- Automatic authentication token injection
- Error handling with custom ApiError class
- Type-safe request/response handling
- Support for query parameters

## Services Layer

### Authentication Service

Located at `src/lib/api/services/auth.service.ts`

**Methods:**
- `register(data: UserCreate)` - Register new user
- `login(credentials)` - Login and store token
- `logout()` - Clear auth data
- `getCurrentUser()` - Get authenticated user
- `testToken()` - Validate current token
- `isAuthenticated()` - Check auth status

**Token Management:**
- Tokens stored in localStorage as `access_token`
- User data cached in localStorage as `user`
- Automatic token injection in all authenticated requests

### CV Service

Located at `src/lib/api/services/cv.service.ts`

**Methods:**
- `getAll(params?)` - List all user CVs with pagination
- `getById(id)` - Get single CV with relations
- `create(data)` - Create new CV
- `update(id, data)` - Update existing CV
- `delete(id)` - Delete CV (cascade deletes relations)

## React Query Hooks

### Authentication Hooks

Located at `src/hooks/use-auth.ts`

```tsx
import { useLogin, useRegister, useLogout, useCurrentUser } from '@/hooks/use-auth'

// Login
const { mutate: login, isPending } = useLogin()
login({ username: 'user@example.com', password: 'pass123' })

// Register
const { mutate: register } = useRegister()
register({ email: 'new@example.com', password: 'pass123', full_name: 'User' })

// Get current user
const { data: user, isLoading } = useCurrentUser()

// Logout
const { mutate: logout } = useLogout()
logout()
```

### CV Hooks

Located at `src/hooks/use-cvs.ts`

```tsx
import { useCVs, useCV, useCreateCV, useUpdateCV, useDeleteCV } from '@/hooks/use-cvs'

// List CVs
const { data: cvs, isLoading } = useCVs({ skip: 0, limit: 10 })

// Get single CV
const { data: cv } = useCV(1)

// Create CV
const { mutate: createCV } = useCreateCV()
createCV({
  title: 'Software Engineer',
  full_name: 'John Doe',
  email: 'john@example.com'
})

// Update CV
const { mutate: updateCV } = useUpdateCV()
updateCV({ id: 1, data: { title: 'Senior Engineer' } })

// Delete CV
const { mutate: deleteCV } = useDeleteCV()
deleteCV(1)
```

## TypeScript Types

All backend models have TypeScript equivalents in `src/lib/api/types.ts`:

```typescript
import type {
  User,
  UserCreate,
  CV,
  CVCreate,
  CVUpdate,
  CVWithRelations,
  WorkExperience,
  Education,
  Skill,
  Project,
} from '@/lib/api'
```

### Key Types

**User & Auth:**
- `User` - User model
- `UserCreate` - Registration data
- `Token` - JWT token response
- `LoginCredentials` - Login form data

**CV:**
- `CV` - Basic CV model
- `CVCreate` - CV creation data
- `CVUpdate` - CV update data (all fields optional)
- `CVWithRelations` - CV with nested work_experiences, educations, skills, projects

**Related Models:**
- `WorkExperience`, `WorkExperienceCreate`, `WorkExperienceUpdate`
- `Education`, `EducationCreate`, `EducationUpdate`
- `Skill`, `SkillCreate`, `SkillUpdate`
- `Project`, `ProjectCreate`, `ProjectUpdate`

## Usage Examples

### Complete Login Flow

```tsx
import { useLogin } from '@/hooks/use-auth'
import { useState } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { mutate: login, isPending, error } = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(
      { username: email, password },
      {
        onSuccess: (data) => {
          console.log('Logged in as:', data.user.email)
          // Navigate to dashboard
        },
        onError: (err) => {
          console.error('Login failed:', err)
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Login'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </form>
  )
}
```

### CV List with Create

```tsx
import { useCVs, useCreateCV } from '@/hooks/use-cvs'

function CVList() {
  const { data: cvs, isLoading } = useCVs()
  const { mutate: createCV, isPending } = useCreateCV()

  const handleCreate = () => {
    createCV({
      title: 'My Resume',
      full_name: 'John Doe',
      email: 'john@example.com',
      summary: 'Experienced developer',
    })
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <button onClick={handleCreate} disabled={isPending}>
        Create CV
      </button>

      {cvs?.map((cv) => (
        <div key={cv.id}>
          <h3>{cv.title}</h3>
          <p>{cv.full_name}</p>
        </div>
      ))}
    </div>
  )
}
```

### CV Detail with Relations

```tsx
import { useCV } from '@/hooks/use-cvs'

function CVDetail({ id }: { id: number }) {
  const { data: cv, isLoading } = useCV(id)

  if (isLoading) return <div>Loading...</div>
  if (!cv) return <div>Not found</div>

  return (
    <div>
      <h1>{cv.title}</h1>
      <h2>{cv.full_name}</h2>

      <h3>Work Experience</h3>
      {cv.work_experiences.map((exp) => (
        <div key={exp.id}>
          <h4>{exp.position} at {exp.company}</h4>
          <p>{exp.description}</p>
        </div>
      ))}

      <h3>Education</h3>
      {cv.educations.map((edu) => (
        <div key={edu.id}>
          <h4>{edu.degree} - {edu.institution}</h4>
          {edu.gpa && <p>GPA: {edu.gpa}</p>}
        </div>
      ))}

      <h3>Skills</h3>
      {cv.skills.map((skill) => (
        <span key={skill.id}>{skill.name}</span>
      ))}

      <h3>Projects</h3>
      {cv.projects.map((project) => (
        <div key={project.id}>
          <h4>{project.name}</h4>
          <p>{project.description}</p>
          {project.url && <a href={project.url}>View Project</a>}
        </div>
      ))}
    </div>
  )
}
```

## Error Handling

The API client throws `ApiError` instances with:
- `message` - Error description
- `status` - HTTP status code
- `data` - Response body (if available)

```tsx
import { ApiError } from '@/lib/api'

const { mutate: createCV } = useCreateCV()

createCV(data, {
  onError: (error) => {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        // Not authenticated
      } else if (error.status === 422) {
        // Validation error
        console.log(error.data)
      }
    }
  },
})
```

## Query Key Management

React Query keys are organized hierarchically:

```typescript
// Authentication
['auth', 'current-user']
['auth', 'test-token']

// CVs
['cvs']                          // Base key
['cvs', 'list']                  // All lists
['cvs', 'list', { skip: 0 }]    // Specific list with filters
['cvs', 'detail']                // All details
['cvs', 'detail', 1]             // Specific CV
```

This allows for precise cache invalidation and updates.

## Best Practices

1. **Use Hooks**: Always use provided hooks instead of calling services directly
2. **Error Handling**: Provide onError callbacks for mutations
3. **Loading States**: Check `isLoading` and `isPending` for UI feedback
4. **Optimistic Updates**: Consider optimistic updates for better UX
5. **Cache Management**: Leverage React Query's automatic cache invalidation
6. **Type Safety**: Import types from `@/lib/api` for all API data

## Adding New Endpoints

To add a new resource (e.g., Comments):

1. **Add types** in `src/lib/api/types.ts`:
```typescript
export interface Comment {
  id: number
  // ...fields
}
```

2. **Create service** in `src/lib/api/services/comment.service.ts`:
```typescript
export const commentService = {
  async getAll() { /* ... */ },
  async create(data) { /* ... */ },
}
```

3. **Export service** in `src/lib/api/services/index.ts`:
```typescript
export * from './comment.service'
```

4. **Create hooks** in `src/hooks/use-comments.ts`:
```typescript
export function useComments() {
  return useQuery({
    queryKey: ['comments'],
    queryFn: () => commentService.getAll(),
  })
}
```

## Running the Stack

```bash
# Terminal 1: Backend
cd backend
uv sync --all-extras
make docker-up
make upgrade
make run

# Terminal 2: Frontend
cd frontend
bun install
bun run dev
```

Frontend runs on `http://localhost:3000`
Backend runs on `http://localhost:8000`
API docs at `http://localhost:8000/docs`

## Development Tools

- **React Query Devtools**: Available in development mode (bottom-right corner)
- **TanStack Router Devtools**: Available in development mode
- **API Documentation**: Swagger UI at `/docs` endpoint

## Next Steps

1. Add authentication guards for protected routes
2. Implement error boundaries for API errors
3. Add loading skeletons for better UX
4. Implement optimistic updates for mutations
5. Add toast notifications for success/error feedback
6. Create reusable form components for CV editing
7. Add pagination controls for CV lists
8. Implement search and filtering
