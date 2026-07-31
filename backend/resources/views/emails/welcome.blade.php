<x-mail::message>
# Welcome to Talora Apply, {{ $user->name }}!

Your account has been created successfully.

Talora Apply will help you analyze your resume, find compatible opportunities, and understand how your professional profile relates to each job.

<x-mail::button :url="$loginUrl">
Access Talora Apply
</x-mail::button>

<x-mail::panel>
Your next opportunity may begin with a better understanding of your professional profile.
</x-mail::panel>

If you did not create this account, please contact our support team.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>