# CV Maker - Product Requirements & UX Design Document

> **Philosophy**: "It Just Works" - Steve Jobs
>
> Simple. Clean. Powerful. Zero friction between the user and their perfect resume.

---

## Table of Contents

1. [Product Vision](#product-vision)
2. [User Stories](#user-stories)
3. [Information Architecture](#information-architecture)
4. [Page Structure & Routing](#page-structure--routing)
5. [UX Flows](#ux-flows)
6. [Component Architecture](#component-architecture)
7. [Design Principles](#design-principles)
8. [Implementation Plan](#implementation-plan)

---

## Product Vision

**Mission**: Enable anyone to create a professional resume in under 5 minutes.

**Core Values**:
- **Simplicity**: No learning curve. Intuitive from the first click.
- **Speed**: Fast data entry, instant feedback, zero lag.
- **Quality**: Beautiful output that looks professional by default.
- **Flexibility**: Multiple CVs for different purposes without complexity.

**The Promise**: From sign-up to printed resume in 5 minutes or less.

---

## User Stories

### Primary Flow
> "As a job seeker, I want to create a professional resume quickly so I can apply for jobs immediately."

**User Journey**:
1. Land on homepage → See clear value proposition
2. Sign up in 30 seconds → Email + password, that's it
3. Create first CV → Guided, step-by-step, no overwhelming forms
4. Add experience → Click, type, done. Dates auto-format.
5. Review & export → See beautiful preview, download PDF
6. Apply to job → Resume ready in under 5 minutes

### Secondary Flows
- **Multi-CV Management**: "I need different resumes for software engineering vs. data science roles"
- **Quick Updates**: "I just got a new job, need to update my resume in 30 seconds"
- **Portfolio Showcase**: "I want to include my GitHub projects and live demos"
- **Academic Focus**: "I need to highlight my GPA, honors, and thesis work"

---

## Information Architecture

### Site Map

```
/ (Public)
├── Landing Page
├── /auth
│   ├── /login
│   └── /register
│
└── /app (Protected - Requires Auth)
    ├── /dashboard (Home)
    ├── /cvs
    │   ├── /new (Create CV wizard)
    │   └── /:id
    │       ├── /edit (Full editor)
    │       ├── /preview (Read-only view)
    │       └── /export (PDF generation)
    │
    ├── /account
    │   ├── /profile
    │   ├── /settings
    │   └── /security
    │
    └── /help
        ├── /getting-started
        └── /faq
```

### Data Hierarchy

```
User
 └── CVs (Multiple)
      ├── Personal Info (Embedded)
      ├── Work Experiences (Ordered list)
      ├── Education (Ordered list)
      ├── Skills (Categorized, ordered)
      └── Projects (Ordered list)
```

---

## Page Structure & Routing

### 1. Public Pages (Unauthenticated)

#### `/` - Landing Page
**Purpose**: Convert visitors to users in 30 seconds

**Layout**:
```
┌─────────────────────────────────────────┐
│ [Logo]              [Login] [Sign Up]  │
├─────────────────────────────────────────┤
│                                          │
│   Create a Professional Resume           │
│   in Under 5 Minutes                     │
│                                          │
│   [Get Started Free] →                   │
│                                          │
├─────────────────────────────────────────┤
│ ✓ Multiple CV templates                 │
│ ✓ Easy editing & updates                │
│ ✓ Professional PDF export                │
└─────────────────────────────────────────┘
```

**Features**:
- Hero section with clear value prop
- Single CTA: "Get Started Free"
- No feature overload - keep it simple
- Social proof (optional): "Join 10,000+ professionals"

---

#### `/auth/register` - Sign Up
**Purpose**: Frictionless account creation

**Layout**: Clean centered form
```
┌──────────────────────┐
│   Create Account     │
│                      │
│ Email                │
│ ┌──────────────────┐ │
│ │                  │ │
│ └──────────────────┘ │
│                      │
│ Password             │
│ ┌──────────────────┐ │
│ │                  │ │
│ └──────────────────┘ │
│                      │
│ Full Name (Optional) │
│ ┌──────────────────┐ │
│ │                  │ │
│ └──────────────────┘ │
│                      │
│   [Create Account]   │
│                      │
│ Already have account?│
│      [Log In]        │
└──────────────────────┘
```

**UX Details**:
- Email validation in real-time
- Password strength indicator
- Full name optional (can add later)
- Auto-login after registration
- Redirect to `/app/cvs/new` (create first CV immediately)

**Error Handling**:
- "Email already exists" → Suggest login instead
- "Password too weak" → Show requirements
- Network errors → Friendly retry message

---

#### `/auth/login` - Sign In
**Purpose**: Quick access to existing account

**Layout**: Same style as register
```
┌──────────────────────┐
│   Welcome Back       │
│                      │
│ Email                │
│ ┌──────────────────┐ │
│ │                  │ │
│ └──────────────────┘ │
│                      │
│ Password             │
│ ┌──────────────────┐ │
│ │                  │ │
│ └──────────────────┘ │
│                      │
│   [Log In]           │
│                      │
│ Don't have account?  │
│     [Sign Up]        │
└──────────────────────┘
```

**UX Details**:
- Remember me checkbox (optional)
- Forgot password link (future feature)
- Auto-redirect to `/app/dashboard` after login
- Show loading state during authentication

---

### 2. Protected Pages (Authenticated - Inside Sidebar Layout)

All authenticated pages use the sidebar layout we just built.

**Sidebar Navigation**:
```
┌─────────────────────┐
│ [CV Maker]          │  ← Header (collapsible)
├─────────────────────┤
│ Navigation          │
│ → Dashboard         │  ← Always visible
│ ▼ My CVs            │  ← Expandable
│   • All CVs         │
│   • Create New      │
│   • Templates       │
│ ▼ CV Sections       │  ← Expandable
│   • Work Experience │
│   • Education       │
│   • Skills          │
│   • Projects        │
├─────────────────────┤
│ [User Avatar]       │  ← Footer dropdown
│ Guest User          │
│ guest@cv.com        │
└─────────────────────┘
```

---

#### `/app/dashboard` - User Dashboard
**Purpose**: Command center for all CVs

**Breadcrumb**: `CV Maker > Dashboard`

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Welcome back, John 👋                           │
│                                                 │
│ Your CVs                        [+ Create New]  │
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌─────────────┐  ┌─────────────┐  ┌──────────┐│
│ │ Software    │  │ Data Science│  │ Academic ││
│ │ Engineer CV │  │ Resume      │  │ CV       ││
│ │             │  │             │  │          ││
│ │ Updated 2d  │  │ Updated 1w  │  │ New      ││
│ │             │  │             │  │          ││
│ │ [View] [⋯]  │  │ [View] [⋯]  │  │ [Edit]   ││
│ └─────────────┘  └─────────────┘  └──────────┘│
│                                                 │
├─────────────────────────────────────────────────┤
│ Quick Actions                                   │
│ • Add work experience to "Software Engineer CV" │
│ • Complete education section                    │
└─────────────────────────────────────────────────┘
```

**Features**:
- Grid of CV cards (3 columns on desktop, 1 on mobile)
- Each card shows: title, last updated, preview thumbnail
- Card actions: View, Edit, Duplicate, Delete
- Empty state: "Create your first CV to get started"
- Quick create button always visible

**UX Details**:
- Click card → Navigate to `/app/cvs/:id/edit`
- Hover card → Show quick actions
- Delete requires confirmation: "Delete 'Software Engineer CV'? This cannot be undone."

---

#### `/app/cvs/new` - Create New CV (Wizard)
**Purpose**: Get from zero to complete CV structure in 60 seconds

**Breadcrumb**: `CV Maker > Create CV`

**Step 1: Basic Information**
```
┌────────────────────────────────────────┐
│ Step 1 of 3: Who are you?              │
├────────────────────────────────────────┤
│                                        │
│ CV Title (e.g., "Software Engineer")  │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Full Name                              │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Email                                  │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Phone (Optional)                       │
│ Location (Optional)                    │
│                                        │
│           [Cancel]  [Next: Summary →]  │
└────────────────────────────────────────┘
```

**Step 2: Professional Summary**
```
┌────────────────────────────────────────┐
│ Step 2 of 3: Tell us about yourself    │
├────────────────────────────────────────┤
│                                        │
│ Professional Summary (2-3 sentences)   │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ │                                    │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Tip: Focus on your key strengths and  │
│ what you bring to employers.           │
│                                        │
│ [← Back]  [Skip]  [Next: Sections →]   │
└────────────────────────────────────────┘
```

**Step 3: Choose Sections**
```
┌────────────────────────────────────────┐
│ Step 3 of 3: What to include?          │
├────────────────────────────────────────┤
│                                        │
│ Select sections for your CV:           │
│                                        │
│ ☑ Work Experience (Recommended)        │
│ ☑ Education (Recommended)              │
│ ☑ Skills                               │
│ ☑ Projects                             │
│                                        │
│ You can always add/remove later.       │
│                                        │
│      [← Back]  [Create CV & Start →]   │
└────────────────────────────────────────┘
```

**After Completion**:
- Auto-redirect to `/app/cvs/:id/edit`
- Show success toast: "CV created! Let's add your experience."
- Highlight first empty section to fill

---

#### `/app/cvs/:id/edit` - CV Editor (Main Workspace)
**Purpose**: Intuitive, distraction-free editing experience

**Breadcrumb**: `CV Maker > My CVs > Software Engineer CV`

**Layout**: Split view (Desktop) / Tabbed view (Mobile)

```
┌─────────────────────────────────────────────────────────────┐
│ Software Engineer CV              [Preview] [Export] [Save] │
├──────────────────┬──────────────────────────────────────────┤
│ SECTIONS         │                                          │
│                  │  PERSONAL INFORMATION                    │
│ Personal Info    │  ┌────────────────────────────────────┐  │
│ Work Experience  │  │ Full Name: [John Doe          ]  │  │
│ Education        │  │ Email:     [john@example.com  ]  │  │
│ Skills           │  │ Phone:     [+1-555-0000       ]  │  │
│ Projects         │  │ Location:  [San Francisco, CA ]  │  │
│                  │  └────────────────────────────────────┘  │
│                  │                                          │
│                  │  Professional Summary                    │
│                  │  ┌────────────────────────────────────┐  │
│                  │  │ [Text area for summary...]       │  │
│                  │  └────────────────────────────────────┘  │
│                  │                                          │
│                  │  WORK EXPERIENCE                         │
│                  │  ┌────────────────────────────────────┐  │
│                  │  │ ⋮ Senior Developer                │  │
│                  │  │   Tech Corp | 2022-2024           │  │
│                  │  │   [Edit] [Delete]                 │  │
│                  │  └────────────────────────────────────┘  │
│                  │  [+ Add Experience]                      │
│                  │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

**Section: Work Experience**

Add/Edit Modal:
```
┌──────────────────────────────────────┐
│ Add Work Experience            [✕]   │
├──────────────────────────────────────┤
│ Company *                            │
│ ┌──────────────────────────────────┐ │
│ │ Tech Corp                        │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Position *                           │
│ ┌──────────────────────────────────┐ │
│ │ Senior Software Engineer         │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Location                             │
│ ┌──────────────────────────────────┐ │
│ │ San Francisco, CA                │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Start Date *        End Date         │
│ ┌──────────────┐   ┌──────────────┐ │
│ │ Jan 2022   ▼│   │ Nov 2024   ▼│ │
│ └──────────────┘   └──────────────┘ │
│ ☐ I currently work here              │
│                                      │
│ Description                          │
│ ┌──────────────────────────────────┐ │
│ │ Led development of...            │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│                                      │
│       [Cancel]          [Save]       │
└──────────────────────────────────────┘
```

**UX Details**:
- **Inline editing**: Click any field to edit
- **Drag to reorder**: Grab handle (⋮) to reorder entries
- **Auto-save**: Debounced saves (1 second after typing stops)
- **Save indicator**: "Saving..." → "Saved ✓" in top-right
- **Validation**: Required fields marked with *, real-time validation
- **Current position**: Checkbox auto-clears end date, shows "Present"

**Section: Education**

Similar modal with additional fields:
```
┌──────────────────────────────────────┐
│ Add Education                  [✕]   │
├──────────────────────────────────────┤
│ Institution *                        │
│ Degree *                             │
│ Field of Study                       │
│ Start Date *        End Date         │
│ ☐ Currently enrolled                 │
│                                      │
│ GPA (0.00-4.00)                      │
│ ┌──────────────────────────────────┐ │
│ │ 3.85                             │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Honors/Awards                        │
│ ┌──────────────────────────────────┐ │
│ │ Summa Cum Laude, Dean's List    │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Relevant Coursework (Optional)       │
│ Thesis Title (Optional)              │
│                                      │
│       [Cancel]          [Save]       │
└──────────────────────────────────────┘
```

**UX Details**:
- GPA shows as colored badge (green >3.5, blue >3.0, gray <3.0)
- Honors displayed as tags/chips
- Graduate-specific fields (thesis) only show if degree contains "Master" or "PhD"

**Section: Skills**

Tag-based interface:
```
┌─────────────────────────────────────┐
│ SKILLS                              │
├─────────────────────────────────────┤
│ Programming Languages               │
│ ┌─────────────────────────────────┐ │
│ │ [Python] [JavaScript] [Go]  [+] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Frameworks                          │
│ ┌─────────────────────────────────┐ │
│ │ [React] [FastAPI] [Django]  [+] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [+ Add Category]                    │
└─────────────────────────────────────┘
```

**UX Details**:
- Click `[+]` to add skill to category
- Type to search/create new skill
- Drag skills to reorder within category
- Click skill tag to edit/delete
- Auto-suggest common skills

**Section: Projects**

Card-based layout:
```
┌─────────────────────────────────────┐
│ PROJECTS                            │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐   │
│ │ ⋮ E-commerce Platform         │   │
│ │   React, Node.js, PostgreSQL  │   │
│ │   Jan 2023 - Dec 2023         │   │
│ │   🔗 Demo  💻 GitHub           │   │
│ │   [Edit] [Delete]             │   │
│ └───────────────────────────────┘   │
│                                     │
│ [+ Add Project]                     │
└─────────────────────────────────────┘
```

**Auto-Save Behavior**:
- Debounce: 1 second after last keystroke
- Visual indicator: "Saving..." → "Saved ✓"
- Background saves: Never blocks user
- Optimistic updates: Show changes immediately
- Error handling: Retry failed saves, show persistent error banner

---

#### `/app/cvs/:id/preview` - CV Preview
**Purpose**: See exactly how CV will look when exported

**Breadcrumb**: `CV Maker > My CVs > Software Engineer CV > Preview`

**Layout**: Print-optimized view
```
┌─────────────────────────────────────┐
│ [← Back to Edit]    [Export PDF →]  │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ JOHN DOE                    │   │ ← Paper preview
│  │ john@example.com            │   │   (8.5x11 ratio)
│  │ +1-555-0000                 │   │
│  │                             │   │
│  │ SUMMARY                     │   │
│  │ Experienced software...     │   │
│  │                             │   │
│  │ WORK EXPERIENCE             │   │
│  │ Senior Developer            │   │
│  │ Tech Corp | 2022-2024       │   │
│  │ ...                         │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Features**:
- Exact print layout
- Choose template/style (future feature)
- Zoom controls
- Print-friendly CSS

---

#### `/app/cvs/:id/export` - Export Options
**Purpose**: Generate downloadable resume

**Options**:
```
┌──────────────────────────────────┐
│ Export Your CV                   │
├──────────────────────────────────┤
│                                  │
│ Format                           │
│ ◉ PDF (Recommended)              │
│ ○ Word Document (.docx)          │
│ ○ Plain Text (.txt)              │
│                                  │
│ Template                         │
│ ┌──────┐ ┌──────┐ ┌──────┐      │
│ │Classic│ │Modern│ │Minimal│     │
│ │  ✓   │ │      │ │      │      │
│ └──────┘ └──────┘ └──────┘      │
│                                  │
│      [Download]                  │
└──────────────────────────────────┘
```

**UX Details**:
- PDF generation client-side (react-pdf or similar)
- Filename: `{full_name}_Resume_{date}.pdf`
- Auto-download on click
- Success toast: "Resume downloaded successfully!"

---

#### `/app/account/profile` - User Profile
**Purpose**: Manage account information

**Breadcrumb**: `CV Maker > Account > Profile`

```
┌──────────────────────────────────┐
│ Your Profile                     │
├──────────────────────────────────┤
│                                  │
│ Avatar                           │
│ ┌────┐                           │
│ │ JD │  [Change Photo]           │
│ └────┘                           │
│                                  │
│ Full Name                        │
│ ┌──────────────────────────────┐ │
│ │ John Doe                     │ │
│ └──────────────────────────────┘ │
│                                  │
│ Email                            │
│ ┌──────────────────────────────┐ │
│ │ john@example.com             │ │
│ └──────────────────────────────┘ │
│                                  │
│        [Save Changes]            │
└──────────────────────────────────┘
```

---

#### `/app/account/security` - Security Settings
**Purpose**: Change password, manage sessions

```
┌──────────────────────────────────┐
│ Security                         │
├──────────────────────────────────┤
│ Change Password                  │
│                                  │
│ Current Password                 │
│ ┌──────────────────────────────┐ │
│ │ ••••••••                     │ │
│ └──────────────────────────────┘ │
│                                  │
│ New Password                     │
│ Password strength: [████░░] Fair │
│                                  │
│     [Update Password]            │
├──────────────────────────────────┤
│ Active Sessions                  │
│                                  │
│ Current session (This device)    │
│ Chrome on macOS                  │
│                                  │
│        [Log Out All Devices]     │
└──────────────────────────────────┘
```

---

## UX Flows

### Flow 1: New User Registration → First CV (Target: 5 minutes)

```
Landing Page
    ↓ Click "Get Started Free"
Register Page
    ↓ Enter email + password (30 sec)
Auto-login
    ↓ Redirect
Create CV Wizard - Step 1
    ↓ Enter name, email, phone (30 sec)
Create CV Wizard - Step 2
    ↓ Write summary (60 sec)
Create CV Wizard - Step 3
    ↓ Select sections (10 sec)
CV Editor - Work Experience
    ↓ Add 2 jobs (120 sec)
CV Editor - Education
    ↓ Add degree (60 sec)
CV Editor - Skills
    ↓ Add 5-10 skills (30 sec)
Preview
    ↓ Review
Export PDF
    ↓ Download
DONE ✓ (Total: ~5 minutes)
```

### Flow 2: Update Existing CV (Target: 30 seconds)

```
Dashboard
    ↓ Click CV card
CV Editor
    ↓ Click "Add Work Experience"
Add Experience Modal
    ↓ Fill fields (20 sec)
    ↓ Click Save
Auto-save
    ↓ "Saved ✓"
Export (optional)
DONE ✓
```

### Flow 3: Create Second CV for Different Role

```
Dashboard
    ↓ Click "Create New CV"
Create CV Wizard
    ↓ Enter "Data Science Resume"
    ↓ Use same personal info (pre-filled)
CV Editor
    ↓ Copy relevant experience from first CV
    ↓ Add data-specific skills
    ↓ Reorder sections for DS focus
Export
DONE ✓
```

---

## Component Architecture

### Separation of Concerns

```
src/
├── routes/                      # Pages (TanStack Router)
│   ├── index.tsx               # Landing page
│   ├── auth/
│   │   ├── login.tsx           # Login page
│   │   └── register.tsx        # Register page
│   └── app/                    # Protected routes
│       ├── dashboard.tsx       # Dashboard
│       ├── cvs/
│       │   ├── new.tsx         # CV wizard
│       │   └── $id/
│       │       ├── edit.tsx    # CV editor
│       │       ├── preview.tsx # Preview
│       │       └── export.tsx  # Export
│       └── account/
│           ├── profile.tsx
│           └── security.tsx
│
├── components/
│   ├── ui/                     # Base components (shadcn)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── animate-ui/             # Animate UI components
│   │   └── components/
│   │       └── radix/
│   │           └── sidebar.tsx
│   │
│   ├── cv/                     # CV-specific components
│   │   ├── CVCard.tsx          # Dashboard CV card
│   │   ├── CVWizard.tsx        # Multi-step wizard
│   │   ├── PersonalInfoForm.tsx
│   │   ├── WorkExperienceList.tsx
│   │   ├── WorkExperienceModal.tsx
│   │   ├── EducationList.tsx
│   │   ├── EducationModal.tsx
│   │   ├── SkillsEditor.tsx
│   │   ├── ProjectsList.tsx
│   │   └── ProjectModal.tsx
│   │
│   ├── layout/                 # Layout components
│   │   ├── AppSidebar.tsx      # Sidebar configuration
│   │   ├── AuthLayout.tsx      # Auth pages wrapper
│   │   └── EmptyState.tsx      # Empty states
│   │
│   └── shared/                 # Shared components
│       ├── DatePicker.tsx
│       ├── RichTextEditor.tsx
│       ├── ConfirmDialog.tsx
│       └── Toast.tsx
│
├── lib/
│   ├── api/                    # API client (already built)
│   │   ├── client.ts
│   │   ├── services/
│   │   └── types.ts
│   │
│   └── utils/
│       ├── date.ts             # Date formatting
│       ├── validation.ts       # Form validation
│       └── export.ts           # PDF generation
│
├── hooks/
│   ├── use-auth.ts             # Already built
│   ├── use-cvs.ts              # Already built
│   ├── use-work-experiences.ts # New
│   ├── use-educations.ts       # New
│   ├── use-skills.ts           # New
│   ├── use-projects.ts         # New
│   ├── use-auto-save.ts        # Auto-save hook
│   └── use-form-state.ts       # Form state management
│
└── styles/
    └── cv-templates/           # PDF export styles
        ├── classic.css
        ├── modern.css
        └── minimal.css
```

### Component Design Principles

1. **Single Responsibility**: Each component does one thing well
2. **Composition over Configuration**: Build complex UIs from simple parts
3. **Smart vs. Dumb**:
   - Smart (pages/containers): Fetch data, handle state
   - Dumb (components): Receive props, render UI
4. **Reusability**: Components work in different contexts
5. **Accessibility**: ARIA labels, keyboard navigation, screen reader support

---

## Design Principles

### 1. Visual Hierarchy
- **Primary actions**: High contrast, bold (e.g., "Create CV")
- **Secondary actions**: Medium contrast (e.g., "Preview")
- **Tertiary actions**: Low contrast (e.g., "Cancel")

### 2. Consistent Spacing
- Use 4px grid system
- Padding: 16px (components), 24px (sections), 32px (pages)
- Margins: 8px (tight), 16px (normal), 24px (loose)

### 3. Typography Scale
```
Display: 48px / 3rem (Landing page hero)
H1:      36px / 2.25rem (Page titles)
H2:      24px / 1.5rem (Section headers)
H3:      20px / 1.25rem (Card titles)
Body:    16px / 1rem (Normal text)
Small:   14px / 0.875rem (Labels)
Tiny:    12px / 0.75rem (Meta info)
```

### 4. Color System
```
Primary:     Blue (#3b82f6) - Actions, links
Success:     Green (#10b981) - Saved states
Warning:     Yellow (#f59e0b) - Warnings
Danger:      Red (#ef4444) - Destructive actions
Neutral:     Gray (#6b7280) - Text, borders
Background:  White (#ffffff) / Dark (#0f172a)
```

### 5. Interaction Patterns

**Buttons**:
- Primary: Solid background, white text
- Secondary: Outline, colored text
- Ghost: No border, colored text on hover

**Forms**:
- Labels above inputs
- Required fields marked with `*`
- Inline validation on blur
- Error messages below field

**Modals**:
- Centered on screen
- Backdrop overlay (semi-transparent)
- ESC to close, click outside to close
- Focus trap inside modal

**Loading States**:
- Skeleton loaders for initial load
- Spinners for actions
- Progress bars for multi-step processes

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
**Goal**: Authentication & basic CV CRUD

**Tasks**:
- [x] Sidebar layout (DONE)
- [ ] Landing page design & implementation
- [ ] Register/Login pages
- [ ] Protected route wrapper (auth guard)
- [ ] Dashboard with CV list
- [ ] CV creation wizard (basic - 3 steps)
- [ ] Empty states

**Deliverable**: User can sign up, log in, create a CV with basic info

---

### Phase 2: CV Editor (Week 2)
**Goal**: Full editing experience for all sections

**Tasks**:
- [ ] CV editor layout (split view)
- [ ] Personal info form
- [ ] Work experience CRUD
  - [ ] Add/edit modal
  - [ ] List with drag-to-reorder
  - [ ] Delete confirmation
- [ ] Education CRUD (similar to work exp)
- [ ] Skills editor (tag-based interface)
- [ ] Projects CRUD
- [ ] Auto-save implementation
- [ ] Form validation

**Deliverable**: User can fully edit all CV sections with auto-save

---

### Phase 3: Preview & Export (Week 3)
**Goal**: Beautiful resume output

**Tasks**:
- [ ] Preview page layout
- [ ] PDF template: Classic style
- [ ] PDF generation (react-pdf or similar)
- [ ] Export flow (format selection)
- [ ] Download functionality
- [ ] Print styles

**Deliverable**: User can preview and download PDF resume

---

### Phase 4: Polish & UX (Week 4)
**Goal**: Delightful user experience

**Tasks**:
- [ ] Responsive design (mobile optimization)
- [ ] Loading states & skeletons
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Keyboard shortcuts (Ctrl+S to save)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization
- [ ] Analytics (optional)

**Deliverable**: Production-ready application

---

### Phase 5: Enhancements (Future)
**Nice-to-haves for v2**:

- [ ] Multiple PDF templates (Modern, Minimal)
- [ ] CV duplication
- [ ] Import from LinkedIn
- [ ] Real-time collaboration
- [ ] Version history
- [ ] Public CV URLs (shareable links)
- [ ] Custom domains
- [ ] Analytics (CV views, downloads)
- [ ] A/B testing different resume styles
- [ ] AI-powered content suggestions
- [ ] Cover letter generator
- [ ] Interview prep tools

---

## Technical Decisions

### State Management
- **Global State**: React Query for server state
- **Local State**: React useState for UI state
- **Form State**: React Hook Form for complex forms
- **URL State**: TanStack Router for navigation state

### Data Fetching
- React Query hooks (already implemented)
- Optimistic updates for better UX
- Background refetching
- Cache invalidation on mutations

### Styling
- Tailwind CSS for utility classes
- shadcn/ui for base components
- Animate UI for advanced components (sidebar)
- CSS modules for template-specific styles

### Form Handling
- React Hook Form for validation
- Zod for schema validation (matches backend Pydantic models)
- Debounced auto-save (1000ms delay)

### PDF Generation
- react-pdf (recommended) or jsPDF
- HTML → PDF conversion
- Custom templates with CSS

### Testing
- Vitest for unit tests
- React Testing Library for component tests
- Playwright for E2E tests (optional)

---

## Success Metrics

### User Experience
- Time to first CV: < 5 minutes
- Time to update CV: < 30 seconds
- Mobile usability score: > 90
- Accessibility score: WCAG 2.1 AA

### Performance
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse score: > 90

### Engagement
- CV completion rate: > 80%
- Return user rate: > 40%
- Export/download rate: > 60%

---

## Open Questions

1. **PDF Templates**: Should we start with one template or three?
   - **Recommendation**: Start with Classic template, add more in Phase 5

2. **Real-time Collaboration**: Do users need to share CV editing with others?
   - **Recommendation**: Not MVP, consider for v2

3. **Import**: Should we support importing from LinkedIn/Indeed?
   - **Recommendation**: Phase 5 feature, high value but complex

4. **Pricing**: Free tier limitations?
   - **Recommendation**: Start free, unlimited. Consider premium features later.

5. **Custom Domains**: Should users get custom CV URLs (e.g., john-doe.cvmaker.com)?
   - **Recommendation**: Premium feature for v2

---

## Conclusion

This product is designed around one core principle: **It Just Works**.

Every decision prioritizes:
1. **Speed**: Users should achieve their goal in minutes, not hours
2. **Simplicity**: No learning curve, no hidden features, no confusion
3. **Quality**: Professional output that looks great by default
4. **Flexibility**: Support different use cases without adding complexity

The architecture is clean, modular, and scalable. Components are reusable and well-separated. The UX flows are optimized for the fastest path to value.

**Let's build something insanely great.**

---

*Document Version: 1.0*
*Last Updated: 2024-11-28*
*Owner: CV Maker Product Team*
