"""
Prescription Scan Service
=========================
Pipeline (Sarvam AI Document Intelligence REST API + OpenAI):
  1. Receive file bytes (JPG / PNG / PDF) from the API route.
  2. Prepare upload payload:
       • PDF  → uploaded as-is (prescription.pdf)
       • Image (JPG/PNG) → wrapped in a flat ZIP (prescription.zip containing
         page_001.jpg/png). Sarvam natively supports ZIP of JPEG/PNG images,
         which is more reliable than Pillow-generated PDFs.
  3. Run the Sarvam AI Document Intelligence job via direct HTTP calls:
       POST /job  →  POST /upload-files (get presigned URL)  →
       PUT presigned URL  →  POST /{job_id}/start  →
       poll /{job_id}/status  →  POST /{job_id}/download-files  →
       fetch each presigned download URL  →  extract Markdown
  4. Pass the Markdown to OpenAI GPT-4o-mini which:
       - Parses every medication name, dosage, timing, and frequency.
       - Researches and fills any field absent from the prescription.
       - Returns structured JSON matching the MedicationCreate schema.
"""

from __future__ import annotations

import asyncio
import io
import json
import logging
import re
import time
import urllib.request
import zipfile
from datetime import date

logger = logging.getLogger("prescription_service")

import httpx
from openai import AsyncOpenAI
from PIL import Image

from config import get_settings

settings = get_settings()
openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# Tavily client for real-time medicine web search (optional — degrades gracefully)
_tavily_client = None
try:
    from tavily import TavilyClient  # type: ignore
    if settings.TAVILY_API_KEY:
        _tavily_client = TavilyClient(api_key=settings.TAVILY_API_KEY)
except ImportError:
    pass

# Sarvam Document Intelligence base URL
_SARVAM_BASE = "https://api.sarvam.ai/doc-digitization/job/v1"


# ---------------------------------------------------------------------------
# Helper – Prepare upload payload (PDF as-is, images wrapped in ZIP)
# ---------------------------------------------------------------------------

def _prepare_upload(file_bytes: bytes, content_type: str, filename: str) -> tuple[bytes, str, str]:
    """
    Return (upload_bytes, upload_filename, http_content_type).

    • PDF  → (original bytes, 'prescription.pdf', 'application/pdf')
    • Image → bytes wrapped in a flat ZIP containing the image as
              'page_001.jpg' or 'page_001.png'.  Sarvam natively supports
              ZIP archives of JPEG/PNG pages, which avoids the Pillow-PDF
              compatibility issues that cause job failures.
    """
    if "pdf" in content_type.lower():
        return file_bytes, "prescription.pdf", "application/pdf"

    # Determine image extension
    ext = (filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ("jpg", "jpeg", "png"):
        # Validate via Pillow and normalise to JPEG if unknown
        img = Image.open(io.BytesIO(file_bytes))
        buf = io.BytesIO()
        fmt = "PNG" if img.mode == "RGBA" else "JPEG"
        img.save(buf, format=fmt)
        file_bytes = buf.getvalue()
        ext = "png" if fmt == "PNG" else "jpg"

    img_filename = f"page_001.{'jpg' if ext in ('jpg', 'jpeg') else 'png'}"

    # Wrap the image in a flat ZIP
    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w", compression=zipfile.ZIP_STORED) as zf:
        zf.writestr(img_filename, file_bytes)
    return zip_buf.getvalue(), "prescription.zip", "application/zip"


# ---------------------------------------------------------------------------
# Step 2 – Sarvam Document Intelligence (direct REST, run in thread pool)
# ---------------------------------------------------------------------------

def _run_sarvam_sync(upload_bytes: bytes, upload_filename: str, upload_content_type: str) -> str:
    """
    Execute the full Sarvam Document Intelligence workflow synchronously
    via direct HTTP calls (no SDK).
    Called via asyncio.to_thread so the FastAPI event loop is never blocked.

    Workflow:
      POST /job  →  POST /upload-files (get presigned URL)  →
      PUT presigned URL  →  POST /{job_id}/start  →
      poll /{job_id}/status  →  POST /{job_id}/download-files  →
      fetch each presigned download URL  →  extract Markdown
    """
    headers = {
        "api-subscription-key": settings.SARVAM_API_KEY,
    }

    with httpx.Client(timeout=60) as client:
        # 1. Create job — language/output_format must be nested under job_parameters
        resp = client.post(
            _SARVAM_BASE,
            headers=headers,
            json={"job_parameters": {"language": "en-IN", "output_format": "md"}},
        )
        resp.raise_for_status()
        job_id = resp.json()["job_id"]

        # 2. Get presigned upload URL
        resp = client.post(
            f"{_SARVAM_BASE}/upload-files",
            headers=headers,
            json={"job_id": job_id, "files": [upload_filename]},
        )
        resp.raise_for_status()
        upload_data = resp.json()
        file_upload_info = upload_data.get("upload_urls", {}).get(upload_filename, {})
        presigned_url = (
            file_upload_info.get("file_url")
            or file_upload_info.get("url")
            or file_upload_info.get("presigned_url")
        )
        if not presigned_url:
            raise RuntimeError(
                f"Sarvam did not return a presigned URL: {upload_data}"
            )

        # 3. Upload file to presigned URL.
        # Use urllib.request instead of httpx to avoid httpx re-encoding the
        # already-percent-encoded SAS URL (which would corrupt the signature).
        # Azure Blob Storage also requires x-ms-blob-type: BlockBlob.
        upload_req = urllib.request.Request(
            presigned_url,
            data=upload_bytes,
            method="PUT",
            headers={
                "Content-Type": upload_content_type,
                "x-ms-blob-type": "BlockBlob",
            },
        )
        with urllib.request.urlopen(upload_req, timeout=120) as upload_resp:
            if upload_resp.status not in (200, 201):
                raise RuntimeError(
                    f"Presigned upload failed with status {upload_resp.status}"
                )

        # 4. Start the job
        resp = client.post(f"{_SARVAM_BASE}/{job_id}/start", headers=headers)
        resp.raise_for_status()

    # 5. Poll for completion (max 120 s, poll every 5 s)
    deadline = time.monotonic() + 120
    with httpx.Client(timeout=30) as client:
        while time.monotonic() < deadline:
            resp = client.get(
                f"{_SARVAM_BASE}/{job_id}/status",
                headers=headers,
            )
            resp.raise_for_status()
            state = resp.json().get("job_state", "")
            if state in ("Completed", "PartiallyCompleted"):
                break
            if state in ("Failed", "Cancelled"):
                raise RuntimeError(
                    f"Sarvam Document Intelligence job ended in state: {state}"
                )
            time.sleep(5)
        else:
            raise RuntimeError("Sarvam Document Intelligence job timed out after 120 s")

        # 6. Get presigned download URLs via POST /{job_id}/download-files
        resp = client.post(
            f"{_SARVAM_BASE}/{job_id}/download-files",
            headers=headers,
        )
        resp.raise_for_status()
        download_data = resp.json()
        download_urls: dict = download_data.get("download_urls", {})
        if not download_urls:
            raise RuntimeError(
                f"Sarvam returned no download URLs: {download_data}"
            )

        # 7. Fetch each output file from its presigned URL (sorted for page order)
        text_parts: list[str] = []
        for filename in sorted(download_urls.keys()):
            file_info = download_urls[filename]
            file_url = (
                file_info.get("file_url")
                or file_info.get("url")
                or file_info.get("presigned_url")
            )
            if not file_url:
                continue
            # Use urllib.request to avoid httpx re-encoding the already-percent-encoded
            # SAS URL, which corrupts the signature and causes 403 errors.
            with urllib.request.urlopen(file_url, timeout=60) as dl_resp:
                content_bytes = dl_resp.read()

            # Output is a ZIP containing .md files, or sometimes raw .md directly
            if content_bytes[:2] == b"PK":
                # ZIP archive — extract all text/markdown files
                with zipfile.ZipFile(io.BytesIO(content_bytes), "r") as zf:
                    for entry in sorted(zf.namelist()):
                        if entry.endswith(".md") or entry.endswith(".txt"):
                            text_parts.append(
                                zf.read(entry).decode("utf-8", errors="replace")
                            )
                    # Fallback: read everything if no .md/.txt found in this zip
                    if not text_parts:
                        for entry in sorted(zf.namelist()):
                            try:
                                text_parts.append(
                                    zf.read(entry).decode("utf-8", errors="replace")
                                )
                            except Exception:
                                pass
            else:
                # Plain text / Markdown delivered directly
                text_parts.append(content_bytes.decode("utf-8", errors="replace"))

    extracted = "\n\n".join(text_parts).strip()

    # ── Sarvam extracted text log ─────────────────────────────────────────────
    logger.info(
        "[SARVAM] Text extracted — %d chars:\n%s%s",
        len(extracted),
        extracted[:2000],
        "\n... [TRUNCATED IN LOG]" if len(extracted) > 2000 else "",
    )

    return extracted


# ---------------------------------------------------------------------------
# Step 3a – Truncate helper (avoids GPT token limit errors)
# ---------------------------------------------------------------------------

def _truncate_ocr_text(raw_text: str, max_chars: int = 8000) -> str:
    """Keep the first 60 % and last 40 % of long OCR dumps; drop the middle."""
    if len(raw_text) <= max_chars:
        return raw_text
    head = int(max_chars * 0.6)
    tail = max_chars - head
    return (
        raw_text[:head]
        + "\n\n... [MIDDLE SECTION OMITTED] ...\n\n"
        + raw_text[-tail:]
    )


# ---------------------------------------------------------------------------
# Step 3b – GPT: parse raw OCR text → intermediate medicine list
#            (marks unknown fields as "Unknown" instead of guessing)
# ---------------------------------------------------------------------------

async def _parse_medicines_gpt(raw_text: str) -> list[dict]:
    """
    Ask GPT-4o-mini to extract every medicine from the OCR text.
    Returns a list of dicts with keys:
      medicine_name, dosage, frequency, timings, notes
    Fields that cannot be read from the prescription are set to "Unknown".
    """
    text = _truncate_ocr_text(raw_text)

    prompt = f"""You are an expert medical prescription parser.

Extract ALL medicines from the prescription text below.
Skip medications marked as SOS / PRN / "if needed" / "when required".

For each medicine return:
- medicine_name : clean name, strip prefixes like TAB/SYP/CAP/INJ
- dosage        : amount per dose (e.g. "500mg", "5ml"). "Unknown" if not present.
- frequency     : one of "once a day" | "twice a day" | "thrice a day" | "four times a day" | "Unknown"
                  Convert shorthand: OD→once, BD/BID→twice, TDS→thrice, QID/Q6H→four times,
                  Q8H→thrice, Q12H→twice
- timings       : array derived from frequency:
                  once  → ["morning"]
                  twice → ["morning","evening"]
                  thrice→ ["morning","afternoon","evening"]
                  four  → ["morning","afternoon","evening","night"]
                  Unknown frequency → []
- notes         : any doctor instructions (e.g. "after meals", "at bedtime"). "" if none.

Respond ONLY with valid JSON — no markdown, no explanation:
{{"medicines": [{{"medicine_name":"","dosage":"","frequency":"","timings":[],"notes":""}}], "total_found": 0}}

Prescription text:
\"\"\"
{text}
\"\"\""""

    resp = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an expert medical prescription parser. Always return valid JSON."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
        max_tokens=2000,
        response_format={"type": "json_object"},
    )
    data = json.loads(resp.choices[0].message.content)
    medicines = data.get("medicines", [])

    # ── GPT parse log ─────────────────────────────────────────────────────────
    logger.info("[GPT-PARSE] Extracted %d medicine(s) from OCR text:", len(medicines))
    for i, med in enumerate(medicines, 1):
        logger.info(
            "  [%d] %s | dosage=%s | frequency=%s | timings=%s | notes=%s",
            i,
            med.get("medicine_name", "?"),
            med.get("dosage", "?"),
            med.get("frequency", "?"),
            med.get("timings", []),
            med.get("notes", ""),
        )

    return medicines


# ---------------------------------------------------------------------------
# Step 3c – Name correction (OCR errors like "nolo-650" → "dolo-650")
# ---------------------------------------------------------------------------

def _search_name_verification_tavily(medicine_name: str) -> str | None:
    """
    Search Tavily to check if a medicine name actually exists.
    Returns search context, or None if unavailable / not found.
    """
    if not _tavily_client:
        return None
    try:
        result = _tavily_client.search(
            query=f"{medicine_name} medicine drug pharmaceutical",
            search_depth="basic",
            max_results=3,
            include_answer=True,
        )
        parts: list[str] = []
        if result.get("answer"):
            parts.append(f"Summary: {result['answer']}")
        for r in result.get("results", [])[:3]:
            parts.append(f"Source: {r.get('title', '')}\n{r.get('content', '')[:400]}")
        return "\n\n".join(parts) if parts else None
    except Exception as exc:
        logger.error("[NAME-VERIFY] Tavily error for '%s': %s", medicine_name, exc)
        return None


async def _correct_medicine_name_gpt(
    extracted_name: str, search_context: str | None
) -> str:
    """
    Ask GPT to verify and correct an OCR-extracted medicine name.
    Returns the corrected name, or the original if already correct.
    """
    context_section = (
        f"\nWeb search results for '{extracted_name}':\n{search_context}\n"
        if search_context
        else "\nNo web search results were found for this name.\n"
    )

    prompt = f"""An OCR scanner extracted the medicine name: "{extracted_name}"
{context_section}
OCR commonly makes these character substitution errors:
  n ↔ d,  0 ↔ o,  l ↔ 1,  i ↔ l,  rn ↔ m,  cl ↔ d,  vv ↔ w,  h ↔ b

Task:
1. Check if "{extracted_name}" is a real, known medicine/brand name.
2. If YES and the web search confirms it — return it unchanged.
3. If NO or the web search doesn't confirm it — suggest the most likely correct
   medicine name by applying common OCR character corrections.
4. Only correct the name if you are confident. If genuinely unsure, return the original.

Respond ONLY with valid JSON:
{{"original": "{extracted_name}", "corrected": "name here", "was_corrected": true/false, "reason": "brief reason"}}"""

    try:
        resp = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a pharmacology expert specialising in medicine name recognition and OCR error correction."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=150,
            response_format={"type": "json_object"},
        )
        data = json.loads(resp.choices[0].message.content)
        corrected = data.get("corrected", extracted_name).strip()
        was_corrected = data.get("was_corrected", False)
        reason = data.get("reason", "")

        if was_corrected and corrected and corrected.lower() != extracted_name.lower():
            logger.info(
                "[NAME-CORRECT] '%s' → '%s' | reason: %s",
                extracted_name, corrected, reason,
            )
            return corrected
        else:
            logger.info("[NAME-CORRECT] '%s' — confirmed correct, no change.", extracted_name)
            return extracted_name
    except Exception as exc:
        logger.error("[NAME-CORRECT] GPT error for '%s': %s", extracted_name, exc)
        return extracted_name


async def _correct_all_names(medicines: list[dict]) -> list[dict]:
    """
    For every parsed medicine, verify the OCR-extracted name via Tavily + GPT
    and correct any recognition errors before enrichment.
    """
    corrected = []
    for med in medicines:
        original_name = med.get("medicine_name", "")
        if not original_name:
            corrected.append(med)
            continue

        # Tavily: check if name exists in the real world
        search_ctx = await asyncio.to_thread(
            _search_name_verification_tavily, original_name
        )

        # GPT: verify / correct based on search results
        correct_name = await _correct_medicine_name_gpt(original_name, search_ctx)

        corrected.append({**med, "medicine_name": correct_name})

    return corrected


# ---------------------------------------------------------------------------
# Step 3d – Tavily: web search for medicines with missing fields
# ---------------------------------------------------------------------------

def _search_medicine_tavily(medicine_name: str, missing_fields: list[str]) -> str | None:
    """
    Search Tavily for standard dosage / frequency info about a medicine.
    Returns a formatted string of search results, or None if unavailable.
    """
    if not _tavily_client:
        return None
    try:
        fields_str = ", ".join(missing_fields)
        query = f"{medicine_name} medicine standard {fields_str} typical adult prescription dosage"
        result = _tavily_client.search(
            query=query,
            search_depth="advanced",
            max_results=3,
            include_answer=True,
        )
        parts: list[str] = []
        if result.get("answer"):
            parts.append(f"Summary: {result['answer']}")
        for r in result.get("results", [])[:3]:
            parts.append(f"Source: {r.get('title','')}\n{r.get('content','')}")
        context = "\n\n".join(parts) if parts else None

        # ── Tavily search log ──────────────────────────────────────────────────
        if context:
            logger.info(
                "[TAVILY] Search for '%s' (missing: %s):\n%s",
                medicine_name,
                ", ".join(missing_fields),
                context[:1500] + ("\n... [TRUNCATED IN LOG]" if len(context) > 1500 else ""),
            )
        else:
            logger.info(
                "[TAVILY] No results for '%s' (missing: %s)",
                medicine_name,
                ", ".join(missing_fields),
            )

        return context
    except Exception as exc:
        logger.error("[TAVILY] Search error for '%s': %s", medicine_name, exc)
        return None


# ---------------------------------------------------------------------------
# Step 3d – GPT: enrich one medicine using Tavily search context
# ---------------------------------------------------------------------------

async def _enrich_medicine_gpt(
    medicine: dict,
    missing_fields: list[str],
    search_context: str | None,
) -> dict:
    """
    Ask GPT-4o-mini to fill missing fields using Tavily web search results.
    Returns the enriched medicine dict (original unchanged if enrichment fails).
    """
    name = medicine.get("medicine_name", "Unknown")

    prompt = f"""A prescription was scanned but some medicine information is missing.

Medicine: {name}
Current dosage   : {medicine.get("dosage", "Unknown")}
Current frequency: {medicine.get("frequency", "Unknown")}
Current timings  : {medicine.get("timings", [])}
Missing fields   : {", ".join(missing_fields)}
"""
    if search_context:
        prompt += f"\nREAL-TIME WEB SEARCH RESULTS:\n{search_context}\n"

    prompt += """
Using the web search results (if available) and your medical knowledge, fill in the missing fields.

Rules:
1. Prioritise web search results.
2. Use typical adult dosage values only.
3. frequency must be exactly one of: "once a day" | "twice a day" | "thrice a day" | "four times a day"
4. timings must use: "morning" | "afternoon" | "evening" | "night"
5. If genuinely uncertain, use "Unable to determine" — never guess unsafely.

Respond ONLY with valid JSON:
{"dosage": "...", "frequency": "...", "timings": [], "confidence": "high|medium|low"}"""

    try:
        resp = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a medical expert filling missing prescription data. Patient safety is critical — be conservative."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=300,
            response_format={"type": "json_object"},
        )
        enriched = json.loads(resp.choices[0].message.content)
        result = medicine.copy()
        valid_timings = {"morning", "afternoon", "evening", "night"}

        if "dosage" in missing_fields and enriched.get("dosage") not in (None, "", "Unable to determine"):
            result["dosage"] = enriched["dosage"]
        if "frequency" in missing_fields and enriched.get("frequency") not in (None, "", "Unable to determine"):
            result["frequency"] = enriched["frequency"]
        if "timings" in missing_fields:
            t = [x for x in enriched.get("timings", []) if x in valid_timings]
            if t:
                result["timings"] = t

        # ── GPT enrich log ────────────────────────────────────────────────────
        logger.info(
            "[GPT-ENRICH] '%s' — filled fields: %s | confidence: %s\n"
            "  dosage=%s | frequency=%s | timings=%s",
            name,
            ", ".join(missing_fields),
            enriched.get("confidence", "?"),
            result.get("dosage"),
            result.get("frequency"),
            result.get("timings"),
        )

        return result
    except Exception as exc:
        logger.error("[GPT-ENRICH] Error for '%s': %s", name, exc)
        return medicine


# ---------------------------------------------------------------------------
# Step 3e – Convert enriched intermediate list → MedicationCreate schema
# ---------------------------------------------------------------------------

_TIMING_TO_TIME = {
    "morning":   "08:00",
    "afternoon": "13:00",
    "evening":   "20:00",
    "night":     "21:00",
}

_FREQUENCY_MAP = {
    "once a day":       "daily",
    "twice a day":      "daily",
    "thrice a day":     "daily",
    "four times a day": "daily",
}

def _to_schema(medicine: dict) -> dict:
    """Convert intermediate medicine dict to MedicationCreate schema format."""
    today_iso = date.today().isoformat()

    # Build time_schedule from timings list
    timings: list[str] = medicine.get("timings") or []
    time_schedule = [_TIMING_TO_TIME[t] for t in timings if t in _TIMING_TO_TIME]
    if not time_schedule:
        time_schedule = ["08:00"]  # safe default

    # Parse dosage into number + unit
    raw_dosage: str = medicine.get("dosage", "") or ""
    dosage_num = ""
    dosage_unit = "tablet"
    m = re.match(r"([\d.]+)\s*([a-zA-Z]+)?", raw_dosage.strip())
    if m:
        dosage_num = m.group(1)
        unit_raw = (m.group(2) or "").lower()
        unit_map = {"mg": "mg", "ml": "ml", "mcg": "mg", "g": "mg",
                    "tablet": "tablet", "tab": "tablet", "cap": "capsule",
                    "capsule": "capsule", "drop": "drop", "patch": "patch", "puff": "puff"}
        dosage_unit = unit_map.get(unit_raw, "tablet")
    else:
        dosage_num = "1"

    frequency = _FREQUENCY_MAP.get(
        (medicine.get("frequency") or "").lower(), "daily"
    )

    return {
        "medication_name": medicine.get("medicine_name", "Unknown"),
        "dosage": dosage_num,
        "dosage_unit": dosage_unit,
        "time_schedule": time_schedule,
        "frequency": frequency,
        "specific_days": [],
        "start_date": today_iso,
        "end_date": None,
        "category": "general",
        "notes": medicine.get("notes", ""),
    }


# ---------------------------------------------------------------------------
# Step 3 – Orchestrate: parse → enrich → convert
# ---------------------------------------------------------------------------

async def _structure_medications_openai(raw_text: str) -> list[dict]:
    """
    Full Step 3 pipeline:
      3b. GPT parses raw OCR text → intermediate medicine list
      3c. Tavily + GPT verify & correct OCR-mangled medicine names
      3d. Tavily searches for each medicine with missing fields (in thread pool)
      3e. GPT enriches missing fields using search context
      3f. Convert to MedicationCreate schema
    """
    # 3b – parse
    medicines = await _parse_medicines_gpt(raw_text)
    if not medicines:
        return []

    # 3c – verify / correct medicine names (OCR error correction)
    medicines = await _correct_all_names(medicines)

    # 3d + 3e – enrich medicines that have unknown fields
    enriched: list[dict] = []
    for med in medicines:
        missing = [
            f for f, v in [
                ("dosage",    med.get("dosage", "")),
                ("frequency", med.get("frequency", "")),
                ("timings",   "x" if med.get("timings") else ""),  # "x" = present, "" = absent
            ]
            if not v or v.lower() in ("unknown", "")
        ]
        name = med.get("medicine_name", "?")
        if missing:
            logger.info("[ENRICH] '%s' has missing fields: %s — searching Tavily...", name, ", ".join(missing))
            search_ctx = await asyncio.to_thread(
                _search_medicine_tavily, name, missing
            )
            med = await _enrich_medicine_gpt(med, missing, search_ctx)
        else:
            logger.info("[ENRICH] '%s' — all fields present, skipping enrichment.", name)
        enriched.append(med)

    # 3f – convert to schema
    schema_list = [_to_schema(m) for m in enriched]

    # ── Final schema log ──────────────────────────────────────────────────────
    logger.info("[SCHEMA] Final %d medication(s) ready for DB:", len(schema_list))
    for i, med in enumerate(schema_list, 1):
        logger.info(
            "  [%d] %s | dosage=%s %s | schedule=%s | frequency=%s | category=%s | notes=%s",
            i,
            med.get("medication_name"),
            med.get("dosage"),
            med.get("dosage_unit"),
            med.get("time_schedule"),
            med.get("frequency"),
            med.get("category"),
            med.get("notes"),
        )

    return schema_list


# ---------------------------------------------------------------------------
# Public entry point called by the route handler
# ---------------------------------------------------------------------------

async def scan_prescription(
    file_bytes: bytes,
    filename: str,
    content_type: str,
) -> list[dict]:
    """
    Full pipeline: uploaded file bytes → list of structured medication dicts.

    Supported input formats: JPEG, PNG, PDF.
    Images are wrapped in a ZIP for Sarvam (more reliable than PDF conversion).

    Returns:
        List of dicts matching the MedicationCreate schema.

    Raises:
        ValueError:   User-facing problem (bad file, no text detected…).
        RuntimeError: Sarvam job-level failure.
    """
    # Normalise content type for ambiguous uploads
    ext = (filename or "").rsplit(".", 1)[-1].lower()
    if content_type in ("application/octet-stream", ""):
        content_type = "application/pdf" if ext == "pdf" else f"image/{ext}"

    # Step 1 – Prepare upload payload (PDF as-is, images wrapped in ZIP)
    try:
        upload_bytes, upload_filename, upload_content_type = _prepare_upload(
            file_bytes, content_type, filename
        )
    except Exception as exc:
        raise ValueError(
            f"Could not read the uploaded file as an image or PDF: {exc}"
        ) from exc

    # Step 2 – OCR via Sarvam Document Intelligence (runs in thread pool)
    try:
        raw_text = await asyncio.to_thread(
            _run_sarvam_sync, upload_bytes, upload_filename, upload_content_type
        )
    except RuntimeError:
        raise
    except Exception as exc:
        raise RuntimeError(
            f"Sarvam Document Intelligence error: {exc}"
        ) from exc

    if not raw_text or len(raw_text.strip()) < 10:
        raise ValueError(
            "Could not extract meaningful text from the prescription. "
            "Please upload a clearer photo or scan the document as a PDF."
        )

    logger.info("[SCAN] Sarvam OCR complete — %d chars extracted. Proceeding to GPT parse + Tavily enrichment.", len(raw_text.strip()))

    # Step 3 – Structure via OpenAI
    try:
        medications = await _structure_medications_openai(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"AI parser returned malformed JSON: {exc}"
        ) from exc

    if not isinstance(medications, list):
        raise ValueError("Unexpected response structure from AI parser.")

    return medications

