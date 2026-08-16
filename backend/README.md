# Talora Apply — Backend

The backend API for **Talora Apply**, an intelligent career platform that helps users process their resumes, discover compatible job opportunities, and apply to public job listings that do not require external authentication.

The API is responsible for authentication, user data, resume processing workflows, job data, applications, notifications, and orchestration between the automation bot and AI services.

## Technology stack

- PHP
- Laravel 13
- Laravel Sanctum
- MySQL
- Laravel Mail with Markdown templates
- Mailpit for local email testing
- Laravel queues

## Current features

- User registration
- Authentication with Sanctum personal access tokens
- Authenticated user retrieval
- Logout and token revocation
- Forgot-password flow
- Password reset with token validation
- Welcome and password recovery emails
- Web and Mobile password-reset destinations
- Standardized JSON API responses

## Requirements

- PHP compatible with Laravel 13
- Composer
- MySQL
- PHP extensions required by Laravel
- PHP Sodium extension
- Mailpit, Docker, or another SMTP server

## Installation

```bash
composer install
```

Create the environment file:

```bash
cp .env.example .env
```

Generate the application key:

```bash
php artisan key:generate
```

Configure the database in `.env`:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=talora_apply
DB_USERNAME=root
DB_PASSWORD=
```

Run the migrations:

```bash
php artisan migrate
```

## Local email configuration

For Mailpit running on the host machine:

```dotenv
MAIL_MAILER=smtp
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="no-reply@talora.local"
MAIL_FROM_NAME="${APP_NAME}"
```

Mailpit web interface:

```text
http://localhost:8025
```

When both Laravel and Mailpit run in the same Docker Compose network, use:

```dotenv
MAIL_HOST=mailpit
```

## Application URLs

Configure the destinations used in password recovery emails:

```dotenv
FRONTEND_URL=http://localhost:3000
MOBILE_URL=talora-apply://reset-password
```

The backend selects the reset destination from the trusted client identifier:

- `web`: opens the Next.js application;
- `mobile`: opens the Talora Apply application through its deep link.

The API must never accept an arbitrary reset URL from a request.

## Queue configuration

For immediate execution during local development:

```dotenv
QUEUE_CONNECTION=sync
```

For an asynchronous queue:

```bash
php artisan queue:work
```

### Resume processing Bot

Resume files remain on the private `resumes` disk. The queue worker sends the
file directly to the Bot over an authenticated internal request and persists
only the validated extraction result in `user_resumes`.

Configure the integration in `.env`:

```dotenv
BOT_URL=http://localhost:9000
BOT_SERVICE_TOKEN=replace-with-the-same-private-token-used-by-the-bot
BOT_SIGNING_SECRET=replace-with-a-different-random-signing-secret
BOT_CONNECT_TIMEOUT=5
BOT_TIMEOUT=45
BOT_MAX_RESPONSE_KB=2048
RESUME_ENCRYPTION_KEY=base64-encoded-32-byte-file-key
RESUME_ENCRYPTION_KEY_VERSION=v1
RESUME_DATA_ENCRYPTION_KEY=base64-encoded-32-byte-database-key
RESUME_DATA_ENCRYPTION_KEY_VERSION=v1
```

Generate every secret independently. Never reuse `APP_KEY`, the Bot service
token, the signing secret, or one resume encryption key for another purpose:

```bash
php -r "echo base64_encode(random_bytes(32)), PHP_EOL;"
```

Do not replace either encryption key directly after data exists. Key rotation
requires rewrapping file data keys and re-encrypting protected database fields
under a controlled migration.

Start the dedicated worker:

```bash
php artisan queue:work --queue=resume-processing --tries=3 --timeout=60
```

Processing flow:

1. The upload is stored privately and the resume starts with `pending` status.
2. `ProcessUserResumeJob` changes the status to `processing` and calls
   `POST http://localhost:9000/api/v1/resumes/extract`.
3. The file is stored only as an authenticated encrypted `.enc` container. Its
   one-time data key is wrapped by the Backend file-encryption key.
4. The Backend decrypts the document in a memory-backed stream and signs its
   SHA-256, processing ID, timestamp, and nonce before sending it to the Bot.
5. Responses are accepted only when they match Bot schema `1.4`, the original
   processing ID, and the exact document SHA-256.
6. Extracted text, original filenames, structured sections, document metadata,
   and the ATS assessment are encrypted before persistence; the status changes
   to `completed`.
7. After the final failed attempt, only a safe failure code is persisted and
   the status changes to `failed`. Raw Bot errors are never returned to users.

## Running the application

```bash
php artisan serve
```

Default local API URL:

```text
http://127.0.0.1:8000/api
```

## Authentication endpoints

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Creates a user account |
| `POST` | `/api/auth/login` | Public | Creates a Sanctum token |
| `POST` | `/api/auth/forgot-password` | Public | Sends password recovery instructions |
| `POST` | `/api/auth/reset-password` | Public | Resets a password using a valid token |
| `POST` | `/api/auth/logout` | Bearer token | Revokes the active token |
| `GET` | `/api/user` | Bearer token | Returns the authenticated user |

## Password recovery security

- Forgot-password responses must not reveal whether an email exists.
- Reset tokens are single-use and expire according to the password broker configuration.
- Existing Sanctum tokens are revoked after a successful password reset.
- Passwords are hashed using Laravel's configured hashing driver.
- Reset destinations are controlled by backend configuration.

## Code quality

Format the code:

```bash
./vendor/bin/pint
```

Run automated tests:

```bash
php artisan test
```

Clear application caches after configuration changes:

```bash
php artisan optimize:clear
```

## Planned responsibilities

- Resume upload and secure file storage
- Resume processing status
- Candidate profile modeling
- Job ingestion from public sources
- Candidate-to-job compatibility scores
- Application automation orchestration
- AI-assisted resume feedback and opportunity analysis
- Realtime and push notifications
- Audit logs and application history

## Development workflow

1. Create or select the related GitHub issue.
2. Assign it to the current Sprint.
3. Create a focused branch.
4. Implement and test the change.
5. Run Pint and the test suite.
6. Open a pull request using the repository template.
7. Link the issue with `Closes #<issue-number>`.

## License

License information will be defined before the first public release.
