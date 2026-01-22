"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { getAuthSession } from "@/lib/auth"

export default function CarePlanPdfPage() {
  const { id } = useParams<{ id: string }>()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function generatePdf() {
      const session = getAuthSession()
      if (!session?.token) return

      const res = await fetch(
        `http://127.0.0.1:8000/api/careplans/${id}/generate-pdf/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        }
      )

      const data = await res.json()
      setPdfUrl(data.pdf_url)
      setLoading(false)
    }

    generatePdf()
  }, [id])

  return (
    <AppLayout>
      <div className="p-8 space-y-4">
        {loading && <p>Generating PDF...</p>}

        {pdfUrl && (
          <>
            <Button asChild>
              <a
                href={`http://127.0.0.1:8000${pdfUrl}`}
                target="_blank"
              >
                View PDF
              </a>
            </Button>

            <Button variant="outline" asChild>
              <a
                href={`http://127.0.0.1:8000/api/careplans/${id}/download-pdf/`}
              >
                Download PDF
              </a>
            </Button>
          </>
        )}
      </div>
    </AppLayout>
  )
}
