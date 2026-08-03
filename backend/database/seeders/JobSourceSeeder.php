<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\JobSource;
use Illuminate\Database\Seeder;

final class JobSourceSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['name' => 'LinkedIn', 'slug' => 'linkedin', 'base_url' => 'https://www.linkedin.com/jobs'],
            ['name' => 'Gupy', 'slug' => 'gupy', 'base_url' => 'https://portal.gupy.io'],
            ['name' => 'Indeed', 'slug' => 'indeed', 'base_url' => 'https://br.indeed.com'],
            ['name' => 'Glassdoor', 'slug' => 'glassdoor', 'base_url' => 'https://www.glassdoor.com.br'],
            ['name' => 'Talora', 'slug' => 'talora', 'base_url' => null],
        ] as $source) {
            JobSource::query()->updateOrCreate(
                ['slug' => $source['slug']],
                [...$source, 'is_active' => true],
            );
        }
    }
}
