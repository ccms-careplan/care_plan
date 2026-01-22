// PDF generation utilities for CareEase AI
// This uses a server-side approach for pixel-perfect PDF generation

import type { CarePlan, Patient } from "./types"

export interface PDFGenerationOptions {
  carePlan: CarePlan
  patient: Patient
  includeSignatures?: boolean
}

export interface PDFFieldMapping {
  field: string
  x: number
  y: number
  width: number
  fontSize: number
  page: number
}

// Field mappings for the Negotiated Care Plan template
// These coordinates match the official Washington State template
export const CARE_PLAN_FIELD_MAPPINGS: PDFFieldMapping[] = [
  // Page 1 - Header
  { field: "patient_name", x: 120, y: 80, width: 300, fontSize: 12, page: 1 },
  { field: "dob", x: 450, y: 80, width: 120, fontSize: 11, page: 1 },
  { field: "assessment_date", x: 120, y: 100, width: 150, fontSize: 11, page: 1 },
  { field: "case_manager", x: 320, y: 100, width: 250, fontSize: 11, page: 1 },

  // Bathing section
  { field: "bathing_level", x: 150, y: 180, width: 180, fontSize: 11, page: 1 },
  { field: "bathing_strengths", x: 80, y: 210, width: 480, fontSize: 10, page: 1 },
  { field: "bathing_instructions", x: 80, y: 280, width: 480, fontSize: 10, page: 1 },

  // Additional domains would be mapped here...
  // This is a simplified example showing the structure
]

export function generateCarePlanHTML(options: PDFGenerationOptions): string {
  const { carePlan, patient } = options

  // Generate HTML that matches the official template exactly
  // This HTML will be rendered to PDF server-side using Puppeteer or similar
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: letter;
          margin: 0.5in;
        }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #000;
        }
        .header {
          text-align: center;
          font-weight: bold;
          font-size: 14pt;
          margin-bottom: 20px;
        }
        .section {
          margin-bottom: 15px;
          page-break-inside: avoid;
        }
        .section-title {
          font-weight: bold;
          font-size: 12pt;
          margin-bottom: 8px;
          border-bottom: 1px solid #000;
        }
        .field-label {
          font-weight: bold;
          display: inline-block;
          width: 150px;
        }
        .field-value {
          display: inline-block;
        }
        .checkbox {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 1px solid #000;
          margin-right: 5px;
          vertical-align: middle;
        }
        .checkbox.checked::after {
          content: '✓';
          font-size: 16px;
          line-height: 14px;
        }
        .signature-block {
          margin-top: 30px;
          border-top: 1px solid #000;
          padding-top: 10px;
        }
        .signature-line {
          border-bottom: 1px solid #000;
          width: 250px;
          display: inline-block;
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        WASHINGTON STATE NEGOTIATED CARE PLAN
      </div>
      
      <div class="section">
        <span class="field-label">Resident Name:</span>
        <span class="field-value">${patient.name}</span>
      </div>
      
      <div class="section">
        <span class="field-label">Date of Birth:</span>
        <span class="field-value">${patient.dateOfBirth}</span>
      </div>

      ${Object.entries(carePlan.domains || {})
        .map(([key, domain]) => {
          if (!domain) return ""
          return `
        <div class="section">
          <div class="section-title">${key.replace(/_/g, " ").toUpperCase()}</div>
          
          <div style="margin-bottom: 8px;">
            <span class="field-label">Independence Level:</span>
            <span class="field-value">${domain.level}</span>
          </div>
          
          ${
            domain.strengths
              ? `
          <div style="margin-bottom: 8px;">
            <div class="field-label">Strengths & Preferences:</div>
            <div style="margin-left: 20px; white-space: pre-wrap;">${domain.strengths}</div>
          </div>
          `
              : ""
          }
          
          ${
            domain.caregiverInstructions
              ? `
          <div style="margin-bottom: 8px;">
            <div class="field-label">Caregiver Actions:</div>
            <div style="margin-left: 20px; white-space: pre-wrap;">${domain.caregiverInstructions}</div>
          </div>
          `
              : ""
          }
          
          ${
            domain.stages && Object.values(domain.stages).some((s) => s)
              ? `
          <div style="margin-top: 12px;">
            <div class="field-label">Progressive Care Stages:</div>
            ${Object.entries(domain.stages)
              .filter(([_, text]) => text)
              .map(
                ([stage, text]) => `
              <div style="margin-left: 20px; margin-bottom: 6px;">
                <strong>Stage ${stage}:</strong> ${text}
              </div>
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }
        </div>
        `
        })
        .join("")}

      ${
        options.includeSignatures && carePlan.signatures
          ? `
      <div class="signature-block">
        <div style="margin-bottom: 20px;">
          <div class="field-label">Provider Signature:</div>
          <div class="signature-line" style="font-style: italic;">${carePlan.signatures.provider?.signature || ""}</div>
          <div style="margin-left: 20px; margin-top: 5px;">
            Date: ${carePlan.signatures.provider?.date || ""}
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div class="field-label">Resident/Representative:</div>
          <div class="signature-line" style="font-style: italic;">${carePlan.signatures.resident?.signature || ""}</div>
          <div style="margin-left: 20px; margin-top: 5px;">
            Date: ${carePlan.signatures.resident?.date || ""}
          </div>
        </div>
        
        ${
          carePlan.signatures.caseManager?.signature
            ? `
        <div style="margin-bottom: 20px;">
          <div class="field-label">Case Manager:</div>
          <div class="signature-line" style="font-style: italic;">${carePlan.signatures.caseManager.signature}</div>
          <div style="margin-left: 20px; margin-top: 5px;">
            Date: ${carePlan.signatures.caseManager.date}
          </div>
        </div>
        `
            : ""
        }
        
        ${
          carePlan.signatures.healthProfessional?.signature
            ? `
        <div style="margin-bottom: 20px;">
          <div class="field-label">Health Professional:</div>
          <div class="signature-line" style="font-style: italic;">${carePlan.signatures.healthProfessional.signature}</div>
          <div style="margin-left: 20px; margin-top: 5px;">
            Date: ${carePlan.signatures.healthProfessional.date}
          </div>
        </div>
        `
            : ""
        }
      </div>
      `
          : ""
      }
      
      <div style="margin-top: 40px; text-align: center; font-size: 9pt; color: #666;">
        Generated by CareEase AI on ${new Date().toLocaleDateString()}
      </div>
    </body>
    </html>
  `
}

export function validateCarePlanForExport(carePlan: CarePlan): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required domains
  const requiredDomains = ["bathing", "dressing", "toileting", "eating", "mobility_ambulation"]

  for (const domain of requiredDomains) {
    if (!carePlan.domains[domain as keyof typeof carePlan.domains]) {
      errors.push(`Missing required domain: ${domain}`)
    }
  }

  // Check for caregiver instructions where needed
  Object.entries(carePlan.domains || {}).forEach(([key, domain]) => {
    if (domain && (domain.level === "Extensive Assistance" || domain.level === "Dependent")) {
      if (!domain.caregiverInstructions || !domain.caregiverInstructions.trim()) {
        errors.push(`Caregiver instructions required for ${key} (${domain.level})`)
      }
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
