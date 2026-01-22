"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Copy, Trash2 } from "lucide-react"

interface Template {
  id: string
  name: string
  type: "care-plan" | "assessment"
  isDefault: boolean
  sections: number
  lastModified: string
}

export default function AdminTemplatesPage() {
  const [templates] = useState<Template[]>([
    {
      id: "template-1",
      name: "Standard Care Plan Template",
      type: "care-plan",
      isDefault: true,
      sections: 18,
      lastModified: "2025-01-10",
    },
    {
      id: "template-2",
      name: "Dementia Care Specialty Template",
      type: "care-plan",
      isDefault: false,
      sections: 22,
      lastModified: "2025-01-12",
    },
    {
      id: "template-3",
      name: "Standard Assessment Template",
      type: "assessment",
      isDefault: true,
      sections: 15,
      lastModified: "2025-01-08",
    },
  ])

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">PDF Export Templates</h1>
            <p className="text-muted-foreground mt-2">Manage templates for care plans and assessments</p>
          </div>
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Template
          </Button>
        </div>

        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{template.name}</CardTitle>
                      {template.isDefault && <Badge>Default</Badge>}
                      <Badge variant="outline">{template.type === "care-plan" ? "Care Plan" : "Assessment"}</Badge>
                    </div>
                    <CardDescription>
                      {template.sections} sections • Last modified: {template.lastModified}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </Button>
                    {!template.isDefault && (
                      <Button size="sm" variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Template Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Section ordering and visibility controls</li>
                    <li>Header and footer branding customization</li>
                    <li>Signature block positioning</li>
                    <li>Page layout and formatting rules</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Template Configuration</h3>
                <p className="text-sm text-blue-700">
                  Templates control the PDF export layout and formatting for care plans and assessments. Create custom
                  templates for specialized care programs or regulatory requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
