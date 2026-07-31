# Talora Apply — Frontend

The web application for **Talora Apply**, an intelligent career platform that helps users improve their resumes, find compatible job opportunities, and track automated applications.

The Frontend consumes the Laravel API and provides the main browser experience for authentication, resume management, job discovery, compatibility insights, and application tracking.

## Technology stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Next.js Server Actions
- Zod
- next-intl

## Current features

- Login
- User registration
- Initial dashboard
- Forgot-password flow
- Password reset
- Portuguese and English translations
- Server-side communication with the Laravel API
- Authentication token stored in an HTTP-only cookie
- Shared authentication layout with `AuthShell` and `AuthHero`

## Requirements

- Node.js compatible with the installed Next.js version
- npm
- Talora Apply Backend running locally or remotely

## Installation

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env.local
```

Configure the Laravel API:

```dotenv
API_URL=http://127.0.0.1:8000/api
```

`API_URL` is server-only. Do not expose authentication credentials or private API configuration through `NEXT_PUBLIC_*` variables.

## Running the application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production validation

```bash
npm run lint
npm run build
```

## Main routes

| Route | Description |
| --- | --- |
| `/login` | Authenticates the user |
| `/register` | Creates a new account |
| `/forgot-password` | Requests password recovery instructions |
| `/reset-password` | Creates a new password from an email token |
| `/dashboard` | Displays the initial authenticated experience |

## Feature organization

Authentication code follows a feature-oriented structure:

```text
src/
├── app/
│   └── (auth)/
│       ├── login/
│       ├── register/
│       ├── forgot-password/
│       └── reset-password/
└── features/
    └── auth/
        ├── actions/
        ├── components/
        ├── schemas/
        └── types/
```

Page files compose the screen using shared components:

```tsx
<AuthShell hero={<AuthHero />}>
    <AuthenticationForm />
</AuthShell>
```

Business rules, validation, API calls, UI components, and types should remain separated.

## Authentication flow

1. The form sends its data to a Server Action.
2. Zod validates the submitted fields.
3. The Server Action sends the request to the Laravel API.
4. Laravel returns a Sanctum token after successful authentication.
5. The token is stored in a secure HTTP-only cookie.
6. Protected pages validate the authenticated session.

Client components must not receive or store the Sanctum token in local storage.

## Internationalization

The Backend returns standardized messages in English. The Frontend translates user-facing states with translation keys.

Supported languages:

- Portuguese
- English

Translation requirements apply to:

- Labels and placeholders
- Validation messages
- Loading and success states
- API errors
- Navigation
- Accessibility text

Avoid hardcoded user-facing messages inside schemas, actions, and components.

## Password recovery

The recovery email opens:

```text
/reset-password?token=<token>&email=<email>
```

The reset page:

1. reads `token` and `email`;
2. validates the new password;
3. sends `password_confirmation` to Laravel;
4. displays a translated result;
5. redirects the user to `/login`.

## UI principles

- Dark-first Talora Apply visual identity
- Responsive, mobile-first layouts
- Accessible form labels and error states
- Keyboard-friendly navigation
- Explicit loading and disabled states
- Consistent feedback for success and failure
- Reusable components instead of duplicated markup

## Planned features

- Resume upload and management
- Resume processing status
- AI-generated resume recommendations
- Job search and filters
- Candidate-to-job compatibility details
- Application history
- Realtime notifications
- User profile and preferences
- Accessibility and language settings

## Development workflow

1. Select the related GitHub issue.
2. Assign it to the current Sprint.
3. Create a focused branch.
4. Implement responsive and translated states.
5. Run lint and production build.
6. Test API error and loading scenarios.
7. Open a pull request using the repository template.
8. Link the issue with `Closes #<issue-number>`.

## License

License information will be defined before the first public release.