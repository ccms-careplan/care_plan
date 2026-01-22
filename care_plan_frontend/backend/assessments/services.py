# import re
# import fitz  
# from django.conf import settings
# from openai import OpenAI
# from .schema import ASSESSMENT_JSON_SCHEMA
# from .schema_defaults import ensure_adl_defaults

# def split_into_three_ranges(total_pages: int):
#     """
#     Split page indices into 3 nearly-equal ranges.
#     Returns list of (start, end) inclusive, 0-based.
#     """
#     if total_pages <= 0:
#         return []
#     if total_pages <= 3:
#         return [(i, i) for i in range(total_pages)]

#     base = total_pages // 3
#     rem = total_pages % 3
#     sizes = [base + (1 if i < rem else 0) for i in range(3)]

#     ranges = []
#     start = 0
#     for sz in sizes:
#         end = start + sz - 1
#         ranges.append((start, end))
#         start = end + 1
#     return ranges

# def clean_page_text(text: str) -> str:
#     # Remove repeated headers/footers and normalize whitespace
#     lines = []
#     for line in text.splitlines():
#         l = line.strip()
#         if not l:
#             continue
#         if "AFH Master Forms" in l:
#             continue
#         if re.match(r"^\d+\s*$", l):   # page number only
#             continue
#         lines.append(l)

#     cleaned = "\n".join(lines)
#     cleaned = re.sub(r"[ \t]+", " ", cleaned)
#     return cleaned.strip()

# def extract_pdf_text_by_ranges(pdf_path: str):
#     doc = fitz.open(pdf_path)
#     total = doc.page_count
#     ranges = split_into_three_ranges(total)

#     chunks = []
#     for (s, e) in ranges:
#         pages_text = []
#         for p in range(s, e + 1):
#             page = doc.load_page(p)
#             t = page.get_text("text") or ""
#             pages_text.append(clean_page_text(t))
#         chunk_text = "\n\n".join([x for x in pages_text if x])
#         chunks.append({
#             "range": {"start_page": s+1, "end_page": e+1},  # human 1-based
#             "text": chunk_text
#         })

#     return chunks

# def openai_extract_chunk(client: OpenAI, chunk_text: str, page_range: dict):
#     system = (
#         "You are a clinical document data extractor.\n"
#         "Return ONLY JSON that matches the provided JSON Schema.\n"
#         "Rules:\n"
#         "- If missing, use null (or [] for arrays).\n"
#         "- Do NOT invent facts.\n"
#         "- Keep medication rows separate.\n"
#         "- Copy caregiver instructions as written when available.\n"
#         "- This chunk is part of a larger PDF; extract what is present here.\n"
#         "IMPORTANT: Output must be valid JSON.\n"
#     )

#     user = f"PDF PAGES {page_range['start_page']}–{page_range['end_page']} TEXT:\n\n{chunk_text}"

#     # Structured Outputs via response_format json_schema (schema-constrained) :contentReference[oaicite:0]{index=0}
#     resp = client.chat.completions.create(
#         model=settings.OPENAI_MODEL,
#         messages=[
#             {"role": "system", "content": system},
#             {"role": "user", "content": user},
#         ],
#         response_format={
#             "type": "json_schema",
#             "json_schema": ASSESSMENT_JSON_SCHEMA,
#         },
#         temperature=0
#     )

#     msg = resp.choices[0].message
#     if getattr(msg, "refusal", None):
#         raise RuntimeError(f"Model refused: {msg.refusal}")

#     content = msg.content
#     if not content:
#         raise RuntimeError("Empty model response.")
#     return content  # JSON string

# def deep_merge(a, b):
#     """
#     Merge b into a:
#     - dict: recurse
#     - list: concat + basic dedupe for strings/dicts
#     - scalar: prefer non-null from b, else keep a
#     """
#     if a is None:
#         return b
#     if b is None:
#         return a

#     if isinstance(a, dict) and isinstance(b, dict):
#         out = dict(a)
#         for k, v in b.items():
#             out[k] = deep_merge(out.get(k), v)
#         return out

#     if isinstance(a, list) and isinstance(b, list):
#         out = list(a)
#         for item in b:
#             if item is None:
#                 continue
#             if isinstance(item, str):
#                 if item not in out:
#                     out.append(item)
#             elif isinstance(item, dict):
#                 # naive dedupe by "name" if exists, else append
#                 key = item.get("name") if isinstance(item, dict) else None
#                 if key:
#                     exists = any(isinstance(x, dict) and x.get("name") == key for x in out)
#                     if not exists:
#                         out.append(item)
#                 else:
#                     out.append(item)
#             else:
#                 out.append(item)
#         return out

#     # scalars
#     return b if b not in ("", None) else a

# def extract_full_assessment_from_pdf(pdf_path: str):
#     if not settings.OPENAI_API_KEY:
#         raise RuntimeError("OPENAI_API_KEY is not set on the backend.")

#     client = OpenAI(api_key=settings.OPENAI_API_KEY)

#     chunks = extract_pdf_text_by_ranges(pdf_path)

#     merged = None
#     for ch in chunks:
#         if not ch["text"].strip():
#             continue
#         json_str = openai_extract_chunk(client, ch["text"], ch["range"])
#         part = __import__("json").loads(json_str)
#         merged = part if merged is None else deep_merge(merged, part)

#     if merged is None:
#         raise RuntimeError("No text extracted from PDF.")

#     merged = ensure_adl_defaults(merged)
#     return merged

# def to_review_fields(extracted_json: dict):
#     """
#     Convert extracted JSON to your UI list (field/value/confidence).
#     Confidence here is placeholder; you can add evidence scoring later.
#     """
#     res = extracted_json.get("resident", {}) or {}
#     fields = [
#         {"field": "Patient Name", "value": res.get("name") or "", "confidence": 0.9, "accepted": None},
#         {"field": "Date of Birth", "value": res.get("dob") or "", "confidence": 0.88, "accepted": None},
#         {"field": "Assessment Date", "value": res.get("assessment_date") or "", "confidence": 0.85, "accepted": None},
#         {"field": "Case Manager", "value": res.get("case_manager") or "", "confidence": 0.8, "accepted": None},
#     ]

#     for d in (extracted_json.get("diagnoses") or [])[:15]:
#         fields.append({"field": "Diagnosis", "value": d, "confidence": 0.8, "accepted": None})

#     for m in (extracted_json.get("medications") or [])[:15]:
#         name = m.get("name") or "Medication"
#         val = " ".join([m.get("dose") or "", m.get("route") or "", m.get("frequency") or ""]).strip()
#         fields.append({"field": f"Medication: {name}", "value": val, "confidence": 0.78, "accepted": None})

#     for a in (extracted_json.get("allergies") or [])[:10]:
#         sub = a.get("substance") or "Allergy"
#         val = f"{a.get('type') or ''} - {a.get('reaction') or ''}".strip(" -")
#         fields.append({"field": f"Allergy: {sub}", "value": val, "confidence": 0.72, "accepted": None})

#     return fields




# import re
# import math
# import json
# import numpy as np
# import fitz  # PyMuPDF
# from PIL import Image
# import pytesseract

# from django.conf import settings
# from openai import OpenAI

# from .template_loader import load_template_json


# # -------------------------
# # OCR helpers
# # -------------------------
# def configure_tesseract():
#     if settings.TESSERACT_CMD:
#         pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

# def page_has_text(page: fitz.Page) -> bool:
#     text = (page.get_text("text") or "").strip()
#     # consider "real text" if it has enough letters
#     return len(re.findall(r"[A-Za-z]{3,}", text)) >= 3

# def ocr_page(page: fitz.Page) -> str:
#     """
#     Render page to image and OCR it. Used ONLY when page_has_text is False.
#     """
#     mat = fitz.Matrix(2, 2)  # 2x resolution helps OCR
#     pix = page.get_pixmap(matrix=mat, alpha=False)
#     img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
#     text = pytesseract.image_to_string(img)
#     return text or ""

# def clean_text(text: str) -> str:
#     lines = []
#     for line in (text or "").splitlines():
#         l = line.strip()
#         if not l:
#             continue
#         # remove repetitive junk like AFH headers (you can add more)
#         if "AFH Master Forms" in l:
#             continue
#         # remove standalone page numbers
#         if re.match(r"^\d+\s*$", l):
#             continue
#         lines.append(l)
#     cleaned = "\n".join(lines)
#     cleaned = re.sub(r"[ \t]+", " ", cleaned)
#     return cleaned.strip()


# # -------------------------
# # Chunking (by size, not "3 chunks")
# # -------------------------
# def chunk_text(pages: list[dict], max_chars: int = 2500):
#     """
#     pages: [{"page": 1, "text": "..."}]
#     Returns chunks: [{"page_start": x, "page_end": y, "text": "..."}]
#     """
#     chunks = []
#     current = []
#     cur_len = 0
#     start_page = None

#     for p in pages:
#         t = p["text"].strip()
#         if not t:
#             continue
#         if start_page is None:
#             start_page = p["page"]

#         # if adding would exceed max, flush
#         if cur_len + len(t) > max_chars and current:
#             chunks.append({
#                 "page_start": start_page,
#                 "page_end": current[-1]["page"],
#                 "text": "\n\n".join([x["text"] for x in current])
#             })
#             current = []
#             cur_len = 0
#             start_page = p["page"]

#         current.append(p)
#         cur_len += len(t)

#     if current:
#         chunks.append({
#             "page_start": start_page,
#             "page_end": current[-1]["page"],
#             "text": "\n\n".join([x["text"] for x in current])
#         })

#     return chunks


# # -------------------------
# # Embeddings + retrieval
# # -------------------------
# def cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
#     denom = (np.linalg.norm(a) * np.linalg.norm(b))
#     if denom == 0:
#         return 0.0
#     return float(np.dot(a, b) / denom)

# def embed_texts(client: OpenAI, texts: list[str]) -> list[list[float]]:
#     resp = client.embeddings.create(
#         model=settings.OPENAI_EMBED_MODEL,
#         input=texts
#     )
#     return [item.embedding for item in resp.data]

# def retrieve_top_k(query: str, chunks: list[dict], k: int = 5):
#     """
#     chunks: [{"text":..., "embedding":[...], "page_start":..., "page_end":...}]
#     returns top chunks with similarity
#     """
#     client = OpenAI(api_key=settings.OPENAI_API_KEY)
#     q_emb = embed_texts(client, [query])[0]
#     qv = np.array(q_emb, dtype=np.float32)

#     scored = []
#     for ch in chunks:
#         ev = np.array(ch["embedding"], dtype=np.float32)
#         sim = cosine_sim(qv, ev)
#         scored.append((sim, ch))

#     scored.sort(key=lambda x: x[0], reverse=True)
#     return scored[:k]


# # -------------------------
# # Field extraction (RAG)
# # -------------------------
# def llm_extract_field(client: OpenAI, field_path: str, field_hint: str, evidence_blocks: list[dict]):
#     """
#     Extract ONE field (or small object) using top evidence.
#     Returns JSON value for that field (not the whole template).
#     """
#     evidence_text = "\n\n".join(
#         [f"[PAGES {b['page_start']}-{b['page_end']}]\n{b['text']}" for b in evidence_blocks]
#     )

#     system = (
#         "You extract data from care assessment documents.\n"
#         "Return ONLY valid JSON.\n"
#         "Rules:\n"
#         "- Use null if missing.\n"
#         "- Do not invent.\n"
#         "- Keep the output minimal: only the value for the requested field.\n"
#     )

#     user = (
#         f"FIELD PATH: {field_path}\n"
#         f"FIELD MEANING/HINT: {field_hint}\n\n"
#         f"EVIDENCE:\n{evidence_text}\n\n"
#         "Return JSON for ONLY that field value.\n"
#         "Example outputs:\n"
#         "- string: \"Heather Dean Morrill\"\n"
#         "- object: {\"level\": \"Extensive Assistance\", \"caregiver_instructions\": \"...\", \"strengths\": null}\n"
#         "- array: [\"Dementia\", \"Urinary retention\"]\n"
#     )

#     resp = client.chat.completions.create(
#         model=settings.OPENAI_MODEL,
#         messages=[
#             {"role": "system", "content": system},
#             {"role": "user", "content": user},
#         ],
#         temperature=0,
#     )

#     content = resp.choices[0].message.content or ""
#     return json.loads(content)


# def set_in_dict(obj: dict, path: str, value):
#     """
#     Supports dot paths like:
#       resident.name
#       adl.bathing_personal_hygiene.level
#     (No list paths in this simple setter)
#     """
#     parts = path.split(".")
#     cur = obj
#     for p in parts[:-1]:
#         if p not in cur or not isinstance(cur[p], dict):
#             cur[p] = {}
#         cur = cur[p]
#     cur[parts[-1]] = value


# def build_field_catalog_from_template(template: dict):
#     """
#     Create a list of fields we want to populate.
#     You can customize hints here to improve accuracy.
#     """
#     fields = [
#         ("resident.name", "Resident full name"),
#         ("resident.dob", "Date of birth"),
#         ("resident.assessment_date", "Assessment date"),
#         ("resident.case_manager", "Case manager / prepared by"),
#         ("resident.primary_doctor", "Primary doctor"),
#         ("resident.pharmacy", "Pharmacy"),
#         ("resident.code_status", "Code status"),
#         ("resident.language", "Preferred language"),
#         ("diagnoses", "List of diagnoses / conditions"),
#         ("allergies", "Allergies list (substance/type/reaction)"),
#         ("medications", "Medication list (name/dose/route/frequency)"),
#     ]

#     # If your template contains ADL domains, populate common ones
#     adl_domains = [
#         "eating",
#         "mobility_ambulation",
#         "toileting",
#         "bathing_personal_hygiene",
#         "dressing",
#         "medication_management",
#         "sleep_rest",
#         "communication",
#         "telephone_use",
#     ]
#     for d in adl_domains:
#         fields.append((f"adl.{d}", f"ADL domain '{d}' object with level/strengths/caregiver_instructions"))

#     # behaviors if present
#     fields.append(("behaviors", "Behavior concerns table (name/frequency/triggers/interventions/loc)"))

#     # notes if present
#     fields.append(("notes", "Freeform notes and updates"))

#     return fields


# # -------------------------
# # Main pipeline
# # -------------------------
# def extract_pages_text(pdf_path: str):
#     configure_tesseract()
#     doc = fitz.open(pdf_path)
#     pages = []
#     for i in range(doc.page_count):
#         page = doc.load_page(i)
#         if page_has_text(page):
#             t = page.get_text("text") or ""
#         else:
#             # OCR only scanned/no-text pages
#             t = ocr_page(page)
#         pages.append({"page": i + 1, "text": clean_text(t)})
#     return pages

# def populate_template_from_pdf(pdf_path: str):
#     if not settings.OPENAI_API_KEY:
#         raise RuntimeError("OPENAI_API_KEY is not set. Put it in .env and restart server.")

#     client = OpenAI(api_key=settings.OPENAI_API_KEY)

#     # 1) Extract text per page (OCR only when needed)
#     pages = extract_pages_text(pdf_path)

#     # 2) Chunk text
#     chunks = chunk_text(pages, max_chars=2500)

#     # 3) Embed chunks
#     texts = [c["text"] for c in chunks]
#     embeddings = embed_texts(client, texts)
#     for c, e in zip(chunks, embeddings):
#         c["embedding"] = e

#     # 4) Load template JSON (your clean structure)
#     template = load_template_json()

#     # 5) Build field list we will populate
#     field_catalog = build_field_catalog_from_template(template)

#     confidence_map = {}

#     # 6) For each field: retrieve evidence → extract → set into template
#     for field_path, hint in field_catalog:
#         top = retrieve_top_k(f"{field_path}: {hint}", chunks, k=5)
#         evidence = []
#         sims = []
#         for sim, ch in top:
#             evidence.append(ch)
#             sims.append(sim)

#         # Confidence heuristic from similarity (0..1)
#         conf = max(sims) if sims else 0.0
#         conf = max(0.0, min(1.0, (conf + 1) / 2))  # normalize cosine approx
#         confidence_map[field_path] = conf if conf > 0 else 0.70

#         value = llm_extract_field(client, field_path, hint, evidence)
#         set_in_dict(template, field_path, value)

#     return template, confidence_map, chunks


# import io
# import os
# import json
# import math
# import base64
# from dataclasses import dataclass
# from typing import List, Dict, Any, Tuple

# import fitz  # PyMuPDF
# import numpy as np
# import cv2
# from PIL import Image
# import pytesseract

# from django.conf import settings
# from openai import OpenAI


# # -----------------------------
# # Helpers: math + confidence
# # -----------------------------
# def clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
#     return max(lo, min(hi, x))

# def cosine(a: List[float], b: List[float]) -> float:
#     # Safe cosine
#     da = 0.0
#     db = 0.0
#     dot = 0.0
#     for x, y in zip(a, b):
#         dot += x * y
#         da += x * x
#         db += y * y
#     if da <= 0 or db <= 0:
#         return 0.0
#     return dot / (math.sqrt(da) * math.sqrt(db))


# # -----------------------------
# # Load template JSON
# # -----------------------------
# def load_careplan_template() -> Dict[str, Any]:
#     path = settings.CAREPLAN_TEMPLATE_PATH
#     if not os.path.exists(path):
#         # also allow relative to BASE_DIR
#         alt = os.path.join(str(settings.BASE_DIR), path)
#         if os.path.exists(alt):
#             path = alt
#         else:
#             raise RuntimeError(f"CAREPLAN template not found at: {path}")
#     with open(path, "r", encoding="utf-8") as f:
#         return json.load(f)

# def flatten_template_checkboxes(template: Dict[str, Any]) -> List[Dict[str, Any]]:
#     out = []
#     for sec in template.get("sections", []):
#         for cb in sec.get("checkboxes", []):
#             out.append({
#                 "section_id": sec.get("id"),
#                 "section_title": sec.get("title"),
#                 "key": cb.get("key"),
#                 "label": (cb.get("label") or "").strip(),
#             })
#     return out


# # -----------------------------
# # OCR + Checkbox Detection
# # -----------------------------
# @dataclass
# class ExtractedCheckbox:
#     label: str
#     checked: bool
#     checkbox_conf: float     # how sure we are it’s checked/unchecked
#     ocr_conf: float          # how clean the OCR label is
#     page: int

# def _ensure_tesseract():
#     if settings.TESSERACT_CMD:
#         pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

# def pil_from_pixmap(pix: fitz.Pixmap) -> Image.Image:
#     mode = "RGB" if pix.n < 4 else "RGBA"
#     img = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
#     if img.mode == "RGBA":
#         img = img.convert("RGB")
#     return img

# def page_has_text(page: fitz.Page) -> bool:
#     t = (page.get_text("text") or "").strip()
#     return len(t) > 20  # small threshold

# def render_page_to_image(page: fitz.Page, zoom: float = 2.0) -> Image.Image:
#     mat = fitz.Matrix(zoom, zoom)
#     pix = page.get_pixmap(matrix=mat, alpha=False)
#     return pil_from_pixmap(pix)

# def detect_checkboxes_and_labels(pil_img: Image.Image, page_num_1based: int) -> List[ExtractedCheckbox]:
#     """
#     1) Find square checkbox contours.
#     2) Decide checked/unchecked by fill ratio.
#     3) OCR words with bounding boxes.
#     4) For each checkbox, find words to the right on same line → label.
#     """
#     _ensure_tesseract()

#     img = np.array(pil_img)
#     gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

#     # Binarize (invert so ink is white)
#     thr = cv2.adaptiveThreshold(
#         gray, 255,
#         cv2.ADAPTIVE_THRESH_MEAN_C,
#         cv2.THRESH_BINARY_INV,
#         31, 10
#     )

#     # Find contours
#     contours, _ = cv2.findContours(thr, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

#     h, w = thr.shape[:2]
#     candidates = []
#     for cnt in contours:
#         x, y, cw, ch = cv2.boundingRect(cnt)
#         if cw < 10 or ch < 10:
#             continue
#         if cw > w * 0.08 or ch > h * 0.08:
#             continue
#         ar = cw / float(ch)
#         if ar < 0.75 or ar > 1.25:
#             continue

#         peri = cv2.arcLength(cnt, True)
#         approx = cv2.approxPolyDP(cnt, 0.03 * peri, True)
#         if len(approx) != 4:
#             continue

#         # Heuristic: checkbox squares usually have a border -> contour area relatively small vs rect
#         area = cv2.contourArea(cnt)
#         rect_area = cw * ch
#         if rect_area <= 0:
#             continue
#         if area / rect_area > 0.9:
#             # likely a filled block, not a box
#             continue

#         candidates.append((x, y, cw, ch))

#     # OCR words with positions
#     data = pytesseract.image_to_data(pil_img, output_type=pytesseract.Output.DICT)
#     words = []
#     n = len(data.get("text", []))
#     for i in range(n):
#         txt = (data["text"][i] or "").strip()
#         if not txt:
#             continue
#         conf = float(data["conf"][i]) if data["conf"][i] != "-1" else 0.0
#         wx, wy, ww, wh = data["left"][i], data["top"][i], data["width"][i], data["height"][i]
#         line_id = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
#         words.append({"text": txt, "conf": conf, "x": wx, "y": wy, "w": ww, "h": wh, "line": line_id})

#     # group words by line
#     by_line: Dict[Tuple[int,int,int], List[dict]] = {}
#     for wobj in words:
#         by_line.setdefault(wobj["line"], []).append(wobj)
#     for k in by_line:
#         by_line[k].sort(key=lambda z: z["x"])

#     extracted: List[ExtractedCheckbox] = []

#     # For each checkbox candidate, map to nearest line and collect label
#     for (x, y, cw, ch) in candidates:
#         cx = x + cw / 2.0
#         cy = y + ch / 2.0

#         # compute fill ratio inside box (inset)
#         inset = max(2, int(min(cw, ch) * 0.15))
#         x1 = x + inset
#         y1 = y + inset
#         x2 = x + cw - inset
#         y2 = y + ch - inset
#         if x2 <= x1 or y2 <= y1:
#             continue

#         roi = thr[y1:y2, x1:x2]
#         fill_ratio = float(np.count_nonzero(roi)) / float(roi.size + 1e-9)

#         # checked threshold: tuneable
#         checked = fill_ratio > 0.12

#         # checkbox confidence: further away from threshold = more confident
#         # (e.g., 0.12 is boundary)
#         checkbox_conf = clamp(abs(fill_ratio - 0.12) / 0.20)

#         # find best matching line
#         best_line = None
#         best_dist = 1e18
#         for line_key, line_words in by_line.items():
#             # line vertical band
#             ys = [ww["y"] for ww in line_words]
#             hs = [ww["h"] for ww in line_words]
#             top = min(ys)
#             bottom = max(yv + hv for yv, hv in zip(ys, hs))
#             if not (top - 8 <= cy <= bottom + 8):
#                 continue
#             # distance to line (prefer same y)
#             dist = abs((top + bottom) / 2.0 - cy)
#             if dist < best_dist:
#                 best_dist = dist
#                 best_line = line_key

#         if best_line is None:
#             continue

#         line_words = by_line[best_line]
#         # collect words to the right of checkbox
#         min_x = x + cw + 8
#         label_words = [wobj for wobj in line_words if wobj["x"] >= min_x]

#         if not label_words:
#             continue

#         label = " ".join([wobj["text"] for wobj in label_words]).strip()
#         if len(label) < 3:
#             continue

#         # OCR confidence for label = avg normalized conf of words
#         confs = [max(0.0, min(100.0, wobj["conf"])) for wobj in label_words]
#         ocr_conf = clamp((sum(confs) / max(1.0, len(confs))) / 100.0)

#         extracted.append(ExtractedCheckbox(
#             label=label,
#             checked=checked,
#             checkbox_conf=checkbox_conf,
#             ocr_conf=ocr_conf,
#             page=page_num_1based,
#         ))

#     return extracted


# # -----------------------------
# # OpenAI embeddings + mapping
# # -----------------------------
# def embed_texts(client: OpenAI, texts: List[str]) -> List[List[float]]:
#     # Remove empty strings (keep alignment)
#     # OpenAI embeddings model names per docs. :contentReference[oaicite:2]{index=2}
#     resp = client.embeddings.create(
#         model=settings.OPENAI_EMBED_MODEL,
#         input=texts
#     )
#     return [d.embedding for d in resp.data]

# def map_extracted_to_template(
#     template_checkboxes: List[Dict[str, Any]],
#     extracted: List[ExtractedCheckbox],
#     client: OpenAI,
#     similarity_threshold: float = 0.78
# ) -> Dict[str, Dict[str, Any]]:
#     """
#     Returns mapping: template_key -> {checked, confidence, evidence, matched_label, sim}
#     """
#     tpl_labels = [c["label"] for c in template_checkboxes]
#     tpl_vectors = embed_texts(client, tpl_labels)

#     ext_labels = [e.label for e in extracted]
#     ext_vectors = embed_texts(client, ext_labels) if extracted else []

#     mapping: Dict[str, Dict[str, Any]] = {}

#     for e, ev in zip(extracted, ext_vectors):
#         best_i = -1
#         best_sim = -1.0
#         for i, tv in enumerate(tpl_vectors):
#             sim = cosine(ev, tv)
#             if sim > best_sim:
#                 best_sim = sim
#                 best_i = i

#         if best_i < 0:
#             continue

#         if best_sim < similarity_threshold:
#             continue

#         tpl = template_checkboxes[best_i]
#         tpl_key = tpl["key"]

#         # confidence: combine similarity + checkbox certainty + OCR quality
#         conf = (
#             0.15
#             + 0.55 * clamp((best_sim - similarity_threshold) / (1.0 - similarity_threshold))
#             + 0.20 * e.checkbox_conf
#             + 0.10 * e.ocr_conf
#         )
#         conf = clamp(conf)

#         # If same key matched multiple times, keep the one with higher confidence
#         if tpl_key in mapping and mapping[tpl_key]["confidence"] >= conf:
#             continue

#         mapping[tpl_key] = {
#             "checked": bool(e.checked),
#             "confidence": float(round(conf, 3)),
#             "matched_label": e.label,
#             "page": e.page,
#             "sim": float(round(best_sim, 3)),
#             "evidence": f"Matched '{tpl['label']}' using OCR label '{e.label}' on page {e.page} (sim={best_sim:.3f})."
#         }

#     return mapping


# # -----------------------------
# # Populate template + review list
# # -----------------------------
# def apply_mapping_to_template(template: Dict[str, Any], mapping: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
#     out = json.loads(json.dumps(template))  # deep copy
#     for sec in out.get("sections", []):
#         for cb in sec.get("checkboxes", []):
#             key = cb.get("key")
#             if key in mapping:
#                 cb["checked"] = mapping[key]["checked"]
#                 # Optional: keep extra extraction metadata (remove if you want “pure” output)
#                 cb["_meta"] = {
#                     "confidence": mapping[key]["confidence"],
#                     "page": mapping[key]["page"],
#                     "sim": mapping[key]["sim"],
#                     "matched_label": mapping[key]["matched_label"],
#                     "evidence": mapping[key]["evidence"],
#                 }
#         # fields: add a "value" placeholder if missing (keeps structure consistent)
#         for f in sec.get("fields", []):
#             if "value" not in f:
#                 f["value"] = "" if f.get("type") in ("text", "textarea", "date") else None
#     return out

# def build_review_list(populated: Dict[str, Any]) -> List[Dict[str, Any]]:
#     review = []
#     for sec in populated.get("sections", []):
#         sec_id = sec.get("id")
#         sec_title = sec.get("title")

#         # Checkboxes (True/False)
#         for cb in sec.get("checkboxes", []):
#             meta = cb.get("_meta", {}) or {}
#             review.append({
#                 "section_id": sec_id,
#                 "section_title": sec_title,
#                 "key": cb.get("key"),
#                 "label": cb.get("label"),
#                 "value": bool(cb.get("checked", False)),
#                 "confidence": meta.get("confidence", 0.0),
#                 "evidence": meta.get("evidence", ""),
#                 "accepted": None,
#             })

#         # Fields (string/textarea/date)
#         for f in sec.get("fields", []):
#             review.append({
#                 "section_id": sec_id,
#                 "section_title": sec_title,
#                 "key": f.get("key"),
#                 "label": f.get("label"),
#                 "value": f.get("value", ""),
#                 "confidence": 0.0,
#                 "evidence": "",
#                 "accepted": None,
#             })
#     return review


# # -----------------------------
# # Main entry: process upload
# # -----------------------------
# def process_uploaded_document(django_file) -> Dict[str, Any]:
#     if not settings.OPENAI_API_KEY:
#         raise RuntimeError("OPENAI_API_KEY is not set (check your .env).")

#     client = OpenAI(api_key=settings.OPENAI_API_KEY)

#     template = load_careplan_template()
#     template_checkboxes = flatten_template_checkboxes(template)

#     name = django_file.name.lower()

#     extracted_items: List[ExtractedCheckbox] = []

#     # PDF input
#     if name.endswith(".pdf"):
#         data = django_file.read()
#         doc = fitz.open(stream=data, filetype="pdf")

#         for i in range(doc.page_count):
#             page = doc.load_page(i)
#             pnum = i + 1

#             if page_has_text(page):
#                 # If it’s text PDF, you can still keep raw text for future field extraction.
#                 # For checkboxes in text-PDF, you’d need a different approach.
#                 continue

#             # scanned page -> render -> checkbox+label detection
#             img = render_page_to_image(page, zoom=2.2)
#             extracted_items.extend(detect_checkboxes_and_labels(img, pnum))

#     # Image input (png/jpg/jpeg)
#     elif name.endswith(".png") or name.endswith(".jpg") or name.endswith(".jpeg"):
#         img = Image.open(django_file).convert("RGB")
#         extracted_items.extend(detect_checkboxes_and_labels(img, page_num_1based=1))
#     else:
#         raise RuntimeError("Unsupported file type. Upload PDF/PNG/JPG.")

#     # Map extracted -> template
#     mapping = map_extracted_to_template(
#         template_checkboxes=template_checkboxes,
#         extracted=extracted_items,
#         client=client,
#         similarity_threshold=0.78
#     )

#     populated = apply_mapping_to_template(template, mapping)
#     review_list = build_review_list(populated)

#     # Optional: remove _meta before saving/export if you want a “pure” JSON
#     # but I recommend keeping it during review stage.
#     return {
#         "final_json": populated,
#         "review_list": review_list,
#         "stats": {
#             "extracted_checkbox_count": len(extracted_items),
#             "matched_checkbox_count": len(mapping),
#             "template_checkbox_count": len(template_checkboxes),
#         }
#     }



# assessments/services.py
# import base64
# import json
# import os
# from typing import Any, Dict, List, Tuple, Optional

# import fitz  # PyMuPDF
# from django.conf import settings

# from openai import OpenAI
# # import google.generativeai as genai
# # from google.genai import types as genai_types


# # ---------------------------
# # Template IO + Key harvesting
# # ---------------------------

# def load_care_plan_template() -> dict:
#     path = settings.CARE_PLAN_TEMPLATE_PATH
#     if not os.path.exists(path):
#         raise RuntimeError(f"care_plan_template.json not found at: {path}")
#     with open(path, "r", encoding="utf-8") as f:
#         return json.load(f)

# def harvest_template_keys(template: dict) -> Tuple[List[str], List[str]]:
#     """
#     Returns:
#       field_keys: keys inside any "fields" dict (e.g., resident_name, etc.)
#       checkbox_keys: keys inside any checkbox_group items
#     """
#     field_keys: List[str] = []
#     checkbox_keys: List[str] = []

#     def walk(node: Any):
#         if isinstance(node, dict):
#             # fields block
#             if "fields" in node and isinstance(node["fields"], dict):
#                 for k in node["fields"].keys():
#                     if k not in field_keys:
#                         field_keys.append(k)

#             # checkbox group
#             if node.get("type") == "checkbox_group" and isinstance(node.get("items"), list):
#                 for it in node["items"]:
#                     if isinstance(it, dict) and "key" in it:
#                         if it["key"] not in checkbox_keys:
#                             checkbox_keys.append(it["key"])

#             for v in node.values():
#                 walk(v)

#         elif isinstance(node, list):
#             for x in node:
#                 walk(x)

#     walk(template)
#     return field_keys, checkbox_keys


# # ---------------------------
# # File → text/images for LLM
# # ---------------------------

# def _b64_png(data: bytes) -> str:
#     return "data:image/png;base64," + base64.b64encode(data).decode("utf-8")

# def pdf_to_page_images(pdf_path: str, zoom: float = 2.0, max_pages: int = 15) -> List[bytes]:
#     """
#     Render PDF pages to PNG bytes (for vision models).
#     """
#     doc = fitz.open(pdf_path)
#     n = min(doc.page_count, max_pages)
#     images: List[bytes] = []
#     mat = fitz.Matrix(zoom, zoom)
#     for i in range(n):
#         page = doc.load_page(i)
#         pix = page.get_pixmap(matrix=mat, alpha=False)
#         images.append(pix.tobytes("png"))
#     return images

# def read_text_file(path: str) -> str:
#     with open(path, "r", encoding="utf-8", errors="ignore") as f:
#         return f.read()


# # ---------------------------
# # Provider abstraction
# # ---------------------------

# class LLMProvider:
#     def generate_json(self, *, schema: dict, prompt: str, images: Optional[List[bytes]] = None) -> dict:
#         raise NotImplementedError

# class OpenAIProvider(LLMProvider):
#     def __init__(self):
#         if not settings.OPENAI_API_KEY:
#             raise RuntimeError("OPENAI_API_KEY is not set in backend settings/.env")
#         self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
#         self.model = settings.OPENAI_MODEL

#     def generate_json(self, *, schema: dict, prompt: str, images: Optional[List[bytes]] = None) -> dict:
#         content_parts = [{"type": "text", "text": prompt}]
#         if images:
#             for img in images:
#                 content_parts.append({"type": "image_url", "image_url": {"url": _b64_png(img)}})

#         resp = self.client.chat.completions.create(
#             model=self.model,
#             messages=[
#                 {"role": "system", "content": "Return only valid JSON that matches the schema."},
#                 {"role": "user", "content": content_parts},
#             ],
#             # Structured Outputs (schema-constrained) :contentReference[oaicite:5]{index=5}
#             response_format={"type": "json_schema", "json_schema": schema},
#             temperature=0,
#         )

#         msg = resp.choices[0].message
#         if getattr(msg, "refusal", None):
#             raise RuntimeError(f"Model refused: {msg.refusal}")
#         if not msg.content:
#             raise RuntimeError("Empty OpenAI response.")
#         return json.loads(msg.content)

# import json
# from typing import Optional, List
# from django.conf import settings
# # import google.generativeai as genai

# class GeminiProvider(LLMProvider):
#     def __init__(self):
#         if not getattr(settings, "GEMINI_API_KEY", None):
#             raise RuntimeError("GEMINI_API_KEY is not set in backend settings/.env")

#         # google-generativeai uses global configure
#         genai.configure(api_key=settings.GEMINI_API_KEY)

#         # model name like: "gemini-1.5-flash" or "gemini-1.5-pro"
#         self.model = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")

#         # Create model object
#         self._model = genai.GenerativeModel(self.model)

#     def generate_json(self, *, schema: dict, prompt: str, images: Optional[List[bytes]] = None) -> dict:
#         # IMPORTANT: google-generativeai doesn't enforce JSON Schema strictly.
#         # So we embed the schema into the prompt and ask for JSON only.
#         schema_text = json.dumps(schema, indent=2)

#         final_prompt = (
#             "Return ONLY valid JSON. No markdown. No commentary.\n"
#             "The JSON MUST follow this schema exactly:\n"
#             f"{schema_text}\n\n"
#             "TASK:\n"
#             f"{prompt}\n"
#         )

#         # google-generativeai accepts images as dicts in the content list
#         contents = [final_prompt]
#         if images:
#             for img in images:
#                 contents.append({"mime_type": "image/png", "data": img})

#         resp = self._model.generate_content(contents)

#         text = (getattr(resp, "text", "") or "").strip()
#         if not text:
#             raise RuntimeError("Empty Gemini response.")

#         # Some Gemini responses may wrap JSON in ```json ... ```
#         if text.startswith("```"):
#             text = text.strip("`")
#             text = text.replace("json", "", 1).strip()

#         return json.loads(text)


# def get_provider(name: str) -> LLMProvider:
#     name = (name or "").lower().strip()
#     if name == "gemini":
#         return GeminiProvider()
#     return OpenAIProvider()

# # ---------------------------
# # Schema for "fill map" (compact output)
# # ---------------------------

# def build_fill_schema(field_keys: List[str], checkbox_keys: List[str]) -> dict:
#     """
#     The model returns ONLY:
#       - field_values: key -> { value, confidence, evidence }
#       - checkbox_values: key -> { checked, confidence, evidence }
#     Then we apply it onto the template for a clean final JSON.
#     """
#     return {
#         "name": "care_plan_fill_map",
#         "strict": True,
#         "schema": {
#             "type": "object",
#             "additionalProperties": False,
#             "properties": {
#                 "field_values": {
#                     "type": "object",
#                     "additionalProperties": False,
#                     "properties": {
#                         k: {
#                             "type": "object",
#                             "additionalProperties": False,
#                             "properties": {
#                                 "value": {"type": ["string", "number", "null"]},
#                                 "confidence": {"type": "number"},
#                                 "evidence": {"type": ["string", "null"]},
#                             },
#                             "required": ["value", "confidence", "evidence"],
#                         } for k in field_keys
#                     },
#                     "required": field_keys
#                 },
#                 "checkbox_values": {
#                     "type": "object",
#                     "additionalProperties": False,
#                     "properties": {
#                         k: {
#                             "type": "object",
#                             "additionalProperties": False,
#                             "properties": {
#                                 "checked": {"type": "boolean"},
#                                 "confidence": {"type": "number"},
#                                 "evidence": {"type": ["string", "null"]},
#                             },
#                             "required": ["checked", "confidence", "evidence"],
#                         } for k in checkbox_keys
#                     },
#                     "required": checkbox_keys
#                 },
#             },
#             "required": ["field_values", "checkbox_values"]
#         }
#     }


# # ---------------------------
# # Apply fill-map onto template
# # ---------------------------

# def apply_fill_to_template(template: dict, fill: dict) -> dict:
#     filled = json.loads(json.dumps(template))  # deep copy via json
#     field_values = fill.get("field_values", {})
#     checkbox_values = fill.get("checkbox_values", {})

#     def walk(node: Any):
#         if isinstance(node, dict):
#             # fill "fields"
#             if "fields" in node and isinstance(node["fields"], dict):
#                 for k, field_obj in node["fields"].items():
#                     if isinstance(field_obj, dict) and "type" in field_obj:
#                         fv = field_values.get(k)
#                         if fv is not None:
#                             field_obj["value"] = fv.get("value")
#                             field_obj["confidence"] = fv.get("confidence", 0.0)
#                             field_obj["evidence"] = fv.get("evidence")

#             # fill checkbox groups
#             if node.get("type") == "checkbox_group" and isinstance(node.get("items"), list):
#                 for it in node["items"]:
#                     if isinstance(it, dict) and "key" in it:
#                         cv = checkbox_values.get(it["key"])
#                         if cv is not None:
#                             it["checked"] = bool(cv.get("checked", False))  # ✅ true/false, not “checkbox”
#                             it["confidence"] = cv.get("confidence", 0.0)
#                             it["evidence"] = cv.get("evidence")

#             for v in node.values():
#                 walk(v)

#         elif isinstance(node, list):
#             for x in node:
#                 walk(x)

#     walk(filled)
#     return filled


# # ---------------------------
# # Review list (flatten for UI)
# # ---------------------------

# def build_review_list(filled_template: dict) -> List[dict]:
#     review: List[dict] = []

#     def walk(node: Any, path: str = ""):
#         if isinstance(node, dict):
#             # fields
#             if "fields" in node and isinstance(node["fields"], dict):
#                 for k, field_obj in node["fields"].items():
#                     if isinstance(field_obj, dict) and "type" in field_obj:
#                         review.append({
#                             "path": f"{path}.fields.{k}".strip("."),
#                             "key": k,
#                             "type": field_obj.get("type"),
#                             "value": field_obj.get("value"),
#                             "confidence": field_obj.get("confidence", 0.0),
#                             "evidence": field_obj.get("evidence"),
#                         })

#             # checkboxes
#             if node.get("type") == "checkbox_group" and isinstance(node.get("items"), list):
#                 for it in node["items"]:
#                     if isinstance(it, dict) and "key" in it:
#                         review.append({
#                             "path": f"{path}.checkbox.{it['key']}".strip("."),
#                             "key": it["key"],
#                             "label": it.get("label"),
#                             "type": "checkbox",
#                             "value": bool(it.get("checked", False)),
#                             "confidence": it.get("confidence", 0.0),
#                             "evidence": it.get("evidence"),
#                         })

#             for k, v in node.items():
#                 walk(v, f"{path}.{k}".strip("."))

#         elif isinstance(node, list):
#             for i, x in enumerate(node):
#                 walk(x, f"{path}[{i}]")

#     walk(filled_template)
#     return review


# # ---------------------------
# # Main pipeline
# # ---------------------------

# def generate_care_plan_from_upload(file_path: str, provider_name: str) -> Dict[str, Any]:
#     template = load_care_plan_template()
#     field_keys, checkbox_keys = harvest_template_keys(template)
#     schema = build_fill_schema(field_keys, checkbox_keys)

#     provider = get_provider(provider_name)

#     # Decide: text vs pdf/image
#     ext = os.path.splitext(file_path)[1].lower()

#     if ext == ".txt":
#         assessment_text = read_text_file(file_path)

#         prompt = f"""
# You will be given an assessment document (plain text).
# Your job: infer and populate a Care Plan using ONLY what the assessment supports.

# Return JSON that matches the provided schema exactly.

# Rules:
# - For any field/checkbox not supported by evidence: use null for fields, false for checkboxes.
# - Do NOT invent facts.
# - Provide evidence: a short quote from the assessment text.
# - confidence:
#   - 0.95 if explicitly stated
#   - 0.80 if strongly implied
#   - 0.60 if weakly implied
#   - 0.40 if uncertain (use only when unavoidable)

# Assessment text:
# <<<
# {assessment_text}
# >>>
# """
#         fill = provider.generate_json(schema=schema, prompt=prompt, images=None)

#     elif ext in [".pdf", ".png", ".jpg", ".jpeg", ".webp"]:
#         images: List[bytes] = []
#         if ext == ".pdf":
#             images = pdf_to_page_images(file_path, zoom=2.0, max_pages=15)
#         else:
#             with open(file_path, "rb") as f:
#                 images = [f.read()]

#         prompt = f"""
# You will be given an assessment document as images (scanned PDF/pages).
# Your job: infer and populate a Care Plan using ONLY what is visible in the document.

# Return JSON that matches the provided schema exactly.

# Rules:
# - For any field/checkbox not supported by evidence: use null for fields, false for checkboxes.
# - Do NOT invent facts.
# - Evidence should be: "Page X: <what you see>".
# - confidence:
#   - 0.95 if the box is clearly checked / text is clearly readable
#   - 0.80 if readable but slightly unclear
#   - 0.60 if uncertain (avoid)
# - For checkboxes: checked must be true/false (boolean), not a label.

# Now extract and infer.
# """
#         fill = provider.generate_json(schema=schema, prompt=prompt, images=images)

#     else:
#         raise RuntimeError(f"Unsupported upload type: {ext}")

#     final_json = apply_fill_to_template(template, fill)
#     review_list = build_review_list(final_json)

#     return {
#         "provider": provider_name,
#         "final_structured_json": final_json,
#         "review_list": review_list,
#         "raw_fill_map": fill,  # helpful for debugging; remove later if you want
#     }












import json
import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

import fitz  # PyMuPDF
import numpy as np
import pytesseract
from PIL import Image
import cv2
from rapidfuzz import fuzz
from django.conf import settings

from openai import OpenAI


# ----------------------------
# Init OCR
# ----------------------------
TESSERACT_AVAILABLE = False
try:
    if getattr(settings, "TESSERACT_CMD", ""):
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
    # Test if Tesseract is available
    pytesseract.get_tesseract_version()
    TESSERACT_AVAILABLE = True
except (pytesseract.TesseractNotFoundError, FileNotFoundError, Exception):
    TESSERACT_AVAILABLE = False


# ----------------------------
# Provider (OpenAI only)
# ----------------------------
class OpenAIEmbedder:
    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY is not set.")
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def embed(self, texts: List[str]) -> List[List[float]]:
        """
        Call OpenAI embeddings API with a clean input list.
        - Ensures every item is a non-empty string
        - Preserves list length/alignment with the original `texts`
        """
        # Normalize to strings and avoid empty values (OpenAI is strict about $.input)
        clean_texts: List[str] = []
        for t in texts:
            if t is None:
                clean_texts.append("_")
            else:
                s = str(t).strip()
                clean_texts.append(s if s else "_")

        resp = self.client.embeddings.create(
            model=settings.OPENAI_EMBED_MODEL,
            input=clean_texts,
        )
        return [d.embedding for d in resp.data]


# ----------------------------
# Helpers
# ----------------------------
def cosine(a: List[float], b: List[float]) -> float:
    va = np.array(a, dtype=np.float32)
    vb = np.array(b, dtype=np.float32)
    denom = (np.linalg.norm(va) * np.linalg.norm(vb)) + 1e-9
    return float(np.dot(va, vb) / denom)

def load_template() -> dict:
    with open(settings.CARE_PLAN_TEMPLATE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def deep_copy(x: Any) -> Any:
    return json.loads(json.dumps(x))


# ----------------------------
# Page rendering + OCR
# ----------------------------
@dataclass
class OCRWord:
    text: str
    conf: float
    bbox: Tuple[int, int, int, int]  # x, y, w, h

@dataclass
class PageData:
    page_num: int
    image_bgr: np.ndarray
    ocr_text: str
    words: List[OCRWord]

def render_page_to_image(doc: fitz.Document, page_index: int, dpi: int = 300) -> np.ndarray:
    page = doc.load_page(page_index)
    pix = page.get_pixmap(dpi=dpi)
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
    if pix.n == 4:
        img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
    else:
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    return img

def ocr_page(image_bgr: np.ndarray) -> Tuple[str, List[OCRWord]]:
    """OCR a page image. Returns empty text if Tesseract is not available."""
    if not TESSERACT_AVAILABLE:
        return "", []
    
    try:
        rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        pil = Image.fromarray(rgb)

        data = pytesseract.image_to_data(pil, output_type=pytesseract.Output.DICT)
        words: List[OCRWord] = []
        parts = []

        n = len(data["text"])
        for i in range(n):
            txt = (data["text"][i] or "").strip()
            if not txt:
                continue
            conf = float(data["conf"][i]) if data["conf"][i] != "-1" else 0.0
            x, y, w, h = data["left"][i], data["top"][i], data["width"][i], data["height"][i]
            words.append(OCRWord(text=txt, conf=conf, bbox=(x, y, w, h)))
            parts.append(txt)

        return " ".join(parts), words
    except Exception as e:
        # If OCR fails, return empty (fallback to text extraction from PDF)
        return "", []


# ----------------------------
# Checkbox detection (OpenCV)
# ----------------------------
@dataclass
class CheckboxHit:
    bbox: Tuple[int, int, int, int]   # x,y,w,h
    checked: bool
    confidence: float
    label: str
    label_bbox: Tuple[int, int, int, int]
    page_num: int

def detect_checkboxes(image_bgr: np.ndarray, page_num: int) -> List[CheckboxHit]:
    """
    Detect square checkbox-like shapes and classify checked/unchecked by fill ratio.
    Then OCR label area to the right.
    """
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    # improve contrast a bit
    gray = cv2.GaussianBlur(gray, (3, 3), 0)
    thr = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                cv2.THRESH_BINARY_INV, 35, 8)

    contours, _ = cv2.findContours(thr, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    hits: List[CheckboxHit] = []
    h_img, w_img = gray.shape[:2]

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)

        # checkbox size heuristics
        if w < 10 or h < 10:
            continue
        if w > 80 or h > 80:
            continue

        # squareness
        ar = w / float(h)
        if ar < 0.75 or ar > 1.3:
            continue

        # approximate polygon to ensure it's box-ish
        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.05 * peri, True)
        if len(approx) < 4 or len(approx) > 8:
            continue

        # classify checked via fill ratio inside box
        pad = 2
        x1 = max(0, x + pad)
        y1 = max(0, y + pad)
        x2 = min(w_img, x + w - pad)
        y2 = min(h_img, y + h - pad)
        roi = thr[y1:y2, x1:x2]  # white ink = 255 since inverted threshold
        if roi.size == 0:
            continue

        fill_ratio = float(np.count_nonzero(roi)) / float(roi.size)  # 0..1
        # typical unchecked box has low fill; checked has higher due to tick
        checked = fill_ratio > 0.12

        # confidence from how far away we are from threshold
        conf = min(1.0, max(0.0, (abs(fill_ratio - 0.12) / 0.20)))  # normalize roughly

        # label area to the right
        label_x1 = min(w_img - 1, x + w + 8)
        label_x2 = min(w_img, label_x1 + 800)   # read a decent chunk of the row
        label_y1 = max(0, y - 10)
        label_y2 = min(h_img, y + h + 10)

        label_roi = image_bgr[label_y1:label_y2, label_x1:label_x2]
        label_text, label_words = ocr_page(label_roi)
        label_text = (label_text or "").strip()

        # label confidence from OCR mean
        ocr_conf = 0.0
        if label_words:
            ocr_conf = float(np.mean([w.conf for w in label_words if w.conf > 0])) / 100.0
        combined = 0.6 * conf + 0.4 * ocr_conf

        # ignore garbage labels
        if len(label_text) < 3:
            continue

        hits.append(
            CheckboxHit(
                bbox=(x, y, w, h),
                checked=checked,
                confidence=round(float(combined), 4),
                label=label_text,
                label_bbox=(label_x1, label_y1, label_x2 - label_x1, label_y2 - label_y1),
                page_num=page_num
            )
        )

    # Sort top-to-bottom, left-to-right
    hits.sort(key=lambda h: (h.bbox[1], h.bbox[0]))
    return hits


# ----------------------------
# Canonical assessment JSON
# ----------------------------
def build_canonical_from_pdf(pdf_path: str) -> dict:
    doc = fitz.open(pdf_path)
    sections = []

    for i in range(doc.page_count):
        page_num = i + 1
        img = render_page_to_image(doc, i, dpi=300)
        ocr_text, words = ocr_page(img)
        
        # Fallback: extract text directly from PDF if OCR not available
        if not ocr_text and not TESSERACT_AVAILABLE:
            page = doc.load_page(i)
            ocr_text = page.get_text("text") or ""

        # detect checkbox items
        checks = detect_checkboxes(img, page_num)

        items = []
        for c in checks:
            items.append({
                "type": "checkbox",
                "label": c.label,
                "checked": bool(c.checked),
                "confidence": float(c.confidence),
                "evidence": {
                    "page": page_num,
                    "bbox": list(c.bbox),
                    "label_bbox": list(c.label_bbox),
                    "snippet": c.label[:300],
                    "source": "tesseract+cv"
                }
            })

        # (Optional) you can also add text blocks here, but MVP focus: checkbox-driven mapping
        sections.append({
            "id": f"page_{page_num}",
            "title": f"Page {page_num}",
            "items": items
        })

    return {"assessment": {"sections": sections}}


# ----------------------------
# Mapping canonical -> care plan template
# ----------------------------
def flatten_canonical_checkboxes(canon: dict) -> List[dict]:
    out = []
    for sec in (canon.get("assessment") or {}).get("sections", []) or []:
        for it in sec.get("items", []) or []:
            if it.get("type") == "checkbox":
                out.append(it)
    return out

def map_to_template(embedder: OpenAIEmbedder, canonical: dict, template: dict, threshold: float = 0.78) -> dict:
    canon_items = flatten_canonical_checkboxes(canonical)
    if not canon_items:
        return template

    # Locate all template checkboxes
    out = deep_copy(template)
    sections = out if isinstance(out, list) else out.get("sections", [])

    tpl_nodes = []
    for si, sec in enumerate(sections):
        for ci, cb in enumerate(sec.get("checkboxes", []) or []):
            tpl_nodes.append((si, ci, cb.get("label") or "", cb.get("key")))

    tpl_labels = [t[2] for t in tpl_nodes]
    canon_labels = [c.get("label") or "" for c in canon_items]

    emb_tpl = embedder.embed(tpl_labels)
    emb_can = embedder.embed(canon_labels)

    for idx, (si, ci, tpl_label, tpl_key) in enumerate(tpl_nodes):
        best_j = -1
        best_score = -1.0

        for j in range(len(canon_items)):
            s_emb = cosine(emb_tpl[idx], emb_can[j])
            s_txt = fuzz.token_set_ratio(tpl_label, canon_labels[j]) / 100.0
            score = 0.7 * s_emb + 0.3 * s_txt
            if score > best_score:
                best_score = score
                best_j = j

        # default
        sections[si]["checkboxes"][ci]["checked"] = False
        sections[si]["checkboxes"][ci]["confidence"] = 0.0
        sections[si]["checkboxes"][ci]["evidence"] = None

        if best_j >= 0 and best_score >= threshold:
            src = canon_items[best_j]
            if src.get("checked") is True and src.get("evidence"):
                sections[si]["checkboxes"][ci]["checked"] = True
                # combine mapping similarity + detection confidence
                det_conf = float(src.get("confidence") or 0.0)
                combined = 0.6 * float(best_score) + 0.4 * det_conf
                sections[si]["checkboxes"][ci]["confidence"] = round(float(combined), 4)
                sections[si]["checkboxes"][ci]["evidence"] = src.get("evidence")

    return out


# ----------------------------
# Safety validator
# ----------------------------
def validate_no_evidence_no_true(care_plan: dict) -> dict:
    out = care_plan
    sections = out if isinstance(out, list) else out.get("sections", [])
    for sec in sections:
        for cb in sec.get("checkboxes", []) or []:
            if cb.get("checked") is True:
                ev = cb.get("evidence")
                if not ev or not ev.get("page") or not ev.get("snippet"):
                    cb["checked"] = False
                    cb["confidence"] = 0.0
                    cb["evidence"] = None
    return out


# ----------------------------
# Review list for UI
# ----------------------------
def build_review_list(care_plan: dict) -> List[dict]:
    res = []
    sections = care_plan if isinstance(care_plan, list) else care_plan.get("sections", [])
    for sec in sections:
        sec_title = sec.get("title") or sec.get("id") or "Section"
        for cb in sec.get("checkboxes", []) or []:
            res.append({
                "field": f"{sec_title} :: {cb.get('label')}",
                "value": bool(cb.get("checked")),
                "confidence": float(cb.get("confidence") or 0.0),
                "accepted": None,
                "evidence": cb.get("evidence"),
                "key": cb.get("key"),
            })
    return res


# ----------------------------
# Main API callable
# ----------------------------
def generate_care_plan_from_pdf(pdf_path: str) -> Dict[str, Any]:
    canonical = build_canonical_from_pdf(pdf_path)
    template = load_template()

    embedder = OpenAIEmbedder()
    care_plan = map_to_template(embedder, canonical, template, threshold=0.78)
    care_plan = validate_no_evidence_no_true(care_plan)

    review = build_review_list(care_plan)

    ocr_status = "tesseract+opencv" if TESSERACT_AVAILABLE else "pymupdf-text-only"
    return {
        "canonical_assessment": canonical,
        "care_plan": care_plan,
        "review": review,
        "meta": {"provider": "openai-embeddings-only", "ocr": ocr_status}
    }

