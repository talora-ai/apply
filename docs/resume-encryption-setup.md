# Resume encryption setup

Talora Apply uses two independent 32-byte keys:

- `RESUME_ENCRYPTION_KEY`: protects encrypted resume files stored on the `resumes` disk.
- `RESUME_DATA_ENCRYPTION_KEY`: protects sensitive `user_resumes` database fields such as name, original filename, extracted text and metadata.

Generate both values:

```bash
cd backend
php artisan resumes:generate-encryption-keys
```

Copy the two generated values into `.env`, then clear cached configuration:

```bash
php artisan config:clear
```

Do not rotate or replace these values without a key-rotation migration. Existing encrypted records depend on the key that encrypted them.

## Existing plaintext development records

Older development builds may have written `user_resumes` fields before encrypted casts were enabled. After configuring the keys, inspect them with:

```bash
php artisan resumes:encrypt-legacy-data --dry-run
```

Then migrate them in place:

```bash
php artisan resumes:encrypt-legacy-data
```

The command only encrypts values that do not already begin with the Talora encrypted envelope prefix (`talora:`). It never silently treats plaintext as valid encrypted content at runtime.
