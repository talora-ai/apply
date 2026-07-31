# Talora Apply — Mobile

The Android and iOS application for **Talora Apply**, an intelligent career platform that helps users manage their resumes, discover compatible jobs, and follow automated applications from a mobile device.

The Mobile application consumes the Laravel API and shares the same product rules and visual identity as the Talora Apply web application.

## Technology stack

- React Native
- Expo
- Expo Router
- TypeScript
- react-i18next
- expo-localization
- expo-secure-store

## Current features

- Login
- User registration
- Initial dashboard
- Forgot-password flow
- Password reset
- Portuguese and English translations
- Shared API client
- Secure authentication token storage
- Expo Router typed routes
- Password recovery deep-link preparation

## Requirements

- Node.js
- npm
- Expo-compatible Android or iOS environment
- Talora Apply Backend available on the local network or remotely

## Installation

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Configure the API URL:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.0.10:8000/api
```

Replace `192.168.0.10` with the development machine's local network address when testing on a physical device.

Common development addresses:

| Environment | API host |
| --- | --- |
| Physical device | Development machine LAN IP |
| Android emulator | `10.0.2.2` |
| Expo Web | `127.0.0.1` |

The Laravel server must accept connections from the selected address.

## Running the application

```bash
npx expo start
```

Useful alternatives:

```bash
npx expo start --android
npx expo start --web
```

## Application configuration

The Expo configuration uses:

```json
{
    "expo": {
        "name": "Talora Apply",
        "slug": "talora-apply",
        "scheme": "talora-apply",
        "android": {
            "package": "com.taloraapply.mobile"
        },
        "experiments": {
            "typedRoutes": true
        }
    }
}
```

The Android package identifies the installed application:

```text
com.taloraapply.mobile
```

The custom scheme opens application routes:

```text
talora-apply://
```

## Main routes

| Route | Description |
| --- | --- |
| `/login` | Authenticates the user |
| `/register` | Creates a new account |
| `/forgot-password` | Requests password recovery instructions |
| `/reset-password` | Creates a new password from an email token |
| `/dashboard` | Displays the initial authenticated experience |

Authentication screens are located in:

```text
src/app/(auth)/
```

## API client

The shared API client:

- reads `EXPO_PUBLIC_API_URL`;
- serializes JSON requests;
- adds Bearer authentication when a token is provided;
- normalizes API failures through `ApiError`;
- prevents duplicated request handling across screens.

API communication should remain outside visual components when the feature becomes large enough to justify a dedicated service.

## Authentication

1. The user submits email and password.
2. The application calls the Laravel login endpoint.
3. Laravel returns a Sanctum token.
4. The token is stored using `expo-secure-store`.
5. Authenticated requests send the token as a Bearer token.
6. Logout revokes the API token and removes the local secure value.

Authentication tokens must not be stored in AsyncStorage.

## Internationalization

Translations use `react-i18next` and `expo-localization`.

Supported languages:

- Portuguese
- English

User-facing messages must use translation keys, including:

- Forms and navigation
- Validation errors
- API errors
- Loading states
- Success confirmations
- Accessibility labels

The Backend remains language-neutral and returns standardized messages in English.

## Password recovery

Mobile forgot-password requests identify their trusted client:

```json
{
    "email": "user@example.com",
    "client": "mobile"
}
```

Laravel generates:

```text
talora-apply://reset-password?token=<token>&email=<email>
```

Expo Router opens:

```text
src/app/(auth)/reset-password.tsx
```

Test the scheme on Android:

```bash
npx uri-scheme open \
  "talora-apply://reset-password?token=test&email=user%40example.com" \
  --android
```

Changing native linking configuration requires a new development build or APK.

## Building Android

Create an EAS development or preview build according to `eas.json`:

```bash
eas build --platform android --profile preview
```

To generate an APK, the selected profile must use an APK-compatible Android build type.

## UI principles

- Consistent Talora Apply identity
- Dark-first interface
- Keyboard-safe forms
- Scrollable content on small screens
- Inline feedback that works on Android, iOS, and Web
- Accessible touch targets
- Explicit loading and disabled states
- Responsive behavior without depending on browser-only APIs

## Planned features

- Resume upload
- Resume processing status
- AI-generated resume feedback
- Job discovery
- Candidate-to-job compatibility
- Application history
- Push notifications
- User profile and preferences
- Production Android App Links and iOS Universal Links

## Development workflow

1. Select the related GitHub issue.
2. Assign it to the current Sprint.
3. Create a focused branch.
4. Validate Android, iOS implications, and Expo Web when applicable.
5. Test loading, offline, error, and success states.
6. Review Portuguese and English translations.
7. Open a pull request using the repository template.
8. Link the issue with `Closes #<issue-number>`.

## License

License information will be defined before the first public release.