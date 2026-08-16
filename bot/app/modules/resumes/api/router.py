from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile

from app.core.security import BackendRequestContext, authenticate_backend
from app.modules.resumes.schemas.response import ResumeExtractionResponse
from app.modules.resumes.services.resume_extraction_service import ResumeExtractionService

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.post("/extract", response_model=ResumeExtractionResponse)
async def extract_resume(
    file: Annotated[UploadFile, File(...)],
    context: Annotated[BackendRequestContext, Depends(authenticate_backend)],
) -> ResumeExtractionResponse:
    return await ResumeExtractionService().extract(file, context)
