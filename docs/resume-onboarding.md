# Resume onboarding

## Goal

Users must have at least one resume before accessing the authenticated Talora Apply experience.

## Web flow

1. Login stores the Sanctum bearer token in the `talora_token` HTTP-only cookie.
2. The frontend requests `GET /client/user/resumes`.
3. When the response contains no resumes, the user is redirected to `/resume-upload`.
4. The onboarding submits `name`, `file` and `is_primary=1` to `POST /client/user/resumes`.
5. The backend keeps using the existing encrypted resume storage and queues `ProcessUserResumeJob`.
6. After a successful upload, the user is redirected to `/dashboard`.
7. The protected platform layout repeats the resume check so the onboarding cannot be bypassed by opening a protected URL directly.

## Mobile flow

1. Session restoration fetches the authenticated user and resumes using the stored SecureStore token.
2. The root navigator exposes the onboarding group when authenticated and without resumes.
3. `/resume-upload` uses `expo-document-picker` to choose PDF/DOCX files.
4. Multipart upload uses the same backend endpoint and refreshes the local resume state after success.
5. Existing sessions follow the same guard when the app is reopened.

## Available interface routes

### Web

- `/dashboard`
- `/jobs/search`
- `/applications`
- `/resumes`
- `/favorites`
- `/analytics`
- `/profile`
- `/settings`
- `/billing`
- `/resume-upload`

### Mobile

- `/dashboard`
- `/explore`
- `/applications`
- `/resumes`
- `/favorites`
- `/analytics`
- `/profile`
- `/settings`
- `/billing`
- `/more`
- `/resume-upload`

The opportunity/application screens are UI-ready placeholders where the backend models already exist but public client endpoints are not yet exposed in `routes/api.php`.
