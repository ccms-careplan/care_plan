import { NextResponse } from "next/server";
import OpenAI from "openai";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { AssessmentExtractSchema } from "@/lib/assessment_schema";

export const runtime = "nodejs";

function mustGetOpenAIKey(req: Request) {
  const key = req.headers.get("x-openai-key")?.trim();
  if (!key) throw new Error("Missing OpenAI API key. Provide x-openai-key header.");
  return key;
}

async function fileToBuffer(file: File) {
  const ab = await file.arrayBuffer();
  return Buffer.from(ab);
}

/** Extract PDF text per page using pdf-parse pagerender */
async function extractPdfPages(buf: Buffer): Promise<string[]> {
  const pages: string[] = [];

  const options = {
    pagerender: async (pageData: any) => {
      const textContent = await pageData.getTextContent();
      const pageText = textContent.items.map((it: any) => it.str).join(" ");
      pages.push(pageText);
      return pageText;
    },
  };

  await pdfParse(buf, options as any);
  return pages;
}

function splitPagesIntoThree(pages: string[]) {
  const n = pages.length;
  if (n === 0) return ["", "", ""];

  const c1 = Math.max(1, Math.floor(n / 3));
  const c2 = Math.max(c1 + 1, Math.floor((2 * n) / 3));

  const part1 = pages.slice(0, c1).join("\n\n---PAGE BREAK---\n\n");
  const part2 = pages.slice(c1, c2).join("\n\n---PAGE BREAK---\n\n");
  const part3 = pages.slice(c2).join("\n\n---PAGE BREAK---\n\n");

  return [part1, part2, part3];
}

async function extractTextFromFile(file: File): Promise<{ kind: "pdf" | "text"; data: string | string[] }> {
  const name = file.name.toLowerCase();
  const buf = await fileToBuffer(file);

  if (name.endsWith(".pdf")) {
    const pages = await extractPdfPages(buf);
    return { kind: "pdf", data: pages };
  }

  if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer: buf });
    return { kind: "text", data: result.value || "" };
  }

  if (name.endsWith(".txt")) {
    return { kind: "text", data: buf.toString("utf-8") };
  }

  throw new Error("Unsupported file type. Use PDF, DOCX, or TXT.");
}

/** Merge helper: prefer non-null scalars; concat/dedupe arrays; deep merge objects */
function mergeAssessment(a: any, b: any): any {
  if (a == null) return b;
  if (b == null) return a;

  // arrays: concat + simple dedupe
  if (Array.isArray(a) && Array.isArray(b)) {
    const merged = [...a, ...b];
    // de-dupe primitives/strings
    if (merged.every((x) => typeof x !== "object" || x === null)) {
      return Array.from(new Set(merged));
    }
    // de-dupe objects using a stable key (tweak as needed)
    const seen = new Set<string>();
    const out: any[] = [];
    for (const item of merged) {
      const key = JSON.stringify(item ?? {});
      if (!seen.has(key)) {
        seen.add(key);
        out.push(item);
      }
    }
    return out;
  }

  // objects: deep merge field-by-field
  if (typeof a === "object" && typeof b === "object") {
    const out: any = { ...a };
    for (const k of Object.keys(b)) {
      out[k] = mergeAssessment(a[k], b[k]);
    }
    return out;
  }

  // scalars: prefer b if it has a real value
  const bIsEmpty = b === "" || b === null;
  const aIsEmpty = a === "" || a === null;
  if (aIsEmpty && !bIsEmpty) return b;
  if (!aIsEmpty && bIsEmpty) return a;

  // if both set, keep a (or prefer b; your choice)
  return a;
}

async function runStructuredExtraction(client: OpenAI, chunkText: string) {
  const system = `
You are a clinical assessment data extractor.
Extract information from the provided assessment text into the required JSON schema.
Rules:
- If missing, use null (or [] for arrays).
- Do not invent facts.
- Keep medication rows as separate entries.
- Copy caregiver instructions as written when available (do not rewrite).
Output ONLY valid JSON matching the schema.
`.trim();

  const user = `ASSESSMENT TEXT CHUNK:\n\n${chunkText}`;

  // Structured Outputs (json_schema) forces schema-conformant JSON :contentReference[oaicite:1]{index=1}
  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini-2024-07-18",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "assessment_extract",
        strict: true,
        // If you don’t have a JSON schema generator, replace this with a manually written JSON Schema.
        schema: (AssessmentExtractSchema as any).toJSONSchema?.() ?? undefined,
      },
    } as any,
    temperature: 0,
  });

  const content = resp.choices?.[0]?.message?.content;
  if (!content) throw new Error("No model output.");

  const parsed = JSON.parse(content);
  return AssessmentExtractSchema.parse(parsed);
}

export async function POST(req: Request) {
  try {
    // Route Handlers can accept multipart uploads via request.formData() :contentReference[oaicite:2]{index=2}
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const apiKey = mustGetOpenAIKey(req);
    const client = new OpenAI({ apiKey });

    const extracted = await extractTextFromFile(file);

    let finalData: any;

    if (extracted.kind === "pdf") {
      const pages = extracted.data as string[];
      const [p1, p2, p3] = splitPagesIntoThree(pages);

      // Send to the model one-by-one for cleaner reading
      const d1 = await runStructuredExtraction(client, p1);
      const d2 = await runStructuredExtraction(client, p2);
      const d3 = await runStructuredExtraction(client, p3);

      // Merge into one complete JSON
      finalData = mergeAssessment(mergeAssessment(d1, d2), d3);
      finalData = AssessmentExtractSchema.parse(finalData); // validate merged
    } else {
      // For DOCX/TXT you can still split into 3 chunks by length if you want
      finalData = await runStructuredExtraction(client, extracted.data as string);
    }

    // Convert into your current UI list (you can expand this mapping later)
    const fields = [
      { field: "Patient Name", value: finalData.resident?.name ?? "", confidence: 0.9, accepted: null },
      { field: "Date of Birth", value: finalData.resident?.dob ?? "", confidence: 0.9, accepted: null },
      { field: "Assessment Date", value: finalData.resident?.assessment_date ?? "", confidence: 0.85, accepted: null },
      { field: "Case Manager", value: finalData.resident?.case_manager ?? "", confidence: 0.8, accepted: null },
      ...(finalData.diagnoses ?? []).slice(0, 20).map((d: string) => ({ field: "Diagnosis", value: d, confidence: 0.8, accepted: null })),
      ...(finalData.medications ?? []).slice(0, 20).map((m: any) => ({
        field: `Medication: ${m.name ?? ""}`,
        value: `${m.dose ?? ""} ${m.route ?? ""} ${m.frequency ?? ""}`.trim(),
        confidence: 0.8,
        accepted: null,
      })),
    ];

    return NextResponse.json({ ok: true, data: finalData, fields });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Extraction failed." }, { status: 500 });
  }
}
