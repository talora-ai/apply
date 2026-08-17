<?php

declare(strict_types=1);

namespace App\Services\Jobs;

use App\Enums\UserResumeStatus;
use App\Models\JobPosting;
use App\Models\UserResume;
use Illuminate\Support\Str;

final class RuntimeJobCompatibilityService
{
    /**
     * Compatibility is deliberately ephemeral. No score is loaded from or
     * persisted to the database. Replacing the comparator/model automatically
     * changes the result on the next API response.
     *
     * @return array{score: float, matching_skills: array<int, string>, model: string}|null
     */
    public function compare(?UserResume $resume, JobPosting $job): ?array
    {
        if ($resume === null || $resume->status !== UserResumeStatus::Completed) {
            return null;
        }

        $resumeText = $this->normalize($resume->extracted_text ?? '');
        $jobText = $this->normalize(implode(' ', array_filter([
            $job->title,
            $job->description,
            $job->seniority_level,
            $job->employment_type,
            $job->workplace_type,
            $job->location,
        ])));

        if ($resumeText === '' || $jobText === '') {
            return null;
        }

        $resumeTokens = $this->tokenSet($resumeText);
        $jobTokens = $this->tokenSet($jobText);
        $titleTokens = $this->tokenSet($this->normalize((string) $job->title));

        $metadata = is_array($resume->metadata) ? $resume->metadata : [];
        $resumeSkills = $this->resumeSkills($metadata, $resumeText);
        $jobSkills = $this->jobSkills($jobText, $resumeSkills);
        $matchingSkills = array_values(array_filter(
            $jobSkills,
            fn (string $skill): bool => $this->containsTerm($resumeText, $skill),
        ));

        // If the vacancy explicitly names technologies, use those requirements as
        // the denominator. This avoids penalizing a CV simply for containing many
        // additional skills that the vacancy does not request.
        $skillScore = $jobSkills === []
            ? $this->coverage($jobTokens, $resumeTokens)
            : min(1.0, count($matchingSkills) / count($jobSkills));

        $keywordScore = $this->coverage($jobTokens, $resumeTokens);
        $titleScore = $this->coverage($titleTokens, $resumeTokens);

        $score = ($skillScore * 50) + ($keywordScore * 30) + ($titleScore * 20);

        return [
            'score' => round(max(0, min(100, $score)), 1),
            'matching_skills' => array_slice($matchingSkills, 0, 12),
            'model' => 'runtime-v1',
        ];
    }

    /** @return array<int, string> */
    private function resumeSkills(array $metadata, string $resumeText): array
    {
        $skills = data_get($metadata, 'sections.skills', []);
        $values = [];

        if (is_array($skills)) {
            foreach ($skills as $skill) {
                if (is_string($skill)) {
                    foreach (preg_split('/[•|,;\n]+/u', $skill) ?: [] as $value) {
                        $value = trim($value);
                        if ($value !== '') {
                            $values[] = $value;
                        }
                    }
                } elseif (is_array($skill)) {
                    $candidate = $skill['name'] ?? $skill['skill'] ?? null;
                    if (is_string($candidate) && trim($candidate) !== '') {
                        $values[] = trim($candidate);
                    }
                }
            }
        }

        if ($values === []) {
            foreach ($this->knownSkills() as $skill) {
                if ($this->containsTerm($resumeText, $skill)) {
                    $values[] = $skill;
                }
            }
        }

        return $this->uniqueTerms($values);
    }

    /** @param array<int, string> $resumeSkills @return array<int, string> */
    private function jobSkills(string $jobText, array $resumeSkills): array
    {
        // Include the static technology vocabulary plus any structured skill from
        // the current resume. This keeps the comparator useful for technologies
        // already recognized by the BOT without persisting a compatibility model.
        $candidates = [...$this->knownSkills(), ...$resumeSkills];
        $found = [];

        foreach ($candidates as $skill) {
            if ($this->containsTerm($jobText, $skill)) {
                $found[] = $skill;
            }
        }

        return $this->uniqueTerms($found);
    }

    /** @return array<int, string> */
    private function knownSkills(): array
    {
        return [
            'php', 'laravel', 'symfony', 'javascript', 'typescript', 'react', 'react native',
            'next.js', 'vue.js', 'vue', 'node.js', 'node', 'express', 'nestjs', 'python',
            'java', 'spring', 'c#', '.net', 'go', 'golang', 'ruby', 'rails', 'mysql',
            'postgresql', 'sql server', 'mariadb', 'mongodb', 'redis', 'rabbitmq', 'kafka',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'linux', 'rest api',
            'api rest', 'graphql', 'pest', 'phpunit', 'jest', 'openapi', 'swagger', 'sanctum',
            'passport', 'filament', 'ci/cd', 'github actions', 'gitlab ci', 'terraform',
            'microservices', 'microsservicos', 'clean code', 'solid', 'scrum', 'kanban',
        ];
    }

    /** @param array<int, string> $values @return array<int, string> */
    private function uniqueTerms(array $values): array
    {
        $unique = [];
        foreach ($values as $value) {
            $normalized = $this->normalize($value);
            if ($normalized !== '' && mb_strlen($normalized) <= 50) {
                $unique[$normalized] = $value;
            }
        }

        return array_values($unique);
    }

    /** @return array<string, true> */
    private function tokenSet(string $text): array
    {
        $stopWords = array_flip([
            'a','o','as','os','de','da','do','das','dos','e','em','para','por','com','sem','um','uma','que','na','no','nas','nos','ao','aos','se','ou','como','mais','ser','ter','the','and','of','to','in','for','with','on','at','is','are','an','or','be','will','from','you','your','we','our','this','that','using','experience','experiencia','conhecimento','conhecimentos',
        ]);

        $tokens = preg_split('/[^\pL\pN+#.]+/u', $text) ?: [];
        $set = [];
        foreach ($tokens as $token) {
            $token = trim($token);
            if (mb_strlen($token) < 3 || isset($stopWords[$token])) {
                continue;
            }
            $set[$token] = true;
        }

        return $set;
    }

    /** @param array<string, true> $needles @param array<string, true> $haystack */
    private function coverage(array $needles, array $haystack): float
    {
        if ($needles === []) {
            return 0.0;
        }

        $matches = count(array_intersect_key($needles, $haystack));

        return min(1.0, $matches / count($needles));
    }

    private function containsTerm(string $text, string $term): bool
    {
        $needle = $this->normalize($term);
        if ($needle === '') {
            return false;
        }

        return Str::contains(" {$text} ", " {$needle} ") || Str::contains($text, $needle);
    }

    private function normalize(string $value): string
    {
        return trim((string) Str::of($value)->lower()->ascii()->replaceMatches('/\s+/u', ' '));
    }
}
