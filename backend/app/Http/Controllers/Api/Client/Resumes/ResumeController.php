<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Client\Resumes;

use App\Actions\Resumes\StoreUserResumeAction;
use App\Helpers\ResponseApi;
use App\Http\ApiRequests\Client\Resumes\StoreResumeRequest;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResumeDetailResource;
use App\Http\Resources\UserResumeResource;
use App\Models\UserResume;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ResumeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $resumes = $request->user()
            ->resumes()
            ->latest()
            ->get();

        return ResponseApi::success(
            'Resumes retrieved successfully.',
            [
                'resumes' => UserResumeResource::collection($resumes)->resolve($request),
            ],
        );
    }

    public function store(
        StoreResumeRequest $request,
        StoreUserResumeAction $action,
    ): JsonResponse {
        try {
            $resume = $action->execute(
                user: $request->user(),
                file: $request->file('file'),
                name: $request->string('name')->toString(),
                isPrimary: $request->boolean('is_primary'),
            );

            return ResponseApi::success(
                'Resume uploaded and queued for processing.',
                [
                    'resume' => (new UserResumeResource($resume))->resolve($request),
                ],
                202,
            );
        } catch (Exception $exception) {
            report($exception);

            return ResponseApi::error(
                'Internal error',
                [
                    'message' => 'Something went wrong while creating the resume.',
                ],
                500,
            );
        }
    }

    public function show(Request $request, UserResume $resume): JsonResponse
    {
        $this->authorize('view', $resume);

        return ResponseApi::success(
            'Resume retrieved successfully.',
            [
                'resume' => (new UserResumeDetailResource($resume))->resolve($request),
            ],
        );
    }

    public function destroy(UserResume $resume): JsonResponse
    {
        $this->authorize('delete', $resume);

        try {
            $resume->delete();

            return ResponseApi::success('Resume deleted successfully.');
        } catch (Exception $exception) {
            report($exception);

            return ResponseApi::error(
                'Internal error',
                [
                    'message' => 'Something went wrong while deleting the resume.',
                ],
                500,
            );
        }
    }
}
