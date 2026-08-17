<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Actions\Resumes\StoreUserResumeAction;
use App\Enums\UserResumeStatus;
use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\User;
use App\Models\UserResume;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;
use JsonException;

final class ResourceController extends Controller
{
    public function index(Request $request, string $resource): View
    {
        $config = $this->resource($resource);
        /** @var class-string<Model> $model */
        $model = $config['model'];
        $query = $model::query();

        $search = trim((string) $request->query('q'));
        $searchable = $config['search'] ?? [];

        if ($search !== '' && $searchable !== []) {
            $query->where(function (Builder $builder) use ($search, $searchable): void {
                foreach ($searchable as $index => $field) {
                    $method = $index === 0 ? 'where' : 'orWhere';
                    $builder->{$method}($field, 'like', '%' . $search . '%');
                }
            });
        }

        return view('admin.resources.index', [
            'resourceKey' => $resource,
            'resource' => $config,
            'items' => $query->latest('id')->paginate(20)->withQueryString(),
        ]);
    }

    public function create(string $resource): View
    {
        $config = $this->resource($resource);

        return view('admin.resources.form', [
            'resourceKey' => $resource,
            'resource' => $config,
            'item' => null,
            'options' => $this->relationOptions($config, false),
        ]);
    }

    public function store(Request $request, string $resource, StoreUserResumeAction $storeResume): RedirectResponse
    {
        $config = $this->resource($resource);
        $validated = $request->validate($this->rules($config, false));

        if (($config['special'] ?? null) === 'resume') {
            /** @var User $user */
            $user = User::query()->findOrFail((int) $validated['user_id']);
            $storeResume->execute($user, $request->file('file'), (string) $validated['name']);

            return redirect()->route('admin.resources.index', $resource)->with('success', 'Currículo enviado para processamento.');
        }

        $data = $this->normalize($request, $config, $validated, false);
        /** @var class-string<Model> $model */
        $model = $config['model'];
        $model::query()->create($data);

        return redirect()->route('admin.resources.index', $resource)->with('success', $config['singular'] . ' criado com sucesso.');
    }

    public function show(string $resource, int $id): View
    {
        $resourceKey = $resource;
        $resource = $this->resource($resourceKey);
        $item = $this->find($resource, $id);

        return view('admin.resources.show', compact('resource', 'resourceKey', 'item'));
    }

    public function edit(string $resource, int $id): View
    {
        $config = $this->resource($resource);
        $item = $this->find($config, $id);

        return view('admin.resources.form', [
            'resourceKey' => $resource,
            'resource' => $config,
            'item' => $item,
            'options' => $this->relationOptions($config, true),
        ]);
    }

    public function update(Request $request, string $resource, int $id): RedirectResponse
    {
        $config = $this->resource($resource);
        $item = $this->find($config, $id);
        $validated = $request->validate($this->rules($config, true));
        $data = $this->normalize($request, $config, $validated, true);

        if ($item instanceof UserResume && array_key_exists('is_primary', $data) && $data['is_primary'] === true) {
            if ($item->status !== UserResumeStatus::Completed) {
                throw ValidationException::withMessages(['is_primary' => 'Somente currículos processados podem ser definidos como principal.']);
            }

            DB::transaction(function () use ($item, $data): void {
                UserResume::query()->where('user_id', $item->user_id)->whereKeyNot($item->getKey())->update(['is_primary' => false]);
                $item->update($data);
            });
        } else {
            $item->update($data);
        }

        return redirect()->route('admin.resources.index', $resource)->with('success', $config['singular'] . ' atualizado com sucesso.');
    }

    public function destroy(string $resource, int $id): RedirectResponse
    {
        $config = $this->resource($resource);
        $item = $this->find($config, $id);

        if ($item instanceof Admin && $item->getKey() === Auth::guard('admin')->id()) {
            return back()->with('error', 'Você não pode excluir o administrador atualmente autenticado.');
        }

        if ($item instanceof UserResume) {
            DB::transaction(function () use ($item): void {
                $wasPrimary = $item->is_primary;
                Storage::disk($item->disk)->delete($item->path);
                $userId = $item->user_id;
                $item->delete();

                if ($wasPrimary) {
                    $replacement = UserResume::query()
                        ->where('user_id', $userId)
                        ->where('status', UserResumeStatus::Completed->value)
                        ->latest('processed_at')
                        ->first();
                    $replacement?->update(['is_primary' => true]);
                }
            });
        } else {
            $item->delete();
        }

        return redirect()->route('admin.resources.index', $resource)->with('success', $config['singular'] . ' excluído com sucesso.');
    }

    /** @return array<string, mixed> */
    private function resource(string $resource): array
    {
        $config = config('admin_resources.resources.' . $resource);
        abort_unless(is_array($config), 404);
        return $config;
    }

    private function find(array $config, int $id): Model
    {
        /** @var class-string<Model> $model */
        $model = $config['model'];
        return $model::query()->findOrFail($id);
    }

    /** @return array<string, string> */
    private function rules(array $config, bool $updating): array
    {
        $rules = [];
        foreach ($config['fields'] as $key => $field) {
            if (($field['only_create'] ?? false) && $updating) continue;
            if (($field['only_update'] ?? false) && ! $updating) continue;
            $rules[$key] = $updating
                ? ($field['rules_update'] ?? $field['rules'] ?? 'nullable')
                : ($field['rules_create'] ?? $field['rules'] ?? 'nullable');
        }
        return $rules;
    }

    /** @return array<string, mixed> */
    private function normalize(Request $request, array $config, array $validated, bool $updating): array
    {
        $data = Arr::except($validated, ['file']);

        foreach ($config['fields'] as $key => $field) {
            if (($field['only_create'] ?? false) && $updating) continue;
            if (($field['only_update'] ?? false) && ! $updating) continue;

            if (($field['type'] ?? null) === 'boolean') {
                $data[$key] = $request->boolean($key);
            }

            if (($field['type'] ?? null) === 'json' && array_key_exists($key, $data)) {
                $value = $data[$key];
                if ($value === null || $value === '') {
                    $data[$key] = null;
                } elseif (is_string($value)) {
                    try {
                        $data[$key] = json_decode($value, true, 512, JSON_THROW_ON_ERROR);
                    } catch (JsonException) {
                        throw ValidationException::withMessages([$key => 'Informe um JSON válido.']);
                    }
                }
            }

            if (($field['type'] ?? null) === 'password' && ($data[$key] ?? null) === null) {
                unset($data[$key]);
            }
        }

        return $data;
    }

    /** @return array<string, mixed> */
    private function relationOptions(array $config, bool $updating): array
    {
        $options = [];
        foreach ($config['fields'] as $key => $field) {
            if (($field['type'] ?? null) !== 'relation') continue;
            if (($field['only_create'] ?? false) && $updating) continue;
            if (($field['only_update'] ?? false) && ! $updating) continue;

            /** @var class-string<Model> $model */
            $model = $field['model'];
            $option = $field['option'];
            $options[$key] = $model::query()->orderBy($option)->get(['id', $option]);
        }
        return $options;
    }
}
