# ATS score, multi-column extraction and feedback

## ATS score

`document.ats.confidence` is the classifier confidence and must never be presented as an ATS score.
The BOT now returns an optional `document.ats.score` from 0 to 100 based on extraction/readability characteristics.
Frontend and mobile only render the ATS score when that field exists. Diagnostic confidence is displayed separately.

## Multi-column PDFs

The PDF extractor now performs layout-aware extraction. When it detects a narrow sidebar plus a main column, it reads each column independently instead of interleaving blocks by vertical position. The section parser also recognizes common visual-resume headings such as `Sobre`, `Core Technologies`, `Engineering` and `Projeto Open Source`, as well as experiences whose role/company/period are on separate lines.

## Resume primary selection

Uploads accept `is_primary` as an explicit user choice. Selecting it demotes the previous primary resume; leaving it unchecked preserves the existing primary resume.

## Feedback

Web success feedback uses Sonner toasts. Resume deletion uses a custom confirmation dialog instead of `window.confirm`.
Mobile includes a global toast provider for success/error feedback and a custom destructive confirmation modal for resume deletion.
