<x-mail::message>
# Reset your password

Hello, {{ $user->name }}.

We received a request to reset your Talora Apply password.

Click the button below to create a new password:

<x-mail::button
    :url="$resetUrl"
    color="success"
>
Reset password
</x-mail::button>

This password reset link will expire according to your application's security settings.

<x-mail::panel>
If you did not request a password reset, you can safely ignore this email. Your current password will remain unchanged.
</x-mail::panel>

If the button does not work, copy and paste the following address into your browser:

[{{ $resetUrl }}]({{ $resetUrl }})

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>