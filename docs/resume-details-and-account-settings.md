# Resume details and account settings

## Resume flow

- `GET /api/client/user/resumes` returns the summarized resume list.
- `GET /api/client/user/resumes/{resume}` returns BOT extraction details and, when available, completed Talora AI analysis data.
- `DELETE /api/client/user/resumes/{resume}` removes the encrypted stored file, soft-deletes the record, and promotes another resume to primary when necessary.
- Web and mobile require explicit user confirmation before deletion.

### Analysis provenance

Resume details always include `analysis_origin`.

- `bot`: extraction/structuring performed by the Talora resume BOT.
- `talora_ai`: shown only when the latest `ResumeAnalysis` has status `completed`. The UI highlights the TALORA AI provenance and exposes AI scores, professional summary, strengths, weaknesses and suggestions.

## Account settings

- `PATCH /api/client/user` updates `name` and `last_name` only. `email` is prohibited from the update payload.
- `PUT /api/client/user/password` requires the current password, a new password and confirmation. Other API tokens are revoked after a successful password change while the current session remains active.
