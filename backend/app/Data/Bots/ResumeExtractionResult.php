<?php

declare(strict_types=1);

namespace App\Data\Bots;

use App\Exceptions\Bots\ResumeBotException;
use Illuminate\Support\Facades\Validator;

final readonly class ResumeExtractionResult
{
    public const SCHEMA_VERSION = '1.4';

    public function __construct(
        public string $schemaVersion,
        public string $processingId,
        public string $fullText,
        public array $document,
        public array $sections,
    ) {}

    public static function fromArray(array $payload): self
    {
        $validator = Validator::make($payload, [
            'schema_version' => ['required', 'string', 'in:' . self::SCHEMA_VERSION],
            'processing_id' => ['required', 'uuid'],
            'document' => ['required', 'array'],
            'document.filename' => ['required', 'string', 'max:255'],
            'document.mime_type' => ['required', 'string', 'max:150'],
            'document.page_count' => ['present', 'nullable', 'integer', 'min:1'],
            'document.character_count' => ['required', 'integer', 'min:1'],
            'document.sha256' => ['required', 'string', 'regex:/^[a-f0-9]{64}$/'],
            'document.metadata' => ['present', 'array'],
            'document.ats' => ['required', 'array'],
            'document.ats.ats_friendly' => ['required', 'boolean'],
            'document.ats.confidence' => ['required', 'numeric', 'between:0,1'],
            'document.ats.layout_type' => ['required', 'string', 'max:50'],
            'document.ats.extraction_quality' => ['required', 'string', 'max:50'],
            'document.ats.reason_codes' => ['present', 'array'],
            'document.ats.reason_codes.*' => ['string', 'max:100'],
            'document.ats.metrics' => ['present', 'array'],
            'content' => ['required', 'array'],
            'content.full_text' => ['required', 'string', 'max:2000000'],
            'content.sections' => ['required', 'array'],
            'content.sections.summary' => ['present', 'array'],
            'content.sections.summary.*' => ['string'],
            'content.sections.skills' => ['present', 'array'],
            'content.sections.skills.*' => ['string', 'max:150'],
            'content.sections.experiences' => ['present', 'array'],
            'content.sections.experiences.*.position' => ['required', 'string'],
            'content.sections.experiences.*.company' => ['required', 'string'],
            'content.sections.experiences.*.period' => ['required', 'string'],
            'content.sections.experiences.*.start_date' => ['present', 'nullable', 'string'],
            'content.sections.experiences.*.end_date' => ['present', 'nullable', 'string'],
            'content.sections.experiences.*.is_current' => ['required', 'boolean'],
            'content.sections.experiences.*.description' => ['present', 'array'],
            'content.sections.experiences.*.description.*' => ['string'],
            'content.sections.education' => ['present', 'array'],
            'content.sections.education.*' => ['string'],
            'content.sections.languages' => ['present', 'array'],
            'content.sections.languages.*.name' => ['required', 'string'],
            'content.sections.languages.*.proficiency' => ['present', 'nullable', 'string'],
            'content.sections.projects' => ['present', 'array'],
            'content.sections.projects.*.name' => ['required', 'string'],
            'content.sections.projects.*.description' => ['present', 'array'],
            'content.sections.projects.*.description.*' => ['string'],
            'content.sections.certifications' => ['present', 'array'],
            'content.sections.certifications.*' => ['string'],
        ]);

        if ($validator->fails()) {
            throw ResumeBotException::invalidResponse();
        }

        $validated = $validator->validated();

        return new self(
            schemaVersion: $validated['schema_version'],
            processingId: $validated['processing_id'],
            fullText: $validated['content']['full_text'],
            document: $validated['document'],
            sections: $validated['content']['sections'],
        );
    }

    public function metadata(): array
    {
        return [
            'schema_version' => $this->schemaVersion,
            'processing_id' => $this->processingId,
            'document' => [
                'page_count' => $this->document['page_count'],
                'character_count' => $this->document['character_count'],
                'sha256' => $this->document['sha256'],
                'metadata' => $this->document['metadata'],
            ],
            'ats' => $this->document['ats'],
            'sections' => $this->sections,
        ];
    }
}
