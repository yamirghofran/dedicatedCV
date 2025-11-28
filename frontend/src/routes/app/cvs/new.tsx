import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useCreateCV } from '@/hooks/use-cvs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/app/cvs/new')({
  component: NewCVPage,
})

function NewCVPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form data
  const [title, setTitle] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [summary, setSummary] = useState('')

  const { mutate: createCV, isPending } = useCreateCV()

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!title) newErrors.title = 'CV title is required'
    if (!fullName) newErrors.fullName = 'Full name is required'
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = () => {
    createCV(
      {
        title,
        full_name: fullName,
        email,
        phone: phone || undefined,
        location: location || undefined,
        summary: summary || undefined,
      },
      {
        onSuccess: (data) => {
          navigate({ to: '/app/cvs/$id/edit', params: { id: data.id.toString() } })
        },
      }
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New CV</h1>
        <p className="text-muted-foreground mt-1">
          Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Professional Summary' : 'Review & Create'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full ${
              s <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Who are you?'}
            {step === 2 && 'Tell us about yourself'}
            {step === 3 && 'Ready to create your CV?'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Enter your basic contact information'}
            {step === 2 && 'Write a brief professional summary (2-3 sentences)'}
            {step === 3 && 'Review your information and create your CV'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  CV Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Software Engineer Resume"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Give this CV a descriptive name to help you identify it later
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={errors.fullName ? 'border-destructive' : ''}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1-555-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  placeholder="Experienced software engineer with 5+ years building scalable web applications..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Focus on your key strengths and what you bring to employers.
                  You can skip this and add it later.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CV Title</p>
                  <p className="text-lg font-semibold">{title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact</p>
                  <p>{email}</p>
                  {phone && <p>{phone}</p>}
                  {location && <p>{location}</p>}
                </div>
                {summary && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Summary</p>
                    <p className="text-sm">{summary}</p>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                After creating your CV, you'll be able to add work experience, education, skills, and projects.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? () => navigate({ to: '/app/dashboard' }) : handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            {step < 3 ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isPending}>
                {isPending ? 'Creating...' : 'Create CV & Start Editing'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
